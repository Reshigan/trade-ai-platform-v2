const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Import route modules
const authRoutes = require('./auth');
const companyRoutes = require('./company');
const budgetRoutes = require('./budget');
const promotionRoutes = require('./promotion');
const tradeSpendRoutes = require('./tradeSpend');
const dashboardRoutes = require('./dashboard');
const sapRoutes = require('./sap');
const activityGridRoutes = require('./activityGrid');
const aiChatbotRoutes = require('./aiChatbot');
const customerRoutes = require('./customer');
const productRoutes = require('./product');

// Mount routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/companies', authenticateToken, companyRoutes);
router.use('/budgets', authenticateToken, budgetRoutes);
router.use('/promotions', authenticateToken, promotionRoutes);
router.use('/trade-spends', authenticateToken, tradeSpendRoutes);
router.use('/dashboards', authenticateToken, dashboardRoutes);
router.use('/sap', authenticateToken, sapRoutes);
router.use('/activity-grid', authenticateToken, activityGridRoutes);
router.use('/ai/chatbot', authenticateToken, aiChatbotRoutes);
router.use('/customers', authenticateToken, customerRoutes);
router.use('/products', authenticateToken, productRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API documentation
router.get('/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      budgets: '/api/budgets',
      promotions: '/api/promotions',
      tradeSpends: '/api/trade-spends',
      dashboards: '/api/dashboards',
      sap: '/api/sap'
    }
  });
});

module.exports = router;