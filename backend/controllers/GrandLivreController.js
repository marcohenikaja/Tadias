// controllers/ImportGrandLivreController.js
const xlsx = require('xlsx');
const fs = require('fs');
const crypto = require('crypto');
const { LedgerEntry } = require('../models/LedgerEntryModel');
const { ImportBatch } = require('../models/ImportBatchModel'); // adapte selon ton projet

function excelSerialToDate(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const ms = excelEpoch.getTime() + Number(serial) * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

function parseExcelDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === 'number') {
    const d = excelSerialToDate(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return null;

    const [datePart] = s.split(' ');
    const m = datePart.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));

    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    const cleaned = value
      .replace(/\u00A0/g, ' ')
      .replace(/\s/g, '')
      .replace(',', '.');
    const n = Number(cleaned);
    return Number.isNaN(n) ? 0 : n;
  }

  return 0;
}

function normalizeText(v) {
  return String(v ?? '')
    .replace(/\u00A0/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getCell(row, wanted) {
  const w = normalizeText(wanted);
  for (const k of Object.keys(row || {})) {
    if (normalizeText(k) === w) return row[k];
  }
  return null;
}

function getCellAny(row, list) {
  for (const w of list) {
    const v = getCell(row, w);
    if (v !== null && v !== undefined) return v;
  }
  return null;
}

function findHeaderRowIndex(worksheet) {
  const preview = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  const limit = Math.min(preview.length, 120);
  const has = (arr, word) => (arr || []).some((c) => normalizeText(c) === normalizeText(word));

  for (let i = 0; i < limit; i++) {
    const r = preview[i] || [];
    if (has(r, 'Code') && has(r, 'Nom du compte')) return i;
  }
  return -1;
}

async function importGrandLivre(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
  const filePath = req.file.path;

  try {
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetNames = workbook.SheetNames || [];
    if (!sheetNames.length) return res.status(400).json({ message: 'Aucun onglet trouvé' });

    const usedSheetName =
      sheetNames.find((s) => normalizeText(s).includes('grand livre')) || sheetNames[0];

    const worksheet = workbook.Sheets[usedSheetName];
    const options = { defval: null };

    const headerIdx = findHeaderRowIndex(worksheet);
    if (headerIdx >= 0) {
      const range = xlsx.utils.decode_range(worksheet['!ref']);
      range.s.r = headerIdx;
      options.range = range;
    }

    const rows = xlsx.utils.sheet_to_json(worksheet, options);

    let currentAccountCode = null;
    let currentAccountLabel = null;

    // ✅ batchId unique pour cet import
    const batchId = crypto.randomUUID();

    const entriesToInsert = [];

    // ✅ pour détecter l’année à partir des écritures datées
    let detectedYear = null;

    // ✅ on capture la ligne "SOLDE OUVERTURE ..."
    let openingRow = null;

    for (const row of rows) {
      const rawCode = getCell(row, 'Code');
      const rawNom = getCell(row, 'Nom du compte');
      const rawDate = getCellAny(row, ['Date', 'Date écriture', 'Date ecriture']);

      const code = rawCode != null ? String(rawCode).trim() : null;
      const nomCol = rawNom != null ? String(rawNom).trim() : null;

      const parsedDate = parseExcelDate(rawDate);
      if (parsedDate && !detectedYear) detectedYear = parsedDate.getFullYear();

      // ✅ lire débit/crédit
      const rawDebit = getCellAny(row, ['Débit', 'Debit']);
      const rawCredit = getCellAny(row, ['Crédit', 'Credit']);
      const debit = parseNumber(rawDebit);
      const credit = parseNumber(rawCredit);

      // ✅ 1) DETECT "SOLDE OUVERTURE ..." même sans date/partner
      // (souvent placé à la fin du fichier)
      if (nomCol && normalizeText(nomCol).includes('solde ouverture')) {
        // on garde la valeur non nulle (et on la stocke en net credit-debit)
        if ((credit && credit !== 0) || (debit && debit !== 0)) {
          openingRow = {
            nomDuCompte: nomCol,
            debit,
            credit,
          };
        }
        continue; // on ne traite pas comme mouvement normal
      }

      // Ligne titre compte : code présent + pas une vraie date
      if (code && !parsedDate) {
        currentAccountCode = code;
        currentAccountLabel = nomCol || null;
        continue;
      }

      // skip total / solde initial (mais PAS solde ouverture)
      if (typeof nomCol === 'string') {
        const low = normalizeText(nomCol);
        if (low.startsWith('total ')) continue;
        if (low === 'solde initial') continue;
      }

      // Mouvement : date valide
      if (parsedDate) {
        if (!currentAccountCode) continue;

        const rawPartner = getCellAny(row, ['Partenaire', 'Partner', 'Tiers']);
        const partner = rawPartner && String(rawPartner).trim() ? String(rawPartner).trim() : null;

        // ✅ règle : on ignore si partenaire vide (sauf ouverture)
        if (!partner) continue;

        const rawEcheance = getCellAny(row, ['Échéance', 'Echéance', 'Echeance']);
        const parsedEcheance = parseExcelDate(rawEcheance);

        const rawCommunication = getCellAny(row, ['Communication', 'Libellé', 'Libelle']);

        const nomDuCompteToSave = nomCol || currentAccountLabel || null;

        entriesToInsert.push({
          date: parsedDate,
          nomDuCompte: nomDuCompteToSave,
          echeance: parsedEcheance,
          communication: rawCommunication ? String(rawCommunication).trim() : null,
          partner,
          debit,
          credit,
          importBatchId: batchId,
        });
      }
    }

    // ✅ Si on a trouvé un solde ouverture : on l’insère comme une écriture datée au 01/01 de l’année
    if (openingRow) {
      const y = detectedYear || new Date().getFullYear();
      entriesToInsert.push({
        date: new Date(y, 0, 1), // 01/01/yyyy
        nomDuCompte: openingRow.nomDuCompte,
        echeance: null,
        communication: 'SOLDE OUVERTURE',
        partner: null,
        debit: openingRow.debit || 0,
        credit: openingRow.credit || 0,
        importBatchId: batchId,
      });
    }

    if (entriesToInsert.length === 0) {
      return res.status(400).json({ message: 'Aucune ligne valide.' });
    }

    // ✅ transaction : on crée le batch + on insert les lignes
    const sequelize = LedgerEntry.sequelize;

    await sequelize.transaction(async (t) => {
      await ImportBatch.create(
        {
          id: batchId,
          type: 'grand_livre',
          fileName: req.file.originalname || null,
          sheetName: usedSheetName,
          importedCount: 0,
        },
        { transaction: t }
      );

      const BATCH = 2000;
      for (let i = 0; i < entriesToInsert.length; i += BATCH) {
        await LedgerEntry.bulkCreate(entriesToInsert.slice(i, i + BATCH), {
          validate: true,
          transaction: t,
        });
      }

      await ImportBatch.update(
        { importedCount: entriesToInsert.length },
        { where: { id: batchId }, transaction: t }
      );
    });

    return res.json({
      message: 'Import terminé',
      batchId,
      imported: entriesToInsert.length,
      sheet: usedSheetName,
      openingDetected: !!openingRow,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur lors de l'import du grand livre" });
  } finally {
    try {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
  }
}

module.exports = { importGrandLivre };
