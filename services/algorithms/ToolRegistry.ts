/**
 * TOOL REGISTRY — Dynamic Tool/Function Calling for ADVOS
 * 
 * Provides structured tool schemas so the AI brain can decide
 * WHEN to call WHICH tool based on the situation.
 * 
 * Architecture:
 * ┌──────────────────────────────────────────────┐
 * │  ToolRegistry                                │
 * │  ├─ register(tool)     → add tool + schema   │
 * │  ├─ call(name, args)   → execute dynamically  │
 * │  ├─ getSchemas()       → for AI prompt injection│
 * │  └─ match(intent)      → suggest relevant tools│
 * └──────────────────────────────────────────────┘
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  category: 'research' | 'verification' | 'analysis' | 'generation' | 'data';
  parameters: ToolParameter[];
  returns: string;
}

export interface ToolResult {
  toolName: string;
  success: boolean;
  data: unknown;
  error?: string;
  executionTimeMs: number;
  confidence?: number;
}

export interface Tool {
  schema: ToolSchema;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export type ToolCallDecision = {
  toolName: string;
  args: Record<string, unknown>;
  reason: string;
  priority: number;
};

// ============================================================================
// TOOL REGISTRY
// ============================================================================

class ToolRegistryImpl {
  private tools = new Map<string, Tool>();
  private callLog: Array<{ toolName: string; timestamp: number; success: boolean; timeMs: number }> = [];

  register(tool: Tool): void {
    this.tools.set(tool.schema.name, tool);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getSchemas(): ToolSchema[] {
    return Array.from(this.tools.values()).map(t => t.schema);
  }

  getSchemasForPrompt(): string {
    const schemas = this.getSchemas();
    if (schemas.length === 0) return '';
    return schemas.map(s => {
      const params = s.parameters.map(p =>
        `    - ${p.name} (${p.type}${p.required ? ', required' : ''}): ${p.description}`
      ).join('\n');
      return `TOOL: ${s.name}\n  Category: ${s.category}\n  Description: ${s.description}\n  Parameters:\n${params}\n  Returns: ${s.returns}`;
    }).join('\n\n');
  }

  /**
   * Match tools relevant to a given intent/context
   */
  matchTools(intent: string, context?: Record<string, unknown>): ToolCallDecision[] {
    const decisions: ToolCallDecision[] = [];
    const intentLower = intent.toLowerCase();

    for (const [name, tool] of this.tools) {
      const schema = tool.schema;
      let priority = 0;
      let reason = '';

      // Keyword matching against tool description and category
      const descLower = schema.description.toLowerCase();
      const words = intentLower.split(/\s+/);
      const matchCount = words.filter(w => descLower.includes(w) || name.toLowerCase().includes(w)).length;

      if (matchCount >= 2) {
        priority = matchCount;
        reason = `Matches intent keywords (${matchCount} hits)`;
      }

      // Category-based matching
      if (intentLower.includes('search') || intentLower.includes('research') || intentLower.includes('find')) {
        if (schema.category === 'research') { priority += 3; reason = 'Research intent detected'; }
      }
      if (intentLower.includes('verify') || intentLower.includes('check') || intentLower.includes('validate')) {
        if (schema.category === 'verification') { priority += 3; reason = 'Verification intent detected'; }
      }
      if (intentLower.includes('analyz') || intentLower.includes('assess') || intentLower.includes('evaluat')) {
        if (schema.category === 'analysis') { priority += 3; reason = 'Analysis intent detected'; }
      }
      if (intentLower.includes('generate') || intentLower.includes('write') || intentLower.includes('create') || intentLower.includes('draft')) {
        if (schema.category === 'generation') { priority += 3; reason = 'Generation intent detected'; }
      }

      // Context-based matching
      if (context) {
        if (context.country && (name.includes('entity') || name.includes('sanctions') || name.includes('geo'))) {
          priority += 2;
          reason += '; country context present';
        }
        if (context.organizationName && name.includes('entity')) {
          priority += 3;
          reason += '; entity name present';
        }
      }

      if (priority > 0) {
        decisions.push({ toolName: name, args: {}, reason, priority });
      }
    }

    return decisions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute a tool by name with arguments
   */
  async call(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { toolName: name, success: false, data: null, error: `Tool "${name}" not found`, executionTimeMs: 0 };
    }

    // Validate required parameters
    for (const param of tool.schema.parameters) {
      if (param.required && !(param.name in args)) {
        return { toolName: name, success: false, data: null, error: `Missing required parameter: ${param.name}`, executionTimeMs: 0 };
      }
    }

    const start = Date.now();
    try {
      const data = await tool.execute(args);
      const timeMs = Date.now() - start;
      this.callLog.push({ toolName: name, timestamp: Date.now(), success: true, timeMs });
      return { toolName: name, success: true, data, executionTimeMs: timeMs };
    } catch (err) {
      const timeMs = Date.now() - start;
      this.callLog.push({ toolName: name, timestamp: Date.now(), success: false, timeMs });
      return { toolName: name, success: false, data: null, error: String(err), executionTimeMs: timeMs };
    }
  }

  /**
   * Execute multiple tools in parallel
   */
  async callParallel(calls: Array<{ name: string; args: Record<string, unknown> }>): Promise<ToolResult[]> {
    return Promise.all(calls.map(c => this.call(c.name, c.args)));
  }

  getCallLog() {
    return this.callLog.slice(-100);
  }
}

export const toolRegistry = new ToolRegistryImpl();

// ============================================================================
// REGISTER BUILT-IN TOOLS
// ============================================================================

import { satSolver } from './SATContradictionSolver';
import { bayesianDebateEngine } from './BayesianDebateEngine';
import { dagScheduler } from './DAGScheduler';
import { globalVectorIndex } from './VectorMemoryIndex';
import { HumanCognitionEngine } from './HumanCognitionEngine';
import type { ReportParameters } from '../../types';

// SAT Contradiction Check
toolRegistry.register({
  schema: {
    name: 'contradiction_check',
    description: 'Run DPLL satisfiability analysis to detect logical contradictions in user inputs or engine conclusions',
    category: 'verification',
    parameters: [
      { name: 'riskTolerance', type: 'string', description: 'Risk level: conservative, moderate, aggressive, high', required: false },
      { name: 'budget', type: 'string', description: 'Budget description', required: false },
      { name: 'strategicIntent', type: 'array', description: 'Strategic goals', required: false },
      { name: 'timeline', type: 'string', description: 'Timeline description', required: false },
    ],
    returns: 'Contradiction analysis with satisfiability status, contradiction list, and confidence score',
  },
  execute: async (args) => satSolver.analyze(args as unknown as ReportParameters),
});

// Bayesian Debate
toolRegistry.register({
  schema: {
    name: 'adversarial_debate',
    description: 'Run 5-persona Bayesian debate with Nash bargaining to reach consensus on proceed/pause/restructure/reject',
    category: 'analysis',
    parameters: [
      { name: 'country', type: 'string', description: 'Target country', required: false },
      { name: 'industry', type: 'array', description: 'Industry sectors', required: false },
      { name: 'riskTolerance', type: 'string', description: 'Risk tolerance level', required: false },
    ],
    returns: 'Debate result with recommendation, consensus strength, and per-persona reasoning',
  },
  execute: async (args) => bayesianDebateEngine.runDebate(args as unknown as ReportParameters),
});

// Formula Execution (DAG)
toolRegistry.register({
  schema: {
    name: 'formula_scoring',
    description: 'Execute 21+ interdependent scoring formulas via DAG scheduler for comprehensive case assessment',
    category: 'analysis',
    parameters: [
      { name: 'country', type: 'string', description: 'Target country', required: false },
      { name: 'industry', type: 'array', description: 'Industry sectors', required: false },
      { name: 'budget', type: 'string', description: 'Budget', required: false },
    ],
    returns: 'All formula scores with execution order and timing',
  },
  execute: async (args) => dagScheduler.execute(args as unknown as ReportParameters),
});

// Memory Retrieval
toolRegistry.register({
  schema: {
    name: 'memory_search',
    description: 'Search vector memory index for similar historical cases using cosine similarity and LSH',
    category: 'research',
    parameters: [
      { name: 'country', type: 'string', description: 'Country to match', required: false },
      { name: 'industry', type: 'array', description: 'Industries to match', required: false },
      { name: 'maxResults', type: 'number', description: 'Maximum results to return (default 5)', required: false },
    ],
    returns: 'Similar cases ranked by relevance with match reasons',
  },
  execute: async (args) => {
    const max = (args.maxResults as number) || 5;
    return globalVectorIndex.findSimilar(args as unknown as ReportParameters, max);
  },
});

// Human Cognition Engine
toolRegistry.register({
  schema: {
    name: 'cognitive_modelling',
    description: 'Run computational neuroscience models: Wilson-Cowan neural fields, Friston Free Energy, attention allocation, emotional processing',
    category: 'analysis',
    parameters: [
      { name: 'decisionType', type: 'string', description: 'Type of decision being modelled', required: false },
    ],
    returns: 'Cognitive processing results including attention map, emotional response, working memory load, and conscious access status',
  },
  execute: async (args) => {
    const hce = new HumanCognitionEngine();
    return hce.process(args as unknown as ReportParameters);
  },
});

// Quick Consensus Check
toolRegistry.register({
  schema: {
    name: 'quick_consensus',
    description: 'Fast consensus check without full debate — returns likely recommendation and confidence in <50ms',
    category: 'analysis',
    parameters: [],
    returns: 'Quick recommendation (proceed/pause/restructure/reject) with confidence percentage',
  },
  execute: async (args) => bayesianDebateEngine.quickConsensus(args as unknown as ReportParameters),
});
