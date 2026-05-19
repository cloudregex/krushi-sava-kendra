const { SaleReturn, SaleReturnItem, Product, Customer, Sale } = require('../models/associations');
const { sequelize } = require('../config/db');

exports.createReturn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      customerId, saleId, returnDate, subtotal, 
      taxAmount, discountAmount, grandTotal, 
      refundMode, refundAmount, roundOff, reason, items 
    } = req.body;

    // Generate Return No
    const lastReturn = await SaleReturn.findOne({ order: [['id', 'DESC']] });
    const nextId = lastReturn ? lastReturn.id + 1 : 1;
    const year = new Date().getFullYear();
    const returnNo = `SRTN-${year}-${String(nextId).padStart(6, '0')}`;

    const newReturn = await SaleReturn.create({
      returnNo,
      saleId,
      customerId,
      returnDate,
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal,
      refundMode,
      refundAmount,
      roundOff,
      reason
    }, { transaction: t });

    for (const item of items) {
      await SaleReturnItem.create({
        saleReturnId: newReturn.id,
        productId: item.productId,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        reason: item.reason
      }, { transaction: t });

      // Update Product Stock (Restock into inventory for Sale Return)
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        product.currentStock = (parseFloat(product.currentStock) || 0) + (parseFloat(item.quantity) || 0);
        await product.save({ transaction: t });
      }
    }

    // Update Customer Balance (Adjust In Next Bill)
    const customer = await Customer.findByPk(customerId, { transaction: t });
    if (customer) {
      const adjustAmount = (parseFloat(grandTotal) || 0) - (parseFloat(refundAmount) || 0);
      if (adjustAmount > 0) {
        customer.balance = (parseFloat(customer.balance) || 0) - adjustAmount;
        await customer.save({ transaction: t });
      }
    }

    await t.commit();
    res.status(201).json(newReturn);
  } catch (error) {
    await t.rollback();
    console.error("Error creating sales return:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllReturns = async (req, res) => {
  try {
    const returns = await SaleReturn.findAll({
      include: [
        { model: Customer, as: 'customer' },
        { model: Sale, as: 'sale' },
        { model: SaleReturnItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(returns);
  } catch (error) {
    console.error("Error fetching sales returns:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReturnById = async (req, res) => {
  try {
    const data = await SaleReturn.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Sale, as: 'sale' },
        { model: SaleReturnItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });
    if (!data) return res.status(404).json({ message: "Return not found" });
    res.json(data);
  } catch (error) {
    console.error("Error fetching sales return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteReturn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const returnData = await SaleReturn.findByPk(req.params.id, {
      include: [{ model: SaleReturnItem, as: 'items' }]
    });

    if (!returnData) return res.status(404).json({ message: "Return not found" });

    // Revert Stock (Deduct from inventory for deleted Sale Return)
    for (const item of returnData.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        product.currentStock = Math.max(0, (parseFloat(product.currentStock) || 0) - (parseFloat(item.quantity) || 0));
        await product.save({ transaction: t });
      }
    }

    // Revert Customer Balance
    const customer = await Customer.findByPk(returnData.customerId, { transaction: t });
    if (customer) {
      const adjustAmount = (parseFloat(returnData.grandTotal) || 0) - (parseFloat(returnData.refundAmount) || 0);
      if (adjustAmount > 0) {
        customer.balance = (parseFloat(customer.balance) || 0) + adjustAmount;
        await customer.save({ transaction: t });
      }
    }

    await SaleReturnItem.destroy({ where: { saleReturnId: returnData.id }, transaction: t });
    await returnData.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Sales return deleted and stock reverted" });
  } catch (error) {
    await t.rollback();
    console.error("Error deleting sales return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateReturn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customerId, saleId, returnDate, items, grandTotal, refundAmount } = req.body;
    const returnId = req.params.id;

    const oldReturn = await SaleReturn.findByPk(returnId, {
      include: [{ model: SaleReturnItem, as: 'items' }],
      transaction: t
    });

    if (!oldReturn) {
      await t.rollback();
      return res.status(404).json({ message: "Return not found" });
    }

    // 1. Revert Old Return Stock (Deduct from inventory what was added by old return)
    for (const item of oldReturn.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        product.currentStock = Math.max(0, (parseFloat(product.currentStock) || 0) - (parseFloat(item.quantity) || 0));
        await product.save({ transaction: t });
      }
    }

    // 2. Revert Old Customer Balance (Add back what was deducted by old return)
    const oldCustomer = await Customer.findByPk(oldReturn.customerId, { transaction: t });
    if (oldCustomer) {
      const oldAdjustAmount = (parseFloat(oldReturn.grandTotal) || 0) - (parseFloat(oldReturn.refundAmount) || 0);
      if (oldAdjustAmount > 0) {
        oldCustomer.balance = (parseFloat(oldCustomer.balance) || 0) + oldAdjustAmount;
        await oldCustomer.save({ transaction: t });
      }
    }

    // 3. Update Sale Return Master Record
    oldReturn.customerId = customerId;
    oldReturn.saleId = saleId;
    oldReturn.returnDate = returnDate;
    oldReturn.grandTotal = grandTotal;
    oldReturn.refundAmount = refundAmount;
    oldReturn.refundMode = req.body.refundMode;
    oldReturn.reason = req.body.reason;
    oldReturn.subtotal = req.body.subtotal;
    oldReturn.totalTaxAmount = req.body.totalTaxAmount;
    oldReturn.discount = req.body.discount;
    oldReturn.roundOff = req.body.roundOff;
    await oldReturn.save({ transaction: t });

    // 4. Delete Old Items
    await SaleReturnItem.destroy({ where: { saleReturnId: returnId }, transaction: t });

    // 5. Create New Items and Apply New Stock Increments
    for (const item of items) {
      await SaleReturnItem.create({
        saleReturnId: returnId,
        productId: item.productId,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        reason: item.reason
      }, { transaction: t });

      // Restock the product inventory by the new returned quantity
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        product.currentStock = (parseFloat(product.currentStock) || 0) + (parseFloat(item.quantity) || 0);
        await product.save({ transaction: t });
      }
    }

    // 6. Apply New Customer Balance adjustment
    const newCustomer = await Customer.findByPk(customerId, { transaction: t });
    if (newCustomer) {
      const newAdjustAmount = (parseFloat(grandTotal) || 0) - (parseFloat(refundAmount) || 0);
      if (newAdjustAmount > 0) {
        newCustomer.balance = (parseFloat(newCustomer.balance) || 0) - newAdjustAmount;
        await newCustomer.save({ transaction: t });
      }
    }

    await t.commit();
    res.json({ message: "Sales return updated successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Error updating sales return:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
