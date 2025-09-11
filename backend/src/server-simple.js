const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./utils/logger');

// Import models to ensure they are registered
require('./models/User');
require('./models/Company');
require('./models/Customer');
require('./models/Product');
require('./models/Vendor');
require('./models/Budget');
require('./models/Promotion');
require('./models/Campaign');
require('./models/TradeSpend');
require('./models/ActivityGrid');
require('./models/SalesHistory');
require('./models/MasterData');

// Import routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const userRoutes = require('./routes/user');
const customerRoutes = require('./routes/customer');
const productRoutes = require('./routes/product');
const promotionRoutes = require('./routes/promotion');
const budgetRoutes = require('./routes/budget');
const dashboardRoutes = require('./routes/dashboard');
const superAdminRoutes = require('./routes/superAdmin');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check (before auth)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import authentication middleware
const { authenticateToken } = require('./middleware/auth');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', authenticateToken, companyRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/customers', authenticateToken, customerRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/promotions', authenticateToken, promotionRoutes);
app.use('/api/budgets', authenticateToken, budgetRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`Health check available at http://localhost:${config.port}/api/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        mongoose.connection.close();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();