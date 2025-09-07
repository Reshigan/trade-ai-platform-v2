import * as mongoose from 'mongoose';

export const PerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
  },
  metrics: {
    salesVolume: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    profitMargin: {
      type: Number,
      default: 0,
    },
    marketShare: {
      type: Number,
      default: 0,
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
    },
  },
  comparativeAnalysis: {
    previousPeriod: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    yearOverYear: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  trendData: [{
    date: Date,
    value: Number,
  }],
  segments: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});