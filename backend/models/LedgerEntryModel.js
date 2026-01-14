// models/LedgerEntryModel.js
const { Sequelize } = require('sequelize');
const { sequelize } = require('../db/db');

const LedgerEntry = sequelize.define(
  'LedgerEntry',
  {
    date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    nomDuCompte: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    echeance: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    communication: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    partner: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },

    // ✅ NOUVEAU
    debit: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    credit: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },

    // ✅ pour supprimer un import précis (dernier / 1er / 2e)
    importBatchId: {
      type: Sequelize.UUID,
      allowNull: true,
    },

    // ✅ optionnel : anti-doublon
    importKey: {
      type: Sequelize.STRING(64),
      allowNull: true,
    },
  },
  {
    tableName: 'LedgerEntries',
    timestamps: true,
    // paranoid: true,
  }
);

module.exports = { LedgerEntry };
