import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { Shield, Trash2, Pause, Play, Eye, HardDrive, Globe, AlertTriangle } from 'lucide-react';

export default function PrivacyPage() {
  const {
    settings,
    updateSettings,
    captureStatus,
    setCaptureStatus,
    sessions,
    loadSessions,
  } = useAppStore();

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

  const toggleCapture = () => {
    setCaptureStatus(captureStatus === 'paused' ? 'idle' : 'paused');
  };

  const toggleScreenshotStorage = async () => {
    await updateSettings({
      ...settings,
      captureStoreScreenshots: !settings.captureStoreScreenshots,
    });
  };

  const toggleLocalOnly = async () => {
    const newSettings = {
      ...settings,
      localOnlyMode: !settings.localOnlyMode,
    };
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
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Shield size={20} className="text-green-400" />
        Privacy Dashboard
      </div>

      <p className="text-xs text-surface-200/60">
        Full control over your data. Everything is stored locally on your machine. No data is sent without your explicit approval.
      </p>

      {/* Capture Control */}
      <div className="bg-surface-800/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            {captureStatus === 'paused' ? <Pause size={14} className="text-yellow-400" /> : <Play size={14} className="text-green-400" />}
            Screen Capture
          </div>
          <button
            onClick={toggleCapture}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              captureStatus === 'paused'
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
            }`}
          >
            {captureStatus === 'paused' ? 'Resume' : 'Pause All'}
          </button>
        </div>
        <p className="text-xs text-surface-200/50">
          {captureStatus === 'paused' ? 'Capture is paused. No screen data will be collected.' : 'Capture is active. Screenshots are taken only when you click Capture.'}
        </p>
      </div>

      {/* Screenshot Storage */}
      <div className="bg-surface-800/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Eye size={14} />
            Screenshot Storage
          </div>
          <button
            onClick={toggleScreenshotStorage}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              settings.captureStoreScreenshots
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-surface-700 text-surface-200 hover:bg-surface-700/80'
            }`}
          >
            {settings.captureStoreScreenshots ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <p className="text-xs text-surface-200/50">
          {settings.captureStoreScreenshots
            ? 'Screenshots are saved locally. Only text metadata is stored by default.'
            : 'Only extracted text is stored. Screenshot images are discarded after processing.'}
        </p>
      </div>

      {/* Local-Only Mode */}
      <div className="bg-surface-800/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            {settings.localOnlyMode ? <HardDrive size={14} className="text-green-400" /> : <Globe size={14} className="text-blue-400" />}
            Local-Only Mode
          </div>
          <button
            onClick={toggleLocalOnly}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              settings.localOnlyMode
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-surface-700 text-surface-200 hover:bg-surface-700/80'
            }`}
          >
            {settings.localOnlyMode ? 'On' : 'Off'}
          </button>
        </div>
        <p className="text-xs text-surface-200/50">
          {settings.localOnlyMode
            ? 'All AI processing is local via Ollama. No data leaves your machine.'
            : 'Cloud AI providers are available. Data is sent only after you approve in the Transparency Panel.'}
        </p>
      </div>

      {/* App Allowlist/Blocklist Placeholder */}
      <div className="bg-surface-800/50 rounded-lg p-3 space-y-2 opacity-60">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Shield size={14} />
          App Allowlist / Blocklist
          <span className="text-[10px] bg-surface-700 px-1.5 py-0.5 rounded">Coming Soon</span>
        </div>
        <p className="text-xs text-surface-200/50">
          Control which apps can be captured. Block sensitive apps like password managers.
        </p>
      </div>

      {/* Data Stats */}
      <div className="bg-surface-800/50 rounded-lg p-3 space-y-2">
        <div className="text-sm font-medium">Stored Data</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-surface-900/50 rounded p-2">
            <div className="text-surface-200/50">Sessions</div>
            <div className="text-white font-medium">{sessions.length}</div>
          </div>
          <div className="bg-surface-900/50 rounded p-2">
            <div className="text-surface-200/50">Screenshots Stored</div>
            <div className="text-white font-medium">{settings.captureStoreScreenshots ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* Delete Actions */}
      <div className="space-y-2">
        {confirmDelete === 'none' ? (
          <>
            <button
              onClick={() => setConfirmDelete('captures')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors text-sm"
            >
              <Trash2 size={14} />
              Delete All Captures
            </button>
            <button
              onClick={() => setConfirmDelete('all')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
            >
              <AlertTriangle size={14} />
              Delete All Data
            </button>
          </>
        ) : (
          <div className="bg-red-500/10 rounded-lg p-3 space-y-2">
            <p className="text-sm text-red-400 font-medium">
              {confirmDelete === 'all' ? 'Delete ALL data? This cannot be undone.' : 'Delete all captures? This cannot be undone.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete('none')}
                className="flex-1 px-3 py-1.5 rounded bg-surface-700 text-surface-200 text-sm hover:bg-surface-700/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete === 'all' ? handleDeleteAll : handleDeleteCaptures}
                className="flex-1 px-3 py-1.5 rounded bg-red-500 text-white text-sm hover:bg-red-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
