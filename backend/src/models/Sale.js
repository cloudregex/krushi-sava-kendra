const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoiceNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    billDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false
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
    paidAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    balanceAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    paymentMode: {
        type: DataTypes.JSON, // { cash: 0, upi: 0, swipe: 0 }
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Sale;
