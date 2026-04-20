
import {
  ReportParameters,
  AdvancedIndexResults,
  BARNAResult,
  NVIResult,
  CAPResult,
  AGIResult,
  VCIResult,
  ATIResult,
  ESIResult,
  ISIResult,
  OSIResult,
  RNIResult,
  RFIResult,
  PSSResult,
  CISResult,
  SEQResult,
  FMSResult,
  DCSResult,
  DQSResult,
  GCSResult,
  SRAResult,
  IDVResult,
  RDBIResult,
  AFCResult,
  FRSResult,
  LAIResult,
  SAEResult,
  PPLResult,
  CLOResult,
  DVSResult,
  CSRResult,
  CompositeScoreResult,
  InsightBand
} from '../types';
import CompositeScoreService from './CompositeScoreService';
import LiveDataService from './LiveDataService';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const determineBand = (score: number): InsightBand => {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'critical';
};

const HEADCOUNT_LOOKUP: Record<string, number> = {
  '<5': 4,
  '5-10': 8,
  '10-50': 30,
  '11-50': 30,
  '50-100': 75,
  '51-100': 75,
  '100-250': 160,
  '250-500': 375,
  '500-1000': 750,
  '1000_5000': 2500,
  'over_10000': 12000
};

const parseHeadcount = (band?: string) => HEADCOUNT_LOOKUP[band || ''] || 500;
const parseDealSizeUSD = (dealSize?: string, custom?: string): number => {
  const source = custom || dealSize;
  if (!source) return 50_000_000;
  const numeric = Number(source.replace(/[^0-9.]/g, ''));
  if (Number.isFinite(numeric) && numeric > 0) {
    if (/b/i.test(source)) return numeric * 1_000_000_000;
    if (/m/i.test(source)) return numeric * 1_000_000;
    if (/k/i.test(source)) return numeric * 1_000;
    return numeric;
  }
  return 50_000_000;
};

const parseCurrencyUSD = (value?: string): number => {
  if (!value) return 0;
  const numeric = Number(value.replace(/[^0-9.]/g, ''));
  if (Number.isFinite(numeric) && numeric > 0) {
    if (/b/i.test(value)) return numeric * 1_000_000_000;
    if (/m/i.test(value)) return numeric * 1_000_000;
    if (/k/i.test(value)) return numeric * 1_000;
    return numeric;
  }
  return 0;
};

class AdvancedIndexService {
  static async computeIndices(params: ReportParameters): Promise<AdvancedIndexResults> {
    const composite = await CompositeScoreService.getScores(params);
    const liveData = await LiveDataService.getCountryIntelligence(params.country || params.region || 'Global');

    return {
      barna: this.computeBARNA(params, composite, liveData.profile?.region),
      nvi: this.computeNVI(params, composite, liveData.economics?.gdpCurrent),
      cap: this.computeCAP(params, composite),
      agi: this.computeAGI(params, composite),
      vci: this.computeVCI(params, composite, liveData.economics?.fdiInflows),
      ati: this.computeATI(params, composite),
      esi: this.computeESI(params, composite),
      isi: this.computeISI(params, composite),
      osi: this.computeOSI(params, composite),
      rni: this.computeRNI(params, composite),
      rfi: this.computeRFI(params, composite, liveData.economics?.easeOfBusiness),
      pss: this.computePSS(params, composite),
      cis: this.computeCIS(params, composite),
      seq: this.computeSEQ(params, composite),
      fms: this.computeFMS(params, composite),
      dcs: this.computeDCS(params, composite),
      dqs: this.computeDQS(params, composite),
      gcs: this.computeGCS(params, composite),
      sra: this.computeSRA(params, composite, liveData.economics?.inflation),
      idv: this.computeIDV(params, composite, liveData.profile?.region),
      rdbi: this.computeRDBI(params, composite),
      afc: this.computeAFC(params, composite),
      frs: this.computeFRS(params, composite),
      lai: this.computeLAI(params, composite, liveData.profile?.region),
      sae: this.computeSAE(params, composite),
      ppl: this.computePPL(params, composite, liveData.economics?.easeOfBusiness),
      clo: this.computeCLO(params, composite),
      dvs: this.computeDVS(params, composite),
      csr: this.computeCSR(params, composite, liveData.economics?.inflation)
    };
  }

  private static buildSources(composite: CompositeScoreResult, liveSources?: string[]): string[] {
    return Array.from(new Set([...(composite.dataSources || []), ...(liveSources || [])]));
  }

  private static computeBARNA(params: ReportParameters, composite: CompositeScoreResult, region?: string): BARNAResult {
    let score = 58;
    const drivers: string[] = [];
    const pressurePoints: string[] = [];

    if (params.fundingSource === 'Internal Cashflow') {
      score += 7;
      drivers.push('Internal cash reserves reduce dependency on counterparties');
    }
    if ((params.targetCounterpartType?.length || 0) >= 2) {
      score += 5;
      drivers.push('Multiple partner archetypes available for parallel negotiations');
    }
    if ((params.partnerPersonas?.length || 0) === 0) {
      score -= 8;
      pressurePoints.push('No documented partner personas to pressure-test leverage');
    }
    if (composite.components.regulatory > 75) {
      score += 6;
      drivers.push('Regulatory clarity increases leverage on deal terms');
    }
    if (composite.components.riskFactors > 60) {
      score -= 6;
      pressurePoints.push('Macroeconomic risk softens fallback positions');
    }

    const leverageProfile = score >= 78 ? 'dominant' : score >= 60 ? 'balanced' : 'weak';
    const fallbackPositions = params.targetIncentives?.length
      ? params.targetIncentives.map(t => `Reframe around ${t}`)
      : ['Escalate to phased commitments', 'Swap equity for offtake guarantees'];

    const recommendation = leverageProfile === 'dominant'
      ? 'Lock in upside clauses (earn-outs, IP royalties) while leverage remains high.'
      : 'Prepare alternative phasing (pilot + option) to avoid unfavorable concessions.';

    return {
      score: clamp(score, 0, 100),
      band: determineBand(score),
      drivers,
      pressurePoints,
      recommendation,
      dataSources: composite.dataSources,
      leverageProfile,
      fallbackPositions,
      confidence: clamp(0.55 + (params.dueDiligenceDepth === 'Deep' ? 0.2 : 0) + (params.problemStatement ? 0.05 : 0), 0.4, 0.95)
    };
  }

  private static computeNVI(params: ReportParameters, composite: CompositeScoreResult, gdpCurrent?: number): NVIResult {
    const marketSignal = (composite.components.marketAccess + composite.components.innovation) / 2;
    let score = clamp(0.65 * marketSignal + 0.35 * composite.overall, 20, 98);
    if (params.specificOpportunity) score += 4;
    if (params.priorityThemes?.includes('Innovation')) score += 3;

    const monetaryValueUSD = Math.round(((gdpCurrent || composite.inputs.gdpCurrent || 80_000_000_000) * 0.00045) * (score / 100));
    const intangibleValueNarrative = `Brand signal gains from ${regionLabel(params)} plus innovation spillovers lift perceived value even if monetary capture is capped at $${(monetaryValueUSD/1_000_000).toFixed(1)}M.`;

    return {
      score: clamp(score, 0, 100),
      band: determineBand(score),
      drivers: [
        `Market access score ${Math.round(composite.components.marketAccess)}/100`,
        `Innovation index ${Math.round(composite.components.innovation)}/100`
      ],
      pressurePoints: composite.components.costEfficiency < 55 ? ['Cost structure still above regional peers'] : [],
      recommendation: 'Monetize the value surplus via premium SLAs or proprietary data licensing.',
      dataSources: composite.dataSources,
      monetaryValueUSD,
      intangibleValueNarrative
    };
  }

  private static computeCAP(params: ReportParameters, composite: CompositeScoreResult): CAPResult {
    const dueDiligenceDepth = (params.dueDiligenceDepth?.toLowerCase() as CAPResult['diligenceDepth']) || 'standard';
    let score = clamp(0.5 * composite.components.regulatory + 0.5 * composite.components.politicalStability, 30, 95);
    if (params.partnerFitCriteria?.length) score += 5;
    if ((params.partnerPersonas?.length || 0) < 1) score -= 6;

    const trustSignals = [
      `Regulatory quality ${Math.round(composite.components.regulatory)}/100`,
      `Ethics score ${Math.round(composite.components.digitalReadiness)}/100` // proxy for transparency
    ];
    if (params.partnerFitCriteria?.length) trustSignals.push(`${params.partnerFitCriteria.length} partner fit criteria defined`);

    const redFlags = [] as string[];
    if (!params.partnerEngagementNotes) redFlags.push('No engagement notes logged against target counterparties');
    if (composite.components.riskFactors > 65) redFlags.push('Country risk remains elevated');

    return {
      score,
      band: determineBand(score),
      drivers: trustSignals,
      pressurePoints: redFlags,
      recommendation: redFlags.length ? 'Run enhanced diligence (KYC, sanctions refresh) before term sheet.' : 'Proceed with structured engagement playbook.',
      dataSources: composite.dataSources,
      counterpartiesAssessed: params.partnerPersonas?.length || 0,
      trustSignals,
      redFlags,
      diligenceDepth: dueDiligenceDepth
    };
  }

  private static computeAGI(params: ReportParameters, composite: CompositeScoreResult): AGIResult {
    const growthSignal = composite.components.growthPotential;
    let score = clamp(0.6 * growthSignal + 0.4 * composite.overall, 25, 98);
    if (params.expansionTimeline === '0_6_months') score += 6;
    else if (params.expansionTimeline === '6_12_months') score += 3;
    if (params.priorityThemes?.includes('Acceleration')) score += 4;

    const velocityScore = score;
    const baseMonths = params.expansionTimeline === '0_6_months' ? 6 : params.expansionTimeline === '6_12_months' ? 12 : 18;
    const p50 = Math.max(4, baseMonths - Math.round(score / 20));
    const p10 = Math.max(2, Math.round(p50 * 0.7));
    const p90 = Math.round(p50 * 1.4);
    const gatingFactors = composite.components.regulatory < 55 ? ['Permitting backlog'] : [];
    if (composite.components.talent < 60) gatingFactors.push('Specialized talent availability');

    return {
      score,
      band: determineBand(score),
      drivers: [`Growth potential ${Math.round(growthSignal)}/100`, `Composite strength ${composite.overall}/100`],
      pressurePoints: gatingFactors,
      recommendation: gatingFactors.length ? 'Sequence workstreams to unblock gating factors before scale-up.' : 'Accelerate activation with milestone-based funding.',
      dataSources: composite.dataSources,
      velocityScore,
      timeToValueMonths: { p10, p50, p90 },
      gatingFactors
    };
  }

  private static computeVCI(params: ReportParameters, composite: CompositeScoreResult, fdiInflows?: number): VCIResult {
    let score = clamp(0.5 * composite.components.costEfficiency + 0.5 * composite.components.marketAccess, 25, 95);
    if (params.strategicObjectives?.includes('Scale revenue')) score += 4;

    const revenueLiftUSD = Math.round((parseDealSizeUSD(params.dealSize, params.customDealSize) * 0.6) * (score / 100));
    const costSavingsUSD = Math.round(revenueLiftUSD * (composite.components.costEfficiency / 200));
    const strategicPremiumUSD = Math.round((fdiInflows || composite.inputs.fdiInflows || 5_000_000_000) * 0.02 * (score / 100));

    return {
      score,
      band: determineBand(score),
      drivers: [`Cost efficiency ${Math.round(composite.components.costEfficiency)}/100`, `Market reach ${Math.round(composite.components.marketAccess)}/100`],
      pressurePoints: composite.components.supplyChain < 55 ? ['Supply chain fragility may dilute value capture'] : [],
      recommendation: 'Tie incentives to realized value segments (revenue lift vs. cost savings) for clarity.',
      dataSources: composite.dataSources,
      valueBreakdown: {
        revenueLiftUSD,
        costSavingsUSD,
        strategicPremiumUSD
      }
    };
  }

  private static computeATI(params: ReportParameters, composite: CompositeScoreResult): ATIResult {
    let score = clamp(0.5 * composite.components.digitalReadiness + 0.5 * composite.components.infrastructure, 30, 95);
    if (params.skillLevel === 'expert') score += 5;
    if (params.skillLevel === 'novice') score -= 5;

    const transitionRoutes = [
      'Pilot > JV > Majority stake',
      'Sandbox regulatory regime > national license'
    ];
    const changeManagementNeeds = [] as string[];
    if (params.partnerReadinessLevel === 'low') changeManagementNeeds.push('Embed partner enablement office');
    if (composite.components.talent < 55) changeManagementNeeds.push('Upskill workforce via TVET partnerships');

    return {
      score,
      band: determineBand(score),
      drivers: [`Digital readiness ${Math.round(composite.components.digitalReadiness)}/100`, `Infrastructure ${Math.round(composite.components.infrastructure)}/100`],
      pressurePoints: changeManagementNeeds,
      recommendation: 'Sequence transitions with measurable guardrails (runbooks, KPIs).',
      dataSources: composite.dataSources,
      transitionRoutes,
      changeManagementNeeds
    };
  }

  private static computeESI(params: ReportParameters, composite: CompositeScoreResult): ESIResult {
    const headcount = parseHeadcount(params.headcountBand);
    let score = clamp(0.45 * composite.components.infrastructure + 0.35 * composite.components.talent + 0.2 * composite.components.marketAccess, 25, 96);
    if (params.fundingSource === 'Internal Cashflow') score += 4;
    if (headcount < 100) score -= 5;

    const executionGaps: string[] = [];
    if (composite.components.talent < 60) executionGaps.push('Need to supplement talent bench with external partners');
    if (composite.components.supplyChain < 60) executionGaps.push('Logistics reliability below threshold');

    return {
      score,
      band: determineBand(score),
      drivers: [`Infrastructure ${Math.round(composite.components.infrastructure)}/100`, `Talent pool ${Math.round(composite.components.talent)}/100`],
      pressurePoints: executionGaps,
      recommendation: executionGaps.length ? 'Close execution gaps via managed services or shared utilities.' : 'Institutionalize operating playbooks to codify advantages.',
      dataSources: composite.dataSources,
      capacityUtilization: Math.round((headcount / 5000) * 100),
      executionGaps,
      opsPlaybook: ['Codify PMO cadence', 'Embed KPI cockpit', 'Run readiness drills']
    };
  }

  private static computeISI(params: ReportParameters, composite: CompositeScoreResult): ISIResult {
    let score = clamp(0.6 * composite.components.innovation + 0.4 * composite.components.digitalReadiness, 20, 98);
    if (params.priorityThemes?.includes('Innovation')) score += 5;

    const core = Math.round(50 - (score - 60) * 0.3);
    const adjacent = Math.round(30 + (score - 60) * 0.2);
    const transformational = clamp(100 - core - adjacent, 10, 40);

    const ipSignals = [`Innovation score ${Math.round(composite.components.innovation)}/100`];
    if (params.priorityThemes?.includes('IP commercialization')) ipSignals.push('IP commercialization flagged as priority');

    return {
      score,
      band: determineBand(score),
      drivers: ipSignals,
      pressurePoints: composite.components.digitalReadiness < 60 ? ['Digital infrastructure not yet aligned with R&D ambitions'] : [],
      recommendation: 'Balance portfolio between core cashflows and transformational bets to avoid dilution.',
      dataSources: composite.dataSources,
      innovationPortfolioMix: {
        core: clamp(core, 20, 70),
        adjacent: clamp(adjacent, 15, 45),
        transformational
      },
      ipSignals
    };
  }

  private static computeOSI(params: ReportParameters, composite: CompositeScoreResult): OSIResult {
    let score = clamp(0.5 * composite.components.sustainability + 0.5 * composite.components.supplyChain, 20, 95);
    if (params.priorityThemes?.includes('Sustainability')) score += 5;
    if (params.politicalSensitivities?.includes('Environment')) score += 3;

    const pressurePoints = composite.components.costEfficiency < 55 ? ['Cost base may rise during sustainability retrofits'] : [];
    const sustainabilityMetrics = {
      emissionsScore: Math.round(composite.components.sustainability),
      circularityScore: Math.round((composite.components.marketAccess + composite.components.costEfficiency) / 2)
    };

    return {
      score,
      band: determineBand(score),
      drivers: [`Sustainability ${sustainabilityMetrics.emissionsScore}/100`, `Supply chain ${Math.round(composite.components.supplyChain)}/100`],
      pressurePoints,
      recommendation: 'Publish sustainability ledger (emissions + circularity) to unlock green financing.',
      dataSources: composite.dataSources,
      sustainabilityMetrics,
      resilienceDrivers: ['Supplier redundancy', 'Local clean-energy sourcing']
    };
  }

  private static computeRNI(params: ReportParameters, composite: CompositeScoreResult): RNIResult {
    let score = clamp(0.65 * composite.components.regulatory + 0.35 * composite.components.digitalReadiness, 25, 95);
    if (params.skillLevel === 'expert') score += 3;
    if (params.strategicIntent.some(intent => /government/i.test(intent))) score += 3;

    const pressurePoints: string[] = [];
    if (composite.components.regulatory < 55) pressurePoints.push('Regulatory opacity may slow approvals');
    if (!params.procurementMode) pressurePoints.push('Procurement mode not declared');

    const clearancePath = [
      'Validate investment incentives with promotion agency',
      'Secure environmental & labor clearances',
      'Lodge data-residency compliance package'
    ];

    return {
      score,
      band: determineBand(score),
      drivers: [`Regulatory ease ${Math.round(composite.components.regulatory)}/100`],
      pressurePoints,
      recommendation: 'Bundle filings (permits + incentives) to reduce sequential drift.',
      dataSources: composite.dataSources,
      clearancePath,
      policyWatchlist: ['Upcoming digital competition rules', 'Carbon border adjustments'],
      complianceEffort: score >= 70 ? 'light' : score >= 55 ? 'moderate' : 'heavy'
    };
  }

  private static computeRFI(params: ReportParameters, composite: CompositeScoreResult, easeOfBusiness?: number): RFIResult {
    let score = clamp(
      (composite.components.regulatory * 0.4) +
      (composite.components.digitalReadiness * 0.25) +
      (composite.components.politicalStability * 0.2) +
      (composite.components.marketAccess * 0.15),
      15,
      95
    );

    if (params.procurementMode) score += 3;
    if (params.complianceEvidence) score += 3;
    if (params.governanceModels?.length) score += 2;
    if (composite.components.riskFactors > 65) score -= 5;

    const frictionIndex = clamp(100 - score + (composite.components.riskFactors - 50) * 0.3, 5, 95);

    const bottlenecks: string[] = [];
    if (composite.components.regulatory < 55) bottlenecks.push('Low regulatory transparency');
    if (composite.components.digitalReadiness < 55) bottlenecks.push('Manual processing still dominant');
    if (!params.procurementMode) bottlenecks.push('Procurement path undefined');
    if (!params.complianceEvidence) bottlenecks.push('Compliance evidence not documented');

    const approvalWindowDays = {
      p50: Math.round(30 + frictionIndex * 1.1),
      p90: Math.round((30 + frictionIndex * 1.1) * 1.7)
    };

    const drivers = [
      `Regulatory clarity ${Math.round(composite.components.regulatory)}/100`,
      `Digital readiness ${Math.round(composite.components.digitalReadiness)}/100`,
      `Political stability ${Math.round(composite.components.politicalStability)}/100`
    ];
    if (typeof easeOfBusiness === 'number') drivers.push(`Ease of business ${Math.round(easeOfBusiness)}/100`);

    return {
      score: clamp(score, 0, 100),
      band: determineBand(score),
      drivers,
      pressurePoints: bottlenecks,
      recommendation: score >= 70
        ? 'Sequence filings early and lock regulatory sponsors to compress approvals.'
        : 'Engage local regulatory counsel and front-load permits to reduce friction.',
      dataSources: this.buildSources(composite),
      frictionIndex,
      approvalWindowDays,
      bottlenecks
    };
  }

  private static computePSS(params: ReportParameters, composite: CompositeScoreResult): PSSResult {
    let sensitivity = clamp(
      ((100 - composite.components.politicalStability) * 0.45) +
      (composite.components.riskFactors * 0.35) +
      ((100 - composite.components.regulatory) * 0.2),
      10,
      95
    );

    if ((params.politicalSensitivities?.length || 0) > 0) sensitivity += 4;
    if (params.riskTolerance === 'low' || params.riskTolerance === 'very_low') sensitivity += 4;
    if (params.riskTolerance === 'high' || params.riskTolerance === 'very_high') sensitivity -= 3;

    sensitivity = clamp(sensitivity, 5, 98);
    const score = clamp(100 - sensitivity, 5, 95);

    const shockScenarios: string[] = [];
    if (composite.components.marketAccess < 55) shockScenarios.push('Trade access tightening');
    if (composite.components.digitalReadiness < 55) shockScenarios.push('Data-localization enforcement');
    if (composite.components.politicalStability < 55) shockScenarios.push('Policy turnover / incentive rollback');
    if (!shockScenarios.length) shockScenarios.push('Baseline policy continuity (low shock probability)');

    const riskAdjustedDelta = Math.round((sensitivity / 100) * 30);

    return {
      score,
      band: determineBand(score),
      drivers: [
        `Policy stability ${Math.round(composite.components.politicalStability)}/100`,
        `Regulatory certainty ${Math.round(composite.components.regulatory)}/100`
      ],
      pressurePoints: sensitivity > 60 ? ['High exposure to policy shocks'] : [],
      recommendation: score >= 65
        ? 'Maintain policy radar and embed review triggers into governance cadence.'
        : 'Hedge policy exposure (staged capex, contingent incentives, FX buffers).',
      dataSources: this.buildSources(composite),
      sensitivity,
      shockScenarios,
      riskAdjustedDelta
    };
  }

  private static computeCIS(params: ReportParameters, composite: CompositeScoreResult): CISResult {
    let score = 55;
    const depth = (params.dueDiligenceDepth || '').toLowerCase();

    if (depth.includes('deep') || depth.includes('enhanced')) score += 6;
    if (depth.includes('light')) score -= 4;
    if (params.complianceEvidence) score += 4;
    if (params.partnerEngagementNotes) score += 3;
    if ((params.partnerPersonas?.length || 0) > 0) score += 4;
    if ((params.partnerFitCriteria?.length || 0) > 0) score += 3;
    if (composite.components.regulatory < 55) score -= 5;
    if (composite.components.politicalStability < 50) score -= 4;

    score = clamp(score, 15, 95);

    const verificationSignals: string[] = [];
    if (depth) verificationSignals.push(`Diligence depth: ${params.dueDiligenceDepth}`);
    if (params.complianceEvidence) verificationSignals.push('Compliance evidence provided');
    if ((params.partnerPersonas?.length || 0) > 0) verificationSignals.push(`${params.partnerPersonas?.length} partner personas mapped`);
    if ((params.partnerFitCriteria?.length || 0) > 0) verificationSignals.push(`${params.partnerFitCriteria?.length} partner fit criteria defined`);

    const pressurePoints: string[] = [];
    if (!params.partnerEngagementNotes) pressurePoints.push('Partner engagement notes missing');
    if (!params.complianceEvidence) pressurePoints.push('Compliance evidence not recorded');
    if ((params.partnerPersonas?.length || 0) === 0) pressurePoints.push('No partner personas documented');

    const integrityBand = score >= 80 ? 'verified' : score >= 60 ? 'watch' : 'high-risk';

    return {
      score,
      band: determineBand(score),
      drivers: [
        `Regulatory quality ${Math.round(composite.components.regulatory)}/100`,
        `Political stability ${Math.round(composite.components.politicalStability)}/100`
      ],
      pressurePoints,
      recommendation: integrityBand === 'high-risk'
        ? 'Run enhanced KYC, adverse media checks, and require escrow protections.'
        : 'Proceed with structured governance clauses and periodic integrity reviews.',
      dataSources: this.buildSources(composite),
      integrityBand,
      redFlagCount: pressurePoints.length,
      verificationSignals
    };
  }

  private static computeSEQ(params: ReportParameters, composite: CompositeScoreResult): SEQResult {
    let score = 60;
    const sequencingRisks: string[] = [];

    if (params.milestonePlan) score += 8;
    else sequencingRisks.push('No milestone plan defined to lock task sequencing.');

    if ((params.financialStages?.length || 0) >= 2) score += 6;
    else sequencingRisks.push('No staged financing plan to align milestones to funding.');

    if (params.riskMonitoringProcess) score += 4;
    else sequencingRisks.push('Risk monitoring cadence not defined.');

    if (params.procurementMode) score += 3;
    else sequencingRisks.push('Procurement path not locked; approvals may drift.');

    if (params.expansionTimeline?.includes('0_6')) score -= 6;
    if (composite.components.infrastructure < 55) sequencingRisks.push('Infrastructure readiness below threshold; dependencies may slip.');
    if (!params.contingencyPlans) sequencingRisks.push('No contingency plan to resequence on disruption.');

    const dependencyMap = [
      'Permits -> Procurement -> Mobilization',
      'Funding release -> Capex build -> Talent onboarding',
      'Pilot launch -> KPI validation -> Scale decision'
    ];

    score = clamp(score, 15, 95);

    return {
      score,
      band: determineBand(score),
      drivers: [
        `Regulatory readiness ${Math.round(composite.components.regulatory)}/100`,
        `Infrastructure readiness ${Math.round(composite.components.infrastructure)}/100`
      ],
      pressurePoints: sequencingRisks,
      recommendation: score >= 70
        ? 'Lock dependency order with gated approvals and stage-gate checks.'
        : 'Re-sequence plan with explicit dependency gates before capital drawdown.',
      dataSources: composite.dataSources,
      dependencyMap,
      sequencingRisks
    };
  }

  private static computeFMS(params: ReportParameters, composite: CompositeScoreResult): FMSResult {
    const revenueYear1 = parseCurrencyUSD(params.revenueYear1);
    const opexYear1 = parseCurrencyUSD(params.opexYear1);
    const cogsYear1 = parseCurrencyUSD(params.cogsYear1);
    const capex = parseCurrencyUSD(params.totalInvestment) || parseDealSizeUSD(params.dealSize, params.customDealSize);
    const operatingNeed = opexYear1 + cogsYear1;
    const coverageDenominator = Math.max(1, operatingNeed + capex * 0.25);
    const fundingCoverageRatio = revenueYear1 / coverageDenominator;
    const cashflowGapUSD = Math.max(0, coverageDenominator - revenueYear1);

    let score = clamp(55 + (fundingCoverageRatio * 40), 10, 95);
    if (params.fundingSource === 'Internal Cashflow') score += 4;
    if (params.cashFlowTiming) score += 3;
    if (!params.cashFlowTiming) score -= 4;

    const timingMisalignments: string[] = [];
    if (fundingCoverageRatio < 0.9) timingMisalignments.push('Revenue timing lags capex + opex burn profile.');
    if (!params.paybackPeriod) timingMisalignments.push('Payback period not defined against funding schedule.');
    if (!params.revenueStreams) timingMisalignments.push('Revenue streams not documented for year-1 coverage.');

    score = clamp(score, 10, 95);

    return {
      score,
      band: determineBand(score),
      drivers: [
        `Funding coverage ratio ${(fundingCoverageRatio * 100).toFixed(0)}%`,
        `Cashflow gap $${Math.round(cashflowGapUSD / 1_000_000)}M`
      ],
      pressurePoints: timingMisalignments,
      recommendation: score >= 70
        ? 'Align drawdowns with revenue milestones; keep reserves for timing slippage.'
        : 'Re-time capex and renegotiate funding tranches to close cashflow gaps.',
      dataSources: composite.dataSources,
      fundingCoverageRatio: Number(fundingCoverageRatio.toFixed(2)),
      cashflowGapUSD: Math.round(cashflowGapUSD),
      timingMisalignments
    };
  }

  private static computeDCS(params: ReportParameters, composite: CompositeScoreResult): DCSResult {
    const dependencyCount = (params.partnerCapabilities?.length || 0)
      + (params.integrationSystems?.length || 0)
      + (params.governanceModels?.length || 0)
      + (params.riskOwners?.length || 0);

    const dependencyConcentration = clamp(100 - dependencyCount * 10, 10, 95);
    const singlePointFailures: string[] = [];

    if ((params.partnerCapabilities?.length || 0) <= 1) singlePointFailures.push('Partner capability stack is concentrated in a single provider.');
    if ((params.integrationSystems?.length || 0) <= 1) singlePointFailures.push('Operational systems dependency concentrated in one platform.');
    if (!params.procurementMode) singlePointFailures.push('Procurement contingency options not documented.');
    if (composite.components.supplyChain < 55) singlePointFailures.push('Supply chain resilience below threshold.');

    const score = clamp(100 - dependencyConcentration + (composite.components.supplyChain - 50) * 0.4, 10, 95);

    return {
      score,
      band: determineBand(score),
      drivers: [
        `Dependency concentration ${Math.round(dependencyConcentration)}/100`,
        `Supply chain resilience ${Math.round(composite.components.supplyChain)}/100`
      ],
      pressurePoints: singlePointFailures,
      recommendation: score >= 70
        ? 'Maintain multi-vendor redundancy and alternate approvals.'
        : 'Diversify suppliers and approvals to reduce single-point failures.',
      dataSources: composite.dataSources,
      dependencyConcentration,
      singlePointFailures
    };
  }

  private static computeDQS(params: ReportParameters, composite: CompositeScoreResult): DQSResult {
    const coverageScore = clamp(
      ((params.ingestedDocuments?.length || 0) * 12)
      + ((params.comparativeContext?.length || 0) * 6)
      + ((composite.dataSources?.length || 0) * 6),
      10,
      100
    );

    let freshnessScore = 55;
    if (params.dueDiligenceDepth === 'Deep') freshnessScore += 15;
    if (params.dueDiligenceDepth === 'Light') freshnessScore -= 10;

    let verifiabilityScore = 45;
    if (params.complianceEvidence) verifiabilityScore += 20;
    if (params.partnerEngagementNotes) verifiabilityScore += 10;

    const dataGaps: string[] = [];
    if ((params.ingestedDocuments?.length || 0) < 2) dataGaps.push('Limited documentary evidence ingested.');
    if ((composite.dataSources?.length || 0) < 3) dataGaps.push('Sparse external data sources; refresh recommended.');
    if (!params.complianceEvidence) dataGaps.push('Compliance evidence missing or unverified.');

    const score = clamp((coverageScore * 0.5) + (freshnessScore * 0.25) + (verifiabilityScore * 0.25), 10, 95);

    return {
      score,
      band: determineBand(score),
      drivers: [
        `Coverage ${Math.round(coverageScore)}/100`,
        `Verifiability ${Math.round(verifiabilityScore)}/100`
      ],
      pressurePoints: dataGaps,
      recommendation: score >= 70
        ? 'Maintain data refresh cadence and evidence logs.'
        : 'Expand evidence set and validate sources before commitment.',
      dataSources: composite.dataSources,
      coverageScore: Math.round(coverageScore),
      freshnessScore: Math.round(freshnessScore),
      verifiabilityScore: Math.round(verifiabilityScore),
      dataGaps
    };
  }

  private static computeGCS(params: ReportParameters, composite: CompositeScoreResult): GCSResult {
    let decisionClarityScore = 45;
    let exitClarityScore = 45;
    const governanceRisks: string[] = [];

    if (params.decisionAuthority) decisionClarityScore += 20;
    else governanceRisks.push('Decision authority not defined.');

    if (params.governanceModels?.length) decisionClarityScore += 10;
    else governanceRisks.push('Governance model not documented.');

    if (params.relationshipStage) exitClarityScore += 10;
    if (params.partnerEngagementNotes) exitClarityScore += 5;
    if (!params.alignmentPlan) governanceRisks.push('Alignment plan missing; escalation path unclear.');
    if (!params.riskOwners?.length) governanceRisks.push('No named risk owners for governance escalation.');

    const score = clamp((decisionClarityScore + exitClarityScore) / 2 + (composite.components.politicalStability - 50) * 0.2, 15, 95);

    return {
      score,
      band: determineBand(score),
      drivers: [
        `Decision clarity ${Math.round(decisionClarityScore)}/100`,
        `Governance stability ${Math.round(composite.components.politicalStability)}/100`
      ],
      pressurePoints: governanceRisks,
      recommendation: score >= 70
        ? 'Codify decision rights and exit clauses before final negotiations.'
        : 'Define governance, decision rights, and exit triggers to reduce ambiguity.',
      dataSources: composite.dataSources,
      decisionClarityScore: Math.round(decisionClarityScore),
      exitClarityScore: Math.round(exitClarityScore),
      governanceRisks
    };
  }

  private static computeSRA(params: ReportParameters, composite: CompositeScoreResult, inflation?: number): SRAResult {
    const stability = composite.components.politicalStability;
    const riskInverse = 100 - composite.components.riskFactors;
    let score = clamp(0.6 * stability + 0.4 * riskInverse, 15, 99);
    if (params.riskTolerance === 'low' || params.riskTolerance === 'very_low') score -= 4;

    const macroSignals = [
      `GDP growth ${composite.inputs.gdpGrowth?.toFixed(1) ?? 'n/a'}%`,
      `Inflation ${(inflation ?? composite.inputs.inflation ?? 0).toFixed(1)}%`
    ];

    const stressEvents: string[] = [];
    if (composite.inputs.tradeBalance < 0) stressEvents.push('Trade deficit pressure');
    if ((inflation ?? composite.inputs.inflation ?? 0) > 8) stressEvents.push('High inflation erosion');

    const band = score >= 75 ? 'secure' : score >= 55 ? 'watch' : 'distressed';

    return {
      score,
      band: determineBand(score),
      drivers: [`Political stability ${Math.round(stability)}/100`, `Risk buffer ${Math.round(riskInverse)}/100`],
      pressurePoints: stressEvents,
      recommendation: 'Structure sovereign protections (FX hedges, political risk insurance) matching the risk band.',
      dataSources: composite.dataSources,
      sovereignRiskBand: band,
      macroSignals,
      stressEvents
    };
  }

  private static computeIDV(params: ReportParameters, composite: CompositeScoreResult, region?: string): IDVResult {
    const sameCountry = (params.userCountry && params.userCountry === params.country);
    const sameRegion = region && params.region && region === params.region;
    let distance = sameCountry ? 20 : sameRegion ? 40 : 60;
    if (params.skillLevel === 'expert') distance -= 5;
    if (params.stakeholderAlignment?.length) distance -= 5;
    distance = clamp(distance, 10, 80);

    const culturalBridges = [] as string[];
    if (params.partnerPersonas?.length) culturalBridges.push('Mapped partner personas to local influencers');
    if (params.stakeholderAlignment?.includes('Government')) culturalBridges.push('Government stakeholder alignment declared');
    if (!culturalBridges.length) culturalBridges.push('Leverage diaspora or chambers to bridge governance gap');

    const alignmentPlaybook = [
      'Deploy bilingual negotiation pods',
      'Create shared compliance dashboard',
      'Run joint scenario workshops'
    ];

    const score = clamp(100 - distance + (params.skillLevel === 'expert' ? 5 : 0), 20, 98);

    return {
      score,
      band: determineBand(score),
      drivers: [`Institutional distance ${distance}`],
      pressurePoints: distance > 55 ? ['High institutional distance - expect governance frictions'] : [],
      recommendation: 'Institutionalize joint steering committee to keep governance gap visible.',
      dataSources: composite.dataSources,
      distanceScore: distance,
      culturalBridges,
      alignmentPlaybook
    };
  }

  private static computeRDBI(params: ReportParameters, composite: CompositeScoreResult): RDBIResult {
    let rawBias = 48;
    const drivers: string[] = [];
    const pressurePoints: string[] = [];

    if (params.userCountry && params.country) {
      if (params.userCountry === params.country) {
        rawBias += 22;
        pressurePoints.push('Requester and target market are identical; confirmation bias likely.');
      } else {
        rawBias -= 8;
        drivers.push('Cross-border mandate forces alternate defaults.');
      }
    }

    if ((params.comparativeContext?.length || 0) >= 2) {
      rawBias -= 6;
      drivers.push('Multiple comparative regions supplied.');
    }

    if (!params.stakeholderAlignment?.some(alignment => /local|municipal|community/i.test(alignment || ''))) {
      rawBias += 6;
      pressurePoints.push('No explicit local stakeholder alignment recorded.');
    } else {
      drivers.push('Local stakeholder alignment declared.');
    }

    if ((params.partnerPersonas?.length || 0) === 0) {
      rawBias += 5;
      pressurePoints.push('Partner personas absent; home heuristics go unchallenged.');
    }

    if ((params.ingestedDocuments?.length || 0) >= 4) {
      rawBias -= 4;
      drivers.push('Diverse reference packets temper bias.');
    }

    if ((params.strategicLens || []).some(lens => /divers/i.test(lens) || /regional/i.test(lens))) {
      rawBias -= 5;
      drivers.push('Diversification lens explicitly selected.');
    }

    if (params.neuroSymbolicState?.formulas?.some(formula => /regional|bias/i.test(formula.name))) {
      rawBias -= 3;
      drivers.push('Neuro-symbolic circuit already monitoring regional bias.');
    }

    const score = clamp(100 - rawBias, 0, 100);
    const direction: RDBIResult['direction'] = rawBias >= 60 ? 'home-biased' : rawBias <= 40 ? 'outbound' : 'balanced';

    const overrideSwitches = direction === 'home-biased'
      ? ['Route briefing through external geography reviewer', 'Inject contrarian dataset before approvals']
      : direction === 'outbound'
        ? ['Pair expansion pod with resident operators', 'Impose cultural guardrails on rapid pivots']
        : ['Rotate comparative dataset quarterly', 'Keep alternating reviewers from outside the region'];

    return {
      score,
      band: determineBand(score),
      drivers,
      pressurePoints,
      recommendation: direction === 'home-biased'
        ? 'Pause capital lock until an external reviewer signs off on regional assumptions.'
        : direction === 'outbound'
          ? 'Counter over-corrections by anchoring each loop with a local operating partner.'
          : 'Maintain alternating review cadences to keep baselines neutral.',
      dataSources: composite.dataSources,
      direction,
      referenceRegion: params.region || params.country || 'Target region',
      overrideSwitches
    };
  }

  private static computeAFC(params: ReportParameters, composite: CompositeScoreResult): AFCResult {
    const dragFactors: string[] = [];
    const accelerationLevers: string[] = [];
    let coefficient = 0.25;

    const regulatoryDrag = Math.max(0, (75 - composite.components.regulatory) / 150);
    if (regulatoryDrag > 0.01) {
      coefficient += regulatoryDrag;
      dragFactors.push('Regulatory readiness below 75/100.');
      accelerationLevers.push('Embed advance permitting squad with host agency.');
    }

    const infrastructureDrag = Math.max(0, (70 - composite.components.infrastructure) / 150);
    if (infrastructureDrag > 0.01) {
      coefficient += infrastructureDrag;
      dragFactors.push('Infrastructure score below 70/100.');
      accelerationLevers.push('Pre-contract shared infrastructure or neutral host facilities.');
    }

    const talentDrag = Math.max(0, (65 - composite.components.talent) / 150);
    if (talentDrag > 0.01) {
      coefficient += talentDrag;
      dragFactors.push('Specialized talent coverage under 65/100.');
      accelerationLevers.push('Stage talent bridge via JV or managed services.');
    }

    const needs = params.calibration?.capabilitiesNeed?.length || 0;
    const haves = params.calibration?.capabilitiesHave?.length || 0;
    if (needs > haves) {
      const gapPenalty = Math.min(0.18, (needs - haves) * 0.03);
      coefficient += gapPenalty;
      dragFactors.push(`${needs - haves} capability gaps declared.`);
      accelerationLevers.push('Borrow missing capabilities from regional shared services.');
    }

    const partnerCoverage = params.partnerCapabilities?.length || 0;
    if (partnerCoverage >= 3) {
      coefficient -= 0.04;
      accelerationLevers.push('Partner capability stack absorbs onboarding drag.');
    } else if (partnerCoverage === 0) {
      dragFactors.push('No partner capabilities mapped to absorb launch tasks.');
    }

    const timeline = params.expansionTimeline || '';
    if (timeline.includes('0_6')) {
      coefficient += 0.12;
      dragFactors.push('Aggressive 0-6 month activation target.');
    } else if (timeline.includes('6_12')) {
      coefficient += 0.05;
    } else if (timeline.includes('18') || timeline.includes('24')) {
      coefficient -= 0.03;
    }

    if (params.dueDiligenceDepth === 'Deep') {
      coefficient += 0.06;
      dragFactors.push('Enhanced diligence sequencing adds drag.');
    } else if (params.dueDiligenceDepth === 'Light') {
      coefficient -= 0.02;
    }

    coefficient = clamp(coefficient, 0.05, 0.95);
    const score = clamp(Math.round((1 - coefficient) * 100), 5, 100);
    const timePenaltyMonths = Math.max(1, Math.round(coefficient * 12));

    const drivers = [
      `Regulatory readiness ${Math.round(composite.components.regulatory)}/100`,
      `Infrastructure ${Math.round(composite.components.infrastructure)}/100`,
      `Talent coverage ${Math.round(composite.components.talent)}/100`
    ];

    const pressurePoints = dragFactors.length ? dragFactors : ['Friction within expected envelope'];

    const recommendation = coefficient > 0.45
      ? 'Stage go-live with kill switches and pre-signed contingencies before scaling spend.'
      : 'Proceed with current pacing; keep friction log to preserve advantage.';

    if (!accelerationLevers.length) {
      accelerationLevers.push('Maintain activation SWAT cadence; no immediate hardening required.');
    }

    return {
      score,
      band: determineBand(score),
      drivers,
      pressurePoints,
      recommendation,
      dataSources: composite.dataSources,
      coefficient,
      dragFactors,
      accelerationLevers,
      timePenaltyMonths
    };
  }

  private static computeFRS(params: ReportParameters, composite: CompositeScoreResult): FRSResult {
    let score = 58;
    const drivers: string[] = [];
    const pressurePoints: string[] = [];
    const loopDesign: string[] = [];
    const energySources: string[] = [];
    const signals: string[] = [];

    const innovation = composite.components.innovation;
    const digital = composite.components.digitalReadiness;
    const marketAccess = composite.components.marketAccess;
    const talent = composite.components.talent;

    score += (innovation - 60) * 0.25;
    score += (digital - 55) * 0.2;
    score += (marketAccess - 55) * 0.15;

    if ((params.partnerCapabilities?.length || 0) >= 3) {
      score += 5;
      drivers.push('Partner capability lattice can sustain multiple flywheel legs.');
    } else {
      pressurePoints.push('Partner capability coverage thin; loop energy may dissipate.');
    }

    if ((params.priorityThemes || []).some(theme => /data|platform|ecosystem/i.test(theme))) {
      score += 4;
      drivers.push('Platform/data themes unlock telemetry-driven loops.');
    } else {
      pressurePoints.push('No platform or data priorities flagged.');
    }

    if ((params.strategicObjectives?.length || 0) >= 3) {
      score += 4;
      drivers.push('Multi-stage objectives documented for compounding motion.');
    }

    if (!params.targetPartner && !params.partnerPersonas?.length) {
      pressurePoints.push('No anchor partner identified to prime the loop.');
      score -= 4;
    }

    score = clamp(score, 0, 100);
    const sustainingRisk = clamp(100 - score, 5, 85);
    const compoundingHalfLifeMonths = Math.max(6, Math.round(24 - score / 4));

    if (params.targetPartner) {
      loopDesign.push(`Partner onboarding ' shared telemetry ' reinvest in ${params.targetPartner} corridor ' repeat`);
      energySources.push(`Anchor partner trust: ${params.targetPartner}`);
    } else {
      loopDesign.push('Market entry -> activation telemetry -> localized reinvestment -> expanded demand');
    }
    loopDesign.push('Outcome tracing -> playbook refresh -> redeploy capital');

    energySources.push(`Innovation signal ${Math.round(innovation)}/100`);
    energySources.push(`Talent depth ${Math.round(talent)}/100`);

    signals.push(`Digital readiness ${Math.round(digital)}/100`);
    signals.push(`Market access ${Math.round(marketAccess)}/100`);
    signals.push(`${params.partnerCapabilities?.length || 0} partner capabilities instrumented`);

    const recommendation = sustainingRisk > 40
      ? 'Instrument closed-loop KPIs and assign single-threaded owners before scaling spend.'
      : 'Codify compounding playbook, then feed telemetry directly into reinvestment committee.';

    return {
      score,
      band: determineBand(score),
      drivers,
      pressurePoints,
      recommendation,
      dataSources: composite.dataSources,
      loopDesign,
      energySources,
      sustainingRisk,
      compoundingHalfLifeMonths,
      signals
    };
  }

  private static computeLAI(params: ReportParameters, composite: CompositeScoreResult, region?: string): LAIResult {
    const advisoryIndex = clamp(composite.components.riskFactors, 15, 95);
    const observedIndex = clamp(100 - composite.components.politicalStability, 10, 90);
    const gap = advisoryIndex - observedIndex;
    const gapScore = clamp(100 - Math.abs(gap), 0, 100);
    const advisoryBias = gap > 8 ? 'overstated' : gap < -8 ? 'understated' : 'aligned';

    const drivers = [
      `Advisory proxy ${Math.round(advisoryIndex)}/100`,
      `Observed risk proxy ${Math.round(observedIndex)}/100`,
      `Region focus ${regionLabel(params)}`
    ];

    const pressurePoints = advisoryBias === 'overstated'
      ? ['Narrative risk exceeds observed indicators; validate with on-ground telemetry']
      : advisoryBias === 'understated'
        ? ['Observed risk exceeds advisory tone; elevate security posture']
        : [];

    const recommendation = advisoryBias === 'aligned'
      ? 'Maintain current advisory posture; continue quarterly validation.'
      : 'Cross-check advisories with incident telemetry and local partner reporting.';

    return {
      title: `${region || params.country || 'Target Region'} Location Attractiveness`,
      description: `Advisory posture for ${regionLabel(params)} relative to observed risk telemetry.`,
      components: ['Governance', 'Stability', 'Operational Risk'],
      score: gapScore,
      band: determineBand(gapScore),
      drivers,
      pressurePoints,
      recommendation,
      dataSources: composite.dataSources,
      advisoryBias,
      gapScore
    };
  }

  private static computeSAE(params: ReportParameters, composite: CompositeScoreResult): SAEResult {
    const regulatory = clamp(composite.components.regulatory, 10, 95);
    const risk = clamp(composite.components.riskFactors, 10, 95);
    const exposureScore = clamp(100 - (regulatory * 0.45 + risk * 0.55), 5, 100);
    const exposureBand: SAEResult['exposureBand'] = exposureScore >= 75 ? 'low' : exposureScore >= 55 ? 'medium' : exposureScore >= 35 ? 'high' : 'critical';

    const watchlists = [] as string[];
    if (params.country) watchlists.push(`${params.country} sanctions screening`);
    if ((params.partnerPersonas?.length || 0) > 0) watchlists.push('Counterparty ownership graph review');

    const requiredControls = [
      'KYC/UBO verification',
      'Transaction monitoring thresholds',
      'Periodic sanctions refresh'
    ];

    const drivers = [
      `Regulatory readiness ${Math.round(regulatory)}/100`,
      `Macro risk load ${Math.round(risk)}/100`
    ];

    const pressurePoints = exposureBand === 'low' ? [] : ['Elevated AML exposure requires enhanced diligence cadence'];
    const recommendation = exposureBand === 'low'
      ? 'Standard AML controls sufficient; maintain quarterly reviews.'
      : 'Activate enhanced AML review and independent sanctions screening before term sheet.';

    return {
      score: exposureScore,
      band: determineBand(exposureScore),
      drivers,
      pressurePoints,
      recommendation,
      dataSources: composite.dataSources,
      exposureBand,
      watchlists,
      requiredControls
    };
  }

  private static computePPL(params: ReportParameters, composite: CompositeScoreResult, easeOfBusiness?: number | null): PPLResult {
    const regulatory = clamp(composite.components.regulatory, 15, 95);
    const ease = easeOfBusiness ?? 60;
    const approvalProbability = clamp(Math.round((regulatory * 0.6 + ease * 0.4)), 10, 95);
    const baseLead = Math.round(180 - (regulatory + ease) * 0.9);
    const p50 = clamp(baseLead, 45, 240);
    const p90 = clamp(Math.round(p50 * 1.6), 90, 360);

    const criticalAgencies = [
      'Investment authority',
      'Sector regulator',
      params.industry?.[0] ? `${params.industry[0]} licensing board` : 'Local licensing board'
    ];

    const drivers = [
      `Regulatory readiness ${Math.round(regulatory)}/100`,
      `Ease of business ${Math.round(ease)}/100`
    ];

    const pressurePoints = approvalProbability < 55 ? ['Permit probability below baseline; prepare contingency phasing'] : [];
    const recommendation = approvalProbability >= 70
      ? 'Submit consolidated approval pack to compress agency cycle time.'
      : 'Engage local counsel early and stage approvals to protect timeline.';

    return {
      score: approvalProbability,
      band: determineBand(approvalProbability),
      drivers,
      pressurePoints,
      recommendation,
      dataSources: composite.dataSources,
      approvalProbability,
      leadTimeDays: { p50, p90 },
      criticalAgencies
    };
  }

  private static computeCLO(params: ReportParameters, composite: CompositeScoreResult): CLOResult {
    const sustainability = clamp(composite.components.sustainability, 10, 95);
    const stakeholderFactor = clamp((params.stakeholderAlignment?.length || 0) * 6, 0, 30);
    const score = clamp(Math.round(sustainability * 0.7 + stakeholderFactor * 0.3), 10, 98);
    const licenseBand: CLOResult['licenseBand'] = score >= 75 ? 'secure' : score >= 55 ? 'watch' : 'fragile';

    const grievanceSignals = score < 60 ? ['Community benefit narrative not yet anchored'] : [];
    const engagementActions = [
      'Map community stakeholders and influence nodes',
      'Publish localized benefit statement',
      'Schedule quarterly townhall feedback loops'
    ];

    const drivers = [
      `Sustainability index ${Math.round(sustainability)}/100`,
      `Stakeholder alignment count ${params.stakeholderAlignment?.length || 0}`
    ];

    const pressurePoints = licenseBand === 'fragile' ? ['License risk elevated; require community engagement sprint'] : [];
    const recommendation = licenseBand === 'secure'
      ? 'Maintain community transparency dashboard; monitor sentiment quarterly.'
      : 'Invest in local engagement plan before capital deployment.';

    return {
      score,
      band: determineBand(score),
      drivers,
      pressurePoints,
      recommendation,
      dataSources: composite.dataSources,
      licenseBand,
      engagementActions,
      grievanceSignals
    };
  }

  private static computeDVS(params: ReportParameters, composite: CompositeScoreResult): DVSResult {
    const drivers = ['Volume', 'Price', 'Cost', 'FX'];
    const impacts = drivers.map((driver, idx) => ({
      driver,
      impactScore: clamp(Math.round(40 + (idx * 17 + 7) % 56 + (composite.components.marketAccess - 60) * 0.2), 10, 100)
    }));

    const ranked = impacts.sort((a, b) => b.impactScore - a.impactScore);
    const topLevers = ranked.slice(0, 3).map(r => `${r.driver} sensitivity ${r.impactScore}/100`);
    const score = Math.round(ranked.reduce((sum, r) => sum + r.impactScore, 0) / ranked.length);

    return {
      score: clamp(score, 0, 100),
      band: determineBand(score),
      drivers: ranked.map(r => `${r.driver} impact ${r.impactScore}/100`),
      pressurePoints: score < 55 ? ['Valuation highly sensitive to core drivers; hedge exposures'] : [],
      recommendation: score >= 65 ? 'Prioritize top two levers in valuation model negotiations.' : 'Deploy hedges or phased pricing to buffer valuation swings.',
      dataSources: composite.dataSources,
      sensitivityRanked: ranked,
      topLevers
    };
  }

  private static computeCSR(params: ReportParameters, composite: CompositeScoreResult, inflation?: number | null): CSRResult {
    const risk = clamp(composite.components.riskFactors, 15, 95);
    const inflationScore = clamp(100 - (inflation ?? 5) * 4, 40, 95);
    const resilienceScore = clamp(Math.round((100 - risk) * 0.6 + inflationScore * 0.4), 10, 98);
    const resilienceBand: CSRResult['resilienceBand'] = resilienceScore >= 75 ? 'strong' : resilienceScore >= 55 ? 'moderate' : 'weak';
    const covenantHeadroom = clamp(Math.round(resilienceScore - 15), 5, 90);

    const stressFactors = [] as string[];
    if (resilienceScore < 60) stressFactors.push('Debt service coverage compresses under rate shock');
    if ((params.currency || '').toUpperCase() !== 'USD') stressFactors.push('FX exposure requires hedge collar');

    const drivers = [
      `Risk load ${Math.round(risk)}/100`,
      `Inflation resilience ${Math.round(inflationScore)}/100`
    ];

    const pressurePoints = resilienceBand === 'weak' ? ['Capital stack requires structural de-risking'] : [];
    const recommendation = resilienceBand === 'strong'
      ? 'Maintain current capital mix; monitor covenants quarterly.'
      : 'Rebalance capital stack with longer tenor or partial guarantees.';

    return {
      score: resilienceScore,
      band: determineBand(resilienceScore),
      drivers,
      pressurePoints,
      recommendation,
      dataSources: composite.dataSources,
      resilienceBand,
      covenantHeadroom,
      stressFactors
    };
  }
}

const regionLabel = (params: ReportParameters) => params.region || params.country || 'target market';

export const MissingFormulasEngine = AdvancedIndexService;
export default AdvancedIndexService;

