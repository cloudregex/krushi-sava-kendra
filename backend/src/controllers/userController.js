const User = require('../models/User');
const Role = require('../models/Role');
const { logActivity } = require('../helper/logger');
const { handle200, handle201 } = require('../helper/successHandler');
const { handle404, handle500, formatSequelizeError } = require('../helper/errorHandler');

// @desc    Add a new user
// @route   POST /api/users
// @access  Private/Admin
exports.addUser = async (req, res) => {
  try {
    const { userName, email, password, roleId } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      userName,
      email,
      password,
      roleId,
    });

    // Log activity
    await logActivity(req, 'User', 'CREATE', `Added new user: ${user.userName} (${user.email})`);

    return handle201(res, user, "User added successfully");
  } catch (error) {
    return formatSequelizeError(res, error);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: 'role', attributes: ['roleName', 'permissions'] }],
      attributes: { exclude: ['password'] }
    });
    return handle200(res, users);
  } catch (error) {
    return handle500(res, error);
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { userName, email, roleId } = req.body;
    const user = await User.findByPk(req.params.id);

    if (user) {
      user.userName = userName || user.userName;
      user.email = email || user.email;
      user.roleId = roleId || user.roleId;

      const updatedUser = await user.save();

      // Log activity
      await logActivity(req, 'User', 'UPDATE', `Updated user details: ${updatedUser.userName}`);

      return handle200(res, updatedUser, "User updated successfully");
    } else {
      return handle404(res, 'User not found');
    }
  } catch (error) {
    return formatSequelizeError(res, error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (user) {
      const userName = user.userName;
      await user.destroy();

      // Log activity
      await logActivity(req, 'User', 'DELETE', `Removed user: ${userName}`);

      return handle200(res, null, 'User removed successfully');
    } else {
      return handle404(res, 'User not found');
    }
  } catch (error) {
    return handle500(res, error);
  }
};
