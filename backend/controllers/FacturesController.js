// controllers/FacturesController.js
const fs = require("fs");
const path = require("path");

const FACTURES_DIR = path.join(__dirname, "../uploads/factures");

function resolveSafeFacturePath(filename) {
  // enlève tout chemin éventuel, garde uniquement le nom de fichier
  const safeName = path.basename(filename);

  // reconstruit un chemin dans le dossier factures
  const fullPath = path.join(FACTURES_DIR, safeName);

  // sécurité : vérifie qu'on reste bien dans FACTURES_DIR
  const normalizedDir = path.normalize(FACTURES_DIR + path.sep);
  const normalizedFull = path.normalize(fullPath);

  if (!normalizedFull.startsWith(normalizedDir)) {
    throw new Error("Nom de fichier invalide");
  }

  return { safeName, fullPath };
}

// POST /api/factures/upload
exports.uploadFactures = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Aucun fichier reçu. Champ attendu: files",
      });
    }

    const files = req.files.map((f) => ({
      originalName: f.originalname,
      filename: f.filename || f.originalname,
      path: `/uploads/factures/${f.filename || f.originalname}`,
      size: f.size,
      mimetype: f.mimetype,
    }));

    return res.status(201).json({ ok: true, files });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Erreur serveur lors de l'upload des factures",
      error: err?.message,
    });
  }
};

// GET /api/factures
exports.listFactures = (req, res) => {
  try {
    if (!fs.existsSync(FACTURES_DIR)) {
      return res.json({ ok: true, files: [] });
    }

    const names = fs.readdirSync(FACTURES_DIR);

    const files = names
      .map((filename) => {
        const full = path.join(FACTURES_DIR, filename);
        const stat = fs.statSync(full);
        if (!stat.isFile()) return null;

        return {
          filename,
          path: `/uploads/factures/${filename}`,
          size: stat.size,
          updatedAt: stat.mtime.toISOString(), // ✅ plus clean côté front
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({ ok: true, files });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Erreur lors de la récupération des factures",
      error: err?.message,
    });
  }
};

// DELETE /api/factures/:filename
exports.deleteFacture = (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).json({ ok: false, message: "filename manquant" });
    }

    const { fullPath, safeName } = resolveSafeFacturePath(filename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        ok: false,
        message: `Fichier introuvable: ${safeName}`,
      });
    }

    fs.unlinkSync(fullPath);

    return res.json({ ok: true, message: "Fichier supprimé", filename: safeName });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Erreur lors de la suppression de la facture",
      error: err?.message,
    });
  }
};
