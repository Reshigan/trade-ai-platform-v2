const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Get all users (admin only)
router.get('/', authenticateToken, authorize('admin'), asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: users.length,
    data: users
  });
}));

// Get current user profile
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  res.json({
    success: true,
    data: user
  });
}));

// Get user by ID (admin only)
router.get('/:id', authenticateToken, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.json({
    success: true,
    data: user
  });
}));

// Update current user profile
router.put('/me', authenticateToken, asyncHandler(async (req, res) => {
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'preferences'];
  const updates = Object.keys(req.body)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {});
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({
    success: true,
    data: user
  });
}));

// Update user by ID (admin only)
router.put('/:id', authenticateToken, authorize('admin'), asyncHandler(async (req, res) => {
  const { password, ...updates } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.json({
    success: true,
    data: user
  });
}));

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

module.exports = router;