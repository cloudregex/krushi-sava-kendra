const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    billDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    supplierInvoiceNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remark: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    totalQuantity: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    subtotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    totalTaxAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    grandTotal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    paymentType: {
        type: DataTypes.STRING,
        defaultValue: 'Cash'
    },
    cashAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    upiAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    swipeAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    paidAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    dueAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Purchase;
