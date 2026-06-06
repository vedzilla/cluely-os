import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '@copilot/shared';
import type { AppSettings, CaptureResult, DBSession, DBMessage, DBCapture } from '@copilot/shared';

const api = {
  // Screen capture
  captureScreen: (): Promise<CaptureResult | null> =>
    ipcRenderer.invoke(IPC.CAPTURE_SCREEN),

  // AI
  sendChat: (messages: Array<{ role: string; content: string }>, settings: AppSettings): Promise<{ success: boolean; content?: string; error?: string }> =>
    ipcRenderer.invoke(IPC.AI_CHAT, { messages, settings }),

  onAIStream: (callback: (chunk: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, chunk: string) => callback(chunk);
    ipcRenderer.on(IPC.AI_STREAM, handler);
    return () => ipcRenderer.removeListener(IPC.AI_STREAM, handler);
  },

  onAIStreamEnd: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC.AI_STREAM_END, handler);
    return () => ipcRenderer.removeListener(IPC.AI_STREAM_END, handler);
  },

  onAIStreamError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) => callback(error);
    ipcRenderer.on(IPC.AI_STREAM_ERROR, handler);
    return () => ipcRenderer.removeListener(IPC.AI_STREAM_ERROR, handler);
  },

  // Settings
  getSettings: (): Promise<AppSettings> =>
    ipcRenderer.invoke(IPC.SETTINGS_GET),

  setSettings: (settings: AppSettings): Promise<boolean> =>
    ipcRenderer.invoke(IPC.SETTINGS_SET, settings),

  // Sessions
  getSessions: (): Promise<DBSession[]> =>
    ipcRenderer.invoke(IPC.DB_GET_SESSIONS),

  getSession: (id: string): Promise<{ session: DBSession; messages: DBMessage[]; captures: DBCapture[] }> =>
    ipcRenderer.invoke(IPC.DB_GET_SESSION, id),

  createSession: (session: { id: string; title: string }): Promise<DBSession> =>
    ipcRenderer.invoke(IPC.DB_CREATE_SESSION, session),

  deleteSession: (id: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC.DB_DELETE_SESSION, id),

  // Messages
  saveMessage: (msg: { id: string; session_id: string; role: string; content: string; token_count?: number }): Promise<boolean> =>
    ipcRenderer.invoke(IPC.DB_SAVE_MESSAGE, msg),

  // Captures
  saveCapture: (capture: { id: string; session_id?: string; image_data?: string; extracted_text: string; window_title?: string }): Promise<boolean> =>
    ipcRenderer.invoke(IPC.DB_SAVE_CAPTURE, capture),

  getCaptures: (sessionId?: string): Promise<DBCapture[]> =>
    ipcRenderer.invoke(IPC.DB_GET_CAPTURES, sessionId),

  deleteAllData: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC.DB_DELETE_ALL),

  deleteCaptures: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC.DB_DELETE_CAPTURES),

  // Window
  toggleWindow: () => ipcRenderer.send(IPC.WINDOW_TOGGLE),
  minimizeWindow: () => ipcRenderer.send(IPC.WINDOW_MINIMIZE),
  resizeWindow: (height: number) => ipcRenderer.send(IPC.WINDOW_RESIZE, height),
};

export type ElectronAPI = typeof api;

contextBridge.exposeInMainWorld('electronAPI', api);
