const Tax = require('../model/Tax');

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
        const deleted = await Tax.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Tax not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
