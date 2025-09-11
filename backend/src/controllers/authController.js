const User = require('../models/User');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { cacheService } = require('../services/cacheService');
const emailService = require('../services/emailService');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate tokens
const generateTokens = (user) => {
  const accessToken = user.generateAuthToken();
  
  const refreshToken = jwt.sign(
    { _id: user._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
  
  return { accessToken, refreshToken };
};

// Register new user
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName, employeeId, role, department } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
  if (existingUser) {
    throw new AppError('User with this email or employee ID already exists', 400);
  }
  
  // Create new user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    employeeId,
    role,
    department
  });
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  // Cache user data
  await cacheService.cacheUser(user._id.toString(), user);
  
  // Send welcome email
  await emailService.sendWelcomeEmail(user);
  
  // Log registration
  logger.logAudit('user_registered', user._id, {
    email: user.email,
    role: user.role
  });
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

// Quick login for demo
exports.quickLogin = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  
  // Map role to demo user email
  const demoUsers = {
    admin: 'admin@tradeai.com',
    manager: 'manager@tradeai.com',
    kam: 'kam@tradeai.com'
  };
  
  const email = demoUsers[role];
  if (!email) {
    throw new AppError('Invalid demo role', 400);
  }
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Demo user not found', 404);
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  // Cache user data
  await cacheService.cacheUser(user._id.toString(), user);
  
  // Log login
  logger.logAudit('quick_login', user._id, {
    email: user.email,
    role: user.role
  });
  
  res.json({
    success: true,
    message: 'Quick login successful',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
});

// Login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, companyDomain } = req.body;
  
  // For super admin, no company domain needed
  if (email === 'superadmin@tradeai.com') {
    const user = await User.findByCredentials(email, password);
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    // Log the login
    logger.info('Audit Log', {
      action: 'user_login',
      userId: user._id,
      email: user.email,
      ip: req.ip
    });
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        },
        accessToken,
        refreshToken
      }
    });
  }
  
  // For company users, require company domain
  if (!companyDomain) {
    throw new AppError('Company domain is required', 400);
  }
  
  // Find company by domain
  const company = await Company.findOne({ domain: companyDomain, isActive: true });
  if (!company) {
    throw new AppError('Invalid company domain', 400);
  }
  
  // Check if company license is valid
  if (!company.isLicenseValid()) {
    throw new AppError('Company license has expired', 403);
  }
  
  // Find user by email and company
  const user = await User.findOne({ 
    email, 
    company: company._id, 
    isActive: true 
  });
  
  if (!user) {
    throw new AppError('Invalid login credentials', 401);
  }
  
  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid login credentials', 401);
  }
  
  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    // Generate temporary token for 2FA verification
    const tempToken = jwt.sign(
      { _id: user._id, temp: true },
      config.jwt.secret,
      { expiresIn: '5m' }
    );
    
    return res.json({
      success: true,
      message: '2FA verification required',
      data: {
        requiresTwoFactor: true,
        tempToken
      }
    });
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  // Save refresh token
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();
  
  // Update company last login if applicable
  if (company) {
    company.lastLoginAt = new Date();
    await company.save();
  }
  
  // Log login
  logger.info('Audit Log', {
    action: 'user_login',
    userId: user._id,
    email: user.email,
    company: company ? company.name : 'System',
    ip: req.ip
  });
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        company: company ? {
          id: company._id,
          name: company.name,
          domain: company.domain,
          currency: company.currency,
          timezone: company.timezone,
          features: company.license.features
        } : null
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

// Verify 2FA
exports.verify2FA = asyncHandler(async (req, res, next) => {
  const { token } = req.body;
  
  // Verify the token is valid
  const verified = speakeasy.totp.verify({
    secret: req.user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });
  
  if (!verified) {
    throw new AppError('Invalid 2FA token', 401);
  }
  
  // Generate real tokens
  const { accessToken, refreshToken } = generateTokens(req.user);
  
  // Update last login
  req.user.lastLogin = new Date();
  await req.user.save();
  
  res.json({
    success: true,
    message: '2FA verification successful',
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

// Enable 2FA
exports.enable2FA = asyncHandler(async (req, res, next) => {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `FMCG Trade Spend (${req.user.email})`
  });
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  // Save secret temporarily (not enabled yet)
  req.user.twoFactorSecret = secret.base32;
  await req.user.save();
  
  res.json({
    success: true,
    message: '2FA setup initiated',
    data: {
      secret: secret.base32,
      qrCode
    }
  });
});

// Disable 2FA
exports.disable2FA = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  
  // Verify password
  const isMatch = await req.user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid password', 401);
  }
  
  // Disable 2FA
  req.user.twoFactorEnabled = false;
  req.user.twoFactorSecret = undefined;
  await req.user.save();
  
  logger.logAudit('2fa_disabled', req.user._id);
  
  res.json({
    success: true,
    message: '2FA disabled successfully'
  });
});

// Logout
exports.logout = asyncHandler(async (req, res, next) => {
  // Invalidate cache
  await cacheService.deleteSession(req.token);
  
  // Log logout
  logger.logAudit('user_logout', req.user._id);
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Refresh token
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new AppError('Refresh token required', 400);
  }
  
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  
  // Find user
  const user = await User.findById(decoded._id);
  if (!user || !user.isActive) {
    throw new AppError('Invalid refresh token', 401);
  }
  
  // Generate new tokens
  const tokens = generateTokens(user);
  
  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      tokens
    }
  });
});

// Forgot password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists
    return res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Save reset token
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();
  
  // Send reset email
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
  await emailService.sendPasswordResetEmail(user, resetUrl);
  
  logger.logAudit('password_reset_requested', user._id);
  
  res.json({
    success: true,
    message: 'If the email exists, a reset link has been sent'
  });
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;
  
  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }
  
  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  logger.logAudit('password_reset_completed', user._id);
  
  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// Change password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Generate new tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  logger.logAudit('password_changed', user._id);
  
  res.json({
    success: true,
    message: 'Password changed successfully',
    data: {
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

// Get current user
exports.getMe = asyncHandler(async (req, res, next) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// Update current user
exports.updateMe = asyncHandler(async (req, res, next) => {
  const updates = {};
  const allowedUpdates = ['firstName', 'lastName', 'preferences'];
  
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });
  
  // Update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );
  
  // Invalidate cache
  await cacheService.delete(cacheService.generateKey('user', user._id.toString()));
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});