import { tool } from 'langchain';
import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

/**
 * Dify Knowledge Base Tool
 *
 * This tool queries Dify's knowledge base API to retrieve relevant information
 * for use in LangChain agents. It supports RAG (Retrieval-Augmented Generation)
 * by searching through indexed documents.
 */
export class DifyKnowledgeBaseTool {
  private readonly apiKey: string;
  private readonly datasetId: string;
  private readonly apiUrl: string;

  constructor(configService: ConfigService) {
    this.apiKey = configService.get<string>('DIFY_API_KEY') || '';
    this.datasetId = configService.get<string>('DIFY_DATASET_ID') || '';
    this.apiUrl = configService.get<string>(
      'DIFY_API_URL',
      'https://api.dify.ai/v1',
    );

    if (!this.apiKey) {
      throw new Error(
        'DIFY_API_KEY is not configured in environment variables',
      );
    }
    if (!this.datasetId) {
      throw new Error(
        'DIFY_DATASET_ID is not configured in environment variables',
      );
    }
  }

  /**
   * Create LangChain tool instance
   */
  getTool() {
    return tool(
      async ({ query, topK = 5, scoreThreshold = 0.5 }) => {
        try {
          return await this.queryKnowledgeBase(query, topK, scoreThreshold);
        } catch (error) {
          console.error('Error querying Dify knowledge base:', error);
          return 'Error: Failed to retrieve information from knowledge base. Please try again.';
        }
      },
      {
        name: 'dify_knowledge_base_search',
        description:
          'Search Dify knowledge base to retrieve relevant information about diabetes and pet health. Use this tool when you need factual information or to verify details before answering.',
        schema: z.object({
          query: z
            .string()
            .describe(
              'The search query to find relevant information in knowledge base',
            ),
          topK: z
            .number()
            .optional()
            .default(5)
            .describe('Maximum number of results to return (default: 5)'),
          scoreThreshold: z
            .number()
            .optional()
            .default(0.5)
            .describe('Minimum relevance score between 0-1 (default: 0.5)'),
        }),
      },
    );
  }

  /**
   * Query Dify knowledge base API
   */
  private async queryKnowledgeBase(
    query: string,
    topK: number,
    scoreThreshold: number,
  ): Promise<string> {
    const endpoint = `${this.apiUrl}/datasets/${this.datasetId}/retrieve`;

    const requestBody = {
      query,
      retrieval_model: {
        search_method: 'hybrid_search',
        reranking_enable: true,
        top_k: topK,
        score_threshold_enabled: true,
        score_threshold: scoreThreshold,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API returned ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as unknown;
    return this.formatResults(data);
  }

  /**
   * Format the API response into a readable string
   */
  private formatResults(data: unknown): string {
    if (
      !data ||
      typeof data !== 'object' ||
      data === null ||
      !('records' in data) ||
      !Array.isArray((data as { records: unknown }).records)
    ) {
      return 'No relevant information found in knowledge base for this query.';
    }

    const records = (data as { records: unknown[] }).records;
    if (records.length === 0) {
      return 'No relevant information found in knowledge base for this query.';
    }

    const formattedResults = records.map((record: unknown, index: number) => {
      if (
        !record ||
        typeof record !== 'object' ||
        record === null ||
        !('segment' in record) ||
        !('score' in record)
      ) {
        return '';
      }

      const rec = record as { segment: unknown; score: number };
      if (
        !rec.segment ||
        typeof rec.segment !== 'object' ||
        rec.segment === null
      ) {
        return '';
      }

      const segment = rec.segment as {
        content?: string;
        document?: { name?: string };
        answer?: string;
      };

      const content = segment.content ?? '';
      const score =
        typeof rec.score === 'number' ? rec.score.toFixed(3) : 'N/A';
      const documentName = segment.document?.name ?? 'Unknown Document';
      const answer = segment.answer ? '\nAnswer: ' + segment.answer : '';

      return `
Result ${index + 1} (Score: ${score})
Document: ${documentName}
${content}${answer}
`.trim();
    });

    const validResults = formattedResults.filter((r) => r !== '');
    return validResults.length > 0
      ? validResults.join('\n\n---\n\n')
      : 'No relevant information found in knowledge base for this query.';
  }
}
