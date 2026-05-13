const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');

router.get('/', purchaseOrderController.getAll);
router.get('/:id', purchaseOrderController.getById);
router.post('/', purchaseOrderController.create);
router.delete('/:id', purchaseOrderController.delete);

module.exports = router;
