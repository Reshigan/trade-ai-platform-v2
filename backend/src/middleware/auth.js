const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user from database
    let user;
    
    // Check if we're in mock mode
    if (process.env.USE_MOCK_DB === 'true') {
      // For mock mode, just get the user without chaining
      user = await User.findById(decoded._id);
      // Remove password manually
      if (user) {
        delete user.password;
      }
    } else {
      // For real database, use the full query
      user = await User.findById(decoded._id)
        .select('-password')
        .populate('assignedCustomers', 'name code')
        .populate('assignedProducts', 'name sku')
        .populate('assignedVendors', 'name code');
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password recently changed. Please login again.'
      });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Check if user has specific permission
const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!req.user.hasPermission(module, action)) {
      logger.warn('Permission denied', {
        userId: req.user._id,
        module,
        action,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        message: `Permission denied for ${module}:${action}`
      });
    }
    
    next();
  };
};

// Check if user can access specific customer
const authorizeCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.customerId || req.body.customerId;
    
    if (!customerId) {
      return next();
    }
    
    // Admin and board can access all customers
    if (['admin', 'board', 'director'].includes(req.user.role)) {
      return next();
    }
    
    // Check if user is assigned to this customer
    const isAssigned = req.user.assignedCustomers.some(
      customer => customer._id.toString() === customerId
    );
    
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this customer'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Customer authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Check if user can access specific vendor
const authorizeVendor = async (req, res, next) => {
  try {
    const vendorId = req.params.vendorId || req.body.vendorId;
    
    if (!vendorId) {
      return next();
    }
    
    // Admin and board can access all vendors
    if (['admin', 'board', 'director'].includes(req.user.role)) {
      return next();
    }
    
    // Check if user is assigned to this vendor
    const isAssigned = req.user.assignedVendors.some(
      vendor => vendor._id.toString() === vendorId
    );
    
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this vendor'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Vendor authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Check approval limits
const checkApprovalLimit = (type) => {
  return async (req, res, next) => {
    try {
      const amount = req.body.amount || req.body.totalAmount;
      
      if (!amount) {
        return next();
      }
      
      if (!req.user.canApprove(type, amount)) {
        return res.status(403).json({
          success: false,
          message: `Approval limit exceeded for ${type}. Your limit is ${req.user.approvalLimits[type]}`
        });
      }
      
      next();
    } catch (error) {
      logger.error('Approval limit check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Rate limit by user role
const rateLimitByRole = (req, res, next) => {
  // Different rate limits for different roles
  const roleLimits = {
    admin: 1000,
    board: 500,
    director: 500,
    manager: 300,
    kam: 200,
    sales_rep: 100,
    sales_admin: 150,
    analyst: 200
  };
  
  const limit = roleLimits[req.user?.role] || 50;
  req.rateLimit = { max: limit };
  next();
};

module.exports = {
  authenticateToken,
  authenticate: authenticateToken, // Alias for consistency
  authorize,
  checkPermission,
  authorizeCustomer,
  authorizeVendor,
  checkApprovalLimit,
  rateLimitByRole
};