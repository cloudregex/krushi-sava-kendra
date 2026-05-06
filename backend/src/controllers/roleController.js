const Role = require('../models/Role');
const { logActivity } = require('../helper/logger');
const { handle200, handle201, handle204 } = require('../helper/successHandler');
const { handle404, handle500, formatSequelizeError } = require('../helper/errorHandler');

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private/SuperAdmin
exports.createRole = async (req, res) => {
  try {
    const { roleName, permissions } = req.body;

    const roleExists = await Role.findOne({ where: { roleName } });
    if (roleExists) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = await Role.create({
      roleName,
      permissions: permissions || {},
    });

    // Log activity
    await logActivity(req, 'Role', 'CREATE', `Created new role: ${role.roleName}`);

    return handle201(res, role, "Role created successfully");
  } catch (error) {
    return formatSequelizeError(res, error);
  }
};

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    return handle200(res, roles);
  } catch (error) {
    return handle500(res, error);
  }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/SuperAdmin
exports.updateRole = async (req, res) => {
  try {
    const { roleName, permissions } = req.body;
    const role = await Role.findByPk(req.params.id);

    if (role) {
      role.roleName = roleName || role.roleName;
      role.permissions = permissions || role.permissions;

      const updatedRole = await role.save();

      // Log activity
      await logActivity(req, 'Role', 'UPDATE', `Updated role: ${updatedRole.roleName}`);

      return handle200(res, updatedRole, "Role updated successfully");
    } else {
      return handle404(res, 'Role not found');
    }
  } catch (error) {
    return formatSequelizeError(res, error);
  }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/SuperAdmin
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (role) {
      const roleName = role.roleName;
      await role.destroy();

      // Log activity
      await logActivity(req, 'Role', 'DELETE', `Removed role: ${roleName}`);

      return handle200(res, null, 'Role removed successfully');
    } else {
      return handle404(res, 'Role not found');
    }
  } catch (error) {
    return handle500(res, error);
  }
};
