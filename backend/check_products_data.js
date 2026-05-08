const { sequelize } = require('./src/config/db');

async function checkData() {
    try {
        const [results] = await sequelize.query("SELECT id, name, hsnCode FROM Products;");
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
