import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AgentChatSessionModule } from '../agent-chat-session/agent-chat-session.module';

@Module({
  controllers: [AiController],
  providers: [AiService],
  imports: [AgentChatSessionModule],
  exports: [AiService],
})
export class AiModule {}
