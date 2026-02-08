import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly wahaApiUrl: string;
  private readonly webhookUrl: string;
  private readonly wahaApiKey: string;

  constructor(private configService: ConfigService) {
    this.wahaApiUrl = this.configService.get<string>('WAHA_API_URL')!;
    this.webhookUrl = `${this.configService.get<string>('API_URL')}/whatsapp/notification`;
    this.wahaApiKey = this.configService.get<string>('WAHA_API_KEY')!;
  }
}
