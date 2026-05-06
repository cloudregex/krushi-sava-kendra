const Tax = require('../models/Tax');
const { logActivity } = require('../helper/logger');

exports.getAll = async (req, res) => {
    try {
        const items = await Tax.findAll();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await Tax.findByPk(req.params.id);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Tax not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newItem = await Tax.create(req.body);
        
        // Log activity
        await logActivity(req, 'Tax', 'CREATE', `Created new tax rate: ${newItem.taxName || newItem.name}`);
        
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Tax.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedItem = await Tax.findByPk(req.params.id);
            
            // Log activity
            await logActivity(req, 'Tax', 'UPDATE', `Updated tax rate: ${updatedItem.taxName || updatedItem.name}`);
            
            res.status(200).json(updatedItem);
        } else {
            res.status(404).json({ message: 'Tax not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const itemToDelete = await Tax.findByPk(req.params.id);
        const deleted = await Tax.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            // Log activity
            await logActivity(req, 'Tax', 'DELETE', `Removed tax rate: ${itemToDelete?.taxName || itemToDelete?.name || req.params.id}`);
            
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Tax not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
