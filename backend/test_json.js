const { sequelize } = require('./src/config/db');
const Role = require('./src/modals/Role');

async function test() {
    const role = await Role.findOne();
    console.log('Type of permissions:', typeof role.permissions);
    console.log('Value of permissions:', role.permissions);
    await sequelize.close();
}
test();
