import {
  IsString,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicationReminderDto {
  @ApiProperty({
    description: 'Título do lembrete de medicamento',
    example: 'Paracetamol - 500mg',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @ApiProperty({
    description: 'ID do usuário associado ao lembrete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Mensagem personalizada do lembrete',
    example: 'Hora de tomar seu medicamento! Não se esqueça.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 2000)
  message: string;

  @ApiProperty({
    description:
      'Expressão cron para agendamento recorrente do lembrete',
    example: '0 9 * * *',
    pattern: '^(\\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|(\\*\\/([0-9]+)))\\s+(\\*|([0-9]|1[0-9]|2[0-3])|(\\*\\/([0-9]+)))\\s+(\\*|([1-9]|[12][0-9]|3[01])|(\\*\\/([0-9]+)))\\s+(\\*|([1-9]|1[0-2])|(\\*\\/([0-9]+)))\\s+(\\*|([0-6])|(\\*\\/([0-9]+)))$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|(\*\/([0-9]+)))\s+(\*|([0-9]|1[0-9]|2[0-3])|(\*\/([0-9]+)))\s+(\*|([1-9]|[12][0-9]|3[01])|(\*\/([0-9]+)))\s+(\*|([1-9]|1[0-2])|(\*\/([0-9]+)))\s+(\*|([0-6])|(\*\/([0-9]+)))$/,
    {
      message: 'Recurrence must be a valid cron expression',
    },
  )
  recurrence: string;

  @ApiProperty({
    description: 'Indica se o lembrete está ativo',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
