import { create } from 'zustand';
import type { AppSettings, CaptureResult, CaptureStatus, ChatMessage, ContextPayload } from '@copilot/shared';
import { DEFAULT_SETTINGS } from '@copilot/shared';
import { v4 as uuid } from 'uuid';

type Page = 'chat' | 'privacy' | 'settings' | 'sessions';

interface AppState {
  // Navigation
  page: Page;
  setPage: (page: Page) => void;

  // Settings
  settings: AppSettings;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;

  // Capture
  captureStatus: CaptureStatus;
  setCaptureStatus: (status: CaptureStatus) => void;
  lastCapture: CaptureResult | null;
  setLastCapture: (capture: CaptureResult | null) => void;
  captureScreen: () => Promise<CaptureResult | null>;

  // Chat
  currentSessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  setCurrentSessionId: (id: string | null) => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setIsStreaming: (streaming: boolean) => void;

  // Context transparency
  contextPayload: ContextPayload | null;
  setContextPayload: (payload: ContextPayload | null) => void;
  contextApproved: boolean;
  setContextApproved: (approved: boolean) => void;

  // Sessions
  sessions: Array<{ id: string; title: string; created_at: number; updated_at: number }>;
  loadSessions: () => Promise<void>;
  createNewSession: (title?: string) => Promise<string>;
  deleteSession: (id: string) => Promise<void>;
  loadSession: (id: string) => Promise<void>;

  // Send message to AI
  sendMessage: (content: string) => Promise<void>;
  analyzeScreen: (captureResult: CaptureResult, action: 'analyze' | 'summarize' | 'explain' | 'draft') => Promise<void>;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export const useAppStore = create<AppState>((set, get) => ({
  page: 'chat',
  setPage: (page) => set({ page }),

  settings: { ...DEFAULT_SETTINGS },
  loadSettings: async () => {
    const settings = await window.electronAPI.getSettings();
    set({ settings });
  },
  updateSettings: async (settings) => {
    await window.electronAPI.setSettings(settings);
    set({ settings });
  },

  captureStatus: 'idle',
  setCaptureStatus: (captureStatus) => set({ captureStatus }),
  lastCapture: null,
  setLastCapture: (lastCapture) => set({ lastCapture }),
  captureScreen: async () => {
    set({ captureStatus: 'capturing' });
    try {
      const result = await window.electronAPI.captureScreen();
      if (result) {
        set({ captureStatus: 'processing', lastCapture: result });
        // Save capture metadata
        await window.electronAPI.saveCapture({
          id: result.id,
          session_id: get().currentSessionId ?? undefined,
          image_data: result.imageDataUrl,
          extracted_text: result.extractedText,
          window_title: result.windowTitle,
        });
        set({ captureStatus: 'idle' });
      } else {
        set({ captureStatus: 'idle' });
      }
      return result;
    } catch {
      set({ captureStatus: 'idle' });
      return null;
    }
  },

  currentSessionId: null,
  messages: [],
  isStreaming: false,
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),

  contextPayload: null,
  setContextPayload: (contextPayload) => set({ contextPayload }),
  contextApproved: false,
  setContextApproved: (contextApproved) => set({ contextApproved }),

  sessions: [],
  loadSessions: async () => {
    const sessions = await window.electronAPI.getSessions();
    set({ sessions });
  },
  createNewSession: async (title) => {
    const id = uuid();
    const sessionTitle = title || `Session ${new Date().toLocaleString()}`;
    await window.electronAPI.createSession({ id, title: sessionTitle });
    set({ currentSessionId: id, messages: [], lastCapture: null, contextPayload: null, contextApproved: false });
    await get().loadSessions();
    return id;
  },
  deleteSession: async (id) => {
    await window.electronAPI.deleteSession(id);
    if (get().currentSessionId === id) {
      set({ currentSessionId: null, messages: [], lastCapture: null });
    }
    await get().loadSessions();
  },
  loadSession: async (id) => {
    const data = await window.electronAPI.getSession(id);
    const msgs: ChatMessage[] = data.messages.map((m) => ({
      id: m.id,
      role: m.role as ChatMessage['role'],
      content: m.content,
      timestamp: m.created_at,
      tokenCount: m.token_count ?? undefined,
    }));
    set({ currentSessionId: id, messages: msgs, lastCapture: null, contextPayload: null, contextApproved: false });
  },

  sendMessage: async (content) => {
    const state = get();
    if (state.isStreaming) return;

    // Ensure session exists
    let sessionId = state.currentSessionId;
    if (!sessionId) {
      sessionId = await get().createNewSession();
    }

    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content,
      timestamp: Date.now(),
      tokenCount: estimateTokens(content),
    };

    set((s) => ({ messages: [...s.messages, userMsg], isStreaming: true }));
    await window.electronAPI.saveMessage({
      id: userMsg.id,
      session_id: sessionId,
      role: userMsg.role,
      content: userMsg.content,
      token_count: userMsg.tokenCount,
    });

    const assistantMsg: ChatMessage = {
      id: uuid(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    set((s) => ({ messages: [...s.messages, assistantMsg] }));

    // Set up stream listeners
    const cleanupStream = window.electronAPI.onAIStream((chunk) => {
      set((s) => {
        const msgs = [...s.messages];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.role === 'assistant') {
          msgs[msgs.length - 1] = { ...lastMsg, content: lastMsg.content + chunk };
        }
        return { messages: msgs };
      });
    });

    const cleanupEnd = window.electronAPI.onAIStreamEnd(() => {
      const finalMsgs = get().messages;
      const lastMsg = finalMsgs[finalMsgs.length - 1];
      if (lastMsg.role === 'assistant') {
        window.electronAPI.saveMessage({
          id: lastMsg.id,
          session_id: sessionId!,
          role: lastMsg.role,
          content: lastMsg.content,
          token_count: estimateTokens(lastMsg.content),
        });
      }
      set({ isStreaming: false });
      cleanupStream();
      cleanupEnd();
      cleanupError();
    });

    const cleanupError = window.electronAPI.onAIStreamError((error) => {
      set((s) => {
        const msgs = [...s.messages];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.role === 'assistant') {
          msgs[msgs.length - 1] = { ...lastMsg, content: `Error: ${error}` };
        }
        return { messages: msgs, isStreaming: false };
      });
      cleanupStream();
      cleanupEnd();
      cleanupError();
    });

    const allMessages = get().messages.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await window.electronAPI.sendChat(allMessages, get().settings);
  },

  analyzeScreen: async (captureResult, action) => {
    const { settings } = get();
    const prompts: Record<string, string> = {
      analyze: 'Analyze the following screen content and provide helpful insights, identify key information, and suggest next actions:',
      summarize: 'Summarize the following screen content concisely:',
      explain: 'Explain what is shown in the following screen content in detail:',
      draft: 'Based on the following screen content, draft a helpful response or next step:',
    };

    const userContent = `${prompts[action]}\n\n---\nScreen content:\n${captureResult.extractedText}\n---`;

    // Build context payload for transparency
    const payload: ContextPayload = {
      capturedText: captureResult.extractedText,
      screenshotPreview: captureResult.imageDataUrl,
      model: settings.provider.model,
      providerType: settings.provider.type,
      estimatedTokens: estimateTokens(userContent),
      isLocal: settings.provider.type === 'ollama',
      userPrompt: prompts[action],
    };
    set({ contextPayload: payload, contextApproved: false, page: 'chat' });
  },
}));
