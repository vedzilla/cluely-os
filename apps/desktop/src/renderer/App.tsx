import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import CommandBar from './components/CommandBar';
import ChatPage from './pages/ChatPage';
import PrivacyPage from './pages/PrivacyPage';
import SettingsPage from './pages/SettingsPage';
import SessionsPage from './pages/SessionsPage';
import ContextTransparencyPanel from './components/ContextTransparencyPanel';

// Keep in sync with COLLAPSED_HEIGHT in src/main/index.ts.
const COLLAPSED_HEIGHT = 84;
const EXPANDED_HEIGHT = 660;

export default function App() {
  const { page, panelOpen, loadSettings, loadSessions, contextPayload, contextApproved } =
    useAppStore();

  useEffect(() => {
    loadSettings();
    loadSessions();
  }, [loadSettings, loadSessions]);

  // Grow the OS window when the panel opens, collapse to just the bar when it closes.
  useEffect(() => {
    window.electronAPI.resizeWindow(panelOpen ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  }, [panelOpen]);

  const showTransparency = Boolean(contextPayload) && !contextApproved;

  return (
    <div className="flex h-screen w-screen flex-col items-center overflow-hidden text-white">
      <CommandBar />

      {panelOpen && (
        <div className="animate-panel-in mb-2.5 mt-2 flex min-h-0 w-[720px] flex-1 flex-col overflow-hidden rounded-[20px] border border-white/10 bg-black/60 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          {showTransparency ? (
            <ContextTransparencyPanel />
          ) : (
            <>
              {page === 'chat' && <ChatPage />}
              {page === 'sessions' && <SessionsPage />}
              {page === 'privacy' && <PrivacyPage />}
              {page === 'settings' && <SettingsPage />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
