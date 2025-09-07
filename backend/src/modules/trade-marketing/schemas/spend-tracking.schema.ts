import * as mongoose from 'mongoose';

export const SpendTrackingSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalBudget: {
    type: Number,
    required: true,
  },
  spendEntries: [{
    date: {
      type: Date,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'advertising', 
        'promotion', 
        'digital_marketing', 
        'event', 
        'sales_support', 
        'other'
      ],
      required: true,
    },
    description: String,
    vendor: String,
    receiptUrl: String,
  }],
  summaryMetrics: {
    totalSpent: {
      type: Number,
      default: 0,
    },
    remainingBudget: {
      type: Number,
      default: function() { return this.totalBudget; },
    },
    spendRatio: {
      type: Number,
      default: 0,
    },
    projectedEndBalance: Number,
  },
  forecastAnalysis: {
    predictedSpend: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    recommendedActions: [String],
  },
  complianceChecks: [{
    type: {
      type: String,
      enum: ['budget', 'vendor', 'tax', 'approval'],
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'pending'],
    },
    details: String,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});