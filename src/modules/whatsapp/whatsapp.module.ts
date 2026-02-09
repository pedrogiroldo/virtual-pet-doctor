import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { UserModule } from '../user/user.module';
import { AgentChatSessionModule } from '../agent-chat-session/agent-chat-session.module';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService],
  imports: [UserModule, AgentChatSessionModule, AiModule],
  exports: [WhatsappService],
})
export class WhatsappModule {}
