import { Controller, Get, Request, Post } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('notification')
  getNotification() {
    return { message: 'Notification received' };
  }
}
