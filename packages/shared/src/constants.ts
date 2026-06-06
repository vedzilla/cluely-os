import type { AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  provider: {
    type: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  captureStoreScreenshots: false,
  intervalCaptureEnabled: false,
  intervalCaptureSeconds: 30,
  globalHotkey: 'CommandOrControl+Shift+Space',
  theme: 'dark',
  localOnlyMode: false,
  stealthMode: true,
  allowlist: [],
  blocklist: [],
};

export const SUPPORTED_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  ollama: ['llama3', 'llama3:8b', 'mistral', 'codellama', 'phi3'],
};
