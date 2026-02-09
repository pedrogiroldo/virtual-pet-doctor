import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DifyResponse } from '../../types/dify';

@Injectable()
export class AiService {
  private readonly difyApiKey: string;
  constructor(private configService: ConfigService) {
    this.difyApiKey = this.configService.get<string>('DIFY_API_KEY')!;
  }
  async callAgent(
    message: string,
    userId: string,
    conversationId?: string,
    inputs?: Record<string, unknown>,
  ) {
    try {
      console.log('inputs', inputs);
      const response = await fetch('https://api.dify.ai/v1/chat-messages', {
        headers: {
          Authorization: `Bearer ${this.difyApiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: inputs || {},
          response_mode: 'blocking',
          query: message,
          user: userId,
          ...(conversationId && { conversation_id: conversationId }),
        }),
      });
      if (!response.ok) {
        console.error(await response.text());
        throw new InternalServerErrorException('Failed to call agent');
      }
      return (await response.json()) as DifyResponse;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to call agent');
    }
  }
}
