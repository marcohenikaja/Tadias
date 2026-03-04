// controllers/ImportGrandLivreController.js
const xlsx = require("xlsx");
const fs = require("fs");
const crypto = require("crypto");

const { LedgerEntry } = require("../models/LedgerEntryModel");
const { ImportBatch } = require("../models/ImportBatchModel");
const { User } = require("../models/User"); // ✅ AJOUT

// =====================
// Helpers dates / nombres
// =====================
function excelSerialToDate(serial) {
  // Excel epoch (Windows) : 1899-12-30
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const ms = excelEpoch.getTime() + Number(serial) * 24 * 60 * 60 * 1000;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseExcelDate(value) {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === "number") {
    return excelSerialToDate(value);
  }

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;

    // format dd/mm/yyyy ou dd-mm-yyyy
    const [datePart] = s.split(" ");
    const m = datePart.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value
      .replace(/\u00A0/g, " ")
      .replace(/\s/g, "")
      .replace(",", ".");
    const n = Number(cleaned);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function normalizeText(v) {
  return String(v ?? "")
    .replace(/\u00A0/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
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
    if (has(r, "Code") && has(r, "Nom du compte")) return i;
  }
  return -1;
}

function makeUUID() {
  // Node >= 14.17 : crypto.randomUUID()
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // fallback
  return crypto.randomBytes(16).toString("hex");
}

// =====================
// Controller
// =====================
async function importGrandLivre(req, res) {
  if (!req.user?.sub) {
    return res.status(401).json({ ok: false, message: "Non authentifié" });
  }

  if (!req.file) {
    return res.status(400).json({ ok: false, message: "Aucun fichier reçu" });
  }

  // ✅ ASSIGNATION USER (admin -> targetUserId)
  const requesterId = req.user.sub;
  const requesterRole = req.user.role; // il faut que ton middleware mette role
  const targetUserId = req.body?.targetUserId;

  let assignedUserId = requesterId;

  // si admin ET targetUserId présent -> assigner
  if (requesterRole === "admin" && targetUserId) {
    const u = await User.findByPk(targetUserId);
    if (!u) {
      return res.status(400).json({ ok: false, message: "Utilisateur cible introuvable" });
    }
    assignedUserId = targetUserId;
  }

  const filePath = req.file.path;

  try {
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetNames = workbook.SheetNames || [];
    if (!sheetNames.length) {
      return res.status(400).json({ ok: false, message: "Aucun onglet trouvé" });
    }

    const usedSheetName =
      sheetNames.find((s) => normalizeText(s).includes("grand livre")) || sheetNames[0];

    const worksheet = workbook.Sheets[usedSheetName];
    if (!worksheet || !worksheet["!ref"]) {
      return res.status(400).json({ ok: false, message: "Onglet vide ou illisible" });
    }

    const options = { defval: null };

    // si on retrouve la ligne d'entêtes, on commence à partir de là
    const headerIdx = findHeaderRowIndex(worksheet);
    if (headerIdx >= 0) {
      const range = xlsx.utils.decode_range(worksheet["!ref"]);
      range.s.r = headerIdx;
      range.s.c = 0;
      options.range = range;
    }

    const rows = xlsx.utils.sheet_to_json(worksheet, options);

    let currentAccountCode = null;
    let currentAccountLabel = null;

    const batchId = makeUUID();
    const entriesToInsert = [];

    let detectedYear = null;
    let openingRow = null;

    for (const row of rows) {
      const rawCode = getCell(row, "Code");
      const rawNom = getCell(row, "Nom du compte");
      const rawDate = getCellAny(row, ["Date", "Date écriture", "Date ecriture"]);

      const code = rawCode != null ? String(rawCode).trim() : null;
      const nomCol = rawNom != null ? String(rawNom).trim() : null;

      const parsedDate = parseExcelDate(rawDate);
      if (parsedDate && !detectedYear) detectedYear = parsedDate.getFullYear();

      const rawDebit = getCellAny(row, ["Débit", "Debit"]);
      const rawCredit = getCellAny(row, ["Crédit", "Credit"]);
      const debit = parseNumber(rawDebit);
      const credit = parseNumber(rawCredit);

      // ✅ détecter "SOLDE OUVERTURE"
      if (nomCol && normalizeText(nomCol).includes("solde ouverture")) {
        if ((credit && credit !== 0) || (debit && debit !== 0)) {
          openingRow = { nomDuCompte: nomCol, debit, credit };
        }
        continue;
      }

      // Ligne "titre compte" : code présent + pas de date valide
      if (code && !parsedDate) {
        currentAccountCode = code;
        currentAccountLabel = nomCol || null;
        continue;
      }

      // ignorer total / solde initial
      if (typeof nomCol === "string") {
        const low = normalizeText(nomCol);
        if (low.startsWith("total ")) continue;
        if (low === "solde initial") continue;
      }

      // Mouvement : date valide
      if (parsedDate) {
        if (!currentAccountCode) continue;

        const rawPartner = getCellAny(row, ["Partenaire", "Partner", "Tiers"]);
        const partner =
          rawPartner && String(rawPartner).trim() ? String(rawPartner).trim() : null;

        // règle : on ignore si partenaire vide
        if (!partner) continue;

        const rawEcheance = getCellAny(row, ["Échéance", "Echéance", "Echeance"]);
        const parsedEcheance = parseExcelDate(rawEcheance);

        const rawCommunication = getCellAny(row, ["Communication", "Libellé", "Libelle"]);
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

    // ✅ injecter solde ouverture au 01/01 de l'année détectée
    if (openingRow) {
      const y = detectedYear || new Date().getFullYear();
      entriesToInsert.push({
        date: new Date(y, 0, 1),
        nomDuCompte: openingRow.nomDuCompte,
        echeance: null,
        communication: "SOLDE OUVERTURE",
        partner: null,
        debit: openingRow.debit || 0,
        credit: openingRow.credit || 0,
        importBatchId: batchId,
      });
    }

    if (entriesToInsert.length === 0) {
      return res.status(400).json({ ok: false, message: "Aucune ligne valide." });
    }

    const sequelize = LedgerEntry.sequelize;

    await sequelize.transaction(async (t) => {
      await ImportBatch.create(
        {
          id: batchId,
          type: "grand_livre",
          fileName: req.file.originalname || null,
          sheetName: usedSheetName,
          importedCount: 0,
          userId: assignedUserId, // ✅ ICI on met l’utilisateur assigné
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
      ok: true,
      message: "Import terminé",
      batchId,
      imported: entriesToInsert.length,
      sheet: usedSheetName,
      openingDetected: !!openingRow,
      assignedUserId, // ✅ pour debug/affichage
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Erreur lors de l'import du grand livre" });
  } finally {
    try {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
  }
}

module.exports = { importGrandLivre };