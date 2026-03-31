/**
 * COMPREHENSIVE INDICES ENGINE
 * 
 * Implements ALL documented indices that were previously marked as "not implemented":
 * - BARNA: Barriers Analysis
 * - NVI: Network Value Index
 * - CRI: Country Risk Index
 * - CAP: Capability Assessment Profile
 * - AGI: Activation Gradient Index
 * - VCI: Value Creation Index
 * - ATI: Asset Transfer Index
 * - ESI: Ecosystem Strength Index
 * - ISI: Integration Speed Index
 * - OSI: Operational Synergy Index
 * - TCO: Total Cost of Ownership
 * - PRI: Political Risk Index
 * - RNI: Regulatory Navigation Index
 * - SRA: Strategic Risk Assessment
 * - IDV: Investment Default Variance
 */

import { ReportParameters } from '../types';
import CompositeScoreService from './CompositeScoreService';

// ============================================================================
// TYPES
// ============================================================================

export interface IndexResult {
  value: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  interpretation: string;
  components: Record<string, number>;
  recommendations: string[];
}

export interface AllIndicesResult {
  barna: IndexResult;
  nvi: IndexResult;
  cri: IndexResult;
  cap: IndexResult;
  agi: IndexResult;
  vci: IndexResult;
  ati: IndexResult;
  esi: IndexResult;
  isi: IndexResult;
  osi: IndexResult;
  tco: IndexResult;
  pri: IndexResult;
  rni: IndexResult;
  sra: IndexResult;
  idv: IndexResult;
  /** NEW: Partnership Viability Index - multi-dimensional partnership health */
  pvi: IndexResult;
  /** NEW: Regional Resilience Index - economic shock absorption capacity */
  rri: IndexResult;
  /** NEW: Composite Risk Priority Score - weighted risk aggregation */
  crps: IndexResult;
  /** NEW: Supply Chain Risk Index - dependency & logistics vulnerability */
  srci: IndexResult;
  /** NEW: Market Penetration Index - market entry feasibility */
  mpi: IndexResult;
  /** NEW: Governance Confidence Index - institutional trustworthiness */
  gci: IndexResult;
  /** NEW: Counterparty Integrity Score - entity-level trust metric */
  cis: IndexResult;
  /** NEW: Ecosystem Shock Index - resilience to external shocks */
  eshock: IndexResult;
  composite: {
    overallScore: number;
    riskAdjustedScore: number;
    opportunityScore: number;
    executionReadiness: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
};

const clamp = (value: number, min: number, max: number): number => 
  Math.min(max, Math.max(min, value));

// ============================================================================
// INDEX CALCULATIONS
// ============================================================================

/**
 * BARNA - Barriers Analysis
 * Measures entry barriers including regulatory, competitive, and operational
 */
export async function calculateBARNA(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  // Component calculations
  const regulatoryBarrier = 100 - composite.components.regulatory;
  // Estimate competitive barrier from industry and strategic intent
  const competitiveBarrier = params.industry?.length 
    ? Math.min(80, params.industry.length * 15)
    : 40;
  const capitalBarrier = params.dealSize 
    ? (parseFloat(String(params.dealSize).replace(/[^0-9.]/g, '')) > 50000000 ? 70 : 40)
    : 50;
  const marketAccessBarrier = 100 - composite.components.marketAccess;
  const culturalBarrier = params.country && params.userCountry && params.country !== params.userCountry ? 45 : 25;

  const components = {
    regulatory: regulatoryBarrier,
    competitive: competitiveBarrier,
    capital: capitalBarrier,
    marketAccess: marketAccessBarrier,
    cultural: culturalBarrier
  };

  const value = clamp(
    100 - (regulatoryBarrier * 0.25 + competitiveBarrier * 0.2 + capitalBarrier * 0.2 + 
           marketAccessBarrier * 0.2 + culturalBarrier * 0.15),
    10, 95
  );

  const recommendations: string[] = [];
  if (regulatoryBarrier > 60) recommendations.push('Engage local legal counsel early to navigate regulatory complexity');
  if (competitiveBarrier > 60) recommendations.push('Consider niche market positioning to avoid head-to-head competition');
  if (capitalBarrier > 60) recommendations.push('Explore phased investment approach to reduce capital barrier');
  if (marketAccessBarrier > 50) recommendations.push('Partner with local distributor for market access');
  if (culturalBarrier > 40) recommendations.push('Invest in cultural adaptation and local hiring');

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Low barriers to entry - favorable conditions for market entry'
      : value > 50
      ? 'Moderate barriers exist - strategic planning required'
      : 'Significant barriers - consider alternative approaches or markets',
    components,
    recommendations
  };
}

/**
 * NVI - Network Value Index
 * Measures the value and strength of partnership networks
 */
export async function calculateNVI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  // Calculate network components - use targetPartner as single value
  const existingPartners = params.targetPartner ? 1 : 0;
  const partnerDiversity = params.partnerPersonas?.length || 0;
  const networkReach = composite.components.marketAccess * 0.8;
  const relationshipDepth = params.partnerReadinessLevel === 'high' ? 85 : 
                            params.partnerReadinessLevel === 'medium' ? 60 : 35;
  const ecosystemStrength = (composite.components.innovation + composite.components.talent) / 2;

  const components = {
    partnerCount: Math.min(100, existingPartners * 15),
    diversity: Math.min(100, partnerDiversity * 20),
    reach: networkReach,
    depth: relationshipDepth,
    ecosystem: ecosystemStrength
  };

  const value = clamp(
    (components.partnerCount * 0.2 + components.diversity * 0.2 + 
     components.reach * 0.25 + components.depth * 0.2 + components.ecosystem * 0.15),
    10, 95
  );

  const recommendations: string[] = [];
  if (existingPartners < 3) recommendations.push('Expand partner network before market entry');
  if (partnerDiversity < 2) recommendations.push('Diversify partner types (government, commercial, academic)');
  if (relationshipDepth < 50) recommendations.push('Deepen existing relationships through pilot projects');

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Strong network foundation for market entry'
      : value > 50
      ? 'Network needs strengthening for optimal outcomes'
      : 'Significant network development required before proceeding',
    components,
    recommendations
  };
}

/**
 * CRI - Country Risk Index
 * Comprehensive country-level risk assessment
 */
export async function calculateCRI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const politicalRisk = 100 - composite.components.politicalStability;
  const economicRisk = 100 - (composite.inputs.gdpGrowth > 3 ? 70 : composite.inputs.gdpGrowth > 0 ? 50 : 30);
  // Currency risk derived from inflation as proxy for exchange rate volatility
  const currencyRisk = composite.inputs.inflation > 15 ? 70 : 
                       composite.inputs.inflation > 8 ? 50 : 30;
  const sovereignRisk = 100 - composite.components.regulatory * 0.8;
  const operationalRisk = 100 - composite.components.infrastructure;

  const components = {
    political: politicalRisk,
    economic: economicRisk,
    currency: currencyRisk,
    sovereign: sovereignRisk,
    operational: operationalRisk
  };

  // CRI is inverted - higher is better (lower risk)
  const riskScore = (politicalRisk * 0.25 + economicRisk * 0.2 + currencyRisk * 0.2 + 
                     sovereignRisk * 0.15 + operationalRisk * 0.2);
  const value = clamp(100 - riskScore, 10, 95);

  const recommendations: string[] = [];
  if (politicalRisk > 60) recommendations.push('Consider political risk insurance');
  if (currencyRisk > 50) recommendations.push('Implement currency hedging strategy');
  if (sovereignRisk > 50) recommendations.push('Seek bilateral investment treaty protection');
  if (operationalRisk > 50) recommendations.push('Build operational redundancy');

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Favorable country risk profile'
      : value > 50
      ? 'Moderate country risks - mitigation strategies recommended'
      : 'Elevated country risks - proceed with caution',
    components,
    recommendations
  };
}

/**
 * CAP - Capability Assessment Profile
 * Measures organizational readiness and capabilities
 */
export async function calculateCAP(params: Partial<ReportParameters>): Promise<IndexResult> {
  // Use partnerCapabilities as proxy for technical capabilities
  const technicalCapabilities = (params.partnerCapabilities || []).length;
  // Use dealSize as proxy for resource availability
  const resourceAvailability = params.dealSize ? 70 : 40;
  const experienceLevel = params.skillLevel === 'experienced' ? 85 : 
                          params.skillLevel === 'intermediate' ? 65 : 45;
  const organizationalScale = params.organizationType?.includes('Enterprise') ? 80 :
                              params.organizationType?.includes('Government') ? 75 : 55;
  const adaptability = params.strategicIntent?.some(i => 
    i.toLowerCase().includes('innovation') || i.toLowerCase().includes('digital')) ? 75 : 50;

  const components = {
    technical: Math.min(100, technicalCapabilities * 12),
    resources: resourceAvailability,
    experience: experienceLevel,
    scale: organizationalScale,
    adaptability: adaptability
  };

  const value = clamp(
    (components.technical * 0.25 + components.resources * 0.2 + 
     components.experience * 0.2 + components.scale * 0.15 + components.adaptability * 0.2),
    10, 95
  );

  const recommendations: string[] = [];
  if (technicalCapabilities < 3) recommendations.push('Document and strengthen core technical capabilities');
  if (resourceAvailability < 50) recommendations.push('Secure dedicated budget allocation before proceeding');
  if (experienceLevel < 60) recommendations.push('Consider hiring experienced market entry specialists');

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Strong organizational capability for execution'
      : value > 50
      ? 'Adequate capabilities with room for enhancement'
      : 'Capability gaps should be addressed before major initiatives',
    components,
    recommendations
  };
}

/**
 * AGI - Activation Gradient Index
 * Measures speed and ease of market activation
 */
export async function calculateAGI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const regulatorySpeed = composite.components.regulatory * 0.9;
  const partnerReadiness = params.partnerReadinessLevel === 'high' ? 90 : 
                           params.partnerReadinessLevel === 'medium' ? 65 : 40;
  const infrastructureReady = composite.components.infrastructure;
  const marketAccessibility = composite.components.marketAccess * 0.85;
  // Use expansion timeline as proxy for resource mobilization readiness
  const resourceMobilization = params.expansionTimeline?.includes('immediate') ? 80 :
                               params.expansionTimeline?.includes('short') ? 65 : 50;

  const components = {
    regulatory: regulatorySpeed,
    partner: partnerReadiness,
    infrastructure: infrastructureReady,
    market: marketAccessibility,
    resources: resourceMobilization
  };

  const value = clamp(
    (regulatorySpeed * 0.25 + partnerReadiness * 0.2 + infrastructureReady * 0.2 + 
     marketAccessibility * 0.2 + resourceMobilization * 0.15),
    10, 95
  );

  const recommendations: string[] = [];
  if (regulatorySpeed < 50) recommendations.push('Engage regulatory consultants to accelerate approvals');
  if (partnerReadiness < 50) recommendations.push('Accelerate partner due diligence and negotiations');
  if (resourceMobilization < 60) recommendations.push('Pre-position resources for rapid deployment');

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Fast activation possible - market can be entered quickly'
      : value > 50
      ? 'Moderate activation timeline expected'
      : 'Slow activation anticipated - plan for extended ramp-up',
    components,
    recommendations
  };
}

/**
 * VCI - Value Creation Index
 * Measures potential for value creation
 */
export async function calculateVCI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const marketGrowth = composite.inputs.gdpGrowth > 5 ? 90 : 
                       composite.inputs.gdpGrowth > 3 ? 75 : 
                       composite.inputs.gdpGrowth > 0 ? 55 : 35;
  const innovationPotential = composite.components.innovation;
  const synergyPotential = params.partnerPersonas?.length 
    ? Math.min(85, 50 + params.partnerPersonas.length * 10) : 50;
  // Use partnerCapabilities as proxy for core competencies
  const competitiveAdvantage = params.partnerCapabilities?.length 
    ? Math.min(90, 50 + params.partnerCapabilities.length * 8) : 45;
  const scalability = composite.components.marketAccess * 0.8;

  const components = {
    growth: marketGrowth,
    innovation: innovationPotential,
    synergy: synergyPotential,
    advantage: competitiveAdvantage,
    scale: scalability
  };

  const value = clamp(
    (marketGrowth * 0.25 + innovationPotential * 0.2 + synergyPotential * 0.2 + 
     competitiveAdvantage * 0.2 + scalability * 0.15),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'High value creation potential identified'
      : value > 50
      ? 'Moderate value creation opportunity'
      : 'Limited value creation expected - reassess strategy',
    components,
    recommendations: [
      'Focus on high-growth market segments',
      'Leverage unique capabilities for competitive differentiation',
      'Structure partnerships for mutual value creation'
    ]
  };
}

/**
 * ATI - Asset Transfer Index
 * Measures ease of asset/capability transfer
 */
export async function calculateATI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const ipProtection = composite.components.regulatory * 0.7;
  const contractEnforcement = composite.components.politicalStability * 0.6 + 30;
  const capitalMobility = composite.inputs.fdiInflows > 5 ? 80 : 
                          composite.inputs.fdiInflows > 2 ? 65 : 45;
  const knowledgeTransfer = composite.components.talent * 0.8;
  const operationalTransfer = composite.components.infrastructure * 0.75;

  const components = {
    ip: ipProtection,
    contracts: contractEnforcement,
    capital: capitalMobility,
    knowledge: knowledgeTransfer,
    operations: operationalTransfer
  };

  const value = clamp(
    (ipProtection * 0.25 + contractEnforcement * 0.2 + capitalMobility * 0.2 + 
     knowledgeTransfer * 0.2 + operationalTransfer * 0.15),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Favorable conditions for asset transfer'
      : value > 50
      ? 'Asset transfer possible with appropriate safeguards'
      : 'Asset transfer challenges - consider protective structures',
    components,
    recommendations: [
      'Conduct thorough IP protection assessment',
      'Structure contracts under favorable jurisdictions',
      'Plan phased capability transfer with milestones'
    ]
  };
}

/**
 * ESI - Ecosystem Strength Index
 * Measures the strength of the business ecosystem
 */
export async function calculateESI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const supplierNetwork = composite.components.supplyChain;
  const talentPool = composite.components.talent;
  const innovationHub = composite.components.innovation;
  const financialServices = composite.inputs.fdiInflows > 3 ? 75 : 55;
  const supportingIndustries = composite.components.infrastructure * 0.7 + composite.components.digitalReadiness * 0.3;

  const components = {
    suppliers: supplierNetwork,
    talent: talentPool,
    innovation: innovationHub,
    finance: financialServices,
    support: supportingIndustries
  };

  const value = clamp(
    (supplierNetwork * 0.25 + talentPool * 0.2 + innovationHub * 0.2 + 
     financialServices * 0.15 + supportingIndustries * 0.2),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Strong ecosystem supports business operations'
      : value > 50
      ? 'Adequate ecosystem with some gaps'
      : 'Weak ecosystem - consider ecosystem development investment',
    components,
    recommendations: [
      'Map key ecosystem players before entry',
      'Identify gaps requiring in-house capability',
      'Invest in ecosystem development if strategically important'
    ]
  };
}

/**
 * ISI - Integration Speed Index
 * Measures how quickly operations can be integrated
 */
export async function calculateISI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const processCompatibility = composite.components.digitalReadiness;
  const systemInteroperability = composite.components.infrastructure * 0.8;
  const culturalAlignment = params.country === params.userCountry ? 85 : 55;
  const changeReadiness = params.partnerReadinessLevel === 'high' ? 80 : 55;
  // Use dealSize as proxy for resource availability
  const resourceAvailability = params.dealSize ? 70 : 45;

  const components = {
    process: processCompatibility,
    systems: systemInteroperability,
    culture: culturalAlignment,
    change: changeReadiness,
    resources: resourceAvailability
  };

  const value = clamp(
    (processCompatibility * 0.25 + systemInteroperability * 0.2 + culturalAlignment * 0.2 + 
     changeReadiness * 0.2 + resourceAvailability * 0.15),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Rapid integration achievable'
      : value > 50
      ? 'Standard integration timeline expected'
      : 'Extended integration period anticipated',
    components,
    recommendations: [
      'Develop detailed integration playbook',
      'Identify integration quick wins for momentum',
      'Plan for cultural integration activities'
    ]
  };
}

/**
 * OSI - Operational Synergy Index
 * Measures potential operational synergies
 */
export async function calculateOSI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const processEfficiency = composite.components.infrastructure;
  const costSynergy = composite.inputs.gdpPerCapita < 30000 ? 75 : 50; // Lower cost markets = higher synergy potential
  // Use partnerCapabilities as proxy for core competencies
  const capabilityCombination = (params.partnerCapabilities?.length || 0) * 10 + 40;
  const scaleEconomies = composite.components.marketAccess * 0.7;
  const sharedServices = composite.components.digitalReadiness * 0.8;

  const components = {
    process: processEfficiency,
    cost: costSynergy,
    capability: Math.min(90, capabilityCombination),
    scale: scaleEconomies,
    shared: sharedServices
  };

  const value = clamp(
    (processEfficiency * 0.2 + costSynergy * 0.25 + capabilityCombination * 0.2 + 
     scaleEconomies * 0.2 + sharedServices * 0.15),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Strong operational synergy potential'
      : value > 50
      ? 'Moderate synergies achievable'
      : 'Limited synergy potential - may require operational restructuring',
    components,
    recommendations: [
      'Quantify synergy targets with clear timelines',
      'Identify quick-win synergies for early value',
      'Build synergy tracking mechanisms'
    ]
  };
}

/**
 * TCO - Total Cost of Ownership
 * Measures comprehensive cost profile (inverted - higher score = lower cost)
 */
export async function calculateTCO(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  // Lower values in these = higher TCO score (lower cost is better)
  const laborCost = composite.inputs.gdpPerCapita < 15000 ? 80 : 
                    composite.inputs.gdpPerCapita < 35000 ? 60 : 40;
  const regulatoryCost = composite.components.regulatory * 0.7;
  const infrastructureCost = composite.components.infrastructure * 0.6;
  const complianceCost = composite.components.politicalStability * 0.5 + 30;
  const operationalCost = (composite.components.supplyChain + composite.components.infrastructure) / 2;

  const components = {
    labor: laborCost,
    regulatory: regulatoryCost,
    infrastructure: infrastructureCost,
    compliance: complianceCost,
    operational: operationalCost
  };

  const value = clamp(
    (laborCost * 0.3 + regulatoryCost * 0.2 + infrastructureCost * 0.2 + 
     complianceCost * 0.15 + operationalCost * 0.15),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Favorable cost structure - competitive TCO'
      : value > 50
      ? 'Moderate cost profile - room for optimization'
      : 'High cost environment - requires cost management focus',
    components,
    recommendations: [
      'Benchmark costs against regional alternatives',
      'Identify cost optimization opportunities',
      'Consider shared services for cost reduction'
    ]
  };
}

/**
 * PRI - Political Risk Index (detailed)
 */
export async function calculatePRI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const govtStability = composite.components.politicalStability;
  const policyConsistency = composite.components.regulatory * 0.7;
  const expropiationRisk = composite.components.politicalStability * 0.8;
  const civilUnrest = composite.components.politicalStability * 0.6 + 20;
  // Use market access as proxy for trade openness
  const geopolitical = composite.components.marketAccess > 80 ? 75 : 55;

  const components = {
    stability: govtStability,
    policy: policyConsistency,
    expropiation: expropiationRisk,
    unrest: civilUnrest,
    geopolitical: geopolitical
  };

  const value = clamp(
    (govtStability * 0.3 + policyConsistency * 0.25 + expropiationRisk * 0.2 + 
     civilUnrest * 0.15 + geopolitical * 0.1),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Low political risk environment'
      : value > 50
      ? 'Moderate political risk - monitoring required'
      : 'Elevated political risk - mitigation essential',
    components,
    recommendations: value < 60 ? [
      'Obtain political risk insurance',
      'Structure investments for maximum protection',
      'Diversify across multiple markets'
    ] : ['Continue standard monitoring']
  };
}

/**
 * RNI - Regulatory Navigation Index
 */
export async function calculateRNI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const transparency = composite.components.regulatory;
  const consistency = composite.components.politicalStability * 0.6 + 30;
  const processEfficiency = composite.components.digitalReadiness * 0.7 + 20;
  const appealMechanisms = composite.components.regulatory * 0.8;
  // Use market access as proxy for trade openness
  const stakeholderAccess = composite.components.marketAccess > 70 ? 75 : 55;

  const components = {
    transparency: transparency,
    consistency: consistency,
    efficiency: processEfficiency,
    appeals: appealMechanisms,
    access: stakeholderAccess
  };

  const value = clamp(
    (transparency * 0.3 + consistency * 0.2 + processEfficiency * 0.2 + 
     appealMechanisms * 0.15 + stakeholderAccess * 0.15),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Navigable regulatory environment'
      : value > 50
      ? 'Complex but manageable regulatory landscape'
      : 'Challenging regulatory navigation - expert support needed',
    components,
    recommendations: [
      'Engage local regulatory specialists',
      'Build relationships with regulatory stakeholders',
      'Document all regulatory interactions'
    ]
  };
}

/**
 * SRA - Strategic Risk Assessment
 */
export async function calculateSRA(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const marketRisk = 100 - composite.components.marketAccess;
  const executionRisk = params.partnerReadinessLevel === 'high' ? 30 : 
                        params.partnerReadinessLevel === 'medium' ? 50 : 70;
  // Estimate competitive risk from industry complexity
  const competitiveRisk = params.industry?.length ? Math.min(80, params.industry.length * 15) : 50;
  const financialRisk = params.riskTolerance === 'low' ? 60 : 
                        params.riskTolerance === 'high' ? 40 : 50;
  const timingRisk = params.expansionTimeline?.includes('0-6') ? 65 : 45;

  const components = {
    market: marketRisk,
    execution: executionRisk,
    competitive: competitiveRisk,
    financial: financialRisk,
    timing: timingRisk
  };

  // Inverted - higher score means lower strategic risk
  const riskScore = (marketRisk * 0.25 + executionRisk * 0.25 + competitiveRisk * 0.2 + 
                     financialRisk * 0.15 + timingRisk * 0.15);
  const value = clamp(100 - riskScore, 10, 95);

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Low strategic risk profile'
      : value > 50
      ? 'Manageable strategic risks present'
      : 'Significant strategic risks - develop mitigation plans',
    components,
    recommendations: [
      'Develop contingency plans for key risks',
      'Build early warning indicators',
      'Review risk profile quarterly'
    ]
  };
}

/**
 * IDV - Investment Default Variance
 * Measures variance from expected investment outcomes
 */
export async function calculateIDV(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  // Use inflation as proxy for market volatility (correlates with exchange rate issues)
  const marketVolatility = composite.inputs.inflation > 10 ? 40 : 70;
  const economicStability = composite.inputs.gdpGrowth > 0 ? 70 : 40;
  const partnerReliability = params.partnerReadinessLevel === 'high' ? 80 : 55;
  const executionVariance = composite.components.infrastructure * 0.7 + 20;
  const historicalPredictability = composite.components.politicalStability * 0.6 + 30;

  const components = {
    market: marketVolatility,
    economic: economicStability,
    partner: partnerReliability,
    execution: executionVariance,
    historical: historicalPredictability
  };

  const value = clamp(
    (marketVolatility * 0.25 + economicStability * 0.25 + partnerReliability * 0.2 + 
     executionVariance * 0.15 + historicalPredictability * 0.15),
    10, 95
  );

  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70 
      ? 'Low variance expected - predictable outcomes'
      : value > 50
      ? 'Moderate variance - plan for range of outcomes'
      : 'High variance - prepare for significant deviations',
    components,
    recommendations: [
      'Model multiple scenarios (P10/P50/P90)',
      'Build contingency reserves',
      'Set up early warning triggers'
    ]
  };
}

// ============================================================================
// NEW FORMULA IMPLEMENTATIONS (8 Missing Indices)
// ============================================================================

/**
 * PVI - Partnership Viability Index
 * Multi-dimensional partnership health assessment.
 * Uses the "Core Truth" principle: at its heart, a partnership is two entities
 * exchanging value — strip away complexity and measure alignment, capability
 * match, and mutual benefit symmetry.
 */
export async function calculatePVI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  // Strategic alignment — do both parties want the same future?
  const strategicAlignment = params.partnerReadinessLevel === 'high' ? 82
    : params.partnerReadinessLevel === 'medium' ? 62 : 40;
  // Capability complementarity — do skills fill each other's gaps?
  const capabilityMatch = composite.components.infrastructure * 0.4 +
    composite.components.marketAccess * 0.3 + 30;
  // Value symmetry — is value exchange balanced or lopsided?
  const valueSymmetry = composite.components.regulatory > 50 ? 70 : 48;
  // Cultural compatibility — governance, language, business norms
  const culturalFit = params.country === params.userCountry ? 85 :
    composite.components.politicalStability * 0.5 + 30;
  // Exit optionality — can either party leave without catastrophe?
  const exitOptionality = composite.components.regulatory * 0.4 +
    composite.components.marketAccess * 0.3 + 20;

  const components = {
    strategicAlignment, capabilityMatch, valueSymmetry, culturalFit, exitOptionality
  };
  const value = clamp(
    strategicAlignment * 0.25 + capabilityMatch * 0.20 + valueSymmetry * 0.20 +
    culturalFit * 0.20 + exitOptionality * 0.15,
    10, 95
  );
  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70
      ? 'Partnership has strong viability — aligned interests and balanced value exchange'
      : value > 50
      ? 'Partnership viable with conditions — address asymmetries before commitment'
      : 'Partnership viability is low — fundamental misalignment detected',
    components,
    recommendations: [
      'Map each party\'s non-negotiable outcomes before structuring terms',
      'Build milestone-based trust escalation into the agreement',
      'Define clear exit mechanics upfront — paradoxically strengthens commitment'
    ]
  };
}

/**
 * RRI - Regional Resilience Index
 * Economic shock absorption capacity.
 * Measures how well a region can absorb and recover from external shocks
 * (currency crises, political upheaval, supply chain disruption, pandemics).
 */
export async function calculateRRI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const economicDiversification = composite.components.marketAccess * 0.6 + 25;
  const institutionalStrength = composite.components.politicalStability * 0.5 +
    composite.components.regulatory * 0.3 + 15;
  const fiscalBufferCapacity = composite.inputs.gdpGrowth > 3 ? 75 :
    composite.inputs.gdpGrowth > 0 ? 55 : 30;
  const infrastructureRedundancy = composite.components.infrastructure * 0.7 + 20;
  const socialCohesion = composite.components.politicalStability * 0.6 + 25;

  const components = {
    diversification: economicDiversification,
    institutions: institutionalStrength,
    fiscalBuffer: fiscalBufferCapacity,
    infrastructure: infrastructureRedundancy,
    socialCohesion
  };
  const value = clamp(
    economicDiversification * 0.25 + institutionalStrength * 0.20 +
    fiscalBufferCapacity * 0.20 + infrastructureRedundancy * 0.20 +
    socialCohesion * 0.15,
    10, 95
  );
  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70
      ? 'Region has strong shock absorption — diversified economy with institutional depth'
      : value > 50
      ? 'Moderate resilience — vulnerable to prolonged or compound shocks'
      : 'Low resilience — region is fragile; build contingency into every plan',
    components,
    recommendations: [
      'Stress-test plans against 3 simultaneous adverse scenarios',
      'Build local partnerships for supply chain redundancy',
      'Maintain currency hedging if operating in volatile regions'
    ]
  };
}

/**
 * CRPS - Composite Risk Priority Score
 * Weighted risk aggregation using severity × probability × detectability.
 * Inspired by FMEA (Failure Mode & Effects Analysis) from engineering —
 * a cross-domain methodology that economic analysis typically ignores.
 */
export async function calculateCRPS(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  // Political risk severity × probability
  const politicalRPN = (100 - composite.components.politicalStability) * 0.7 + 15;
  // Regulatory risk — harder to detect (low detectability = higher priority)
  const regulatoryRPN = (100 - composite.components.regulatory) * 0.8 + 10;
  // Market risk — volatility and access barriers
  const marketRPN = (100 - composite.components.marketAccess) * 0.5 + 20;
  // Financial risk — inflation, currency, debt
  const financialRPN = composite.inputs.inflation > 8 ? 75 :
    composite.inputs.inflation > 4 ? 55 : 35;
  // Operational risk — infrastructure and execution
  const operationalRPN = (100 - composite.components.infrastructure) * 0.6 + 15;

  const components = {
    political: politicalRPN,
    regulatory: regulatoryRPN,
    market: marketRPN,
    financial: financialRPN,
    operational: operationalRPN
  };
  // CRPS inverts — higher score = LOWER risk (more favorable)
  const rawRisk = (politicalRPN * 0.25 + regulatoryRPN * 0.25 + marketRPN * 0.15 +
    financialRPN * 0.20 + operationalRPN * 0.15);
  const value = clamp(100 - rawRisk, 10, 95);
  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70
      ? 'Risk priority is low — no category exceeds acceptable thresholds'
      : value > 50
      ? 'Moderate risk concentration — 1-2 categories need mitigation plans'
      : 'High composite risk — multiple overlapping risk factors require immediate action',
    components,
    recommendations: [
      'Rank risks by detectability — the ones you cannot see early are the most dangerous',
      'Build a risk waterfall: address highest-RPN items first',
      'Assign risk owners — unowned risks are unmanaged risks'
    ]
  };
}

/**
 * SRCI - Supply Chain Risk Index
 * Dependency and logistics vulnerability assessment.
 * Measures how exposed operations are to supply chain disruption,
 * concentration risk, and logistics fragility.
 */
export async function calculateSRCI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const logisticsQuality = composite.components.infrastructure * 0.7 + 20;
  const supplierDiversification = composite.components.marketAccess * 0.5 + 30;
  // Geographic concentration risk — single-country dependency
  const geoConcentration = params.country && params.userCountry &&
    params.country !== params.userCountry ? 55 : 75;
  const regulatoryStability = composite.components.regulatory * 0.6 + 25;
  const corridorReliability = composite.components.infrastructure * 0.5 +
    composite.components.politicalStability * 0.3 + 15;

  const components = {
    logistics: logisticsQuality,
    diversification: supplierDiversification,
    geoConcentration,
    regulatoryStability,
    corridor: corridorReliability
  };
  const value = clamp(
    logisticsQuality * 0.25 + supplierDiversification * 0.20 +
    geoConcentration * 0.20 + regulatoryStability * 0.15 +
    corridorReliability * 0.20,
    10, 95
  );
  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70
      ? 'Supply chain resilience is strong — diversified sources and reliable corridors'
      : value > 50
      ? 'Moderate supply chain risk — concentration or logistics gaps need attention'
      : 'High supply chain vulnerability — single points of failure detected',
    components,
    recommendations: [
      'Map tier-2 and tier-3 suppliers — hidden dependencies cause surprise failures',
      'Establish dual-corridor logistics for critical inputs',
      'Maintain 90-day buffer inventory for mission-critical materials'
    ]
  };
}

/**
 * MPI - Market Penetration Index
 * Market entry feasibility and competitive positioning.
 * Measures how accessible and penetrable a target market is,
 * considering barriers, competition intensity, and growth potential.
 */
export async function calculateMPI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const marketAccessibility = composite.components.marketAccess * 0.8 + 15;
  const growthPotential = composite.inputs.gdpGrowth > 5 ? 85 :
    composite.inputs.gdpGrowth > 2 ? 65 : 40;
  const competitiveIntensity = params.industry?.length
    ? Math.max(30, 80 - params.industry.length * 8) : 55;
  const regulatoryEase = composite.components.regulatory * 0.7 + 20;
  const consumerReadiness = composite.components.infrastructure * 0.4 +
    composite.components.marketAccess * 0.3 + 20;

  const components = {
    accessibility: marketAccessibility,
    growth: growthPotential,
    competition: competitiveIntensity,
    regulatory: regulatoryEase,
    consumer: consumerReadiness
  };
  const value = clamp(
    marketAccessibility * 0.25 + growthPotential * 0.25 +
    competitiveIntensity * 0.15 + regulatoryEase * 0.20 +
    consumerReadiness * 0.15,
    10, 95
  );
  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70
      ? 'Market is highly penetrable — favorable conditions for entry'
      : value > 50
      ? 'Market penetration feasible but requires strategic positioning'
      : 'Market entry is difficult — high barriers or intense competition',
    components,
    recommendations: [
      'Enter through partnership or JV to reduce barrier exposure',
      'Target underserved segments where competition is thinnest',
      'Build local brand equity before scaling — trust precedes market share'
    ]
  };
}

/**
 * GCI - Governance Confidence Index
 * Institutional trustworthiness and rule-of-law confidence.
 * Measures how much an investor/partner can trust the governance
 * environment to be predictable, fair, and enforceable.
 */
export async function calculateGCI(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  const ruleOfLaw = composite.components.politicalStability * 0.6 +
    composite.components.regulatory * 0.3 + 10;
  const regulatoryPredictability = composite.components.regulatory * 0.8 + 15;
  const judicialIndependence = composite.components.politicalStability * 0.5 + 30;
  const corruptionControl = composite.components.politicalStability * 0.4 +
    composite.components.regulatory * 0.3 + 20;
  const contractEnforceability = composite.components.regulatory * 0.7 +
    composite.components.infrastructure * 0.1 + 15;

  const components = {
    ruleOfLaw,
    regulatoryPredictability,
    judicialIndependence,
    corruption: corruptionControl,
    contracts: contractEnforceability
  };
  const value = clamp(
    ruleOfLaw * 0.25 + regulatoryPredictability * 0.20 +
    judicialIndependence * 0.20 + corruptionControl * 0.20 +
    contractEnforceability * 0.15,
    10, 95
  );
  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70
      ? 'Strong governance environment — institutions are reliable and predictable'
      : value > 50
      ? 'Moderate governance confidence — some institutional gaps, use contractual safeguards'
      : 'Low governance confidence — structure agreements with international arbitration clauses',
    components,
    recommendations: [
      'Include international arbitration (ICC/LCIA) in all agreements',
      'Build relationships with local legal counsel who understand enforcement realities',
      'Structure deals to minimize exposure to local judicial systems where weak'
    ]
  };
}

/**
 * CIS - Counterparty Integrity Score
 * Entity-level trust metric.
 * Assesses the trustworthiness of a specific counterparty based on
 * corporate governance, sanctions exposure, financial health signals,
 * and relationship history patterns.
 */
export async function calculateCIS(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  // Entity governance quality (proxy from regional governance)
  const entityGovernance = composite.components.regulatory * 0.5 +
    composite.components.politicalStability * 0.2 + 25;
  // Sanctions risk (lower score if high-risk jurisdiction)
  const sanctionsRisk = composite.components.politicalStability > 60 ? 80 : 45;
  // Financial transparency signal
  const financialTransparency = composite.components.regulatory * 0.6 + 30;
  // Track record reliability
  const trackRecord = params.partnerReadinessLevel === 'high' ? 80 :
    params.partnerReadinessLevel === 'medium' ? 60 : 40;
  // Operational credibility
  const operationalCredibility = composite.components.infrastructure * 0.5 + 35;

  const components = {
    governance: entityGovernance,
    sanctions: sanctionsRisk,
    transparency: financialTransparency,
    trackRecord,
    credibility: operationalCredibility
  };
  const value = clamp(
    entityGovernance * 0.25 + sanctionsRisk * 0.20 +
    financialTransparency * 0.20 + trackRecord * 0.20 +
    operationalCredibility * 0.15,
    10, 95
  );
  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70
      ? 'Counterparty integrity is strong — proceed with standard due diligence'
      : value > 50
      ? 'Moderate counterparty risk — enhanced due diligence recommended'
      : 'Counterparty integrity concerns — consider escrow structures and phased commitment',
    components,
    recommendations: [
      'Run OpenSanctions + GLEIF screening before any financial commitment',
      'Request audited financials for the last 3 years',
      'Verify beneficial ownership through independent registry checks'
    ]
  };
}

/**
 * ESHOCK - Ecosystem Shock Index
 * Measures resilience to cascading external shocks.
 * Different from RRI (which measures the region) — ESHOCK measures
 * how the entire business ecosystem (partners, supply chains, markets,
 * regulatory environment) would react to simultaneous disruptions.
 * Uses compound stress methodology: what happens when 3 things go wrong at once?
 */
export async function calculateESHOCK(params: Partial<ReportParameters>): Promise<IndexResult> {
  const composite = await CompositeScoreService.getScores({
    country: params.country,
    region: params.region
  });

  // Single-shock absorption (one thing goes wrong)
  const singleShockCapacity = composite.components.infrastructure * 0.4 +
    composite.components.marketAccess * 0.3 + 25;
  // Compound shock resistance (2+ simultaneous failures)
  const compoundShockResistance = (composite.components.politicalStability +
    composite.components.regulatory + composite.components.infrastructure) / 3 * 0.5 + 20;
  // Recovery velocity (how fast can ecosystem bounce back)
  const recoveryVelocity = composite.inputs.gdpGrowth > 3 ? 75 :
    composite.inputs.gdpGrowth > 0 ? 55 : 30;
  // Contagion isolation (can failures be contained)
  const contagionIsolation = composite.components.regulatory * 0.5 + 30;
  // Adaptive capacity (can ecosystem reconfigure under stress)
  const adaptiveCapacity = composite.components.marketAccess * 0.5 +
    composite.components.infrastructure * 0.2 + 25;

  const components = {
    singleShock: singleShockCapacity,
    compoundShock: compoundShockResistance,
    recovery: recoveryVelocity,
    isolation: contagionIsolation,
    adaptability: adaptiveCapacity
  };
  const value = clamp(
    singleShockCapacity * 0.15 + compoundShockResistance * 0.30 +
    recoveryVelocity * 0.20 + contagionIsolation * 0.15 +
    adaptiveCapacity * 0.20,
    10, 95
  );
  return {
    value: Math.round(value),
    grade: getGrade(value),
    interpretation: value > 70
      ? 'Ecosystem can absorb compound shocks — strong adaptive capacity'
      : value > 50
      ? 'Ecosystem survives single shocks but vulnerable to compound stress'
      : 'Fragile ecosystem — cascading failures likely under stress',
    components,
    recommendations: [
      'Run compound stress tests: currency crash + political change + supply disruption simultaneously',
      'Build circuit breakers into contracts — auto-pause mechanisms for extreme events',
      'Maintain strategic reserves (cash, inventory, alternative suppliers) for 180-day self-sufficiency'
    ]
  };
}

// ============================================================================
// COMPREHENSIVE INDEX CALCULATOR
// ============================================================================

export async function calculateAllIndices(params: Partial<ReportParameters>): Promise<AllIndicesResult> {
  // Calculate all 23 indices in parallel — full analytical coverage
  const [barna, nvi, cri, cap, agi, vci, ati, esi, isi, osi, tco, pri, rni, sra, idv,
         pvi, rri, crps, srci, mpi, gci, cis, eshock] = await Promise.all([
    calculateBARNA(params),
    calculateNVI(params),
    calculateCRI(params),
    calculateCAP(params),
    calculateAGI(params),
    calculateVCI(params),
    calculateATI(params),
    calculateESI(params),
    calculateISI(params),
    calculateOSI(params),
    calculateTCO(params),
    calculatePRI(params),
    calculateRNI(params),
    calculateSRA(params),
    calculateIDV(params),
    calculatePVI(params),
    calculateRRI(params),
    calculateCRPS(params),
    calculateSRCI(params),
    calculateMPI(params),
    calculateGCI(params),
    calculateCIS(params),
    calculateESHOCK(params)
  ]);

  // Calculate composite scores by category
  const opportunityIndices = [barna, nvi, vci, agi, esi, mpi];
  const riskIndices = [cri, pri, sra, idv, crps, srci, eshock];
  const readinessIndices = [cap, isi, osi, rni];
  const partnershipIndices = [pvi, cis, gci, rri];

  const overallScore = Math.round(
    [barna, nvi, cri, cap, agi, vci, ati, esi, isi, osi, tco, pri, rni, sra, idv,
     pvi, rri, crps, srci, mpi, gci, cis, eshock]
      .reduce((sum, idx) => sum + idx.value, 0) / 23
  );

  const opportunityScore = Math.round(
    opportunityIndices.reduce((sum, idx) => sum + idx.value, 0) / opportunityIndices.length
  );

  const riskAdjustedScore = Math.round(
    (opportunityScore * 0.6 + riskIndices.reduce((sum, idx) => sum + idx.value, 0) / riskIndices.length * 0.4)
  );

  const executionReadiness = Math.round(
    readinessIndices.reduce((sum, idx) => sum + idx.value, 0) / readinessIndices.length
  );

  return {
    barna, nvi, cri, cap, agi, vci, ati, esi, isi, osi, tco, pri, rni, sra, idv,
    pvi, rri, crps, srci, mpi, gci, cis, eshock,
    composite: {
      overallScore,
      riskAdjustedScore,
      opportunityScore,
      executionReadiness
    }
  };
}

export default {
  calculateBARNA,
  calculateNVI,
  calculateCRI,
  calculateCAP,
  calculateAGI,
  calculateVCI,
  calculateATI,
  calculateESI,
  calculateISI,
  calculateOSI,
  calculateTCO,
  calculatePRI,
  calculateRNI,
  calculateSRA,
  calculateIDV,
  calculatePVI,
  calculateRRI,
  calculateCRPS,
  calculateSRCI,
  calculateMPI,
  calculateGCI,
  calculateCIS,
  calculateESHOCK,
  calculateAllIndices
};

