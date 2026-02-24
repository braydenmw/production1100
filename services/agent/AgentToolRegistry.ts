// ============================================================================
// AGENT TOOL REGISTRY
// Registers callable tools the AI can invoke mid-conversation.
// The AI emits [[TOOL:name]] ... [[/TOOL]] blocks; the engine executes them.
// ============================================================================

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, ToolParam>;
  execute: (params: Record<string, unknown>) => Promise<AgentToolResult>;
}

export interface ToolParam {
  type: 'string' | 'number' | 'boolean';
  description: string;
  required?: boolean;
}

export interface AgentToolResult {
  success: boolean;
  data: unknown;
  error?: string;
  latencyMs: number;
}

export class AgentToolRegistry {
  private tools = new Map<string, AgentTool>();

  register(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  list(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  /** Returns a concise tool manifest suitable for injection into a system prompt */
  toManifest(): string {
    if (this.tools.size === 0) return '';
    const lines = ['AVAILABLE TOOLS — you may invoke any tool by emitting:', '[[TOOL:tool_name]]', '{"param": "value"}', '[[/TOOL]]', ''];
    for (const tool of this.tools.values()) {
      const required = Object.entries(tool.parameters)
        .filter(([, p]) => p.required)
        .map(([k]) => k)
        .join(', ');
      lines.push(`• ${tool.name} — ${tool.description}${required ? ` (required: ${required})` : ''}`);
    }
    return lines.join('\n');
  }

  async execute(name: string, params: Record<string, unknown>): Promise<AgentToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, data: null, error: `Tool "${name}" not registered`, latencyMs: 0 };
    }
    const start = Date.now();
    try {
      const result = await tool.execute(params);
      return { ...result, latencyMs: Date.now() - start };
    } catch (e) {
      return { success: false, data: null, error: String(e), latencyMs: Date.now() - start };
    }
  }

  /**
   * Scans text for [[TOOL:name]] ... [[/TOOL]] blocks and returns all matches.
   * Handles multiple tool calls in a single response.
   */
  static parseToolCalls(text: string): Array<{ name: string; params: Record<string, unknown> }> {
    const calls: Array<{ name: string; params: Record<string, unknown> }> = [];
    const pattern = /\[\[TOOL:(\w+)\]\]\s*([\s\S]*?)\[\[\/TOOL\]\]/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      let params: Record<string, unknown> = {};
      try {
        params = JSON.parse(match[2].trim());
      } catch {
        // params block is not valid JSON — use empty
      }
      calls.push({ name, params });
    }
    return calls;
  }

  /** Returns the text with all [[TOOL:...]]...[[/TOOL]] blocks removed */
  static stripToolCalls(text: string): string {
    return text.replace(/\[\[TOOL:\w+\]\][\s\S]*?\[\[\/TOOL\]\]/g, '').trim();
  }
}
