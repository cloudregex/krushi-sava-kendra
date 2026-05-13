const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseOrderItem = require('../models/PurchaseOrderItem');
const { logActivity } = require('../helper/logger');
const { sequelize } = require('../config/db');

exports.create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, ...masterData } = req.body;
        
        // 1. Create Purchase Order Header
        const purchaseOrder = await PurchaseOrder.create(masterData, { transaction: t });
        
        // 2. Create Purchase Order Items
        if (items && Array.isArray(items)) {
            for (const item of items) {
                await PurchaseOrderItem.create({
                    ...item,
                    purchaseOrderId: purchaseOrder.id
                }, { transaction: t });
            }
        }
        
        await t.commit();
        
        // Log activity
        await logActivity(req, 'PurchaseOrder', 'CREATE', `Created purchase order ID: ${purchaseOrder.id}`);
        
        res.status(201).json(purchaseOrder);
    } catch (error) {
        await t.rollback();
        console.error("Purchase Order save error:", error);
        res.status(400).json({ message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const items = await PurchaseOrder.findAll({
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
        const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
            include: [
                { model: require('../models/PurchaseOrderItem'), as: 'items' },
                { model: require('../models/Supplier'), as: 'Supplier' }
            ]
        });
        if (!purchaseOrder) return res.status(404).json({ message: 'Order not found' });
        
        res.status(200).json(purchaseOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.delete = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const purchaseOrder = await PurchaseOrder.findByPk(id, { transaction: t });
        if (!purchaseOrder) return res.status(404).json({ message: 'Order not found' });

        await PurchaseOrderItem.destroy({ where: { purchaseOrderId: id }, transaction: t });
        await purchaseOrder.destroy({ transaction: t });

        await t.commit();
        await logActivity(req, 'PurchaseOrder', 'DELETE', `Deleted purchase order ID: ${id}`);
        res.status(200).json({ message: 'Purchase order deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error("Purchase Order delete error:", error);
        res.status(500).json({ message: error.message });
    }
};
