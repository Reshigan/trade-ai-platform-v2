import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Performance } from './interfaces/performance.interface';
import { KPI } from './interfaces/kpi.interface';
import { Insight } from './interfaces/insight.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Performance') private performanceModel: Model<Performance>,
    @InjectModel('KPI') private kpiModel: Model<KPI>,
    @InjectModel('Insight') private insightModel: Model<Insight>,
  ) {}

  async getPerformanceSummary(userId: string, period: string = 'monthly') {
    const performance = await this.performanceModel
      .findOne({ userId, period })
      .sort({ createdAt: -1 });

    if (!performance) {
      throw new NotFoundException('Performance data not found');
    }

    return {
      metrics: performance.metrics,
      comparativeAnalysis: performance.comparativeAnalysis,
      trendData: performance.trendData,
    };
  }

  async getKPIs(userId: string, filters: { category?: string } = {}) {
    const query = { userId, ...filters };
    const kpis = await this.kpiModel.find(query);

    return {
      total: kpis.length,
      kpis: kpis.map(kpi => ({
        name: kpi.name,
        category: kpi.category,
        target: kpi.target,
        current: kpi.current,
        progress: kpi.progress,
        status: kpi.status,
      })),
    };
  }

  async getInsights(
    userId: string, 
    filters: { 
      type?: string, 
      category?: string, 
      limit?: number 
    } = {}
  ) {
    const { type, category, limit = 10 } = filters;
    const query = { 
      userId, 
      ...(type && { type }),
      ...(category && { category }),
    };

    const insights = await this.insightModel
      .find(query)
      .sort({ confidence: -1, createdAt: -1 })
      .limit(limit);

    return {
      total: insights.length,
      insights: insights.map(insight => ({
        title: insight.title,
        description: insight.description,
        type: insight.type,
        category: insight.category,
        confidence: insight.confidence,
        recommendations: insight.recommendations,
      })),
    };
  }

  async createPerformanceRecord(
    userId: string, 
    performanceData: Partial<Performance>
  ) {
    const performance = new this.performanceModel({
      userId,
      ...performanceData,
    });

    return performance.save();
  }

  async createKPI(
    userId: string, 
    kpiData: Partial<KPI>
  ) {
    const kpi = new this.kpiModel({
      userId,
      ...kpiData,
    });

    return kpi.save();
  }

  async createInsight(
    userId: string, 
    insightData: Partial<Insight>
  ) {
    const insight = new this.insightModel({
      userId,
      ...insightData,
    });

    return insight.save();
  }
}