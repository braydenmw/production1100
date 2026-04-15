/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VERDIX NEXUS AI — MULTI-PROVIDER AI ORCHESTRATOR
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Intelligent load balancing across all available AI providers.
 * Spreads token usage, picks the best provider for each task type,
 * implements retry-with-fallback, and tracks usage to avoid rate limits.
 *
 * Providers: Groq → Together → OpenAI → Anthropic
 * Each provider has different strengths:
 *   - Groq:      Ultra-fast inference, great for quick analytical queries
 *   - Together:   Good for long-form generation, large context
 *   - OpenAI:     Best reasoning, function calling, nuanced analysis
 *   - Anthropic:  Best for careful, nuanced, safety-aware responses
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type AIProvider = 'groq' | 'together' | 'openai' | 'anthropic';

export type TaskType =
  | 'quick-analysis'    // Short analytical response — Groq preferred
  | 'long-generation'   // Reports, case studies — needs high max_tokens
  | 'deep-reasoning'    // Complex multi-step reasoning — OpenAI/Anthropic
  | 'research'          // External research synthesis — any provider
  | 'consensus'         // Multi-agent debate — spread across providers
  | 'general';          // Default — use whatever has capacity

interface ProviderConfig {
  name: AIProvider;
  apiUrl: string;
  getKey: () => string;
  model: string;
  maxOutputTokens: number;
  requestsPerMinute: number;
  tokensPerMinute: number;
  strengths: TaskType[];
  costWeight: number; // 1-10, lower = cheaper
}

interface UsageWindow {
  requests: number;
  tokens: number;
  windowStart: number;
}

interface ProviderHealth {
  consecutiveFailures: number;
  lastFailure: number;
  backoffUntil: number;
}

const WINDOW_MS = 60_000; // 1 minute sliding window

// ─── Provider Registry ───────────────────────────────────────────────────────

function getProviderConfigs(): ProviderConfig[] {
  const configs: ProviderConfig[] = [];

  const groqKey = String(process.env.GROQ_API_KEY || '').trim();
  if (groqKey && groqKey.length > 20 && !groqKey.toLowerCase().includes('your-')) {
    configs.push({
      name: 'groq',
      apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
      getKey: () => groqKey,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      maxOutputTokens: 8192,
      requestsPerMinute: 30,
      tokensPerMinute: 6000,
      strengths: ['quick-analysis', 'general', 'research'],
      costWeight: 1,
    });
  }

  const togetherKey = String(process.env.TOGETHER_API_KEY || '').trim();
  if (togetherKey && togetherKey.length > 20 && !togetherKey.toLowerCase().includes('your-')) {
    configs.push({
      name: 'together',
      apiUrl: 'https://api.together.xyz/v1/chat/completions',
      getKey: () => togetherKey,
      model: process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
      maxOutputTokens: 8192,
      requestsPerMinute: 60,
      tokensPerMinute: 100000,
      strengths: ['long-generation', 'general', 'research', 'consensus'],
      costWeight: 2,
    });
  }

  const openaiKey = String(process.env.OPENAI_API_KEY || '').trim();
  if (openaiKey && openaiKey.length > 20 && !openaiKey.toLowerCase().includes('your-')) {
    configs.push({
      name: 'openai',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      getKey: () => openaiKey,
      model: 'gpt-4o-mini',
      maxOutputTokens: 16384,
      requestsPerMinute: 500,
      tokensPerMinute: 200000,
      strengths: ['deep-reasoning', 'long-generation', 'consensus', 'general'],
      costWeight: 5,
    });
  }

  const anthropicKey = String(process.env.ANTHROPIC_API_KEY || '').trim();
  if (anthropicKey && anthropicKey.length > 20 && !anthropicKey.toLowerCase().includes('your-')) {
    configs.push({
      name: 'anthropic',
      apiUrl: 'https://api.anthropic.com/v1/messages',
      getKey: () => anthropicKey,
      model: 'claude-sonnet-4-20250514',
      maxOutputTokens: 8192,
      requestsPerMinute: 50,
      tokensPerMinute: 100000,
      strengths: ['deep-reasoning', 'long-generation', 'general'],
      costWeight: 6,
    });
  }

  return configs;
}

// ─── Usage Tracking ──────────────────────────────────────────────────────────

const usageWindows = new Map<AIProvider, UsageWindow>();
const providerHealth = new Map<AIProvider, ProviderHealth>();

function getUsage(provider: AIProvider): UsageWindow {
  const now = Date.now();
  let w = usageWindows.get(provider);
  if (!w || (now - w.windowStart) > WINDOW_MS) {
    w = { requests: 0, tokens: 0, windowStart: now };
    usageWindows.set(provider, w);
  }
  return w;
}

function recordUsage(provider: AIProvider, tokensUsed: number): void {
  const w = getUsage(provider);
  w.requests++;
  w.tokens += tokensUsed;
}

function recordFailure(provider: AIProvider): void {
  const h = providerHealth.get(provider) || { consecutiveFailures: 0, lastFailure: 0, backoffUntil: 0 };
  h.consecutiveFailures++;
  h.lastFailure = Date.now();
  // Exponential backoff: 5s, 15s, 45s, 120s max
  const backoffMs = Math.min(5000 * Math.pow(3, h.consecutiveFailures - 1), 120000);
  h.backoffUntil = Date.now() + backoffMs;
  providerHealth.set(provider, h);
}

function recordSuccess(provider: AIProvider): void {
  providerHealth.set(provider, { consecutiveFailures: 0, lastFailure: 0, backoffUntil: 0 });
}

function isHealthy(provider: AIProvider): boolean {
  const h = providerHealth.get(provider);
  if (!h) return true;
  return Date.now() >= h.backoffUntil;
}

// ─── Provider Selection ──────────────────────────────────────────────────────

function selectProvider(taskType: TaskType, excludeProviders: AIProvider[] = []): ProviderConfig | null {
  const configs = getProviderConfigs();
  if (!configs.length) return null;

  const candidates = configs.filter(c => {
    if (excludeProviders.includes(c.name)) return false;
    if (!isHealthy(c.name)) return false;

    // Check rate limit headroom
    const usage = getUsage(c.name);
    if (usage.requests >= c.requestsPerMinute * 0.85) return false;
    if (usage.tokens >= c.tokensPerMinute * 0.80) return false;

    return true;
  });

  if (!candidates.length) {
    // Fallback: use any provider that isn't excluded, ignoring rate limits
    const fallbacks = configs.filter(c => !excludeProviders.includes(c.name));
    return fallbacks[0] || null;
  }

  // Score candidates: strength match + headroom + cost
  const scored = candidates.map(c => {
    let score = 0;

    // Strength match: +40 if this provider is strong at the task
    if (c.strengths.includes(taskType)) score += 40;

    // Rate limit headroom: +30 max based on remaining capacity
    const usage = getUsage(c.name);
    const requestHeadroom = 1 - (usage.requests / c.requestsPerMinute);
    const tokenHeadroom = 1 - (usage.tokens / c.tokensPerMinute);
    score += Math.min(requestHeadroom, tokenHeadroom) * 30;

    // Cost efficiency: +20 max for cheaper providers
    score += (10 - c.costWeight) * 2;

    // Health bonus: +10 for no recent failures
    const h = providerHealth.get(c.name);
    if (!h || h.consecutiveFailures === 0) score += 10;

    return { config: c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.config || null;
}

// ─── API Call Execution ──────────────────────────────────────────────────────

interface AICallOptions {
  messages: Array<{ role: string; content: string }>;
  taskType?: TaskType;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface AICallResult {
  text: string;
  provider: AIProvider;
  tokensUsed: number;
  latencyMs: number;
}

async function callProvider(config: ProviderConfig, options: AICallOptions): Promise<AICallResult> {
  const start = Date.now();
  const maxTokens = options.maxTokens || config.maxOutputTokens;
  const temperature = options.temperature ?? 0.4;

  if (config.name === 'anthropic') {
    // Anthropic has a different API format
    const systemContent = options.messages.find(m => m.role === 'system')?.content || options.systemPrompt || '';
    const nonSystemMessages = options.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' as const : 'user' as const, content: m.content }));

    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': config.getKey(),
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: maxTokens,
        temperature,
        system: systemContent,
        messages: nonSystemMessages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = (data.content?.[0]?.text || '').trim();
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    return { text, provider: 'anthropic', tokensUsed, latencyMs: Date.now() - start };
  }

  // OpenAI-compatible format (Groq, Together, OpenAI)
  const body: Record<string, unknown> = {
    model: config.model,
    messages: options.messages,
    max_tokens: maxTokens,
    temperature,
  };

  const res = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${config.name} ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content || '').trim();
  const tokensUsed = (data.usage?.total_tokens || 0);
  return { text, provider: config.name, tokensUsed, latencyMs: Date.now() - start };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Intelligently call the best available AI provider for a given task.
 * Automatically retries with fallback providers on failure.
 * Tracks usage to spread load across providers and avoid rate limits.
 */
export async function callAI(options: AICallOptions): Promise<AICallResult> {
  const taskType = options.taskType || 'general';
  const excludeProviders: AIProvider[] = [];
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const provider = selectProvider(taskType, excludeProviders);
    if (!provider) {
      throw new Error('No AI providers available. Configure at least one of: GROQ_API_KEY, TOGETHER_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY');
    }

    try {
      const result = await callProvider(provider, options);
      if (!result.text) {
        throw new Error('Empty response from provider');
      }
      recordUsage(provider.name, result.tokensUsed);
      recordSuccess(provider.name);
      console.log(`[AIOrchestrator] ${provider.name} succeeded (${result.latencyMs}ms, ${result.tokensUsed} tokens, task: ${taskType})`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[AIOrchestrator] ${provider.name} failed (attempt ${attempt + 1}): ${msg}`);
      recordFailure(provider.name);
      excludeProviders.push(provider.name);
    }
  }

  throw new Error(`All AI providers failed after ${maxRetries} attempts for task: ${taskType}`);
}

/**
 * Run multiple AI calls in parallel across different providers.
 * Distributes calls to avoid hitting a single provider's rate limit.
 * Returns results from all successful calls.
 */
export async function callAIParallel(
  calls: Array<AICallOptions & { id: string }>
): Promise<Map<string, AICallResult>> {
  const results = new Map<string, AICallResult>();

  // Assign each call to a provider, round-robin with load balancing
  const assignments: Array<{ id: string; options: AICallOptions; provider: ProviderConfig }> = [];
  const usedProviders = new Map<AIProvider, number>();

  for (const call of calls) {
    const taskType = call.taskType || 'general';
    // Prefer providers that haven't been used yet in this batch
    const excludeOverloaded = [...usedProviders.entries()]
      .filter(([_, count]) => count >= 2)
      .map(([p]) => p);

    const provider = selectProvider(taskType, excludeOverloaded);
    if (provider) {
      assignments.push({ id: call.id, options: call, provider });
      usedProviders.set(provider.name, (usedProviders.get(provider.name) || 0) + 1);
    }
  }

  // Execute all in parallel
  const settled = await Promise.allSettled(
    assignments.map(async ({ id, options, provider }) => {
      try {
        const result = await callProvider(provider, options);
        recordUsage(provider.name, result.tokensUsed);
        recordSuccess(provider.name);
        return { id, result };
      } catch (err) {
        recordFailure(provider.name);
        // Retry with a different provider
        const fallback = selectProvider(options.taskType || 'general', [provider.name]);
        if (fallback) {
          const result = await callProvider(fallback, options);
          recordUsage(fallback.name, result.tokensUsed);
          recordSuccess(fallback.name);
          return { id, result };
        }
        throw err;
      }
    })
  );

  for (const s of settled) {
    if (s.status === 'fulfilled') {
      results.set(s.value.id, s.value.result);
    }
  }

  return results;
}

/**
 * Get status of all available providers with current usage and health.
 */
export function getProviderStatus(): Array<{
  name: AIProvider;
  available: boolean;
  healthy: boolean;
  requestsUsed: number;
  requestsLimit: number;
  tokensUsed: number;
  tokensLimit: number;
}> {
  return getProviderConfigs().map(c => {
    const usage = getUsage(c.name);
    return {
      name: c.name,
      available: true,
      healthy: isHealthy(c.name),
      requestsUsed: usage.requests,
      requestsLimit: c.requestsPerMinute,
      tokensUsed: usage.tokens,
      tokensLimit: c.tokensPerMinute,
    };
  });
}

/**
 * How many providers are currently configured and available?
 */
export function availableProviderCount(): number {
  return getProviderConfigs().length;
}
