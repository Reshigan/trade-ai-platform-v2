import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('performance')
  async getPerformanceSummary(
    @Req() req,
    @Query('period') period?: string
  ) {
    return this.dashboardService.getPerformanceSummary(
      req.user.id, 
      period
    );
  }

  @Get('kpis')
  async getKPIs(
    @Req() req,
    @Query('category') category?: string
  ) {
    return this.dashboardService.getKPIs(
      req.user.id, 
      { category }
    );
  }

  @Get('insights')
  async getInsights(
    @Req() req,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: number
  ) {
    return this.dashboardService.getInsights(
      req.user.id, 
      { type, category, limit }
    );
  }

  @Post('performance')
  async createPerformanceRecord(
    @Req() req,
    @Body() performanceData: any
  ) {
    return this.dashboardService.createPerformanceRecord(
      req.user.id, 
      performanceData
    );
  }

  @Post('kpi')
  async createKPI(
    @Req() req,
    @Body() kpiData: any
  ) {
    return this.dashboardService.createKPI(
      req.user.id, 
      kpiData
    );
  }

  @Post('insight')
  async createInsight(
    @Req() req,
    @Body() insightData: any
  ) {
    return this.dashboardService.createInsight(
      req.user.id, 
      insightData
    );
  }
}