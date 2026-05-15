const { sequelize } = require('./src/config/db');

async function check() {
  try {
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    console.log("Tables:", results.map(r => r.name));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
