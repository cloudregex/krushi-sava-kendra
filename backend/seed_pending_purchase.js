const { Purchase, PurchaseItem } = require('./src/models/associations');
const { sequelize } = require('./src/config/db');
async function test() {
  const t = await sequelize.transaction();
  try {
    const p = await Purchase.create({
      supplierId: 1,
      supplierInvoiceNumber: "UDHARI-001",
      purchaseDate: "2026-05-15",
      billDate: "2026-05-15",
      subtotal: 5000,
      totalTaxAmount: 250,
      grandTotal: 5250,
      paidAmount: 1250,
      dueAmount: 4000,
      paymentMode: "Cash"
    }, { transaction: t });

    await PurchaseItem.create({
      purchaseId: p.id,
      productId: 1,
      quantity: 50,
      unit: "Bag",
      purchasePrice: 100,
      taxPercent: 5,
      taxAmount: 250,
      totalAmount: 5250
    }, { transaction: t });

    await t.commit();
    console.log("Created dummy pending purchase.");
  } catch (e) {
    await t.rollback();
    console.error(e);
  } finally {
    process.exit();
  }
}
test();
