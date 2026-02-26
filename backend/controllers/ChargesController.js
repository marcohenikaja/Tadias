const { Op, fn, col, literal } = require('sequelize');
const { LedgerEntry } = require('../models/LedgerEntryModel');
const { ImportBatch } = require('../models/ImportBatchModel'); // ✅ AJOUT

const CHARGES_PREFIX = 'ACH';        // ACH%
const ALERT_HAUSSE_PCT = 10;         // (7) hausse > 10%
const ALERT_SPEC_PCT = 15;           // (8) charge spécifique > +15%
const AVG_MONTHS = 3;                // moyenne des 3 mois précédents

function parseMode(req) {
  const now = new Date();

  if (String(req.query.mode || '').toLowerCase() === 'global') {
    return { mode: 'global', year: now.getFullYear(), monthIndex: now.getMonth() };
  }

  if (req.query.periode) {
    const m = String(req.query.periode).match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const year = Number(m[1]);
      const mo = Number(m[2]);
      if (year >= 1900 && mo >= 1 && mo <= 12) return { mode: 'month', year, monthIndex: mo - 1 };
    }
  }

  const qYear = Number.parseInt(req.query.year, 10);
  const qMonth = Number.parseInt(req.query.month, 10);
  const nowY = now.getFullYear();
  const nowM = now.getMonth();

  if (Number.isFinite(qYear) && Number.isFinite(qMonth)) {
    const year = qYear;
    let monthIndex = nowM;
    if (qMonth >= 1 && qMonth <= 12) monthIndex = qMonth - 1;
    else if (qMonth >= 0 && qMonth <= 11) monthIndex = qMonth;
    return { mode: 'month', year, monthIndex };
  }

  return { mode: 'month', year: nowY, monthIndex: nowM };
}

async function getCharges(req, res) {
  try {
    const partenaire = String(req.query.partenaire || '').trim();
    const modeInfo = parseMode(req);
    const isGlobal = modeInfo.mode === 'global';

    // ✅ userId depuis JWT
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Non authentifié' });

    // ✅ batchs de l’utilisateur (grand_livre)
    const myBatches = await ImportBatch.findAll({
      where: { userId, type: 'grand_livre' },
      attributes: ['id'],
      raw: true,
    });
    const myBatchIds = myBatches.map((b) => b.id);

    // ✅ aucun import => réponse vide
    if (myBatchIds.length === 0) {
      const { year, monthIndex } = modeInfo;
      return res.json({
        periode: { mode: isGlobal ? 'global' : 'month', year, month: monthIndex + 1 },
        totalChargesMois: 0,
        totalChargesPrevMois: isGlobal ? null : 0,
        variationChargesPourcent: 0,
        chargesParMois: [],
        parPartenaire: [],
        totalGlobal: 0,
        totalPartenaires: 0,
        notifications: [],
      });
    }

    // =========================
    // 1) Mois "référence"
    // =========================
    const { year, monthIndex } = modeInfo;

    const startCur = new Date(year, monthIndex, 1);
    const endCur = new Date(year, monthIndex + 1, 1);

    const startPrev = new Date(year, monthIndex - 1, 1);
    const endPrev = new Date(year, monthIndex, 1);

    const periodeMeta = { mode: isGlobal ? 'global' : 'month', year, month: monthIndex + 1 };

    // =========================
    // 2) WHERE base charges (✅ + filtre user par importBatchId)
    // =========================
    const baseChargesWhere = {
      importBatchId: { [Op.in]: myBatchIds }, // ✅ AJOUT IMPORTANT
      debit: { [Op.gt]: 0 },
      nomDuCompte: { [Op.like]: `${CHARGES_PREFIX}%` },
      partner: { [Op.ne]: '' },
    };

    const withPartner = (w) => {
      if (!partenaire) return w;
      return { ...w, partner: { [Op.like]: `%${partenaire}%` } };
    };

    const whereCurRef = withPartner({
      ...baseChargesWhere,
      date: { [Op.gte]: startCur, [Op.lt]: endCur },
    });

    const wherePrevRef = withPartner({
      ...baseChargesWhere,
      date: { [Op.gte]: startPrev, [Op.lt]: endPrev },
    });

    const whereAllTime = withPartner({ ...baseChargesWhere });

    // =========================
    // 3) Totaux affichés
    // =========================
    let totalChargesMois = 0;
    let totalChargesPrevMois = null;
    let variationChargesPourcent = 0;

    if (isGlobal) {
      const totalGlobalRaw = await LedgerEntry.sum('debit', { where: whereAllTime });
      totalChargesMois = Number(totalGlobalRaw || 0);
      totalChargesPrevMois = null;
      variationChargesPourcent = 0;
    } else {
      const totalCurRaw = await LedgerEntry.sum('debit', { where: whereCurRef });
      const totalPrevRaw = await LedgerEntry.sum('debit', { where: wherePrevRef });

      totalChargesMois = Number(totalCurRaw || 0);
      totalChargesPrevMois = Number(totalPrevRaw || 0);

      if (totalChargesPrevMois > 0) {
        variationChargesPourcent =
          ((totalChargesMois - totalChargesPrevMois) / totalChargesPrevMois) * 100;
      }
    }

    // =========================
    // 4) Historique (charges par mois)
    // =========================
    const chargesParMoisRows = await LedgerEntry.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('date'), '%Y-%m'), 'mois'],
        [fn('SUM', col('debit')), 'montant'],
      ],
      where: whereAllTime,
      group: [literal('DATE_FORMAT(date, "%Y-%m")')],
      order: [[literal('mois'), 'ASC']],
    });

    const chargesParMois = chargesParMoisRows.map((row) => ({
      label: row.get('mois'),
      montant: Number(row.get('montant') || 0),
    }));

    // =========================
    // 5) Total par partenaire (selon mode)
    // =========================
    const wherePartners = isGlobal ? whereAllTime : whereCurRef;

    const rows = await LedgerEntry.findAll({
      attributes: ['partner', [fn('SUM', col('debit')), 'totalSolde']],
      where: wherePartners,
      group: ['partner'],
      order: [[fn('SUM', col('debit')), 'DESC']],
    });

    const parPartenaire = rows
      .map((row) => ({
        partner: row.get('partner'),
        totalSolde: Number(row.get('totalSolde') || 0),
      }))
      .filter((r) => r.totalSolde > 0);

    const totalGlobal = parPartenaire.reduce((sum, p) => sum + p.totalSolde, 0);

    // =========================
    // 6) Notifications (7 & 8)
    // =========================
    const notifications = [];

    const refCurRaw = await LedgerEntry.sum('debit', { where: whereCurRef });
    const refPrevRaw = await LedgerEntry.sum('debit', { where: wherePrevRef });

    const refCur = Number(refCurRaw || 0);
    const refPrev = Number(refPrevRaw || 0);

    let refVarPct = 0;
    if (refPrev > 0) refVarPct = ((refCur - refPrev) / refPrev) * 100;

    if (refPrev > 0 && refVarPct > ALERT_HAUSSE_PCT) {
      notifications.push({
        type: 'warning',
        code: 'CHARGES_HAUSSE_10',
        title: 'Hausse des charges',
        subtitle: `Charges totales en hausse de plus de ${ALERT_HAUSSE_PCT}% sur le mois`,
        message: 'Vos charges ont augmenté de plus de 10% ce mois-ci.',
        meta: {
          variationChargesPourcent: refVarPct,
          totalChargesMois: refCur,
          totalChargesPrevMois: refPrev,
          periode: periodeMeta,
          note: isGlobal ? 'Mode global : alerte basée sur le mois courant' : undefined,
        },
      });
    }

    const topChargesCur = await LedgerEntry.findAll({
      attributes: ['nomDuCompte', [fn('SUM', col('debit')), 'total']],
      where: whereCurRef,
      group: ['nomDuCompte'],
      order: [[literal('total'), 'DESC']],
      limit: 5,
    });

    for (const it of topChargesCur) {
      const nom = it.get('nomDuCompte') || 'ACH';
      const cur = Number(it.get('total') || 0);
      if (!cur) continue;

      let sumPrev = 0;
      let countPrev = 0;

      for (let k = 1; k <= AVG_MONTHS; k++) {
        const s = new Date(year, monthIndex - k, 1);
        const e = new Date(year, monthIndex - k + 1, 1);

        const prevRaw = await LedgerEntry.sum('debit', {
          where: withPartner({
            ...baseChargesWhere,
            date: { [Op.gte]: s, [Op.lt]: e },
            nomDuCompte: nom,
          }),
        });

        const prevVal = Number(prevRaw || 0);
        if (prevVal > 0) {
          sumPrev += prevVal;
          countPrev += 1;
        }
      }

      const avg = countPrev ? sumPrev / countPrev : 0;
      if (avg > 0 && cur > avg * (1 + ALERT_SPEC_PCT / 100)) {
        const pct = ((cur - avg) / avg) * 100;

        notifications.push({
          type: 'warning',
          code: 'CHARGE_SPEC_ALERTE',
          title: 'Charge spécifique en alerte',
          subtitle: `Une charge dépasse son niveau habituel (+${ALERT_SPEC_PCT}%)`,
          message: 'Une charge dépasse son niveau habituel ce mois-ci.',
          meta: { nomDuCompte: nom, cur, avg, pct, periode: periodeMeta },
        });
        break;
      }
    }

    return res.json({
      periode: periodeMeta,
      totalChargesMois,
      totalChargesPrevMois,
      variationChargesPourcent,
      chargesParMois,
      parPartenaire,
      totalGlobal,
      totalPartenaires: parPartenaire.length,
      notifications,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors du calcul des charges' });
  }
}

module.exports = { getCharges };