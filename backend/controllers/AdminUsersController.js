const { User } = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "email et password requis" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({ where: { email: normalizedEmail } });
    if (exists) {
      return res.status(409).json({ ok: false, message: "Cet email existe déjà" });
    }

    const user = User.build({
      email: normalizedEmail,
      name: name || null,
      role: role === "admin" ? "admin" : "user",
      isActive: true,
      passwordHash: "temp",
    });

    await user.setPassword(password);
    await user.save();

    return res.status(201).json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isActive: user.isActive },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur création user", error: err?.message });
    }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "name", "role", "isActive", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    return res.json({ ok: true, users });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur liste users", error: err?.message });
  }
};

exports.setUserActive = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isActive } = req.body || {};

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ ok: false, message: "Utilisateur introuvable" });

    user.isActive = Boolean(isActive);
    await user.save();

    return res.json({ ok: true, user: { id: user.id, isActive: user.isActive } });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur update user", error: err?.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Empêcher un admin de se supprimer lui-même (optionnel mais conseillé)
    if (req.user && Number(req.user.sub) === id) {
      return res.status(400).json({ ok: false, message: "Impossible de supprimer votre propre compte" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ ok: false, message: "Utilisateur introuvable" });

    await user.destroy();
    return res.json({ ok: true, message: "Utilisateur supprimé" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur suppression user", error: err?.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password } = req.body || {};

    if (!password || String(password).length < 6) {
      return res.status(400).json({ ok: false, message: "Mot de passe requis (min 6 caractères)" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ ok: false, message: "Utilisateur introuvable" });

    await user.setPassword(password);
    await user.save();

    return res.json({ ok: true, message: "Mot de passe réinitialisé" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Erreur reset password", error: err?.message });
  }
};