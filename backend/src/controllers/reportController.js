const Promotion = require('../models/Promotion');
const Budget = require('../models/Budget');
const TradeSpend = require('../models/TradeSpend');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const SalesHistory = require('../models/SalesHistory');
const ExcelJS = require('exceljs');

const reportController = {
  // Generate promotion effectiveness report
  async generatePromotionEffectivenessReport({ promotionId, startDate, endDate }) {
    const promotion = await Promotion.findById(promotionId)
      .populate('customer')
      .populate('products');
    
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    
    // Calculate metrics
    const salesDuringPromotion = await SalesHistory.aggregate([
      {
        $match: {
          customer: promotion.customer._id,
          product: { $in: promotion.products },
          date: {
            $gte: new Date(startDate || promotion.period.startDate),
            $lte: new Date(endDate || promotion.period.endDate)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: '$units' },
          totalValue: { $sum: '$value' }
        }
      }
    ]);
    
    return {
      promotion: {
        id: promotion._id,
        name: promotion.name,
        type: promotion.promotionType,
        period: promotion.period
      },
      performance: {
        plannedSpend: promotion.plannedSpend,
        actualSpend: promotion.actualSpend || 0,
        salesVolume: salesDuringPromotion[0]?.totalUnits || 0,
        salesValue: salesDuringPromotion[0]?.totalValue || 0,
        roi: promotion.actualSpend ? 
          ((salesDuringPromotion[0]?.totalValue || 0) - promotion.actualSpend) / promotion.actualSpend : 0
      }
    };
  },
  
  // Generate budget utilization report
  async generateBudgetUtilizationReport({ budgetId, year, quarter }) {
    const query = {};
    if (budgetId) query._id = budgetId;
    if (year) query.year = year;
    
    const budgets = await Budget.find(query)
      .populate('customer')
      .populate('vendor');
    
    const reports = await Promise.all(budgets.map(async (budget) => {
      const tradeSpends = await TradeSpend.find({ budget: budget._id });
      
      const totalSpent = tradeSpends.reduce((sum, ts) => sum + (ts.actualSpend || 0), 0);
      const utilization = budget.totalAmount ? (totalSpent / budget.totalAmount) * 100 : 0;
      
      return {
        budget: {
          id: budget._id,
          name: budget.name,
          code: budget.code,
          totalAmount: budget.totalAmount
        },
        utilization: {
          spent: totalSpent,
          remaining: budget.totalAmount - totalSpent,
          percentage: utilization,
          status: utilization > 90 ? 'critical' : utilization > 75 ? 'warning' : 'healthy'
        }
      };
    }));
    
    return reports;
  },
  
  // Generate customer performance report
  async generateCustomerPerformanceReport({ customerId, startDate, endDate }) {
    const query = {};
    if (customerId) query._id = customerId;
    
    const customers = await Customer.find(query);
    
    const reports = await Promise.all(customers.map(async (customer) => {
      const salesData = await SalesHistory.aggregate([
        {
          $match: {
            customer: customer._id,
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$units' },
            totalValue: { $sum: '$value' },
            transactionCount: { $sum: 1 }
          }
        }
      ]);
      
      return {
        customer: {
          id: customer._id,
          name: customer.name,
          code: customer.code
        },
        performance: {
          salesVolume: salesData[0]?.totalUnits || 0,
          salesValue: salesData[0]?.totalValue || 0,
          transactions: salesData[0]?.transactionCount || 0,
          avgTransactionValue: salesData[0]?.transactionCount ? 
            (salesData[0].totalValue / salesData[0].transactionCount) : 0
        }
      };
    }));
    
    return reports;
  },
  
  // Generate product performance report
  async generateProductPerformanceReport({ productId, startDate, endDate }) {
    const query = {};
    if (productId) query._id = productId;
    
    const products = await Product.find(query);
    
    const reports = await Promise.all(products.map(async (product) => {
      const salesData = await SalesHistory.aggregate([
        {
          $match: {
            product: product._id,
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$units' },
            totalValue: { $sum: '$value' }
          }
        }
      ]);
      
      return {
        product: {
          id: product._id,
          name: product.name,
          sku: product.sku
        },
        performance: {
          unitsSold: salesData[0]?.totalUnits || 0,
          revenue: salesData[0]?.totalValue || 0,
          avgPrice: salesData[0]?.totalUnits ? 
            (salesData[0].totalValue / salesData[0].totalUnits) : 0
        }
      };
    }));
    
    return reports;
  },
  
  // Generate trade spend ROI report
  async generateTradeSpendROIReport({ startDate, endDate, customerId, vendorId }) {
    const query = {};
    if (customerId) query.customer = customerId;
    if (vendorId) query.vendor = vendorId;
    
    const tradeSpends = await TradeSpend.find(query)
      .populate('customer')
      .populate('vendor')
      .populate('promotions');
    
    const reports = await Promise.all(tradeSpends.map(async (ts) => {
      const salesData = await SalesHistory.aggregate([
        {
          $match: {
            customer: ts.customer._id,
            date: {
              $gte: new Date(startDate || ts.period.startDate),
              $lte: new Date(endDate || ts.period.endDate)
            }
          }
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$value' }
          }
        }
      ]);
      
      const revenue = salesData[0]?.totalValue || 0;
      const spend = ts.actualSpend || ts.plannedSpend;
      const roi = spend ? ((revenue - spend) / spend) * 100 : 0;
      
      return {
        tradeSpend: {
          id: ts._id,
          name: ts.name,
          customer: ts.customer.name,
          vendor: ts.vendor?.name
        },
        financial: {
          plannedSpend: ts.plannedSpend,
          actualSpend: ts.actualSpend || 0,
          revenue,
          roi,
          status: roi > 0 ? 'positive' : 'negative'
        }
      };
    }));
    
    return reports;
  },
  
  // Export report
  async exportReport({ reportType, filters, format }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    
    // Add headers based on report type
    switch (reportType) {
      case 'budget-utilization':
        worksheet.columns = [
          { header: 'Budget Name', key: 'name', width: 30 },
          { header: 'Code', key: 'code', width: 15 },
          { header: 'Total Amount', key: 'totalAmount', width: 15 },
          { header: 'Spent', key: 'spent', width: 15 },
          { header: 'Remaining', key: 'remaining', width: 15 },
          { header: 'Utilization %', key: 'utilization', width: 15 }
        ];
        break;
      // Add other report types...
    }
    
    // Generate report data
    let data;
    switch (reportType) {
      case 'budget-utilization':
        data = await this.generateBudgetUtilizationReport(filters);
        break;
      // Add other report types...
    }
    
    // Add data to worksheet
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        worksheet.addRow(item);
      });
    }
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },
  
  // Schedule report
  async scheduleReport({ reportType, filters, schedule, recipients, createdBy }) {
    // Implementation would save scheduled report configuration
    return {
      id: `schedule-${Date.now()}`,
      reportType,
      filters,
      schedule,
      recipients,
      createdBy,
      status: 'active',
      nextRun: new Date(Date.now() + 86400000) // Next day
    };
  }
};

module.exports = reportController;