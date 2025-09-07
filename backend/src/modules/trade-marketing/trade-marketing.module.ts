import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TradeMarketingService } from './trade-marketing.service';
import { TradeMarketingController } from './trade-marketing.controller';
import { CampaignSchema } from './schemas/campaign.schema';
import { ProposalSchema } from './schemas/proposal.schema';
import { SpendTrackingSchema } from './schemas/spend-tracking.schema';
import { PromotionalAnalyticsSchema } from './schemas/promotional-analytics.schema';
import { AuthModule } from '../auth/auth.module';
import { AIAssistantModule } from '../ai-assistant/ai-assistant.module';
import { PromotionalAnalyticsService } from './services/promotional-analytics.service';
import { PromotionalAnalyticsController } from './controllers/promotional-analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Campaign', schema: CampaignSchema },
      { name: 'Proposal', schema: ProposalSchema },
      { name: 'SpendTracking', schema: SpendTrackingSchema },
      { name: 'PromotionalAnalytics', schema: PromotionalAnalyticsSchema }
    ]),
    AuthModule,
    AIAssistantModule
  ],
  controllers: [
    TradeMarketingController, 
    PromotionalAnalyticsController
  ],
  providers: [
    TradeMarketingService,
    PromotionalAnalyticsService
  ],
  exports: [
    TradeMarketingService,
    PromotionalAnalyticsService
  ]
})
export class TradeMarketingModule {}