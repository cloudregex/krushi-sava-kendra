const express = require('express');
const router = express.Router();
const { getMyLogs, getAllLogs } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyLogs);
router.get('/', protect, getAllLogs);

module.exports = router;
