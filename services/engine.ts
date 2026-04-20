import { 
    ReportParameters, 
    MarketShare, 
    MarketOpportunity, 
    DiversificationAnalysis,
    OrchResult,
    RROI_Index,
    SEAM_Blueprint,
    SymbioticPartner,
    SPIResult,
    EthicalCheckResult,
    EthicsStatus,
    EthicsFlag,
    MitigationStep,
    LAIResult,
    CompositeScoreResult,
    RegionProfile
} from '../types';
import { GLOBAL_CITY_DATABASE } from '../constants';
import CompositeScoreService from './CompositeScoreService';
import { selfLearningEngine } from './selfLearningEngine';
import { HistoricalLearningEngine, RegionalCityOpportunityEngine } from './MultiAgentBrainSystem';

// --- 1. MARKET DIVERSIFICATION ENGINE ---

export class MarketDiversificationEngine {
  static calculateHHI(markets: MarketShare[]): number {
    return markets.reduce((acc, m) => acc + Math.pow(m.share, 2), 0);
  }

  static async analyzeConcentration(markets: MarketShare[], params?: ReportParameters): Promise<DiversificationAnalysis> {
    const hhi = this.calculateHHI(markets);
    let riskLevel: DiversificationAnalysis['riskLevel'] = 'Diversified';
    let analysis = "Portfolio is well-balanced.";

    if (hhi > 2500) {
      riskLevel = 'High Concentration';
      analysis = "Significant dependency on primary market detected. Recommendation: Immediate diversification.";
    } else if (hhi > 1500) {
      riskLevel = 'Moderate Concentration';
      analysis = "Portfolio shows moderate concentration. Monitor key market volatility.";
    }

    // LIVE DATA: Get regional city opportunities based on user's region/industry
    const regionalOpportunities = params 
      ? await RegionalCityOpportunityEngine.findEmergingCities(params)
      : [];

    // Convert regional opportunities to market opportunities
    const recommendedMarkets: MarketOpportunity[] = regionalOpportunities.slice(0, 5).map(city => ({
      country: city.country,
      city: city.city,
      growthRate: city.growthPotential / 10,
      easeOfEntry: city.infrastructureReadiness,
      talentAvailability: city.talentAvailability,
      innovationIndex: city.marketAccessScore,
      regulatoryFriction: 100 - city.opportunityScore,
      marketSize: `$${Math.round(city.opportunityScore * 10)}B`,
      opportunityScore: city.opportunityScore,
      recommendedStrategy: city.recommendedStrategy,
      rationale: `${city.competitiveAdvantages.join(', ')}. Historical comparables: ${city.historicalComparables.join(', ')}.`
    }));

    // Fallback to composite-based recommendations if no regional data
    if (recommendedMarkets.length === 0) {
      const fallbackCountries = ['Vietnam', 'Poland', 'Mexico', 'Indonesia', 'Morocco'];
      for (const country of fallbackCountries.slice(0, 3)) {
        const composite = await CompositeScoreService.getScores({ country, region: 'Global' });
        recommendedMarkets.push({
          country,
          growthRate: composite.components.marketAccess / 15,
          easeOfEntry: composite.components.regulatory,
          talentAvailability: composite.components.talent,
          innovationIndex: composite.components.innovation,
          regulatoryFriction: 100 - composite.components.regulatory,
          marketSize: `$${Math.round(composite.inputs.gdpCurrent / 1e9)}B`,
          opportunityScore: composite.overall,
          recommendedStrategy: composite.overall > 70 ? 'Accelerated Entry' : 'Phased Approach',
          rationale: `Composite score ${composite.overall}/100 based on live World Bank data.`
        });
      }
    }

    return {
      hhiScore: hhi,
      riskLevel,
      concentrationAnalysis: analysis,
      recommendedMarkets
    };
  }
}

const clamp = (num: number, min: number, max: number) => Math.min(max, Math.max(min, num));

const percentile = (arr: number[], p: number) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
};

type IndustryArchetype =
  | 'infrastructure'
  | 'finance'
  | 'technology'
  | 'health'
  | 'energy'
  | 'government'
  | 'agriculture'
  | 'climate'
  | 'industrial'
  | 'general';

const INDUSTRY_KEYWORDS: Record<IndustryArchetype, string[]> = {
  infrastructure: ['infrastructure', 'urban', 'housing', 'transport', 'logistics', 'port', 'metro'],
  finance: ['bank', 'finance', 'fund', 'credit', 'fintech', 'capital', 'lending'],
  technology: ['tech', 'digital', 'software', 'ai', 'data', 'platform', 'telecom'],
  health: ['health', 'hospital', 'clinic', 'vaccine', 'pharma', 'medical', 'bio'],
  energy: ['energy', 'power', 'utility', 'grid', 'hydrogen', 'solar', 'oil', 'gas', 'mining'],
  government: ['authority', 'agency', 'ministry', 'department', 'council', 'municipal'],
  agriculture: ['agri', 'rural', 'farm', 'crop', 'cooperative', 'food'],
  climate: ['climate', 'resilience', 'carbon', 'sustainability', 'environment'],
  industrial: ['manufacturing', 'factory', 'industrial', 'supply chain'],
  general: []
};

const resolveIndustryArchetype = (industry?: string): IndustryArchetype => {
  if (!industry) return 'general';
  const normalized = industry.toLowerCase();
  for (const [key, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return key as IndustryArchetype;
    }
  }
  return 'general';
};

type SPIWeightKey = 'ER' | 'SP' | 'PS' | 'PR' | 'EA' | 'CA' | 'UT';

const BASE_SPI_WEIGHTS: Record<SPIWeightKey, number> = {
  ER: 0.25,
  SP: 0.20,
  PS: 0.15,
  PR: 0.15,
  EA: 0.10,
  CA: 0.10,
  UT: 0.05
};

const INDUSTRY_SPI_WEIGHTS: Record<IndustryArchetype, Partial<Record<SPIWeightKey, number>>> = {
  infrastructure: { ER: 0.30, PS: 0.18, PR: 0.18, EA: 0.07 },
  finance: { SP: 0.24, EA: 0.14, UT: 0.08 },
  technology: { SP: 0.24, CA: 0.16, ER: 0.22 },
  health: { EA: 0.16, PS: 0.18, PR: 0.17 },
  energy: { ER: 0.28, PS: 0.18, EA: 0.12 },
  government: { PS: 0.22, EA: 0.15, UT: 0.08 },
  agriculture: { ER: 0.28, CA: 0.14, PS: 0.17 },
  climate: { ER: 0.26, EA: 0.16, CA: 0.14 },
  industrial: { ER: 0.30, PR: 0.18, CA: 0.12 },
  general: {}
};

const normalizeWeightProfile = (weights: Record<SPIWeightKey, number>): Record<SPIWeightKey, number> => {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return { ...BASE_SPI_WEIGHTS };
  }
  return Object.fromEntries(
    Object.entries(weights).map(([key, value]) => [key, value / total])
  ) as Record<SPIWeightKey, number>;
};

const buildContextualSPIWeights = (params: ReportParameters, composite: CompositeScoreResult): Record<SPIWeightKey, number> => {
  const learned = selfLearningEngine.getSPIWeights?.();
  let weights: Record<SPIWeightKey, number> = {
    ER: learned?.ER ?? BASE_SPI_WEIGHTS.ER,
    SP: learned?.SP ?? BASE_SPI_WEIGHTS.SP,
    PS: learned?.PS ?? BASE_SPI_WEIGHTS.PS,
    PR: learned?.PR ?? BASE_SPI_WEIGHTS.PR,
    EA: learned?.EA ?? BASE_SPI_WEIGHTS.EA,
    CA: learned?.CA ?? BASE_SPI_WEIGHTS.CA,
    UT: learned?.UT ?? BASE_SPI_WEIGHTS.UT,
  };

  const archetype = resolveIndustryArchetype(params.industry?.[0]);
  const industryOverrides = INDUSTRY_SPI_WEIGHTS[archetype];
  if (industryOverrides) {
    weights = { ...weights, ...industryOverrides };
  }

  if (params.riskTolerance === 'low' || params.riskTolerance === 'very_low') {
    weights.PS += 0.03;
    weights.EA += 0.03;
  } else if (params.riskTolerance === 'high' || params.riskTolerance === 'aggressive') {
    weights.ER += 0.02;
    weights.CA += 0.02;
  }

  if (composite.components.politicalStability < 50) {
    weights.PS += 0.04;
    weights.PR += 0.01;
  }

  if (composite.components.riskFactors > 60) {
    weights.EA += 0.03;
  }

  if (params.intentTags?.includes('sanctions')) {
    weights.EA += 0.02;
  }

  return normalizeWeightProfile(weights);
};

interface SectorFrictionProfile {
  baseMonths: number;
  minMonths: number;
  maxMonths: number;
  basePermitMonths: number;
  maxPermitMonths: number;
  permitSensitivity: number;
  acceleration: number;
  readinessWeight: number;
  complianceSensitivity: number;
  weights: { regulatory: number; permit: number; partner: number; digital: number };
}

const SECTOR_FRICTION_PROFILES: Record<IndustryArchetype, SectorFrictionProfile> = {
  infrastructure: {
    baseMonths: 22,
    minMonths: 8,
    maxMonths: 48,
    basePermitMonths: 16,
    maxPermitMonths: 36,
    permitSensitivity: 16,
    acceleration: 18,
    readinessWeight: 0.6,
    complianceSensitivity: 0.8,
    weights: { regulatory: 0.35, permit: 0.3, partner: 0.2, digital: 0.15 }
  },
  finance: {
    baseMonths: 14,
    minMonths: 6,
    maxMonths: 30,
    basePermitMonths: 10,
    maxPermitMonths: 24,
    permitSensitivity: 10,
    acceleration: 22,
    readinessWeight: 0.65,
    complianceSensitivity: 0.9,
    weights: { regulatory: 0.4, permit: 0.2, partner: 0.2, digital: 0.2 }
  },
  technology: {
    baseMonths: 12,
    minMonths: 5,
    maxMonths: 28,
    basePermitMonths: 8,
    maxPermitMonths: 20,
    permitSensitivity: 8,
    acceleration: 24,
    readinessWeight: 0.7,
    complianceSensitivity: 0.6,
    weights: { regulatory: 0.25, permit: 0.2, partner: 0.25, digital: 0.3 }
  },
  health: {
    baseMonths: 26,
    minMonths: 10,
    maxMonths: 54,
    basePermitMonths: 20,
    maxPermitMonths: 40,
    permitSensitivity: 18,
    acceleration: 14,
    readinessWeight: 0.55,
    complianceSensitivity: 0.95,
    weights: { regulatory: 0.4, permit: 0.3, partner: 0.15, digital: 0.15 }
  },
  energy: {
    baseMonths: 24,
    minMonths: 9,
    maxMonths: 50,
    basePermitMonths: 18,
    maxPermitMonths: 38,
    permitSensitivity: 16,
    acceleration: 16,
    readinessWeight: 0.58,
    complianceSensitivity: 0.85,
    weights: { regulatory: 0.35, permit: 0.3, partner: 0.2, digital: 0.15 }
  },
  government: {
    baseMonths: 20,
    minMonths: 8,
    maxMonths: 44,
    basePermitMonths: 18,
    maxPermitMonths: 36,
    permitSensitivity: 14,
    acceleration: 16,
    readinessWeight: 0.6,
    complianceSensitivity: 0.85,
    weights: { regulatory: 0.38, permit: 0.3, partner: 0.17, digital: 0.15 }
  },
  agriculture: {
    baseMonths: 18,
    minMonths: 7,
    maxMonths: 36,
    basePermitMonths: 12,
    maxPermitMonths: 28,
    permitSensitivity: 12,
    acceleration: 18,
    readinessWeight: 0.6,
    complianceSensitivity: 0.7,
    weights: { regulatory: 0.3, permit: 0.3, partner: 0.25, digital: 0.15 }
  },
  climate: {
    baseMonths: 20,
    minMonths: 8,
    maxMonths: 42,
    basePermitMonths: 14,
    maxPermitMonths: 34,
    permitSensitivity: 14,
    acceleration: 18,
    readinessWeight: 0.62,
    complianceSensitivity: 0.8,
    weights: { regulatory: 0.32, permit: 0.28, partner: 0.2, digital: 0.2 }
  },
  industrial: {
    baseMonths: 21,
    minMonths: 8,
    maxMonths: 45,
    basePermitMonths: 15,
    maxPermitMonths: 32,
    permitSensitivity: 15,
    acceleration: 17,
    readinessWeight: 0.6,
    complianceSensitivity: 0.78,
    weights: { regulatory: 0.33, permit: 0.27, partner: 0.23, digital: 0.17 }
  },
  general: {
    baseMonths: 18,
    minMonths: 6,
    maxMonths: 36,
    basePermitMonths: 12,
    maxPermitMonths: 30,
    permitSensitivity: 12,
    acceleration: 18,
    readinessWeight: 0.62,
    complianceSensitivity: 0.75,
    weights: { regulatory: 0.32, permit: 0.28, partner: 0.22, digital: 0.18 }
  }
};

interface SectorCaptureProfile {
  marketSizeMultiplier: number;
  baseCapture: number;
  minCapture: number;
  maxCapture: number;
  elasticity: number;
  horizonYears: number;
  discountRate: number;
  jobMultiplier: number;
  laborCostMultiplier: number;
  readinessFloor: number;
  readinessDivisor: number;
  minJobCost: number;
}

const SECTOR_CAPTURE_PROFILES: Record<IndustryArchetype, SectorCaptureProfile> = {
  infrastructure: {
    marketSizeMultiplier: 0.11,
    baseCapture: 0.0035,
    minCapture: 0.002,
    maxCapture: 0.012,
    elasticity: 0.0005,
    horizonYears: 7,
    discountRate: 0.07,
    jobMultiplier: 2.4,
    laborCostMultiplier: 1.9,
    readinessFloor: 0.7,
    readinessDivisor: 135,
    minJobCost: 45000
  },
  finance: {
    marketSizeMultiplier: 0.09,
    baseCapture: 0.0045,
    minCapture: 0.0025,
    maxCapture: 0.015,
    elasticity: 0.0007,
    horizonYears: 5,
    discountRate: 0.06,
    jobMultiplier: 1.8,
    laborCostMultiplier: 2.2,
    readinessFloor: 0.75,
    readinessDivisor: 125,
    minJobCost: 60000
  },
  technology: {
    marketSizeMultiplier: 0.1,
    baseCapture: 0.0055,
    minCapture: 0.003,
    maxCapture: 0.018,
    elasticity: 0.0009,
    horizonYears: 5,
    discountRate: 0.065,
    jobMultiplier: 2.0,
    laborCostMultiplier: 1.8,
    readinessFloor: 0.78,
    readinessDivisor: 120,
    minJobCost: 50000
  },
  health: {
    marketSizeMultiplier: 0.12,
    baseCapture: 0.004,
    minCapture: 0.002,
    maxCapture: 0.013,
    elasticity: 0.0006,
    horizonYears: 8,
    discountRate: 0.065,
    jobMultiplier: 2.6,
    laborCostMultiplier: 2.0,
    readinessFloor: 0.72,
    readinessDivisor: 135,
    minJobCost: 55000
  },
  energy: {
    marketSizeMultiplier: 0.13,
    baseCapture: 0.003,
    minCapture: 0.0015,
    maxCapture: 0.01,
    elasticity: 0.0005,
    horizonYears: 9,
    discountRate: 0.075,
    jobMultiplier: 2.1,
    laborCostMultiplier: 2.1,
    readinessFloor: 0.7,
    readinessDivisor: 140,
    minJobCost: 60000
  },
  government: {
    marketSizeMultiplier: 0.1,
    baseCapture: 0.0035,
    minCapture: 0.002,
    maxCapture: 0.011,
    elasticity: 0.0005,
    horizonYears: 6,
    discountRate: 0.065,
    jobMultiplier: 2.3,
    laborCostMultiplier: 2.0,
    readinessFloor: 0.72,
    readinessDivisor: 135,
    minJobCost: 52000
  },
  agriculture: {
    marketSizeMultiplier: 0.08,
    baseCapture: 0.0035,
    minCapture: 0.002,
    maxCapture: 0.011,
    elasticity: 0.0006,
    horizonYears: 6,
    discountRate: 0.065,
    jobMultiplier: 2.8,
    laborCostMultiplier: 1.5,
    readinessFloor: 0.68,
    readinessDivisor: 140,
    minJobCost: 35000
  },
  climate: {
    marketSizeMultiplier: 0.11,
    baseCapture: 0.004,
    minCapture: 0.002,
    maxCapture: 0.013,
    elasticity: 0.0006,
    horizonYears: 7,
    discountRate: 0.07,
    jobMultiplier: 2.5,
    laborCostMultiplier: 1.8,
    readinessFloor: 0.72,
    readinessDivisor: 130,
    minJobCost: 42000
  },
  industrial: {
    marketSizeMultiplier: 0.12,
    baseCapture: 0.0038,
    minCapture: 0.002,
    maxCapture: 0.012,
    elasticity: 0.0006,
    horizonYears: 7,
    discountRate: 0.07,
    jobMultiplier: 2.2,
    laborCostMultiplier: 1.9,
    readinessFloor: 0.72,
    readinessDivisor: 135,
    minJobCost: 48000
  },
  general: {
    marketSizeMultiplier: 0.1,
    baseCapture: 0.0038,
    minCapture: 0.002,
    maxCapture: 0.012,
    elasticity: 0.0006,
    horizonYears: 6,
    discountRate: 0.068,
    jobMultiplier: 2.2,
    laborCostMultiplier: 1.9,
    readinessFloor: 0.72,
    readinessDivisor: 135,
    minJobCost: 45000
  }
};

const computeIVAS = (regionProfile: RegionProfile, composite: CompositeScoreResult) => {
  const archetype = resolveIndustryArchetype(regionProfile.sectorHint);
  const profile = SECTOR_FRICTION_PROFILES[archetype] ?? SECTOR_FRICTION_PROFILES.general;
  const readiness = composite.overall;
  const regulatoryFriction = clamp(
    (100 - composite.components.regulatory) / 120 +
    (regionProfile.regulatoryComplexity ?? 50) / 180,
    0.1,
    0.85
  );

  const permitBacklog = regionProfile.permitBacklogMonths ?? profile.basePermitMonths;
  const permitFriction = clamp(permitBacklog / profile.maxPermitMonths, 0.1, 0.9);

  const partnerSignal = clamp(
    (
      composite.components.marketAccess * 0.4 +
      composite.components.supplyChain * 0.25 +
      composite.components.talent * 0.2 +
      (regionProfile.talentSignal ?? 70)
    ) / 145,
    0.25,
    0.95
  );

  const digitalDrag = 1 - composite.components.digitalReadiness / 100;

  const friction = clamp(
    regulatoryFriction * profile.weights.regulatory +
    permitFriction * profile.weights.permit +
    (1 - partnerSignal) * profile.weights.partner +
    digitalDrag * profile.weights.digital,
    0.12,
    0.9
  );

  const complianceDrag = clamp(regulatoryFriction * profile.complianceSensitivity, 0.05, 0.6);

  const ivasScore = clamp(
    Math.round(readiness * profile.readinessWeight + partnerSignal * 45 - friction * 35),
    25,
    99
  );

  const baseMonths = clamp(
    profile.baseMonths +
      permitFriction * profile.permitSensitivity +
      complianceDrag * 12 -
      (readiness / 120) * profile.acceleration,
    profile.minMonths,
    profile.maxMonths
  );

  const p50 = Math.round(baseMonths);
  const p10 = Math.max(profile.minMonths, Math.round(baseMonths * 0.85));
  const p90 = Math.min(profile.maxMonths, Math.round(baseMonths * 1.3));

  const frictionLabel = friction > 0.55 ? 'High' : friction > 0.35 ? 'Medium' : 'Low';
  const opportunityLabel = partnerSignal > 0.75 ? 'High' : partnerSignal > 0.55 ? 'Medium' : 'Emerging';
  const complianceLabel = complianceDrag > 0.35 ? 'Elevated' : complianceDrag > 0.2 ? 'Managed' : 'Controlled';

  return {
    ivasScore,
    activationMonths: p50,
    breakdown: {
      activationFriction: frictionLabel,
      opportunityQuantum: opportunityLabel,
      complianceFriction: complianceLabel
    },
    p10Months: p10,
    p50Months: p50,
    p90Months: p90
  };
};

const computeSCF = (composite: CompositeScoreResult, sectorHint?: string) => {
  const archetype = resolveIndustryArchetype(sectorHint);
  const profile = SECTOR_CAPTURE_PROFILES[archetype] ?? SECTOR_CAPTURE_PROFILES.general;

  const marketSizeUSD = composite.inputs.gdpCurrent * profile.marketSizeMultiplier;
  const captureRate = clamp(
    profile.baseCapture +
      (composite.components.marketAccess / 100) * profile.elasticity +
      (composite.components.innovation / 1200),
    profile.minCapture,
    profile.maxCapture
  );

  const readinessMultiplier = profile.readinessFloor + composite.overall / profile.readinessDivisor;
  const annualImpact = marketSizeUSD * captureRate * readinessMultiplier;
  const discountRate = profile.discountRate + Math.max(0, (100 - composite.components.politicalStability) / 4000);
  const horizonYears = profile.horizonYears;
  const annuityFactor = discountRate === 0
    ? horizonYears
    : (1 - Math.pow(1 + discountRate, -horizonYears)) / discountRate;
  const totalImpact = annualImpact * annuityFactor;

  const jobCost = Math.max(composite.inputs.gdpPerCapita * profile.laborCostMultiplier, profile.minJobCost);
  const directJobs = totalImpact / jobCost;
  const volatility = (100 - composite.components.politicalStability) / 100;

  const impactP10 = totalImpact * (1 - 0.3 * volatility);
  const impactP90 = totalImpact * (1 + 0.4 * volatility);

  return {
    totalEconomicImpactUSD: totalImpact,
    directJobs: Math.round(directJobs),
    indirectJobs: Math.round(directJobs * profile.jobMultiplier),
    annualizedImpact: annualImpact,
    impactP10,
    impactP50: totalImpact,
    impactP90,
    jobsP10: Math.round(directJobs * (1 - 0.25 * volatility)),
    jobsP50: Math.round(directJobs),
    jobsP90: Math.round(directJobs * (1 + 0.35 * volatility))
  };
};

export const runOpportunityOrchestration = async (regionProfile: RegionProfile): Promise<OrchResult> => {

    const composite = await CompositeScoreService.getScores({ country: regionProfile.country, region: regionProfile.name });
    const { components, overall } = composite;
    const ivas = computeIVAS(regionProfile, composite);
    const scf = computeSCF(composite, regionProfile.sectorHint);

    const laiScore = Math.round(overall);
    const laiBand: LAIResult['band'] = laiScore >= 75 ? 'high' : laiScore >= 55 ? 'medium' : laiScore >= 35 ? 'low' : 'critical';
    const laiDrivers = [
      `Infrastructure ${Math.round(components.infrastructure)}/100`,
      `Market access ${Math.round(components.marketAccess)}/100`,
      `Talent ${Math.round(components.talent)}/100`
    ];
    const laiPressurePoints = laiScore < 55
      ? ['Upgrade logistics throughput and workforce readiness before scaling.']
      : [];
    const laiRecommendation = laiScore >= 70
      ? 'Proceed with hub activation; maintain quarterly capacity audits.'
      : 'Address infrastructure and talent gaps prior to hub-scale activation.';

    const lai: LAIResult = {
      title: `${regionProfile.country || 'Target Region'} Strategic Hub`,
      description: `Latent asset identified: underutilized capacity in ${regionProfile.rawFeatures?.[0]?.name || 'logistics and infrastructure'}.`,
      components: ["Infrastructure", "Market Access", "Talent"],
      synergyTag: overall > 70 ? 'High Synergy' : 'Moderate Synergy',
      score: laiScore,
      band: laiBand,
      drivers: laiDrivers,
      pressurePoints: laiPressurePoints,
      recommendation: laiRecommendation,
      dataSources: composite.dataSources,
      advisoryBias: 'aligned',
      gapScore: laiScore
    };

    return {
        details: {
            lais: [lai],
            ivas,
            scf,
            provenance: [
                { metric: 'Composite Scores', source: composite.dataSources.join(', '), freshness: 'live' },
                { metric: 'IVAS', source: 'Composite readiness + deterministic friction model', freshness: 'live' },
                { metric: 'SCF', source: 'Market size capture model (deterministic)', freshness: 'live' }
            ]
        },
        nsilOutput: `
<nsil:analysis_report mode="Orchestrated" version="6.0">
  <executive_summary>
    <overall_score>${overall}</overall_score>
    <strategic_outlook>Composite score suggests ${(overall > 75 ? 'rapid' : overall > 60 ? 'steady' : 'guarded')} activation potential.</strategic_outlook>
    <key_findings>Infrastructure ${components.infrastructure}, Talent ${components.talent}, Market Access ${components.marketAccess}.</key_findings>
  </executive_summary>
  <match_score value="${ivas.ivasScore}" confidence="High">
    <rationale>IVAS velocity indicates P50 activation in ${ivas.activationMonths} months (P10 ${ivas.p10Months}, P90 ${ivas.p90Months}).</rationale>
  </match_score>
  <scf>
    <total_impact>${Math.round(scf.totalEconomicImpactUSD)}</total_impact>
    <direct_jobs>${scf.directJobs}</direct_jobs>
    <indirect_jobs>${scf.indirectJobs}</indirect_jobs>
    <annualized>${Math.round(scf.annualizedImpact)}</annualized>
        <impact_p10>${Math.round(scf.impactP10 || 0)}</impact_p10>
        <impact_p50>${Math.round(scf.impactP50 || scf.totalEconomicImpactUSD)}</impact_p50>
        <impact_p90>${Math.round(scf.impactP90 || scf.totalEconomicImpactUSD)}</impact_p90>
        <jobs_p10>${Math.round(scf.jobsP10 || scf.directJobs)}</jobs_p10>
        <jobs_p50>${Math.round(scf.jobsP50 || scf.directJobs)}</jobs_p50>
        <jobs_p90>${Math.round(scf.jobsP90 || scf.directJobs)}</jobs_p90>
  </scf>
</nsil:analysis_report>`
    };
};
// --- 3. RROI ENGINE ---

// Helper to generate a deterministic number from string
const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const pseudoRandom = (seed: string, min = 0, max = 1): number => {
    const normalized = (hashString(seed) % 10_000) / 10_000;
    return min + normalized * (max - min);
};

export const generateRROI = async (params: ReportParameters): Promise<RROI_Index> => {
    const composite = await CompositeScoreService.getScores(params);
    const { components, overall } = composite;

    const infra = components.infrastructure;
    const talent = components.talent;
    const regulatory = components.regulatory;
    const market = components.marketAccess;

    const summary = `RROI for ${params.country} (${params.region}) reflects ${overall > 75 ? 'strong' : overall > 60 ? 'balanced' : 'guarded'} readiness across infrastructure ${Math.round(infra)}, talent ${Math.round(talent)}, regulatory ${Math.round(regulatory)}, and market access ${Math.round(market)} using live data feeds (${composite.dataSources.join(', ')}).`;

    return {
        overallScore: overall,
        summary,
        components: {
            infrastructure: { name: "Infrastructure Readiness", score: Math.round(infra), analysis: "Composite of logistics, utilities, and digital throughput." },
            talent: { name: "Talent Availability", score: Math.round(talent), analysis: "Skill depth, education signals, and unemployment corridor." },
            regulatory: { name: "Regulatory Ease", score: Math.round(regulatory), analysis: "Permitting efficiency plus ease-of-business differentials." },
            market: { name: "Market Access", score: Math.round(market), analysis: "Trade balance posture, FDI inflows, and regional agreements." }
        }
    };
};

// --- 4. SEAM ENGINE ---

export const generateSEAM = async (params: ReportParameters): Promise<SEAM_Blueprint> => {
    const composite = await CompositeScoreService.getScores(params);
    const { components, overall } = composite;

    const makeSynergy = (label: string, driver: number) => clamp(
        Math.round(0.45 * driver + 0.45 * overall + pseudoRandom(`${params.country || 'global'}-${label}`) * 10),
        50,
        99
    );

    const partnerBase = [
        { name: `National ${params.industry[0] || 'Trade'} Board`, role: "Regulator / Enabler", synergy: makeSynergy('regulator', components.regulatory) },
        { name: "Regional Logistics Alliance", role: "Supply Chain", synergy: makeSynergy('logistics', components.supplyChain) },
        { name: `${params.country || 'Target'} Tech Institute`, role: "Talent Pipeline", synergy: makeSynergy('talent', components.talent) },
        { name: "Global Chamber of Commerce", role: "Network Access", synergy: makeSynergy('network', components.marketAccess) }
    ];

    const gapSignals = [
        { label: 'Regulatory harmonization', score: components.regulatory },
        { label: 'Digital infrastructure hardening', score: components.digitalReadiness },
        { label: 'Supply chain observability', score: components.supplyChain },
        { label: 'Specialized talent pathways', score: components.talent }
    ];

    const gaps = gapSignals
        .filter(signal => signal.score < 75)
        .map(signal => `${signal.label} (${Math.round(signal.score)}/100)`);

    if (gaps.length === 0) {
        gaps.push('Codify advanced autonomy guardrails', 'Stand up second-source supplier guilds');
    }

    const supplySignal = (components.supplyChain + components.marketAccess) / 2;
    const score = clamp(Math.round(0.6 * overall + 0.4 * supplySignal), 55, 99);

    return {
        score,
        ecosystemHealth: score > 85 ? "Thriving" : score > 70 ? "Emerging" : "Nascent",
        partners: partnerBase,
        gaps
    };
};

// --- 5. SYMBIOTIC MATCHING ENGINE ---

export const generateSymbioticMatches = async (params: ReportParameters): Promise<SymbioticPartner[]> => {
    // LIVE DATA: Use composite scores and historical patterns for matching
    const composite = await CompositeScoreService.getScores({ country: params.country, region: params.region });
    const historicalPatterns = await HistoricalLearningEngine.findRelevantPatterns(params);
    
    const country = params.country || "Target Market";
    const industry = params.industry?.[0] || "General";
    
    // Generate partner matches based on live data and historical patterns
    const partners: SymbioticPartner[] = [];
    
    // Government/Development Partner
    if (composite.components.regulatory > 50) {
      partners.push({
        entityName: `${country} Investment Promotion Agency`,
        location: country,
        entityType: "Government Agency",
        symbiosisScore: Math.round(55 + composite.components.regulatory * 0.4),
        asymmetryAnalysis: `Strong regulatory environment (${Math.round(composite.components.regulatory)}/100) enables efficient partnership structuring.`,
        mutualBenefit: "Access to incentive programs and expedited permitting in exchange for job creation commitments.",
        riskFactors: historicalPatterns.filter(p => p.outcome === 'failure').map(p => p.lessons[0]).slice(0, 2)
      });
    }
    
    // Industry/Trade Partner
    if (composite.components.marketAccess > 50) {
      partners.push({
        entityName: `${country} ${industry} Association`,
        location: params.region || "Regional Capital",
        entityType: "Industry Body",
        symbiosisScore: Math.round(60 + composite.components.marketAccess * 0.35),
        asymmetryAnalysis: `Market access score of ${Math.round(composite.components.marketAccess)}/100 indicates strong distribution networks.`,
        mutualBenefit: "Local market intelligence and distribution channels in exchange for technology transfer.",
        riskFactors: ["Cultural adaptation timeline", "Existing competitor relationships"]
      });
    }
    
    // Talent/Education Partner
    if (composite.components.talent > 45) {
      partners.push({
        entityName: `${country} Technical University Consortium`,
        location: country,
        entityType: "Academic Institution",
        symbiosisScore: Math.round(50 + composite.components.talent * 0.45),
        asymmetryAnalysis: `Talent availability of ${Math.round(composite.components.talent)}/100 with growing technical education infrastructure.`,
        mutualBenefit: "Access to trained workforce pipeline in exchange for curriculum input and internship programs.",
        riskFactors: ["Skill gap in specialized areas", "Training timeline"]
      });
    }
    
    // Infrastructure/Logistics Partner
    if (composite.components.infrastructure > 40) {
      partners.push({
        entityName: `${params.region || 'Regional'} Logistics Alliance`,
        location: "Logistics Hub",
        entityType: "Service Provider",
        symbiosisScore: Math.round(45 + composite.components.infrastructure * 0.5),
        asymmetryAnalysis: `Infrastructure readiness at ${Math.round(composite.components.infrastructure)}/100 with ${composite.components.supplyChain > 60 ? 'established' : 'developing'} supply chain networks.`,
        mutualBenefit: "Physical distribution reach and warehousing in exchange for digital logistics optimization.",
        riskFactors: ["Integration complexity", "Capacity constraints during peak demand"]
      });
    }
    
    // Add historical success pattern recommendations
    const successPatterns = historicalPatterns.filter(p => p.outcome === 'success');
    if (successPatterns.length > 0 && partners.length < 5) {
      partners.push({
        entityName: "Historical Success Model Partner",
        location: successPatterns[0].region,
        entityType: "Strategic Reference",
        symbiosisScore: Math.round(successPatterns[0].applicabilityScore * 100),
        asymmetryAnalysis: `Based on ${successPatterns[0].era} ${successPatterns[0].region} success pattern.`,
        mutualBenefit: successPatterns[0].lessons.join('; '),
        riskFactors: successPatterns[0].keyFactors.slice(0, 2)
      });
    }
    
    return partners.sort((a, b) => b.symbiosisScore - a.symbiosisScore);
};

// --- 6. ETHICS & COMPLIANCE ENGINE ---

export const runEthicalSafeguards = async (params: ReportParameters): Promise<EthicalCheckResult> => {
    const flags: EthicsFlag[] = [];
    let score = 100;
    let status: EthicsStatus = 'PASS';

    // LIVE DATA: Get composite scores for country risk assessment
    const composite = await CompositeScoreService.getScores({ country: params.country, region: params.region });

    // Rule 1: Sanctions Check - Real OFAC/UN sanctioned jurisdictions
    const sanctionedJurisdictions = [
      'North Korea', 'DPRK', 'Iran', 'Syria', 'Cuba', 'Crimea',
      'Donetsk', 'Luhansk', 'Belarus', 'Russia', 'Myanmar', 'Venezuela'
    ];
    const isSanctioned = sanctionedJurisdictions.some(e => 
      (params.country || '').toLowerCase().includes(e.toLowerCase()) || 
      (params.problemStatement || '').toLowerCase().includes(e.toLowerCase())
    );
    
    if (isSanctioned) {
        flags.push({ 
          name: 'Sanctions Match', 
          flag: 'BLOCK', 
          reason: 'Jurisdiction appears on OFAC/UN/EU consolidated sanctions list. Transaction prohibited under international law.', 
          evidence: ['OFAC SDN List', 'UN Security Council Resolutions', 'EU Consolidated Sanctions'] 
        });
        score = 0;
        status = 'BLOCK';
    }

    // Rule 2: High Risk Industry - Based on FATF guidance
    const highRiskIndustries = ['Defense', 'Extraction', 'Mining', 'Gambling', 'Weapons', 'Tobacco', 'Adult Entertainment'];
    if (params.industry.some(i => highRiskIndustries.some(hr => i.toLowerCase().includes(hr.toLowerCase())))) {
        flags.push({ 
          name: 'High-Risk Industry', 
          flag: 'CAUTION', 
          reason: 'Sector classified as high-risk under FATF AML/CFT guidance. Enhanced due diligence (EDD) required.', 
          evidence: ['FATF Risk Assessment', 'Sector Analysis'] 
        });
        score -= 20;
        if (status !== 'BLOCK') status = 'CAUTION';
    }

    // Rule 3: CPI Check - Use live political stability score as proxy
    const politicalStabilityScore = composite.components.politicalStability;
    if (politicalStabilityScore < 40) {
        flags.push({ 
          name: 'Corruption Risk Elevated', 
          flag: 'CAUTION', 
          reason: `Political stability score of ${Math.round(politicalStabilityScore)}/100 indicates elevated corruption/governance risk.`, 
          evidence: ['World Bank Governance Indicators', 'Transparency International CPI'] 
        });
        score -= 15;
        if (status !== 'BLOCK') status = 'CAUTION';
    } else if (politicalStabilityScore < 55) {
        flags.push({ 
          name: 'Governance Monitoring Required', 
          flag: 'CAUTION', 
          reason: `Moderate governance score (${Math.round(politicalStabilityScore)}/100) - recommend ongoing monitoring.`, 
          evidence: ['World Bank Governance Indicators'] 
        });
        score -= 8;
        if (status !== 'BLOCK') status = 'CAUTION';
    }

    // Rule 4: Regulatory Environment Check
    const regulatoryScore = composite.components.regulatory;
    if (regulatoryScore < 45) {
        flags.push({ 
          name: 'Regulatory Opacity', 
          flag: 'CAUTION', 
          reason: `Low regulatory transparency score (${Math.round(regulatoryScore)}/100) may complicate compliance.`, 
          evidence: ['World Bank Ease of Business', 'Regulatory Quality Index'] 
        });
        score -= 10;
        if (status !== 'BLOCK') status = 'CAUTION';
    }

    // Rule 5: Data Completeness (Transparency)
    if (!params.organizationName || params.organizationName.length < 3) {
        flags.push({ 
          name: 'Insufficient Entity Identification', 
          flag: 'CAUTION', 
          reason: 'Entity name not provided or insufficient for KYC/AML screening.', 
          evidence: ['Input Validation'] 
        });
        score -= 10;
        if (status !== 'BLOCK') status = 'CAUTION';
    }

    // Rule 6: ESG/Environmental Check
    if (params.industry.some(i => ['Oil', 'Gas', 'Coal', 'Extraction', 'Mining'].some(e => i.toLowerCase().includes(e.toLowerCase())))) {
        flags.push({ 
          name: 'ESG Disclosure Required', 
          flag: 'CAUTION', 
          reason: 'Sector has elevated environmental impact - ESG assessment and climate disclosure recommended.', 
          evidence: ['TCFD Framework', 'GRI Standards'] 
        });
        score -= 5;
        if (status !== 'BLOCK') status = 'CAUTION';
    }

    const mitigation: MitigationStep[] = [];
    if (status === 'BLOCK') {
        mitigation.push({ step: "Immediate Halt", detail: "Transaction cannot proceed under current sanctions regulations." });
        mitigation.push({ step: "Legal Review", detail: "Escalate to General Counsel for OFAC/sanctions validation." });
        mitigation.push({ step: "License Application", detail: "If legitimate purpose exists, consider OFAC specific license application." });
    } else if (status === 'CAUTION') {
        mitigation.push({ step: "Enhanced Due Diligence", detail: "Trigger Level-3 forensic audit on local partners and beneficial owners." });
        mitigation.push({ step: "Anti-Bribery Certification", detail: "Require ISO 37001 anti-bribery certification from counterparties." });
        mitigation.push({ step: "Ongoing Monitoring", detail: "Implement continuous sanctions screening and adverse media monitoring." });
        if (flags.some(f => f.name.includes('ESG'))) {
          mitigation.push({ step: "ESG Assessment", detail: "Commission independent ESG impact assessment before proceeding." });
        }
    } else {
        mitigation.push({ step: "Standard Compliance", detail: "Proceed with standard quarterly compliance reviews and annual audits." });
    }

    return {
        passed: status !== 'BLOCK',
        score: Math.max(0, score),
        overallFlag: status,
        flags: flags,
        mitigation: mitigation,
        timestamp: new Date().toISOString(),
        version: "5.0.0-live"
    };
};

// --- 7. SUCCESS PROBABILITY INDEX (SPI) ENGINE ---

const calculateTransparencyScore = (params: ReportParameters): number => {
    let score = 0;
    if (params.organizationName) score += 20;
    if (params.strategicIntent) score += 20;
    if (params.problemStatement && params.problemStatement.length > 20) score += 20;
    if (params.industry.length > 0) score += 20;
    if (params.calibration?.constraints?.budgetCap) score += 20;
    return score;
};

const computeInteractionPenalty = (scores: Record<SPIWeightKey, number>): number => {
  let penalty = 0;
  if (scores.PS < 50 && scores.PR < 60) penalty += 0.08;
  if (scores.EA < 55 && scores.SP < 60) penalty += 0.05;
  if (scores.ER < 55 && scores.CA < 55) penalty += 0.04;
  if (scores.PS < 45 && scores.EA < 50) penalty += 0.05;
  return clamp(1 - Math.min(penalty, 0.25), 0.7, 1);
};

const getRegionRiskScore = (region: string, country: string): number => {
    // Simplified lookup - in prod this would query a risk DB
    const riskMap: Record<string, number> = {
        'Singapore': 95, 'United Kingdom': 88, 'United States': 90, 
        'Germany': 92, 'Vietnam': 65, 'Indonesia': 60, 
        'Brazil': 55, 'Nigeria': 40
    };
    return riskMap[country] || (region === 'Asia-Pacific' ? 70 : 60);
};


export const calculateSPI = async (params: ReportParameters): Promise<SPIResult> => {
    const composite = await CompositeScoreService.getScores(params);
    const { components, overall } = composite;

    // Get historical patterns for context-aware scoring
    const historicalPatterns = await HistoricalLearningEngine.findRelevantPatterns(params);
    const hasSuccessPatterns = historicalPatterns.filter(p => p.outcome === 'success').length > 0;
    const historicalBonus = hasSuccessPatterns ? 5 : 0;

    const ER = Math.round(
        components.infrastructure * 0.35 +
        components.talent * 0.35 +
        components.marketAccess * 0.2 +
        components.costEfficiency * 0.1
    );

    const hasTech = params.industry.includes('Technology');
    const regionNeedsTech = params.region === 'Asia-Pacific' || params.region === 'Middle East';
    const symbioticSignal = (components.marketAccess + components.innovation + components.supplyChain) / 3;
    const SP = clamp(
        Math.round(symbioticSignal + (hasTech && regionNeedsTech ? 8 : 0) + historicalBonus),
        45,
        99
    );

    const PS = Math.round(
        0.7 * components.politicalStability +
        0.3 * getRegionRiskScore(params.region, params.country)
    );

    const dueDiligenceBase = params.dueDiligenceDepth === 'Deep' ? 95 : params.dueDiligenceDepth === 'Standard' ? 80 : 65;
    const reliabilitySignal = (components.regulatory + components.supplyChain) / 2;
    const PR = clamp(Math.round(0.5 * dueDiligenceBase + 0.5 * reliabilitySignal), 45, 98);

    // Use async ethics check with live data
    const ethicsResult = await runEthicalSafeguards(params);
    const EA = ethicsResult.score;

    const frictionSignal = 100 - components.riskFactors;
    const CA = clamp(Math.round(0.5 * overall + 0.5 * frictionSignal + historicalBonus), 45, 98);

    const UT = calculateTransparencyScore(params);

    const weights = buildContextualSPIWeights(params, composite);
    const weightedSPI = (
      (ER * weights.ER) +
      (SP * weights.SP) +
      (PS * weights.PS) +
      (PR * weights.PR) +
      (EA * weights.EA) +
      (CA * weights.CA) +
      (UT * weights.UT)
    );

    const interactionPenalty = computeInteractionPenalty({ ER, SP, PS, PR, EA, CA, UT });
    const rawSPI = weightedSPI * interactionPenalty;

    const ciDelta = 12 * (1 - (UT / 100));

    // Add historical context to breakdown
    const breakdown = [
        { label: 'Economic Readiness', value: Math.round(ER) },
        { label: 'Symbiotic Fit', value: Math.round(SP) },
        { label: 'Political Stability', value: Math.round(PS) },
        { label: 'Partner Reliability', value: Math.round(PR) },
        { label: 'Ethical Alignment', value: Math.round(EA) },
        { label: 'Activation Velocity', value: Math.round(CA) },
        { label: 'Transparency', value: Math.round(UT) }
    ];

    breakdown.push({ label: 'Interaction Penalty', value: Math.round(interactionPenalty * 100) });

    // Add historical insight if available
    if (historicalPatterns.length > 0) {
      const topPattern = historicalPatterns[0];
      breakdown.push({ 
        label: `Historical Reference (${topPattern.era})`, 
        value: Math.round(topPattern.applicabilityScore * 100) 
      });
    }

    return {
        spi: Math.round(rawSPI),
        ciLow: Math.round(rawSPI - ciDelta),
        ciHigh: Math.round(rawSPI + ciDelta),
        breakdown,
        dataSources: composite.dataSources,
        historicalContext: historicalPatterns.slice(0, 2).map(p => ({
          era: p.era,
          region: p.region,
          outcome: p.outcome,
          lesson: p.lessons[0]
        }))
    };
};

export const generateFastSuggestion = async (input: string, context: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`${input} (Optimized for ${context})`);
        }, 600);
    });
};
