import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ConfigService } from '@nestjs/config';

/**
 * Abstract factory class for creating and managing LangChain chat models.
 *
 * This pattern allows for:
 * - Centralized configuration management
 * - Easy swapping between different models/providers
 * - Consistent initialization across all models
 * - Type-safe model selection
 */
export abstract class ModelFactory {
  protected readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  /**
   * Returns a configured instance of a LangChain chat model.
   * This method should create and return a new model instance with all
   * necessary configuration applied.
   *
   * @returns A configured BaseChatModel instance
   */
  abstract getModel(): BaseChatModel;

  /**
   * Returns the model name for logging and identification purposes.
   *
   * @returns The model name string
   */
  abstract getModelName(): string;

  /**
   * Returns the provider name (e.g., 'openai', 'anthropic', 'zhipu').
   *
   * @returns The provider name string
   */
  abstract getProvider(): string;

  /**
   * Returns default configuration parameters for the model.
   * Subclasses can override this to provide model-specific defaults.
   *
   * @returns A record containing default configuration parameters
   */
  protected abstract getDefaultConfig(): ModelConfig;

  /**
   * Retrieves an API key from the configuration service.
   * Throws an error if the key is not found.
   *
   * @param keyName - The name of the configuration key (without _API_KEY suffix)
   * @returns The API key value
   * @throws Error if the API key is not configured
   */
  protected getApiKey(keyName: string): string {
    const apiKey = this.configService.get<string>(
      `${keyName.toUpperCase()}_API_KEY`,
    );
    if (!apiKey) {
      throw new Error(`API key for ${keyName} not found in configuration`);
    }
    return apiKey;
  }

  /**
   * Optional health check method to verify if the model is accessible.
   * Subclasses can implement this to test model connectivity.
   *
   * @returns Promise resolving to true if the model is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const model = this.getModel();
      // Simple test invocation
      await model.invoke([{ role: 'user', content: 'test' }]);
      return true;
    } catch (error) {
      console.error(
        `Health check failed for model ${this.getModelName()}:`,
        error,
      );
      return false;
    }
  }
}

/**
 * Configuration interface for model parameters.
 */
export interface ModelConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  [key: string]: any;
}
