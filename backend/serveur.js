const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// =========================
// Middlewares
// =========================

// Si tu es derrière nginx / proxy (optionnel)
app.set("trust proxy", 1);

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://www.tadias.co", // ✅ ton front en prod
    "https://tadias.co",     // ✅ au cas où
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cache-Control"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// =========================
// Associations (IMPORTANT)
// =========================
require("./models/associations");

// =========================
// Routes + DB
// =========================
const routes = require("./routes/userRoute");
const db = require("./db/db");

app.use("/", routes);

// =========================
// Start server after DB sync
// =========================
db.sequelize
  .sync()
  .then(() => {
    console.log("DB connected");
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Serveur started port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB sync error:", err);
    process.exit(1);
  });