const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    marathiName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tax: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING,
        allowNull: true
    },
    primaryUnit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    secondaryUnit: {
        type: DataTypes.STRING,
        allowNull: false
    },
    conversionFactor: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1
    },
    minStock: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    currentStock: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    expiryRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Product;
