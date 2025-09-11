const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  // Company reference for multi-tenancy
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Promotion Identification
  promotionId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Promotion Type and Mechanics
  promotionType: {
    type: String,
    enum: ['price_discount', 'volume_discount', 'bogo', 'bundle', 'gift', 'loyalty', 'display', 'feature'],
    required: true
  },
  mechanics: {
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'price_point']
    },
    discountValue: Number,
    buyQuantity: Number,
    getQuantity: Number,
    bundleProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number
    }],
    giftProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    minimumPurchase: Number,
    maximumDiscount: Number
  },
  
  // Timing
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    sellInStartDate: Date,
    sellInEndDate: Date
  },
  
  // Analysis Windows (6 weeks before, during, 6 weeks after)
  analysisWindows: {
    baseline: {
      startDate: Date,
      endDate: Date,
      weeks: { type: Number, default: 6 }
    },
    promotion: {
      startDate: Date,
      endDate: Date
    },
    post: {
      startDate: Date,
      endDate: Date,
      weeks: { type: Number, default: 6 }
    }
  },
  
  // Scope
  scope: {
    customers: [{
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
      },
      stores: [String],
      exclusions: [String]
    }],
    customerHierarchy: [{
      level: Number,
      value: String
    }],
    customerGroups: [String],
    channels: [String],
    regions: [String]
  },
  
  // Products
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    regularPrice: Number,
    promotionalPrice: Number,
    expectedLift: Number,
    minimumOrder: Number
  }],
  productHierarchy: [{
    level: Number,
    value: String
  }],
  
  // Financial Planning
  financial: {
    // Planned volumes and values
    planned: {
      baselineVolume: Number,
      promotionalVolume: Number,
      incrementalVolume: Number,
      volumeLift: Number,
      baselineRevenue: Number,
      promotionalRevenue: Number,
      incrementalRevenue: Number
    },
    
    // Actual performance
    actual: {
      baselineVolume: Number,
      promotionalVolume: Number,
      incrementalVolume: Number,
      volumeLift: Number,
      baselineRevenue: Number,
      promotionalRevenue: Number,
      incrementalRevenue: Number
    },
    
    // Costs
    costs: {
      discountCost: Number,
      marketingCost: Number,
      cashCoopCost: Number,
      displayCost: Number,
      logisticsCost: Number,
      totalCost: Number
    },
    
    // Profitability
    profitability: {
      grossProfit: Number,
      netProfit: Number,
      roi: Number,
      profitPerUnit: Number
    }
  },
  
  // Budget Allocation
  budgetAllocation: {
    marketing: {
      budgetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
      },
      amount: Number,
      approved: Boolean
    },
    cashCoop: {
      budgetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
      },
      amount: Number,
      approved: Boolean
    },
    tradingTerms: {
      amount: Number,
      approved: Boolean
    }
  },
  
  // AI Analysis and Recommendations
  aiAnalysis: {
    recommendedPrice: Number,
    recommendedVolumeLift: Number,
    confidenceScore: Number,
    optimizationSuggestions: [{
      suggestion: String,
      impact: String,
      priority: String
    }],
    cannibalizationRisk: Number,
    elasticityFactor: Number,
    seasonalityIndex: Number,
    competitiveIndex: Number
  },
  
  // Performance Metrics
  performance: {
    // Pre-promotion baseline (6 weeks)
    baseline: {
      avgWeeklyVolume: Number,
      avgWeeklyRevenue: Number,
      avgPrice: Number,
      volatility: Number
    },
    
    // During promotion
    promotion: {
      totalVolume: Number,
      totalRevenue: Number,
      avgPrice: Number,
      peakDayVolume: Number,
      stockouts: Number
    },
    
    // Post-promotion (6 weeks)
    post: {
      avgWeeklyVolume: Number,
      avgWeeklyRevenue: Number,
      pantryLoading: Number,
      returnToBaseline: Number
    },
    
    // Calculated metrics
    metrics: {
      trueLift: Number,
      incrementalProfit: Number,
      effectiveness: Number,
      efficiency: Number,
      score: Number
    }
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Approvals
  approvals: [{
    level: {
      type: String,
      enum: ['kam', 'manager', 'finance', 'trade_marketing', 'director']
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'conditional'],
      default: 'pending'
    },
    comments: String,
    conditions: String,
    date: Date
  }],
  
  // Execution Details
  execution: {
    poNumber: String,
    invoiceNumbers: [String],
    actualStartDate: Date,
    actualEndDate: Date,
    executionNotes: String,
    issues: [{
      issue: String,
      impact: String,
      resolution: String,
      date: Date
    }]
  },
  
  // Supporting Documents
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['contract', 'po', 'invoice', 'report', 'creative', 'other']
    },
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedDate: Date
  }],
  
  // Campaign Association
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  
  // Created/Modified By
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // History
  history: [{
    action: String,
    changes: mongoose.Schema.Types.Mixed,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedDate: Date,
    comment: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
promotionSchema.index({ promotionId: 1 });
promotionSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
promotionSchema.index({ status: 1 });
promotionSchema.index({ promotionType: 1 });
promotionSchema.index({ 'scope.customers.customer': 1 });
promotionSchema.index({ 'products.product': 1 });
promotionSchema.index({ campaign: 1 });

// Pre-save middleware
promotionSchema.pre('save', function(next) {
  // Set analysis windows based on promotion period
  if (this.isModified('period.startDate') || this.isModified('period.endDate')) {
    const startDate = new Date(this.period.startDate);
    const endDate = new Date(this.period.endDate);
    
    // Baseline: 6 weeks before
    this.analysisWindows.baseline.endDate = new Date(startDate);
    this.analysisWindows.baseline.endDate.setDate(startDate.getDate() - 1);
    this.analysisWindows.baseline.startDate = new Date(this.analysisWindows.baseline.endDate);
    this.analysisWindows.baseline.startDate.setDate(
      this.analysisWindows.baseline.startDate.getDate() - (7 * this.analysisWindows.baseline.weeks)
    );
    
    // Promotion period
    this.analysisWindows.promotion.startDate = startDate;
    this.analysisWindows.promotion.endDate = endDate;
    
    // Post: 6 weeks after
    this.analysisWindows.post.startDate = new Date(endDate);
    this.analysisWindows.post.startDate.setDate(endDate.getDate() + 1);
    this.analysisWindows.post.endDate = new Date(this.analysisWindows.post.startDate);
    this.analysisWindows.post.endDate.setDate(
      this.analysisWindows.post.endDate.getDate() + (7 * this.analysisWindows.post.weeks)
    );
  }
  
  // Calculate total costs
  if (this.isModified('financial.costs')) {
    this.financial.costs.totalCost = 
      (this.financial.costs.discountCost || 0) +
      (this.financial.costs.marketingCost || 0) +
      (this.financial.costs.cashCoopCost || 0) +
      (this.financial.costs.displayCost || 0) +
      (this.financial.costs.logisticsCost || 0);
  }
  
  // Calculate profitability metrics
  if (this.financial.actual.incrementalRevenue && this.financial.costs.totalCost) {
    this.financial.profitability.netProfit = 
      this.financial.actual.incrementalRevenue - this.financial.costs.totalCost;
    
    this.financial.profitability.roi = 
      (this.financial.profitability.netProfit / this.financial.costs.totalCost) * 100;
  }
  
  next();
});

// Methods
promotionSchema.methods.calculatePerformance = async function(salesData) {
  // This would be called with actual sales data to calculate performance
  // Implementation would analyze sales in the three time windows
  
  // Calculate baseline average
  const baselineSales = salesData.filter(sale => 
    sale.date >= this.analysisWindows.baseline.startDate &&
    sale.date <= this.analysisWindows.baseline.endDate
  );
  
  if (baselineSales.length > 0) {
    this.performance.baseline.avgWeeklyVolume = 
      baselineSales.reduce((sum, sale) => sum + sale.volume, 0) / this.analysisWindows.baseline.weeks;
    this.performance.baseline.avgWeeklyRevenue = 
      baselineSales.reduce((sum, sale) => sum + sale.revenue, 0) / this.analysisWindows.baseline.weeks;
  }
  
  // Similar calculations for promotion and post periods...
  
  await this.save();
};

promotionSchema.methods.submitForApproval = async function(userId) {
  this.status = 'pending_approval';
  this.lastModifiedBy = userId;
  
  this.history.push({
    action: 'submitted_for_approval',
    performedBy: userId,
    performedDate: new Date()
  });
  
  await this.save();
};

promotionSchema.methods.approve = async function(level, userId, comments) {
  const approval = this.approvals.find(a => a.level === level);
  if (approval) {
    approval.status = 'approved';
    approval.approver = userId;
    approval.comments = comments;
    approval.date = new Date();
  }
  
  // Check if all required approvals are complete
  const allApproved = this.approvals.every(a => a.status === 'approved');
  if (allApproved) {
    this.status = 'approved';
  }
  
  this.history.push({
    action: 'approved',
    performedBy: userId,
    performedDate: new Date(),
    comment: `${level} approval: ${comments}`
  });
  
  await this.save();
};

// Statics
promotionSchema.statics.findOverlapping = function(customerId, productId, startDate, endDate) {
  return this.find({
    $or: [
      { 'scope.customers.customer': customerId },
      { 'products.product': productId }
    ],
    $or: [
      {
        'period.startDate': { $lte: endDate },
        'period.endDate': { $gte: startDate }
      }
    ],
    status: { $in: ['approved', 'active'] }
  });
};

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;