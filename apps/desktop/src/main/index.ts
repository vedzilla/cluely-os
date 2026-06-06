import { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer, screen, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';
import { initDatabase, getDatabase } from './database';
import { handleAIChat } from './ai-provider';
import { performOCR } from './ocr';
import { IPC } from '@copilot/shared';
import type { AppSettings, CaptureResult } from '@copilot/shared';
import { DEFAULT_SETTINGS } from '@copilot/shared';
import { v4 as uuid } from 'uuid';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let currentSettings: AppSettings = { ...DEFAULT_SETTINGS };

const DIST = path.join(__dirname, '..');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 420,
    height: 700,
    x: screenWidth - 440,
    y: 60,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(DIST, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABhSURBVFhH7c0xAQAgDACxs/kXoGNhICkI6O5Z83t+B0ABUAAUAAVAAVAAFAAFQAFQABQABUABUAAUAAVAAVAAFAAFQAFQABQABUABUAAUAAVAAVAAFAAFQAFQABQArZk9OQEE5XYxHgAAAABJRU5ErkJggg=='
  );
  tray = new Tray(icon);
  tray.setToolTip('AI Copilot');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show/Hide', click: () => toggleWindow() },
      { label: 'Capture Screen', click: () => captureScreen() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ])
  );
  tray.on('click', () => toggleWindow());
}

function toggleWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function registerGlobalHotkey() {
  globalShortcut.unregisterAll();
  const hotkey = currentSettings.globalHotkey || 'CommandOrControl+Shift+Space';
  globalShortcut.register(hotkey, () => toggleWindow());
}

async function captureScreen(): Promise<CaptureResult | null> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    if (sources.length === 0) return null;

    const source = sources[0];
    const imageDataUrl = source.thumbnail.toDataURL();
    const extractedText = await performOCR(source.thumbnail.toPNG());

    const result: CaptureResult = {
      id: uuid(),
      timestamp: Date.now(),
      imageDataUrl,
      extractedText,
      windowTitle: source.name,
    };

    return result;
  } catch (err) {
    console.error('Screen capture failed:', err);
    return null;
  }
}

function setupIPC() {
  const db = getDatabase();

  // Screen capture
  ipcMain.handle(IPC.CAPTURE_SCREEN, async () => {
    const result = await captureScreen();
    return result;
  });

  // AI chat
  ipcMain.handle(IPC.AI_CHAT, async (event, { messages, settings }: { messages: Array<{ role: string; content: string }>; settings: AppSettings }) => {
    try {
      const stream = handleAIChat(messages, settings.provider);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        event.sender.send(IPC.AI_STREAM, chunk);
      }

      event.sender.send(IPC.AI_STREAM_END);
      return { success: true, content: fullResponse };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      event.sender.send(IPC.AI_STREAM_ERROR, message);
      return { success: false, error: message };
    }
  });

  // Settings
  ipcMain.handle(IPC.SETTINGS_GET, () => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('app_settings') as { value: string } | undefined;
    if (row) {
      currentSettings = JSON.parse(row.value);
      return currentSettings;
    }
    return currentSettings;
  });

  ipcMain.handle(IPC.SETTINGS_SET, (_event, settings: AppSettings) => {
    currentSettings = settings;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('app_settings', JSON.stringify(settings));
    registerGlobalHotkey();
    return true;
  });

  // Database - Sessions
  ipcMain.handle(IPC.DB_GET_SESSIONS, () => {
    return db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all();
  });

  ipcMain.handle(IPC.DB_GET_SESSION, (_event, id: string) => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
    const messages = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC').all(id);
    const captures = db.prepare('SELECT id, session_id, extracted_text, window_title, created_at FROM captures WHERE session_id = ?').all(id);
    return { session, messages, captures };
  });

  ipcMain.handle(IPC.DB_CREATE_SESSION, (_event, session: { id: string; title: string }) => {
    const now = Date.now();
    db.prepare('INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)').run(session.id, session.title, now, now);
    return { id: session.id, title: session.title, created_at: now, updated_at: now };
  });

  ipcMain.handle(IPC.DB_DELETE_SESSION, (_event, id: string) => {
    db.prepare('DELETE FROM messages WHERE session_id = ?').run(id);
    db.prepare('DELETE FROM captures WHERE session_id = ?').run(id);
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    return true;
  });

  // Database - Messages
  ipcMain.handle(IPC.DB_SAVE_MESSAGE, (_event, msg: { id: string; session_id: string; role: string; content: string; token_count?: number }) => {
    const now = Date.now();
    db.prepare('INSERT INTO messages (id, session_id, role, content, token_count, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      msg.id, msg.session_id, msg.role, msg.content, msg.token_count ?? null, now
    );
    db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(now, msg.session_id);
    return true;
  });

  // Database - Captures
  ipcMain.handle(IPC.DB_SAVE_CAPTURE, (_event, capture: { id: string; session_id?: string; image_data?: string; extracted_text: string; window_title?: string }) => {
    const now = Date.now();
    const imageData = currentSettings.captureStoreScreenshots ? (capture.image_data ?? null) : null;
    db.prepare('INSERT INTO captures (id, session_id, image_data, extracted_text, window_title, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      capture.id, capture.session_id ?? null, imageData, capture.extracted_text, capture.window_title ?? null, now
    );
    return true;
  });

  ipcMain.handle(IPC.DB_GET_CAPTURES, (_event, sessionId?: string) => {
    if (sessionId) {
      return db.prepare('SELECT id, session_id, extracted_text, window_title, created_at FROM captures WHERE session_id = ? ORDER BY created_at DESC').all(sessionId);
    }
    return db.prepare('SELECT id, session_id, extracted_text, window_title, created_at FROM captures ORDER BY created_at DESC').all();
  });

  ipcMain.handle(IPC.DB_DELETE_ALL, () => {
    db.prepare('DELETE FROM messages').run();
    db.prepare('DELETE FROM captures').run();
    db.prepare('DELETE FROM sessions').run();
    return true;
  });

  ipcMain.handle(IPC.DB_DELETE_CAPTURES, () => {
    db.prepare('DELETE FROM captures').run();
    return true;
  });

  // Window controls
  ipcMain.on(IPC.WINDOW_TOGGLE, () => toggleWindow());
  ipcMain.on(IPC.WINDOW_MINIMIZE, () => mainWindow?.minimize());
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
  createTray();
  registerGlobalHotkey();
  setupIPC();
});

app.on('window-all-closed', () => {
  // Keep running in tray
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
