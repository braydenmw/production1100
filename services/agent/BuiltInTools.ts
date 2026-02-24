// ============================================================================
// BUILT-IN TOOLS
// Registers the core BWGA intelligence tools into the AgentToolRegistry.
// Each tool wraps an existing service and normalises its output for the AI.
// ============================================================================

import type { AgentToolRegistry } from './AgentToolRegistry';
import { LiveDataService, ExchangeRateAPI } from '../LiveDataService';
import { PartnerIntelligenceEngine } from '../PartnerIntelligenceEngine';
import { RegionalDevelopmentOrchestrator } from '../RegionalDevelopmentOrchestrator';
import { CompositeScoreService, type CompositeScoreContext } from '../CompositeScoreService';
import type { PartnerCandidate } from '../PartnerIntelligenceEngine';

export function registerBuiltInTools(registry: AgentToolRegistry): void {

  // ── COUNTRY INTELLIGENCE ─────────────────────────────────────────────────
  registry.register({
    name: 'get_country_intelligence',
    description: 'Fetch live macro, trade, risk, and policy signals for any country or jurisdiction via World Bank + aggregated data layers',
    parameters: {
      country: { type: 'string', description: 'Country name (e.g. "Kenya", "Papua New Guinea")', required: true }
    },
    execute: async (p) => {
      const data = await LiveDataService.getCountryIntelligence(p.country as string);
      // Summarise the snapshot in a form the AI can quote directly
      const lines: string[] = [
        `Country Intelligence — ${p.country}`,
        data.gdpGrowth !== undefined ? `GDP Growth: ${data.gdpGrowth}%` : '',
        data.inflationRate !== undefined ? `Inflation: ${data.inflationRate}%` : '',
        data.fdiInflows !== undefined ? `FDI Inflows: $${data.fdiInflows}B` : '',
        data.riskScore !== undefined ? `Risk Score: ${data.riskScore}/100` : '',
        data.corruptionIndex !== undefined ? `Corruption Index: ${data.corruptionIndex}` : '',
        data.politicalStability !== undefined ? `Political Stability: ${data.politicalStability}` : '',
        data.tradeBalance !== undefined ? `Trade Balance: $${data.tradeBalance}B` : '',
        data.population !== undefined ? `Population: ${(data.population / 1e6).toFixed(1)}M` : '',
      ].filter(Boolean);
      return { success: true, data, latencyMs: 0, summary: lines.join('\n') };
    }
  });

  // ── EXCHANGE RATE ────────────────────────────────────────────────────────
  registry.register({
    name: 'get_exchange_rate',
    description: 'Get live exchange rate between two currencies',
    parameters: {
      from: { type: 'string', description: 'Source currency code (e.g. "USD")', required: true },
      to: { type: 'string', description: 'Target currency code (e.g. "EUR")', required: true }
    },
    execute: async (p) => {
      try {
        const rate = await ExchangeRateAPI.getRate(p.from as string, p.to as string);
        if (rate !== null) {
          return { success: true, data: { from: p.from, to: p.to, rate }, latencyMs: 0 };
        }
        return { success: false, data: null, error: `Rate not available for ${p.from}→${p.to}`, latencyMs: 0 };
      } catch (e) {
        return { success: false, data: null, error: String(e), latencyMs: 0 };
      }
    }
  });

  // ── PARTNER SCORING ──────────────────────────────────────────────────────
  registry.register({
    name: 'score_partner',
    description: 'Score and rank a potential partner using PVI/CIS/CCS/RFI/SRA/FRS algorithms. Pass a list of candidates.',
    parameters: {
      country: { type: 'string', description: 'Engagement country', required: true },
      sector: { type: 'string', description: 'Sector (government / banking / corporate / multilateral)', required: true },
      objective: { type: 'string', description: 'Strategic objective or engagement purpose' },
      constraints: { type: 'string', description: 'Any constraints or exclusion criteria' },
      candidateNames: { type: 'string', description: 'Comma-separated list of partner organisation names' }
    },
    execute: async (p) => {
      const names = String(p.candidateNames ?? '').split(',').map(n => n.trim()).filter(Boolean);
      // Build minimal PartnerCandidate objects — the engine will derive scores from context
      const candidates: PartnerCandidate[] = names.map((name, i) => ({
        id: `p${i}`,
        name,
        type: inferPartnerType(p.sector as string),
        countries: [p.country as string],
        sectors: [p.sector as string]
      }));

      if (candidates.length === 0) {
        return { success: false, data: null, error: 'No candidate names provided', latencyMs: 0 };
      }

      const ranked = PartnerIntelligenceEngine.rankPartners({
        country: p.country as string,
        sector: p.sector as string,
        objective: String(p.objective ?? ''),
        constraints: String(p.constraints ?? ''),
        candidates
      });

      const summary = ranked
        .map(r => `${r.partner.name}: ${r.score.total}/100 — ${r.reasons.join(', ')}`)
        .join('\n');

      return { success: true, data: ranked, latencyMs: 0, summary };
    }
  });

  // ── REGIONAL DEVELOPMENT KERNEL ──────────────────────────────────────────
  registry.register({
    name: 'run_regional_kernel',
    description: 'Run the Regional Development Kernel: generates ranked interventions, partner recommendations, execution plan, and governance readiness score for a region/sector/objective',
    parameters: {
      country: { type: 'string', description: 'Country', required: true },
      jurisdiction: { type: 'string', description: 'Jurisdiction or sub-region', required: true },
      sector: { type: 'string', description: 'Sector focus', required: true },
      objective: { type: 'string', description: 'Strategic objective', required: true },
      currentMatter: { type: 'string', description: 'Current situation or problem statement' },
      constraints: { type: 'string', description: 'Constraints or boundary conditions' }
    },
    execute: async (p) => {
      const result = RegionalDevelopmentOrchestrator.run({
        country: p.country as string,
        jurisdiction: p.jurisdiction as string,
        sector: p.sector as string,
        objective: p.objective as string,
        currentMatter: String(p.currentMatter ?? p.objective),
        constraints: String(p.constraints ?? ''),
        regionProfile: '',
        fundingEnvelope: '',
        governanceContext: '',
        evidenceNotes: [],
        partnerCandidates: []
      });

      const topInterventions = result.interventions
        .slice(0, 3)
        .map(i => `• ${i.title} (score ${i.score}): ${i.rationale}`)
        .join('\n');

      const summary = [
        `Governance Readiness: ${result.governanceReadiness}/100`,
        `Top Interventions:\n${topInterventions}`,
        result.notes.length > 0 ? `Notes: ${result.notes.slice(0, 3).join('; ')}` : ''
      ].filter(Boolean).join('\n');

      return { success: true, data: result, latencyMs: 0, summary };
    }
  });

  // ── COMPOSITE SCORE ──────────────────────────────────────────────────────
  registry.register({
    name: 'calculate_composite_scores',
    description: 'Calculate the full suite of BWGA composite indices (HDI, GEI, ESG, ICI, GEDI, RRDI, QGI) for a country and sector',
    parameters: {
      country: { type: 'string', description: 'Country', required: true },
      sector: { type: 'string', description: 'Sector context' },
      gdpGrowth: { type: 'number', description: 'GDP growth rate (%)' },
      inflationRate: { type: 'number', description: 'Inflation rate (%)' },
      fdiInflows: { type: 'number', description: 'FDI inflows (USD billions)' }
    },
    execute: async (p) => {
      const ctx: CompositeScoreContext = {
        country: p.country as string,
        region: p.country as string,
        industry: p.sector ? [p.sector as string] : undefined,
      };
      const scores = await CompositeScoreService.getScores(ctx);
      const c = scores.components;

      const summary = [
        `Overall: ${scores.overall?.toFixed(1) ?? 'N/A'}/100`,
        `Infrastructure: ${c.infrastructure?.toFixed(1)}`,
        `Market Access: ${c.marketAccess?.toFixed(1)}`,
        `Political Stability: ${c.politicalStability?.toFixed(1)}`,
        `Regulatory: ${c.regulatory?.toFixed(1)}`,
        `Growth Potential: ${c.growthPotential?.toFixed(1)}`,
        `Digital Readiness: ${c.digitalReadiness?.toFixed(1)}`,
        `Sustainability: ${c.sustainability?.toFixed(1)}`,
      ].join(' | ');

      return { success: true, data: scores, latencyMs: 0, summary };
    }
  });

  // ── GENERATE DOCUMENT ────────────────────────────────────────────────────
  registry.register({
    name: 'recommend_document',
    description: 'Identify the correct document type to generate for the current case situation and audience',
    parameters: {
      situation: { type: 'string', description: 'Current situation or case context', required: true },
      audience: { type: 'string', description: 'Target audience (e.g. ministry, board, investor, regulator)' },
      urgency: { type: 'string', description: 'Urgency level: immediate / near-term / planned' }
    },
    execute: async (p) => {
      const situation = String(p.situation).toLowerCase();
      const audience = String(p.audience ?? '').toLowerCase();

      // Simple rule-based routing matching DocumentTypeRouter logic
      let recommendation = 'Situation Assessment Report';
      const docs: string[] = [];

      if (audience.includes('investor') || situation.includes('invest') || situation.includes('funding')) {
        docs.push('Investment Prospectus', 'Financial Risk Register');
      }
      if (audience.includes('ministry') || audience.includes('government') || situation.includes('policy')) {
        docs.push('Government Policy Brief', 'Regulatory Compliance Report');
      }
      if (situation.includes('partner') || situation.includes('collaborat')) {
        docs.push('Partnership Proposal Letter', 'Partner Intelligence Report');
      }
      if (situation.includes('risk') || situation.includes('threat')) {
        docs.push('Risk Register', 'Adversarial Stress Test Report');
      }
      if (docs.length === 0) docs.push('Situation Assessment Report', 'Strategic Options Brief');

      recommendation = docs[0];
      return {
        success: true,
        data: { recommended: recommendation, allSuggested: docs },
        latencyMs: 0,
        summary: `Recommended document: ${recommendation}\nAlso applicable: ${docs.slice(1).join(', ')}`
      };
    }
  });
}

// Helper: infer PartnerCandidate type from sector string
function inferPartnerType(sector: string): PartnerCandidate['type'] {
  const s = sector.toLowerCase();
  if (s.includes('bank') || s.includes('financ')) return 'bank';
  if (s.includes('government') || s.includes('public') || s.includes('ministry')) return 'government';
  if (s.includes('multilateral') || s.includes('development') || s.includes('ifc') || s.includes('worldbank')) return 'multilateral';
  if (s.includes('community') || s.includes('ngo') || s.includes('civil')) return 'community';
  return 'corporate';
}
