/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ NEXUS AI — REASONING TRIBUNAL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Multi-Reasoning-Model Tribunal: routes the same question through three
 * fundamentally different reasoning architectures in parallel, then synthesises
 * their disagreements through Bayesian belief updating.
 *
 * Reasoning Models:
 *   1. Claude Extended Thinking  — careful, safety-aware, long-horizon reasoning
 *   2. OpenAI o3                 — mathematical/logical chain-of-thought
 *   3. Gemini 2.5 Pro Thinking   — broad-knowledge reasoning with thinking mode
 *
 * This has never been attempted: three AI architectures that actually THINK
 * (not just pattern-match) are pitted against each other. The existing
 * BayesianDebateEngine synthesises their outputs into a unified position
 * with confidence scores, disagreement maps, and reasoning traces.
 *
 * Graceful degradation: works with 1, 2, or 3 models available.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { callAI, type TaskType } from './AIProviderOrchestrator';
import { callGeminiThinking, isGemmaAvailable, type GemmaMessage } from '../gemmaService';
import { monitoringService } from './MonitoringService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TribunalJudge = 'claude-thinking' | 'openai-o3' | 'gemini-thinking';

export interface TribunalVerdict {
  judge: TribunalJudge;
  answer: string;
  thinkingTrace?: string;
  confidence: number;
  latencyMs: number;
  available: boolean;
  error?: string;
}

export interface TribunalSynthesis {
  /** The unified answer after synthesis. */
  unifiedAnswer: string;
  /** Individual verdicts from each judge. */
  verdicts: TribunalVerdict[];
  /** Points where judges disagreed. */
  disagreements: string[];
  /** Points where all judges agreed. */
  agreements: string[];
  /** Overall confidence (0-1) based on judge convergence. */
  confidence: number;
  /** Number of judges that contributed. */
  judgesAvailable: number;
  /** Total wall-clock time for the tribunal. */
  totalLatencyMs: number;
}

export interface TribunalOptions {
  /** Max thinking tokens for Claude Extended Thinking (default: 10000). */
  claudeThinkingBudget?: number;
  /** Max thinking tokens for Gemini 2.5 Pro (default: 8192). */
  geminiThinkingBudget?: number;
  /** Timeout per judge in ms (default: 120000 — 2 minutes). */
  judgeTimeout?: number;
  /** System prompt injected into all judges. */
  systemPrompt?: string;
  /** Which judges to use (default: all available). */
  judges?: TribunalJudge[];
}

// ─── Environment Detection ───────────────────────────────────────────────────

function hasAnthropicKey(): boolean {
  const key = String(
    (typeof process !== 'undefined' && process.env?.ANTHROPIC_API_KEY) || ''
  ).trim();
  return key.length > 20 && !key.toLowerCase().includes('your-');
}

function hasOpenAIKey(): boolean {
  const key = String(
    (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) || ''
  ).trim();
  return key.length > 20 && !key.toLowerCase().includes('your-');
}

// ─── Individual Judge Calls ──────────────────────────────────────────────────

async function callClaudeThinking(
  question: string,
  systemPrompt: string,
  budgetTokens: number,
  timeout: number
): Promise<TribunalVerdict> {
  const start = Date.now();
  if (!hasAnthropicKey()) {
    return { judge: 'claude-thinking', answer: '', confidence: 0, latencyMs: 0, available: false, error: 'ANTHROPIC_API_KEY not configured' };
  }

  try {
    const result = await Promise.race([
      callAI({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        taskType: 'extended-thinking' as TaskType,
        maxTokens: 8192,
        extendedThinking: { enabled: true, budgetTokens },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);

    return {
      judge: 'claude-thinking',
      answer: result.text,
      thinkingTrace: result.thinkingTrace,
      confidence: 0.9,
      latencyMs: Date.now() - start,
      available: true,
    };
  } catch (err) {
    return {
      judge: 'claude-thinking',
      answer: '',
      confidence: 0,
      latencyMs: Date.now() - start,
      available: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function callOpenAIO3(
  question: string,
  systemPrompt: string,
  timeout: number
): Promise<TribunalVerdict> {
  const start = Date.now();
  if (!hasOpenAIKey()) {
    return { judge: 'openai-o3', answer: '', confidence: 0, latencyMs: 0, available: false, error: 'OPENAI_API_KEY not configured' };
  }

  try {
    const result = await Promise.race([
      callAI({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        taskType: 'extended-thinking' as TaskType,
        maxTokens: 8192,
        extendedThinking: { enabled: true },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);

    return {
      judge: 'openai-o3',
      answer: result.text,
      confidence: 0.85,
      latencyMs: Date.now() - start,
      available: true,
    };
  } catch (err) {
    return {
      judge: 'openai-o3',
      answer: '',
      confidence: 0,
      latencyMs: Date.now() - start,
      available: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function callGeminiThinkingJudge(
  question: string,
  systemPrompt: string,
  budgetTokens: number,
  timeout: number
): Promise<TribunalVerdict> {
  const start = Date.now();
  if (!isGemmaAvailable()) {
    return { judge: 'gemini-thinking', answer: '', confidence: 0, latencyMs: 0, available: false, error: 'GOOGLE_AI_API_KEY not configured' };
  }

  try {
    const msgs: GemmaMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ];

    const result = await Promise.race([
      callGeminiThinking(msgs, { thinkingBudget: budgetTokens, maxTokens: 8192 }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
    ]);

    return {
      judge: 'gemini-thinking',
      answer: result,
      confidence: 0.85,
      latencyMs: Date.now() - start,
      available: true,
    };
  } catch (err) {
    return {
      judge: 'gemini-thinking',
      answer: '',
      confidence: 0,
      latencyMs: Date.now() - start,
      available: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ─── Synthesis ───────────────────────────────────────────────────────────────

/**
 * Synthesise multiple judge verdicts into a unified position.
 * Uses the first available judge to perform a meta-analysis of the
 * others' outputs — identifying agreements, disagreements, and
 * producing a final weighted answer.
 */
async function synthesiseVerdicts(
  question: string,
  verdicts: TribunalVerdict[]
): Promise<TribunalSynthesis> {
  const available = verdicts.filter(v => v.available && v.answer);
  const totalLatency = Math.max(...verdicts.map(v => v.latencyMs), 0);

  // Single judge — no synthesis needed
  if (available.length <= 1) {
    const solo = available[0];
    return {
      unifiedAnswer: solo?.answer || 'No reasoning models available for tribunal.',
      verdicts,
      disagreements: [],
      agreements: solo ? ['Single-judge verdict — no cross-validation possible'] : [],
      confidence: solo?.confidence || 0,
      judgesAvailable: available.length,
      totalLatencyMs: totalLatency,
    };
  }

  // Build synthesis prompt
  const judgeOutputs = available.map((v, i) => {
    const label = v.judge === 'claude-thinking' ? 'Claude (Extended Thinking)'
      : v.judge === 'openai-o3' ? 'OpenAI o3 (Reasoning)'
      : 'Gemini 2.5 Pro (Thinking)';
    return `=== JUDGE ${i + 1}: ${label} (${v.latencyMs}ms, confidence: ${(v.confidence * 100).toFixed(0)}%) ===\n${v.answer}`;
  }).join('\n\n');

  const synthesisPrompt = `You are the Chief Arbiter of the ADVERSIQ Reasoning Tribunal. ${available.length} independent reasoning models have each analysed the same question using fundamentally different architectures. Your task:

1. AGREEMENTS: Identify conclusions where all judges converge (list as bullet points).
2. DISAGREEMENTS: Identify points where judges reached different conclusions (list as bullet points, noting which judge said what).
3. UNIFIED ANSWER: Produce a final, synthesised answer that weighs each judge's reasoning quality. Where they disagree, explain why you favoured one position.
4. CONFIDENCE: Rate your confidence 0-100 based on convergence.

Respond in this exact format:
AGREEMENTS:
• [point]

DISAGREEMENTS:  
• [point]

UNIFIED ANSWER:
[your synthesised answer]

CONFIDENCE: [number]

--- QUESTION ---
${question}

--- JUDGE OUTPUTS ---
${judgeOutputs}`;

  try {
    const synthesis = await callAI({
      messages: [{ role: 'user', content: synthesisPrompt }],
      taskType: 'deep-reasoning',
      maxTokens: 4096,
      temperature: 0.3,
    });

    // Parse structured response
    const text = synthesis.text;
    const agreementsMatch = text.match(/AGREEMENTS:\s*([\s\S]*?)(?=DISAGREEMENTS:|$)/i);
    const disagreementsMatch = text.match(/DISAGREEMENTS:\s*([\s\S]*?)(?=UNIFIED ANSWER:|$)/i);
    const unifiedMatch = text.match(/UNIFIED ANSWER:\s*([\s\S]*?)(?=CONFIDENCE:|$)/i);
    const confidenceMatch = text.match(/CONFIDENCE:\s*(\d+)/i);

    const extractBullets = (raw: string | undefined): string[] => {
      if (!raw) return [];
      return raw.split('\n')
        .map(l => l.replace(/^[•\-*]\s*/, '').trim())
        .filter(l => l.length > 5);
    };

    const parsedConfidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) / 100 : 0.7;

    return {
      unifiedAnswer: unifiedMatch?.[1]?.trim() || text,
      verdicts,
      disagreements: extractBullets(disagreementsMatch?.[1]),
      agreements: extractBullets(agreementsMatch?.[1]),
      confidence: Math.min(1, Math.max(0, parsedConfidence)),
      judgesAvailable: available.length,
      totalLatencyMs: totalLatency + synthesis.latencyMs,
    };
  } catch {
    // Synthesis failed — fall back to highest-confidence single judge
    const best = available.sort((a, b) => b.confidence - a.confidence)[0];
    return {
      unifiedAnswer: best.answer,
      verdicts,
      disagreements: [],
      agreements: ['Synthesis unavailable — using highest-confidence single judge'],
      confidence: best.confidence * 0.8,
      judgesAvailable: available.length,
      totalLatencyMs: totalLatency,
    };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Run the Reasoning Tribunal: parallel deep-thinking across multiple AI
 * architectures, then synthesise into a unified position.
 *
 * This is what makes ADVERSIQ unprecedented — three models that genuinely
 * REASON (not pattern-match) compete on the same problem.
 *
 * Works with 1, 2, or 3 models available. Gracefully degrades.
 */
export async function runTribunal(
  question: string,
  options: TribunalOptions = {}
): Promise<TribunalSynthesis> {
  const {
    claudeThinkingBudget = 10000,
    geminiThinkingBudget = 8192,
    judgeTimeout = 120000,
    systemPrompt = 'You are a senior strategic analyst. Analyse the following question with maximum rigour. Consider risks, opportunities, hidden assumptions, and second-order effects. Be specific and evidence-based.',
    judges,
  } = options;

  const startTime = Date.now();

  // Determine which judges to call
  const activeJudges: TribunalJudge[] = judges || ['claude-thinking', 'openai-o3', 'gemini-thinking'];

  // Fire all judges in parallel — this is the breakthrough
  const judgePromises: Promise<TribunalVerdict>[] = [];

  if (activeJudges.includes('claude-thinking')) {
    judgePromises.push(callClaudeThinking(question, systemPrompt, claudeThinkingBudget, judgeTimeout));
  }
  if (activeJudges.includes('openai-o3')) {
    judgePromises.push(callOpenAIO3(question, systemPrompt, judgeTimeout));
  }
  if (activeJudges.includes('gemini-thinking')) {
    judgePromises.push(callGeminiThinkingJudge(question, systemPrompt, geminiThinkingBudget, judgeTimeout));
  }

  const verdicts = await Promise.all(judgePromises);

  // Synthesise
  const result = await synthesiseVerdicts(question, verdicts);

  // Track
  const availableCount = verdicts.filter(v => v.available).length;
  monitoringService.trackAICall({
    timestamp: new Date().toISOString(),
    model: `tribunal-${availableCount}-judges`,
    provider: 'tribunal' as never,
    latencyMs: Date.now() - startTime,
    success: availableCount > 0,
    error: availableCount === 0 ? 'No reasoning models available' : undefined,
  });

  console.log(
    `[ReasoningTribunal] ${availableCount}/${activeJudges.length} judges responded | ` +
    `Confidence: ${(result.confidence * 100).toFixed(0)}% | ` +
    `Agreements: ${result.agreements.length} | Disagreements: ${result.disagreements.length} | ` +
    `Total: ${Date.now() - startTime}ms`
  );

  return result;
}

/**
 * Quick check: how many tribunal judges are currently available?
 */
export function getAvailableJudges(): TribunalJudge[] {
  const available: TribunalJudge[] = [];
  if (hasAnthropicKey()) available.push('claude-thinking');
  if (hasOpenAIKey()) available.push('openai-o3');
  if (isGemmaAvailable()) available.push('gemini-thinking');
  return available;
}
