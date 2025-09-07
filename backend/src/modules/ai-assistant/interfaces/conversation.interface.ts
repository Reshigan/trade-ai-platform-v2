import { Document } from 'mongoose';

export interface Conversation extends Document {
  user: string;
  context: 
    | 'trade_marketing' 
    | 'sales_strategy' 
    | 'performance_analysis' 
    | 'budget_planning' 
    | 'general';
  messages: Array<{
    sender: 'user' | 'ai';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  intent: 
    | 'query' 
    | 'analysis' 
    | 'recommendation' 
    | 'prediction' 
    | 'clarification';
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: number;
  relatedEntities: Array<{
    type: 
      | 'campaign' 
      | 'proposal' 
      | 'budget' 
      | 'performance' 
      | 'kpi';
    id: string;
  }>;
  aiAssistanceQuality: number;
  createdAt: Date;
  updatedAt: Date;
}