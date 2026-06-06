import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { List, Trash2, Plus, MessageSquare } from 'lucide-react';

export default function SessionsPage() {
  const { sessions, loadSessions, createNewSession, deleteSession, loadSession, setPage, currentSessionId } = useAppStore();

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
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <List size={20} className="text-accent-400" />
          Sessions
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors"
        >
          <Plus size={12} />
          New Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <MessageSquare size={32} className="mx-auto text-surface-200/20" />
          <p className="text-sm text-surface-200/50">No sessions yet</p>
          <button
            onClick={handleNew}
            className="px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 text-sm"
          >
            Start your first session
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between bg-surface-800/50 rounded-lg p-3 hover:bg-surface-700/50 transition-colors ${
                currentSessionId === session.id ? 'border border-accent-500/30' : 'border border-transparent'
              }`}
            >
              <button onClick={() => handleOpen(session.id)} className="flex-1 text-left">
                <div className="text-sm font-medium text-white truncate">{session.title}</div>
                <div className="text-[10px] text-surface-200/40 mt-0.5">
                  {new Date(session.created_at).toLocaleString()}
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                className="p-1.5 rounded hover:bg-red-500/20 text-surface-200/40 hover:text-red-400 transition-colors ml-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
