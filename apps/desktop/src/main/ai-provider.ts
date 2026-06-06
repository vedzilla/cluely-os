import type { AIProviderConfig } from '@copilot/shared';

interface ChatCompletionMessage {
  role: string;
  content: string;
}

export async function* handleAIChat(
  messages: ChatCompletionMessage[],
  config: AIProviderConfig
): AsyncGenerator<string> {
  const isOllama = config.type === 'ollama';
  const baseUrl = config.baseUrl.replace(/\/+$/, '');

  const url = isOllama
    ? `${baseUrl}/api/chat`
    : `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!isOllama && config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const body = isOllama
    ? JSON.stringify({
        model: config.model,
        messages,
        stream: true,
      })
    : JSON.stringify({
        model: config.model,
        messages,
        stream: true,
      });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI provider error (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error('No response body received');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (isOllama) {
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.message?.content) {
            yield parsed.message.content;
          }
        } catch {
          // skip malformed lines
        }
      } else {
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}
