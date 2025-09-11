const Company = require('../models/Company');
const User = require('../models/User');
const Budget = require('../models/Budget');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

/**
 * Super Admin Controller
 * Handles company management, license allocation, and admin user creation
 */

// Get all companies with statistics
exports.getAllCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get companies with user counts and basic stats
    const companies = await Company.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get statistics for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const [userCount, budgetCount] = await Promise.all([
          User.countDocuments({ company: company._id }),
          Budget.countDocuments({ company: company._id })
        ]);

        return {
          ...company,
          statistics: {
            userCount,
            budgetCount,
            isActive: company.status === 'active'
          }
        };
      })
    );

    const total = await Company.countDocuments();

    res.json({
      success: true,
      data: companiesWithStats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
};

// Create new company
exports.createCompany = async (req, res) => {
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
      contactInfo,
      subscription,
      adminUser
    } = req.body;

    // Check if company domain already exists
    const existingCompany = await Company.findOne({ domain });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company domain already exists'
      });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminUser.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Admin email already exists'
      });
    }

    // Create company
    const company = new Company({
      name,
      slug: domain, // Use domain as slug
      domain,
      industry,
      country,
      contactInfo,
      license: {
        type: subscription.plan || 'trial',
        maxUsers: subscription.maxUsers || 10,
        maxDataRetentionMonths: 12,
        features: subscription.features || ['dashboard', 'budgets', 'promotions', 'analytics'],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true
      },
      status: 'active',
      createdBy: req.user.id
    });

    await company.save();

    // Create admin user for the company
    const admin = new User({
      employeeId: `${domain.toUpperCase()}001`, // Generate employee ID
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      email: adminUser.email,
      password: adminUser.password, // Let the pre-save hook handle hashing
      role: 'admin',
      department: 'admin',
      company: company._id,
      permissions: [
        { module: 'companies', actions: ['read', 'update'] },
        { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'budgets', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'promotions', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'reports', actions: ['read', 'export'] },
        { module: 'analytics', actions: ['read'] }
      ]
    });

    await admin.save();

    // Update company with admin user reference
    company.adminUsers = [admin._id];
    await company.save();

    // Log the action
    logger.info('Company created by super admin', {
      action: 'company_creation',
      companyId: company._id,
      companyName: company.name,
      adminUserId: admin._id,
      createdBy: req.user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Company and admin user created successfully',
      data: {
        company: {
          id: company._id,
          name: company.name,
          domain: company.domain,
          status: company.status,
          subscription: company.subscription
        },
        adminUser: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role
        }
      }
    });

  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company',
      error: error.message
    });
  }
};

// Update company details
exports.updateCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.createdBy;

    // Get the existing company first
    const existingCompany = await Company.findById(id);
    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Handle license updates carefully
    if (updates.license) {
      updates.license = {
        ...existingCompany.license.toObject(),
        ...updates.license
      };
    }

    const company = await Company.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Log the action
    logger.info('Company updated by super admin', {
      action: 'company_update',
      companyId: company._id,
      companyName: company.name,
      updatedBy: req.user.id,
      updates: Object.keys(updates),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });

  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message
    });
  }
};

// Update company subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscription } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update subscription details
    company.subscription = {
      ...company.subscription,
      ...subscription,
      updatedAt: new Date()
    };

    await company.save();

    // Log the action
    logger.info('Company subscription updated by super admin', {
      action: 'subscription_update',
      companyId: company._id,
      companyName: company.name,
      updatedBy: req.user.id,
      newPlan: subscription.plan,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        company: company.name,
        subscription: company.subscription
      }
    });

  } catch (error) {
    logger.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
};

// Suspend/Activate company
exports.toggleCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, suspended, or inactive'
      });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const oldStatus = company.status;
    company.status = status;
    company.statusHistory = company.statusHistory || [];
    company.statusHistory.push({
      status: oldStatus,
      changedTo: status,
      reason: reason || 'Status changed by super admin',
      changedBy: req.user.id,
      changedAt: new Date()
    });

    await company.save();

    // If suspending, also suspend all company users
    if (status === 'suspended') {
      await User.updateMany(
        { company: company._id },
        { status: 'suspended', suspendedAt: new Date() }
      );
    } else if (status === 'active' && oldStatus === 'suspended') {
      // Reactivate users when company is reactivated
      await User.updateMany(
        { company: company._id, status: 'suspended' },
        { status: 'active', $unset: { suspendedAt: 1 } }
      );
    }

    // Log the action
    logger.info('Company status changed by super admin', {
      action: 'company_status_change',
      companyId: company._id,
      companyName: company.name,
      oldStatus,
      newStatus: status,
      reason,
      changedBy: req.user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `Company ${status === 'active' ? 'activated' : status} successfully`,
      data: {
        company: company.name,
        status: company.status,
        previousStatus: oldStatus
      }
    });

  } catch (error) {
    logger.error('Error changing company status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change company status',
      error: error.message
    });
  }
};

// Get company details with full statistics
exports.getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .populate('adminUsers', 'firstName lastName email status')
      .select('-__v')
      .lean();

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get detailed statistics
    const [
      userCount,
      activeUserCount,
      budgetCount,
      activeBudgetCount
    ] = await Promise.all([
      User.countDocuments({ company: company._id }),
      User.countDocuments({ company: company._id, status: 'active' }),
      Budget.countDocuments({ company: company._id }),
      Budget.countDocuments({ company: company._id, status: 'active' })
    ]);

    // Get recent users
    const recentUsers = await User.find({ company: company._id })
      .select('firstName lastName email role status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        ...company,
        statistics: {
          users: {
            total: userCount,
            active: activeUserCount,
            inactive: userCount - activeUserCount
          },
          budgets: {
            total: budgetCount,
            active: activeBudgetCount,
            inactive: budgetCount - activeBudgetCount
          }
        },
        recentUsers
      }
    });

  } catch (error) {
    logger.error('Error fetching company details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company details',
      error: error.message
    });
  }
};

// Get platform statistics for super admin dashboard
exports.getPlatformStatistics = async (req, res) => {
  try {
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      activeUsers,
      totalBudgets
    ] = await Promise.all([
      Company.countDocuments(),
      Company.countDocuments({ status: 'active' }),
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      Budget.countDocuments()
    ]);

    // Get companies by subscription plan
    const subscriptionStats = await Company.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent companies
    const recentCompanies = await Company.find()
      .select('name domain status createdAt subscription.plan')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get companies by status
    const statusStats = await Company.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalCompanies,
          activeCompanies,
          suspendedCompanies: totalCompanies - activeCompanies,
          totalUsers,
          activeUsers,
          totalBudgets
        },
        subscriptionPlans: subscriptionStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        companyStatus: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentCompanies
      }
    });

  } catch (error) {
    logger.error('Error fetching platform statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
      error: error.message
    });
  }
};

// Delete company (soft delete)
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Soft delete - mark as deleted but keep data
    company.status = 'deleted';
    company.deletedAt = new Date();
    company.deletedBy = req.user.id;
    company.deletionReason = reason || 'Deleted by super admin';
    
    await company.save();

    // Also soft delete all company users
    await User.updateMany(
      { company: company._id },
      { 
        status: 'deleted',
        deletedAt: new Date(),
        deletedBy: req.user.id
      }
    );

    // Log the action
    logger.info('Company deleted by super admin', {
      action: 'company_deletion',
      companyId: company._id,
      companyName: company.name,
      reason,
      deletedBy: req.user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Company deleted successfully',
      data: {
        company: company.name,
        deletedAt: company.deletedAt
      }
    });

  } catch (error) {
    logger.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
};