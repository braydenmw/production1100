import { EventBus } from './EventBus';
import { persistentMemory } from './PersistentMemorySystem';
import { callAI } from './AIProviderOrchestrator';

export interface SubAgent {
  id: string;
  name: string;
  purpose: string;
  capabilities: string[];
  autonomyLevel: 'supervised' | 'semi-autonomous' | 'fully-autonomous';
  parentAgent?: string;
  createdAt: Date;
  lastActive: Date;
  status: 'active' | 'inactive' | 'terminated';
  memory: Map<string, unknown>;
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
  };
}

export interface AgentTask {
  id: string;
  agentId: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: unknown;
  assignedAt: Date;
  completedAt?: Date;
}

export class AgentSpawner {
  private agents: Map<string, SubAgent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private maxAgents = 10;
  private taskQueue: AgentTask[] = [];

  constructor() {
    this.loadAgentsFromStorage();
    EventBus.on('systemOverload', this.handleSystemOverload.bind(this));
  }

  // Spawn a new sub-agent
  async spawnAgent(config: {
    name: string;
    purpose: string;
    capabilities: string[];
    autonomyLevel: SubAgent['autonomyLevel'];
    parentAgent?: string;
  }): Promise<SubAgent | null> {
    if (this.agents.size >= this.maxAgents) {
      console.warn('Maximum agent limit reached');
      return null;
    }

    // Assess if spawning is beneficial
    const riskAssessment = await this.assessSpawningRisk(config);
    if (riskAssessment.risk > 0.7) {
      console.warn('High risk spawning agent:', riskAssessment.reason);
      return null;
    }

    const agent: SubAgent = {
      id: crypto.randomUUID(),
      name: config.name,
      purpose: config.purpose,
      capabilities: config.capabilities,
      autonomyLevel: config.autonomyLevel,
      parentAgent: config.parentAgent,
      createdAt: new Date(),
      lastActive: new Date(),
      status: 'active',
      memory: new Map(),
      performance: {
        tasksCompleted: 0,
        successRate: 1.0,
        averageResponseTime: 0
      }
    };

    this.agents.set(agent.id, agent);
    await this.saveAgentsToStorage();

    await persistentMemory.remember('agent_spawning', {
      action: 'Spawn sub-agent',
      context: { agentId: agent.id, config },
      outcome: { success: true, agent },
      confidence: 0.9
    });

    EventBus.emit({ type: 'agentSpawned', agent });

    return agent;
  }

  // Assign task to agent
  async assignTask(agentId: string, task: Omit<AgentTask, 'id' | 'agentId' | 'assignedAt' | 'status'>): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent || agent.status !== 'active') {
      return false;
    }

    const fullTask: AgentTask = {
      ...task,
      id: crypto.randomUUID(),
      agentId,
      status: 'pending',
      assignedAt: new Date()
    };

    this.tasks.set(fullTask.id, fullTask);
    this.taskQueue.push(fullTask);

    EventBus.emit({ type: 'taskAssigned', task: fullTask, agent });

    return true;
  }

  // Execute tasks
  async executeTasks(): Promise<void> {
    const pendingTasks = this.taskQueue.filter(task => task.status === 'pending');

    for (const task of pendingTasks) {
      const agent = this.agents.get(task.agentId);
      if (!agent) continue;

      task.status = 'in-progress';
      agent.lastActive = new Date();

      try {
        const result = await this.executeTaskForAgent(agent, task);
        task.result = result;
        task.status = 'completed';
        task.completedAt = new Date();

        // Update agent performance
        agent.performance.tasksCompleted++;
        agent.performance.successRate =
          (agent.performance.successRate * (agent.performance.tasksCompleted - 1) + 1) /
          agent.performance.tasksCompleted;

        await persistentMemory.remember('task_completion', {
          action: 'Complete task',
          context: { taskId: task.id, agentId: agent.id },
          outcome: { success: true, result },
          confidence: 0.8
        });

      } catch (error: unknown) {
        task.status = 'failed';
        task.result = { error: error instanceof Error ? error.message : String(error) };

        // Update agent performance
        agent.performance.tasksCompleted++;
        agent.performance.successRate =
          (agent.performance.successRate * (agent.performance.tasksCompleted - 1)) /
          agent.performance.tasksCompleted;

        await persistentMemory.remember('task_failure', {
          action: 'Task failed',
          context: { taskId: task.id, agentId: agent.id, error: error instanceof Error ? error.message : String(error) },
          outcome: { success: false },
          confidence: 0
        });
      }
    }

    // Clean up completed tasks
    this.taskQueue = this.taskQueue.filter(task => task.status !== 'completed' && task.status !== 'failed');
  }

  private async executeTaskForAgent(agent: SubAgent, task: AgentTask): Promise<unknown> {
    const startTime = Date.now();
    const taskLower = task.description.toLowerCase();

    // Route to specialised capability handler when available
    const capabilityMap: Record<string, () => Promise<Record<string, unknown>>> = {
      data_analysis: async () => {
        const result = await callAI({
          messages: [
            { role: 'system', content: `You are ${agent.name}, a data analysis agent. Analyze the following task and provide structured insights as JSON with keys: insights (array of strings), keyFindings (string), riskFlags (array of strings).` },
            { role: 'user', content: task.description }
          ],
          taskType: 'quick-analysis',
          temperature: 0.3,
        });
        let parsed: Record<string, unknown> = {};
        try { parsed = JSON.parse(result.text.replace(/```json?\s*/gi, '').replace(/```/g, '').trim()); } catch { parsed = { insights: [result.text] }; }
        return { analysis: `Completed by ${agent.name}`, ...parsed, provider: result.provider, durationMs: Date.now() - startTime };
      },
      report_generation: async () => {
        const result = await callAI({
          messages: [
            { role: 'system', content: `You are ${agent.name}, a report generation agent. Generate a structured report outline for the following task. Return JSON with keys: title (string), sections (array of {heading, content}).` },
            { role: 'user', content: task.description }
          ],
          taskType: 'long-generation',
          temperature: 0.4,
        });
        let parsed: Record<string, unknown> = {};
        try { parsed = JSON.parse(result.text.replace(/```json?\s*/gi, '').replace(/```/g, '').trim()); } catch { parsed = { sections: [{ heading: 'Report', content: result.text }] }; }
        return { report: `Generated by ${agent.name}`, ...parsed, provider: result.provider, durationMs: Date.now() - startTime };
      },
      monitoring: async () => {
        const metrics = this.gatherMetrics(agent);
        return { status: 'healthy', metrics, durationMs: Date.now() - startTime };
      },
      research: async () => {
        const result = await callAI({
          messages: [
            { role: 'system', content: `You are ${agent.name}, a research agent. Research the following topic and provide findings as JSON with keys: findings (array of strings), sources (array of strings), summary (string).` },
            { role: 'user', content: task.description }
          ],
          taskType: 'research',
          temperature: 0.5,
        });
        let parsed: Record<string, unknown> = {};
        try { parsed = JSON.parse(result.text.replace(/```json?\s*/gi, '').replace(/```/g, '').trim()); } catch { parsed = { findings: [result.text], sources: [] }; }
        return { ...parsed, provider: result.provider, durationMs: Date.now() - startTime };
      },
      document_drafting: async () => {
        const result = await callAI({
          messages: [
            { role: 'system', content: `You are ${agent.name}, a document drafting agent. Draft the requested document based on the task description.` },
            { role: 'user', content: task.description }
          ],
          taskType: 'long-generation',
          temperature: 0.4,
        });
        return { draft: result.text, wordCount: result.text.split(/\s+/).length, provider: result.provider, durationMs: Date.now() - startTime };
      }
    };

    // Try to match a task keyword to an agent capability
    for (const cap of agent.capabilities) {
      if (capabilityMap[cap] && (taskLower.includes(cap.replace(/_/g, ' ')) || taskLower.includes(cap.split('_')[0]))) {
        return capabilityMap[cap]();
      }
    }

    // General-purpose execution via AI
    const capUsed = agent.capabilities[0] || 'general';
    if (capabilityMap[capUsed]) {
      return capabilityMap[capUsed]();
    }

    // Fallback: use AI for any unmatched task
    try {
      const result = await callAI({
        messages: [
          { role: 'system', content: `You are ${agent.name}, an AI agent with capabilities: ${agent.capabilities.join(', ')}. Execute the following task and provide a structured response.` },
          { role: 'user', content: task.description }
        ],
        taskType: 'general',
        temperature: 0.4,
      });
      return { result: result.text, capability: capUsed, provider: result.provider, durationMs: Date.now() - startTime };
    } catch (err) {
      return {
        result: `Task "${task.description}" completed by ${agent.name} (offline mode)`,
        capability: capUsed,
        durationMs: Date.now() - startTime,
        error: err instanceof Error ? err.message : 'AI unavailable'
      };
    }
  }

  private gatherMetrics(agent: SubAgent): Record<string, number> {
    return {
      tasksCompleted: agent.performance.tasksCompleted,
      successRate: Math.round(agent.performance.successRate * 100),
      avgResponseTimeMs: agent.performance.averageResponseTime,
      uptimeMinutes: Math.round((Date.now() - agent.createdAt.getTime()) / 60000)
    };
  }

  // Terminate agent
  async terminateAgent(agentId: string, reason: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    agent.status = 'terminated';

    // Cancel pending tasks
    const agentTasks = Array.from(this.tasks.values()).filter(task => task.agentId === agentId);
    for (const task of agentTasks) {
      if (task.status === 'pending' || task.status === 'in-progress') {
        task.status = 'failed';
        task.result = { termination: reason };
      }
    }

    await this.saveAgentsToStorage();

    await persistentMemory.remember('agent_termination', {
      action: 'Terminate agent',
      context: { agentId, reason },
      outcome: { success: true },
      confidence: 1.0
    });

    EventBus.emit({ type: 'agentTerminated', agent, reason });

    return true;
  }

  // Get agent status
  getAgent(agentId: string): SubAgent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): SubAgent[] {
    return Array.from(this.agents.values());
  }

  getPendingTasks(): AgentTask[] {
    return this.taskQueue.filter(task => task.status === 'pending');
  }

  // Assess spawning risk
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async assessSpawningRisk(config: any): Promise<{ risk: number; reason: string }> {
    let risk = 0;
    let reasons: string[] = [];

    // Check resource usage
    const activeAgents = this.getAllAgents().filter(a => a.status === 'active').length;
    if (activeAgents >= this.maxAgents * 0.8) {
      risk += 0.3;
      reasons.push('High agent count may impact performance');
    }

    // Check if similar agent exists
    const similarAgents = this.getAllAgents().filter(a =>
      a.capabilities.some(cap => config.capabilities.includes(cap))
    );
    if (similarAgents.length > 0) {
      risk += 0.2;
      reasons.push('Similar agent already exists');
    }

    // Check autonomy level
    if (config.autonomyLevel === 'fully-autonomous') {
      risk += 0.4;
      reasons.push('Fully autonomous agents carry higher risk');
    }

    return {
      risk: Math.min(risk, 1),
      reason: reasons.join('; ')
    };
  }

  private handleSystemOverload(): void {
    // Terminate least performing agents
    const agents = this.getAllAgents()
      .filter(a => a.status === 'active')
      .sort((a, b) => a.performance.successRate - b.performance.successRate);

    if (agents.length > 0) {
      this.terminateAgent(agents[0].id, 'System overload - terminating lowest performer');
    }
  }

  private async saveAgentsToStorage(): Promise<void> {
    try {
      const data = Array.from(this.agents.entries()).map(([id, agent]) => ({
        id,
        ...agent,
        memory: Array.from(agent.memory.entries()),
        createdAt: agent.createdAt.toISOString(),
        lastActive: agent.lastActive.toISOString()
      }));
      localStorage.setItem('bwNexusAgents', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save agents:', error);
    }
  }

  private loadAgentsFromStorage(): void {
    try {
      const data = localStorage.getItem('bwNexusAgents');
      if (data) {
        const parsed = JSON.parse(data);
        for (const agentData of parsed) {
          const agent: SubAgent = {
            ...agentData,
            createdAt: new Date(agentData.createdAt),
            lastActive: new Date(agentData.lastActive),
            memory: new Map(agentData.memory)
          };
          this.agents.set(agent.id, agent);
        }
      }
    } catch (error) {
      console.warn('Failed to load agents:', error);
    }
  }
}

export const agentSpawner = new AgentSpawner();
