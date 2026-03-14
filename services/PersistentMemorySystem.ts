import { EventBus } from './EventBus';
import { persistentVectorStore } from './PersistentVectorStore';

export interface MemoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  context: Record<string, unknown>;
  outcome?: Record<string, unknown>;
  lessonsLearned?: string[];
  confidence: number;
}

export interface LiabilityRisk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  proactiveAction?: string;
}

export class PersistentMemorySystem {
  private memory: Map<string, MemoryEntry[]> = new Map();
  private liabilityRisks: LiabilityRisk[] = [];
  private maxMemoryPerCategory = 1000;

  constructor() {
    this.loadFromStorage();
    this.initializeLiabilityProtections();
  }

  // Memory Management
  async remember(category: string, entry: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<void> {
    const fullEntry: MemoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    if (!this.memory.has(category)) {
      this.memory.set(category, []);
    }

    const categoryMemory = this.memory.get(category)!;
    categoryMemory.push(fullEntry);

    // Keep only recent entries
    if (categoryMemory.length > this.maxMemoryPerCategory) {
      categoryMemory.splice(0, categoryMemory.length - this.maxMemoryPerCategory);
    }

    await this.saveToStorage();
    EventBus.emit({ type: 'memoryUpdated', reportId: category, cases: [{ id: fullEntry.id, score: fullEntry.confidence, why: fullEntry.lessonsLearned || [fullEntry.action] }] });

    // Bridge to vector store for semantic search capability
    try {
      persistentVectorStore.addKnowledge(
        `[${category}] ${fullEntry.action}`,
        JSON.stringify({ ...fullEntry.context, lessons: fullEntry.lessonsLearned }),
        fullEntry.confidence
      );
    } catch {
      // Vector store bridge is non-blocking
    }
  }

  recall(category: string, limit = 10): MemoryEntry[] {
    const entries = this.memory.get(category) || [];
    return entries.slice(-limit).reverse(); // Most recent first
  }

  async searchMemory(query: string, category?: string): Promise<MemoryEntry[]> {
    const allEntries: MemoryEntry[] = [];
    const categories = category ? [category] : Array.from(this.memory.keys());

    for (const cat of categories) {
      const entries = this.memory.get(cat) || [];
      allEntries.push(...entries);
    }

    const keywordResults = allEntries
      .filter(entry =>
        entry.action.toLowerCase().includes(query.toLowerCase()) ||
        JSON.stringify(entry.context).toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);

    // Also query vector store for semantic matches
    try {
      const vectorResults = persistentVectorStore.search(query, 10, 0.3);
      for (const vr of await vectorResults) {
        const meta = vr.metadata as { memoryId?: string; category?: string } | undefined;
        if (meta?.memoryId && !keywordResults.some(kr => kr.id === meta.memoryId)) {
          // Find original entry from store
          const cat = meta.category || '';
          const found = (this.memory.get(cat) || []).find(e => e.id === meta.memoryId);
          if (found) keywordResults.push(found);
        }
      }
    } catch {
      // Vector search bridge is non-blocking
    }

    return keywordResults.slice(0, 20);
  }

  // Liability Protection
  assessLiability(action: string, context: Record<string, unknown>): LiabilityRisk[] {
    const risks: LiabilityRisk[] = [];

    // Check against known risk patterns
    for (const risk of this.liabilityRisks) {
      if (this.matchesRiskPattern(risk, action, context)) {
        risks.push(risk);
      }
    }

    return risks;
  }

  private matchesRiskPattern(risk: LiabilityRisk, action: string, context: Record<string, unknown>): boolean {
    // Context-aware matching: require meaningful keyword overlap, not stop words
    const STOP_WORDS = new Set(['potential', 'in', 'the', 'a', 'an', 'of', 'and', 'or', 'without', 'that', 'is', 'for', 'to', 'not', 'all', 'on', 'with', 'this', 'by', 'from']);
    const riskKeywords = risk.description.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
    const actionLower = action.toLowerCase();
    const contextStr = JSON.stringify(context).toLowerCase();

    // Require at least 2 meaningful keywords to match, not just any single word
    const matchCount = riskKeywords.filter(keyword =>
      actionLower.includes(keyword) || contextStr.includes(keyword)
    ).length;

    return matchCount >= 2;
  }

  // Self-Improvement
  async learnFromExperience(entry: MemoryEntry): Promise<void> {
    // Analyze successful vs failed actions
    if (entry.outcome?.success === false) {
      // Learn from failures
      const lessons = await this.extractLessons(entry);
      entry.lessonsLearned = lessons;
      await this.remember('failures', entry);
    } else if (entry.confidence > 0.8) {
      // Learn from high-confidence successes
      await this.remember('successful_patterns', entry);
    }
  }

  private async extractLessons(entry: MemoryEntry): Promise<string[]> {
    const lessons: string[] = [];

    // 1. Extract action-specific lesson from failure context
    const contextStr = JSON.stringify(entry.context).toLowerCase();
    const errorMsg = typeof entry.outcome?.error === 'string' ? entry.outcome.error : '';

    if (errorMsg) {
      lessons.push(`Action '${entry.action}' failed: ${errorMsg}. Add pre-validation for this scenario.`);
    } else {
      lessons.push(`Action '${entry.action}' produced unexpected outcome at confidence ${(entry.confidence * 100).toFixed(0)}%.`);
    }

    // 2. Derive contextual patterns that contributed to failure
    const contextKeys = Object.keys(entry.context);
    if (contextKeys.length > 0) {
      const riskFactors = contextKeys.filter(k => {
        const val = entry.context[k];
        return typeof val === 'string' && (val.toLowerCase().includes('error') || val.toLowerCase().includes('fail') || val.toLowerCase().includes('timeout'));
      });
      if (riskFactors.length > 0) {
        lessons.push(`Risk factors detected in: ${riskFactors.join(', ')}. Implement guards before retry.`);
      }
    }

    // 3. Suggest improved approach based on confidence level
    if (entry.confidence < 0.3) {
      lessons.push('Very low confidence - consider gathering additional evidence or context before re-attempting.');
    } else if (entry.confidence < 0.6) {
      lessons.push('Moderate confidence - partial data available. Cross-reference with similar past actions before re-attempting.');
    }

    // 4. Learn from timing patterns
    const recentFailures = this.recall('failures', 10);
    const similarFailures = recentFailures.filter(prev =>
      prev.action === entry.action && prev.id !== entry.id
    );
    if (similarFailures.length >= 2) {
      lessons.push(`Repeated failure pattern: '${entry.action}' has failed ${similarFailures.length + 1} times. Escalate to human review.`);
    }

    // 5. Context-aware recommendation
    if (contextStr.includes('timeout') || contextStr.includes('network')) {
      lessons.push('Infrastructure-related failure - check connectivity and retry with exponential backoff.');
    } else if (contextStr.includes('permission') || contextStr.includes('auth')) {
      lessons.push('Authorization failure - verify credentials and access scope before retry.');
    }

    return lessons.length > 0 ? lessons : [`Action '${entry.action}' failed. Review context and retry with adjusted parameters.`];
  }

  // Storage
  private async saveToStorage(): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = {
        memory: Array.from(this.memory.entries()),
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('bwNexusMemory', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save memory to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = localStorage.getItem('bwNexusMemory');
      if (data) {
        const parsed = JSON.parse(data);
        this.memory = new Map(parsed.memory.map(([k, v]: [string, MemoryEntry[]]) => [
          k,
          v.map(entry => ({ ...entry, timestamp: new Date(entry.timestamp) }))
        ]));
      }
    } catch (error) {
      console.warn('Failed to load memory from storage:', error);
    }
  }

  private initializeLiabilityProtections(): void {
    this.liabilityRisks = [
      {
        id: 'data-privacy',
        description: 'personal data privacy GDPR CCPA collection processing storage',
        severity: 'high',
        mitigation: 'Ensure GDPR/CCPA compliance and data anonymization',
        proactiveAction: 'Audit data handling before processing'
      },
      {
        id: 'financial-advice',
        description: 'financial investment advice securities trading portfolio recommendation',
        severity: 'critical',
        mitigation: 'Disclaim that this is not financial advice',
        proactiveAction: 'Add disclaimer to all financial-related outputs'
      },
      {
        id: 'bias-discrimination',
        description: 'discriminatory bias hiring employment gender racial ethnic',
        severity: 'high',
        mitigation: 'Implement bias detection and fairness checks',
        proactiveAction: 'Review recommendations for bias before output'
      },
      {
        id: 'sanctions-compliance',
        description: 'sanctions embargo restricted entity OFAC compliance export',
        severity: 'critical',
        mitigation: 'Screen entities against OFAC and EU sanctions lists',
        proactiveAction: 'Run entity screening before engagement recommendations'
      }
    ];
  }

  // Get system status
  getStatus() {
    const totalEntries = Array.from(this.memory.values()).reduce((sum, entries) => sum + entries.length, 0);
    const lastSaved = typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem('bwNexusMemory')
        ? JSON.parse(localStorage.getItem('bwNexusMemory')!).lastSaved
        : null;

    return {
      totalMemories: totalEntries,
      categories: Array.from(this.memory.keys()),
      liabilityRisks: this.liabilityRisks.length,
      lastSaved
    };
  }
}

export const persistentMemory = new PersistentMemorySystem();
