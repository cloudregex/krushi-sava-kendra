const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roleName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  permissions: {
    type: DataTypes.JSON, // SQLite supports JSON via text under the hood in Sequelize
    allowNull: false,
    defaultValue: {},
  },
}, {
  timestamps: true,
});

module.exports = Role;
