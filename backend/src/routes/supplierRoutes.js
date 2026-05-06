const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', supplierController.getAll);
router.get('/:id', supplierController.getById);
router.post('/', protect, supplierController.create);
router.put('/:id', protect, supplierController.update);
router.delete('/:id', protect, supplierController.delete);

module.exports = router;
