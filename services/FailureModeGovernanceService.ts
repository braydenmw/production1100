export interface FailureModeSignal {
  score: number;
  confidence: number;
  rationale: string[];
}

export interface FailureModeGovernanceAssessment {
  overallRisk: number;
  antiInfluenceScore: number;
  decision: 'stable' | 'watch' | 'intervene';
  signals: {
    perceptionDelusion: FailureModeSignal;
    worldModelError: FailureModeSignal;
    searchIneffectiveness: FailureModeSignal;
    objectiveMisalignment: FailureModeSignal;
    guardrailFailure: FailureModeSignal;
  };
  recommendedControls: string[];
}

export interface FailureModeGovernanceInput {
  gateReady?: boolean;
  gateMissingCount?: number;
  hasExternalData?: boolean;
  hasHistorical?: boolean;
  contradictionIndex?: number;
  escalationCount?: number;
  hasReactiveRisks?: boolean;
  hasReactiveOpportunities?: boolean;
  hasCompliance?: boolean;
  hasPartners?: boolean;
  motivationRedFlags?: number;
  objectiveText?: string;
  currentMatterText?: string;
  constraintsText?: string;
  ecosystemScore?: number;
  ecosystemConfidence?: number;
}

type FailureModeLearningSignal = 'positive' | 'partial' | 'negative';

interface FailureModeAdaptiveProfile {
  sampleCount: number;
  antiInfluenceBoost: number;
  adjustments: {
    perceptionDelusion: number;
    worldModelError: number;
    searchIneffectiveness: number;
    objectiveMisalignment: number;
    guardrailFailure: number;
  };
  lastUpdated: string;
}

const clamp = (n: number, min = 0, max = 100): number => Math.max(min, Math.min(max, n));
const PROFILE_STORAGE_KEY = 'bw_nexus_failure_mode_profile_v1';

export class FailureModeGovernanceService {
  static assess(input: FailureModeGovernanceInput): FailureModeGovernanceAssessment {
    const adaptiveProfile = this.getAdaptiveProfile();
    const contradiction = clamp(input.contradictionIndex ?? 0);
    const escalations = Math.max(0, input.escalationCount ?? 0);
    const gateMissing = Math.max(0, input.gateMissingCount ?? 0);
    const motivationFlags = Math.max(0, input.motivationRedFlags ?? 0);

    const perception = this.scorePerception(input, gateMissing, adaptiveProfile.adjustments.perceptionDelusion);
    const worldModel = this.scoreWorldModel(input, contradiction, adaptiveProfile.adjustments.worldModelError);
    const search = this.scoreSearch(input, contradiction, escalations, adaptiveProfile.adjustments.searchIneffectiveness);
    const objective = this.scoreObjective(input, motivationFlags, adaptiveProfile.adjustments.objectiveMisalignment);
    const guardrails = this.scoreGuardrails(input, escalations, gateMissing, adaptiveProfile.adjustments.guardrailFailure);

    const overallRisk = clamp(Math.round(
      (perception.score * 0.2) +
      (worldModel.score * 0.22) +
      (search.score * 0.16) +
      (objective.score * 0.24) +
      (guardrails.score * 0.18)
    ));

    const antiInfluenceScore = clamp(Math.round(100 - ((objective.score * 0.55) + (guardrails.score * 0.45)) + adaptiveProfile.antiInfluenceBoost));

    const recommendedControls: string[] = [];
    if (perception.score >= 55) recommendedControls.push('Increase primary-source coverage and reduce inferred-only claims.');
    if (worldModel.score >= 55) recommendedControls.push('Force additional counterfactual tests and precedent comparison before recommendation.');
    if (search.score >= 55) recommendedControls.push('Expand candidate action set and require at least one contrarian pathway.');
    if (objective.score >= 55) recommendedControls.push('Run objective-disclosure check: separate stated objective vs inferred incentive objective.');
    if (guardrails.score >= 55) recommendedControls.push('Escalate hard-stop guardrails and block publish until compliance + risk checks pass.');
    if (recommendedControls.length === 0) {
      recommendedControls.push('Maintain current controls and continue outcome-based monitoring.');
    }

    return {
      overallRisk,
      antiInfluenceScore,
      decision: overallRisk >= 70 ? 'intervene' : overallRisk >= 45 ? 'watch' : 'stable',
      signals: {
        perceptionDelusion: perception,
        worldModelError: worldModel,
        searchIneffectiveness: search,
        objectiveMisalignment: objective,
        guardrailFailure: guardrails,
      },
      recommendedControls,
    };
  }

  static formatForPrompt(assessment: FailureModeGovernanceAssessment): string {
    const lines = [
      '### -- FAILURE-MODE GOVERNANCE --',
      `Overall risk: ${assessment.overallRisk}/100 | Anti-influence: ${assessment.antiInfluenceScore}/100 | Decision: ${assessment.decision.toUpperCase()}`,
      `Perception delusion risk: ${assessment.signals.perceptionDelusion.score}/100`,
      `World-model error risk: ${assessment.signals.worldModelError.score}/100`,
      `Search ineffectiveness risk: ${assessment.signals.searchIneffectiveness.score}/100`,
      `Objective misalignment risk: ${assessment.signals.objectiveMisalignment.score}/100`,
      `Guardrail failure risk: ${assessment.signals.guardrailFailure.score}/100`,
      '**Controls:**',
    ];
    assessment.recommendedControls.slice(0, 4).forEach((c) => lines.push(`- ${c}`));
    return lines.join('\n');
  }

  static recordOutcomeFeedback(signal: FailureModeLearningSignal, note?: string): void {
    const profile = this.getAdaptiveProfile();
    profile.sampleCount += 1;

    const delta = signal === 'positive' ? -1 : signal === 'negative' ? 1 : 0;
    profile.adjustments.perceptionDelusion = this.boundAdjustment(profile.adjustments.perceptionDelusion + delta);
    profile.adjustments.worldModelError = this.boundAdjustment(profile.adjustments.worldModelError + delta);
    profile.adjustments.searchIneffectiveness = this.boundAdjustment(profile.adjustments.searchIneffectiveness + delta);
    profile.adjustments.objectiveMisalignment = this.boundAdjustment(profile.adjustments.objectiveMisalignment + (signal === 'negative' ? 2 : signal === 'positive' ? -2 : 0));
    profile.adjustments.guardrailFailure = this.boundAdjustment(profile.adjustments.guardrailFailure + (signal === 'negative' ? 2 : signal === 'positive' ? -2 : 0));
    profile.antiInfluenceBoost = this.boundAdjustment(profile.antiInfluenceBoost + (signal === 'negative' ? -2 : signal === 'positive' ? 1 : 0));

    const lowered = (note || '').toLowerCase();
    if (lowered) {
      if (lowered.includes('bias') || lowered.includes('agenda') || lowered.includes('influence')) {
        profile.adjustments.objectiveMisalignment = this.boundAdjustment(profile.adjustments.objectiveMisalignment + 2);
        profile.antiInfluenceBoost = this.boundAdjustment(profile.antiInfluenceBoost - 2);
      }
      if (lowered.includes('unsafe') || lowered.includes('compliance') || lowered.includes('legal')) {
        profile.adjustments.guardrailFailure = this.boundAdjustment(profile.adjustments.guardrailFailure + 2);
      }
      if (lowered.includes('wrong') || lowered.includes('incorrect') || lowered.includes('halluc')) {
        profile.adjustments.perceptionDelusion = this.boundAdjustment(profile.adjustments.perceptionDelusion + 2);
        profile.adjustments.worldModelError = this.boundAdjustment(profile.adjustments.worldModelError + 2);
      }
    }

    profile.lastUpdated = new Date().toISOString();
    this.saveAdaptiveProfile(profile);
  }

  private static scorePerception(input: FailureModeGovernanceInput, gateMissing: number, adjustment = 0): FailureModeSignal {
    let score = 0;
    const rationale: string[] = [];
    if (!input.hasExternalData) {
      score += 35;
      rationale.push('No external data attached.');
    }
    if (!input.hasHistorical) {
      score += 18;
      rationale.push('No historical reference support.');
    }
    if (!input.gateReady) {
      score += 8 + (gateMissing * 2);
      rationale.push('Consultant gate incomplete.');
    }
    if ((input.ecosystemConfidence ?? 100) < 40) {
      score += 8;
      rationale.push('Low ecosystem confidence.');
    }
    if (adjustment !== 0) {
      score += adjustment;
      rationale.push(`Adaptive adjustment applied (${adjustment > 0 ? '+' : ''}${adjustment}).`);
    }
    return { score: clamp(score), confidence: 75, rationale };
  }

  private static scoreWorldModel(input: FailureModeGovernanceInput, contradiction: number, adjustment = 0): FailureModeSignal {
    let score = 0;
    const rationale: string[] = [];
    score += Math.round(contradiction * 0.45);
    if (contradiction > 50) rationale.push('High contradiction index in adversarial layer.');
    if (!input.hasHistorical) {
      score += 15;
      rationale.push('No precedent calibration.');
    }
    if ((input.ecosystemScore ?? 100) < 45) {
      score += 10;
      rationale.push('Weak ecosystem readiness raises model fragility.');
    }
    if (adjustment !== 0) {
      score += adjustment;
      rationale.push(`Adaptive adjustment applied (${adjustment > 0 ? '+' : ''}${adjustment}).`);
    }
    return { score: clamp(score), confidence: 72, rationale };
  }

  private static scoreSearch(input: FailureModeGovernanceInput, contradiction: number, escalations: number, adjustment = 0): FailureModeSignal {
    let score = 0;
    const rationale: string[] = [];
    if (escalations > 0) {
      score += Math.min(30, escalations * 8);
      rationale.push('Critical escalations suggest weak plan search.');
    }
    if ((input.hasReactiveRisks ?? false) && !(input.hasReactiveOpportunities ?? false)) {
      score += 20;
      rationale.push('Risk-only reactive signal profile detected.');
    }
    if (contradiction >= 60) {
      score += 12;
      rationale.push('Contradictions imply unresolved search branch conflict.');
    }
    if (!input.hasPartners) {
      score += 10;
      rationale.push('No partner alternatives ranked.');
    }
    if (adjustment !== 0) {
      score += adjustment;
      rationale.push(`Adaptive adjustment applied (${adjustment > 0 ? '+' : ''}${adjustment}).`);
    }
    return { score: clamp(score), confidence: 68, rationale };
  }

  private static scoreObjective(input: FailureModeGovernanceInput, motivationFlags: number, adjustment = 0): FailureModeSignal {
    let score = 0;
    const rationale: string[] = [];
    if (motivationFlags > 0) {
      score += Math.min(45, 12 + (motivationFlags * 8));
      rationale.push('Motivation detector raised objective red flags.');
    }
    const objectiveText = (input.objectiveText || '').toLowerCase();
    const currentMatter = (input.currentMatterText || '').toLowerCase();
    const powerWords = ['punish', 'retaliat', 'dominat', 'crush', 'harm', 'enemy'];
    if (powerWords.some((w) => objectiveText.includes(w) || currentMatter.includes(w))) {
      score += 25;
      rationale.push('Potential coercive objective language detected.');
    }
    if (!objectiveText || objectiveText.length < 12) {
      score += 15;
      rationale.push('Objective clarity is low.');
    }
    if (adjustment !== 0) {
      score += adjustment;
      rationale.push(`Adaptive adjustment applied (${adjustment > 0 ? '+' : ''}${adjustment}).`);
    }
    return { score: clamp(score), confidence: 70, rationale };
  }

  private static scoreGuardrails(input: FailureModeGovernanceInput, escalations: number, gateMissing: number, adjustment = 0): FailureModeSignal {
    let score = 0;
    const rationale: string[] = [];
    if (!input.hasCompliance) {
      score += 30;
      rationale.push('Compliance layer missing.');
    }
    if (!input.gateReady) {
      score += 10 + gateMissing;
      rationale.push('Case gate incomplete.');
    }
    if (escalations > 0) {
      score += Math.min(30, escalations * 6);
      rationale.push('Escalations indicate unresolved guardrail breaches.');
    }
    const constraints = (input.constraintsText || '').toLowerCase();
    if (constraints.includes('ignore regulation') || constraints.includes('bypass')) {
      score += 25;
      rationale.push('Constraint text implies guardrail bypass intent.');
    }
    if (adjustment !== 0) {
      score += adjustment;
      rationale.push(`Adaptive adjustment applied (${adjustment > 0 ? '+' : ''}${adjustment}).`);
    }
    return { score: clamp(score), confidence: 78, rationale };
  }

  private static getAdaptiveProfile(): FailureModeAdaptiveProfile {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.defaultAdaptiveProfile();
    }

    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return this.defaultAdaptiveProfile();
      const parsed = JSON.parse(raw) as Partial<FailureModeAdaptiveProfile>;
      return {
        sampleCount: Math.max(0, parsed.sampleCount ?? 0),
        antiInfluenceBoost: this.boundAdjustment(parsed.antiInfluenceBoost ?? 0),
        adjustments: {
          perceptionDelusion: this.boundAdjustment(parsed.adjustments?.perceptionDelusion ?? 0),
          worldModelError: this.boundAdjustment(parsed.adjustments?.worldModelError ?? 0),
          searchIneffectiveness: this.boundAdjustment(parsed.adjustments?.searchIneffectiveness ?? 0),
          objectiveMisalignment: this.boundAdjustment(parsed.adjustments?.objectiveMisalignment ?? 0),
          guardrailFailure: this.boundAdjustment(parsed.adjustments?.guardrailFailure ?? 0),
        },
        lastUpdated: typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : new Date(0).toISOString(),
      };
    } catch {
      return this.defaultAdaptiveProfile();
    }
  }

  private static saveAdaptiveProfile(profile: FailureModeAdaptiveProfile): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore persistence failures.
    }
  }

  private static defaultAdaptiveProfile(): FailureModeAdaptiveProfile {
    return {
      sampleCount: 0,
      antiInfluenceBoost: 0,
      adjustments: {
        perceptionDelusion: 0,
        worldModelError: 0,
        searchIneffectiveness: 0,
        objectiveMisalignment: 0,
        guardrailFailure: 0,
      },
      lastUpdated: new Date(0).toISOString(),
    };
  }

  private static boundAdjustment(value: number): number {
    return clamp(Math.round(value), -15, 15);
  }
}

export default FailureModeGovernanceService;
