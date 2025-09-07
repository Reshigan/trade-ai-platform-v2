import { Document } from 'mongoose';

export interface Performance extends Document {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  metrics: {
    salesVolume: number;
    revenue: number;
    profitMargin: number;
    marketShare: number;
    customerSatisfaction: number;
  };
  comparativeAnalysis: {
    previousPeriod?: any;
    yearOverYear?: any;
  };
  trendData: Array<{
    date: Date;
    value: number;
  }>;
  segments: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}