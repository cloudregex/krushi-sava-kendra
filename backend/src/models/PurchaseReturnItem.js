const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseReturnItem = sequelize.define('PurchaseReturnItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchaseReturnId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  batchNo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unitValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  taxPercent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = PurchaseReturnItem;
