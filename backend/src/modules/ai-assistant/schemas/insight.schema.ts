import * as mongoose from 'mongoose';

export const InsightSchema = new mongoose.Schema({
  user: {
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
  domain: {
    type: String,
    enum: [
      'trade_marketing', 
      'sales', 
      'budget', 
      'performance', 
      'customer_behavior'
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
  relatedEntities: [{
    type: {
      type: String,
      enum: [
        'campaign', 
        'proposal', 
        'budget', 
        'performance', 
        'kpi'
      ],
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntities.type',
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});