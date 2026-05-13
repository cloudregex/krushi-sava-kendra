const SaleItem = require('./src/models/SaleItem');
const PurchaseItem = require('./src/models/PurchaseItem');
const { sequelize } = require('./src/config/db');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const sales = await SaleItem.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        console.log('--- Recent Sales ---');
        sales.forEach(s => console.log(`ProdID: ${s.productId}, Batch: ${s.batchNo}`));

        const purchases = await PurchaseItem.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
        console.log('--- Recent Purchases ---');
        purchases.forEach(p => console.log(`ProdID: ${p.productId}, Batch: ${p.batchNo}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
