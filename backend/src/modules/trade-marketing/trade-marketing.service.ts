import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from './interfaces/campaign.interface';
import { Proposal } from './interfaces/proposal.interface';
import { SpendTracking } from './interfaces/spend-tracking.interface';
import { AIAssistantService } from '../ai-assistant/ai-assistant.service';

@Injectable()
export class TradeMarketingService {
  constructor(
    @InjectModel('Campaign') private campaignModel: Model<Campaign>,
    @InjectModel('Proposal') private proposalModel: Model<Proposal>,
    @InjectModel('SpendTracking') private spendTrackingModel: Model<SpendTracking>,
    private aiAssistantService: AIAssistantService,
  ) {}

  async createCampaign(userId: string, campaignData: Partial<Campaign>) {
    const campaign = new this.campaignModel({
      ...campaignData,
      owner: userId,
      collaborators: [{ user: userId, role: 'owner' }],
    });

    // AI-powered campaign insights
    const aiInsights = await this.aiAssistantService.generateCampaignInsights(campaignData);
    campaign.aiRecommendations = aiInsights.recommendations;

    return campaign.save();
  }

  async createProposal(userId: string, proposalData: Partial<Proposal>) {
    const proposal = new this.proposalModel({
      ...proposalData,
      creator: userId,
      status: 'draft',
    });

    // AI-powered proposal risk analysis
    const aiAnalysis = await this.aiAssistantService.analyzeProposalRisk(proposalData);
    proposal.aiAnalysis = aiAnalysis;

    return proposal.save();
  }

  async trackSpend(userId: string, spendData: Partial<SpendTracking>) {
    const spendTracking = new this.spendTrackingModel({
      ...spendData,
      user: userId,
    });

    // AI-powered spend forecast
    const forecastAnalysis = await this.aiAssistantService.predictSpendForecast(spendData);
    spendTracking.forecastAnalysis = forecastAnalysis;

    return spendTracking.save();
  }

  async getCampaigns(userId: string, filters: any = {}) {
    return this.campaignModel
      .find({ 
        $or: [
          { owner: userId },
          { 'collaborators.user': userId }
        ],
        ...filters 
      })
      .sort({ createdAt: -1 });
  }

  async getProposals(userId: string, filters: any = {}) {
    return this.proposalModel
      .find({ 
        $or: [
          { creator: userId },
          { 'reviewers.user': userId }
        ],
        ...filters 
      })
      .sort({ createdAt: -1 });
  }

  async getSpendTracking(userId: string, campaignId?: string) {
    const filter: any = { user: userId };
    if (campaignId) {
      filter.campaign = campaignId;
    }

    return this.spendTrackingModel
      .find(filter)
      .sort({ createdAt: -1 });
  }

  async updateCampaignStatus(campaignId: string, status: string) {
    return this.campaignModel.findByIdAndUpdate(
      campaignId, 
      { status }, 
      { new: true }
    );
  }

  async reviewProposal(proposalId: string, reviewData: any) {
    const proposal = await this.proposalModel.findById(proposalId);
    
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    proposal.reviewers.push(reviewData);
    
    // Determine overall proposal status
    const allReviewed = proposal.reviewers.every(r => r.status !== 'pending');
    if (allReviewed) {
      const approvals = proposal.reviewers.filter(r => r.status === 'approved');
      proposal.status = approvals.length > proposal.reviewers.length / 2 
        ? 'approved' 
        : 'rejected';
    }

    return proposal.save();
  }
}