import { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer, screen, session, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';
import { initDatabase, getDatabase } from './database';
import { handleAIChat } from './ai-provider';
import { transcribeChunk } from './transcribe';
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

// Overlay window geometry — a Cluely-style bar pinned to the top-center.
// The window collapses to just the bar and grows downward when a panel opens.
const WINDOW_WIDTH = 760;
const COLLAPSED_HEIGHT = 84;
const TOP_MARGIN = 28;

function createWindow() {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: COLLAPSED_HEIGHT,
    x: Math.round((screenWidth - WINDOW_WIDTH) / 2),
    y: TOP_MARGIN,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Float above full-screen apps and on every workspace, like Cluely.
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // Stealth: exclude the window from screen capture / screen sharing (macOS + Windows).
  mainWindow.setContentProtection(currentSettings.stealthMode);

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(DIST, '../dist/index.html'));
  }

  // Surface renderer failures in the main process log instead of failing silently
  // (a crashed renderer leaves the transparent window blank, i.e. invisible).
  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error('[did-fail-load]', code, desc);
  });
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.error('[render-process-gone]', details.reason);
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.webContents.on('console-message', (_e, _level, message) => {
      console.log('[renderer]', message);
    });
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
  tray.setToolTip('Cluely OS');
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
    mainWindow?.setContentProtection(settings.stealthMode);
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

  // Audio transcription (OpenAI Whisper) — one short chunk at a time
  ipcMain.handle(
    IPC.AUDIO_TRANSCRIBE,
    async (_event, { audio, mimeType }: { audio: Uint8Array; mimeType: string }) => {
      try {
        // Use the dedicated transcription key if set; otherwise fall back to the
        // chat provider's key when that provider is OpenAI — so a single OpenAI
        // key can power both chat and Whisper.
        const key =
          currentSettings.transcriptionApiKey ||
          (currentSettings.provider.type === 'openai' ? currentSettings.provider.apiKey ?? '' : '');
        const text = await transcribeChunk(audio, mimeType, key, currentSettings.transcriptionModel);
        return { success: true, text };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  // Window controls
  ipcMain.on(IPC.WINDOW_TOGGLE, () => toggleWindow());
  ipcMain.on(IPC.WINDOW_MINIMIZE, () => mainWindow?.minimize());
  ipcMain.on(IPC.WINDOW_RESIZE, (_event, height: number) => {
    if (!mainWindow) return;
    const target = Math.max(COLLAPSED_HEIGHT, Math.round(height));
    const [width] = mainWindow.getSize();
    // Anchor to the top edge so the bar stays put and the panel grows downward.
    mainWindow.setBounds({ height: target, width }, false);
  });
}

app.whenReady().then(() => {
  initDatabase();

  // Allow the renderer's getDisplayMedia() to capture the screen + system audio
  // (macOS uses ScreenCaptureKit loopback). Without a handler, getDisplayMedia rejects.
  session.defaultSession.setDisplayMediaRequestHandler(
    (_request, callback) => {
      desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
        callback(sources.length ? { video: sources[0], audio: 'loopback' } : {});
      });
    },
    { useSystemPicker: false }
  );

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
