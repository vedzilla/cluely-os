import { useAppStore } from '../stores/appStore';
import { Camera, Pause, Loader, Circle } from 'lucide-react';

const statusConfig = {
  idle: { icon: Circle, label: 'Ready', color: 'text-green-400', bg: 'bg-green-400' },
  capturing: { icon: Camera, label: 'Capturing...', color: 'text-yellow-400', bg: 'bg-yellow-400' },
  processing: { icon: Loader, label: 'Processing...', color: 'text-blue-400', bg: 'bg-blue-400' },
  paused: { icon: Pause, label: 'Paused', color: 'text-gray-400', bg: 'bg-gray-400' },
};

export default function StatusBar() {
  const { captureStatus, settings, captureScreen } = useAppStore();
  const config = statusConfig[captureStatus];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-surface-800/50 border-b border-surface-700/30 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.bg} ${captureStatus === 'capturing' ? 'animate-pulse' : ''}`} />
          <span className={config.color}>{config.label}</span>
        </span>
        <span className="text-surface-200/50">|</span>
        <span className="text-surface-200/70">
          {settings.provider.type === 'ollama' ? '🏠 Local' : '☁️ Cloud'} · {settings.provider.model}
        </span>
      </div>
      <button
        onClick={() => captureScreen()}
        disabled={captureStatus !== 'idle' && captureStatus !== 'paused'}
        className="flex items-center gap-1 px-2 py-1 rounded bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 transition-colors disabled:opacity-40"
      >
        <Camera size={12} />
        Capture
      </button>
    </div>
  );
}
