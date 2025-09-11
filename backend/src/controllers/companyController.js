const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Super Admin: Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { domain: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(filter)
      .populate('userCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Company.countDocuments(filter);

    res.json({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
};

// Super Admin: Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('userCount')
      .populate('createdBy', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message
    });
  }
};

// Super Admin: Create new company
const createCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      domain,
      industry,
      country,
      currency,
      timezone,
      license,
      contactInfo,
      address,
      adminUser
    } = req.body;

    // Check if domain already exists
    const existingCompany = await Company.findOne({ domain: domain.toLowerCase() });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Domain already exists'
      });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminUser.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Admin email already exists'
      });
    }

    // Create company
    const company = new Company({
      name,
      domain: domain.toLowerCase(),
      industry,
      country,
      currency,
      timezone,
      license: {
        ...license,
        expiresAt: new Date(license.expiresAt),
        features: license.features || ['dashboard', 'budgets', 'promotions', 'trade_spend', 'analytics', 'reports']
      },
      contactInfo,
      address,
      createdBy: req.user._id,
      status: 'active'
    });

    await company.save();

    // Create admin user for the company
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    
    const admin = new User({
      company: company._id,
      employeeId: adminUser.employeeId || 'ADMIN001',
      email: adminUser.email.toLowerCase(),
      password: hashedPassword,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: 'admin',
      department: 'admin',
      isActive: true,
      permissions: [
        {
          module: 'dashboard',
          actions: ['read']
        },
        {
          module: 'budgets',
          actions: ['create', 'read', 'update', 'delete', 'approve']
        },
        {
          module: 'promotions',
          actions: ['create', 'read', 'update', 'delete', 'approve']
        },
        {
          module: 'trade_spend',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          module: 'analytics',
          actions: ['read']
        },
        {
          module: 'reports',
          actions: ['create', 'read', 'export']
        },
        {
          module: 'users',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          module: 'settings',
          actions: ['read', 'update']
        }
      ]
    });

    await admin.save();

    // Return company with admin user info
    const populatedCompany = await Company.findById(company._id)
      .populate('userCount');

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        company: populatedCompany,
        adminUser: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName
        }
      }
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company',
      error: error.message
    });
  }
};

// Super Admin: Update company
const updateCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if domain is being changed and if it already exists
    if (req.body.domain && req.body.domain.toLowerCase() !== company.domain) {
      const existingCompany = await Company.findOne({ 
        domain: req.body.domain.toLowerCase(),
        _id: { $ne: company._id }
      });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Domain already exists'
        });
      }
    }

    // Update company fields
    Object.keys(req.body).forEach(key => {
      if (key === 'domain') {
        company[key] = req.body[key].toLowerCase();
      } else if (key === 'license' && req.body[key].expiresAt) {
        company[key] = {
          ...company[key].toObject(),
          ...req.body[key],
          expiresAt: new Date(req.body[key].expiresAt)
        };
      } else {
        company[key] = req.body[key];
      }
    });

    await company.save();

    const updatedCompany = await Company.findById(company._id)
      .populate('userCount');

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message
    });
  }
};

// Super Admin: Delete/Deactivate company
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Soft delete - deactivate company and all its users
    company.isActive = false;
    company.status = 'suspended';
    await company.save();

    // Deactivate all users in the company
    await User.updateMany(
      { company: company._id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Company deactivated successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
};

// Super Admin: Get company users
const getCompanyUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const filter = { company: company._id };
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get company users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company users',
      error: error.message
    });
  }
};

// Company Admin: Get own company details
const getOwnCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company)
      .populate('userCount');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get own company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company details',
      error: error.message
    });
  }
};

// Company Admin: Update own company settings
const updateOwnCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Only allow updating certain fields
    const allowedFields = ['settings', 'contactInfo', 'address', 'logo'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    Object.keys(updates).forEach(key => {
      company[key] = updates[key];
    });

    await company.save();

    res.json({
      success: true,
      message: 'Company settings updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Update own company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company settings',
      error: error.message
    });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyUsers,
  getOwnCompany,
  updateOwnCompany
};