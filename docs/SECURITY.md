# Security Considerations

## Architecture Security

### Electron Security Model
- **Context Isolation**: Enabled. The renderer process cannot access Node.js APIs directly.
- **Node Integration**: Disabled. All privileged operations go through the preload script's typed IPC bridge.
- **Preload Script**: Uses `contextBridge.exposeInMainWorld` to expose a minimal, typed API.
- **No Remote Content**: The app loads only local files (no remote URLs in the main window).

### Data at Rest
- **SQLite Database**: Stored in the OS user data directory (e.g., `~/.config/desktop-ai-copilot-app/` on Linux).
- **No encryption at rest** (v0.1): The database is a standard SQLite file. For sensitive environments, use OS-level disk encryption (FileVault, BitLocker, LUKS).
- **Screenshots**: Not stored by default. Only extracted text is persisted. Screenshot storage requires explicit opt-in.

### Data in Transit
- **OpenAI API**: Data sent over HTTPS to the configured API endpoint. Subject to the provider's security policies.
- **Ollama**: Data sent over HTTP to localhost. Does not leave the machine.
- **No telemetry**: The app does not send any data to the developers or third parties.

## API Key Management
- API keys are stored in the local SQLite database as part of the settings JSON.
- Keys are never logged, transmitted elsewhere, or exposed in the UI (password field).
- Future improvement: Use OS keychain (Keytar) for secure credential storage.

## Threat Model

### In Scope
- Protecting user data from unintended disclosure to AI providers
- Ensuring user consent before any data transmission
- Preventing renderer-to-main privilege escalation
- Protecting against common web vulnerabilities (XSS) via context isolation

### Out of Scope (v0.1)
- Protection against local malware with OS-level access
- Database encryption at rest (planned for v1.0)
- Protection against compromised AI provider endpoints
- Side-channel attacks on OCR processing

## Recommendations for Users
1. **Use disk encryption** — Enable FileVault (macOS), BitLocker (Windows), or LUKS (Linux)
2. **Use Ollama** for sensitive content — Keeps everything local
3. **Disable screenshot storage** unless needed — Reduces data at rest
4. **Review the Context Transparency Panel** before every AI request
5. **Delete sessions** when no longer needed
6. **Use a dedicated API key** with minimal permissions for cloud AI

## Reporting Security Issues
Please report security vulnerabilities responsibly by opening a GitHub issue or contacting the maintainers directly.
