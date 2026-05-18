const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SaleReturn = sequelize.define('SaleReturn', {
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
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  taxAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  discountAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  grandTotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  refundMode: {
    type: DataTypes.STRING,
    defaultValue: 'Cash' // 'Cash' | 'UPI' | 'Adjust'
  },
  refundAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  roundOff: {
    type: DataTypes.FLOAT,
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

module.exports = SaleReturn;
