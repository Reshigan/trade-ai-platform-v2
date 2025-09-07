import { Document } from 'mongoose';

export interface PromotionalAnalytics extends Document {
  product: string;
  promotionType: 
    | 'price_discount' 
    | 'bundle_deal' 
    | 'buy_one_get_one' 
    | 'volume_discount' 
    | 'loyalty_reward';
  
  baselineMetrics: {
    averagePrice: number;
    averageSalesVolume: number;
    profitMargin: number;
  };

  promotionalPeriod: {
    startDate: Date;
    endDate: Date;
    duration: number;
  };

  analysisWindow: {
    prePeriod: {
      startDate: Date;
      endDate: Date;
      duration: number;
    };
    postPeriod: {
      startDate: Date;
      endDate: Date;
      duration: number;
    };
  };

  pricingStrategy: {
    originalPrice: number;
    promotionalPrice: number;
    discountPercentage: number;
  };

  salesData: {
    prePeriod: {
      totalSales: number;
      averageDailySales: number;
      revenue: number;
    };
    promotionPeriod: {
      totalSales: number;
      averageDailySales: number;
      revenue: number;
    };
    postPeriod: {
      totalSales: number;
      averageDailySales: number;
      revenue: number;
    };
  };

  performanceMetrics: {
    salesLift: {
      percentage: number;
      absoluteIncrease: number;
    };
    profitabilityImpact: {
      netProfit: number;
      profitMarginChange: number;
    };
    customerAcquisition: {
      newCustomers: number;
      customerAcquisitionCost: number;
    };
  };

  aiPredictions: {
    successProbability: number;
    recommendedActions: Array<{
      action: string;
      probability: number;
      impact: number;
    }>;
    riskFactors: Array<{
      factor: string;
      riskScore: number;
    }>;
  };

  competitiveAnalysis: Array<{
    competitor: string;
    responseType: 'price_match' | 'counter_promotion' | 'no_response';
    impact: number;
  }>;

  customerSegmentAnalysis: Array<{
    segment: string;
    responseRate: number;
    averageSpend: number;
    repeatPurchaseRate: number;
  }>;

  createdAt: Date;
  updatedAt: Date;
}