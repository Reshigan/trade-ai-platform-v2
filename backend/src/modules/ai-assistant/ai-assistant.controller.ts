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
import { AIAssistantService } from './ai-assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai-assistant')
@UseGuards(JwtAuthGuard)
export class AIAssistantController {
  constructor(private aiAssistantService: AIAssistantService) {}

  @Post('conversation')
  async startConversation(
    @Req() req,
    @Body('context') context: string
  ) {
    return this.aiAssistantService.startConversation(req.user.id, context);
  }

  @Post('conversation/:conversationId/message')
  async addMessageToConversation(
    @Param('conversationId') conversationId: string,
    @Body() messageData: { 
      sender: 'user' | 'ai', 
      content: string, 
      metadata?: any 
    }
  ) {
    return this.aiAssistantService.addMessageToConversation(
      conversationId, 
      messageData
    );
  }

  @Post('campaign-insights')
  async generateCampaignInsights(
    @Req() req,
    @Body() campaignData: any
  ) {
    return this.aiAssistantService.generateCampaignInsights(campaignData);
  }

  @Post('proposal-risk-analysis')
  async analyzeProposalRisk(
    @Req() req,
    @Body() proposalData: any
  ) {
    return this.aiAssistantService.analyzeProposalRisk(proposalData);
  }

  @Post('spend-forecast')
  async predictSpendForecast(
    @Req() req,
    @Body() spendData: any
  ) {
    return this.aiAssistantService.predictSpendForecast(spendData);
  }
}