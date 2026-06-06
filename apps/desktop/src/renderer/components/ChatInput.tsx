import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { ArrowUp, Camera, Scan, FileText, HelpCircle, PenLine } from 'lucide-react';

const QUICK_ACTIONS = [
  { action: 'analyze' as const, icon: Scan, label: 'Analyze' },
  { action: 'summarize' as const, icon: FileText, label: 'Summarize' },
  { action: 'explain' as const, icon: HelpCircle, label: 'Explain' },
  { action: 'draft' as const, icon: PenLine, label: 'Draft' },
];

export default function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming, captureScreen, lastCapture, analyzeScreen, askSeq } =
    useAppStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Grab focus whenever "Ask AI" (⌘↵) is invoked.
  useEffect(() => {
    textareaRef.current?.focus();
  }, [askSeq]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCaptureAndAnalyze = async (action: 'analyze' | 'summarize' | 'explain' | 'draft') => {
    let capture = lastCapture;
    if (!capture) capture = await captureScreen();
    if (capture) await analyzeScreen(capture, action);
  };

  const pill =
    'no-drag flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/60 transition-colors hover:bg-white/10 hover:text-white/90 disabled:opacity-40';

  return (
    <div className="border-t border-white/[0.07] p-3">
      {/* Quick actions */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        <button onClick={() => captureScreen()} disabled={isStreaming} className={pill}>
          <Camera size={12} /> Capture
        </button>
        {QUICK_ACTIONS.map(({ action, icon: Icon, label }) => (
          <button
            key={action}
            onClick={() => handleCaptureAndAnalyze(action)}
            disabled={isStreaming}
            className={pill}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Screenshot preview */}
      {lastCapture && (
        <div className="relative mb-2">
          <img
            src={lastCapture.imageDataUrl}
            alt="Last capture"
            className="h-16 w-full rounded-lg border border-white/10 bg-black object-contain"
          />
          <div className="absolute right-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white/70">
            {lastCapture.extractedText.length} chars
          </div>
        </div>
      )}

      {/* Input */}
      <div className="no-drag flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 focus-within:border-white/20">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Thinking…' : 'Ask anything…'}
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[13px] text-white/90 placeholder-white/35 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-black transition-colors hover:bg-white disabled:bg-white/15 disabled:text-white/40"
        >
          <ArrowUp size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
