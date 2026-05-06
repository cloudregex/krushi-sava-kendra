const { sequelize } = require('./src/config/db');
const User = require('./src/modals/User');
const Role = require('./src/modals/Role');

async function check() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll({
            include: [{ model: Role, as: 'role' }]
        });
        console.log('Users and Roles:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

check();
