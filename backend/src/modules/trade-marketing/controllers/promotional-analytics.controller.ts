import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { PromotionalAnalyticsService } from '../services/promotional-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('promotional-analytics')
@UseGuards(JwtAuthGuard)
export class PromotionalAnalyticsController {
  constructor(
    private promotionalAnalyticsService: PromotionalAnalyticsService
  ) {}

  @Post()
  async createPromotionalAnalytics(
    @Req() req,
    @Body() promotionData: any
  ) {
    // Add user context if needed
    promotionData.user = req.user.id;
    return this.promotionalAnalyticsService.createPromotionalAnalytics(promotionData);
  }

  @Get(':id/effectiveness')
  async analyzePromotionalEffectiveness(
    @Param('id') promotionId: string
  ) {
    return this.promotionalAnalyticsService.analyzePromotionalEffectiveness(promotionId);
  }

  @Get('predictions')
  async getPromotionalPredictions(
    @Query('productId') productId: string,
    @Query('promotionType') promotionType: string,
    @Query('duration') duration: number = 42 // Default 6 weeks
  ) {
    // Simulate prediction generation
    const mockPrediction = {
      productId,
      promotionType,
      duration,
      successProbability: Math.random() * 100,
      recommendedActions: [
        {
          action: 'Adjust pricing strategy',
          probability: Math.random(),
          impact: Math.random() * 100
        }
      ]
    };

    return mockPrediction;
  }

  @Get('configuration')
  getPromotionalAnalyticsConfiguration() {
    return {
      supportedPromotionTypes: [
        'price_discount', 
        'bundle_deal', 
        'buy_one_get_one', 
        'volume_discount', 
        'loyalty_reward'
      ],
      defaultAnalysisDuration: 42, // 6 weeks
      configurationOptions: {
        minDuration: 14, // 2 weeks
        maxDuration: 84, // 12 weeks
        durationStep: 7 // 1 week increments
      }
    };
  }
}