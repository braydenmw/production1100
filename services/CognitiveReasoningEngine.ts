/**
 * COGNITIVE REASONING ENGINE
 * 
 * Models 12 human cognitive processes that standard AI lacks when solving
 * economic, partnership, and investment problems.
 * 
 * THE HUMAN BRAIN INSIGHT:
 * When humans solve complex economic problems, they don't just run formulas.
 * They use intuition, emotional intelligence, pattern-completion, analogical
 * reasoning, perspective-taking, and — critically — they strip problems back
 * to their core truth. At the centre of every complicated economic matter is
 * a simple problem with a simple answer. Humans complicate it with politics,
 * ego, fear, and bureaucracy. This engine strips that away.
 * 
 * WHAT AI TYPICALLY MISSES:
 * 1. Gut instinct (fast heuristic pattern matching from sparse signals)
 * 2. Emotional read (stakeholder fear/greed/ego detection)
 * 3. Analogical transfer (solving by mapping to a completely different domain)
 * 4. Perspective rotation (seeing through each party's eyes simultaneously)
 * 5. Core truth extraction (stripping complexity to find the real problem)
 * 6. Sunk cost recognition (what they should abandon but won't)
 * 7. Trust calibration (who is actually trustworthy vs who just looks it)
 * 8. Temporal patience modelling (short-term pain for long-term gain)
 * 9. Relationship dynamics (power, dependency, leverage, chemistry)
 * 10. Creative recombination (solutions from combining unrelated ideas)
 * 11. Failure pre-mortem (imagine you failed — why did you fail?)
 * 12. The "obvious" solution nobody tried (simplest path bias override)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CognitiveInsight {
  layer: string;
  finding: string;
  confidence: number; // 0-100
  actionable: boolean;
  recommendation?: string;
}

export interface CoreTruthResult {
  /** The real problem, stated in one sentence */
  coreProblem: string;
  /** The real answer, stated in one sentence */
  coreAnswer: string;
  /** What's actually blocking the obvious solution */
  realBlocker: string;
  /** What human complications are making this harder than it is */
  humanComplications: string[];
  /** The "obvious" solution no one is considering */
  obviousSolution: string;
  /** Confidence that this is the true core issue */
  confidence: number;
}

export interface RelationshipDynamics {
  powerBalance: 'balanced' | 'lopsided-initiator' | 'lopsided-target' | 'unclear';
  dependencyRisk: 'low' | 'medium' | 'high' | 'critical';
  leverageHolder: 'initiator' | 'target' | 'shared' | 'external';
  trustSignals: string[];
  redFlags: string[];
  chemistryFactors: string[];
}

export interface TemporalPatience {
  shortTermPain: string[];
  longTermGain: string[];
  breakEvenHorizon: string;
  patienceRequired: 'low' | 'medium' | 'high' | 'extreme';
  abandonmentRisk: string;
}

export interface PreMortemResult {
  failureScenarios: Array<{ scenario: string; probability: number; preventable: boolean }>;
  mostLikelyFailure: string;
  blindSpot: string;
  whatEveryoneIgnores: string;
}

export interface CognitiveAnalysis {
  coreTruth: CoreTruthResult;
  insights: CognitiveInsight[];
  relationships: RelationshipDynamics;
  temporalPatience: TemporalPatience;
  preMortem: PreMortemResult;
  analogies: string[];
  emotionalRead: string[];
  creativeSolutions: string[];
  /** New formulas computed by this engine */
  newFormulas: Record<string, FormulaResult>;
  /** Overall cognitive confidence — how well the brain "understood" this */
  cognitiveConfidence: number;
}

export interface FormulaResult {
  value: number;
  interpretation: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const grade = (s: number): 'A' | 'B' | 'C' | 'D' | 'F' => s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 55 ? 'C' : s >= 40 ? 'D' : 'F';

function hasKeyword(text: string, ...words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some(w => lower.includes(w));
}

function countKeywords(text: string, ...words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
}

// ─── Core Truth Extraction ────────────────────────────────────────────────────
// "At the core, the problem and solution are the same. The answer lies within."
// Strip away every layer of human complication to find the irreducible kernel.

function extractCoreTruth(query: string, params: any): CoreTruthResult {
  const q = query.toLowerCase();
  const humanComplications: string[] = [];
  let coreProblem = '';
  let coreAnswer = '';
  let realBlocker = '';
  let obviousSolution = '';
  let confidence = 50;

  // Detect what humans are complicating
  if (hasKeyword(q, 'politic', 'government', 'regulation', 'bureaucra'))
    humanComplications.push('Political/regulatory friction is adding layers to a fundamentally simple economic decision');
  if (hasKeyword(q, 'stakeholder', 'board', 'committee', 'approval'))
    humanComplications.push('Decision-by-committee is diluting a clear directional choice');
  if (hasKeyword(q, 'risk', 'concern', 'worried', 'fear', 'uncertain'))
    humanComplications.push('Fear of failure is paralysing what should be a calculated move');
  if (hasKeyword(q, 'compet', 'rival', 'against'))
    humanComplications.push('Competitive ego is distorting rational partnership calculus');
  if (hasKeyword(q, 'legacy', 'tradition', 'always done'))
    humanComplications.push('Institutional inertia — "we have always done it this way" — is blocking a better path');
  if (hasKeyword(q, 'cost', 'expensive', 'budget', 'afford'))
    humanComplications.push('Short-term cost myopia is obscuring long-term value creation');
  if (hasKeyword(q, 'trust', 'reliable', 'honest'))
    humanComplications.push('Trust deficit — solvable with transparent governance structures, not more meetings');

  // Pattern: Partnership questions
  if (hasKeyword(q, 'partner', 'collaborat', 'joint venture', 'alliance', 'together')) {
    coreProblem = 'Two parties need to create more value together than apart — everything else is negotiation detail';
    coreAnswer = 'Define the shared value proposition, align incentives, build exit provisions, and move';
    realBlocker = 'Usually fear of losing control or unequal benefit perception';
    obviousSolution = 'Start with a small pilot project. Prove value before scaling the commitment. 90% of partnership paralysis is solved by "try it small first"';
    confidence = 78;
  }
  // Pattern: Investment / financial decisions
  else if (hasKeyword(q, 'invest', 'fund', 'capital', 'financ', 'money', 'return')) {
    coreProblem = 'Capital needs to flow to where risk-adjusted returns are highest — the rest is timing and structure';
    coreAnswer = 'Calculate the true cost of inaction (not just the cost of action), then the decision makes itself';
    realBlocker = 'Sunk cost fallacy or loss aversion — they are protecting what they have instead of building what they need';
    obviousSolution = 'Run the numbers without emotion. If IRR > WACC and the team can execute, the answer is yes. Everything else is noise.';
    confidence = 82;
  }
  // Pattern: Location / relocation
  else if (hasKeyword(q, 'relocat', 'move', 'location', 'country', 'region', 'city')) {
    coreProblem = 'Finding the location where talent + cost + market access + quality of life intersect optimally';
    coreAnswer = 'Shortlist by hard data, visit the top 3, talk to people who already did it, then commit';
    realBlocker = 'Emotional attachment to current location or fear of the unknown market';
    obviousSolution = 'Send a 3-person scout team for 2 weeks. Ground truth beats 100 reports.';
    confidence = 75;
  }
  // Pattern: Risk / due diligence
  else if (hasKeyword(q, 'risk', 'due diligence', 'compliance', 'sanction', 'danger')) {
    coreProblem = 'Distinguishing real risk from perceived risk — most "risks" are manageable with proper structure';
    coreAnswer = 'Quantify each risk, price the mitigation, and compare to the opportunity cost of not proceeding';
    realBlocker = 'Risk theatre — performing due diligence for CYA purposes rather than genuine risk management';
    obviousSolution = 'Ask: "What is the worst realistic outcome and can we survive it?" If yes, proceed with guardrails.';
    confidence = 80;
  }
  // Pattern: Strategy / planning
  else if (hasKeyword(q, 'strateg', 'plan', 'roadmap', 'approach', 'framework')) {
    coreProblem = 'Choosing a direction and committing to it — most strategies fail from indecision, not from choosing wrong';
    coreAnswer = 'Pick the option with the best risk-adjusted upside, set 90-day milestones, and course-correct based on data';
    realBlocker = 'Analysis paralysis — waiting for perfect information that will never arrive';
    obviousSolution = 'Make the decision reversible. If you can undo it in 90 days, just try it.';
    confidence = 76;
  }
  // Default: General economic matter
  else {
    coreProblem = 'An economic actor needs to make a decision with incomplete information and multiple stakeholders';
    coreAnswer = 'Reduce to the single most important variable, optimise for that, then address secondary concerns';
    realBlocker = 'Trying to optimise for everything simultaneously — multi-objective paralysis';
    obviousSolution = 'Rank your priorities 1-3. Solve #1 first. The rest often resolves itself.';
    confidence = 60;
  }

  if (!humanComplications.length) {
    humanComplications.push('No obvious human-complexity layer detected — the problem may genuinely be technical');
  }

  return { coreProblem, coreAnswer, realBlocker, humanComplications, obviousSolution, confidence };
}

// ─── Emotional Read ───────────────────────────────────────────────────────────
// Detect the emotional undercurrent — what are stakeholders FEELING, not just saying

function readEmotionalUndercurrent(query: string, params: any): string[] {
  const q = query.toLowerCase();
  const reads: string[] = [];

  if (hasKeyword(q, 'urgent', 'asap', 'immediate', 'quickly', 'rush'))
    reads.push('URGENCY PRESSURE — Someone is under time pressure. Check if this is real urgency or manufactured pressure to force a decision');
  if (hasKeyword(q, 'concern', 'worried', 'risk', 'danger', 'afraid'))
    reads.push('FEAR SIGNAL — Anxiety is present. Address the specific fear directly before proposing solutions');
  if (hasKeyword(q, 'opportun', 'potential', 'growth', 'excit', 'amazing'))
    reads.push('OPTIMISM BIAS — Enthusiasm may be clouding risk assessment. Apply contrarian devil\'s advocate check');
  if (hasKeyword(q, 'fail', 'wrong', 'problem', 'issue', 'challenge'))
    reads.push('DAMAGE CONTROL MODE — They may already be recovering from a bad decision. Look for sunk cost traps');
  if (hasKeyword(q, 'compet', 'rival', 'beat', 'ahead', 'lead'))
    reads.push('COMPETITIVE EGO — External rivalry may be driving irrational moves. Check if the "competition" is real or perceived');
  if (hasKeyword(q, 'should', 'best', 'right', 'correct', 'proper'))
    reads.push('VALIDATION SEEKING — They may have already decided and want confirmation, not analysis. Provide honest challenge');
  if (hasKeyword(q, 'everyone', 'trend', 'popular', 'other companies'))
    reads.push('HERD INSTINCT — Following the crowd. The best moves are often contrarian. Examine what others are NOT doing');
  if (hasKeyword(q, 'promise', 'guarantee', 'certain', 'sure'))
    reads.push('CERTAINTY CRAVING — Markets don\'t offer certainty. Reframe from "will it work?" to "can we manage the downside?"');

  if (!reads.length) reads.push('NEUTRAL TONE — No strong emotional signals detected. Proceed with balanced analytical approach');
  return reads;
}

// ─── Analogical Reasoning ─────────────────────────────────────────────────────
// Solve the problem by mapping it to a completely different domain

function generateAnalogies(query: string): string[] {
  const q = query.toLowerCase();
  const analogies: string[] = [];

  if (hasKeyword(q, 'partner', 'alliance', 'merger', 'joint'))
    analogies.push(
      'MARRIAGE ANALOGY: Partnerships are like marriages — shared finances, combined households, need for communication. Pre-nup (exit clauses) prevents messy divorces',
      'SPORTS TEAM ANALOGY: The best partnerships, like championship teams, combine complementary strengths, not duplicate abilities'
    );
  if (hasKeyword(q, 'invest', 'fund', 'capital'))
    analogies.push(
      'FARMING ANALOGY: Investment is planting seeds — you choose the soil (market), tend the crop (management), and accept that weather (macro) is unpredictable. Diversify fields',
      'POKER ANALOGY: Good investors, like poker players, focus on expected value not individual outcomes. Fold bad hands fast, double down on good ones'
    );
  if (hasKeyword(q, 'risk', 'danger', 'threat'))
    analogies.push(
      'IMMUNE SYSTEM ANALOGY: Some risk exposure builds resilience. Over-protection (risk avoidance) creates fragility. Aim for antifragile structures',
      'NAVIGATION ANALOGY: Risk is like weather at sea — you can\'t eliminate it but you can build better ships and choose better routes'
    );
  if (hasKeyword(q, 'relocat', 'move', 'expansion'))
    analogies.push(
      'TRANSPLANT ANALOGY: Like organ transplants, the new environment must "accept" the organisation. Culture match is the immune response',
      'MIGRATION ANALOGY: Birds migrate to where conditions are optimal for survival. Follow the resources, not the familiarity'
    );
  if (hasKeyword(q, 'strateg', 'plan', 'approach'))
    analogies.push(
      'CHESS ANALOGY: Strategy is about controlling the centre (core competency) and thinking 3 moves ahead. Don\'t react — anticipate',
      'JAZZ ANALOGY: The best strategies have structure (chord progressions) but leave room for improvisation when conditions change'
    );
  if (hasKeyword(q, 'growth', 'scale', 'expand'))
    analogies.push(
      'ECOSYSTEM ANALOGY: Growth without a support ecosystem collapses — like trees without mycorrhizal networks. Build the support infrastructure first'
    );

  if (!analogies.length)
    analogies.push('ENGINEERING ANALOGY: Complex problems have force diagrams — identify the load (demand), the supports (resources), and the stress points (constraints). Then reinforce the weakest link');

  return analogies;
}

// ─── Perspective Rotation ─────────────────────────────────────────────────────
// See through every party's eyes simultaneously

function rotatePerspectives(query: string, params: any): CognitiveInsight[] {
  const q = query.toLowerCase();
  const insights: CognitiveInsight[] = [];

  // Always present: the decision-maker's fear
  insights.push({
    layer: 'Perspective: Decision-Maker',
    finding: 'The person asking this question likely needs a defensible answer they can present to superiors. Give them ammunition, not just analysis.',
    confidence: 85,
    actionable: true,
    recommendation: 'Frame recommendations in terms of risk-mitigation and opportunity-capture that can be presented to a board or committee'
  });

  if (hasKeyword(q, 'partner', 'counterpart', 'vendor', 'supplier', 'client')) {
    insights.push({
      layer: 'Perspective: The Other Side',
      finding: 'The counterparty is asking themselves the same questions. They have their own fears, constraints, and stakeholders to please.',
      confidence: 80,
      actionable: true,
      recommendation: 'Map the counterparty\'s likely constraints and fears. Addressing their concerns pre-emptively accelerates deals by 40-60%'
    });
  }

  if (hasKeyword(q, 'country', 'government', 'regulat', 'policy')) {
    insights.push({
      layer: 'Perspective: The Regulator',
      finding: 'Governments optimise for tax revenue, employment, technology transfer, and political optics — in that order.',
      confidence: 75,
      actionable: true,
      recommendation: 'Frame proposals in terms of local job creation and tax contribution. These are the two metrics regulators actually care about'
    });
  }

  if (hasKeyword(q, 'employ', 'worker', 'staff', 'team', 'talent')) {
    insights.push({
      layer: 'Perspective: The Workforce',
      finding: 'Employees care about job security, career growth, and working conditions — not corporate strategy. Change threatens all three.',
      confidence: 82,
      actionable: true,
      recommendation: 'Include explicit workforce transition plans. Ignoring the human element is the #1 cause of initiative failure'
    });
  }

  if (hasKeyword(q, 'communit', 'local', 'social', 'public')) {
    insights.push({
      layer: 'Perspective: The Community',
      finding: 'Local communities judge initiatives by visible impact: jobs, infrastructure, environmental footprint. ROI means nothing to them.',
      confidence: 70,
      actionable: true,
      recommendation: 'Design at least one high-visibility community benefit into the plan. Social license to operate prevents costly opposition'
    });
  }

  return insights;
}

// ─── Sunk Cost & Abandonment Detector ─────────────────────────────────────────

function detectSunkCostTraps(query: string, params: any): CognitiveInsight[] {
  const q = query.toLowerCase();
  const insights: CognitiveInsight[] = [];

  if (hasKeyword(q, 'already invest', 'spent', 'committed', 'so far', 'progress', 'continuing')) {
    insights.push({
      layer: 'Sunk Cost Detection',
      finding: 'SUNK COST TRAP DETECTED — Past expenditure is influencing the forward decision. Only future costs and benefits matter.',
      confidence: 88,
      actionable: true,
      recommendation: 'Re-evaluate the decision as if starting from zero today. Would you invest fresh money in this knowing what you now know?'
    });
  }

  if (hasKeyword(q, 'pivot', 'change direction', 'abandon', 'exit', 'pull out')) {
    insights.push({
      layer: 'Exit Courage Assessment',
      finding: 'Willingness to discuss exit is a sign of mature decision-making — most organisations wait too long to cut losses.',
      confidence: 75,
      actionable: true,
      recommendation: 'Calculate the "continuation cost" (resources to finish) vs "write-off cost" (cut losses now). Often stopping is cheaper'
    });
  }

  return insights;
}

// ─── Trust Calibration ────────────────────────────────────────────────────────

function calibrateTrust(query: string, params: any): CognitiveInsight[] {
  const q = query.toLowerCase();
  const insights: CognitiveInsight[] = [];

  if (hasKeyword(q, 'due diligence', 'verify', 'check', 'validate', 'background')) {
    insights.push({
      layer: 'Trust Calibration',
      finding: 'Due diligence verifies facts but cannot verify intent. Structure agreements to be self-enforcing regardless of trust.',
      confidence: 85,
      actionable: true,
      recommendation: 'Design structures where both parties\' self-interest aligns with the desired outcome. Trust-but-verify is not enough; build trust-proof agreements'
    });
  }

  if (hasKeyword(q, 'government', 'official', 'ministry', 'public sector')) {
    insights.push({
      layer: 'Institutional Trust',
      finding: 'Government commitments survive only if they survive leadership changes. Build multi-stakeholder backing, not single-patron dependency.',
      confidence: 80,
      actionable: true,
      recommendation: 'Anchor agreements to institutional frameworks (laws, treaties, trade agreements) not to individual officials'
    });
  }

  return insights;
}

// ─── Relationship Dynamics ────────────────────────────────────────────────────

function analyzeRelationships(query: string, params: any): RelationshipDynamics {
  const q = query.toLowerCase();

  // Power balance detection
  let powerBalance: RelationshipDynamics['powerBalance'] = 'unclear';
  if (hasKeyword(q, 'negotiate', 'terms', 'deal'))
    powerBalance = 'balanced'; // they're at the table
  if (hasKeyword(q, 'depend', 'rely', 'need them', 'only option'))
    powerBalance = 'lopsided-target'; // target has leverage
  if (hasKeyword(q, 'multiple options', 'alternatives', 'choose from'))
    powerBalance = 'lopsided-initiator'; // initiator has leverage

  // Dependency risk
  let dependencyRisk: RelationshipDynamics['dependencyRisk'] = 'medium';
  if (hasKeyword(q, 'sole', 'single', 'only', 'exclusive')) dependencyRisk = 'critical';
  if (hasKeyword(q, 'diversif', 'multiple', 'several', 'alternative')) dependencyRisk = 'low';

  // Leverage holder
  let leverageHolder: RelationshipDynamics['leverageHolder'] = 'shared';
  if (hasKeyword(q, 'they control', 'their market', 'they have')) leverageHolder = 'target';
  if (hasKeyword(q, 'our technology', 'our capital', 'we bring')) leverageHolder = 'initiator';

  const trustSignals: string[] = [];
  const redFlags: string[] = [];
  const chemistryFactors: string[] = [];

  if (hasKeyword(q, 'track record', 'proven', 'established')) trustSignals.push('Track record evidence exists');
  if (hasKeyword(q, 'transparent', 'open', 'share')) trustSignals.push('Transparency signals present');
  if (hasKeyword(q, 'rush', 'pressure', 'now or never')) redFlags.push('Artificial urgency — classic pressure tactic');
  if (hasKeyword(q, 'exclusive', 'secret', 'confidential')) redFlags.push('Exclusivity demand — may indicate weak competitive position');
  if (hasKeyword(q, 'shared vision', 'aligned', 'common goal')) chemistryFactors.push('Vision alignment detected');
  if (hasKeyword(q, 'culture', 'values', 'style')) chemistryFactors.push('Cultural awareness in discussion — positive signal');

  return { powerBalance, dependencyRisk, leverageHolder, trustSignals, redFlags, chemistryFactors };
}

// ─── Temporal Patience Modelling ──────────────────────────────────────────────

function modelTemporalPatience(query: string, params: any): TemporalPatience {
  const q = query.toLowerCase();
  const shortTermPain: string[] = [];
  const longTermGain: string[] = [];

  if (hasKeyword(q, 'invest', 'capital', 'fund')) {
    shortTermPain.push('Upfront capital deployment with no immediate returns');
    longTermGain.push('Compounding returns and market position that grows exponentially');
  }
  if (hasKeyword(q, 'relocat', 'move', 'expand')) {
    shortTermPain.push('Relocation disruption: productivity loss during transition (typically 6-18 months)');
    longTermGain.push('Structural cost advantage and talent access that compounds over 5-10 years');
  }
  if (hasKeyword(q, 'partner', 'joint venture')) {
    shortTermPain.push('Partnership setup costs: legal, governance, cultural alignment (3-6 months)');
    longTermGain.push('Combined capabilities and market access neither party could achieve alone');
  }
  if (hasKeyword(q, 'train', 'develop', 'build capacity')) {
    shortTermPain.push('Training investment with delayed productivity gains');
    longTermGain.push('Self-sustaining capability that eliminates external dependency');
  }

  if (!shortTermPain.length) {
    shortTermPain.push('Resource allocation and opportunity cost during implementation');
    longTermGain.push('Strategic position improvement and operational efficiency gains');
  }

  const patienceRequired = hasKeyword(q, 'quick', 'fast', 'immediate') ? 'low' as const
    : hasKeyword(q, 'long-term', 'decade', 'generation', 'transform') ? 'extreme' as const
    : hasKeyword(q, 'year', 'gradual', 'phase') ? 'high' as const
    : 'medium' as const;

  return {
    shortTermPain,
    longTermGain,
    breakEvenHorizon: patienceRequired === 'extreme' ? '5-10 years' : patienceRequired === 'high' ? '2-5 years' : patienceRequired === 'medium' ? '1-2 years' : '3-12 months',
    patienceRequired,
    abandonmentRisk: patienceRequired === 'extreme' ? 'HIGH — Long horizon creates multiple off-ramp temptations. Build milestone-based commitment locks.'
      : patienceRequired === 'high' ? 'MODERATE — Set quarterly review gates to maintain momentum and justify continued investment.'
      : 'LOW — Short payback period should sustain stakeholder commitment.'
  };
}

// ─── Pre-Mortem Analysis ──────────────────────────────────────────────────────
// Imagine you are 2 years in the future and this initiative FAILED. Why?

function runPreMortem(query: string, params: any): PreMortemResult {
  const q = query.toLowerCase();
  const scenarios: PreMortemResult['failureScenarios'] = [];

  // Universal failure modes
  scenarios.push({
    scenario: 'Execution failure — the plan was sound but implementation was poor, under-resourced, or poorly managed',
    probability: 35,
    preventable: true
  });
  scenarios.push({
    scenario: 'Stakeholder misalignment — key decision-makers pulled in different directions, causing deadlock or half-measures',
    probability: 25,
    preventable: true
  });

  if (hasKeyword(q, 'partner', 'joint', 'alliance')) {
    scenarios.push({
      scenario: 'Partnership chemistry failure — cultural mismatch or asymmetric commitment caused the relationship to deteriorate',
      probability: 30,
      preventable: true
    });
  }
  if (hasKeyword(q, 'invest', 'fund', 'capital')) {
    scenarios.push({
      scenario: 'Market timing failure — external conditions (recession, policy change, competitor move) made the investment unprofitable',
      probability: 20,
      preventable: false
    });
  }
  if (hasKeyword(q, 'country', 'region', 'government')) {
    scenarios.push({
      scenario: 'Political/regulatory shift — a change in government or policy direction undermined the operating environment',
      probability: 20,
      preventable: false
    });
  }
  if (hasKeyword(q, 'technolog', 'digital', 'innovat')) {
    scenarios.push({
      scenario: 'Technology obsolescence — the solution was overtaken by a faster-moving competitor or paradigm shift',
      probability: 15,
      preventable: false
    });
  }

  scenarios.sort((a, b) => b.probability - a.probability);

  return {
    failureScenarios: scenarios,
    mostLikelyFailure: scenarios[0]?.scenario || 'Execution failure with inadequate resources',
    blindSpot: hasKeyword(q, 'partner') ? 'The counterparty\'s internal politics — what happens when their champion leaves?'
      : hasKeyword(q, 'invest') ? 'Opportunity cost — what else could this capital do? The comparison is rarely rigorous'
      : hasKeyword(q, 'relocat') ? 'Transition knowledge loss — key institutional knowledge walks out the door during moves'
      : 'Second-order effects — the consequences of the consequences are rarely modelled',
    whatEveryoneIgnores: hasKeyword(q, 'partner') ? 'Exit clauses. Everyone plans for success. Almost no one plans for graceful unwinding.'
      : hasKeyword(q, 'invest') ? 'The total cost of management attention. Every investment costs more than money — it costs leadership bandwidth.'
      : hasKeyword(q, 'country', 'region') ? 'Local social dynamics. Data tells you about the economy. It tells you nothing about whether your people will be happy living there.'
      : 'The human element. Spreadsheets don\'t capture morale, burnout, or the departure of one key person who held everything together.'
  };
}

// ─── Creative Recombination ───────────────────────────────────────────────────
// Solutions from combining things nobody thought to combine

function generateCreativeSolutions(query: string, params: any): string[] {
  const q = query.toLowerCase();
  const solutions: string[] = [];

  if (hasKeyword(q, 'partner', 'alliance')) {
    solutions.push('REVERSE PARTNERSHIP: Instead of finding a partner to help you enter their market, find one who wants to enter YOUR market. Mutual market-access swaps eliminate trust asymmetry');
    solutions.push('COMPETITION-TO-PARTNERSHIP CONVERSION: Your strongest competitor may be your best partner. They have exactly the capabilities you lack because they built them to compete with you');
  }
  if (hasKeyword(q, 'invest', 'fund', 'capital')) {
    solutions.push('REVENUE-SHARING INSTEAD OF EQUITY: Avoid the valuation fight entirely. Structure as a revenue share with a cap — alignment without dilution');
    solutions.push('GOVERNMENT CO-INVESTMENT: Many governments have sovereign wealth funds or development banks looking for exactly this type of deal. Co-invest with the country you\'re investing in');
  }
  if (hasKeyword(q, 'relocat', 'move', 'city', 'location')) {
    solutions.push('DISTRIBUTED HUB MODEL: Don\'t move everything. Split functions across 2-3 locations — HQ stays for brand, operations move for cost, R&D moves for talent');
    solutions.push('EMBED-BEFORE-COMMIT: Before full relocation, embed a 5-person team in the target city for 6 months. Build relationships and ground truth before committing infrastructure');
  }
  if (hasKeyword(q, 'risk', 'danger', 'uncertain')) {
    solutions.push('RISK AUCTION: Present the risk to potential partners/insurers. Someone else may see opportunity where you see danger — and pay you to take it');
    solutions.push('ANTI-PORTFOLIO ANALYSIS: Study the deals you DID NOT do. Often the "risky" ones you rejected outperformed the "safe" ones you accepted');
  }
  if (hasKeyword(q, 'growth', 'scale', 'expand')) {
    solutions.push('ACQUIRE THE CUSTOMER: Instead of competing for customers, acquire a company that already has them. Customer relationships are the hardest asset to build');
  }
  if (hasKeyword(q, 'strateg', 'plan')) {
    solutions.push('STRATEGY INVERSION: Define what would guarantee failure, then do the opposite. Inverting the problem often reveals solutions direct analysis misses');
  }

  if (!solutions.length) {
    solutions.push('CONSTRAINT ELIMINATION: List every constraint you believe is fixed. Check which ones you invented vs which ones are truly immovable. Remove one — often the whole problem reshapes');
  }

  return solutions;
}


// ═══════════════════════════════════════════════════════════════════════════════
// NEW FORMULAS — Missing from the standard 46+ suite
// These address gaps in how economic problems are actually solved
// ═══════════════════════════════════════════════════════════════════════════════

function computeNewFormulas(query: string, params: any): Record<string, FormulaResult> {
  const q = query.toLowerCase();
  const results: Record<string, FormulaResult> = {};

  // ── 1. DII — Decision Inertia Index ──
  // Measures how likely stakeholders are to NOT act (the biggest risk in economics)
  // High DII = paralysed by analysis, politics, or fear
  const inertiaFactors = [
    hasKeyword(q, 'stakeholder', 'committee', 'board', 'approval') ? 25 : 0,     // multi-stakeholder drag
    hasKeyword(q, 'risk', 'concern', 'worry', 'uncertain') ? 20 : 0,             // fear factor
    hasKeyword(q, 'complex', 'complicated', 'difficult', 'challeng') ? 15 : 0,   // complexity paralysis
    hasKeyword(q, 'regulat', 'compliance', 'policy', 'government') ? 15 : 0,     // regulatory friction
    hasKeyword(q, 'legacy', 'tradition', 'existing', 'current') ? 10 : 0,        // inertia weight
    hasKeyword(q, 'urgent', 'asap', 'immediate', 'now') ? -20 : 0,               // urgency reduces inertia
    hasKeyword(q, 'clear', 'obvious', 'simple', 'straightforward') ? -15 : 0,    // clarity reduces inertia
  ];
  const diiRaw = clamp(50 + inertiaFactors.reduce((a, b) => a + b, 0), 0, 100);
  results['DII'] = {
    value: diiRaw,
    interpretation: diiRaw >= 70 ? 'HIGH INERTIA — Decision is likely to stall. Simplify options, create urgency, assign a single decision-owner'
      : diiRaw >= 40 ? 'MODERATE INERTIA — Decision can proceed but needs clear facilitation and deadline'
      : 'LOW INERTIA — Good conditions for swift action. Capitalise on momentum',
    grade: grade(100 - diiRaw) // invert: low inertia is good
  };

  // ── 2. PAI — Partnership Asymmetry Index ──
  // Measures how unbalanced a partnership would be (0 = perfect balance)
  if (hasKeyword(q, 'partner', 'alliance', 'joint', 'collaborat', 'together')) {
    const asymmetryFactors = [
      hasKeyword(q, 'dominant', 'larger', 'stronger', 'lead') ? 25 : 0,
      hasKeyword(q, 'small', 'startup', 'junior', 'emerging') ? 20 : 0,
      hasKeyword(q, 'depend', 'need them', 'rely on') ? 20 : 0,
      hasKeyword(q, 'equal', 'balanced', 'mutual', '50/50') ? -30 : 0,
      hasKeyword(q, 'complemen', 'different strength', 'each bring') ? -15 : 0,
    ];
    const paiRaw = clamp(40 + asymmetryFactors.reduce((a, b) => a + b, 0), 0, 100);
    results['PAI'] = {
      value: paiRaw,
      interpretation: paiRaw >= 65 ? 'HIGH ASYMMETRY — Power imbalance may cause resentment. Build protection: minority veto rights, performance milestones, sunset clauses'
        : paiRaw >= 35 ? 'MODERATE ASYMMETRY — Manageable with transparent governance. Define contribution metrics for both sides'
        : 'LOW ASYMMETRY — Good balance. Focus on synergy extraction rather than balance protection',
      grade: grade(100 - paiRaw) // low asymmetry is good
    };
  }

  // ── 3. ICI — Inaction Cost Index ──
  // What does doing NOTHING cost? (often overlooked — humans focus on action costs)
  const inactionFactors = [
    hasKeyword(q, 'compet', 'rival', 'market share', 'losing') ? 25 : 0,        // competitive erosion
    hasKeyword(q, 'opportun', 'window', 'limited time', 'closing') ? 20 : 0,     // opportunity decay
    hasKeyword(q, 'obsolet', 'outdated', 'behind') ? 20 : 0,                    // capability decay
    hasKeyword(q, 'talent', 'people leaving', 'attrition') ? 15 : 0,             // talent bleed
    hasKeyword(q, 'cost rising', 'inflation', 'expensive') ? 15 : 0,             // cost escalation
    hasKeyword(q, 'stable', 'no rush', 'comfortable', 'fine') ? -20 : 0,         // low inaction cost
  ];
  const iciRaw = clamp(35 + inactionFactors.reduce((a, b) => a + b, 0), 0, 100);
  results['ICI'] = {
    value: iciRaw,
    interpretation: iciRaw >= 65 ? 'HIGH INACTION COST — Doing nothing is expensive. Every month of delay erodes position. Accelerate decision timelines'
      : iciRaw >= 35 ? 'MODERATE INACTION COST — There is a cost to waiting but you have some runway. Use it wisely for preparation, not indecision'
      : 'LOW INACTION COST — No urgency penalty. Take time to get the decision right',
    grade: grade(iciRaw) // high inaction cost = high urgency = good score means "proceed"
  };

  // ── 4. SCX — Solution Complexity Index ──  
  // How complex is the solution ACTUALLY vs how complex parties are MAKING it
  const realComplexity = countKeywords(q, 'multi', 'several', 'various', 'complex', 'global', 'cross-border', 'regulatory');
  const perceivedComplexity = countKeywords(q, 'complicated', 'difficult', 'challeng', 'impossible', 'unprecedented', 'never done');
  const scxReal = clamp(realComplexity * 15 + 20, 0, 100);
  const scxPerceived = clamp(perceivedComplexity * 20 + 30, 0, 100);
  const complexityInflation = Math.max(0, scxPerceived - scxReal);
  results['SCX'] = {
    value: complexityInflation,
    interpretation: complexityInflation >= 30 ? `COMPLEXITY INFLATION DETECTED (${complexityInflation}pts) — The problem is being made harder than it is. Strip back to fundamentals`
      : complexityInflation >= 10 ? 'MILD INFLATION — Some unnecessary complexity. Look for simplification opportunities'
      : 'CALIBRATED — Perceived complexity matches actual complexity. Good signal for realistic planning',
    grade: grade(100 - complexityInflation)
  };

  // ── 5. HFI — Human Friction Index ──
  // How much are PEOPLE (not systems) slowing this down
  const frictionFactors = [
    hasKeyword(q, 'politic', 'ego', 'turf', 'territory') ? 25 : 0,
    hasKeyword(q, 'bureaucra', 'process', 'approval', 'committee') ? 20 : 0,
    hasKeyword(q, 'disagree', 'conflict', 'dispute', 'argue') ? 20 : 0,
    hasKeyword(q, 'culture', 'language', 'communication') ? 15 : 0,
    hasKeyword(q, 'trust', 'suspicio', 'doubt') ? 15 : 0,
    hasKeyword(q, 'aligned', 'agreed', 'consensus', 'united') ? -25 : 0,
  ];
  const hfiRaw = clamp(30 + frictionFactors.reduce((a, b) => a + b, 0), 0, 100);
  results['HFI'] = {
    value: hfiRaw,
    interpretation: hfiRaw >= 60 ? 'HIGH HUMAN FRICTION — People dynamics are the primary bottleneck. Address alignment and trust before strategy'
      : hfiRaw >= 35 ? 'MODERATE FRICTION — Normal level. Standard governance and communication protocols should manage it'
      : 'LOW FRICTION — Good human alignment. Rare and valuable — move fast while alignment holds',
    grade: grade(100 - hfiRaw)
  };

  // ── 6. ORI — Opportunity Reversibility Index ──
  // Can you undo this if it goes wrong? Reversible decisions should be made fast
  const irreversibilityFactors = [
    hasKeyword(q, 'permanent', 'irreversible', 'commit', 'bind') ? 25 : 0,
    hasKeyword(q, 'acqui', 'merge', 'buy') ? 20 : 0,                        // M&A is hard to undo
    hasKeyword(q, 'build', 'construct', 'infrastructure') ? 15 : 0,           // physical assets
    hasKeyword(q, 'hire', 'recruit', 'team') ? 10 : 0,                        // people are semi-reversible
    hasKeyword(q, 'pilot', 'test', 'trial', 'experiment') ? -25 : 0,          // reversible by design
    hasKeyword(q, 'lease', 'contract', 'agreement') ? -10 : 0,                // somewhat reversible
  ];
  const oriRaw = clamp(40 + irreversibilityFactors.reduce((a, b) => a + b, 0), 0, 100);
  results['ORI'] = {
    value: 100 - oriRaw,
    interpretation: oriRaw >= 65 ? 'LOW REVERSIBILITY — This is a one-way door. Apply maximum diligence. But once committed, commit fully'
      : oriRaw >= 35 ? 'MODERATE REVERSIBILITY — Can be unwound at cost. Apply normal diligence, set review milestones'
      : 'HIGH REVERSIBILITY — Two-way door. Decide fast, iterate, learn. Speed beats perfection here',
    grade: grade(100 - oriRaw)
  };

  // ── 7. SVG — Stakeholder Value Gap ──
  // Measures misalignment between what each stakeholder values
  const valueGapIndicators = [
    hasKeyword(q, 'disagree', 'different priorities', 'conflict') ? 25 : 0,
    hasKeyword(q, 'short-term', 'long-term') ? 20 : 0,                        // timeframe mismatch
    hasKeyword(q, 'profit', 'social', 'community') ? 15 : 0,                   // value system clash
    hasKeyword(q, 'growth', 'stability', 'risk') ? 15 : 0,                     // appetite mismatch
    hasKeyword(q, 'aligned', 'shared vision', 'common') ? -25 : 0,
  ];
  const svgRaw = clamp(35 + valueGapIndicators.reduce((a, b) => a + b, 0), 0, 100);
  results['SVG'] = {
    value: svgRaw,
    interpretation: svgRaw >= 60 ? 'WIDE VALUE GAP — Stakeholders want different things. Explicit priority negotiation is required before ANY strategy work'
      : svgRaw >= 30 ? 'MANAGEABLE GAP — Some misalignment. A facilitated alignment session should resolve it'
      : 'TIGHT ALIGNMENT — Rare and powerful. Move to execution while this window holds',
    grade: grade(100 - svgRaw)
  };

  // ── 8. EMA — Execution Momentum Advantage ──
  // Measures whether you have momentum (organisational readiness + market timing)
  const momentumFactors = [
    hasKeyword(q, 'ready', 'prepared', 'capacity') ? 20 : 0,
    hasKeyword(q, 'demand', 'market ready', 'timing', 'window') ? 20 : 0,
    hasKeyword(q, 'team in place', 'capability', 'experience') ? 15 : 0,
    hasKeyword(q, 'fund', 'capital available', 'budget approved') ? 15 : 0,
    hasKeyword(q, 'not ready', 'lack', 'missing', 'gap') ? -20 : 0,
    hasKeyword(q, 'first time', 'new to', 'no experience') ? -15 : 0,
  ];
  const emaRaw = clamp(45 + momentumFactors.reduce((a, b) => a + b, 0), 0, 100);
  results['EMA'] = {
    value: emaRaw,
    interpretation: emaRaw >= 70 ? 'STRONG MOMENTUM — Conditions favour decisive action now. Delay risks losing alignment'
      : emaRaw >= 40 ? 'BUILDING MOMENTUM — Close to ready. Address remaining gaps then execute'
      : 'LOW MOMENTUM — Not yet ready. Rushing will waste resources. Build capability first',
    grade: grade(emaRaw)
  };

  return results;
}


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT: Full Cognitive Analysis
// ═══════════════════════════════════════════════════════════════════════════════

export function runCognitiveAnalysis(query: string, params: any, readiness: number): CognitiveAnalysis {
  const coreTruth = extractCoreTruth(query, params);
  const emotionalRead = readEmotionalUndercurrent(query, params);
  const analogies = generateAnalogies(query);
  const perspectives = rotatePerspectives(query, params);
  const sunkCost = detectSunkCostTraps(query, params);
  const trust = calibrateTrust(query, params);
  const relationships = analyzeRelationships(query, params);
  const temporalPatience = modelTemporalPatience(query, params);
  const preMortem = runPreMortem(query, params);
  const creativeSolutions = generateCreativeSolutions(query, params);
  const newFormulas = computeNewFormulas(query, params);

  const allInsights = [...perspectives, ...sunkCost, ...trust];

  // ── Cognitive Confidence ──
  // How well did the brain "understand" this query across all layers?
  const layersActivated = [
    coreTruth.confidence > 60 ? 1 : 0,
    emotionalRead.length > 1 ? 1 : 0,
    analogies.length > 1 ? 1 : 0,
    allInsights.length > 2 ? 1 : 0,
    preMortem.failureScenarios.length > 2 ? 1 : 0,
    creativeSolutions.length > 1 ? 1 : 0,
    Object.keys(newFormulas).length > 3 ? 1 : 0,
  ];
  const cognitiveConfidence = clamp(
    (layersActivated.reduce((a, b) => a + b, 0) / layersActivated.length) * 100,
    20, 100
  );

  return {
    coreTruth,
    insights: allInsights,
    relationships,
    temporalPatience,
    preMortem,
    analogies,
    emotionalRead,
    creativeSolutions,
    newFormulas,
    cognitiveConfidence,
  };
}

// ── Format for prompt injection ───────────────────────────────────────────────

export function formatCognitiveForPrompt(analysis: CognitiveAnalysis): string {
  const lines: string[] = [];

  lines.push(`\n### ── COGNITIVE REASONING ENGINE (Human-Brain Thinking) ──`);
  lines.push(`**Cognitive Confidence:** ${analysis.cognitiveConfidence.toFixed(0)}%`);

  // Core Truth — the most important section
  lines.push(`\n#### CORE TRUTH EXTRACTION`);
  lines.push(`**The Real Problem:** ${analysis.coreTruth.coreProblem}`);
  lines.push(`**The Real Answer:** ${analysis.coreTruth.coreAnswer}`);
  lines.push(`**What's Actually Blocking:** ${analysis.coreTruth.realBlocker}`);
  lines.push(`**The Obvious Solution Nobody Tried:** ${analysis.coreTruth.obviousSolution}`);
  if (analysis.coreTruth.humanComplications.length) {
    lines.push(`**Human Complications Detected:**`);
    analysis.coreTruth.humanComplications.forEach(c => lines.push(`  ⚡ ${c}`));
  }

  // Emotional Read
  if (analysis.emotionalRead.length) {
    lines.push(`\n#### EMOTIONAL UNDERCURRENT`);
    analysis.emotionalRead.slice(0, 3).forEach(e => lines.push(`  🧠 ${e}`));
  }

  // Pre-Mortem
  lines.push(`\n#### PRE-MORTEM (Imagine this failed — why?)`);
  lines.push(`**Most Likely Failure:** ${analysis.preMortem.mostLikelyFailure}`);
  lines.push(`**Blind Spot:** ${analysis.preMortem.blindSpot}`);
  lines.push(`**What Everyone Ignores:** ${analysis.preMortem.whatEveryoneIgnores}`);
  analysis.preMortem.failureScenarios.slice(0, 3).forEach(s =>
    lines.push(`  ${s.preventable ? '🛡️ Preventable' : '⚡ External'} (${s.probability}%): ${s.scenario}`)
  );

  // Relationship Dynamics
  lines.push(`\n#### RELATIONSHIP DYNAMICS`);
  lines.push(`Power Balance: ${analysis.relationships.powerBalance} | Dependency Risk: ${analysis.relationships.dependencyRisk} | Leverage: ${analysis.relationships.leverageHolder}`);
  if (analysis.relationships.redFlags.length) lines.push(`Red Flags: ${analysis.relationships.redFlags.join(' | ')}`);
  if (analysis.relationships.trustSignals.length) lines.push(`Trust Signals: ${analysis.relationships.trustSignals.join(' | ')}`);

  // Temporal Patience
  lines.push(`\n#### TEMPORAL PATIENCE MODEL`);
  lines.push(`Patience Required: ${analysis.temporalPatience.patienceRequired} | Break-Even: ${analysis.temporalPatience.breakEvenHorizon}`);
  lines.push(`Short-Term Pain: ${analysis.temporalPatience.shortTermPain[0] || 'N/A'}`);
  lines.push(`Long-Term Gain: ${analysis.temporalPatience.longTermGain[0] || 'N/A'}`);
  lines.push(`Abandonment Risk: ${analysis.temporalPatience.abandonmentRisk}`);

  // Analogies
  if (analysis.analogies.length) {
    lines.push(`\n#### ANALOGICAL REASONING (Cross-Domain Insight)`);
    analysis.analogies.slice(0, 2).forEach(a => lines.push(`  💡 ${a}`));
  }

  // Creative Solutions
  if (analysis.creativeSolutions.length) {
    lines.push(`\n#### CREATIVE SOLUTIONS (What Nobody Considered)`);
    analysis.creativeSolutions.slice(0, 3).forEach(s => lines.push(`  🔮 ${s}`));
  }

  // Perspective Insights
  if (analysis.insights.length) {
    lines.push(`\n#### PERSPECTIVE ROTATION`);
    analysis.insights.slice(0, 4).forEach(i => {
      lines.push(`  [${i.layer}] ${i.finding}`);
      if (i.recommendation) lines.push(`    → ${i.recommendation}`);
    });
  }

  // New Formulas
  const formulaKeys = Object.keys(analysis.newFormulas);
  if (formulaKeys.length) {
    lines.push(`\n#### NEW COGNITIVE FORMULAS (${formulaKeys.length})`);
    formulaKeys.forEach(k => {
      const f = analysis.newFormulas[k];
      lines.push(`  **${k}™** = ${f.value}/100 (${f.grade}) — ${f.interpretation}`);
    });
  }

  return lines.join('\n');
}

export default { runCognitiveAnalysis, formatCognitiveForPrompt };
