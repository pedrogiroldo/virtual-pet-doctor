import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../modules/prisma/prisma.service';
import { CreateMedicationReminderDto } from './dto/create-medication-reminder.dto';
import { WhatsappService } from '../modules/whatsapp/whatsapp.service';
import { CronJob } from 'cron';
import { MedicationReminder } from 'src/generated/prisma/client';
import { User } from 'src/generated/prisma/browser';

@Injectable()
export class MedicationReminderService implements OnModuleInit {
  private readonly logger = new Logger(MedicationReminderService.name);
  private scheduledJobs = new Map<string, string>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly whatsappService: WhatsappService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing medication reminders...');
    const startTime = Date.now();
    await this.loadActiveReminders();
    const duration = Date.now() - startTime;
    this.logger.log(`Medication reminders initialized in ${duration}ms`);
  }

  private async loadActiveReminders() {
    const startTime = Date.now();
    try {
      this.logger.log('Loading active reminders from database...');
      const activeReminders =
        await this.prismaService.medicationReminder.findMany({
          where: {
            active: true,
          },
          include: {
            user: true,
          },
        });

      this.logger.log(
        `Found ${activeReminders.length} active reminders to schedule`,
      );

      let scheduledCount = 0;
      let skippedCount = 0;

      for (const reminder of activeReminders) {
        try {
          this.scheduleReminder(reminder);
          scheduledCount++;
          this.logger.debug(
            `Successfully scheduled reminder ${reminder.id} (${reminder.title})`,
          );
        } catch (error) {
          skippedCount++;
          this.logger.warn(
            `Failed to schedule reminder ${reminder.id}: ${error}`,
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Loaded and scheduled ${scheduledCount}/${activeReminders.length} active reminders in ${duration}ms (${skippedCount} skipped)`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to load active reminders after ${duration}ms:`,
        error,
      );
    }
  }

  async createReminder(
    createMedicationReminderDto: CreateMedicationReminderDto,
  ) {
    const startTime = Date.now();
    const isActive =
      createMedicationReminderDto.active !== undefined
        ? createMedicationReminderDto.active
        : true;

    try {
      this.logger.log(
        `Creating new medication reminder - Title: "${createMedicationReminderDto.title}", User: ${createMedicationReminderDto.userId}, Active: ${isActive}, Recurrence: ${createMedicationReminderDto.recurrence}`,
      );

      const reminder = await this.prismaService.medicationReminder.create({
        data: {
          title: createMedicationReminderDto.title,
          message: createMedicationReminderDto.message,
          recurrence: createMedicationReminderDto.recurrence,
          active: isActive,
          userId: createMedicationReminderDto.userId,
        },
        include: {
          user: true,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `Created reminder ${reminder.id} in ${duration}ms - ${reminder.title}`,
      );

      if (reminder.active) {
        this.logger.log(
          `Scheduling reminder ${reminder.id} immediately as it's active`,
        );
        this.scheduleReminder(reminder);
      } else {
        this.logger.log(
          `Reminder ${reminder.id} is inactive, skipping scheduling`,
        );
      }

      return reminder;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to create reminder after ${duration}ms:`,
        error,
      );
      throw new InternalServerErrorException('Failed to create reminder');
    }
  }

  private scheduleReminder(reminder: MedicationReminder & { user: User }) {
    const startTime = Date.now();
    const jobName = `reminder-${reminder.id}`;

    this.logger.log(
      `Scheduling reminder ${reminder.id} (${reminder.title}) for user ${reminder.user.chatId}`,
    );

    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.logger.warn(
        `Job ${jobName} already exists for reminder ${reminder.id}, skipping creation`,
      );
      return;
    }

    this.schedulerRegistry.addCronJob(
      jobName,
      new CronJob(
        reminder.recurrence,
        async () => {
          await this.sendReminderMessage(reminder);
        },
        null,
        true,
        'America/Sao_Paulo',
      ),
    );

    const job = this.schedulerRegistry.getCronJob(jobName);
    job.start();
    this.scheduledJobs.set(reminder.id, jobName);

    const duration = Date.now() - startTime;
    const nextRun = job.nextDate();
    this.logger.log(
      `Scheduled reminder ${reminder.id} (${reminder.title}) with cron: ${reminder.recurrence} | Next run: ${nextRun ? nextRun.toString() : 'N/A'} | Total scheduled jobs: ${this.scheduledJobs.size} | Duration: ${duration}ms`,
    );
  }

  private async sendReminderMessage(
    reminder: MedicationReminder & { user: User },
  ) {
    try {
      const fullMessage = `💊 ${reminder.title}\n\n${reminder.message}`;

      await this.whatsappService.sendMessage(reminder.user.chatId, fullMessage);

      this.logger.log(
        `Sent reminder message to user ${reminder.user.chatId}: ${reminder.title}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send reminder message for ${reminder.id}:`,
        error,
      );
    }
  }

  async deactivateReminder(id: string) {
    try {
      const reminder = await this.prismaService.medicationReminder.update({
        where: { id },
        data: { active: false },
      });

      const jobName = this.scheduledJobs.get(id);
      if (jobName && this.schedulerRegistry.doesExist('cron', jobName)) {
        const job = this.schedulerRegistry.getCronJob(jobName);
        job.stop();
        this.schedulerRegistry.deleteCronJob(jobName);
        this.scheduledJobs.delete(id);
        this.logger.log(`Stopped and deleted job: ${jobName}`);
      }

      this.logger.log(`Deactivated reminder: ${id}`);
      return reminder;
    } catch (error) {
      this.logger.error('Failed to deactivate reminder:', error);
      throw new InternalServerErrorException('Failed to deactivate reminder');
    }
  }

  async activateReminder(id: string) {
    try {
      const reminder = await this.prismaService.medicationReminder.update({
        where: { id },
        data: { active: true },
        include: {
          user: true,
        },
      });

      this.scheduleReminder(reminder);
      this.logger.log(`Activated reminder: ${id}`);
      return reminder;
    } catch (error) {
      this.logger.error('Failed to activate reminder:', error);
      throw new InternalServerErrorException('Failed to activate reminder');
    }
  }
}
