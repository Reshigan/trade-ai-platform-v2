import { Document } from 'mongoose';

export interface KPI extends Document {
  userId: string;
  category: 
    | 'sales' 
    | 'marketing' 
    | 'trade_spend' 
    | 'customer_satisfaction' 
    | 'operational_efficiency';
  name: string;
  target: number;
  current: number;
  progress: number;
  status: 'on_track' | 'behind' | 'at_risk' | 'completed';
  historicalTrend: Array<{
    date: Date;
    value: number;
  }>;
  insights: string[];
  weightage: number;
  createdAt: Date;
  updatedAt: Date;
}