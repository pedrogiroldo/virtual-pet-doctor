import { Controller } from '@nestjs/common';
import { AgentChatSessionService } from './agent-chat-session.service';

@Controller('agent-chat-session')
export class AgentChatSessionController {
  constructor(private readonly agentChatSessionService: AgentChatSessionService) {}
}
