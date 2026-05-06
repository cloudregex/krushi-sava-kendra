const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/', protect, customerController.create);
router.put('/:id', protect, customerController.update);
router.delete('/:id', protect, customerController.delete);

module.exports = router;
