// =============================================================================
// AI PROVIDER INTERFACE
// Abstract interface for all AI providers
// =============================================================================

import type {
  AIProviderName,
  AIRequest,
  AIResponse,
  AIStreamCallbacks,
  EmbeddingRequest,
  EmbeddingResponse,
  AIUsage,
} from './types';

// =============================================================================
// PROVIDER INTERFACE
// =============================================================================
export interface AIProvider {
  readonly name: AIProviderName;
  readonly isAvailable: boolean;

  chat(request: AIRequest): Promise<AIResponse>;
  stream(request: AIRequest, callbacks: AIStreamCallbacks): Promise<void>;
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  validate(): Promise<boolean>;
}

// =============================================================================
// PROVIDER REGISTRY
// =============================================================================
export class ProviderRegistry {
  private providers: Map<AIProviderName, AIProvider> = new Map();

  register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: AIProviderName): AIProvider | undefined {
    return this.providers.get(name);
  }

  getAvailable(): AIProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.isAvailable);
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  async validateAll(): Promise<Record<AIProviderName, boolean>> {
    const results: Record<string, boolean> = {};
    for (const [name, provider] of this.providers) {
      try {
        results[name] = await provider.validate();
      } catch {
        results[name] = false;
      }
    }
    return results as Record<AIProviderName, boolean>;
  }
}
