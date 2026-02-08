import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WahaWebhookBody } from 'src/types/waha';
import { UserService } from '../user/user.service';
import { AgentChatSessionService } from '../agent-chat-session/agent-chat-session.service';

@Injectable()
export class WhatsappService {
  private readonly wahaApiUrl: string;
  private readonly webhookUrl: string;
  private readonly wahaApiKey: string;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private agentChatSessionService: AgentChatSessionService,
  ) {
    this.wahaApiUrl = this.configService.get<string>('WAHA_API_URL')!;
    this.webhookUrl = `${this.configService.get<string>('API_URL')}/whatsapp/notification`;
    this.wahaApiKey = this.configService.get<string>('WAHA_API_KEY')!;
  }

  async handleWebhook(body: WahaWebhookBody) {
    if (body.event !== 'message') return;

    const from = body.payload.from;

    // Ignore messages from groups
    if (from.includes('@g.us')) return;

    const message = body.payload.body;
    const user = await this.userService.findOrCreateUser(from);
    let chatSession =
      await this.agentChatSessionService.getUserActiveChatSession(user.id);

    // AI agent call here
    // await this.sendMessage(from, message);
  }
  async sendMessage(to: string, message: string) {}
}
