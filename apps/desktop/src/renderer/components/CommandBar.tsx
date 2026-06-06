import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import {
  AudioLines,
  MessageSquare,
  List,
  Shield,
  Settings as SettingsIcon,
  EyeOff,
} from 'lucide-react';

/** A small keycap chip, e.g. ⌘ or ↵. */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-w-[18px] items-center justify-center rounded-[5px] border border-white/10 bg-white/[0.07] px-1 py-0.5 text-[10px] font-medium leading-none text-white/55">
      {children}
    </span>
  );
}

const isMac = navigator.platform.toUpperCase().includes('MAC');

/** Turn an Electron accelerator ("CommandOrControl+Shift+Space") into keycaps. */
function hotkeyParts(hotkey: string): string[] {
  return hotkey.split('+').map((token) => {
    switch (token) {
      case 'CommandOrControl':
      case 'CmdOrCtrl':
        return isMac ? '⌘' : 'Ctrl';
      case 'Command':
      case 'Cmd':
        return '⌘';
      case 'Control':
      case 'Ctrl':
        return isMac ? '⌃' : 'Ctrl';
      case 'Shift':
        return '⇧';
      case 'Alt':
      case 'Option':
        return isMac ? '⌥' : 'Alt';
      case 'Space':
        return 'Space';
      default:
        return token;
    }
  });
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const TABS = [
  { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
  { id: 'sessions' as const, icon: List, label: 'Sessions' },
  { id: 'privacy' as const, icon: Shield, label: 'Privacy' },
  { id: 'settings' as const, icon: SettingsIcon, label: 'Settings' },
];

export default function CommandBar() {
  const { page, panelOpen, togglePanel, focusAsk, currentSessionId, createNewSession, settings } =
    useAppStore();

  const [listening, setListening] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Tick the session timer while "listening".
  useEffect(() => {
    if (!listening) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [listening]);

  // ⌘↵ anywhere opens the Ask box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        focusAsk();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusAsk]);

  const toggleListen = async () => {
    if (listening) {
      setListening(false);
      setSeconds(0);
      return;
    }
    if (!currentSessionId) await createNewSession();
    setSeconds(0);
    setListening(true);
  };

  const hideParts = hotkeyParts(settings.globalHotkey || 'CommandOrControl+Shift+Space');

  return (
    <div className="drag flex w-full justify-center pt-2.5">
      <div className="animate-bar-in no-drag inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        {/* Listen */}
        <button
          onClick={toggleListen}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/[0.08]"
        >
          {listening ? (
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          ) : (
            <AudioLines size={14} className="text-white/70" />
          )}
          <span className="tabular-nums">{listening ? formatTimer(seconds) : 'Listen'}</span>
        </button>

        <span className="mx-0.5 h-5 w-px bg-white/10" />

        {/* Ask AI */}
        <button
          onClick={focusAsk}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/[0.08]"
        >
          Ask AI
          <span className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>↵</Kbd>
          </span>
        </button>

        {/* Show / Hide */}
        <button
          onClick={() => window.electronAPI.toggleWindow()}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/[0.08]"
        >
          <EyeOff size={14} className="text-white/70" />
          <span className="hidden sm:inline">Hide</span>
          <span className="flex items-center gap-1">
            {hideParts.map((p, i) => (
              <Kbd key={i}>{p}</Kbd>
            ))}
          </span>
        </button>

        <span className="mx-0.5 h-5 w-px bg-white/10" />

        {/* Panel tabs */}
        <div className="flex items-center gap-0.5">
          {TABS.map((tab) => {
            const active = panelOpen && page === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => togglePanel(tab.id)}
                title={tab.label}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/55 hover:bg-white/[0.08] hover:text-white/90'
                }`}
              >
                <tab.icon size={15} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
