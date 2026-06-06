import { useAppStore } from '../stores/appStore';
import { Eye, Send, X, Globe, HardDrive, AlertTriangle } from 'lucide-react';

export default function ContextTransparencyPanel() {
  const { contextPayload, setContextPayload, setContextApproved, sendMessage, lastCapture } = useAppStore();

  if (!contextPayload) return null;

  const handleSendToAI = async () => {
    setContextApproved(true);
    const content = `${contextPayload.userPrompt}\n\n---\nScreen content:\n${contextPayload.capturedText}\n---`;
    await sendMessage(content);
  };

  const handleDiscard = () => {
    setContextPayload(null);
    setContextApproved(false);
  };

  return (
    <div className="border-b border-yellow-500/30 bg-yellow-500/5 p-3 space-y-3 max-h-[50vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
          <Eye size={16} />
          Context Transparency Panel
        </div>
        <button onClick={handleDiscard} className="p-1 rounded hover:bg-surface-700/50 text-surface-200">
          <X size={14} />
        </button>
      </div>

      <div className="text-xs text-surface-200/70 flex items-center gap-1">
        <AlertTriangle size={12} className="text-yellow-400" />
        Review what will be sent to AI before proceeding
      </div>

      {/* Screenshot preview */}
      {contextPayload.screenshotPreview && (
        <div className="space-y-1">
          <div className="text-xs text-surface-200/50 font-medium">Screenshot Preview</div>
          <img
            src={contextPayload.screenshotPreview}
            alt="Captured screen"
            className="w-full rounded border border-surface-700/50 max-h-32 object-contain bg-black"
          />
        </div>
      )}

      {/* Extracted text */}
      <div className="space-y-1">
        <div className="text-xs text-surface-200/50 font-medium">Extracted Text ({contextPayload.capturedText.length} chars)</div>
        <div className="bg-surface-800/80 rounded p-2 text-xs text-surface-200 max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">
          {contextPayload.capturedText || '(no text extracted)'}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-surface-800/50 rounded p-2">
          <div className="text-surface-200/50">Model</div>
          <div className="text-white font-medium">{contextPayload.model}</div>
        </div>
        <div className="bg-surface-800/50 rounded p-2">
          <div className="text-surface-200/50">Est. Tokens</div>
          <div className="text-white font-medium">~{contextPayload.estimatedTokens}</div>
        </div>
        <div className="bg-surface-800/50 rounded p-2 col-span-2">
          <div className="text-surface-200/50">Data Destination</div>
          <div className="flex items-center gap-1.5 text-white font-medium">
            {contextPayload.isLocal ? (
              <>
                <HardDrive size={12} className="text-green-400" />
                Local (Ollama) — data stays on your machine
              </>
            ) : (
              <>
                <Globe size={12} className="text-blue-400" />
                Cloud ({contextPayload.providerType}) — sent via API
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDiscard}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-700/50 text-surface-200 hover:bg-surface-700 transition-colors text-sm"
        >
          <X size={14} />
          Discard
        </button>
        <button
          onClick={handleSendToAI}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors text-sm font-medium"
        >
          <Send size={14} />
          Send to AI
        </button>
      </div>
    </div>
  );
}
