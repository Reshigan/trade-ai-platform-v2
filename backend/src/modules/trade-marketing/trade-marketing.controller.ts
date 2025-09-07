import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { TradeMarketingService } from './trade-marketing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('trade-marketing')
@UseGuards(JwtAuthGuard)
export class TradeMarketingController {
  constructor(private tradeMarketingService: TradeMarketingService) {}

  @Post('campaign')
  async createCampaign(@Req() req, @Body() campaignData: any) {
    return this.tradeMarketingService.createCampaign(req.user.id, campaignData);
  }

  @Post('proposal')
  async createProposal(@Req() req, @Body() proposalData: any) {
    return this.tradeMarketingService.createProposal(req.user.id, proposalData);
  }

  @Post('spend-tracking')
  async trackSpend(@Req() req, @Body() spendData: any) {
    return this.tradeMarketingService.trackSpend(req.user.id, spendData);
  }

  @Get('campaigns')
  async getCampaigns(
    @Req() req,
    @Query('status') status?: string,
    @Query('type') type?: string
  ) {
    return this.tradeMarketingService.getCampaigns(req.user.id, { status, type });
  }

  @Get('proposals')
  async getProposals(
    @Req() req,
    @Query('status') status?: string,
    @Query('type') type?: string
  ) {
    return this.tradeMarketingService.getProposals(req.user.id, { status, type });
  }

  @Get('spend-tracking')
  async getSpendTracking(
    @Req() req,
    @Query('campaignId') campaignId?: string
  ) {
    return this.tradeMarketingService.getSpendTracking(req.user.id, campaignId);
  }

  @Put('campaign/:id/status')
  async updateCampaignStatus(
    @Param('id') campaignId: string,
    @Body('status') status: string
  ) {
    return this.tradeMarketingService.updateCampaignStatus(campaignId, status);
  }

  @Put('proposal/:id/review')
  async reviewProposal(
    @Param('id') proposalId: string,
    @Body() reviewData: any
  ) {
    return this.tradeMarketingService.reviewProposal(proposalId, reviewData);
  }
}