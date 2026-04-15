import { env } from '../config.js';
import { GeminiProvider } from './geminiProvider.js';
import { MockProvider } from './mockProvider.js';

let provider;

export function getAiProvider() {
  if (provider) {
    return provider;
  }

  provider = env.MOCK_AI || !env.hasGeminiKey ? new MockProvider() : new GeminiProvider();
  return provider;
}

export function getProviderMode() {
  return env.MOCK_AI || !env.hasGeminiKey ? 'mock' : 'gemini';
}

