const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', protect, categoryController.create);
router.put('/:id', protect, categoryController.update);
router.delete('/:id', protect, categoryController.delete);

module.exports = router;
