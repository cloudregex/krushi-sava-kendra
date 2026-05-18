const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

router.get('/', purchaseController.getAll);
router.get('/pending', purchaseController.getPendingBills);
router.get('/batches', purchaseController.getStockBatches);
router.get('/product/:productId/batches', purchaseController.getProductBatches);
router.post('/:id/pay', purchaseController.payBill);
router.get('/:id', purchaseController.getById);
router.post('/', purchaseController.create);
router.delete('/:id', purchaseController.delete);

module.exports = router;
