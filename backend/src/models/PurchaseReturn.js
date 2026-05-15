const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseReturn = sequelize.define('PurchaseReturn', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  returnNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  purchaseId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalTaxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  discountType: {
    type: DataTypes.STRING,
    defaultValue: '%'
  },
  grandTotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  dueAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  roundOff: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Processed'
  }
}, {
  timestamps: true
});

module.exports = PurchaseReturn;
