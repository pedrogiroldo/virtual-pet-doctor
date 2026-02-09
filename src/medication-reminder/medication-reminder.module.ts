import { Module, forwardRef } from '@nestjs/common';
import { MedicationReminderService } from './medication-reminder.service';
import { WhatsappModule } from '../modules/whatsapp/whatsapp.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [forwardRef(() => WhatsappModule), ScheduleModule.forRoot()],
  providers: [MedicationReminderService],
  exports: [MedicationReminderService],
})
export class MedicationReminderModule {}
