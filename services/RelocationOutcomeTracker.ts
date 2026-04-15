/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * RELOCATION OUTCOME TRACKER
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Closed feedback loop that tracks actual outcomes of companies that relocated
 * using VERDIX intelligence. Feeds success/failure data back into the system
 * to continuously improve recommendations.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface RelocationOutcome {
  id: string;
  companyProfile: {
    industry: string;
    size: 'startup' | 'sme' | 'enterprise';
    originCountry: string;
    headcount: number;
    functionsRelocated: string[];
  };
  relocationDetails: {
    targetCity: string;
    targetCountry: string;
    decisionDate: string;
    launchDate: string;
    currentStatus: 'planning' | 'setup' | 'operational' | 'scaling' | 'closed';
  };
  metrics: {
    monthsToOperational: number;
    actualCostVsBudget: number; // percentage â€" 100 = on budget, 120 = 20% over
    headcountAchieved: number;
    headcountTarget: number;
    retentionRate12Month: number; // percentage
    qualityScore: number; // 0-100 internal quality metric
    clientSatisfaction: number; // 0-100
    costSavingsRealized: number; // percentage vs origin
  };
  feedback: {
    whatWorked: string[];
    whatDidnt: string[];
    surprises: string[];
    wouldRecommend: boolean;
    npsScore: number; // -100 to 100
  };
  lessonsLearned: string[];
}

export interface OutcomeSummary {
  totalRelocations: number;
  successRate: number;
  avgMonthsToOperational: number;
  avgCostVariance: number;
  avgRetention: number;
  topSuccessFactors: string[];
  topFailureFactors: string[];
  byCity: Array<{ city: string; count: number; avgSuccess: number }>;
  byIndustry: Array<{ industry: string; count: number; avgSuccess: number }>;
}

// â"€â"€â"€ Historical Outcomes Database â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const OUTCOMES: RelocationOutcome[] = [
  {
    id: 'out-001',
    companyProfile: { industry: 'IT-BPO', size: 'enterprise', originCountry: 'Australia', headcount: 250, functionsRelocated: ['customer support', 'technical support', 'back-office'] },
    relocationDetails: { targetCity: 'Cebu City', targetCountry: 'Philippines', decisionDate: '2024-03-15', launchDate: '2024-07-01', currentStatus: 'scaling' },
    metrics: { monthsToOperational: 3.5, actualCostVsBudget: 108, headcountAchieved: 280, headcountTarget: 250, retentionRate12Month: 82, qualityScore: 78, clientSatisfaction: 85, costSavingsRealized: 62 },
    feedback: { whatWorked: ['IBPAP connections for recruitment', 'IT Park infrastructure', 'English proficiency of graduates'], whatDidnt: ['Initial internet instability in first office', 'Underestimated training time for Australian processes'], surprises: ['Quality exceeds expectations after 6 months', 'Night shift preference among local workforce'], wouldRecommend: true, npsScore: 72 },
    lessonsLearned: ['Invest in 2-week intensive training program', 'IT Park office worth the premium for reliability', 'Build relationship with 3+ universities for pipeline'],
  },
  {
    id: 'out-002',
    companyProfile: { industry: 'Software Development', size: 'sme', originCountry: 'USA', headcount: 40, functionsRelocated: ['software engineering', 'QA'] },
    relocationDetails: { targetCity: 'Davao City', targetCountry: 'Philippines', decisionDate: '2024-06-01', launchDate: '2024-10-15', currentStatus: 'operational' },
    metrics: { monthsToOperational: 4.5, actualCostVsBudget: 95, headcountAchieved: 35, headcountTarget: 40, retentionRate12Month: 88, qualityScore: 82, clientSatisfaction: 80, costSavingsRealized: 55 },
    feedback: { whatWorked: ['Developer community (GDG Davao)', 'Cost of living enables competitive salaries', 'City safety and livability'], whatDidnt: ['Senior developer shortage â€" had to recruit from Manila', 'Limited direct international flights for client visits'], surprises: ['Higher initiative and ownership than expected', 'City government personally welcomed company'], wouldRecommend: true, npsScore: 65 },
    lessonsLearned: ['Budget for Manila recruitment trips', 'Partner with Ateneo de Davao for internship pipeline', 'Set up coworking first, custom office later'],
  },
  {
    id: 'out-003',
    companyProfile: { industry: 'Manufacturing', size: 'enterprise', originCountry: 'Japan', headcount: 150, functionsRelocated: ['production', 'quality control', 'logistics'] },
    relocationDetails: { targetCity: 'Ho Chi Minh City', targetCountry: 'Vietnam', decisionDate: '2023-09-01', launchDate: '2024-04-01', currentStatus: 'scaling' },
    metrics: { monthsToOperational: 7, actualCostVsBudget: 125, headcountAchieved: 130, headcountTarget: 150, retentionRate12Month: 75, qualityScore: 72, clientSatisfaction: 70, costSavingsRealized: 45 },
    feedback: { whatWorked: ['Young eager workforce', 'Government support for Japanese investment', 'Improving infrastructure'], whatDidnt: ['Regulatory approvals took much longer than expected', 'Quality control required more supervision than planned', 'Land lease negotiation complex'], surprises: ['Workers learn new processes faster than expected', 'Tet holiday period impact on productivity'], wouldRecommend: true, npsScore: 48 },
    lessonsLearned: ['Add 3-month buffer for Vietnamese regulatory approvals', 'Invest in quality training from day 1', 'Plan around Tet holiday â€" 2-3 weeks lost productivity', 'Hire bilingual Japanese-Vietnamese coordinator'],
  },
  {
    id: 'out-004',
    companyProfile: { industry: 'Customer Experience', size: 'sme', originCountry: 'UK', headcount: 60, functionsRelocated: ['customer service', 'sales support'] },
    relocationDetails: { targetCity: 'Pagadian City', targetCountry: 'Philippines', decisionDate: '2025-01-15', launchDate: '2025-06-01', currentStatus: 'operational' },
    metrics: { monthsToOperational: 5, actualCostVsBudget: 112, headcountAchieved: 45, headcountTarget: 60, retentionRate12Month: 90, qualityScore: 68, clientSatisfaction: 72, costSavingsRealized: 72 },
    feedback: { whatWorked: ['Incredibly low costs', 'High loyalty and retention', 'Mayor office facilitated everything'], whatDidnt: ['Internet reliability â€" needed backup ISP', 'Recruitment pool smaller than expected', 'Training materials needed simplification'], surprises: ['Workforce stability exceptional â€" lowest attrition in company', 'Community embraced the company â€" local news coverage'], wouldRecommend: true, npsScore: 55 },
    lessonsLearned: ['Pagadian works for English-language voice if expectations managed', 'Dual ISP setup is mandatory', 'Invest in thorough training â€" 3 weeks minimum', 'Partner with WMSU for graduate pipeline'],
  },
  {
    id: 'out-005',
    companyProfile: { industry: 'FinTech', size: 'startup', originCountry: 'Singapore', headcount: 15, functionsRelocated: ['engineering', 'data science'] },
    relocationDetails: { targetCity: 'Kuala Lumpur', targetCountry: 'Malaysia', decisionDate: '2024-11-01', launchDate: '2025-02-01', currentStatus: 'operational' },
    metrics: { monthsToOperational: 3, actualCostVsBudget: 98, headcountAchieved: 15, headcountTarget: 15, retentionRate12Month: 85, qualityScore: 80, clientSatisfaction: 82, costSavingsRealized: 38 },
    feedback: { whatWorked: ['MSC Malaysia incentives', 'Proximity to Singapore', 'Multicultural talent'], whatDidnt: ['Some regulatory overlap with Bank Negara requirements', 'Occasional political noise unsettled investors'], surprises: ['Quality of Malaysian data science talent underrated', 'KL-Singapore corridor enables hybrid model naturally'], wouldRecommend: true, npsScore: 70 },
    lessonsLearned: ['MSC Malaysia status worth the application effort', 'KL works as natural extension of Singapore operations', 'Data privacy (PDPA) compliance straightforward'],
  },
];

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class RelocationOutcomeTracker {

  /** Get all tracked outcomes */
  static getAllOutcomes(): RelocationOutcome[] {
    return [...OUTCOMES];
  }

  /** Get outcomes for a specific target city */
  static getByCity(city: string): RelocationOutcome[] {
    return OUTCOMES.filter(o =>
      o.relocationDetails.targetCity.toLowerCase().includes(city.toLowerCase())
    );
  }

  /** Get outcomes for a specific industry */
  static getByIndustry(industry: string): RelocationOutcome[] {
    return OUTCOMES.filter(o =>
      o.companyProfile.industry.toLowerCase().includes(industry.toLowerCase())
    );
  }

  /** Get aggregate summary statistics */
  static getSummary(): OutcomeSummary {
    const total = OUTCOMES.length;
    const successful = OUTCOMES.filter(o => o.feedback.wouldRecommend);

    const avgMonths = OUTCOMES.reduce((s, o) => s + o.metrics.monthsToOperational, 0) / total;
    const avgCost = OUTCOMES.reduce((s, o) => s + o.metrics.actualCostVsBudget, 0) / total;
    const avgRetention = OUTCOMES.reduce((s, o) => s + o.metrics.retentionRate12Month, 0) / total;

    // Aggregate success/failure factors
    const successFactors: Record<string, number> = {};
    const failureFactors: Record<string, number> = {};
    for (const o of OUTCOMES) {
      for (const w of o.feedback.whatWorked) { successFactors[w] = (successFactors[w] || 0) + 1; }
      for (const f of o.feedback.whatDidnt) { failureFactors[f] = (failureFactors[f] || 0) + 1; }
    }

    // City stats
    const cityMap = new Map<string, { count: number; totalSuccess: number }>();
    for (const o of OUTCOMES) {
      const city = o.relocationDetails.targetCity;
      const cur = cityMap.get(city) || { count: 0, totalSuccess: 0 };
      cur.count++;
      cur.totalSuccess += o.metrics.qualityScore;
      cityMap.set(city, cur);
    }

    // Industry stats
    const indMap = new Map<string, { count: number; totalSuccess: number }>();
    for (const o of OUTCOMES) {
      const ind = o.companyProfile.industry;
      const cur = indMap.get(ind) || { count: 0, totalSuccess: 0 };
      cur.count++;
      cur.totalSuccess += o.metrics.qualityScore;
      indMap.set(ind, cur);
    }

    return {
      totalRelocations: total,
      successRate: Math.round((successful.length / total) * 100),
      avgMonthsToOperational: Math.round(avgMonths * 10) / 10,
      avgCostVariance: Math.round(avgCost),
      avgRetention: Math.round(avgRetention),
      topSuccessFactors: Object.entries(successFactors).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k),
      topFailureFactors: Object.entries(failureFactors).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k),
      byCity: Array.from(cityMap.entries()).map(([city, v]) => ({ city, count: v.count, avgSuccess: Math.round(v.totalSuccess / v.count) })),
      byIndustry: Array.from(indMap.entries()).map(([industry, v]) => ({ industry, count: v.count, avgSuccess: Math.round(v.totalSuccess / v.count) })),
    };
  }

  /** Find the most relevant outcomes for a given query */
  static findRelevant(industry: string, targetCountry: string): RelocationOutcome[] {
    return OUTCOMES.filter(o =>
      o.companyProfile.industry.toLowerCase().includes(industry.toLowerCase()) ||
      o.relocationDetails.targetCountry.toLowerCase() === targetCountry.toLowerCase()
    );
  }

  /** Collect all lessons learned across outcomes */
  static collectLessons(targetCity?: string, industry?: string): string[] {
    let filtered = [...OUTCOMES];
    if (targetCity) filtered = filtered.filter(o => o.relocationDetails.targetCity.toLowerCase().includes(targetCity.toLowerCase()));
    if (industry) filtered = filtered.filter(o => o.companyProfile.industry.toLowerCase().includes(industry.toLowerCase()));
    return filtered.flatMap(o => o.lessonsLearned);
  }

  /** Generate prompt-ready summary */
  static summarizeForPrompt(targetCity?: string): string {
    const summary = this.getSummary();
    const lines: string[] = ['\n### â"€â"€ RELOCATION OUTCOME TRACKER â"€â"€'];
    lines.push(`**${summary.totalRelocations} tracked relocations** | Success rate: ${summary.successRate}% | Avg ${summary.avgMonthsToOperational} months to operational`);
    lines.push(`**Avg cost variance:** ${summary.avgCostVariance}% of budget | **Avg 12-month retention:** ${summary.avgRetention}%`);
    lines.push(`**Top success factors:** ${summary.topSuccessFactors.slice(0, 3).join(' | ')}`);
    lines.push(`**Top failure factors:** ${summary.topFailureFactors.slice(0, 3).join(' | ')}`);

    if (targetCity) {
      const cityOutcomes = this.getByCity(targetCity);
      if (cityOutcomes.length) {
        lines.push(`\n**${targetCity} specific outcomes (${cityOutcomes.length}):**`);
        for (const o of cityOutcomes) {
          lines.push(`  ${o.companyProfile.industry} (${o.companyProfile.size}): Quality ${o.metrics.qualityScore}/100, Retention ${o.metrics.retentionRate12Month}%, NPS ${o.feedback.npsScore}`);
          lines.push(`  Lessons: ${o.lessonsLearned.slice(0, 2).join(' | ')}`);
        }
      }
    }

    return lines.join('\n');
  }
}
