import type { TranscriptSource } from '@copilot/shared';

// Length of each audio chunk sent to Whisper. Whisper transcribes whole files,
// so we record short self-contained segments and transcribe them back to back.
const CHUNK_MS = 6000;
const MIN_BYTES = 1200; // skip near-silent/empty chunks

export interface CaptureOptions {
  sources: TranscriptSource[];
  onSegment: (segment: { source: TranscriptSource; text: string }) => void;
  onError: (message: string) => void;
}

function pickMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'audio/webm';
}

// Record one stream as a sequence of complete files, transcribing each.
function recordLoop(
  stream: MediaStream,
  source: TranscriptSource,
  mimeType: string,
  onSegment: CaptureOptions['onSegment'],
  onError: CaptureOptions['onError']
): () => void {
  let stopped = false;
  let recorder: MediaRecorder | null = null;

  const recordOnce = () => {
    if (stopped) return;
    const rec = new MediaRecorder(stream, { mimeType });
    recorder = rec;
    const chunks: Blob[] = [];

    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };

    rec.onstop = async () => {
      const blob = new Blob(chunks, { type: mimeType });
      if (blob.size > MIN_BYTES) {
        try {
          const buf = new Uint8Array(await blob.arrayBuffer());
          const res = await window.electronAPI.transcribeAudio(buf, mimeType);
          if (res.success && res.text) onSegment({ source, text: res.text });
          else if (!res.success && res.error) onError(res.error);
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Transcription failed');
        }
      }
      if (!stopped) recordOnce();
    };

    rec.start();
    window.setTimeout(() => {
      if (rec.state !== 'inactive') rec.stop();
    }, CHUNK_MS);
  };

  recordOnce();

  return () => {
    stopped = true;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
  };
}

/**
 * Start capturing the requested audio sources and stream transcript segments
 * back via onSegment. Returns a stop() that tears everything down.
 * Mic and system audio are captured independently — if one fails the other
 * still runs.
 */
export async function startCapture(opts: CaptureOptions): Promise<() => void> {
  const mimeType = pickMimeType();
  const stoppers: Array<() => void> = [];

  if (opts.sources.includes('mic')) {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stoppers.push(recordLoop(micStream, 'mic', mimeType, opts.onSegment, opts.onError));
    } catch {
      opts.onError('Microphone unavailable — grant mic permission in System Settings.');
    }
  }

  if (opts.sources.includes('system')) {
    try {
      // Request video too (some platforms reject audio-only); we keep only audio.
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      display.getVideoTracks().forEach((t) => t.stop());
      const audioTracks = display.getAudioTracks();
      if (audioTracks.length === 0) {
        display.getTracks().forEach((t) => t.stop());
        opts.onError('System audio unavailable — grant Screen Recording permission and retry.');
      } else {
        const audioOnly = new MediaStream(audioTracks);
        stoppers.push(recordLoop(audioOnly, 'system', mimeType, opts.onSegment, opts.onError));
      }
    } catch {
      opts.onError('Could not capture system audio (Screen Recording permission needed).');
    }
  }

  return () => stoppers.forEach((stop) => stop());
}
