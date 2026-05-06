const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', protect, productController.create);
router.put('/:id', protect, productController.update);
router.delete('/:id', protect, productController.delete);

module.exports = router;
