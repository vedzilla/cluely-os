import { useState, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { DEFAULT_SETTINGS, SUPPORTED_MODELS } from '@copilot/shared';
import type { AIProviderType } from '@copilot/shared';

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_SETTINGS });
  };

  const setProvider = (type: AIProviderType) => {
    setDraft({
      ...draft,
      provider: {
        ...draft.provider,
        type,
        baseUrl: type === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1',
        model: type === 'ollama' ? 'llama3' : 'gpt-4o-mini',
        apiKey: type === 'ollama' ? '' : draft.provider.apiKey,
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Settings size={20} className="text-accent-400" />
          Settings
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-surface-700/50 text-surface-200 hover:bg-surface-700"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              saved ? 'bg-green-500/20 text-green-400' : 'bg-accent-500 text-white hover:bg-accent-600'
            }`}
          >
            <Save size={12} />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* AI Provider */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-surface-200/80">AI Provider</h3>

        <div className="flex gap-2">
          {(['openai', 'ollama'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setProvider(type)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                draft.provider.type === type
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                  : 'bg-surface-800/50 text-surface-200 border border-surface-700/30 hover:bg-surface-700/50'
              }`}
            >
              {type === 'openai' ? 'OpenAI (Cloud)' : 'Ollama (Local)'}
            </button>
          ))}
        </div>

        {draft.provider.type === 'openai' && (
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-surface-200/60">API Key</span>
              <input
                type="password"
                value={draft.provider.apiKey || ''}
                onChange={(e) => setDraft({ ...draft, provider: { ...draft.provider, apiKey: e.target.value } })}
                placeholder="sk-..."
                className="w-full mt-1 bg-surface-800/50 border border-surface-700/30 rounded-md px-3 py-2 text-sm text-white placeholder-surface-200/30 focus:outline-none focus:border-accent-500/50"
              />
            </label>
            <label className="block">
              <span className="text-xs text-surface-200/60">Base URL</span>
              <input
                type="text"
                value={draft.provider.baseUrl}
                onChange={(e) => setDraft({ ...draft, provider: { ...draft.provider, baseUrl: e.target.value } })}
                className="w-full mt-1 bg-surface-800/50 border border-surface-700/30 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500/50"
              />
            </label>
          </div>
        )}

        {draft.provider.type === 'ollama' && (
          <label className="block">
            <span className="text-xs text-surface-200/60">Ollama URL</span>
            <input
              type="text"
              value={draft.provider.baseUrl}
              onChange={(e) => setDraft({ ...draft, provider: { ...draft.provider, baseUrl: e.target.value } })}
              className="w-full mt-1 bg-surface-800/50 border border-surface-700/30 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500/50"
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs text-surface-200/60">Model</span>
          <select
            value={draft.provider.model}
            onChange={(e) => setDraft({ ...draft, provider: { ...draft.provider, model: e.target.value } })}
            className="w-full mt-1 bg-surface-800/50 border border-surface-700/30 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500/50"
          >
            {SUPPORTED_MODELS[draft.provider.type].map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </label>
      </section>

      {/* Capture Settings */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-surface-200/80">Capture</h3>

        <div className="flex items-center justify-between bg-surface-800/50 rounded-lg p-3">
          <div>
            <div className="text-sm">Interval Capture</div>
            <div className="text-xs text-surface-200/50">Auto-capture every N seconds (default OFF)</div>
          </div>
          <button
            onClick={() => setDraft({ ...draft, intervalCaptureEnabled: !draft.intervalCaptureEnabled })}
            className={`px-3 py-1 rounded-md text-xs font-medium ${
              draft.intervalCaptureEnabled
                ? 'bg-accent-500/20 text-accent-400'
                : 'bg-surface-700 text-surface-200'
            }`}
          >
            {draft.intervalCaptureEnabled ? 'On' : 'Off'}
          </button>
        </div>

        {draft.intervalCaptureEnabled && (
          <label className="block">
            <span className="text-xs text-surface-200/60">Interval (seconds)</span>
            <input
              type="number"
              min={5}
              max={300}
              value={draft.intervalCaptureSeconds}
              onChange={(e) => setDraft({ ...draft, intervalCaptureSeconds: parseInt(e.target.value) || 30 })}
              className="w-full mt-1 bg-surface-800/50 border border-surface-700/30 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500/50"
            />
          </label>
        )}
      </section>

      {/* App Settings */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-surface-200/80">Application</h3>

        <label className="block">
          <span className="text-xs text-surface-200/60">Global Hotkey</span>
          <input
            type="text"
            value={draft.globalHotkey}
            onChange={(e) => setDraft({ ...draft, globalHotkey: e.target.value })}
            className="w-full mt-1 bg-surface-800/50 border border-surface-700/30 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500/50"
          />
          <span className="text-[10px] text-surface-200/40 mt-1 block">e.g., CommandOrControl+Shift+Space</span>
        </label>

        <div className="flex items-center justify-between bg-surface-800/50 rounded-lg p-3">
          <div>
            <div className="text-sm">Theme</div>
            <div className="text-xs text-surface-200/50">Visual appearance</div>
          </div>
          <button
            onClick={() => setDraft({ ...draft, theme: draft.theme === 'dark' ? 'light' : 'dark' })}
            className="px-3 py-1 rounded-md text-xs font-medium bg-surface-700 text-surface-200"
          >
            {draft.theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>
      </section>
    </div>
  );
}
