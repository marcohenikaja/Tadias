// routes/userRoute.js
const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const auth = require("../middlewares/auth");

// controllers admin users
const {
  createUser,
  listUsers,
  setUserActive,
  deleteUser,
  resetPassword,
} = require("../controllers/AdminUsersController");

// controllers
const { importGrandLivre } = require("../controllers/GrandLivreController");
const { getDashboard } = require("../controllers/DashboardController");
const { getTresorerie } = require("../controllers/TresorerieController");
const { getActivite } = require("../controllers/ActiviteController");
const { getCharges } = require("../controllers/ChargesController");

// imports batch
const {
  listImports,
  deleteImportById,
  deleteLastImport,
} = require("../controllers/ImportBatchController");

// factures
const {
  uploadFactures,
  listFactures,
  deleteFacture,
} = require("../controllers/FacturesController");

// auth
const { login } = require("../controllers/AuthController");

// =========================
// Ensure uploads dirs exist
// =========================
const UPLOADS_DIR = path.join(__dirname, "../uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const UPLOAD_FACTURES_DIR = path.join(UPLOADS_DIR, "factures");
fs.mkdirSync(UPLOAD_FACTURES_DIR, { recursive: true });

// =========================
// Multer Excel (grand livre)
// =========================
const uploadExcel = multer({
  dest: UPLOADS_DIR,
});

// =========================
// Multer Factures
// =========================
const storageFactures = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FACTURES_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[/\\?%*:|"<>]/g, "_");
    const fullPath = path.join(UPLOAD_FACTURES_DIR, safeName);

    if (!fs.existsSync(fullPath)) return cb(null, safeName);

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
// AUTH (public)
// =========================
router.post("/auth/login", login);

// =========================
// ADMIN USERS (⚠️ à protéger)
// =========================
// 👉 Minimum: auth. Idéal: auth + adminOnly
router.post("/api/admin/users", auth, createUser);
router.get("/api/admin/users", auth, listUsers);
router.patch("/api/admin/users/:id/active", auth, setUserActive);
router.delete("/api/admin/users/:id", auth, deleteUser);
router.patch("/api/admin/users/:id/password", auth, resetPassword);

// =========================
// ROUTES PROTÉGÉES (JWT)
// =========================

// IMPORT GRAND LIVRE
router.post("/import/grand-livre", auth, uploadExcel.single("file"), importGrandLivre);

// HISTORIQUE IMPORTS + SUPPRESSION
router.get("/api/imports", auth, listImports);
router.delete("/api/imports-last", auth, deleteLastImport);
router.delete("/api/imports/:id", auth, deleteImportById);

// FACTURES
router.post(
  "/api/factures/upload",
  auth,
  (req, res, next) => {
    uploadFacturesMulter.array("files", 10)(req, res, (err) => {
      if (err) return res.status(400).json({ ok: false, message: err.message });
      next();
    });
  },
  uploadFactures
);

router.get("/api/factures", auth, listFactures);
router.delete("/api/factures/:filename", auth, deleteFacture);

// DASHBOARD / KPI
router.get("/api/dashboard", auth, getDashboard);
router.get("/api/tresorerie", auth, getTresorerie);
router.get("/api/activite", auth, getActivite);
router.get("/api/charges", auth, getCharges);

module.exports = router;