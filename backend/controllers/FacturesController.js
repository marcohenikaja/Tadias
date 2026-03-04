// controllers/FacturesController.js
const fs = require("fs");
const path = require("path");

const FACTURES_DIR = path.join(__dirname, "../uploads/factures");

function isAdmin(req) {
  return (req.user?.role || req.user?.profil) === "admin";
}

function getAuthUserId(req) {
  const userId = req.user?.sub;
  if (!userId) {
    const err = new Error("Non authentifié");
    err.status = 401;
    throw err;
  }
  return String(userId);
}

// ✅ user cible : admin peut uploader pour quelqu’un d’autre
function getTargetUserId(req) {
  const authUserId = getAuthUserId(req);
  if (isAdmin(req) && req.body?.userId) return String(req.body.userId);
  return authUserId;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function resolveSafeFacturePath(baseDir, filename) {
  const safeName = path.basename(String(filename || ""));
  if (!safeName) throw new Error("Nom de fichier invalide");

  const fullPath = path.join(baseDir, safeName);

  const normalizedDir = path.normalize(baseDir + path.sep);
  const normalizedFull = path.normalize(fullPath);

  if (!normalizedFull.startsWith(normalizedDir)) {
    throw new Error("Nom de fichier invalide");
  }
  return { safeName, fullPath };
}

// POST /api/factures/upload
exports.uploadFactures = (req, res) => {
  try {
    const targetUserId = getTargetUserId(req);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Aucun fichier reçu. Champ attendu: files",
      });
    }

    // ✅ dossier du user cible
    const userDir = ensureDir(path.join(FACTURES_DIR, targetUserId));

    // ⚠️ IMPORTANT :
    // Multer doit sauvegarder les fichiers dans ce userDir.
    // Sinon, le fichier sera sur le dossier global et le lien ne correspondra pas.
    // (à corriger côté route multer)

    const files = req.files.map((f) => ({
      originalName: f.originalname,
      filename: f.filename || f.originalname,
      path: `/uploads/factures/${targetUserId}/${f.filename || f.originalname}`,
      size: f.size,
      mimetype: f.mimetype,
    }));

    return res.status(201).json({ ok: true, files, userId: targetUserId });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      ok: false,
      message:
        status === 401
          ? "Non authentifié"
          : "Erreur serveur lors de l'upload des factures",
      error: err?.message,
    });
  }
};

// GET /api/factures
exports.listFactures = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    const targetUserId =
      isAdmin(req) && req.query.userId ? String(req.query.userId) : authUserId;

    const userDir = path.join(FACTURES_DIR, targetUserId);

    if (!fs.existsSync(userDir)) {
      return res.json({ ok: true, files: [] });
    }

    const names = await fs.promises.readdir(userDir);

    const filesRaw = await Promise.all(
      names.map(async (filename) => {
        try {
          const full = path.join(userDir, filename);
          const stat = await fs.promises.stat(full);
          if (!stat.isFile()) return null;

          return {
            filename,
            path: `/uploads/factures/${targetUserId}/${filename}`,
            size: stat.size,
            updatedAt: stat.mtime.toISOString(),
          };
        } catch {
          return null;
        }
      })
    );

    const files = filesRaw
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({ ok: true, files });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      ok: false,
      message:
        status === 401
          ? "Non authentifié"
          : "Erreur lors de la récupération des factures",
      error: err?.message,
    });
  }
};

// DELETE /api/factures/:filename
exports.deleteFacture = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    const targetUserId =
      isAdmin(req) && req.query.userId ? String(req.query.userId) : authUserId;

    const userDir = path.join(FACTURES_DIR, targetUserId);

    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).json({ ok: false, message: "filename manquant" });
    }

    const { fullPath, safeName } = resolveSafeFacturePath(userDir, filename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        ok: false,
        message: `Fichier introuvable: ${safeName}`,
      });
    }

    await fs.promises.unlink(fullPath);

    return res.json({ ok: true, message: "Fichier supprimé", filename: safeName });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      ok: false,
      message:
        status === 401
          ? "Non authentifié"
          : "Erreur lors de la suppression de la facture",
      error: err?.message,
    });
  }
};