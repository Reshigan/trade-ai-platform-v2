import * as mongoose from 'mongoose';

export const PredictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'sales_forecast', 
      'market_trend', 
      'budget_projection', 
      'performance_prediction', 
      'risk_assessment'
    ],
    required: true,
  },
  timeframe: {
    type: String,
    enum: ['short_term', 'medium_term', 'long_term'],
    default: 'medium_term',
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  prediction: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  scenarios: [{
    name: String,
    probability: Number,
    impact: Number,
    description: String,
  }],
  recommendations: [{
    action: String,
    probability: Number,
    impact: Number,
  }],
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