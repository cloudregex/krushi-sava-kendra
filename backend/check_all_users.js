const User = require('./src/models/User');
const { connectDB } = require('./src/config/db');

const checkUsers = async () => {
    try {
        await connectDB();
        const users = await User.findAll();
        console.log('Total Users Found:', users.length);
        users.forEach(u => {
            console.log(`User: ${u.userName}, Email: ${u.email}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
