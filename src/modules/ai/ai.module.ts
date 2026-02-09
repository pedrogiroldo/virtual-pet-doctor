import { Module, forwardRef } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AgentChatSessionModule } from '../agent-chat-session/agent-chat-session.module';
import { MedicationReminderModule } from '../../medication-reminder/medication-reminder.module';

@Module({
  controllers: [AiController],
  providers: [AiService],
  imports: [AgentChatSessionModule, forwardRef(() => MedicationReminderModule)],
  exports: [AiService],
})
export class AiModule {}
