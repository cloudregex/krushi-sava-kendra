const express = require('express');
const router = express.Router();
const taxController = require('../controller/taxController');

router.get('/', taxController.getAll);
router.get('/:id', taxController.getById);
router.post('/', taxController.create);
router.put('/:id', taxController.update);
router.delete('/:id', taxController.delete);

module.exports = router;
