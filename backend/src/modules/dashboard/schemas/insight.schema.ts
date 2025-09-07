import * as mongoose from 'mongoose';

export const InsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'predictive', 
      'prescriptive', 
      'diagnostic', 
      'descriptive'
    ],
    required: true,
  },
  category: {
    type: String,
    enum: [
      'sales', 
      'marketing', 
      'trade_spend', 
      'customer_behavior', 
      'market_trends'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  recommendations: [{
    action: String,
    impact: Number,
    probability: Number,
  }],
  tags: [String],
  relevance: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
}, {
  timestamps: true,
});