/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ NEXUS AI - BRAIN INTEGRATION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The unified "always-on" background brain that aggregates every analytical
 * engine into a single enriched context block.  BWConsultantOS calls this
 * whenever caseStudy readiness >= 30 and injects the result into the AI
 * prompt so the consultant speaks from the full intelligence of every engine.
 *
 * Engines activated here (all previously orphaned):
 *  • AdversarialReasoningService   - 5-persona debate + shield + counterfactuals
 *  • ComprehensiveIndicesEngine     - 15 strategic indices (BARNA, CRI, NVI …)
 *  • MultiAgentOrchestrator         - Gemini / GPT-4 / Claude consensus layer
 *  • HistoricalLearningEngine       - 200-year economic pattern matching
 *  • externalDataIntegrations       - World Bank, OpenCorporates, Numbeo
 *  • MotivationDetector             - stakeholder motivation analysis
 *  • PersonaEngine                  - 5-persona analysis
 *  • CounterfactualEngine           - what-if scenario modelling
 *  • OutcomeTracker                 - prior outcome learning
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
import MotivationDetector from './MotivationDetector';
import CounterfactualEngine from './CounterfactualEngine';
import { narrativeSynthesisEngine } from './narrativeSynthesisEngine';
import { HistoricalParallelMatcher, type ParallelMatchResult } from './HistoricalParallelMatcher';
import { PartnerIntelligenceEngine, type RankedPartner, type PartnerCandidate } from './PartnerIntelligenceEngine';
import SituationAnalysisEngine from './SituationAnalysisEngine';
import OutcomeTracker from './OutcomeTracker';
import { selfLearningEngine } from './selfLearningEngine';
import { UnbiasedAnalysisEngine } from './UnbiasedAnalysisEngine';
import PersonaEngine from './PersonaEngine';
import { DerivedIndexService } from './DerivedIndexService';
import { findRelevantEngagements, buildAdvisorSnapshot as _buildAdvisorSnapshot } from './GlobalIntelligenceEngine';
import { buildAdvisorInputFromParams } from './buildAdvisorInputModel';
import { osintSearch } from './osintSearchService';
import { ConsultantGateService } from './ConsultantGateService';
import { ReactiveIntelligenceEngine } from './ReactiveIntelligenceEngine';
import { GlobalIssueResolver } from './GlobalIssueResolver';
import { selfImprovementEngine } from './SelfImprovementEngine';
import { getACLEDSummary } from './acledService';
import { screenEntitySanctions } from './openSanctionsService';
import { fetchComtradeData } from './unComtradeService';
import { tavilyResearchQuestion } from './tavilySearchService';
import { ReportParameters } from '../types';
import IntelligenceQualityGate, { type IntelligenceQualityAssessment } from './IntelligenceQualityGate';
import { resolveCountryCode as resolveGovernanceCountryCode } from './vdemGovernanceService';
import {
  ResearchEcosystemScoringService,
  type ResearchEcosystemAssessment,
} from './ResearchEcosystemScoringService';
import {
  FailureModeGovernanceService,
  type FailureModeGovernanceAssessment,
} from './FailureModeGovernanceService';
import { proactiveOrchestrator, type ProactiveBriefing } from './proactive/ProactiveOrchestrator';
import type { CurrentContext } from './proactive/ProactiveSignalMiner';
import { simulateScenario as causalSimulateScenario } from '../core/causal-reasoning-simulation/index';
import { checkCompliance as coreCheckCompliance, detectBias as coreDetectBias } from '../core/ethics-governance/index';
import { RegionalCityDiscoveryEngine, type DiscoveryResult } from './RegionalCityDiscoveryEngine';
import { BotsOnGroundNetwork } from './BotsOnGroundNetwork';
import { RelocationPathwayEngine } from './RelocationPathwayEngine';
import { GlobalCityIndex } from './GlobalCityIndex';
import { RelocationOutcomeTracker } from './RelocationOutcomeTracker';
import { SupplyChainEcosystemMapper } from './SupplyChainEcosystemMapper';
import { WorkforceIntelligenceEngine } from './WorkforceIntelligenceEngine';
import { FunctionLevelSplitter } from './FunctionLevelSplitter';
import { ESGClimateScorer } from './ESGClimateScorer';
import { NetworkEffectEngine } from './NetworkEffectEngine';
import { Tier1ExtractionEngine } from './Tier1ExtractionEngine';
import { GovernmentIncentiveVault } from './GovernmentIncentiveVault';
import { QuantumMonteCarlo } from './quantum/QuantumMonteCarlo';
import { QuantumPatternMatcher } from './quantum/QuantumPatternMatcher';
import { QuantumCognitionBridge } from './quantum/QuantumCognitionBridge';
import { SystemCapabilityBoundary, type CapabilitySnapshot } from './SystemCapabilityBoundary';
import { FinancialCalculationService, type FinancialSnapshot } from './FinancialCalculationService';
import { RiskMatrixEngine, type RiskMatrixResult } from './RiskMatrixEngine';
import { runCognitiveAnalysis, formatCognitiveForPrompt, type CognitiveAnalysis } from './CognitiveReasoningEngine';

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
  /** IFC Global Standards - compliance gap analysis */
  ifcAssessment: any | null;
  /** Pattern confidence - historical pattern strength for this case */
  patternAssessment: any | null;
  /** Maturity engine - 1-5 scale across strategic dimensions */
  maturityScores: { scores: any[]; insights: any[] } | null;
  /** Problem-to-solution graph - root causes, bottlenecks, leverage points */
  problemGraph: any | null;
  /** Global data fabric - normalised signals snapshot */
  dataFabric: any | null;
  /** Motivation detector - stakeholder motivation red-flags */
  motivationAnalysis: any | null;
  /** Counterfactual engine - what-if scenario analysis */
  counterfactualAnalysis: any | null;
  /** Domain agent synthesis (Gov, Banking, Corporate, Market, Risk, Historical) */
  domainAnalysis: SynthesizedAnalysis | null;
  /** Historical parallel matches - 60 years of documented practice from the case library */
  historicalParallels: ParallelMatchResult | null;
  /** Ranked partner candidates - best matched institutional, government, corporate partners */
  rankedPartners: RankedPartner[] | null;
  /** Situation analysis - perspectives, blind spots, contrarian view */
  situationAnalysis: { unconsideredNeeds: string[]; blindSpots: string[]; recommendedQuestions: string[]; contrarianView: string } | null;
  /** Self-learning insights - performance-based recommendations */
  selfLearningInsights: string[] | null;
  /** Unbiased analysis - pro/con, debate positions, alternative options */
  unbiasedAnalysis: { proPoints: string[]; conPoints: string[]; alternatives: string[] } | null;
  /** 4-persona analysis: Skeptic / Advocate / Regulator / Accountant */
  personaAnalysis: { skepticFindings: string[]; advocateFindings: string[]; regulatorFindings: string[]; accountantFindings: string[] } | null;
  /** Reference engagements from 200-year global case library */
  referenceEngagements: Array<{ id: string; scenario: string; summary: string; playbook: string[]; outcomes: string[] }> | null;
  /** OSINT results for the target country/org */
  osintResults: Array<{ title: string; url: string; snippet: string }> | null;
  /** Derived indices - PRI / TCO / CRI computed scores */
  derivedIndices: { pri?: any; cri?: any; tco?: any } | null;
  /** ConsultantGate - who/where/what/audience/deadline completeness check */
  gateStatus: { isReady: boolean; missing: string[]; summary: Record<string, string> } | null;
  /** Reactive intelligence - live opportunity signals */
  reactiveOpportunities: Array<{ id: string; type: string; description?: string; signal?: string }> | null;
  /** Reactive intelligence - live risk signals */
  reactiveRisks: Array<{ id: string; type: string; description?: string; signal?: string }> | null;
  /** Intelligence quality adjudication for this brain snapshot */
  qualityGate: IntelligenceQualityAssessment;
  /** Research ecosystem readiness: talent attraction + innovation conversion */
  researchEcosystem: ResearchEcosystemAssessment | null;
  /** Failure mode governance: delusion/model/search/objective/guardrail risk */
  failureModeGovernance: FailureModeGovernanceAssessment | null;
  /** Proactive Layer 7 briefing: drift, backtesting, signals, meta-cognition */
  proactiveBriefing: ProactiveBriefing | null;
  /** Core causal reasoning simulation result */
  causalSimulation: { explanation: string; outcome?: number } | null;
  /** Core ethics/governance compliance + bias check */
  coreEthics: { isCompliant: boolean; overallRisk: string; topIssues: string[]; biases: string[] } | null;
  /** Regional City Discovery - proactive overlooked city matches */
  regionalCityDiscovery: DiscoveryResult | null;
  /** Boots on Ground - local ground-truth intelligence for shortlisted cities */
  bootsOnGround: any | null;
  /** Relocation Pathway - 90-day phased action plans */
  relocationPathway: any | null;
  /** Global City Index - multi-dimensional city rankings */
  globalCityIndex: any | null;
  /** Relocation Outcome Tracker - historical outcome lessons */
  relocationOutcomes: any | null;
  /** Supply Chain Ecosystem Mapper - supplier & logistics maps */
  supplyChainMap: any | null;
  /** Workforce Intelligence - salary, talent pipeline, attrition */
  workforceIntelligence: any | null;
  /** Function-Level Splitter - keep/relocate/split analysis */
  functionSplit: any | null;
  /** ESG & Climate Resilience - environmental/social/governance profiles */
  esgClimate: any | null;
  /** Network Effect Engine - cluster density & co-location benefits */
  networkEffects: any | null;
  /** Tier-1 Extraction - T1 opportunity extraction from datasets */
  tier1Extraction: any | null;
  /** Government Incentive Vault - incentive matching for target country */
  governmentIncentives: any | null;
  /** Quantum Monte Carlo - risk simulation with 5000 iterations */
  quantumMonteCarlo: any | null;
  /** Quantum Pattern Matcher - historical pattern detection */
  quantumPatterns: any | null;
  /** Quantum Cognition Bridge - cognitive bias modelling */
  quantumCognition: any | null;
  /** System capability boundaries - what the system does and does not do */
  capabilityBoundary: CapabilitySnapshot | null;
  /** Financial Calculation Engine - NPV / IRR / payback / scenarios */
  financialAnalysis: FinancialSnapshot | null;
  /** Risk Matrix Engine - programmatic 5x5 likelihood x impact grid */
  riskMatrix: RiskMatrixResult | null;
  /** Cognitive Reasoning Engine - 12 human brain thinking layers */
  cognitiveAnalysis: CognitiveAnalysis | null;
}

// ─── Simple in-process cache (keyed by country + objectives + org) ────────────

interface CacheEntry {
  result: BrainContext;
  expiresAt: number;
}

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
const cache = new Map<string, CacheEntry>();

function cacheKey(params: Partial<ReportParameters & { readiness: number }>): string {
  return [params.country, params.organizationName, (params as any).sector || params.organizationType, Math.floor((params.readiness ?? 0) / 20)].join('|');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countryToISO(country: string): string {
  const governanceResolved = resolveGovernanceCountryCode(country);
  if (governanceResolved) return governanceResolved;
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

// ─── Intelligent Brain Thinking System ────────────────────────────────────────
// The brain doesn't just pattern-match keywords. It THINKS. It introspects its
// own capabilities, deeply analyses what the user is really asking, scores every
// engine group for relevance, and builds an execution plan with reasoning.
// When live data is needed, it knows which engines have real-time access.
// The thinking process is logged so the AI consultant can see the brain's reasoning.

type EngineGroup =
  | 'foundation'    // Core scoring: indices, NSIL, composite, case graph, maturity, gate
  | 'country'       // Country intelligence: World Bank, Numbeo, ACLED, Comtrade, compliance, regional, ESG
  | 'organization'  // Org intelligence: OpenCorp, sanctions, OSINT, partners
  | 'strategic'     // Strategic analysis: adversarial, persona, domain agents, decision pipeline
  | 'historical'    // Historical: patterns, parallels, reference engagements
  | 'risk'          // Risk focus: risk matrix, counterfactual, reactive, derived indices
  | 'financial'     // Financial: NPV/IRR calc, incentives, cost analysis
  | 'deep-research' // External research: Tavily, multi-agent consensus, OSINT deep
  | 'relocation'    // Relocation: city discovery, boots on ground, pathway, workforce, supply chain
  | 'quantum'       // Quantum: Monte Carlo, pattern matcher, cognition bridge
  | 'proactive'     // Proactive: Layer 7, self-improvement, causal reasoning
  | 'ethics';       // Ethics: IFC standards, compliance check, bias detection

// ─── Engine Capability Registry ──────────────────────────────────────────────
// Every engine group declares what it provides, what questions it answers,
// whether it has live external data, and when it's most useful. The brain
// introspects this registry to decide what to fire for any given query.

interface EngineGroupCapability {
  group: EngineGroup;
  provides: string;
  answersQuestions: string[];
  hasLiveData: boolean;
  dataSources: string[];
  requiresCountry: boolean;
  requiresOrg: boolean;
  minReadiness: number;
  costWeight: number; // 1-10, higher = more expensive to run
}

const ENGINE_REGISTRY: EngineGroupCapability[] = [
  {
    group: 'foundation',
    provides: '15 strategic indices (BARNA/NVI/CRI/CAP/AGI/VCI/ATI/ESI/ISI/OSI/TCO/PRI/RNI/SRA/IDV), NSIL assessment, composite scores, case graph, maturity scoring, methodology KB, problem-to-solution graph, situation analysis, consultant gate',
    answersQuestions: ['readiness', 'scores', 'quality', 'maturity', 'baseline', 'how ready', 'what is status', 'overview', 'summary', 'assess', 'evaluate', 'diagnose', 'what do we know', 'starting point'],
    hasLiveData: false,
    dataSources: ['Internal indices', 'Methodology knowledge base', 'Case graph builder'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 0,
    costWeight: 3,
  },
  {
    group: 'country',
    provides: 'GDP, GDP growth, cost of living, crime index, trade data, conflict events, compliance alerts, regional development plans, ESG climate scores, global data fabric signals',
    answersQuestions: ['economy', 'gdp', 'growth', 'cost of living', 'safety', 'conflict', 'trade', 'regulation', 'compliance', 'country profile', 'jurisdiction', 'market size', 'stability', 'environment', 'climate', 'how safe', 'what are the risks in', 'tell me about'],
    hasLiveData: true,
    dataSources: ['World Bank API', 'Numbeo API', 'ACLED API', 'UN Comtrade API', 'Global Compliance Framework', 'ESG Climate Scorer'],
    requiresCountry: true,
    requiresOrg: false,
    minReadiness: 0,
    costWeight: 4,
  },
  {
    group: 'organization',
    provides: 'Company registry records, sanctions screening, OSINT intelligence, partner rankings, partner comparisons',
    answersQuestions: ['company', 'partner', 'organization', 'entity', 'who are they', 'sanctions', 'due diligence', 'background check', 'partner fit', 'stakeholder', 'who should we work with', 'is this entity safe', 'firm'],
    hasLiveData: true,
    dataSources: ['OpenCorporates API', 'OpenSanctions API', 'OSINT search', 'Partner Intelligence Engine'],
    requiresCountry: false,
    requiresOrg: true,
    minReadiness: 0,
    costWeight: 3,
  },
  {
    group: 'strategic',
    provides: 'Adversarial 5-persona debate, persona analysis (Skeptic/Advocate/Regulator/Accountant), domain agent synthesis (Gov/Banking/Corporate/Market/Risk/Historical), decision pipeline, motivation detection, unbiased pro/con analysis, causal reasoning',
    answersQuestions: ['strategy', 'recommend', 'advise', 'what should we do', 'approach', 'plan', 'decision', 'options', 'pros cons', 'feasibility', 'evaluate', 'engage', 'next steps', 'how to proceed', 'best approach', 'debate', 'perspectives', 'what are our options'],
    hasLiveData: false,
    dataSources: ['Adversarial Reasoning Service', 'Persona Engine', 'Domain Agent Orchestrator', 'Decision Pipeline', 'Causal Reasoning Engine'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 30,
    costWeight: 6,
  },
  {
    group: 'historical',
    provides: 'Historical patterns (200-year case library), parallel matches (60 years documented), reference engagements, pattern confidence scores',
    answersQuestions: ['precedent', 'what happened before', 'similar cases', 'historical', 'lessons learned', 'track record', 'has this worked', 'past examples', 'evidence', 'case study', 'what can we learn', 'comparable'],
    hasLiveData: false,
    dataSources: ['Historical Learning Engine', 'Historical Parallel Matcher', 'Global Intelligence Engine', 'Pattern Confidence Engine'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 15,
    costWeight: 2,
  },
  {
    group: 'risk',
    provides: 'Risk matrix (5x5 likelihood x impact), counterfactual what-if scenarios, reactive live opportunity/risk signals, derived risk indices (PRI/TCO/CRI)',
    answersQuestions: ['risk', 'threat', 'danger', 'what could go wrong', 'vulnerability', 'mitigation', 'what if', 'worst case', 'scenario', 'exposure', 'likelihood', 'impact', 'compliance risk', 'audit', 'due diligence'],
    hasLiveData: true,
    dataSources: ['Risk Matrix Engine', 'Counterfactual Engine', 'Reactive Intelligence Engine', 'Derived Index Service'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 25,
    costWeight: 4,
  },
  {
    group: 'financial',
    provides: 'NPV/IRR/payback calculations, government incentives, cost analysis, financial projections, ROI scenarios',
    answersQuestions: ['cost', 'budget', 'roi', 'npv', 'irr', 'payback', 'revenue', 'profit', 'investment', 'funding', 'incentive', 'capital', 'financial', 'how much', 'is it worth it', 'return', 'economic benefit', 'grants', 'tax incentive'],
    hasLiveData: false,
    dataSources: ['Financial Calculation Service', 'Government Incentive Vault'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 20,
    costWeight: 2,
  },
  {
    group: 'deep-research',
    provides: 'Tavily web research synthesis, multi-agent consensus (Gemini/GPT-4/Claude), comprehensive external research answers',
    answersQuestions: ['research', 'find out', 'what is the latest', 'current situation', 'investigate', 'deep dive', 'comprehensive', 'detailed analysis', 'thorough', 'explore', 'what does the evidence say', 'search for'],
    hasLiveData: true,
    dataSources: ['Tavily Search API', 'Multi-Agent Consensus (Gemini/GPT-4/Claude)'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 40,
    costWeight: 8,
  },
  {
    group: 'relocation',
    provides: 'City rankings, overlooked city discovery, 90-day relocation plans, workforce intelligence (salary/talent/attrition), supply chain maps, function-level split analysis, network effects, tier-1 extraction, boots-on-ground local intelligence',
    answersQuestions: ['relocate', 'offshore', 'outsource', 'bpo', 'nearshore', 'city', 'where should we go', 'workforce', 'talent', 'labor', 'supply chain', 'manufacturing', 'headcount', 'which location', 'compare cities', 'site selection', 'move operations'],
    hasLiveData: false,
    dataSources: ['Regional City Discovery Engine', 'Global City Index', 'Workforce Intelligence Engine', 'Supply Chain Mapper', 'Boots on Ground Network', 'Relocation Pathway Engine'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 20,
    costWeight: 5,
  },
  {
    group: 'quantum',
    provides: 'Monte Carlo risk simulation (5000 iterations), quantum pattern detection, cognitive bias modelling',
    answersQuestions: ['simulate', 'probability', 'monte carlo', 'simulation', 'uncertainty', 'confidence interval', 'bias', 'cognitive', 'pattern', 'statistical', 'model'],
    hasLiveData: false,
    dataSources: ['Quantum Monte Carlo Engine', 'Quantum Pattern Matcher', 'Quantum Cognition Bridge'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 50,
    costWeight: 7,
  },
  {
    group: 'proactive',
    provides: 'Layer 7 proactive briefing (drift detection, backtesting, meta-cognition, signals), self-improvement analysis, self-learning recommendations',
    answersQuestions: ['what are we missing', 'proactive', 'signal', 'trend', 'drift', 'improve', 'calibrate', 'something we should know', 'overlooked', 'blind spot', 'early warning'],
    hasLiveData: false,
    dataSources: ['Proactive Orchestrator (Layer 7)', 'Self-Improvement Engine', 'Self-Learning Engine'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 30,
    costWeight: 5,
  },
  {
    group: 'ethics',
    provides: 'IFC Global Standards compliance gaps, SDG alignment, ethics/governance compliance check, bias detection',
    answersQuestions: ['ethical', 'ifc', 'standards', 'sdg', 'sustainable', 'governance', 'bias', 'compliance', 'responsible', 'esg', 'social impact', 'labor rights', 'human rights', 'environmental'],
    hasLiveData: false,
    dataSources: ['IFC Global Standards Engine', 'Core Ethics/Governance Module'],
    requiresCountry: false,
    requiresOrg: false,
    minReadiness: 20,
    costWeight: 2,
  },
];

// ─── Deep Query Intelligence Analyzer ────────────────────────────────────────
// Breaks down what the user is really asking — intent, domain, complexity,
// whether they need live data, temporal focus, and extracted entities.

type QueryIntent = 'assess' | 'compare' | 'plan' | 'investigate' | 'report' | 'advise' | 'calculate' | 'monitor' | 'conversational';
type QueryComplexity = 'trivial' | 'simple' | 'moderate' | 'complex' | 'deep';
type TemporalFocus = 'past' | 'present' | 'future' | 'mixed';

interface QueryAnalysis {
  intent: QueryIntent;
  domains: string[];
  needsLiveData: boolean;
  needsHistorical: boolean;
  needsDeepResearch: boolean;
  complexity: QueryComplexity;
  temporalFocus: TemporalFocus;
  mentionsCountry: boolean;
  mentionsOrg: boolean;
  mentionsFinance: boolean;
  mentionsRisk: boolean;
  mentionsRelocation: boolean;
  mentionsEthics: boolean;
  isDocumentRequest: boolean;
  isTrivial: boolean;
}

function analyzeQuery(
  query: string,
  params: Partial<ReportParameters>
): QueryAnalysis {
  const q = (query || '').toLowerCase().trim();

  // ── Trivial detection ──────────────────────────────────────────────────
  const isTrivial = q.length < 20 && /^(hi|hello|hey|thanks?|ok|yes|no|sure|good|great|cool|nice|bye|cheers)\b/i.test(q);

  // ── Intent detection ──────────────────────────────────────────────────
  let intent: QueryIntent = 'advise';
  if (isTrivial) intent = 'conversational';
  else if (/\breport\b|\bdraft\b|\bwrite\b|\bgenerat|\bdocument\b|\bletter\b|\bbrief\b|\bproposal\b|\bsubmission\b/i.test(q)) intent = 'report';
  else if (/\bcompare\b|\bversus\b|\bvs\.?\b|\bdifference|\bwhich.*(better|best)\b|\bbenchmark/i.test(q)) intent = 'compare';
  else if (/\bhow much\b|\bcalculat|\bnpv\b|\birr\b|\broi\b|\bcost\b|\bbudget\b|\bforecast/i.test(q)) intent = 'calculate';
  else if (/\bplan\b|\bstrateg|\broadmap\b|\btimeline\b|\bphase|\bstep.?by.?step|\bnext.?step|\bhow.?to\b/i.test(q)) intent = 'plan';
  else if (/\bmonitor|\btrack|\bwatch|\balert|\bsignal|\bupdate|\blatest|\bcurrent\b/i.test(q)) intent = 'monitor';
  else if (/\binvestigat|\bresearch|\bfind.?out|\bdig.?into|\bdeep.?dive|\bexplore|\banalyze|\banalyse/i.test(q)) intent = 'investigate';
  else if (/\bassess|\bevaluat|\breview|\baudit|\bcheck|\bdiagnos|\bexamin/i.test(q)) intent = 'assess';

  // ── Domain detection ──────────────────────────────────────────────────
  const domains: string[] = [];
  if (/financ|cost|budget|roi|npv|irr|revenue|profit|invest|fund|incent|capital|economic|monetary|grant|tax/i.test(q)) domains.push('financial');
  if (/risk|threat|danger|vulnerab|sanction|compliance|regulat|legal|audit|due.?diligence/i.test(q)) domains.push('risk');
  if (/reloc|offshor|outsourc|bpo|nearshore|city|cities|workforce|supply.?chain|headcount|labor|labour|talent|manufactur|site.?select/i.test(q)) domains.push('relocation');
  if (/strateg|feasib|engag|opportunit|recommend|advise|consult|decision|path|approach|option/i.test(q)) domains.push('strategic');
  if (/ethic|ifc|standard|sdg|sustain|govern|bias|esg|social.?impact|human.?right|labor.?right|environment/i.test(q)) domains.push('ethics');
  if (/partner|company|organi[sz]ation|entity|firm|stakeholder|who.?(are|is)|background/i.test(q)) domains.push('organization');
  if (/histor|precedent|past|previous|lesson|track.?record|case.?study|similar|example|evidence/i.test(q)) domains.push('historical');
  if (/country|nation|jurisdiction|market|region|economy|gdp|trade|export|import/i.test(q)) domains.push('country');
  if (/simulat|probability|monte.?carlo|uncertain|confidence|statistical|model|quantum/i.test(q)) domains.push('quantum');

  // ── Live data needs ────────────────────────────────────────────────────
  // If the user needs current/real-time information, we MUST fire engines with live data
  const needsLiveData =
    intent === 'monitor' ||
    /\bcurrent|\blatest|\btoday|\bnow|\brecent|\breal.?time|\blive|\bup.?to.?date|\b202[4-9]\b|\bthis year\b/i.test(q) ||
    /\bwhat.?is.?happening|\bmarket.?condition|\bnews|\bbreaking|\bsituation\b/i.test(q);

  // ── Historical needs ───────────────────────────────────────────────────
  const needsHistorical =
    /\bhistor|\bprecedent|\bpast|\blesson|\btrack.?record|\bcase.?study|\bsimilar|\bevidence|\bhas.?this.?worked|\bwhat.?happened/i.test(q) ||
    intent === 'assess' || intent === 'compare';

  // ── Deep research needs ────────────────────────────────────────────────
  const needsDeepResearch =
    intent === 'investigate' ||
    /\bresearch|\bdeep.?dive|\bcomprehensive|\bdetailed|\bfull.?analysis|\bthorough|\binvestigate|\bexplore|\bsearch.?for/i.test(q);

  // ── Complexity assessment ──────────────────────────────────────────────
  let complexity: QueryComplexity = 'moderate';
  if (isTrivial) complexity = 'trivial';
  else if (q.length < 40 && domains.length <= 1) complexity = 'simple';
  else if (q.length > 200 || domains.length >= 3 || needsDeepResearch) complexity = 'deep';
  else if (domains.length >= 2 || intent === 'compare' || intent === 'plan') complexity = 'complex';

  // ── Temporal focus ─────────────────────────────────────────────────────
  let temporalFocus: TemporalFocus = 'mixed';
  const hasPast = /\bhistor|\bpast|\bprevious|\bwas\b|\bwere\b|\bused to\b|\bbefore\b/i.test(q);
  const hasPresent = /\bcurrent|\bnow|\btoday|\bis\b|\bare\b|\bstatus\b|\bsituation\b/i.test(q);
  const hasFuture = /\bwill\b|\bfuture|\bforecast|\bpredict|\bproject|\bexpect|\bplan\b|\bnext\b|\bshould\b/i.test(q);
  if (hasPast && !hasPresent && !hasFuture) temporalFocus = 'past';
  else if (hasPresent && !hasPast && !hasFuture) temporalFocus = 'present';
  else if (hasFuture && !hasPast && !hasPresent) temporalFocus = 'future';

  // ── Entity presence ────────────────────────────────────────────────────
  const mentionsCountry = Boolean(params.country) || /\bcountry|\bnation|\bjurisdiction|\bmarket\b/i.test(q);
  const mentionsOrg = Boolean(params.organizationName || params.targetPartner) || /\bcompany|\bpartner|\borgani[sz]ation|\bentity|\bfirm/i.test(q);

  return {
    intent,
    domains,
    needsLiveData,
    needsHistorical,
    needsDeepResearch,
    complexity,
    temporalFocus,
    mentionsCountry,
    mentionsOrg,
    mentionsFinance: domains.includes('financial'),
    mentionsRisk: domains.includes('risk'),
    mentionsRelocation: domains.includes('relocation'),
    mentionsEthics: domains.includes('ethics'),
    isDocumentRequest: intent === 'report',
    isTrivial,
  };
}

// ─── Brain Thinking Process ──────────────────────────────────────────────────
// The brain introspects its capabilities, scores each engine group against the
// query analysis, and produces an execution plan with reasoning for each decision.

interface ThinkingResult {
  groups: Set<EngineGroup>;
  reasoning: string[];
  queryAnalysis: QueryAnalysis;
  engineScores: Map<EngineGroup, number>;
}

function thinkAndPlan(
  query: string,
  params: Partial<ReportParameters>,
  readiness: number
): ThinkingResult {
  const analysis = analyzeQuery(query, params);
  const reasoning: string[] = [];
  const engineScores = new Map<EngineGroup, number>();

  // For trivial queries, short-circuit
  if (analysis.isTrivial) {
    reasoning.push('Query is conversational/trivial — no engines needed');
    return { groups: new Set(), reasoning, queryAnalysis: analysis, engineScores };
  }

  reasoning.push(`Intent: ${analysis.intent} | Complexity: ${analysis.complexity} | Domains: [${analysis.domains.join(', ')}] | LiveData: ${analysis.needsLiveData} | Temporal: ${analysis.temporalFocus}`);

  // ── Score each engine group ──────────────────────────────────────────
  for (const capability of ENGINE_REGISTRY) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Domain match — does the query's domain overlap with this engine?
    const domainMatch = analysis.domains.some(d => d === capability.group) ||
      analysis.domains.some(d => {
        // Cross-domain relationships: strategic questions benefit from historical
        if (d === 'strategic' && capability.group === 'historical') return true;
        if (d === 'strategic' && capability.group === 'ethics') return true;
        if (d === 'risk' && capability.group === 'ethics') return true;
        if (d === 'relocation' && capability.group === 'country') return true;
        if (d === 'relocation' && capability.group === 'financial') return true;
        if (d === 'financial' && capability.group === 'country') return true;
        return false;
      });
    if (domainMatch) {
      score += 35;
      reasons.push('domain-match');
    }

    // 2. Question-keyword match — how many of the engine's answerable questions appear?
    const qLower = (query || '').toLowerCase();
    const keywordHits = capability.answersQuestions.filter(kw => qLower.includes(kw.toLowerCase()));
    const keywordScore = Math.min(30, keywordHits.length * 10);
    if (keywordScore > 0) {
      score += keywordScore;
      reasons.push(`keyword-hits(${keywordHits.length})`);
    }

    // 3. Live data bonus — if the query needs live data and this engine has it
    if (analysis.needsLiveData && capability.hasLiveData) {
      score += 20;
      reasons.push('live-data-needed');
    }

    // 4. Parameter availability — can this engine actually run?
    if (capability.requiresCountry && !params.country) {
      score -= 40; // Can't run without country
      reasons.push('missing-country-param');
    }
    if (capability.requiresOrg && !params.organizationName && !params.targetPartner) {
      score -= 30; // Can't run without org
      reasons.push('missing-org-param');
    }

    // 5. Readiness gate — is the case mature enough?
    if (readiness < capability.minReadiness) {
      score -= 20;
      reasons.push(`below-min-readiness(${capability.minReadiness})`);
    }

    // 6. Complexity alignment — expensive engines for complex queries
    if (analysis.complexity === 'deep' && capability.costWeight >= 6) {
      score += 15;
      reasons.push('complexity-match-deep');
    }
    if (analysis.complexity === 'simple' && capability.costWeight >= 7) {
      score -= 15;
      reasons.push('too-expensive-for-simple');
    }

    // 7. Intent-specific boosts
    if (analysis.intent === 'report' && (capability.group === 'strategic' || capability.group === 'historical' || capability.group === 'ethics')) {
      score += 15;
      reasons.push('report-needs-depth');
    }
    if (analysis.intent === 'calculate' && capability.group === 'financial') {
      score += 25;
      reasons.push('calculation-intent');
    }
    if (analysis.intent === 'monitor' && capability.hasLiveData) {
      score += 20;
      reasons.push('monitoring-needs-live');
    }
    if (analysis.intent === 'compare' && (capability.group === 'country' || capability.group === 'relocation')) {
      score += 15;
      reasons.push('comparison-boost');
    }
    if (analysis.intent === 'investigate' && capability.group === 'deep-research') {
      score += 25;
      reasons.push('investigation-intent');
    }

    // 8. Historical needs
    if (analysis.needsHistorical && capability.group === 'historical') {
      score += 20;
      reasons.push('historical-needed');
    }

    // 9. Foundation is almost always useful for substantive queries
    if (capability.group === 'foundation' && !analysis.isTrivial) {
      score += 20;
      reasons.push('foundation-baseline');
    }

    // 10. Progressive readiness escalation — more engines as case matures
    if (readiness >= 60 && (capability.group === 'strategic' || capability.group === 'historical' || capability.group === 'risk')) {
      score += 10;
      reasons.push('readiness-escalation-60');
    }
    if (readiness >= 75 && (capability.group === 'financial' || capability.group === 'ethics')) {
      score += 10;
      reasons.push('readiness-escalation-75');
    }
    if (readiness >= 85 && (capability.group === 'quantum' || capability.group === 'proactive' || capability.group === 'deep-research')) {
      score += 15;
      reasons.push('readiness-escalation-85');
    }

    // 11. Country availability boost — if we HAVE a country, country engines are cheap wins
    if (params.country && capability.group === 'country') {
      score += 15;
      reasons.push('country-available');
    }

    // 12. Org availability boost
    if ((params.organizationName || params.targetPartner) && capability.group === 'organization') {
      score += 15;
      reasons.push('org-available');
    }

    engineScores.set(capability.group, Math.max(0, score));
    if (reasons.length) {
      reasoning.push(`  ${capability.group}: score=${Math.max(0, score)} [${reasons.join(', ')}]`);
    }
  }

  // ── Build execution plan from scores ──────────────────────────────────
  // Threshold: >30 = fire the engine group
  const ACTIVATION_THRESHOLD = 30;
  const selectedGroups = new Set<EngineGroup>();

  const sortedScores = [...engineScores.entries()].sort((a, b) => b[1] - a[1]);
  for (const [group, score] of sortedScores) {
    if (score >= ACTIVATION_THRESHOLD) {
      selectedGroups.add(group);
    }
  }

  // ── Safety net: ensure we don't run zero engines for real queries ──────
  if (selectedGroups.size === 0 && !analysis.isTrivial) {
    selectedGroups.add('foundation');
    reasoning.push('Safety net: Added foundation as minimum for non-trivial query');
  }

  // ── ANTICIPATORY THINKING ────────────────────────────────────────────────
  // The brain doesn't just react — it predicts what the user will need NEXT
  // based on the current request. It pre-loads engines that the follow-up
  // questions will almost certainly require.
  const anticipations = anticipateNextMoves(analysis, params, readiness);
  for (const anticipated of anticipations.groups) {
    if (!selectedGroups.has(anticipated)) {
      selectedGroups.add(anticipated);
      reasoning.push(`Anticipated: Adding ${anticipated} — ${anticipations.reasons.find(r => r.includes(anticipated)) || 'predicted follow-up need'}`);
    }
  }

  // ── UNCONVENTIONAL ANGLE INJECTION ──────────────────────────────────────
  // Consider what would NOT normally be considered but could dramatically
  // improve the outcome. Cross-domain insights, contrarian perspectives,
  // and blind-spot detection.
  const unconventional = identifyUnconventionalAngles(analysis, selectedGroups, readiness);
  for (const angle of unconventional.groups) {
    if (!selectedGroups.has(angle)) {
      selectedGroups.add(angle);
      reasoning.push(`Unconventional: Adding ${angle} — ${unconventional.reasons.find(r => r.includes(angle)) || 'cross-domain insight opportunity'}`);
    }
  }

  reasoning.push(`Decision: Activating ${selectedGroups.size} groups → [${[...selectedGroups].join(', ')}]`);
  if (anticipations.groups.length) reasoning.push(`  ↳ ${anticipations.groups.length} anticipatory + ${unconventional.groups.length} unconventional additions`);

  return { groups: selectedGroups, reasoning, queryAnalysis: analysis, engineScores };
}

// ─── Anticipatory Intelligence ────────────────────────────────────────────────
// Predicts what the user will need NEXT based on the current query pattern.
// When someone asks "should we partner with X?", the brain knows they'll next
// ask about risk, compliance, financial viability, and historical precedent.
// Instead of waiting, it pre-loads those engines NOW.

interface AnticipationResult {
  groups: EngineGroup[];
  reasons: string[];
  predictedFollowUps: string[];
}

function anticipateNextMoves(
  analysis: QueryAnalysis,
  params: Partial<ReportParameters>,
  readiness: number
): AnticipationResult {
  const groups: EngineGroup[] = [];
  const reasons: string[] = [];
  const predictedFollowUps: string[] = [];

  // ── Pattern: Assessment → they'll want recommendations next ──
  if (analysis.intent === 'assess' || analysis.intent === 'investigate') {
    if (readiness >= 20) {
      groups.push('strategic');
      reasons.push('strategic — assessment queries always lead to "what should we do?"');
      predictedFollowUps.push('What do you recommend?', 'What are our options?');
    }
    if (readiness >= 25) {
      groups.push('risk');
      reasons.push('risk — after assessment, risk questions always follow');
      predictedFollowUps.push('What are the risks?', 'What could go wrong?');
    }
  }

  // ── Pattern: Compare → they'll want financial analysis + history ──
  if (analysis.intent === 'compare') {
    groups.push('financial');
    reasons.push('financial — comparisons always need cost/ROI numbers');
    groups.push('historical');
    reasons.push('historical — comparisons need precedent evidence');
    predictedFollowUps.push('Which is more cost-effective?', 'Has this worked before?');
  }

  // ── Pattern: Plan/Advise → they'll want execution details ──
  if (analysis.intent === 'plan' || analysis.intent === 'advise') {
    if (analysis.mentionsCountry && params.country) {
      groups.push('country');
      reasons.push('country — planning needs jurisdiction intelligence');
    }
    if (readiness >= 30) {
      groups.push('ethics');
      reasons.push('ethics — strategic plans need compliance/IFC gates');
      predictedFollowUps.push('Is this compliant?', 'What about IFC standards?');
    }
  }

  // ── Pattern: Report/Document request → they'll need everything ──
  if (analysis.isDocumentRequest) {
    // Reports need comprehensive backing — fire wide
    if (params.country) groups.push('country');
    groups.push('historical');
    groups.push('financial');
    groups.push('risk');
    reasons.push('country+historical+financial+risk — document generation needs comprehensive backing');
    predictedFollowUps.push('Can you expand Section 3?', 'Add more financial detail');
  }

  // ── Pattern: Mentions partner/entity → due diligence will follow ──
  if (analysis.mentionsOrg) {
    groups.push('risk');
    reasons.push('risk — entity queries always lead to due diligence');
    groups.push('ethics');
    reasons.push('ethics — partner assessment needs compliance screening');
    predictedFollowUps.push('Are they sanctioned?', 'What is their track record?');
  }

  // ── Pattern: Country mentioned → proactive intelligence is cheap ──
  if (analysis.mentionsCountry && params.country && readiness >= 25) {
    groups.push('proactive');
    reasons.push('proactive — country-specific signals and drift detection preloaded');
    predictedFollowUps.push('What are we missing?', 'Any early warning signs?');
  }

  // ── Pattern: Complex/Deep query → quantum simulation adds value ──
  if (analysis.complexity === 'deep' && readiness >= 40) {
    groups.push('quantum');
    reasons.push('quantum — deep queries benefit from Monte Carlo risk simulation');
  }

  // ── Pattern: Financial query → always need country context for rates/incentives ──
  if (analysis.mentionsFinance && params.country) {
    groups.push('country');
    reasons.push('country — financial analysis needs macro context');
  }

  return { groups: [...new Set(groups)], reasons, predictedFollowUps };
}

// ─── Unconventional Angle Detection ──────────────────────────────────────────
// Looks for cross-domain insights that wouldn't normally be considered.
// If someone asks about financial viability, the brain also considers
// workforce dynamics, supply chain resilience, and ESG factors that
// traditional analysis would miss.

function identifyUnconventionalAngles(
  analysis: QueryAnalysis,
  alreadySelected: Set<EngineGroup>,
  readiness: number
): { groups: EngineGroup[]; reasons: string[] } {
  const groups: EngineGroup[] = [];
  const reasons: string[] = [];

  // ── Financial queries → add relocation/workforce (cost arbitrage angle) ──
  if (analysis.mentionsFinance && !alreadySelected.has('relocation') && readiness >= 30) {
    groups.push('relocation');
    reasons.push('relocation — unconventional: workforce cost arbitrage and incentive discovery can change financial outlook');
  }

  // ── Risk queries → add historical (past failures = future warnings) ──
  if (analysis.mentionsRisk && !alreadySelected.has('historical')) {
    groups.push('historical');
    reasons.push('historical — unconventional: historical failures in similar contexts are the strongest risk predictor');
  }

  // ── Strategy queries → add ethics (ESG/compliance can block or unlock deals) ──
  if (analysis.domains.includes('strategic') && !alreadySelected.has('ethics') && readiness >= 25) {
    groups.push('ethics');
    reasons.push('ethics — unconventional: IFC/ESG compliance gaps can block otherwise sound strategies');
  }

  // ── Relocation queries → add quantum (Monte Carlo reveals hidden risk distributions) ──
  if (analysis.mentionsRelocation && !alreadySelected.has('quantum') && readiness >= 35) {
    groups.push('quantum');
    reasons.push('quantum — unconventional: Monte Carlo simulation reveals tail risks in relocation decisions');
  }

  // ── Country queries → add organization (local partner landscape shapes outcomes) ──
  if (analysis.mentionsCountry && !alreadySelected.has('organization') && readiness >= 20) {
    groups.push('organization');
    reasons.push('organization — unconventional: local partner/stakeholder landscape is often the decisive factor');
  }

  // ── Any substantive query → add proactive if nothing is watching for blind spots ──
  if (!analysis.isTrivial && !alreadySelected.has('proactive') && readiness >= 35 &&
      analysis.complexity !== 'simple' && analysis.complexity !== 'trivial') {
    groups.push('proactive');
    reasons.push('proactive — unconventional: blind spot detection and drift analysis catch what direct analysis misses');
  }

  // ── Deep research → add deep-research for external validation ──
  if (analysis.complexity === 'deep' && !alreadySelected.has('deep-research') && readiness >= 40) {
    groups.push('deep-research');
    reasons.push('deep-research — unconventional: external research validates internal analysis and catches information gaps');
  }

  return { groups, reasons };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export class BrainIntegrationService {
  /**
   * Intelligent engine orchestration — classifies the query first, then
   * activates only the engine groups that are relevant. Results are cached
   * for 3 minutes per unique (country × org × readiness-bucket) key.
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

    // ── INTELLIGENT BRAIN THINKING ────────────────────────────────────────────
    // The brain introspects its own capabilities, deeply analyses the query,
    // scores every engine group for relevance, and builds an execution plan.
    // It knows which engines have live data when real-time info is needed.
    const thinking = thinkAndPlan(strategicQuestion, params, readiness);
    const groups = thinking.groups;
    const g = (group: EngineGroup) => groups.has(group);

    console.log(`[Brain] THINKING → Intent: ${thinking.queryAnalysis.intent} | Complexity: ${thinking.queryAnalysis.complexity} | LiveData: ${thinking.queryAnalysis.needsLiveData}`);
    console.log(`[Brain] SCORES → ${[...thinking.engineScores.entries()].map(([g, s]) => `${g}:${s}`).join(' | ')}`);
    console.log(`[Brain] DECISION → ${groups.size} groups active: [${[...groups].join(', ')}] (readiness: ${readiness}%)`);
    // Show anticipatory and unconventional reasoning
    const anticipatedReasoning = thinking.reasoning.filter(r => r.startsWith('Anticipated:') || r.startsWith('Unconventional:'));
    if (anticipatedReasoning.length) {
      console.log(`[Brain] ANTICIPATION → ${anticipatedReasoning.length} predictive additions: ${anticipatedReasoning.map(r => r.split('—')[0].trim()).join(', ')}`);
    }

    // For trivial queries (greetings etc), return a minimal context immediately
    if (groups.size === 0) {
      const minimal: BrainContext = {
        promptBlock: '',
        indices: null, adversarial: null, agentConsensus: null,
        historicalPatterns: [], externalData: {},
        nsilAssessment: null, compositeScore: null, compliance: null,
        caseGraph: null, regionalKernel: null, decisionPacket: null,
        computedAt: new Date().toISOString(), readiness,
        recommendedDocumentIds: [], recommendedLetterIds: [],
        methodologyKB: null, ifcAssessment: null, patternAssessment: null,
        cognitiveAnalysis: null,
        maturityScores: null, problemGraph: null, dataFabric: null,
        motivationAnalysis: null, counterfactualAnalysis: null,
        domainAnalysis: null, historicalParallels: null, rankedPartners: null,
        derivedIndices: null, situationAnalysis: null, selfLearningInsights: null,
        unbiasedAnalysis: null, personaAnalysis: null, referenceEngagements: null,
        osintResults: null, gateStatus: null, reactiveOpportunities: null,
        reactiveRisks: null, researchEcosystem: null, failureModeGovernance: null,
        proactiveBriefing: null, causalSimulation: null, coreEthics: null,
        regionalCityDiscovery: null, bootsOnGround: null, relocationPathway: null,
        globalCityIndex: null, relocationOutcomes: null, supplyChainMap: null,
        workforceIntelligence: null, functionSplit: null, esgClimate: null,
        networkEffects: null, tier1Extraction: null, governmentIncentives: null,
        quantumMonteCarlo: null, quantumPatterns: null, quantumCognition: null,
        capabilityBoundary: null, financialAnalysis: null, riskMatrix: null,
        qualityGate: { score: 0, decision: 'skip', reasons: [], flags: [] } as any,
      };
      return minimal;
    }

    // ── Run SELECTED engines in parallel ──────────────────────────────────────
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
      personaResult,
      derivedIndicesResult,
      osintResult,
      reactiveOpportunitiesResult,
      reactiveRisksResult,
      globalIssueResult,
      selfImprovementResult,
      acledResult,
      sanctionsResult,
      comtradeResult,
      tavilyResult,
      proactiveResult,
      causalResult,
      coreComplianceResult,
      coreBiasResult,
    ] = await Promise.allSettled([
      // 15 indices [FOUNDATION]
      g('foundation') ? calculateAllIndices(params).catch(() => null) : Promise.resolve(null),
      // Adversarial (requires full ReportParameters shape) [STRATEGIC]
      g('strategic') ? AdversarialReasoningService.generate(params as ReportParameters).catch(() => null) : Promise.resolve(null),
      // Historical patterns [HISTORICAL]
      g('historical') ? HistoricalLearningEngine.findRelevantPatterns(params as ReportParameters).catch(() => [] as HistoricalPattern[]) : Promise.resolve([] as HistoricalPattern[]),
      // World Bank live [COUNTRY]
      g('country') && isoCode ? fetchWorldBankCountryIndicators(isoCode).catch(() => null) : Promise.resolve(null),
      // OpenCorporates company lookup [ORGANIZATION]
      g('organization') && orgName ? fetchOpenCorporatesCompany(orgName).catch(() => null) : Promise.resolve(null),
      // Numbeo cost-of-living [COUNTRY]
      g('country') && country ? fetchNumbeoCityData(country).catch(() => null) : Promise.resolve(null),
      // Multi-agent consensus [DEEP-RESEARCH]
      g('deep-research') && strategicQuestion.length > 20
        ? MultiAgentOrchestrator.runConsensus(strategicQuestion, { params, readiness }).catch(() => null)
        : Promise.resolve(null),
      // NSIL Intelligence Hub [FOUNDATION]
      g('foundation') ? Promise.resolve(NSILIntelligenceHub.quickAssess(params)).catch(() => null) : Promise.resolve(null),
      // Composite score (SPI/IVAS/SCF) [FOUNDATION]
      g('foundation') ? CompositeScoreService.getScores(params as ReportParameters).catch(() => null) : Promise.resolve(null),
      // Compliance framework - jurisdiction-specific alerts [COUNTRY]
      g('country') && country
        ? Promise.resolve(GlobalComplianceFramework.checkCompliance({
            country,
            sector: (params as any).sector || params.organizationType || undefined,
          })).catch(() => null)
        : Promise.resolve(null),
      // Case graph - structural relationship map [FOUNDATION]
      g('foundation') ? Promise.resolve(CaseGraphBuilder.build({
        organizationName: params.organizationName,
        country: params.country,
        organizationType: (params as any).sector || params.organizationType || '',
        currentMatter: (params as any).problemStatement || (params as any).currentMatter || '',
        objectives: ((params as any).strategicIntent || []).join(', ') || (params as any).objectives || '',
        constraints: (params as any).constraints || '',
      })).catch(() => null) : Promise.resolve(null),
      // Regional development kernel [COUNTRY]
      g('country') && country && readiness >= 50
        ? Promise.resolve(RegionalDevelopmentOrchestrator.run({
            regionProfile: country,
            sector: (params as any).sector || params.organizationType || 'general',
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
      // DecisionPipeline [STRATEGIC]
      g('strategic') && readiness >= 40 && params.country
        ? DecisionPipeline.run(params as ReportParameters).catch(() => null)
        : Promise.resolve(null),
      // Domain agent synthesis [STRATEGIC]
      g('strategic') && readiness >= 55 && strategicQuestion.length > 15
        ? DomainAgentOrchestrator.synthesizeAnalysis({
            organizationProfile: params as ReportParameters,
            query: strategicQuestion.substring(0, 400),
            dataScope: readiness >= 75 ? 'comprehensive' : 'recent',
            includeCustomData: false,
          }).catch(() => null)
        : Promise.resolve(null),
      // PersonaEngine [STRATEGIC]
      g('strategic') && readiness >= 30
        ? PersonaEngine.runFullAnalysis(params).catch(() => null)
        : Promise.resolve(null),
      // DerivedIndexService [RISK]
      g('risk') && params.country && readiness >= 35
        ? Promise.all([
            DerivedIndexService.calculatePRI(params as ReportParameters).catch(() => null),
            DerivedIndexService.calculateTCO(params as ReportParameters).catch(() => null),
            DerivedIndexService.calculateCRI(params as ReportParameters).catch(() => null),
          ]).catch(() => null)
        : Promise.resolve(null),
      // OSINT search [ORGANIZATION]
      g('organization') && (country || orgName) && readiness >= 25
        ? osintSearch(`${country} ${orgName} strategic investment opportunities`.trim(), ['government', 'news', 'business'], 6).catch(() => null)
        : Promise.resolve(null),
      // ReactiveIntelligenceEngine - opportunity detection [RISK]
      g('risk') && country && readiness >= 40
        ? ReactiveIntelligenceEngine.detectOpportunities(params as ReportParameters).catch(() => null)
        : Promise.resolve(null),
      // ReactiveIntelligenceEngine - live risk monitoring [RISK]
      g('risk') && country && readiness >= 40
        ? ReactiveIntelligenceEngine.monitorRisks(params as ReportParameters).catch(() => null)
        : Promise.resolve(null),
      // GlobalIssueResolver - universal problem-solver treating any query as a solvable issue
      strategicQuestion.length > 20
        ? new GlobalIssueResolver().resolveIssue(strategicQuestion.substring(0, 300)).catch(() => null)
        : Promise.resolve(null),
      // SelfImprovementEngine [PROACTIVE]
      g('proactive') && readiness >= 50
        ? selfImprovementEngine.analyzeAndImprove().catch(() => null)
        : Promise.resolve(null),
      // ACLED - real-time conflict & political violence data [COUNTRY]
      g('country') && country && readiness >= 30
        ? getACLEDSummary(country).catch(() => null)
        : Promise.resolve(null),
      // OpenSanctions [ORGANIZATION]
      g('organization') && orgName
        ? screenEntitySanctions(orgName).catch(() => null)
        : Promise.resolve(null),
      // UN Comtrade [COUNTRY]
      g('country') && country && readiness >= 30
        ? fetchComtradeData(country).catch(() => null)
        : Promise.resolve(null),
      // Tavily deep research [DEEP-RESEARCH]
      g('deep-research') && strategicQuestion.length > 20 && readiness >= 40
        ? tavilyResearchQuestion(strategicQuestion, country).catch(() => null)
        : Promise.resolve(null),
      // ProactiveOrchestrator (Layer 7) [PROACTIVE]
      g('proactive') && readiness >= 30 && country
        ? proactiveOrchestrator.runProactiveCycle({
            country,
            sector: (params as any).sector || params.organizationType || 'general',
            strategy: strategicQuestion || (params as any).objectives || 'strategic engagement',
            investmentSizeM: (params as any).investmentSizeM || 10,
            keyFactors: [
              country,
              (params as any).sector || params.organizationType || '',
              orgName,
              ...(Array.isArray((params as any).strategicIntent) ? (params as any).strategicIntent : []),
            ].filter(Boolean),
          } as CurrentContext).catch(() => null)
        : Promise.resolve(null),
      // Core causal reasoning simulation [STRATEGIC]
      g('strategic') && ((params as any).currentMatter || strategicQuestion)
        ? causalSimulateScenario({
            problem: (params as any).currentMatter || strategicQuestion,
            context: { country, sector: (params as any).sector || '', readiness },
            baseRate: readiness / 100,
            interventionEffect: 0.15,
          }).catch(() => null)
        : Promise.resolve(null),
      // Core ethics/governance compliance check [ETHICS]
      g('ethics') && country
        ? Promise.resolve((() => { try { return coreCheckCompliance(`Investment in ${(params as any).sector || 'general'} sector in ${country}`, params); } catch { return null; } })())
        : Promise.resolve(null),
      // Core ethics/governance bias detection [ETHICS]
      g('ethics') ? Promise.resolve((() => { try { return coreDetectBias?.(params) ?? null; } catch { return null; } })()) : Promise.resolve(null),
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

    // Persona engine
    const personaRaw = personaResult.status === 'fulfilled' ? personaResult.value as any : null;
    const personaAnalysis = personaRaw ? {
      skepticFindings: personaRaw.skeptic?.findings ?? personaRaw.skeptic?.concerns ?? [],
      advocateFindings: personaRaw.advocate?.findings ?? personaRaw.advocate?.opportunities ?? [],
      regulatorFindings: personaRaw.regulator?.findings ?? personaRaw.regulator?.requirements ?? [],
      accountantFindings: personaRaw.accountant?.findings ?? personaRaw.accountant?.costItems ?? [],
    } : null;

    // Derived indices (PRI / TCO / CRI)
    const derivedTriple = derivedIndicesResult.status === 'fulfilled' ? derivedIndicesResult.value as any : null;
    const derivedIndices = derivedTriple ? {
      pri: Array.isArray(derivedTriple) ? derivedTriple[0] : derivedTriple?.pri ?? null,
      tco: Array.isArray(derivedTriple) ? derivedTriple[1] : derivedTriple?.tco ?? null,
      cri: Array.isArray(derivedTriple) ? derivedTriple[2] : derivedTriple?.cri ?? null,
    } : null;

    // OSINT results
    const osintRaw = osintResult.status === 'fulfilled' ? osintResult.value as any[] | null : null;
    const osintResults = Array.isArray(osintRaw)
      ? osintRaw.slice(0, 5).map(r => ({ title: r.title || '', url: r.url || '', snippet: r.snippet || r.body || '' }))
      : null;

    // ReactiveIntelligenceEngine - opportunity + risk signals
    const reactiveOpportunitiesRaw = reactiveOpportunitiesResult.status === 'fulfilled' ? reactiveOpportunitiesResult.value as any[] | null : null;
    const reactiveOpportunities = Array.isArray(reactiveOpportunitiesRaw)
      ? reactiveOpportunitiesRaw.slice(0, 5).map(o => ({ id: o.id || '', type: o.type || 'opportunity', description: o.description || o.signal || '', signal: o.signal || '' }))
      : null;

    const reactiveRisksRaw = reactiveRisksResult.status === 'fulfilled' ? reactiveRisksResult.value as any[] | null : null;
    const reactiveRisks = Array.isArray(reactiveRisksRaw)
      ? reactiveRisksRaw.slice(0, 5).map(r => ({ id: r.id || '', type: r.type || 'risk', description: r.description || r.signal || '', signal: r.signal || '' }))
      : null;

    // GlobalIssueResolver - structured issue analysis
    const globalIssueAnalysis = globalIssueResult.status === 'fulfilled' ? globalIssueResult.value as any | null : null;

    // SelfImprovementEngine - weight tuning actions (fire-and-forget, no prompt injection needed)
    void (selfImprovementResult); // consumed for side-effects only

    // ACLED - conflict events
    const acledSummary = acledResult.status === 'fulfilled' ? acledResult.value as import('./acledService').ACLEDSummary | null : null;

    // OpenSanctions - partner screening
    const sanctionsScreen = sanctionsResult.status === 'fulfilled' ? sanctionsResult.value as import('./openSanctionsService').SanctionsScreenResult | null : null;

    // UN Comtrade - trade data
    const comtradeData = comtradeResult.status === 'fulfilled' ? comtradeResult.value as import('./unComtradeService').ComtradeData | null : null;

    // Tavily - synthesized research answer
    const tavilyResearch = tavilyResult.status === 'fulfilled' ? tavilyResult.value as import('./tavilySearchService').TavilySearchResponse | null : null;

    // ProactiveOrchestrator (Layer 7) - briefing
    const proactiveBriefing = proactiveResult.status === 'fulfilled' ? proactiveResult.value as ProactiveBriefing | null : null;

    // Core causal reasoning simulation
    const causalSimulation = (() => {
      if (causalResult.status !== 'fulfilled' || !causalResult.value) return null;
      const v = causalResult.value as any;
      return { explanation: v.explanation || '', outcome: v.posteriorRate ?? v.adjustedRate ?? undefined };
    })();

    // Core ethics/governance
    const coreEthics = (() => {
      const comp = coreComplianceResult.status === 'fulfilled' ? coreComplianceResult.value as any : null;
      const bias = coreBiasResult.status === 'fulfilled' ? coreBiasResult.value as any : null;
      if (!comp && !bias) return null;
      return {
        isCompliant: comp?.isCompliant ?? true,
        overallRisk: comp?.overallRisk || 'low',
        topIssues: (comp?.complianceResults || comp?.results || [])
          .filter((r: any) => !r.passed)
          .slice(0, 3)
          .map((r: any) => r.message || r.description || ''),
        biases: Array.isArray(bias) ? bias.slice(0, 3).map((b: any) => `${b.biasType}: ${b.description || b.mitigationSuggestion || ''}`) : [],
      };
    })();

    // ConsultantGate - sync evaluation of case completeness
    const gateStatus = (() => {
      try {
        const result = ConsultantGateService.evaluate(params as ReportParameters);
        return { isReady: result.isReady, missing: result.missing, summary: result.summary as Record<string, string> };
      } catch { return null; }
    })();

    // GlobalIntelligenceEngine [HISTORICAL]
    const referenceEngagements = g('historical') ? (() => {
      try {
        const model = buildAdvisorInputFromParams(params as ReportParameters);
        const engagements = findRelevantEngagements(model, 3);
        return engagements.map(e => ({
          id: e.id,
          scenario: e.scenario,
          summary: e.summary,
          playbook: e.playbook ?? [],
          outcomes: e.outcomes ?? [],
        }));
      } catch { return null; }
    })() : null;

    // Unpack new engines (indices 13-20 in the settled array)
    const _settledAll = [
      indicesResult, adversarialResult, historicalResult, worldBankData,
      openCorpData, numbeoData, consensusResult, nsilResult, compositeResult,
      complianceResult, caseGraphResult, regionalResult, decisionResult,
    ];
    // The 7 new engines were added after decisionResult in the allSettled array.
    // We need to destructure from the original Promise.allSettled call.
    // They are NOT in settledAll above - they're in the raw call below.
    // We re-run them synchronously (cached) via direct assignment:
    const methodologyKB = g('foundation') ? (() => { try { return MethodologyKnowledgeBase.lookupAll({ country, industry: (params as any).sector ? [(params as any).sector] : undefined, problemStatement: strategicQuestion || (params as any).currentMatter || '' }); } catch { return null; } })() : null;
    const patternAssessment = g('historical') ? (() => { try { return PatternConfidenceEngine.assess(params as ReportParameters); } catch { return null; } })() : null;
    const maturityScores = g('foundation') ? (() => { try { return readiness >= 25 ? { scores: calculateMaturityScores(params), insights: generateAIInsights(params) } : null; } catch { return null; } })() : null;
    const problemGraph = g('foundation') ? (() => { try { return ((params as any).currentMatter || strategicQuestion) ? ProblemToSolutionGraphService.buildGraph({ currentMatter: (params as any).currentMatter || strategicQuestion, objectives: (params as any).objectives || strategicQuestion, constraints: (params as any).constraints || '', evidenceNotes: (params as any).uploadedDocuments || [] }) : null; } catch { return null; } })() : null;
    const dataFabric = g('country') ? (() => { try { return country ? GlobalDataFabricService.buildSnapshot(country, (params as any).jurisdiction || country, [(params as any).organizationType || '', (params as any).sector || ''].filter(Boolean)) : null; } catch { return null; } })() : null;

    // ── Situation Analysis Engine [FOUNDATION] ─
    const situationAnalysis = g('foundation') ? (() => {
      try {
        const summary = SituationAnalysisEngine.quickSummary(params);
        return {
          unconsideredNeeds: summary.topUnconsideredNeed ? [summary.topUnconsideredNeed] : [],
          blindSpots: summary.topBlindSpot ? [summary.topBlindSpot] : [],
          recommendedQuestions: summary.topQuestion ? [summary.topQuestion] : [],
          contrarianView: '',
        };
      } catch { return null; }
    })() : null;

    // ── Self-Learning Engine [PROACTIVE] ──────────────
    const selfLearningInsights = g('proactive') ? (() => {
      try {
        const recs = (selfLearningEngine as any).getRecommendations?.();
        return Array.isArray(recs) ? recs.slice(0, 5) : null;
      } catch { return null; }
    })() : null;

    // ── Unbiased Analysis Engine [STRATEGIC] ─────────────
    const unbiasedAnalysis = g('strategic') ? (() => {
      try {
        const eng = new UnbiasedAnalysisEngine();
        const full = (eng as any).generateFullAnalysis?.(params) ?? (eng as any).analyze?.(params);
        if (full) {
          return {
            proPoints: full.proPoints ?? full.pros ?? [],
            conPoints: full.conPoints ?? full.cons ?? [],
            alternatives: full.alternatives ?? full.alternativeOptions ?? [],
          };
        }
        return null;
      } catch { return null; }
    })() : null;

    // ── Regional City Discovery Engine [RELOCATION] ───
    const regionalCityDiscovery: DiscoveryResult | null = g('relocation') ? (() => {
      try {
        return RegionalCityDiscoveryEngine.discover({
          targetSectors: [(params as any).sector || params.organizationType || ''].filter(Boolean),
          targetRegions: country ? undefined : undefined, // discover across all regions
          country: undefined, // don't limit to single country - show alternatives
          preferOverlooked: true,
        }, 10);
      } catch { return null; }
    })() : null;

    // ── OutcomeTracker - track enrichment run for learning ────────────────────
    (() => {
      try {
        const tracker = new OutcomeTracker();
        if (typeof (tracker as any).recordEnrichment === 'function') {
          (tracker as any).recordEnrichment({ country, readiness, computedAt: new Date().toISOString() });
        }
      } catch { /* non-critical */ }
    })();

    // ── Boots on Ground Intelligence [RELOCATION] ─
    const bootsOnGround = g('relocation') ? (() => {
      try {
        if (!country) return null;
        const report = BotsOnGroundNetwork.getByCountry(country);
        return report.length ? report : BotsOnGroundNetwork.getAllReports().slice(0, 3);
      } catch { return null; }
    })() : null;

    // ── Relocation Pathway Engine [RELOCATION] ────────────────
    const relocationPathway = g('relocation') ? (() => {
      try {
        if (readiness < 30 || !country) return null;
        const headcount = (params as any).employeeCount || 50;
        return RelocationPathwayEngine.generate({
          originCountry: 'AU',
          targetCountry: country === 'Australia' ? 'PH' : country.substring(0, 2).toUpperCase(),
          companySize: headcount > 200 ? 'enterprise' : headcount > 20 ? 'sme' : 'startup',
          industry: (params as any).sector || params.organizationType || 'general',
          functionsToRelocate: [(params as any).sector || 'operations'],
          headcountTarget: headcount,
          urgency: 'standard',
        });
      } catch { return null; }
    })() : null;

    // ── Global City Index - multi-dimensional city rankings ──────────────────
    const globalCityIndex = g('relocation') ? (() => {
      try {
        const sector = ((params as any).sector || params.organizationType || 'general').toLowerCase();
        const sectorKey = sector.includes('bpo') || sector.includes('it') ? 'it-bpo'
          : sector.includes('manufact') ? 'manufacturing'
          : sector.includes('fintech') || sector.includes('finance') ? 'fintech'
          : undefined;
        return sectorKey
          ? GlobalCityIndex.getRankingsBySector(sectorKey as any)
          : GlobalCityIndex.getRankings();
      } catch { return null; }
    })() : null;

    // ── Relocation Outcome Tracker [RELOCATION] ───────
    const relocationOutcomes = g('relocation') ? (() => {
      try {
        const relevant = RelocationOutcomeTracker.findRelevant(
          country,
          (params as any).sector || params.organizationType || ''
        );
        return relevant.length ? relevant : RelocationOutcomeTracker.getSummary();
      } catch { return null; }
    })() : null;

    // ── Supply Chain Ecosystem Mapper ─────────────────────────────────────────
    const supplyChainMap = g('relocation') ? (() => {
      try {
        if (!country) return null;
        // Try to get map for known cities in that country
        const cityNames = ['Cebu', 'Davao', 'Townsville', 'Singapore'];
        for (const city of cityNames) {
          const m = SupplyChainEcosystemMapper.getMap(city);
          if (m && m.city.toLowerCase().includes(country.toLowerCase().substring(0, 3))) return m;
        }
        // Fallback: return first available
        return SupplyChainEcosystemMapper.getMap(cityNames[0]);
      } catch { return null; }
    })() : null;

    // ── Workforce Intelligence Engine ─────────────────────────────────────────
    const workforceIntelligence = g('relocation') ? (() => {
      try {
        if (!country) return null;
        const profile = WorkforceIntelligenceEngine.getProfile(country);
        return profile || WorkforceIntelligenceEngine.compare(
          ['Cebu', 'Davao', 'Townsville']
        );
      } catch { return null; }
    })() : null;

    // ── Function-Level Splitter ───────────────────────────────────────────────
    const functionSplit = g('relocation') ? (() => {
      try {
        if (readiness < 35) return null;
        return FunctionLevelSplitter.quickAnalyze(
          (params as any).sector || params.organizationType || 'general'
        );
      } catch { return null; }
    })() : null;

    // ── ESG & Climate Resilience Scorer ───────────────────────────────────────
    const esgClimate = g('country') ? (() => {
      try {
        if (!country) return null;
        const profile = ESGClimateScorer.getProfile(country);
        return profile || ESGClimateScorer.getRankings();
      } catch { return null; }
    })() : null;

    // ── Network Effect Engine ─────────────────────────────────────────────────
    const networkEffects = g('relocation') ? (() => {
      try {
        if (!country) return null;
        const profile = NetworkEffectEngine.getProfile(country);
        return profile || NetworkEffectEngine.getRankings();
      } catch { return null; }
    })() : null;

    // ── Tier-1 Extraction Engine ──────────────────────────────────────────────
    const tier1Extraction = g('relocation') ? (() => {
      try {
        return Tier1ExtractionEngine.scanCity(
          country,
          [(params as any).sector || params.organizationType || 'general']
        );
      } catch { return null; }
    })() : null;

    // ── Government Incentive Vault ────────────────────────────────────────────
    const governmentIncentives = g('financial') ? (() => {
      try {
        if (!country) return null;
        return GovernmentIncentiveVault.searchByCountry(country);
      } catch { return null; }
    })() : null;

    // ── Quantum Monte Carlo Risk Simulation ───────────────────────────────────
    const quantumMonteCarlo = g('quantum') ? (() => {
      try {
        if (readiness < 25) return null;
        return QuantumMonteCarlo.quickSimulate(
          country || 'Cebu',
          (params as any).employeeCount || 50,
          (params as any).avgSalaryUSD || 30000
        );
      } catch { return null; }
    })() : null;

    // ── Quantum Pattern Matcher ───────────────────────────────────────────────
    const quantumPatterns = g('quantum') ? (() => {
      try {
        if (readiness < 20) return null;
        return QuantumPatternMatcher.findPatterns(
          (params as any).sector || params.organizationType || 'general',
          (params as any).employeeCount || 50,
          [country || 'Unknown']
        );
      } catch { return null; }
    })() : null;

    // ── Quantum Cognition Bridge ──────────────────────────────────────────────
    const quantumCognition = g('quantum') ? (() => {
      try {
        if (readiness < 25) return null;
        return QuantumCognitionBridge.quickModel([
          { name: 'Proceed with engagement', rationalScore: 0.7 },
          { name: 'Defer 6 months', rationalScore: 0.5 },
          { name: 'Explore alternative markets', rationalScore: 0.6 },
        ]);
      } catch { return null; }
    })() : null;

    // ── Historical Parallel Matcher - 60 years of global case evidence ────────
    const historicalParallels: ParallelMatchResult | null = g('historical') ? (() => {
      try {
        if (readiness >= 15 && (country || strategicQuestion || (params as any).currentMatter)) {
          return HistoricalParallelMatcher.match({
            ...params as Partial<ReportParameters>,
            country: country || '',
          });
        }
        return null;
      } catch { return null; }
    })() : null;

    // ── Partner Intelligence Engine - ranked institutional/corporate matches ──
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
    const rankedPartners: RankedPartner[] | null = g('organization') ? (() => {
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
    })() : null;
    // IFC assessment [ETHICS]
    const ifcAssessment = g('ethics') ? (() => { try { return (country && ((params as any).sector || (params as any).organizationType)) ? IFCGlobalStandardsEngine.assessProject({ country, sector: (params as any).sector || (params as any).organizationType || 'investment', projectType: (params as any).organizationType || 'investment', investmentSizeM: 10, hasESMS: readiness >= 60, hasLaborPolicies: true, prohibitsChildLabor: true, prohibitsForcedLabor: true, hasOHSProgram: readiness >= 50 }) : null; } catch { return null; } })() : null;

    // Motivation Detector [STRATEGIC]
    const motivationAnalysis = g('strategic') ? (() => { try { return MotivationDetector.analyze(params as ReportParameters); } catch { return null; } })() : null;

    // Counterfactual Engine [RISK]
    const counterfactualAnalysis = g('risk') ? (() => { try { return CounterfactualEngine.analyze(params); } catch { return null; } })() : null;

    // narrativeSynthesisEngine - bound for future prompt reference (singleton)
    const _narrativeSynth = narrativeSynthesisEngine;
    void _narrativeSynth;

    // Stored partners [ORGANIZATION]
    const storedPartners = g('organization') ? (() => { try { return ((PartnerComparisonEngine as any).getPartners?.() ?? []).slice(0, 3); } catch { return []; } })() : [];

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

    const researchEcosystem = ResearchEcosystemScoringService.assess({
      country,
      readiness,
      gdp: externalData.gdp,
      gdpGrowth: externalData.gdpGrowth,
      costOfLiving: externalData.costOfLiving,
      rankedPartnerCount: rankedPartners?.length || 0,
      compliancePresent: Boolean(compliance),
      gateReady: Boolean(gateStatus?.isReady),
      researchSpendPctGDP: (params as any).researchSpendPctGDP,
      phdGraduatesPer100k: (params as any).phdGraduatesPer100k,
      scientistCompRatioToMinWage: (params as any).scientistCompRatioToMinWage,
      computeCapacityIndex: (params as any).computeCapacityIndex,
      talentMobilityIndex: (params as any).talentMobilityIndex,
      startupCapitalIndex: (params as any).startupCapitalIndex,
      scaleCapitalIndex: (params as any).scaleCapitalIndex,
      patentToStartupConversion: (params as any).patentToStartupConversion,
      industryAbsorptionIndex: (params as any).industryAbsorptionIndex,
      policyExecutionIndex: (params as any).policyExecutionIndex,
      marketAccessIndex: (params as any).marketAccessIndex,
    });

    const freeformParams: any = params;

    const failureModeGovernance = FailureModeGovernanceService.assess({
      gateReady: gateStatus?.isReady,
      gateMissingCount: gateStatus?.missing?.length,
      hasExternalData: Object.values(externalData).some(v => v !== undefined && v !== null),
      hasHistorical: Boolean(historicalPatterns.length || historicalParallels?.matches?.length),
      contradictionIndex: adversarial?.contradictionIndex,
      escalationCount: adversarial?.escalations?.length,
      hasReactiveRisks: Boolean((reactiveRisks?.length || 0) > 0),
      hasReactiveOpportunities: Boolean((reactiveOpportunities?.length || 0) > 0),
      hasCompliance: Boolean(compliance),
      hasPartners: Boolean((rankedPartners?.length || 0) > 0),
      motivationRedFlags: motivationAnalysis?.redFlags?.length,
      objectiveText: freeformParams.strategicObjective || freeformParams.projectObjective || '',
      currentMatterText: freeformParams.currentMatter || '',
      constraintsText: freeformParams.constraints || '',
      ecosystemScore: researchEcosystem?.ecosystemReadinessScore,
      ecosystemConfidence: researchEcosystem?.confidence,
    });

    // ── Financial Calculation Engine ──────────────────────────────────────────
    const financialAnalysis = (() => {
      try {
        const fp: any = params;
        const investNum = parseFloat(fp.totalInvestment || fp.capitalAllocation || '0') || 10_000_000;
        const revNum = parseFloat(fp.annualRevenue || fp.revenueYear1 || fp.revenue || '0') || investNum * 0.4;
        const growthRate = 0.15;
        const opMargin = 0.25;
        const discRate = 0.10;
        return FinancialCalculationService.computeSnapshot({
          capitalInvestment: investNum,
          baseRevenue: revNum,
          growthRate,
          operatingMargin: opMargin,
          discountRate: discRate,
        });
      } catch { return null; }
    })();

    // ── Risk Matrix Engine ────────────────────────────────────────────────────
    const riskMatrix = (() => {
      try {
        const fp: any = params;
        const investNum = parseFloat(fp.totalInvestment || fp.capitalAllocation || '0') || 10_000_000;
        const polStability = (compositeScore as any)?.components?.politicalStability ?? 50;
        return RiskMatrixEngine.computeRiskMatrix({
          investmentUSD: investNum,
          country: country || undefined,
          sector: fp.sector || fp.industry || undefined,
          politicalStabilityScore: polStability,
        });
      } catch { return null; }
    })();

    // ── System Capability Boundary - always-on trust layer ──────────────────
    const capabilityBoundary = (() => {
      try { return SystemCapabilityBoundary.getSnapshot(); } catch { return null; }
    })();

    // ── Build the combined prompt block ───────────────────────────────────────
    const promptParts: string[] = [
      `\n\n${'═'.repeat(70)}`,
      `## ADVERSIQ AI BRAIN CONTEXT - Readiness ${readiness}% - ${new Date().toISOString()}`,
      `This block is injected from the background intelligence layer. Use it to inform your response - do not summarise it verbatim, but let it shape the precision and depth of your recommendations.`,
    ];

    // ── Brain Thinking Log (so the AI sees how the brain reasoned) ────────────
    promptParts.push(`\n### ── BRAIN THINKING PROCESS ──`);
    promptParts.push(`**Query Intent:** ${thinking.queryAnalysis.intent} | **Complexity:** ${thinking.queryAnalysis.complexity} | **Temporal Focus:** ${thinking.queryAnalysis.temporalFocus}`);
    promptParts.push(`**Domains Detected:** [${thinking.queryAnalysis.domains.join(', ')}]`);
    promptParts.push(`**Live Data Needed:** ${thinking.queryAnalysis.needsLiveData ? 'YES — prioritizing real-time engines' : 'No'} | **Historical Needed:** ${thinking.queryAnalysis.needsHistorical ? 'Yes' : 'No'} | **Deep Research:** ${thinking.queryAnalysis.needsDeepResearch ? 'Yes' : 'No'}`);
    const topEngines = [...thinking.engineScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([g, s]) => `${g}(${s})`)
      .join(', ');
    promptParts.push(`**Engine Relevance Scores (top 6):** ${topEngines}`);
    promptParts.push(`**Engines Activated:** ${groups.size} groups → [${[...groups].join(', ')}]`);
    // Show anticipatory thinking in the prompt so the AI leverages it
    const anticipatedItems = thinking.reasoning.filter(r => r.startsWith('Anticipated:'));
    const unconventionalItems = thinking.reasoning.filter(r => r.startsWith('Unconventional:'));
    if (anticipatedItems.length) {
      promptParts.push(`**Anticipatory Pre-loading (${anticipatedItems.length}):** The brain predicted follow-up needs and pre-loaded additional engines.`);
      anticipatedItems.forEach(r => promptParts.push(`  → ${r.replace('Anticipated: Adding ', '').trim()}`));
    }
    if (unconventionalItems.length) {
      promptParts.push(`**Unconventional Angles (${unconventionalItems.length}):** Cross-domain insights that standard analysis would miss.`);
      unconventionalItems.forEach(r => promptParts.push(`  → ${r.replace('Unconventional: Adding ', '').trim()}`));
    }

    if (thinking.queryAnalysis.needsLiveData) {
      const liveEngines = ENGINE_REGISTRY.filter(e => e.hasLiveData && groups.has(e.group));
      if (liveEngines.length) {
        promptParts.push(`**Live Data Sources Active:** ${liveEngines.flatMap(e => e.dataSources).join(', ')}`);
      }
    }

    // ── System Capability Boundaries (always first - shapes all responses) ────
    try {
      const boundaryPrompt = SystemCapabilityBoundary.summarizeForPrompt();
      if (boundaryPrompt) promptParts.push(boundaryPrompt);
    } catch { /* non-critical */ }

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
          promptParts.push(`- **${iv.title}** (score: ${iv.score}) - ${iv.rationale}`);
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
        promptParts.push(`- **${p.name}** (${p.country || '?'}) - ${p.sector || p.type || ''}${p.trustScore ? ` | Trust: ${p.trustScore}` : ''}`);
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
          promptParts.push(`- [${(s.type || 'signal').toUpperCase()}] ${s.headline || s.title || s.summary || ''}${s.impact ? ` - Impact: ${s.impact}` : ''}`);
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
        promptParts.push(`**Closest Precedent:** ${top.title} (${top.country}, ${top.year}) - ${top.outcome} - "${top.description.substring(0, 150)}"`);
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
      promptParts.push(`\n### ── PARTNER INTELLIGENCE ENGINE - Top ${Math.min(4, rankedPartners.length)} Ranked Partners for ${country} ──`);
      rankedPartners.slice(0, 4).forEach((rp, i) => {
        const reasons = rp.reasons.slice(0, 2).join(', ') || 'general strategic alignment';
        promptParts.push(`${i + 1}. **${rp.partner.name}** (${rp.partner.type}) - Score: ${rp.score.total}/100 | Fit: ${rp.score.partnerFit} | Policy Alignment: ${rp.score.policyAlignment} | Delivery: ${rp.score.deliveryReliability} - ${reasons}`);
      });
      promptParts.push(`When advising on partners, introductions, letters of intent, or engagement strategies - reference these ranked matches with their scores and alignment rationale.`);
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
      (params as any).sector || params.organizationType || '',
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

    // ── Situation Analysis ────────────────────────────────────────────────────
    if (situationAnalysis) {
      promptParts.push(`\n### ── SITUATION ANALYSIS ──`);
      if (situationAnalysis.contrarianView) promptParts.push(`**Contrarian View:** ${situationAnalysis.contrarianView}`);
      if (situationAnalysis.blindSpots.length) promptParts.push(`**Blind Spots:** ${situationAnalysis.blindSpots.slice(0, 3).join('; ')}`);
      if (situationAnalysis.unconsideredNeeds.length) promptParts.push(`**Unconsidered Needs:** ${situationAnalysis.unconsideredNeeds.slice(0, 3).join('; ')}`);
      if (situationAnalysis.recommendedQuestions.length) promptParts.push(`**Recommended Questions:** ${situationAnalysis.recommendedQuestions.slice(0, 2).join(' / ')}`);
    }

    // ── Self-Learning Insights ────────────────────────────────────────────────
    if (selfLearningInsights && selfLearningInsights.length) {
      promptParts.push(`\n### ── SELF-LEARNING INSIGHTS ──`);
      selfLearningInsights.forEach(insight => promptParts.push(`- ${insight}`));
    }

    // ── Unbiased Analysis ─────────────────────────────────────────────────────
    if (unbiasedAnalysis) {
      promptParts.push(`\n### ── UNBIASED PRO/CON ANALYSIS ──`);
      if (unbiasedAnalysis.proPoints.length) promptParts.push(`**Pros:** ${unbiasedAnalysis.proPoints.slice(0, 3).join('; ')}`);
      if (unbiasedAnalysis.conPoints.length) promptParts.push(`**Cons:** ${unbiasedAnalysis.conPoints.slice(0, 3).join('; ')}`);
      if (unbiasedAnalysis.alternatives.length) promptParts.push(`**Alternatives:** ${unbiasedAnalysis.alternatives.slice(0, 2).join('; ')}`);
    }

    // ── 4-Persona Panel (Skeptic / Advocate / Regulator / Accountant) ─────────
    if (personaAnalysis) {
      promptParts.push(`\n### ── 4-PERSONA INTELLIGENCE PANEL ──`);
      if (personaAnalysis.skepticFindings.length) promptParts.push(`**Skeptic:** ${personaAnalysis.skepticFindings.slice(0, 2).join('; ')}`);
      if (personaAnalysis.advocateFindings.length) promptParts.push(`**Advocate:** ${personaAnalysis.advocateFindings.slice(0, 2).join('; ')}`);
      if (personaAnalysis.regulatorFindings.length) promptParts.push(`**Regulator:** ${personaAnalysis.regulatorFindings.slice(0, 2).join('; ')}`);
      if (personaAnalysis.accountantFindings.length) promptParts.push(`**Accountant:** ${personaAnalysis.accountantFindings.slice(0, 2).join('; ')}`);
    }

    // ── Reference Engagements (200-year global case library) ──────────────────
    if (referenceEngagements && referenceEngagements.length) {
      promptParts.push(`\n### ── REFERENCE ENGAGEMENTS (CASE LIBRARY) ──`);
      referenceEngagements.slice(0, 2).forEach(e => {
        promptParts.push(`**${e.scenario}** - ${e.summary}`);
        if (e.playbook.length) promptParts.push(`  Playbook: ${e.playbook.slice(0, 2).join(' / ')}`);
        if (e.outcomes.length) promptParts.push(`  Outcomes: ${e.outcomes.slice(0, 2).join(' / ')}`);
      });
    }

    // ── OSINT Live Intelligence ────────────────────────────────────────────────
    if (osintResults && osintResults.length) {
      promptParts.push(`\n### ── OSINT LIVE INTELLIGENCE ──`);
      osintResults.slice(0, 3).forEach(r => {
        promptParts.push(`**${r.title}** - ${r.snippet.substring(0, 150)}`);
      });
    }

    // ── Derived Indices (PRI / TCO / CRI) ─────────────────────────────────────
    if (derivedIndices && (derivedIndices.pri || derivedIndices.tco || derivedIndices.cri)) {
      promptParts.push(`\n### ── DERIVED INDICES (PRI / TCO / CRI) ──`);
      if (derivedIndices.pri) promptParts.push(`**PRI (Political Risk):** ${derivedIndices.pri.score ?? derivedIndices.pri.value ?? JSON.stringify(derivedIndices.pri).substring(0, 80)}`);
      if (derivedIndices.tco) promptParts.push(`**TCO (Total Cost of Ownership):** ${derivedIndices.tco.score ?? derivedIndices.tco.value ?? JSON.stringify(derivedIndices.tco).substring(0, 80)}`);
      if (derivedIndices.cri) promptParts.push(`**CRI (Country Risk):** ${derivedIndices.cri.score ?? derivedIndices.cri.value ?? JSON.stringify(derivedIndices.cri).substring(0, 80)}`);
    }

    // ── Reactive Intelligence Signals ─────────────────────────────────────────
    if ((reactiveOpportunities && reactiveOpportunities.length) || (reactiveRisks && reactiveRisks.length)) {
      promptParts.push(`\n### ── REACTIVE INTELLIGENCE ENGINE ──`);
      if (reactiveOpportunities?.length) {
        promptParts.push(`**Live Opportunities:**`);
        reactiveOpportunities.slice(0, 3).forEach(o => promptParts.push(`- [${o.type}] ${o.description || o.signal}`));
      }
      if (reactiveRisks?.length) {
        promptParts.push(`**Live Risks:**`);
        reactiveRisks.slice(0, 3).forEach(r => promptParts.push(`- [${r.type}] ${r.description || r.signal}`));
      }
    }

    // ── Global Issue Resolver ─────────────────────────────────────────────────
    if (globalIssueAnalysis) {
      promptParts.push(`\n### ── GLOBAL ISSUE RESOLVER ──`);
      if (globalIssueAnalysis.problemStatement) promptParts.push(`**Issue:** ${String(globalIssueAnalysis.problemStatement).substring(0, 200)}`);
      if (globalIssueAnalysis.rootCauses?.length) promptParts.push(`**Root Causes:** ${(globalIssueAnalysis.rootCauses as string[]).slice(0, 3).join('; ')}`);
      if (globalIssueAnalysis.recommendedActions?.length) promptParts.push(`**Actions:** ${(globalIssueAnalysis.recommendedActions as string[]).slice(0, 3).join('; ')}`);
    }

    // ── ACLED Conflict Intelligence ───────────────────────────────────────────
    if (acledSummary) {
      promptParts.push(`\n### ── ACLED CONFLICT INTELLIGENCE ──`);
      promptParts.push(`**Country Risk Level:** ${acledSummary.riskLevel} | **Recent Events:** ${acledSummary.totalEvents} | **Fatalities:** ${acledSummary.totalFatalities}`);
      const typeSummary = Object.entries(acledSummary.eventTypeCounts).map(([t, n]) => `${t}(${n})`).join(', ');
      if (typeSummary) promptParts.push(`**Event Types:** ${typeSummary}`);
      acledSummary.recentEvents.slice(0, 3).forEach(ev =>
        promptParts.push(`- [${ev.date}] ${ev.type}: ${ev.actor} in ${ev.location}. ${ev.notes.substring(0, 120)}`)
      );
    }

    // ── Sanctions & PEP Screening ─────────────────────────────────────────────
    if (sanctionsScreen && sanctionsScreen.totalHits > 0) {
      promptParts.push(`\n### ── SANCTIONS & PEP SCREENING ──`);
      promptParts.push(`**Entity Screened:** ${sanctionsScreen.query} | **Status:** ${sanctionsScreen.clearanceLevel} | **Hits:** ${sanctionsScreen.totalHits}`);
      if (sanctionsScreen.flaggedLists.length) promptParts.push(`**Flagged Lists:** ${sanctionsScreen.flaggedLists.join(', ')}`);
      sanctionsScreen.hits.slice(0, 2).forEach(h => {
        const tags = [h.isSanctioned ? '🚫 SANCTIONED' : '', h.isPEP ? '⚠️ PEP' : ''].filter(Boolean).join(' ');
        promptParts.push(`- ${h.name} [${h.schema}] ${tags}${h.position ? ` - ${h.position}` : ''}`);
      });
    } else if (sanctionsScreen) {
      promptParts.push(`\n### ── SANCTIONS & PEP SCREENING ──`);
      promptParts.push(`**Entity:** ${sanctionsScreen.query} | **Status:** ✅ Clear - No matches on monitored sanctions lists.`);
    }

    // ── UN Comtrade Trade Data ────────────────────────────────────────────────
    if (comtradeData) {
      promptParts.push(`\n### ── UN COMTRADE TRADE INTELLIGENCE ──`);
      promptParts.push(`**${comtradeData.country} (${comtradeData.year}):** ${comtradeData.tradeToGDPNote}`);
      if (comtradeData.topPartners.length) promptParts.push(`**Key Trade Partners:** ${comtradeData.topPartners.join(', ')}`);
    }

    // ── Tavily Deep Research ──────────────────────────────────────────────────
    if (tavilyResearch) {
      promptParts.push(`\n### ── TAVILY DEEP RESEARCH ──`);
      if (tavilyResearch.answer) promptParts.push(`**Synthesized Answer:** ${tavilyResearch.answer.substring(0, 400)}`);
      tavilyResearch.results.slice(0, 3).forEach(r =>
        promptParts.push(`- [${r.score.toFixed(2)}] ${r.title}: ${r.content.substring(0, 150)}`)
      );
    }

    // ── Consultant Gate Status ────────────────────────────────────────────────
    if (gateStatus) {
      promptParts.push(`\n### ── CONSULTANT GATE ──`);
      promptParts.push(`**Readiness:** ${gateStatus.isReady ? '✅ READY' : '⚠️ INCOMPLETE'}`);
      if (!gateStatus.isReady && gateStatus.missing.length) {
        promptParts.push(`**Missing inputs:** ${gateStatus.missing.join('; ')}`);
      }
      promptParts.push(`**Who:** ${gateStatus.summary.who}  |  **Where:** ${gateStatus.summary.where}  |  **Deadline:** ${gateStatus.summary.deadline}`);
    }

    if (researchEcosystem) {
      promptParts.push('');
      promptParts.push(ResearchEcosystemScoringService.formatForPrompt(researchEcosystem));
    }

    if (failureModeGovernance) {
      promptParts.push('');
      promptParts.push(FailureModeGovernanceService.formatForPrompt(failureModeGovernance));
    }

    // ── Proactive Layer 7 Briefing ────────────────────────────────────────────
    if (proactiveBriefing) {
      promptParts.push(`\n### ── PROACTIVE INTELLIGENCE (Layer 7) ──`);
      promptParts.push(`**Backtest Accuracy:** ${(proactiveBriefing.backtestAccuracy * 100).toFixed(1)}% | **Confidence:** ${(proactiveBriefing.confidence * 100).toFixed(1)}%`);
      if (proactiveBriefing.calibrationSummary) promptParts.push(`**Calibration:** ${proactiveBriefing.calibrationSummary}`);
      if (proactiveBriefing.driftSummary) promptParts.push(`**Drift Detection:** ${proactiveBriefing.driftSummary}`);
      if (proactiveBriefing.cognitiveSummary) promptParts.push(`**Meta-Cognition:** ${proactiveBriefing.cognitiveSummary}`);
      if (proactiveBriefing.proactiveSignals.length) {
        promptParts.push(`**Proactive Signals (${proactiveBriefing.proactiveSignals.length}):**`);
        proactiveBriefing.proactiveSignals.slice(0, 5).forEach(s =>
          promptParts.push(`- [${s.type}/${s.urgency}] ${s.title}: ${s.description?.substring(0, 150) || ''}`)
        );
      }
      if (proactiveBriefing.actionPriorities.length) {
        promptParts.push(`**Priority Actions:** ${proactiveBriefing.actionPriorities.slice(0, 4).join(' | ')}`);
      }
    }

    // ── Core Causal Reasoning ────────────────────────────────────────────────
    if (causalSimulation) {
      promptParts.push(`\n### ── CAUSAL REASONING SIMULATION ──`);
      if (causalSimulation.outcome !== undefined) promptParts.push(`**Projected Outcome Rate:** ${(causalSimulation.outcome * 100).toFixed(1)}%`);
      if (causalSimulation.explanation) promptParts.push(`**Causal Chain:** ${String(causalSimulation.explanation).substring(0, 300)}`);
    }

    // ── Core Ethics & Governance ──────────────────────────────────────────────
    if (coreEthics) {
      promptParts.push(`\n### ── CORE ETHICS & GOVERNANCE ──`);
      promptParts.push(`**Compliant:** ${coreEthics.isCompliant ? '✅ Yes' : '🚫 No'} | **Risk Level:** ${coreEthics.overallRisk}`);
      if (coreEthics.topIssues.length) {
        promptParts.push(`**Compliance Issues:**`);
        coreEthics.topIssues.forEach(i => promptParts.push(`- ⚠ ${i}`));
      }
      if (coreEthics.biases.length) {
        promptParts.push(`**Detected Biases:**`);
        coreEthics.biases.forEach(b => promptParts.push(`- ${b}`));
      }
    }

    // ── Regional City Discovery ──────────────────────────────────────────────
    if (regionalCityDiscovery && regionalCityDiscovery.topMatches.length > 0) {
      const cityPrompt = RegionalCityDiscoveryEngine.discoverForPrompt({
        targetSectors: [(params as any).sector || params.organizationType || ''].filter(Boolean),
        preferOverlooked: true,
      });
      if (cityPrompt) promptParts.push(cityPrompt);
    }

    // ── Boots on Ground Intelligence ──────────────────────────────────────────
    if (bootsOnGround && (Array.isArray(bootsOnGround) ? bootsOnGround.length : true)) {
      try {
        const summary = BotsOnGroundNetwork.summarizeForPrompt(country);
        if (summary) promptParts.push(`\n### ── BOOTS ON GROUND INTELLIGENCE ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Relocation Pathway Engine ─────────────────────────────────────────────
    if (relocationPathway) {
      try {
        const summary = RelocationPathwayEngine.summarizeForPrompt({
          originCountry: 'AU',
          targetCountry: country === 'Australia' ? 'PH' : (country || 'PH').substring(0, 2).toUpperCase(),
          companySize: ((params as any).employeeCount || 50) > 200 ? 'enterprise' as const : ((params as any).employeeCount || 50) > 20 ? 'sme' as const : 'startup' as const,
          industry: (params as any).sector || params.organizationType || 'general',
          functionsToRelocate: [(params as any).sector || 'operations'],
          headcountTarget: (params as any).employeeCount || 50,
          urgency: 'standard' as const,
        });
        if (summary) promptParts.push(`\n### ── RELOCATION PATHWAY (90-Day Plan) ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Global City Index ─────────────────────────────────────────────────────
    if (globalCityIndex) {
      try {
        const summary = GlobalCityIndex.summarizeForPrompt(
          (params as any).sector || params.organizationType
        );
        if (summary) promptParts.push(`\n### ── GLOBAL CITY INDEX ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Relocation Outcome Tracker ────────────────────────────────────────────
    if (relocationOutcomes) {
      try {
        const summary = RelocationOutcomeTracker.summarizeForPrompt(country);
        if (summary) promptParts.push(`\n### ── RELOCATION OUTCOMES (Historical) ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Supply Chain Ecosystem ────────────────────────────────────────────────
    if (supplyChainMap) {
      try {
        const summary = SupplyChainEcosystemMapper.summarizeForPrompt(country || 'Cebu');
        if (summary) promptParts.push(`\n### ── SUPPLY CHAIN ECOSYSTEM ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Workforce Intelligence ────────────────────────────────────────────────
    if (workforceIntelligence) {
      try {
        const summary = WorkforceIntelligenceEngine.summarizeForPrompt(country || 'Cebu');
        if (summary) promptParts.push(`\n### ── WORKFORCE INTELLIGENCE ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Function-Level Splitter ───────────────────────────────────────────────
    if (functionSplit) {
      try {
        const summary = FunctionLevelSplitter.summarizeForPrompt(orgName || 'Client', country || 'Cebu City');
        if (summary) promptParts.push(`\n### ── FUNCTION-LEVEL SPLIT ANALYSIS ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── ESG & Climate Resilience ──────────────────────────────────────────────
    if (esgClimate) {
      try {
        const summary = ESGClimateScorer.summarizeForPrompt(country || 'Cebu');
        if (summary) promptParts.push(`\n### ── ESG & CLIMATE RESILIENCE ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Network Effect Engine ─────────────────────────────────────────────────
    if (networkEffects) {
      try {
        const summary = NetworkEffectEngine.summarizeForPrompt(country || 'Cebu');
        if (summary) promptParts.push(`\n### ── NETWORK EFFECTS & CLUSTER DENSITY ──\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Tier-1 Extraction ─────────────────────────────────────────────────────
    if (tier1Extraction && (tier1Extraction as any).opportunities?.length) {
      promptParts.push(`\n### ── TIER-1 EXTRACTION OPPORTUNITIES ──`);
      ((tier1Extraction as any).opportunities as any[]).slice(0, 4).forEach((op: any) => {
        promptParts.push(`- **${op.title || op.name}** (${op.source || 'extracted'}) - ${op.description || ''}`);
      });
    }

    // ── Government Incentive Vault ────────────────────────────────────────────
    if (governmentIncentives && (Array.isArray(governmentIncentives) ? governmentIncentives.length : (governmentIncentives as any).incentives?.length)) {
      promptParts.push(`\n### ── GOVERNMENT INCENTIVE VAULT ──`);
      const items = Array.isArray(governmentIncentives) ? governmentIncentives : (governmentIncentives as any).incentives || [];
      (items as any[]).slice(0, 4).forEach((inc: any) => {
        promptParts.push(`- **${inc.name || inc.title}** (${inc.country || ''}) - ${inc.description || inc.benefit || ''}`);
      });
    }

    // ── Quantum Monte Carlo Risk Simulation ───────────────────────────────────
    if (quantumMonteCarlo) {
      try {
        const resolved = await quantumMonteCarlo;
        if (resolved) {
          const summary = QuantumMonteCarlo.summarizeForPrompt(resolved);
          if (summary) promptParts.push(`\n### ── QUANTUM MONTE CARLO RISK SIM ──\n${summary}`);
        }
      } catch { /* non-critical */ }
    }

    // ── Quantum Pattern Matcher ───────────────────────────────────────────────
    if (quantumPatterns) {
      try {
        const resolved = await quantumPatterns;
        if (resolved) {
          const summary = QuantumPatternMatcher.summarizeForPrompt(resolved);
          if (summary) promptParts.push(`\n### ── QUANTUM PATTERN INTELLIGENCE ──\n${summary}`);
        }
      } catch { /* non-critical */ }
    }

    // ── Quantum Cognition Bridge ──────────────────────────────────────────────
    if (quantumCognition) {
      try {
        const resolved = await quantumCognition;
        if (resolved) {
          const summary = QuantumCognitionBridge.summarizeForPrompt(resolved);
          if (summary) promptParts.push(`\n### ── QUANTUM COGNITION (Decision Bias Model) ──\n${summary}`);
        }
      } catch { /* non-critical */ }
    }

    // ── Financial Calculation Engine ──────────────────────────────────────────
    if (financialAnalysis) {
      try {
        const summary = FinancialCalculationService.formatForPrompt(financialAnalysis);
        if (summary) promptParts.push(`\n${summary}`);
      } catch { /* non-critical */ }
    }

    // ── Risk Matrix Engine ────────────────────────────────────────────────────
    if (riskMatrix) {
      try {
        const summary = RiskMatrixEngine.formatForPrompt(riskMatrix);
        if (summary) promptParts.push(`\n${summary}`);
      } catch { /* non-critical */ }
    }

    const provisionalResult = {
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
      derivedIndices: derivedIndices ?? null,
      situationAnalysis,
      selfLearningInsights,
      unbiasedAnalysis,
      personaAnalysis,
      referenceEngagements,
      osintResults,
      gateStatus,
      reactiveOpportunities,
      reactiveRisks,
      researchEcosystem,
      failureModeGovernance,
      proactiveBriefing,
      causalSimulation,
      coreEthics,
      regionalCityDiscovery,
      bootsOnGround,
      relocationPathway,
      globalCityIndex,
      relocationOutcomes,
      supplyChainMap,
      workforceIntelligence,
      functionSplit,
      esgClimate,
      networkEffects,
      tier1Extraction,
      governmentIncentives,
      quantumMonteCarlo,
      quantumPatterns,
      quantumCognition,
      capabilityBoundary,
      financialAnalysis,
      riskMatrix,
      cognitiveAnalysis: null,
    };

    // ── Cognitive Reasoning Engine — 12 human brain thinking layers ─────────
    const cognitiveAnalysis = (() => {
      try {
        return runCognitiveAnalysis(strategicQuestion, params, readiness);
      } catch { return null; }
    })();
    if (cognitiveAnalysis) {
      (provisionalResult as any).cognitiveAnalysis = cognitiveAnalysis;
      promptParts.push(formatCognitiveForPrompt(cognitiveAnalysis));
    }

    const qualityGate = IntelligenceQualityGate.assess(provisionalResult);
    promptParts.push('');
    promptParts.push(IntelligenceQualityGate.formatForPrompt(qualityGate));
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
      derivedIndices: derivedIndices ?? null,
      situationAnalysis,
      selfLearningInsights,
      unbiasedAnalysis,
      personaAnalysis,
      referenceEngagements,
      osintResults,
      gateStatus,
      reactiveOpportunities,
      reactiveRisks,
      researchEcosystem,
      failureModeGovernance,
      proactiveBriefing,
      causalSimulation,
      coreEthics,
      regionalCityDiscovery,
      bootsOnGround,
      relocationPathway,
      globalCityIndex,
      relocationOutcomes,
      supplyChainMap,
      workforceIntelligence,
      functionSplit,
      esgClimate,
      networkEffects,
      tier1Extraction,
      governmentIncentives,
      quantumMonteCarlo,
      quantumPatterns,
      quantumCognition,
      capabilityBoundary,
      financialAnalysis,
      riskMatrix,
      cognitiveAnalysis,
      qualityGate,
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
    if (ctx.researchEcosystem) {
      lines.push(
        `Research Ecosystem: ERS ${ctx.researchEcosystem.ecosystemReadinessScore}/100 ` +
        `(TAI ${ctx.researchEcosystem.talentAttractivenessIndex} | ICI ${ctx.researchEcosystem.innovationConversionIndex})`
      );
    }
    if (ctx.adversarial) {
      lines.push(`Personas: ${ctx.adversarial.agreementLevel}% agreement | ${ctx.adversarial.topRisks.length} risk signals`);
    }
    if (ctx.historicalPatterns.length) {
      lines.push(`History: ${ctx.historicalPatterns.length} matching patterns`);
    }
    if (ctx.qualityGate) {
      lines.push(`Quality Gate: ${ctx.qualityGate.score}/100 (${ctx.qualityGate.decision})`);
    }
    if (ctx.failureModeGovernance) {
      lines.push(
        `Failure Governance: ${ctx.failureModeGovernance.overallRisk}/100 risk ` +
        `| anti-influence ${ctx.failureModeGovernance.antiInfluenceScore}/100 (${ctx.failureModeGovernance.decision})`
      );
    }
    if (ctx.proactiveBriefing) {
      lines.push(`Proactive L7: ${(ctx.proactiveBriefing.confidence * 100).toFixed(0)}% conf | ${ctx.proactiveBriefing.proactiveSignals.length} signals | backtest ${(ctx.proactiveBriefing.backtestAccuracy * 100).toFixed(0)}%`);
    }
    if (ctx.coreEthics) {
      lines.push(`Ethics: ${ctx.coreEthics.isCompliant ? 'Compliant' : 'NON-COMPLIANT'} (${ctx.coreEthics.overallRisk})`);
    }
    return lines.join(' · ');
  }
}

export default BrainIntegrationService;
