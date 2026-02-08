import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService],
  imports: [UserModule],
})
export class WhatsappModule {}
