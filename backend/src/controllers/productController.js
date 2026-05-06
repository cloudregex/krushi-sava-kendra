const Product = require('../models/Product');
const { logActivity } = require('../helper/logger');

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
        const newItem = await Product.create(req.body);
        
        // Log activity
        await logActivity(req, 'Product', 'CREATE', `Created new product: ${newItem.productName || newItem.name}`);
        
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Product.update(req.body, {
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
