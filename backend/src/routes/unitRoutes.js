const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, unitController.getAll);
router.get('/:id', protect, unitController.getById);
router.post('/', protect, unitController.create);
router.put('/:id', protect, unitController.update);
router.delete('/:id', protect, unitController.delete);

module.exports = router;
