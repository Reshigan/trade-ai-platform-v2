import { Document } from 'mongoose';

export interface Campaign extends Document {
  name: string;
  description: string;
  owner: string;
  status: 'draft' | 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  type: 'trade_promotion' | 'brand_awareness' | 'sales_boost' | 'market_expansion';
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: Array<{
      name: string;
      date: Date;
      status: 'pending' | 'completed' | 'missed';
    }>;
  };
  targets: {
    salesIncrease: number;
    marketShare: number;
    customerAcquisition: number;
  };
  channels: Array<{
    name: 'digital' | 'retail' | 'wholesale' | 'direct_sales' | 'partner_network';
    budget: number;
    performance: Record<string, any>;
  }>;
  collaborators: Array<{
    user: string;
    role: 'owner' | 'editor' | 'viewer';
  }>;
  insights: Array<{
    type: 'performance' | 'recommendation' | 'risk';
    description: string;
    confidence: number;
    createdAt: Date;
  }>;
  aiRecommendations: Array<{
    action: string;
    probability: number;
    impact: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}