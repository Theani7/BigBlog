// =============================================================================
/* global AbortSignal, AbortController */
// ANTHROPIC PROVIDER
// Direct fetch-based Anthropic API adapter for the AI abstraction layer
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
import { getModel, getDefaultModel, estimateCost } from '../models';
import type { ModelDefinition } from '../models';
import type { AIProvider } from '../provider';

// =============================================================================
// ANTHROPIC API TYPES
// =============================================================================

interface AnthropicChatRequest {
  model: string;
  max_tokens: number;
  system?: string;
  messages: AnthropicMessage[];
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  stop_sequences?: string[];
}

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicChatResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicContentBlock[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
  usage: AnthropicUsage;
}

interface AnthropicContentBlock {
  type: 'text';
  text: string;
}

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
}

interface AnthropicStreamEvent {
  type: string;
  message?: AnthropicChatResponse;
  index?: number;
  delta?: {
    type: 'text_delta';
    text: string;
  };
  usage?: AnthropicUsage;
}

interface AnthropicErrorResponse {
  error: {
    type: string;
    message: string;
  };
}

// =============================================================================
// PROVIDER CONFIG
// =============================================================================

interface AnthropicProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const DEFAULT_TIMEOUT_MS = 30_000;
const PROVIDER_NAME: AIProviderName = 'anthropic';
const ANTHROPIC_VERSION = '2023-06-01';

const FINISH_REASON_MAP: Record<string, AIResponse['finishReason']> = {
  end_turn: 'stop',
  stop_sequence: 'stop',
  max_tokens: 'length',
};

// =============================================================================
// ANTHROPIC PROVIDER
// =============================================================================

export class AnthropicProvider implements AIProvider {
  readonly name: AIProviderName = PROVIDER_NAME;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: AnthropicProviderConfig) {
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
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
        signal: this.createTimeoutSignal(),
      });

      if (response.status === 401) return false;
      return response.ok || response.status === 400;
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
    const anthropicRequest = this.buildChatRequest(request, modelDef, false);
    const id = crypto.randomUUID();

    try {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(anthropicRequest),
        signal: this.createTimeoutSignal(),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      const data = (await response.json()) as AnthropicChatResponse;
      const latencyMs = Date.now() - startTime;
      const content = data.content
        .filter((block): block is AnthropicContentBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');
      const finishReason = this.mapFinishReason(data.stop_reason);
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
    const anthropicRequest = this.buildChatRequest(request, modelDef, true);
    const id = crypto.randomUUID();

    callbacks.onStart?.(id);

    let accumulatedContent = '';
    let finalUsage: AnthropicUsage | undefined;
    let finalFinishReason: string | null = null;

    try {
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(anthropicRequest),
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
            const event = JSON.parse(payload) as AnthropicStreamEvent;

            if (event.type === 'message_start' && event.message?.id) {
              finalUsage = event.message.usage;
            }

            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              const delta = event.delta.text;
              accumulatedContent += delta;

              const streamChunk: AIStreamChunk = {
                id,
                delta,
              };

              callbacks.onChunk?.(streamChunk);
            }

            if (event.type === 'message_delta' && event.delta) {
              finalFinishReason = (event.delta as { stop_reason?: string }).stop_reason ?? null;
            }

            if (event.type === 'message_delta' && event.usage) {
              finalUsage = {
                input_tokens: finalUsage?.input_tokens ?? 0,
                output_tokens: event.usage.output_tokens,
              };
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

  async embed(_request: EmbeddingRequest): Promise<EmbeddingResponse> {
    throw new AIError(
      'Anthropic does not support embeddings. Use OpenAI or another provider.',
      'INVALID_REQUEST',
      PROVIDER_NAME,
      false
    );
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
      'x-api-key': this.apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
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
          `Model ${modelId} is not an Anthropic model`,
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
        'No default Anthropic chat model available',
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
  ): AnthropicChatRequest {
    let systemPrompt: string | undefined;
    const messages: AnthropicMessage[] = [];

    for (const msg of request.messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    if (messages.length === 0) {
      messages.push({ role: 'user', content: '.' });
    }

    const anthropicRequest: AnthropicChatRequest = {
      model: model.id,
      max_tokens: request.maxTokens ?? model.maxOutput,
      messages,
    };

    if (systemPrompt !== undefined) {
      anthropicRequest.system = systemPrompt;
    }

    if (stream) {
      anthropicRequest.stream = true;
    }

    if (request.temperature !== undefined) {
      anthropicRequest.temperature = request.temperature;
    }

    if (request.topP !== undefined) {
      anthropicRequest.top_p = request.topP;
    }

    if (request.stop !== undefined) {
      anthropicRequest.stop_sequences = request.stop;
    }

    return anthropicRequest;
  }

  private mapFinishReason(reason: string | null | undefined): AIResponse['finishReason'] {
    if (!reason) return 'stop';
    return FINISH_REASON_MAP[reason] ?? 'error';
  }

  private buildUsage(
    usage: AnthropicUsage | undefined,
    model: ModelDefinition
  ): AIUsage {
    const promptTokens = usage?.input_tokens ?? 0;
    const completionTokens = usage?.output_tokens ?? 0;
    const totalTokens = promptTokens + completionTokens;
    const estimatedCostUsd = estimateCost(model, promptTokens, completionTokens);

    return {
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd,
    };
  }

  private async handleErrorResponse(response: Response): Promise<AIError> {
    let message = `Anthropic API error: ${response.status}`;
    let code: AIError['code'] = 'UNKNOWN';

    try {
      const body = (await response.json()) as AnthropicErrorResponse;
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
        if (message.toLowerCase().includes('too long') || message.toLowerCase().includes('token')) {
          code = 'CONTEXT_LENGTH_EXCEEDED';
        } else {
          code = 'INVALID_REQUEST';
        }
        break;
      case 404:
        code = 'MODEL_NOT_FOUND';
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
