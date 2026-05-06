const ActivityLog = require('./src/models/ActivityLog');
const { connectDB, sequelize } = require('./src/config/db');

const testLog = async () => {
    try {
        await connectDB();
        const log = await ActivityLog.create({
            userId: 'test-id',
            userName: 'Test User',
            userType: 'Admin',
            module: 'Test',
            action: 'CREATE',
            details: 'Manual test log'
        });
        console.log('Test Log Created:', log.id);
        process.exit(0);
    } catch (error) {
        console.error('Test Log Failed:', error);
        process.exit(1);
    }
};

testLog();
