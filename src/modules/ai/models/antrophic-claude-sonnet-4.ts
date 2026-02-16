import { ModelFactory, ModelConfig } from './factory/modelFactory';
import { ChatAnthropic } from '@langchain/anthropic';
import { ConfigService } from '@nestjs/config';

/**
 * Anthropic Claude Sonnet 4 model implementation.
 *
 * This model is provided by Anthropic and can be used through
 * the ChatAnthropic interface for direct API access.
 *
 */
export class AnthropicClaudeSonnet4Model extends ModelFactory {
  constructor(configService: ConfigService) {
    super(configService);
  }

  getModel() {
    const config = this.getDefaultConfig();

    return new ChatAnthropic({
      apiKey: super.getApiKey('ANTHROPIC'),
      model: 'claude-sonnet-4-20250514',
      temperature: config.temperature,
    });
  }

  getModelName(): string {
    return 'claude-sonnet-4-20250514';
  }

  getProvider(): string {
    return 'anthropic';
  }

  protected getDefaultConfig(): ModelConfig {
    return {
      temperature: 0.2,
    };
  }
}
