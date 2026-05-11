const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');
const Product = require('../models/Product');
const { logActivity } = require('../helper/logger');
const { sequelize } = require('../config/db');

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
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const purchase = await Purchase.findByPk(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Bill not found' });
        
        const items = await PurchaseItem.findAll({
            where: { purchaseId: purchase.id }
        });
        
        res.status(200).json({ ...purchase.toJSON(), items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
