const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const Supplier = require('./Supplier');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Customer = require('./Customer');

// Associations
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'Supplier' });
Supplier.hasMany(Purchase, { foreignKey: 'supplierId' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId', as: 'items' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId' });

PurchaseItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(PurchaseItem, { foreignKey: 'productId' });

// Sale Associations
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Sale, { foreignKey: 'customerId' });

Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });

SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(SaleItem, { foreignKey: 'productId' });

module.exports = {
  Purchase,
  PurchaseItem,
  Supplier,
  Product,
  Sale,
  SaleItem,
  Customer
};
