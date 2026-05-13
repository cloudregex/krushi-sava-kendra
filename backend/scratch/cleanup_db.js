const { sequelize } = require('../src/config/db');

async function cleanup() {
    try {
        const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup'");
        console.log("Found backup tables:", tables);
        for (const table of tables) {
            console.log(`Dropping table ${table.name}...`);
            await sequelize.query(`DROP TABLE IF EXISTS ${table.name}`);
        }
        console.log("Cleanup complete!");
    } catch (err) {
        console.error("Cleanup failed:", err);
    } finally {
        await sequelize.close();
    }
}
cleanup();
