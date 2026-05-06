const Admin = require('../models/Admin');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../helper/logger');
const { handle200, handle201 } = require('../helper/successHandler');
const { handle401, handle404, handle500, formatSequelizeError } = require('../helper/errorHandler');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public
exports.registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const adminExists = await Admin.findOne({ where: { email } });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      fullName,
      email,
      password,
      role: role || 'admin',
    });

    if (admin) {
      return handle201(res, {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: 'all',
        token: generateToken(admin.id),
      }, "Admin registered successfully");
    } else {
      return handle500(res, new Error("Failed to register admin"));
    }
  } catch (error) {
    return formatSequelizeError(res, error);
  }
};

// @desc    Auth user (Admin or Employee) & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let account = await Admin.findOne({ where: { email } });
    let is_admin = true;

    if (!account) {
      account = await User.findOne({ 
        where: { email },
        include: [{ model: Role, as: 'role' }]
      });
      is_admin = false;
    }

    if (account && (await account.comparePassword(password))) {
      const responseData = {
        id: account.id,
        fullName: is_admin ? account.fullName : account.userName,
        email: account.email,
        role: is_admin ? account.role : account.role?.roleName,
        permissions: is_admin ? 'all' : (account.role?.permissions || {}),
        token: generateToken(account.id),
      };

      req.user = { ...responseData, isAdmin: is_admin }; 
      
      // Log activity without blocking the response too much
      logActivity(req, 'Authentication', 'LOGIN', 'User logged in successfully').catch(err => console.error('Login log failed:', err));

      return handle200(res, responseData, "Login successful");
    } else {
      return handle401(res, 'Invalid email or password');
    }
  } catch (error) {
    return handle500(res, error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getAdminProfile = async (req, res) => {
  try {
    let account = await Admin.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    let is_admin = true;

    if (!account) {
      account = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Role, as: 'role' }]
      });
      is_admin = false;
    }

    if (account) {
      const responseData = {
        ...account.toJSON(),
        fullName: is_admin ? account.fullName : account.userName,
        role: is_admin ? account.role : account.role?.roleName,
        permissions: is_admin ? 'all' : (account.role?.permissions || {}),
      };
      return handle200(res, responseData);
    } else {
      return handle404(res, 'User not found');
    }
  } catch (error) {
    return handle500(res, error);
  }
};

// @desc    Check if any admin is registered
// @route   GET /api/auth/check-admin
// @access  Public
exports.checkAdminExists = async (req, res) => {
  try {
    const adminCount = await Admin.count();
    return handle200(res, { exists: adminCount > 0 });
  } catch (error) {
    return handle500(res, error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    let account;
    if (req.user.isAdmin) {
      account = await Admin.findByPk(req.user.id);
    } else {
      account = await User.findByPk(req.user.id);
    }

    if (!account) {
      return handle404(res, 'User not found');
    }

    const isMatch = await account.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    account.password = newPassword;
    await account.save();

    await logActivity(req, 'Profile', 'UPDATE', 'Password updated successfully');

    return handle200(res, null, 'Password updated successfully');
  } catch (error) {
    return handle500(res, error);
  }
};
