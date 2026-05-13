const { sequelize } = require('../src/config/db');

async function checkTable() {
    try {
        await sequelize.authenticate();
        const [info] = await sequelize.query("PRAGMA table_info(Roles);");
        console.log("Table Info:", JSON.stringify(info, null, 2));
        const [indices] = await sequelize.query("PRAGMA index_list(Roles);");
        console.log("Indices:", JSON.stringify(indices, null, 2));
        for (const index of indices) {
            const [cols] = await sequelize.query(`PRAGMA index_info(${index.name});`);
            console.log(`Index ${index.name} columns:`, JSON.stringify(cols, null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTable();
