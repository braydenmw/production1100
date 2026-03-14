/**
 * ═══════════════════════════════════════════════════════════════════
 * Geopolitical Arbitrage Engine
 * ═══════════════════════════════════════════════════════════════════
 * Analyses how global disruptions (wars, sanctions, trade fractures,
 * supply-chain shocks, political instability in major markets) create
 * structural opportunities for regional cities, small islands, and
 * lesser-known jurisdictions worldwide.
 *
 * Core thesis:  When a crisis hurts a dominant market, somewhere else
 * in the world has the conditions to absorb that displaced demand,
 * talent, capital, or supply-chain link — if someone spots it first.
 *
 * Inputs:   Live news search (GDELT / Brave / Tavily via WebSearchGateway),
 *           ACLED conflict data, V-Dem governance scores, user context.
 * Outputs:  A DisruptionOpportunityReport containing scored signals
 *           that the BW Consultant injects into every analysis.
 * ═══════════════════════════════════════════════════════════════════
 */

import { searchNews, type WebSearchResult } from './WebSearchGateway';

// ── Types ──────────────────────────────────────────────────────────

export interface DisruptionSignal {
  event: string;               // What happened: "Russia-Ukraine war disrupts Black Sea grain exports"
  affectedMarkets: string[];   // Who it hurts: ["Ukraine", "EU grain importers"]
  disruptionType: DisruptionType;
  severity: 'critical' | 'high' | 'moderate';
  source: string;              // GDELT, Brave, user context, etc.
  date?: string;
}

export type DisruptionType =
  | 'armed_conflict'
  | 'trade_war'
  | 'sanctions'
  | 'supply_chain_break'
  | 'political_instability'
  | 'natural_disaster'
  | 'currency_crisis'
  | 'energy_shock'
  | 'pandemic_disruption'
  | 'regulatory_shift';

export interface ArbitrageOpportunity {
  alternativeMarket: string;       // "Mindanao, Philippines"
  sector: string;                  // "agricultural processing"
  advantage: string;               // "Tropical grain-growing capacity + existing free port"
  disruptionSource: string;        // Linked disruption event
  score: number;                   // 0-100 composite
  reasoning: string;               // Why this market benefits
  historicalPrecedent?: string;    // "Vietnam replaced China in textiles post-tariff (2018)"
  timeHorizon: 'immediate' | 'short-term' | 'medium-term';
}

export interface DisruptionOpportunityReport {
  timestamp: Date;
  globalDisruptions: DisruptionSignal[];
  opportunities: ArbitrageOpportunity[];
  summaryForPrompt: string;        // Pre-formatted block for system prompt injection
}

// ── Disruption Pattern Library ─────────────────────────────────────
// Maps known disruption types to the kinds of alternative markets that benefit.
// These are structural economic patterns, not predictions.

const DISRUPTION_ARBITRAGE_PATTERNS: Record<DisruptionType, {
  alternativeTraits: string[];
  historicalExamples: string[];
}> = {
  armed_conflict: {
    alternativeTraits: [
      'politically stable small state',
      'neutral jurisdiction',
      'free port / SEZ with logistics capacity',
      'diaspora connection to displaced population',
    ],
    historicalExamples: [
      'Dubai absorbed displaced Middle East capital during Gulf War (1991)',
      'Rwanda attracted East African tech talent post-regional instability (2015+)',
      'Singapore captured trade diverted from Hong Kong unrest (2019-2020)',
    ],
  },
  trade_war: {
    alternativeTraits: [
      'bilateral trade agreement with both sides',
      'low-cost manufacturing with available workforce',
      'existing SEZ / free trade zone infrastructure',
      'neutral non-aligned trade partner',
    ],
    historicalExamples: [
      'Vietnam replaced China as US textile/electronics supplier post-tariff (2018-2020)',
      'Mexico nearshoring boom from US-China trade war (2019+)',
      'Bangladesh captured garment orders diverted from China (2018-2022)',
    ],
  },
  sanctions: {
    alternativeTraits: [
      'non-sanctioned jurisdiction with similar resource base',
      'transit hub outside sanction scope',
      'financial centre with neutral banking relationships',
    ],
    historicalExamples: [
      'Turkey and UAE captured Russian capital flows post-sanctions (2022+)',
      'Georgia tech sector grew as Russian IT workers relocated (2022)',
      'Kazakhstan attracted diverted Central Asian trade routes (2022+)',
    ],
  },
  supply_chain_break: {
    alternativeTraits: [
      'port or logistics hub near affected trade route',
      'manufacturing capacity with available labour',
      'agricultural production capability for affected commodity',
      'island or coastal city with shipping access',
    ],
    historicalExamples: [
      'Suez Canal blockage (2021) boosted Cape route logistics hubs',
      'COVID PPE shortage → Philippines, Sri Lanka, Kenya domestic production',
      'Japan earthquake (2011) → semiconductor wafer production diversified to SE Asia',
    ],
  },
  political_instability: {
    alternativeTraits: [
      'stable governance band (V-Dem)',
      'transparent business environment',
      'safe jurisdiction for capital relocation',
    ],
    historicalExamples: [
      'Mauritius captured capital flight from unstable African neighbours',
      'Uruguay attracted Argentine investors during peso crisis (2001-2002)',
      'Portugal Golden Visa attracted HNW from unstable Middle East/North Africa',
    ],
  },
  natural_disaster: {
    alternativeTraits: [
      'geographically distant from affected region',
      'similar agricultural/industrial capacity',
      'rebuild/reconstruction supply capability',
    ],
    historicalExamples: [
      'Thai flood (2011) → hard drive production shifted to Philippines & Malaysia',
      'Puerto Rico hurricane (2017) → pharmaceutical supply chains diversified',
    ],
  },
  currency_crisis: {
    alternativeTraits: [
      'dollarised economy or stable peg',
      'low-cost base made cheaper by relative stability',
      'export competitiveness from neighbour devaluation',
    ],
    historicalExamples: [
      'Türkiye lira collapse made Turkish manufacturing export-competitive (2021-2023)',
      'Asian Financial Crisis (1997) → Thailand & Malaysia attracted bargain FDI',
    ],
  },
  energy_shock: {
    alternativeTraits: [
      'renewable energy surplus',
      'LNG terminal access',
      'energy self-sufficient small island',
      'geothermal / hydro capacity',
    ],
    historicalExamples: [
      'EU gas crisis (2022) → Morocco, Algeria pipeline capacity gained strategic value',
      'Iceland leveraged geothermal for aluminium smelting when energy prices spiked globally',
    ],
  },
  pandemic_disruption: {
    alternativeTraits: [
      'island geography enabling border control',
      'digital infrastructure for remote work',
      'low population density',
      'existing health infrastructure',
    ],
    historicalExamples: [
      'Barbados Digital Nomad Visa attracted remote workers (2020+)',
      'New Zealand island containment became economic advantage (2020-2021)',
      'Estonia e-Residency attracted businesses from locked-down jurisdictions',
    ],
  },
  regulatory_shift: {
    alternativeTraits: [
      'business-friendly regulatory environment',
      'special economic zone or free trade zone',
      'fast company registration',
      'tax treaty network',
    ],
    historicalExamples: [
      'EU AI Act → some AI companies explored APAC regulatory arbitrage',
      'UK post-Brexit → financial services explored Dublin, Luxembourg, Frankfurt',
      'China tech crackdown → some startups relocated to Singapore (2021+)',
    ],
  },
};

// ── Disruption Detection from News ─────────────────────────────────

const DISRUPTION_KEYWORDS: Record<DisruptionType, RegExp> = {
  armed_conflict: /\b(war|conflict|invasion|military|bomb|strike|attack|battle|troops|missile|casualties|cease.?fire|escalat)\b/i,
  trade_war: /\b(tariff|trade war|trade ban|export ban|import restriction|trade dispute|retaliatory|duties|trade barrier)\b/i,
  sanctions: /\b(sanction|OFAC|embargo|blacklist|asset freeze|travel ban|restrictive measures|designat)\b/i,
  supply_chain_break: /\b(supply chain|shortage|disruption|blockage|shipping delay|port congestion|container|freight|logistics crisis)\b/i,
  political_instability: /\b(coup|protest|unrest|uprising|resignation|impeach|political crisis|emergency decree|martial law|regime)\b/i,
  natural_disaster: /\b(earthquake|hurricane|typhoon|flood|tsunami|wildfire|drought|volcanic|cyclone|storm surge)\b/i,
  currency_crisis: /\b(currency|devaluation|inflation|hyperinflation|debt default|sovereign debt|peso|lira|ruble crash|capital flight)\b/i,
  energy_shock: /\b(energy crisis|oil price|gas price|OPEC|pipeline|energy shortage|blackout|power grid|fuel|LNG)\b/i,
  pandemic_disruption: /\b(pandemic|outbreak|lockdown|quarantine|variant|WHO emergency|epidemic|infection surge)\b/i,
  regulatory_shift: /\b(regulation|regulatory|compliance|new law|legislation|ban on|restrict|policy shift|deregulat|AI act)\b/i,
};

function classifyDisruption(text: string): DisruptionType | null {
  // Score each type — the one with most keyword hits wins
  let bestType: DisruptionType | null = null;
  let bestCount = 0;

  for (const [type, regex] of Object.entries(DISRUPTION_KEYWORDS)) {
    const matches = text.match(new RegExp(regex.source, 'gi'));
    const count = matches ? matches.length : 0;
    if (count > bestCount) {
      bestCount = count;
      bestType = type as DisruptionType;
    }
  }

  return bestCount >= 1 ? bestType : null;
}

function extractAffectedMarkets(text: string): string[] {
  // Extract country/region names mentioned in disruption context
  const knownMarkets = [
    'United States', 'US', 'China', 'Russia', 'Ukraine', 'EU', 'Europe',
    'Japan', 'South Korea', 'Taiwan', 'India', 'Brazil', 'UK', 'Germany',
    'France', 'Middle East', 'Israel', 'Gaza', 'Iran', 'Saudi Arabia',
    'Turkey', 'Türkiye', 'Mexico', 'Canada', 'Australia', 'South Africa',
    'Nigeria', 'Egypt', 'Pakistan', 'Indonesia', 'Thailand', 'Vietnam',
    'Philippines', 'Malaysia', 'Singapore', 'Hong Kong', 'Black Sea',
    'Red Sea', 'Suez', 'Panama Canal', 'Baltic', 'Mediterranean',
    'Africa', 'Asia', 'Latin America', 'Caribbean', 'Pacific',
  ];

  const found: string[] = [];
  for (const market of knownMarkets) {
    if (text.toLowerCase().includes(market.toLowerCase()) && !found.includes(market)) {
      found.push(market);
    }
  }
  return found.slice(0, 5); // Cap at 5 affected markets
}

// ── Opportunity Scoring ────────────────────────────────────────────
// Composite score: severity weight * pattern match strength * recency

function scoreOpportunity(
  disruption: DisruptionSignal,
  pattern: typeof DISRUPTION_ARBITRAGE_PATTERNS[DisruptionType],
  userContext?: { country?: string; region?: string; industry?: string }
): number {
  let score = 50; // baseline

  // Severity multiplier
  if (disruption.severity === 'critical') score += 20;
  else if (disruption.severity === 'high') score += 10;

  // Contextual relevance: user's target region matches alternative traits
  if (userContext?.country || userContext?.region) {
    score += 10; // User has a specific market in mind — more actionable
  }

  // If the disruption has historical precedents
  if (pattern.historicalExamples.length > 0) {
    score += 5;
  }

  return Math.min(score, 95); // Cap at 95 — no certainty
}

// ── Main Engine ────────────────────────────────────────────────────

export async function analyseGeopoliticalArbitrage(
  userContext?: { country?: string; region?: string; industry?: string; query?: string }
): Promise<DisruptionOpportunityReport> {
  const disruptions: DisruptionSignal[] = [];
  const opportunities: ArbitrageOpportunity[] = [];

  // Step 1: Fetch current global disruption news
  const newsQueries = [
    'global economic disruption 2025 2026',
    'trade war sanctions supply chain crisis',
    'conflict economic impact regional markets',
  ];

  const allArticles: WebSearchResult[] = [];
  for (const query of newsQueries) {
    try {
      const results = await searchNews(query);
      allArticles.push(...results);
    } catch {
      // Non-blocking — continue with whatever we get
    }
  }

  // Step 2: Classify disruptions from news
  const seen = new Set<string>();
  for (const article of allArticles) {
    const text = `${article.title} ${article.snippet}`;
    const disruptionType = classifyDisruption(text);
    if (!disruptionType) continue;

    // Deduplicate by title similarity
    const key = article.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);

    const affected = extractAffectedMarkets(text);
    const severity = article.title.match(/crisis|war|collapse|emergency|critical/i) ? 'critical'
      : article.title.match(/escalat|sanction|ban|block|shortage/i) ? 'high' : 'moderate';

    disruptions.push({
      event: article.title,
      affectedMarkets: affected,
      disruptionType,
      severity: severity as DisruptionSignal['severity'],
      source: article.source || 'GDELT',
      date: article.publishedDate,
    });
  }

  // Step 3: Generate arbitrage opportunities from disruption patterns
  for (const disruption of disruptions.slice(0, 8)) { // Cap processing at 8 signals
    const pattern = DISRUPTION_ARBITRAGE_PATTERNS[disruption.disruptionType];
    if (!pattern) continue;

    const score = scoreOpportunity(disruption, pattern, userContext);
    const precedent = pattern.historicalExamples[0]; // Most relevant

    // Build opportunity signal
    opportunities.push({
      alternativeMarket: userContext?.country || userContext?.region || 'regional alternative',
      sector: userContext?.industry || deriveSector(disruption.disruptionType),
      advantage: pattern.alternativeTraits.slice(0, 2).join('; '),
      disruptionSource: disruption.event,
      score,
      reasoning: `${disruption.event} is disrupting ${disruption.affectedMarkets.join(', ')}. ` +
        `Markets with ${pattern.alternativeTraits[0]} can capture displaced demand. ` +
        (precedent ? `Historical precedent: ${precedent}` : ''),
      historicalPrecedent: precedent,
      timeHorizon: disruption.severity === 'critical' ? 'immediate' : disruption.severity === 'high' ? 'short-term' : 'medium-term',
    });
  }

  // Sort by score descending
  opportunities.sort((a, b) => b.score - a.score);

  // Step 4: Build summary for prompt injection
  const summaryForPrompt = buildPromptSummary(disruptions, opportunities);

  return {
    timestamp: new Date(),
    globalDisruptions: disruptions,
    opportunities: opportunities.slice(0, 6), // Top 6
    summaryForPrompt,
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function deriveSector(type: DisruptionType): string {
  const sectorMap: Record<DisruptionType, string> = {
    armed_conflict: 'defence / logistics / humanitarian',
    trade_war: 'manufacturing / export processing',
    sanctions: 'financial services / trade facilitation',
    supply_chain_break: 'logistics / warehousing / manufacturing',
    political_instability: 'capital management / safe-haven investment',
    natural_disaster: 'reconstruction / agriculture / insurance',
    currency_crisis: 'export manufacturing / BPO / remittance',
    energy_shock: 'renewable energy / resource processing',
    pandemic_disruption: 'digital services / remote work / biotech',
    regulatory_shift: 'fintech / data services / R&D',
  };
  return sectorMap[type] || 'general';
}

function buildPromptSummary(
  disruptions: DisruptionSignal[],
  opportunities: ArbitrageOpportunity[]
): string {
  if (disruptions.length === 0) {
    return '';
  }

  const lines: string[] = [
    '\n\n## GEOPOLITICAL ARBITRAGE INTELLIGENCE — Live Global Disruption Analysis',
    `Scanned ${disruptions.length} active global disruption signals. ${opportunities.length} potential arbitrage opportunities identified.`,
    '',
    '### Active Global Disruptions:',
  ];

  for (const d of disruptions.slice(0, 5)) {
    lines.push(`- **${d.disruptionType.replace(/_/g, ' ').toUpperCase()}**: ${d.event} [Severity: ${d.severity}] [Affected: ${d.affectedMarkets.join(', ') || 'multiple markets'}] (Source: ${d.source})`);
  }

  if (opportunities.length > 0) {
    lines.push('');
    lines.push('### Arbitrage Opportunities for Regional/Alternative Markets:');
    for (const o of opportunities.slice(0, 4)) {
      lines.push(`- **${o.sector}** (score: ${o.score}/100, horizon: ${o.timeHorizon}): ${o.reasoning.substring(0, 300)}`);
    }
  }

  lines.push('');
  lines.push('INSTRUCTION: Use the above geopolitical disruption intelligence to PROACTIVELY inform the user how current world events may create advantages or risks for their situation. When a global crisis hurts a major market, identify where regional cities, small islands, or lesser-known jurisdictions could capture displaced demand, talent, capital, or supply-chain links. Always cite the disruption event and historical precedent. Think beyond the obvious — wars, sanctions, and trade fractures all create openings for places that most systems overlook.');

  return lines.join('\n');
}
