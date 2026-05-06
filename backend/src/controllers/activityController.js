const ActivityLog = require('../models/ActivityLog');
const { handle200 } = require('../helper/successHandler');
const { handle500 } = require('../helper/errorHandler');

// @desc    Get current user's activity logs
// @route   GET /api/activity-logs/me
// @access  Private
exports.getMyLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 100, // Limit to last 100 logs
    });

    return handle200(res, logs);
  } catch (error) {
    return handle500(res, error);
  }
};

// @desc    Get all activity logs (Admin only)
// @route   GET /api/activity-logs
// @access  Private/Admin
exports.getAllLogs = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const logs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    return handle200(res, logs);
  } catch (error) {
    return handle500(res, error);
  }
};
