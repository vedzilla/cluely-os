import { useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { messages, isStreaming, currentSessionId, createNewSession } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center">
              <MessageSquare size={28} className="text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Cluely OS</h2>
              <p className="text-sm text-surface-200/60 mt-1 max-w-[280px]">
                Privacy-first AI copilot. Capture your screen, review what's sent, and get AI assistance — all under your control.
              </p>
            </div>
            <div className="space-y-2 text-xs text-surface-200/50">
              <p>1. Click <strong className="text-accent-400">Capture Screen</strong> to grab your screen</p>
              <p>2. Review the context in the <strong className="text-yellow-400">Transparency Panel</strong></p>
              <p>3. Choose an action: Analyze, Summarize, Explain, or Draft</p>
              <p>4. Or just type a question below</p>
            </div>
            {!currentSessionId && (
              <button
                onClick={() => createNewSession()}
                className="px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 transition-colors text-sm"
              >
                Start New Session
              </button>
            )}
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-surface-200/50">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            AI is thinking...
          </div>
        )}
      </div>
      <ChatInput />
    </div>
  );
}
