import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import PanelHeader from '../components/PanelHeader';
import { Shield, Trash2, Pause, Play, Eye, EyeOff, HardDrive, Globe, AlertTriangle } from 'lucide-react';

const cardCls = 'space-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-3';

export default function PrivacyPage() {
  const { settings, updateSettings, captureStatus, setCaptureStatus, sessions, loadSessions } =
    useAppStore();

  const [confirmDelete, setConfirmDelete] = useState<'none' | 'all' | 'captures'>('none');

  const handleDeleteAll = async () => {
    await window.electronAPI.deleteAllData();
    await loadSessions();
    setConfirmDelete('none');
  };

  const handleDeleteCaptures = async () => {
    await window.electronAPI.deleteCaptures();
    setConfirmDelete('none');
  };

  const toggleCapture = () => setCaptureStatus(captureStatus === 'paused' ? 'idle' : 'paused');

  const toggleScreenshotStorage = async () => {
    await updateSettings({ ...settings, captureStoreScreenshots: !settings.captureStoreScreenshots });
  };

  const toggleStealth = async () => {
    await updateSettings({ ...settings, stealthMode: !settings.stealthMode });
  };

  const toggleLocalOnly = async () => {
    const newSettings = { ...settings, localOnlyMode: !settings.localOnlyMode };
    if (!settings.localOnlyMode) {
      newSettings.provider = {
        ...settings.provider,
        type: 'ollama' as const,
        baseUrl: 'http://localhost:11434',
        model: 'llama3',
      };
    }
    await updateSettings(newSettings);
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader icon={Shield} title="Privacy" subtitle="Everything stays on your machine" />

      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {/* Capture Control */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-medium text-white/90">
              {captureStatus === 'paused' ? (
                <Pause size={14} className="text-amber-400" />
              ) : (
                <Play size={14} className="text-emerald-400" />
              )}
              Screen Capture
            </div>
            <button
              onClick={toggleCapture}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                captureStatus === 'paused'
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              {captureStatus === 'paused' ? 'Resume' : 'Pause All'}
            </button>
          </div>
          <p className="text-[11px] text-white/45">
            {captureStatus === 'paused'
              ? 'Capture is paused. No screen data will be collected.'
              : 'Screenshots are taken only when you click Capture.'}
          </p>
        </div>

        {/* Screenshot Storage */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-medium text-white/90">
              <Eye size={14} className="text-white/60" />
              Screenshot Storage
            </div>
            <button
              onClick={toggleScreenshotStorage}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                settings.captureStoreScreenshots
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  : 'bg-white/[0.06] text-white/55 hover:bg-white/10'
              }`}
            >
              {settings.captureStoreScreenshots ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <p className="text-[11px] text-white/45">
            {settings.captureStoreScreenshots
              ? 'Screenshots are saved locally on disk.'
              : 'Only extracted text is stored; screenshot images are discarded after processing.'}
          </p>
        </div>

        {/* Local-Only Mode */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-medium text-white/90">
              {settings.localOnlyMode ? (
                <HardDrive size={14} className="text-emerald-400" />
              ) : (
                <Globe size={14} className="text-sky-400" />
              )}
              Local-Only Mode
            </div>
            <button
              onClick={toggleLocalOnly}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                settings.localOnlyMode
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-white/[0.06] text-white/55 hover:bg-white/10'
              }`}
            >
              {settings.localOnlyMode ? 'On' : 'Off'}
            </button>
          </div>
          <p className="text-[11px] text-white/45">
            {settings.localOnlyMode
              ? 'All AI processing is local via Ollama. No data leaves your machine.'
              : 'Cloud providers available — data is sent only after you approve it.'}
          </p>
        </div>

        {/* Stealth / screen-share invisibility */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-medium text-white/90">
              {settings.stealthMode ? (
                <EyeOff size={14} className="text-emerald-400" />
              ) : (
                <Eye size={14} className="text-white/60" />
              )}
              Hidden from Screen Sharing
            </div>
            <button
              onClick={toggleStealth}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                settings.stealthMode
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-white/[0.06] text-white/55 hover:bg-white/10'
              }`}
            >
              {settings.stealthMode ? 'On' : 'Off'}
            </button>
          </div>
          <p className="text-[11px] text-white/45">
            {settings.stealthMode
              ? 'The window is excluded from screen recordings and shared screens (Zoom, Meet, etc.).'
              : 'The window appears normally in screen recordings and shared screens.'}
          </p>
        </div>

        {/* Allowlist placeholder */}
        <div className={`${cardCls} opacity-60`}>
          <div className="flex items-center gap-2 text-[13px] font-medium text-white/90">
            <Shield size={14} className="text-white/60" />
            App Allowlist / Blocklist
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">Coming soon</span>
          </div>
          <p className="text-[11px] text-white/45">
            Control which apps can be captured. Block sensitive apps like password managers.
          </p>
        </div>

        {/* Data Stats */}
        <div className={cardCls}>
          <div className="text-[13px] font-medium text-white/90">Stored Data</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-black/30 p-2">
              <div className="text-[10px] text-white/40">Sessions</div>
              <div className="text-[13px] font-medium text-white/90">{sessions.length}</div>
            </div>
            <div className="rounded-lg bg-black/30 p-2">
              <div className="text-[10px] text-white/40">Screenshots Stored</div>
              <div className="text-[13px] font-medium text-white/90">
                {settings.captureStoreScreenshots ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Actions */}
        <div className="space-y-2 pt-1">
          {confirmDelete === 'none' ? (
            <>
              <button
                onClick={() => setConfirmDelete('captures')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[13px] text-amber-300 transition-colors hover:bg-amber-500/20"
              >
                <Trash2 size={14} /> Delete All Captures
              </button>
              <button
                onClick={() => setConfirmDelete('all')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-[13px] text-red-300 transition-colors hover:bg-red-500/20"
              >
                <AlertTriangle size={14} /> Delete All Data
              </button>
            </>
          ) : (
            <div className="space-y-2 rounded-xl bg-red-500/10 p-3">
              <p className="text-[13px] font-medium text-red-300">
                {confirmDelete === 'all'
                  ? 'Delete ALL data? This cannot be undone.'
                  : 'Delete all captures? This cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete('none')}
                  className="flex-1 rounded-lg bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/70 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete === 'all' ? handleDeleteAll : handleDeleteCaptures}
                  className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-[13px] text-white hover:bg-red-600"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
