import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WahaWebhookBody } from 'src/types/waha';
import { UserService } from '../user/user.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class WhatsappService {
  private readonly wahaApiUrl: string;
  private readonly webhookUrl: string;
  private readonly wahaApiKey: string;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private aiService: AiService,
  ) {
    this.wahaApiUrl = this.configService.get<string>('WAHA_API_URL')!;
    this.webhookUrl = `${this.configService.get<string>('API_URL')}/whatsapp/notification`;
    this.wahaApiKey = this.configService.get<string>('WAHA_API_KEY')!;
  }

  async handleWebhook(body: WahaWebhookBody) {
    console.log('[WEBHOOK] Received webhook:', JSON.stringify(body, null, 2));

    if (body.event !== 'message') {
      console.log('[WEBHOOK] Ignoring non-message event:', body.event);
      return;
    }

    const from = body.payload.from;
    console.log('[WEBHOOK] Message from:', from);

    // Ignore messages from groups
    if (!from.includes('@c.us')) {
      console.log('[WEBHOOK] Ignoring group message');
      return;
    }

    const message = body.payload.body;
    console.log('[WEBHOOK] Message content:', message);

    const user = await this.userService.findOrCreateUser(from);
    console.log('[WEBHOOK] User:', { id: user.id, chatId: user.chatId });

    // AiService handles all session management internally
    const aiResponse = await this.aiService.callAgent(message, user.id);

    console.log('[WEBHOOK] AI response:', JSON.stringify(aiResponse, null, 2));

    // Send the AI response back to the user
    console.log('[WEBHOOK] Sending message back to user:', aiResponse);
    await this.sendMessage(from, aiResponse);

    console.log('[WEBHOOK] Message sent successfully');
  }

  async sendMessage(to: string, message: string) {
    try {
      console.log('[SEND_MESSAGE] Preparing to send message to:', to);
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
      const result = (await response.json()) as {
        message: string;
      };
      console.log(
        '[SEND_MESSAGE] Response from WAHA:',
        JSON.stringify(result, null, 2),
      );
      return result;
    } catch (error) {
      console.error('[SEND_MESSAGE] Error sending message:', error);
      throw new InternalServerErrorException('Failed to send message');
    }
  }
}
