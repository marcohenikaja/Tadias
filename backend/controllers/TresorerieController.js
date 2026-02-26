// controllers/TresorerieController.js
const { Op, fn, col, where: sqlWhere, literal } = require('sequelize');
const { LedgerEntry } = require('../models/LedgerEntryModel');
const { ImportBatch } = require('../models/ImportBatchModel');

const CRITICAL_DAYS = 14;
const DROP_PCT = 10;

const CA_PREFIXES = ['VTE/', 'PRE/']; // CA = somme des credits sur VTE/PRE
const CHARGE_PREFIXES = ['ACH/'];     // Charges = somme des debits sur ACH

function prefixWhere(prefixes) {
  return {
    [Op.or]: prefixes.map((p) => ({
      nomDuCompte: { [Op.like]: `${p}%` },
    })),
  };
}

// ✅ Injecte "uniquement mes données"
function withUserBatches(where, batchIds) {
  return { ...(where || {}), importBatchId: { [Op.in]: batchIds } };
}

async function sumField(field, where, batchIds) {
  const raw = await LedgerEntry.sum(field, { where: withUserBatches(where, batchIds) });
  return Number(raw || 0);
}

function parseMonthParam(monthStr) {
  if (!monthStr) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(String(monthStr));
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  if (!Number.isFinite(y) || mo < 0 || mo > 11) return null;
  return { y, mo };
}

function parseYearMonth(req) {
  const now = new Date();

  const parsed = parseMonthParam(req.query.month);
  if (parsed) return new Date(parsed.y, parsed.mo, 1);

  const qYear = Number.parseInt(req.query.year, 10);
  const qMonth = Number.parseInt(req.query.month, 10);

  const y = Number.isFinite(qYear) ? qYear : now.getFullYear();
  let mo = now.getMonth();

  if (Number.isFinite(qMonth)) {
    if (qMonth >= 1 && qMonth <= 12) mo = qMonth - 1;
    else if (qMonth >= 0 && qMonth <= 11) mo = qMonth;
  }

  return new Date(y, mo, 1);
}

async function getSoldeOuvertureForYear(year, batchIds) {
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const openingNameClause = sqlWhere(fn('LOWER', col('nomDuCompte')), {
    [Op.like]: 'solde ouverture%',
  });

  const [openingCredit, openingDebit] = await Promise.all([
    sumField(
      'credit',
      {
        date: { [Op.gte]: startOfYear, [Op.lt]: startOfNextYear },
        [Op.and]: [openingNameClause],
      },
      batchIds
    ),
    sumField(
      'debit',
      {
        date: { [Op.gte]: startOfYear, [Op.lt]: startOfNextYear },
        [Op.and]: [openingNameClause],
      },
      batchIds
    ),
  ]);

  // ⚠️ Je garde ton sens actuel
  return (openingDebit || 0) - (openingCredit || 0);
}

async function getTresorerie(req, res) {
  try {
    const now = new Date();
    const MS_DAY = 1000 * 60 * 60 * 24;

    // ✅ user depuis JWT
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Non authentifié' });

    // ✅ batchs de l’utilisateur
    const myBatches = await ImportBatch.findAll({
      where: { userId, type: 'grand_livre' },
      attributes: ['id'],
      raw: true,
    });
    const myBatchIds = myBatches.map((b) => b.id);

    if (myBatchIds.length === 0) {
      return res.json({
        soldeOuverture: 0,
        soldeActuel: 0,
        encaissements: 0,
        decaissements: 0,
        netMois: 0,
        historique: [],
        prevision30j: [],
        topDecaissements: [],
        notifications: [
          { type: 'info', title: 'Aucune donnée', subtitle: 'Aucun import trouvé', message: 'Vous n’avez pas encore importé de grand livre.' },
        ],
        periode: { mode: String(req.query.mode || 'month'), month: 'NO_DATA', isCurrentMonth: true },
      });
    }

    const mode = String(req.query.mode || 'month').toLowerCase();
    const isGlobal = mode === 'global';

    // ======= Référence mois
    const ref = isGlobal ? new Date(now.getFullYear(), now.getMonth(), 1) : parseYearMonth(req);
    const year = ref.getFullYear();
    const month = ref.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const startOfNextMonth = new Date(year, month + 1, 1);

    // ======= GLOBAL start
    let globalStart = null;
    let globalStartYear = year;

    if (isGlobal) {
      const minDateRaw = await LedgerEntry.min('date', {
        where: { importBatchId: { [Op.in]: myBatchIds } },
      });
      const minDate = minDateRaw ? new Date(minDateRaw) : new Date(now.getFullYear(), 0, 1);
      globalStartYear = minDate.getFullYear();
      globalStart = new Date(globalStartYear, 0, 1);
    }

    const isCurrentMonth = isGlobal ? true : (now.getFullYear() === year && now.getMonth() === month);
    const asOf = isGlobal ? now : (isCurrentMonth ? now : startOfNextMonth);

    // ======= Solde ouverture
    const ouvertureYear = isGlobal ? globalStartYear : year;
    const soldeOuverture = await getSoldeOuvertureForYear(ouvertureYear, myBatchIds);

    // ======= Période principale
    const periodStart = isGlobal ? globalStart : startOfMonth;

    // ✅ Totaux période
    const [encaissements, decaissements] = await Promise.all([
      sumField(
        'credit',
        {
          date: { [Op.gte]: periodStart, [Op.lt]: asOf },
          ...prefixWhere(CA_PREFIXES),
        },
        myBatchIds
      ),
      sumField(
        'debit',
        {
          date: { [Op.gte]: periodStart, [Op.lt]: asOf },
          ...prefixWhere(CHARGE_PREFIXES),
        },
        myBatchIds
      ),
    ]);

    const netMois = encaissements - decaissements;

    const soldeActuel = soldeOuverture + encaissements - decaissements;

    // ✅ Prévision 30j
    let cashParJour = 0;
    let burnParJour = 0;
    let joursCouverture = Infinity;
    let pctVsPrev = null;
    let soldeRef = null;
    let deltaCash = 0;

    if (!isGlobal) {
      const startOfYear = new Date(year, 0, 1);
      const [sumCaBeforeMonth, sumChargesBeforeMonth] = await Promise.all([
        sumField(
          'credit',
          {
            date: { [Op.gte]: startOfYear, [Op.lt]: startOfMonth },
            ...prefixWhere(CA_PREFIXES),
          },
          myBatchIds
        ),
        sumField(
          'debit',
          {
            date: { [Op.gte]: startOfYear, [Op.lt]: startOfMonth },
            ...prefixWhere(CHARGE_PREFIXES),
          },
          myBatchIds
        ),
      ]);

      const soldeDebutMois = soldeOuverture + sumCaBeforeMonth - sumChargesBeforeMonth;
      deltaCash = soldeActuel - soldeDebutMois;

      const diffDays = (asOf - startOfMonth) / MS_DAY;
      const joursEcoules = isCurrentMonth ? Math.max(1, Math.floor(diffDays) + 1) : Math.max(1, Math.round(diffDays));

      cashParJour = deltaCash / joursEcoules;
      burnParJour = Math.max(0, -cashParJour);
      joursCouverture = burnParJour > 0 ? (soldeActuel / burnParJour) : Infinity;

      soldeRef = soldeDebutMois;
      if (Number(soldeDebutMois) !== 0) {
        pctVsPrev = ((soldeActuel - soldeDebutMois) / Math.abs(soldeDebutMois)) * 100;
      }
    } else {
      const last30Start = new Date(asOf.getTime() - 30 * MS_DAY);

      const [ca30, ch30] = await Promise.all([
        sumField(
          'credit',
          {
            date: { [Op.gte]: last30Start, [Op.lt]: asOf },
            ...prefixWhere(CA_PREFIXES),
          },
          myBatchIds
        ),
        sumField(
          'debit',
          {
            date: { [Op.gte]: last30Start, [Op.lt]: asOf },
            ...prefixWhere(CHARGE_PREFIXES),
          },
          myBatchIds
        ),
      ]);

      deltaCash = ca30 - ch30;
      cashParJour = deltaCash / 30;
      burnParJour = Math.max(0, -cashParJour);
      joursCouverture = burnParJour > 0 ? (soldeActuel / burnParJour) : Infinity;

      const solde30Ago = soldeActuel - deltaCash;
      soldeRef = solde30Ago;
      if (Number(solde30Ago) !== 0) {
        pctVsPrev = ((soldeActuel - solde30Ago) / Math.abs(solde30Ago)) * 100;
      }
    }

    // ✅ Historique 6 mois
    const historique = [];
    if (!isGlobal) {
      const startOfYear = new Date(year, 0, 1);

      for (let i = 5; i >= 0; i--) {
        const labelDate = new Date(year, month - i, 1);
        const dEnd = new Date(labelDate.getFullYear(), labelDate.getMonth() + 1, 1);

        const [c, d] = await Promise.all([
          sumField(
            'credit',
            {
              date: { [Op.gte]: startOfYear, [Op.lt]: dEnd },
              ...prefixWhere(CA_PREFIXES),
            },
            myBatchIds
          ),
          sumField(
            'debit',
            {
              date: { [Op.gte]: startOfYear, [Op.lt]: dEnd },
              ...prefixWhere(CHARGE_PREFIXES),
            },
            myBatchIds
          ),
        ]);

        const label = labelDate.toLocaleDateString('fr-FR', { month: 'short' });
        historique.push({ label, solde: soldeOuverture + c - d });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const labelDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const dEnd = new Date(labelDate.getFullYear(), labelDate.getMonth() + 1, 1);

        const [c, d] = await Promise.all([
          sumField(
            'credit',
            {
              date: { [Op.gte]: globalStart, [Op.lt]: dEnd },
              ...prefixWhere(CA_PREFIXES),
            },
            myBatchIds
          ),
          sumField(
            'debit',
            {
              date: { [Op.gte]: globalStart, [Op.lt]: dEnd },
              ...prefixWhere(CHARGE_PREFIXES),
            },
            myBatchIds
          ),
        ]);

        const label = labelDate.toLocaleDateString('fr-FR', { month: 'short' });
        historique.push({ label, solde: soldeOuverture + c - d });
      }
    }

    // ✅ Prévision 30j
    const label0 = "Aujourd'hui";
    const prevision30j = [0, 7, 15, 22, 30].map((j) => ({
      label: j === 0 ? label0 : `J+${j}`,
      solde: soldeActuel + cashParJour * j,
    }));

    // ✅ Notifications
    const notifications = [];

    const tresorerieCritique = Number(soldeActuel) <= 0 || (burnParJour > 0 && joursCouverture < CRITICAL_DAYS);

    if (tresorerieCritique) {
      notifications.push({
        type: 'critical',
        title: 'Cash estimé critique',
        subtitle: `Cash estimé < ${CRITICAL_DAYS} jours d’activité`,
        message: `Votre Cash estimé estimée couvre moins de ${CRITICAL_DAYS} jours d’activité.`,
        meta: {
          burnParJour,
          joursCouverture: Number.isFinite(joursCouverture) ? joursCouverture : null,
        },
      });
    }

    if (decaissements > encaissements && (decaissements - encaissements) > 0) {
      notifications.push({
        type: 'warning',
        title: 'Cash estimé sous tension',
        subtitle: isGlobal ? 'Décaissements > encaissements (global)' : 'Décaissements > encaissements sur le mois',
        message: isGlobal
          ? 'Sur la période globale, les décaissements dépassent les encaissements.'
          : 'Les décaissements du mois dépassent les encaissements.',
        meta: { decaissements, encaissements, ecart: decaissements - encaissements },
      });
    }

    if (typeof pctVsPrev === 'number' && pctVsPrev <= -DROP_PCT) {
      notifications.push({
        type: 'warning',
        title: 'Baisse rapide du cash',
        subtitle: isGlobal
          ? `Cash en baisse de ${Math.abs(pctVsPrev).toFixed(1)}% vs il y a 30 jours`
          : `Cash en baisse de ${Math.abs(pctVsPrev).toFixed(1)}% vs début du mois`,
        message: 'Votre Cash estimé est en baisse sur la période de comparaison.',
        meta: { pctVsPrev, soldeRef, soldeActuel, deltaCash },
      });
    }

    // ✅ Top décaissements (filtré user)
    let whereDate;
    if (isCurrentMonth) {
      const startOfTomorrow = new Date();
      startOfTomorrow.setHours(0, 0, 0, 0);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      whereDate = {
        [Op.or]: [
          { echeance: { [Op.gte]: startOfTomorrow } },
          { date: { [Op.gte]: startOfTomorrow } },
        ],
      };
    } else {
      whereDate = {
        [Op.or]: [
          { echeance: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth } },
          { date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth } },
        ],
      };
    }

    const topDecaissementsBrut = await LedgerEntry.findAll({
      where: withUserBatches(
        {
          ...whereDate,
          debit: { [Op.gt]: 0 },
          ...prefixWhere(CHARGE_PREFIXES),
        },
        myBatchIds
      ),
      order: [[literal('COALESCE(echeance, date)'), 'ASC'], ['debit', 'DESC']],
      limit: 10,
    });

    const topDecaissements = topDecaissementsBrut.map((row) => ({
      date: row.echeance
        ? new Date(row.echeance).toLocaleDateString('fr-FR')
        : (row.date ? new Date(row.date).toLocaleDateString('fr-FR') : ''),
      libelle: row.communication || row.nomDuCompte || 'Décaissement',
      montant: Number(row.debit || 0),
      partner: row.partner || null,
    }));

    return res.json({
      soldeOuverture,
      soldeActuel,
      encaissements,
      decaissements,
      netMois,

      historique,
      prevision30j,
      topDecaissements,
      notifications,

      periode: {
        mode: isGlobal ? 'global' : 'month',
        month: isGlobal ? 'GLOBAL' : `${year}-${String(month + 1).padStart(2, '0')}`,
        isCurrentMonth,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors du calcul de la Cash estimé' });
  }
}

module.exports = { getTresorerie };