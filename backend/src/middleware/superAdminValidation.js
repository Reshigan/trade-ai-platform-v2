const { body, param } = require('express-validator');

// Validation for creating a new company
exports.validateCreateCompany = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('domain')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Domain must contain only lowercase letters, numbers, and hyphens'),
  
  body('industry')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Industry must be between 2 and 50 characters'),
  
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('contactInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('contactInfo.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  
  body('contactInfo.address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address must be less than 200 characters'),
  
  body('contactInfo.address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  
  body('contactInfo.address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  
  body('subscription.plan')
    .optional()
    .isIn(['starter', 'professional', 'enterprise', 'custom'])
    .withMessage('Invalid subscription plan'),
  
  body('subscription.maxUsers')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max users must be between 1 and 1000'),
  
  body('subscription.maxBudgets')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max budgets must be between 1 and 100'),
  
  body('subscription.features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  body('adminUser.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('adminUser.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('adminUser.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid admin email is required'),
  
  body('adminUser.password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character')
];

// Validation for updating company
exports.validateUpdateCompany = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('industry')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Industry must be between 2 and 50 characters'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('contactInfo.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('contactInfo.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  
  body('status')
    .optional()
    .isIn(['active', 'suspended', 'inactive'])
    .withMessage('Invalid status')
];

// Validation for updating subscription
exports.validateUpdateSubscription = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID'),
  
  body('subscription.plan')
    .optional()
    .isIn(['starter', 'professional', 'enterprise', 'custom'])
    .withMessage('Invalid subscription plan'),
  
  body('subscription.maxUsers')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max users must be between 1 and 1000'),
  
  body('subscription.maxBudgets')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max budgets must be between 1 and 100'),
  
  body('subscription.features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  body('subscription.status')
    .optional()
    .isIn(['active', 'suspended', 'expired', 'cancelled'])
    .withMessage('Invalid subscription status')
];

// Validation for toggling company status
exports.validateToggleStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID'),
  
  body('status')
    .isIn(['active', 'suspended', 'inactive'])
    .withMessage('Status must be active, suspended, or inactive'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters')
];

// Validation for deleting company
exports.validateDeleteCompany = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters')
];

// Validation for getting company details
exports.validateGetCompany = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID')
];