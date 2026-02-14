import { ModelFactory, ModelConfig } from './factory/modelFactory';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';

/**
 * Zhipu AI GLM-4.5 Air Free model implementation.
 *
 * This model is provided by Zhipu AI (Z.ai) and can be used through
 * the ChatOpenAI interface by setting a custom baseURL.
 *
 */
export class ZaiGlm45AirFreeModel extends ModelFactory {
  constructor(configService: ConfigService) {
    super(configService);
  }

  getModel() {
    const config = this.getDefaultConfig();

    return new ChatOpenAI({
      apiKey: this.getApiKey(''),
      model: 'glm-4-5-air:free',
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
      temperature: config.temperature,
    });
  }

  getModelName(): string {
    return 'glm-4-flash-free';
  }

  getProvider(): string {
    return 'openrouter/z-ai';
  }

  protected getDefaultConfig(): ModelConfig {
    return {
      temperature: 0.7,
    };
  }
}
