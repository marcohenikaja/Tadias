// // controllers/ChargesController.js
// const { Op, fn, col, literal } = require('sequelize');
// const { LedgerEntry } = require('../models/LedgerEntryModel');

// const CHARGES_PREFIX = 'ACH';        // ACH ou ACH/ -> on utilise ACH%
// const ALERT_HAUSSE_PCT = 10;         // (7) hausse >10%
// const ALERT_SPEC_PCT = 15;           // (8) charge spécifique > +15% vs habitude
// const AVG_MONTHS = 3;                // habitude = moyenne des 3 mois précédents

// function parseMode(req) {
//   const now = new Date();

//   if (req.query.periode) {
//     const m = String(req.query.periode).match(/^(\d{4})-(\d{2})$/);
//     if (m) {
//       const year = Number(m[1]);
//       const mo = Number(m[2]);
//       if (year >= 1900 && mo >= 1 && mo <= 12) return { mode: 'month', year, monthIndex: mo - 1 };
//     }
//   }

//   const qYear = Number.parseInt(req.query.year, 10);
//   const qMonth = Number.parseInt(req.query.month, 10);

//   if (Number.isFinite(qYear) && Number.isFinite(qMonth)) {
//     const year = qYear;
//     let monthIndex = now.getMonth();
//     if (qMonth >= 1 && qMonth <= 12) monthIndex = qMonth - 1;
//     else if (qMonth >= 0 && qMonth <= 11) monthIndex = qMonth;
//     return { mode: 'month', year, monthIndex };
//   }

//   return { mode: 'month', year: now.getFullYear(), monthIndex: now.getMonth() };
// }

// async function getCharges(req, res) {
//   try {
//     const { partenaire } = req.query;
//     const modeInfo = parseMode(req);

//     // =========================
//     // 1) Période courante + précédente
//     // =========================
//     const { year, monthIndex } = modeInfo;

//     const startCur = new Date(year, monthIndex, 1);
//     const endCur = new Date(year, monthIndex + 1, 1);

//     const startPrev = new Date(year, monthIndex - 1, 1);
//     const endPrev = new Date(year, monthIndex, 1);

//     const periodeMeta = { mode: 'month', year, month: monthIndex + 1 };

//     // =========================
//     // 2) WHERE de base
//     // Charges = debit > 0
//     // + nomDuCompte commence par ACH
//     // =========================
//     const baseChargesWhere = {
//       debit: { [Op.gt]: 0 },
//       nomDuCompte: { [Op.like]: `${CHARGES_PREFIX}%` }, // ACH%
//       partner: { [Op.ne]: '' },
//     };

//     const whereCur = {
//       ...baseChargesWhere,
//       date: { [Op.gte]: startCur, [Op.lt]: endCur },
//     };

//     const wherePrev = {
//       ...baseChargesWhere,
//       date: { [Op.gte]: startPrev, [Op.lt]: endPrev },
//     };

//     if (partenaire && partenaire.trim()) {
//       whereCur.partner = { [Op.like]: `%${partenaire.trim()}%` };
//       wherePrev.partner = { [Op.like]: `%${partenaire.trim()}%` };
//     }

//     // =========================
//     // 3) Totaux + variation
//     // =========================
//     const totalChargesMoisRaw = await LedgerEntry.sum('debit', { where: whereCur });
//     const totalChargesPrevMoisRaw = await LedgerEntry.sum('debit', { where: wherePrev });

//     const totalChargesMois = Number(totalChargesMoisRaw || 0);
//     const totalChargesPrevMois = Number(totalChargesPrevMoisRaw || 0);

//     let variationChargesPourcent = 0;
//     if (totalChargesPrevMois > 0) {
//       variationChargesPourcent =
//         ((totalChargesMois - totalChargesPrevMois) / totalChargesPrevMois) * 100;
//     }

//     // =========================
//     // 4) Historique (charges par mois) — global
//     // =========================
//     const chargesParMoisRows = await LedgerEntry.findAll({
//       attributes: [
//         [fn('DATE_FORMAT', col('date'), '%Y-%m'), 'mois'],
//         [fn('SUM', col('debit')), 'montant'],
//       ],
//       where: {
//         debit: { [Op.gt]: 0 },
//         nomDuCompte: { [Op.like]: `${CHARGES_PREFIX}%` },
//         partner: { [Op.ne]: '' },
//       },
//       group: [literal('DATE_FORMAT(date, "%Y-%m")')],
//       order: [[literal('mois'), 'ASC']],
//     });

//     const chargesParMois = chargesParMoisRows.map((row) => ({
//       label: row.get('mois'),
//       montant: Number(row.get('montant') || 0),
//     }));

//     // =========================
//     // 5) Total par partenaire (période courante)
//     // =========================
//     const rows = await LedgerEntry.findAll({
//       attributes: ['partner', [fn('SUM', col('debit')), 'totalSolde']],
//       where: whereCur,
//       group: ['partner'],
//       order: [[fn('SUM', col('debit')), 'DESC']],
//     });

//     const parPartenaire = rows
//       .map((row) => ({
//         partner: row.get('partner'),
//         totalSolde: Number(row.get('totalSolde') || 0), // ✅ total debit
//       }))
//       .filter((r) => r.totalSolde > 0);

//     const totalGlobal = parPartenaire.reduce((sum, p) => sum + p.totalSolde, 0);

//     // =========================
//     // 6) ✅ Signaux / notifications (7 & 8)
//     // =========================
//     const notifications = [];

//     // (7) Hausse des charges > 10%
//     const chargesHausse10 = totalChargesPrevMois > 0 && variationChargesPourcent > ALERT_HAUSSE_PCT;
//     if (chargesHausse10) {
//       notifications.push({
//         type: 'warning',
//         code: 'CHARGES_HAUSSE_10',
//         title: 'Hausse des charges',
//         subtitle: `Charges totales en hausse de plus de ${ALERT_HAUSSE_PCT}% sur le mois`,
//         message: 'Vos charges ont augmenté de plus de 10% ce mois-ci.',
//         meta: { variationChargesPourcent, totalChargesMois, totalChargesPrevMois, periode: periodeMeta },
//       });
//     }

//     // (8) Charge spécifique en alerte: une ligne ACH dépasse son niveau habituel (+15%)
//     // -> on regarde les plus grosses charges "nomDuCompte" du mois courant,
//     //    et on compare à la moyenne des 3 mois précédents (même nomDuCompte).
//     const topChargesCur = await LedgerEntry.findAll({
//       attributes: ['nomDuCompte', [fn('SUM', col('debit')), 'total']],
//       where: whereCur,
//       group: ['nomDuCompte'],
//       order: [[literal('total'), 'DESC']],
//       limit: 5,
//     });

//     for (const it of topChargesCur) {
//       const nom = it.get('nomDuCompte') || 'ACH';
//       const cur = Number(it.get('total') || 0);
//       if (!cur) continue;

//       // moyenne des 3 mois précédents
//       let sumPrev = 0;
//       let countPrev = 0;

//       for (let k = 1; k <= AVG_MONTHS; k++) {
//         const s = new Date(year, monthIndex - k, 1);
//         const e = new Date(year, monthIndex - k + 1, 1);

//         const prevRaw = await LedgerEntry.sum('debit', {
//           where: {
//             ...baseChargesWhere,
//             date: { [Op.gte]: s, [Op.lt]: e },
//             nomDuCompte: nom,
//             ...(partenaire && partenaire.trim()
//               ? { partner: { [Op.like]: `%${partenaire.trim()}%` } }
//               : {}),
//           },
//         });

//         const prevVal = Number(prevRaw || 0);
//         if (prevVal > 0) {
//           sumPrev += prevVal;
//           countPrev += 1;
//         }
//       }

//       const avg = countPrev ? sumPrev / countPrev : 0;
//       if (avg > 0 && cur > avg * (1 + ALERT_SPEC_PCT / 100)) {
//         const pct = ((cur - avg) / avg) * 100;

//         notifications.push({
//           type: 'warning',
//           code: 'CHARGE_SPEC_ALERTE',
//           title: 'Charge spécifique en alerte',
//           subtitle: `Une charge dépasse son niveau habituel (+${ALERT_SPEC_PCT}%)`,
//           message: 'Une charge dépasse son niveau habituel ce mois-ci.',
//           meta: { nomDuCompte: nom, cur, avg, pct, periode: periodeMeta },
//         });

//         // option: une seule alerte suffit
//         break;
//       }
//     }

//     // =========================
//     // 7) Réponse
//     // =========================
//     return res.json({
//       periode: periodeMeta,

//       totalChargesMois,
//       totalChargesPrevMois,
//       variationChargesPourcent,

//       chargesParMois,

//       parPartenaire,
//       totalGlobal,
//       totalPartenaires: parPartenaire.length,

//       notifications,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Erreur lors du calcul des charges' });
//   }
// }

// module.exports = { getCharges };
// controllers/ChargesController.js
const { Op, fn, col, literal } = require('sequelize');
const { LedgerEntry } = require('../models/LedgerEntryModel');

const CHARGES_PREFIX = 'ACH';        // ACH%
const ALERT_HAUSSE_PCT = 10;         // (7) hausse > 10%
const ALERT_SPEC_PCT = 15;           // (8) charge spécifique > +15%
const AVG_MONTHS = 3;                // moyenne des 3 mois précédents

function parseMode(req) {
  const now = new Date();

  // ✅ mode global
  if (String(req.query.mode || '').toLowerCase() === 'global') {
    return { mode: 'global', year: now.getFullYear(), monthIndex: now.getMonth() }; // mois "référence" = mois courant
  }

  // ?periode=YYYY-MM
  if (req.query.periode) {
    const m = String(req.query.periode).match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const year = Number(m[1]);
      const mo = Number(m[2]);
      if (year >= 1900 && mo >= 1 && mo <= 12) return { mode: 'month', year, monthIndex: mo - 1 };
    }
  }

  // ?year=YYYY&month=MM
  const qYear = Number.parseInt(req.query.year, 10);
  const qMonth = Number.parseInt(req.query.month, 10);

  if (Number.isFinite(qYear) && Number.isFinite(qMonth)) {
    const year = qYear;
    let monthIndex = now.getMonth();
    if (qMonth >= 1 && qMonth <= 12) monthIndex = qMonth - 1;
    else if (qMonth >= 0 && qMonth <= 11) monthIndex = qMonth;
    return { mode: 'month', year, monthIndex };
  }

  return { mode: 'month', year: now.getFullYear(), monthIndex: now.getMonth() };
}

async function getCharges(req, res) {
  try {
    const partenaire = String(req.query.partenaire || '').trim();
    const modeInfo = parseMode(req);
    const isGlobal = modeInfo.mode === 'global';

    // =========================
    // 1) Mois "référence" (utilisé pour alertes 7/8)
    // =========================
    const { year, monthIndex } = modeInfo;

    const startCur = new Date(year, monthIndex, 1);
    const endCur = new Date(year, monthIndex + 1, 1);

    const startPrev = new Date(year, monthIndex - 1, 1);
    const endPrev = new Date(year, monthIndex, 1);

    const periodeMeta = { mode: isGlobal ? 'global' : 'month', year, month: monthIndex + 1 };

    // =========================
    // 2) WHERE base charges
    // Charges = debit > 0 & ACH%
    // =========================
    const baseChargesWhere = {
      debit: { [Op.gt]: 0 },
      nomDuCompte: { [Op.like]: `${CHARGES_PREFIX}%` }, // ACH%
      partner: { [Op.ne]: '' },
    };

    // ✅ helper partner filter
    const withPartner = (w) => {
      if (!partenaire) return w;
      return { ...w, partner: { [Op.like]: `%${partenaire}%` } };
    };

    // ✅ période "mois" (référence) pour alertes
    const whereCurRef = withPartner({
      ...baseChargesWhere,
      date: { [Op.gte]: startCur, [Op.lt]: endCur },
    });

    const wherePrevRef = withPartner({
      ...baseChargesWhere,
      date: { [Op.gte]: startPrev, [Op.lt]: endPrev },
    });

    // ✅ global (toute la base)
    const whereAllTime = withPartner({ ...baseChargesWhere });

    // =========================
    // 3) Totaux affichés (selon mode)
    // =========================
    let totalChargesMois = 0;
    let totalChargesPrevMois = null;
    let variationChargesPourcent = 0;

    if (isGlobal) {
      const totalGlobalRaw = await LedgerEntry.sum('debit', { where: whereAllTime });
      totalChargesMois = Number(totalGlobalRaw || 0); // ✅ en GLOBAL = total base
      totalChargesPrevMois = null;
      variationChargesPourcent = 0;
    } else {
      const totalCurRaw = await LedgerEntry.sum('debit', { where: whereCurRef });
      const totalPrevRaw = await LedgerEntry.sum('debit', { where: wherePrevRef });

      totalChargesMois = Number(totalCurRaw || 0);
      totalChargesPrevMois = Number(totalPrevRaw || 0);

      if (totalChargesPrevMois > 0) {
        variationChargesPourcent = ((totalChargesMois - totalChargesPrevMois) / totalChargesPrevMois) * 100;
      }
    }

    // =========================
    // 4) Historique (charges par mois) — global (mais respecte filtre partenaire)
    // =========================
    const chargesParMoisRows = await LedgerEntry.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('date'), '%Y-%m'), 'mois'],
        [fn('SUM', col('debit')), 'montant'],
      ],
      where: whereAllTime, // ✅ respecte partenaire si renseigné
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
    // - même en GLOBAL : alertes basées sur le mois courant (référence)
    // =========================
    const notifications = [];

    // (7) Hausse des charges > 10% (mois référence vs mois précédent)
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

    // (8) Charge spécifique anormale (top 5 postes du mois référence)
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

    // =========================
    // 7) Réponse
    // =========================
    return res.json({
      periode: periodeMeta,

      totalChargesMois,
      totalChargesPrevMois,          // ✅ null en GLOBAL
      variationChargesPourcent,      // ✅ 0 en GLOBAL

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
