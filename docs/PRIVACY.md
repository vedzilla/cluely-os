# Privacy Policy

**Last updated:** 2025

## Overview

Cluely OS is designed with privacy as a core principle. This document describes what data is collected, how it's used, and what controls you have.

## Data Collection

### What We Collect
- **Nothing.** Cluely OS does not phone home, does not collect telemetry, and does not send any data to us.

### What the App Stores Locally
- **Session data**: Chat history (your messages and AI responses)
- **Capture metadata**: Extracted text from screen captures, timestamps, window titles
- **Screenshots**: Only if you explicitly enable screenshot storage in Settings (OFF by default)
- **Settings**: Your preferences (AI provider, hotkey, theme, etc.)

All data is stored in a local SQLite database on your machine at your OS user data directory.

## Data Destinations

### Cloud AI (OpenAI-compatible)
When you use a cloud AI provider:
- Only the text you approve in the Context Transparency Panel is sent
- Data is sent directly to the AI provider's API using your API key
- We do not proxy, log, or intercept this data
- Subject to the AI provider's own privacy policy

### Local AI (Ollama)
When you use Ollama:
- All processing happens on your machine
- No data leaves your device
- No internet connection required

## User Controls

You have full control over your data:
- **Pause capture** — Stop all screen capture
- **Delete sessions** — Remove individual chat sessions
- **Delete all data** — Wipe the entire database
- **Delete captures** — Remove all stored captures
- **Disable screenshot storage** — Only store extracted text, discard images
- **Local-only mode** — Force all AI to use Ollama (no cloud)
- **Context Transparency Panel** — Review every piece of data before it's sent to AI

## Third-Party Services

Cluely OS connects to third-party services only when you configure them:
- **OpenAI API** (or compatible) — for cloud AI inference
- **Ollama** — for local AI inference (runs on your machine)

No other third-party services are used.

## Open Source

Cluely OS is fully open source. You can audit every line of code at:
https://github.com/vedzilla/cluely-os
