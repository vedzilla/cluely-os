// Transcribe a short audio chunk via the OpenAI Whisper API.
// Each chunk is a self-contained audio file (webm/opus) produced by the renderer.

export async function transcribeChunk(
  audio: Uint8Array,
  mimeType: string,
  apiKey: string,
  model: string
): Promise<string> {
  if (!apiKey) throw new Error('No transcription API key set (Settings → Audio).');

  const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : 'webm';
  const part = audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength) as ArrayBuffer;
  const file = new File([part], `chunk.${ext}`, { type: mimeType || 'audio/webm' });

  const form = new FormData();
  form.append('file', file);
  form.append('model', model || 'whisper-1');
  form.append('response_format', 'text');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Transcription error (${response.status}): ${errorText}`);
  }

  // response_format=text returns the transcript as plain text.
  return (await response.text()).trim();
}
