import { EventBus } from './EventBus';
import { persistentMemory } from './PersistentMemorySystem';
import { automaticSearchService, type SearchResult } from './AutomaticSearchService';
import { ReactiveIntelligenceEngine } from './ReactiveIntelligenceEngine';

export interface ConsultantInsight {
  id: string;
  type: 'location_intel' | 'market_analysis' | 'risk_assessment' | 'recommendation' | 'comparative_intel' | 'data_coverage' | 'intent_signal';
  title: string;
  content: string;
  confidence: number;
  sources: string[];
  proactive: boolean;
  timestamp: Date;
}

/** Engine results passed from BWConsultantOS after 19-engine stack runs */
export interface EngineResultsSummary {
  nsilStatus?: string; // green/yellow/orange/red
  nsilTrustScore?: number;
  nsilHeadline?: string;
  nsilTopConcerns?: string[];
  nsilTopOpportunities?: string[];
  situationBlindSpots?: string[];
  situationImplicitNeeds?: string[];
  situationUnconsideredNeeds?: string[];
  historicalMatches?: Array<{ title: string; country: string; year: number; outcome: string; lesson: string }>;
  historicalSuccessRate?: number;
  counterfactualLossProbability?: number;
  counterfactualMedianOutcome?: number;
  adversarialRiskLevel?: string;
  adversarialConcerns?: string[];
  unbiasedRecommendation?: string; // proceed / proceed-with-caution / reconsider / not-recommended
  unbiasedConfidence?: number;
  dataGaps?: string[];
  liveSearchResultCount?: number;
  locationProfileAvailable?: boolean;
  multiAgentDataGaps?: string[];
  userQuery?: string;
}

export interface BWConsultantState {
  isActive: boolean;
  currentFocus: string | null;
  insights: ConsultantInsight[];
  searchResults: SearchResult[];
  learningMode: boolean;
  adaptationLevel: number; // 0-100
}

export class BWConsultantAgenticAI {
  private state: BWConsultantState = {
    isActive: true,
    currentFocus: null,
    insights: [],
    searchResults: [],
    learningMode: true,
    adaptationLevel: 0
  };

  private adaptationHistory: Map<string, number> = new Map(); // Track successful adaptations

  // Stored engine results for current turn
  private _engineResults: EngineResultsSummary | null = null;

  /** Get current engine results (for merging updates) */
  getEngineResults(): EngineResultsSummary | null {
    return this._engineResults;
  }

  constructor() {
    this.setupEventListeners();
    this.initializeLearning();
  }

  /** Inject engine results from the 19-engine stack so the panel can surface them */
  setEngineResults(results: EngineResultsSummary): void {
    this._engineResults = results;
  }

  // Main consultant interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async consult(params: any, context: string = 'general'): Promise<ConsultantInsight[]> {
    console.log('- BW Consultant: Starting consultation for', context);

    // Update focus
    this.state.currentFocus = context;

    // Only trigger proactive searches for primary consultations
    // NEVER re-trigger searches from search_result_integration context " this causes infinite recursion:
    // consult ' proactiveSearchForReport ' triggerSearch ' emit(searchResultReady) ' App handler ' consult ' ...
    if (context !== 'search_result_integration') {
      await automaticSearchService.proactiveSearchForReport(params);
    }

    // Generate insights based on current knowledge
    const insights = await this.generateInsights(params, context);

    // Learn from this consultation
    await this.learnFromConsultation(params, insights);

    // Update adaptation level
    this.updateAdaptationLevel();

    EventBus.emit({ type: 'consultantInsightsGenerated', insights, context });

    return insights;
  }

  // Generate proactive insights — wired to all engines
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateInsights(params: any, context: string): Promise<ConsultantInsight[]> {
    const insights: ConsultantInsight[] = [];

    // Location-based insights
    if (params.country || params.region) {
      const locationInsights = await this.generateLocationInsights(params);
      insights.push(...locationInsights);
    }

    // Market analysis insights
    if (params.industry || params.dealSize) {
      const marketInsights = await this.generateMarketInsights(params);
      insights.push(...marketInsights);
    }

    // ── ENGINE-POWERED COMPARATIVE INTELLIGENCE ──
    // Uses the 19-engine results to build historical comparison / KPI benchmarks
    const comparativeInsights = this.generateComparativeInsights(params);
    insights.push(...comparativeInsights);

    // ── DATA COVERAGE REPORT ──
    // Shows the user what engines returned data and where gaps remain
    const coverageInsight = this.generateDataCoverageInsight(params);
    if (coverageInsight) insights.push(coverageInsight);

    // ── INTENT DETECTION & ENGAGEMENT SIGNAL ──
    // Determines if the user wants general info vs a report/document/deeper engagement
    const intentInsight = this.generateIntentSignal(params, context);
    if (intentInsight) insights.push(intentInsight);

    // Risk assessment insights (now context-aware, not generic)
    const riskInsights = await this.generateRiskInsights(params);
    insights.push(...riskInsights);

    // Proactive recommendations (now based on real engine findings)
    const recommendations = await this.generateProactiveRecommendations(params, context);
    insights.push(...recommendations);

    // Store insights
    this.state.insights.push(...insights);

    return insights;
  }

  // Generate location intelligence insights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateLocationInsights(params: any): Promise<ConsultantInsight[]> {
    const insights: ConsultantInsight[] = [];

    // Wait for search results
    const searchResults = await this.waitForSearchResults(params, 5000);

    for (const result of searchResults) {
      if (result.result?.profile) {
        const profile = result.result.profile;

        // Leadership insight
        if (profile.leaders?.length) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'location_intel',
            title: `Leadership Intelligence: ${profile.city}`,
            content: `Key leaders in ${profile.city}: ${profile.leaders.slice(0, 3).map(l => l.name).join(', ')}`,
            confidence: 0.85,
            sources: result.sources,
            proactive: true,
            timestamp: new Date()
          });
        }

        // Economic insight
        if (profile.economics?.gdpLocal) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'market_analysis',
            title: `Economic Overview: ${profile.city}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content: `${profile.city} has a GDP of ${profile.economics.gdpLocal} with key industries: ${(profile as any).industries?.slice(0, 3).join(', ') || profile.keySectors?.slice(0, 3).join(', ') || 'Various'}`,
            confidence: 0.8,
            sources: result.sources,
            proactive: true,
            timestamp: new Date()
          });
        }

        // Infrastructure insight
        if (profile.infrastructure) {
          const infra = profile.infrastructure;
          const infraText = [
            infra.airports?.length ? `${infra.airports.length} airports` : '',
            infra.seaports?.length ? `${infra.seaports.length} seaports` : '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (infra as any).internetSpeed ? `Internet speed: ${(infra as any).internetSpeed} Mbps` : (infra.internetPenetration ? `Internet: ${infra.internetPenetration}` : '')
          ].filter(Boolean).join(', ');

          if (infraText) {
            insights.push({
              id: crypto.randomUUID(),
              type: 'location_intel',
              title: `Infrastructure: ${profile.city}`,
              content: `${profile.city} infrastructure: ${infraText}`,
              confidence: 0.75,
              sources: result.sources,
              proactive: true,
              timestamp: new Date()
            });
          }
        }
      }
    }

    return insights;
  }

  // Generate market analysis insights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateMarketInsights(params: any): Promise<ConsultantInsight[]> {
    const insights: ConsultantInsight[] = [];

    // Industry analysis
    if (params.industry?.length) {
      for (const industry of params.industry) {
        const marketInsight = await this.analyzeIndustryMarket(industry, params);
        if (marketInsight) insights.push(marketInsight);
      }
    }

    // Deal size analysis
    if (params.dealSize) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'market_analysis',
        title: 'Deal Size Market Context',
        content: `For deals of ${params.dealSize}, consider regional economic indicators and investment patterns in ${params.country || 'target market'}`,
        confidence: 0.7,
        sources: ['Market analysis', 'Economic data'],
        proactive: true,
        timestamp: new Date()
      });
    }

    return insights;
  }

  // Generate risk assessment insights — now engine-powered, not generic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateRiskInsights(params: any): Promise<ConsultantInsight[]> {
    const insights: ConsultantInsight[] = [];
    const eng = this._engineResults;

    // Only show liability risks if they ACTUALLY match the specific context
    const liabilityRisks = persistentMemory.assessLiability('consultation', params);
    if (liabilityRisks.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'risk_assessment',
        title: 'Compliance Screening',
        content: liabilityRisks.map(r => `${r.mitigation}`).join('. '),
        confidence: 0.85,
        sources: ['Entity screening engine'],
        proactive: true,
        timestamp: new Date()
      });
    }

    // Use the NSIL engine status if available — much more specific than generic liability
    if (eng?.nsilStatus && eng.nsilStatus !== 'green') {
      const statusLabels: Record<string, string> = { yellow: 'MODERATE RISK', orange: 'ELEVATED RISK', red: 'HIGH RISK' };
      const label = statusLabels[eng.nsilStatus] || eng.nsilStatus.toUpperCase();
      const concerns = eng.nsilTopConcerns?.slice(0, 3).join('; ') || 'Review required';
      insights.push({
        id: crypto.randomUUID(),
        type: 'risk_assessment',
        title: `NSIL Risk Status: ${label}`,
        content: `Trust score: ${eng.nsilTrustScore ?? '—'}/100. ${concerns}`,
        confidence: 0.9,
        sources: ['NSIL Intelligence Hub', '9-layer engine stack'],
        proactive: true,
        timestamp: new Date()
      });
    }

    // Adversarial stress-test risks
    if (eng?.adversarialRiskLevel && eng.adversarialRiskLevel !== 'low') {
      insights.push({
        id: crypto.randomUUID(),
        type: 'risk_assessment',
        title: `Adversarial Stress Test: ${eng.adversarialRiskLevel.toUpperCase()}`,
        content: eng.adversarialConcerns?.slice(0, 2).join('; ') || 'Adversarial reasoning flagged potential concerns',
        confidence: 0.85,
        sources: ['Adversarial Reasoning Service'],
        proactive: true,
        timestamp: new Date()
      });
    }

    // Location-based risks
    if (params.country) {
      const locationRisks = await this.assessLocationRisks(params.country);
      if (locationRisks) insights.push(locationRisks);
    }

    return insights;
  }

  // ── COMPARATIVE INTELLIGENCE — historical parallels + KPI benchmarking ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private generateComparativeInsights(_params: any): ConsultantInsight[] {
    const insights: ConsultantInsight[] = [];
    const eng = this._engineResults;
    if (!eng) return insights;

    // Historical comparison — what similar cases looked like
    if (eng.historicalMatches && eng.historicalMatches.length > 0) {
      const top = eng.historicalMatches.slice(0, 3);
      const summaryParts = top.map(m => `${m.title} (${m.country}, ${m.year}) — ${m.outcome}. Lesson: ${m.lesson}`);
      insights.push({
        id: crypto.randomUUID(),
        type: 'comparative_intel',
        title: `Historical Comparison: ${top.length} Similar Cases`,
        content: `Success rate across comparable cases: ${eng.historicalSuccessRate ?? '—'}%. ${summaryParts.join('. ')}`,
        confidence: 0.85,
        sources: ['HistoricalParallelMatcher', '60-year case library'],
        proactive: true,
        timestamp: new Date()
      });
    }

    // Unbiased assessment — is this the best option or should they look elsewhere?
    if (eng.unbiasedRecommendation) {
      const actionLabels: Record<string, string> = {
        'proceed': 'PROCEED — This appears to be a strong option',
        'proceed-with-caution': 'PROCEED WITH CAUTION — Viable but with notable risks',
        'reconsider': 'RECONSIDER — Better alternatives may exist',
        'not-recommended': 'NOT RECOMMENDED — Significant concerns identified'
      };
      const label = actionLabels[eng.unbiasedRecommendation] || eng.unbiasedRecommendation;
      insights.push({
        id: crypto.randomUUID(),
        type: 'comparative_intel',
        title: 'Unbiased Comparative Assessment',
        content: `${label} (confidence: ${eng.unbiasedConfidence ?? '—'}%). ${eng.counterfactualLossProbability != null ? `Monte Carlo probability of loss: ${eng.counterfactualLossProbability}%.` : ''} ${eng.counterfactualMedianOutcome != null ? `Median outcome: ${eng.counterfactualMedianOutcome}%.` : ''}`,
        confidence: (eng.unbiasedConfidence ?? 70) / 100,
        sources: ['UnbiasedAnalysisEngine', 'CounterfactualEngine'],
        proactive: true,
        timestamp: new Date()
      });
    }

    // Surface blind spots and unconsidered needs
    const blindSpots = [...(eng.situationBlindSpots || []), ...(eng.situationUnconsideredNeeds || [])].slice(0, 3);
    if (blindSpots.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'comparative_intel',
        title: 'Unconsidered Factors',
        content: blindSpots.join('; '),
        confidence: 0.8,
        sources: ['SituationAnalysisEngine', '7-perspective diagnostic'],
        proactive: true,
        timestamp: new Date()
      });
    }

    return insights;
  }

  // ── DATA COVERAGE REPORT — shows what engines returned data and where gaps are ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private generateDataCoverageInsight(params: any): ConsultantInsight | null {
    const eng = this._engineResults;
    if (!eng) return null;

    const covered: string[] = [];
    const gaps: string[] = [];

    // Check what returned data
    if (eng.liveSearchResultCount != null && eng.liveSearchResultCount > 0) {
      covered.push(`Live search: ${eng.liveSearchResultCount} results`);
    } else {
      gaps.push('Live search returned no verified results');
    }

    if (eng.locationProfileAvailable) {
      covered.push('Location intelligence profile available');
    } else if (params.country || params.region) {
      gaps.push('Location profile not yet available');
    }

    if (eng.historicalMatches && eng.historicalMatches.length > 0) {
      covered.push(`${eng.historicalMatches.length} historical precedents matched`);
    } else {
      gaps.push('No historical precedents found for this exact scenario');
    }

    if (eng.nsilTrustScore != null) {
      covered.push(`NSIL trust assessment: ${eng.nsilTrustScore}/100`);
    }

    // Collect gaps from multi-agent orchestrator
    const allGaps = [...(eng.dataGaps || []), ...(eng.multiAgentDataGaps || [])];
    if (allGaps.length > 0) {
      gaps.push(...allGaps.slice(0, 3));
    }

    // Only show if there's something meaningful to report
    if (covered.length === 0 && gaps.length === 0) return null;

    const coveragePct = covered.length > 0 ? Math.round((covered.length / (covered.length + gaps.length)) * 100) : 0;
    const content = [
      covered.length > 0 ? `Verified: ${covered.join(' | ')}` : '',
      gaps.length > 0 ? `Gaps: ${gaps.join(' | ')}` : '',
      `Data coverage: ${coveragePct}%`
    ].filter(Boolean).join('. ');

    return {
      id: crypto.randomUUID(),
      type: 'data_coverage',
      title: `Intelligence Coverage: ${coveragePct}%`,
      content,
      confidence: Math.max(0.6, coveragePct / 100),
      sources: ['19-engine NSIL stack', 'Multi-Agent Orchestrator'],
      proactive: true,
      timestamp: new Date()
    };
  }

  // ── INTENT SIGNAL — detect whether user wants general info or deep engagement ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private generateIntentSignal(params: any, _context: string): ConsultantInsight | null {
    const query = (this._engineResults?.userQuery || params.problemStatement || '').toLowerCase();
    if (!query || query.length < 10) return null;

    // Classify intent
    const isInfoQuery = /^(tell me|who is|what is|what are|explain|describe|background|more about|research)/i.test(query);
    const isReportIntent = /\b(report|document|letter|brief|case study|analysis|strategy|proposal|recommendation|assessment|due diligence|feasibility)\b/i.test(query);
    const isBusinessIntent = /\b(invest|partner|business|deal|contract|negotiate|engage|hire|collaborate|joint venture|market entry)\b/i.test(query);
    const isComparisonIntent = /\b(compare|versus|vs|better|best|alternative|which one|ranking|benchmark)\b/i.test(query);

    let intentLabel: string;
    let intentContent: string;

    if (isComparisonIntent) {
      intentLabel = 'Comparative Analysis Requested';
      intentContent = 'The query signals a need for comparative intelligence. BW Nexus can benchmark entities, locations, or strategies against alternatives using historical data, KPI indices, and unbiased assessment.';
    } else if (isReportIntent) {
      intentLabel = 'Document Generation Opportunity';
      intentContent = 'The query implies a need for a formal deliverable. Once enough context is gathered, BW Nexus can generate a board-ready report, strategy brief, or case study grounded in NSIL intelligence.';
    } else if (isBusinessIntent) {
      intentLabel = 'Business Engagement Intelligence';
      intentContent = 'The query is oriented toward a business decision. All pipelines are engaged: entity screening, risk assessment, historical parallels, partner intelligence, and counterfactual modeling.';
    } else if (isInfoQuery) {
      intentLabel = 'Research & Background Intelligence';
      intentContent = 'General information query detected. If the research reveals actionable signals, BW Nexus can escalate to a full analysis, comparison, or structured report.';
    } else {
      return null; // No clear intent signal worth surfacing
    }

    return {
      id: crypto.randomUUID(),
      type: 'intent_signal',
      title: intentLabel,
      content: intentContent,
      confidence: 0.75,
      sources: ['Intent classifier', 'Query analysis'],
      proactive: true,
      timestamp: new Date()
    };
  }

  // Generate proactive recommendations — grounded in actual engine findings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateProactiveRecommendations(params: any, context: string): Promise<ConsultantInsight[]> {
    const recommendations: ConsultantInsight[] = [];
    const eng = this._engineResults;

    // Based on learning history
    const similarConsultations = await persistentMemory.searchMemory(context);

    if (similarConsultations.length > 0) {
      const successfulPatterns = similarConsultations.filter(c => c.outcome?.success);

      if (successfulPatterns.length > 0) {
        recommendations.push({
          id: crypto.randomUUID(),
          type: 'recommendation',
          title: 'Pattern-Based Recommendation',
          content: `Based on ${successfulPatterns.length} similar consultations, consider: ${successfulPatterns[0].action}`,
          confidence: 0.8,
          sources: ['Learning history'],
          proactive: true,
          timestamp: new Date()
        });
      }
    }

    // Engine-powered next step — cite what the NSIL actually recommends
    if (eng?.nsilHeadline) {
      const opportunities = eng.nsilTopOpportunities?.slice(0, 2).join('; ');
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'recommendation',
        title: 'NSIL Strategic Signal',
        content: `${eng.nsilHeadline}${opportunities ? `. Opportunities: ${opportunities}` : ''}`,
        confidence: 0.85,
        sources: ['NSIL Intelligence Hub'],
        proactive: true,
        timestamp: new Date()
      });
    }

    // If implicit needs were detected, surface them as a recommendation
    if (eng?.situationImplicitNeeds && eng.situationImplicitNeeds.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'recommendation',
        title: 'Implicit Needs Detected',
        content: eng.situationImplicitNeeds.slice(0, 3).join('; '),
        confidence: 0.8,
        sources: ['SituationAnalysisEngine'],
        proactive: true,
        timestamp: new Date()
      });
    }

    return recommendations;
  }

  // Wait for search results with timeout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async waitForSearchResults(params: any, timeout: number): Promise<SearchResult[]> {
    return new Promise((resolve) => {
      const results: SearchResult[] = [];
      const timeoutId = setTimeout(() => {
        EventBus.off('searchResultReady', handler);
        resolve(results);
      }, timeout);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (event: any) => {
        if (event.result) {
          results.push(event.result);
          if (results.length >= 3) { // Collect up to 3 results
            clearTimeout(timeoutId);
            EventBus.off('searchResultReady', handler);
            resolve(results);
          }
        }
      };

      EventBus.on('searchResultReady', handler);
    });
  }

  // Analyze industry market
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async analyzeIndustryMarket(industry: string, params: any): Promise<ConsultantInsight | null> {
    const country = params.country || 'target market';
    const query = `${industry} market outlook ${country}`;

    await automaticSearchService.triggerSearch(query, 'market_analysis', 'medium');

    let evidence: Array<{ title: string; url?: string; snippet?: string }> = [];
    try {
      evidence = await ReactiveIntelligenceEngine.liveSearch(query, params);
    } catch (error) {
      console.warn('Industry market live search failed:', error);
    }

    const topEvidence = evidence.slice(0, 3);
    const sources = topEvidence.map(r => r.url || r.title).filter(Boolean) as string[];
    const summary = topEvidence.length
      ? `Live sources indicate current focus areas for ${industry} in ${country}: ${topEvidence.map(r => r.title).join('; ')}.`
      : `Live market search did not return sources. Consider verifying data availability for ${industry} in ${country}.`;

    const confidence = topEvidence.length >= 3 ? 0.8 : topEvidence.length > 0 ? 0.65 : 0.5;

    return {
      id: crypto.randomUUID(),
      type: 'market_analysis',
      title: `Industry Analysis: ${industry}`,
      content: summary,
      confidence,
      sources: sources.length ? sources : ['Live search (no citations returned)'],
      proactive: true,
      timestamp: new Date()
    };
  }

  // Assess location risks
  private async assessLocationRisks(country: string): Promise<ConsultantInsight | null> {
    const query = `${country} political risk regulatory environment economic outlook`;
    await automaticSearchService.triggerSearch(query, 'risk_analysis', 'medium');

    let evidence: Array<{ title: string; url?: string; snippet?: string }> = [];
    try {
      evidence = await ReactiveIntelligenceEngine.liveSearch(query, { country });
    } catch (error) {
      console.warn('Location risk live search failed:', error);
    }

    const topEvidence = evidence.slice(0, 3);
    const sources = topEvidence.map(r => r.url || r.title).filter(Boolean) as string[];
    const summary = topEvidence.length
      ? `Top risk signals for ${country} from live sources: ${topEvidence.map(r => r.title).join('; ')}.`
      : `Risk assessment for ${country} requires additional sources. No live citations returned.`;

    const confidence = topEvidence.length >= 3 ? 0.85 : topEvidence.length > 0 ? 0.7 : 0.55;

    return {
      id: crypto.randomUUID(),
      type: 'risk_assessment',
      title: `Location Risk: ${country}`,
      content: summary,
      confidence,
      sources: sources.length ? sources : ['Live search (no citations returned)'],
      proactive: true,
      timestamp: new Date()
    };
  }

  // Learn from consultation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async learnFromConsultation(params: any, insights: ConsultantInsight[]): Promise<void> {
    if (!this.state.learningMode) return;

    // Remember successful insights
    for (const insight of insights) {
      if (insight.confidence > 0.7) {
        await persistentMemory.remember('successful_insights', {
          action: 'Generated insight',
          context: { type: insight.type, title: insight.title, params },
          outcome: { success: true, confidence: insight.confidence },
          confidence: insight.confidence
        });
      }
    }

    // Track adaptation patterns
    const adaptationKey = JSON.stringify(params);
    const currentLevel = this.adaptationHistory.get(adaptationKey) || 0;
    this.adaptationHistory.set(adaptationKey, currentLevel + 1);
  }

  // Update adaptation level
  private updateAdaptationLevel(): void {
    const totalAdaptations = Array.from(this.adaptationHistory.values()).reduce((sum, val) => sum + val, 0);
    this.state.adaptationLevel = Math.min(totalAdaptations / 10 * 100, 100); // Scale to 0-100
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Listen for search results
    EventBus.on('searchResultReady', (event) => {
      this.state.searchResults.push(event.result);
    });

    // Listen for user interactions to learn
    EventBus.on('userInteraction', (event) => {
      this.learnFromUserInteraction(event);
    });

    // Listen for report generation to provide insights
    EventBus.on('reportGenerationStarted', async (event) => {
      const insights = await this.consult(event.params, 'report_generation');
      EventBus.emit({ type: 'consultantReportInsights', insights });
    });
  }

  // Learn from user interactions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async learnFromUserInteraction(interaction: any): Promise<void> {
    await persistentMemory.remember('user_interactions', {
      action: interaction.type,
      context: interaction,
      outcome: { success: true },
      confidence: 0.8
    });
  }

  // Initialize learning from history
  private async initializeLearning(): Promise<void> {
    const learningData = await persistentMemory.searchMemory('successful_insights');
    for (const data of learningData) {
      if (data.context?.params) {
        const key = JSON.stringify(data.context.params);
        const current = this.adaptationHistory.get(key) || 0;
        this.adaptationHistory.set(key, current + 1);
      }
    }
  }

  // Get consultant status
  getStatus() {
    return {
      ...this.state,
      totalInsights: this.state.insights.length,
      recentInsights: this.state.insights.filter(i => Date.now() - i.timestamp.getTime() < 3600000).length, // Last hour
      searchIntegration: automaticSearchService.getSearchStats(),
      adaptationLevel: this.state.adaptationLevel
    };
  }

  // Toggle learning mode
  setLearningMode(enabled: boolean): void {
    this.state.learningMode = enabled;
  }

  // Clear insights
  clearInsights(): void {
    this.state.insights = [];
  }
}

export const bwConsultantAI = new BWConsultantAgenticAI();
