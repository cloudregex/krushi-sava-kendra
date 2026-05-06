const Supplier = require('../models/Supplier');
const { logActivity } = require('../helper/logger');

exports.getAll = async (req, res) => {
    try {
        const items = await Supplier.findAll();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await Supplier.findByPk(req.params.id);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newItem = await Supplier.create(req.body);
        
        // Log activity
        await logActivity(req, 'Supplier', 'CREATE', `Added new supplier: ${newItem.supplierName || newItem.name}`);
        
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Supplier.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedItem = await Supplier.findByPk(req.params.id);
            
            // Log activity
            await logActivity(req, 'Supplier', 'UPDATE', `Updated supplier details: ${updatedItem.supplierName || updatedItem.name}`);
            
            res.status(200).json(updatedItem);
        } else {
            res.status(404).json({ message: 'Supplier not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const itemToDelete = await Supplier.findByPk(req.params.id);
        const deleted = await Supplier.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            // Log activity
            await logActivity(req, 'Supplier', 'DELETE', `Removed supplier: ${itemToDelete?.supplierName || itemToDelete?.name || req.params.id}`);
            
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
