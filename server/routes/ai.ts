import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { AdaptiveControlLearning } from '../services/AdaptiveControlLearning.js';
import {
  deriveControlDecision,
  type ControlProvider,
  type RequestEnvelope,
} from '../../shared/cognitiveControl.js';
import {
  shouldRequireOutputClarification,
  buildOutputClarificationResponse
} from './consultantBehavior.js';
import { deriveConsultantCapabilityProfile } from './consultantCapabilities.js';
import {
  buildAugmentedAISnapshot,
  getAugmentedAITools,
  getRecommendedAugmentedToolsForMode
} from './augmentedAISupport.js';
import { buildOverlookedIntelligenceSnapshot } from './overlookedFirstEngine.js';
import { runStrategicIntelligencePipeline } from './strategicIntelligencePipeline.js';
import { buildBrainCoverageReport } from './brainCoverageAudit.js';
import { buildPerceptionDeltaIndex } from '../services/PerceptionDeltaIndex.js';
import { runFiveEngineTribunal } from '../services/FiveEngineTribunal.js';
import { BrainIntegrationService, type BrainContext } from '../../services/BrainIntegrationService.js';
import { NSILIntelligenceHub } from '../../services/NSILIntelligenceHub.js';
import { toolRegistry } from '../../services/algorithms/ToolRegistry.js';
import { satSolver } from '../../services/algorithms/SATContradictionSolver.js';
import { bayesianDebateEngine } from '../../services/algorithms/BayesianDebateEngine.js';
import { dagScheduler } from '../../services/algorithms/DAGScheduler.js';
import { globalVectorIndex } from '../../services/algorithms/VectorMemoryIndex.js';
import { validateBody, aiValidation } from '../middleware/validate.js';
import { callAI, getProviderStatus, availableProviderCount, type TaskType } from '../../services/AIProviderOrchestrator.js';
import { getDomainSystemInstruction, getDomainConsultantInstruction, type DomainMode } from '../../services/DomainModeService.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONSULTANT_AUDIT_FILE = path.join(DATA_DIR, 'consultant-audit.jsonl');
const CONSULTANT_REPLAY_FILE = path.join(DATA_DIR, 'consultant-replay.jsonl');

// ─── Together.ai config ────────────────────────────────────────────────────────
const TOGETHER_API_URL  = 'https://api.together.xyz/v1/chat/completions';
const TOGETHER_MODEL_ID = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.1-70B-Instruct-Turbo';
const getTogetherKey    = () => String(process.env.TOGETHER_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');

// ─── Groq config ───────────────────────────────────────────────────────────────
const GROQ_API_URL  = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL_ID = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const getGroqKey    = () => String(process.env.GROQ_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
const getAnthropicKey = () => String(process.env.ANTHROPIC_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');

// ─── Google AI (Gemma) config ──────────────────────────────────────────────────
const GEMMA_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMMA_MODEL_ID = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
const getGoogleAIKey = () => String(process.env.GOOGLE_AI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
type AIMessageRole = 'system' | 'user' | 'assistant';
interface AIMessage {
  role: AIMessageRole;
  content: string;
}

// ─── Unified AI helper: Bedrock → OpenAI → Together ──
const getOpenAIKey = () => String(process.env.OPENAI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');

const _isAIAvailable = (): boolean => {
  // Bedrock removed
  if (getOpenAIKey()) return true;
  if (getAnthropicKey()) return true;
  if (getGroqKey()) return true;
  if (getTogetherKey()) return true;
  return false;
};

const generateWithAI = async (input: string | AIMessage[], systemInstruction?: string, taskType?: TaskType): Promise<string> => {
  const messages: AIMessage[] = typeof input === 'string'
    ? [{ role: 'user', content: input }]
    : input
        .filter((msg): msg is AIMessage =>
          Boolean(msg) &&
          typeof msg.content === 'string' &&
          (msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant')
        );

  const fullMessages: AIMessage[] = systemInstruction
    ? [{ role: 'system', content: systemInstruction }, ...messages]
    : messages;

  // Use the intelligent multi-provider orchestrator
  const result = await callAI({
    messages: fullMessages,
    taskType: taskType || 'general',
    maxTokens: 8192,
    temperature: 0.4,
  });

  return result.text;
};
// System instruction for the AI — domain-switchable
// Legacy default kept for backward compatibility; active instruction resolved via domainMode.
const SYSTEM_INSTRUCTION_DEFAULT = `
You are "ADVERSIQ Intelligence AI" (NEXUS_OS_v4.1), the world's premier Adversarial Intelligence Quorum.
You are NOT a standard chatbot. You are a deterministic economic modeling engine.

YOUR CORE FUNCTIONS:
1. SPI™ Engine (Strategic Partnership Index): Calculate compatibility vectors.
2. IVAS™ Engine (Investment Viability Assessment): Stress-test risk scenarios using Monte Carlo simulation.
3. SCF™ Engine (Strategic Cash Flow): Model long-term economic impact with probabilistic ranges.
4. RROI™ Engine: Calculate regional return on investment with 12-component scoring.
5. SEAM™ Engine: Symbiotic Ecosystem Assessment for partner matching.

DATA SOURCES:
- World Bank Open Data API (GDP, population, FDI, trade balance)
- Exchange Rate APIs (live currency rates)
- REST Countries API (demographics, borders, languages)

AI ANALYSIS MODULES (6 Specialized):
1. Historical Pattern Analysis
2. Government Policy Intelligence
3. Banking & Finance Assessment
4. Corporate Strategy Analysis
5. Market Dynamics Evaluation
6. Risk Assessment

TONE & STYLE:
- Precise, mathematical, and authoritative.
- Use terminal-like formatting where appropriate (e.g., "CALCULATING...", "VECTOR ANALYSIS COMPLETE").
- Do not offer vague opinions. Offer calculated probabilities and "Viability Scores".
- Reference specific data sources when providing market intelligence.

CONTEXT:
- You represent ADVERSIQ Intelligence.
- You operate to close the "100-Year Confidence Gap".
- Your output should feel like a high-level intelligence dossier backed by real data.
`;
const SYSTEM_INSTRUCTION = SYSTEM_INSTRUCTION_DEFAULT;

/** Resolve the system instruction for a given domain mode */
const _getSystemInstructionForDomain = (domainMode?: DomainMode): string => {
  if (!domainMode || domainMode === 'regional-development') return SYSTEM_INSTRUCTION_DEFAULT;
  return getDomainSystemInstruction(domainMode);
};

const CONSULTANT_SYSTEM_INSTRUCTION_DEFAULT = `
You are ADVERSIQ Consultant AI for Nexus Intelligence OS v7.0.

Operating mode:
- Be direct, practical, and client-facing.
- First answer the user's explicit request.
- Then identify the single highest-value missing detail.
- Ask at most one follow-up question unless user asks for more.

Conversation behavior (ChatGPT/Gemini-style helpfulness):
- Default to natural conversation, not rigid forms.
- Do not force template intake unless the user explicitly asks for report/letter/case-pack structuring.
- Offer help in multiple useful modes when relevant: concise answer, step-by-step plan, pros/cons, example draft, plain-language explanation, and quick summary.
- Adapt tone to user style while staying professional.

Case-study and document-development capabilities:
- Analyze written user input to extract case signals (who, where, objective, decision, deadline, audience, constraints, evidence).
- Develop case studies from partial inputs by clearly labeling assumptions and closing the highest-value gaps.
- Support document development end-to-end: structure, drafting guidance, section content, and finalization checkpoints.
- Provide gap-filling guidance that improves readiness without forcing rigid intake forms.

Response quality rules:
- Keep recommendations actionable and specific.
- Avoid vague claims.
- If context is incomplete, state assumptions briefly.
- Preserve professional tone suitable for executive and government stakeholders.
`;
const CONSULTANT_SYSTEM_INSTRUCTION = CONSULTANT_SYSTEM_INSTRUCTION_DEFAULT;

/** Resolve the consultant system instruction for a given domain mode */
const getConsultantInstructionForDomain = (domainMode?: DomainMode): string => {
  if (!domainMode || domainMode === 'regional-development') return CONSULTANT_SYSTEM_INSTRUCTION_DEFAULT;
  return getDomainConsultantInstruction(domainMode);
};

type ConsultantIntent =
  | 'report_build'
  | 'information_lookup'
  | 'strategy_advice'
  | 'risk_assessment'
  | 'financial_analysis'
  | 'legal_analysis'
  | 'product_analysis'
  | 'policy_analysis'
  | 'clarification'
  | 'general';

const detectConsultantIntent = (message: string): ConsultantIntent => {
  const text = message.toLowerCase();

  if (/\breport\b|\bbrief\b|\bsubmission\b|\bdocument\b|\bdraft\b|\bsummary\b/.test(text)) {
    return 'report_build';
  }
  if (/\bfind\b|\bsearch\b|\bsource\b|\bevidence\b|\bcitation\b|\bdata\b/.test(text)) {
    return 'information_lookup';
  }
  if (/\bvaluation\b|\bdcf\b|\birr\b|\bnpv\b|\bportfolio\b|\blbo\b|\bwacc\b|\bfinancial model\b|\bbalance sheet\b/.test(text)) {
    return 'financial_analysis';
  }
  if (/\blegal\b|\bjurisdiction\b|\bcourt\b|\blitigation\b|\bcontract\b|\bclause\b|\bprecedent\b|\bstatute\b/.test(text)) {
    return 'legal_analysis';
  }
  if (/\bproduct[\s-]market fit\b|\bgo[\s-]to[\s-]market\b|\bpricing\b|\buser segment\b|\bfeature\b|\blaunch\b|\bsaas\b|\bchurn\b|\bretention\b/.test(text)) {
    return 'product_analysis';
  }
  if (/\bpolicy\b|\bgovernance\b|\binstitutional\b|\breform\b|\bstakeholder.*map\b|\bconstituency\b|\blegislat\b/.test(text)) {
    return 'policy_analysis';
  }
  if (/\brisk\b|\bthreat\b|\bcompliance\b|\bregulator\b|\baudit\b/.test(text)) {
    return 'risk_assessment';
  }
  if (/\bstrategy\b|\bplan\b|\bapproach\b|\brecommend\b|\bnext step\b/.test(text)) {
    return 'strategy_advice';
  }
  if (/\bwhat do you mean\b|\bclarify\b|\bconfused\b|\bnot sure\b|\bexplain\b/.test(text)) {
    return 'clarification';
  }

  return 'general';
};

const buildIntentDirective = (intent: ConsultantIntent): string => {
  switch (intent) {
    case 'report_build':
      return 'Focus on building report-ready structure: key points, evidence gaps, and immediate next inputs required.';
    case 'information_lookup':
      return 'Focus on extracting, organizing, and validating relevant information before conclusions.';
    case 'risk_assessment':
      return 'Focus on risk exposure, controls, assumptions, and mitigation sequence.';
    case 'strategy_advice':
      return 'Focus on decision options, trade-offs, and a recommended path with rationale.';
    case 'financial_analysis':
      return 'Focus on quantitative financial analysis: valuation, cash flow modelling, risk-return metrics, and scenario outputs.';
    case 'legal_analysis':
      return 'Focus on structured legal analysis: elements, jurisdictional considerations, precedent patterns, and compliance gaps.';
    case 'product_analysis':
      return 'Focus on product-market dynamics: fit scoring, competitive positioning, pricing elasticity, and go-to-market options.';
    case 'policy_analysis':
      return 'Focus on policy impact assessment: stakeholder mapping, institutional readiness, implementation feasibility, and distributional effects.';
    case 'clarification':
      return 'Use plain language to clarify user intent and ask one concise clarifying question if needed.';
    default:
      return 'Provide a concise, actionable response and ask one useful follow-up only if it improves outcomes.';
  }
};

type ConsultantProvider = ControlProvider;

interface ConsultantProviderAttempt {
  provider: ConsultantProvider;
  ok: boolean;
  detail?: string;
}

type ConsultantTaskType =
  | 'report_build'
  | 'info_lookup'
  | 'risk_review'
  | 'strategy_support'
  | 'general_assist';

const CONSULTANT_ALLOWED_TASK_TYPES = new Set<ConsultantTaskType>([
  'report_build',
  'info_lookup',
  'risk_review',
  'strategy_support',
  'general_assist'
]);

const CONSULTANT_MAX_MESSAGE_CHARS = 6000;
const CONSULTANT_MAX_CONTEXT_CHARS = 14000;
const CONSULTANT_MAX_RESPONSE_CHARS = 7000;
const CONSULTANT_PROVIDER_TIMEOUT_MS = Number(process.env.CONSULTANT_PROVIDER_TIMEOUT_MS || 20000);
const CONSULTANT_AUDIT_REDACTION_ENABLED = process.env.CONSULTANT_AUDIT_REDACTION_ENABLED !== 'false';
const CONSULTANT_AUDIT_EXPORT_MAX = 5000;
const CONSULTANT_REPLAY_STORE_PAYLOAD = process.env.CONSULTANT_REPLAY_STORE_PAYLOAD !== 'false';

interface ConsultantReplayPayload {
  message: string;
  context: unknown;
  systemPrompt?: string;
  modelOrder: ConsultantProvider[];
  taskType: ConsultantTaskType;
}

interface ConsultantReplayRecord {
  requestId: string;
  createdAt: string;
  replayHash: string;
  hasPayload: boolean;
  payload?: ConsultantReplayPayload;
  sourceRequestId?: string;
}

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};



interface RuntimeProviderAvailability {
  openai: boolean;
  anthropic: boolean;
  groq: boolean;
  together: boolean;
  gemma: boolean;
  bedrockConfigured: boolean;
  bedrockCredentialDetail: string;
}

const getRuntimeProviderAvailability = async (): Promise<RuntimeProviderAvailability> => {
  const openai = Boolean(getOpenAIKey());
  const anthropic = Boolean(getAnthropicKey());
  const groq = Boolean(getGroqKey());
  const together = Boolean(getTogetherKey());
  const gemma = Boolean(getGoogleAIKey());
  return {
    openai,
    anthropic,
    groq,
    together,
    gemma,
    bedrockConfigured: false,
    bedrockCredentialDetail: 'Bedrock removed',
  };
};

const sanitizeConsultantMessage = (message: string): string => {
  const normalized = message.split('\0').join('').trim();
  if (normalized.length > CONSULTANT_MAX_MESSAGE_CHARS) {
    return normalized.slice(0, CONSULTANT_MAX_MESSAGE_CHARS);
  }
  return normalized;
};

const sanitizeConsultantContext = (context: unknown): { context: unknown; truncated: boolean } => {
  if (context === undefined || context === null) {
    return { context: null, truncated: false };
  }

  try {
    const serialized = JSON.stringify(context);
    if (!serialized) {
      return { context: null, truncated: false };
    }

    if (serialized.length <= CONSULTANT_MAX_CONTEXT_CHARS) {
      return { context, truncated: false };
    }

    return {
      context: {
        truncated: true,
        preview: serialized.slice(0, CONSULTANT_MAX_CONTEXT_CHARS)
      },
      truncated: true
    };
  } catch {
    return { context: null, truncated: false };
  }
};

const normalizeConsultantOutput = (rawText: string): string => {
  const text = rawText.trim().slice(0, CONSULTANT_MAX_RESPONSE_CHARS);
  if (!text) {
    return 'I can assist with your report and next actions. Share the exact objective, jurisdiction, and decision deadline, and I will proceed.';
  }

  return text;
};

const redactText = (value: string): string => {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/\b(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}\b/g, '[REDACTED_PHONE]')
    .replace(/\b(?:sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|AIza[A-Za-z0-9_-]{20,})\b/g, '[REDACTED_TOKEN]');
};

const redactAuditValue = (value: unknown): unknown => {
  if (!CONSULTANT_AUDIT_REDACTION_ENABLED) {
    return value;
  }

  if (typeof value === 'string') {
    return redactText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactAuditValue(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (/message|prompt|context|content|query|input|output|details|error/i.test(key)) {
        result[key] = typeof nestedValue === 'string' ? redactText(nestedValue) : redactAuditValue(nestedValue);
      } else {
        result[key] = redactAuditValue(nestedValue);
      }
    }
    return result;
  }

  return value;
};

const redactAuditEvent = (event: Record<string, unknown>): Record<string, unknown> => {
  const redacted = redactAuditValue(event) as Record<string, unknown>;
  if (CONSULTANT_AUDIT_REDACTION_ENABLED) {
    redacted.redactionApplied = true;
  }
  return redacted;
};

const ensureConsultantAuditDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // no-op
  }
};

const buildReplayHash = (payload: ConsultantReplayPayload): string => {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};

const persistConsultantReplayRecord = async (record: ConsultantReplayRecord) => {
  await ensureConsultantAuditDataDir();
  await fs.appendFile(CONSULTANT_REPLAY_FILE, `${JSON.stringify(record)}\n`, 'utf8');
};

const readConsultantReplayRecord = async (requestId: string): Promise<ConsultantReplayRecord | null> => {
  try {
    await ensureConsultantAuditDataDir();
    const raw = await fs.readFile(CONSULTANT_REPLAY_FILE, 'utf8');
    const rows = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as ConsultantReplayRecord;
        } catch {
          return null;
        }
      })
      .filter((row): row is ConsultantReplayRecord => Boolean(row));

    for (let i = rows.length - 1; i >= 0; i -= 1) {
      if (rows[i].requestId === requestId) {
        return rows[i];
      }
    }
    return null;
  } catch {
    return null;
  }
};

const persistConsultantAuditEvent = async (event: Record<string, unknown>) => {
  await ensureConsultantAuditDataDir();
  const eventToPersist = redactAuditEvent(event);
  await fs.appendFile(CONSULTANT_AUDIT_FILE, `${JSON.stringify(eventToPersist)}\n`, 'utf8');
};

const readConsultantAuditEvents = async (limit = 100, windowHours?: number): Promise<Record<string, unknown>[]> => {
  try {
    await ensureConsultantAuditDataDir();
    const raw = await fs.readFile(CONSULTANT_AUDIT_FILE, 'utf8');
    const rows = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((row): row is Record<string, unknown> => Boolean(row));

    let filteredRows = rows;
    if (typeof windowHours === 'number' && Number.isFinite(windowHours) && windowHours > 0) {
      const cutoffMs = Date.now() - Math.floor(windowHours * 60 * 60 * 1000);
      filteredRows = rows.filter((row) => {
        const timestamp = typeof row.timestamp === 'string' ? Date.parse(row.timestamp) : NaN;
        return Number.isFinite(timestamp) && timestamp >= cutoffMs;
      });
    }

    return filteredRows.slice(-Math.max(1, Math.min(limit, 1000))).reverse();
  } catch {
    return [];
  }
};

const readAllConsultantAuditEvents = async (): Promise<Record<string, unknown>[]> => {
  try {
    await ensureConsultantAuditDataDir();
    const raw = await fs.readFile(CONSULTANT_AUDIT_FILE, 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((row): row is Record<string, unknown> => Boolean(row));
  } catch {
    return [];
  }
};

const countAuditMetric = (events: Record<string, unknown>[], eventName: string): number => (
  events.filter((event) => event.event === eventName).length
);

interface ReplayMetricCounts {
  replaySuccess: number;
  replayFallback: number;
  replayError: number;
}

interface AdvancedRuntimeMetricCounts {
  tribunal: {
    verdicts: {
      proceed: number;
      proceedWithControls: number;
      hold: number;
    };
    gates: {
      green: number;
      amber: number;
      red: number;
    };
    contradictionAverage: number;
  };
  perceptionDelta: {
    averageIndex: number;
    averageConfidence: number;
    underestimationRate: number;
    overestimationRate: number;
    alignmentRate: number;
  };
}

const asFiniteNumber = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const getAdvancedRuntimeMetrics = (events: Record<string, unknown>[]): AdvancedRuntimeMetricCounts => {
  const consultantRequests = events.filter((event) => event.event === 'consultant_request');

  let proceed = 0;
  let proceedWithControls = 0;
  let hold = 0;
  let gateGreen = 0;
  let gateAmber = 0;
  let gateRed = 0;
  let contradictionTotal = 0;
  let contradictionSamples = 0;

  let deltaIndexTotal = 0;
  let deltaIndexSamples = 0;
  let deltaConfidenceTotal = 0;
  let deltaConfidenceSamples = 0;
  let underestimation = 0;
  let overestimation = 0;
  let aligned = 0;

  for (const event of consultantRequests) {
    const verdict = String(event.tribunalVerdict || '').toLowerCase();
    if (verdict === 'proceed') proceed += 1;
    if (verdict === 'proceed_with_controls') proceedWithControls += 1;
    if (verdict === 'hold') hold += 1;

    const gate = String(event.tribunalGate || '').toLowerCase();
    if (gate === 'green') gateGreen += 1;
    if (gate === 'amber') gateAmber += 1;
    if (gate === 'red') gateRed += 1;

    const contradictionCount = asFiniteNumber(event.tribunalContradictionCount);
    if (contradictionCount !== null) {
      contradictionTotal += contradictionCount;
      contradictionSamples += 1;
    }

    const deltaIndex = asFiniteNumber(event.perceptionDeltaIndex);
    if (deltaIndex !== null) {
      deltaIndexTotal += deltaIndex;
      deltaIndexSamples += 1;
      if (deltaIndex >= 6) {
        underestimation += 1;
      } else if (deltaIndex <= -6) {
        overestimation += 1;
      } else {
        aligned += 1;
      }
    }

    const deltaConfidence = asFiniteNumber(event.perceptionDeltaConfidence);
    if (deltaConfidence !== null) {
      deltaConfidenceTotal += deltaConfidence;
      deltaConfidenceSamples += 1;
    }
  }

  const driftTotal = Math.max(1, underestimation + overestimation + aligned);

  return {
    tribunal: {
      verdicts: {
        proceed,
        proceedWithControls,
        hold,
      },
      gates: {
        green: gateGreen,
        amber: gateAmber,
        red: gateRed,
      },
      contradictionAverage: contradictionSamples > 0 ? Number((contradictionTotal / contradictionSamples).toFixed(2)) : 0,
    },
    perceptionDelta: {
      averageIndex: deltaIndexSamples > 0 ? Number((deltaIndexTotal / deltaIndexSamples).toFixed(2)) : 0,
      averageConfidence: deltaConfidenceSamples > 0 ? Number((deltaConfidenceTotal / deltaConfidenceSamples).toFixed(2)) : 0,
      underestimationRate: Number(((underestimation / driftTotal) * 100).toFixed(1)),
      overestimationRate: Number(((overestimation / driftTotal) * 100).toFixed(1)),
      alignmentRate: Number(((aligned / driftTotal) * 100).toFixed(1)),
    },
  };
};

const normalizeConsultantProvider = (value: unknown): ConsultantProvider | null => {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'together' || normalized === 'openai' || normalized === 'groq') {
    return normalized;
  }
  return null;
};

const normalizeRequestEnvelope = (
  requestId: string,
  message: string,
  envelope: unknown,
  taskType: ConsultantTaskType,
  context: unknown
): RequestEnvelope => {
  const base: RequestEnvelope = {
    requestId,
    timestamp: new Date().toISOString(),
    messageChars: Math.max(0, message.length),
    readinessScore: 20,
    hasAttachments: false,
    sessionDepth: 1,
    taskType,
    retryCount: 0,
  };

  if (!envelope || typeof envelope !== 'object') {
    return base;
  }

  const candidate = envelope as Partial<RequestEnvelope>;
  const contextHasFiles = Boolean((context as Record<string, unknown> | null)?.uploadedFiles);

  return {
    requestId: typeof candidate.requestId === 'string' && candidate.requestId ? candidate.requestId : base.requestId,
    timestamp: typeof candidate.timestamp === 'string' && candidate.timestamp ? candidate.timestamp : base.timestamp,
    messageChars: Number.isFinite(Number(candidate.messageChars)) ? Number(candidate.messageChars) : base.messageChars,
    readinessScore: Number.isFinite(Number(candidate.readinessScore)) ? Number(candidate.readinessScore) : base.readinessScore,
    hasAttachments: typeof candidate.hasAttachments === 'boolean' ? candidate.hasAttachments : contextHasFiles,
    sessionDepth: Number.isFinite(Number(candidate.sessionDepth)) ? Number(candidate.sessionDepth) : base.sessionDepth,
    taskType: typeof candidate.taskType === 'string' && candidate.taskType ? candidate.taskType : base.taskType,
    retryCount: Number.isFinite(Number(candidate.retryCount)) ? Number(candidate.retryCount) : base.retryCount,
  };
};

const getReplayMetricCounts = (events: Record<string, unknown>[], provider?: ConsultantProvider): ReplayMetricCounts => {
  const scopedEvents = typeof provider === 'string'
    ? events.filter((event) => normalizeConsultantProvider(event.provider) === provider)
    : events;

  return {
    replaySuccess: countAuditMetric(scopedEvents, 'consultant_replay_request'),
    replayFallback: countAuditMetric(scopedEvents, 'consultant_replay_fallback'),
    replayError: countAuditMetric(scopedEvents, 'consultant_replay_error')
  };
};

const logConsultantAuditEvent = async (event: Record<string, unknown>) => {
  const redactedForConsole = redactAuditEvent(event);
  console.log('[ConsultantAudit]', JSON.stringify(redactedForConsole));
  try {
    await persistConsultantAuditEvent(event);
  } catch (error) {
    console.warn('[ConsultantAudit] Persist failed:', error instanceof Error ? error.message : 'Unknown error');
  }
};

const parseProviderOrder = (input: unknown): ConsultantProvider[] => {
  const defaultOrder: ConsultantProvider[] = ['openai', 'groq', 'together'];
  if (!Array.isArray(input)) return defaultOrder;

  const VALID_PROVIDERS = new Set<ConsultantProvider>(['openai', 'groq', 'together']);
  const normalized = input
    .map((value) => String(value).toLowerCase())
    .filter((value): value is ConsultantProvider => VALID_PROVIDERS.has(value as ConsultantProvider));

  return normalized.length > 0 ? Array.from(new Set(normalized)) : defaultOrder;
};

// ── Extract Partial<ReportParameters> from consultant context for Brain / NSIL ──
const extractReportParamsFromContext = (message: string, context?: unknown): Record<string, unknown> => {
  const params: Record<string, unknown> = {};
  if (context && typeof context === 'object') {
    const ctx = context as Record<string, unknown>;
    // Map known context fields to ReportParameters keys
    if (ctx.country) params.country = String(ctx.country);
    if (ctx.city) params.userCity = String(ctx.city);
    if (ctx.region) params.region = String(ctx.region);
    if (ctx.organization || ctx.org || ctx.organizationName) params.organizationName = String(ctx.organization || ctx.org || ctx.organizationName);
    if (ctx.industry) params.industry = Array.isArray(ctx.industry) ? ctx.industry : [String(ctx.industry)];
    if (ctx.sector) params.industry = [String(ctx.sector)];
    if (ctx.objectives) params.strategicObjectives = Array.isArray(ctx.objectives) ? ctx.objectives : [String(ctx.objectives)];
    if (ctx.problemStatement) params.problemStatement = String(ctx.problemStatement);
    if (ctx.investmentSize || ctx.totalInvestment) params.totalInvestment = String(ctx.investmentSize || ctx.totalInvestment);
    if (ctx.riskTolerance) params.riskTolerance = String(ctx.riskTolerance);
    if (ctx.targetPartner) params.targetPartner = String(ctx.targetPartner);
    if (ctx.tier) params.tier = Array.isArray(ctx.tier) ? ctx.tier : [String(ctx.tier)];
    // Spread any additional params the frontend may have passed
    if (ctx.reportParams && typeof ctx.reportParams === 'object') {
      Object.assign(params, ctx.reportParams);
    }
  }
  // Ensure there's at least something from the message for engines to work with
  if (!params.problemStatement && message) {
    params.problemStatement = message.substring(0, 500);
  }
  return params;
};

// ── Summarise NSIL IntelligenceReport for prompt injection ──
const summariseNSILReport = (report: Record<string, unknown>): string => {
  const parts: string[] = [];
  const rec = report.recommendation as Record<string, unknown> | undefined;
  if (rec) {
    parts.push(`**NSIL Verdict:** ${rec.action} (${rec.confidence}% confidence)`);
    if (rec.summary) parts.push(`**Summary:** ${String(rec.summary).substring(0, 400)}`);
    if (Array.isArray(rec.criticalActions) && rec.criticalActions.length) parts.push(`**Critical Actions:** ${(rec.criticalActions as string[]).slice(0, 5).join('; ')}`);
    if (Array.isArray(rec.keyRisks) && rec.keyRisks.length) parts.push(`**Key Risks:** ${(rec.keyRisks as string[]).slice(0, 5).join('; ')}`);
    if (Array.isArray(rec.keyOpportunities) && rec.keyOpportunities.length) parts.push(`**Key Opportunities:** ${(rec.keyOpportunities as string[]).slice(0, 5).join('; ')}`);
    if (rec.ethicalGate) parts.push(`**Ethical Gate:** ${JSON.stringify(rec.ethicalGate)}`);
  }
  const reflexive = report.reflexive as Record<string, unknown> | undefined;
  if (reflexive) {
    parts.push(`\n### ── REFLEXIVE INTELLIGENCE (Layer 9) ──`);
    for (const [engine, result] of Object.entries(reflexive)) {
      if (result && typeof result === 'object') {
        const r = result as Record<string, unknown>;
        const summary = r.summary || r.headline || r.topInsight || r.result || JSON.stringify(r).substring(0, 200);
        parts.push(`**${engine}:** ${String(summary).substring(0, 300)}`);
      }
    }
  }
  const autonomous = report.autonomous as Record<string, unknown> | undefined;
  if (autonomous) {
    parts.push(`\n### ── AUTONOMOUS INTELLIGENCE (Layer 6) ──`);
    for (const [engine, result] of Object.entries(autonomous)) {
      if (result && typeof result === 'object') {
        const r = result as Record<string, unknown>;
        const summary = r.summary || r.headline || r.topInsight || JSON.stringify(r).substring(0, 200);
        parts.push(`**${engine}:** ${String(summary).substring(0, 300)}`);
      }
    }
  }
  if (Array.isArray(report.applicableInsights) && report.applicableInsights.length) {
    parts.push(`\n**Learning Insights:** ${(report.applicableInsights as {insight?: string}[]).slice(0, 3).map(i => i.insight || JSON.stringify(i)).join('; ')}`);
  }
  parts.push(`**Components Run:** ${Array.isArray(report.componentsRun) ? (report.componentsRun as string[]).join(', ') : 'N/A'}`);
  return parts.join('\n');
};

// ============================================================================
// SMART CONTEXT WINDOW MANAGEMENT
// ============================================================================

/** Estimate token count — GPT-style BPE averages ~3.5 chars/token for English */
const estimateTokens = (text: string): number => Math.ceil(text.length / 3.5);

/** Truncate text intelligently: prefers sentence boundaries, keeps header + tail */
const smartTruncate = (text: string, maxTokens: number): string => {
  const maxChars = Math.floor(maxTokens * 3.5);
  if (text.length <= maxChars) return text;

  // Keep 80% from the beginning (most important) and 20% from the end (recent context)
  const headBudget = Math.floor(maxChars * 0.8);
  const tailBudget = maxChars - headBudget - 40; // 40 chars for separator

  let head = text.slice(0, headBudget);
  // Try to cut at sentence boundary
  const lastPeriod = head.lastIndexOf('. ');
  const lastNewline = head.lastIndexOf('\n');
  const cutPoint = Math.max(lastPeriod, lastNewline);
  if (cutPoint > headBudget * 0.7) {
    head = head.slice(0, cutPoint + 1);
  }

  const tail = tailBudget > 50 ? text.slice(-tailBudget) : '';
  return head + '\n... [context compressed] ...\n' + tail;
};

interface PromptSection {
  label: string;
  content: string;
  priority: number; // 1 = must keep full, 2 = important, 3 = nice to have
  minTokens: number; // minimum tokens to keep even when compressed
}

/**
 * Build prompt by allocating token budget proportionally by priority.
 * Priority 1 sections get full allocation first.
 * Remaining budget is split between priority 2 and 3.
 */
const buildWithTokenBudget = (sections: PromptSection[], maxTokens: number): string => {
  // Phase 1: Allocate full budget to priority 1 sections
  let usedTokens = 0;
  const allocated: { section: PromptSection; tokens: number }[] = [];

  const p1 = sections.filter(s => s.priority === 1);
  for (const s of p1) {
    const tokens = estimateTokens(s.content);
    usedTokens += tokens;
    allocated.push({ section: s, tokens });
  }

  // Phase 2: Split remaining budget between p2 and p3
  const remaining = maxTokens - usedTokens;
  const p2 = sections.filter(s => s.priority === 2);
  const p3 = sections.filter(s => s.priority === 3);

  // p2 gets 70% of remaining, p3 gets 30%
  const p2Budget = Math.floor(remaining * 0.7);
  const p3Budget = remaining - p2Budget;

  const allocateGroup = (group: PromptSection[], budget: number) => {
    if (group.length === 0) return;
    const totalNeeded = group.reduce((sum, s) => sum + estimateTokens(s.content), 0);
    const ratio = totalNeeded > budget ? budget / totalNeeded : 1;

    for (const s of group) {
      const needed = estimateTokens(s.content);
      const alloc = Math.max(Math.floor(needed * ratio), s.minTokens);
      allocated.push({ section: s, tokens: alloc });
    }
  };

  allocateGroup(p2, p2Budget);
  allocateGroup(p3, p3Budget);

  // Phase 3: Build final prompt with smart truncation
  const parts: string[] = [];
  for (const { section, tokens } of allocated) {
    const truncated = smartTruncate(section.content, tokens);
    if (truncated.trim()) {
      parts.push(section.label ? `${section.label}\n${truncated}` : truncated);
    }
  }

  return parts.join('\n\n');
};

const MAX_PROMPT_TOKENS = 16000; // Groq 128K context supports much more

const buildConsultantPrompt = (message: string, intent: ConsultantIntent, context?: unknown, systemPrompt?: string, brainPromptBlock?: string, nsilSummary?: string) => {
  const capProfile = deriveConsultantCapabilityProfile(message, context).brief;
  const overlooked = JSON.stringify(buildOverlookedIntelligenceSnapshot(message, context));
  const pipeline = JSON.stringify(runStrategicIntelligencePipeline(message, context));
  const ctxStr = context ? JSON.stringify(context) : 'No structured context provided.';

  const sections: PromptSection[] = [
    // Priority 1 — always keep full
    {
      label: '',
      content: `USER MESSAGE:\n${message}`,
      priority: 1,
      minTokens: 500,
    },
    {
      label: '',
      content: `INTENT: ${intent}\nINTENT DIRECTIVE: ${buildIntentDirective(intent)}`,
      priority: 1,
      minTokens: 100,
    },
    {
      label: '',
      content: `OUTPUT FORMAT:\n1) Direct response to user request (always first).\n2) Optional next step bullets (max 3) when helpful.\n3) One follow-up question only if it materially improves quality.\n4) Do not force output-format menus unless user explicitly asks for format selection.`,
      priority: 1,
      minTokens: 100,
    },
    // Priority 2 — important analytical context
    {
      label: '═══ BRAIN INTELLIGENCE ═══',
      content: brainPromptBlock || '',
      priority: 2,
      minTokens: 200,
    },
    {
      label: '═══ NSIL ANALYSIS ═══',
      content: nsilSummary || '',
      priority: 2,
      minTokens: 100,
    },
    {
      label: '',
      content: capProfile,
      priority: 2,
      minTokens: 100,
    },
    // Priority 3 — supplementary
    {
      label: 'OVERLOOKED-FIRST INTELLIGENCE (compact):',
      content: overlooked,
      priority: 3,
      minTokens: 50,
    },
    {
      label: 'STRATEGIC PIPELINE (compact):',
      content: pipeline,
      priority: 3,
      minTokens: 50,
    },
    {
      label: 'CONTEXT:',
      content: ctxStr,
      priority: 3,
      minTokens: 100,
    },
    {
      label: 'SYSTEM CASE PROMPT:',
      content: typeof systemPrompt === 'string' ? systemPrompt : 'N/A',
      priority: 3,
      minTokens: 50,
    },
  ];

  return buildWithTokenBudget(sections.filter(s => s.content.trim()), MAX_PROMPT_TOKENS);
};

const invokeConsultantWithTogether = async (prompt: string, consultantInstruction?: string): Promise<string> => {
  const key = getTogetherKey();
  if (!key) {
    throw new Error('Together.ai unavailable: TOGETHER_API_KEY missing');
  }

  const response = await fetch(TOGETHER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: TOGETHER_MODEL_ID,
      messages: [
        { role: 'system', content: consultantInstruction || CONSULTANT_SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1800,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`Together.ai request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = (data.choices?.[0]?.message?.content || '').trim();
  if (!text) {
    throw new Error('Together.ai returned empty response');
  }
  return text;
};

const invokeConsultantWithGroq = async (prompt: string, consultantInstruction?: string): Promise<string> => {
  const key = getGroqKey();
  if (!key) {
    throw new Error('Groq unavailable: GROQ_API_KEY missing');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL_ID,
      messages: [
        { role: 'system', content: consultantInstruction || CONSULTANT_SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt.slice(0, 8000) },
      ],
      max_tokens: 1800,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Groq request failed: ${response.status} ${errBody}`);
  }

  const data2 = await response.json();
  const text2 = (data2.choices?.[0]?.message?.content || '').trim();
  if (!text2) {
    throw new Error('Groq returned empty response');
  }
  return text2;
};



const invokeConsultantWithOpenAI = async (prompt: string, consultantInstruction?: string): Promise<string> => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI unavailable: OPENAI_API_KEY missing');
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), CONSULTANT_PROVIDER_TIMEOUT_MS);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: consultantInstruction || CONSULTANT_SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1800
    })
  });

  clearTimeout(timeoutHandle);

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim() || '';
  if (!text) {
    throw new Error('OpenAI returned empty response');
  }
  return text;
};

// ─── Gemma (Google AI) consultant invoker ──────────────────────────────────────
const invokeConsultantWithGemma = async (prompt: string, consultantInstruction?: string): Promise<string> => {
  const key = getGoogleAIKey();
  if (!key) {
    throw new Error('Gemma unavailable: GOOGLE_AI_API_KEY missing');
  }

  const systemText = consultantInstruction || CONSULTANT_SYSTEM_INSTRUCTION;
  const response = await fetch(
    `${GEMMA_API_BASE}/${GEMMA_MODEL_ID}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemText }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.4,
          topP: 0.9,
        },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Gemma request failed: ${response.status} ${errBody}`);
  }

  const gData = await response.json();
  const text = gData?.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join('') || '';
  if (!text) {
    throw new Error('Gemma returned empty response');
  }
  return text;
};

// ─── Local Intelligence Fallback ───────────────────────────────────────────────
// When ALL external providers fail, synthesize a response from the 44-engine
// Brain, NSIL pipeline, Five-Engine Tribunal, and strategic analysis that are
// already computed locally before the broker call. No API keys required.
const synthesizeLocalFallbackResponse = (
  userMessage: string,
  brainContext: BrainContext | null,
  nsilReport: Record<string, unknown> | null,
  tribunal: { verdict: string; releaseGate: string; contradictions: string[]; engines: { engine: string; score: number; finding: string; action: string }[] },
  strategicPipeline: { readinessScore: number; stages: { stage: string; detail: string; score?: number }[]; recommendedPath: { targetRegion: string; strategy: string; rationale: string[] } },
  overlookedIntelligence: { evidenceCredibility: number; perceptionRealityGap: number; topRegionalOpportunities: { place: string; score: number; reason: string[] }[] },
  perceptionDelta: { deltaIndex: number; confidence: number },
): string => {
  const lines: string[] = [];

  lines.push(`## Analysis Summary\n`);
  lines.push(`Based on autonomous analysis across 44 intelligence engines, here is the assessment for your query:\n`);

  // Strategic readiness
  const readiness = strategicPipeline.readinessScore;
  const readinessGrade = readiness >= 80 ? 'Strong' : readiness >= 60 ? 'Moderate' : readiness >= 40 ? 'Developing' : 'Early-stage';
  lines.push(`### Strategic Readiness: ${readinessGrade} (${readiness}/100)\n`);

  // Tribunal verdict
  lines.push(`### Five-Engine Tribunal Verdict: **${tribunal.verdict.toUpperCase()}**`);
  lines.push(`Release gate: ${tribunal.releaseGate}\n`);
  if (tribunal.engines?.length) {
    for (const eng of tribunal.engines.slice(0, 5)) {
      lines.push(`- **${eng.engine}** (score: ${eng.score}/100): ${eng.finding} → ${eng.action}`);
    }
    lines.push('');
  }

  // Pipeline stages
  const riskStages = strategicPipeline.stages.filter(s => (s.score ?? 100) < 50);
  if (riskStages.length > 0) {
    lines.push(`### Risk Flags`);
    for (const stage of riskStages.slice(0, 5)) {
      lines.push(`- ⚠️ ${stage.stage}: ${stage.detail} (score: ${stage.score ?? 'N/A'}/100)`);
    }
    lines.push('');
  }

  // Recommended path
  if (strategicPipeline.recommendedPath) {
    lines.push(`### Recommended Path`);
    lines.push(`**Strategy:** ${strategicPipeline.recommendedPath.strategy}`);
    lines.push(`**Target region:** ${strategicPipeline.recommendedPath.targetRegion}`);
    for (const rationale of strategicPipeline.recommendedPath.rationale.slice(0, 4)) {
      lines.push(`- ${rationale}`);
    }
    lines.push('');
  }

  // Overlooked intelligence / regional opportunities
  if (overlookedIntelligence.topRegionalOpportunities?.length > 0) {
    lines.push(`### Overlooked Intelligence`);
    lines.push(`Evidence credibility: ${overlookedIntelligence.evidenceCredibility}/100 | Perception-reality gap: ${overlookedIntelligence.perceptionRealityGap}/100\n`);
    for (const opp of overlookedIntelligence.topRegionalOpportunities.slice(0, 4)) {
      lines.push(`- **${opp.place}** (score: ${opp.score}) — ${opp.reason.join('; ')}`);
    }
    lines.push('');
  }

  // Brain intelligence highlights
  if (brainContext) {
    lines.push(`### Brain Intelligence (${brainContext.readiness || 'computed'})`);
    if (brainContext.compositeScore != null) {
      lines.push(`Composite score: ${brainContext.compositeScore}/100`);
    }
    if (brainContext.riskMatrix?.topRisks?.length) {
      lines.push(`\n**Top Risks:**`);
      for (const risk of brainContext.riskMatrix.topRisks.slice(0, 3)) {
        lines.push(`- ${risk.name} (${risk.severity}, score: ${risk.score}) — ${risk.mitigationStrategy}`);
      }
    }
    if (brainContext.financialAnalysis) {
      const fa = brainContext.financialAnalysis;
      lines.push(`\n**Financial Analysis:**`);
      lines.push(`- NPV: $${fa.npv?.npv?.toLocaleString() ?? 'N/A'} at ${((fa.npv?.discountRate ?? 0) * 100).toFixed(1)}% discount rate`);
      lines.push(`- IRR: ${fa.irr?.irrPercent?.toFixed(1) ?? 'N/A'}%`);
      lines.push(`- Payback period: ${fa.payback ?? 'N/A'}`);
    }
    lines.push('');
  }

  // NSIL report summary
  if (nsilReport) {
    const recommendation = nsilReport.recommendation as string | undefined;
    if (recommendation) {
      lines.push(`### NSIL Assessment`);
      lines.push(`${recommendation}\n`);
    }
  }

  // Perception delta
  lines.push(`### Confidence Metrics`);
  lines.push(`- Perception Delta Index: ${perceptionDelta.deltaIndex}/100 (confidence: ${perceptionDelta.confidence}%)`);
  lines.push(`- Evidence Credibility: ${overlookedIntelligence.evidenceCredibility}/100`);
  lines.push(`- Strategic Readiness: ${readiness}/100\n`);

  lines.push(`---`);
  lines.push(`*This analysis was generated entirely by the local intelligence engine suite (no external AI provider was used). For enhanced natural-language synthesis, configure at least one API key (GOOGLE_AI_API_KEY recommended — free at aistudio.google.com/apikey).*`);

  return lines.join('\n');
};

const runConsultantBroker = async (
  prompt: string,
  order: ConsultantProvider[],
  timeoutMs: number = CONSULTANT_PROVIDER_TIMEOUT_MS,
  providerAvailability?: Partial<Record<ConsultantProvider, boolean>>,
  consultantInstruction?: string
): Promise<{ text: string; provider: ConsultantProvider; attempts: ConsultantProviderAttempt[] }> => {
  const attempts: ConsultantProviderAttempt[] = [];

  for (const provider of order) {
    if (providerAvailability && providerAvailability[provider] === false) {
      attempts.push({ provider, ok: false, detail: `${provider} unavailable by runtime readiness` });
      continue;
    }

    try {
      const invoker =
        provider === 'groq'    ? invokeConsultantWithGroq(prompt, consultantInstruction)
        : provider === 'together' ? invokeConsultantWithTogether(prompt, consultantInstruction)
        : provider === 'gemma'    ? invokeConsultantWithGemma(prompt, consultantInstruction)
        :                          invokeConsultantWithOpenAI(prompt, consultantInstruction);
      const text = await withTimeout(
        invoker,
        timeoutMs,
        `${provider} provider`
      );

      attempts.push({ provider, ok: true });
      return { text, provider, attempts };
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown provider error';
      attempts.push({ provider, ok: false, detail });
    }
  }

  const details = attempts.map((attempt) => `${attempt.provider}: ${attempt.detail || 'failed'}`).join(' | ');
  throw new Error(`No consultant providers succeeded. ${details}`);
};

// Middleware to check API availability
const requireApiKey = (_req: Request, res: Response, next: () => void) => {
  // Clean environment - no API keys required for routing
  next();
};

// Generate copilot insights
router.post('/insights', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { organizationName, country, strategicIntent, specificOpportunity } = req.body;
    
    const prompt = `Analyze this partnership strategy and provide 3 key insights:
    Organization: ${organizationName}
    Country: ${country}
    Strategic Intent: ${strategicIntent}
    Opportunity: ${specificOpportunity || 'General analysis'}
    
    Return JSON array with objects containing: id, type (strategy/risk/opportunity), title, description.
    Only return valid JSON, no markdown.`;
    
    const text = await generateWithAI(prompt, SYSTEM_INSTRUCTION);
    
    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      return res.json(insights);
    }
    
    // Fallback structured response
    res.json([
      { id: '1', type: 'strategy', title: 'Strategic Alignment', description: `Analysis for ${organizationName} in ${country} market.` },
      { id: '2', type: 'risk', title: 'Regulatory Considerations', description: 'Monitor local compliance requirements.' },
      { id: '3', type: 'opportunity', title: 'Market Potential', description: 'Growth opportunity detected in target sector.' }
    ]);
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Chat/copilot message
router.post('/chat', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required in request body' });
    }
    const text = await generateWithAI(messages, SYSTEM_INSTRUCTION);
    res.json({
      id: Date.now().toString(),
      type: 'strategy',
      title: 'Copilot Response',
      description: text,
      text,
      content: text,
      confidence: 85
    });
  } catch (error) {
    console.error('AI chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to process chat', details: errorMessage });
  }
});

// AI runtime status endpoint
router.get('/status', async (_req: Request, res: Response) => {
  const availability = await getRuntimeProviderAvailability();

  res.json({
    aiAvailable: Boolean(availability.openai || availability.anthropic || availability.groq || availability.together),
    providers: {
      // Bedrock removed
      openai: availability.openai,
      anthropic: availability.anthropic,
      groq: availability.groq,
      together: availability.together
    }
  });
});

// ─── Provider Orchestrator Status ──────────────────────────────────────────────
router.get('/provider-status', async (_req: Request, res: Response) => {
  try {
    const status = getProviderStatus();
    res.json({
      orchestrator: 'active',
      availableProviders: availableProviderCount(),
      providers: status,
    });
  } catch (_err) {
    res.status(500).json({ error: 'Failed to get provider status' });
  }
});

router.get('/readiness', async (_req: Request, res: Response) => {
  const availability = await getRuntimeProviderAvailability();
  const ready = availability.openai || availability.anthropic || availability.groq || availability.together;

  const reasons: string[] = [];
  // Bedrock removed
  if (!availability.openai) reasons.push('openai_not_configured');
  if (!availability.anthropic) reasons.push('anthropic_not_configured');
  if (!availability.groq) reasons.push('groq_not_configured');
  if (!availability.together) reasons.push('together_not_configured');
  if (ready && reasons.length === 0) reasons.push('ai_runtime_ready');

  res.status(ready ? 200 : 503).json({
    ready,
    reasons,
    providers: {
      // Bedrock removed
      openai: {
        ready: availability.openai
      },
      anthropic: {
        ready: availability.anthropic
      },
      groq: {
        ready: availability.groq
      },
      together: {
        ready: availability.together
      }
    }
  });
});

router.get('/control/status', async (_req: Request, res: Response) => {
  const availability = await getRuntimeProviderAvailability();
  const providers = {
    // Bedrock removed
    openai: availability.openai,
    anthropic: availability.anthropic,
    groq: availability.groq,
    together: availability.together
  };
  const learningHint = await AdaptiveControlLearning.getHint();
    const sample = deriveControlDecision(
      {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        messageChars: 600,
        readinessScore: 50,
        hasAttachments: false,
        sessionDepth: 5,
        taskType: 'general_assist',
        retryCount: 0
      },
      {
        openai: providers.openai,
        groq: providers.groq,
        together: providers.together,
      },
      learningHint
    );

  res.json({
    providers,
    learningHint,
    sampleDecision: sample
  });
});

// ============================================================================
// STREAMING CONSULTANT — SSE endpoint for intermediate pipeline visibility
// ============================================================================
router.post('/consultant/stream', async (req: Request, res: Response) => {
  const requestId = crypto.randomUUID();

  try {
    const { message, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (type: string, data: unknown) => {
      res.write(`data: ${JSON.stringify({ type, requestId, data })}\n\n`);
    };

    sendEvent('start', { message: 'Pipeline started', timestamp: new Date().toISOString() });

    // ── Safety guardrails check ───────────────────────────────────────────
    let safetyBlocked = false;
    try {
      const { checkInputSafety } = await import('../../services/SafetyGuardrailsPipeline.js');
      const inputCheck = checkInputSafety(message);
      sendEvent('phase_complete', { phase: 'Safety Check', result: { passed: inputCheck.passed, threatClass: inputCheck.threatClass } });
      if (!inputCheck.passed && (inputCheck.threatClass === 'harmful_request' || inputCheck.threatClass === 'prompt_injection')) {
        sendEvent('safety_block', { reason: inputCheck.details });
        safetyBlocked = true;
      }
    } catch { /* safety check non-critical */ }

    if (safetyBlocked) {
      sendEvent('done', { message: 'Request blocked by safety guardrails', requestId });
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // ── Start reasoning trace ─────────────────────────────────────────────
    try {
      const { startTrace } = await import('../../services/ReasoningTraceRecorder.js');
      startTrace(requestId, message);
    } catch { /* tracing non-critical */ }

    const reportParams = extractReportParamsFromContext(message, context);

    // Phase 1: SAT Validation
    sendEvent('phase', { phase: 'SAT Contradiction Check', status: 'running' });
    const satResult = satSolver.analyze(reportParams as unknown as import('../../types').ReportParameters);
    sendEvent('phase_complete', {
      phase: 'SAT Contradiction Check',
      result: { isSatisfiable: satResult.isSatisfiable, contradictions: satResult.contradictions.length, confidence: satResult.confidence },
    });

    // Phase 2: Memory Retrieval (hybrid)
    sendEvent('phase', { phase: 'Hybrid Memory Search', status: 'running' });
    const memoryResults = globalVectorIndex.hybridSearch(reportParams as unknown as import('../../types').ReportParameters, {
      maxResults: 5,
      enableQueryExpansion: true,
      reasoningContext: { riskLevel: reportParams.riskTolerance as string, focusAreas: reportParams.strategicIntent as string[] },
    });
    sendEvent('phase_complete', {
      phase: 'Hybrid Memory Search',
      result: { casesFound: memoryResults.length, topScore: memoryResults[0]?.score ?? 0 },
    });

    // Phase 3: Parallel Reasoning
    sendEvent('phase', { phase: 'Adversarial Debate + Formula Scoring', status: 'running' });
    const [debateResult, formulaResult] = await Promise.all([
      bayesianDebateEngine.runDebate(reportParams as unknown as import('../../types').ReportParameters),
      dagScheduler.execute(reportParams as unknown as import('../../types').ReportParameters),
    ]);
    sendEvent('phase_complete', {
      phase: 'Adversarial Debate',
      result: {
        recommendation: debateResult.recommendation,
        consensusStrength: debateResult.consensusStrength,
        roundsExecuted: debateResult.roundsExecuted,
      },
    });
    sendEvent('phase_complete', {
      phase: 'Formula Scoring',
      result: { formulasExecuted: formulaResult.results.size, totalTimeMs: formulaResult.totalTimeMs },
    });

    // Phase 4: Tool calling (if low confidence)
    if (debateResult.consensusStrength < 0.65) {
      sendEvent('phase', { phase: 'Autonomous Loop — Low Confidence Detected', status: 'running' });
      const tools = toolRegistry.matchTools(message, reportParams as unknown as Record<string, unknown>);
      if (tools.length > 0) {
        const topTool = tools[0];
        sendEvent('tool_call', { tool: topTool.toolName, reason: topTool.reason });
        const toolResult = await toolRegistry.call(topTool.toolName, reportParams as unknown as Record<string, unknown>);
        sendEvent('tool_result', {
          tool: topTool.toolName,
          success: toolResult.success,
          timeMs: toolResult.executionTimeMs,
        });
      }
      sendEvent('phase_complete', { phase: 'Autonomous Loop', result: { toolsMatched: tools.length } });
    }

    // Phase 5: Brain enrichment
    sendEvent('phase', { phase: 'Full Brain Enrichment', status: 'running' });
    try {
      const brainResult = await Promise.race([
        BrainIntegrationService.enrich(reportParams, 50, message),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
      ]);
      sendEvent('phase_complete', {
        phase: 'Full Brain Enrichment',
        result: brainResult ? { engines: Object.keys(brainResult).length, readiness: (brainResult as BrainContext).readiness } : { timeout: true },
      });
    } catch {
      sendEvent('phase_complete', { phase: 'Full Brain Enrichment', result: { error: 'Brain enrichment failed' } });
    }

    sendEvent('done', { message: 'Pipeline complete', requestId });

    // ── Complete reasoning trace ──────────────────────────────────────────
    try {
      const { completeTrace } = await import('../../services/ReasoningTraceRecorder.js');
      completeTrace(requestId, 'stream-complete');
    } catch { /* tracing non-critical */ }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('[Consultant Stream] Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream failed' })}\n\n`);
    res.end();
  }
});

// Unified ADVERSIQ Consultant endpoint with model-broker fallback (Bedrock -> Gemini -> OpenAI)
router.post('/consultant', async (req: Request, res: Response) => {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  try {
    const { message, context, systemPrompt, modelOrder, taskType, envelope } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    // Extract domain mode from context (set by Gateway intake) or request body
    const rawDomainMode = (context && typeof context === 'object' && (context as Record<string, unknown>).domainMode)
      || req.body.domainMode;
    const domainMode: DomainMode | undefined = typeof rawDomainMode === 'string'
      ? rawDomainMode as DomainMode
      : undefined;
    const activeDomainInstruction = getConsultantInstructionForDomain(domainMode);

    const normalizedTaskType: ConsultantTaskType = (typeof taskType === 'string' ? taskType : 'general_assist') as ConsultantTaskType;
    if (!CONSULTANT_ALLOWED_TASK_TYPES.has(normalizedTaskType)) {
      return res.status(400).json({
        error: 'Invalid taskType',
        allowedTaskTypes: Array.from(CONSULTANT_ALLOWED_TASK_TYPES)
      });
    }

    const sanitizedMessage = sanitizeConsultantMessage(message);
    if (!sanitizedMessage) {
      return res.status(400).json({ error: 'message must not be empty' });
    }

    // ── Frontier Pipeline: Safety guardrails ────────────────────────────────
    try {
      const { checkInputSafety } = await import('../../services/SafetyGuardrailsPipeline.js');
      const inputSafety = checkInputSafety(sanitizedMessage);
      if (!inputSafety.passed && (inputSafety.threatClass === 'harmful_request' || inputSafety.threatClass === 'prompt_injection')) {
        return res.json({
          requestId,
          taskType: normalizedTaskType,
          text: inputSafety.threatClass === 'harmful_request'
            ? "I can't assist with that request as it may involve activities that are unethical or illegal. I'm here to help with legitimate business consulting and analysis."
            : "I detected an attempt to manipulate my instructions. I'll continue operating with my standard guidelines. How can I help with your business question?",
          provider: 'safety-guardrail',
          attempts: [{ provider: 'safety-guardrail', ok: true }],
          confidence: 1,
          model: 'deterministic',
          safety: { blocked: true, threatClass: inputSafety.threatClass },
        });
      }
    } catch { /* safety check is non-blocking */ }

    // ── Frontier Pipeline: Start reasoning trace ────────────────────────────
    try {
      const { startTrace } = await import('../../services/ReasoningTraceRecorder.js');
      startTrace(requestId, sanitizedMessage);
    } catch { /* tracing is non-blocking */ }

    const sanitizedContextResult = sanitizeConsultantContext(context);

    const requestEnvelope = normalizeRequestEnvelope(
      requestId,
      sanitizedMessage,
      envelope,
      normalizedTaskType,
      sanitizedContextResult.context
    );

    const learningHint = await AdaptiveControlLearning.getHint();
    const providerAvailability = await getRuntimeProviderAvailability();

    // Early-return when no AI provider is configured — return 200 so the
    // frontend shows a helpful setup message instead of an error.
    const noProviderAvailable =
      !providerAvailability.openai &&
      !providerAvailability.anthropic &&
      !providerAvailability.groq &&
      !providerAvailability.together &&
      !providerAvailability.gemma;
    if (noProviderAvailable) {
      return res.json({
        requestId,
        taskType: normalizedTaskType,
        text: `No AI provider is currently configured on this server. To activate the ADVERSIQ Consultant, add at least one of the following environment variables to your server and restart it:\n\n• GOOGLE_AI_API_KEY — free at aistudio.google.com/apikey (recommended — generous free tier)\n• GROQ_API_KEY — free at console.groq.com (fast inference)\n• OPENAI_API_KEY — platform.openai.com/api-keys\n• TOGETHER_API_KEY — api.together.xyz\n• ANTHROPIC_API_KEY — console.anthropic.com\n\nOnce a key is added and the server is restarted, the consultant will be fully operational.`,
        provider: 'rule-engine',
        attempts: [],
        confidence: 1,
        model: 'deterministic',
      });
    }

    const controlDecision = deriveControlDecision(
      requestEnvelope,
      {
        openai: providerAvailability.openai,
        groq: providerAvailability.groq,
        together: providerAvailability.together,
        gemma: providerAvailability.gemma,
      },
      learningHint
    );

    const requestedProviderOrder = parseProviderOrder(modelOrder);
    const providerOrder = Array.from(new Set([
      ...requestedProviderOrder.filter((provider) => controlDecision.providerOrder.includes(provider)),
      ...controlDecision.providerOrder,
    ]));
    const replayPayload: ConsultantReplayPayload = {
      message: sanitizedMessage,
      context: sanitizedContextResult.context,
      systemPrompt: typeof systemPrompt === 'string' ? systemPrompt : undefined,
      modelOrder: providerOrder,
      taskType: normalizedTaskType
    };
    const replayHash = buildReplayHash(replayPayload);

    const intent = detectConsultantIntent(sanitizedMessage);
    const capabilityProfile = deriveConsultantCapabilityProfile(sanitizedMessage, sanitizedContextResult.context);
    const augmentedSnapshot = buildAugmentedAISnapshot(capabilityProfile);
    const recommendedAugmentedTools = getRecommendedAugmentedToolsForMode(capabilityProfile.mode);
    const overlookedIntelligence = buildOverlookedIntelligenceSnapshot(sanitizedMessage, sanitizedContextResult.context);
    const strategicPipeline = runStrategicIntelligencePipeline(sanitizedMessage, sanitizedContextResult.context);
    const perceptionDelta = buildPerceptionDeltaIndex(
      sanitizedMessage,
      sanitizedContextResult.context,
      overlookedIntelligence,
      strategicPipeline,
      capabilityProfile.gaps.length
    );
    const tribunal = runFiveEngineTribunal({
      message: sanitizedMessage,
      taskType: normalizedTaskType,
      intent,
      controlMode: controlDecision.mode,
      strategicReadiness: strategicPipeline.readinessScore,
      evidenceCredibility: overlookedIntelligence.evidenceCredibility,
      unresolvedGapCount: capabilityProfile.gaps.length,
      perceptionDelta
    });

    // ═══ FULL BRAIN + NSIL WIRING ═══════════════════════════════════════════
    // Run the 44-engine Brain and NSIL 10-layer pipeline in parallel.
    // Both are wrapped in try/catch with timeouts so the consultant never stalls.
    const reportParams = extractReportParamsFromContext(sanitizedMessage, sanitizedContextResult.context);
    const readinessEstimate = strategicPipeline.readinessScore ?? 50;

    let brainContext: BrainContext | null = null;
    let nsilReport: Record<string, unknown> | null = null;

    const BRAIN_TIMEOUT_MS = 12000;

    try {
      const [brainResult, nsilResult] = await Promise.allSettled([
        Promise.race([
          BrainIntegrationService.enrich(reportParams, readinessEstimate, sanitizedMessage),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Brain timeout')), BRAIN_TIMEOUT_MS)),
        ]),
        Promise.race([
          NSILIntelligenceHub.runFullAnalysis(reportParams),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('NSIL timeout')), BRAIN_TIMEOUT_MS)),
        ]),
      ]);
      if (brainResult.status === 'fulfilled') brainContext = brainResult.value;
      else console.warn('[Consultant] Brain enrichment did not complete:', brainResult.reason?.message);
      if (nsilResult.status === 'fulfilled') nsilReport = nsilResult.value as unknown as Record<string, unknown>;
      else console.warn('[Consultant] NSIL analysis did not complete:', nsilResult.reason?.message);
    } catch (brainErr) {
      console.warn('[Consultant] Brain/NSIL parallel run error:', brainErr instanceof Error ? brainErr.message : brainErr);
    }
    // ═══ END BRAIN + NSIL WIRING ════════════════════════════════════════════

    if (shouldRequireOutputClarification(sanitizedMessage, intent)) {
      const clarificationText = buildOutputClarificationResponse();

      await logConsultantAuditEvent({
        event: 'consultant_request',
        requestId,
        timestamp: new Date().toISOString(),
        taskType: normalizedTaskType,
        intent: 'clarification',
        provider: 'rule-engine',
        attempts: [{ provider: 'rule-engine', ok: true }],
        durationMs: Date.now() - start,
        inputChars: sanitizedMessage.length,
        outputChars: clarificationText.length,
        contextTruncated: sanitizedContextResult.truncated,
        capabilityMode: capabilityProfile.mode,
        capabilityTags: capabilityProfile.capabilityTags,
        unresolvedGapCount: capabilityProfile.gaps.length,
        augmentedModel: augmentedSnapshot.model,
        evidenceCredibility: overlookedIntelligence.evidenceCredibility,
        perceptionRealityGap: overlookedIntelligence.perceptionRealityGap,
        strategicReadiness: strategicPipeline.readinessScore,
        perceptionDeltaIndex: perceptionDelta.deltaIndex,
        perceptionDeltaConfidence: perceptionDelta.confidence,
        tribunalVerdict: tribunal.verdict,
        tribunalGate: tribunal.releaseGate,
        tribunalContradictionCount: tribunal.contradictions.length,
        replayHash,
        replayStored: false,
        controlMode: controlDecision.mode,
        controlScore: controlDecision.score,
        controlTimeoutMs: controlDecision.timeoutMs
      });

      void AdaptiveControlLearning.record({
        requestId,
        timestamp: new Date().toISOString(),
        mode: controlDecision.mode,
        success: true,
        latencyMs: Date.now() - start,
        provider: 'rule-engine',
      }).catch(() => undefined);

      return res.json({
        requestId,
        taskType: normalizedTaskType,
        text: clarificationText,
        intent: 'clarification',
        provider: 'rule-engine',
        attempts: [{ provider: 'rule-engine', ok: true }],
        confidence: 0.94,
        model: 'deterministic',
        capabilityMode: capabilityProfile.mode,
        capabilityTags: capabilityProfile.capabilityTags,
        unresolvedGaps: capabilityProfile.gaps.slice(0, 3).map((gap) => ({
          key: gap.key,
          severity: gap.severity,
          question: gap.question
        })),
        augmentedAI: augmentedSnapshot,
        recommendedTools: recommendedAugmentedTools,
        overlookedIntelligence,
        strategicPipeline,
        perceptionDelta,
        tribunal,
        control: controlDecision,
        learningHint,
        replayHash,
        replayAvailable: false
      });
    }

    const prompt = buildConsultantPrompt(
      sanitizedMessage,
      intent,
      sanitizedContextResult.context,
      systemPrompt,
      brainContext?.promptBlock ?? undefined,
      nsilReport ? summariseNSILReport(nsilReport) : undefined
    );
    let brokerResult: { text: string; provider: ConsultantProvider | 'local-intelligence'; attempts: ConsultantProviderAttempt[] };
    try {
      brokerResult = await runConsultantBroker(
        prompt,
        providerOrder,
        controlDecision.timeoutMs,
        {
          openai: providerAvailability.openai,
          anthropic: providerAvailability.anthropic,
          groq: providerAvailability.groq,
          together: providerAvailability.together,
          gemma: providerAvailability.gemma,
        },
        activeDomainInstruction
      );
    } catch (brokerError) {
      // All external providers failed — fall back to local intelligence synthesis
      console.warn('[Consultant] All providers failed, using local intelligence fallback:', brokerError instanceof Error ? brokerError.message : brokerError);
      const localText = synthesizeLocalFallbackResponse(
        sanitizedMessage,
        brainContext,
        nsilReport,
        tribunal,
        strategicPipeline,
        overlookedIntelligence,
        perceptionDelta,
      );
      brokerResult = {
        text: localText,
        provider: 'local-intelligence',
        attempts: (brokerError instanceof Error && brokerError.message.includes('|'))
          ? brokerError.message.replace('No consultant providers succeeded. ', '').split(' | ').map(d => {
              const [provider, ...rest] = d.split(': ');
              return { provider: provider as ConsultantProvider, ok: false, detail: rest.join(': ') };
            })
          : [],
      };
    }
    const normalizedText = normalizeConsultantOutput(brokerResult.text);

    const replayRecord: ConsultantReplayRecord = {
      requestId,
      createdAt: new Date().toISOString(),
      replayHash,
      hasPayload: CONSULTANT_REPLAY_STORE_PAYLOAD,
      ...(CONSULTANT_REPLAY_STORE_PAYLOAD ? { payload: replayPayload } : {})
    };

    try {
      await persistConsultantReplayRecord(replayRecord);
    } catch (replayError) {
      console.warn('Consultant replay persist failed:', replayError instanceof Error ? replayError.message : 'Unknown error');
    }

    await logConsultantAuditEvent({
      event: 'consultant_request',
      requestId,
      timestamp: new Date().toISOString(),
      taskType: normalizedTaskType,
      intent,
      provider: brokerResult.provider,
      attempts: brokerResult.attempts,
      durationMs: Date.now() - start,
      inputChars: sanitizedMessage.length,
      outputChars: normalizedText.length,
      contextTruncated: sanitizedContextResult.truncated,
      capabilityMode: capabilityProfile.mode,
      capabilityTags: capabilityProfile.capabilityTags,
      unresolvedGapCount: capabilityProfile.gaps.length,
      augmentedModel: augmentedSnapshot.model,
      evidenceCredibility: overlookedIntelligence.evidenceCredibility,
      perceptionRealityGap: overlookedIntelligence.perceptionRealityGap,
      strategicReadiness: strategicPipeline.readinessScore,
      perceptionDeltaIndex: perceptionDelta.deltaIndex,
      perceptionDeltaConfidence: perceptionDelta.confidence,
      tribunalVerdict: tribunal.verdict,
      tribunalGate: tribunal.releaseGate,
      tribunalContradictionCount: tribunal.contradictions.length,
      replayHash,
      replayStored: CONSULTANT_REPLAY_STORE_PAYLOAD,
      controlMode: controlDecision.mode,
      controlScore: controlDecision.score,
      controlTimeoutMs: controlDecision.timeoutMs
    });

    void AdaptiveControlLearning.record({
      requestId,
      timestamp: new Date().toISOString(),
      mode: controlDecision.mode,
      success: true,
      latencyMs: Date.now() - start,
      provider: brokerResult.provider,
    }).catch(() => undefined);

    // ── Frontier Pipeline: Complete trace & collect training data ────────
    try {
      const { completeTrace } = await import('../../services/ReasoningTraceRecorder.js');
      completeTrace(requestId, normalizedText, { modelUsed: brokerResult.provider });
    } catch { /* non-blocking */ }

    try {
      const { collectExample } = await import('../../services/FineTuningDataCollector.js');
      collectExample({
        input: { messages: [{ role: 'user', content: sanitizedMessage }], systemPrompt: typeof systemPrompt === 'string' ? systemPrompt : undefined },
        output: normalizedText,
        metadata: { userId: requestId, model: brokerResult.provider, latencyMs: Date.now() - start, category: normalizedTaskType },
      });
    } catch { /* non-blocking */ }

    // ── Frontier Pipeline: Append disclaimer if needed ────────────────────
    let finalText = normalizedText;
    try {
      const { checkOutputSafety, appendDisclaimer } = await import('../../services/SafetyGuardrailsPipeline.js');
      const outputCheck = checkOutputSafety(normalizedText, normalizedTaskType);
      if (outputCheck.disclaimerNeeded) {
        finalText = appendDisclaimer(normalizedText, normalizedTaskType);
      }
    } catch { /* non-blocking */ }

    return res.json({
      requestId,
      taskType: normalizedTaskType,
      text: finalText,
      intent,
      provider: brokerResult.provider,
      attempts: brokerResult.attempts,
      confidence: 0.86,
      model: brokerResult.provider,
      capabilityMode: capabilityProfile.mode,
      capabilityTags: capabilityProfile.capabilityTags,
      unresolvedGaps: capabilityProfile.gaps.slice(0, 3).map((gap) => ({
        key: gap.key,
        severity: gap.severity,
        question: gap.question
      })),
      augmentedAI: augmentedSnapshot,
      recommendedTools: recommendedAugmentedTools,
      overlookedIntelligence,
      strategicPipeline,
      perceptionDelta,
      tribunal,
      brainIntelligence: brainContext ? {
        indices: brainContext.indices,
        adversarial: brainContext.adversarial,
        agentConsensus: brainContext.agentConsensus,
        nsilAssessment: brainContext.nsilAssessment,
        compositeScore: brainContext.compositeScore,
        compliance: brainContext.compliance,
        ifcAssessment: brainContext.ifcAssessment,
        situationAnalysis: brainContext.situationAnalysis,
        personaAnalysis: brainContext.personaAnalysis,
        motivationAnalysis: brainContext.motivationAnalysis,
        counterfactualAnalysis: brainContext.counterfactualAnalysis,
        historicalParallels: brainContext.historicalParallels,
        rankedPartners: brainContext.rankedPartners,
        derivedIndices: brainContext.derivedIndices,
        gateStatus: brainContext.gateStatus,
        reactiveOpportunities: brainContext.reactiveOpportunities,
        reactiveRisks: brainContext.reactiveRisks,
        qualityGate: brainContext.qualityGate,
        researchEcosystem: brainContext.researchEcosystem,
        failureModeGovernance: brainContext.failureModeGovernance,
        proactiveBriefing: brainContext.proactiveBriefing ? {
          backtestAccuracy: brainContext.proactiveBriefing.backtestAccuracy,
          calibrationSummary: brainContext.proactiveBriefing.calibrationSummary,
          driftSummary: brainContext.proactiveBriefing.driftSummary,
          cognitiveSummary: brainContext.proactiveBriefing.cognitiveSummary,
          proactiveSignals: brainContext.proactiveBriefing.proactiveSignals.slice(0, 5),
          actionPriorities: brainContext.proactiveBriefing.actionPriorities.slice(0, 5),
          confidence: brainContext.proactiveBriefing.confidence,
        } : null,
        causalSimulation: brainContext.causalSimulation,
        coreEthics: brainContext.coreEthics,
        regionalCityDiscovery: brainContext.regionalCityDiscovery ? {
          totalCitiesScanned: brainContext.regionalCityDiscovery.totalCitiesScanned,
          topMatches: brainContext.regionalCityDiscovery.topMatches.slice(0, 10),
          sectorHotspots: brainContext.regionalCityDiscovery.sectorHotspots,
          insight: brainContext.regionalCityDiscovery.insight,
        } : null,
        bootsOnGround: brainContext.bootsOnGround ?? null,
        relocationPathway: brainContext.relocationPathway ?? null,
        globalCityIndex: brainContext.globalCityIndex ?? null,
        relocationOutcomes: brainContext.relocationOutcomes ?? null,
        supplyChainMap: brainContext.supplyChainMap ?? null,
        workforceIntelligence: brainContext.workforceIntelligence ?? null,
        functionSplit: brainContext.functionSplit ?? null,
        esgClimate: brainContext.esgClimate ?? null,
        networkEffects: brainContext.networkEffects ?? null,
        tier1Extraction: brainContext.tier1Extraction ?? null,
        governmentIncentives: brainContext.governmentIncentives ?? null,
        quantumMonteCarlo: brainContext.quantumMonteCarlo ?? null,
        quantumPatterns: brainContext.quantumPatterns ?? null,
        quantumCognition: brainContext.quantumCognition ?? null,
        capabilityBoundary: brainContext.capabilityBoundary ? {
          totalEngines: brainContext.capabilityBoundary.totalEngines,
          totalCapabilities: brainContext.capabilityBoundary.totalCapabilities,
          boundaries: brainContext.capabilityBoundary.boundaries,
          dataSources: brainContext.capabilityBoundary.dataSources,
        } : null,
        financialAnalysis: brainContext.financialAnalysis ? {
          npv: { npv: brainContext.financialAnalysis.npv.npv, discountRate: brainContext.financialAnalysis.npv.discountRate },
          irr: { irrPercent: brainContext.financialAnalysis.irr.irrPercent, converged: brainContext.financialAnalysis.irr.converged },
          payback: brainContext.financialAnalysis.payback,
          wacc: brainContext.financialAnalysis.wacc,
          scenarios: {
            base: { npv: brainContext.financialAnalysis.scenarios.base.npv, irr: brainContext.financialAnalysis.scenarios.base.irr.irrPercent, returnMultiple: brainContext.financialAnalysis.scenarios.base.returnMultiple },
            downside: { npv: brainContext.financialAnalysis.scenarios.downside.npv, irr: brainContext.financialAnalysis.scenarios.downside.irr.irrPercent },
            upside: { npv: brainContext.financialAnalysis.scenarios.upside.npv, irr: brainContext.financialAnalysis.scenarios.upside.irr.irrPercent },
          },
          sensitivityDrivers: brainContext.financialAnalysis.sensitivityDrivers,
        } : null,
        riskMatrix: brainContext.riskMatrix ? {
          aggregate: brainContext.riskMatrix.aggregate,
          topRisks: brainContext.riskMatrix.topRisks.map(r => ({
            id: r.id, name: r.name, category: r.category, severity: r.severity,
            likelihood: r.likelihood, impact: r.impact, score: r.score,
            impactUSD: r.impactUSD, mitigationStrategy: r.mitigationStrategy,
            residualScore: r.residualScore, residualSeverity: r.residualSeverity,
          })),
          heatMap: brainContext.riskMatrix.heatMap,
        } : null,
        readiness: brainContext.readiness,
        computedAt: brainContext.computedAt,
      } : null,
      nsilAnalysis: nsilReport ? {
        recommendation: (nsilReport as Record<string, unknown>).recommendation,
        componentsRun: (nsilReport as Record<string, unknown>).componentsRun,
        reflexive: (nsilReport as Record<string, unknown>).reflexive ?? null,
        autonomous: (nsilReport as Record<string, unknown>).autonomous ?? null,
      } : null,
      control: controlDecision,
      learningHint,
      replayHash,
      replayAvailable: CONSULTANT_REPLAY_STORE_PAYLOAD
    });
  } catch (error) {
    console.error('Consultant endpoint error:', error);
    const rawErrorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorMessage = rawErrorMessage;
    void AdaptiveControlLearning.record({
      requestId,
      timestamp: new Date().toISOString(),
      mode: 'reactive',
      success: false,
      latencyMs: Date.now() - start,
      errorType: errorMessage,
    }).catch(() => undefined);
    await logConsultantAuditEvent({
      event: 'consultant_error',
      requestId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: errorMessage
    });
    return res.status(500).json({ error: 'Failed to process consultant request', details: errorMessage });
  }
});

router.get('/augmented-ai/tools', (req: Request, res: Response) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const mode = typeof req.query.mode === 'string' ? req.query.mode : undefined;

  const allTools = getAugmentedAITools(category as Parameters<typeof getAugmentedAITools>[0]);
  const recommended = mode ? getRecommendedAugmentedToolsForMode(mode) : [];

  return res.json({
    total: allTools.length,
    category: category || null,
    mode: mode || null,
    tools: allTools,
    recommended
  });
});

router.post('/augmented-ai/snapshot', (req: Request, res: Response) => {
  const { message, context } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const profile = deriveConsultantCapabilityProfile(message, context);
  const snapshot = buildAugmentedAISnapshot(profile);
  const recommendedTools = getRecommendedAugmentedToolsForMode(profile.mode);

  return res.json({
    profile,
    snapshot,
    recommendedTools
  });
});

router.post('/consultant/overlooked-scan', (req: Request, res: Response) => {
  const { message, context } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const overlookedIntelligence = buildOverlookedIntelligenceSnapshot(message, context);
  return res.json({
    overlookedIntelligence
  });
});

router.post('/consultant/strategic-pipeline', (req: Request, res: Response) => {
  const { message, context } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const strategicPipeline = runStrategicIntelligencePipeline(message, context);
  return res.json({
    strategicPipeline
  });
});

router.post('/consultant/perception-delta', (req: Request, res: Response) => {
  const { message, context } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const capabilityProfile = deriveConsultantCapabilityProfile(message, context);
  const overlookedIntelligence = buildOverlookedIntelligenceSnapshot(message, context);
  const strategicPipeline = runStrategicIntelligencePipeline(message, context);
  const perceptionDelta = buildPerceptionDeltaIndex(
    message,
    context,
    overlookedIntelligence,
    strategicPipeline,
    capabilityProfile.gaps.length
  );

  return res.json({
    perceptionDelta,
    supporting: {
      overlookedIntelligence,
      strategicPipeline
    }
  });
});

router.post('/consultant/tribunal', (req: Request, res: Response) => {
  const { message, context, taskType } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const intent = detectConsultantIntent(message);
  const capabilityProfile = deriveConsultantCapabilityProfile(message, context);
  const overlookedIntelligence = buildOverlookedIntelligenceSnapshot(message, context);
  const strategicPipeline = runStrategicIntelligencePipeline(message, context);
  const perceptionDelta = buildPerceptionDeltaIndex(
    message,
    context,
    overlookedIntelligence,
    strategicPipeline,
    capabilityProfile.gaps.length
  );
  const tribunal = runFiveEngineTribunal({
    message,
    taskType: typeof taskType === 'string' ? taskType : 'general_assist',
    intent,
    controlMode: 'reactive',
    strategicReadiness: strategicPipeline.readinessScore,
    evidenceCredibility: overlookedIntelligence.evidenceCredibility,
    unresolvedGapCount: capabilityProfile.gaps.length,
    perceptionDelta
  });

  return res.json({
    tribunal,
    perceptionDelta,
    supporting: {
      overlookedIntelligence,
      strategicPipeline
    }
  });
});

router.get('/brain/coverage', async (_req: Request, res: Response) => {
  try {
    const report = await buildBrainCoverageReport();
    return res.json(report);
  } catch (error) {
    console.error('Brain coverage audit failed:', error);
    return res.status(500).json({ error: 'Failed to generate brain coverage report' });
  }
});

router.post('/augmented-ai/review', async (req: Request, res: Response) => {
  const { decision, mode, capabilityTags, unresolvedGaps, recommendedTools, timestamp } = req.body ?? {};
  if (!decision || typeof decision !== 'string' || !['accept', 'modify', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be one of: accept, modify, reject' });
  }

  const reviewId = crypto.randomUUID();
  await logConsultantAuditEvent({
    event: 'augmented_ai_review',
    reviewId,
    timestamp: typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
    decision,
    mode: typeof mode === 'string' ? mode : 'general_help',
    capabilityTags: Array.isArray(capabilityTags) ? capabilityTags : [],
    unresolvedGapCount: Array.isArray(unresolvedGaps) ? unresolvedGaps.length : 0,
    recommendedToolCount: Array.isArray(recommendedTools) ? recommendedTools.length : 0
  });

  return res.json({
    success: true,
    reviewId,
    decision
  });
});

router.get('/consultant/replay/:requestId', async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId;
    const record = await readConsultantReplayRecord(requestId);
    if (!record) {
      return res.status(404).json({ error: 'Replay record not found' });
    }

    return res.json({
      requestId: record.requestId,
      createdAt: record.createdAt,
      replayHash: record.replayHash,
      hasPayload: record.hasPayload,
      sourceRequestId: record.sourceRequestId || null
    });
  } catch (error) {
    console.error('Consultant replay lookup error:', error);
    return res.status(500).json({ error: 'Failed to lookup consultant replay record' });
  }
});

router.post('/consultant/replay/:requestId/retry', async (req: Request, res: Response) => {
  const sourceRequestId = req.params.requestId;
  const retryRequestId = crypto.randomUUID();
  const start = Date.now();

  try {
    const sourceRecord = await readConsultantReplayRecord(sourceRequestId);
    if (!sourceRecord) {
      return res.status(404).json({ error: 'Replay record not found' });
    }
    if (!sourceRecord.hasPayload || !sourceRecord.payload) {
      return res.status(409).json({ error: 'Replay payload unavailable for this request' });
    }

    const payload = sourceRecord.payload;
    const intent = detectConsultantIntent(payload.message);
    const prompt = buildConsultantPrompt(payload.message, intent, payload.context, payload.systemPrompt);
    const providerAvailability = await getRuntimeProviderAvailability();
    const brokerResult = await runConsultantBroker(
      prompt,
      payload.modelOrder,
      CONSULTANT_PROVIDER_TIMEOUT_MS,
      {
        // Bedrock removed
        openai: providerAvailability.openai,
        anthropic: providerAvailability.anthropic,
        groq: providerAvailability.groq,
        together: providerAvailability.together,
      }
    );
    const normalizedText = normalizeConsultantOutput(brokerResult.text);

    const retryReplayHash = buildReplayHash(payload);
    const retryRecord: ConsultantReplayRecord = {
      requestId: retryRequestId,
      createdAt: new Date().toISOString(),
      replayHash: retryReplayHash,
      hasPayload: CONSULTANT_REPLAY_STORE_PAYLOAD,
      sourceRequestId,
      ...(CONSULTANT_REPLAY_STORE_PAYLOAD ? { payload } : {})
    };
    await persistConsultantReplayRecord(retryRecord);

    await logConsultantAuditEvent({
      event: 'consultant_replay_request',
      requestId: retryRequestId,
      sourceRequestId,
      timestamp: new Date().toISOString(),
      taskType: payload.taskType,
      intent,
      provider: brokerResult.provider,
      attempts: brokerResult.attempts,
      durationMs: Date.now() - start,
      replayHash: retryReplayHash,
      replayStored: CONSULTANT_REPLAY_STORE_PAYLOAD
    });

    return res.json({
      requestId: retryRequestId,
      sourceRequestId,
      taskType: payload.taskType,
      text: normalizedText,
      intent,
      provider: brokerResult.provider,
      attempts: brokerResult.attempts,
      confidence: 0.86,
      model: brokerResult.provider,
      replayHash: retryReplayHash,
      replayAvailable: CONSULTANT_REPLAY_STORE_PAYLOAD
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Consultant replay retry error:', error);
    await logConsultantAuditEvent({
      event: 'consultant_replay_error',
      requestId: retryRequestId,
      sourceRequestId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - start,
      error: errorMessage
    });
    return res.status(500).json({ error: 'Failed to retry consultant request', details: errorMessage });
  }
});

router.post('/consultant/replay/fallback', async (req: Request, res: Response) => {
  try {
    const { sourceRequestId, reason, detail } = req.body ?? {};

    if (!sourceRequestId || typeof sourceRequestId !== 'string') {
      return res.status(400).json({ error: 'sourceRequestId is required' });
    }

    await logConsultantAuditEvent({
      event: 'consultant_replay_fallback',
      requestId: crypto.randomUUID(),
      sourceRequestId,
      timestamp: new Date().toISOString(),
      reason: typeof reason === 'string' ? reason : 'Local fallback path used',
      detail: typeof detail === 'string' ? detail : ''
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Consultant replay fallback log error:', error);
    return res.status(500).json({ error: 'Failed to record replay fallback' });
  }
});

// Consultant audit history (persistent JSONL log)
router.get('/consultant/audit', async (req: Request, res: Response) => {
  try {
    const limitValue = Number(req.query.limit ?? 100);
    const limit = Number.isFinite(limitValue) ? Math.max(1, Math.min(1000, Math.floor(limitValue))) : 100;
    const hoursValue = Number(req.query.hours);
    const windowHours = Number.isFinite(hoursValue) && hoursValue > 0 ? Math.min(24 * 30, Math.floor(hoursValue)) : undefined;
    const events = await readConsultantAuditEvents(limit, windowHours);

    return res.json({
      count: events.length,
      limit,
      windowHours: windowHours ?? null,
      events
    });
  } catch (error) {
    console.error('Consultant audit read error:', error);
    return res.status(500).json({ error: 'Failed to read consultant audit events' });
  }
});

router.get('/consultant/audit/:requestId', async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId;
    const events = await readConsultantAuditEvents(1000);
    const matching = events.filter((event) => event.requestId === requestId);

    if (matching.length === 0) {
      return res.status(404).json({ error: 'Audit event not found' });
    }

    return res.json({ requestId, events: matching });
  } catch (error) {
    console.error('Consultant audit lookup error:', error);
    return res.status(500).json({ error: 'Failed to read consultant audit event' });
  }
});

router.get('/consultant/audit-export', async (req: Request, res: Response) => {
  try {
    const format = String(req.query.format || 'json').toLowerCase();
    const limitValue = Number(req.query.limit ?? 500);
    const limit = Number.isFinite(limitValue)
      ? Math.max(1, Math.min(CONSULTANT_AUDIT_EXPORT_MAX, Math.floor(limitValue)))
      : 500;
    const hoursValue = Number(req.query.hours);
    const windowHours = Number.isFinite(hoursValue) && hoursValue > 0 ? Math.min(24 * 30, Math.floor(hoursValue)) : undefined;

    const events = await readConsultantAuditEvents(limit, windowHours);
    const nowIso = new Date().toISOString();
    const summary = {
      exportedAt: nowIso,
      count: events.length,
      limit,
      windowHours: windowHours ?? null,
      redactionEnabled: CONSULTANT_AUDIT_REDACTION_ENABLED,
      eventTypes: Array.from(new Set(events.map((event) => String(event.event || 'unknown'))))
    };

    if (format === 'jsonl') {
      const rows = [JSON.stringify({ summary }), ...events.map((event) => JSON.stringify(event))].join('\n');
      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="consultant-audit-export-${Date.now()}.jsonl"`);
      return res.send(rows);
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.json({ summary, events });
  } catch (error) {
    console.error('Consultant audit export error:', error);
    return res.status(500).json({ error: 'Failed to export consultant audit events' });
  }
});

router.get('/consultant/audit-metrics', async (req: Request, res: Response) => {
  try {
    const hoursValue = Number(req.query.hours ?? 24);
    const windowHours = Number.isFinite(hoursValue) && hoursValue > 0
      ? Math.min(24 * 30, Math.floor(hoursValue))
      : 24;

    const allEvents = await readAllConsultantAuditEvents();
    const nowMs = Date.now();
    const currentCutoffMs = nowMs - windowHours * 60 * 60 * 1000;
    const previousCutoffMs = nowMs - (windowHours * 2) * 60 * 60 * 1000;

    const currentWindowEvents = allEvents.filter((event) => {
      const timestamp = typeof event.timestamp === 'string' ? Date.parse(event.timestamp) : NaN;
      return Number.isFinite(timestamp) && timestamp >= currentCutoffMs;
    });

    const previousWindowEvents = allEvents.filter((event) => {
      const timestamp = typeof event.timestamp === 'string' ? Date.parse(event.timestamp) : NaN;
      return Number.isFinite(timestamp) && timestamp >= previousCutoffMs && timestamp < currentCutoffMs;
    });

    const current = getReplayMetricCounts(currentWindowEvents);
    const previous = getReplayMetricCounts(previousWindowEvents);
    const advancedCurrent = getAdvancedRuntimeMetrics(currentWindowEvents);
    const advancedPrevious = getAdvancedRuntimeMetrics(previousWindowEvents);

    const providers: ConsultantProvider[] = ['bedrock', 'openai'];
    const providerMetrics = providers.reduce<Record<ConsultantProvider, {
      current: ReplayMetricCounts;
      previous: ReplayMetricCounts;
      delta: ReplayMetricCounts;
    }>>((acc, provider) => {
      const providerCurrent = getReplayMetricCounts(currentWindowEvents, provider);
      const providerPrevious = getReplayMetricCounts(previousWindowEvents, provider);
      acc[provider] = {
        current: providerCurrent,
        previous: providerPrevious,
        delta: {
          replaySuccess: providerCurrent.replaySuccess - providerPrevious.replaySuccess,
          replayFallback: providerCurrent.replayFallback - providerPrevious.replayFallback,
          replayError: providerCurrent.replayError - providerPrevious.replayError
        }
      };
      return acc;
    }, {} as Record<ConsultantProvider, {
      current: ReplayMetricCounts;
      previous: ReplayMetricCounts;
      delta: ReplayMetricCounts;
    }>);

    return res.json({
      windowHours,
      current,
      previous,
      advanced: {
        current: advancedCurrent,
        previous: advancedPrevious
      },
      providerMetrics,
      delta: {
        replaySuccess: current.replaySuccess - previous.replaySuccess,
        replayFallback: current.replayFallback - previous.replayFallback,
        replayError: current.replayError - previous.replayError
      }
    });
  } catch (error) {
    console.error('Consultant audit metrics error:', error);
    return res.status(500).json({ error: 'Failed to compute consultant audit metrics' });
  }
});

// Generate report section
router.post('/generate-section', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { section, params } = req.body;
    
    const opportunityContext = params.specificOpportunity ? `Focused on: ${params.specificOpportunity}` : '';
    const prompt = `Generate the '${section}' section for a strategic report on ${params.organizationName}. 
    Target Market: ${params.country}. 
    Intent: ${params.strategicIntent}.
    ${opportunityContext}
    Format: Professional markdown, concise executive style.`;
    
    const text = await generateWithAI(prompt, SYSTEM_INSTRUCTION);
    
    res.json({ content: text });
  } catch (error) {
    console.error('AI section generation error:', error);
    res.status(500).json({ error: 'Failed to generate section' });
  }
});

// Streaming generation (Server-Sent Events)
router.post('/generate-stream', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { section, params, prompt } = req.body;
    
    const opportunityContext = params?.specificOpportunity ? `Focused on: ${params.specificOpportunity}` : '';
    const streamPrompt = prompt || `Generate the '${section || 'analysis'}' section for a strategic report on ${params?.organizationName || 'the organization'}. 
    Target Market: ${params?.country || 'unspecified'}. 
    Intent: ${params?.strategicIntent || 'analysis'}.
    ${opportunityContext}
    Format: Professional markdown, concise executive style.`;
    
    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // generateWithAI (Bedrock or Gemini) — send as single SSE chunk
    const streamText = await generateWithAI(streamPrompt, SYSTEM_INSTRUCTION);
    res.write(`data: ${JSON.stringify({ text: streamText })}\n\n`);
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('AI stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    res.end();
  }
});

// Deep reasoning analysis
router.post('/deep-reasoning', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { userOrg, targetEntity, context } = req.body;
    
    const prompt = `
    Perform a deep reasoning analysis on a potential partnership/deal between ${userOrg} and ${targetEntity}.
    Context: ${context}
    
    Provide JSON with:
    - verdict: "Strong Buy" | "Consider" | "Hard Pass"
    - dealKillers: string[] (negative risks)
    - hiddenGems: string[] (positive upsides)
    - reasoningChain: string[] (step by step logic)
    - counterIntuitiveInsight: string
    
    Only return valid JSON.`;
    
    const text = await generateWithAI(prompt, SYSTEM_INSTRUCTION);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return res.json(analysis);
    }
    
    res.status(500).json({ error: 'Failed to parse analysis' });
  } catch (error) {
    console.error('Deep reasoning error:', error);
    res.status(500).json({ error: 'Failed to generate reasoning' });
  }
});

// Geopolitical analysis
router.post('/geopolitical', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { country, region, intent } = req.body;
    
    const prompt = `Assess geopolitical risks for market entry:
    Country: ${country}
    Region: ${region}
    Intent: ${JSON.stringify(intent)}
    
    Return JSON with:
    - stabilityScore: number (0-100)
    - currencyRisk: "Low" | "Moderate" | "High"
    - inflationTrend: string
    - forecast: string
    - regionalConflictRisk: number (0-100)
    - tradeBarriers: string[]
    
    Only return valid JSON.`;
    
    const text = await generateWithAI(prompt, SYSTEM_INSTRUCTION);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return res.json(JSON.parse(jsonMatch[0]));
    }
    
    // Fallback
    res.json({
      stabilityScore: 70,
      currencyRisk: 'Moderate',
      inflationTrend: 'Stable',
      forecast: 'Standard market conditions expected.',
      regionalConflictRisk: 30,
      tradeBarriers: ['Standard tariffs']
    });
  } catch (error) {
    console.error('Geopolitical analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze' });
  }
});

// Governance audit
router.post('/governance', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { country, organizationType } = req.body;
    
    const prompt = `Perform governance audit for:
    Country: ${country}
    Organization Type: ${organizationType}
    
    Return JSON with:
    - governanceScore: number (0-100)
    - corruptionRisk: "Low" | "Moderate" | "High"
    - regulatoryFriction: number (0-100)
    - transparencyIndex: number (0-100)
    - redFlags: string[]
    - complianceRoadmap: string[]
    
    Only return valid JSON.`;
    
    const text = await generateWithAI(prompt, SYSTEM_INSTRUCTION);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return res.json(JSON.parse(jsonMatch[0]));
    }
    
    res.json({
      governanceScore: 70,
      corruptionRisk: 'Moderate',
      regulatoryFriction: 30,
      transparencyIndex: 70,
      redFlags: [],
      complianceRoadmap: ['Standard compliance review recommended']
    });
  } catch (error) {
    console.error('Governance audit error:', error);
    res.status(500).json({ error: 'Failed to audit' });
  }
});

// Agent endpoint for generic AI agent tasks
router.post('/agent', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { agentName, roleDefinition, context } = req.body;
    
    const prompt = `
    ROLE: You are the ${agentName}.
    MISSION: ${roleDefinition}
    
    CONTEXT_DATA: ${JSON.stringify(context)}
    
    TASK: Analyze the provided context data and generate strategic findings and recommendations.
    
    Return JSON with:
    - findings: string[] (specific, numeric where possible)
    - recommendations: string[]
    - confidence: number (0-100)
    - gaps: string[] (missing info)
    
    Only return valid JSON.`;
    
    const text = await generateWithAI(prompt, SYSTEM_INSTRUCTION);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return res.json(JSON.parse(jsonMatch[0]));
    }
    
    res.json({
      findings: ['Analysis completed'],
      recommendations: ['Review full data set'],
      confidence: 60,
      gaps: []
    });
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Agent failed' });
  }
});

// Search grounded content
router.post('/search-grounded', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    const text = await generateWithAI(query, SYSTEM_INSTRUCTION);
    
    res.json({
      text,
      sources: [] // Google search grounding requires specific API setup
    });
  } catch (error) {
    console.error('Search grounded error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Copilot analysis
router.post('/copilot-analysis', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;
    
    const prompt = `Analyze: ${query}
    Context: ${context}
    
    Return JSON with:
    - summary: string (brief analysis)
    - options: array of {id, title, rationale}
    - followUp: string (suggested next question)
    
    Only return valid JSON.`;
    
    const text = await generateWithAI(prompt, SYSTEM_INSTRUCTION);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return res.json(JSON.parse(jsonMatch[0]));
    }

    res.json({
      summary: `Analysis of "${query}" suggests focusing on strategic opportunities.`,
      options: [
        { id: '1', title: 'Primary Strategy', rationale: 'Based on context analysis.' }
      ],
      followUp: 'Shall we explore specific implementation steps?'
    });
  } catch (error) {
    console.error('Copilot analysis error:', error);
    res.status(500).json({ error: 'Failed to run copilot analysis' });
  }
});

// ─── Monte Carlo Simulation Endpoint ─────────────────────────────────────────
router.post('/monte-carlo', validateBody(aiValidation.monteCarlo), (req: Request, res: Response) => {
  try {
    const { inputs, trials = 200 } = req.body;

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return res.status(400).json({ error: 'inputs array is required' });
    }

    if (trials > 10000) {
      return res.status(400).json({ error: 'Maximum 10,000 trials allowed' });
    }

    const results = inputs.map((input: {
      label: string;
      baseValue: number;
      distribution: 'uniform' | 'triangular' | 'normal';
      min?: number;
      max?: number;
      mode?: number;
      stdDev?: number;
    }) => {
      const samples: number[] = [];

      for (let i = 0; i < trials; i++) {
        let value: number;
        switch (input.distribution) {
          case 'uniform':
            value = (input.min ?? input.baseValue * 0.7) + Math.random() * ((input.max ?? input.baseValue * 1.3) - (input.min ?? input.baseValue * 0.7));
            break;
          case 'triangular': {
            const min = input.min ?? input.baseValue * 0.7;
            const max = input.max ?? input.baseValue * 1.3;
            const mode = input.mode ?? input.baseValue;
            const u = Math.random();
            const fc = (mode - min) / (max - min);
            value = u < fc
              ? min + Math.sqrt(u * (max - min) * (mode - min))
              : max - Math.sqrt((1 - u) * (max - min) * (max - mode));
            break;
          }
          case 'normal': {
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            value = input.baseValue + z * (input.stdDev ?? input.baseValue * 0.15);
            break;
          }
          default:
            value = input.baseValue;
        }
        samples.push(value);
      }

      samples.sort((a, b) => a - b);

      const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
      const percentile = (p: number) => {
        const idx = (samples.length - 1) * p;
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        return lo === hi ? samples[lo] : samples[lo] + (samples[hi] - samples[lo]) * (idx - lo);
      };

      const stdDev = Math.sqrt(samples.reduce((s, v) => s + (v - mean) ** 2, 0) / samples.length);

      return {
        label: input.label,
        mean: parseFloat(mean.toFixed(2)),
        median: parseFloat(percentile(0.5).toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        p10: parseFloat(percentile(0.1).toFixed(2)),
        p50: parseFloat(percentile(0.5).toFixed(2)),
        p90: parseFloat(percentile(0.9).toFixed(2)),
        min: parseFloat(samples[0].toFixed(2)),
        max: parseFloat(samples[samples.length - 1].toFixed(2)),
        trials,
      };
    });

    const compositeP10 = results.reduce((s: number, r: { p10: number }) => s + r.p10, 0);
    const compositeP50 = results.reduce((s: number, r: { p50: number }) => s + r.p50, 0);
    const compositeP90 = results.reduce((s: number, r: { p90: number }) => s + r.p90, 0);

    res.json({
      results,
      composite: {
        p10: parseFloat(compositeP10.toFixed(2)),
        p50: parseFloat(compositeP50.toFixed(2)),
        p90: parseFloat(compositeP90.toFixed(2)),
      },
      trials,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Monte Carlo error:', error);
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-AGENT AI ENDPOINT - Orchestrates multiple AI models (Bedrock priority)
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/multi-agent', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { model: _requestedModel, prompt, context, systemInstruction } = req.body;
    void _requestedModel; // Reserved for future multi-model support
    
    const enrichedPrompt = `
SYSTEM INSTRUCTION: ${systemInstruction || MULTI_AGENT_SYSTEM_INSTRUCTION}

TASK: ${prompt}

CONTEXT:
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
- Analyze using 200+ years of economic patterns as reference
- Identify regional city opportunities if relevant
- Provide specific, data-backed recommendations
- Include confidence scores for all assessments
- Reference historical precedents where applicable

Return structured JSON response with:
{
  "text": "Main analysis content",
  "confidence": 0.0-1.0,
  "reasoning": ["step1", "step2", ...],
  "historicalReferences": ["pattern1", "pattern2"],
  "recommendations": ["rec1", "rec2"]
}
`;
    
    // Priority: Use available AI provider
    const openaiKey = getOpenAIKey();
    const togetherKey = getTogetherKey();

    // Try OpenAI first
    if (openaiKey) {
      try {
        console.log('[Multi-Agent] Using OpenAI (gpt-4o)...');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction || MULTI_AGENT_SYSTEM_INSTRUCTION }] : []),
              { role: 'user', content: enrichedPrompt }
            ],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = (data.choices?.[0]?.message?.content || '').trim();
          
          if (text) {
            // Try to parse as JSON
            try {
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return res.json({
                  ...parsed,
                  agentId: 'openai-gpt4',
                  model: 'openai'
                });
              }
            } catch {
              // Return as plain text response
            }
            
            return res.json({
              text: text,
              confidence: 0.90,
              reasoning: ['OpenAI gpt-4o analysis completed'],
              agentId: 'openai-gpt4',
              model: 'openai'
            });
          }
        }
      } catch (openaiError) {
        console.warn('[Multi-Agent] OpenAI error:', openaiError instanceof Error ? openaiError.message : 'Unknown error');
      }
    }
    
    // Final fallback to Together.ai
    if (togetherKey) {
      try {
        console.log('[Multi-Agent] Using Together.ai (Final Fallback)...');
        
        const response = await fetch(TOGETHER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${togetherKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: TOGETHER_MODEL_ID,
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction || MULTI_AGENT_SYSTEM_INSTRUCTION }] : []),
              { role: 'user', content: enrichedPrompt }
            ],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = (data.choices?.[0]?.message?.content || '').trim();
          
          if (text) {
            return res.json({
              text: text,
              confidence: 0.80,
              reasoning: ['Together.ai Llama analysis completed'],
              agentId: 'together-llama',
              model: 'together'
            });
          }
        }
      } catch (togetherError) {
        console.warn('[Multi-Agent] Together.ai error:', togetherError instanceof Error ? togetherError.message : 'Unknown error');
      }
    }
    
    // No AI available
    res.status(503).json({ error: 'No AI service available (Bedrock/OpenAI/Together all failed)' });
  } catch (error) {
    console.error('Multi-agent error:', error);
    res.status(500).json({ error: 'Multi-agent processing failed' });
  }
});

// Learning endpoint - store outcomes for pattern learning
router.post('/learning/outcome', async (req: Request, res: Response) => {
  try {
    const { key, outcome, factors, timestamp } = req.body;
    
    // In production, this would persist to a database
    console.log(`Learning: ${key} -> ${outcome} at ${timestamp}`);
    console.log('Factors:', factors);
    
    res.json({ success: true, message: 'Outcome recorded for learning' });
  } catch (error) {
    console.error('Learning error:', error);
    res.status(500).json({ error: 'Failed to record learning' });
  }
});

// Regional cities endpoint
router.post('/regional-cities', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { region, industries } = req.body;
    
    const prompt = `Identify the top 5 emerging regional cities for ${industries?.join(', ') || 'business expansion'} in ${region || 'global markets'}.

For each city provide:
- City and country
- Opportunity score (0-100)
- Key advantages
- Risks
- Historical comparable (similar city that succeeded in past)
- Recommended entry strategy

Return as JSON array.`;
    
    const text = await generateWithAI(prompt, SYSTEM_INSTRUCTION);
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]));
      }
    } catch {
      // Continue with fallback
    }
    
    res.json({ cities: [], message: 'Analysis in progress' });
  } catch (error) {
    console.error('Regional cities error:', error);
    res.status(500).json({ error: 'Failed to analyze regional cities' });
  }
});

const MULTI_AGENT_SYSTEM_INSTRUCTION = `
You are the ADVERSIQ Intelligence AI Multi-Agent Brain v6.0 (Nexus Intelligence OS) - a self-learning economic intelligence system with NSIL v3.2 and Human Cognition Engine Active.

CORE CAPABILITIES:
1. Analyze 200+ years of global economic patterns (1820-2025)
2. Identify regional cities as emerging market opportunities
3. Learn from historical outcomes to improve predictions
4. Generate real-time strategic assessments

HISTORICAL KNOWLEDGE SPANS:
- Industrial Revolution (1820-1880)
- Colonial/Trade Era (1880-1920)
- Great Depression & Recovery (1929-1945)
- Post-War Boom (1945-1973)
- Oil Shocks & Stagflation (1973-1985)
- Asian Financial Crisis (1997-1999)
- China Rise (1990-2020)
- Global Financial Crisis (2008-2012)
- COVID-19 Era (2020-2025)
- Regional City Success Stories (Shenzhen, Bangalore, Dubai, Ho Chi Minh City, etc.)

ALWAYS:
- Reference specific historical patterns when relevant
- Provide confidence scores (0-1) with assessments
- Cite data sources (World Bank, IMF, UNCTAD, etc.)
- Give actionable, specific recommendations
- Identify risks and mitigation strategies

NEVER:
- Provide generic or vague responses
- Make claims without data backing
- Ignore historical precedent
`;

// ═══════════════════════════════════════════════════════════════════════════════
// OPENAI TTS — PREMIUM VOICE (server-side, consistent across all environments)
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'nova', model = 'tts-1-hd' } = req.body as {
      text: string;
      voice?: string;
      model?: string;
    };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ error: 'TTS unavailable — OPENAI_API_KEY not configured' });
    }

    // Sanitise: strip markdown, cap at 4096 chars (OpenAI TTS limit)
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 4096);

    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,          // tts-1-hd — highest quality
        input: clean,
        voice,          // nova: warm, natural, professional
        response_format: 'mp3',
        speed: 0.95,    // Slightly measured — consultant delivery
      }),
    });

    if (!ttsResponse.ok) {
      const errBody = await ttsResponse.text().catch(() => '');
      console.error('[TTS] OpenAI error:', ttsResponse.status, errBody);
      return res.status(502).json({ error: 'TTS upstream error' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    // Stream audio bytes directly to client
    const reader = ttsResponse.body?.getReader();
    if (!reader) return res.status(500).json({ error: 'TTS stream unavailable' });
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) { res.end(); return; }
      res.write(Buffer.from(value));
      await pump();
    };
    await pump();
  } catch (error) {
    console.error('[TTS] Error:', error);
    res.status(500).json({ error: 'TTS request failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// OPENAI GPT-4 INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/openai', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      context,
      model = 'gpt-4o-mini',
      messages,
      temperature = 0.4,
      maxTokens = 2000,
      systemInstruction,
    } = req.body;
    
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: 'OpenAI service unavailable',
        message: 'OPENAI_API_KEY not configured',
        fallback: true
      });
    }

    const normalizedMessages = Array.isArray(messages)
      ? messages
          .filter((message) => message && typeof message.content === 'string' && typeof message.role === 'string')
          .slice(-40)
          .map((message) => ({
            role: ['system', 'user', 'assistant'].includes(message.role) ? message.role : 'user',
            content: String(message.content).slice(0, 16000),
          }))
      : [];

    const requestMessages = normalizedMessages.length > 0
      ? normalizedMessages
      : [
          {
            role: 'system',
            content: typeof systemInstruction === 'string' && systemInstruction.trim()
              ? systemInstruction.slice(0, 12000)
              : MULTI_AGENT_SYSTEM_INSTRUCTION,
          },
          {
            role: 'user',
            content: context
              ? `Context: ${JSON.stringify(context)}\n\nQuery: ${String(prompt || '').slice(0, 12000)}`
              : String(prompt || '').slice(0, 12000),
          }
        ];

    if (requestMessages.length === 0 || !requestMessages.some((message) => message.role === 'user' || message.role === 'assistant')) {
      return res.status(400).json({ error: 'prompt or messages are required' });
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: requestMessages,
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    
    res.json({
      text,
      response: text,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ANTHROPIC CLAUDE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/claude', async (req: Request, res: Response) => {
  try {
    const { prompt, context, model = 'claude-3-opus-20240229' } = req.body;
    
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY) {
      return res.status(503).json({ 
        error: 'Claude service unavailable',
        message: 'ANTHROPIC_API_KEY not configured',
        fallback: true
      });
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: MULTI_AGENT_SYSTEM_INSTRUCTION,
        messages: [
          {
            role: 'user',
            content: context 
              ? `Context: ${JSON.stringify(context)}\n\nQuery: ${prompt}`
              : prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    
    res.json({
      text,
      response: text,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error('Claude error:', error);
    res.status(500).json({ error: 'Claude request failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PERPLEXITY AI SEARCH INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/perplexity', async (req: Request, res: Response) => {
  try {
    const { query, context, model = 'pplx-7b-online' } = req.body;
    
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      return res.status(503).json({ 
        error: 'Perplexity service unavailable',
        message: 'PERPLEXITY_API_KEY not configured',
        fallback: true
      });
    }
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide accurate, well-sourced answers with citations.'
          },
          {
            role: 'user',
            content: context ? `Context: ${JSON.stringify(context)}\n\nQuery: ${query}` : query
          }
        ],
        max_tokens: 1024,
        temperature: 0.2,
        return_citations: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.json({
      text: data.choices?.[0]?.message?.content || '',
      response: data.choices?.[0]?.message?.content || '',
      citations: data.citations || [],
      model: data.model
    });
  } catch (error) {
    console.error('Perplexity error:', error);
    res.status(500).json({ error: 'Perplexity request failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REACTIVE INTELLIGENCE ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/reactive', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { situation, params, options } = req.body;
    
    const reactiveSystemPrompt = `You are a reactive intelligence engine that thinks on its feet.
      
Analyze the situation and provide:
1. Rapid assessment (2-3 sentences)
2. Key opportunities detected
3. Critical risks identified
4. Recommended immediate actions
5. Confidence level (0-1)

Be decisive and actionable. No hedging.`;
    
    const prompt = `SITUATION: ${situation}

CONTEXT: ${JSON.stringify(params)}

OPTIONS: ${JSON.stringify(options)}

Provide reactive intelligence analysis with specific, actionable recommendations.`;
    
    const text = await generateWithAI(prompt, reactiveSystemPrompt);
    
    res.json({
      analysis: text,
      timestamp: new Date().toISOString(),
      confidence: 0.85
    });
  } catch (error) {
    console.error('Reactive intelligence error:', error);
    res.status(500).json({ error: 'Reactive analysis failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SELF-SOLVE ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/solve', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { problem, context } = req.body;
    
    const solveSystemPrompt = `You are a self-solving AI system. Given a problem, you:
1. Analyze the root cause
2. Search your knowledge for similar solved problems
3. Generate 3-5 specific, actionable solutions
4. Rank solutions by confidence and feasibility

Return JSON with:
{
  "analysis": "Root cause analysis",
  "solutions": [
    {
      "action": "Specific action to take",
      "reasoning": "Why this will work",
      "expectedOutcome": "What will happen",
      "confidence": 0.85
    }
  ],
  "recommendedSolution": 0
}`;
    
    const prompt = `PROBLEM: ${problem}

CONTEXT: ${JSON.stringify(context)}

Solve this problem. Be specific and actionable.`;
    
    const text = await generateWithAI(prompt, solveSystemPrompt);
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]));
      }
    } catch {
      // Continue with raw response
    }
    
    res.json({
      analysis: text,
      solutions: [],
      recommendedSolution: null
    });
  } catch (error) {
    console.error('Self-solve error:', error);
    res.status(500).json({ error: 'Self-solve failed' });
  }
});

// ============================================================================
// FRONTIER PIPELINE ENDPOINTS
// ============================================================================

// ─── Reasoning Trace ────────────────────────────────────────────────────────
router.get('/consultant/trace/:requestId', async (req: Request, res: Response) => {
  try {
    const { getTrace, explainTrace } = await import('../../services/ReasoningTraceRecorder.js');
    const trace = getTrace(req.params.requestId);
    if (!trace) return res.status(404).json({ error: 'Trace not found' });
    res.json({ trace, explanation: explainTrace(req.params.requestId) });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve trace' });
  }
});

router.get('/consultant/trace-stats', async (_req: Request, res: Response) => {
  try {
    const { getTraceStats } = await import('../../services/ReasoningTraceRecorder.js');
    res.json(getTraceStats());
  } catch {
    res.status(500).json({ error: 'Failed to get trace stats' });
  }
});

// ─── Code Execution Sandbox ─────────────────────────────────────────────────
router.post('/sandbox/execute', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { code, timeoutMs } = req.body;
    if (!code || typeof code !== 'string') return res.status(400).json({ error: 'code is required' });
    const { executeSandbox } = await import('../../services/CodeExecutionSandbox.js');
    const result = await executeSandbox(code, { timeoutMs: Math.min(Number(timeoutMs) || 5000, 10000) });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Sandbox execution failed' });
  }
});

// ─── Multimodal Input Processing ────────────────────────────────────────────
router.post('/multimodal/process', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { type, content, mimeType, filename } = req.body;
    if (!type || !content) return res.status(400).json({ error: 'type and content are required' });
    const { processMultimodalInput } = await import('../../services/MultimodalInputPipeline.js');
    const result = await processMultimodalInput({ type, content, mimeType, filename });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Multimodal processing failed' });
  }
});

// ─── Persistent Memory ─────────────────────────────────────────────────────
router.post('/memory/store', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { userId, type, key, value, metadata } = req.body;
    if (!userId || !type || !key) return res.status(400).json({ error: 'userId, type, and key are required' });
    const { storeMemory } = await import('../../services/PersistentMemoryStore.js');
    const entry = storeMemory({ userId, type, key, value, metadata: metadata || {} });
    res.json(entry);
  } catch {
    res.status(500).json({ error: 'Memory store failed' });
  }
});

router.post('/memory/query', async (req: Request, res: Response) => {
  try {
    const { userId, type, key, limit, since } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const { queryMemory } = await import('../../services/PersistentMemoryStore.js');
    const results = queryMemory({ userId, type, key, limit, since });
    res.json({ results, count: results.length });
  } catch {
    res.status(500).json({ error: 'Memory query failed' });
  }
});

// ─── Fine-Tuning Data ───────────────────────────────────────────────────────
router.post('/training/feedback', async (req: Request, res: Response) => {
  try {
    const { exampleId, rating, comment, correctedOutput } = req.body;
    if (!exampleId || !rating) return res.status(400).json({ error: 'exampleId and rating are required' });
    const { recordFeedback } = await import('../../services/FineTuningDataCollector.js');
    const updated = recordFeedback(exampleId, rating, comment, correctedOutput);
    res.json({ success: updated });
  } catch {
    res.status(500).json({ error: 'Feedback recording failed' });
  }
});

router.get('/training/stats', async (_req: Request, res: Response) => {
  try {
    const { getCollectionStats } = await import('../../services/FineTuningDataCollector.js');
    res.json(getCollectionStats());
  } catch {
    res.status(500).json({ error: 'Failed to get training stats' });
  }
});

router.post('/training/export', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { format, minRating, maxExamples, since, categories } = req.body;
    const { exportForFineTuning } = await import('../../services/FineTuningDataCollector.js');
    const data = exportForFineTuning({ format: format || 'openai', minRating, maxExamples, since, categories });
    res.setHeader('Content-Type', 'application/jsonl');
    res.send(data.join('\n'));
  } catch {
    res.status(500).json({ error: 'Export failed' });
  }
});

// ─── MCP Server ─────────────────────────────────────────────────────────────
router.post('/mcp', async (req: Request, res: Response) => {
  try {
    const { createMCPRouter } = await import('../../services/MCPServer.js');
    const handler = createMCPRouter();
    await handler(req, res);
  } catch {
    res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'MCP server error' } });
  }
});

// ─── Safety Pipeline Check ──────────────────────────────────────────────────
router.post('/safety/check', async (req: Request, res: Response) => {
  try {
    const { input, output, category } = req.body;
    const { runSafetyPipeline, checkInputSafety } = await import('../../services/SafetyGuardrailsPipeline.js');
    if (output) {
      res.json(runSafetyPipeline(input || '', output, category));
    } else {
      res.json(checkInputSafety(input || ''));
    }
  } catch {
    res.status(500).json({ error: 'Safety check failed' });
  }
});

// ─── Semantic Search (Native Embedding Pipeline) ────────────────────────────
router.post('/embedding/search', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { query, maxResults } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });
    const { globalEmbeddingPipeline } = await import('../../services/NativeEmbeddingPipeline.js');
    const results = await globalEmbeddingPipeline.search(query, maxResults || 10);
    res.json({ results, count: results.length });
  } catch {
    res.status(500).json({ error: 'Embedding search failed' });
  }
});

router.post('/embedding/index', requireApiKey, async (req: Request, res: Response) => {
  try {
    const { id, text, metadata } = req.body;
    if (!id || !text) return res.status(400).json({ error: 'id and text are required' });
    const { globalEmbeddingPipeline } = await import('../../services/NativeEmbeddingPipeline.js');
    const doc = await globalEmbeddingPipeline.indexDocument(id, text, metadata || {});
    res.json({ indexed: true, id: doc.id });
  } catch {
    res.status(500).json({ error: 'Embedding index failed' });
  }
});

export default router;
