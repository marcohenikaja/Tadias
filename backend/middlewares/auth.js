require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ ok: false, message: "Token manquant" });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, email, name, role }
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Token invalide" });
  }
};
