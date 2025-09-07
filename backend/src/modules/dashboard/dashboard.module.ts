import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PerformanceSchema } from './schemas/performance.schema';
import { KPISchema } from './schemas/kpi.schema';
import { InsightSchema } from './schemas/insight.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Performance', schema: PerformanceSchema },
      { name: 'KPI', schema: KPISchema },
      { name: 'Insight', schema: InsightSchema }
    ]),
    AuthModule
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {}