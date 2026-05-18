const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupplierPayment = sequelize.define('SupplierPayment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    purchaseId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    paymentMode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    referenceNo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = SupplierPayment;
