const express = require('express');
const router = express.Router();
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, superAdmin, createRole)
  .get(protect, getRoles);

router.route('/:id')
  .put(protect, superAdmin, updateRole)
  .delete(protect, superAdmin, deleteRole);

module.exports = router;
