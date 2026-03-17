export interface IntelligenceQualityAssessment {
  score: number;
  decision: 'publish' | 'degrade' | 'needs-review';
  reasons: string[];
  strengths: string[];
  evidenceCoverage: {
    hasIndices: boolean;
    hasHistorical: boolean;
    hasLiveData: boolean;
    hasAdversarial: boolean;
    hasPartners: boolean;
    hasCompliance: boolean;
  };
}

export interface IntelligenceQualityInput {
  indices?: unknown;
  historicalPatterns?: unknown[] | null;
  historicalParallels?: { matches?: unknown[] } | null;
  externalData?: {
    gdp?: number;
    gdpGrowth?: number;
    costOfLiving?: number;
    crimeIndex?: number;
    companyRecord?: unknown;
  } | null;
  adversarial?: {
    contradictionIndex?: number;
    topRisks?: string[];
    topOpportunities?: string[];
    escalations?: string[];
  } | null;
  rankedPartners?: unknown[] | null;
  compliance?: unknown;
  gateStatus?: { isReady?: boolean; missing?: string[] } | null;
  reactiveOpportunities?: unknown[] | null;
  reactiveRisks?: unknown[] | null;
}

export class IntelligenceQualityGate {
  static assess(input: IntelligenceQualityInput): IntelligenceQualityAssessment {
    let score = 100;
    const reasons: string[] = [];
    const strengths: string[] = [];

    const hasHistorical = Boolean((input.historicalPatterns && input.historicalPatterns.length > 0) || (input.historicalParallels?.matches && input.historicalParallels.matches.length > 0));
    const hasLiveData = Boolean(
      input.externalData && (
        input.externalData.gdp !== undefined ||
        input.externalData.gdpGrowth !== undefined ||
        input.externalData.costOfLiving !== undefined ||
        input.externalData.crimeIndex !== undefined ||
        input.externalData.companyRecord
      )
    );
    const hasAdversarial = Boolean(input.adversarial);
    const hasPartners = Boolean(input.rankedPartners && input.rankedPartners.length > 0);
    const hasCompliance = Boolean(input.compliance);
    const hasIndices = Boolean(input.indices);

    if (hasIndices) strengths.push('Strategic indices are available.');
    else {
      score -= 18;
      reasons.push('Core strategic indices are missing.');
    }

    if (hasHistorical) strengths.push('Historical precedent support is present.');
    else {
      score -= 14;
      reasons.push('No historical precedent evidence was attached.');
    }

    if (hasLiveData) strengths.push('Live or external data signals are present.');
    else {
      score -= 14;
      reasons.push('No live external data signals were available.');
    }

    if (hasAdversarial) strengths.push('Adversarial review has been run.');
    else {
      score -= 12;
      reasons.push('No adversarial challenge layer was attached.');
    }

    if (hasPartners) strengths.push('Partner intelligence was incorporated.');
    else {
      score -= 8;
      reasons.push('No ranked partner intelligence was attached.');
    }

    if (hasCompliance) strengths.push('Compliance analysis is present.');
    else {
      score -= 8;
      reasons.push('Compliance review is missing.');
    }

    if (input.gateStatus && input.gateStatus.isReady === false) {
      score -= Math.min(16, 4 + ((input.gateStatus.missing?.length || 0) * 2));
      reasons.push(`Consultant gate is incomplete${input.gateStatus.missing?.length ? `: ${input.gateStatus.missing.join(', ')}` : ''}.`);
    }

    const contradictionIndex = input.adversarial?.contradictionIndex ?? 0;
    if (contradictionIndex >= 75) {
      score -= 20;
      reasons.push(`High contradiction index detected (${contradictionIndex}/100).`);
    } else if (contradictionIndex >= 55) {
      score -= 10;
      reasons.push(`Moderate contradiction index detected (${contradictionIndex}/100).`);
    }

    if ((input.adversarial?.escalations?.length || 0) > 0) {
      score -= 10;
      reasons.push(`Critical escalations present: ${input.adversarial?.escalations?.slice(0, 3).join('; ')}.`);
    }

    if ((input.reactiveRisks?.length || 0) > 0 && (input.reactiveOpportunities?.length || 0) === 0) {
      score -= 6;
      reasons.push('Reactive risk signals are present without balancing opportunity signals.');
    }

    score = Math.max(0, Math.min(100, score));

    const decision = score >= 78
      ? 'publish'
      : score >= 58
        ? 'degrade'
        : 'needs-review';

    return {
      score,
      decision,
      reasons,
      strengths,
      evidenceCoverage: {
        hasIndices,
        hasHistorical,
        hasLiveData,
        hasAdversarial,
        hasPartners,
        hasCompliance,
      }
    };
  }

  static formatForPrompt(assessment: IntelligenceQualityAssessment): string {
    const lines = [
      '### ── INTELLIGENCE QUALITY GATE ──',
      `**Decision:** ${assessment.decision.toUpperCase()} | **Quality Score:** ${assessment.score}/100`
    ];

    if (assessment.strengths.length > 0) {
      lines.push('**Strengths:**');
      assessment.strengths.slice(0, 4).forEach((item) => lines.push(`- ${item}`));
    }

    if (assessment.reasons.length > 0) {
      lines.push('**Quality Risks / Gaps:**');
      assessment.reasons.slice(0, 5).forEach((item) => lines.push(`- ${item}`));
    }

    return lines.join('\n');
  }
}

export default IntelligenceQualityGate;