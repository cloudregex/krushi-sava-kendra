const express = require('express');
const router = express.Router();
const purchaseReturnController = require('../controllers/purchaseReturnController');

router.get('/', purchaseReturnController.getAllReturns);
router.get('/:id', purchaseReturnController.getReturnById);
router.post('/', purchaseReturnController.createReturn);
router.delete('/:id', purchaseReturnController.deleteReturn);

module.exports = router;
