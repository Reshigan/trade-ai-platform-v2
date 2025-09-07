const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const Vendor = require('../models/Vendor');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Get all vendors
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, type } = req.query;
  
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { sapVendorId: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) query.status = status;
  if (type) query.type = type;
  
  const vendors = await Vendor.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ name: 1 });
  
  const count = await Vendor.countDocuments(query);
  
  res.json({
    success: true,
    data: vendors,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count
  });
}));

// Get vendor by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
    .populate('products', 'name sku');
  
  if (!vendor) {
    throw new AppError('Vendor not found', 404);
  }
  
  res.json({
    success: true,
    data: vendor
  });
}));

// Create new vendor
router.post('/', authenticateToken, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const vendor = await Vendor.create({
    ...req.body,
    createdBy: req.user._id
  });
  
  res.status(201).json({
    success: true,
    data: vendor
  });
}));

// Update vendor
router.put('/:id', authenticateToken, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!vendor) {
    throw new AppError('Vendor not found', 404);
  }
  
  res.json({
    success: true,
    data: vendor
  });
}));

// Delete vendor
router.delete('/:id', authenticateToken, authorize('admin'), asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  
  if (!vendor) {
    throw new AppError('Vendor not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Vendor deleted successfully'
  });
}));

// Get vendor products
router.get('/:id/products', authenticateToken, asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
    .populate('products');
  
  if (!vendor) {
    throw new AppError('Vendor not found', 404);
  }
  
  res.json({
    success: true,
    data: vendor.products,
    count: vendor.products.length
  });
}));

module.exports = router;