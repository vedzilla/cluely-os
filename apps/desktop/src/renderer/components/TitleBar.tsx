import { useAppStore } from '../stores/appStore';
import { MessageSquare, Shield, Settings, List, Minus, X } from 'lucide-react';

export default function TitleBar() {
  const { page, setPage } = useAppStore();

  const tabs = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
    { id: 'sessions' as const, icon: List, label: 'Sessions' },
    { id: 'privacy' as const, icon: Shield, label: 'Privacy' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="titlebar-drag flex items-center justify-between px-3 py-2 bg-surface-950/80 border-b border-surface-700/50">
      <div className="flex items-center gap-1 titlebar-no-drag">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              page === tab.id
                ? 'bg-accent-500/20 text-accent-400'
                : 'text-surface-200 hover:text-white hover:bg-surface-700/50'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 titlebar-no-drag">
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          className="p-1.5 rounded hover:bg-surface-700/50 text-surface-200"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={() => window.electronAPI.toggleWindow()}
          className="p-1.5 rounded hover:bg-red-500/20 text-surface-200 hover:text-red-400"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
