const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseItem = sequelize.define('PurchaseItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchaseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: true
    },
    purchasePrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    taxPercent: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    taxAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    discountValue: {
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

module.exports = PurchaseItem;
