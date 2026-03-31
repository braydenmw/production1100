// Lightweight external data integrations with rate limiting.
// Purpose: centralize world-bank, numbeo, opencorporates, marine/flight connectors.

export interface WorldBankIndicators {
  gdp?: number;
  gdpYear?: number;
  gdpGrowth?: number;
  internetUsersPercent?: number;
}

export interface NumbeoCityData {
  crimeIndex?: number;
  safetyIndex?: number;
  avgRentOneBed?: number;
  costOfLivingIndex?: number;
}

export interface OpenCorporateRecord {
  name: string;
  companyNumber?: string;
  jurisdictionCode?: string;
  officers?: Array<{ name: string; role?: string }>;
  incorporationDate?: string;
  sourceUrl?: string;
}

// Simple in-memory rate limiter per-service
class RateLimiter {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillIntervalMs: number;

  constructor(capacity = 5, refillIntervalMs = 60_000) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillIntervalMs = refillIntervalMs;
  }

  take(): boolean {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed > this.refillIntervalMs) {
      const refillCount = Math.floor(elapsed / this.refillIntervalMs);
      this.tokens = Math.min(this.capacity, this.tokens + refillCount * this.capacity);
      this.lastRefill = now;
    }
    if (this.tokens > 0) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

const worldBankLimiter = new RateLimiter(5, 60_000);
const numbeoLimiter = new RateLimiter(3, 60_000);
const opencorporatesLimiter = new RateLimiter(5, 60_000);
const marineLimiter = new RateLimiter(2, 60_000);

export function isExternalDataEnabled(): boolean {
  try {
    if (import.meta.env.VITE_ENABLE_EXTERNAL_DATA === 'true') return true;
  } catch {
    // ignore
  }
  if (typeof process !== 'undefined' && process.env?.ENABLE_EXTERNAL_DATA === 'true') return true;
  return false;
}

export async function fetchWorldBankCountryIndicators(countryCode: string): Promise<WorldBankIndicators | null> {
  if (!worldBankLimiter.take()) return null;

  try {
    const gdpUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&per_page=1`;
    const res = await fetch(gdpUrl);
    const data = await res.json();
    if (data[1]?.[0]) {
      return { gdp: data[1][0].value, gdpYear: parseInt(data[1][0].date) };
    }
  } catch (err) {
    console.warn('[External] World Bank fetch failed:', err);
  }
  return null;
}

export async function fetchNumbeoCityData(cityName: string): Promise<NumbeoCityData | null> {
  if (!numbeoLimiter.take()) return null;

  try {
    // Requires API key (VITE_NUMBEO_API_KEY or NUMBEO_API_KEY)
    const key = import.meta.env.VITE_NUMBEO_API_KEY || process.env?.NUMBEO_API_KEY;
    if (!key) {
      // No API key available - return null (no mock data)
      console.log(`[External] Numbeo: No API key configured for ${cityName}. Skipping.`);
      return null;
    }

    // Numbeo API call
    try {
      const url = `https://www.numbeo.com/api/city_prices?api_key=${key}&city=${encodeURIComponent(cityName)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        crimeIndex: data.crime_index ?? null,
        safetyIndex: data.safety_index ?? null,
        avgRentOneBed: data.avg_rent_one_bed ?? null,
        costOfLivingIndex: data.cost_of_living_index ?? null,
      };
    } catch (err) {
      console.warn('[External] Numbeo API call failed:', err);
      return null;
    }
  } catch (err) {
    console.warn('[External] Numbeo fetch failed:', err);
    return null;
  }
}

export async function fetchOpenCorporatesCompany(companyName: string): Promise<OpenCorporateRecord | null> {
  if (!opencorporatesLimiter.take()) return null;

  try {
    const url = `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(companyName)}&per_page=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.results?.companies?.[0]?.company) {
      const c = data.results.companies[0].company;
      return {
        name: c.name,
        companyNumber: c.company_number,
        jurisdictionCode: c.jurisdiction_code,
        incorporationDate: c.incorporation_date,
        sourceUrl: c.opencorporates_url
      };
    }
  } catch (err) {
    console.warn('[External] OpenCorporates fetch failed:', err);
  }
  return null;
}

export interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
  publishedAt?: string;
}

export interface SearchResultBatch {
  query: string;
  results: SearchResultItem[];
  source: 'duckduckgo' | 'gnews' | 'contextualweb' | 'bing';
  status: 'ok' | 'failed';
  error?: string;
}

const searchLimiter = new RateLimiter(10, 60_000);

export async function fetchDuckDuckGoSearch(query: string): Promise<SearchResultBatch> {
  if (!searchLimiter.take()) {
    return { query, results: [], source: 'duckduckgo', status: 'failed', error: 'rate_limit' };
  }

  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`; // instant answer

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const snippet = data?.AbstractText || data?.RelatedTopics?.[0]?.Text || '';
    const results: SearchResultItem[] = [];

    if (snippet) {
      results.push({ title: data.Heading || query, snippet, url: data?.AbstractURL || '', source: 'duckduckgo' });
    }

    return { query, results, source: 'duckduckgo', status: 'ok' };
  } catch (err) {
    return { query, results: [], source: 'duckduckgo', status: 'failed', error: String(err) };
  }
}

type GNewsArticle = { title?: string; description?: string; content?: string; url?: string; publishedAt?: string };

export async function fetchGNewsSearch(query: string): Promise<SearchResultBatch> {
  if (!searchLimiter.take()) {
    return { query, results: [], source: 'gnews', status: 'failed', error: 'rate_limit' };
  }
  const token = import.meta.env.VITE_GNEWS_API_KEY || process.env?.GNEWS_API_KEY;
  if (!token) {
    return { query, results: [], source: 'gnews', status: 'failed', error: 'no_key' };
  }

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&token=${token}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const results: SearchResultItem[] = ((data.articles as GNewsArticle[]) || []).map((a) => ({
      title: a.title || '',
      snippet: a.description || a.content || '',
      url: a.url || '',
      source: 'gnews',
      publishedAt: a.publishedAt
    }));
    return { query, results, source: 'gnews', status: 'ok' };
  } catch (err) {
    return { query, results: [], source: 'gnews', status: 'failed', error: String(err) };
  }
}

export async function fetchContextualWebSearch(query: string): Promise<SearchResultBatch> {
  if (!searchLimiter.take()) {
    return { query, results: [], source: 'contextualweb', status: 'failed', error: 'rate_limit' };
  }
  const key = import.meta.env.VITE_CONTEXTUALWEB_API_KEY || process.env?.CONTEXTUALWEB_API_KEY;
  if (!key) {
    return { query, results: [], source: 'contextualweb', status: 'failed', error: 'no_key' };
  }

  const url = `https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/WebSearchAPI?q=${encodeURIComponent(query)}&pageNumber=1&pageSize=10&autoCorrect=true`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    type ContextualItem = { title?: string; description?: string; url?: string; datePublished?: string };
    const results: SearchResultItem[] = ((data.value as ContextualItem[]) || []).map((item) => ({
      title: item.title || '',
      snippet: item.description || '',
      url: item.url || '',
      source: 'contextualweb',
      publishedAt: item.datePublished
    }));
    return { query, results, source: 'contextualweb', status: 'ok' };
  } catch (err) {
    return { query, results: [], source: 'contextualweb', status: 'failed', error: String(err) };
  }
}

export async function fetchBingSearch(query: string): Promise<SearchResultBatch> {
  if (!searchLimiter.take()) {
    return { query, results: [], source: 'bing', status: 'failed', error: 'rate_limit' };
  }
  const key = import.meta.env.VITE_BING_SEARCH_API_KEY || process.env?.BING_SEARCH_API_KEY;
  if (!key) {
    return { query, results: [], source: 'bing', status: 'failed', error: 'no_key' };
  }

  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10`;
  try {
    const res = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': key } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    type BingWebResult = { name?: string; snippet?: string; url?: string; dateLastCrawled?: string };
    const results: SearchResultItem[] = ((data.webPages?.value as BingWebResult[]) || []).map((item) => ({
      title: item.name || '',
      snippet: item.snippet || '',
      url: item.url || '',
      source: 'bing',
      publishedAt: item.dateLastCrawled
    }));
    return { query, results, source: 'bing', status: 'ok' };
  } catch (err) {
    return { query, results: [], source: 'bing', status: 'failed', error: String(err) };
  }
}

export async function aggregateGlobalSearch(query: string): Promise<SearchResultBatch[]> {
  const results: SearchResultBatch[] = [];
  results.push(await fetchDuckDuckGoSearch(query));
  results.push(await fetchGNewsSearch(query));
  results.push(await fetchContextualWebSearch(query));
  results.push(await fetchBingSearch(query));
  return results;
}

export async function fetchMarineTrafficPortActivity(_portNameOrCountry: string): Promise<Record<string, unknown> | null> {
  if (!marineLimiter.take()) return null;
  return null;
}

// ============================================================================
// ENHANCED INTELLIGENCE LAYER — New Free-Tier APIs
// ============================================================================

const imfLimiter = new RateLimiter(5, 60_000);
const exchangeRateLimiter = new RateLimiter(10, 60_000);
const wikiDataLimiter = new RateLimiter(5, 60_000);
const restCountriesLimiter = new RateLimiter(10, 60_000);

// ─── IMF World Economic Outlook ─────────────────────────────────────────────
// Free, no key required. Provides GDP forecasts, inflation projections,
// current account balances — the data that drives government policy.

export interface IMFIndicator {
  country: string;
  indicator: string;
  year: number;
  value: number | null;
  unit: string;
}

export async function fetchIMFIndicator(
  countryCode: string,
  indicator = 'NGDP_RPCH', // Real GDP growth rate
  year?: number
): Promise<IMFIndicator | null> {
  if (!imfLimiter.take()) return null;
  const yr = year || new Date().getFullYear();
  try {
    const url = `https://www.imf.org/external/datamapper/api/v1/${indicator}/${countryCode.toUpperCase()}?periods=${yr}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const values = data?.values?.[indicator]?.[countryCode.toUpperCase()];
    const val = values?.[String(yr)] ?? null;
    return {
      country: countryCode,
      indicator,
      year: yr,
      value: val !== null ? parseFloat(val) : null,
      unit: indicator.includes('NGDP') ? '% change' : indicator.includes('PCPI') ? '% change' : 'units'
    };
  } catch {
    return null;
  }
}

// Fetch multiple IMF indicators at once for a comprehensive economic snapshot
export async function fetchIMFCountrySnapshot(countryCode: string): Promise<IMFIndicator[]> {
  const indicators = [
    'NGDP_RPCH',  // Real GDP growth
    'PCPIPCH',    // Inflation (CPI)
    'BCA_NGDPD',  // Current account balance (% GDP)
    'GGXWDG_NGDP', // Government gross debt (% GDP)
    'LUR',        // Unemployment rate
  ];
  const results = await Promise.all(
    indicators.map(ind => fetchIMFIndicator(countryCode, ind).catch(() => null))
  );
  return results.filter((r): r is IMFIndicator => r !== null);
}

// ─── Exchange Rate API (free tier) ──────────────────────────────────────────
// Real-time currency exchange rates — critical for cross-border deal analysis

export interface ExchangeRateData {
  base: string;
  target: string;
  rate: number;
  timestamp: string;
}

export async function fetchExchangeRate(
  baseCurrency: string,
  targetCurrency: string
): Promise<ExchangeRateData | null> {
  if (!exchangeRateLimiter.take()) return null;
  try {
    // Free API, no key, 1500 req/month
    const url = `https://api.exchangerate.host/latest?base=${baseCurrency.toUpperCase()}&symbols=${targetCurrency.toUpperCase()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data?.rates?.[targetCurrency.toUpperCase()];
    if (!rate) return null;
    return {
      base: baseCurrency.toUpperCase(),
      target: targetCurrency.toUpperCase(),
      rate: parseFloat(rate),
      timestamp: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

// ─── REST Countries (enhanced) ──────────────────────────────────────────────
// Free, no key. Population, GDP, borders, currencies, languages, timezones.

export interface CountryProfile {
  name: string;
  officialName: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number; // km²
  currencies: string[];
  languages: string[];
  borders: string[];
  timezones: string[];
  gini?: number; // Income inequality index
  flagEmoji: string;
}

export async function fetchCountryProfile(countryName: string): Promise<CountryProfile | null> {
  if (!restCountriesLimiter.take()) return null;
  try {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=false&fields=name,capital,region,subregion,population,area,currencies,languages,borders,timezones,gini,flag`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const country = Array.isArray(data) ? data[0] : data;
    if (!country) return null;
    return {
      name: country.name?.common || countryName,
      officialName: country.name?.official || '',
      capital: (country.capital || [])[0] || '',
      region: country.region || '',
      subregion: country.subregion || '',
      population: country.population || 0,
      area: country.area || 0,
      currencies: Object.values(country.currencies || {}).map((c: any) => `${c.name} (${c.symbol || ''})`),
      languages: Object.values(country.languages || {}),
      borders: country.borders || [],
      timezones: country.timezones || [],
      gini: country.gini ? Object.values(country.gini)[0] as number : undefined,
      flagEmoji: country.flag || ''
    };
  } catch {
    return null;
  }
}

// ─── Wikidata SPARQL (structured knowledge) ─────────────────────────────────
// Free, no key. Structured knowledge graph queries for entities, relationships.

export interface WikidataEntity {
  id: string;
  label: string;
  description: string;
  properties: Record<string, string>;
}

export async function queryWikidata(entityName: string): Promise<WikidataEntity | null> {
  if (!wikiDataLimiter.take()) return null;
  try {
    // Search for entity first
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(entityName)}&language=en&limit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(6000) });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const entity = searchData?.search?.[0];
    if (!entity) return null;

    // Fetch entity details
    const detailUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entity.id}&languages=en&props=labels|descriptions|claims&format=json&origin=*`;
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(8000) });
    if (!detailRes.ok) return null;
    const detailData = await detailRes.json();
    const entityData = detailData?.entities?.[entity.id];
    if (!entityData) return null;

    // Extract useful properties (instance-of, country, population, founded, etc.)
    const properties: Record<string, string> = {};
    const claims = entityData.claims || {};
    // P31 = instance of, P17 = country, P571 = founded, P1082 = population
    const propMap: Record<string, string> = {
      P31: 'instanceOf', P17: 'country', P571: 'founded',
      P1082: 'population', P36: 'capital', P38: 'currency',
      P6: 'headOfGovernment', P122: 'governmentType'
    };
    for (const [prop, label] of Object.entries(propMap)) {
      const claim = claims[prop]?.[0]?.mainsnak?.datavalue;
      if (claim) {
        if (claim.type === 'wikibase-entityid') {
          properties[label] = claim.value?.id || '';
        } else if (claim.type === 'quantity') {
          properties[label] = claim.value?.amount || '';
        } else if (claim.type === 'time') {
          properties[label] = claim.value?.time || '';
        } else {
          properties[label] = String(claim.value || '');
        }
      }
    }

    return {
      id: entity.id,
      label: entity.label || entityName,
      description: entity.description || entityData.descriptions?.en?.value || '',
      properties
    };
  } catch {
    return null;
  }
}

// ─── World Bank Enhanced (multiple indicators) ──────────────────────────────
// Fetches a richer set of World Bank indicators beyond just GDP

export interface WorldBankEnhanced {
  gdp?: number;
  gdpGrowth?: number;
  gdpPerCapita?: number;
  inflation?: number;
  tradeOpenness?: number; // Trade (% of GDP)
  fdi?: number; // Foreign direct investment, net inflows (% of GDP)
  easeOfBusiness?: number; // Doing Business rank
  internetUsers?: number; // % of population
  year?: number;
}

export async function fetchWorldBankEnhanced(countryCode: string): Promise<WorldBankEnhanced | null> {
  if (!worldBankLimiter.take()) return null;
  try {
    const indicators = [
      'NY.GDP.MKTP.CD',       // GDP (current US$)
      'NY.GDP.MKTP.KD.ZG',    // GDP growth (annual %)
      'NY.GDP.PCAP.CD',       // GDP per capita
      'FP.CPI.TOTL.ZG',       // Inflation, CPI (annual %)
      'NE.TRD.GNFS.ZS',       // Trade (% of GDP)
      'BX.KLT.DINV.WD.GD.ZS', // FDI net inflows (% of GDP)
      'IT.NET.USER.ZS',       // Internet users (% population)
    ];
    const results = await Promise.all(indicators.map(async (ind) => {
      try {
        const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${ind}?format=json&per_page=1&date=2020:2025`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const data = await res.json();
        const entry = data?.[1]?.[0];
        return entry ? { indicator: ind, value: entry.value, year: parseInt(entry.date) } : null;
      } catch { return null; }
    }));

    const find = (ind: string) => results.find(r => r?.indicator === ind);
    return {
      gdp: find('NY.GDP.MKTP.CD')?.value,
      gdpGrowth: find('NY.GDP.MKTP.KD.ZG')?.value,
      gdpPerCapita: find('NY.GDP.PCAP.CD')?.value,
      inflation: find('FP.CPI.TOTL.ZG')?.value,
      tradeOpenness: find('NE.TRD.GNFS.ZS')?.value,
      fdi: find('BX.KLT.DINV.WD.GD.ZS')?.value,
      internetUsers: find('IT.NET.USER.ZS')?.value,
      year: results.find(r => r !== null)?.year
    };
  } catch {
    return null;
  }
}

// ─── Aggregated Intelligence Snapshot ───────────────────────────────────────
// Master function that pulls everything available for a country in parallel

export interface IntelligenceSnapshot {
  country: string;
  worldBank: WorldBankEnhanced | null;
  imf: IMFIndicator[];
  countryProfile: CountryProfile | null;
  wikidata: WikidataEntity | null;
  timestamp: string;
  sourcesQueried: number;
  sourcesResponded: number;
}

export async function fetchIntelligenceSnapshot(
  countryName: string,
  countryCode?: string
): Promise<IntelligenceSnapshot> {
  const code = countryCode || countryName.substring(0, 3).toUpperCase();
  const results = await Promise.allSettled([
    fetchWorldBankEnhanced(code),
    fetchIMFCountrySnapshot(code),
    fetchCountryProfile(countryName),
    queryWikidata(countryName),
  ]);

  const sourcesQueried = 4;
  const sourcesResponded = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;

  return {
    country: countryName,
    worldBank: results[0].status === 'fulfilled' ? results[0].value as WorldBankEnhanced | null : null,
    imf: results[1].status === 'fulfilled' ? (results[1].value as IMFIndicator[] || []) : [],
    countryProfile: results[2].status === 'fulfilled' ? results[2].value as CountryProfile | null : null,
    wikidata: results[3].status === 'fulfilled' ? results[3].value as WikidataEntity | null : null,
    timestamp: new Date().toISOString(),
    sourcesQueried,
    sourcesResponded
  };
}

