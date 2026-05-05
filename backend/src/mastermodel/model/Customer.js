const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sqliteDB');

const Customer = sequelize.define('Customer', {
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
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[0-9]{10}$/
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    gstNo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = Customer;
