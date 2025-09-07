import { Document } from 'mongoose';

export interface SpendTracking extends Document {
  campaign: string;
  user: string;
  totalBudget: number;
  spendEntries: Array<{
    date: Date;
    amount: number;
    category: 'advertising' | 'promotion' | 'digital_marketing' | 'event' | 'sales_support' | 'other';
    description?: string;
    vendor?: string;
    receiptUrl?: string;
  }>;
  summaryMetrics: {
    totalSpent: number;
    remainingBudget: number;
    spendRatio: number;
    projectedEndBalance?: number;
  };
  forecastAnalysis: {
    predictedSpend: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendedActions: string[];
  };
  complianceChecks: Array<{
    type: 'budget' | 'vendor' | 'tax' | 'approval';
    status: 'passed' | 'failed' | 'pending';
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}