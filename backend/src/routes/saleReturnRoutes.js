const express = require('express');
const router = express.Router();
const saleReturnController = require('../controllers/saleReturnController');

router.get('/', saleReturnController.getAllReturns);
router.get('/:id', saleReturnController.getReturnById);
router.post('/', saleReturnController.createReturn);
router.delete('/:id', saleReturnController.deleteReturn);

module.exports = router;
