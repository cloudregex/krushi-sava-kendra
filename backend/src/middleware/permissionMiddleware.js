const { handle403 } = require('../helper/errorHandler');

/**
 * Middleware to check if the user has specific module and action permission
 * @param {string} module - The module name (e.g., 'product', 'sale')
 * @param {string} action - The action name (e.g., 'create', 'view', 'edit', 'delete')
 */
const checkPermission = (module, action) => {
  return (req, res, next) => {
    const user = req.admin; // Set by protect middleware

    if (!user) {
      return handle403(res, 'Access denied. User information missing.');
    }

    // SuperAdmin and Admin with 'all' permissions have full access
    if (user.role === 'superadmin' || user.role === 'admin' || user.permissions === 'all') {
      return next();
    }

    // Check permissions for Employees/Regular Users
    // user.permissions should be an object: { moduleName: ['view', 'create', ...] }
    const userPermissions = user.permissions;

    if (userPermissions && typeof userPermissions === 'object') {
      const moduleActions = userPermissions[module];
      if (Array.isArray(moduleActions) && moduleActions.includes(action)) {
        return next();
      }
    }

    return res.status(403).json({
      status: 403,
      message: `Access Denied: You do not have permission to ${action} in ${module} module.`
    });
  };
};

module.exports = checkPermission;
