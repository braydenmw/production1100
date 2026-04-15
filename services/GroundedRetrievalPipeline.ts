/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 2: GROUNDED RETRIEVAL — Live Search + Citation Tagging
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Grounds ADVERSIQ responses in real-time external data with verifiable citations.
 * Detects when internal data is stale, auto-searches, injects results with
 * source URLs, and tags factual claims.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { webSearch, formatResultsForPrompt, type WebSearchResult } from './WebSearchGateway';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Citation {
  claim: string;
  source: string;
  url: string;
  confidence: number;
  retrievedAt: string;
}

export interface GroundedContext {
  searchResults: WebSearchResult[];
  citations: Citation[];
  searchQuery: string;
  promptInjection: string;
  searchTimeMs: number;
  sourceCount: number;
}

export interface GroundingDecision {
  shouldSearch: boolean;
  reason: string;
  queries: string[];
}

// ─── Grounding Decision ─────────────────────────────────────────────────────

const STALE_KEYWORDS = [
  'latest', 'current', 'recent', 'today', '2025', '2026', 'now',
  'this year', 'this month', 'updated', 'breaking', 'new regulation',
  'GDP', 'inflation', 'exchange rate', 'stock price', 'market cap',
];

const DATA_KEYWORDS = [
  'population', 'statistics', 'data', 'numbers', 'figures', 'report',
  'published', 'according to', 'world bank', 'IMF', 'UN', 'OECD',
  'government', 'ministry', 'official', 'regulation', 'law', 'policy',
];

export function shouldGroundResponse(
  message: string,
  brainConfidence: number,
  context?: Record<string, unknown>
): GroundingDecision {
  const lower = message.toLowerCase();
  const queries: string[] = [];
  const reasons: string[] = [];

  // Check for stale data indicators
  const staleHits = STALE_KEYWORDS.filter(k => lower.includes(k));
  if (staleHits.length > 0) {
    reasons.push(`Stale data keywords: ${staleHits.join(', ')}`);
    queries.push(message.slice(0, 200));
  }

  // Check for data/fact requests
  const dataHits = DATA_KEYWORDS.filter(k => lower.includes(k));
  if (dataHits.length >= 2) {
    reasons.push(`Data request: ${dataHits.join(', ')}`);
    const country = context?.country as string || '';
    queries.push(country ? `${message.slice(0, 150)} ${country}` : message.slice(0, 200));
  }

  // Low brain confidence — need external validation
  if (brainConfidence < 0.5) {
    reasons.push(`Low confidence (${(brainConfidence * 100).toFixed(0)}%)`);
    queries.push(message.slice(0, 200));
  }

  // Country-specific queries
  if (context?.country && typeof context.country === 'string') {
    const country = context.country;
    if (lower.includes('invest') || lower.includes('market entry') || lower.includes('regulation')) {
      queries.push(`${country} investment regulations ${new Date().getFullYear()}`);
      reasons.push(`Country-specific query for ${country}`);
    }
  }

  return {
    shouldSearch: queries.length > 0,
    reason: reasons.join('; ') || 'No grounding needed',
    queries: [...new Set(queries)].slice(0, 3),
  };
}

// ─── Search + Context Building ──────────────────────────────────────────────

export async function groundWithSearch(
  queries: string[],
  options?: { maxResultsPerQuery?: number; country?: string }
): Promise<GroundedContext> {
  const start = Date.now();
  const allResults: WebSearchResult[] = [];
  const maxPerQuery = options?.maxResultsPerQuery ?? 5;

  for (const query of queries.slice(0, 3)) {
    try {
      const results = await webSearch(query, {
        maxResults: maxPerQuery,
        country: options?.country,
        timeRange: 'year',
      });
      allResults.push(...results);
    } catch {
      // Search failed — continue with what we have
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = allResults.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Build citations from results
  const citations: Citation[] = deduped.map(r => ({
    claim: r.snippet.slice(0, 200),
    source: r.source || new URL(r.url).hostname,
    url: r.url,
    confidence: r.relevanceScore || 0.5,
    retrievedAt: new Date().toISOString(),
  }));

  // Build prompt injection block
  const promptInjection = deduped.length > 0
    ? `\n═══ LIVE SEARCH RESULTS (${deduped.length} sources) ═══\n${formatResultsForPrompt(deduped)}\n\nIMPORTANT: When making factual claims, cite the source using [Source: domain.com]. If search results contradict internal analysis, flag the discrepancy.\n═══ END SEARCH RESULTS ═══\n`
    : '';

  return {
    searchResults: deduped,
    citations,
    searchQuery: queries.join(' | '),
    promptInjection,
    searchTimeMs: Date.now() - start,
    sourceCount: deduped.length,
  };
}

// ─── Citation Extractor ─────────────────────────────────────────────────────

export function extractCitationsFromResponse(
  response: string,
  groundedContext: GroundedContext
): Citation[] {
  const citations: Citation[] = [];
  const sourcePattern = /\[(?:Source|Ref|Citation):\s*([^\]]+)\]/gi;
  let match;

  while ((match = sourcePattern.exec(response)) !== null) {
    const ref = match[1].trim();
    const matchedResult = groundedContext.searchResults.find(r =>
      r.url.includes(ref) || r.source?.includes(ref) || new URL(r.url).hostname.includes(ref)
    );
    if (matchedResult) {
      citations.push({
        claim: response.slice(Math.max(0, match.index - 100), match.index).trim(),
        source: ref,
        url: matchedResult.url,
        confidence: matchedResult.relevanceScore || 0.5,
        retrievedAt: new Date().toISOString(),
      });
    }
  }

  return citations.length > 0 ? citations : groundedContext.citations.slice(0, 5);
}
