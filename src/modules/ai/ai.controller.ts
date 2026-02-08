import { Controller, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Get('queue')
  @ApiOperation({ summary: 'Get the queue length' })
  getQueue(): number {
    return 6;
  }
}
