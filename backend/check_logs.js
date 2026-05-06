const ActivityLog = require('./src/models/ActivityLog');
const { connectDB, sequelize } = require('./src/config/db');

const checkLogs = async () => {
    try {
        await connectDB();
        const logs = await ActivityLog.findAll();
        console.log('Total Logs Found:', logs.length);
        console.log(JSON.stringify(logs, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkLogs();
