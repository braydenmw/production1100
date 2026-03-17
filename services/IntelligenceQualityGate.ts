import type { FailureModeGovernanceAssessment } from './FailureModeGovernanceService';

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
  researchEcosystem?: { ecosystemReadinessScore?: number; confidence?: number } | null;
  failureModeGovernance?: FailureModeGovernanceAssessment | null;
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

    const ecosystemScore = input.researchEcosystem?.ecosystemReadinessScore;
    const ecosystemConfidence = input.researchEcosystem?.confidence ?? 0;
    if (ecosystemScore !== undefined) {
      if (ecosystemScore >= 70) {
        strengths.push(`Research ecosystem readiness is strong (${ecosystemScore}/100).`);
      } else if (ecosystemScore < 45) {
        score -= 8;
        reasons.push(`Research ecosystem readiness is weak (${ecosystemScore}/100), raising execution risk.`);
      }
      if (ecosystemConfidence < 40) {
        score -= 4;
        reasons.push(`Research ecosystem score confidence is low (${ecosystemConfidence}/100).`);
      }
    }

    const failureGovernance = input.failureModeGovernance;
    if (failureGovernance) {
      if (failureGovernance.overallRisk >= 75) {
        score -= 18;
        reasons.push(`Failure-mode governance flagged high systemic risk (${failureGovernance.overallRisk}/100).`);
      } else if (failureGovernance.overallRisk >= 55) {
        score -= 10;
        reasons.push(`Failure-mode governance flagged moderate systemic risk (${failureGovernance.overallRisk}/100).`);
      } else {
        strengths.push(`Failure-mode governance risk is controlled (${failureGovernance.overallRisk}/100).`);
      }

      if (failureGovernance.antiInfluenceScore < 45) {
        score -= 10;
        reasons.push(`Anti-influence resilience is weak (${failureGovernance.antiInfluenceScore}/100).`);
      } else if (failureGovernance.antiInfluenceScore >= 70) {
        strengths.push(`Anti-influence resilience is strong (${failureGovernance.antiInfluenceScore}/100).`);
      }

      const objectiveRisk = failureGovernance.signals.objectiveMisalignment.score;
      const guardrailRisk = failureGovernance.signals.guardrailFailure.score;
      if (objectiveRisk >= 70) {
        score -= 12;
        reasons.push(`Objective misalignment risk is high (${objectiveRisk}/100).`);
      }
      if (guardrailRisk >= 70) {
        score -= 10;
        reasons.push(`Guardrail failure risk is high (${guardrailRisk}/100).`);
      }
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