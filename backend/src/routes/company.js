const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const companyController = require('../controllers/companyController');
const { authenticateToken } = require('../middleware/auth');

// Validation middleware
const validateCompanyCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('domain')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Domain must contain only lowercase letters, numbers, and hyphens'),
  body('industry')
    .isIn(['FMCG', 'Retail', 'Manufacturing', 'Distribution', 'Other'])
    .withMessage('Invalid industry'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country is required'),
  body('currency')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('license.type')
    .isIn(['trial', 'basic', 'professional', 'enterprise'])
    .withMessage('Invalid license type'),
  body('license.maxUsers')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max users must be between 1 and 10000'),
  body('license.expiresAt')
    .isISO8601()
    .withMessage('Invalid expiration date'),
  body('adminUser.firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Admin first name is required'),
  body('adminUser.lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Admin last name is required'),
  body('adminUser.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid admin email is required'),
  body('adminUser.password')
    .isLength({ min: 8 })
    .withMessage('Admin password must be at least 8 characters')
];

const validateCompanyUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('domain')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Domain must contain only lowercase letters, numbers, and hyphens'),
  body('industry')
    .optional()
    .isIn(['FMCG', 'Retail', 'Manufacturing', 'Distribution', 'Other'])
    .withMessage('Invalid industry'),
  body('license.type')
    .optional()
    .isIn(['trial', 'basic', 'professional', 'enterprise'])
    .withMessage('Invalid license type'),
  body('license.maxUsers')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max users must be between 1 and 10000'),
  body('license.expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date')
];

// Middleware to check super admin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  next();
};

// Middleware to check admin role (company admin or super admin)
const requireAdmin = (req, res, next) => {
  if (!['super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Super Admin Routes
router.get('/', requireSuperAdmin, companyController.getAllCompanies);
router.get('/:id', requireSuperAdmin, companyController.getCompanyById);
router.post('/', requireSuperAdmin, validateCompanyCreation, companyController.createCompany);
router.put('/:id', requireSuperAdmin, validateCompanyUpdate, companyController.updateCompany);
router.delete('/:id', requireSuperAdmin, companyController.deleteCompany);
router.get('/:id/users', requireSuperAdmin, companyController.getCompanyUsers);

// Company Admin Routes
router.get('/own/details', requireAdmin, companyController.getOwnCompany);
router.put('/own/settings', requireAdmin, companyController.updateOwnCompany);

module.exports = router;