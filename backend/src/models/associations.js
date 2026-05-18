const Purchase = require('./Purchase');
const PurchaseItem = require('./PurchaseItem');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const PurchaseReturn = require('./PurchaseReturn');
const PurchaseReturnItem = require('./PurchaseReturnItem');
const Supplier = require('./Supplier');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Customer = require('./Customer');
const SupplierPayment = require('./SupplierPayment');
const Quotation = require('./Quotation');
const QuotationItem = require('./QuotationItem');
const SaleReturn = require('./SaleReturn');
const SaleReturnItem = require('./SaleReturnItem');

// Associations
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'Supplier' });
Supplier.hasMany(Purchase, { foreignKey: 'supplierId' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId', as: 'items' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId', as: 'Purchase' });

PurchaseItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(PurchaseItem, { foreignKey: 'productId' });

// Sale Associations
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Sale, { foreignKey: 'customerId' });

Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'Sale' });

SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(SaleItem, { foreignKey: 'productId' });

// Purchase Order Associations
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'Supplier' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId' });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });

PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(PurchaseOrderItem, { foreignKey: 'productId' });

// Purchase Return Associations
PurchaseReturn.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'Supplier' });
Supplier.hasMany(PurchaseReturn, { foreignKey: 'supplierId' });

PurchaseReturn.hasMany(PurchaseReturnItem, { foreignKey: 'purchaseReturnId', as: 'items' });
PurchaseReturnItem.belongsTo(PurchaseReturn, { foreignKey: 'purchaseReturnId' });

PurchaseReturnItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(PurchaseReturnItem, { foreignKey: 'productId' });

// Supplier Payment Associations
SupplierPayment.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'Supplier' });
Supplier.hasMany(SupplierPayment, { foreignKey: 'supplierId' });

SupplierPayment.belongsTo(Purchase, { foreignKey: 'purchaseId', as: 'PurchaseBill' });
Purchase.hasMany(SupplierPayment, { foreignKey: 'purchaseId', as: 'payments' });

// Quotation Associations
Quotation.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Quotation, { foreignKey: 'customerId' });

Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId', as: 'items' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId' });

QuotationItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(QuotationItem, { foreignKey: 'productId' });

// Sale Return Associations
SaleReturn.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(SaleReturn, { foreignKey: 'customerId' });

SaleReturn.hasMany(SaleReturnItem, { foreignKey: 'saleReturnId', as: 'items' });
SaleReturnItem.belongsTo(SaleReturn, { foreignKey: 'saleReturnId' });

SaleReturnItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(SaleReturnItem, { foreignKey: 'productId' });

module.exports = {
  Purchase,
  PurchaseItem,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseReturn,
  PurchaseReturnItem,
  Supplier,
  SupplierPayment,
  Product,
  Sale,
  SaleItem,
  Customer,
  Quotation,
  QuotationItem,
  SaleReturn,
  SaleReturnItem
};
