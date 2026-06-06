import { useAppStore } from '../stores/appStore';
import { Eye, ArrowUp, X, Globe, HardDrive, AlertTriangle } from 'lucide-react';

export default function ContextTransparencyPanel() {
  const { contextPayload, setContextPayload, setContextApproved, sendMessage } = useAppStore();

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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="drag flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
        <div className="no-drag flex items-center gap-2 text-[13px] font-semibold text-amber-300">
          <Eye size={15} />
          Review context
        </div>
        <button
          onClick={handleDiscard}
          className="no-drag flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white/90"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-white/55">
          <AlertTriangle size={12} className="text-amber-400" />
          Review exactly what will be sent before it leaves your machine.
        </div>

        {contextPayload.screenshotPreview && (
          <div className="space-y-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-white/40">Screenshot</div>
            <img
              src={contextPayload.screenshotPreview}
              alt="Captured screen"
              className="max-h-36 w-full rounded-lg border border-white/10 bg-black object-contain"
            />
          </div>
        )}

        <div className="space-y-1">
          <div className="text-[10px] font-medium uppercase tracking-wide text-white/40">
            Extracted text ({contextPayload.capturedText.length} chars)
          </div>
          <div
            data-selectable
            className="max-h-28 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-2.5 font-mono text-[11px] leading-relaxed text-white/70"
          >
            {contextPayload.capturedText || '(no text extracted)'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <div className="text-white/40">Model</div>
            <div className="font-medium text-white/90">{contextPayload.model}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <div className="text-white/40">Est. Tokens</div>
            <div className="font-medium text-white/90">~{contextPayload.estimatedTokens}</div>
          </div>
          <div className="col-span-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <div className="text-white/40">Data Destination</div>
            <div className="flex items-center gap-1.5 font-medium text-white/90">
              {contextPayload.isLocal ? (
                <>
                  <HardDrive size={12} className="text-emerald-400" />
                  Local (Ollama) — stays on your machine
                </>
              ) : (
                <>
                  <Globe size={12} className="text-sky-400" />
                  Cloud ({contextPayload.providerType}) — sent via API
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-white/[0.07] p-3">
        <button
          onClick={handleDiscard}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/10"
        >
          <X size={14} /> Discard
        </button>
        <button
          onClick={handleSendToAI}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-[13px] font-medium text-black transition-colors hover:bg-white"
        >
          <ArrowUp size={14} strokeWidth={2.5} /> Send to AI
        </button>
      </div>
    </div>
  );
}
