const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try finding in Admin table first
      let account = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      let is_admin = true;

      // If not found in Admin, check User table
      if (!account) {
        account = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] },
          include: [{ model: Role, as: 'role' }]
        });
        is_admin = false;
      }

      if (!account) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user info to the request object
      const userData = account.toJSON();
      userData.isAdmin = is_admin;
      userData.permissions = is_admin ? 'all' : (account.role?.permissions || {});
      
      req.user = userData;
      req.admin = userData; // Keep req.admin for backward compatibility

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a superadmin' });
  }
};

module.exports = { protect, superAdmin };
