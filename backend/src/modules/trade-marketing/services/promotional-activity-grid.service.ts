import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromotionalAnalytics } from '../interfaces/promotional-analytics.interface';

@Injectable()
export class PromotionalActivityGridService {
  constructor(
    @InjectModel('PromotionalAnalytics') 
    private promotionalAnalyticsModel: Model<PromotionalAnalytics>
  ) {}

  async getPromotionalActivityGrid(options: {
    companyId: string;
    dateRange: {
      start: Date;
      end: Date;
    };
    hierarchyType: 'product' | 'customer';
    hierarchyLevel?: number;
    timeGrouping: 'week' | 'month' | 'quarter' | 'year';
  }) {
    const { companyId, dateRange, hierarchyType, hierarchyLevel, timeGrouping } = options;

    // Aggregation pipeline for promotional activity grid
    const pipeline = [
      {
        $match: {
          company: companyId,
          'promotionalPeriod.startDate': {
            $gte: dateRange.start,
            $lte: dateRange.end
          }
        }
      },
      {
        $group: {
          _id: this.getGroupingKey(timeGrouping, hierarchyType, hierarchyLevel),
          totalPromotions: { $sum: 1 },
          totalSales: { $sum: '$salesData.promotionPeriod.totalSales' },
          averageSalesLift: { $avg: '$performanceMetrics.salesLift.percentage' },
          promotionTypes: { 
            $addToSet: '$promotionType' 
          }
        }
      },
      {
        $project: {
          period: '$_id',
          totalPromotions: 1,
          totalSales: 1,
          averageSalesLift: 1,
          promotionTypes: 1,
          comparisonToPreviousYear: this.calculateYearOverYearComparison()
        }
      },
      { $sort: { period: 1 } }
    ];

    return this.promotionalAnalyticsModel.aggregate(pipeline);
  }

  private getGroupingKey(
    timeGrouping: string, 
    hierarchyType: string, 
    hierarchyLevel?: number
  ) {
    const groupKeys = {
      week: { 
        $dateToString: { 
          format: '%Y-W%W', 
          date: '$promotionalPeriod.startDate' 
        }
      },
      month: { 
        $dateToString: { 
          format: '%Y-%m', 
          date: '$promotionalPeriod.startDate' 
        }
      },
      quarter: { 
        $dateToString: { 
          format: '%Y-Q%q', 
          date: '$promotionalPeriod.startDate' 
        }
      },
      year: { 
        $dateToString: { 
          format: '%Y', 
          date: '$promotionalPeriod.startDate' 
        }
      }
    };

    // If hierarchy is specified, include it in grouping
    if (hierarchyType === 'product') {
      return {
        period: groupKeys[timeGrouping],
        productHierarchyLevel: hierarchyLevel ? 
          `$hierarchyConfiguration.productHierarchy.level${hierarchyLevel}` : 
          null
      };
    } else if (hierarchyType === 'customer') {
      return {
        period: groupKeys[timeGrouping],
        customerHierarchyLevel: hierarchyLevel ? 
          `$hierarchyConfiguration.customerHierarchy.level${hierarchyLevel}` : 
          null
      };
    }

    return groupKeys[timeGrouping];
  }

  private calculateYearOverYearComparison() {
    return {
      $function: {
        body: `function(currentYearData, previousYearData) {
          if (!previousYearData) return null;
          
          const calculatePercentageChange = (current, previous) => {
            return previous !== 0 
              ? ((current - previous) / previous) * 100 
              : null;
          };

          return {
            totalSales: calculatePercentageChange(
              currentYearData.totalSales, 
              previousYearData.totalSales
            ),
            promotions: calculatePercentageChange(
              currentYearData.totalPromotions, 
              previousYearData.totalPromotions
            ),
            salesLift: calculatePercentageChange(
              currentYearData.averageSalesLift, 
              previousYearData.averageSalesLift
            )
          };
        }`,
        args: ['$totalSales', '$previousYearData'],
        lang: 'js'
      }
    };
  }

  async getDetailedPromotionalActivity(promotionId: string) {
    return this.promotionalAnalyticsModel
      .findById(promotionId)
      .populate('product')
      .populate('customerSegments');
  }
}