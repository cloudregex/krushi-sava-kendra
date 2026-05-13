const Sale = require('./src/models/Sale');
const { sequelize } = require('./src/config/db');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const sales = await Sale.findAll({ limit: 5 });
        console.log(`Found ${sales.length} Sales.`);
        sales.forEach(s => console.log(`Invoice: ${s.invoiceNo}, CustomerID: ${s.customerId}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
