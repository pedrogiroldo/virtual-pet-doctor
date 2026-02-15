import { tool } from 'langchain';
import { z } from 'zod';
import { MedicationReminderService } from '../../../medication-reminder/medication-reminder.service';

/**
 * Create Medication Reminder Tool
 *
 * This tool allows the AI Agent to create medication reminders for users.
 * The tool is restricted to creating reminders only for the user associated
 * with the current chat session.
 */
export class CreateMedicationReminderTool {
  private readonly userId: string;
  private readonly medicationReminderService: MedicationReminderService;

  constructor(
    userId: string,
    medicationReminderService: MedicationReminderService,
  ) {
    this.userId = userId;
    this.medicationReminderService = medicationReminderService;
  }

  /**
   * Create LangChain tool instance
   */
  getTool() {
    return tool(
      async ({
        title,
        message,
        recurrence,
        active,
      }: {
        title: string;
        message: string;
        recurrence: string;
        active?: boolean;
      }) => {
        try {
          const reminder = await this.medicationReminderService.createReminder({
            title,
            userId: this.userId,
            message,
            recurrence,
            active: active !== undefined ? active : true,
          });

          return `Medication reminder created successfully!\n\nTitle: ${reminder.title}\nMessage: ${reminder.message}\nRecurrence: ${reminder.recurrence}\nActive: ${reminder.active ? 'Yes' : 'No'}\nID: ${reminder.id}`;
        } catch (error) {
          console.error('Error creating medication reminder:', error);
          return 'Failed to create medication reminder. Please check the provided information and try again.';
        }
      },
      {
        name: 'create_medication_reminder',
        description:
          'Create a medication reminder with a cron schedule. Use this tool when the user wants to set up a reminder for taking medication. The reminder will be sent via WhatsApp at the scheduled times.',
        schema: z.object({
          title: z
            .string()
            .min(1)
            .max(255)
            .describe(
              'Title of the medication reminder (e.g., "Paracetamol - 500mg", "Insulin injection")',
            ),
          message: z
            .string()
            .min(1)
            .max(2000)
            .describe(
              'Custom message to be sent with the reminder (e.g., "Time to take your medication! Don\'t forget.")',
            ),
          recurrence: z
            .string()
            .regex(
              /^(((\*(\/[0-9]+)?)|([0-5]?[0-9])(-([0-5]?[0-9]))?(\/[0-9]+)?)(,(( \*(\/[0-9]+)?)|([0-5]?[0-9])(-([0-5]?[0-9]))?(\/[0-9]+)?))*)\s+(((\*(\/[0-9]+)?)|(([01]?[0-9])|(2[0-3]))(-(([01]?[0-9])|(2[0-3])))?(\/[0-9]+)?)(,(( \*(\/[0-9]+)?)|(([01]?[0-9])|(2[0-3]))(-(([01]?[0-9])|(2[0-3])))?(\/[0-9]+)?))*)\s+(((\*(\/[0-9]+)?)|([1-2]?[0-9]|3[01])(-([1-2]?[0-9]|3[01]))?(\/[0-9]+)?)(,(( \*(\/[0-9]+)?)|([1-2]?[0-9]|3[01])(-([1-2]?[0-9]|3[01]))?(\/[0-9]+)?))*)\s+(((\*(\/[0-9]+)?)|([1-9]|1[0-2])(-([1-9]|1[0-2]))?(\/[0-9]+)?)(,(( \*(\/[0-9]+)?)|([1-9]|1[0-2])(-([1-9]|1[0-2]))?(\/[0-9]+)?))*)\s+(((\*(\/[0-9]+)?)|[0-6](-[0-6])?(\/[0-9]+)?)(,(( \*(\/[0-9]+)?)|[0-6](-[0-6])?(\/[0-9]+)?))*)$/,
              'Invalid cron expression. Must be a valid 5-field cron expression (minute hour day month weekday)',
            )
            .describe(
              'Cron expression for recurring schedule (e.g., "0 9 * * *" for daily at 9 AM, "0 8,20 * * *" for twice daily at 8 AM and 8 PM)',
            ),
          active: z
            .boolean()
            .optional()
            .default(true)
            .describe(
              'Whether the reminder should be active immediately (default: true)',
            ),
        }),
      },
    );
  }
}
