// ── Capture ──────────────────────────────────────────────
export type CaptureStatus = 'idle' | 'capturing' | 'processing' | 'paused';

export interface CaptureResult {
  id: string;
  timestamp: number;
  imageDataUrl: string;       // base64 data URL for preview
  extractedText: string;
  windowTitle?: string;
}

// ── AI Provider ──────────────────────────────────────────
export type AIProviderType = 'openai' | 'ollama';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;            // for OpenAI-compatible
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokenCount?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  captureIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ── Context Transparency ────────────────────────────────
export interface ContextPayload {
  capturedText: string;
  screenshotPreview?: string; // thumbnail data URL
  model: string;
  providerType: AIProviderType;
  estimatedTokens: number;
  isLocal: boolean;           // true if using Ollama
  userPrompt: string;
}

// ── Settings ─────────────────────────────────────────────
export interface AppSettings {
  provider: AIProviderConfig;
  captureStoreScreenshots: boolean;
  intervalCaptureEnabled: boolean;
  intervalCaptureSeconds: number;
  globalHotkey: string;
  theme: 'light' | 'dark';
  localOnlyMode: boolean;
  allowlist: string[];
  blocklist: string[];
}

// ── IPC Channels ─────────────────────────────────────────
export const IPC = {
  CAPTURE_SCREEN: 'capture:screen',
  CAPTURE_RESULT: 'capture:result',
  AI_CHAT: 'ai:chat',
  AI_STREAM: 'ai:stream',
  AI_STREAM_END: 'ai:stream-end',
  AI_STREAM_ERROR: 'ai:stream-error',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  DB_QUERY: 'db:query',
  DB_GET_SESSIONS: 'db:get-sessions',
  DB_GET_SESSION: 'db:get-session',
  DB_CREATE_SESSION: 'db:create-session',
  DB_DELETE_SESSION: 'db:delete-session',
  DB_SAVE_MESSAGE: 'db:save-message',
  DB_SAVE_CAPTURE: 'db:save-capture',
  DB_GET_CAPTURES: 'db:get-captures',
  DB_DELETE_ALL: 'db:delete-all',
  DB_DELETE_CAPTURES: 'db:delete-captures',
  WINDOW_TOGGLE: 'window:toggle',
  WINDOW_MINIMIZE: 'window:minimize',
  APP_STATUS: 'app:status',
} as const;

// ── Database Row Types ──────────────────────────────────
export interface DBSession {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

export interface DBMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_count: number | null;
  created_at: number;
}

export interface DBCapture {
  id: string;
  session_id: string | null;
  image_data: string | null;  // only stored if user enables
  extracted_text: string;
  window_title: string | null;
  created_at: number;
}

export interface DBSetting {
  key: string;
  value: string;
}
