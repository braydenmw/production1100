
import React, { useState, useMemo } from 'react';
import { INDUSTRIES, REGIONS_AND_COUNTRIES } from '../constants';
import { Search, Users, Globe } from 'lucide-react';
import MatchmakingEngine from './MatchmakingEngine';
import { ReportParameters } from '../types';

const GlobalPartnerSearch: React.FC = () => {
    const [region, setRegion] = useState('');
    const [industry, setIndustry] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [searchId] = useState(() => 'search-' + Date.now());

    // Build minimal search context for the matchmaking engine.
    const searchParams: ReportParameters = useMemo(() => ({
        reportName: 'Quick Search',
        userName: 'Guest',
        userDepartment: '',
        organizationName: 'Global Partner Search',
        organizationType: 'Private Enterprise',
        organizationSubType: '',
        userCountry: 'Global',
        userTier: 'Tier 1',
        skillLevel: 'experienced',
        region: region || 'Global',
        country: '',
        industry: industry ? [industry] : [],
        customIndustry: '',
        strategicIntent: ['Partner Discovery'],
        idealPartnerProfile: '',
        problemStatement: `Find partners in ${region} for ${industry}`,
        analysisTimeframe: 'Last 12 Months',
        tier: ['Tier 1'],
        aiPersona: [],
        customAiPersona: '',
        id: searchId,
        createdAt: new Date().toISOString(),
        status: 'draft',
        analyticalModules: [],
        selectedAgents: [],
        selectedModels: [],
        selectedModules: [],
        reportLength: 'standard',
        reportComplexity: 'standard',
        collaborativeNotes: '',
        outputFormat: 'report',
        stakeholderPerspectives: [],
        includeCrossSectorMatches: false,
        matchCount: 5,
        partnershipSupportNeeds: [],
        partnerDiscoveryMode: true,
        strategicMode: 'discovery',
        searchScope: 'Global',
        intentTags: [],
        comparativeContext: [],
        additionalContext: '',
        relationshipStage: 'New',
        dueDiligenceDepth: 'Standard',
        partnerCapabilities: [],
        operationalPriority: 'Efficiency',
        riskTolerance: 'Medium',
        expansionTimeline: '1-2 Years',
        letterStyle: 'Formal Exploratory',
        strategicObjectives: [],
        opportunityScore: { totalScore: 0, marketPotential: 0, riskFactors: 0 }
    }), [region, industry, searchId]);

    const handleSearch = () => {
        if (region && industry) {
            setShowResults(true);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Global Partner Discovery
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                    Find potential collaborators by region and sector using the current search configuration.
                </p>
            </div>
            
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Target Region</label>
                        <select 
                            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none"
                            value={region}
                            onChange={(e) => { setRegion(e.target.value); setShowResults(false); }}
                        >
                            <option value="">Select Region...</option>
                            {REGIONS_AND_COUNTRIES.flatMap(r => r.countries).sort().map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Industry Sector</label>
                        <select 
                            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none"
                            value={industry}
                            onChange={(e) => { setIndustry(e.target.value); setShowResults(false); }}
                        >
                            <option value="">Select Sector...</option>
                            {INDUSTRIES.map(i => (
                                <option key={i.id} value={i.id}>{i.title}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleSearch}
                        disabled={!region || !industry}
                        className="px-6 py-2.5 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
                    >
                        <Search className="w-4 h-4" /> Search
                    </button>
                </div>

                {showResults && (
                    <div className="animate-in fade-in border-t border-stone-100 pt-6">
                        <MatchmakingEngine 
                            params={searchParams} 
                            autoRun={true}
                            compact={true}
                        />
                    </div>
                )}
                
                {!showResults && (
                    <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Configure search parameters to scan the global network.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalPartnerSearch;
