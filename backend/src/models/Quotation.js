const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Quotation = sequelize.define('Quotation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quotationNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    validUntil: {
        type: DataTypes.DATEONLY,
        allowNull: true
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
    discountType: {
        type: DataTypes.STRING,
        defaultValue: 'percent'
    },
    discountValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    grandTotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, // 'Pending', 'Accepted', 'Expired'
        defaultValue: 'Pending'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Quotation;
