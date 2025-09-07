const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const Customer = require('../models/Customer');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Get all customers
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, channel } = req.query;
  
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { sapCustomerId: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) query.status = status;
  if (channel) query.channel = channel;
  
  const customers = await Customer.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ name: 1 });
  
  const count = await Customer.countDocuments(query);
  
  res.json({
    success: true,
    data: customers,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count
  });
}));

// Get customer by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  
  res.json({
    success: true,
    data: customer
  });
}));

// Create new customer
router.post('/', authenticateToken, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const customer = await Customer.create({
    ...req.body,
    createdBy: req.user._id
  });
  
  res.status(201).json({
    success: true,
    data: customer
  });
}));

// Update customer
router.put('/:id', authenticateToken, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  
  res.json({
    success: true,
    data: customer
  });
}));

// Delete customer
router.delete('/:id', authenticateToken, authorize('admin'), asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Customer deleted successfully'
  });
}));

// Get customer hierarchy
router.get('/:id/hierarchy', authenticateToken, asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  
  if (!customer) {
    throw new AppError('Customer not found', 404);
  }
  
  // Get parent and children
  const [parent, children] = await Promise.all([
    customer.parent ? Customer.findById(customer.parent) : null,
    Customer.find({ parent: customer._id })
  ]);
  
  res.json({
    success: true,
    data: {
      customer,
      parent,
      children
    }
  });
}));

module.exports = router;