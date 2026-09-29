import { ChatOpenAI } from '@langchain/openai';

export interface LlmConfig {
  provider: string;
  apiKey: string;
  baseURL: string;
  model: string;
}

/** Hard ceiling for one chat turn (the configured router can take 15-30 s). */
export const LLM_TIMEOUT_MS = 60_000;

/**
 * Reads LLM_PROVIDER / LLM_API_BASE_URL / LLM_API_KEY / LLM_MODEL (plus the legacy
 * OPENROUTER_API_KEY and OLLAMA_* variables). Returns null when no usable key is configured.
 */
export function getLlmConfig(): LlmConfig | null {
  const provider = (process.env.LLM_PROVIDER || 'openrouter').toLowerCase();
  if (provider === 'ollama') {
    return {
      provider,
      apiKey: 'ollama', // Ollama ignores the key but the OpenAI client requires one.
      baseURL: `${(process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '')}/v1`,
      model: process.env.OLLAMA_MODEL || 'gemma2',
    };
  }
  const apiKey = process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY || '';
  if (!apiKey.trim()) return null;
  return {
    provider,
    apiKey,
    baseURL: process.env.LLM_API_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.LLM_MODEL || 'google/gemma-4-31b-it:free',
  };
}

export function createChatModel(config: LlmConfig): ChatOpenAI {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return new ChatOpenAI({
    apiKey: config.apiKey,
    model: config.model,
    temperature: 0.2,
    timeout: LLM_TIMEOUT_MS,
    maxRetries: 1,
    configuration: {
      baseURL: config.baseURL,
      defaultHeaders: {
        // OpenRouter-style app attribution headers (ignored by other providers).
        ...(siteUrl ? { 'HTTP-Referer': siteUrl } : {}),
        'X-Title': 'Aura OS',
      },
    },
  });
}
