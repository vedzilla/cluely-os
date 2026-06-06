import type { ChatMessage } from '@copilot/shared';

interface Props {
  message: ChatMessage;
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          data-selectable
          className="max-w-[82%] rounded-2xl rounded-br-md bg-white/10 px-3.5 py-2 text-[13px] leading-relaxed text-white/90"
        >
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </div>
      </div>
    );
  }

  // Assistant answers read like a document — full width, no bubble.
  return (
    <div data-selectable className="text-[13px] leading-relaxed text-white/85">
      <div className="whitespace-pre-wrap break-words">{message.content}</div>
      {message.tokenCount !== undefined && (
        <div className="mt-1.5 text-[10px] text-white/25">~{message.tokenCount} tokens</div>
      )}
    </div>
  );
}
