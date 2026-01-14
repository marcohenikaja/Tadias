
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email et mot de passe requis" });
    }

    const user = await User.findOne({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ ok: false, message: "Identifiants invalides" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ ok: false, message: "Compte désactivé" });
    }

    const ok = await user.verifyPassword(password); // méthode dans ton modèle User
    if (!ok) {
      return res.status(401).json({ ok: false, message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      ok: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur login", error: err?.message });
  }
};
