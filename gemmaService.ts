/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ NEXUS AI - GOOGLE GEMMA SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Direct Google AI integration — calls Gemma models through Google's own
 * Generative Language API (same infrastructure as Gemini). Uses a dedicated
 * GOOGLE_AI_API_KEY with its own quota — completely independent of Together.ai,
 * Groq, and OpenAI token limits.
 *
 * Free key: https://aistudio.google.com/apikey
 * Set GOOGLE_AI_API_KEY in .env to activate.
 *
 * Models:
 *   GEMMA_DEFAULT  - gemma-4-26b-a4b-it  (reasoning, analysis — Gemma 4 flagship)
 *   GEMMA_FAST     - gemma-3-12b-it      (classification, extraction)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { monitoringService } from './services/MonitoringService';

// ─── Model Constants ──────────────────────────────────────────────────────────

export const GEMMA_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
export const GEMMA_DEFAULT_MODEL = 'gemma-4-26b-a4b-it';
export const GEMMA_FAST_MODEL = 'gemma-3-12b-it';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GemmaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GemmaOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  topP?: number;
  topK?: number;
}

// Google Generative Language API types
interface GooglePart { text: string }
interface GoogleContent { role: 'user' | 'model'; parts: GooglePart[] }
interface GoogleCandidate {
  content: { parts: GooglePart[] };
  finishReason?: string;
}
interface GoogleResponse {
  candidates?: GoogleCandidate[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
}

// ─── Circuit Breaker ──────────────────────────────────────────────────────────

let _circuitOpen = false;
let _circuitOpenUntil = 0;

function normalizeApiKey(raw: unknown): string {
  return String(raw ?? '').trim().replace(/^['"]|['"]$/g, '');
}

function markCircuitOpen(): void {
  _circuitOpen = true;
  _circuitOpenUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
}

function isCircuitOpen(): boolean {
  if (!_circuitOpen) return false;
  if (Date.now() > _circuitOpenUntil) {
    _circuitOpen = false;
    return false;
  }
  return true;
}

// ─── Key Management ───────────────────────────────────────────────────────────

function getGoogleAIKey(): string {
  return normalizeApiKey(
    (typeof process !== 'undefined' && process.env?.GOOGLE_AI_API_KEY) || ''
  );
}

function isValidKey(key: string): boolean {
  if (!key || key.length < 20) return false;
  const lower = key.toLowerCase();
  return !(
    lower.includes('your-') ||
    lower.includes('your_') ||
    lower.includes('key-here') ||
    lower.includes('placeholder')
  );
}

// ─── Availability ─────────────────────────────────────────────────────────────

/** Returns true if GOOGLE_AI_API_KEY is valid AND circuit-breaker is not tripped. */
export function isGemmaAvailable(): boolean {
  if (isCircuitOpen()) return false;
  return isValidKey(getGoogleAIKey());
}

// ─── Message Conversion ───────────────────────────────────────────────────────

/** Convert our standard messages into Google Generative Language API format. */
function toGoogleFormat(messages: GemmaMessage[]): {
  systemInstruction?: { parts: GooglePart[] };
  contents: GoogleContent[];
} {
  let systemInstruction: { parts: GooglePart[] } | undefined;
  const contents: GoogleContent[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      // Google API uses a separate system_instruction field
      systemInstruction = { parts: [{ text: msg.content }] };
    } else {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  return { systemInstruction, contents };
}

// ─── Core API Call ────────────────────────────────────────────────────────────

/**
 * Call Google Gemma via Google's Generative Language API.
 * - `onToken` triggers streaming mode via SSE.
 * - Without `onToken`, returns the full completion.
 * - Uses GOOGLE_AI_API_KEY — independent of Together/Groq/OpenAI quotas.
 */
export async function callGemma(
  messages: GemmaMessage[],
  options: GemmaOptions = {},
  onToken?: (token: string) => void
): Promise<string> {
  if (isCircuitOpen()) {
    throw new Error('Gemma circuit-breaker open (previous auth failure)');
  }

  const key = getGoogleAIKey();
  if (!isValidKey(key)) {
    throw new Error(
      'GOOGLE_AI_API_KEY not configured. Get a free key at https://aistudio.google.com/apikey — ' +
      'this is separate from Together/Groq/OpenAI and has its own quota.'
    );
  }

  const modelUsed = options.model ?? GEMMA_DEFAULT_MODEL;
  const callStart = performance.now();
  const useStream = Boolean(onToken);

  const { systemInstruction, contents } = toGoogleFormat(messages);

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: options.maxTokens ?? 8192,
      temperature: options.temperature ?? 0.4,
      topP: options.topP ?? 0.9,
      topK: options.topK ?? 50,
    },
  };
  if (systemInstruction) {
    requestBody.system_instruction = systemInstruction;
  }

  const action = useStream ? 'streamGenerateContent' : 'generateContent';
  const url = `${GEMMA_API_BASE}/${modelUsed}:${action}?key=${encodeURIComponent(key)}${useStream ? '&alt=sse' : ''}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: modelUsed,
      provider: 'gemma',
      latencyMs: Math.round(performance.now() - callStart),
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    });
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: modelUsed,
      provider: 'gemma',
      latencyMs: Math.round(performance.now() - callStart),
      success: false,
      error: `${res.status}: ${errText.slice(0, 200)}`,
    });
    if (res.status === 401 || res.status === 403) {
      markCircuitOpen();
    }
    throw new Error(`Gemma (Google AI) ${res.status}: ${errText}`);
  }

  // ── Non-streaming ──
  if (!useStream) {
    const data: GoogleResponse = await res.json();
    const text = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .join('') || '';

    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: modelUsed,
      provider: 'gemma',
      latencyMs: Math.round(performance.now() - callStart),
      success: true,
      inputTokens: data.usageMetadata?.promptTokenCount,
      outputTokens: data.usageMetadata?.candidatesTokenCount,
    });
    return text;
  }

  // ── SSE streaming ──
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No stream body from Gemma (Google AI)');

  const dec = new TextDecoder();
  let full = '';
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.replace(/^data:\s*/, '').trim();
      if (!trimmed || trimmed === '[DONE]') continue;
      try {
        const chunk: GoogleResponse = JSON.parse(trimmed);
        const tok = chunk.candidates?.[0]?.content?.parts
          ?.map(p => p.text)
          .join('') || '';
        if (tok) {
          full += tok;
          onToken!(tok);
        }
      } catch {
        /* partial chunk */
      }
    }
  }

  monitoringService.trackAICall({
    timestamp: new Date().toISOString(),
    model: modelUsed,
    provider: 'gemma',
    latencyMs: Math.round(performance.now() - callStart),
    success: true,
  });
  return full;
}

// ─── Convenience Wrappers ─────────────────────────────────────────────────────

/**
 * Simple one-shot prompt via Gemma.
 * Drop-in replacement for generateWithTogether / generateWithGroq.
 */
export async function generateWithGemma(
  prompt: string,
  systemInstruction?: string,
  onToken?: (token: string) => void
): Promise<string> {
  const msgs: GemmaMessage[] = [];
  if (systemInstruction) msgs.push({ role: 'system', content: systemInstruction });
  msgs.push({ role: 'user', content: prompt });
  return callGemma(msgs, {}, onToken);
}

/**
 * Fast classification/extraction using the smaller Gemma 12B model.
 */
export async function callGemmaFast(
  messages: GemmaMessage[],
  options: Omit<GemmaOptions, 'model'> = {},
  onToken?: (token: string) => void
): Promise<string> {
  return callGemma(messages, { ...options, model: GEMMA_FAST_MODEL }, onToken);
}

/**
 * Structured JSON output from Gemma.
 * Wraps the prompt to encourage valid JSON responses.
 */
export async function callGemmaJSON<T = unknown>(
  prompt: string,
  systemInstruction?: string,
  options: Omit<GemmaOptions, 'stream'> = {}
): Promise<T> {
  const jsonSystemPrompt = (systemInstruction || '') +
    '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.';

  const result = await callGemma(
    [
      { role: 'system', content: jsonSystemPrompt.trim() },
      { role: 'user', content: prompt },
    ],
    { ...options, temperature: options.temperature ?? 0.2 }
  );

  // Strip markdown code fences if present
  const cleaned = result
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  return JSON.parse(cleaned) as T;
}

export default {
  callGemma,
  callGemmaFast,
  callGemmaJSON,
  generateWithGemma,
  isGemmaAvailable,
  GEMMA_DEFAULT_MODEL,
  GEMMA_FAST_MODEL,
};
