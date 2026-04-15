import React, { useState, useRef } from 'react';
import { Search, Loader, AlertCircle, ExternalLink } from 'lucide-react';
import { invokeAI } from '../services/geminiService';
import { UnifiedBWConsultant } from './UnifiedBWConsultant';

export interface SearchResult {
  title: string;
  description: string;
  confidence: number;
  category: string;
}

export interface BWConsultantSearchWidgetProps {
  onSearch?: (query: string) => void;
  onEnterPlatform?: (payload?: { query?: string; results?: SearchResult[] }) => void;
  placeholder?: string;
  context?: 'landing' | 'report';
}

export const BWConsultantSearchWidget: React.FC<BWConsultantSearchWidgetProps> = ({
  onSearch,
  onEnterPlatform,
  placeholder = 'Search any location, company, or entity...',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context = 'landing'
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchProgress, setSearchProgress] = useState<{ message: string; progress: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    setSearchProgress({ message: 'Connecting to ADVERSIQ Consultant...', progress: 20 });

    try {
      setSearchProgress({ message: 'Researching your query...', progress: 50 });

      const prompt = `You are ADVERSIQ Consultant, a knowledgeable strategic business advisor. A user has asked you a question from a landing page search bar. Provide a helpful, direct answer.

IMPORTANT:
- Answer the question directly and conversationally, like ChatGPT would
- If they ask about a person, tell them about that person
- If they ask about a city or location, tell them about it
- If they ask about a market or industry, explain it
- Be informative and specific
- Provide 3-5 key points as separate findings

Respond in this exact JSON format (no markdown, just raw JSON):
[{"title": "Finding title", "description": "2-3 sentence explanation", "confidence": 0.85, "category": "Category Name"}]

Provide 3-5 results. Categories can be: "Key Information", "Background", "Analysis", "Opportunities", "Risks", "Recommendations".

User query: ${query.trim()}`;

      const aiResponse = await invokeAI(prompt);

      setSearchProgress({ message: 'Processing results...', progress: 85 });

      // Parse AI response into search results
      let realResults: SearchResult[] = [];
      try {
        // Try to parse as JSON array
        const cleaned = aiResponse.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          realResults = parsed.map((item: Record<string, unknown>) => ({
            title: String(item.title || 'Analysis'),
            description: String(item.description || item.content || ''),
            confidence: typeof item.confidence === 'number' ? item.confidence : 0.8,
            category: String(item.category || 'Analysis')
          }));
        }
      } catch {
        // If JSON parsing fails, use the raw text as a single result
        realResults = [{
          title: `Analysis: ${query.trim()}`,
          description: aiResponse.slice(0, 500),
          confidence: 0.85,
          category: 'AI Response'
        }];
      }

      // Ensure at least one result
      if (realResults.length === 0) {
        realResults.push({
          title: `Analysis: ${query.trim()}`,
          description: aiResponse.slice(0, 500),
          confidence: 0.8,
          category: 'General Analysis'
        });
      }

      setSearchProgress({ message: 'Complete', progress: 100 });
      setResults(realResults);
      if (onSearch) onSearch(query);
    } catch (error) {
      console.error('Search error:', error);
      setResults([{
        title: 'Search Unavailable',
        description: 'Could not connect to AI services. Please check your API key or try again.',
        confidence: 0.5,
        category: 'Error'
      }]);
    } finally {
      setIsSearching(false);
      setSearchProgress(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch((e as unknown) as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Banner with Background */}
      <div 
        className="relative rounded-sm overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(15, 23, 42, 0.7) 100%), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="p-10 md:p-14">
          {/* Header */}
          <p className="text-blue-400 uppercase tracking-[0.3em] text-xs mb-4 font-semibold">
            Meet Your AI Partner
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight">
            ADVERSIQ Consultant<br />
            <span className="text-blue-400">Your Strategic Intelligence Partner</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-3 max-w-2xl">
            I&rsquo;m not a chatbot &mdash; I&rsquo;m a sovereign-grade intelligence system built to help you navigate global business, investment, and regional development challenges.
          </p>


          {/* Search Input */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-3 max-w-3xl">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  data-testid="bwai-search-input"
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full pl-12 pr-4 py-4 bg-white/95 border-2 border-transparent rounded-sm text-base text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-lg"
                />
              </div>
              <button
                data-testid="bwai-search-button"
                type="submit"
                disabled={isSearching || !query.trim()}
                className={`px-8 py-4 rounded-sm text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isSearching || !query.trim()
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {isSearching ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>

        {showResults && query.trim() && (
          <div className="mb-4 max-w-3xl">
            <p className="text-xs text-slate-300">Active query: {query}</p>
          </div>
        )}

        {/* Progress Bar */}
        {searchProgress && (
          <div className="bg-slate-800/80 backdrop-blur border border-slate-600 rounded-sm p-4 mb-6 max-w-3xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">{searchProgress.message}</span>
              <span className="text-sm text-blue-400 font-mono">{searchProgress.progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-sm h-2">
              <div
                className="bg-blue-500 h-2 rounded-sm transition-all duration-500"
                style={{ width: `${searchProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results shown in modal popup - see below */}

        {/* Empty State Message */}
        {!showResults && !isSearching && (
          <div className="max-w-3xl">
            <p className="text-sm text-slate-400 mb-2">Try asking me:</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm bg-slate-700/60 text-slate-300 px-3 py-1.5 rounded-sm border border-slate-600 cursor-pointer hover:bg-slate-600/60 transition">&ldquo;Check IFC compliance for my factory in Vietnam&rdquo;</span>
              <span className="text-sm bg-slate-700/60 text-slate-300 px-3 py-1.5 rounded-sm border border-slate-600 cursor-pointer hover:bg-slate-600/60 transition">&ldquo;Compare Bangkok vs Manila for tech investment&rdquo;</span>
              <span className="text-sm bg-slate-700/60 text-slate-300 px-3 py-1.5 rounded-sm border border-slate-600 cursor-pointer hover:bg-slate-600/60 transition">&ldquo;What are the ESG risks in Philippine manufacturing?&rdquo;</span>
            </div>
          </div>
        )}

        {/* No Results State */}
        {showResults && results.length === 0 && !isSearching && (
          <div className="bg-slate-800/80 border border-slate-600 rounded-sm p-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-slate-400 flex-shrink-0" />
              <p className="text-base text-slate-300">
                No results found. Try rephrasing your query or ask about a specific location or company.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* ═══════════════════ LANDING PAGE FACT SHEET ═══════════════════ */}
      {showResults && results.length > 0 && !isSearching && (
        <div className="max-w-3xl w-full mt-6">
          <div className="bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-6">
            <div className="mb-6">
              <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-1">ADVERSIQ Deep Intelligence</p>
              <h3 className="text-lg font-bold text-white">Fact Sheet Analysis</h3>
              <p className="text-xs text-slate-400 mt-0.5">Query: &ldquo;{query}&rdquo;</p>
            </div>
            
            {/* Unified Consultant showing FACT SHEET mode for landing page */}
            <UnifiedBWConsultant
              context="landing"
              reportData={{ query, results }}
              onQueryProcessed={(response) => {
                console.log('Landing page consultant response:', response);
              }}
              minHeight="h-auto"
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          {/* Additional Action Button */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => {
                setShowResults(false);
                onEnterPlatform?.({ query, results });
              }}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Enter Live Report Builder
            </button>
            <button
              onClick={() => setShowResults(false)}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold text-sm hover:bg-slate-600 transition border border-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
