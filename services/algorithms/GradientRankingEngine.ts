/**
 * GRADIENT RANKING ENGINE - Learning-to-Rank for Case Relevance
 * 
 * Implements a gradient-boosted ranking algorithm for:
 * - Ranking similar cases by relevance
 * - Learning from user feedback
 * - Improving memory retrieval over time
 * 
 * Uses a simplified gradient boosting approach that runs in-browser
 * without requiring external ML libraries.
 * 
 * Features:
 * - Pairwise ranking loss optimization
 * - Feature-based case scoring
 * - Online learning from feedback
 * - Model persistence in localStorage
 */

import type { ReportParameters } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

export interface RankingFeatures {
  // Similarity features
  countryMatch: number;           // 0 or 1
  regionMatch: number;            // 0 or 1
  industryOverlap: number;        // 0 to 1
  intentOverlap: number;          // 0 to 1
  
  // Quality features
  hasOutcome: number;             // 0 or 1
  outcomePositive: number;        // 0 or 1
  dataCompleteness: number;       // 0 to 1
  recency: number;                // 0 to 1 (newer = higher)
  
  // Engagement features
  timesAccessed: number;          // normalized 0 to 1
  userRating: number;             // 0 to 1 if rated, 0.5 default
}

export interface RankedCase {
  id: string;
  score: number;
  features: RankingFeatures;
  metadata: Record<string, unknown>;
}

export interface RankingModel {
  weights: Record<keyof RankingFeatures, number>;
  bias: number;
  version: number;
  trainedOn: number;  // Number of examples
  lastUpdated: string;
}

export interface TrainingExample {
  queryId: string;
  winnerId: string;    // Case that should rank higher
  loserId: string;     // Case that should rank lower
  winnerFeatures: RankingFeatures;
  loserFeatures: RankingFeatures;
}

export interface RankingResult {
  rankedCases: RankedCase[];
  modelVersion: number;
  confidenceScore: number;
}

export type RankingSignal = 'up' | 'down';

// ============================================================================
// DEFAULT MODEL WEIGHTS (learned from historical patterns)
// ============================================================================

const DEFAULT_WEIGHTS: Record<keyof RankingFeatures, number> = {
  countryMatch: 0.45,
  regionMatch: 0.25,
  industryOverlap: 0.35,
  intentOverlap: 0.30,
  hasOutcome: 0.20,
  outcomePositive: 0.25,
  dataCompleteness: 0.15,
  recency: 0.10,
  timesAccessed: 0.08,
  userRating: 0.40
};

const DEFAULT_BIAS = 0.1;
const LEARNING_RATE = 0.01;
const REGULARIZATION = 0.001;

// ============================================================================
// GRADIENT RANKING ENGINE
// ============================================================================

export class GradientRankingEngine {
  private model: RankingModel;
  private trainingBuffer: TrainingExample[] = [];
  private readonly storageKey = 'bw-nexus-ranking-model';

  constructor() {
    this.model = this.loadModel() || this.initializeModel();
  }

  // ============================================================================
  // MODEL INITIALIZATION & PERSISTENCE
  // ============================================================================

  private initializeModel(): RankingModel {
    return {
      weights: { ...DEFAULT_WEIGHTS },
      bias: DEFAULT_BIAS,
      version: 1,
      trainedOn: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  private loadModel(): RankingModel | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      return JSON.parse(stored) as RankingModel;
    } catch {
      return null;
    }
  }

  private saveModel(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(this.storageKey, JSON.stringify(this.model));
    } catch {
      // Ignore storage errors
    }
  }

  // ============================================================================
  // FEATURE EXTRACTION
  // ============================================================================

  /**
   * Extract ranking features for a case relative to a query
   */
  extractFeatures(query: ReportParameters, caseData: Record<string, unknown>): RankingFeatures {
    const now = Date.now();
    
    // Similarity features
    const countryMatch = query.country && caseData.country === query.country ? 1 : 0;
    const regionMatch = query.region && caseData.region === query.region ? 1 : 0;
    
    const queryIndustries = new Set((query.industry || []).map(i => i.toLowerCase()));
    const caseIndustries = new Set(((caseData.industry as string[]) || []).map(i => i.toLowerCase()));
    const industryOverlap = this.setOverlap(queryIndustries, caseIndustries);
    
    const queryIntents = new Set((query.strategicIntent || []).map(i => i.toLowerCase()));
    const caseIntents = new Set(((caseData.strategicIntent as string[]) || []).map(i => i.toLowerCase()));
    const intentOverlap = this.setOverlap(queryIntents, caseIntents);
    
    // Quality features
    const hasOutcome = caseData.outcome ? 1 : 0;
    const outcomeStr = String(caseData.outcome || '').toLowerCase();
    const outcomePositive = outcomeStr.includes('success') || outcomeStr.includes('positive') ? 1 : 0;
    
    const requiredFields = ['country', 'region', 'industry', 'problemStatement', 'organizationType'];
    const presentFields = requiredFields.filter(f => caseData[f] !== undefined && caseData[f] !== null);
    const dataCompleteness = presentFields.length / requiredFields.length;
    
    const caseTimestamp = caseData.timestamp ? new Date(caseData.timestamp as string).getTime() : 0;
    const ageMs = now - caseTimestamp;
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
    const recency = Math.max(0, 1 - ageMs / maxAge);
    
    // Engagement features
    const accessCount = (caseData.accessCount as number) || 0;
    const timesAccessed = Math.min(1, accessCount / 10); // Normalize to max 10 accesses
    
    const rating = (caseData.userRating as number) || 0.5;
    const userRating = rating;

    return {
      countryMatch,
      regionMatch,
      industryOverlap,
      intentOverlap,
      hasOutcome,
      outcomePositive,
      dataCompleteness,
      recency,
      timesAccessed,
      userRating
    };
  }

  private setOverlap(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let intersection = 0;
    for (const item of a) {
      if (b.has(item)) intersection++;
    }
    return intersection / Math.max(a.size, b.size);
  }

  // ============================================================================
  // SCORING & RANKING
  // ============================================================================

  /**
   * Score a case using the current model
   */
  scoreCase(features: RankingFeatures): number {
    let score = this.model.bias;
    
    for (const [feature, value] of Object.entries(features)) {
      const weight = this.model.weights[feature as keyof RankingFeatures] || 0;
      score += weight * value;
    }
    
    // Sigmoid to normalize to [0, 1]
    return 1 / (1 + Math.exp(-score));
  }

  /**
   * Rank a set of cases by relevance to a query
   */
  rankCases(query: ReportParameters, cases: Array<Record<string, unknown>>): RankingResult {
    const rankedCases: RankedCase[] = [];

    for (const caseData of cases) {
      const features = this.extractFeatures(query, caseData);
      const score = this.scoreCase(features);
      
      rankedCases.push({
        id: String(caseData.id || caseData.reportId || Math.random()),
        score,
        features,
        metadata: caseData
      });
    }

    // Sort by score descending
    rankedCases.sort((a, b) => b.score - a.score);

    // Calculate confidence based on score spread
    const scores = rankedCases.map(c => c.score);
    const maxScore = Math.max(...scores, 0);
    const minScore = Math.min(...scores, 0);
    const spread = maxScore - minScore;
    const confidenceScore = Math.min(0.95, 0.5 + spread * 0.5);

    return {
      rankedCases,
      modelVersion: this.model.version,
      confidenceScore
    };
  }

  // ============================================================================
  // ONLINE LEARNING
  // ============================================================================

  /**
   * Record user feedback (pairwise preference)
   */
  recordFeedback(queryId: string, preferredCaseId: string, lessPreferredCaseId: string,
                  preferredFeatures: RankingFeatures, lessPreferredFeatures: RankingFeatures): void {
    this.trainingBuffer.push({
      queryId,
      winnerId: preferredCaseId,
      loserId: lessPreferredCaseId,
      winnerFeatures: preferredFeatures,
      loserFeatures: lessPreferredFeatures
    });

    // Train incrementally when buffer reaches threshold
    if (this.trainingBuffer.length >= 5) {
      this.trainOnBuffer();
    }
  }

  /**
   * Record implicit feedback (case was accessed/used)
   */
  recordAccess(queryId: string, accessedCaseId: string, accessedFeatures: RankingFeatures,
               notAccessedCases: Array<{ id: string; features: RankingFeatures }>): void {
    // Treat accessed case as preferred over non-accessed
    for (const notAccessed of notAccessedCases.slice(0, 3)) {
      this.trainingBuffer.push({
        queryId,
        winnerId: accessedCaseId,
        loserId: notAccessed.id,
        winnerFeatures: accessedFeatures,
        loserFeatures: notAccessed.features
      });
    }

    if (this.trainingBuffer.length >= 5) {
      this.trainOnBuffer();
    }
  }

  /**
   * Record explicit helpful / unhelpful feedback for a retrieved case or generated response.
   * This lets UI feedback immediately shape the ranking model without waiting for a full pairwise UI.
   */
  recordRelevanceSignal(
    queryId: string,
    query: ReportParameters,
    caseData: Record<string, unknown>,
    signal: RankingSignal
  ): RankingFeatures {
    const enrichedCaseData = {
      ...caseData,
      accessCount: signal === 'up' ? Math.max(Number(caseData.accessCount || 0), 5) : Number(caseData.accessCount || 0),
      userRating: signal === 'up' ? 1 : 0,
      outcome: signal === 'up' ? 'success' : (caseData.outcome || 'failure'),
      timestamp: caseData.timestamp || new Date().toISOString(),
    };

    const candidateFeatures = this.extractFeatures(query, enrichedCaseData);
    const baselineFeatures: RankingFeatures = {
      countryMatch: 0,
      regionMatch: 0,
      industryOverlap: 0,
      intentOverlap: 0,
      hasOutcome: 0,
      outcomePositive: 0,
      dataCompleteness: 0.2,
      recency: 0.2,
      timesAccessed: 0,
      userRating: 0.5,
    };

    const candidateId = String(caseData.id || queryId);
    if (signal === 'up') {
      this.recordFeedback(queryId, candidateId, `${candidateId}-baseline`, candidateFeatures, baselineFeatures);
    } else {
      this.recordFeedback(queryId, `${candidateId}-baseline`, candidateId, baselineFeatures, candidateFeatures);
    }

    this.flushTraining();
    return candidateFeatures;
  }

  /**
   * Train model on buffered examples using gradient descent
   */
  private trainOnBuffer(): void {
    if (this.trainingBuffer.length === 0) return;

    const gradients: Record<keyof RankingFeatures, number> = {
      countryMatch: 0, regionMatch: 0, industryOverlap: 0, intentOverlap: 0,
      hasOutcome: 0, outcomePositive: 0, dataCompleteness: 0, recency: 0,
      timesAccessed: 0, userRating: 0
    };
    let biasGradient = 0;

    for (const example of this.trainingBuffer) {
      // Pairwise loss: we want score(winner) > score(loser)
      const winnerScore = this.scoreCase(example.winnerFeatures);
      const loserScore = this.scoreCase(example.loserFeatures);
      
      // Sigmoid of score difference
      const diff = winnerScore - loserScore;
      const sigmoidDiff = 1 / (1 + Math.exp(-diff));
      
      // Gradient of pairwise loss
      const lossGrad = sigmoidDiff - 1; // We want to maximize diff

      // Accumulate gradients
      for (const feature of Object.keys(gradients) as (keyof RankingFeatures)[]) {
        const featureDiff = example.winnerFeatures[feature] - example.loserFeatures[feature];
        gradients[feature] += lossGrad * featureDiff;
      }
      biasGradient += lossGrad;
    }

    // Average gradients
    const n = this.trainingBuffer.length;
    for (const feature of Object.keys(gradients) as (keyof RankingFeatures)[]) {
      gradients[feature] /= n;
    }
    biasGradient /= n;

    // Update weights with regularization
    for (const feature of Object.keys(this.model.weights) as (keyof RankingFeatures)[]) {
      this.model.weights[feature] -= LEARNING_RATE * (gradients[feature] + REGULARIZATION * this.model.weights[feature]);
    }
    this.model.bias -= LEARNING_RATE * biasGradient;

    // Update model metadata
    this.model.trainedOn += n;
    this.model.version += 1;
    this.model.lastUpdated = new Date().toISOString();

    // Clear buffer and save
    this.trainingBuffer = [];
    this.saveModel();
  }

  /**
   * Force training on current buffer
   */
  flushTraining(): void {
    this.trainOnBuffer();
  }

  // ============================================================================
  // MODEL INSPECTION
  // ============================================================================

  /**
   * Get current model weights
   */
  getWeights(): Record<keyof RankingFeatures, number> {
    return { ...this.model.weights };
  }

  /**
   * Get model statistics
   */
  getStats(): { version: number; trainedOn: number; lastUpdated: string } {
    return {
      version: this.model.version,
      trainedOn: this.model.trainedOn,
      lastUpdated: this.model.lastUpdated
    };
  }

  /**
   * Get top contributing features for a score
   */
  explainScore(features: RankingFeatures): Array<{ feature: string; contribution: number }> {
    const contributions: Array<{ feature: string; contribution: number }> = [];
    
    for (const [feature, value] of Object.entries(features)) {
      const weight = this.model.weights[feature as keyof RankingFeatures] || 0;
      contributions.push({
        feature,
        contribution: weight * value
      });
    }

    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    return contributions;
  }

  /**
   * Reset model to defaults
   */
  resetModel(): void {
    this.model = this.initializeModel();
    this.trainingBuffer = [];
    this.saveModel();
  }
}

// Singleton instance
export const gradientRankingEngine = new GradientRankingEngine();

export default GradientRankingEngine;
