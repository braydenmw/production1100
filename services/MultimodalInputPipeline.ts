/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 3: MULTIMODAL INPUT — PDF / Image / Audio → Text
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Converts non-text inputs into structured text for the ADVERSIQ pipeline.
 * Uses Together Vision model for images, Groq Whisper for audio,
 * and text extraction for PDFs.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { callTogether, isTogetherAvailable, TOGETHER_VISION_MODEL } from './togetherAIService';
import { isGroqAvailable } from './groqService';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ModalityType = 'text' | 'image' | 'pdf' | 'audio';

export interface MultimodalInput {
  type: ModalityType;
  content: string; // text content, base64 data, or file path
  mimeType?: string;
  filename?: string;
}

export interface MultimodalResult {
  originalType: ModalityType;
  extractedText: string;
  confidence: number;
  metadata: Record<string, unknown>;
  processingTimeMs: number;
}

// ─── Image Processing (Together Vision) ─────────────────────────────────────

export async function processImage(
  base64Data: string,
  mimeType: string = 'image/png',
  prompt: string = 'Analyze this image in detail. Extract all text, data, charts, tables, and key information. If it contains financial data, extract numbers precisely.'
): Promise<MultimodalResult> {
  const start = Date.now();

  if (!isTogetherAvailable()) {
    return {
      originalType: 'image',
      extractedText: '[Image processing unavailable — no Together.ai API key configured]',
      confidence: 0,
      metadata: { error: 'provider_unavailable' },
      processingTimeMs: Date.now() - start,
    };
  }

  const dataUri = `data:${mimeType};base64,${base64Data}`;

  const response = await callTogether(
    [
      { role: 'system', content: 'You are a document analysis expert. Extract all information precisely.' },
      { role: 'user', content: `${prompt}\n\n[Image: ${dataUri}]` },
    ],
    { model: TOGETHER_VISION_MODEL, maxTokens: 2000, temperature: 0.1 }
  );

  return {
    originalType: 'image',
    extractedText: response,
    confidence: 0.85,
    metadata: { mimeType, model: TOGETHER_VISION_MODEL },
    processingTimeMs: Date.now() - start,
  };
}

// ─── PDF Processing ─────────────────────────────────────────────────────────

export async function processPDF(textContent: string, filename?: string): Promise<MultimodalResult> {
  const start = Date.now();

  // For server-side, text would be pre-extracted via pdf-parse or similar
  // Client-side: the browser can extract text from PDF before sending
  if (!textContent || textContent.trim().length === 0) {
    return {
      originalType: 'pdf',
      extractedText: '[Empty PDF or no text extracted]',
      confidence: 0,
      metadata: { filename },
      processingTimeMs: Date.now() - start,
    };
  }

  // Summarize long PDFs to fit context window
  const maxChars = 30000;
  let processed = textContent;
  if (processed.length > maxChars) {
    // Keep first 60% and last 20%, summarize middle
    const head = processed.slice(0, Math.floor(maxChars * 0.6));
    const tail = processed.slice(-Math.floor(maxChars * 0.2));
    processed = head + '\n\n[... middle sections omitted for brevity ...]\n\n' + tail;
  }

  return {
    originalType: 'pdf',
    extractedText: processed,
    confidence: 0.9,
    metadata: {
      filename,
      originalLength: textContent.length,
      truncated: textContent.length > maxChars,
      pageEstimate: Math.ceil(textContent.length / 3000),
    },
    processingTimeMs: Date.now() - start,
  };
}

// ─── Audio Processing (Groq Whisper) ────────────────────────────────────────

export async function processAudio(
  base64Audio: string,
  mimeType: string = 'audio/wav',
  filename?: string
): Promise<MultimodalResult> {
  const start = Date.now();

  if (!isGroqAvailable()) {
    return {
      originalType: 'audio',
      extractedText: '[Audio transcription unavailable — no Groq API key configured]',
      confidence: 0,
      metadata: { error: 'provider_unavailable' },
      processingTimeMs: Date.now() - start,
    };
  }

  // Groq provides Whisper-large-v3-turbo for fast transcription
  // This would call the Groq audio transcription endpoint
  try {
    const groqKey = (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) || '';
    if (!groqKey || groqKey.length < 20) throw new Error('No Groq key');

    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const blob = new Blob([audioBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, filename || 'audio.wav');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'verbose_json');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}` },
      body: formData,
    });

    if (!response.ok) throw new Error(`Groq Whisper: ${response.status}`);
    const data = await response.json();

    return {
      originalType: 'audio',
      extractedText: data.text || '',
      confidence: 0.92,
      metadata: {
        model: 'whisper-large-v3-turbo',
        language: data.language,
        duration: data.duration,
        segments: data.segments?.length,
      },
      processingTimeMs: Date.now() - start,
    };
  } catch (err) {
    // Fallback: note the audio was provided but couldn't be processed
    return {
      originalType: 'audio',
      extractedText: `[Audio file provided (${filename || 'unnamed'}) — transcription failed: ${err instanceof Error ? err.message : 'unknown'}]`,
      confidence: 0,
      metadata: { error: String(err) },
      processingTimeMs: Date.now() - start,
    };
  }
}

// ─── Unified Entry Point ────────────────────────────────────────────────────

export async function processMultimodalInput(input: MultimodalInput): Promise<MultimodalResult> {
  switch (input.type) {
    case 'image':
      return processImage(input.content, input.mimeType, undefined);
    case 'pdf':
      return processPDF(input.content, input.filename);
    case 'audio':
      return processAudio(input.content, input.mimeType, input.filename);
    case 'text':
    default:
      return {
        originalType: 'text',
        extractedText: input.content,
        confidence: 1,
        metadata: {},
        processingTimeMs: 0,
      };
  }
}

export async function processMultipleInputs(inputs: MultimodalInput[]): Promise<MultimodalResult[]> {
  return Promise.all(inputs.map(processMultimodalInput));
}
