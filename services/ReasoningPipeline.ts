/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — REASONING PIPELINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements the 4-step cognitive loop the OS runs on every user input:
 *
 *   Step 1 — QUESTION   : Classify and understand what the user is really asking
 *   Step 2 — THOUGHT    : Reason through the problem space internally
 *   Step 3 — SOLUTION   : Identify the best answer approach before writing it
 *   Step 4 — ANSWER     : Produce the final response grounded in steps 1–3
 *
 * This is the "brain before mouth" layer. The AI must think before it talks.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { callTogether } from './togetherAIService';
import { SYSTEM_INSTRUCTION_SHORT } from './aiPolicy';
import type { IntelligenceBlock } from './IssueSolutionPipeline';

export interface ReasoningInput {
  /** Raw user message */
  userMessage: string;
  /** Uploaded document text (if any) */
  documentContext?: string;
  /** Current case study fields */
  caseContext?: Record<string, string>;
  /** Brain/intelligence enrichment block (legacy string) */
  brainBlock?: string;
  /**
   * Structured intelligence from IssueSolutionPipeline.
   * Contains issue classification, root causes, leverage points,
   * historical parallels, NSIL score and decision frame.
   * When present this is injected as a rich dedicated section
   * in the THINK prompt so the AI reasons from real analysis.
   */
  intelligenceBlock?: IntelligenceBlock;
  /** Prior conversation turns */
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ReasoningOutput {
  /** Step 1: What is the user really asking? */
  questionClassification: string;
  /** Step 2: Internal reasoning — what do we know? what matters? */
  thought: string;
  /** Step 3: What is the best response approach? */
  solutionApproach: string;
  /** Step 4: The final answer to deliver to the user */
  answer: string;
  /** Whether a document was the primary input */
  documentDriven: boolean;
  /** Whether full reasoning completed or short-circuit used */
  fullReasoning: boolean;
}

// ─── Intelligence block formatter ────────────────────────────────────────────

/**
 * Formats the structured IntelligenceBlock output from IssueSolutionPipeline
 * into a dedicated THINK prompt section.
 * Falls back to the legacy `brainBlock` string if no structured block exists.
 */
function formatIntelligenceBlock(
  structured?: IntelligenceBlock,
  legacy?: string
): string {
  if (structured?.complete) {
    const parts: string[] = ['\n\n## ISSUE INTELLIGENCE (from analysis engines):'];
    parts.push(`**Classified issue type:** ${structured.issueClassification}`);

    if (structured.rootCauses.length) {
      parts.push(`\n**Root causes:**\n${structured.rootCauses.map(c => `  • ${c}`).join('\n')}`);
    }
    if (structured.leveragePoints.length) {
      parts.push(`\n**Key leverage points:**\n${structured.leveragePoints.map(l => `  • ${l}`).join('\n')}`);
    }
    if (structured.historicalParallels.length) {
      parts.push(`\n**Matched historical cases:**\n${structured.historicalParallels.map(h => `  • ${h}`).join('\n')}`);
    }
    if (structured.hiddenRisks.length) {
      parts.push(`\n**Hidden risks detected:**\n${structured.hiddenRisks.map(r => `  • ${r}`).join('\n')}`);
    }
    if (structured.strategicScore > 0) {
      parts.push(`\n**NSIL trust score:** ${structured.strategicScore}/100 — ${structured.nsилSummary}`);
    }
    if (structured.situationSummary) {
      parts.push(`\n**Situation analysis:** ${structured.situationSummary.slice(0, 600)}`);
    }
    if (structured.decisionFrame) {
      parts.push(`\n**Decision frame:** ${structured.decisionFrame}`);
    }
    if (structured.immediateActions.length) {
      parts.push(`\n**Recommended actions:**\n${structured.immediateActions.map(a => `  • ${a}`).join('\n')}`);
    }
    return parts.join('\n');
  }

  // Legacy fallback: raw string blob from BrainIntegrationService
  if (legacy) {
    return `\n\n## INTELLIGENCE ENRICHMENT:\n${legacy.slice(0, 2000)}`;
  }

  return '';
}

// ─── Internal reasoning prompt ────────────────────────────────────────────────

const THINK_PROMPT = (input: ReasoningInput) => {
  const caseLines = input.caseContext
    ? Object.entries(input.caseContext)
        .filter(([, v]) => v && v.trim())
        .map(([k, v]) => `  ${k}: ${v}`)
        .join('\n')
    : '  (no case context yet)';

  const docBlock = input.documentContext
    ? `\n\n## UPLOADED DOCUMENT CONTENT:\n${input.documentContext.slice(0, 16000)}`
    : '';

  const historyBlock = input.conversationHistory?.length
    ? `\n\n## RECENT CONVERSATION:\n${input.conversationHistory.slice(-4).map(t => `${t.role.toUpperCase()}: ${t.content.slice(0, 300)}`).join('\n\n')}`
    : '';

  return `You are about to respond to a user. Before writing your answer, you MUST reason through the problem in three steps. Think carefully — this reasoning shapes the quality of your final answer.

## USER MESSAGE:
"${input.userMessage}"

## CURRENT CASE CONTEXT:
${caseLines}${docBlock}${historyBlock}
${formatIntelligenceBlock(input.intelligenceBlock, input.brainBlock)}

---

Respond ONLY in this exact JSON format — no other text:

{
  "step1_question": "<What is the user actually asking? What is their real intent behind the words? What decision are they trying to make?>",
  "step2_thought": "<What do I know about this topic, country, sector, or situation that is relevant? What are the key facts, risks, dynamics at play? What should I NOT assume?>",
  "step3_solution": "<What is the best way to answer this? What structure, depth, and tone does this user need? What is the single most useful thing I can tell them right now?>",
  "document_driven": <true if a document was uploaded and is the primary input, false otherwise>
}`;
};

const ANSWER_PROMPT = (input: ReasoningInput, reasoning: {
  step1_question: string;
  step2_thought: string;
  step3_solution: string;
  document_driven: boolean;
}) => {
  const caseLines = input.caseContext
    ? Object.entries(input.caseContext)
        .filter(([, v]) => v && v.trim())
        .map(([k, v]) => `  ${k}: ${v}`)
        .join('\n')
    : '';

  const docBlock = input.documentContext
    ? `\n\n## DOCUMENT CONTENT (you have already read this):\n${input.documentContext.slice(0, 32000)}`
    : '';

  const historyBlock = input.conversationHistory?.length
    ? `\n\n## PRIOR CONVERSATION:\n${input.conversationHistory.slice(-6).map(t => `${t.role.toUpperCase()}: ${t.content.slice(0, 400)}`).join('\n\n')}`
    : '';

  return `You have already reasoned through this problem. Now write the final response.

## YOUR REASONING:
**What the user is really asking:** ${reasoning.step1_question}
**What you know and what matters:** ${reasoning.step2_thought}
**How to best answer:** ${reasoning.step3_solution}

## USER MESSAGE:
"${input.userMessage}"

## CASE CONTEXT:
${caseLines || '(none yet)'}${docBlock}${historyBlock}
${input.brainBlock ? `\n## INTELLIGENCE DATA:\n${input.brainBlock.slice(0, 8000)}` : ''}

---

Write your response now. Follow your reasoning. Be direct, specific, and professional.
- Do NOT repeat "I've captured..." phrases
- Do NOT run a numbered intake checklist
- Answer what the user actually asked first
- Reference specific facts from the document or context if available
- End with at most ONE follow-up question if genuinely needed`;
};

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function runReasoningPipeline(
  input: ReasoningInput,
  onThought?: (thought: string) => void
): Promise<ReasoningOutput> {

  // ── Step 1 + 2 + 3: Think ──────────────────────────────────────────────────
  let reasoning: {
    step1_question: string;
    step2_thought: string;
    step3_solution: string;
    document_driven: boolean;
  } | null = null;

  try {
    const thinkRaw = await callTogether(
      [
        { role: 'system', content: SYSTEM_INSTRUCTION_SHORT },
        { role: 'user', content: THINK_PROMPT(input) },
      ],
      { model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo', maxTokens: 600, temperature: 0.2 }
    );

    const jsonMatch = thinkRaw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      reasoning = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn('[ReasoningPipeline] Think step failed, using direct answer:', err);
  }

  // Surface the thought to the UI if a callback was provided
  if (reasoning && onThought) {
    onThought(
      `**Reasoning:** ${reasoning.step1_question}\n\n` +
      `**Analysis:** ${reasoning.step2_thought}\n\n` +
      `**Approach:** ${reasoning.step3_solution}`
    );
  }

  // ── Step 4: Answer ─────────────────────────────────────────────────────────
  let answer = '';

  if (reasoning) {
    // Full pipeline: use the thought to ground the answer
    try {
      answer = await callTogether(
        [
          { role: 'system', content: SYSTEM_INSTRUCTION_SHORT },
          { role: 'user', content: ANSWER_PROMPT(input, reasoning) },
        ],
        { model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo', maxTokens: 4096, temperature: 0.35 }
      );
    } catch (err) {
      console.warn('[ReasoningPipeline] Answer step failed:', err);
    }
  }

  if (!answer) {
    // Short-circuit: if thinking failed, answer directly but still with the full policy
    try {
      const directPrompt = ANSWER_PROMPT(input, {
        step1_question: 'User needs a direct response to their message.',
        step2_thought: 'Respond based on available context.',
        step3_solution: 'Answer directly and professionally.',
        document_driven: Boolean(input.documentContext),
      });
      answer = await callTogether(
        [
          { role: 'system', content: SYSTEM_INSTRUCTION_SHORT },
          { role: 'user', content: directPrompt },
        ],
        { model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo', maxTokens: 4096, temperature: 0.4 }
      );
    } catch (err) {
      console.warn('[ReasoningPipeline] Direct answer also failed:', err);
      answer = '';
    }
  }

  return {
    questionClassification: reasoning?.step1_question ?? '',
    thought: reasoning?.step2_thought ?? '',
    solutionApproach: reasoning?.step3_solution ?? '',
    answer,
    documentDriven: reasoning?.document_driven ?? Boolean(input.documentContext),
    fullReasoning: Boolean(reasoning && answer),
  };
}

/**
 * Streaming version — streams the final answer token by token after thinking.
 * The think step is awaited silently (or surfaced via onThought).
 */
export async function runReasoningPipelineStream(
  input: ReasoningInput,
  onToken: (token: string) => void,
  onThought?: (thought: string) => void
): Promise<ReasoningOutput> {

  // ── Think (non-streaming — must complete before answer begins) ─────────────
  let reasoning: {
    step1_question: string;
    step2_thought: string;
    step3_solution: string;
    document_driven: boolean;
  } | null = null;

  try {
    const thinkRaw = await callTogether(
      [
        { role: 'system', content: SYSTEM_INSTRUCTION_SHORT },
        { role: 'user', content: THINK_PROMPT(input) },
      ],
      { model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo', maxTokens: 600, temperature: 0.2 }
    );
    const jsonMatch = thinkRaw.match(/\{[\s\S]*\}/);
    if (jsonMatch) reasoning = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn('[ReasoningPipeline] Think step failed, streaming direct answer:', err);
  }

  if (reasoning && onThought) {
    onThought(
      `**Understanding:** ${reasoning.step1_question}\n` +
      `**Analysis:** ${reasoning.step2_thought}\n` +
      `**Approach:** ${reasoning.step3_solution}`
    );
  }

  // ── Stream the answer ───────────────────────────────────────────────────────
  const answerPrompt = ANSWER_PROMPT(input, reasoning ?? {
    step1_question: 'User needs a direct response.',
    step2_thought: 'Use available context.',
    step3_solution: 'Answer directly and professionally.',
    document_driven: Boolean(input.documentContext),
  });

  let accumulated = '';
  let streamFailed = false;

  try {
    await callTogether(
      [
        { role: 'system', content: SYSTEM_INSTRUCTION_SHORT },
        { role: 'user', content: answerPrompt },
      ],
      { model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo', maxTokens: 4096, temperature: 0.35, stream: true },
      (token) => {
        accumulated += token;
        onToken(accumulated);
      }
    );
  } catch (err) {
    console.warn('[ReasoningPipeline] Stream failed:', err);
    streamFailed = true;
  }

  return {
    questionClassification: reasoning?.step1_question ?? '',
    thought: reasoning?.step2_thought ?? '',
    solutionApproach: reasoning?.step3_solution ?? '',
    answer: accumulated,
    documentDriven: reasoning?.document_driven ?? Boolean(input.documentContext),
    fullReasoning: Boolean(reasoning) && !streamFailed,
  };
}

export default { runReasoningPipeline, runReasoningPipelineStream };
