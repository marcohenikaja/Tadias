// routes/userRoute.js
const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// controllers admin users (public)
const {
  createUser,
  listUsers,
  setUserActive,
  deleteUser,
  resetPassword,
} = require("../controllers/AdminUsersController");

// controllers existants
const { importGrandLivre } = require("../controllers/GrandLivreController");
const { getDashboard } = require("../controllers/DashboardController");
const { getTresorerie } = require("../controllers/TresorerieController");
const { getActivite } = require("../controllers/ActiviteController");
const { getCharges } = require("../controllers/ChargesController");

// ✅ NEW: controllers imports batch
const {
  listImports,
  deleteImportById,
  deleteLastImport,
} = require("../controllers/ImportBatchController");

// factures
const { uploadFactures, listFactures, deleteFacture } = require("../controllers/FacturesController");

// auth controller
const { login } = require("../controllers/AuthController");

// =========================
// Multer Excel (grand livre)
// =========================
const uploadExcel = multer({
  dest: path.join(__dirname, "../uploads"),
});

// =========================================
// Multer Factures
// =========================================
const UPLOAD_FACTURES_DIR = path.join(__dirname, "../uploads/factures");
fs.mkdirSync(UPLOAD_FACTURES_DIR, { recursive: true });

const storageFactures = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FACTURES_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[/\\?%*:|"<>]/g, "_");
    let finalName = safeName;

    const fullPath = path.join(UPLOAD_FACTURES_DIR, finalName);
    if (!fs.existsSync(fullPath)) return cb(null, finalName);

    const ext = path.extname(safeName);
    const base = path.basename(safeName, ext);

    let i = 1;
    while (fs.existsSync(path.join(UPLOAD_FACTURES_DIR, `${base}(${i})${ext}`))) i += 1;

    cb(null, `${base}(${i})${ext}`);
  },
});

const fileFilterFactures = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  const ok = allowed.includes(file.mimetype);
  cb(ok ? null : new Error(`Type non autorisé: ${file.mimetype}`), ok);
};

const uploadFacturesMulter = multer({
  storage: storageFactures,
  fileFilter: fileFilterFactures,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// =========================
// AUTH
// =========================
router.post("/auth/login", login);

// =========================
// ADMIN USERS (public)
// =========================
router.post("/api/admin/users", createUser);
router.get("/api/admin/users", listUsers);
router.patch("/api/admin/users/:id/active", setUserActive);
router.delete("/api/admin/users/:id", deleteUser);
router.patch("/api/admin/users/:id/password", resetPassword);

// =========================
// IMPORT GRAND LIVRE
// =========================
router.post("/import/grand-livre", uploadExcel.single("file"), importGrandLivre);

// ✅ NEW: HISTORIQUE IMPORTS + SUPPRESSION
router.get("/api/imports", listImports);              // liste imports
router.delete("/api/imports-last", deleteLastImport); // supprime dernier import
router.delete("/api/imports/:id", deleteImportById);  // supprime import par id

// =========================
// FACTURES
// =========================
router.post(
  "/api/factures/upload",
  (req, res, next) => {
    uploadFacturesMulter.array("files", 10)(req, res, (err) => {
      if (err) return res.status(400).json({ ok: false, message: err.message });
      next();
    });
  },
  uploadFactures
);

router.get("/api/factures", listFactures);
router.delete("/api/factures/:filename", deleteFacture);

// =========================
// DASHBOARD / KPI
// =========================
router.get("/api/dashboard", getDashboard);
router.get("/api/tresorerie", getTresorerie);
router.get("/api/activite", getActivite);
router.get("/api/charges", getCharges);

module.exports = router;
