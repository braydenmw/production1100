import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';


import { Globe, ArrowLeft, Download, Database, Newspaper, ExternalLink, MapPin, Clock, DollarSign, Briefcase, GraduationCap, FileText, Award, History, Rocket, Search, Loader2, AlertCircle, CheckCircle2, PanelLeftClose, PanelRightClose, X, Link2, Eye, Info } from 'lucide-react';
import PersonCard from './PersonCard';
import { CITY_PROFILES, type CityLeader, type CityProfile } from '../data/globalLocationProfiles';
import { getCityProfiles, searchCityProfiles } from '../services/globalLocationService';
// Gemini/Google AI logic removed
import { fetchGovernmentLeaders, getRegionalComparisons, type GovernmentLeader, type RegionalComparisonSet } from '../services/governmentDataService';
import { generateDocument } from '../services/openaiClientService';
import { researchLocation, type LocationResult, type ResearchProgress } from '../services/geminiLocationService';
import { deepLocationResearch, type DeepResearchResult } from '../services/deepLocationResearchService';
// Automatic Search Integration
import { automaticSearchService } from '../services/AutomaticSearchService';
import { bwConsultantAI } from '../services/BWConsultantAgenticAI';
// Location intelligence cluster
import { locationResearchCache } from '../services/locationResearchCache';
import { autonomousResearchAgent } from '../services/autonomousResearchAgent';
import { documentGenerator } from '../services/locationIntelligenceDocumentGenerator';
import { osintSearch, type OsintResult } from '../services/osintSearchService';
import { comprehensiveLiveSearch } from '../services/liveLocationSearchService';
import { locationResearchManager } from '../services/agenticLocationIntelligence';
import { multiSourceResearch as multiSourceResearchV1 } from '../services/multiSourceResearchService_v2';

// Type alias for backwards compatibility
type SourceCitation = { title: string; url: string; type: string; reliability: string };
type MultiSourceResult = Omit<LocationResult, 'sources'> & { sources: SourceCitation[] };

const ProjectBadge: React.FC<{ status: 'completed' | 'ongoing' | 'planned' }> = ({ status }) => {
  const colors = {
    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    ongoing: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    planned: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  };
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Use OpenStreetMap embed for reliable map display
const buildFallbackMapUrl = (lat: number, lon: number) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05},${lat - 0.03},${lon + 0.05},${lat + 0.03}&layer=mapnik&marker=${lat},${lon}`;

interface GlobalLocationIntelligenceProps {
  onBack?: () => void;
  onOpenCommandCenter?: () => void;
  /** Called when user pushes a researched location into VERDIX Consultant */
  onPushToConsultant?: (data: {
    city: string;
    country: string;
    summary: string;
    profile: CityProfile;
    research: object | null;
  }) => void;
  pendingLocation?: {
    profile: CityProfile;
    research: LocationResult | null;
    city: string;
    country: string;
  } | null;
  onLocationLoaded?: () => void;
}

const GlobalLocationIntelligence: React.FC<GlobalLocationIntelligenceProps> = ({ onOpenCommandCenter, pendingLocation, onLocationLoaded, onPushToConsultant }) => {
  // Core state - starts EMPTY, no pre-selection
  const [profiles, setProfiles] = useState<CityProfile[]>(CITY_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeLeader, setActiveLeader] = useState<CityLeader | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityProfile[]>([]);
  const [hasSelection, setHasSelection] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Live research state
  const [isResearching, setIsResearching] = useState(false);
  const [useExternalSources, setUseExternalSources] = useState(false);
  const [useRealTimeFeeds, setUseRealTimeFeeds] = useState(false);
  const [researchProgress, setResearchProgress] = useState<ResearchProgress | null>(null);
  const [liveProfile, setLiveProfile] = useState<CityProfile | null>(null);
  const [researchResult, setResearchResult] = useState<MultiSourceResult | null>(null);
  
  // Government data state
  const [, setGovernmentLeaders] = useState<GovernmentLeader[]>([]);
  const [, setIsLoadingGovernmentData] = useState(false);
  const [, setRegionalComparisons] = useState<RegionalComparisonSet | null>(null);
  const [, setIsLoadingComparisons] = useState(false);

  // Split-screen source browser state
  const [selectedSourceUrl, setSelectedSourceUrl] = useState<string | null>(null);
  const [showPersonCard, setShowPersonCard] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isSourcePanelCollapsed, setIsSourcePanelCollapsed] = useState(false);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Document generation state
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'letter' | 'report' | 'briefing'>('report');
  const [autoBackfillTriggered, setAutoBackfillTriggered] = useState(false);
  const [osintResults, setOsintResults] = useState<OsintResult[]>([]);
  const [dataCompletenessScore, setDataCompletenessScore] = useState<number | null>(null);
  // Keep locationResearchManager available for agentic sub-tasks
  const _agentManager = locationResearchManager;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Handle search results filtering
  useEffect(() => {
    const runSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      const results = await searchCityProfiles(searchQuery);
      setSearchResults(results);
    };
    runSearch();
  }, [searchQuery]);

  // Get active profile (either from existing data or live research)
  const activeProfile = useMemo(() => {
    if (liveProfile && hasSelection && !activeProfileId) {
      return liveProfile;
    }
    if (!activeProfileId) return null;
    return profiles.find(profile => profile.id === activeProfileId) || null;
  }, [activeProfileId, profiles, liveProfile, hasSelection]);

  const wikiExtract = activeProfile ? (activeProfile as unknown as { _rawWikiExtract?: string })._rawWikiExtract : undefined;
  const wikiParagraphs = wikiExtract
    ? wikiExtract.split('\n').map(p => p.trim()).filter(Boolean).slice(0, 2)
    : [];

  // Debug: Log profile and research result for troubleshooting missing fields
  useEffect(() => {
    if (activeProfile) {
      console.log('[FactSheet] activeProfile:', activeProfile);
      if (activeProfile.entityType === 'person') setShowPersonCard(true);
    }
    if (researchResult) {
      console.log('[FactSheet] researchResult:', researchResult);
    }
  }, [activeProfile, researchResult]);



  // Compute which key profile areas are missing to help diagnose gaps
  const computeMissingFields = (profile?: CityProfile | null, research?: MultiSourceResult | null) => {
    const missing: string[] = [];
    if (!profile) return missing;

    if (!profile.leaders || profile.leaders.length === 0) missing.push('Leadership');
    if (!profile.economics || !profile.economics.gdpLocal) missing.push('Economics');
    if (!profile.demographics || !profile.demographics.population) missing.push('Demographics');
    if (!profile.infrastructure || (!profile.infrastructure.airports?.length && !profile.infrastructure.seaports?.length)) missing.push('Infrastructure');
    if (!profile.governmentLinks || profile.governmentLinks.length === 0) missing.push('Government sources');
    if (!profile.investmentPrograms || profile.investmentPrograms.length === 0) missing.push('Investment programs');
    if (!profile.operationalCosts || (!profile.operationalCosts.avgOfficeRentPerSqM && !profile.operationalCosts.electricityKwhCommercial && !profile.operationalCosts.internetSpeedAvgMbps)) missing.push('Operational costs');
    if (!profile.labor || !profile.labor.topUniversities || profile.labor.topUniversities.length === 0) missing.push('Labor & Talent');
    if (!profile.risk || (!profile.risk.politicalStabilityIndex && !profile.risk.naturalDisasterRisk)) missing.push('Risk & Security');
    if (!profile.sustainability || (profile.sustainability.aqi === undefined && profile.sustainability.percentRenewables === undefined)) missing.push('Sustainability');
    if (!profile._rawWikiExtract && (!research || !research.summary)) missing.push('Narrative / Wikipedia extract');
    if (!research || (research.sources && research.sources.length < 2)) missing.push('Supporting sources');

    return missing;
  };

  const missingFields = computeMissingFields(activeProfile, researchResult);

  // Auto backfill - run deep research automatically if critical fields are missing (once per profile)
  useEffect(() => {
    if (!activeProfile || autoBackfillTriggered) return;
    const critical = ['Leadership', 'Economics', 'Demographics'];
    const missingCritical = missingFields.filter(f => critical.includes(f));
    if (missingCritical.length === 0) return;

    // Trigger auto backfill after brief delay to avoid UI race conditions
    const timer = setTimeout(async () => {
      setAutoBackfillTriggered(true);
      setIsResearching(true);
      setResearchProgress({ stage: 'Auto Backfill', progress: 5, message: 'Attempting to fill critical data gaps automatically' });
      try {
        const deep = await deepLocationResearch(activeProfile.city, (p) => setResearchProgress(p));
        if (deep && deep.profile) {
          setLiveProfile(deep.profile);
          const merged = {
            profile: deep.profile,
            sources: (deep.sources || []).map((s: { title: string; url?: string; type?: string; reliability?: string }) => ({ title: s.title, url: s.url || '#', type: s.type || 'research', reliability: s.reliability || 'unknown' })),
            summary: deep.narratives?.overview || deep.profile.city,
            dataQuality: deep.dataQuality ? { completeness: deep.dataQuality.completeness, freshness: deep.dataQuality.freshness || 'N/A', sourcesCount: (deep.sources || []).length, leaderDataVerified: !!(deep.dataQuality.leaderDataVerified), economicDataYear: deep.dataQuality.economicDataYear || 'N/A' } : { completeness: 80, freshness: 'N/A', sourcesCount: (deep.sources || []).length, leaderDataVerified: false, economicDataYear: 'N/A' }
          } as unknown as MultiSourceResult;
          setResearchResult(merged);
          setResearchProgress({ stage: 'Complete', progress: 100, message: 'Auto backfill complete.' });
        } else {
          setResearchProgress({ stage: 'Failed', progress: 0, message: 'Auto backfill returned no additional data.' });
        }
      } catch (err) {
        console.error('Auto backfill failed:', err);
        setResearchProgress({ stage: 'Error', progress: 0, message: 'Auto backfill failed' });
      } finally {
        setIsResearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activeProfile, missingFields, autoBackfillTriggered]);

  // Handle search submission - LIVE SEARCH
  const handleSearchSubmit = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // ALWAYS do live research - never use static placeholder data
    setHasSelection(true);
    setActiveProfileId(null);
    setLiveProfile(null);
    setResearchResult(null);
    setSearchQuery('');
    setSearchResults([]);
    setLoadingError(null);
    setIsResearching(true);
    setResearchProgress({ stage: 'Initializing', progress: 0, message: 'Starting multi-source research...' });
    
    try {
      // Check locationResearchCache first - prevents redundant API calls
      try {
        await locationResearchCache.initialize();
        const cached = await locationResearchCache.getFullResult(trimmedQuery);
        if (cached) {
          setLiveProfile(cached.profile as unknown as CityProfile);
          setResearchResult(cached as unknown as MultiSourceResult);
          setResearchProgress({ stage: 'Complete', progress: 100, message: 'Loaded from research cache' });
          setIsResearching(false);
          return;
        }
      } catch (_ce) { /* cache unavailable - proceed with live research */ }

      // Use automatic search service for enhanced results
      await automaticSearchService.triggerSearch(trimmedQuery, 'user_search', 'high');

      // Gemini logic removed
      const result = await researchLocation(trimmedQuery, (progress) => {
        setResearchProgress(progress);
      });

      // If no result and external sources enabled, try enhanced multiSourceResearch with external options
      if (!result && useExternalSources) {
        setResearchProgress({ stage: 'External Enrichment', progress: 10, message: 'Trying external data sources...' });
        const externalResult = await (await import('../services/multiSourceResearchService_v2')).multiSourceResearch(trimmedQuery, (p) => setResearchProgress(p), true, { useExternalSources: true, useRealTimeFeeds: useRealTimeFeeds });
        if (externalResult) {
          setLiveProfile(externalResult.profile);
          setResearchResult(externalResult as unknown as MultiSourceResult);
          setResearchProgress({ stage: 'Complete', progress: 100, message: 'External enrichment complete' });
          setIsResearching(false);

          // Trigger consultant AI analysis of the results
          await bwConsultantAI.consult({ locationQuery: trimmedQuery, searchResult: externalResult }, 'location_search_complete');
          return;
        }
      }

      // v1 multiSourceResearch fallback - additional source before live search
      if (!result) {
        try {
          setResearchProgress({ stage: 'Multi-Source V1', progress: 20, message: `Trying multi-source research for ${trimmedQuery}...` });
          const v1Result = await multiSourceResearchV1(trimmedQuery, (p) => setResearchProgress(p));
          if (v1Result) {
            setLiveProfile(v1Result.profile);
            setResearchResult(v1Result as unknown as MultiSourceResult);
            setResearchProgress({ stage: 'Complete', progress: 100, message: 'Multi-source research V1 complete' });
            setIsResearching(false);
            return;
          }
        } catch (_v1e) { /* v1 unavailable */ }
      }

      // Gemini fallback logic removed
      if (!result) {
        try {
          setResearchProgress({ stage: 'Live Search', progress: 25, message: `Trying live data sources for ${trimmedQuery}...` });
          const liveProfile = await comprehensiveLiveSearch(trimmedQuery, (p) =>
            setResearchProgress({ stage: p.stage, progress: p.progress, message: p.message })
          );
          if (liveProfile) {
            setLiveProfile(liveProfile);
            setResearchResult({ profile: liveProfile, sources: [], summary: liveProfile.city, dataQuality: { completeness: 60, freshness: 'Live', sourcesCount: 0, leaderDataVerified: false, economicDataYear: 'Current' } } as unknown as MultiSourceResult);
            setResearchProgress({ stage: 'Complete', progress: 100, message: 'Live search complete' });
            setIsResearching(false);
            return;
          }
        } catch (_le) { /* live search unavailable */ }
      }

      if (result) {
        setLiveProfile(result.profile);
        // Transform to MultiSourceResult format for compatibility
        const multiResult: MultiSourceResult = {
          ...result,
          sources: result.sources.map(s => ({ title: s, url: '#', type: 'research', reliability: 'high' }))
        };
        setResearchResult(multiResult);
        setResearchProgress({ stage: 'Complete', progress: 100, message: `Research complete!` });

        // Trigger consultant AI analysis of the results
        await bwConsultantAI.consult({ locationQuery: trimmedQuery, searchResult: result }, 'location_search_complete');

        // Save to cache for future lookups
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await locationResearchCache.saveFullResult(trimmedQuery, multiResult as any);
        } catch (_e) { /* cache save failed */ }

        // OSINT enrichment - government, statistics, business sources
        try {
          const osint = await osintSearch(`${trimmedQuery} government economy investment trade`, ['government', 'statistics', 'business'], 6);
          setOsintResults(osint);
        } catch (_e) { /* osint unavailable */ }

        // Autonomous gap analysis - data completeness scoring
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const gaps = autonomousResearchAgent.analyzeDataGaps(multiResult as any, result.profile);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const score = autonomousResearchAgent.calculateCompletenessScore(multiResult as any, gaps);
          setDataCompletenessScore(score);
        } catch (_e) { /* gap analysis unavailable */ }
      } else {
        setLoadingError(`Could not find intelligence for "${trimmedQuery}". Please try a different search term.`);
        setHasSelection(false);
      }
    } catch (error) {
      console.error('Research error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      
      if (!navigator.onLine) {
        setLoadingError('No internet connection. Please check your network.');
      } else if (errorMessage.includes('API key')) {
        setLoadingError('API key error. Please check configuration.');
      } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setLoadingError('Unable to connect to AI services. Please try again.');
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        setLoadingError('API quota exceeded. Please try again later.');
      } else {
        setLoadingError(`Research failed: ${errorMessage}`);
      }
      setHasSelection(false);
    } finally {
      setIsResearching(false);
    }
  }, [useExternalSources, useRealTimeFeeds]);

  // Handle pending location data from CommandCenter
  useEffect(() => {
    if (pendingLocation) {
      setHasSelection(true);
      setLiveProfile(pendingLocation.profile);
      // Convert LocationResult.sources (string[]) into SourceCitation[] for compatibility
      const multiResult: MultiSourceResult = pendingLocation.research ? {
        ...pendingLocation.research,
        sources: (pendingLocation.research.sources || []).map(s => typeof s === 'string' ? { title: s, url: '#', type: 'research', reliability: 'unknown' } : s)
      } : null as unknown as MultiSourceResult;
      setResearchResult(multiResult);
      setActiveProfileId(null);
      setSearchQuery('');
      setSearchResults([]);
      setResearchProgress({ stage: 'Complete', progress: 100, message: 'Report loaded successfully' });
      
      // Clear the pending data
      if (onLocationLoaded) {
        onLocationLoaded();
      }
    }
  }, [pendingLocation, onLocationLoaded]);

  // Load existing profiles and check for cached research results
  useEffect(() => {
    const loadProfiles = async () => {
      const data = await getCityProfiles();
      setProfiles(data);
      
      // Check for CACHED research result FIRST (highest priority - prevents duplicate research)
      const cachedResearch = localStorage.getItem('gli-cached-research');
      const target = localStorage.getItem('gli-target');
      
      if (cachedResearch && target) {
        try {
          const result = JSON.parse(cachedResearch);
          if (result && result.profile) {
            // Use cached result - NO NEW RESEARCH NEEDED
            setHasSelection(true);
            setLiveProfile(result.profile);
            // Ensure cached result sources are SourceCitation[]
            const normalized = {
              ...result,
              sources: (result.sources || []).map((s: string | SourceCitation) => typeof s === 'string' ? { title: s, url: '#', type: 'research', reliability: 'unknown' } : s)
            } as MultiSourceResult;
            setResearchResult(normalized);
            setSearchQuery('');
            setSearchResults([]);
            setResearchProgress({ stage: 'Complete', progress: 100, message: `Report loaded from cache: ${normalized.sources.length} sources.` });
            
            // Clean up cache keys after using them
            localStorage.removeItem('gli-target');
            localStorage.removeItem('gli-cached-research');
            
            return; // EXIT - DON'T DO NEW RESEARCH
          }
        } catch (e) {
          console.warn('Failed to parse cached research:', e);
          // Fall through to normal search
        }
      }
      
      // Fallback: if no cached result, search using gli-target location name
      if (target) {
        localStorage.removeItem('gli-target');
        localStorage.removeItem('gli-cached-research');
        setTimeout(() => {
          handleSearchSubmit(target);
        }, 0);
      }
    };
    loadProfiles();
  }, [handleSearchSubmit]);

  // Document generation handler
  const handleGenerateDocument = async () => {
    if (!activeProfile) return;

    setIsGeneratingDocument(true);
    try {
      // Convert profile to intelligence format for document generation
      const intelligence = {
        overview: {
          displayName: activeProfile.city || activeProfile.entityName || 'Location',
          significance: activeProfile.knownFor?.join(', ') || 'Strategic location',
          established: activeProfile.established || 'Historical records'
        },
        demographics: {
          population: activeProfile.demographics?.population || 'Data available',
          populationGrowth: activeProfile.demographics?.populationGrowth || 'Tracked',
          medianAge: activeProfile.demographics?.medianAge || 'Available',
          literacyRate: activeProfile.demographics?.literacyRate || 'Monitored',
          languages: activeProfile.demographics?.languages || ['Local languages']
        },
        economy: {
          gdp: activeProfile.economics?.gdpLocal || 'Economic data available',
          gdpGrowth: activeProfile.economics?.gdpGrowthRate || 'Growth metrics',
          unemployment: activeProfile.economics?.employmentRate || 'Labor data',
          averageIncome: activeProfile.economics?.avgIncome || 'Income data',
          mainIndustries: activeProfile.economics?.majorIndustries || activeProfile.keySectors || [],
          tradePartners: activeProfile.economics?.tradePartners || [],
          currency: activeProfile.currency || 'Local currency'
        },
        government: {
          leader: activeProfile.leaders?.[0] ? {
            name: activeProfile.leaders[0].name,
            title: activeProfile.leaders[0].role,
            since: activeProfile.leaders[0].tenure
          } : {
            name: 'Leadership available',
            title: 'Government position',
            since: 'Current administration'
          },
          departments: activeProfile.departments || [],
          type: 'Government system'
        },
        geography: {
          climate: activeProfile.climate || 'Local climate',
          area: activeProfile.areaSize || 'Geographic area',
          timezone: activeProfile.timezone || 'Local timezone'
        },
        infrastructure: {
          powerCapacity: activeProfile.infrastructure?.powerCapacity || 'Infrastructure developed',
          internetPenetration: activeProfile.infrastructure?.internetPenetration || 'Connectivity available',
          airports: (activeProfile.infrastructure?.airports || []).map(a => typeof a === 'string' ? a : a.name),
          seaports: (activeProfile.infrastructure?.seaports || []).map(s => typeof s === 'string' ? s : s.name)
        },

        competitiveAdvantages: activeProfile.strategicAdvantages || activeProfile.knownFor || [],
        investment: {
          incentives: activeProfile.investmentPrograms || [],
          easeOfBusiness: activeProfile.easeOfDoingBusiness || 'Business environment'
        }
      };

      // Try typed location document generator first
      let documentText: string | null = null;
      if (researchResult) {
        try {
          // Cast researchResult through unknown to avoid explicit-any on the typed generator calls
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const _r = researchResult as any;
          const typed = documentType === 'report'
            ? documentGenerator.generateCountryProfile(_r)
            : documentType === 'briefing'
            ? documentGenerator.generateInvestmentBrief(_r)
            : null;
          if (typed) {
            documentText = [
              `# ${typed.title}`,
              '',
              `**Executive Summary**`,
              typed.executiveSummary,
              '',
              `**Key Findings**`,
              typed.keyFindings.map((f: string) => `- ${f}`).join('\n'),
              '',
              ...typed.sections.map((s: { title: string; content: string }) => `## ${s.title}\n${s.content}`),
              '',
              `**Recommendations**`,
              typed.recommendations.map((r: string) => `- ${r}`).join('\n'),
            ].join('\n');
          }
        } catch (_dge) { /* typed generator unavailable - fall back to AI */ }
      }

      if (!documentText) {
        documentText = await generateDocument(
          intelligence,
          documentType,
          'Valued Partner',
          `Investment and partnership opportunities in ${activeProfile.city}, ${activeProfile.country}`
        );
      }

      setGeneratedDocument(documentText);
    } catch (error) {
      console.error('Document generation failed:', error);
      alert('Document generation failed. Please check your OpenAI API key configuration.');
    } finally {
      setIsGeneratingDocument(false);
    }
  };


  const profileType = activeProfile?.entityType ?? 'location';
  const isLocationProfile = profileType === 'location' || profileType === 'region';
  const isPersonProfile = profileType === 'person';
  const displayName = (activeProfile as unknown as Record<string, unknown>)?.entityName as string || activeProfile?.city || 'Unknown Location';
  const displayRegion = [activeProfile?.region, activeProfile?.country].filter(Boolean).join(', ') || 'Unknown Region';
  
  // Helper function to safely display data
  const safeDisplay = (value: unknown, fallback: string = 'Data not available'): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string') return value;
    return String(value);
  };
  
  // Type-safe property accessor
  const getProfileProp = (prop: string): unknown => {
    return (activeProfile as unknown as Record<string, unknown>)?.[prop];
  };

  // Clear selection and reset to global view
  const handleClearSelection = () => {
    setActiveProfileId(null);
    setHasSelection(false);
    setLiveProfile(null);
    setResearchResult(null);
    setIsResearching(false);
    setResearchProgress(null);
    setLoadingError(null);
    setGovernmentLeaders([]);
    setRegionalComparisons(null);
    setShowPersonCard(false);
    setOsintResults([]);
    setDataCompletenessScore(null);
  };

  // Auto-scroll to top when a profile is selected
  useEffect(() => {
    if (hasSelection && activeProfile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasSelection, activeProfile]);

  // Fetch real-time government data and regional comparisons when profile is selected
  useEffect(() => {
    if (!activeProfile) return;

    const fetchEnrichedData = async () => {
      try {
        // Fetch current government leaders
        setIsLoadingGovernmentData(true);
        const leaders = await fetchGovernmentLeaders(activeProfile.city, activeProfile.country);
        setGovernmentLeaders(leaders);
      } catch (error) {
        console.error('Error fetching government leaders:', error);
      } finally {
        setIsLoadingGovernmentData(false);
      }

      try {
        // Fetch regional comparisons
        setIsLoadingComparisons(true);
        const nearbyLocations = profiles.filter(
          p => p.region === activeProfile.region && p.id !== activeProfile.id
        );
        
        if (nearbyLocations.length > 0) {
          const comparisons = await getRegionalComparisons(activeProfile, nearbyLocations);
          setRegionalComparisons(comparisons);
        }
      } catch (error) {
        console.error('Error fetching regional comparisons:', error);
      } finally {
        setIsLoadingComparisons(false);
      }
    };

    fetchEnrichedData();
  }, [activeProfile, profiles]);

  const computeCompositeScore = (profile: CityProfile | Partial<CityProfile>) => {
    if (!profile.infrastructureScore) return 0;
    const normalizedCost = 100 - Math.min(profile.costOfDoing || 50, 100);
    const normalizedReg = 100 - Math.min(profile.regulatoryFriction || 50, 100);
    const score = (
      (profile.infrastructureScore || 50) * 0.2 +
      normalizedReg * 0.2 +
      (profile.politicalStability || 50) * 0.15 +
      (profile.laborPool || 50) * 0.15 +
      normalizedCost * 0.15 +
      (profile.investmentMomentum || 50) * 0.15
    );
    return Math.round(score);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCityBrief = (profile: CityProfile) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${profile.city} Intelligence Brief</title>
<style>
body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
h1 { margin-bottom: 4px; }
h2 { margin-top: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
ul { margin: 0 0 12px 16px; }
.meta { color: #475569; font-size: 14px; }
.badge { display: inline-block; background: #fbbf24; color: #000; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; }
.section { margin-bottom: 20px; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 13px; }
th { background: #f1f5f9; }
</style>
</head>
<body>
  <h1>${profile.city} Intelligence Brief</h1>
  <div class="meta">${profile.region} * ${profile.country}</div>
  <div class="meta">Established: ${profile.established} | Timezone: ${profile.timezone || 'N/A'}</div>
  <p class="badge">Composite Score: ${computeCompositeScore(profile)} / 100</p>
  
  <h2>Quick Facts</h2>
  <table>
    <tr><th>Area</th><td>${profile.areaSize || 'N/A'}</td><th>Climate</th><td>${profile.climate || 'N/A'}</td></tr>
    <tr><th>Currency</th><td>${profile.currency || 'N/A'}</td><th>Business Hours</th><td>${profile.businessHours || 'N/A'}</td></tr>
  </table>

  <h2>Known For</h2>
  <ul>${profile.knownFor.map(item => `<li>${item}</li>`).join('')}</ul>
  
  <h2>Strategic Advantages</h2>
  <ul>${profile.strategicAdvantages.map(item => `<li>${item}</li>`).join('')}</ul>
  
  <h2>Key Sectors</h2>
  <ul>${profile.keySectors.map(item => `<li>${item}</li>`).join('')}</ul>
  
  <h2>Investment Programs</h2>
  <ul>${profile.investmentPrograms.map(item => `<li>${item}</li>`).join('')}</ul>
  
  <h2>Foreign Companies Present</h2>
  <ul>${profile.foreignCompanies.map(item => `<li>${item}</li>`).join('')}</ul>

  ${profile.economics ? `
  <h2>Economic Data</h2>
  <table>
    <tr><th>Local GDP</th><td>${profile.economics.gdpLocal || 'N/A'}</td></tr>
    <tr><th>GDP Growth</th><td>${profile.economics.gdpGrowthRate || 'N/A'}</td></tr>
    <tr><th>Employment Rate</th><td>${profile.economics.employmentRate || 'N/A'}</td></tr>
    <tr><th>Average Income</th><td>${profile.economics.avgIncome || 'N/A'}</td></tr>
    <tr><th>Export Volume</th><td>${profile.economics.exportVolume || 'N/A'}</td></tr>
    <tr><th>Top Exports</th><td>${profile.economics.topExports?.join(', ') || 'N/A'}</td></tr>
    <tr><th>Trade Partners</th><td>${profile.economics.tradePartners?.join(', ') || 'N/A'}</td></tr>
  </table>
  ` : ''}

  ${profile.demographics ? `
  <h2>Demographics</h2>
  <table>
    <tr><th>Population</th><td>${profile.demographics.population}</td></tr>
    <tr><th>Population Growth</th><td>${profile.demographics.populationGrowth || 'N/A'}</td></tr>
    <tr><th>Median Age</th><td>${profile.demographics.medianAge || 'N/A'}</td></tr>
    <tr><th>Literacy Rate</th><td>${profile.demographics.literacyRate || 'N/A'}</td></tr>
    <tr><th>Working Age Population</th><td>${profile.demographics.workingAgePopulation || 'N/A'}</td></tr>
    <tr><th>Universities/Colleges</th><td>${profile.demographics.universitiesColleges || 'N/A'}</td></tr>
    <tr><th>Graduates/Year</th><td>${profile.demographics.graduatesPerYear || 'N/A'}</td></tr>
  </table>
  ` : ''}

  <h2>Leadership</h2>
  <ul>${profile.leaders.map(leader => `<li><strong>${leader.role}:</strong> ${leader.name} (${leader.tenure}) - Rating: ${leader.rating.toFixed(1)}/10</li>`).join('')}</ul>

  ${profile.taxIncentives ? `
  <h2>Tax Incentives</h2>
  <ul>${profile.taxIncentives.map(item => `<li>${item}</li>`).join('')}</ul>
  ` : ''}

  <h2>Government Sources</h2>
  <ul>${profile.governmentLinks?.map(link => `<li><a href="${link.url}">${link.label}</a></li>`).join('') || 'N/A'}</ul>

  <hr style="margin-top: 40px;">
  <p style="font-size: 11px; color: #64748b;">Generated by VERDIX Intel Fact Sheet | ${new Date().toISOString()}</p>
</body>
</html>`;
    downloadFile(html, `${profile.city}-intelligence-brief.html`, 'text/html');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-400">BW Intelligence</p>
            <h1 className="text-2xl font-semibold">BW Intel Fact Sheet</h1>
          </div>
          <div className="flex gap-2">
            {onOpenCommandCenter && (
              <button
                onClick={onOpenCommandCenter}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-white/20 rounded-lg hover:border-amber-400 hover:text-amber-300"
              >
                Command Center
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <label className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
                <Search className="inline w-3 h-3 mr-1" />
                Search Any Location Worldwide
              </label>
              <div className="mt-2 relative">
                <input
                  data-testid="location-search-input"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearchSubmit(searchQuery);
                    }
                  }}
                  placeholder="Enter any city, region, company, or public official (e.g., Tokyo, Ayala Corporation, Mayor John Doe)..."
                  className="w-full px-4 py-3 text-sm rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  disabled={isResearching}
                />
                <button
                  data-testid="location-search-button"
                  onClick={() => handleSearchSubmit(searchQuery)}
                  disabled={!searchQuery.trim() || isResearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Research'}
                </button>
                {searchResults.length > 0 && !isResearching && (
                  <div className="absolute z-10 mt-2 w-full bg-[#0a0a0a] border border-white/10 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="px-3 py-2 text-[10px] uppercase text-slate-500 border-b border-white/10">
                      Matching Locations (Click to research live)
                    </div>
                    {searchResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => handleSearchSubmit(`${result.city}, ${result.country}`)}
                        className="w-full text-left px-4 py-3 hover:bg-amber-500/10 border-b border-white/5 last:border-b-0"
                      >
                        <div className="text-white font-semibold">{result.city}</div>
                        <div className="text-[11px] text-slate-400">{result.region} * {result.country}</div>
                      </button>
                    ))}
                    <button
                      onClick={() => handleSearchSubmit(searchQuery)}
                      className="w-full text-left px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                    >
                      <div className="font-semibold">📄 Research "{searchQuery}" with AI Agent</div>
                      <div className="text-[10px] text-purple-400">Search globally for any location not in database</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {isResearching
                ? <span className="text-purple-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> AI Agent researching...</span>
                : hasSelection && activeProfile
                  ? <span className="text-emerald-400">✓ Viewing: {activeProfile.city}, {activeProfile.country}</span>
                  : 'Enter any location worldwide to generate intelligence report'}
            </div>
          </div>
          {hasSelection && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={useExternalSources} onChange={(e) => setUseExternalSources(e.target.checked)} />
                <span>Use external data</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={useRealTimeFeeds} onChange={(e) => setUseRealTimeFeeds(e.target.checked)} />
                <span>Use real-time feeds</span>
              </label>
            </div>
              <button
                onClick={handleClearSelection}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Clear Selection & Search New Location
              </button>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {loadingError && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-red-300 font-semibold mb-1">Connection Error</div>
              <div className="text-sm text-red-200/80">{loadingError}</div>
              {!navigator.onLine && (
                <div className="mt-2 text-xs text-red-300/60 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  You appear to be offline. BW Intel Fact Sheet requires internet connection.
                </div>
              )}
            </div>
            <button
              onClick={() => setLoadingError(null)}
              className="text-red-400 hover:text-red-300 text-xs px-3 py-1 border border-red-500/40 rounded-lg hover:bg-red-500/20"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Research Progress Panel */}
        {isResearching && researchProgress && (
          <div className="bg-[#0f0f0f] border border-purple-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Database className="w-5 h-5 text-purple-400" />
                  <Loader2 className="w-3 h-3 text-purple-300 absolute -bottom-1 -right-1 animate-spin" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-purple-300">Deep Research in Progress</h2>
                  <p className="text-xs text-slate-400">{researchProgress?.message || 'Researching...'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">{Math.round(researchProgress?.progress || 0)}%</div>
                <div className="text-[10px] text-slate-400 uppercase">{researchProgress?.stage || 'initializing'}</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full transition-all duration-500"
                style={{ width: `${researchProgress?.progress || 0}%` }}
              />
            </div>
            
            {/* Research Stages */}
            <div className="grid md:grid-cols-6 gap-2 mb-4">
              {['Initializing Research', 'Gathering Intelligence', 'Leadership Research', 'Economic Analysis', 'News & Developments', 'Compiling Report'].map((stage, idx) => {
                const stages = ['Initializing Research', 'Gathering Intelligence', 'Leadership Research', 'Economic Analysis', 'News & Developments', 'Compiling Report', 'Comparative Analysis', 'Complete'];
                const currentIdx = stages.findIndex(s => researchProgress?.stage?.includes(s.split(' ')[0]) || researchProgress?.stage === s);
                const stageStatus = idx < currentIdx ? 'complete' : idx === currentIdx ? 'active' : 'pending';
                return (
                  <div 
                    key={stage}
                    className={`p-2 rounded-lg border text-xs text-center ${
                      stageStatus === 'complete'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : stageStatus === 'active'
                          ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                          : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {stageStatus === 'complete' && <CheckCircle2 className="w-3 h-3" />}
                      {stageStatus === 'active' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {stageStatus === 'pending' && <Clock className="w-3 h-3" />}
                      <span className="text-[10px]">{stage.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Research Status */}
            <div className="bg-black/40 rounded-lg p-3 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">a - </span>
                <span>Searching government websites, World Bank, and official sources...</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-blue-400">a - </span>
                <span>Cross-referencing data from international organizations</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-amber-400">a - </span>
                <span>Compiling verified economic data and leadership profiles</span>
              </div>

            </div>
          </div>
        )}

        {/* Empty State - No Selection */}
        {/* Empty State with Search Instructions */}
        {!hasSelection && !isResearching && (
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-12 mb-6 text-center">
              {missingFields.length > 0 && (
                <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <strong>Data Gaps:</strong> {missingFields.join(', ')}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (!activeProfile) return;
                          setIsResearching(true);
                          setResearchProgress({ stage: 'Deep Research', progress: 0, message: 'Running deep research to fill gaps...' });
                          try {
                            const deep: DeepResearchResult | null = await deepLocationResearch(activeProfile.city, (p) => setResearchProgress(p));
                            if (deep && deep.profile) {
                              // Merge profile and sources
                              setLiveProfile(deep.profile);
                              const merged: MultiSourceResult = {
                                profile: deep.profile,
                                sources: (deep.sources || []).map((s: { title: string; url?: string; type?: string; reliability?: string }) => ({ title: s.title, url: s.url || '#', type: s.type || 'research', reliability: s.reliability || 'unknown' })),
                                summary: deep.narratives?.overview || deep.profile.city,
                                dataQuality: deep.dataQuality?.completeness || 80
                              };
                              setResearchResult(merged);
                              setResearchProgress({ stage: 'Complete', progress: 100, message: 'Deep research complete.' });
                            } else {
                              setResearchProgress({ stage: 'Failed', progress: 0, message: 'Deep research returned no additional data.' });
                              alert('Deep research did not return additional data.');
                            }
                          } catch (err) {
                            console.error('Deep research failed:', err);
                            setResearchProgress({ stage: 'Error', progress: 0, message: 'Deep research failed' });
                          } finally {
                            setIsResearching(false);
                          }
                        }}
                        className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded hover:bg-amber-500/30"
                        disabled={isResearching}
                      >
                        {isResearching ? 'Researching...' : 'Run deeper research'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            <Globe className="w-16 h-16 text-amber-400/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">BW Intel Fact Sheet</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-6">
              Search for any location worldwide to generate a comprehensive intelligence report. 
              Our AI agent will research leadership, economy, infrastructure, demographics, and more.
            </p>
            
            {/* Search Tips */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8 max-w-2xl mx-auto text-left">
              <div className="flex items-start gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">Search Tips for Best Results:</h3>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>* <strong>People / Companies:</strong> "Mayor John Doe", "Ayala Corporation", "Amazon", "Tokyo"</li>
                    <li>* <strong>Regions:</strong> "Silicon Valley", "Cebu Province", "Bavari</li>
                    <li>* <strong>Companies:</strong> "Microsoft", "Toyota", "Jollibee"</li>
                    <li>* <strong>Government Bodies:</strong> "Philippine government", "EU Commission"</li>
                  </ul>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                The AI will gather data on population, GDP, leadership, infrastructure, and provide comparison benchmarks.
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇵🇭 Philippines</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇦🇺 Australia</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇯🇵 Japan</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇺🇸 USA</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇬🇧 UK</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🇩🇪 Germany</span>
              <span className="text-[11px] px-3 py-1.5 bg-slate-800 rounded-full text-slate-300">🌍 Any Location</span>
            </div>
            
            {/* Quick Access to Existing Profiles */}
            {profiles.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-4">Quick Access: Search Locations</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {profiles.slice(0, 6).map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => handleSearchSubmit(`${profile.city}, ${profile.country}`)}
                      className="px-4 py-2 text-sm bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 text-amber-300"
                    >
                      {profile.city}, {profile.country}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        {hasSelection && activeProfile ? (
          <div className="flex gap-4" style={{ height: 'calc(100vh - 280px)' }}>
            {/* LEFT PANEL - Intelligence Profile (scrollable) */}
            <div 
              ref={leftPanelRef}
              className={`${isSourcePanelCollapsed ? 'flex-1' : 'w-[55%]'} overflow-y-auto pr-4 border-r border-slate-700/50 transition-all duration-300`}
            >
              <div className="space-y-8">
            {/* Simple Document Header */}
            <div className="border-b border-slate-700 pb-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{activeProfile.city}, {activeProfile.country}</h1>
                  <p className="text-slate-400">{activeProfile.region}</p>
                  <p className="text-sm text-slate-500 mt-1">Report generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSourcePanelCollapsed(!isSourcePanelCollapsed)}
                    className="px-3 py-2 text-sm bg-slate-800 border border-slate-600 text-slate-200 rounded hover:bg-slate-700 flex items-center gap-2"
                    title={isSourcePanelCollapsed ? 'Show Source Browser' : 'Hide Source Browser'}
                  >
                    {isSourcePanelCollapsed ? <PanelRightClose className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                  </button>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as 'letter' | 'report' | 'briefing')}
                    className="px-3 py-2 text-sm bg-slate-800 border border-slate-600 text-slate-200 rounded"
                  >
                    <option value="report">Report</option>
                    <option value="letter">Letter</option>
                    <option value="briefing">Briefing</option>
                  </select>
                  <button
                    onClick={handleGenerateDocument}
                    disabled={isGeneratingDocument}
                    className="px-4 py-2 text-sm bg-blue-600 border border-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGeneratingDocument ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {isGeneratingDocument ? 'Generating...' : 'Generate Document'}
                  </button>
                  <button
                    onClick={() => exportCityBrief(activeProfile)}
                    className="px-4 py-2 text-sm bg-slate-800 border border-slate-600 text-slate-200 rounded hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export Report
                  </button>
                  {onPushToConsultant && (
                    <button
                      onClick={() => {
                        const summary = [
                          `Location: ${activeProfile.city}, ${activeProfile.country}`,
                          activeProfile.economics?.gdpLocal ? `GDP: ${activeProfile.economics.gdpLocal}` : '',
                          activeProfile.demographics?.population ? `Population: ${activeProfile.demographics.population.toLocaleString()}` : '',
                          activeProfile.investmentPrograms?.length ? `Investment programs: ${activeProfile.investmentPrograms.slice(0, 2).map((p: { title?: string } | string) => (typeof p === 'string' ? p : p.title) || '').join(', ')}` : '',
                          researchResult?.summary ? `Research summary: ${String(researchResult.summary).substring(0, 300)}` : '',
                        ].filter(Boolean).join(' | ');
                        onPushToConsultant({
                          city: activeProfile.city,
                          country: activeProfile.country,
                          summary,
                          profile: activeProfile,
                          research: researchResult as object | null,
                        });
                      }}
                      className="px-4 py-2 text-sm bg-amber-600 border border-amber-500 text-white rounded hover:bg-amber-700 flex items-center gap-2 font-semibold"
                    >
                      <Rocket className="w-4 h-4" /> Send to VERDIX Consultant
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Data Intelligence Panel - completeness score + OSINT sources */}
            {(dataCompletenessScore !== null || osintResults.length > 0) && (
              <div className="flex flex-wrap items-center gap-4 px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-xs">
                {dataCompletenessScore !== null && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${dataCompletenessScore >= 75 ? 'text-emerald-400' : dataCompletenessScore >= 50 ? 'text-amber-400' : 'text-red-400'}`} />
                    <span className="text-slate-400">Data Completeness:</span>
                    <span className={`font-bold ${dataCompletenessScore >= 75 ? 'text-emerald-400' : dataCompletenessScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {dataCompletenessScore}%
                    </span>
                  </div>
                )}
                {osintResults.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-slate-400">OSINT:</span>
                    {osintResults.slice(0, 4).map((r, i) => (
                      <a key={i} href={r.link} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 hover:underline truncate max-w-[130px] capitalize"
                        title={r.title}>
                        {r.displayLink}
                      </a>
                    ))}
                    {osintResults.length > 4 && (
                      <span className="text-slate-500">+{osintResults.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* About This Location */}
            <section>
              <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">About {activeProfile.city}</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                {wikiParagraphs.length > 0 ? (
                  wikiParagraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))
                ) : (
                  <>
                      {isLocationProfile ? (
                        <>
                          <p>
                            {displayName}
                            {displayRegion ? ` is located in ${displayRegion}.` : '.'}
                            {activeProfile.established && ` Established ${activeProfile.established}.`}
                            {activeProfile.demographics?.population && ` The city has a population of ${activeProfile.demographics.population}.`}
                          </p>
                          {activeProfile.knownFor && activeProfile.knownFor.length > 0 && (
                            <p>The city is known for {activeProfile.knownFor.slice(0, 3).join(', ')}.</p>
                          )}
                          {activeProfile.keySectors && activeProfile.keySectors.length > 0 && (
                            <p>Key economic sectors include {activeProfile.keySectors.slice(0, 4).join(', ')}.</p>
                          )}
                        </>
                      ) : (
                        <>
                          <p>
                            {displayName}
                            {displayRegion ? ` is based in ${displayRegion}.` : '.'}
                            {activeProfile.established && ` Founded ${activeProfile.established}.`}
                            {activeProfile.demographics?.population && ` Size: ${activeProfile.demographics.population}.`}
                          </p>
                          {activeProfile.knownFor && activeProfile.knownFor.length > 0 && (
                            <p>Known for {activeProfile.knownFor.slice(0, 3).join(', ')}.</p>
                          )}
                          {activeProfile.keySectors && activeProfile.keySectors.length > 0 && (
                            <p>Key sectors include {activeProfile.keySectors.slice(0, 4).join(', ')}.</p>
                          )}
                        </>
                      )}
                    </>
                )}
              </div>
            </section>

            {/* Location Map */}
            {isLocationProfile && activeProfile.latitude && activeProfile.longitude && (
              <section>
                <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Location</h2>
                <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900 relative">
                  {/* Use OpenStreetMap iframe for reliable display */}
                  <iframe
                    title={`Map of ${activeProfile.city}`}
                    src={buildFallbackMapUrl(activeProfile.latitude, activeProfile.longitude)}
                    className="w-full h-[300px] border-0"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 text-xs text-slate-200 px-3 py-1.5 rounded flex items-center gap-2 pointer-events-none">
                    <MapPin className="w-3 h-3" /> {activeProfile.city}, {activeProfile.country}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 text-xs text-slate-200 px-3 py-1.5 rounded pointer-events-none">
                    {activeProfile.latitude.toFixed(4)} degrees, {activeProfile.longitude.toFixed(4)} degrees
                  </div>
                </div>
              </section>
            )}

            {/* Quick Facts - Enhanced with better data display */}
            <section>
              <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Quick Facts</h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">{isLocationProfile ? 'Location' : 'Headquarters'}</span>
                  <span className="text-white">
                    {isLocationProfile
                      ? (activeProfile.latitude && activeProfile.longitude
                        ? `${activeProfile.latitude.toFixed(4)} degrees, ${activeProfile.longitude.toFixed(4)} degrees`
                        : safeDisplay(null))
                      : safeDisplay(displayRegion)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Population</span>
                  <span className="text-white">{safeDisplay(getProfileProp('population'))}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Timezone</span>
                  <span className="text-white">{safeDisplay(activeProfile.timezone)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Climate</span>
                  <span className="text-white">{safeDisplay(activeProfile.climate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Currency</span>
                  <span className="text-white">{safeDisplay(activeProfile.currency)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Area</span>
                  <span className="text-white">{safeDisplay(activeProfile.areaSize)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Business Hours</span>
                  <span className="text-white">{safeDisplay(activeProfile.businessHours, '8:00 AM - 5:00 PM')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Established</span>
                  <span className="text-white">{safeDisplay(activeProfile.established)}</span>
                </div>
              </div>
            </section>

            {/* Government & Leadership - Enhanced display */}
            <section>
              <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Government & Leadership</h2>
              
              {/* Government Type and Structure */}
              {getProfileProp('governmentType') && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Government Type</div>
                  <div className="text-white font-medium">{safeDisplay(getProfileProp('governmentType'))}</div>
                </div>
              )}
              
              {/* Leaders Display */}
              {isPersonProfile && showPersonCard && activeProfile.leaders && activeProfile.leaders[0] ? (
                <div className="mb-4">
                  <PersonCard leader={activeProfile.leaders[0]} />
                </div>
              ) : null}

              {activeProfile.leaders && activeProfile.leaders.length > 0 ? (
                <div className="space-y-3">
                  {activeProfile.leaders.slice(0, 4).map((leader, idx) => (
                    <div key={idx} className="flex items-start gap-3 py-2 cursor-pointer hover:bg-slate-800/50 rounded-lg px-2 -mx-2" onClick={() => setActiveLeader(leader)}>
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-300">
                        {leader.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{safeDisplay(leader.name, 'Name not available')}</div>
                        <div className="text-sm text-slate-400">{safeDisplay(leader.role, 'Role not specified')}</div>
                        {(leader as unknown as Record<string, unknown>).since && <div className="text-xs text-slate-500">Since {String((leader as unknown as Record<string, unknown>).since)}</div>}
                        {leader.tenure && <div className="text-xs text-slate-500">{leader.tenure}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : getProfileProp('leader') ? (
                <div className="flex items-start gap-3 py-2 bg-slate-800/50 rounded-lg px-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-300">
                    {(getProfileProp('leader') as Record<string, unknown>)?.name ? String((getProfileProp('leader') as Record<string, unknown>).name).charAt(0) : '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{safeDisplay((getProfileProp('leader') as Record<string, unknown>)?.name, 'Name not available')}</div>
                    <div className="text-sm text-slate-400">{safeDisplay((getProfileProp('leader') as Record<string, unknown>)?.title, 'Title not specified')}</div>
                    {(getProfileProp('leader') as Record<string, unknown>)?.since && <div className="text-xs text-slate-500">Since {String((getProfileProp('leader') as Record<string, unknown>).since)}</div>}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-300 text-sm">
                    <AlertCircle className="inline w-4 h-4 mr-1" />
                    Leadership information not yet available. Research ongoing.
                  </p>
                </div>
              )}
              
              {activeProfile.departments && activeProfile.departments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-slate-200 mb-3">Government Departments</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {activeProfile.departments.map((dept, idx) => (
                      <li key={idx}>{dept}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Economy - Enhanced data display */}
            {(activeProfile.economics || getProfileProp('gdp') || getProfileProp('mainIndustries')) && (
              <section>
                <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Economy</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">GDP</span>
                    <span className="text-white">{safeDisplay(activeProfile.economics?.gdpLocal || getProfileProp('gdp'))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">GDP Growth</span>
                    <span className="text-white">{safeDisplay(activeProfile.economics?.gdpGrowthRate || getProfileProp('gdpGrowth'))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Unemployment</span>
                    <span className="text-white">{safeDisplay(activeProfile.economics?.employmentRate || getProfileProp('unemployment'))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Average Income</span>
                    <span className="text-white">{safeDisplay(activeProfile.economics?.avgIncome || getProfileProp('averageIncome'))}</span>
                  </div>
                </div>
                
                {((activeProfile.economics?.majorIndustries as string[] | undefined) || (getProfileProp('mainIndustries') as string[] | undefined)) && 
                 ((activeProfile.economics?.majorIndustries as string[])?.length > 0 || (getProfileProp('mainIndustries') as string[])?.length > 0) && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Major Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {((activeProfile.economics?.majorIndustries as string[]) || (getProfileProp('mainIndustries') as string[]) || []).map((industry, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs rounded-full">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(getProfileProp('majorEmployers') as string[] | undefined) && (getProfileProp('majorEmployers') as string[]).length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Major Employers</h3>
                    <div className="flex flex-wrap gap-2">
                      {(getProfileProp('majorEmployers') as string[]).slice(0, 10).map((employer, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-full">
                          {employer}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(() => {
                  const partners = activeProfile.economics?.tradePartners || getProfileProp('tradePartners');
                  const partnersArray = Array.isArray(partners) ? partners : (typeof partners === 'string' ? [partners] : []);
                  return partnersArray.length > 0 ? (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-slate-200 mb-2">Trade Partners</h3>
                      <p className="text-slate-300">{partnersArray.join(', ')}</p>
                    </div>
                  ) : null;
                })()}

                {activeProfile.foreignCompanies && activeProfile.foreignCompanies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Foreign Companies Present</h3>
                    <p className="text-slate-300">{activeProfile.foreignCompanies.slice(0, 8).join(', ')}</p>
                  </div>
                )}
              </section>
            )}

            {/* Demographics - Enhanced */}
            {(activeProfile.demographics || getProfileProp('population')) && (
              <section>
                <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Demographics</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Population</span>
                    <span className="text-white">{safeDisplay(activeProfile.demographics?.population || getProfileProp('population'))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Growth Rate</span>
                    <span className="text-white">{safeDisplay(activeProfile.demographics?.populationGrowth || getProfileProp('populationGrowth'))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Median Age</span>
                    <span className="text-white">{safeDisplay(activeProfile.demographics?.medianAge || getProfileProp('medianAge'))}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Literacy Rate</span>
                    <span className="text-white">{safeDisplay(activeProfile.demographics?.literacyRate || getProfileProp('literacyRate'))}</span>
                  </div>
                  {activeProfile.demographics?.workingAgePopulation && (
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Working Age Population</span>
                      <span className="text-white">{safeDisplay(activeProfile.demographics.workingAgePopulation)}</span>
                    </div>
                  )}
                </div>
                
                {(() => {
                  const langs = activeProfile.demographics?.languages || getProfileProp('languages');
                  const langsArray = Array.isArray(langs) ? langs : (typeof langs === 'string' ? [langs] : []);
                  return langsArray.length > 0 ? (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-slate-200 mb-2">Languages</h3>
                      <p className="text-slate-300">{langsArray.join(', ')}</p>
                    </div>
                  ) : null;
                })()}
              </section>
            )}

            {/* Infrastructure */}
            {activeProfile.infrastructure && (
              <section>
                <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Infrastructure</h2>
                
                {activeProfile.infrastructure.airports && activeProfile.infrastructure.airports.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Airports</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {activeProfile.infrastructure.airports.map((airport, idx) => (
                        <li key={idx}>{airport.name} ({airport.type})</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {activeProfile.infrastructure.seaports && activeProfile.infrastructure.seaports.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Seaports</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {activeProfile.infrastructure.seaports.map((port, idx) => (
                        <li key={idx}>{port.name} ({port.type})</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Power Capacity</span>
                    <span className="text-white">{activeProfile.infrastructure.powerCapacity || 'Not available'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Internet Penetration</span>
                    <span className="text-white">{activeProfile.infrastructure.internetPenetration || 'Not available'}</span>
                  </div>
                </div>
                
                {activeProfile.infrastructure.specialEconomicZones && activeProfile.infrastructure.specialEconomicZones.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Economic Zones</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {activeProfile.infrastructure.specialEconomicZones.map((zone, idx) => (
                        <li key={idx}>{zone}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Investment & Incentives */}
            {(activeProfile.investmentPrograms?.length > 0 || activeProfile.taxIncentives?.length > 0) && (
              <section>
                <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Investment Information</h2>
                
                {activeProfile.investmentPrograms && activeProfile.investmentPrograms.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Investment Programs</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {activeProfile.investmentPrograms.map((program, idx) => (
                        <li key={idx}>{program}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {activeProfile.taxIncentives && activeProfile.taxIncentives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-2">Tax Incentives</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {activeProfile.taxIncentives.map((incentive, idx) => (
                        <li key={idx}>{incentive}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Contact & Resources */}
            <section>
              <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Contact & Resources</h2>
              
              {activeProfile.governmentLinks && activeProfile.governmentLinks.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-slate-200 mb-2">Official Links</h3>
                  <ul className="space-y-2">
                    {activeProfile.governmentLinks.map((link, idx) => (
                      <li key={idx}>
                        <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeProfile.governmentOffices && activeProfile.governmentOffices.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-slate-200 mb-2">Government Offices</h3>
                  <div className="space-y-3">
                    {activeProfile.governmentOffices.slice(0, 4).map((office, idx) => (
                      <div key={idx} className="py-2 border-b border-slate-800">
                        <div className="font-medium text-white">{office.name}</div>
                        <div className="text-sm text-slate-400">{office.type}</div>
                        {office.phone && <div className="text-sm text-slate-300">Phone: {office.phone}</div>}
                        {office.email && <div className="text-sm text-slate-300">Email: {office.email}</div>}
                        {office.website && (
                          <a href={office.website} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">
                            {office.website}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Sources - In Left Panel (compact version for split view) */}
            {researchResult?.sources && researchResult.sources.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 mb-4">Sources</h2>
                <p className="text-sm text-slate-400 mb-4">
                  This report was compiled from {researchResult.sources.length} sources. 
                  {!isSourcePanelCollapsed && ' Click a source in the right panel to preview it.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {researchResult.sources.slice(0, 6).map((source: SourceCitation, idx: number) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300">
                      {source.type}
                    </span>
                  ))}
                  {researchResult.sources.length > 6 && (
                    <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-400">
                      +{researchResult.sources.length - 6} more
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* Disclaimer */}
            <section className="border-t border-slate-700 pt-6 mt-8">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Disclaimer:</strong> This report is for informational purposes only. Always verify critical information with official government sources before making business or investment decisions.
              </p>
            </section>
              </div>
            </div>

            {/* GENERATED DOCUMENT DISPLAY */}
            {generatedDocument && (
              <div className="mt-6 bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Generated {documentType.charAt(0).toUpperCase() + documentType.slice(1)}</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedDocument)}
                        className="px-3 py-1 text-sm bg-slate-800 border border-slate-600 text-slate-200 rounded hover:bg-slate-700"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => setGeneratedDocument(null)}
                        className="px-3 py-1 text-sm bg-red-600 border border-red-500 text-white rounded hover:bg-red-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-white text-black p-6 rounded-lg max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedDocument}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT PANEL - Source Browser (collapsible) */}
            {!isSourcePanelCollapsed && (
              <div className="w-[45%] flex flex-col overflow-hidden">
                {/* Source Browser Header */}
                <div className="flex-shrink-0 pb-3 border-b border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Link2 className="w-4 h-4" /> Source Browser
                    </h3>
                    <button
                      onClick={() => setIsSourcePanelCollapsed(true)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                      title="Collapse panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Click a source to preview without leaving this page</p>
                </div>

                {/* Source List */}
                <div className="flex-shrink-0 max-h-[200px] overflow-y-auto py-3 border-b border-slate-700">
                  {researchResult?.sources && researchResult.sources.length > 0 ? (
                    <div className="space-y-1">
                      {researchResult.sources.map((source: SourceCitation, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedSourceUrl(source.url);
                            setIframeError(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedSourceUrl === source.url
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                              : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Eye className="w-3 h-3 mt-1 flex-shrink-0 text-slate-500" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{source.title}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-slate-700 rounded">{source.type}</span>
                                <span className="truncate">{(() => { try { return new URL(source.url).hostname; } catch { return source.url || 'Unknown'; } })()}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No sources available</p>
                    </div>
                  )}
                </div>

                {/* Iframe Preview */}
                <div className="flex-1 min-h-0 pt-3">
                  {selectedSourceUrl ? (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400 truncate flex-1">
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{selectedSourceUrl}</span>
                        </div>
                        <a
                          href={selectedSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 flex-shrink-0"
                        >
                          Open in new tab
                        </a>
                      </div>
                      {iframeError ? (
                        <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center p-6">
                          <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
                          <h4 className="text-white font-semibold mb-2">Cannot preview this source</h4>
                          <p className="text-sm text-slate-400 mb-4">
                            This website doesn't allow embedded previews for security reasons.
                          </p>
                          <a
                            href={selectedSourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 text-sm flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" /> Open in new tab instead
                          </a>
                        </div>
                      ) : (
                        <iframe
                          src={selectedSourceUrl}
                          className="flex-1 w-full bg-white rounded-lg border border-slate-700"
                          title="Source Preview"
                          sandbox="allow-scripts allow-same-origin"
                          onError={() => setIframeError(true)}
                          onLoad={(e) => {
                            // Some sites block iframe but don't trigger onError, 
                            // we detect this via empty content (limited detection)
                            try {
                              const iframe = e.target as HTMLIFrameElement;
                              if (iframe.contentDocument?.body?.innerHTML === '') {
                                setIframeError(true);
                              }
                            } catch {
                              // Cross-origin access denied - this is normal for external sites
                            }
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="h-full bg-slate-900/50 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center p-6">
                      <Globe className="w-12 h-12 text-slate-600 mb-3" />
                      <h4 className="text-slate-300 font-semibold mb-1">Select a source to preview</h4>
                      <p className="text-sm text-slate-500">
                        Click any source link above to view it here without leaving the report
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Leader Detail Modal - Comprehensive */}
      {activeLeader && (
        <div className="fixed inset-0 z-30 bg-black/80 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setActiveLeader(null)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-4xl w-full my-8" onClick={(event) => event.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {activeLeader.imageUrl ? (
                    <img src={activeLeader.imageUrl} alt={activeLeader.name} className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/40" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center text-3xl font-bold">
                      {activeLeader.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">{activeLeader.name}</h3>
                    <p className="text-slate-400">{activeLeader.role}</p>
                    <p className="text-sm text-slate-500">{activeLeader.tenure}</p>
                    {activeLeader.imageUrl && (
                      <p className="text-[10px] text-amber-300 mt-1">
                        {activeLeader.photoSourceUrl ? (
                          <a href={activeLeader.photoSourceUrl} target="_blank" rel="noreferrer" className="hover:underline">Official photo source</a>
                        ) : (
                          'Official photo source pending verification'
                        )}
                      </p>
                    )}
                    {activeLeader.politicalParty && (
                      <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-xs text-purple-300">
                        {activeLeader.politicalParty}
                      </span>
                    )}
                    {activeLeader.internationalEngagementFocus && (
                      <span className="inline-block ml-2 mt-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs text-amber-300">
                        🌍 Int'l Engagement Lead
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-400">{activeLeader.rating.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Performance Rating</div>
                  <button onClick={() => setActiveLeader(null)} className="mt-4 px-4 py-2 text-xs font-semibold border border-white/20 rounded-lg hover:bg-white/10">
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Biography */}
              {(activeLeader.bio || activeLeader.fullBio) && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Biography
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{activeLeader.fullBio || activeLeader.bio}</p>
                </div>
              )}

              {/* Education & Previous Positions */}
              <div className="grid md:grid-cols-2 gap-4">
                {activeLeader.education && activeLeader.education.length > 0 && (
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Education
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeLeader.education.map((edu, i) => (
                        <li key={i}>* {edu}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeLeader.previousPositions && activeLeader.previousPositions.length > 0 && (
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Previous Positions
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeLeader.previousPositions.map((pos, i) => (
                        <li key={i}>* {pos}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Key Achievements */}
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Key Achievements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeLeader.achievements.map(item => (
                    <span key={item} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-300">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* News Reports */}
              {activeLeader.newsReports && activeLeader.newsReports.length > 0 && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
                    <Newspaper className="w-4 h-4" /> Recent News Reports
                  </h4>
                  <div className="space-y-3">
                    {activeLeader.newsReports.map((news, i) => (
                      <div key={i} className="p-3 border border-slate-800 rounded-lg">
                        <div className="font-semibold text-sm text-white">{news.headline}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{news.date} * {news.source}</div>
                        {news.summary && <p className="text-xs text-slate-300 mt-2">{news.summary}</p>}
                        {news.url && (
                          <a href={news.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300">
                            Read more <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Projects */}
              {activeLeader.pastProjects && activeLeader.pastProjects.length > 0 && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" /> Past Projects (Completed)
                  </h4>
                  <div className="space-y-3">
                    {activeLeader.pastProjects.map((project, i) => (
                      <div key={i} className="p-3 border border-emerald-500/20 rounded-lg bg-emerald-500/5">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{project.name}</div>
                          <ProjectBadge status={project.status} />
                        </div>
                        <div className="text-xs text-slate-300 mt-2">{project.description}</div>
                        <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-400">
                          {project.startDate && project.endDate && (
                            <span><Clock className="inline w-3 h-3 mr-1" />{project.startDate} - {project.endDate}</span>
                          )}
                          {project.budget && (
                            <span><DollarSign className="inline w-3 h-3 mr-1" />{project.budget}</span>
                          )}
                        </div>
                        {project.impact && (
                          <div className="mt-2 p-2 bg-emerald-500/10 rounded text-xs text-emerald-300">
                            <strong>Impact:</strong> {project.impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Projects */}
              {activeLeader.currentProjects && activeLeader.currentProjects.length > 0 && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Current & Planned Projects
                  </h4>
                  <div className="space-y-3">
                    {activeLeader.currentProjects.map((project, i) => (
                      <div key={i} className="p-3 border border-blue-500/20 rounded-lg bg-blue-500/5">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm">{project.name}</div>
                          <ProjectBadge status={project.status} />
                        </div>
                        <div className="text-xs text-slate-300 mt-2">{project.description}</div>
                        <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-400">
                          {project.startDate && (
                            <span><Clock className="inline w-3 h-3 mr-1" />Started: {project.startDate}</span>
                          )}
                          {project.budget && (
                            <span><DollarSign className="inline w-3 h-3 mr-1" />{project.budget}</span>
                          )}
                        </div>
                        {project.impact && (
                          <div className="mt-2 p-2 bg-blue-500/10 rounded text-xs text-blue-300">
                            <strong>Expected Impact:</strong> {project.impact}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Government Links */}
              {activeLeader.governmentLinks && activeLeader.governmentLinks.length > 0 && (
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Official Government Links
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {activeLeader.governmentLinks.map((link, i) => (
                      <a 
                        key={i}
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 text-xs text-blue-300 flex items-center gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Social Media */}
              <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Contact Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  {activeLeader.officeAddress && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                      <span>{activeLeader.officeAddress}</span>
                    </div>
                  )}
                  {activeLeader.contactEmail && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500">📊</span>
                      <a href={`mailto:${activeLeader.contactEmail}`} className="text-blue-400 hover:underline">{activeLeader.contactEmail}</a>
                    </div>
                  )}
                  {activeLeader.socialMedia?.facebook && (
                    <a href={activeLeader.socialMedia.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                      Facebook Profile
                    </a>
                  )}
                  {activeLeader.socialMedia?.twitter && (
                    <a href={activeLeader.socialMedia.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                      Twitter/X Profile
                    </a>
                  )}
                  {activeLeader.socialMedia?.website && (
                    <a href={activeLeader.socialMedia.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                      Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalLocationIntelligence;

