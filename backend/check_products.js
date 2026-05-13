const { Product } = require('./src/models/associations');
const { connectDB } = require('./src/config/db');

async function check() {
    await connectDB();
    const count = await Product.count();
    console.log('Product count:', count);
    const products = await Product.findAll({ limit: 5 });
    console.log('Sample products:', JSON.stringify(products, null, 2));
    process.exit(0);
}

check();
