import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZaiGlm45AirFreeModel } from './models/z.ai-glm-4.5-air-free';

@Injectable()
export class AiService {
  private readonly openaiApiKey: string;
  private readonly zaiGlm45AirFreeModel: ZaiGlm45AirFreeModel;
  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY')!;
    this.zaiGlm45AirFreeModel = new ZaiGlm45AirFreeModel(this.configService);
  }
  async callAgent(message: string, userId: string) {
    try {
      const model = this.zaiGlm45AirFreeModel.getModel();
      const response = await model.invoke([{ role: 'user', content: message }]);
      return response;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to call agent');
    }
  }
}
