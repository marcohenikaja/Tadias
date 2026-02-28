// controllers/ImportBatchController.js
const { LedgerEntry } = require('../models/LedgerEntryModel');
const { ImportBatch } = require('../models/ImportBatchModel'); // adapte si ton chemin diffère
const { User } = require("../models/User");

async function listImports(req, res) {
  try {
    const items = await ImportBatch.findAll({
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
    });

    res.json({ items });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Erreur listImports", error: e?.message });
  }
};

async function deleteImportById(req, res) {
  try {
    const { id } = req.params;

    const batch = await ImportBatch.findByPk(id);
    if (!batch) return res.status(404).json({ message: 'Import introuvable' });

    const deletedRows = await LedgerEntry.destroy({
      where: { importBatchId: id },
      force: true, // enlève si tu utilises pas paranoid
    });

    await ImportBatch.destroy({ where: { id }, force: true });

    return res.json({ message: 'Import supprimé', batchId: id, deletedRows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur lors de la suppression de l'import" });
  }
}

async function deleteLastImport(req, res) {
  try {
    const last = await ImportBatch.findOne({ order: [['createdAt', 'DESC']] });
    if (!last) return res.status(404).json({ message: 'Aucun import trouvé' });

    const deletedRows = await LedgerEntry.destroy({
      where: { importBatchId: last.id },
      force: true,
    });

    await ImportBatch.destroy({ where: { id: last.id }, force: true });

    return res.json({ message: 'Dernier import supprimé', batchId: last.id, deletedRows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la suppression du dernier import' });
  }
}

module.exports = { listImports, deleteImportById, deleteLastImport };
