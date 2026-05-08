const { sequelize } = require('./src/config/db');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected');
        
        const categories = await Category.findAll();
        console.log(`\nCategories (${categories.length}):`);
        categories.forEach(c => console.log(`- ${c.name} (${c.isActive ? 'Active' : 'Inactive'})`));

        const products = await Product.findAll();
        console.log(`\nProducts (${products.length}):`);
        products.forEach(p => console.log(`- ${p.name} (Cat: ${p.category}, Unit: ${p.unit})`));
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkData();
