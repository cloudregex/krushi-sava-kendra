const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

router.get('/', quotationController.getAllQuotations);
router.get('/next-quotation-no', quotationController.getNextQuotationNo);
router.get('/:id', quotationController.getQuotationById);
router.post('/', quotationController.createQuotation);
router.put('/:id', quotationController.updateQuotation);
router.patch('/:id/accept', quotationController.acceptQuotation);
router.delete('/:id', quotationController.deleteQuotation);

module.exports = router;
