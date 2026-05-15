const { PurchaseReturn, PurchaseReturnItem, Product, Supplier } = require('../models/associations');
const { sequelize } = require('../config/db');

exports.createReturn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      supplierId, purchaseId, returnDate, subtotal, 
      totalTaxAmount, discount, discountType, grandTotal, 
      paidAmount, dueAmount, roundOff, reason, items 
    } = req.body;

    // Generate Return No
    const lastReturn = await PurchaseReturn.findOne({ order: [['id', 'DESC']] });
    const nextId = lastReturn ? lastReturn.id + 1 : 1;
    const returnNo = `RET-${String(nextId).padStart(3, '0')}`;

    const newReturn = await PurchaseReturn.create({
      returnNo,
      purchaseId,
      supplierId,
      returnDate,
      subtotal,
      totalTaxAmount,
      discount,
      discountType,
      grandTotal,
      paidAmount,
      dueAmount,
      roundOff,
      reason
    }, { transaction: t });

    for (const item of items) {
      await PurchaseReturnItem.create({
        purchaseReturnId: newReturn.id,
        productId: item.productId,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        unit: item.unit,
        unitValue: item.unitValue,
        purchasePrice: item.purchasePrice,
        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount
      }, { transaction: t });

      // Update Product Stock (Deduct from inventory for Purchase Return)
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        // Decrease stock (assuming quantity is the normalized/base unit quantity)
        product.openingStock = (parseFloat(product.openingStock) || 0) - (parseFloat(item.quantity) || 0);
        await product.save({ transaction: t });
      }
    }

    await t.commit();
    res.status(201).json(newReturn);
  } catch (error) {
    await t.rollback();
    console.error("Error creating purchase return:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllReturns = async (req, res) => {
  try {
    const returns = await PurchaseReturn.findAll({
      include: [
        { model: Supplier, as: 'Supplier' },
        { model: PurchaseReturnItem, as: 'items', include: [{ model: Product, as: 'Product' }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(returns);
  } catch (error) {
    console.error("Error fetching purchase returns:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReturnById = async (req, res) => {
  try {
    const data = await PurchaseReturn.findByPk(req.params.id, {
      include: [
        { model: Supplier, as: 'Supplier' },
        { model: PurchaseReturnItem, as: 'items', include: [{ model: Product, as: 'Product' }] }
      ]
    });
    if (!data) return res.status(404).json({ message: "Return not found" });
    res.json(data);
  } catch (error) {
    console.error("Error fetching purchase return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteReturn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const returnData = await PurchaseReturn.findByPk(req.params.id, {
      include: [{ model: PurchaseReturnItem, as: 'items' }]
    });

    if (!returnData) return res.status(404).json({ message: "Return not found" });

    // Revert Stock (Add back for deleted Purchase Return)
    for (const item of returnData.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        product.openingStock = (parseFloat(product.openingStock) || 0) + (parseFloat(item.quantity) || 0);
        await product.save({ transaction: t });
      }
    }

    await PurchaseReturnItem.destroy({ where: { purchaseReturnId: returnData.id }, transaction: t });
    await returnData.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Purchase return deleted and stock reverted" });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting purchase return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
