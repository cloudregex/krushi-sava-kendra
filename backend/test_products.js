const Product = require('./src/models/Product');
const { connectDB } = require('./src/config/db');

const testFindAll = async () => {
    try {
        await connectDB();
        const items = await Product.findAll();
        console.log('Total Products:', items.length);
        process.exit(0);
    } catch (error) {
        console.error('Error finding products:', error);
        process.exit(1);
    }
};

testFindAll();
