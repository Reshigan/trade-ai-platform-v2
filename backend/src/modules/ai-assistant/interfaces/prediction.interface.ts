import { Document } from 'mongoose';

export interface Prediction extends Document {
  user: string;
  type: 
    | 'sales_forecast' 
    | 'market_trend' 
    | 'budget_projection' 
    | 'performance_prediction' 
    | 'risk_assessment';
  timeframe: 'short_term' | 'medium_term' | 'long_term';
  data: Record<string, any>;
  prediction: Record<string, any>;
  confidence: number;
  scenarios: Array<{
    name: string;
    probability: number;
    impact: number;
    description: string;
  }>;
  recommendations: Array<{
    action: string;
    probability: number;
    impact: number;
  }>;
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