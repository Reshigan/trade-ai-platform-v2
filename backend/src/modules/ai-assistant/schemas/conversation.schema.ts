import * as mongoose from 'mongoose';

export const ConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  context: {
    type: String,
    enum: [
      'trade_marketing', 
      'sales_strategy', 
      'performance_analysis', 
      'budget_planning', 
      'general'
    ],
    default: 'general',
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  }],
  intent: {
    type: String,
    enum: [
      'query', 
      'analysis', 
      'recommendation', 
      'prediction', 
      'clarification'
    ],
    default: 'query',
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral',
  },
  complexity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
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
  aiAssistanceQuality: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});