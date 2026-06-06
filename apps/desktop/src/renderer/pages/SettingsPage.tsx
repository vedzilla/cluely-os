import { useState, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import PanelHeader from '../components/PanelHeader';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import { DEFAULT_SETTINGS, SUPPORTED_MODELS } from '@copilot/shared';
import type { AIProviderType } from '@copilot/shared';

const inputCls =
  'mt-1 w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[13px] text-white/90 placeholder-white/30 focus:border-white/25 focus:outline-none';
const labelCls = 'text-[11px] font-medium text-white/50';
const sectionCls = 'text-[11px] font-semibold uppercase tracking-wide text-white/40';

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

  const setProvider = (type: AIProviderType) => {
    const defaults: Record<AIProviderType, { baseUrl: string; model: string }> = {
      openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
      anthropic: { baseUrl: 'https://api.anthropic.com', model: 'claude-opus-4-8' },
      ollama: { baseUrl: 'http://localhost:11434', model: 'llama3' },
    };
    setDraft({
      ...draft,
      provider: {
        ...draft.provider,
        type,
        baseUrl: defaults[type].baseUrl,
        model: defaults[type].model,
        apiKey: type === 'ollama' ? '' : draft.provider.apiKey,
      },
    });
  };

  const PROVIDERS: { type: AIProviderType; label: string }[] = [
    { type: 'openai', label: 'OpenAI' },
    { type: 'anthropic', label: 'Claude' },
    { type: 'ollama', label: 'Ollama' },
  ];

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        icon={SettingsIcon}
        title="Settings"
        right={
          <>
            <button
              onClick={() => setDraft({ ...DEFAULT_SETTINGS })}
              className="flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/10"
            >
              <RotateCcw size={12} /> Reset
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                saved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/90 text-black hover:bg-white'
              }`}
            >
              <Save size={12} /> {saved ? 'Saved' : 'Save'}
            </button>
          </>
        }
      />

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {/* AI Provider */}
        <section className="space-y-2.5">
          <h3 className={sectionCls}>AI Provider</h3>
          <div className="flex gap-2">
            {PROVIDERS.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setProvider(type)}
                className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                  draft.provider.type === type
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {draft.provider.type === 'openai' && (
            <div className="space-y-2.5">
              <label className="block">
                <span className={labelCls}>API Key</span>
                <input
                  type="password"
                  value={draft.provider.apiKey || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, provider: { ...draft.provider, apiKey: e.target.value } })
                  }
                  placeholder="sk-..."
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className={labelCls}>Base URL</span>
                <input
                  type="text"
                  value={draft.provider.baseUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, provider: { ...draft.provider, baseUrl: e.target.value } })
                  }
                  className={inputCls}
                />
              </label>
            </div>
          )}

          {draft.provider.type === 'anthropic' && (
            <label className="block">
              <span className={labelCls}>Anthropic API Key</span>
              <input
                type="password"
                value={draft.provider.apiKey || ''}
                onChange={(e) =>
                  setDraft({ ...draft, provider: { ...draft.provider, apiKey: e.target.value } })
                }
                placeholder="sk-ant-..."
                className={inputCls}
              />
              <span className="mt-1 block text-[10px] text-white/35">
                Get one at console.anthropic.com → API Keys
              </span>
            </label>
          )}

          {draft.provider.type === 'ollama' && (
            <label className="block">
              <span className={labelCls}>Ollama URL</span>
              <input
                type="text"
                value={draft.provider.baseUrl}
                onChange={(e) =>
                  setDraft({ ...draft, provider: { ...draft.provider, baseUrl: e.target.value } })
                }
                className={inputCls}
              />
            </label>
          )}

          <label className="block">
            <span className={labelCls}>Model</span>
            <select
              value={draft.provider.model}
              onChange={(e) =>
                setDraft({ ...draft, provider: { ...draft.provider, model: e.target.value } })
              }
              className={inputCls}
            >
              {SUPPORTED_MODELS[draft.provider.type].map((model) => (
                <option key={model} value={model} className="bg-neutral-900">
                  {model}
                </option>
              ))}
            </select>
          </label>
        </section>

        {/* Audio / Transcription */}
        <section className="space-y-2.5">
          <h3 className={sectionCls}>Audio (Transcription)</h3>
          <p className="text-[11px] leading-relaxed text-white/45">
            "Listen" transcribes your mic + system audio with OpenAI Whisper (OpenAI-only — Claude
            can't transcribe audio).{' '}
            {draft.provider.type === 'openai'
              ? 'Leave this blank to reuse your OpenAI chat key above — one key covers everything.'
              : 'Add an OpenAI key here, or switch your chat provider to OpenAI to use a single key for both.'}
          </p>
          <label className="block">
            <span className={labelCls}>OpenAI API Key {draft.provider.type === 'openai' ? '(optional)' : ''}</span>
            <input
              type="password"
              value={draft.transcriptionApiKey}
              onChange={(e) => setDraft({ ...draft, transcriptionApiKey: e.target.value })}
              placeholder={draft.provider.type === 'openai' ? 'Reusing your OpenAI chat key' : 'sk-...'}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Transcription Model</span>
            <select
              value={draft.transcriptionModel}
              onChange={(e) => setDraft({ ...draft, transcriptionModel: e.target.value })}
              className={inputCls}
            >
              {['whisper-1', 'gpt-4o-mini-transcribe', 'gpt-4o-transcribe'].map((m) => (
                <option key={m} value={m} className="bg-neutral-900">
                  {m}
                </option>
              ))}
            </select>
          </label>
        </section>

        {/* Capture */}
        <section className="space-y-2.5">
          <h3 className={sectionCls}>Capture</h3>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div>
              <div className="text-[13px] text-white/90">Interval Capture</div>
              <div className="text-[11px] text-white/45">Auto-capture every N seconds (default off)</div>
            </div>
            <button
              onClick={() => setDraft({ ...draft, intervalCaptureEnabled: !draft.intervalCaptureEnabled })}
              className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                draft.intervalCaptureEnabled ? 'bg-white/15 text-white' : 'bg-white/[0.06] text-white/55'
              }`}
            >
              {draft.intervalCaptureEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {draft.intervalCaptureEnabled && (
            <label className="block">
              <span className={labelCls}>Interval (seconds)</span>
              <input
                type="number"
                min={5}
                max={300}
                value={draft.intervalCaptureSeconds}
                onChange={(e) =>
                  setDraft({ ...draft, intervalCaptureSeconds: parseInt(e.target.value) || 30 })
                }
                className={inputCls}
              />
            </label>
          )}
        </section>

        {/* Application */}
        <section className="space-y-2.5">
          <h3 className={sectionCls}>Application</h3>
          <label className="block">
            <span className={labelCls}>Global Hotkey</span>
            <input
              type="text"
              value={draft.globalHotkey}
              onChange={(e) => setDraft({ ...draft, globalHotkey: e.target.value })}
              className={inputCls}
            />
            <span className="mt-1 block text-[10px] text-white/35">e.g. CommandOrControl+Shift+Space</span>
          </label>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div>
              <div className="text-[13px] text-white/90">Theme</div>
              <div className="text-[11px] text-white/45">Visual appearance</div>
            </div>
            <button
              onClick={() => setDraft({ ...draft, theme: draft.theme === 'dark' ? 'light' : 'dark' })}
              className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white/70"
            >
              {draft.theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
