const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;
