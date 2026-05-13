const Product = require('../models/Product');
const SaleItem = require('../models/SaleItem');
const PurchaseItem = require('../models/PurchaseItem');
const { logActivity } = require('../helper/logger');

exports.getLatestBatch = async (req, res) => {
    try {
        console.log("🔍 FETCHING BATCH FOR PRODUCT ID:", req.params.id);
        const [lastSale, lastPurchase] = await Promise.all([
            SaleItem.findOne({
                where: { productId: req.params.id },
                order: [['createdAt', 'DESC']],
                attributes: ['batchNo', 'createdAt']
            }),
            PurchaseItem.findOne({
                where: { productId: req.params.id },
                order: [['createdAt', 'DESC']],
                attributes: ['batchNo', 'createdAt']
            })
        ]);
        
        console.log("Last Sale Found:", lastSale ? lastSale.batchNo : "NONE");
        console.log("Last Purchase Found:", lastPurchase ? lastPurchase.batchNo : "NONE");
        
        let latestBatch = '';
        if (lastSale && lastPurchase) {
            latestBatch = lastSale.createdAt > lastPurchase.createdAt ? lastSale.batchNo : lastPurchase.batchNo;
        } else if (lastSale) {
            latestBatch = lastSale.batchNo;
        } else if (lastPurchase) {
            latestBatch = lastPurchase.batchNo;
        }

        res.status(200).json({ batchNo: latestBatch });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const items = await Product.findAll();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await Product.findByPk(req.params.id);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        console.log("Creating product with data:", req.body);
        const newItem = await Product.create(req.body);
        
        // Log activity
        await logActivity(req, 'Product', 'CREATE', `Created new product: ${newItem.productName || newItem.name}`);
        
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Product creation error:", error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        // Prevent changing unit and unitValue after creation to maintain stock integrity
        const { unit, unitValue, ...updateData } = req.body;

        const [updated] = await Product.update(updateData, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedItem = await Product.findByPk(req.params.id);
            
            // Log activity
            await logActivity(req, 'Product', 'UPDATE', `Updated product: ${updatedItem.productName || updatedItem.name}`);
            
            res.status(200).json(updatedItem);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const itemToDelete = await Product.findByPk(req.params.id);
        const deleted = await Product.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            // Log activity
            await logActivity(req, 'Product', 'DELETE', `Deleted product: ${itemToDelete?.productName || itemToDelete?.name || req.params.id}`);
            
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
