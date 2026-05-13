const { sequelize } = require('../src/config/db');
require('../src/models/associations');
const Role = require('../src/models/Role');
const User = require('../src/models/User');

async function reproduce() {
    try {
        console.log("Starting sync with alter: true and logging...");
        await sequelize.sync({ alter: true, logging: console.log });
        console.log("Sync successful!");
    } catch (err) {
        console.error("Sync failed!");
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

reproduce();
