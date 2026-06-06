import { create } from 'zustand';
import type {
  AppSettings,
  CaptureResult,
  CaptureStatus,
  ChatMessage,
  ContextPayload,
  TranscriptSegment,
} from '@copilot/shared';
import { DEFAULT_SETTINGS } from '@copilot/shared';
import { v4 as uuid } from 'uuid';

type Page = 'chat' | 'privacy' | 'settings' | 'sessions';

// Held outside the store (not serializable): tears down the active audio capture.
let captureStop: (() => void) | null = null;

interface AppState {
  // Navigation
  page: Page;
  setPage: (page: Page) => void;

  // Panel (the surface that drops below the command bar)
  panelOpen: boolean;
  openPanel: (page?: Page) => void;
  closePanel: () => void;
  togglePanel: (page: Page) => void;

  // "Ask AI" — bumps a counter the chat input watches to grab focus.
  askSeq: number;
  focusAsk: () => void;

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

  // Audio transcription ("Listen")
  listening: boolean;
  transcript: TranscriptSegment[];
  audioError: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
  askAboutTranscript: () => Promise<void>;

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

  panelOpen: false,
  openPanel: (page) => set((s) => ({ panelOpen: true, page: page ?? s.page })),
  closePanel: () => set({ panelOpen: false }),
  togglePanel: (page) =>
    set((s) => (s.panelOpen && s.page === page ? { panelOpen: false } : { panelOpen: true, page })),

  askSeq: 0,
  focusAsk: () => set((s) => ({ panelOpen: true, page: 'chat', askSeq: s.askSeq + 1 })),

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

  listening: false,
  transcript: [],
  audioError: null,
  startListening: async () => {
    if (get().listening) return;
    set({ listening: true, audioError: null });
    const { startCapture } = await import('../lib/audioCapture');
    captureStop = await startCapture({
      sources: ['mic', 'system'],
      onSegment: ({ source, text }) => {
        if (!text.trim()) return;
        set((s) => ({
          transcript: [...s.transcript, { id: uuid(), source, text, timestamp: Date.now() }],
        }));
      },
      onError: (message) => set({ audioError: message }),
    });
  },
  stopListening: () => {
    captureStop?.();
    captureStop = null;
    set({ listening: false });
  },
  clearTranscript: () => set({ transcript: [], audioError: null }),
  askAboutTranscript: async () => {
    const lines = get()
      .transcript.map((s) => `${s.source === 'mic' ? 'Me' : 'Them'}: ${s.text}`)
      .join('\n');
    if (!lines.trim()) return;
    set({ panelOpen: true, page: 'chat' });
    const content = `Here is a live transcript of a conversation. Summarize the key points and suggest a helpful response or next step.\n\n---\n${lines}\n---`;
    await get().sendMessage(content);
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
    set({ contextPayload: payload, contextApproved: false, page: 'chat', panelOpen: true });
  },
}));
