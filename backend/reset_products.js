const Product = require('./src/models/Product');
const { sequelize } = require('./src/config/db');

const resetProducts = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');
        
        // Force sync ONLY the Product model to recreate the table
        await Product.sync({ force: true });
        
        console.log('✅ Products table has been reset successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to reset Products table:', error.message);
        process.exit(1);
    }
};

resetProducts();
