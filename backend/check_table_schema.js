const { sequelize } = require('./src/config/db');

async function checkTable() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("PRAGMA table_info(Products);");
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTable();
