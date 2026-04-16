/**
 * OPTIMIZED AGENTIC BRAIN - The Fast-Thinking NSIL Core
 * 
 * This is the main orchestrator that combines all optimization algorithms
 * to create a proactive, fast-thinking agentic intelligence system.
 * 
 * Performance Target: Think in 1-3 seconds instead of 10-30 seconds
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  INPUT LAYER                                                    │
 * │  ├─ SAT Contradiction Solver (validates inputs)                │
 * │  └─ Vector Memory Index (retrieves similar cases)              │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  REASONING LAYER (parallel execution)                          │
 * │  ├─ DAG Scheduler (21 formulas with dependencies)              │
 * │  ├─ Bayesian Debate Engine (5 personas with early stopping)    │
 * │  └─ Lazy Eval Engine (derivative indices on demand)            │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  SYNTHESIS LAYER                                                │
 * │  ├─ Decision Tree Synthesizer (template selection)             │
 * │  └─ Gradient Ranking Engine (case relevance)                   │
 * ├─────────────────────────────────────────────────────────────────┤
 * │  OUTPUT LAYER                                                   │
 * │  └─ Executive Brief + Report Payload + Insights                │
 * └─────────────────────────────────────────────────────────────────┘
 */

import type { ReportParameters, CopilotInsight } from '../../types';

// Algorithm imports
import { globalVectorIndex, SimilarityResult } from './VectorMemoryIndex';
import { satSolver, ContradictionResult } from './SATContradictionSolver';
import { bayesianDebateEngine, BayesianDebateResult, BeliefState } from './BayesianDebateEngine';
import { dagScheduler, DAGExecutionResult } from './DAGScheduler';
import { lazyEvalEngine, LazyEvalStats } from './LazyEvalEngine';
import { decisionTreeSynthesizer, SynthesisResult } from './DecisionTreeSynthesizer';
import { gradientRankingEngine, RankedCase } from './GradientRankingEngine';
import { computeFrontierIntelligence } from './FrontierIntelligenceEngine';
import { CompositeScoreService } from '../CompositeScoreService';
import { HumanCognitionEngine, HumanCognitionResult } from './HumanCognitionEngine';
import { type ToolResult } from './ToolRegistry';
import { AutonomousLoopController, type LoopResult, type LoopIteration } from './AutonomousLoopController';
import { runTribunal, getAvailableJudges, type TribunalSynthesis } from '../ReasoningTribunal';

// ============================================================================
// TYPES
// ============================================================================

export interface AgenticBrainConfig {
  enableMemoryRetrieval: boolean;
  enableContradictionCheck: boolean;
  enableDebate: boolean;
  enableFormulaExecution: boolean;
  enableTemplateSelection: boolean;
  enableHumanCognition: boolean;
  enableAutonomousLoop: boolean;
  enableToolCalling: boolean;
  enableHybridSearch: boolean;
  /** Escalate to multi-model Reasoning Tribunal when debate consensus is weak. */
  enableTribunalEscalation: boolean;
  /** Tribunal fires when consensus strength is below this threshold. */
  tribunalThreshold: number;
  maxSimilarCases: number;
  debateEarlyStopThreshold: number;
  parallelExecution: boolean;
  loopMaxIterations: number;
  loopConfidenceThreshold: number;
}

export interface AgenticBrainResult {
  runId: string;
  startedAt: string;
  completedAt: string;
  
  // Input validation
  inputValidation: {
    contradictions: ContradictionResult;
    isValid: boolean;
    trustScore: number;
  };
  
  // Memory retrieval
  memory: {
    similarCases: SimilarityResult[];
    rankedCases: RankedCase[];
    caseCount: number;
  };
  
  // Reasoning results
  reasoning: {
    debate: BayesianDebateResult;
    formulas: DAGExecutionResult;
    lazyStats: LazyEvalStats;
  };
  
  // Synthesis
  synthesis: {
    template: SynthesisResult;
    recommendation: keyof BeliefState;
    confidenceScore: number;
  };
  
  // Executive brief
  executiveBrief: {
    proceedSignal: 'proceed' | 'pause' | 'restructure' | 'reject';
    headline: string;
    topDrivers: string[];
    topRisks: string[];
    nextActions: string[];
    consensusStrength: number;
  };
  
  // Insights for UI
  insights: CopilotInsight[];
  
  // Performance metrics
  performance: {
    totalTimeMs: number;
    inputValidationMs: number;
    memoryRetrievalMs: number;
    reasoningMs: number;
    synthesisMs: number;
    speedupFactor: number;
  };
  
  // Human cognition processing
  humanCognition?: HumanCognitionResult;
  
  // Frontier intelligence
  frontierIntelligence?: Awaited<ReturnType<typeof computeFrontierIntelligence>>;

  // Autonomous loop results
  autonomousLoop?: LoopResult;

  // Reasoning Tribunal escalation (when debate consensus is weak)
  tribunalEscalation?: TribunalSynthesis;
  
  // Tool calls made during this run
  toolCalls?: ToolResult[];
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: AgenticBrainConfig = {
  enableMemoryRetrieval: true,
  enableContradictionCheck: true,
  enableDebate: true,
  enableFormulaExecution: true,
  enableTemplateSelection: true,
  enableHumanCognition: true,
  enableAutonomousLoop: true,
  enableToolCalling: true,
  enableHybridSearch: true,
  enableTribunalEscalation: true,
  tribunalThreshold: 0.60,
  maxSimilarCases: 5,
  debateEarlyStopThreshold: 0.75,
  parallelExecution: true,
  loopMaxIterations: 3,
  loopConfidenceThreshold: 0.65,
};

// ============================================================================
// OPTIMIZED AGENTIC BRAIN
// ============================================================================

export class OptimizedAgenticBrain {
  private config: AgenticBrainConfig;
  private reportCorpus: ReportParameters[] = [];
  private humanCognitionEngine: HumanCognitionEngine;
  private _onIterationCallback?: (iteration: LoopIteration) => void;

  constructor(config: Partial<AgenticBrainConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.humanCognitionEngine = new HumanCognitionEngine();
  }

  /**
   * Set callback for streaming autonomous loop progress
   */
  onLoopIteration(cb: (iteration: LoopIteration) => void): void {
    this._onIterationCallback = cb;
  }

  /**
   * Load prior cases into memory for similarity search
   */
  async loadMemory(cases: ReportParameters[]): Promise<void> {
    this.reportCorpus = cases;
    for (const c of cases) {
      if (c.id) {
        globalVectorIndex.indexReport(c);
      }
    }
  }

  /**
   * Run the full agentic brain pipeline
   * Target: Complete in 1-3 seconds
   */
  async think(params: ReportParameters): Promise<AgenticBrainResult> {
    const startTime = Date.now();
    const runId = `BRAIN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const startedAt = new Date().toISOString();
    
    const performance = {
      totalTimeMs: 0,
      inputValidationMs: 0,
      memoryRetrievalMs: 0,
      reasoningMs: 0,
      synthesisMs: 0,
      speedupFactor: 1
    };

    // ========================================================================
    // PHASE 1: INPUT VALIDATION (SAT Solver)
    // ========================================================================
    const validationStart = Date.now();
    const contradictions = this.config.enableContradictionCheck 
      ? satSolver.analyze(params)
      : { isSatisfiable: true, contradictions: [], warnings: [], confidence: 100, clauses: [] };
    performance.inputValidationMs = Date.now() - validationStart;

    const inputValidation = {
      contradictions,
      isValid: contradictions.isSatisfiable,
      trustScore: contradictions.confidence
    };

    // ========================================================================
    // PHASE 2: MEMORY RETRIEVAL (Vector Index + Gradient Ranking)
    // ========================================================================
    const memoryStart = Date.now();
    let similarCases: SimilarityResult[] = [];
    let rankedCases: RankedCase[] = [];

    if (this.config.enableMemoryRetrieval) {
      // Use hybrid search (vector + keyword + temporal decay + query expansion)
      if (this.config.enableHybridSearch) {
        similarCases = globalVectorIndex.hybridSearch(params, {
          maxResults: this.config.maxSimilarCases,
          enableQueryExpansion: true,
          temporalDecayDays: 365,
          reasoningContext: {
            riskLevel: params.riskTolerance,
            focusAreas: params.strategicIntent,
          },
        });
      } else {
        // Fallback to basic ANN search
        similarCases = globalVectorIndex.findSimilar(params, this.config.maxSimilarCases);
      }
      
      // Apply gradient-boosted ranking for final ordering
      if (similarCases.length > 0) {
        const casesForRanking = similarCases.map(sc => ({
          id: sc.id,
          ...sc.embedding.metadata
        }));
        const rankResult = gradientRankingEngine.rankCases(params, casesForRanking);
        rankedCases = rankResult.rankedCases;
      }
    }
    performance.memoryRetrievalMs = Date.now() - memoryStart;

    const memory = {
      similarCases,
      rankedCases,
      caseCount: similarCases.length
    };

    // ========================================================================
    // PHASE 3: PARALLEL REASONING (Debate + Formulas)
    // ========================================================================
    const reasoningStart = Date.now();
    
    let debate: BayesianDebateResult;
    let formulas: DAGExecutionResult;

    if (this.config.parallelExecution) {
      // Run debate and formulas in parallel
      const [debateResult, formulaResult] = await Promise.all([
        this.config.enableDebate 
          ? bayesianDebateEngine.runDebate(params)
          : this.emptyDebate(),
        this.config.enableFormulaExecution
          ? dagScheduler.execute(params)
          : this.emptyFormulas()
      ]);
      debate = debateResult;
      formulas = formulaResult;
    } else {
      // Sequential execution (for debugging)
      debate = this.config.enableDebate 
        ? await bayesianDebateEngine.runDebate(params)
        : await this.emptyDebate();
      formulas = this.config.enableFormulaExecution
        ? await dagScheduler.execute(params)
        : await this.emptyFormulas();
    }

    // Get lazy eval stats
    lazyEvalEngine.initialize(params);
    const lazyStats = lazyEvalEngine.getStats();

    performance.reasoningMs = Date.now() - reasoningStart;

    const reasoning = { debate, formulas, lazyStats };

    // ========================================================================
    // PHASE 4: SYNTHESIS (Template Selection)
    // ========================================================================
    const synthesisStart = Date.now();
    
    const template = this.config.enableTemplateSelection
      ? decisionTreeSynthesizer.selectTemplate(params)
      : this.emptyTemplate();

    performance.synthesisMs = Date.now() - synthesisStart;

    const synthesis = {
      template,
      recommendation: debate.recommendation,
      confidenceScore: debate.consensusStrength * 100
    };

    // ========================================================================
    // PHASE 5: HUMAN COGNITION PROCESSING (runs BEFORE brief so it can influence it)
    // ========================================================================
    let humanCognition: HumanCognitionResult | undefined;
    if (this.config.enableHumanCognition) {
      humanCognition = await this.humanCognitionEngine.process(params);
    }

    // ========================================================================
    // PHASE 6: BUILD EXECUTIVE BRIEF (HCE-integrated)
    // ========================================================================
    const executiveBrief = this.buildExecutiveBrief(
      params, 
      debate, 
      formulas, 
      contradictions,
      similarCases,
      humanCognition
    );

    // ========================================================================
    // PHASE 7: GENERATE INSIGHTS FOR UI
    // ========================================================================
    const composite = await CompositeScoreService.getScores(params);
    const frontierIntelligence = await computeFrontierIntelligence(params, { composite });

    const insights = this.buildInsights(
      runId,
      params,
      executiveBrief,
      memory,
      reasoning,
      synthesis,
      frontierIntelligence,
      humanCognition
    );

    // ========================================================================
    // PHASE 8: AUTONOMOUS LOOP — Re-analyze if confidence is low
    // ========================================================================
    let loopResult: LoopResult | undefined;
    let toolCalls: ToolResult[] = [];

    if (this.config.enableAutonomousLoop && executiveBrief.consensusStrength < this.config.loopConfidenceThreshold) {
      const loopController = new AutonomousLoopController({
        maxIterations: this.config.loopMaxIterations,
        confidenceThreshold: this.config.loopConfidenceThreshold,
        contradictionThreshold: 0.3,
        enableToolCalls: this.config.enableToolCalling,
        timeBudgetMs: 15000,
      });

      // Stream iteration progress
      if (this._onIterationCallback) {
        loopController.onIteration(this._onIterationCallback);
      }

      loopResult = await loopController.run(
        params.problemStatement || 'general analysis',
        params as unknown as Record<string, unknown>,
        async (enrichedCtx, iteration) => {
          // Re-run debate with enriched context on deeper iterations
          if (iteration > 0 && this.config.enableDebate) {
            const reDebate = await bayesianDebateEngine.runDebate(params);
            return {
              confidence: reDebate.consensusStrength,
              contradictions: contradictions.contradictions.length / 10,
              result: reDebate,
            };
          }
          return {
            confidence: executiveBrief.consensusStrength,
            contradictions: contradictions.contradictions.length / 10,
            result: executiveBrief,
          };
        }
      );

      toolCalls = loopResult.toolResults;

      // If loop improved confidence, update the executive brief
      if (loopResult.finalConfidence > executiveBrief.consensusStrength) {
        executiveBrief.consensusStrength = loopResult.finalConfidence;
        executiveBrief.headline = `[Loop-verified: ${loopResult.totalIterations} passes] ${executiveBrief.headline}`;
      }
    }

    // ========================================================================
    // TRIBUNAL ESCALATION (when consensus remains weak after debate + loop)
    // ========================================================================
    let tribunalEscalation: TribunalSynthesis | undefined;

    if (
      this.config.enableTribunalEscalation &&
      executiveBrief.consensusStrength < this.config.tribunalThreshold &&
      getAvailableJudges().length > 0
    ) {
      console.log(`[AgenticBrain] Debate consensus weak (${(executiveBrief.consensusStrength * 100).toFixed(0)}%) — escalating to Reasoning Tribunal`);
      try {
        const tribunalQuestion = [
          `CONTEXT: A strategic analysis has been conducted but the 5-persona debate could not reach consensus (strength: ${(executiveBrief.consensusStrength * 100).toFixed(0)}%).`,
          `PROBLEM: ${params.problemStatement || 'No problem statement provided'}`,
          `COUNTRY: ${params.country || 'Not specified'}`,
          `INDUSTRY: ${(params.industry || []).join(', ') || 'Not specified'}`,
          `TOP RISKS: ${executiveBrief.topRisks.join('; ')}`,
          `TOP DRIVERS: ${executiveBrief.topDrivers.join('; ')}`,
          `DEBATE RESULT: ${executiveBrief.proceedSignal} — ${executiveBrief.headline}`,
          `\nPlease provide a deep analysis: Should this proceed, pause, restructure, or be rejected? What are the second-order effects being missed?`,
        ].join('\n');

        tribunalEscalation = await runTribunal(tribunalQuestion, {
          claudeThinkingBudget: 10000,
          geminiThinkingBudget: 8192,
          judgeTimeout: 90000,
        });

        // If tribunal reached higher confidence, upgrade the brief
        if (tribunalEscalation.confidence > executiveBrief.consensusStrength) {
          executiveBrief.consensusStrength = tribunalEscalation.confidence;
          executiveBrief.headline = `[Tribunal-verified: ${tribunalEscalation.judgesAvailable} judges] ${executiveBrief.headline}`;
        }
      } catch (err) {
        console.warn('[AgenticBrain] Tribunal escalation failed:', err instanceof Error ? err.message : err);
      }
    }

    // ========================================================================
    // FINALIZE
    // ========================================================================
    const completedAt = new Date().toISOString();
    performance.totalTimeMs = Date.now() - startTime;
    
    // Calculate speedup (estimate sequential time)
    const estimatedSequentialMs = 
      performance.inputValidationMs + 
      performance.memoryRetrievalMs + 
      (debate.maxRounds * 200) + // Full 5 rounds at 200ms each
      (21 * 50) + // 21 formulas at 50ms each
      performance.synthesisMs;
    performance.speedupFactor = estimatedSequentialMs / Math.max(1, performance.totalTimeMs);

    return {
      runId,
      startedAt,
      completedAt,
      inputValidation,
      memory,
      reasoning,
      synthesis,
      executiveBrief,
      insights,
      performance,
      humanCognition,
      frontierIntelligence,
      autonomousLoop: loopResult,
      tribunalEscalation,
      toolCalls,
    };
  }

  /**
   * Quick think - minimal processing for fast preview
   */
  async quickThink(params: ReportParameters): Promise<{
    recommendation: keyof BeliefState;
    confidence: number;
    topRisk: string;
    topOpportunity: string;
    timeMs: number;
  }> {
    const start = Date.now();
    
    // Just run quick consensus check
    const quickConsensus = bayesianDebateEngine.quickConsensus(params);
    
    // Quick contradiction check
    const quickCheck = satSolver.quickCheck(params);
    
    const topRisk = quickCheck.hasContradictions 
      ? 'Input contradictions detected'
      : params.riskTolerance === 'high' 
        ? 'High risk tolerance may overlook dangers'
        : 'Standard risk profile';
    
    const topOpportunity = params.strategicIntent?.length
      ? `Strategic intent: ${params.strategicIntent[0]}`
      : 'Strategic intent not specified';

    return {
      recommendation: quickConsensus.likely,
      confidence: quickConsensus.confidence,
      topRisk,
      topOpportunity,
      timeMs: Date.now() - start
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private buildExecutiveBrief(
    params: ReportParameters,
    debate: BayesianDebateResult,
    formulas: DAGExecutionResult,
    contradictions: ContradictionResult,
    similarCases: SimilarityResult[],
    humanCognition?: HumanCognitionResult
  ): AgenticBrainResult['executiveBrief'] {
    // ── Human Cognition Engine modifiers ────────────────────────────────────
    // HCE outputs now actively shape the executive decision, not just add insights.
    let hceBiasAdjustment = 0;        // shifts consensus strength
    let hceRiskAmplification = 1.0;   // amplifies risk signals
    let hceAttentionDrivers: string[] = [];
    let hceEmotionalFlag = '';

    if (humanCognition) {
      // 1. Free-energy reduction → higher = more certain decision
      const feReduction = humanCognition.freeEnergyOptimization.initialFreeEnergy -
                          humanCognition.freeEnergyOptimization.finalFreeEnergy;
      hceBiasAdjustment = Math.min(feReduction * 0.02, 0.10);  // up to +10% consensus

      // 2. Attention allocation → surfaced blind spots weaken consensus
      if (humanCognition.attentionAllocation.attentionShifts > 5) {
        hceBiasAdjustment -= 0.05; // many attention shifts = uncertainty
        hceAttentionDrivers.push(
          `HCE detected ${humanCognition.attentionAllocation.attentionShifts} attention shifts - uncertainty present`
        );
      }

      // 3. Emotional processing → negative valence amplifies risk perception
      if (humanCognition.emotionalResponse) {
        const valence = humanCognition.emotionalResponse.finalEmotion?.valence ?? 0;
        if (valence < -0.3) {
          hceRiskAmplification = 1.25;
          hceEmotionalFlag = 'HCE emotional model flags elevated caution (negative valence).';
        } else if (valence > 0.3) {
          hceEmotionalFlag = 'HCE emotional model signals favorable affective state.';
        }
      }

      // 4. Consciousness access → if ignition occurred, insight is trustworthy
      if (humanCognition.consciousProcessing?.consciousAccess) {
        hceBiasAdjustment += 0.03;
      }
    }

    // ── Determine proceed signal ────────────────────────────────────────────
    const adjustedConsensus = Math.min(1, debate.consensusStrength + hceBiasAdjustment);
    let proceedSignal: 'proceed' | 'pause' | 'restructure' | 'reject' = 'pause';
    
    if (!contradictions.isSatisfiable) {
      proceedSignal = 'restructure';
    } else if (debate.recommendation === 'proceed' && adjustedConsensus > 0.7) {
      proceedSignal = 'proceed';
    } else if (debate.recommendation === 'reject') {
      proceedSignal = 'reject';
    } else if (debate.recommendation === 'restructure') {
      proceedSignal = 'restructure';
    }

    // Get key scores
    const spiScore = formulas.results.get('SPI')?.score ?? 0;
    const rroiScore = formulas.results.get('RROI')?.score ?? 0;
    const scfScore = formulas.results.get('SCF')?.score ?? 0;

    // Build headline
    const hceTag = humanCognition ? ' [HCE-validated]' : '';
    const headline = proceedSignal === 'proceed'
      ? `Strong opportunity with ${Math.round(adjustedConsensus * 100)}% consensus${hceTag}`
      : proceedSignal === 'reject'
        ? `Significant barriers identified - recommend not proceeding${hceTag}`
        : proceedSignal === 'restructure'
          ? `Opportunity requires restructuring before proceeding${hceTag}`
          : `Mixed signals - further analysis recommended (${Math.round(adjustedConsensus * 100)}% consensus)${hceTag}`;

    // Top drivers
    const topDrivers: string[] = [
      `SPI™ Success Probability: ${Math.round(spiScore)}/100`,
      `RROI™ Regional Return: ${Math.round(rroiScore)}/100`,
      `SCF™ Strategic Confidence: ${Math.round(scfScore)}/100`
    ];

    if (similarCases.length > 0) {
      topDrivers.push(`${similarCases.length} similar prior cases inform this analysis`);
    }

    // Inject HCE-derived attention drivers
    topDrivers.push(...hceAttentionDrivers);

    // Top risks - amplified by HCE emotional processing
    const topRisks: string[] = [];
    
    if (contradictions.contradictions.length > 0) {
      topRisks.push(`${contradictions.contradictions.length} input contradiction(s) detected`);
    }
    if (debate.disagreements.length > 0) {
      const ampDisagreements = Math.round(debate.disagreements.length * hceRiskAmplification);
      topRisks.push(`${ampDisagreements} unresolved debate topic(s)${hceRiskAmplification > 1 ? ' (HCE risk-amplified)' : ''}`);
    }
    
    const priScore = formulas.results.get('PRI')?.score ?? 50;
    if (priScore < 60) {
      topRisks.push(`Political risk elevated (PRI: ${Math.round(priScore)}/100)`);
    }

    if (hceEmotionalFlag) {
      topRisks.push(hceEmotionalFlag);
    }

    if (topRisks.length === 0) {
      topRisks.push('No critical risks identified');
    }

    // Next actions
    const nextActions: string[] = [];
    
    if (proceedSignal === 'proceed') {
      nextActions.push('Confirm top 3 non-negotiable constraints');
      nextActions.push('Run SEAM alignment on priority stakeholders');
      nextActions.push('Draft investor brief and partner outreach');
    } else if (proceedSignal === 'restructure') {
      nextActions.push('Address input contradictions identified by the system');
      nextActions.push('Re-run analysis after constraint clarification');
      nextActions.push('Consider alternative partnership structures');
    } else if (proceedSignal === 'pause') {
      nextActions.push('Gather additional data on unresolved debate points');
      nextActions.push('Commission regulatory pathway review');
      nextActions.push('Validate financial assumptions with external sources');
    } else {
      nextActions.push('Document rejection rationale for future reference');
      nextActions.push('Consider alternative regions or sectors');
    }

    // HCE-generated cognitive action items
    if (humanCognition) {
      for (const ci of humanCognition.cognitiveInsights.slice(0, 2)) {
        nextActions.push(`[HCE] ${ci.title}: ${ci.description}`);
      }
    }

    return {
      proceedSignal,
      headline,
      topDrivers,
      topRisks,
      nextActions,
      consensusStrength: adjustedConsensus
    };
  }

  private buildInsights(
    runId: string,
    _params: ReportParameters,
    brief: AgenticBrainResult['executiveBrief'],
    memory: AgenticBrainResult['memory'],
    reasoning: AgenticBrainResult['reasoning'],
    _synthesis: AgenticBrainResult['synthesis'],
    frontier?: AgenticBrainResult['frontierIntelligence'],
    humanCognition?: HumanCognitionResult
  ): CopilotInsight[] {
    const insights: CopilotInsight[] = [];

    // Main verdict insight
    insights.push({
      id: `${runId}-verdict`,
      type: 'strategy',
      title: `Agentic Verdict: ${brief.proceedSignal.toUpperCase()}`,
      description: brief.headline,
      content: [
        '**Top Drivers:**',
        ...brief.topDrivers.map(d => `• ${d}`),
        '',
        '**Top Risks:**',
        ...brief.topRisks.map(r => `• ${r}`),
        '',
        '**Next Actions:**',
        ...brief.nextActions.map(a => `• ${a}`)
      ].join('\n'),
      confidence: Math.round(brief.consensusStrength * 100),
      isAutonomous: true
    });

    // Memory insight
    if (memory.caseCount > 0) {
      const topCase = memory.similarCases[0];
      insights.push({
        id: `${runId}-memory`,
        type: 'opportunity',
        title: `Memory: ${memory.caseCount} Similar Cases Found`,
        description: topCase 
          ? `Closest: ${topCase.embedding.metadata.organizationName || topCase.id} (${Math.round(topCase.score * 100)}% match)`
          : 'Similar cases retrieved from memory',
        content: memory.similarCases
          .map(c => `• ${c.embedding.metadata.organizationName || c.id}: ${c.matchReasons.join(', ')} (${Math.round(c.score * 100)}%)`)
          .join('\n'),
        confidence: 80,
        isAutonomous: true
      });
    }

    // Debate insight
    if (reasoning.debate.earlyStopped) {
      insights.push({
        id: `${runId}-debate`,
        type: 'warning',
        title: `Debate: Early Consensus in ${reasoning.debate.roundsExecuted} Rounds`,
        description: `Personas reached ${Math.round(reasoning.debate.consensusStrength * 100)}% agreement`,
        content: [
          `Recommendation: ${reasoning.debate.recommendation}`,
          `Rounds executed: ${reasoning.debate.roundsExecuted}/${reasoning.debate.maxRounds}`,
          reasoning.debate.disagreements.length > 0 
            ? `Unresolved: ${reasoning.debate.disagreements.map(d => d.topic).join(', ')}`
            : 'No significant disagreements'
        ].join('\n'),
        confidence: Math.round(reasoning.debate.consensusStrength * 100),
        isAutonomous: true
      });
    }

    // Performance insight
    const speedup = reasoning.formulas.speedup;
    if (speedup > 1.5) {
      insights.push({
        id: `${runId}-performance`,
        type: 'risk',
        title: `Performance: ${speedup.toFixed(1)}x Speedup Achieved`,
        description: `DAG parallelization and caching optimized execution`,
        content: [
          `Parallel execution time: ${reasoning.formulas.totalTimeMs}ms`,
          `Cache hits: ${reasoning.formulas.cacheHits}`,
          `Lazy evaluation saved: ${reasoning.lazyStats.computationSavedMs}ms`
        ].join('\n'),
        confidence: 95,
        isAutonomous: true
      });
    }

    if (frontier) {
      insights.push({
        id: `${runId}-frontier-negotiation`,
        type: 'strategy',
        title: 'Frontier Negotiation Strategy',
        description: `${frontier.negotiation.negotiationStrategy} - agreement probability ${Math.round(frontier.negotiation.agreementProbability)}%`,
        confidence: frontier.negotiation.agreementProbability / 100,
        isAutonomous: true
      });
      insights.push({
        id: `${runId}-frontier-foresight`,
        type: 'risk',
        title: 'Synthetic Foresight Watch',
        description: frontier.syntheticForesight.topScenarios[0]?.name || 'Synthetic foresight analysis completed',
        confidence: frontier.syntheticForesight.robustnessScore / 100,
        isAutonomous: true
      });
    }

    // Human cognition insights
    if (humanCognition) {
      // Add all cognitive insights from the engine
      insights.push(...humanCognition.cognitiveInsights.map(insight => ({
        id: `${runId}-cognition-${insight.type}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: insight.type as any,
        title: insight.title,
        description: insight.description,
        confidence: Math.round(insight.confidence * 100),
        isAutonomous: true
      })));

      // Add cognitive performance insight
      insights.push({
        id: `${runId}-cognition-performance`,
        type: 'strategy',
        title: 'Human Cognition Processing Complete',
        description: `Neural dynamics, predictive coding, and consciousness modeling completed in ${humanCognition.performance.totalTimeMs}ms`,
        content: [
          `Neural Field Oscillations: ${humanCognition.neuralDynamics.oscillations}`,
          `Free Energy Reduction: ${(humanCognition.freeEnergyOptimization.initialFreeEnergy - humanCognition.freeEnergyOptimization.finalFreeEnergy).toFixed(2)}`,
          `Attention Shifts: ${humanCognition.attentionAllocation.attentionShifts}`,
          `Conscious Access: ${humanCognition.consciousProcessing.consciousAccess ? 'Yes' : 'No'}`
        ].join('\n'),
        confidence: 90,
        isAutonomous: true
      });
    }

    return insights;
  }

  private async emptyDebate(): Promise<BayesianDebateResult> {
    return {
      rounds: [],
      finalBelief: { proceed: 0.25, pause: 0.25, restructure: 0.25, reject: 0.25 },
      recommendation: 'pause',
      consensusStrength: 0.25,
      earlyStopped: false,
      roundsExecuted: 0,
      maxRounds: 0,
      disagreements: [],
      executionTimeMs: 0
    };
  }

  private async emptyFormulas(): Promise<DAGExecutionResult> {
    return {
      results: new Map(),
      executionPlan: { levels: [], totalFormulas: 0, estimatedParallelism: 0 },
      totalTimeMs: 0,
      parallelTimeMs: 0,
      speedup: 1,
      cacheHits: 0
    };
  }

  private emptyTemplate(): SynthesisResult {
    return {
      plan: {
        templateId: 'comprehensive',
        sections: [],
        audience: 'General',
        tone: 'executive',
        estimatedPages: 0,
        priority: 'medium'
      },
      decisionPath: [],
      confidence: 50,
      alternativeTemplates: []
    };
  }
}

// Singleton instance
export const optimizedAgenticBrain = new OptimizedAgenticBrain();

export default OptimizedAgenticBrain;
