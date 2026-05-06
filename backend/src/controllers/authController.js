const Admin = require('../models/Admin');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { handle200, handle201 } = require('../helper/successHandler');
const { handle401, handle500, formatSequelizeError } = require('../helper/errorHandler');
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
        permissions: 'all', // SuperAdmin/Admin has all permissions
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

    // Check Admin table first
    let account = await Admin.findOne({ where: { email } });
    let is_admin = true;

    if (!account) {
      // Check User table
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
    // Check Admin table
    let account = await Admin.findByPk(req.admin.id, {
      attributes: { exclude: ['password'] }
    });
    let is_admin = true;

    if (!account) {
      // Check User table
      account = await User.findByPk(req.admin.id, {
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
      return handle401(res, 'User not found');
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
