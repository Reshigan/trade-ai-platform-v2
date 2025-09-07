import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIAssistantService } from './ai-assistant.service';
import { AIAssistantController } from './ai-assistant.controller';
import { ConversationSchema } from './schemas/conversation.schema';
import { InsightSchema } from './schemas/insight.schema';
import { PredictionSchema } from './schemas/prediction.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
      { name: 'Insight', schema: InsightSchema },
      { name: 'Prediction', schema: PredictionSchema }
    ]),
    AuthModule
  ],
  controllers: [AIAssistantController],
  providers: [AIAssistantService],
  exports: [AIAssistantService]
})
export class AIAssistantModule {}