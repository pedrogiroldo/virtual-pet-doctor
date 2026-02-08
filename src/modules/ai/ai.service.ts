import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly difyApiKey: string;
  constructor(private configService: ConfigService) {
    this.difyApiKey = this.configService.get<string>('DIFY_API_KEY')!;
  }
  async callAgent(message: string) {
    const response = await fetch('https://api.dify.ai/v1/chat-messages', {
      headers: {
        Authorization: `Bearer ${this.difyApiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        response_mode: 'blocking',
        query: message,
      }),
    });
    return 'Hello World!';
  }
}
