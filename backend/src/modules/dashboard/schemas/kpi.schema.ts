import * as mongoose from 'mongoose';

export const KPISchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: [
      'sales', 
      'marketing', 
      'trade_spend', 
      'customer_satisfaction', 
      'operational_efficiency'
    ],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  current: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['on_track', 'behind', 'at_risk', 'completed'],
    default: 'on_track',
  },
  historicalTrend: [{
    date: Date,
    value: Number,
  }],
  insights: [{
    type: String,
  }],
  weightage: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});