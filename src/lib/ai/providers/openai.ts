// =============================================================================
/* global AbortSignal, AbortController */
// OPENAI PROVIDER
// Direct fetch-based OpenAI API adapter for the AI abstraction layer
// =============================================================================

import type {
  AIProviderName,
  AIRequest,
  AIResponse,
  AIUsage,
  AIStreamCallbacks,
  AIStreamChunk,
  EmbeddingRequest,
  EmbeddingResponse,
} from '../types';
import { AIError } from '../types';
import { getModel, getDefaultModel, estimateCost, estimateEmbeddingCost } from '../models';
import type { ModelDefinition } from '../models';
import type { AIProvider } from '../provider';

// =============================================================================
// OPENAI API TYPES
// =============================================================================

interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  stream?: boolean;
  stream_options?: { include_usage: boolean };
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  response_format?: { type: 'text' | 'json_object' };
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage?: OpenAIUsage;
}

interface OpenAIChoice {
  index: number;
  message: OpenAIMessage;
  finish_reason: string | null;
}

interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIStreamChoice[];
  usage?: OpenAIUsage;
}

interface OpenAIStreamChoice {
  index: number;
  delta: Partial<OpenAIMessage>;
  finish_reason: string | null;
}

interface OpenAIEmbeddingRequest {
  model: string;
  input: string | string[];
  dimensions?: number;
}

interface OpenAIEmbeddingResponse {
  object: string;
  data: OpenAIEmbeddingData[];
  model: string;
  usage: OpenAIUsage;
}

interface OpenAIEmbeddingData {
  object: string;
  embedding: number[];
  index: number;
}

interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

// =============================================================================
// PROVIDER CONFIG
// =============================================================================

interface OpenAIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_TIMEOUT_MS = 30_000;
const PROVIDER_NAME: AIProviderName = 'openai';

const FINISH_REASON_MAP: Record<string, AIResponse['finishReason']> = {
  stop: 'stop',
  length: 'length',
  content_filter: 'content_filter',
};

// =============================================================================
// OPENAI PROVIDER
// =============================================================================

export class OpenAIProvider implements AIProvider {
  readonly name: AIProviderName = PROVIDER_NAME;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: OpenAIProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  get isAvailable(): boolean {
    return this.apiKey.length > 0;
  }

  // =========================================================================
  // VALIDATION
  // =========================================================================

  async validate(): Promise<boolean> {
    if (!this.isAvailable) return false;

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: this.createTimeoutSignal(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // CHAT COMPLETIONS
  // =========================================================================

  async chat(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const modelDef = this.resolveModel(request.model, 'chat');
    const openaiRequest = this.buildChatRequest(request, modelDef, false);
    const id = crypto.randomUUID();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(openaiRequest),
        signal: this.createTimeoutSignal(),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = (await response.json()) as OpenAIChatResponse;
      const latencyMs = Date.now() - startTime;
      const choice = data.choices[0];
      const content = choice?.message?.content ?? '';
      const finishReason = this.mapFinishReason(choice?.finish_reason);
      const usage = this.buildUsage(data.usage, modelDef);

      const aiResponse: AIResponse = {
        id: data.id ?? id,
        content,
        finishReason,
        model: modelDef.id,
        provider: PROVIDER_NAME,
        usage,
        latencyMs,
        cached: false,
      };

      if (request.metadata !== undefined) {
        aiResponse.metadata = request.metadata;
      }

      return aiResponse;
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw this.wrapError(error);
    }
  }

  // =========================================================================
  // STREAMING
  // =========================================================================

  async stream(request: AIRequest, callbacks: AIStreamCallbacks): Promise<void> {
    const startTime = Date.now();
    const modelDef = this.resolveModel(request.model, 'chat');
    const openaiRequest = this.buildChatRequest(request, modelDef, true);
    const id = crypto.randomUUID();

    callbacks.onStart?.(id);

    let accumulatedContent = '';
    let finalUsage: OpenAIUsage | undefined;
    let finalFinishReason: string | null = null;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(openaiRequest),
        signal: this.createTimeoutSignal(),
      });

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        callbacks.onError?.(error);
        return;
      }

      if (!response.body) {
        const error = new AIError(
          'Response body is null',
          'NETWORK_ERROR',
          PROVIDER_NAME,
          false
        );
        callbacks.onError?.(error);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const payload = trimmed.slice(6);
          if (payload === '[DONE]') continue;

          try {
            const chunk = JSON.parse(payload) as OpenAIStreamChunk;

            if (chunk.choices[0]?.delta?.content) {
              const delta = chunk.choices[0].delta.content;
              accumulatedContent += delta;

              const streamChunk: AIStreamChunk = {
                id: chunk.id ?? id,
                delta,
              };

              if (chunk.choices[0].finish_reason) {
                streamChunk.finishReason = this.mapFinishReason(
                  chunk.choices[0].finish_reason
                );
              }

              callbacks.onChunk?.(streamChunk);
            }

            if (chunk.choices[0]?.finish_reason) {
              finalFinishReason = chunk.choices[0].finish_reason;
            }

            if (chunk.usage) {
              finalUsage = chunk.usage;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      const latencyMs = Date.now() - startTime;
      const usage = this.buildUsage(finalUsage, modelDef);

      const finalResponse: AIResponse = {
        id,
        content: accumulatedContent,
        finishReason: finalFinishReason
          ? this.mapFinishReason(finalFinishReason)
          : 'stop',
        model: modelDef.id,
        provider: PROVIDER_NAME,
        usage,
        latencyMs,
        cached: false,
      };

      if (request.metadata !== undefined) {
        finalResponse.metadata = request.metadata;
      }

      callbacks.onEnd?.(finalResponse);
    } catch (error) {
      if (error instanceof AIError) {
        callbacks.onError?.(error);
        return;
      }
      callbacks.onError?.(this.wrapError(error));
    }
  }

  // =========================================================================
  // EMBEDDINGS
  // =========================================================================

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const modelDef = this.resolveEmbeddingModel(request.model);
    const input = Array.isArray(request.input) ? request.input : [request.input];

    const openaiRequest: OpenAIEmbeddingRequest = {
      model: modelDef.id,
      input,
    };

    if (request.dimensions !== undefined) {
      openaiRequest.dimensions = request.dimensions;
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(openaiRequest),
        signal: this.createTimeoutSignal(),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = (await response.json()) as OpenAIEmbeddingResponse;
      const embeddings = data.data
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding);
      const totalTokens = data.usage?.total_tokens ?? 0;
      const estimatedCostUsd = estimateEmbeddingCost(modelDef, totalTokens);

      return {
        embeddings,
        model: modelDef.id,
        provider: PROVIDER_NAME,
        usage: {
          totalTokens,
          estimatedCostUsd,
        },
      };
    } catch (error) {
      if (error instanceof AIError) throw error;
      throw this.wrapError(error);
    }
  }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private createTimeoutSignal(): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeoutMs);
    return controller.signal;
  }

  private buildHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private resolveModel(modelId: string | undefined, type: 'chat'): ModelDefinition {
    if (modelId) {
      const model = getModel(modelId);
      if (!model) {
        throw new AIError(
          `Model not found: ${modelId}`,
          'MODEL_NOT_FOUND',
          PROVIDER_NAME,
          false
        );
      }
      if (model.provider !== PROVIDER_NAME) {
        throw new AIError(
          `Model ${modelId} is not an OpenAI model`,
          'INVALID_REQUEST',
          PROVIDER_NAME,
          false
        );
      }
      return model;
    }

    const defaultModel = getDefaultModel(PROVIDER_NAME, type);
    if (!defaultModel) {
      throw new AIError(
        'No default OpenAI chat model available',
        'MODEL_NOT_FOUND',
        PROVIDER_NAME,
        false
      );
    }
    return defaultModel;
  }

  private resolveEmbeddingModel(modelId: string | undefined): ModelDefinition {
    if (modelId) {
      const model = getModel(modelId);
      if (!model) {
        throw new AIError(
          `Model not found: ${modelId}`,
          'MODEL_NOT_FOUND',
          PROVIDER_NAME,
          false
        );
      }
      if (model.provider !== PROVIDER_NAME) {
        throw new AIError(
          `Model ${modelId} is not an OpenAI model`,
          'INVALID_REQUEST',
          PROVIDER_NAME,
          false
        );
      }
      if (!model.supportsEmbeddings) {
        throw new AIError(
          `Model ${modelId} does not support embeddings`,
          'INVALID_REQUEST',
          PROVIDER_NAME,
          false
        );
      }
      return model;
    }

    const defaultModel = getDefaultModel(PROVIDER_NAME, 'embedding');
    if (!defaultModel) {
      throw new AIError(
        'No default OpenAI embedding model available',
        'MODEL_NOT_FOUND',
        PROVIDER_NAME,
        false
      );
    }
    return defaultModel;
  }

  private buildChatRequest(
    request: AIRequest,
    model: ModelDefinition,
    stream: boolean
  ): OpenAIChatRequest {
    const openaiRequest: OpenAIChatRequest = {
      model: model.id,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    if (stream) {
      openaiRequest.stream = true;
      openaiRequest.stream_options = { include_usage: true };
    }

    if (request.temperature !== undefined) {
      openaiRequest.temperature = request.temperature;
    }

    if (request.maxTokens !== undefined) {
      openaiRequest.max_tokens = request.maxTokens;
    }

    if (request.topP !== undefined) {
      openaiRequest.top_p = request.topP;
    }

    if (request.frequencyPenalty !== undefined) {
      openaiRequest.frequency_penalty = request.frequencyPenalty;
    }

    if (request.presencePenalty !== undefined) {
      openaiRequest.presence_penalty = request.presencePenalty;
    }

    if (request.stop !== undefined) {
      openaiRequest.stop = request.stop;
    }

    if (request.responseFormat !== undefined && model.supportsJsonMode) {
      openaiRequest.response_format = { type: request.responseFormat.type };
    }

    return openaiRequest;
  }

  private mapFinishReason(reason: string | null | undefined): AIResponse['finishReason'] {
    if (!reason) return 'stop';
    return FINISH_REASON_MAP[reason] ?? 'error';
  }

  private buildUsage(
    usage: OpenAIUsage | undefined,
    model: ModelDefinition
  ): AIUsage {
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const totalTokens = usage?.total_tokens ?? 0;
    const estimatedCostUsd = estimateCost(model, promptTokens, completionTokens);

    return {
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd,
    };
  }

  private async handleErrorResponse(response: Response): Promise<AIError> {
    let message = `OpenAI API error: ${response.status}`;
    let code: AIError['code'] = 'UNKNOWN';

    try {
      const body = (await response.json()) as OpenAIErrorResponse;
      message = body.error?.message ?? message;
    } catch {
      // Use default message if JSON parsing fails
    }

    switch (response.status) {
      case 401:
        code = 'INVALID_API_KEY';
        break;
      case 429:
        code = 'RATE_LIMITED';
        break;
      case 400:
        code = 'INVALID_REQUEST';
        break;
      case 404:
        code = 'MODEL_NOT_FOUND';
        break;
      case 413:
        code = 'CONTEXT_LENGTH_EXCEEDED';
        break;
      case 500:
      case 502:
      case 503:
        code = 'PROVIDER_UNAVAILABLE';
        break;
    }

    const retryable = response.status === 429 || response.status >= 500;

    return new AIError(message, code, PROVIDER_NAME, retryable);
  }

  private wrapError(error: unknown): AIError {
    if (error instanceof AIError) return error;

    if (error instanceof Error && error.name === 'AbortError') {
      return new AIError(
        'Request timed out',
        'TIMEOUT',
        PROVIDER_NAME,
        true,
        error
      );
    }

    if (error instanceof TypeError) {
      return new AIError(
        `Network error: ${error.message}`,
        'NETWORK_ERROR',
        PROVIDER_NAME,
        true,
        error
      );
    }

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return new AIError(message, 'UNKNOWN', PROVIDER_NAME, false);
  }
}
