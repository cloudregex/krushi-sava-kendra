const ActivityLog = require('../models/ActivityLog');

const logActivity = async (req, module, action, details = null) => {
  try {
    // Robust user data extraction
    const user = req.user || req.admin || {};
    const userId = user.id || 'system-auto';
    const userName = user.userName || user.name || user.fullName || 'System';
    const userType = user.isAdmin ? 'Admin' : 'User';

    await ActivityLog.create({
      userId,
      userName,
      userType,
      module,
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { logActivity };
