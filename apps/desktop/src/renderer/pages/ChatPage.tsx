import { useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import PanelHeader from '../components/PanelHeader';
import { Camera, AlertTriangle, Trash2 } from 'lucide-react';
import Logo from '../components/Logo';

export default function ChatPage() {
  const {
    messages,
    isStreaming,
    settings,
    captureScreen,
    listening,
    transcript,
    audioError,
    clearTranscript,
    askAboutTranscript,
  } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const isLocal = settings.provider.type === 'ollama';
  const subtitle = `${isLocal ? 'Local' : 'Cloud'} · ${settings.provider.model}`;

  return (
    <div className="flex h-full flex-col">
      <PanelHeader icon={Logo} title="Ask AI" subtitle={subtitle} />

      {(listening || transcript.length > 0 || audioError) && (
        <div className="border-b border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2 text-[11px] font-medium text-white/60">
              {listening && <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />}
              {listening ? 'Listening…' : 'Transcript'}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={askAboutTranscript}
                disabled={transcript.length === 0}
                className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/70 transition-colors hover:bg-white/10 hover:text-white/90 disabled:opacity-40"
              >
                Ask AI about this
              </button>
              <button
                onClick={clearTranscript}
                disabled={transcript.length === 0}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-40"
                title="Clear transcript"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {audioError && (
            <div className="mx-4 mb-2 flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300">
              <AlertTriangle size={12} className="shrink-0" />
              {audioError}
            </div>
          )}

          <div ref={transcriptRef} data-selectable className="max-h-28 space-y-1 overflow-y-auto px-4 pb-2 text-[12px] leading-relaxed">
            {transcript.length === 0 ? (
              <div className="text-white/35">{listening ? 'Waiting for speech…' : 'No transcript yet.'}</div>
            ) : (
              transcript.map((seg) => (
                <div key={seg.id}>
                  <span className={seg.source === 'mic' ? 'text-sky-300' : 'text-emerald-300'}>
                    {seg.source === 'mic' ? 'You' : 'Screen'}:{' '}
                  </span>
                  <span className="text-white/80">{seg.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-5 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06]">
              <Logo size={30} />
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
