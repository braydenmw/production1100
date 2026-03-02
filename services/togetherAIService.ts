/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — TOGETHER AI SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Open-source LLM backend via Together.ai API.
 * Model: meta-llama/Llama-3.1-70B-Instruct-Turbo (default)
 *
 * Set VITE_TOGETHER_API_KEY in .env (browser) and
 *     TOGETHER_API_KEY in .env (server) to activate.
 *
 * All AI calls previously using AWS Bedrock now route here.
 * The awsBedrockService.ts exports are preserved as aliases.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
export const TOGETHER_DEFAULT_MODEL = 'meta-llama/Llama-3.1-70B-Instruct-Turbo';
export const TOGETHER_FAST_MODEL    = 'meta-llama/Llama-3.2-3B-Instruct-Turbo';
export const TOGETHER_VISION_MODEL  = 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo';

export const TOGETHER_SYSTEM_PROMPT =
  'You are BWGA AI — a senior strategic advisory intelligence system powered by the BW NEXUS AI agentic runtime. ' +
  'Be precise, evidence-based, and professional. Use structured output when appropriate.';

// ─── Client ───────────────────────────────────────────────────────────────────

export interface TogetherMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TogetherOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * Call Together.ai chat completions API.
 * - `onToken` triggers streaming mode via SSE.
 * - Without `onToken`, returns the full completion.
 */
export async function callTogether(
  messages: TogetherMessage[],
  options: TogetherOptions = {},
  onToken?: (token: string) => void
): Promise<string> {
  const key =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TOGETHER_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.TOGETHER_API_KEY) ||
    '';

  if (!key) {
    throw new Error(
      'Together.ai API key not configured. ' +
      'Add VITE_TOGETHER_API_KEY=<key> to .env and restart the dev server. ' +
      'Get your free key at https://api.together.xyz'
    );
  }

  const body = JSON.stringify({
    model:       options.model       ?? TOGETHER_DEFAULT_MODEL,
    messages,
    max_tokens:  options.maxTokens   ?? 4096,
    temperature: options.temperature ?? 0.4,
    stream:      Boolean(onToken),
  });

  const res = await fetch(TOGETHER_API_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type':  'application/json',
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Together.ai ${res.status}: ${errText}`);
  }

  // ── Non-streaming ──
  if (!onToken) {
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ── SSE streaming ──
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No stream body from Together.ai');

  const dec = new TextDecoder();
  let full = '', buf = '';

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
        const tok = JSON.parse(trimmed).choices?.[0]?.delta?.content || '';
        if (tok) { full += tok; onToken(tok); }
      } catch { /* partial chunk */ }
    }
  }
  return full;
}

/**
 * Simple one-shot prompt with optional system instruction.
 * Used as a drop-in for `generateFn` in IntelligentDocumentGenerator.
 */
export async function generateWithTogether(
  prompt: string,
  systemInstruction = TOGETHER_SYSTEM_PROMPT,
  onToken?: (token: string) => void
): Promise<string> {
  return callTogether(
    [
      { role: 'system', content: systemInstruction },
      { role: 'user',   content: prompt },
    ],
    {},
    onToken
  );
}

export default { callTogether, generateWithTogether };
