// =============================================================================
// AI CONFIGURATION
// Environment-aware configuration for the AI layer
// =============================================================================

import type { AIConfig, AIProviderName } from './types';

function getEnv(key: string, fallback: string = ''): string {
  return import.meta.env[key] || process.env[key] || fallback;
}

function getEnvNumber(key: string, fallback: number): number {
  const val = getEnv(key);
  return val ? parseInt(val, 10) : fallback;
}

function getEnvBoolean(key: string, fallback: boolean): boolean {
  const val = getEnv(key);
  if (!val) return fallback;
  return val === 'true' || val === '1';
}

// =============================================================================
// PROVIDER CONFIGS
// =============================================================================
function buildProviderConfigs(): AIConfig['providers'] {
  const providers: AIConfig['providers'] = [];

  const openaiKey = getEnv('OPENAI_API_KEY');
  if (openaiKey) {
    providers.push({
      name: 'openai',
      apiKey: openaiKey,
      baseUrl: getEnv('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
      maxRetries: 3,
      timeoutMs: 30000,
      rateLimit: { requestsPerMinute: 500, tokensPerMinute: 150000 },
    });
  }

  const anthropicKey = getEnv('ANTHROPIC_API_KEY');
  if (anthropicKey) {
    providers.push({
      name: 'anthropic',
      apiKey: anthropicKey,
      baseUrl: getEnv('ANTHROPIC_BASE_URL', 'https://api.anthropic.com'),
      maxRetries: 3,
      timeoutMs: 30000,
      rateLimit: { requestsPerMinute: 1000, tokensPerMinute: 100000 },
    });
  }

  const geminiKey = getEnv('GEMINI_API_KEY');
  if (geminiKey) {
    providers.push({
      name: 'gemini',
      apiKey: geminiKey,
      baseUrl: getEnv('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
      maxRetries: 3,
      timeoutMs: 30000,
      rateLimit: { requestsPerMinute: 600, tokensPerMinute: 32000 },
    });
  }

  const openrouterKey = getEnv('OPENROUTER_API_KEY');
  if (openrouterKey) {
    providers.push({
      name: 'openrouter',
      apiKey: openrouterKey,
      baseUrl: getEnv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
      maxRetries: 2,
      timeoutMs: 30000,
      rateLimit: { requestsPerMinute: 200, tokensPerMinute: 100000 },
    });
  }

  const ollamaUrl = getEnv('OLLAMA_BASE_URL', 'http://localhost:11434');
  providers.push({
    name: 'ollama',
    apiKey: 'ollama',
    baseUrl: ollamaUrl,
    maxRetries: 2,
    timeoutMs: 60000,
  });

  const cloudflareAccountId = getEnv('CLOUDFLARE_ACCOUNT_ID');
  const cloudflareApiKey = getEnv('CLOUDFLARE_API_KEY');
  if (cloudflareAccountId && cloudflareApiKey) {
    providers.push({
      name: 'cloudflare',
      apiKey: cloudflareApiKey,
      baseUrl: `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run`,
      maxRetries: 2,
      timeoutMs: 30000,
      rateLimit: { requestsPerMinute: 300, tokensPerMinute: 50000 },
    });
  }

  return providers;
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================
export function getAIConfig(): AIConfig {
  const providers = buildProviderConfigs();
  const defaultProvider = (getEnv('AI_DEFAULT_PROVIDER', 'openai') as AIProviderName) || 'openai';

  return {
    providers,
    defaultProvider: providers.length > 0 ? defaultProvider : 'ollama',
    fallbackOrder: ['openai', 'anthropic', 'gemini', 'cloudflare', 'ollama'] as AIProviderName[],
    cache: {
      enabled: getEnvBoolean('AI_CACHE_ENABLED', true),
      ttlSeconds: getEnvNumber('AI_CACHE_TTL', 86400),
      maxEntries: getEnvNumber('AI_CACHE_MAX_ENTRIES', 1000),
    },
    safety: {
      enabled: getEnvBoolean('AI_SAFETY_ENABLED', true),
      maxInputTokens: getEnvNumber('AI_MAX_INPUT_TOKENS', 100000),
      maxOutputTokens: getEnvNumber('AI_MAX_OUTPUT_TOKENS', 8192),
      blockedPatterns: getEnv('AI_BLOCKED_PATTERNS', '')
        .split(',')
        .filter(Boolean),
    },
    cost: {
      enabled: getEnvBoolean('AI_COST_ENABLED', true),
      monthlyBudgetUsd: getEnvNumber('AI_MONTHLY_BUDGET', 50),
      alertThresholdPercent: getEnvNumber('AI_ALERT_THRESHOLD', 80),
    },
  };
}
