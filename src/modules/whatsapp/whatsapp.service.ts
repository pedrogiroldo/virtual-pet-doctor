import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WahaWebhookBody } from 'src/types/waha';
import { UserService } from '../user/user.service';
import { AgentChatSessionService } from '../agent-chat-session/agent-chat-session.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class WhatsappService {
  private readonly wahaApiUrl: string;
  private readonly webhookUrl: string;
  private readonly wahaApiKey: string;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private agentChatSessionService: AgentChatSessionService,
    private aiService: AiService,
  ) {
    this.wahaApiUrl = this.configService.get<string>('WAHA_API_URL')!;
    this.webhookUrl = `${this.configService.get<string>('API_URL')}/whatsapp/notification`;
    this.wahaApiKey = this.configService.get<string>('WAHA_API_KEY')!;
  }

  async handleWebhook(body: WahaWebhookBody) {
    if (body.event !== 'message') return;

    const from = body.payload.from;

    // Ignore messages from groups
    if (!from.includes('@c.us')) return;
    console.log('oiii');

    const message = body.payload.body;
    const user = await this.userService.findOrCreateUser(from);
    let chatSession =
      await this.agentChatSessionService.getUserActiveChatSession(user.id);

    // Create a new session if no active session exists
    if (!chatSession) {
      const sessionId = crypto.randomUUID();
      chatSession = await this.agentChatSessionService.createUserChatSession(
        user.id,
        sessionId,
      );
    }

    // Call AI agent with user ID and conversation ID (using sessionId as conversation_id)
    const aiResponse = await this.aiService.callAgent(
      message,
      user.id,
      chatSession.sessionId,
    );

    // Update session timestamp to keep it active
    await this.agentChatSessionService.updateChatSessionTimestamp(
      chatSession.sessionId,
    );

    // Send the AI response back to the user
    await this.sendMessage(from, aiResponse.answer);
  }
  async sendMessage(to: string, message: string) {
    try {
      const response = await fetch(`${this.wahaApiUrl}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.wahaApiKey,
        },
        body: JSON.stringify({
          session: 'default',
          chatId: to,
          text: message,
        }),
      });
      return (await response.json()) as {
        message: string;
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to send message');
    }
  }
}
