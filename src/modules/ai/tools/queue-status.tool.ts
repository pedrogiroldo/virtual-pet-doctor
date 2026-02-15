import { tool } from 'langchain';
import { z } from 'zod';

/**
 * Queue Status Tool
 *
 * This tool provides the current status of the processing queue.
 * Returns a fixed value indicating the number of items in the queue.
 */
export class QueueStatusTool {
  /**
   * Create LangChain tool instance
   */
  getTool() {
    return tool(
      async () => {
        return 'The current queue has 6 items waiting to be processed.';
      },
      {
        name: 'get_queue_status',
        description:
          'Get the current status of the processing queue including the number of items waiting to be processed.',
        schema: z.object({}),
      },
    );
  }
}
