import * as mongoose from 'mongoose';

export const ProposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
  },
  status: {
    type: String,
    enum: [
      'draft', 
      'under_review', 
      'approved', 
      'rejected', 
      'needs_revision'
    ],
    default: 'draft',
  },
  type: {
    type: String,
    enum: [
      'trade_promotion', 
      'marketing_strategy', 
      'product_launch', 
      'market_expansion'
    ],
    required: true,
  },
  budget: {
    total: {
      type: Number,
      required: true,
    },
    breakdown: [{
      category: String,
      amount: Number,
    }],
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    phases: [{
      name: String,
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
      },
    }],
  },
  expectedOutcomes: {
    salesIncrease: Number,
    marketShare: Number,
    customerAcquisition: Number,
  },
  reviewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    comments: String,
    reviewedAt: Date,
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  aiAnalysis: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    recommendations: [{
      action: String,
      probability: Number,
      impact: Number,
    }],
    potentialChallenges: [String],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});