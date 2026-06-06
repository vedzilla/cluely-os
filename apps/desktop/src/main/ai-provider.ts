import Anthropic from '@anthropic-ai/sdk';
import type { AIProviderConfig } from '@copilot/shared';

interface ChatCompletionMessage {
  role: string;
  content: string;
}

export async function* handleAIChat(
  messages: ChatCompletionMessage[],
  config: AIProviderConfig
): AsyncGenerator<string> {
  // Anthropic (Claude) uses the official SDK and its own Messages API.
  if (config.type === 'anthropic') {
    yield* handleAnthropicChat(messages, config);
    return;
  }

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

async function* handleAnthropicChat(
  messages: ChatCompletionMessage[],
  config: AIProviderConfig
): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey: config.apiKey });

  // Claude takes the system prompt as a top-level field, not a message role.
  const systemText = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');

  const convo = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const stream = client.messages.stream({
    model: config.model,
    max_tokens: 8192,
    ...(systemText ? { system: systemText } : {}),
    messages: convo,
    thinking: { type: 'adaptive' },
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}
