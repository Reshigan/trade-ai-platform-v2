import { Document } from 'mongoose';

export interface Proposal extends Document {
  title: string;
  description: string;
  creator: string;
  campaign?: string;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  type: 'trade_promotion' | 'marketing_strategy' | 'product_launch' | 'market_expansion';
  budget: {
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
    }>;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    phases: Array<{
      name: string;
      startDate: Date;
      endDate: Date;
      status: 'pending' | 'in_progress' | 'completed';
    }>;
  };
  expectedOutcomes: {
    salesIncrease: number;
    marketShare: number;
    customerAcquisition: number;
  };
  reviewers: Array<{
    user: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    reviewedAt?: Date;
  }>;
  attachments: Array<{
    name: string;
    url: string;
    uploadedBy: string;
  }>;
  aiAnalysis: {
    riskScore: number;
    recommendations: Array<{
      action: string;
      probability: number;
      impact: number;
    }>;
    potentialChallenges: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}