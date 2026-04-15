/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 12: MCP SERVER (Model Context Protocol)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Exposes VERDIX tools and capabilities as an MCP-compatible server.
 * External AI clients (Claude Desktop, OpenClaw, etc.) can discover
 * and call VERDIX tools via the standardized protocol.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── MCP Protocol Types ─────────────────────────────────────────────────────

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities: {
    tools: { listChanged: boolean };
    resources?: { subscribe: boolean; listChanged: boolean };
  };
}

// ─── Tool Handlers ──────────────────────────────────────────────────────────

type ToolHandler = (args: Record<string, unknown>) => Promise<MCPToolResult>;

const toolHandlers: Map<string, ToolHandler> = new Map();

// ─── Register Default VERDIX Tools ───────────────────────────────────────────

export const VERDIX_TOOLS: MCPToolDefinition[] = [
  {
    name: 'VERDIX_consultant_query',
    description: 'Submit a business consulting query to the VERDIX AI brain. Returns comprehensive analysis using 8-phase pipeline with multi-model routing.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The business consulting question or analysis request' },
        context: { type: 'string', description: 'Optional background context about the organization' },
        depth: { type: 'string', description: 'Analysis depth', enum: ['quick', 'standard', 'deep'] },
      },
      required: ['query'],
    },
  },
  {
    name: 'VERDIX_financial_model',
    description: 'Run financial calculations: NPV, IRR, PMT, FV, CAGR, Monte Carlo simulations.',
    inputSchema: {
      type: 'object',
      properties: {
        calculation: { type: 'string', description: 'Type of calculation', enum: ['npv', 'irr', 'pmt', 'fv', 'cagr', 'monte_carlo'] },
        parameters: { type: 'string', description: 'JSON string of calculation parameters (e.g., rate, cashflows, periods)' },
      },
      required: ['calculation', 'parameters'],
    },
  },
  {
    name: 'VERDIX_market_search',
    description: 'Search for real-time market intelligence, news, and data using VERDIX web search gateway.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for market intelligence' },
        region: { type: 'string', description: 'Target region/country' },
        maxResults: { type: 'string', description: 'Maximum number of results (1-20)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'VERDIX_risk_assessment',
    description: 'Run PESTLE/SWOT risk analysis with quantified risk matrix (likelihood × impact).',
    inputSchema: {
      type: 'object',
      properties: {
        scenario: { type: 'string', description: 'Business scenario to assess risks for' },
        country: { type: 'string', description: 'Target country for country-specific risks' },
        industry: { type: 'string', description: 'Industry sector' },
      },
      required: ['scenario'],
    },
  },
  {
    name: 'VERDIX_debate_analysis',
    description: 'Run Bayesian debate between AI models — generates pro/con arguments with confidence-weighted synthesis.',
    inputSchema: {
      type: 'object',
      properties: {
        proposition: { type: 'string', description: 'The proposition to debate' },
        rounds: { type: 'string', description: 'Number of debate rounds (1-5)' },
      },
      required: ['proposition'],
    },
  },
  {
    name: 'VERDIX_memory_query',
    description: 'Query VERDIX vector memory for relevant past analyses and stored knowledge.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Semantic search query against stored knowledge' },
        maxResults: { type: 'string', description: 'Maximum results to return' },
      },
      required: ['query'],
    },
  },
  {
    name: 'VERDIX_code_execute',
    description: 'Execute sandboxed JavaScript/TypeScript code with built-in financial functions.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'JavaScript code to execute (has access to NPV, IRR, PMT, FV, CAGR, monteCarlo functions)' },
        timeoutMs: { type: 'string', description: 'Execution timeout in milliseconds (max 10000)' },
      },
      required: ['code'],
    },
  },
];

// ─── MCP Server Implementation ──────────────────────────────────────────────

export class MCPServer {
  private tools: MCPToolDefinition[] = [...VERDIX_TOOLS];

  getServerInfo(): MCPServerInfo {
    return {
      name: 'VERDIX-mcp-server',
      version: '1.0.0',
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: true },
      },
    };
  }

  listTools(): MCPToolDefinition[] {
    return this.tools;
  }

  registerTool(tool: MCPToolDefinition, handler: ToolHandler): void {
    this.tools.push(tool);
    toolHandlers.set(tool.name, handler);
  }

  async callTool(call: MCPToolCall): Promise<MCPToolResult> {
    const handler = toolHandlers.get(call.name);

    if (!handler) {
      return {
        content: [{ type: 'text', text: `Unknown tool: ${call.name}. Available: ${this.tools.map(t => t.name).join(', ')}` }],
        isError: true,
      };
    }

    try {
      return await handler(call.arguments);
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Tool error: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  }

  // ─── HTTP Handler for Express integration ───────────────────────────────

  handleRequest(method: string, params?: Record<string, unknown>): unknown {
    switch (method) {
      case 'initialize':
        return this.getServerInfo();

      case 'tools/list':
        return { tools: this.listTools() };

      case 'tools/call':
        if (!params?.name || !params?.arguments) {
          return { error: { code: -32602, message: 'Missing name or arguments' } };
        }
        return this.callTool({
          name: params.name as string,
          arguments: params.arguments as Record<string, unknown>,
        });

      default:
        return { error: { code: -32601, message: `Unknown method: ${method}` } };
    }
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

export const mcpServer = new MCPServer();

// ─── Express Router Factory ─────────────────────────────────────────────────

export function createMCPRouter() {
  // Returns a handler function compatible with Express
  return async (req: { body: { method: string; params?: Record<string, unknown>; id?: number } },
                res: { json: (data: unknown) => void }) => {
    const { method, params, id } = req.body;
    const result = await mcpServer.handleRequest(method, params);

    res.json({
      jsonrpc: '2.0',
      id: id ?? null,
      result,
    });
  };
}
