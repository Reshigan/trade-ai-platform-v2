import { Document } from 'mongoose';

export interface Insight extends Document {
  userId: string;
  type: 
    | 'predictive' 
    | 'prescriptive' 
    | 'diagnostic' 
    | 'descriptive';
  category: 
    | 'sales' 
    | 'marketing' 
    | 'trade_spend' 
    | 'customer_behavior' 
    | 'market_trends';
  title: string;
  description: string;
  confidence: number;
  data: Record<string, any>;
  recommendations: Array<{
    action: string;
    impact: number;
    probability: number;
  }>;
  tags: string[];
  relevance: number;
  createdAt: Date;
  updatedAt: Date;
}