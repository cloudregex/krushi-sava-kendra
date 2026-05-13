const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.get('/', saleController.getAllSales);
router.post('/', saleController.createSale);
router.get('/next-invoice', saleController.getNextInvoiceNo);
router.get('/:id', saleController.getSaleById);

module.exports = router;
