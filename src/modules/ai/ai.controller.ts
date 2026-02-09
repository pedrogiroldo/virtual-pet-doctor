import { Controller, Get, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateMedicationReminderDto } from '../../medication-reminder/dto/create-medication-reminder.dto';
import { MedicationReminderService } from '../../medication-reminder/medication-reminder.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly medicationReminderService: MedicationReminderService,
  ) {}

  @Get('queue')
  @ApiOperation({ summary: 'Get the queue length' })
  getQueue(): number {
    return 6;
  }

  @Post('medication-reminder')
  @ApiOperation({ summary: 'Create a medication reminder with cron schedule' })
  async createMedicationReminder(
    @Body() createMedicationReminderDto: CreateMedicationReminderDto,
  ) {
    return await this.medicationReminderService.createReminder(
      createMedicationReminderDto,
    );
  }
}
