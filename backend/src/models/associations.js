const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const Supplier = require('./Supplier');
const Product = require('./Product');

// Associations
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'Supplier' });
Supplier.hasMany(Purchase, { foreignKey: 'supplierId' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId', as: 'items' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId' });

PurchaseItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(PurchaseItem, { foreignKey: 'productId' });

// Purchase Order Associations
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'Supplier' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId' });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });

PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(PurchaseOrderItem, { foreignKey: 'productId' });

module.exports = {
  Purchase,
  PurchaseItem,
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  Product
};
