const { sequelize } = require('./src/config/db');

async function dropBackupTables() {
  try {
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup';");
    const backupTables = results.map(r => r.name);
    console.log("Found backup tables:", backupTables);
    
    for (const table of backupTables) {
      console.log(`Dropping ${table}...`);
      await sequelize.query(`DROP TABLE IF EXISTS \`${table}\`;`);
    }
    console.log("Cleanup complete!");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

dropBackupTables();
