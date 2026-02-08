import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import type { WahaWebhookBody } from 'src/types/waha';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('notification')
  getNotification(@Body() body: WahaWebhookBody): Promise<void> {
    // return this.whatsappService.handleWebhook(body);
  }
}
