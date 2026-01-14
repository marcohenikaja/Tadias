const Sequelize = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../db/db");

const User = sequelize.define("User", {
  email: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  name: { type: Sequelize.STRING, allowNull: true },
  role: { type: Sequelize.STRING, allowNull: false, defaultValue: "user" }, // admin/user
  isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
  passwordHash: { type: Sequelize.STRING, allowNull: false },
}, {
  tableName: "users",
  timestamps: true,
});

User.prototype.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

User.prototype.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = { User };
