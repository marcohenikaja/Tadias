// models/associations.js
const { ImportBatch } = require("./ImportBatchModel");
const { User } = require("./User");

ImportBatch.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(ImportBatch, { foreignKey: "userId", as: "imports" });