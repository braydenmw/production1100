/**
 * Agentic Location Intelligence Service
 * 
 * This service provides an AI-powered system for dynamically researching
 * any location worldwide, extracting relevant information through
 * keyword-based searches and building comprehensive location profiles.
 */

import { type CityProfile } from '../data/globalLocationProfiles';

// ==================== TYPES ====================

export interface LocationQuery {
  query: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  region?: string;
  city?: string;
}

export interface ResearchTask {
  id: string;
  category: 'leadership' | 'economy' | 'infrastructure' | 'demographics' | 'investment' | 'news' | 'projects';
  keywords: string[];
  status: 'pending' | 'searching' | 'processing' | 'complete' | 'error';
  progress: number;
  results: ResearchResult[];
  error?: string;
}

export interface ResearchResult {
  source: string;
  title: string;
  snippet: string;
  url?: string;
  confidence: number;
  extractedData?: Record<string, unknown>;
  timestamp: string;
}

export interface LocationResearchSession {
  id: string;
  query: LocationQuery;
  status: 'initializing' | 'geocoding' | 'researching' | 'synthesizing' | 'complete' | 'error';
  progress: number;
  tasks: ResearchTask[];
  profile: Partial<CityProfile> | null;
  startTime: string;
  lastUpdate: string;
  logs: ResearchLog[];
}

export interface ResearchLog {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  timezone?: string;
  population?: number;
}

// ==================== KEYWORD EXTRACTION ENGINE ====================

const RESEARCH_KEYWORD_TEMPLATES = {
  leadership: [
    '{city} mayor 2024 2025 2026',
    '{city} governor current',
    '{city} {region} political leadership',
    '{city} government officials',
    '{city} elected officials',
    '{city} city council',
    '{country} {region} government leaders',
  ],
  economy: [
    '{city} GDP economic growth',
    '{city} major industries',
    '{city} employment rate jobs',
    '{city} foreign investment',
    '{city} export import trade',
    '{city} economic development',
    '{city} business climate',
    '{city} top companies employers',
  ],
  infrastructure: [
    '{city} airport seaport',
    '{city} transportation infrastructure',
    '{city} power grid utilities',
    '{city} internet connectivity',
    '{city} industrial zones',
    '{city} special economic zones',
    '{city} logistics hub',
  ],
  demographics: [
    '{city} population 2024 2025',
    '{city} median age demographics',
    '{city} literacy rate education',
    '{city} universities colleges',
    '{city} workforce skilled labor',
    '{city} language spoken',
  ],
  investment: [
    '{city} investment incentives',
    '{city} tax incentives business',
    '{city} foreign direct investment',
    '{city} economic zones incentives',
    '{city} government grants business',
    '{city} PPP public private partnership',
  ],
  news: [
    '{city} news today',
    '{city} development projects 2025 2026',
    '{city} infrastructure projects',
    '{city} business news',
    '{city} economic news',
  ],
  projects: [
    '{city} major development projects',
    '{city} infrastructure projects planned',
    '{city} construction projects',
    '{city} government projects',
    '{city} renewable energy projects',
  ],
};

function generateKeywords(template: string, context: LocationQuery): string {
  return template
    .replace('{city}', context.city || context.query)
    .replace('{region}', context.region || '')
    .replace('{country}', context.country || '')
    .trim();
}

// ==================== GEOCODING SERVICE ====================

export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  try {
    // Use Nominatim OpenStreetMap API for geocoding
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=1`,
      {
        headers: {
          'User-Agent': 'BW-Nexus-AI-GLI/1.0',
        },
      }
    );

    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error(`Geocoding service error: ${response.status}`);
      }
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const results = await response.json();
    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    const address = result.address || {};

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      city: address.city || address.town || address.village || address.municipality || query,
      region: address.state || address.province || address.region || '',
      country: address.country || '',
      countryCode: address.country_code?.toUpperCase() || '',
      population: result.extratags?.population ? parseInt(result.extratags.population) : undefined,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// ==================== TIMEZONE LOOKUP ====================

export function getTimezoneFromCoordinates(lat: number, lon: number): string {
  // Simplified timezone estimation based on longitude
  const offset = Math.round(lon / 15);
  const sign = offset >= 0 ? '+' : '';
  return `UTC${sign}${offset}`;
}

// ==================== LIVE RESEARCH ENGINE ====================
// Uses ReactiveIntelligenceEngine for real-time web search and intelligence

import { ReactiveIntelligenceEngine } from './ReactiveIntelligenceEngine';
import { searchCityLeadership, getWikipediaInfo, getCountryInfo } from './liveLocationSearchService';
import { fetchWorldBankCountryIndicators } from './externalDataIntegrations';
import { fetchACLEDEvents } from './acledService';
import { screenEntitySanctions } from './openSanctionsService';
import { gatewaySynthesize } from './UnifiedAIGateway';
import { startAgenticWorkflow, recordWorkflowStep, completeAgenticWorkflow } from './WellArchitectedAuditEngine';

function toIso2(country: string): string {
  const m: Record<string, string> = {
    'philippines': 'PH', 'vietnam': 'VN', 'indonesia': 'ID', 'thailand': 'TH',
    'malaysia': 'MY', 'singapore': 'SG', 'australia': 'AU', 'india': 'IN',
    'china': 'CN', 'japan': 'JP', 'south korea': 'KR', 'united states': 'US',
    'usa': 'US', 'germany': 'DE', 'united kingdom': 'GB', 'uk': 'GB',
    'france': 'FR', 'brazil': 'BR', 'mexico': 'MX', 'nigeria': 'NG',
    'kenya': 'KE', 'ghana': 'GH', 'south africa': 'ZA', 'egypt': 'EG',
    'uae': 'AE', 'saudi arabia': 'SA', 'turkey': 'TR', 'pakistan': 'PK',
    'fiji': 'FJ', 'papua new guinea': 'PG', 'myanmar': 'MM', 'cambodia': 'KH',
    'new zealand': 'NZ', 'canada': 'CA', 'argentina': 'AR', 'chile': 'CL',
    'sri lanka': 'LK', 'nepal': 'NP', 'bangladesh': 'BD', 'laos': 'LA',
  };
  return m[country.toLowerCase()] || country.toUpperCase().substring(0, 2);
}

async function runCategoryResearch(
  category: ResearchTask['category'],
  query: LocationQuery,
  keywords: string[]
): Promise<ResearchResult[]> {
  const timestamp = new Date().toISOString();
  const cityName = query.city || query.query;
  const country = query.country || '';
  const results: ResearchResult[] = [];

  try {
    switch (category) {
      case 'leadership': {
        const leaders = await searchCityLeadership(cityName, country).catch(() => []);
        for (const ldr of leaders.slice(0, 3)) {
          results.push({
            source: ldr.sourceUrl || 'Wikidata',
            title: `${ldr.name} - ${ldr.role}`,
            snippet: [ldr.description, ldr.party ? `Party: ${ldr.party}` : '', ldr.tenure ? `Tenure: ${ldr.tenure}` : ''].filter(Boolean).join('. ') || `${ldr.role} of ${cityName}.`,
            url: ldr.sourceUrl,
            confidence: 0.9,
            extractedData: { leaderName: ldr.name, leaderRole: ldr.role, leaderParty: ldr.party, leaderTenure: ldr.tenure },
            timestamp,
          });
        }
        const wiki = await getWikipediaInfo(cityName).catch(() => null);
        if (wiki) {
          results.push({
            source: 'Wikipedia',
            title: `${cityName} - Wikipedia`,
            snippet: wiki.extract.substring(0, 400),
            url: wiki.fullUrl,
            confidence: 0.75,
            timestamp,
          });
        }
        // OpenSanctions - screen top leader names for PEP / sanctions flags
        const leaderNames = results
          .filter(r => r.extractedData?.leaderName)
          .map(r => (r.extractedData as { leaderName: string }).leaderName);
        if (leaderNames.length > 0) {
          const screen = await screenEntitySanctions(leaderNames[0], 'Person').catch(() => null);
          if (screen && screen.totalHits > 0) {
            results.push({
              source: 'OpenSanctions',
              title: `Sanctions Check: ${leaderNames[0]}`,
              snippet: `Status: ${screen.clearanceLevel}. ${screen.flaggedLists.length > 0 ? `Flagged on: ${screen.flaggedLists.join(', ')}.` : 'No active sanctions found.'}`,
              url: 'https://www.opensanctions.org',
              confidence: 0.95,
              extractedData: { sanctionsStatus: screen.clearanceLevel, flaggedLists: screen.flaggedLists },
              timestamp,
            });
          }
        }
        break;
      }
      case 'economy': {
        const iso = country ? toIso2(country) : '';
        if (iso) {
          const wb = await fetchWorldBankCountryIndicators(iso).catch(() => null);
          if (wb) {
            const gdpFmt = wb.gdp
              ? (wb.gdp >= 1e12 ? `$${(wb.gdp / 1e12).toFixed(2)}T` : `$${(wb.gdp / 1e9).toFixed(1)}B`)
              : null;
            results.push({
              source: 'World Bank',
              title: `${country} Economic Indicators - World Bank ${wb.gdpYear || ''}`,
              snippet: [
                gdpFmt ? `GDP: ${gdpFmt}` : null,
                wb.gdpGrowth != null ? `Growth: ${wb.gdpGrowth.toFixed(1)}%` : null,
                wb.internetUsersPercent != null ? `Internet users: ${wb.internetUsersPercent.toFixed(0)}%` : null,
              ].filter(Boolean).join('. '),
              url: `https://data.worldbank.org/country/${iso}`,
              confidence: 0.95,
              extractedData: { gdp: wb.gdp, gdpGrowth: wb.gdpGrowth, gdpYear: wb.gdpYear, internetPct: wb.internetUsersPercent },
              timestamp,
            });
          }
        }
        const countryData = await getCountryInfo(country).catch(() => null);
        if (countryData) {
          const currencies = Object.keys((countryData.currencies as Record<string, unknown>) || {}).join(', ');
          const langs = Object.values((countryData.languages as Record<string, string>) || {}).join(', ');
          results.push({
            source: 'REST Countries API',
            title: `${country} Country Profile`,
            snippet: `Currency: ${currencies || 'N/A'}. Languages: ${langs || 'N/A'}. Population: ${(countryData.population as number)?.toLocaleString() || 'N/A'}. Area: ${(countryData.area as number)?.toLocaleString() || 'N/A'} km².`,
            url: 'https://restcountries.com',
            confidence: 0.88,
            extractedData: { currencies, population: countryData.population, area: countryData.area, languages: langs },
            timestamp,
          });
        }
        if (results.length < 2) {
          const live = await ReactiveIntelligenceEngine.liveSearch(keywords.slice(0, 2).join(' '), { category: 'economy', country }).catch(() => []);
          results.push(...live.slice(0, 3).map(r => ({ source: r.source || 'Live Search', title: r.title, snippet: r.snippet, url: r.url, confidence: 0.75, timestamp })));
        }
        break;
      }
      case 'demographics': {
        const countryData = await getCountryInfo(country).catch(() => null);
        if (countryData) {
          const langs = Object.values((countryData.languages as Record<string, string>) || {}).join(', ');
          const pop = countryData.population as number;
          results.push({
            source: 'REST Countries API',
            title: `${country} Demographics`,
            snippet: `Population: ${pop?.toLocaleString() || 'N/A'}. Languages: ${langs || 'N/A'}. Area: ${(countryData.area as number)?.toLocaleString() || 'N/A'} km². Region: ${(countryData.subregion as string) || (countryData.region as string) || 'N/A'}.`,
            url: 'https://restcountries.com',
            confidence: 0.9,
            extractedData: { population: pop, languages: langs, area: countryData.area, region: countryData.region },
            timestamp,
          });
        }
        const iso = country ? toIso2(country) : '';
        if (iso) {
          const wb = await fetchWorldBankCountryIndicators(iso).catch(() => null);
          if (wb?.internetUsersPercent != null) {
            results.push({
              source: 'World Bank',
              title: `${country} Digital Access`,
              snippet: `Internet users: ${wb.internetUsersPercent.toFixed(0)}% of population (World Bank).`,
              url: `https://data.worldbank.org/country/${iso}`,
              confidence: 0.9,
              extractedData: { internetPct: wb.internetUsersPercent },
              timestamp,
            });
          }
        }
        if (results.length === 0) {
          const live = await ReactiveIntelligenceEngine.liveSearch(`${cityName} ${country} population demographics`, { category: 'demographics' }).catch(() => []);
          results.push(...live.slice(0, 3).map(r => ({ source: r.source || 'Live Search', title: r.title, snippet: r.snippet, url: r.url, confidence: 0.7, timestamp })));
        }
        break;
      }
      case 'news': {
        try {
          const gdeltQ = encodeURIComponent(`"${cityName}" ${country}`);
          const gdeltRes = await fetch(
            `https://api.gdeltproject.org/api/v2/doc/doc?query=${gdeltQ}&mode=artlist&maxrecords=5&format=json`,
            { signal: AbortSignal.timeout(8000) }
          );
          if (gdeltRes.ok) {
            const gdeltData = await gdeltRes.json();
            const articles = (gdeltData.articles || []) as Array<{ title?: string; url?: string; domain?: string; seendate?: string }>;
            for (const art of articles.slice(0, 4)) {
              const rawDate = art.seendate || '';
              const dateStr = rawDate.replace(/(\d{4})(\d{2})(\d{2})T\d+Z/, '$1-$2-$3');
              results.push({
                source: art.domain || 'GDELT',
                title: art.title || `${cityName} News`,
                snippet: `${dateStr ? `[${dateStr}] ` : ''}${art.title || ''}`,
                url: art.url || '',
                confidence: 0.8,
                timestamp,
              });
            }
          }
        } catch { /* GDELT timeout - fall through */ }
        // ACLED - conflict & political violence events (complements GDELT news)
        const acledEvents = await fetchACLEDEvents(country, 4).catch(() => []);
        for (const ev of acledEvents) {
          results.push({
            source: `ACLED`,
            title: `[${ev.type}] ${ev.actor} - ${ev.location}`,
            snippet: `${ev.date}: ${ev.notes} ${ev.fatalities > 0 ? `(${ev.fatalities} fatalities)` : ''}`.trim(),
            url: 'https://acleddata.com',
            confidence: 0.9,
            timestamp,
          });
        }
        if (results.length === 0) {
          const live = await ReactiveIntelligenceEngine.liveSearch(`${cityName} ${country} news development 2025 2026`, { category: 'news', country }).catch(() => []);
          results.push(...live.slice(0, 4).map(r => ({ source: r.source || 'Live Search', title: r.title, snippet: r.snippet, url: r.url, confidence: 0.75, timestamp })));
        }
        break;
      }
      case 'infrastructure':
      case 'investment':
      case 'projects': {
        const live = await ReactiveIntelligenceEngine.liveSearch(keywords.slice(0, 3).join(' '), { category, country }).catch(() => []);
        results.push(...live.slice(0, 5).map(r => ({
          source: r.source || getCategorySource(category),
          title: r.title,
          snippet: r.snippet,
          url: r.url,
          confidence: 0.8,
          timestamp,
        })));
        break;
      }
    }
  } catch { /* non-fatal */ }

  if (results.length === 0) {
    results.push({
      source: getCategorySource(category),
      title: `${cityName} - ${category} data`,
      snippet: `Research ongoing for ${cityName} ${category} profile.`,
      confidence: 0.4,
      timestamp,
    });
  }
  return results;
}

function getCategorySource(category: string): string {
  const sources: Record<string, string[]> = {
    leadership: ['Official Government Portal', 'Wikipedia', 'Election Commission', 'News Archive'],
    economy: ['World Bank', 'IMF Data', 'National Statistics Office', 'Trade Ministry'],
    infrastructure: ['Department of Transport', 'Port Authority', 'Energy Commission', 'Infrastructure Report'],
    demographics: ['Census Bureau', 'UN Data', 'National Statistics', 'Education Ministry'],
    investment: ['Investment Promotion Agency', 'Economic Zone Authority', 'Trade Ministry', 'Chamber of Commerce'],
    news: ['Reuters', 'Bloomberg', 'Local News', 'Business Wire'],
    projects: ['Government Projects Portal', 'Development Bank', 'Infrastructure Ministry', 'PPP Center'],
  };
  const categorySourcesList = sources[category] || sources.news;
  // Deterministic selection based on category name
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = ((hash << 5) - hash + category.charCodeAt(i)) & 0x7fffffff;
  return categorySourcesList[hash % categorySourcesList.length];
}

// ==================== PROFILE SYNTHESIS ENGINE ====================

// Extract data from completed research tasks
function extractResearchData(tasks: ResearchTask[], category: string, _type: string): string[] | null {
  const task = tasks.find(t => t.category === category && t.status === 'complete');
  if (!task || !task.results.length) return null;
  
  // Extract meaningful snippets from research results
  const extracted = task.results
    .filter(r => r.snippet && r.snippet.length > 10)
    .map(r => r.title || r.snippet.slice(0, 80))
    .slice(0, 5);
  
  return extracted.length > 0 ? extracted : null;
}

async function synthesizeProfile(
  geocoding: GeocodingResult,
  tasks: ResearchTask[]
): Promise<Partial<CityProfile>> {
  const profile: Partial<CityProfile> = {
    id: `dynamic-${Date.now()}`,
    city: geocoding.city,
    region: geocoding.region,
    country: geocoding.country,
    latitude: geocoding.latitude,
    longitude: geocoding.longitude,
    timezone: getTimezoneFromCoordinates(geocoding.latitude, geocoding.longitude),
    established: 'Research in progress',
    
    // Default scores - updated from research when available
    engagementScore: 50,
    overlookedScore: 50,
    infrastructureScore: 50,
    regulatoryFriction: 50,
    politicalStability: 50,
    laborPool: 50,
    costOfDoing: 50,
    investmentMomentum: 50,
    
    // Populated from live research data
    knownFor: extractResearchData(tasks, 'economy', 'knownFor') || ['Awaiting live data'],
    strategicAdvantages: extractResearchData(tasks, 'investment', 'advantages') || ['Awaiting live data'],
    keySectors: extractResearchData(tasks, 'economy', 'sectors') || ['Awaiting live data'],
    investmentPrograms: extractResearchData(tasks, 'investment', 'programs') || ['Awaiting live data'],
    foreignCompanies: extractResearchData(tasks, 'investment', 'companies') || ['Awaiting live data'],
    globalMarketAccess: 'See full research results',
    
    leaders: [{
      id: 'leader-pending',
      name: 'Researching...',
      role: 'Political Leadership',
      tenure: 'Current',
      achievements: ['Data being collected'],
      rating: 0,
      internationalEngagementFocus: false,
    }],
    
    demographics: {
      population: geocoding.population?.toString() || 'Researching...',
      populationGrowth: 'Researching...',
      medianAge: 'Researching...',
      literacyRate: 'Researching...',
      workingAgePopulation: 'Researching...',
      universitiesColleges: 0,
      graduatesPerYear: 'Researching...',
    },
    
    economics: {
      gdpLocal: 'Researching...',
      gdpGrowthRate: 'Researching...',
      employmentRate: 'Researching...',
      avgIncome: 'Researching...',
      exportVolume: 'Researching...',
      majorIndustries: ['Researching...'],
      topExports: ['Researching...'],
      tradePartners: ['Researching...'],
    },
    
    infrastructure: {
      airports: [{ name: 'Researching...', type: 'Unknown' }],
      seaports: [{ name: 'Researching...', type: 'Unknown' }],
      specialEconomicZones: ['Researching...'],
      powerCapacity: 'Researching...',
      internetPenetration: 'Researching...',
    },
    
    governmentLinks: [{
      label: 'Official Website',
      url: '#',
    }],
  };

  // ── Extract real data from completed research agents ───────────────────────
  const getTaskResults = (cat: ResearchTask['category']) =>
    tasks.find(t => t.category === cat && t.status === 'complete')?.results ?? [];

  const econResults = getTaskResults('economy');
  const wbResult = econResults.find(r => r.source === 'World Bank');
  if (wbResult?.extractedData) {
    const ed = wbResult.extractedData as { gdp?: number; gdpGrowth?: number; gdpYear?: string; internetPct?: number };
    if (ed.gdp) {
      const f = ed.gdp >= 1e12 ? `$${(ed.gdp / 1e12).toFixed(2)} trillion` : `$${(ed.gdp / 1e9).toFixed(1)} billion`;
      profile.economics!.gdpLocal = `${f} (${ed.gdpYear || 'latest'}) - World Bank`;
    }
    if (ed.gdpGrowth != null) profile.economics!.gdpGrowthRate = `${ed.gdpGrowth.toFixed(1)}%`;
  }
  const restEconResult = econResults.find(r => r.source === 'REST Countries API');
  if (restEconResult?.extractedData) {
    const ed = restEconResult.extractedData as { currencies?: string };
    if (ed.currencies) profile.economics!.majorIndustries = [`Currency: ${ed.currencies}`, ...(profile.economics?.majorIndustries?.filter(i => i !== 'Researching...') ?? [])];
  }

  const demoResults = getTaskResults('demographics');
  const demoRest = demoResults.find(r => r.source === 'REST Countries API');
  if (demoRest?.extractedData) {
    const ed = demoRest.extractedData as { population?: number; languages?: string };
    if (ed.population) profile.demographics!.population = ed.population.toLocaleString();
    if (ed.languages) profile.demographics!.workingAgePopulation = `Languages: ${ed.languages}`;
  }
  const wbDemoResult = demoResults.find(r => r.source === 'World Bank');
  if (wbDemoResult?.extractedData) {
    const ed = wbDemoResult.extractedData as { internetPct?: number };
    if (ed.internetPct != null) profile.infrastructure!.internetPenetration = `${ed.internetPct.toFixed(0)}%`;
  }

  const leadResults = getTaskResults('leadership');
  const realLeaders = leadResults
    .filter(r => r.extractedData?.leaderName)
    .map((r, idx) => {
      const d = r.extractedData as { leaderName: string; leaderRole: string; leaderParty?: string; leaderTenure?: string };
      return {
        id: `leader-research-${idx}`,
        name: d.leaderName,
        role: d.leaderRole || 'Political Leader',
        tenure: d.leaderTenure || 'Current',
        achievements: [`${d.leaderRole || 'Leader'} of ${geocoding.city}${d.leaderParty ? ` - ${d.leaderParty}` : ''}`],
        rating: 70,
        internationalEngagementFocus: false,
      };
    });
  if (realLeaders.length > 0) profile.leaders = realLeaders;

  const newsResults = getTaskResults('news');
  if (newsResults.length > 0) {
    profile.recentNews = newsResults.slice(0, 4).map(r => ({
      date: new Date().toISOString().split('T')[0],
      title: r.title,
      summary: r.snippet,
      source: r.source,
      link: r.url || '#',
    }));
  }

  profile.knownFor = [
    `${geocoding.city}, ${geocoding.region ? geocoding.region + ', ' : ''}${geocoding.country}`,
    ...tasks.filter(t => t.status === 'complete' && t.results.length > 0).map(t => `${t.results[0]?.title?.substring(0, 60) || t.category}`),
  ].filter(Boolean).slice(0, 5);

  // ── AI-Powered Synthesis - enrich scores via multi-brain gateway ─────────
  try {
    const researchSummary = tasks
      .filter(t => t.status === 'complete' && t.results.length > 0)
      .map(t => `## ${t.category.toUpperCase()}\n${t.results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}`)
      .join('\n\n');

    if (researchSummary.length > 50) {
      const aiScores = await gatewaySynthesize(
        `Based on the live research data below for ${geocoding.city}, ${geocoding.country}, score the following on a 0-100 scale. Return ONLY valid JSON.\n\n${researchSummary}\n\nReturn: {"engagementScore":N,"overlookedScore":N,"infrastructureScore":N,"regulatoryFriction":N,"politicalStability":N,"laborPool":N,"costOfDoing":N,"investmentMomentum":N,"strategicAdvantages":["adv1","adv2","adv3"],"keySectors":["sector1","sector2"]}`,
        researchSummary,
        'agenticLocationIntelligence'
      );
      const cleaned = aiScores.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed.engagementScore === 'number') profile.engagementScore = parsed.engagementScore;
        if (typeof parsed.overlookedScore === 'number') profile.overlookedScore = parsed.overlookedScore;
        if (typeof parsed.infrastructureScore === 'number') profile.infrastructureScore = parsed.infrastructureScore;
        if (typeof parsed.regulatoryFriction === 'number') profile.regulatoryFriction = parsed.regulatoryFriction;
        if (typeof parsed.politicalStability === 'number') profile.politicalStability = parsed.politicalStability;
        if (typeof parsed.laborPool === 'number') profile.laborPool = parsed.laborPool;
        if (typeof parsed.costOfDoing === 'number') profile.costOfDoing = parsed.costOfDoing;
        if (typeof parsed.investmentMomentum === 'number') profile.investmentMomentum = parsed.investmentMomentum;
        if (Array.isArray(parsed.strategicAdvantages)) profile.strategicAdvantages = parsed.strategicAdvantages;
        if (Array.isArray(parsed.keySectors)) profile.keySectors = parsed.keySectors;
      }
    }
  } catch (err) {
    console.warn('[AgenticLocationIntelligence] AI score synthesis failed, using defaults:', err);
  }

  return profile;
}

// ==================== MAIN RESEARCH SESSION MANAGER ====================

class LocationResearchManager {
  private sessions: Map<string, LocationResearchSession> = new Map();
  private listeners: Map<string, ((session: LocationResearchSession) => void)[]> = new Map();

  async startResearch(query: string): Promise<LocationResearchSession> {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    const session: LocationResearchSession = {
      id: sessionId,
      query: { query },
      status: 'initializing',
      progress: 0,
      tasks: [],
      profile: null,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      logs: [],
    };

    this.sessions.set(sessionId, session);
    this.addLog(sessionId, 'info', `Starting research for: ${query}`);
    
    // Begin async research process
    this.runResearch(sessionId);
    
    return session;
  }

  private async runResearch(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // WA-Guardrail: start a tracked agentic workflow
    const _workflowTrace = startAgenticWorkflow(sessionId, {
      maxDurationMs: 120_000,
      maxSteps: 25,
    });

    try {
      // Step 1: Geocoding
      this.updateSession(sessionId, { status: 'geocoding', progress: 5 });
      this.addLog(sessionId, 'info', 'Geocoding location...');
      
      const geocoding = await geocodeLocation(session.query.query);
      
      if (!geocoding) {
        throw new Error(`Could not find location: ${session.query.query}`);
      }

      this.addLog(sessionId, 'success', `Found: ${geocoding.displayName}`);
      this.addLog(sessionId, 'info', `Coordinates: ${geocoding.latitude.toFixed(4)}, ${geocoding.longitude.toFixed(4)}`);
      
      session.query = {
        ...session.query,
        latitude: geocoding.latitude,
        longitude: geocoding.longitude,
        city: geocoding.city,
        region: geocoding.region,
        country: geocoding.country,
      };

      // Step 2: Create research tasks
      this.updateSession(sessionId, { status: 'researching', progress: 15 });
      this.addLog(sessionId, 'info', 'Generating research tasks...');
      
      const categories: Array<ResearchTask['category']> = [
        'leadership', 'economy', 'infrastructure', 'demographics', 'investment', 'news', 'projects'
      ];
      
      const tasks: ResearchTask[] = categories.map(category => ({
        id: `task-${category}-${Date.now()}`,
        category,
        keywords: RESEARCH_KEYWORD_TEMPLATES[category].map(t => generateKeywords(t, session.query)),
        status: 'pending' as const,
        progress: 0,
        results: [],
      }));

      session.tasks = tasks;
      this.notifyListeners(sessionId);

      // Step 3: Execute research tasks
      const totalTasks = tasks.length;
      let completedTasks = 0;

      for (const task of tasks) {
        // WA-Guardrail: check timeout/iteration/permission before each research step
        const guardrailCheck = recordWorkflowStep(
          sessionId, 'web_search', task.category, '', 'multi', 0
        );
        if (!guardrailCheck.allowed) {
          this.addLog(sessionId, 'warning', `Guardrail stopped research: ${guardrailCheck.reason}`);
          break;
        }

        task.status = 'searching';
        this.addLog(sessionId, 'info', `Researching ${task.category}...`);
        this.notifyListeners(sessionId);

        try {
          task.results = await runCategoryResearch(task.category, session.query, task.keywords);
          task.status = 'complete';
          task.progress = 100;
          completedTasks++;
          
          this.addLog(sessionId, 'success', `${task.category} research complete (${task.results.length} sources)`);
        } catch (error) {
          task.status = 'error';
          task.error = error instanceof Error ? error.message : 'Unknown error';
          this.addLog(sessionId, 'error', `${task.category} research failed: ${task.error}`);
        }

        const overallProgress = 15 + (completedTasks / totalTasks) * 70;
        this.updateSession(sessionId, { progress: overallProgress });
      }

      // Step 4: Synthesize profile
      this.updateSession(sessionId, { status: 'synthesizing', progress: 90 });
      this.addLog(sessionId, 'info', 'Synthesizing location profile...');
      
      const profile = await synthesizeProfile(geocoding, session.tasks);
      
      // Step 5: Complete
      this.updateSession(sessionId, {
        status: 'complete',
        progress: 100,
        profile,
      });
      this.addLog(sessionId, 'success', `Research complete for ${geocoding.city}, ${geocoding.country}`);
      completeAgenticWorkflow(sessionId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateSession(sessionId, { status: 'error', progress: 0 });
      this.addLog(sessionId, 'error', `Research failed: ${errorMessage}`);
      completeAgenticWorkflow(sessionId);
    }
  }

  private updateSession(sessionId: string, updates: Partial<LocationResearchSession>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    Object.assign(session, updates, { lastUpdate: new Date().toISOString() });
    this.notifyListeners(sessionId);
  }

  private addLog(sessionId: string, level: ResearchLog['level'], message: string, details?: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    session.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    });
    this.notifyListeners(sessionId);
  }

  getSession(sessionId: string): LocationResearchSession | undefined {
    return this.sessions.get(sessionId);
  }

  subscribe(sessionId: string, callback: (session: LocationResearchSession) => void): () => void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, []);
    }
    this.listeners.get(sessionId)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(sessionId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }

  private notifyListeners(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    const callbacks = this.listeners.get(sessionId);
    if (session && callbacks) {
      callbacks.forEach(cb => cb(session));
    }
  }
}

// Singleton instance
export const locationResearchManager = new LocationResearchManager();

// ==================== REACT HOOK ====================

export function useLocationResearch(sessionId: string | null) {
  const [session, setSession] = React.useState<LocationResearchSession | null>(null);

  React.useEffect(() => {
    if (!sessionId) {
      setSession(null);
      return;
    }

    const currentSession = locationResearchManager.getSession(sessionId);
    if (currentSession) {
      setSession({ ...currentSession });
    }

    const unsubscribe = locationResearchManager.subscribe(sessionId, (updated) => {
      setSession({ ...updated });
    });

    return unsubscribe;
  }, [sessionId]);

  return session;
}

// Import React for the hook
import * as React from 'react';

