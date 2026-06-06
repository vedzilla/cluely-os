import { useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import PanelHeader from '../components/PanelHeader';
import { Sparkles, Camera } from 'lucide-react';

export default function ChatPage() {
  const { messages, isStreaming, settings, captureScreen } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const isLocal = settings.provider.type === 'ollama';
  const subtitle = `${isLocal ? 'Local' : 'Cloud'} · ${settings.provider.model}`;

  return (
    <div className="flex h-full flex-col">
      <PanelHeader icon={Sparkles} title="Ask AI" subtitle={subtitle} />

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-5 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06]">
              <Sparkles size={24} className="text-white/70" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-[15px] font-semibold text-white/95">What can I help with?</h2>
              <p className="max-w-[300px] text-[12px] leading-relaxed text-white/45">
                Ask anything, or capture your screen and I'll analyze what's on it — you review
                exactly what's sent before it leaves your machine.
              </p>
            </div>
            <button
              onClick={() => captureScreen()}
              className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-[12px] text-white/80 transition-colors hover:bg-white/10"
            >
              <Camera size={13} /> Capture screen
            </button>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}

        {isStreaming && (
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: '300ms' }} />
            </div>
            Thinking…
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
}
