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
  allowlist: [],
  blocklist: [],
};

export const SUPPORTED_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  ollama: ['llama3', 'llama3:8b', 'mistral', 'codellama', 'phi3'],
};
