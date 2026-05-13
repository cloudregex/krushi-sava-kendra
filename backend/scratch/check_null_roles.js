const { sequelize } = require('../src/config/db');

async function check() {
    try {
        const [nullRoles] = await sequelize.query("SELECT * FROM Roles WHERE roleName IS NULL");
        console.log("Null roles:", nullRoles);
        const [emptyRoles] = await sequelize.query("SELECT * FROM Roles WHERE roleName = ''");
        console.log("Empty roles:", emptyRoles);
        const [allRoles] = await sequelize.query("SELECT * FROM Roles");
        console.log("All roles:", allRoles);
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}
check();
