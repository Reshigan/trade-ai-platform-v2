import * as mongoose from 'mongoose';

export const PromotionalAnalyticsSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  promotionType: {
    type: String,
    enum: [
      'price_discount', 
      'bundle_deal', 
      'buy_one_get_one', 
      'volume_discount', 
      'loyalty_reward'
    ],
    required: true,
  },
  baselineMetrics: {
    averagePrice: Number,
    averageSalesVolume: Number,
    profitMargin: Number,
  },
  promotionalPeriod: {
    startDate: Date,
    endDate: Date,
    duration: Number, // in days
  },
  analysisWindow: {
    prePeriod: {
      startDate: Date,
      endDate: Date,
      duration: Number, // in days
    },
    postPeriod: {
      startDate: Date,
      endDate: Date,
      duration: Number, // in days
    },
  },
  pricingStrategy: {
    originalPrice: Number,
    promotionalPrice: Number,
    discountPercentage: Number,
  },
  salesData: {
    prePeriod: {
      totalSales: Number,
      averageDailySales: Number,
      revenue: Number,
    },
    promotionPeriod: {
      totalSales: Number,
      averageDailySales: Number,
      revenue: Number,
    },
    postPeriod: {
      totalSales: Number,
      averageDailySales: Number,
      revenue: Number,
    },
  },
  performanceMetrics: {
    salesLift: {
      percentage: Number,
      absoluteIncrease: Number,
    },
    profitabilityImpact: {
      netProfit: Number,
      profitMarginChange: Number,
    },
    customerAcquisition: {
      newCustomers: Number,
      customerAcquisitionCost: Number,
    },
  },
  aiPredictions: {
    successProbability: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    recommendedActions: [{
      action: String,
      probability: Number,
      impact: Number,
    }],
    riskFactors: [{
      factor: String,
      riskScore: Number,
    }],
  },
  competitiveAnalysis: {
    competitorResponses: [{
      competitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Competitor',
      },
      responseType: {
        type: String,
        enum: ['price_match', 'counter_promotion', 'no_response']
      },
      impact: Number,
    }],
  },
  customerSegmentAnalysis: [{
    segment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerSegment',
    },
    responseRate: Number,
    averageSpend: Number,
    repeatPurchaseRate: Number,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});