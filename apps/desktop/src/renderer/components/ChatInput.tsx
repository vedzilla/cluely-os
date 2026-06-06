import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { Send, Camera, Scan, FileText, HelpCircle, PenLine } from 'lucide-react';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming, captureScreen, lastCapture, analyzeScreen } = useAppStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

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
    if (!capture) {
      capture = await captureScreen();
    }
    if (capture) {
      await analyzeScreen(capture, action);
    }
  };

  return (
    <div className="border-t border-surface-700/50 bg-surface-800/30 p-3 space-y-2">
      {/* Quick action buttons */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => captureScreen()}
          disabled={isStreaming}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-surface-700/50 text-surface-200 hover:bg-surface-700 transition-colors disabled:opacity-40"
        >
          <Camera size={11} /> Capture Screen
        </button>
        <button
          onClick={() => handleCaptureAndAnalyze('analyze')}
          disabled={isStreaming}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-surface-700/50 text-surface-200 hover:bg-surface-700 transition-colors disabled:opacity-40"
        >
          <Scan size={11} /> Analyze
        </button>
        <button
          onClick={() => handleCaptureAndAnalyze('summarize')}
          disabled={isStreaming}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-surface-700/50 text-surface-200 hover:bg-surface-700 transition-colors disabled:opacity-40"
        >
          <FileText size={11} /> Summarize
        </button>
        <button
          onClick={() => handleCaptureAndAnalyze('explain')}
          disabled={isStreaming}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-surface-700/50 text-surface-200 hover:bg-surface-700 transition-colors disabled:opacity-40"
        >
          <HelpCircle size={11} /> Explain
        </button>
        <button
          onClick={() => handleCaptureAndAnalyze('draft')}
          disabled={isStreaming}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-surface-700/50 text-surface-200 hover:bg-surface-700 transition-colors disabled:opacity-40"
        >
          <PenLine size={11} /> Draft Response
        </button>
      </div>

      {/* Screenshot preview */}
      {lastCapture && (
        <div className="relative">
          <img
            src={lastCapture.imageDataUrl}
            alt="Last capture"
            className="w-full h-16 object-contain rounded border border-surface-700/50 bg-black"
          />
          <div className="absolute top-0.5 right-0.5 bg-surface-900/80 text-[10px] text-surface-200 px-1.5 py-0.5 rounded">
            {lastCapture.extractedText.length} chars extracted
          </div>
        </div>
      )}

      {/* Text input */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'AI is responding...' : 'Ask anything...'}
          disabled={isStreaming}
          rows={1}
          className="flex-1 bg-surface-700/50 border border-surface-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-200/40 resize-none focus:outline-none focus:border-accent-500/50 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="p-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
