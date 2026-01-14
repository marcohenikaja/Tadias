// models/ImportBatchModel.js
const { Sequelize } = require('sequelize');
const { sequelize } = require('../db/db');

const ImportBatch = sequelize.define(
  'ImportBatch',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4, // génère automatiquement
    },
    type: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'grand_livre',
    },
    fileName: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    sheetName: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    importedCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'ImportBatches',
    timestamps: true,
  }
);

module.exports = { ImportBatch };
