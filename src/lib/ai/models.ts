// =============================================================================
// MODEL REGISTRY
// Defines available models, capabilities, and pricing for all providers
// =============================================================================

import type { AIProviderName, AIModelType } from './types';

export interface ModelDefinition {
  id: string;
  name: string;
  provider: AIProviderName;
  type: AIModelType;
  contextWindow: number;
  maxOutput: number;
  supportsStreaming: boolean;
  supportsJsonMode: boolean;
  supportsEmbeddings: boolean;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  embeddingCostPer1kTokens: number;
  capabilities: string[];
}

// =============================================================================
// MODEL REGISTRY
// =============================================================================
export const MODEL_REGISTRY: ModelDefinition[] = [
  // -------------------------------------------------------------------------
  // OpenAI
  // -------------------------------------------------------------------------
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    type: 'chat',
    contextWindow: 128000,
    maxOutput: 16384,
    supportsStreaming: true,
    supportsJsonMode: true,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0.0025,
    outputCostPer1kTokens: 0.01,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat', 'analysis', 'code', 'creative'],
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    type: 'chat',
    contextWindow: 128000,
    maxOutput: 16384,
    supportsStreaming: true,
    supportsJsonMode: true,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0.00015,
    outputCostPer1kTokens: 0.0006,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat', 'analysis', 'code'],
  },
  {
    id: 'text-embedding-3-small',
    name: 'Text Embedding 3 Small',
    provider: 'openai',
    type: 'embedding',
    contextWindow: 8191,
    maxOutput: 0,
    supportsStreaming: false,
    supportsJsonMode: false,
    supportsEmbeddings: true,
    inputCostPer1kTokens: 0,
    outputCostPer1kTokens: 0,
    embeddingCostPer1kTokens: 0.00002,
    capabilities: ['embeddings'],
  },
  {
    id: 'text-embedding-3-large',
    name: 'Text Embedding 3 Large',
    provider: 'openai',
    type: 'embedding',
    contextWindow: 8191,
    maxOutput: 0,
    supportsStreaming: false,
    supportsJsonMode: false,
    supportsEmbeddings: true,
    inputCostPer1kTokens: 0,
    outputCostPer1kTokens: 0,
    embeddingCostPer1kTokens: 0.00013,
    capabilities: ['embeddings'],
  },

  // -------------------------------------------------------------------------
  // Anthropic
  // -------------------------------------------------------------------------
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    type: 'chat',
    contextWindow: 200000,
    maxOutput: 8192,
    supportsStreaming: true,
    supportsJsonMode: false,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat', 'analysis', 'code', 'creative', 'long-context'],
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    type: 'chat',
    contextWindow: 200000,
    maxOutput: 8192,
    supportsStreaming: true,
    supportsJsonMode: false,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0.001,
    outputCostPer1kTokens: 0.005,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat', 'analysis', 'code'],
  },

  // -------------------------------------------------------------------------
  // Google Gemini
  // -------------------------------------------------------------------------
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    type: 'chat',
    contextWindow: 1048576,
    maxOutput: 8192,
    supportsStreaming: true,
    supportsJsonMode: true,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0.0001,
    outputCostPer1kTokens: 0.0004,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat', 'analysis', 'code', 'multimodal'],
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    type: 'chat',
    contextWindow: 1048576,
    maxOutput: 65536,
    supportsStreaming: true,
    supportsJsonMode: true,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0.00015,
    outputCostPer1kTokens: 0.0006,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat', 'analysis', 'code', 'multimodal', 'reasoning'],
  },
  {
    id: 'text-embedding-004',
    name: 'Text Embedding 004',
    provider: 'gemini',
    type: 'embedding',
    contextWindow: 2048,
    maxOutput: 0,
    supportsStreaming: false,
    supportsJsonMode: false,
    supportsEmbeddings: true,
    inputCostPer1kTokens: 0,
    outputCostPer1kTokens: 0,
    embeddingCostPer1kTokens: 0.00001,
    capabilities: ['embeddings'],
  },

  // -------------------------------------------------------------------------
  // OpenRouter
  // -------------------------------------------------------------------------
  {
    id: 'openrouter/auto',
    name: 'OpenRouter Auto',
    provider: 'openrouter',
    type: 'chat',
    contextWindow: 200000,
    maxOutput: 16384,
    supportsStreaming: true,
    supportsJsonMode: true,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0.001,
    outputCostPer1kTokens: 0.003,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat', 'analysis'],
  },

  // -------------------------------------------------------------------------
  // Ollama (local)
  // -------------------------------------------------------------------------
  {
    id: 'llama3.2',
    name: 'Llama 3.2',
    provider: 'ollama',
    type: 'chat',
    contextWindow: 128000,
    maxOutput: 8192,
    supportsStreaming: true,
    supportsJsonMode: false,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0,
    outputCostPer1kTokens: 0,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat', 'analysis'],
  },
  {
    id: 'nomic-embed-text',
    name: 'Nomic Embed Text',
    provider: 'ollama',
    type: 'embedding',
    contextWindow: 8192,
    maxOutput: 0,
    supportsStreaming: false,
    supportsJsonMode: false,
    supportsEmbeddings: true,
    inputCostPer1kTokens: 0,
    outputCostPer1kTokens: 0,
    embeddingCostPer1kTokens: 0,
    capabilities: ['embeddings'],
  },

  // -------------------------------------------------------------------------
  // Cloudflare Workers AI
  // -------------------------------------------------------------------------
  {
    id: '@cf/meta/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B (Cloudflare)',
    provider: 'cloudflare',
    type: 'chat',
    contextWindow: 8192,
    maxOutput: 4096,
    supportsStreaming: true,
    supportsJsonMode: false,
    supportsEmbeddings: false,
    inputCostPer1kTokens: 0,
    outputCostPer1kTokens: 0.0011,
    embeddingCostPer1kTokens: 0,
    capabilities: ['chat'],
  },
  {
    id: '@cf/baai/bge-base-en-v1.5',
    name: 'BGE Base EN (Cloudflare)',
    provider: 'cloudflare',
    type: 'embedding',
    contextWindow: 512,
    maxOutput: 0,
    supportsStreaming: false,
    supportsJsonMode: false,
    supportsEmbeddings: true,
    inputCostPer1kTokens: 0,
    outputCostPer1kTokens: 0,
    embeddingCostPer1kTokens: 0.0001,
    capabilities: ['embeddings'],
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getModel(id: string): ModelDefinition | undefined {
  return MODEL_REGISTRY.find((m) => m.id === id);
}

export function getModelsByProvider(provider: AIProviderName): ModelDefinition[] {
  return MODEL_REGISTRY.filter((m) => m.provider === provider);
}

export function getModelsByType(type: AIModelType): ModelDefinition[] {
  return MODEL_REGISTRY.filter((m) => m.type === type);
}

export function getDefaultModel(
  provider: AIProviderName,
  type: AIModelType
): ModelDefinition | undefined {
  return getModelsByProvider(provider).find((m) => m.type === type);
}

export function estimateCost(
  model: ModelDefinition,
  promptTokens: number,
  completionTokens: number
): number {
  if (model.provider === 'ollama') return 0;
  const inputCost = (promptTokens / 1000) * model.inputCostPer1kTokens;
  const outputCost = (completionTokens / 1000) * model.outputCostPer1kTokens;
  return Math.round((inputCost + outputCost) * 1000000) / 1000000;
}

export function estimateEmbeddingCost(model: ModelDefinition, tokens: number): number {
  if (model.provider === 'ollama') return 0;
  return Math.round((tokens / 1000) * model.embeddingCostPer1kTokens * 1000000) / 1000000;
}
