# Cluely OS — Privacy-First Desktop AI Copilot

An open-source, privacy-first desktop AI copilot that captures your screen with permission, extracts text/context, and provides helpful AI assistance in a floating overlay.

**This is NOT a cheating tool.** Cluely OS is transparent, user-controlled, and privacy-first. The user always knows when capture is active and has full control over what data is sent to AI.

## Features

- **Screen Capture with OCR** — Capture your screen on demand, extract visible text automatically
- **Context Transparency Panel** — See exactly what will be sent to AI before it goes. Inspect captured text, screenshot preview, model info, and token estimates
- **Floating Command Bar** — A glassy, always-on-top bar pinned to the top-center of the screen (Listen · Ask AI · Hide · tabs), with a panel that drops down on demand. Toggle from anywhere with a global hotkey (Ctrl/Cmd+Shift+Space) or ask instantly with ⌘↵
- **Multiple AI Providers** — Anthropic Claude, OpenAI-compatible APIs (GPT-4o, etc.), and Ollama for fully local inference
- **Hidden from Screen Sharing** — Stealth mode excludes the window from screen recordings and shared screens (Zoom, Meet, etc.) via OS-level content protection
- **Privacy Dashboard** — Pause capture, delete all data, disable screenshot storage, local-only mode, toggle stealth
- **Session Management** — Organize conversations, review history, delete individual sessions
- **Quick Actions** — Analyze, Summarize, Explain, or Draft Response based on screen content
- **Streaming Responses** — Real-time AI response streaming
- **Local Storage** — SQLite database, everything stays on your machine

## Tech Stack

- **Electron** + **React** + **TypeScript**
- **Tailwind CSS** for styling
- **Vite** for fast development
- **SQLite** (better-sqlite3) for local storage
- **Tesseract.js** for OCR
- **Zustand** for state management

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repo
git clone https://github.com/vedzilla/cluely-os.git
cd cluely-os

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Build for production

```bash
npm run build
```

This creates distributable packages in `apps/desktop/release/`.

### Configuration

1. Open the app
2. Go to **Settings** tab
3. Choose your AI provider:
   - **Claude (Anthropic)**: Paste your API key (`sk-ant-...` from console.anthropic.com) and pick a model (defaults to `claude-opus-4-8`)
   - **OpenAI**: Enter your API key and select a model
   - **Ollama**: Make sure Ollama is running locally (`ollama serve`)
4. Save settings

## Usage

1. **Launch the app** — A floating command bar appears at the top-center of your screen
2. **Capture your screen** — Click the "Capture" button or use the quick action buttons
3. **Review the context** — The Transparency Panel shows exactly what will be sent to AI
4. **Choose an action**: Analyze, Summarize, Explain, or Draft Response
5. **Approve sending** — Click "Send to AI" only after reviewing the context
6. **Chat freely** — Ask follow-up questions in the chat
7. **Manage data** — Use the Privacy Dashboard to delete history, pause capture, etc.

## Global Hotkey

Default: `Ctrl+Shift+Space` (configurable in Settings)

## Project Structure

```
/
├── apps/desktop/            # Electron app
│   └── src/
│       ├── main/            # Electron main process
│       │   ├── index.ts     # Window management, IPC, tray
│       │   ├── database.ts  # SQLite setup and schema
│       │   ├── ai-provider.ts  # Anthropic + OpenAI + Ollama streaming
│       │   └── ocr.ts       # Tesseract.js wrapper
│       ├── renderer/        # React frontend
│       │   ├── components/  # Reusable UI components
│       │   ├── pages/       # Page-level components
│       │   ├── stores/      # Zustand state management
│       │   └── styles/      # Tailwind CSS
│       └── preload/         # Electron preload (IPC bridge)
├── packages/shared/         # Shared types, constants, IPC channels
├── docs/                    # Documentation
└── .env.example             # Environment template
```

## Privacy & Security

- **No data is sent without explicit user approval** — The Context Transparency Panel shows everything before it's sent
- **Local-first storage** — All data is stored in a local SQLite database
- **Screenshot storage is OFF by default** — Only extracted text metadata is stored
- **Local-only mode** — Use Ollama for fully offline AI processing
- **Visible status indicator** — Always shows whether capture is active, paused, or processing
- **Full data control** — Delete individual sessions or all data at any time

## License

MIT
