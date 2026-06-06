import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import TitleBar from './components/TitleBar';
import StatusBar from './components/StatusBar';
import ChatPage from './pages/ChatPage';
import PrivacyPage from './pages/PrivacyPage';
import SettingsPage from './pages/SettingsPage';
import SessionsPage from './pages/SessionsPage';
import ContextTransparencyPanel from './components/ContextTransparencyPanel';

export default function App() {
  const { page, loadSettings, loadSessions, contextPayload, contextApproved } = useAppStore();

  useEffect(() => {
    loadSettings();
    loadSessions();
  }, [loadSettings, loadSessions]);

  const showTransparency = contextPayload && !contextApproved;

  return (
    <div className="h-screen flex flex-col bg-surface-900/[0.92] text-white rounded-xl overflow-hidden border border-surface-700/50 shadow-2xl">
      <TitleBar />
      <StatusBar />
      {showTransparency && <ContextTransparencyPanel />}
      <main className="flex-1 overflow-hidden">
        {page === 'chat' && <ChatPage />}
        {page === 'privacy' && <PrivacyPage />}
        {page === 'settings' && <SettingsPage />}
        {page === 'sessions' && <SessionsPage />}
      </main>
    </div>
  );
}
