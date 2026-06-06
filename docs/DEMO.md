# Hackathon Demo Script

## Setup (before demo)
1. Have the app running (`npm run dev`)
2. Have an OpenAI API key configured, or Ollama running locally
3. Open a webpage or document to use as capture target

## Demo Flow (5 minutes)

### 1. Introduction (30s)
> "Cluely OS is an open-source, privacy-first AI copilot. Unlike closed-source tools, everything runs locally and you control exactly what data leaves your machine."

### 2. App Overview (30s)
- Show the floating overlay
- Point out the status indicator (Ready / Paused / Capturing)
- Show the tabs: Chat, Sessions, Privacy, Settings
- Toggle with global hotkey (Ctrl+Shift+Space)

### 3. Screen Capture + Context Transparency (90s)
- Open a webpage with some content
- Click "Capture Screen"
- **Key moment**: Show the Context Transparency Panel
  - "Here you can see exactly what text was extracted"
  - "You can see the screenshot preview"
  - "It shows the model, estimated token count, and whether data goes to cloud or stays local"
  - "Nothing is sent until I click 'Send to AI'"
- Click "Discard" to show you can reject

### 4. AI Analysis (60s)
- Capture the screen again
- This time, click "Analyze" from the quick actions
- Show the Transparency Panel again
- Click "Send to AI"
- Watch streaming response
- Ask a follow-up question

### 5. Privacy Dashboard (45s)
- Switch to Privacy tab
- Show pause controls
- Show screenshot storage toggle (OFF by default)
- Show local-only mode toggle
- Show data deletion options
- "You can delete everything with one click"

### 6. Settings (30s)
- Show provider switching (OpenAI ↔ Ollama)
- Show model selection
- Show hotkey configuration

### 7. Closing (15s)
> "Cluely OS gives you AI-powered screen analysis with full transparency and privacy. It's open source — contribute at github.com/vedzilla/cluely-os"

## Key Talking Points
- Privacy-first: Context Transparency Panel, local-only mode, no telemetry
- Open source: Fully auditable
- Provider-agnostic: Works with OpenAI, any OpenAI-compatible API, or local Ollama
- User-controlled: Visible status, explicit approval for every AI request
