const express = require('express');
const router = express.Router();
const {
  addUser,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/permissionMiddleware');

router.route('/')
  .post(protect, checkPermission('users', 'manage'), addUser)
  .get(protect, checkPermission('users', 'manage'), getUsers);

router.route('/:id')
  .put(protect, checkPermission('users', 'manage'), updateUser)
  .delete(protect, checkPermission('users', 'manage'), deleteUser);

module.exports = router;
