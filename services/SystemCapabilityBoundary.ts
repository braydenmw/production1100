/**
 * ===========================================================================
 * SYSTEM CAPABILITY BOUNDARY SERVICE
 * ===========================================================================
 *
 * Formally defines what ADVERSIQ AI DOES and DOES NOT do. This service is
 * injected into every brain context so the AI consultant always operates
 * within accurate capability boundaries - never overclaiming, never
 * underclaiming.
 *
 * This is a critical trust layer: when a client asks "can your system do X?"
 * the consultant can answer precisely because these boundaries are in its
 * context for every single response.
 * ===========================================================================
 */

// -- Types -------------------------------------------------------------------

export interface CapabilityCategory {
  id: string;
  label: string;
  capabilities: Capability[];
}

export interface Capability {
  id: string;
  description: string;
  engineIds: string[];          // which engines power this
  dataSource: 'live-api' | 'curated-static' | 'computed' | 'ai-generated';
  confidence: 'high' | 'medium' | 'variable';
  limitations?: string[];
}

export interface SystemBoundary {
  id: string;
  claim: string;
  explanation: string;
  evidence: string;              // which codebase artifact proves this
}

export interface CapabilitySnapshot {
  totalEngines: number;
  totalCapabilities: number;
  categories: CapabilityCategory[];
  boundaries: SystemBoundary[];
  dataSources: DataSourceDeclaration[];
  generatedAt: string;
}

export interface DataSourceDeclaration {
  name: string;
  type: 'public-open-data' | 'curated-reference' | 'real-time-search' | 'internal-model';
  description: string;
  isLiveGovernmentDB: boolean;
}

// -- Capability Registry -----------------------------------------------------

const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  {
    id: 'decision-support',
    label: 'Decision Support & Analysis',
    capabilities: [
      { id: 'multi-index-scoring', description: 'Calculate 15+ strategic indices (BARNA, CRI, NVI, SPI, IVAS, SCF, PRI, TCO) for any country', engineIds: ['ComprehensiveIndicesEngine', 'DerivedIndexService', 'CompositeScoreService'], dataSource: 'computed', confidence: 'high' },
      { id: 'adversarial-stress-test', description: '5-persona adversarial debate that challenges every recommendation from Skeptic, Advocate, Regulator, Accountant, and Devil\'s Advocate perspectives', engineIds: ['AdversarialReasoningService', 'PersonaEngine'], dataSource: 'ai-generated', confidence: 'high' },
      { id: 'decision-pipeline', description: 'Structured decision packets with ranked options, risk gates, confidence scores, and action items', engineIds: ['DecisionPipeline'], dataSource: 'computed', confidence: 'high' },
      { id: 'counterfactual-scenarios', description: 'What-if scenario modelling to explore alternative paths', engineIds: ['CounterfactualEngine', 'QuantumMonteCarlo'], dataSource: 'computed', confidence: 'medium' },
      { id: 'cognitive-bias-detection', description: 'Model 10 cognitive biases (anchoring, sunk cost, overconfidence, etc.) and show how they shift decision utility', engineIds: ['QuantumCognitionBridge'], dataSource: 'computed', confidence: 'medium' },
      { id: 'causal-reasoning', description: 'Bayesian causal simulation with posterior probability estimation', engineIds: ['causal-reasoning-simulation'], dataSource: 'computed', confidence: 'variable' },
    ],
  },
  {
    id: 'location-intelligence',
    label: 'Location & City Intelligence',
    capabilities: [
      { id: 'city-ranking', description: 'Rank 16+ cities across 7 dimensions (economic, talent, infrastructure, governance, lifestyle, innovation, cost)', engineIds: ['GlobalCityIndex'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'boots-on-ground', description: 'Local ground-truth intelligence for candidate cities - hiring reality, infrastructure truth, failure lessons from verified local contacts', engineIds: ['BotsOnGroundNetwork'], dataSource: 'curated-static', confidence: 'high', limitations: ['Currently covers 5 cities (Pagadian, Davao, Cebu, Townsville, Darwin)', 'Data is curated, not live-streamed'] },
      { id: 'esg-climate', description: 'ESG and climate resilience profiles for 8+ cities across Environmental, Social, Governance, and Climate dimensions', engineIds: ['ESGClimateScorer'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'network-effects', description: 'Industry cluster density, co-location benefits, and company presence maps', engineIds: ['NetworkEffectEngine'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'regional-city-discovery', description: 'Proactive discovery of overlooked cities that match sector and preference criteria', engineIds: ['RegionalCityDiscoveryEngine'], dataSource: 'curated-static', confidence: 'medium' },
    ],
  },
  {
    id: 'relocation-ops',
    label: 'Relocation & Operations Planning',
    capabilities: [
      { id: 'relocation-pathway', description: '90-day phased action plans with milestones, risk gates, cost estimates, and regulatory requirements', engineIds: ['RelocationPathwayEngine'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'function-split', description: 'Analyze which business functions to keep, relocate, or split based on multi-criteria scoring', engineIds: ['FunctionLevelSplitter'], dataSource: 'computed', confidence: 'medium' },
      { id: 'workforce-intelligence', description: 'Salary benchmarks, talent pipeline depth, university output, and attrition data by city', engineIds: ['WorkforceIntelligenceEngine'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'supply-chain-mapping', description: 'Supplier networks, logistics routes, and partner ecosystem maps per city', engineIds: ['SupplyChainEcosystemMapper'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'outcome-tracking', description: 'Historical relocation outcomes with cost variance, retention, NPS, and lessons learned', engineIds: ['RelocationOutcomeTracker'], dataSource: 'curated-static', confidence: 'high' },
    ],
  },
  {
    id: 'compliance-risk',
    label: 'Compliance, Risk & Ethics',
    capabilities: [
      { id: 'compliance-framework', description: 'Jurisdiction-specific compliance alerts for country + sector combinations', engineIds: ['GlobalComplianceFramework'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'ifc-standards', description: 'IFC Global Standards gap analysis with SDG alignment mapping', engineIds: ['IFCGlobalStandardsEngine'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'sanctions-screening', description: 'Entity screening against OpenSanctions (sanctions lists, PEP databases)', engineIds: ['openSanctionsService'], dataSource: 'live-api', confidence: 'high', limitations: ['Depends on OpenSanctions API availability', 'Not a substitute for formal legal due diligence'] },
      { id: 'conflict-monitoring', description: 'Real-time conflict and political violence data from ACLED', engineIds: ['acledService'], dataSource: 'live-api', confidence: 'high', limitations: ['Depends on ACLED API availability'] },
      { id: 'ethics-governance', description: 'Compliance checks and bias detection for ethical governance', engineIds: ['core/ethics-governance'], dataSource: 'computed', confidence: 'medium' },
    ],
  },
  {
    id: 'external-data',
    label: 'External Data & Research',
    capabilities: [
      { id: 'world-bank', description: 'GDP, GDP growth, and macroeconomic indicators from World Bank API', engineIds: ['externalDataIntegrations'], dataSource: 'live-api', confidence: 'high' },
      { id: 'trade-data', description: 'Bilateral trade statistics from UN Comtrade', engineIds: ['unComtradeService'], dataSource: 'live-api', confidence: 'high' },
      { id: 'cost-of-living', description: 'Cost of living and crime indices from Numbeo', engineIds: ['externalDataIntegrations'], dataSource: 'live-api', confidence: 'medium' },
      { id: 'company-records', description: 'Company registration data from OpenCorporates', engineIds: ['externalDataIntegrations'], dataSource: 'live-api', confidence: 'medium' },
      { id: 'web-research', description: 'Deep web research synthesis via Tavily search', engineIds: ['tavilySearchService'], dataSource: 'live-api', confidence: 'variable' },
      { id: 'osint', description: 'Open-source intelligence search across government, news, and business sources', engineIds: ['osintSearchService'], dataSource: 'live-api', confidence: 'variable' },
    ],
  },
  {
    id: 'incentives-partners',
    label: 'Incentives & Partner Intelligence',
    capabilities: [
      { id: 'incentive-vault', description: 'Stackable government incentive packages across 10+ countries - tax holidays, grants, SEZ benefits, training subsidies', engineIds: ['GovernmentIncentiveVault'], dataSource: 'curated-static', confidence: 'high', limitations: ['Data is manually curated and verified, not pulled live from government portals', 'Last-verified dates shown per record'] },
      { id: 'partner-ranking', description: 'Ranked institutional, government, and corporate partner matches based on country, sector, and strategic fit', engineIds: ['PartnerIntelligenceEngine'], dataSource: 'curated-static', confidence: 'high' },
      { id: 'tier1-extraction', description: 'Tier-1 opportunity extraction from structured datasets', engineIds: ['Tier1ExtractionEngine'], dataSource: 'computed', confidence: 'medium' },
    ],
  },
  {
    id: 'quantum-analytics',
    label: 'Advanced Probabilistic Analytics',
    capabilities: [
      { id: 'monte-carlo-sim', description: '5,000-iteration Monte Carlo risk simulation with deterministic PRNG for reproducibility', engineIds: ['QuantumMonteCarlo'], dataSource: 'computed', confidence: 'high', limitations: ['Classical simulation (quantum-ready architecture, classical execution)', 'Results are probabilistic, not predictive'] },
      { id: 'pattern-matching', description: '8 built-in historical pattern templates for recognizing repeating success/failure signatures', engineIds: ['QuantumPatternMatcher'], dataSource: 'curated-static', confidence: 'medium' },
    ],
  },
];

// -- System Boundaries (What It Does NOT Do) ---------------------------------

const SYSTEM_BOUNDARIES: SystemBoundary[] = [
  {
    id: 'not-decision-maker',
    claim: 'It does not make decisions.',
    explanation: 'This is a decision-support tool, not a decision-maker. The system produces ranked options, confidence scores, risk assessments, and structured recommendations - but the human makes the final call. The DecisionPipeline outputs a packet with recommendations and blockers; the consultant presents options, never dictates.',
    evidence: 'DecisionPipeline.ts produces DecisionPacket with recommendation + blockers + nextSteps. BrainIntegrationService prompt says: "Use it to inform your response."',
  },
  {
    id: 'not-expert-replacement',
    claim: 'It does not replace expert judgment.',
    explanation: 'The system structures, challenges, and stress-tests expert thinking through adversarial debate (5 personas), cognitive bias modelling (10 biases), pro/con analysis, and multi-agent consensus. It makes expert judgment more rigorous - it does not substitute for it.',
    evidence: 'AdversarialReasoningService (5-persona debate), PersonaEngine (Skeptic/Advocate/Regulator/Accountant), QuantumCognitionBridge (10 cognitive biases), UnbiasedAnalysisEngine (pro/con/alternatives).',
  },
  {
    id: 'not-live-government-db',
    claim: 'It does not connect to live government databases without explicit integration work.',
    explanation: 'The system uses public open-data APIs (World Bank, UN Comtrade, ACLED, OpenSanctions, Numbeo, OpenCorporates) and real-time web research (Tavily, OSINT). Government incentive data is maintained in a curated reference library with last-verified dates per record. Direct connections to proprietary or restricted government procurement, ministry, or regulatory databases would require explicit integration development.',
    evidence: 'GovernmentIncentiveVault uses static INCENTIVE_DB array with lastVerified dates. externalDataIntegrations connects to public APIs only. backendArchitecture.ts lists "Integrate government records scraping" as future work.',
  },
  {
    id: 'not-outcome-guarantee',
    claim: 'It does not guarantee outcomes.',
    explanation: 'The system improves the quality of analysis going in. Scores are probabilistic (Monte Carlo confidence intervals), pattern matches come with confidence percentages, and every assessment includes quality gates and data completeness checks. Better inputs and better analysis lead to better-informed decisions - but no system can guarantee real-world outcomes.',
    evidence: 'QuantumMonteCarlo uses 5000-iteration simulation with P10/P50/P90 ranges. PatternConfidenceEngine reports confidence % with warnings. IntelligenceQualityGate grades data completeness. All scores have explicit confidence levels.',
  },
];

// -- Data Source Declarations ------------------------------------------------

const DATA_SOURCES: DataSourceDeclaration[] = [
  { name: 'World Bank Open Data', type: 'public-open-data', description: 'GDP, GDP growth, macroeconomic indicators via World Bank API', isLiveGovernmentDB: false },
  { name: 'UN Comtrade', type: 'public-open-data', description: 'Bilateral trade statistics', isLiveGovernmentDB: false },
  { name: 'ACLED', type: 'public-open-data', description: 'Armed Conflict Location & Event Data', isLiveGovernmentDB: false },
  { name: 'OpenSanctions', type: 'public-open-data', description: 'Sanctions lists and PEP databases', isLiveGovernmentDB: false },
  { name: 'OpenCorporates', type: 'public-open-data', description: 'Company registration records', isLiveGovernmentDB: false },
  { name: 'Numbeo', type: 'public-open-data', description: 'Cost of living and quality of life indices', isLiveGovernmentDB: false },
  { name: 'Tavily Web Search', type: 'real-time-search', description: 'Deep web research synthesis', isLiveGovernmentDB: false },
  { name: 'OSINT Search', type: 'real-time-search', description: 'Open-source intelligence across news, government publications, business sources', isLiveGovernmentDB: false },
  { name: 'Government Incentive Vault', type: 'curated-reference', description: 'Manually curated and verified incentive records across 10+ countries with last-verified dates', isLiveGovernmentDB: false },
  { name: 'City Intelligence Library', type: 'curated-reference', description: 'Ground-truth reports, workforce profiles, supply chain maps, ESG profiles - curated from verified sources', isLiveGovernmentDB: false },
  { name: 'Historical Case Library', type: 'curated-reference', description: '200+ years of documented global cases, relocation outcomes, and pattern templates', isLiveGovernmentDB: false },
  { name: 'Analytical Models', type: 'internal-model', description: 'Composite scoring, risk simulation, causal reasoning, bias modelling - computed in real-time from available data', isLiveGovernmentDB: false },
];

// -- Engine ------------------------------------------------------------------

export class SystemCapabilityBoundary {

  /** Get full capability snapshot */
  static getSnapshot(): CapabilitySnapshot {
    const totalCapabilities = CAPABILITY_CATEGORIES.reduce(
      (sum, cat) => sum + cat.capabilities.length, 0
    );
    return {
      totalEngines: this.countEngines(),
      totalCapabilities,
      categories: CAPABILITY_CATEGORIES,
      boundaries: SYSTEM_BOUNDARIES,
      dataSources: DATA_SOURCES,
      generatedAt: new Date().toISOString(),
    };
  }

  /** Get just the system boundaries */
  static getBoundaries(): SystemBoundary[] {
    return [...SYSTEM_BOUNDARIES];
  }

  /** Get data source declarations */
  static getDataSources(): DataSourceDeclaration[] {
    return [...DATA_SOURCES];
  }

  /** Check if a questioned capability is within system boundaries */
  static canSystemDo(question: string): { answer: boolean; explanation: string; relatedCapabilities: Capability[] } {
    const q = question.toLowerCase();
    const matched: Capability[] = [];

    for (const cat of CAPABILITY_CATEGORIES) {
      for (const cap of cat.capabilities) {
        const desc = cap.description.toLowerCase();
        // Simple keyword matching - the AI layer does the nuanced interpretation
        const keywords = desc.split(/\s+/).filter(w => w.length > 4);
        if (keywords.some(k => q.includes(k))) {
          matched.push(cap);
        }
      }
    }

    // Check if it hits a boundary
    const boundaryHit = SYSTEM_BOUNDARIES.find(b => {
      const terms = b.claim.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      return terms.some(t => q.includes(t));
    });

    if (boundaryHit) {
      return {
        answer: false,
        explanation: `${boundaryHit.claim} ${boundaryHit.explanation}`,
        relatedCapabilities: matched,
      };
    }

    return {
      answer: matched.length > 0,
      explanation: matched.length > 0
        ? `Yes - powered by: ${matched.map(m => m.description).slice(0, 3).join('; ')}`
        : 'This capability is not currently in the system. It may be possible with additional integration work.',
      relatedCapabilities: matched,
    };
  }

  /** Count unique engine IDs across all capabilities */
  static countEngines(): number {
    const ids = new Set<string>();
    for (const cat of CAPABILITY_CATEGORIES) {
      for (const cap of cat.capabilities) {
        cap.engineIds.forEach(id => ids.add(id));
      }
    }
    return ids.size;
  }

  /** Generate prompt-ready capability summary for the brain context */
  static summarizeForPrompt(domainMode?: string): string {
    const snap = this.getSnapshot();
    const lines: string[] = [];

    const domainLabel = domainMode && domainMode !== 'regional-development'
      ? ` (Domain: ${domainMode})`
      : '';

    lines.push(`\n### -- SYSTEM CAPABILITY BOUNDARIES${domainLabel} --`);
    lines.push(`**Active Engines:** ${snap.totalEngines} | **Capabilities:** ${snap.totalCapabilities} | **Data Sources:** ${snap.dataSources.length}`);
    if (domainMode && domainMode !== 'regional-development') {
      lines.push(`**Domain Mode:** ${domainMode} — All engines are domain-agnostic; scoring labels and personas are adapted to match the active domain.`);
    }

    lines.push(`\n**WHAT THIS SYSTEM DOES:**`);
    for (const cat of snap.categories) {
      const capList = cat.capabilities.map(c => c.description.substring(0, 60)).slice(0, 3).join('; ');
      lines.push(`- **${cat.label}:** ${capList}`);
    }

    lines.push(`\n**WHAT THIS SYSTEM DOES NOT DO:**`);
    for (const boundary of snap.boundaries) {
      lines.push(`- ${boundary.claim} ${boundary.explanation.substring(0, 120)}`);
    }

    lines.push(`\n**DATA SOURCE TRANSPARENCY:**`);
    const liveAPIs = snap.dataSources.filter(d => d.type === 'public-open-data').map(d => d.name).join(', ');
    const curated = snap.dataSources.filter(d => d.type === 'curated-reference').map(d => d.name).join(', ');
    const search = snap.dataSources.filter(d => d.type === 'real-time-search').map(d => d.name).join(', ');
    lines.push(`- **Live Public APIs:** ${liveAPIs}`);
    lines.push(`- **Curated Reference Libraries:** ${curated}`);
    lines.push(`- **Real-Time Search:** ${search}`);
    lines.push(`- **No proprietary or restricted government database connections.**`);

    lines.push(`\nWhen a user asks about system capabilities, use this boundary definition. Be transparent about what is curated vs live, computed vs guaranteed. Never overclaim.`);

    return lines.join('\n');
  }
}
