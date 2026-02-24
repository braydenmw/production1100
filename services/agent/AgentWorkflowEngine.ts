// ============================================================================
// AGENT WORKFLOW ENGINE
// A dependency-aware parallel step runner. Each step declares its dependencies;
// the engine resolves them topologically and runs ready steps in parallel.
// This is the equivalent of LangGraph's node-based DAG but with zero deps.
// ============================================================================

import type { AgentMemoryStore } from './AgentMemoryStore';
import type { AgentToolRegistry } from './AgentToolRegistry';

export type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface WorkflowStep<TContext extends WorkflowContext = WorkflowContext> {
  id: string;
  name: string;
  /** Step IDs that must complete before this step starts */
  dependencies: string[];
  /** Optional guard — step is skipped if this returns false */
  condition?: (context: TContext) => boolean;
  execute: (context: TContext) => Promise<unknown>;
}

export interface WorkflowContext {
  sessionId: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  stepStatuses: Record<string, WorkflowStepStatus>;
  memory: AgentMemoryStore;
  tools: AgentToolRegistry;
  errors: Record<string, string>;
}

export interface WorkflowResult {
  context: WorkflowContext;
  succeeded: string[];
  failed: string[];
  skipped: string[];
  totalMs: number;
}

export class AgentWorkflowEngine {
  constructor(private steps: WorkflowStep[]) {}

  async run(context: WorkflowContext): Promise<WorkflowResult> {
    const start = Date.now();
    const remaining = [...this.steps];
    const completed = new Set<string>();
    const succeeded: string[] = [];
    const failed: string[] = [];
    const skipped: string[] = [];

    // Initialise all statuses
    for (const step of this.steps) {
      context.stepStatuses[step.id] = 'pending';
    }

    while (remaining.length > 0) {
      // Find steps whose dependencies are all satisfied
      const ready = remaining.filter(
        s => s.dependencies.every(d => completed.has(d))
      );

      if (ready.length === 0) {
        // Remaining steps have unresolvable dependencies (cycle or missing dep)
        for (const step of remaining) {
          context.stepStatuses[step.id] = 'failed';
          context.errors[step.id] = 'Unresolvable dependency';
          failed.push(step.id);
          completed.add(step.id);
        }
        break;
      }

      // Remove ready steps from the queue before starting them
      for (const step of ready) {
        remaining.splice(remaining.indexOf(step), 1);
      }

      // Execute ready steps in parallel
      await Promise.all(
        ready.map(async step => {
          // Check condition gate
          if (step.condition && !step.condition(context)) {
            context.stepStatuses[step.id] = 'skipped';
            skipped.push(step.id);
            completed.add(step.id);
            return;
          }

          context.stepStatuses[step.id] = 'running';
          try {
            context.outputs[step.id] = await step.execute(context);
            context.stepStatuses[step.id] = 'completed';
            succeeded.push(step.id);
          } catch (e) {
            context.stepStatuses[step.id] = 'failed';
            context.errors[step.id] = String(e);
            failed.push(step.id);
          }
          completed.add(step.id);
        })
      );
    }

    return { context, succeeded, failed, skipped, totalMs: Date.now() - start };
  }

  /** Build a simple context from raw inputs */
  static buildContext(
    sessionId: string,
    inputs: Record<string, unknown>,
    memory: AgentMemoryStore,
    tools: AgentToolRegistry
  ): WorkflowContext {
    return {
      sessionId,
      inputs,
      outputs: {},
      stepStatuses: {},
      memory,
      tools,
      errors: {}
    };
  }
}
