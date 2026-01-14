// // controllers/DashboardController.js
// const { Op, fn, col, literal, where: sqlWhere } = require('sequelize');
// const { LedgerEntry } = require('../models/LedgerEntryModel');

// // =============================
// // CONFIG
// // =============================
// const CA_PREFIXES = ['VTE/', 'PRE/']; // CA = somme des credits sur VTE/PRE
// const CHARGE_PREFIXES = ['ACH/'];     // Charges = somme des debits sur ACH

// function buildPrefixWhere(prefixes) {
//   if (!Array.isArray(prefixes) || prefixes.length === 0) return {};
//   return {
//     [Op.or]: prefixes.map((p) => ({
//       nomDuCompte: { [Op.like]: `${p}%` },
//     })),
//   };
// }

// async function sumField(field, where) {
//   const raw = await LedgerEntry.sum(field, { where });
//   return Number(raw || 0);
// }

// // =============================
// // Helpers dates / tendances
// // =============================
// function toDateOnlyLocal(d) {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }

// function shiftOneMonthBack(d) {
//   const y = d.getFullYear();
//   const m = d.getMonth();
//   const day = d.getDate();
//   const lastDayPrevMonth = new Date(y, m, 0).getDate();
//   return new Date(y, m - 1, Math.min(day, lastDayPrevMonth));
// }

// function trend(cur, prev) {
//   const c = Number(cur || 0);
//   const p = Number(prev || 0);
//   const delta = c - p;
//   const pct = p !== 0 ? (delta / Math.abs(p)) * 100 : (c > 0 ? 100 : 0);
//   return { delta, pct, direction: delta >= 0 ? 'up' : 'down' };
// }

// function parsePeriode(req) {
//   const now = new Date();

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

// // =============================
// // Solde ouverture (comme TresorerieController)
// // =============================
// async function getSoldeOuvertureForYear(year) {
//   const startOfYear = new Date(year, 0, 1);
//   const startOfNextYear = new Date(year + 1, 0, 1);

//   const openingNameClause = sqlWhere(fn('LOWER', col('nomDuCompte')), {
//     [Op.like]: 'solde ouverture%',
//   });

//   const [openingCredit, openingDebit] = await Promise.all([
//     sumField('credit', {
//       date: { [Op.gte]: startOfYear, [Op.lt]: startOfNextYear },
//       [Op.and]: [openingNameClause],
//     }),
//     sumField('debit', {
//       date: { [Op.gte]: startOfYear, [Op.lt]: startOfNextYear },
//       [Op.and]: [openingNameClause],
//     }),
//   ]);

//   return (openingCredit || 0) - (openingDebit || 0);
// }

// // =============================
// // Échéances helpers (sans balance)
// // sign='positive' => clients : SUM(credit) - SUM(debit)
// // sign='negative' => fournisseurs : SUM(debit) - SUM(credit)
// // =============================
// function netExpr(sign) {
//   return sign === 'positive'
//     ? 'SUM(credit) - SUM(debit)'
//     : 'SUM(debit) - SUM(credit)';
// }

// async function getEcheancePartnerDetailsRange({
//   sign,
//   fromDateOnly,
//   toDateOnly,
//   limit = 10,
//   nomDuComptePrefixes = null,
//   asOf = null,
// }) {
//   const expr = netExpr(sign);

//   const where = {
//     echeance: { [Op.not]: null, [Op.gte]: fromDateOnly, [Op.lt]: toDateOnly },
//     partner: { [Op.not]: null, [Op.ne]: '' },
//     ...buildPrefixWhere(nomDuComptePrefixes),
//   };

//   if (asOf) where.date = { [Op.lte]: asOf };

//   const rows = await LedgerEntry.findAll({
//     attributes: [
//       'partner',
//       [literal(expr), 'net'],
//       [fn('MIN', col('echeance')), 'prochaineEcheance'],
//       [fn('COUNT', col('id')), 'nb'],
//     ],
//     where,
//     group: ['partner'],
//     having: literal(`${expr} > 0`),
//     order: [[literal('prochaineEcheance'), 'ASC']],
//     limit,
//   });

//   return rows.map((r) => ({
//     partner: r.get('partner'),
//     montant: Number(r.get('net') || 0),
//     prochaineEcheance: r.get('prochaineEcheance'),
//     nb: Number(r.get('nb') || 0),
//   }));
// }

// async function getEcheancePartnerDetailsRetard({
//   sign,
//   todayDateOnly,
//   limit = 10,
//   nomDuComptePrefixes = null,
//   asOf = null,
// }) {
//   const expr = netExpr(sign);

//   const where = {
//     echeance: { [Op.not]: null, [Op.lt]: todayDateOnly },
//     partner: { [Op.not]: null, [Op.ne]: '' },
//     ...buildPrefixWhere(nomDuComptePrefixes),
//   };

//   if (asOf) where.date = { [Op.lte]: asOf };

//   const rows = await LedgerEntry.findAll({
//     attributes: [
//       'partner',
//       [literal(expr), 'net'],
//       [fn('MIN', col('echeance')), 'prochaineEcheance'],
//       [fn('COUNT', col('id')), 'nb'],
//     ],
//     where,
//     group: ['partner'],
//     having: literal(`${expr} > 0`),
//     order: [[literal('prochaineEcheance'), 'ASC']],
//     limit,
//   });

//   return rows.map((r) => ({
//     partner: r.get('partner'),
//     montant: Number(r.get('net') || 0),
//     prochaineEcheance: r.get('prochaineEcheance'),
//     nb: Number(r.get('nb') || 0),
//   }));
// }

// async function getRetardSummary({
//   sign,
//   todayDateOnly,
//   limitTop = 8,
//   nomDuComptePrefixes = null,
//   asOf = null,
// }) {
//   const expr = netExpr(sign);

//   const where = {
//     echeance: { [Op.not]: null, [Op.lt]: todayDateOnly },
//     partner: { [Op.not]: null, [Op.ne]: '' },
//     ...buildPrefixWhere(nomDuComptePrefixes),
//   };

//   if (asOf) where.date = { [Op.lte]: asOf };

//   // Count distinct + oldestDate (via group list)
//   const partnerRows = await LedgerEntry.findAll({
//     attributes: ['partner', [fn('MIN', col('echeance')), 'oldest']],
//     where,
//     group: ['partner'],
//     having: literal(`${expr} > 0`),
//   });

//   const count = partnerRows.length;
//   let oldestDate = null;
//   for (const r of partnerRows) {
//     const d = r.get('oldest');
//     if (d && (!oldestDate || new Date(d) < new Date(oldestDate))) oldestDate = d;
//   }

//   // Top
//   const topRows = await LedgerEntry.findAll({
//     attributes: [
//       'partner',
//       [literal(expr), 'net'],
//       [fn('MIN', col('echeance')), 'oldest'],
//       [fn('COUNT', col('id')), 'nb'],
//     ],
//     where,
//     group: ['partner'],
//     having: literal(`${expr} > 0`),
//     order: [[literal('net'), 'DESC']],
//     limit: limitTop,
//   });

//   const top = topRows.map((r) => ({
//     partner: r.get('partner'),
//     montant: Number(r.get('net') || 0),
//     date: r.get('oldest') || null,
//     nb: Number(r.get('nb') || 0),
//   }));

//   return { count, oldestDate, top };
// }

// // =============================
// // Controller principal
// // =============================
// async function getDashboard(req, res) {
//   try {
//     const now = new Date();
//     const { year, monthIndex } = parsePeriode(req);

//     const startOfMonth = new Date(year, monthIndex, 1);
//     const startOfNextMonth = new Date(year, monthIndex + 1, 1);
//     const startOfPrevMonth = new Date(year, monthIndex - 1, 1);
//     const startOfYear = new Date(year, 0, 1);

//     const isCurrentMonth = year === now.getFullYear() && monthIndex === now.getMonth();
//     const asOf = isCurrentMonth ? now : startOfNextMonth;

//     // date de référence échéances : aujourd’hui si mois courant sinon fin du mois filtré
//     const refDate = isCurrentMonth ? now : new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
//     const refDateOnly = toDateOnlyLocal(refDate);

//     // fenêtres échéances basées sur refDate
//     const in7End = new Date(refDate);
//     in7End.setDate(in7End.getDate() + 8);
//     const in30End = new Date(refDate);
//     in30End.setDate(in30End.getDate() + 31);

//     const in7EndDateOnly = toDateOnlyLocal(in7End);
//     const in30EndDateOnly = toDateOnlyLocal(in30End);

//     const refLastMonth = shiftOneMonthBack(refDate);
//     const lastMonthSameDayDateOnly = toDateOnlyLocal(refLastMonth);

//     const partnerWhere = { partner: { [Op.not]: null, [Op.ne]: '' } };
//     const caFilter = buildPrefixWhere(CA_PREFIXES);
//     const chargeFilter = buildPrefixWhere(CHARGE_PREFIXES);

//     // =============================
//     // KPI principaux (sans balance)
//     // =============================
//     const soldeOuverture = await getSoldeOuvertureForYear(year);

//     const [caMois, caMoisPrec, chargesMois, sumCaYTD, sumChargesYTD] = await Promise.all([
//       // CA mois = SUM(credit VTE/PRE)
//       sumField('credit', {
//         date: { [Op.gte]: startOfMonth, [Op.lt]: asOf },
//         ...caFilter,
//       }),
//       // CA mois précédent
//       sumField('credit', {
//         date: { [Op.gte]: startOfPrevMonth, [Op.lt]: startOfMonth },
//         ...caFilter,
//       }),
//       // Charges mois = SUM(debit ACH)
//       sumField('debit', {
//         date: { [Op.gte]: startOfMonth, [Op.lt]: asOf },
//         ...chargeFilter,
//       }),
//       // CA YTD
//       sumField('credit', {
//         date: { [Op.gte]: startOfYear, [Op.lt]: asOf },
//         ...caFilter,
//       }),
//       // Charges YTD
//       sumField('debit', {
//         date: { [Op.gte]: startOfYear, [Op.lt]: asOf },
//         ...chargeFilter,
//       }),
//     ]);

//     const encaissements = Number(caMois || 0);
//     const decaissements = Number(chargesMois || 0);

//     // cash = ouverture + YTD(CA) - YTD(charges)
//     const cashDisponible =
//       Number(soldeOuverture || 0) + Number(sumCaYTD || 0) - Number(sumChargesYTD || 0);

//     const totalChargesMois = Number(chargesMois || 0);
//     const resultatBrut = Number(caMois || 0) - totalChargesMois;

//     // solde du mois = enc - dec
//     const soldeMois = encaissements - decaissements;

//     // =============================
//     // Charges principales (camembert) : ACH debit par partner
//     // =============================
//     const MAX_PIE = 4;

//     const chargesBrutes = await LedgerEntry.findAll({
//       attributes: ['partner', [fn('SUM', col('debit')), 'total']],
//       where: {
//         debit: { [Op.gt]: 0 },
//         ...partnerWhere,
//         date: { [Op.gte]: startOfMonth, [Op.lt]: asOf },
//         ...chargeFilter, // ACH/
//       },
//       group: ['partner'],
//       order: [[literal('total'), 'DESC']],
//       limit: 12,
//     });

//     const chargesAll = chargesBrutes.map((row) => ({
//       label: row.get('partner') || 'Fournisseur',
//       montant: Number(row.get('total') || 0),
//     }));

//     const chargesTop = chargesAll.slice(0, MAX_PIE);
//     const autres = chargesAll.slice(MAX_PIE).reduce((s, x) => s + (x.montant || 0), 0);
//     const chargesPrincipales =
//       autres > 0 ? [...chargesTop, { label: 'Autres', montant: autres }] : chargesTop;

//     // =============================
//     // Historique CA (6 mois)
//     // =============================
//     const histPromises = [];
//     for (let i = 5; i >= 0; i--) {
//       const dStart = new Date(year, monthIndex - i, 1);
//       let dEnd = new Date(year, monthIndex - i + 1, 1);

//       // mois courant: on coupe à asOf
//       if (i === 0 && isCurrentMonth && dEnd > asOf) dEnd = asOf;

//       histPromises.push(
//         sumField('credit', {
//           date: { [Op.gte]: dStart, [Op.lt]: dEnd },
//           ...caFilter,
//         })
//       );
//     }

//     const histValues = await Promise.all(histPromises);
//     const caHistorique = histValues.map((val, idx) => {
//       const i = 5 - idx;
//       return { mois: i === 0 ? 'M' : `M-${i}`, valeur: Number(val || 0) };
//     });

//     // =============================
//     // Échéances
//     // =============================
//     const [
//       // Clients
//       clientsRetardCredit,
//       clientsRetardDebit,
//       clientsA7Credit,
//       clientsA7Debit,
//       clientsA30Credit,
//       clientsA30Debit,

//       // Fournisseurs
//       fournRetardDebit,
//       fournRetardCredit,
//       fournA7Debit,
//       fournA7Credit,
//       fournA30Debit,
//       fournA30Credit,

//       // Counts
//       nbClientsRetard,
//       nbClientsA7j,
//       nbClientsA30j,
//       nbFournisseursRetard,
//       nbFournisseursA7j,
//       nbFournisseursA30j,

//       // Tendances
//       clientsRetardLMCredit,
//       clientsRetardLMDebit,
//       fournRetardLMDebit,
//       fournRetardLMCredit,
//     ] = await Promise.all([
//       // Clients retard
//       sumField('credit', {
//         ...caFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
//       }),
//       sumField('debit', {
//         ...caFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
//       }),

//       // Clients à 7j
//       sumField('credit', {
//         ...caFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
//       }),
//       sumField('debit', {
//         ...caFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
//       }),

//       // Clients à 30j
//       sumField('credit', {
//         ...caFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
//       }),
//       sumField('debit', {
//         ...caFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
//       }),

//       // Fournisseurs retard
//       sumField('debit', {
//         ...chargeFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
//       }),
//       sumField('credit', {
//         ...chargeFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
//       }),

//       // Fournisseurs à 7j
//       sumField('debit', {
//         ...chargeFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
//       }),
//       sumField('credit', {
//         ...chargeFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
//       }),

//       // Fournisseurs à 30j
//       sumField('debit', {
//         ...chargeFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
//       }),
//       sumField('credit', {
//         ...chargeFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: asOf },
//         echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
//       }),

//       // Counts clients
//       LedgerEntry.count({
//         where: {
//           ...caFilter,
//           ...partnerWhere,
//           credit: { [Op.gt]: 0 },
//           date: { [Op.lte]: asOf },
//           echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
//         },
//       }),
//       LedgerEntry.count({
//         where: {
//           ...caFilter,
//           ...partnerWhere,
//           credit: { [Op.gt]: 0 },
//           date: { [Op.lte]: asOf },
//           echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
//         },
//       }),
//       LedgerEntry.count({
//         where: {
//           ...caFilter,
//           ...partnerWhere,
//           credit: { [Op.gt]: 0 },
//           date: { [Op.lte]: asOf },
//           echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
//         },
//       }),

//       // Counts fournisseurs
//       LedgerEntry.count({
//         where: {
//           ...chargeFilter,
//           ...partnerWhere,
//           debit: { [Op.gt]: 0 },
//           date: { [Op.lte]: asOf },
//           echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
//         },
//       }),
//       LedgerEntry.count({
//         where: {
//           ...chargeFilter,
//           ...partnerWhere,
//           debit: { [Op.gt]: 0 },
//           date: { [Op.lte]: asOf },
//           echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
//         },
//       }),
//       LedgerEntry.count({
//         where: {
//           ...chargeFilter,
//           ...partnerWhere,
//           debit: { [Op.gt]: 0 },
//           date: { [Op.lte]: asOf },
//           echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
//         },
//       }),

//       // Tendances clients (mois-1 même jour)
//       sumField('credit', {
//         ...caFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: refLastMonth },
//         echeance: { [Op.not]: null, [Op.lt]: lastMonthSameDayDateOnly },
//       }),
//       sumField('debit', {
//         ...caFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: refLastMonth },
//         echeance: { [Op.not]: null, [Op.lt]: lastMonthSameDayDateOnly },
//       }),

//       // Tendances fournisseurs (mois-1 même jour)
//       sumField('debit', {
//         ...chargeFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: refLastMonth },
//         echeance: { [Op.not]: null, [Op.lt]: lastMonthSameDayDateOnly },
//       }),
//       sumField('credit', {
//         ...chargeFilter,
//         ...partnerWhere,
//         date: { [Op.lte]: refLastMonth },
//         echeance: { [Op.not]: null, [Op.lt]: lastMonthSameDayDateOnly },
//       }),
//     ]);

//     const clientsRetard = Math.max(0, (clientsRetardCredit || 0) - (clientsRetardDebit || 0));
//     const clientsA7j = Math.max(0, (clientsA7Credit || 0) - (clientsA7Debit || 0));
//     const clientsA30j = Math.max(0, (clientsA30Credit || 0) - (clientsA30Debit || 0));

//     const fournisseursRetard = Math.max(0, (fournRetardDebit || 0) - (fournRetardCredit || 0));
//     const fournisseursA7j = Math.max(0, (fournA7Debit || 0) - (fournA7Credit || 0));
//     const fournisseursA30j = Math.max(0, (fournA30Debit || 0) - (fournA30Credit || 0));

//     const clientsRetardLM = Math.max(0, (clientsRetardLMCredit || 0) - (clientsRetardLMDebit || 0));
//     const fournisseursRetardLM = Math.max(0, (fournRetardLMDebit || 0) - (fournRetardLMCredit || 0));

//     const clientsRetardTrend = trend(clientsRetard, clientsRetardLM);
//     const fournisseursRetardTrend = trend(fournisseursRetard, fournisseursRetardLM);

//     // =============================
//     // Détails partenaires
//     // =============================
//     const [clientsDetails, fournisseursDetails] = await Promise.all([
//       Promise.all([
//         getEcheancePartnerDetailsRetard({
//           sign: 'positive',
//           todayDateOnly: refDateOnly,
//           limit: 10,
//           nomDuComptePrefixes: CA_PREFIXES,
//           asOf,
//         }),
//         getEcheancePartnerDetailsRange({
//           sign: 'positive',
//           fromDateOnly: refDateOnly,
//           toDateOnly: in7EndDateOnly,
//           limit: 10,
//           nomDuComptePrefixes: CA_PREFIXES,
//           asOf,
//         }),
//         getEcheancePartnerDetailsRange({
//           sign: 'positive',
//           fromDateOnly: refDateOnly,
//           toDateOnly: in30EndDateOnly,
//           limit: 10,
//           nomDuComptePrefixes: CA_PREFIXES,
//           asOf,
//         }),
//       ]).then(([retard, a7j, a30j]) => ({ retard, a7j, a30j })),

//       Promise.all([
//         getEcheancePartnerDetailsRetard({
//           sign: 'negative',
//           todayDateOnly: refDateOnly,
//           limit: 10,
//           nomDuComptePrefixes: CHARGE_PREFIXES,
//           asOf,
//         }),
//         getEcheancePartnerDetailsRange({
//           sign: 'negative',
//           fromDateOnly: refDateOnly,
//           toDateOnly: in7EndDateOnly,
//           limit: 10,
//           nomDuComptePrefixes: CHARGE_PREFIXES,
//           asOf,
//         }),
//         getEcheancePartnerDetailsRange({
//           sign: 'negative',
//           fromDateOnly: refDateOnly,
//           toDateOnly: in30EndDateOnly,
//           limit: 10,
//           nomDuComptePrefixes: CHARGE_PREFIXES,
//           asOf,
//         }),
//       ]).then(([retard, a7j, a30j]) => ({ retard, a7j, a30j })),
//     ]);

//     // =============================
//     // Résumé retard (top/count/oldestDate)
//     // =============================
//     const [clientsRetardSummary, fournisseursRetardSummary] = await Promise.all([
//       getRetardSummary({
//         sign: 'positive',
//         todayDateOnly: refDateOnly,
//         limitTop: 8,
//         nomDuComptePrefixes: CA_PREFIXES,
//         asOf,
//       }),
//       getRetardSummary({
//         sign: 'negative',
//         todayDateOnly: refDateOnly,
//         limitTop: 8,
//         nomDuComptePrefixes: CHARGE_PREFIXES,
//         asOf,
//       }),
//     ]);

//     // =============================
//     // Alertes
//     // =============================
//     const alerts = [];

//     if (soldeMois <= -5000) {
//       alerts.push({
//         level: 'red',
//         code: 'SOLDE_MOIS_CRIT',
//         title: 'Solde du mois critique',
//         message: 'Les décaissements dépassent fortement les encaissements.',
//       });
//     } else if (soldeMois < 0) {
//       alerts.push({
//         level: 'orange',
//         code: 'SOLDE_MOIS_NEG',
//         title: 'Solde du mois négatif',
//         message: 'Les décaissements sont supérieurs aux encaissements.',
//       });
//     }

//     if (Number(cashDisponible || 0) < 0) {
//       alerts.push({
//         level: 'red',
//         code: 'CASH_NEG',
//         title: 'Cash estimé négative',
//         message: 'Votre Cash estimé est inférieur à 0.',
//       });
//     }

//     if (Number(resultatBrut || 0) < 0) {
//       alerts.push({
//         level: 'red',
//         code: 'RESULTAT_NEG',
//         title: 'Résultat brut négatif',
//         message: 'Vos charges dépassent votre chiffre d’affaires ce mois-ci.',
//       });
//     }

//     if (Number(clientsRetard || 0) > 0) {
//       alerts.push({
//         level: 'red',
//         code: 'CLIENTS_RETARD',
//         title: 'Clients en retard',
//         message: 'Des encaissements sont en retard : relances recommandées.',
//       });
//     }

//     if (Number(fournisseursRetard || 0) > 0) {
//       alerts.push({
//         level: 'orange',
//         code: 'FOURNISSEURS_RETARD',
//         title: 'Fournisseurs à payer',
//         message: 'Des paiements sont en retard ou à régulariser.',
//       });
//     }

//     // ✅ AJOUT : alerte verte si aucune alerte rouge/orange
//     // (n'affecte pas la logique existante, on ajoute juste un "OK" de synthèse)
//     const hasProblem = alerts.some((a) => a.level === 'red' || a.level === 'orange');
//     if (!hasProblem) {
//       alerts.push({
//         level: 'green',
//         code: 'ALL_GOOD',
//         title: 'Situation OK',
//         message: 'Aucune anomalie détectée sur la période.',
//       });
//     }

//     // =============================
//     // Réponse finale
//     // =============================
//     return res.json({
//       periode: { year, month: monthIndex + 1 },

//       caMois,
//       caMoisPrec,

//       encaissements,
//       decaissements,
//       soldeMois,

//       cashDisponible,

//       totalChargesMois,
//       chargesPrincipales,

//       caHistorique,
//       resultatBrut,

//       echeances: {
//         clients: {
//           retard: clientsRetard,
//           a7j: clientsA7j,
//           a30j: clientsA30j,

//           nbRetard: Number(nbClientsRetard || 0),
//           nbA7j: Number(nbClientsA7j || 0),
//           nbA30j: Number(nbClientsA30j || 0),

//           retardTrend: clientsRetardTrend,

//           count: Number(clientsRetardSummary.count || 0),
//           oldestDate: clientsRetardSummary.oldestDate || null,
//           top: Array.isArray(clientsRetardSummary.top) ? clientsRetardSummary.top : [],

//           details: clientsDetails || { retard: [], a7j: [], a30j: [] },
//         },
//         fournisseurs: {
//           retard: fournisseursRetard,
//           a7j: fournisseursA7j,
//           a30j: fournisseursA30j,

//           nbRetard: Number(nbFournisseursRetard || 0),
//           nbA7j: Number(nbFournisseursA7j || 0),
//           nbA30j: Number(nbFournisseursA30j || 0),

//           retardTrend: fournisseursRetardTrend,

//           count: Number(fournisseursRetardSummary.count || 0),
//           oldestDate: fournisseursRetardSummary.oldestDate || null,
//           top: Array.isArray(fournisseursRetardSummary.top) ? fournisseursRetardSummary.top : [],

//           details: fournisseursDetails || { retard: [], a7j: [], a30j: [] },
//         },
//       },

//       alerts,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Erreur lors du calcul des KPI dashboard' });
//   }
// }

// module.exports = { getDashboard };


// controllers/DashboardController.js
const { Op, fn, col, literal, where: sqlWhere } = require('sequelize');
const { LedgerEntry } = require('../models/LedgerEntryModel');

// =============================
// CONFIG
// =============================
const CA_PREFIXES = ['VTE/', 'PRE/']; // CA = somme des credits sur VTE/PRE
const CHARGE_PREFIXES = ['ACH/'];     // Charges = somme des debits sur ACH

function buildPrefixWhere(prefixes) {
  if (!Array.isArray(prefixes) || prefixes.length === 0) return {};
  return {
    [Op.or]: prefixes.map((p) => ({
      nomDuCompte: { [Op.like]: `${p}%` },
    })),
  };
}

async function sumField(field, where) {
  const raw = await LedgerEntry.sum(field, { where });
  return Number(raw || 0);
}

// =============================
// Helpers dates / tendances
// =============================
function toDateOnlyLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shiftOneMonthBack(d) {
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  const lastDayPrevMonth = new Date(y, m, 0).getDate();
  return new Date(y, m - 1, Math.min(day, lastDayPrevMonth));
}

function trend(cur, prev) {
  const c = Number(cur || 0);
  const p = Number(prev || 0);
  const delta = c - p;
  const pct = p !== 0 ? (delta / Math.abs(p)) * 100 : (c > 0 ? 100 : 0);
  return { delta, pct, direction: delta >= 0 ? 'up' : 'down' };
}

function parsePeriode(req) {
  const now = new Date();

  const mode = String(req.query.mode || 'month').toLowerCase(); // 'month' | 'global'
  const qYear = Number.parseInt(req.query.year, 10);
  const qMonth = Number.parseInt(req.query.month, 10);

  const year = Number.isFinite(qYear) ? qYear : now.getFullYear();

  let monthIndex = now.getMonth();
  if (Number.isFinite(qMonth)) {
    if (qMonth >= 1 && qMonth <= 12) monthIndex = qMonth - 1;
    else if (qMonth >= 0 && qMonth <= 11) monthIndex = qMonth;
  }

  return { year, monthIndex, mode };
}

// =============================
// Solde ouverture (comme TresorerieController)
// =============================
async function getSoldeOuvertureForYear(year) {
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const openingNameClause = sqlWhere(fn('LOWER', col('nomDuCompte')), {
    [Op.like]: 'solde ouverture%',
  });

  const [openingCredit, openingDebit] = await Promise.all([
    sumField('credit', {
      date: { [Op.gte]: startOfYear, [Op.lt]: startOfNextYear },
      [Op.and]: [openingNameClause],
    }),
    sumField('debit', {
      date: { [Op.gte]: startOfYear, [Op.lt]: startOfNextYear },
      [Op.and]: [openingNameClause],
    }),
  ]);

  return (openingCredit || 0) - (openingDebit || 0);
}

// =============================
// Échéances helpers (sans balance)
// sign='positive' => clients : SUM(credit) - SUM(debit)
// sign='negative' => fournisseurs : SUM(debit) - SUM(credit)
// =============================
function netExpr(sign) {
  return sign === 'positive'
    ? 'SUM(credit) - SUM(debit)'
    : 'SUM(debit) - SUM(credit)';
}

async function getEcheancePartnerDetailsRange({
  sign,
  fromDateOnly,
  toDateOnly,
  limit = 10,
  nomDuComptePrefixes = null,
  asOf = null,
}) {
  const expr = netExpr(sign);

  const where = {
    echeance: { [Op.not]: null, [Op.gte]: fromDateOnly, [Op.lt]: toDateOnly },
    partner: { [Op.not]: null, [Op.ne]: '' },
    ...buildPrefixWhere(nomDuComptePrefixes),
  };

  if (asOf) where.date = { [Op.lte]: asOf };

  const rows = await LedgerEntry.findAll({
    attributes: [
      'partner',
      [literal(expr), 'net'],
      [fn('MIN', col('echeance')), 'prochaineEcheance'],
      [fn('COUNT', col('id')), 'nb'],
    ],
    where,
    group: ['partner'],
    having: literal(`${expr} > 0`),
    order: [[literal('prochaineEcheance'), 'ASC']],
    limit,
  });

  return rows.map((r) => ({
    partner: r.get('partner'),
    montant: Number(r.get('net') || 0),
    prochaineEcheance: r.get('prochaineEcheance'),
    nb: Number(r.get('nb') || 0),
  }));
}

async function getEcheancePartnerDetailsRetard({
  sign,
  todayDateOnly,
  limit = 10,
  nomDuComptePrefixes = null,
  asOf = null,
}) {
  const expr = netExpr(sign);

  const where = {
    echeance: { [Op.not]: null, [Op.lt]: todayDateOnly },
    partner: { [Op.not]: null, [Op.ne]: '' },
    ...buildPrefixWhere(nomDuComptePrefixes),
  };

  if (asOf) where.date = { [Op.lte]: asOf };

  const rows = await LedgerEntry.findAll({
    attributes: [
      'partner',
      [literal(expr), 'net'],
      [fn('MIN', col('echeance')), 'prochaineEcheance'],
      [fn('COUNT', col('id')), 'nb'],
    ],
    where,
    group: ['partner'],
    having: literal(`${expr} > 0`),
    order: [[literal('prochaineEcheance'), 'ASC']],
    limit,
  });

  return rows.map((r) => ({
    partner: r.get('partner'),
    montant: Number(r.get('net') || 0),
    prochaineEcheance: r.get('prochaineEcheance'),
    nb: Number(r.get('nb') || 0),
  }));
}

async function getRetardSummary({
  sign,
  todayDateOnly,
  limitTop = 8,
  nomDuComptePrefixes = null,
  asOf = null,
}) {
  const expr = netExpr(sign);

  const where = {
    echeance: { [Op.not]: null, [Op.lt]: todayDateOnly },
    partner: { [Op.not]: null, [Op.ne]: '' },
    ...buildPrefixWhere(nomDuComptePrefixes),
  };

  if (asOf) where.date = { [Op.lte]: asOf };

  const partnerRows = await LedgerEntry.findAll({
    attributes: ['partner', [fn('MIN', col('echeance')), 'oldest']],
    where,
    group: ['partner'],
    having: literal(`${expr} > 0`),
  });

  const count = partnerRows.length;
  let oldestDate = null;
  for (const r of partnerRows) {
    const d = r.get('oldest');
    if (d && (!oldestDate || new Date(d) < new Date(oldestDate))) oldestDate = d;
  }

  const topRows = await LedgerEntry.findAll({
    attributes: [
      'partner',
      [literal(expr), 'net'],
      [fn('MIN', col('echeance')), 'oldest'],
      [fn('COUNT', col('id')), 'nb'],
    ],
    where,
    group: ['partner'],
    having: literal(`${expr} > 0`),
    order: [[literal('net'), 'DESC']],
    limit: limitTop,
  });

  const top = topRows.map((r) => ({
    partner: r.get('partner'),
    montant: Number(r.get('net') || 0),
    date: r.get('oldest') || null,
    nb: Number(r.get('nb') || 0),
  }));

  return { count, oldestDate, top };
}

// =============================
// Controller principal
// =============================
async function getDashboard(req, res) {
  try {
    const now = new Date();
    const { year, monthIndex, mode } = parsePeriode(req);
    const isGlobal = mode === 'global';

    // --- Périodes “month” (comme avant)
    const startOfMonth = new Date(year, monthIndex, 1);
    const startOfNextMonth = new Date(year, monthIndex + 1, 1);
    const startOfPrevMonth = new Date(year, monthIndex - 1, 1);
    const startOfYear = new Date(year, 0, 1);

    // --- Périodes “global”
    let globalStartOfYear = null;   // début d’année du plus ancien enregistrement
    let globalAsOf = now;

    if (isGlobal) {
      const minDateRaw = await LedgerEntry.min('date');
      const minDate = minDateRaw ? new Date(minDateRaw) : new Date(now.getFullYear(), 0, 1);
      globalStartOfYear = new Date(minDate.getFullYear(), 0, 1);
      globalAsOf = now;
    }

    // asOf / isCurrentMonth (pour mois courant)
    const isCurrentMonth = !isGlobal && year === now.getFullYear() && monthIndex === now.getMonth();
    const asOf = isGlobal ? globalAsOf : (isCurrentMonth ? now : startOfNextMonth);

    // Fenêtre principale (période)
    const rangeStart = isGlobal ? globalStartOfYear : startOfMonth;

    // date de référence échéances : aujourd’hui si mois courant sinon fin du mois filtré
    const refDate = isGlobal ? now : (isCurrentMonth ? now : new Date(year, monthIndex + 1, 0, 23, 59, 59, 999));
    const refDateOnly = toDateOnlyLocal(refDate);

    // fenêtres échéances basées sur refDate
    const in7End = new Date(refDate);
    in7End.setDate(in7End.getDate() + 8);
    const in30End = new Date(refDate);
    in30End.setDate(in30End.getDate() + 31);

    const in7EndDateOnly = toDateOnlyLocal(in7End);
    const in30EndDateOnly = toDateOnlyLocal(in30End);

    const refLastMonth = shiftOneMonthBack(refDate);
    const lastMonthSameDayDateOnly = toDateOnlyLocal(refLastMonth);

    const partnerWhere = { partner: { [Op.not]: null, [Op.ne]: '' } };
    const caFilter = buildPrefixWhere(CA_PREFIXES);
    const chargeFilter = buildPrefixWhere(CHARGE_PREFIXES);

    // =============================
    // KPI principaux
    // =============================
    // solde ouverture (année)
    // month: année sélectionnée
    // global: année du plus ancien enregistrement
    const openingYear = isGlobal ? globalStartOfYear.getFullYear() : year;
    const soldeOuverture = await getSoldeOuvertureForYear(openingYear);

    const [caMois, caMoisPrec, chargesMois, sumCaYTD, sumChargesYTD] = await Promise.all([
      // CA période
      sumField('credit', {
        date: { [Op.gte]: rangeStart, [Op.lt]: asOf },
        ...caFilter,
      }),

      // CA “précédent”:
      // month: mois-1 (comme avant)
      // global: 30 jours précédents (pour garder une tendance utile)
      isGlobal
        ? sumField('credit', {
            date: { [Op.gte]: new Date(now.getTime() - 60 * 24 * 3600 * 1000), [Op.lt]: new Date(now.getTime() - 30 * 24 * 3600 * 1000) },
            ...caFilter,
          })
        : sumField('credit', {
            date: { [Op.gte]: startOfPrevMonth, [Op.lt]: startOfMonth },
            ...caFilter,
          }),

      // Charges période
      sumField('debit', {
        date: { [Op.gte]: rangeStart, [Op.lt]: asOf },
        ...chargeFilter,
      }),

      // CA YTD:
      // month: startOfYear
      // global: rangeStart (donc global depuis l’année du premier enregistrement)
      sumField('credit', {
        date: { [Op.gte]: (isGlobal ? rangeStart : startOfYear), [Op.lt]: asOf },
        ...caFilter,
      }),

      // Charges YTD
      sumField('debit', {
        date: { [Op.gte]: (isGlobal ? rangeStart : startOfYear), [Op.lt]: asOf },
        ...chargeFilter,
      }),
    ]);

    const encaissements = Number(caMois || 0);
    const decaissements = Number(chargesMois || 0);

    // cash = ouverture + (CA) - (charges)
    const cashDisponible =
      Number(soldeOuverture || 0) + Number(sumCaYTD || 0) - Number(sumChargesYTD || 0);

    const totalChargesMois = Number(chargesMois || 0);
    const resultatBrut = Number(caMois || 0) - totalChargesMois;

    // solde période = enc - dec
    const soldeMois = encaissements - decaissements;

    // =============================
    // Charges principales (camembert)
    // =============================
    const MAX_PIE = 4;

    const chargesBrutes = await LedgerEntry.findAll({
      attributes: ['partner', [fn('SUM', col('debit')), 'total']],
      where: {
        debit: { [Op.gt]: 0 },
        ...partnerWhere,
        date: { [Op.gte]: rangeStart, [Op.lt]: asOf },
        ...chargeFilter, // ACH/
      },
      group: ['partner'],
      order: [[literal('total'), 'DESC']],
      limit: 12,
    });

    const chargesAll = chargesBrutes.map((row) => ({
      label: row.get('partner') || 'Fournisseur',
      montant: Number(row.get('total') || 0),
    }));

    const chargesTop = chargesAll.slice(0, MAX_PIE);
    const autres = chargesAll.slice(MAX_PIE).reduce((s, x) => s + (x.montant || 0), 0);
    const chargesPrincipales =
      autres > 0 ? [...chargesTop, { label: 'Autres', montant: autres }] : chargesTop;

    // =============================
    // Historique CA (6 mois)
    // - month: autour du mois filtré
    // - global: derniers 6 mois par rapport à aujourd’hui
    // =============================
    const histPromises = [];
    const baseYear = isGlobal ? now.getFullYear() : year;
    const baseMonthIndex = isGlobal ? now.getMonth() : monthIndex;

    for (let i = 5; i >= 0; i--) {
      const dStart = new Date(baseYear, baseMonthIndex - i, 1);
      let dEnd = new Date(baseYear, baseMonthIndex - i + 1, 1);

      // mois courant: on coupe à asOf si c’est le mois courant de référence
      if (i === 0 && (isGlobal || (year === now.getFullYear() && monthIndex === now.getMonth())) && dEnd > asOf) {
        dEnd = asOf;
      }

      histPromises.push(
        sumField('credit', {
          date: { [Op.gte]: dStart, [Op.lt]: dEnd },
          ...caFilter,
        })
      );
    }

    const histValues = await Promise.all(histPromises);
    const caHistorique = histValues.map((val, idx) => {
      const i = 5 - idx;
      return { mois: i === 0 ? 'M' : `M-${i}`, valeur: Number(val || 0) };
    });

    // =============================
    // Échéances (sans balance) — inchangé
    // =============================
    const [
      // Clients
      clientsRetardCredit,
      clientsRetardDebit,
      clientsA7Credit,
      clientsA7Debit,
      clientsA30Credit,
      clientsA30Debit,

      // Fournisseurs
      fournRetardDebit,
      fournRetardCredit,
      fournA7Debit,
      fournA7Credit,
      fournA30Debit,
      fournA30Credit,

      // Counts
      nbClientsRetard,
      nbClientsA7j,
      nbClientsA30j,
      nbFournisseursRetard,
      nbFournisseursA7j,
      nbFournisseursA30j,

      // Tendances
      clientsRetardLMCredit,
      clientsRetardLMDebit,
      fournRetardLMDebit,
      fournRetardLMCredit,
    ] = await Promise.all([
      // Clients retard
      sumField('credit', {
        ...caFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
      }),
      sumField('debit', {
        ...caFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
      }),

      // Clients à 7j
      sumField('credit', {
        ...caFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
      }),
      sumField('debit', {
        ...caFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
      }),

      // Clients à 30j
      sumField('credit', {
        ...caFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
      }),
      sumField('debit', {
        ...caFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
      }),

      // Fournisseurs retard
      sumField('debit', {
        ...chargeFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
      }),
      sumField('credit', {
        ...chargeFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
      }),

      // Fournisseurs à 7j
      sumField('debit', {
        ...chargeFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
      }),
      sumField('credit', {
        ...chargeFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
      }),

      // Fournisseurs à 30j
      sumField('debit', {
        ...chargeFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
      }),
      sumField('credit', {
        ...chargeFilter,
        ...partnerWhere,
        date: { [Op.lte]: asOf },
        echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
      }),

      // Counts clients
      LedgerEntry.count({
        where: {
          ...caFilter,
          ...partnerWhere,
          credit: { [Op.gt]: 0 },
          date: { [Op.lte]: asOf },
          echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
        },
      }),
      LedgerEntry.count({
        where: {
          ...caFilter,
          ...partnerWhere,
          credit: { [Op.gt]: 0 },
          date: { [Op.lte]: asOf },
          echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
        },
      }),
      LedgerEntry.count({
        where: {
          ...caFilter,
          ...partnerWhere,
          credit: { [Op.gt]: 0 },
          date: { [Op.lte]: asOf },
          echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
        },
      }),

      // Counts fournisseurs
      LedgerEntry.count({
        where: {
          ...chargeFilter,
          ...partnerWhere,
          debit: { [Op.gt]: 0 },
          date: { [Op.lte]: asOf },
          echeance: { [Op.not]: null, [Op.lt]: refDateOnly },
        },
      }),
      LedgerEntry.count({
        where: {
          ...chargeFilter,
          ...partnerWhere,
          debit: { [Op.gt]: 0 },
          date: { [Op.lte]: asOf },
          echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in7EndDateOnly },
        },
      }),
      LedgerEntry.count({
        where: {
          ...chargeFilter,
          ...partnerWhere,
          debit: { [Op.gt]: 0 },
          date: { [Op.lte]: asOf },
          echeance: { [Op.not]: null, [Op.gte]: refDateOnly, [Op.lt]: in30EndDateOnly },
        },
      }),

      // Tendances clients (mois-1 même jour)
      sumField('credit', {
        ...caFilter,
        ...partnerWhere,
        date: { [Op.lte]: refLastMonth },
        echeance: { [Op.not]: null, [Op.lt]: lastMonthSameDayDateOnly },
      }),
      sumField('debit', {
        ...caFilter,
        ...partnerWhere,
        date: { [Op.lte]: refLastMonth },
        echeance: { [Op.not]: null, [Op.lt]: lastMonthSameDayDateOnly },
      }),

      // Tendances fournisseurs (mois-1 même jour)
      sumField('debit', {
        ...chargeFilter,
        ...partnerWhere,
        date: { [Op.lte]: refLastMonth },
        echeance: { [Op.not]: null, [Op.lt]: lastMonthSameDayDateOnly },
      }),
      sumField('credit', {
        ...chargeFilter,
        ...partnerWhere,
        date: { [Op.lte]: refLastMonth },
        echeance: { [Op.not]: null, [Op.lt]: lastMonthSameDayDateOnly },
      }),
    ]);

    const clientsRetard = Math.max(0, (clientsRetardCredit || 0) - (clientsRetardDebit || 0));
    const clientsA7j = Math.max(0, (clientsA7Credit || 0) - (clientsA7Debit || 0));
    const clientsA30j = Math.max(0, (clientsA30Credit || 0) - (clientsA30Debit || 0));

    const fournisseursRetard = Math.max(0, (fournRetardDebit || 0) - (fournRetardCredit || 0));
    const fournisseursA7j = Math.max(0, (fournA7Debit || 0) - (fournA7Credit || 0));
    const fournisseursA30j = Math.max(0, (fournA30Debit || 0) - (fournA30Credit || 0));

    const clientsRetardLM = Math.max(0, (clientsRetardLMCredit || 0) - (clientsRetardLMDebit || 0));
    const fournisseursRetardLM = Math.max(0, (fournRetardLMDebit || 0) - (fournRetardLMCredit || 0));

    const clientsRetardTrend = trend(clientsRetard, clientsRetardLM);
    const fournisseursRetardTrend = trend(fournisseursRetard, fournisseursRetardLM);

    // =============================
    // Détails partenaires
    // =============================
    const [clientsDetails, fournisseursDetails] = await Promise.all([
      Promise.all([
        getEcheancePartnerDetailsRetard({
          sign: 'positive',
          todayDateOnly: refDateOnly,
          limit: 10,
          nomDuComptePrefixes: CA_PREFIXES,
          asOf,
        }),
        getEcheancePartnerDetailsRange({
          sign: 'positive',
          fromDateOnly: refDateOnly,
          toDateOnly: in7EndDateOnly,
          limit: 10,
          nomDuComptePrefixes: CA_PREFIXES,
          asOf,
        }),
        getEcheancePartnerDetailsRange({
          sign: 'positive',
          fromDateOnly: refDateOnly,
          toDateOnly: in30EndDateOnly,
          limit: 10,
          nomDuComptePrefixes: CA_PREFIXES,
          asOf,
        }),
      ]).then(([retard, a7j, a30j]) => ({ retard, a7j, a30j })),

      Promise.all([
        getEcheancePartnerDetailsRetard({
          sign: 'negative',
          todayDateOnly: refDateOnly,
          limit: 10,
          nomDuComptePrefixes: CHARGE_PREFIXES,
          asOf,
        }),
        getEcheancePartnerDetailsRange({
          sign: 'negative',
          fromDateOnly: refDateOnly,
          toDateOnly: in7EndDateOnly,
          limit: 10,
          nomDuComptePrefixes: CHARGE_PREFIXES,
          asOf,
        }),
        getEcheancePartnerDetailsRange({
          sign: 'negative',
          fromDateOnly: refDateOnly,
          toDateOnly: in30EndDateOnly,
          limit: 10,
          nomDuComptePrefixes: CHARGE_PREFIXES,
          asOf,
        }),
      ]).then(([retard, a7j, a30j]) => ({ retard, a7j, a30j })),
    ]);

    // =============================
    // Résumé retard (top/count/oldestDate)
    // =============================
    const [clientsRetardSummary, fournisseursRetardSummary] = await Promise.all([
      getRetardSummary({
        sign: 'positive',
        todayDateOnly: refDateOnly,
        limitTop: 8,
        nomDuComptePrefixes: CA_PREFIXES,
        asOf,
      }),
      getRetardSummary({
        sign: 'negative',
        todayDateOnly: refDateOnly,
        limitTop: 8,
        nomDuComptePrefixes: CHARGE_PREFIXES,
        asOf,
      }),
    ]);

    // =============================
    // Alertes
    // =============================
    const alerts = [];

    if (soldeMois <= -5000) {
      alerts.push({
        level: 'red',
        code: 'SOLDE_MOIS_CRIT',
        title: 'Solde du mois critique',
        message: 'Les décaissements dépassent fortement les encaissements.',
      });
    } else if (soldeMois < 0) {
      alerts.push({
        level: 'orange',
        code: 'SOLDE_MOIS_NEG',
        title: 'Solde du mois négatif',
        message: 'Les décaissements sont supérieurs aux encaissements.',
      });
    }

    if (Number(cashDisponible || 0) < 0) {
      alerts.push({
        level: 'red',
        code: 'CASH_NEG',
        title: 'Cash estimé négative',
        message: 'Votre Cash estimé est inférieur à 0.',
      });
    }

    if (Number(resultatBrut || 0) < 0) {
      alerts.push({
        level: 'red',
        code: 'RESULTAT_NEG',
        title: 'Résultat brut négatif',
        message: 'Vos charges dépassent votre chiffre d’affaires ce mois-ci.',
      });
    }

    if (Number(clientsRetard || 0) > 0) {
      alerts.push({
        level: 'red',
        code: 'CLIENTS_RETARD',
        title: 'Clients en retard',
        message: 'Des encaissements sont en retard : relances recommandées.',
      });
    }

    if (Number(fournisseursRetard || 0) > 0) {
      alerts.push({
        level: 'orange',
        code: 'FOURNISSEURS_RETARD',
        title: 'Fournisseurs à payer',
        message: 'Des paiements sont en retard ou à régulariser.',
      });
    }

    // ✅ Alerte verte si aucune alerte
    if (alerts.length === 0) {
      alerts.push({
        level: 'green',
        code: 'OK',
        title: 'Situation OK',
        message: 'Aucune alerte détectée sur la période.',
      });
    }

    // =============================
    // Réponse finale
    // =============================
    return res.json({
      periode: {
        year: isGlobal ? now.getFullYear() : year,
        month: isGlobal ? (now.getMonth() + 1) : (monthIndex + 1),
        mode: isGlobal ? 'global' : 'month',
      },

      caMois,
      caMoisPrec,

      encaissements,
      decaissements,
      soldeMois,

      cashDisponible,

      totalChargesMois,
      chargesPrincipales,

      caHistorique,
      resultatBrut,

      echeances: {
        clients: {
          retard: clientsRetard,
          a7j: clientsA7j,
          a30j: clientsA30j,

          nbRetard: Number(nbClientsRetard || 0),
          nbA7j: Number(nbClientsA7j || 0),
          nbA30j: Number(nbClientsA30j || 0),

          retardTrend: clientsRetardTrend,

          count: Number(clientsRetardSummary.count || 0),
          oldestDate: clientsRetardSummary.oldestDate || null,
          top: Array.isArray(clientsRetardSummary.top) ? clientsRetardSummary.top : [],

          details: clientsDetails || { retard: [], a7j: [], a30j: [] },
        },
        fournisseurs: {
          retard: fournisseursRetard,
          a7j: fournisseursA7j,
          a30j: fournisseursA30j,

          nbRetard: Number(nbFournisseursRetard || 0),
          nbA7j: Number(nbFournisseursA7j || 0),
          nbA30j: Number(nbFournisseursA30j || 0),

          retardTrend: fournisseursRetardTrend,

          count: Number(fournisseursRetardSummary.count || 0),
          oldestDate: fournisseursRetardSummary.oldestDate || null,
          top: Array.isArray(fournisseursRetardSummary.top) ? fournisseursRetardSummary.top : [],

          details: fournisseursDetails || { retard: [], a7j: [], a30j: [] },
        },
      },

      alerts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors du calcul des KPI dashboard' });
  }
}

module.exports = { getDashboard };
