const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');
const Budget = require('../models/Budget');
const TradeSpend = require('../models/TradeSpend');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const SalesHistory = require('../models/SalesHistory');

const analyticsController = {
  // Get dashboard analytics
  async getDashboardAnalytics({ userId, period }) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get key metrics
    const [promotions, budgets, tradeSpends, sales] = await Promise.all([
      Promotion.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      Budget.aggregate([
        { $match: { year: new Date().getFullYear() } },
        { $group: { 
          _id: null, 
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }}
      ]),
      TradeSpend.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { 
          _id: null, 
          totalPlanned: { $sum: '$plannedSpend' },
          totalActual: { $sum: '$actualSpend' },
          count: { $sum: 1 }
        }}
      ]),
      SalesHistory.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        { $group: { 
          _id: null, 
          totalValue: { $sum: '$value' },
          totalUnits: { $sum: '$units' }
        }}
      ])
    ]);
    
    return {
      summary: {
        promotions: promotions || 0,
        budgets: budgets[0]?.count || 0,
        tradeSpends: tradeSpends[0]?.count || 0,
        totalBudget: budgets[0]?.totalAmount || 0,
        totalPlannedSpend: tradeSpends[0]?.totalPlanned || 0,
        totalActualSpend: tradeSpends[0]?.totalActual || 0,
        salesValue: sales[0]?.totalValue || 0,
        salesUnits: sales[0]?.totalUnits || 0
      },
      period: {
        start: startDate,
        end: endDate,
        days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      }
    };
  },
  
  // Get sales analytics
  async getSalesAnalytics({ startDate, endDate, groupBy, customerId, productId }) {
    const matchStage = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (customerId) matchStage.customer = mongoose.Types.ObjectId(customerId);
    if (productId) matchStage.product = mongoose.Types.ObjectId(productId);
    
    let groupStage;
    switch (groupBy) {
      case 'day':
        groupStage = {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalUnits: { $sum: '$units' },
          totalValue: { $sum: '$value' },
          count: { $sum: 1 }
        };
        break;
      case 'week':
        groupStage = {
          _id: { 
            year: { $year: '$date' },
            week: { $week: '$date' }
          },
          totalUnits: { $sum: '$units' },
          totalValue: { $sum: '$value' },
          count: { $sum: 1 }
        };
        break;
      case 'month':
      default:
        groupStage = {
          _id: { 
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalUnits: { $sum: '$units' },
          totalValue: { $sum: '$value' },
          count: { $sum: 1 }
        };
    }
    
    const salesData = await SalesHistory.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id': 1 } }
    ]);
    
    // Calculate trends
    const totalValue = salesData.reduce((sum, item) => sum + item.totalValue, 0);
    const totalUnits = salesData.reduce((sum, item) => sum + item.totalUnits, 0);
    const avgValue = salesData.length ? totalValue / salesData.length : 0;
    
    return {
      data: salesData,
      summary: {
        totalValue,
        totalUnits,
        avgValue,
        periods: salesData.length
      },
      groupBy
    };
  },
  
  // Get promotion analytics
  async getPromotionAnalytics({ year }) {
    const promotions = await Promotion.aggregate([
      {
        $match: {
          'period.startDate': {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: '$promotionType',
          count: { $sum: 1 },
          totalPlanned: { $sum: '$plannedSpend' },
          totalActual: { $sum: '$actualSpend' },
          avgROI: { $avg: '$roi' }
        }
      }
    ]);
    
    const monthlyData = await Promotion.aggregate([
      {
        $match: {
          'period.startDate': {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$period.startDate' },
          count: { $sum: 1 },
          spend: { $sum: '$actualSpend' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    return {
      byType: promotions,
      byMonth: monthlyData,
      year
    };
  },
  
  // Get budget analytics
  async getBudgetAnalytics({ year, customerId }) {
    const matchStage = { year };
    if (customerId) matchStage.customer = mongoose.Types.ObjectId(customerId);
    
    const budgets = await Budget.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'tradespends',
          localField: '_id',
          foreignField: 'budget',
          as: 'tradeSpends'
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          totalAmount: 1,
          spent: { $sum: '$tradeSpends.actualSpend' },
          utilization: {
            $multiply: [
              { $divide: [{ $sum: '$tradeSpends.actualSpend' }, '$totalAmount'] },
              100
            ]
          }
        }
      }
    ]);
    
    const summary = budgets.reduce((acc, budget) => {
      acc.totalBudget += budget.totalAmount;
      acc.totalSpent += budget.spent;
      return acc;
    }, { totalBudget: 0, totalSpent: 0 });
    
    summary.utilization = summary.totalBudget ? 
      (summary.totalSpent / summary.totalBudget) * 100 : 0;
    
    return {
      budgets,
      summary,
      year
    };
  },
  
  // Get trade spend analytics
  async getTradeSpendAnalytics({ startDate, endDate, customerId, vendorId }) {
    const matchStage = {};
    
    if (startDate || endDate) {
      matchStage['period.startDate'] = {};
      if (startDate) matchStage['period.startDate'].$gte = new Date(startDate);
      if (endDate) matchStage['period.startDate'].$lte = new Date(endDate);
    }
    
    if (customerId) matchStage.customer = mongoose.Types.ObjectId(customerId);
    if (vendorId) matchStage.vendor = mongoose.Types.ObjectId(vendorId);
    
    const tradeSpends = await TradeSpend.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPlanned: { $sum: '$plannedSpend' },
          totalActual: { $sum: '$actualSpend' }
        }
      }
    ]);
    
    const byCustomer = await TradeSpend.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$customer',
          count: { $sum: 1 },
          totalSpend: { $sum: '$actualSpend' }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 }
    ]);
    
    return {
      byStatus: tradeSpends,
      topCustomers: byCustomer
    };
  },
  
  // Get customer analytics
  async getCustomerAnalytics({ period }) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '12months':
      default:
        startDate.setMonth(startDate.getMonth() - 12);
    }
    
    const customerPerformance = await SalesHistory.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$customer',
          totalValue: { $sum: '$value' },
          totalUnits: { $sum: '$units' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      { $sort: { totalValue: -1 } },
      { $limit: 20 }
    ]);
    
    return {
      topCustomers: customerPerformance,
      period: {
        start: startDate,
        end: endDate
      }
    };
  },
  
  // Get product analytics
  async getProductAnalytics({ period, category }) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '12months':
      default:
        startDate.setMonth(startDate.getMonth() - 12);
    }
    
    const matchStage = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    const productPerformance = await SalesHistory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$product',
          totalValue: { $sum: '$value' },
          totalUnits: { $sum: '$units' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: category ? { 'product.category.primary': category } : {} },
      { $sort: { totalValue: -1 } },
      { $limit: 20 }
    ]);
    
    return {
      topProducts: productPerformance,
      period: {
        start: startDate,
        end: endDate
      },
      category
    };
  },
  
  // Get predictive analytics
  async getPredictiveAnalytics({ type, targetId, horizon }) {
    // Mock predictive data - in real implementation, this would call ML service
    const predictions = [];
    const baseValue = Math.random() * 100000 + 50000;
    
    for (let i = 1; i <= horizon; i++) {
      predictions.push({
        period: i,
        predicted: baseValue * (1 + (Math.random() - 0.5) * 0.2),
        lowerBound: baseValue * 0.8,
        upperBound: baseValue * 1.2,
        confidence: 0.75 + Math.random() * 0.2
      });
    }
    
    return {
      type,
      targetId,
      horizon,
      predictions,
      generatedAt: new Date(),
      model: {
        name: `${type}-prediction-model`,
        version: '1.0.0',
        accuracy: 0.82
      }
    };
  }
};

module.exports = analyticsController;