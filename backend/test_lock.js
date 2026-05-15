const { sequelize } = require('./src/config/db');
async function test() {
  try {
    const res = await sequelize.query('PRAGMA database_list');
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
test();
