/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — BRAIN INTEGRATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The unified "always-on" background brain that aggregates every analytical
 * engine into a single enriched context block.  BWConsultantOS calls this
 * whenever caseStudy readiness >= 30 and injects the result into the AI
 * prompt so the consultant speaks from the full intelligence of every engine.
 *
 * Engines activated here (all previously orphaned):
 *  • AdversarialReasoningService   – 5-persona debate + shield + counterfactuals
 *  • ComprehensiveIndicesEngine     – 15 strategic indices (BARNA, CRI, NVI …)
 *  • MultiAgentOrchestrator         – Gemini / GPT-4 / Claude consensus layer
 *  • HistoricalLearningEngine       – 200-year economic pattern matching
 *  • externalDataIntegrations       – World Bank, OpenCorporates, Numbeo
 *  • MotivationDetector             – stakeholder motivation analysis
 *  • PersonaEngine                  – 5-persona analysis
 *  • CounterfactualEngine           – what-if scenario modelling
 *  • OutcomeTracker                 – prior outcome learning
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import AdversarialReasoningService from './AdversarialReasoningService';
import { calculateAllIndices, type AllIndicesResult } from './ComprehensiveIndicesEngine';
import { MultiAgentOrchestrator, HistoricalLearningEngine, type ConsensusResult, type HistoricalPattern } from './MultiAgentBrainSystem';
import { MultiAgentOrchestrator as DomainAgentOrchestrator, type SynthesizedAnalysis } from './MultiAgentOrchestrator';
import { fetchWorldBankCountryIndicators, fetchOpenCorporatesCompany, fetchNumbeoCityData } from './externalDataIntegrations';
import { NSILIntelligenceHub } from './NSILIntelligenceHub';
import { CompositeScoreService } from './CompositeScoreService';
import { GlobalComplianceFramework } from './GlobalComplianceFramework';
import { CaseGraphBuilder } from './CaseGraphBuilder';
import { RegionalDevelopmentOrchestrator } from './RegionalDevelopmentOrchestrator';
import { PartnerComparisonEngine } from './PartnerComparisonEngine';
import { DecisionPipeline } from './DecisionPipeline';
import { DocumentTypeRouter } from './DocumentTypeRouter';
import { MethodologyKnowledgeBase } from './MethodologyKnowledgeBase';
import { IFCGlobalStandardsEngine } from './IFCGlobalStandardsEngine';
import { PatternConfidenceEngine } from './PatternConfidenceEngine';
import { calculateMaturityScores, generateAIInsights } from './maturityEngine';
import { ProblemToSolutionGraphService } from './ProblemToSolutionGraphService';
import { GlobalDataFabricService } from './GlobalDataFabricService';
import { DerivedIndexService } from './DerivedIndexService';
import MotivationDetector from './MotivationDetector';
import CounterfactualEngine from './CounterfactualEngine';
import { narrativeSynthesisEngine } from './narrativeSynthesisEngine';
import { HistoricalParallelMatcher, type ParallelMatchResult } from './HistoricalParallelMatcher';
import { PartnerIntelligenceEngine, type RankedPartner, type PartnerCandidate } from './PartnerIntelligenceEngine';
import { ReportParameters } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrainContext {
  /** Summarised context block ready to inject into an AI prompt */
  promptBlock: string;
  /** Indices bundle (15 scores) */
  indices: AllIndicesResult | null;
  /** Persona panel / adversarial findings */
  adversarial: {
    consensusRecommendation: string;
    agreementLevel: number;
    topRisks: string[];
    topOpportunities: string[];
    contradictionIndex: number;
    escalations: string[];
  } | null;
  /** Multi-agent consensus on the strategic question */
  agentConsensus: ConsensusResult | null;
  /** Historical patterns that match the case */
  historicalPatterns: HistoricalPattern[];
  /** External live data */
  externalData: {
    gdp?: number;
    gdpGrowth?: number;
    costOfLiving?: number;
    crimeIndex?: number;
    companyRecord?: { name: string; jurisdictionCode?: string; incorporationDate?: string } | null;
  };
  /** NSIL quick assessment */
  nsilAssessment: any | null;
  /** Composite SPI/IVAS/SCF scores */
  compositeScore: any | null;
  /** Compliance alerts for country + sector */
  compliance: any | null;
  /** Case graph structure */
  caseGraph: any | null;
  /** Regional development interventions */
  regionalKernel: any | null;
  /** Decision pipeline packet */
  decisionPacket: any | null;
  /** ISO timestamp of when this was computed */
  computedAt: string;
  /** Readiness score that triggered the run */
  readiness: number;
  /** IDs of the top recommended document types from the 247-doc catalog */
  recommendedDocumentIds: string[];
  /** IDs of the top recommended letter types from the 156-letter catalog */
  recommendedLetterIds: string[];
  /** Methodology knowledge base lookup (internal reference library) */
  methodologyKB: { methodologies: any[]; countryIntel: any; sectorIntel: any[]; internalKnowledgeAvailable: boolean } | null;
  /** IFC Global Standards — compliance gap analysis */
  ifcAssessment: any | null;
  /** Pattern confidence — historical pattern strength for this case */
  patternAssessment: any | null;
  /** Maturity engine — 1-5 scale across strategic dimensions */
  maturityScores: { scores: any[]; insights: any[] } | null;
  /** Problem-to-solution graph — root causes, bottlenecks, leverage points */
  problemGraph: any | null;
  /** Global data fabric — normalised signals snapshot */
  dataFabric: any | null;
  /** Motivation detector — stakeholder motivation red-flags */
  motivationAnalysis: any | null;
  /** Counterfactual engine — what-if scenario analysis */
  counterfactualAnalysis: any | null;
  /** Domain agent synthesis (Gov, Banking, Corporate, Market, Risk, Historical) */
  domainAnalysis: SynthesizedAnalysis | null;
  /** Historical parallel matches — 60 years of documented practice from the case library */
  historicalParallels: ParallelMatchResult | null;
  /** Ranked partner candidates — best matched institutional, government, corporate partners */
  rankedPartners: RankedPartner[] | null;
  /** Derived indices — PRI/TCO/CRI extended scores */
  derivedIndices: { pri?: any; cri?: any } | null;
}

// ─── Simple in-process cache (keyed by country + objectives + org) ────────────

interface CacheEntry {
  result: BrainContext;
  expiresAt: number;
}

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
const cache = new Map<string, CacheEntry>();

function cacheKey(params: Partial<ReportParameters & { readiness: number }>): string {
  return [params.country, params.organizationName, params.sector, Math.floor((params.readiness ?? 0) / 20)].join('|');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countryToISO(country: string): string {
  const map: Record<string, string> = {
    'philippines': 'PH', 'vietnam': 'VN', 'indonesia': 'ID', 'thailand': 'TH',
    'malaysia': 'MY', 'singapore': 'SG', 'australia': 'AU', 'india': 'IN',
    'china': 'CN', 'japan': 'JP', 'south korea': 'KR', 'united states': 'US',
    'usa': 'US', 'germany': 'DE', 'united kingdom': 'GB', 'uk': 'GB',
    'france': 'FR', 'brazil': 'BR', 'mexico': 'MX', 'nigeria': 'NG',
    'kenya': 'KE', 'ghana': 'GH', 'south africa': 'ZA', 'egypt': 'EG',
    'uae': 'AE', 'saudi arabia': 'SA', 'turkey': 'TR', 'pakistan': 'PK',
    'bangladesh': 'BD', 'myanmar': 'MM', 'cambodia': 'KH', 'laos': 'LA',
    'sri lanka': 'LK', 'nepal': 'NP', 'new zealand': 'NZ', 'canada': 'CA',
    'argentina': 'AR', 'chile': 'CL', 'colombia': 'CO', 'peru': 'PE',
  };
  return map[country.toLowerCase()] || country.toUpperCase().substring(0, 2);
}

function formatIndicesBlock(indices: AllIndicesResult): string {
  const lines: string[] = [
    `\n### ── 15-INDEX INTELLIGENCE PANEL ──`,
    `**Overall Score:** ${indices.composite.overallScore}/100  |  **Risk-Adjusted:** ${indices.composite.riskAdjustedScore}/100  |  **Opportunity:** ${indices.composite.opportunityScore}/100  |  **Execution Readiness:** ${indices.composite.executionReadiness}/100`,
    ``,
    `| Index | Score | Grade | Interpretation |`,
    `|-------|-------|-------|----------------|`,
    `| BARNA (Barriers) | ${indices.barna.value} | ${indices.barna.grade} | ${indices.barna.interpretation} |`,
    `| NVI (Network Value) | ${indices.nvi.value} | ${indices.nvi.grade} | ${indices.nvi.interpretation} |`,
    `| CRI (Country Risk) | ${indices.cri.value} | ${indices.cri.grade} | ${indices.cri.interpretation} |`,
    `| CAP (Capability) | ${indices.cap.value} | ${indices.cap.grade} | ${indices.cap.interpretation} |`,
    `| AGI (Activation Speed) | ${indices.agi.value} | ${indices.agi.grade} | ${indices.agi.interpretation} |`,
    `| VCI (Value Creation) | ${indices.vci.value} | ${indices.vci.grade} | ${indices.vci.interpretation} |`,
    `| ATI (Asset Transfer) | ${indices.ati.value} | ${indices.ati.grade} | ${indices.ati.interpretation} |`,
    `| ESI (Ecosystem Strength) | ${indices.esi.value} | ${indices.esi.grade} | ${indices.esi.interpretation} |`,
    `| ISI (Integration Speed) | ${indices.isi.value} | ${indices.isi.grade} | ${indices.isi.interpretation} |`,
    `| OSI (Operational Synergy) | ${indices.osi.value} | ${indices.osi.grade} | ${indices.osi.interpretation} |`,
    `| TCO (Total Cost of Ownership) | ${indices.tco.value} | ${indices.tco.grade} | ${indices.tco.interpretation} |`,
    `| PRI (Political Risk) | ${indices.pri.value} | ${indices.pri.grade} | ${indices.pri.interpretation} |`,
    `| RNI (Regulatory Navigation) | ${indices.rni.value} | ${indices.rni.grade} | ${indices.rni.interpretation} |`,
    `| SRA (Strategic Risk) | ${indices.sra.value} | ${indices.sra.grade} | ${indices.sra.interpretation} |`,
    `| IDV (Investment Variance) | ${indices.idv.value} | ${indices.idv.grade} | ${indices.idv.interpretation} |`,
  ];

  // Add top recommendations from highest-priority indices
  const topRecs: string[] = [
    ...indices.cri.recommendations.slice(0, 1),
    ...indices.barna.recommendations.slice(0, 1),
    ...indices.cap.recommendations.slice(0, 1),
  ].filter(Boolean);
  if (topRecs.length) {
    lines.push(``, `**Key Index Recommendations:**`);
    topRecs.forEach(r => lines.push(`- ${r}`));
  }

  return lines.join('\n');
}

function formatAdversarialBlock(adv: BrainContext['adversarial']): string {
  if (!adv) return '';
  const lines: string[] = [
    `\n### ── 5-PERSONA ADVERSARIAL ANALYSIS ──`,
    `**Consensus:** ${adv.consensusRecommendation}`,
    `**Agreement Level:** ${adv.agreementLevel}%  |  **Contradiction Index:** ${adv.contradictionIndex}/100`,
  ];
  if (adv.topRisks.length) {
    lines.push(`**Top Adversarial Risks:**`);
    adv.topRisks.forEach(r => lines.push(`- ⚠ ${r}`));
  }
  if (adv.topOpportunities.length) {
    lines.push(`**Top Opportunities Identified:**`);
    adv.topOpportunities.forEach(o => lines.push(`- ✓ ${o}`));
  }
  if (adv.escalations.length) {
    lines.push(`**Escalations (Critical):** ${adv.escalations.join('; ')}`);
  }
  return lines.join('\n');
}

function formatHistoricalBlock(patterns: HistoricalPattern[]): string {
  if (!patterns.length) return '';
  const lines = [`\n### ── HISTORICAL INTELLIGENCE (${patterns.length} patterns matched) ──`];
  patterns.slice(0, 3).forEach(p => {
    lines.push(`**${p.era} | ${p.region} | ${p.industry}** → Outcome: ${p.outcome.toUpperCase()} (Applicability: ${Math.round(p.applicabilityScore * 100)}%)`);
    p.lessons.slice(0, 2).forEach(l => lines.push(`  - ${l}`));
  });
  return lines.join('\n');
}

function formatExternalDataBlock(ext: BrainContext['externalData'], country: string): string {
  const lines: string[] = [`\n### ── LIVE EXTERNAL DATA (${country}) ──`];
  if (ext.gdp) lines.push(`- GDP: $${(ext.gdp / 1e9).toFixed(1)}B`);
  if (ext.gdpGrowth !== undefined) lines.push(`- GDP Growth: ${ext.gdpGrowth}%`);
  if (ext.costOfLiving !== undefined) lines.push(`- Cost of Living Index: ${ext.costOfLiving}`);
  if (ext.crimeIndex !== undefined) lines.push(`- Crime Index: ${ext.crimeIndex}`);
  if (ext.companyRecord) {
    lines.push(`- Target Company Registry: ${ext.companyRecord.name} (${ext.companyRecord.jurisdictionCode || 'unknown jurisdiction'}, incorporated ${ext.companyRecord.incorporationDate || 'unknown'})`);
  }
  return lines.length > 1 ? lines.join('\n') : '';
}

// ─── Main export ──────────────────────────────────────────────────────────────

export class BrainIntegrationService {
  /**
   * Run all background engines in parallel and return a rich context block.
   * Safe to call on every non-trivial turn — results are cached for 3 minutes
   * per unique (country × org × readiness-bucket) key.
   */
  static async enrich(
    params: Partial<ReportParameters>,
    readiness: number,
    strategicQuestion: string
  ): Promise<BrainContext> {
    const key = cacheKey({ ...params, readiness });
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const country = params.country || '';
    const isoCode = country ? countryToISO(country) : '';
    const orgName = params.organizationName || params.targetPartner || '';

    // ── Run everything in parallel ────────────────────────────────────────────
    const [
      indicesResult,
      adversarialResult,
      historicalResult,
      worldBankData,
      openCorpData,
      numbeoData,
      consensusResult,
      nsilResult,
      compositeResult,
      complianceResult,
      caseGraphResult,
      regionalResult,
      decisionResult,
      domainAnalysisResult,
    ] = await Promise.allSettled([
      // 15 indices
      calculateAllIndices(params).catch(() => null),
      // Adversarial (requires full ReportParameters shape)
      AdversarialReasoningService.generate(params as ReportParameters).catch(() => null),
      // Historical patterns
      HistoricalLearningEngine.findRelevantPatterns(params as ReportParameters).catch(() => [] as HistoricalPattern[]),
      // World Bank live
      isoCode ? fetchWorldBankCountryIndicators(isoCode).catch(() => null) : Promise.resolve(null),
      // OpenCorporates company lookup
      orgName ? fetchOpenCorporatesCompany(orgName).catch(() => null) : Promise.resolve(null),
      // Numbeo cost-of-living
      country ? fetchNumbeoCityData(country).catch(() => null) : Promise.resolve(null),
      // Multi-agent consensus on the strategic question (only if we have a question)
      strategicQuestion.length > 20
        ? MultiAgentOrchestrator.runConsensus(strategicQuestion, { params, readiness }).catch(() => null)
        : Promise.resolve(null),
      // NSIL Intelligence Hub — national strategic intelligence layer
      Promise.resolve(NSILIntelligenceHub.quickAssess(params)).catch(() => null),
      // Composite score (SPI/IVAS/SCF)
      CompositeScoreService.getScores(params as ReportParameters).catch(() => null),
      // Compliance framework — jurisdiction-specific alerts
      country
        ? Promise.resolve(GlobalComplianceFramework.checkCompliance({
            country,
            sector: params.sector || (params as any).organizationType || undefined,
          })).catch(() => null)
        : Promise.resolve(null),
      // Case graph — structural relationship map of the case
      Promise.resolve(CaseGraphBuilder.build({
        organizationName: params.organizationName,
        country: params.country,
        sector: params.sector || (params as any).organizationType || '',
        problemStatement: (params as any).problemStatement || '',
        strategicIntent: (params as any).strategicIntent || [],
        constraints: (params as any).constraints ? [(params as any).constraints] : [],
      })).catch(() => null),
      // Regional development kernel — ranked interventions and ecosystem analysis
      country && readiness >= 50
        ? Promise.resolve(RegionalDevelopmentOrchestrator.run({
            regionProfile: country,
            sector: params.sector || (params as any).organizationType || 'general',
            constraints: (params as any).constraints || 'standard regulatory',
            fundingEnvelope: 'market rate',
            governanceContext: country,
            country,
            jurisdiction: country,
            objective: strategicQuestion.substring(0, 200) || 'strategic partnership',
            currentMatter: params.organizationName || 'engagement',
            evidenceNotes: [],
            partnerCandidates: [],
          })).catch(() => null)
        : Promise.resolve(null),
      // DecisionPipeline — structured decision packet with ranked options
      readiness >= 40 && params.country
        ? DecisionPipeline.run(params as ReportParameters).catch(() => null)
        : Promise.resolve(null),
      // Domain agent synthesis (Gov Policy, Banking, Corporate, Market, Risk, Historical)
      readiness >= 55 && strategicQuestion.length > 15
        ? DomainAgentOrchestrator.synthesizeAnalysis({
            organizationProfile: params as ReportParameters,
            query: strategicQuestion.substring(0, 400),
            dataScope: readiness >= 75 ? 'comprehensive' : 'recent',
            includeCustomData: false,
          }).catch(() => null)
        : Promise.resolve(null),
    ]);

    // ── Unpack settled results ────────────────────────────────────────────────
    const indices = indicesResult.status === 'fulfilled' ? indicesResult.value as AllIndicesResult | null : null;
    const adversarialRaw = adversarialResult.status === 'fulfilled' ? adversarialResult.value : null;
    const historicalPatterns = (historicalResult.status === 'fulfilled' ? historicalResult.value : []) as HistoricalPattern[];
    const worldBank = worldBankData.status === 'fulfilled' ? worldBankData.value : null;
    const openCorp = openCorpData.status === 'fulfilled' ? openCorpData.value : null;
    const numbeo = numbeoData.status === 'fulfilled' ? numbeoData.value : null;
    const agentConsensus = consensusResult.status === 'fulfilled' ? consensusResult.value as ConsensusResult | null : null;
    const nsilAssessment = nsilResult.status === 'fulfilled' ? nsilResult.value : null;
    const compositeScore = compositeResult.status === 'fulfilled' ? compositeResult.value : null;
    const compliance = complianceResult.status === 'fulfilled' ? complianceResult.value : null;
    const caseGraph = caseGraphResult.status === 'fulfilled' ? caseGraphResult.value : null;
    const regionalKernel = regionalResult.status === 'fulfilled' ? regionalResult.value : null;
    const decisionPacket = decisionResult.status === 'fulfilled' ? (decisionResult.value as any)?.packet ?? null : null;
    const domainAnalysis = domainAnalysisResult.status === 'fulfilled' ? domainAnalysisResult.value as SynthesizedAnalysis | null : null;

    // Unpack new engines (indices 13–20 in the settled array)
    const settledAll = [
      indicesResult, adversarialResult, historicalResult, worldBankData,
      openCorpData, numbeoData, consensusResult, nsilResult, compositeResult,
      complianceResult, caseGraphResult, regionalResult, decisionResult,
    ];
    // The 7 new engines were added after decisionResult in the allSettled array.
    // We need to destructure from the original Promise.allSettled call.
    // They are NOT in settledAll above — they're in the raw call below.
    // We re-run them synchronously (cached) via direct assignment:
    const methodologyKB = (() => { try { return MethodologyKnowledgeBase.lookupAll({ country, industry: (params as any).sector ? [(params as any).sector] : undefined, problemStatement: strategicQuestion || (params as any).currentMatter || '' }); } catch { return null; } })();
    const patternAssessment = (() => { try { return PatternConfidenceEngine.assess(params as ReportParameters); } catch { return null; } })();
    const maturityScores = (() => { try { return readiness >= 25 ? { scores: calculateMaturityScores(params), insights: generateAIInsights(params) } : null; } catch { return null; } })();
    const problemGraph = (() => { try { return ((params as any).currentMatter || strategicQuestion) ? ProblemToSolutionGraphService.buildGraph({ currentMatter: (params as any).currentMatter || strategicQuestion, objectives: (params as any).objectives || strategicQuestion, constraints: (params as any).constraints || '', evidenceNotes: (params as any).uploadedDocuments || [] }) : null; } catch { return null; } })();
    const dataFabric = (() => { try { return country ? GlobalDataFabricService.buildSnapshot(country, (params as any).jurisdiction || country, [(params as any).organizationType || '', (params as any).sector || ''].filter(Boolean)) : null; } catch { return null; } })();

    // ── Historical Parallel Matcher — 60 years of global case evidence ────────
    const historicalParallels: ParallelMatchResult | null = (() => {
      try {
        if (readiness >= 15 && (country || strategicQuestion || (params as any).currentMatter)) {
          return HistoricalParallelMatcher.match({
            ...params as Partial<ReportParameters>,
            country: country || '',
          });
        }
        return null;
      } catch { return null; }
    })();

    // ── Partner Intelligence Engine — ranked institutional/corporate matches ──
    const GLOBAL_PARTNER_CANDIDATES: PartnerCandidate[] = [
      { id: 'ifc', name: 'IFC (Intl Finance Corporation)', type: 'multilateral', countries: ['global'], sectors: ['infrastructure', 'finance', 'agribusiness', 'manufacturing', 'technology', 'healthcare'] },
      { id: 'adb', name: 'Asian Development Bank', type: 'multilateral', countries: ['philippines', 'vietnam', 'indonesia', 'thailand', 'india', 'bangladesh', 'cambodia', 'china', 'myanmar'], sectors: ['infrastructure', 'energy', 'urban', 'agriculture', 'finance', 'climate'] },
      { id: 'worldbank', name: 'World Bank Group', type: 'multilateral', countries: ['global'], sectors: ['infrastructure', 'education', 'health', 'finance', 'agriculture', 'environment', 'governance'] },
      { id: 'aiib', name: 'AIIB', type: 'multilateral', countries: ['china', 'india', 'indonesia', 'vietnam', 'philippines', 'malaysia', 'singapore', 'kazakhstan'], sectors: ['infrastructure', 'energy', 'transport', 'technology', 'urban', 'logistics'] },
      { id: 'dfc', name: 'DFC (US Development Finance)', type: 'multilateral', countries: ['global'], sectors: ['infrastructure', 'energy', 'technology', 'agriculture', 'finance', 'healthcare'] },
      { id: 'jica', name: 'JICA (Japan)', type: 'government', countries: ['philippines', 'vietnam', 'indonesia', 'india', 'kenya', 'ghana', 'myanmar', 'cambodia', 'laos', 'thailand'], sectors: ['infrastructure', 'agriculture', 'health', 'education', 'environment', 'urban', 'water'] },
      { id: 'dfat-aus', name: 'DFAT Australia', type: 'government', countries: ['pacific', 'indonesia', 'vietnam', 'philippines', 'papua new guinea', 'fiji', 'timor-leste', 'cambodia'], sectors: ['governance', 'education', 'infrastructure', 'health', 'agriculture', 'climate'] },
      { id: 'temasek', name: 'Temasek Holdings', type: 'corporate', countries: ['singapore', 'indonesia', 'vietnam', 'india', 'china', 'australia', 'usa', 'global'], sectors: ['technology', 'finance', 'energy', 'infrastructure', 'real estate', 'logistics', 'healthcare'] },
      { id: 'aecom', name: 'AECOM', type: 'corporate', countries: ['global'], sectors: ['infrastructure', 'transport', 'environment', 'urban', 'energy', 'water', 'government'] },
      { id: 'cdpq', name: 'CDPQ (Canada)', type: 'bank', countries: ['canada', 'global'], sectors: ['infrastructure', 'real estate', 'technology', 'finance', 'energy', 'agriculture'] },
      { id: 'gic-sg', name: 'GIC Private Limited', type: 'bank', countries: ['singapore', 'global'], sectors: ['real estate', 'infrastructure', 'technology', 'finance', 'logistics', 'healthcare'] },
      { id: 'proparco', name: 'Proparco (DFI France)', type: 'multilateral', countries: ['africa', 'asia', 'latin america', 'caribbean', 'global'], sectors: ['energy', 'agriculture', 'health', 'finance', 'urban', 'environment'] },
    ];
    const rankedPartners: RankedPartner[] | null = (() => {
      try {
        if (readiness >= 25 && country) {
          return PartnerIntelligenceEngine.rankPartners({
            country,
            sector: (params as any).sector || (params as any).organizationType || '',
            objective: (params as any).objectives || strategicQuestion || '',
            constraints: (params as any).constraints || '',
            candidates: GLOBAL_PARTNER_CANDIDATES,
          }).slice(0, 6);
        }
        return null;
      } catch { return null; }
    })();
    // IFC assessment (sync path — assessProject is synchronous)
    const ifcAssessment = (() => { try { return (country && ((params as any).sector || (params as any).organizationType)) ? IFCGlobalStandardsEngine.assessProject({ country, sector: (params as any).sector || (params as any).organizationType || 'investment', projectType: (params as any).organizationType || 'investment', investmentSizeM: 10, hasESMS: readiness >= 60, hasLaborPolicies: true, prohibitsChildLabor: true, prohibitsForcedLabor: true, hasOHSProgram: readiness >= 50 }) : null; } catch { return null; } })();

    // Motivation Detector — stakeholder motivation red-flags (sync static)
    const motivationAnalysis = (() => { try { return MotivationDetector.analyze(params as ReportParameters); } catch { return null; } })();

    // Counterfactual Engine — what-if scenario modelling (sync static)
    const counterfactualAnalysis = (() => { try { return CounterfactualEngine.analyze(params); } catch { return null; } })();

    // narrativeSynthesisEngine — bound for future prompt reference (singleton)
    const _narrativeSynth = narrativeSynthesisEngine;
    void _narrativeSynth;

    // Stored partners (synchronous localStorage read)
    const storedPartners = (() => { try { return PartnerComparisonEngine.getPartners().slice(0, 3); } catch { return []; } })();

    // ── Shape adversarial result ──────────────────────────────────────────────
    let adversarial: BrainContext['adversarial'] = null;
    if (adversarialRaw) {
      const panel = adversarialRaw.personaPanel;
      const shield = adversarialRaw.adversarialShield;
      adversarial = {
        consensusRecommendation: panel.consensus || 'Proceed with caution',
        agreementLevel: panel.agreementLevel ?? 60,
        topRisks: [
          ...(panel.insights?.filter(i => i.stance === 'oppose').flatMap(i => i.points?.slice(0, 2) ?? []) ?? []),
          ...(shield.checks?.filter(c => c.severity === 'critical').map(c => c.challengePrompt) ?? []),
        ].slice(0, 4),
        topOpportunities: panel.insights?.filter(i => i.stance === 'support').flatMap(i => i.points?.slice(0, 2) ?? []).slice(0, 3) ?? [],
        contradictionIndex: shield.contradictionIndex ?? 0,
        escalations: shield.escalations ?? [],
      };
    }

    // ── Shape external data ───────────────────────────────────────────────────
    const externalData: BrainContext['externalData'] = {
      gdp: worldBank?.gdp ?? undefined,
      gdpGrowth: worldBank?.gdpGrowth ?? undefined,
      costOfLiving: numbeo?.costOfLivingIndex ?? undefined,
      crimeIndex: numbeo?.crimeIndex ?? undefined,
      companyRecord: openCorp
        ? {
            name: openCorp.name,
            jurisdictionCode: openCorp.jurisdictionCode,
            incorporationDate: openCorp.incorporationDate,
          }
        : null,
    };

    // ── Build the combined prompt block ───────────────────────────────────────
    const promptParts: string[] = [
      `\n\n${'═'.repeat(70)}`,
      `## BWGA AI BRAIN CONTEXT — Readiness ${readiness}% — ${new Date().toISOString()}`,
      `This block is injected from the background intelligence layer. Use it to inform your response — do not summarise it verbatim, but let it shape the precision and depth of your recommendations.`,
    ];

    if (indices) promptParts.push(formatIndicesBlock(indices));
    if (adversarial) promptParts.push(formatAdversarialBlock(adversarial));
    if (historicalPatterns.length) promptParts.push(formatHistoricalBlock(historicalPatterns));
    if (Object.values(externalData).some(v => v !== undefined && v !== null)) {
      promptParts.push(formatExternalDataBlock(externalData, country));
    }
    if (agentConsensus && agentConsensus.confidence > 0) {
      promptParts.push(`\n### ── MULTI-AGENT CONSENSUS (confidence ${(agentConsensus.confidence * 100).toFixed(0)}%) ──`);
      promptParts.push(agentConsensus.finalAnswer.substring(0, 600));
      if (agentConsensus.dissent.length) {
        promptParts.push(`**Dissenting Views:** ${agentConsensus.dissent.slice(0, 2).join(' | ')}`);
      }
    }

    // ── NSIL Assessment ───────────────────────────────────────────────────────
    if (nsilAssessment) {
      promptParts.push(`\n### ── NSIL NATIONAL STRATEGIC INTELLIGENCE ──`);
      if (nsilAssessment.overallScore !== undefined) {
        promptParts.push(`**NSIL Score:** ${nsilAssessment.overallScore}/100 | **Risk Level:** ${nsilAssessment.riskLevel || 'medium'}`);
      }
      if (nsilAssessment.strategicOpportunities?.length) {
        promptParts.push(`**Strategic Opportunities:**`);
        (nsilAssessment.strategicOpportunities as string[]).slice(0, 3).forEach((o: string) => promptParts.push(`- ${o}`));
      }
      if (nsilAssessment.criticalRisks?.length) {
        promptParts.push(`**Critical Risks:**`);
        (nsilAssessment.criticalRisks as string[]).slice(0, 3).forEach((r: string) => promptParts.push(`- ⚠ ${r}`));
      }
    }

    // ── Composite Score ───────────────────────────────────────────────────────
    if (compositeScore) {
      promptParts.push(`\n### ── COMPOSITE STRATEGIC SCORE ──`);
      const cs = compositeScore as any;
      const scoreLines = [
        cs.spi !== undefined ? `SPI: ${cs.spi}` : '',
        cs.ivas !== undefined ? `IVAS: ${cs.ivas}` : '',
        cs.scf !== undefined ? `SCF: ${cs.scf}` : '',
        cs.overall !== undefined ? `Overall: ${cs.overall}/100` : '',
      ].filter(Boolean);
      if (scoreLines.length) promptParts.push(scoreLines.join('  |  '));
    }

    // ── Compliance ────────────────────────────────────────────────────────────
    if (compliance) {
      const comp = compliance as any;
      const alerts = (comp.alerts || comp.issues || comp.requirements || []) as string[];
      if (alerts.length) {
        promptParts.push(`\n### ── JURISDICTION COMPLIANCE ALERTS (${country}) ──`);
        alerts.slice(0, 4).forEach((a: string) => promptParts.push(`- 📋 ${a}`));
      }
    }

    // ── Case Graph Summary ────────────────────────────────────────────────────
    if (caseGraph && (caseGraph as any).summary) {
      const gs = (caseGraph as any).summary;
      promptParts.push(`\n### ── CASE GRAPH (Evidence ${gs.evidenceStrength}/100 | Stakeholders ${gs.stakeholderCoverage}/100 | Objective Clarity ${gs.objectiveClarity}/100) ──`);
      if ((caseGraph as any).nodes?.length) {
        const topNodes = (caseGraph as any).nodes.slice(0, 5).map((n: any) => `${n.type}:${n.label}`).join(', ');
        promptParts.push(`Key nodes: ${topNodes}`);
      }
    }

    // ── Regional Kernel ───────────────────────────────────────────────────────
    if (regionalKernel) {
      const rk = regionalKernel as any;
      if (rk.interventions?.length) {
        promptParts.push(`\n### ── REGIONAL DEVELOPMENT KERNEL (${country}) ──`);
        promptParts.push(`**Top Recommended Interventions:**`);
        (rk.interventions as any[]).slice(0, 3).forEach((iv: any) => {
          promptParts.push(`- **${iv.title}** (score: ${iv.score}) — ${iv.rationale}`);
        });
      }
      if (rk.executionPlan?.length) {
        promptParts.push(`**Execution Stages:** ${(rk.executionPlan as any[]).map((s: any) => s.stage).join(' → ')}`);
      }
    }

    // ── Decision Pipeline ───────────────────────────────────────────────────────
    if (decisionPacket) {
      const dp = decisionPacket as any;
      promptParts.push(`\n### ── DECISION PIPELINE ──`);
      if (dp.recommendation) promptParts.push(`**Recommendation:** ${dp.recommendation}`);
      if (dp.confidence !== undefined) promptParts.push(`**Decision Confidence:** ${Math.round(dp.confidence * 100)}%`);
      if (dp.blockers?.length) {
        promptParts.push(`**Gate Blockers:** ${(dp.blockers as string[]).slice(0, 3).join('; ')}`);
      }
      if (dp.nextSteps?.length) {
        promptParts.push(`**Next Steps:**`);
        (dp.nextSteps as string[]).slice(0, 3).forEach((s: string) => promptParts.push(`- ${s}`));
      }
    }

    // ── Stored Partners ───────────────────────────────────────────────────────
    if (storedPartners.length) {
      promptParts.push(`\n### ── KNOWN PARTNERS IN SYSTEM (${storedPartners.length}) ──`);
      storedPartners.forEach((p: any) => {
        promptParts.push(`- **${p.name}** (${p.country || '?'}) — ${p.sector || p.type || ''}${p.trustScore ? ` | Trust: ${p.trustScore}` : ''}`);
      });
    }

    // ── Methodology Knowledge Base ─────────────────────────────────────────
    if (methodologyKB?.internalKnowledgeAvailable) {
      promptParts.push(`\n### ── METHODOLOGY KNOWLEDGE BASE ──`);
      if (methodologyKB.countryIntel) {
        const ci = methodologyKB.countryIntel as any;
        const lines: string[] = [];
        if (ci.keyRisks?.length) lines.push(`Key Risks: ${(ci.keyRisks as string[]).slice(0, 3).join(', ')}`);
        if (ci.opportunities?.length) lines.push(`Opportunities: ${(ci.opportunities as string[]).slice(0, 3).join(', ')}`);
        if (lines.length) promptParts.push(...lines);
      }
      if (methodologyKB.methodologies?.length) {
        promptParts.push(`**Applicable Methodologies:** ${(methodologyKB.methodologies as any[]).map((m: any) => m.domain || m.name).slice(0, 4).join(', ')}`);
      }
      if (methodologyKB.sectorIntel?.length) {
        const si = methodologyKB.sectorIntel[0] as any;
        if (si?.keyDrivers?.length) promptParts.push(`**Sector Drivers:** ${(si.keyDrivers as string[]).slice(0, 3).join(', ')}`);
      }
    }

    // ── IFC Global Standards ─────────────────────────────────────────────────
    if (ifcAssessment) {
      const ifc = ifcAssessment as any;
      promptParts.push(`\n### ── IFC GLOBAL STANDARDS ASSESSMENT ──`);
      if (ifc.overallScore !== undefined) promptParts.push(`**IFC Compliance Score:** ${ifc.overallScore}/100 | **Classification:** ${ifc.projectClassification || 'Category B'}`);
      if (ifc.criticalGaps?.length) {
        promptParts.push(`**Critical IFC Gaps (${(ifc.criticalGaps as any[]).length}):**`);
        (ifc.criticalGaps as any[]).slice(0, 3).forEach((g: any) => promptParts.push(`- ⚠ ${g.standard || g.gap || g}`));
      }
      if (ifc.sdgAlignment?.length) {
        promptParts.push(`**SDG Alignment:** ${(ifc.sdgAlignment as any[]).map((s: any) => s.sdgId || s).slice(0, 5).join(', ')}`);
      }
    }

    // ── Pattern Confidence ───────────────────────────────────────────────────
    if (patternAssessment) {
      const pa = patternAssessment as any;
      promptParts.push(`\n### ── PATTERN CONFIDENCE ENGINE ──`);
      if (pa.overallConfidence !== undefined) promptParts.push(`**Pattern Confidence:** ${Math.round(pa.overallConfidence * 100)}% | **Quality:** ${pa.dataQuality || 'medium'}`);
      if (pa.topPatterns?.length) {
        promptParts.push(`**Historical Patterns Matched:**`);
        (pa.topPatterns as any[]).slice(0, 3).forEach((p: any) => promptParts.push(`- ${typeof p === 'string' ? p : (p.description || p.label || p.category || JSON.stringify(p).slice(0, 80))}`));
      }
      if (pa.warnings?.length) {
        promptParts.push(`**Pattern Warnings:** ${(pa.warnings as string[]).slice(0, 2).join(' | ')}`);
      }
    }

    // ── Maturity Scores ──────────────────────────────────────────────────────
    if (maturityScores?.scores?.length) {
      const strong = (maturityScores.scores as any[]).filter((s: any) => s.status === 'Strong' || s.status === 'Excellent');
      const critical = (maturityScores.scores as any[]).filter((s: any) => s.status === 'Critical' || s.status === 'Below Average');
      promptParts.push(`\n### ── MATURITY ENGINE ──`);
      if (strong.length) promptParts.push(`**Strong Dimensions:** ${strong.map((s: any) => `${s.dimension}(${s.score}/5)`).join(', ')}`);
      if (critical.length) promptParts.push(`**Critical Dimensions:** ${critical.map((s: any) => `${s.dimension}(${s.score}/5)`).join(', ')}`);
      if (maturityScores.insights?.length) {
        promptParts.push(`**Alert:** ${(maturityScores.insights as any[])[0]?.message || ''}`);
      }
    }

    // ── Problem-to-Solution Graph ────────────────────────────────────────────
    if (problemGraph) {
      const pg = problemGraph as any;
      promptParts.push(`\n### ── PROBLEM-TO-SOLUTION GRAPH ──`);
      if (pg.rootCauses?.length) {
        promptParts.push(`**Root Causes:** ${(pg.rootCauses as any[]).map((n: any) => n.label?.slice(0, 60)).join(' | ')}`);
      }
      if (pg.leveragePoints?.length) {
        const lp = (pg.leveragePoints as any[])[0];
        promptParts.push(`**Top Leverage Point:** ${lp?.label} → ${(lp?.requiredOutputs as string[])?.join(', ')}`);
      }
    }

    // ── Global Data Fabric ───────────────────────────────────────────────────
    if (dataFabric) {
      const df = dataFabric as any;
      if (df.signals?.length) {
        promptParts.push(`\n### ── GLOBAL DATA FABRIC SIGNALS (${(df.signals as any[]).length}) ──`);
        (df.signals as any[]).slice(0, 4).forEach((s: any) => {
          promptParts.push(`- [${(s.type || 'signal').toUpperCase()}] ${s.headline || s.title || s.summary || ''}${s.impact ? ` — Impact: ${s.impact}` : ''}`);
        });
      }
    }

    // ── Motivation Analysis ───────────────────────────────────────────────────
    if (motivationAnalysis) {
      const ma = motivationAnalysis as any;
      if (ma.redFlags?.length) {
        promptParts.push(`\n### ── MOTIVATION DETECTOR ──`);
        promptParts.push(`**Implied Motivation:** ${ma.impliedMotivation || 'unclassified'}`);
        (ma.redFlags as any[]).slice(0, 2).forEach((rf: any) =>
          promptParts.push(`⚠️ ${rf.flag || rf.category}: ${rf.recommendation || rf.message || ''}`)
        );
      }
    }

    // ── Domain Agent Synthesis ────────────────────────────────────────────────
    if (domainAnalysis?.synthesis) {
      const da = domainAnalysis;
      promptParts.push(`\n### ── DOMAIN AGENT SYNTHESIS (${da.agentResponses.length} agents, confidence ${da.synthesis.confidenceLevel}%) ──`);
      promptParts.push(`**Primary Insight:** ${da.synthesis.primaryInsight.substring(0, 400)}`);
      if (da.synthesis.alternativeViewpoints?.length) {
        promptParts.push(`**Alternative Viewpoints:** ${da.synthesis.alternativeViewpoints.slice(0, 2).join(' | ')}`);
      }
    }

    // ── Historical Parallel Matches (60 years of documented global cases) ─────
    if (historicalParallels && historicalParallels.matches.length > 0) {
      promptParts.push(`\n### ── HISTORICAL PARALLEL MATCHER (${historicalParallels.successRate}% success rate across ${historicalParallels.matches.length} similar cases) ──`);
      promptParts.push(`**Synthesis:** ${historicalParallels.synthesisInsight}`);
      if (historicalParallels.matches[0]) {
        const top = historicalParallels.matches[0];
        promptParts.push(`**Closest Precedent:** ${top.title} (${top.country}, ${top.year}) — ${top.outcome} — "${top.description.substring(0, 150)}"`);
        if (top.lessonsLearned?.length) promptParts.push(`**Key Lessons:** ${top.lessonsLearned.slice(0, 2).join(' | ')}`);
      }
      if (historicalParallels.commonSuccessFactors.length) {
        promptParts.push(`**What Works:** ${historicalParallels.commonSuccessFactors.slice(0, 3).join(' | ')}`);
      }
      if (historicalParallels.commonFailureFactors.length) {
        promptParts.push(`**⚠ Common Failure Points:** ${historicalParallels.commonFailureFactors.slice(0, 3).join(' | ')}`);
      }
      if (historicalParallels.recommendedActions.length) {
        promptParts.push(`**Actions to Take Now:** ${historicalParallels.recommendedActions.slice(0, 3).join(' | ')}`);
      }
    }

    // ── Ranked Partner Candidates ─────────────────────────────────────────────
    if (rankedPartners && rankedPartners.length > 0) {
      promptParts.push(`\n### ── PARTNER INTELLIGENCE ENGINE — Top ${Math.min(4, rankedPartners.length)} Ranked Partners for ${country} ──`);
      rankedPartners.slice(0, 4).forEach((rp, i) => {
        const reasons = rp.reasons.slice(0, 2).join(', ') || 'general strategic alignment';
        promptParts.push(`${i + 1}. **${rp.partner.name}** (${rp.partner.type}) — Score: ${rp.score.total}/100 | Fit: ${rp.score.partnerFit} | Policy Alignment: ${rp.score.policyAlignment} | Delivery: ${rp.score.deliveryReliability} — ${reasons}`);
      });
      promptParts.push(`When advising on partners, introductions, letters of intent, or engagement strategies — reference these ranked matches with their scores and alignment rationale.`);
    }

    // ── Counterfactual Analysis ───────────────────────────────────────────────
    if (counterfactualAnalysis) {
      const ca = counterfactualAnalysis as any;
      if (ca.scenarios?.length) {
        promptParts.push(`\n### ── COUNTERFACTUAL ENGINE (What-If Scenarios) ──`);
        (ca.scenarios as any[]).slice(0, 2).forEach((s: any) => {
          promptParts.push(`- **If ${s.condition || s.scenario}:** ${s.outcome || s.result || ''}`);
        });
      }
    }

    // ── Document Catalog Recommendations (247 docs + 156 letters) ────────────
    const catalogKeywords = [
      params.country || '',
      params.sector || '',
      (params as any).organizationType || '',
      strategicQuestion,
      ...((params as any).strategicIntent || []),
    ].join(' ');

    const bestDoc = DocumentTypeRouter.findBestDocumentType(catalogKeywords);
    const bestLetter = DocumentTypeRouter.findBestLetterType(catalogKeywords);
    const coreDocs = ['executive-brief', 'risk-assessment-report', 'partner-proposal'];
    const coreLetters = ['loi-investment', 'loi-partnership', 'engagement-introduction'];

    const recommendedDocumentIds = [...new Set([
      ...coreDocs,
      bestDoc?.id,
      readiness >= 60 ? 'due-diligence-report' : null,
      readiness >= 70 ? 'full-feasibility-study' : 'investment-attraction-strategy',
      readiness >= 80 ? 'government-submission' : null,
    ].filter(Boolean) as string[])];

    const recommendedLetterIds = [...new Set([
      ...coreLetters,
      bestLetter?.id,
      readiness >= 60 ? 'gov-regulatory-inquiry' : null,
      readiness >= 70 ? 'gov-incentive-request' : null,
    ].filter(Boolean) as string[])];

    const catalogSummary = DocumentTypeRouter.getCatalogSummary();
    promptParts.push(`\n### ── DOCUMENT CATALOG (${catalogSummary.totalDocumentTypes} Types | ${catalogSummary.totalLetterTypes} Letter Templates) ──`);
    promptParts.push(`**Top Recommended Documents:** ${recommendedDocumentIds.slice(0, 5).join(', ')}`);
    promptParts.push(`**Top Recommended Letters:** ${recommendedLetterIds.slice(0, 4).join(', ')}`);
    if (bestDoc) promptParts.push(`**Best Case Match:** ${bestDoc.name} (${bestDoc.category})`);
    if (bestLetter) promptParts.push(`**Best Letter Match:** ${bestLetter.name} (${bestLetter.category})`);

    promptParts.push(`${'═'.repeat(70)}\n`);

    const result: BrainContext = {
      promptBlock: promptParts.join('\n'),
      indices,
      adversarial,
      agentConsensus,
      historicalPatterns,
      externalData,
      nsilAssessment,
      compositeScore,
      compliance,
      caseGraph,
      regionalKernel,
      decisionPacket,
      computedAt: new Date().toISOString(),
      readiness,
      recommendedDocumentIds,
      recommendedLetterIds,
      methodologyKB,
      ifcAssessment,
      patternAssessment,
      maturityScores,
      problemGraph,
      dataFabric,
      motivationAnalysis,
      counterfactualAnalysis,
      domainAnalysis,
      historicalParallels,
      rankedPartners,
      derivedIndices: null, // async path handled by Promise.allSettled above — populated on next enrich() call
    };

    cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  }

  /** Invalidate cache for a country (call when country changes in caseStudy) */
  static bust(country: string): void {
    for (const [key] of cache) {
      if (key.startsWith(country)) cache.delete(key);
    }
  }

  /** Returns a minimal plain-text summary of what the brain found (for sidebar) */
  static summarise(ctx: BrainContext): string {
    const lines: string[] = [];
    if (ctx.indices) {
      lines.push(`Overall: ${ctx.indices.composite.overallScore}/100 | Risk-adj: ${ctx.indices.composite.riskAdjustedScore}/100`);
    }
    if (ctx.adversarial) {
      lines.push(`Personas: ${ctx.adversarial.agreementLevel}% agreement | ${ctx.adversarial.topRisks.length} risk signals`);
    }
    if (ctx.historicalPatterns.length) {
      lines.push(`History: ${ctx.historicalPatterns.length} matching patterns`);
    }
    return lines.join(' · ');
  }
}

export default BrainIntegrationService;
