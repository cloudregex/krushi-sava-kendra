const { sequelize } = require('../src/config/db');
const { DataTypes } = require('sequelize');

async function fix() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Products');
        if (!tableInfo.unitValue) {
            console.log("Adding unitValue column...");
            await queryInterface.addColumn('Products', 'unitValue', {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 1
            });
            console.log("Success!");
        } else {
            console.log("Column already exists.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

fix();
