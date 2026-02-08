import { Module } from '@nestjs/common';
import { AgentChatSessionService } from './agent-chat-session.service';
import { AgentChatSessionController } from './agent-chat-session.controller';

@Module({
  controllers: [AgentChatSessionController],
  providers: [AgentChatSessionService],
  exports: [AgentChatSessionService],
})
export class AgentChatSessionModule {}
