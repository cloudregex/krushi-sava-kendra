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
