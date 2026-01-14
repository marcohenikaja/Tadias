// // controllers/ActiviteController.js
// const { Op, fn, col, literal } = require('sequelize');
// const { LedgerEntry } = require('../models/LedgerEntryModel');

// // =====================
// // CONFIG ALERTES
// // =====================
// const DROP_CA_PCT = 20;   // (4) baisse > 20%
// const INACTIVE_DAYS = 7;  // (5) aucune vente depuis 7 jours
// const VAR_PCT = 40;       // (6) variation inhabituelle vs moyenne 3 mois

// // CA uniquement sur factures VTE/ et PRE/
// const ALL_PREFIXES = ['VTE/', 'PRE/'];


// // =====================
// // Helpers
// // =====================
// function parsePeriode(req) {
//   const now = new Date();

//   // ?periode=YYYY-MM
//   if (req.query.periode) {
//     const m = String(req.query.periode).match(/^(\d{4})-(\d{2})$/);
//     if (m) {
//       const y = Number(m[1]);
//       const mo = Number(m[2]); // 1..12
//       if (y >= 1900 && mo >= 1 && mo <= 12) return { year: y, monthIndex: mo - 1 };
//     }
//   }

//   // ?year=YYYY&month=MM
//   const qYear = Number.parseInt(req.query.year, 10);
//   const qMonth = Number.parseInt(req.query.month, 10);

//   const year = Number.isFinite(qYear) ? qYear : now.getFullYear();
//   let monthIndex = now.getMonth();

//   if (Number.isFinite(qMonth)) {
//     if (qMonth >= 1 && qMonth <= 12) monthIndex = qMonth - 1;
//     else if (qMonth >= 0 && qMonth <= 11) monthIndex = qMonth;
//   }

//   return { year, monthIndex };
// }

// function caPrefixWhere(docType = 'ALL') {
//   const t = String(docType || 'ALL').toUpperCase();

//   let prefixes = ALL_PREFIXES;
//   if (t === 'VTE') prefixes = ['VTE/'];
//   if (t === 'PRE') prefixes = ['PRE/'];

//   return {
//     [Op.or]: prefixes.map((p) => ({
//       nomDuCompte: { [Op.like]: `${p}%` },
//     })),
//   };
// }

// // =====================
// // Controller
// // =====================
// async function getActivite(req, res) {
//   try {
//     const now = new Date();
//     const MS_DAY = 1000 * 60 * 60 * 24;

//     const { year, monthIndex } = parsePeriode(req);
//     const partenaire = String(req.query.partenaire || '').trim();

//     const startOfMonth = new Date(year, monthIndex, 1);
//     const startOfNextMonth = new Date(year, monthIndex + 1, 1);

//     const isCurrentMonth = now.getFullYear() === year && now.getMonth() === monthIndex;

//     // =====================
//     // WHERE BASE CA
//     // CA = credit > 0 sur nomDuCompte qui commence par VTE/ ou PRE/

//     // =====================


//     const docType = String(req.query.docType || 'ALL').toUpperCase();
//     let prefixes = ALL_PREFIXES;
//     if (docType === 'VTE') prefixes = ['VTE/'];
//     if (docType === 'PRE') prefixes = ['PRE/'];

//     const prefixWhere = {
//       [Op.or]: prefixes.map((p) => ({ nomDuCompte: { [Op.like]: `${p}%` } })),
//     };

//     const baseWhereCA = {
//       ...caPrefixWhere(),
//       credit: { [Op.gt]: 0 },
//       partner: { [Op.not]: null, [Op.ne]: '' },
//       nomDuCompte: { [Op.not]: null, [Op.ne]: '' },
//     };

//     const whereCAFiltre = partenaire
//       ? { ...baseWhereCA, partner: { [Op.like]: `%${partenaire}%` } }
//       : baseWhereCA;

//     const whereMois = {
//       ...whereCAFiltre,
//       date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth },
//     };

//     // =====================
//     // Totaux CA
//     // =====================
//     const caTotalGlobalRaw = await LedgerEntry.sum('credit', { where: baseWhereCA });
//     const caTotalGlobal = Number(caTotalGlobalRaw || 0);

//     const caTotalGlobalFiltreRaw = partenaire
//       ? await LedgerEntry.sum('credit', { where: whereCAFiltre })
//       : caTotalGlobalRaw;
//     const caTotalGlobalFiltre = Number(caTotalGlobalFiltreRaw || 0);

//     const caTotalMoisRaw = await LedgerEntry.sum('credit', { where: whereMois });
//     const caTotalMois = Number(caTotalMoisRaw || 0);

//     // =====================
//     // 1) Évolution CA (6 mois)
//     // =====================
//     const caParMois = [];
//     for (let i = 5; i >= 0; i--) {
//       const dStart = new Date(year, monthIndex - i, 1);
//       const dEnd = new Date(year, monthIndex - i + 1, 1);

//       const raw = await LedgerEntry.sum('credit', {
//         where: {
//           ...whereCAFiltre,
//           date: { [Op.gte]: dStart, [Op.lt]: dEnd },
//         },
//       });

//       const montant = Number(raw || 0);
//       const labelDate = new Date(year, monthIndex - i, 1);
//       const label = labelDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

//       caParMois.push({ label, montant });
//     }

//     // =====================
//     // 2) CA par service/produit (communication)
//     // + nb factures distinctes (nomDuCompte)
//     // + ticket moyen par communication
//     // =====================
//     const servicesRows = await LedgerEntry.findAll({
//       attributes: [
//         'communication',
//         [fn('SUM', col('credit')), 'total'],
//         [literal('COUNT(DISTINCT nomDuCompte)'), 'nbFactures'],
//       ],
//       where: {
//         ...whereMois,
//         communication: { [Op.not]: null, [Op.ne]: '' },
//       },
//       group: ['communication'],
//       order: [[literal('total'), 'DESC']],
//       limit: 8,
//     });

//     const caParService = servicesRows.map((row) => {
//       const total = Number(row.get('total') || 0);
//       const nb = Number(row.get('nbFactures') || 0);

//       return {
//         label: row.get('communication') || 'Sans libellé',
//         montant: total,
//         nbFactures: nb,
//         ticketMoyen: nb > 0 ? total / nb : 0,
//       };
//     });

//     // =====================
//     // 3) Ticket moyen GLOBAL
//     // nb factures = COUNT DISTINCT nomDuCompte
//     // =====================
//     const nbFactures = await LedgerEntry.count({
//       where: whereMois,
//       distinct: true,
//       col: 'nomDuCompte',
//     });

//     const ticketMoyen = nbFactures > 0 ? caTotalMois / nbFactures : 0;

//     // =====================
//     // ✅ ALERTES 4/5/6
//     // =====================
//     const notifications = [];

//     // (4) Baisse significative du CA > 20% vs mois précédent
//     const prevStart = new Date(year, monthIndex - 1, 1);
//     const prevEnd = startOfMonth;

//     const caPrevMonthRaw = await LedgerEntry.sum('credit', {
//       where: {
//         ...whereCAFiltre,
//         date: { [Op.gte]: prevStart, [Op.lt]: prevEnd },
//       },
//     });
//     const caPrevMonth = Number(caPrevMonthRaw || 0);

//     if (caPrevMonth > 0) {
//       const pctDrop = ((caTotalMois - caPrevMonth) / caPrevMonth) * 100;
//       if (pctDrop <= -DROP_CA_PCT) {
//         notifications.push({
//           type: 'warning',
//           title: 'Baisse significative du CA',
//           subtitle: `CA en baisse de plus de ${DROP_CA_PCT}% vs mois précédent`,
//           message: `Votre chiffre d’affaires est en baisse de plus de ${DROP_CA_PCT}% par rapport au mois précédent.`,
//           meta: { pctDrop, caPrevMonth, caCurrent: caTotalMois },
//         });
//       }
//     }

//     // (5) Inactivité commerciale : aucune vente depuis 7 jours
//     if (isCurrentMonth) {
//       const lastSale = await LedgerEntry.findOne({
//         where: whereCAFiltre,
//         order: [['date', 'DESC']],
//         attributes: ['date'],
//       });

//       const cutoff = new Date(now.getTime() - INACTIVE_DAYS * MS_DAY);

//       if (!lastSale?.date || new Date(lastSale.date) < cutoff) {
//         const daysNoSales = lastSale?.date
//           ? Math.floor((now - new Date(lastSale.date)) / MS_DAY)
//           : null;

//         notifications.push({
//           type: 'warning',
//           title: 'Inactivité commerciale',
//           subtitle: `Aucune vente enregistrée depuis ${INACTIVE_DAYS} jours`,
//           message: `Aucune vente n’a été enregistrée au cours des ${INACTIVE_DAYS} derniers jours.`,
//           meta: { daysNoSales },
//         });
//       }
//     }

//     // (6) Variabilité anormale vs moyenne 3 derniers mois (M-1, M-2, M-3)
//     const last3 = [];
//     for (const k of [1, 2, 3]) {
//       const s = new Date(year, monthIndex - k, 1);
//       const e = new Date(year, monthIndex - k + 1, 1);

//       const raw = await LedgerEntry.sum('credit', {
//         where: { ...whereCAFiltre, date: { [Op.gte]: s, [Op.lt]: e } },
//       });

//       last3.push(Number(raw || 0));
//     }

//     const avg3 = last3.length ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;

//     if (avg3 > 0) {
//       const pctVar = ((caTotalMois - avg3) / avg3) * 100;
//       if (Math.abs(pctVar) >= VAR_PCT) {
//         notifications.push({
//           type: 'warning',
//           title: 'Variabilité anormale du CA',
//           subtitle: 'Forte variation inhabituelle vs moyenne des 3 derniers mois',
//           message: 'Une variation inhabituelle du chiffre d’affaires a été détectée ce mois-ci.',
//           meta: { pctVar, avg3, caCurrent: caTotalMois, last3 },
//         });
//       }
//     }

//     // =====================
//     // Réponse
//     // =====================
//     return res.json({
//       periode: { year, month: monthIndex + 1 },
//       filtre: { partenaire: partenaire || null },

//       caTotalGlobal,
//       caTotalGlobalFiltre,
//       caTotalMois,

//       caParMois,
//       caParService,

//       nbFactures,
//       ticketMoyen,

//       notifications,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Erreur lors du calcul de l’activité" });
//   }
// }

// module.exports = { getActivite };


// controllers/ActiviteController.js
const { Op, fn, col, literal } = require('sequelize');
const { LedgerEntry } = require('../models/LedgerEntryModel');

// =====================
// CONFIG ALERTES
// =====================
const DROP_CA_PCT = 20;   // baisse > 20%
const INACTIVE_DAYS = 7;  // aucune vente depuis 7 jours
const VAR_PCT = 40;       // variation inhabituelle vs moyenne 3 mois

const ALL_PREFIXES = ['VTE/', 'PRE/'];

// =====================
// Helpers
// =====================
function parsePeriode(req) {
  const now = new Date();

  // ?periode=YYYY-MM
  if (req.query.periode) {
    const m = String(req.query.periode).match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]); // 1..12
      if (y >= 1900 && mo >= 1 && mo <= 12) return { year: y, monthIndex: mo - 1 };
    }
  }

  // ?year=YYYY&month=MM
  const qYear = Number.parseInt(req.query.year, 10);
  const qMonth = Number.parseInt(req.query.month, 10);

  const year = Number.isFinite(qYear) ? qYear : now.getFullYear();
  let monthIndex = now.getMonth();

  if (Number.isFinite(qMonth)) {
    if (qMonth >= 1 && qMonth <= 12) monthIndex = qMonth - 1;
    else if (qMonth >= 0 && qMonth <= 11) monthIndex = qMonth;
  }

  return { year, monthIndex };
}

function caPrefixWhere(docType = 'ALL') {
  const t = String(docType || 'ALL').toUpperCase();

  let prefixes = ALL_PREFIXES;
  if (t === 'VTE') prefixes = ['VTE/'];
  if (t === 'PRE') prefixes = ['PRE/'];

  return {
    [Op.or]: prefixes.map((p) => ({
      nomDuCompte: { [Op.like]: `${p}%` },
    })),
  };
}

// =====================
// Controller
// =====================
async function getActivite(req, res) {
  try {
    const now = new Date();
    const MS_DAY = 1000 * 60 * 60 * 24;

    const mode = String(req.query.mode || 'month').toLowerCase();
    const isGlobal = mode === 'global';

    const { year, monthIndex } = parsePeriode(req); // sert de "référence" (mois) + labels
    const partenaire = String(req.query.partenaire || '').trim();
    const docType = String(req.query.docType || 'ALL').toUpperCase();

    // En global, on prend le mois courant comme "référence alertes" (baisse vs mois précédent, etc.)
    const refYear = isGlobal ? now.getFullYear() : year;
    const refMonthIndex = isGlobal ? now.getMonth() : monthIndex;

    const startOfMonth = new Date(refYear, refMonthIndex, 1);
    const startOfNextMonth = new Date(refYear, refMonthIndex + 1, 1);

    const isCurrentMonth = now.getFullYear() === refYear && now.getMonth() === refMonthIndex;

    // =====================
    // WHERE BASE CA (docType + partner non vide + credit>0)
    // =====================
    const baseWhereCA = {
      ...caPrefixWhere(docType),             // ✅ respecte ALL / VTE / PRE
      credit: { [Op.gt]: 0 },
      partner: { [Op.not]: null, [Op.ne]: '' },
      nomDuCompte: { [Op.not]: null, [Op.ne]: '' },
    };

    const whereCAFiltre = partenaire
      ? { ...baseWhereCA, partner: { [Op.like]: `%${partenaire}%` } }
      : baseWhereCA;

    const whereMois = {
      ...whereCAFiltre,
      date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth },
    };

    // =====================
    // Totaux CA
    // =====================
    const caTotalGlobalRaw = await LedgerEntry.sum('credit', { where: baseWhereCA });
    const caTotalGlobal = Number(caTotalGlobalRaw || 0);

    const caTotalGlobalFiltreRaw = partenaire
      ? await LedgerEntry.sum('credit', { where: whereCAFiltre })
      : caTotalGlobalRaw;
    const caTotalGlobalFiltre = Number(caTotalGlobalFiltreRaw || 0);

    const caTotalMoisRaw = isGlobal
      ? caTotalGlobalFiltreRaw // ✅ en GLOBAL, on réutilise le champ "caTotalMois" pour alimenter l’UI
      : await LedgerEntry.sum('credit', { where: whereMois });

    const caTotalMois = Number(caTotalMoisRaw || 0);

    // =====================
    // 1) Évolution CA (6 mois)
    // - Month mode: 6 mois autour du mois sélectionné
    // - Global mode: 6 derniers mois depuis "maintenant"
    // =====================
    const caParMois = [];
    for (let i = 5; i >= 0; i--) {
      const y = isGlobal ? now.getFullYear() : refYear;
      const m = isGlobal ? now.getMonth() : refMonthIndex;

      const dStart = new Date(y, m - i, 1);
      const dEnd = new Date(y, m - i + 1, 1);

      const raw = await LedgerEntry.sum('credit', {
        where: {
          ...whereCAFiltre,
          date: { [Op.gte]: dStart, [Op.lt]: dEnd },
        },
      });

      const montant = Number(raw || 0);
      const labelDate = new Date(y, m - i, 1);
      const label = labelDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

      caParMois.push({ label, montant });
    }

    // =====================
    // 2) CA par service (communication)
    // - Month mode: mois sélectionné
    // - Global mode: toute la base
    // =====================
    const servicesRows = await LedgerEntry.findAll({
      attributes: [
        'communication',
        [fn('SUM', col('credit')), 'total'],
        [literal('COUNT(DISTINCT nomDuCompte)'), 'nbFactures'],
      ],
      where: {
        ...(isGlobal ? whereCAFiltre : whereMois),
        communication: { [Op.not]: null, [Op.ne]: '' },
      },
      group: ['communication'],
      order: [[literal('total'), 'DESC']],
      limit: 8,
    });

    const caParService = servicesRows.map((row) => {
      const total = Number(row.get('total') || 0);
      const nb = Number(row.get('nbFactures') || 0);

      return {
        label: row.get('communication') || 'Sans libellé',
        montant: total,
        nbFactures: nb,
        ticketMoyen: nb > 0 ? total / nb : 0,
      };
    });

    // =====================
    // 3) Ticket moyen + nb factures
    // =====================
    const nbFactures = await LedgerEntry.count({
      where: isGlobal ? whereCAFiltre : whereMois,
      distinct: true,
      col: 'nomDuCompte',
    });

    const ticketMoyen = nbFactures > 0 ? caTotalMois / nbFactures : 0;

    // =====================
    // ALERTES 4/5/6 (basées sur le mois de référence)
    // =====================
    const notifications = [];

    // (4) Baisse significative du CA > 20% vs mois précédent
    const prevStart = new Date(refYear, refMonthIndex - 1, 1);
    const prevEnd = startOfMonth;

    const caPrevMonthRaw = await LedgerEntry.sum('credit', {
      where: {
        ...whereCAFiltre,
        date: { [Op.gte]: prevStart, [Op.lt]: prevEnd },
      },
    });
    const caPrevMonth = Number(caPrevMonthRaw || 0);

    if (caPrevMonth > 0) {
      const caCurRef = await LedgerEntry.sum('credit', {
        where: {
          ...whereCAFiltre,
          date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth },
        },
      });
      const caCur = Number(caCurRef || 0);

      const pctDrop = ((caCur - caPrevMonth) / caPrevMonth) * 100;
      if (pctDrop <= -DROP_CA_PCT) {
        notifications.push({
          type: 'warning',
          title: 'Baisse significative du CA',
          subtitle: `CA en baisse de plus de ${DROP_CA_PCT}% vs mois précédent`,
          message: `Votre chiffre d’affaires est en baisse de plus de ${DROP_CA_PCT}% par rapport au mois précédent.`,
          meta: { pctDrop, caPrevMonth, caCurrent: caCur },
        });
      }
    }

    // (5) Inactivité commerciale : aucune vente depuis 7 jours (uniquement si mois courant)
    if (isCurrentMonth) {
      const lastSale = await LedgerEntry.findOne({
        where: whereCAFiltre,
        order: [['date', 'DESC']],
        attributes: ['date'],
      });

      const cutoff = new Date(now.getTime() - INACTIVE_DAYS * MS_DAY);

      if (!lastSale?.date || new Date(lastSale.date) < cutoff) {
        const daysNoSales = lastSale?.date
          ? Math.floor((now - new Date(lastSale.date)) / MS_DAY)
          : null;

        notifications.push({
          type: 'warning',
          title: 'Inactivité commerciale',
          subtitle: `Aucune vente enregistrée depuis ${INACTIVE_DAYS} jours`,
          message: `Aucune vente n’a été enregistrée au cours des ${INACTIVE_DAYS} derniers jours.`,
          meta: { daysNoSales },
        });
      }
    }

    // (6) Variabilité anormale vs moyenne 3 derniers mois (M-1, M-2, M-3)
    const last3 = [];
    for (const k of [1, 2, 3]) {
      const s = new Date(refYear, refMonthIndex - k, 1);
      const e = new Date(refYear, refMonthIndex - k + 1, 1);

      const raw = await LedgerEntry.sum('credit', {
        where: { ...whereCAFiltre, date: { [Op.gte]: s, [Op.lt]: e } },
      });

      last3.push(Number(raw || 0));
    }

    const avg3 = last3.length ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;

    if (avg3 > 0) {
      const caCurRef = await LedgerEntry.sum('credit', {
        where: { ...whereCAFiltre, date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth } },
      });
      const caCur = Number(caCurRef || 0);

      const pctVar = ((caCur - avg3) / avg3) * 100;
      if (Math.abs(pctVar) >= VAR_PCT) {
        notifications.push({
          type: 'warning',
          title: 'Variabilité anormale du CA',
          subtitle: 'Forte variation inhabituelle vs moyenne des 3 derniers mois',
          message: 'Une variation inhabituelle du chiffre d’affaires a été détectée ce mois-ci.',
          meta: { pctVar, avg3, caCurrent: caCur, last3 },
        });
      }
    }

    // =====================
    // Réponse
    // =====================
    return res.json({
      periode: {
        mode: isGlobal ? 'global' : 'month',
        year: refYear,
        month: refMonthIndex + 1,
      },
      filtre: { partenaire: partenaire || null, docType },

      caTotalGlobal,
      caTotalGlobalFiltre,
      caTotalMois, // ✅ en GLOBAL = total global filtré (pour afficher dans l’UI sans casser ton code)

      caParMois,
      caParService,

      nbFactures,
      ticketMoyen,

      notifications,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur lors du calcul de l’activité" });
  }
}

module.exports = { getActivite };
