import * as mongoose from 'mongoose';

export const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: [
      'draft', 
      'planned', 
      'active', 
      'paused', 
      'completed', 
      'cancelled'
    ],
    default: 'draft',
  },
  type: {
    type: String,
    enum: [
      'trade_promotion', 
      'brand_awareness', 
      'sales_boost', 
      'market_expansion'
    ],
    required: true,
  },
  budget: {
    total: {
      type: Number,
      required: true,
    },
    spent: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: function() { return this.budget.total; },
    },
  },
  timeline: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    milestones: [{
      name: String,
      date: Date,
      status: {
        type: String,
        enum: ['pending', 'completed', 'missed'],
        default: 'pending',
      },
    }],
  },
  targets: {
    salesIncrease: {
      type: Number,
      default: 0,
    },
    marketShare: {
      type: Number,
      default: 0,
    },
    customerAcquisition: {
      type: Number,
      default: 0,
    },
  },
  channels: [{
    name: {
      type: String,
      enum: [
        'digital', 
        'retail', 
        'wholesale', 
        'direct_sales', 
        'partner_network'
      ],
    },
    budget: Number,
    performance: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  }],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer',
    },
  }],
  insights: [{
    type: {
      type: String,
      enum: ['performance', 'recommendation', 'risk'],
    },
    description: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  aiRecommendations: [{
    action: String,
    probability: Number,
    impact: Number,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});