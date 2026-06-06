import Tesseract from 'tesseract.js';

let worker: Tesseract.Worker | null = null;

async function getWorker(): Promise<Tesseract.Worker> {
  if (!worker) {
    worker = await Tesseract.createWorker('eng');
  }
  return worker;
}

export async function performOCR(imageBuffer: Buffer): Promise<string> {
  try {
    const w = await getWorker();
    const { data: { text } } = await w.recognize(imageBuffer);
    return text.trim();
  } catch (err) {
    console.error('OCR failed:', err);
    return '';
  }
}
