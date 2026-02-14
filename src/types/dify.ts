export interface DifyResponseMetadataUsage {
  prompt_tokens: number;
  prompt_unit_price: string;
  prompt_price_unit: string;
  prompt_price: string;
  completion_tokens: number;
  completion_unit_price: string;
  completion_price_unit: string;
  completion_price: string;
  total_tokens: number;
  total_price: string;
  currency: string;
  latency: number;
}

export interface DifyResponseMetadataRetrieverResource {
  position: number;
  dataset_id: string;
  dataset_name: string;
  document_id: string;
  document_name: string;
  segment_id: string;
  score: number;
  content: string;
}

export interface DifyResponseMetadata {
  usage: DifyResponseMetadataUsage;
  retriever_resources?: DifyResponseMetadataRetrieverResource[];
}

export interface DifyResponse {
  event: string;
  task_id: string;
  id: string;
  message_id: string;
  conversation_id: string;
  mode: string;
  answer: string;
  metadata: DifyResponseMetadata;
  created_at: number;
}

export interface DifyRetrieveSegment {
  segment: {
    content: string;
    document: {
      name: string;
      id: string;
    };
    answer?: string;
  };
  score: number;
  position: number;
}

export interface DifyRetrieveResponse {
  query: {
    content: string;
  };
  records: DifyRetrieveSegment[];
}
