const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateCreateCompany,
  validateUpdateCompany,
  validateUpdateSubscription,
  validateToggleStatus,
  validateDeleteCompany,
  validateGetCompany
} = require('../middleware/superAdminValidation');

// Apply authentication and super admin authorization to all routes
router.use(authenticate);
router.use(authorize('super_admin'));

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Super admin routes working', user: req.user });
});

/**
 * @swagger
 * /api/super-admin/statistics:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.get('/statistics', superAdminController.getPlatformStatistics);

/**
 * @swagger
 * /api/super-admin/companies:
 *   get:
 *     summary: Get all companies with statistics
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.get('/companies', superAdminController.getAllCompanies);

/**
 * @swagger
 * /api/super-admin/companies:
 *   post:
 *     summary: Create new company with admin user
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - domain
 *               - industry
 *               - country
 *               - contactInfo
 *               - adminUser
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ACME Corporation"
 *               domain:
 *                 type: string
 *                 example: "acme"
 *               industry:
 *                 type: string
 *                 example: "FMCG"
 *               country:
 *                 type: string
 *                 example: "South Africa"
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "contact@acme.com"
 *                   phone:
 *                     type: string
 *                     example: "+27123456789"
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *               subscription:
 *                 type: object
 *                 properties:
 *                   plan:
 *                     type: string
 *                     enum: [starter, professional, enterprise, custom]
 *                   maxUsers:
 *                     type: integer
 *                   maxBudgets:
 *                     type: integer
 *                   features:
 *                     type: array
 *                     items:
 *                       type: string
 *               adminUser:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - email
 *                   - password
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.post('/companies', validateCreateCompany, superAdminController.createCompany);

/**
 * @swagger
 * /api/super-admin/companies/{id}:
 *   get:
 *     summary: Get company details with statistics
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company details retrieved successfully
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.get('/companies/:id', validateGetCompany, superAdminController.getCompanyDetails);

/**
 * @swagger
 * /api/super-admin/companies/{id}:
 *   put:
 *     summary: Update company details
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               industry:
 *                 type: string
 *               country:
 *                 type: string
 *               contactInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.put('/companies/:id', validateUpdateCompany, superAdminController.updateCompany);

/**
 * @swagger
 * /api/super-admin/companies/{id}/subscription:
 *   put:
 *     summary: Update company subscription
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscription:
 *                 type: object
 *                 properties:
 *                   plan:
 *                     type: string
 *                     enum: [starter, professional, enterprise, custom]
 *                   maxUsers:
 *                     type: integer
 *                   maxBudgets:
 *                     type: integer
 *                   features:
 *                     type: array
 *                     items:
 *                       type: string
 *                   status:
 *                     type: string
 *                     enum: [active, suspended, expired, cancelled]
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.put('/companies/:id/subscription', validateUpdateSubscription, superAdminController.updateSubscription);

/**
 * @swagger
 * /api/super-admin/companies/{id}/status:
 *   put:
 *     summary: Toggle company status (activate/suspend/deactivate)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, inactive]
 *               reason:
 *                 type: string
 *                 description: Reason for status change
 *     responses:
 *       200:
 *         description: Company status updated successfully
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.put('/companies/:id/status', validateToggleStatus, superAdminController.toggleCompanyStatus);

/**
 * @swagger
 * /api/super-admin/companies/{id}:
 *   delete:
 *     summary: Delete company (soft delete)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for deletion
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.delete('/companies/:id', validateDeleteCompany, superAdminController.deleteCompany);

module.exports = router;