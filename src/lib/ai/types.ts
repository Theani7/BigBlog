// =============================================================================
// AI PROVIDER TYPES
// Core types for the AI abstraction layer
// =============================================================================

export type AIProviderName =
  'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama' | 'cloudflare';

export type AIModelType = 'chat' | 'embedding' | 'image';

// =============================================================================
// PROVIDER CONFIGURATION
// =============================================================================
export interface AIProviderConfig {
  name: AIProviderName;
  apiKey: string;
  baseUrl?: string;
  models?: Partial<Record<AIModelType, string>>;
  maxRetries?: number;
  timeoutMs?: number;
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface AIConfig {
  providers: AIProviderConfig[];
  defaultProvider: AIProviderName;
  fallbackOrder: AIProviderName[];
  cache: {
    enabled: boolean;
    ttlSeconds: number;
    maxEntries: number;
  };
  safety: {
    enabled: boolean;
    maxInputTokens: number;
    maxOutputTokens: number;
    blockedPatterns: string[];
  };
  cost: {
    enabled: boolean;
    monthlyBudgetUsd: number;
    alertThresholdPercent: number;
  };
}

// =============================================================================
// REQUEST / RESPONSE
// =============================================================================
export interface AIRequest {
  model?: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  responseFormat?: { type: 'text' | 'json_object' };
  metadata?: Record<string, unknown>;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  id: string;
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  model: string;
  provider: AIProviderName;
  usage: AIUsage;
  latencyMs: number;
  cached: boolean;
  metadata?: Record<string, unknown>;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

// =============================================================================
// STREAMING
// =============================================================================
export interface AIStreamChunk {
  id: string;
  delta: string;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
  usage?: Partial<AIUsage>;
}

export interface AIStreamCallbacks {
  onStart?: (id: string) => void;
  onChunk?: (chunk: AIStreamChunk) => void;
  onEnd?: (response: AIResponse) => void;
  onError?: (error: AIError) => void;
}

// =============================================================================
// EMBEDDINGS
// =============================================================================
export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  provider: AIProviderName;
  usage: {
    totalTokens: number;
    estimatedCostUsd: number;
  };
}

// =============================================================================
// PROMPTS
// =============================================================================
export type PromptCategory =
  | 'summary'
  | 'seo'
  | 'tags'
  | 'titles'
  | 'categories'
  | 'reading-level'
  | 'explanation'
  | 'translation'
  | 'recommendation'
  | 'author';

export interface PromptTemplate {
  id: string;
  version: number;
  category: PromptCategory;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  variables: string[];
  maxTokens: number;
  temperature: number;
  responseFormat: 'text' | 'json';
}

export interface PromptVariable {
  key: string;
  value: string;
}

// =============================================================================
// SAFETY
// =============================================================================
export interface SafetyCheck {
  passed: boolean;
  reason?: string;
  blockedPattern?: string;
}

export interface SafetyConfig {
  enabled: boolean;
  maxInputTokens: number;
  maxOutputTokens: number;
  blockedPatterns: string[];
  injectionPatterns: string[];
}

// =============================================================================
// COST
// =============================================================================
export interface CostEntry {
  id: string;
  provider: AIProviderName;
  model: string;
  feature: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  cached: boolean;
  success: boolean;
  error?: string;
  createdAt: Date;
}

export interface CostSummary {
  totalRequests: number;
  totalTokens: number;
  totalCostUsd: number;
  byProvider: Record<AIProviderName, { requests: number; tokens: number; costUsd: number }>;
  byFeature: Record<string, { requests: number; tokens: number; costUsd: number }>;
  cacheHitRate: number;
  avgLatencyMs: number;
  errorRate: number;
}

// =============================================================================
// CONTENT INTELLIGENCE
// =============================================================================
export interface ArticleAnalysis {
  slug: string;
  summary: string;
  suggestedTags: string[];
  suggestedCategory: string;
  keywords: string[];
  readingLevel: string;
  expertiseLevel: string;
  qualityScore: number;
  embedding?: number[];
  analyzedAt: Date;
}

export interface DuplicateCheck {
  isDuplicate: boolean;
  similarSlugs: string[];
  similarityScores: number[];
}

// =============================================================================
// READER FEATURES
// =============================================================================
export interface ArticleSummary {
  summary: string;
  keyTakeaways: string[];
  estimatedPrerequisites: string[];
}

export interface SectionExplanation {
  original: string;
  explanation: string;
  termDefinitions: { term: string; definition: string }[];
}

// =============================================================================
// AUTHOR FEATURES
// =============================================================================
export interface HeadlineSuggestion {
  headline: string;
  score: number;
  reasoning: string;
}

export interface SEORecommendations {
  metaDescription: string;
  titleSuggestions: string[];
  keywordRecommendations: string[];
  contentImprovements: string[];
}

export interface OutlineSection {
  title: string;
  description: string;
  subsections?: OutlineSection[];
}

// =============================================================================
// ERRORS
// =============================================================================
export class AIError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public provider?: AIProviderName,
    public retryable?: boolean,
    public cause?: Error
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export type AIErrorCode =
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_API_KEY'
  | 'RATE_LIMITED'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'CONTENT_FILTER'
  | 'INVALID_REQUEST'
  | 'MODEL_NOT_FOUND'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'COST_LIMIT_EXCEEDED'
  | 'SAFETY_VIOLATION'
  | 'UNKNOWN';
