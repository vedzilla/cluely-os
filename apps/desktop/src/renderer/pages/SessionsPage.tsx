import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import PanelHeader from '../components/PanelHeader';
import { List, Trash2, Plus, MessageSquare } from 'lucide-react';

export default function SessionsPage() {
  const { sessions, loadSessions, createNewSession, deleteSession, loadSession, setPage, currentSessionId } =
    useAppStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleOpen = async (id: string) => {
    await loadSession(id);
    setPage('chat');
  };

  const handleNew = async () => {
    await createNewSession();
    setPage('chat');
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader
        icon={List}
        title="Sessions"
        right={
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/90 transition-colors hover:bg-white/15"
          >
            <Plus size={13} /> New
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-3">
        {sessions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
            <MessageSquare size={30} className="text-white/15" />
            <p className="text-[13px] text-white/45">No sessions yet</p>
            <button
              onClick={handleNew}
              className="rounded-full bg-white/[0.06] px-4 py-2 text-[12px] text-white/80 transition-colors hover:bg-white/10"
            >
              Start your first session
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors hover:bg-white/[0.06] ${
                  currentSessionId === session.id
                    ? 'border-white/15 bg-white/[0.06]'
                    : 'border-transparent'
                }`}
              >
                <button onClick={() => handleOpen(session.id)} className="min-w-0 flex-1 text-left">
                  <div className="truncate text-[13px] font-medium text-white/90">{session.title}</div>
                  <div className="mt-0.5 text-[10px] text-white/35">
                    {new Date(session.created_at).toLocaleString()}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="ml-2 flex h-7 w-7 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
