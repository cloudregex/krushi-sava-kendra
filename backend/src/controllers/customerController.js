const Customer = require('../models/Customer');
const { logActivity } = require('../helper/logger');

exports.getAll = async (req, res) => {
    try {
        const items = await Customer.findAll();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await Customer.findByPk(req.params.id);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newItem = await Customer.create(req.body);
        
        // Log activity
        await logActivity(req, 'Customer', 'CREATE', `Added new customer: ${newItem.customerName || newItem.name}`);
        
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Customer.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedItem = await Customer.findByPk(req.params.id);
            
            // Log activity
            await logActivity(req, 'Customer', 'UPDATE', `Updated customer details: ${updatedItem.customerName || updatedItem.name}`);
            
            res.status(200).json(updatedItem);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const itemToDelete = await Customer.findByPk(req.params.id);
        const deleted = await Customer.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            // Log activity
            await logActivity(req, 'Customer', 'DELETE', `Removed customer: ${itemToDelete?.customerName || itemToDelete?.name || req.params.id}`);
            
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
