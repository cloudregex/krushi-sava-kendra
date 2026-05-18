const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');
const Product = require('../models/Product');
const SupplierPayment = require('../models/SupplierPayment');
const Supplier = require('../models/Supplier');
const { logActivity } = require('../helper/logger');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

exports.getPendingBills = async (req, res) => {
    try {
        const items = await Purchase.findAll({
            where: {
                dueAmount: { [Op.gt]: 0 }
            },
            include: [{
                model: Supplier,
                as: 'Supplier',
                attributes: ['name', 'mobile']
            }, {
                model: SupplierPayment,
                as: 'payments',
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.payBill = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { amount, paymentDate, paymentMode, referenceNo, remarks } = req.body;
        
        const purchase = await Purchase.findByPk(id, { transaction: t });
        if (!purchase) {
            await t.rollback();
            return res.status(404).json({ message: 'Bill not found' });
        }

        const payAmt = parseFloat(amount);
        if (payAmt <= 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        if (payAmt > purchase.dueAmount) {
            await t.rollback();
            return res.status(400).json({ message: 'Amount cannot be greater than due amount' });
        }

        // Create SupplierPayment record
        const payment = await SupplierPayment.create({
            supplierId: purchase.supplierId,
            purchaseId: purchase.id,
            amount: payAmt,
            paymentDate: paymentDate || new Date(),
            paymentMode: paymentMode || 'Cash',
            referenceNo: referenceNo || null,
            remarks: remarks || 'Bill Payment'
        }, { transaction: t });

        // Update Purchase Bill
        const newPaidAmount = parseFloat(purchase.paidAmount) + payAmt;
        const newDueAmount = parseFloat(purchase.dueAmount) - payAmt;

        await purchase.update({
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount
        }, { transaction: t });

        await t.commit();
        await logActivity(req, 'Purchase', 'UPDATE', `Paid Rs.${payAmt} against bill ID: ${id}`);
        res.status(200).json({ message: 'Payment recorded successfully', payment });
    } catch (error) {
        await t.rollback();
        console.error("Payment error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, ...masterData } = req.body;
        
        // 1. Create Purchase Header
        const purchase = await Purchase.create(masterData, { transaction: t });
        
        // 2. Create Purchase Items and Update Stock
        for (const item of items) {
            await PurchaseItem.create({
                ...item,
                purchaseId: purchase.id
            }, { transaction: t });
            
            // Increment Product Stock
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
                const newStock = (parseFloat(product.currentStock) || 0) + parseFloat(item.quantity);
                await product.update({ currentStock: newStock }, { transaction: t });
            }
        }
        
        await t.commit();
        
        // Log activity
        await logActivity(req, 'Purchase', 'CREATE', `Created purchase bill ID: ${purchase.id}`);
        
        res.status(201).json(purchase);
    } catch (error) {
        await t.rollback();
        console.error("Purchase save error:", error);
        res.status(400).json({ message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const items = await Purchase.findAll({
            include: [{
                model: require('../models/Supplier'),
                as: 'Supplier',
                attributes: ['name']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const purchase = await Purchase.findByPk(req.params.id, {
            include: [{
                model: Supplier,
                as: 'Supplier',
                attributes: ['name', 'mobile']
            }, {
                model: SupplierPayment,
                as: 'payments',
                required: false
            }]
        });
        if (!purchase) return res.status(404).json({ message: 'Bill not found' });
        
        const items = await PurchaseItem.findAll({
            where: { purchaseId: purchase.id },
            include: [{
                model: Product,
                as: 'Product',
                attributes: ['id', 'name', 'marathiName', 'hsnCode', 'currentStock']
            }]
        });
        
        res.status(200).json({ ...purchase.toJSON(), items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.delete = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const purchase = await Purchase.findByPk(id, { transaction: t });
        if (!purchase) return res.status(404).json({ message: 'Bill not found' });

        const items = await PurchaseItem.findAll({ where: { purchaseId: id }, transaction: t });
        
        // Reverse Stock
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
                const newStock = (parseFloat(product.currentStock) || 0) - parseFloat(item.quantity);
                await product.update({ currentStock: newStock }, { transaction: t });
            }
        }

        // Delete items, payments, and purchase
        await PurchaseItem.destroy({ where: { purchaseId: id }, transaction: t });
        
        // Also delete any SupplierPayment entries linked to this purchase
        const SupplierPayment = require('../models/SupplierPayment');
        await SupplierPayment.destroy({ where: { purchaseId: id }, transaction: t });
        
        await purchase.destroy({ transaction: t });

        await t.commit();
        await logActivity(req, 'Purchase', 'DELETE', `Deleted purchase bill ID: ${id}`);
        res.status(200).json({ message: 'Purchase bill deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error("Purchase delete error:", error);
    }
};

exports.getStockBatches = async (req, res) => {
    try {
        const items = await PurchaseItem.findAll({
            include: [{
                model: Product,
                as: 'Product',
                attributes: ['name', 'unit']
            }, {
                model: Purchase,
                as: 'Purchase',
                attributes: ['id', 'billDate', 'supplierInvoiceNumber']
            }],
            order: [['expiryDate', 'ASC']]
        });
        res.json(items);
    } catch (error) {
        console.error("Error fetching stock batches:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getProductBatches = async (req, res) => {
    try {
        const { productId } = req.params;
        const items = await PurchaseItem.findAll({
            where: { productId },
            include: [{
                model: Purchase,
                as: 'Purchase',
                attributes: ['id', 'billDate', 'supplierInvoiceNumber']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(items);
    } catch (error) {
        console.error("Error fetching product batches:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
