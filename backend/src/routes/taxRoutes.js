const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', taxController.getAll);
router.get('/:id', taxController.getById);
router.post('/', protect, taxController.create);
router.put('/:id', protect, taxController.update);
router.delete('/:id', protect, taxController.delete);

module.exports = router;
