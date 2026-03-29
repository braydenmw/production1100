// Self-Learning Intelligence System
// Tracks system performance, user feedback, and automatically improves

import { ReportParameters } from '../types';
import { EventBus } from './EventBus';

interface LearningData {
  timestamp: string;
  testId: string;
  scenario: string;
  inputs: Partial<ReportParameters>;
  outputs: {
    spiScore?: number;
    rroiScore?: number;
    reportQuality?: number;
    generationTime?: number;
  };
  feedback: {
    successful: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
  improvements: string[];
}

interface PerformanceMetrics {
  successRate: number;
  avgGenerationTime: number;
  avgReportQuality: number;
  commonErrors: Record<string, number>;
  improvementAreas: string[];
}

class SelfLearningEngine {
  private learningData: LearningData[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  
  constructor() {
    this.loadLearningData();
    this.subscribeToEvents();
  }

  /** Subscribe to EventBus for ecosystem-wide learning */
  private subscribeToEvents(): void {
    // Listen for outcome recordings (flower ' bee feedback loop)
    EventBus.subscribe('outcomeRecorded', (event) => {
      console.log('[SelfLearning] Outcome received:', event.reportId, event.outcome);
      this.recordOutcome(event.reportId, event.outcome);
    });

    // Listen for insights to track quality (bee ' meadow visibility)
    EventBus.subscribe('insightsGenerated', (event) => {
      console.log('[SelfLearning] Insights received:', event.reportId, event.insights.length);
    });

    // Listen for ecosystem pulse to adjust learning weights (meadow ' ecosystem adaptation)
    EventBus.subscribe('ecosystemPulse', (event) => {
      if (event.signals.alignment < 50) {
        console.log('[SelfLearning] Low alignment detected, adjusting weights');
        // Could trigger recalibration here
      }
    });
  }

  /** Record an outcome and publish learning updates */
  recordOutcome(reportId: string, outcome: { success: boolean; notes?: string }): void {
    const metrics = this.analyzeAndImprove();
    
    // Publish learning update back to the ecosystem
    EventBus.publish({
      type: 'learningUpdate',
      reportId,
      message: outcome.success 
        ? `Success recorded. Current success rate: ${(metrics.successRate * 100).toFixed(1)}%`
        : `Issue recorded. Analyzing for improvements.`,
      improvements: metrics.improvementAreas.slice(0, 3)
    });
  }

  // Record a test execution
  recordTest(data: LearningData): void {
    this.learningData.push(data);
    this.saveLearningData();
    this.analyzeAndImprove();
  }

  // Analyze performance and identify improvement areas
  analyzeAndImprove(): PerformanceMetrics {
    if (this.learningData.length === 0) {
      return {
        successRate: 0,
        avgGenerationTime: 0,
        avgReportQuality: 0,
        commonErrors: {},
        improvementAreas: []
      };
    }

    const recentData = this.learningData.slice(-100); // Last 100 tests
    
    const successRate = recentData.filter(d => d.feedback.successful).length / recentData.length;
    const avgGenerationTime = recentData.reduce((sum, d) => sum + (d.outputs.generationTime || 0), 0) / recentData.length;
    const avgReportQuality = recentData.reduce((sum, d) => sum + (d.outputs.reportQuality || 0), 0) / recentData.length;

    // Count error frequencies
    const commonErrors: Record<string, number> = {};
    recentData.forEach(d => {
      d.feedback.errors.forEach(error => {
        commonErrors[error] = (commonErrors[error] || 0) + 1;
      });
    });

    // Identify improvement areas based on patterns
    const improvementAreas: string[] = [];
    
if (successRate < 0.8) improvementAreas.push('Improve success rate (currently ' + (successRate * 100).toFixed(1) + '%)');
    if (avgGenerationTime > 30000) improvementAreas.push('Optimize generation time (currently ' + (avgGenerationTime / 1000).toFixed(1) + 's)');
    if (avgReportQuality < 0.7) improvementAreas.push('Enhance report quality (currently ' + (avgReportQuality * 100).toFixed(1) + '%)');

    // Identify most common errors
    Object.entries(commonErrors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([error, count]) => {
        if (count > 3) improvementAreas.push(`Fix recurring error: ${error} (${count} occurrences)`);
      });

    const metrics: PerformanceMetrics = {
      successRate,
      avgGenerationTime,
      avgReportQuality,
      commonErrors,
      improvementAreas
    };

    this.performanceHistory.push(metrics);
    this.generateImprovementReport(metrics);

    return metrics;
  }

  // Generate improvement recommendations
  generateImprovementReport(metrics: PerformanceMetrics): void {
    console.log('\n=== SELF-LEARNING ANALYSIS ===');
    console.log(`Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
    console.log(`Avg Generation Time: ${(metrics.avgGenerationTime / 1000).toFixed(1)}s`);
    console.log(`Avg Report Quality: ${(metrics.avgReportQuality * 100).toFixed(1)}%`);
    
    if (metrics.improvementAreas.length > 0) {
      console.log('\nImprovement Areas:');
      metrics.improvementAreas.forEach((area, i) => {
        console.log(`${i + 1}. ${area}`);
      });
    }

    if (Object.keys(metrics.commonErrors).length > 0) {
      console.log('\n Most Common Errors:');
      Object.entries(metrics.commonErrors)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([error, count]) => {
          console.log(`  - ${error} (${count}x)`);
        });
    }

    console.log('\n==============================\n');
  }

  // Get recommendations for specific scenario
  getRecommendations(scenario: string): string[] {
    const scenarioData = this.learningData.filter(d => d.scenario === scenario);
    if (scenarioData.length === 0) return [];

    const allSuggestions = scenarioData.flatMap(d => d.feedback.suggestions);
    const suggestionCounts: Record<string, number> = {};
    
    allSuggestions.forEach(s => {
      suggestionCounts[s] = (suggestionCounts[s] || 0) + 1;
    });

    return Object.entries(suggestionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([suggestion]) => suggestion);
  }

  // Save learning data to localStorage
  private saveLearningData(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('bw-nexus-learning-data', JSON.stringify(this.learningData));
      localStorage.setItem('bw-nexus-performance-history', JSON.stringify(this.performanceHistory));
    } catch (error) {
      console.error('Failed to save learning data:', error);
    }
  }

  // Load learning data from localStorage
  private loadLearningData(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = localStorage.getItem('bw-nexus-learning-data');
      const history = localStorage.getItem('bw-nexus-performance-history');
      
      if (data) this.learningData = JSON.parse(data);
      if (history) this.performanceHistory = JSON.parse(history);
    } catch (error) {
      console.error('Failed to load learning data:', error);
    }
  }

  // Get current performance metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.performanceHistory[this.performanceHistory.length - 1] || null;
  }

  // Get SPI weights from the last learning cycle
  getSPIWeights(): Record<'ER'|'SP'|'PS'|'PR'|'EA'|'CA'|'UT', number> {
    const defaultWeights = {
      ER: 0.25,
      SP: 0.20,
      PS: 0.15,
      PR: 0.15,
      EA: 0.10,
      CA: 0.10,
      UT: 0.05,
    };

    const latest = this.getCurrentMetrics();
    if (!latest) return defaultWeights;

    // Simple adaptation: adjust using success rate and common errors
    const adjustment = Math.min(0.1, Math.max(-0.1, (latest.successRate - 0.75) * 0.2));
    return {
      ER: Math.max(0.02, Math.min(0.5, defaultWeights.ER + adjustment * 0.2)),
      SP: Math.max(0.02, Math.min(0.5, defaultWeights.SP + adjustment * 0.2)),
      PS: Math.max(0.02, Math.min(0.5, defaultWeights.PS + adjustment * 0.3)),
      PR: Math.max(0.02, Math.min(0.5, defaultWeights.PR + adjustment * 0.2)),
      EA: Math.max(0.02, Math.min(0.5, defaultWeights.EA + adjustment * 0.1)),
      CA: Math.max(0.02, Math.min(0.5, defaultWeights.CA + adjustment * 0.1)),
      UT: Math.max(0.02, Math.min(0.5, defaultWeights.UT + adjustment * 0.0)),
    };
  }

  // Export learning data for analysis
  exportLearningData(): string {
    return JSON.stringify({
      learningData: this.learningData,
      performanceHistory: this.performanceHistory,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  // Clear learning data (for testing)
  clearLearningData(): void {
    this.learningData = [];
    this.performanceHistory = [];
    localStorage.removeItem('bw-nexus-learning-data');
    localStorage.removeItem('bw-nexus-performance-history');
  }
}

export const selfLearningEngine = new SelfLearningEngine();
export type { LearningData, PerformanceMetrics };

