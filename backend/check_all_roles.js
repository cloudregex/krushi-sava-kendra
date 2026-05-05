const { sequelize } = require('./src/config/db');
const Role = require('./src/modals/Role');

async function check() {
    try {
        await sequelize.authenticate();
        const roles = await Role.findAll();
        console.log('All Roles:', JSON.stringify(roles, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

check();
