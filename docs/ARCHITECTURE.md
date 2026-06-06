# Architecture Overview

## High-Level Design

Cluely OS is a desktop application built with Electron that runs entirely on the user's machine. It follows a strict separation between the main process (Node.js/Electron) and renderer process (React UI), communicating via typed IPC channels.

```
┌─────────────────────────────────────────────────┐
│                 Electron Shell                   │
│                                                  │
│  ┌────────────┐   IPC   ┌─────────────────────┐ │
│  │ Main Process│◄──────►│ Renderer (React UI)  │ │
│  │             │        │                      │ │
│  │ • Database  │        │ • Chat Page          │ │
│  │ • AI Provider│       │ • Privacy Dashboard  │ │
│  │ • OCR       │        │ • Settings Page      │ │
│  │ • Screen Cap│        │ • Sessions Page      │ │
│  │ • Tray/Hotkey│       │ • Transparency Panel │ │
│  └──────┬──────┘        └──────────────────────┘ │
│         │                                        │
│  ┌──────▼──────┐                                 │
│  │   SQLite    │  Local-only storage             │
│  └─────────────┘                                 │
└─────────────────────────────────────────────────┘
          │
          ▼ (only when user approves)
   ┌──────────────┐     ┌──────────────┐
   │ OpenAI API   │ OR  │ Ollama (local)│
   └──────────────┘     └──────────────┘
```

## Process Architecture

### Main Process (`src/main/`)

Runs in Node.js with full system access:

- **index.ts** — App lifecycle, window creation, tray, global hotkey registration, IPC handler setup
- **database.ts** — SQLite initialization with WAL mode, schema creation (sessions, messages, captures, settings)
- **ai-provider.ts** — Unified streaming interface for OpenAI-compatible and Ollama endpoints
- **ocr.ts** — Tesseract.js worker management for text extraction from screenshots

### Preload Script (`src/preload/`)

Bridges main and renderer with `contextBridge.exposeInMainWorld`:
- Exposes typed API (`window.electronAPI`) for all IPC operations
- Handles stream event listeners (AI response chunks)
- No direct Node.js access in renderer

### Renderer Process (`src/renderer/`)

React SPA with Zustand state management:
- **stores/appStore.ts** — Central state: settings, capture, chat, sessions, context transparency
- **components/** — Reusable UI: TitleBar, StatusBar, ChatBubble, ChatInput, ContextTransparencyPanel
- **pages/** — Full-page views: Chat, Privacy, Settings, Sessions

## Data Flow

### Screen Capture Flow
1. User clicks "Capture" → renderer calls `electronAPI.captureScreen()`
2. Main process uses `desktopCapturer` to grab screen thumbnail
3. Screenshot is passed through Tesseract.js for OCR
4. Result (image + text) returned to renderer
5. Only text metadata stored in SQLite (unless screenshot storage enabled)

### AI Chat Flow
1. User types message or clicks action button (Analyze/Summarize/Explain/Draft)
2. Context Transparency Panel shows: captured text, preview, model, tokens, local vs cloud
3. User clicks "Send to AI" to approve
4. Main process streams response from OpenAI or Ollama
5. Chunks sent via IPC events, rendered in real-time
6. Completed message saved to SQLite

## Database Schema

```sql
sessions   (id, title, created_at, updated_at)
messages   (id, session_id, role, content, token_count, created_at)
captures   (id, session_id, image_data, extracted_text, window_title, created_at)
settings   (key, value)  -- JSON-serialized app settings
```

## Security Model

- Context isolation enabled, nodeIntegration disabled
- All main↔renderer communication through typed IPC channels
- No secrets stored in code — user provides API keys at runtime
- Screenshot data deleted by default after OCR processing
- Local-only mode routes all AI through Ollama (no network)
