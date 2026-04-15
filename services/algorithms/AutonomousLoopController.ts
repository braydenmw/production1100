/**
 * AUTONOMOUS LOOP CONTROLLER — Adaptive Re-Routing for ADVERSIQ
 * 
 * Wraps the brain pipeline with intelligent loops:
 * - If confidence < threshold → re-run with deeper analysis
 * - If contradiction detected → fetch more data and retry
 * - If engines disagree → escalate debate rounds
 * - Hard depth limit prevents infinite loops
 * 
 * Architecture:
 * ┌────────────────────────────────────────────────────┐
 * │  AutonomousLoopController                          │
 * │  ┌──────────┐   ┌──────────┐   ┌───────────────┐  │
 * │  │  Plan     │──▶│  Execute │──▶│  Evaluate     │  │
 * │  │  (pick    │   │  (run    │   │  (check conf, │  │
 * │  │   tools)  │   │   brain) │   │   decide loop)│  │
 * │  └──────────┘   └──────────┘   └───────┬───────┘  │
 * │       ▲                                │           │
 * │       └────────────── if uncertain ────┘           │
 * └────────────────────────────────────────────────────┘
 */

import { toolRegistry, type ToolResult, type ToolCallDecision } from './ToolRegistry';

// ============================================================================
// TYPES
// ============================================================================

export interface LoopConfig {
  /** Maximum number of re-think iterations (default: 3) */
  maxIterations: number;
  /** Confidence threshold below which we re-loop (0-1, default: 0.65) */
  confidenceThreshold: number;
  /** Contradiction score above which we re-loop (0-1, default: 0.3) */
  contradictionThreshold: number;
  /** Enable tool calling during loops (default: true) */
  enableToolCalls: boolean;
  /** Maximum total time budget in ms (default: 30000) */
  timeBudgetMs: number;
  /** Enable parallel tool execution (default: true) */
  parallelTools: boolean;
}

export interface LoopIteration {
  iteration: number;
  action: 'initial' | 'deepen' | 'verify' | 'expand' | 'finalize';
  reason: string;
  toolsCalled: ToolResult[];
  confidence: number;
  contradictions: number;
  durationMs: number;
}

export interface LoopResult {
  finalConfidence: number;
  totalIterations: number;
  totalDurationMs: number;
  iterations: LoopIteration[];
  toolResults: ToolResult[];
  enrichedContext: Record<string, unknown>;
  earlyExit: boolean;
  exitReason: string;
}

const DEFAULT_CONFIG: LoopConfig = {
  maxIterations: 3,
  confidenceThreshold: 0.65,
  contradictionThreshold: 0.3,
  enableToolCalls: true,
  timeBudgetMs: 30000,
  parallelTools: true,
};

// ============================================================================
// AUTONOMOUS LOOP CONTROLLER
// ============================================================================

export class AutonomousLoopController {
  private config: LoopConfig;
  private onIterationCallback?: (iteration: LoopIteration) => void;

  constructor(config?: Partial<LoopConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set callback for streaming iteration progress
   */
  onIteration(cb: (iteration: LoopIteration) => void): void {
    this.onIterationCallback = cb;
  }

  /**
   * Run the autonomous loop around a brain execution.
   * 
   * @param intent - What the user is trying to accomplish
   * @param context - Current context / parameters
   * @param executeBrain - The brain execution function that returns a result with confidence
   */
  async run(
    intent: string,
    context: Record<string, unknown>,
    executeBrain: (enrichedContext: Record<string, unknown>, iteration: number) => Promise<{
      confidence: number;
      contradictions: number;
      result: unknown;
    }>
  ): Promise<LoopResult> {
    const startTime = Date.now();
    const iterations: LoopIteration[] = [];
    const allToolResults: ToolResult[] = [];
    let enrichedContext = { ...context };
    let currentConfidence = 0;
    let currentContradictions = 0;
    let earlyExit = false;
    let exitReason = '';

    for (let i = 0; i < this.config.maxIterations; i++) {
      const iterStart = Date.now();

      // Check time budget
      if (Date.now() - startTime > this.config.timeBudgetMs) {
        earlyExit = true;
        exitReason = `Time budget exceeded (${this.config.timeBudgetMs}ms)`;
        break;
      }

      // Determine action for this iteration
      const action = this.determineAction(i, currentConfidence, currentContradictions);

      // Call tools if needed
      const toolResults: ToolResult[] = [];
      if (this.config.enableToolCalls && i > 0) {
        const toolCalls = this.planToolCalls(action, intent, enrichedContext, currentConfidence, currentContradictions);
        if (toolCalls.length > 0) {
          const results = this.config.parallelTools
            ? await toolRegistry.callParallel(toolCalls.map(tc => ({ name: tc.toolName, args: tc.args })))
            : await this.callSequential(toolCalls);
          toolResults.push(...results);
          allToolResults.push(...results);

          // Merge tool results into enriched context
          for (const r of results) {
            if (r.success && r.data) {
              enrichedContext = {
                ...enrichedContext,
                [`_tool_${r.toolName}`]: r.data,
                _toolsUsed: [...((enrichedContext._toolsUsed as string[]) || []), r.toolName],
              };
            }
          }
        }
      }

      // Execute the brain
      const brainResult = await executeBrain(enrichedContext, i);
      currentConfidence = brainResult.confidence;
      currentContradictions = brainResult.contradictions;

      const iteration: LoopIteration = {
        iteration: i,
        action: action.type,
        reason: action.reason,
        toolsCalled: toolResults,
        confidence: currentConfidence,
        contradictions: currentContradictions,
        durationMs: Date.now() - iterStart,
      };
      iterations.push(iteration);

      // Stream progress
      if (this.onIterationCallback) {
        this.onIterationCallback(iteration);
      }

      // Check if we can exit early (high confidence, low contradictions)
      if (currentConfidence >= this.config.confidenceThreshold && currentContradictions <= this.config.contradictionThreshold) {
        earlyExit = true;
        exitReason = `Confidence ${(currentConfidence * 100).toFixed(1)}% meets threshold; contradictions ${currentContradictions.toFixed(2)} within bounds`;
        break;
      }

      // If this is the last iteration, exit
      if (i === this.config.maxIterations - 1) {
        exitReason = `Max iterations reached (${this.config.maxIterations})`;
      }
    }

    return {
      finalConfidence: currentConfidence,
      totalIterations: iterations.length,
      totalDurationMs: Date.now() - startTime,
      iterations,
      toolResults: allToolResults,
      enrichedContext,
      earlyExit,
      exitReason,
    };
  }

  private determineAction(
    iteration: number,
    confidence: number,
    contradictions: number
  ): { type: LoopIteration['action']; reason: string } {
    if (iteration === 0) {
      return { type: 'initial', reason: 'Initial analysis pass' };
    }

    if (contradictions > this.config.contradictionThreshold) {
      return {
        type: 'verify',
        reason: `Contradictions (${contradictions.toFixed(2)}) exceed threshold (${this.config.contradictionThreshold}) — running verification`,
      };
    }

    if (confidence < this.config.confidenceThreshold * 0.5) {
      return {
        type: 'expand',
        reason: `Confidence (${(confidence * 100).toFixed(1)}%) very low — expanding data sources`,
      };
    }

    if (confidence < this.config.confidenceThreshold) {
      return {
        type: 'deepen',
        reason: `Confidence (${(confidence * 100).toFixed(1)}%) below threshold (${(this.config.confidenceThreshold * 100).toFixed(1)}%) — deepening analysis`,
      };
    }

    return { type: 'finalize', reason: 'Finalizing results' };
  }

  private planToolCalls(
    action: { type: LoopIteration['action']; reason: string },
    intent: string,
    context: Record<string, unknown>,
    confidence: number,
    _contradictions: number
  ): ToolCallDecision[] {
    const calls: ToolCallDecision[] = [];
    const toolsUsed = (context._toolsUsed as string[]) || [];

    switch (action.type) {
      case 'verify':
        // Re-run contradiction check with current context
        if (!toolsUsed.includes('contradiction_check')) {
          calls.push({
            toolName: 'contradiction_check',
            args: context,
            reason: 'Verifying contradictions',
            priority: 10,
          });
        }
        break;

      case 'expand':
        // Search memory for similar cases
        if (!toolsUsed.includes('memory_search')) {
          calls.push({
            toolName: 'memory_search',
            args: { ...context, maxResults: 10 },
            reason: 'Expanding search to find more relevant cases',
            priority: 8,
          });
        }
        // Also run cognitive modelling for better understanding
        if (!toolsUsed.includes('cognitive_modelling')) {
          calls.push({
            toolName: 'cognitive_modelling',
            args: { decisionType: intent },
            reason: 'Modelling cognitive aspects',
            priority: 5,
          });
        }
        break;

      case 'deepen':
        // Run deeper debate if not already done
        if (!toolsUsed.includes('adversarial_debate')) {
          calls.push({
            toolName: 'adversarial_debate',
            args: context,
            reason: 'Running adversarial debate for deeper analysis',
            priority: 9,
          });
        }
        // Also run formula scoring if confidence is still low
        if (!toolsUsed.includes('formula_scoring') && confidence < 0.5) {
          calls.push({
            toolName: 'formula_scoring',
            args: context,
            reason: 'Running full formula scoring',
            priority: 7,
          });
        }
        break;

      default: {
        // Auto-match tools based on intent
        const matched = toolRegistry.matchTools(intent, context);
        for (const m of matched.slice(0, 2)) {
          if (!toolsUsed.includes(m.toolName)) {
            calls.push({ ...m, args: context });
          }
        }
        break;
      }
    }

    return calls;
  }

  private async callSequential(decisions: ToolCallDecision[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];
    for (const d of decisions) {
      results.push(await toolRegistry.call(d.toolName, d.args));
    }
    return results;
  }
}

export const autonomousLoop = new AutonomousLoopController();
