const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity to the database
 * @param {Object} req - Express request object (to get user info)
 * @param {String} module - The module being accessed (e.g., 'Product', 'User')
 * @param {String} action - The action performed ('CREATE', 'UPDATE', 'DELETE', 'LOGIN')
 * @param {String} details - Optional details about the action
 */
const logActivity = async (req, module, action, details = null) => {
  try {
    // req.user comes from our authMiddleware
    if (!req.user) return;

    await ActivityLog.create({
      userId: req.user.id,
      userName: req.user.userName || req.user.name || 'Unknown',
      userType: req.user.isAdmin ? 'Admin' : 'User',
      module,
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
