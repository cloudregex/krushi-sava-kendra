const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  checkAdminExists,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protect, getAdminProfile);
router.get('/check-admin', checkAdminExists);
router.put('/update-password', protect, updatePassword);

module.exports = router;
