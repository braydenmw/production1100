
import { ReportParameters, HistoricalCase, PrecedentMatch } from '../types';
import { HistoricalParallelMatcher } from './HistoricalParallelMatcher';

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function mapOutcome(outcome: 'success' | 'partial-success' | 'failed' | 'ongoing'): HistoricalCase['outcomes']['result'] {
  if (outcome === 'success') return 'success';
  if (outcome === 'failed') return 'failure';
  return 'mixed';
}

function estimateSuccessProbability(relevanceScore: number, outcome: 'success' | 'partial-success' | 'failed' | 'ongoing'): number {
  const base = outcome === 'success' ? 72 : outcome === 'partial-success' ? 56 : outcome === 'ongoing' ? 52 : 28;
  return Math.max(15, Math.min(92, Math.round((base * 0.7) + (relevanceScore * 0.3))));
}

export class PrecedentMatchingEngine {
    static findMatches(params: ReportParameters, threshold: number = 0.5): PrecedentMatch[] {
        const parallels = HistoricalParallelMatcher.match(params);
        const minimumRelevance = Math.max(0, Math.min(100, threshold * 100));

        return parallels.matches
            .filter((match) => match.relevanceScore >= minimumRelevance)
            .map((match) => {
                const sectorMatch = params.industry.some((industry) => match.sector.toLowerCase().includes(industry.toLowerCase())) ? 100 : 35;
                const regionMatch = params.country?.toLowerCase() === match.country.toLowerCase()
                    ? 100
                    : params.region?.toLowerCase() === match.region.toLowerCase()
                        ? 80
                        : 30;
                const strategyMatch = params.strategicIntent.some((intent) => match.initiative.toLowerCase().includes(intent.toLowerCase()))
                    ? 100
                    : 45;

                const probabilityOfSuccess = estimateSuccessProbability(match.relevanceScore, match.outcome);

                return {
                    historicalCase: {
                        id: match.caseId,
                        title: match.title,
                        entity: match.country,
                        sector: match.sector,
                        country: match.country,
                        year: match.year,
                        strategy: toTitleCase(match.initiative),
                        investmentSizeMillionUSD: 0,
                        outcomes: {
                            result: mapOutcome(match.outcome),
                            roiAchieved: probabilityOfSuccess / 25,
                            keyLearnings: match.lessonsLearned,
                            timeToMarket: match.timeToOutcome,
                        }
                    },
                    similarity: {
                        overall: Math.round(match.relevanceScore),
                        sectorMatch,
                        regionMatch,
                        strategyMatch,
                    },
                    probabilityOfSuccess,
                    confidenceLevel: match.relevanceScore >= 75 ? 'high' : match.relevanceScore >= 50 ? 'medium' : 'low',
                    applicableFactors: {
                        successFactors: match.whatWorked.slice(0, 4),
                        warnings: match.whatFailed.slice(0, 4),
                        timingConsiderations: [match.timeToOutcome, ...match.lessonsLearned.slice(0, 2)].filter(Boolean),
                        investmentProfile: match.description,
                    },
                    timeToMaturity: parseInt(match.timeToOutcome, 10) || undefined,
                };
            });
    }
}

