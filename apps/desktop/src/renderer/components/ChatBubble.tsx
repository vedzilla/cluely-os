import type { ChatMessage } from '@copilot/shared';
import { User, Bot } from 'lucide-react';

interface Props {
  message: ChatMessage;
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
        isUser ? 'bg-accent-500/20' : 'bg-emerald-500/20'
      }`}>
        {isUser ? <User size={14} className="text-accent-400" /> : <Bot size={14} className="text-emerald-400" />}
      </div>
      <div className={`flex-1 max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
        isUser
          ? 'bg-accent-500/20 text-white'
          : 'bg-surface-800/80 text-surface-100'
      }`}>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        {message.tokenCount !== undefined && (
          <div className="text-[10px] text-surface-200/30 mt-1">~{message.tokenCount} tokens</div>
        )}
      </div>
    </div>
  );
}
