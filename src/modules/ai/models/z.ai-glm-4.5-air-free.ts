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

    const customFetch = async (
      url: RequestInfo | URL,
      options?: RequestInit,
    ) => {
      const modifiedOptions = { ...options };

      if (modifiedOptions.body && typeof modifiedOptions.body === 'string') {
        const body = JSON.parse(modifiedOptions.body) as Record<
          string,
          unknown
        >;
        body.tool_choice = 'auto';
        modifiedOptions.body = JSON.stringify(body);
      }

      return fetch(url, modifiedOptions);
    };

    return new ChatOpenAI({
      apiKey: super.getApiKey('OPENROUTER'),
      model: 'z-ai/glm-4.5-air:free',
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        fetch: customFetch,
      },
      temperature: config.temperature,
    });
  }

  getModelName(): string {
    return 'z-ai/glm-4.5-air:free';
  }

  getProvider(): string {
    return 'openrouter/z-ai';
  }

  protected getDefaultConfig(): ModelConfig {
    return {
      temperature: 0.2,
    };
  }
}
