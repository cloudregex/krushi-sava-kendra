const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const Supplier = require('./Supplier');
const Product = require('./Product');

// Associations
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'Supplier' });
Supplier.hasMany(Purchase, { foreignKey: 'supplierId' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId', as: 'items' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId' });

PurchaseItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(PurchaseItem, { foreignKey: 'productId' });

module.exports = {
  Purchase,
  PurchaseItem,
  Supplier,
  Product
};
