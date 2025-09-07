import { Document } from 'mongoose';

export interface Insight extends Document {
  user: string;
  type: 
    | 'predictive' 
    | 'prescriptive' 
    | 'diagnostic' 
    | 'descriptive';
  domain: 
    | 'trade_marketing' 
    | 'sales' 
    | 'budget' 
    | 'performance' 
    | 'customer_behavior';
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
  relatedEntities: Array<{
    type: 
      | 'campaign' 
      | 'proposal' 
      | 'budget' 
      | 'performance' 
      | 'kpi';
    id: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}