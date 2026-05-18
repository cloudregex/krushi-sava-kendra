const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuotationItem = sequelize.define('QuotationItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quotationId: {
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
        type: DataTypes.FLOAT,
        allowNull: false
    },
    freeQuantity: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rate: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    taxPercent: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    taxAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = QuotationItem;
