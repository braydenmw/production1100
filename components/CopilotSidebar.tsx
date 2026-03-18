import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { askCopilot } from '../services/geminiService';
import { ReportParameters } from '../types';

interface ProactiveSuggestion {
  id: string;
  type: 'insight' | 'warning' | 'opportunity' | 'question';
  title: string;
  content: string;
  confidence: number;
  action?: string;
}

export default function CopilotSidebar({ caseId, currentContext }: {
  caseId?: string;
  currentContext?: { phase?: string; params?: ReportParameters }
}) {
  const [messages, setMessages] = useState<string[]>([
    '📊  BWGA AI Copilot - Dynamic Strategic Partner',
    'I\'m analyzing your mission in real-time. Here are my initial insights:'
  ]);
  const [loading, setLoading] = useState(false);
  const [proactiveSuggestions, setProactiveSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [isAutonomous, setIsAutonomous] = useState(true);

  function append(s:string){ setMessages(prev => [...prev, s]); }

  // Autonomous analysis based on current context
  useEffect(() => {
    if (currentContext && isAutonomous) {
      generateProactiveSuggestions();
    }
  }, [currentContext, isAutonomous]);

  const generateProactiveSuggestions = () => {
    const suggestions: ProactiveSuggestion[] = [];
    const params = currentContext?.params;

    // Analyze based on current phase and parameters
    if (currentContext?.phase === 'gateway' || currentContext?.phase === 'intake') {
      suggestions.push({
        id: 'market-timing',
        type: 'insight',
        title: 'Market Timing',
        content: 'Current geopolitical conditions may affect timelines for your target region. Consider reviewing the latest intelligence before finalising outreach schedules.',
        confidence: 0,
        action: 'Review regional intelligence'
      });
    }

    if (params?.organizationType?.includes('Government')) {
      suggestions.push({
        id: 'stakeholder-mapping',
        type: 'opportunity',
        title: 'Stakeholder Mapping Recommended',
        content: 'Government-oriented engagements typically involve a broader set of decision stakeholders. Ensure all relevant influencers are captured in the case brief.',
        confidence: 0,
        action: 'Expand stakeholder analysis'
      });
    }

    if (params?.region === 'Asia-Pacific' || params?.country?.includes('China') || params?.country?.includes('Vietnam')) {
      suggestions.push({
        id: 'supply-chain-risk',
        type: 'warning',
        title: 'Supply Chain Considerations',
        content: 'Asia-Pacific supply chains carry region-specific risk profiles. Review current trade statistics and logistics disruption reports before finalising sourcing strategy.',
        confidence: 0,
        action: 'Review supply chain intelligence'
      });
    }

    // Always provide at least one suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'general-insight',
        type: 'insight',
        title: 'Ready for Analysis',
        content: 'Provide more context about your organization, target country, and strategic intent to unlock tailored intelligence from the NSIL pipeline.',
        confidence: 0,
        action: 'Complete intake fields'
      });
    }

    setProactiveSuggestions(suggestions);
  };

  async function runOption(id:string) {
    setLoading(true);
    append('Requesting: - + id + '...');
    try {
        // Use the existing geminiService instead of fetch
        const mockParams: ReportParameters = currentContext?.params || {} as any;
        
        let query = "";
        if (id === 'clarify') query = "Clarify the current strategic ambiguity.";
        if (id === 'partners') query = "Identify potential partners for this context.";
        if (id === 'risk') query = "Provide a quick risk assessment.";

        const result = await askCopilot(query, mockParams);
        append(`Result: ${result.description}`);
    } catch (e) {
      append('Error: ' + String(e));
    } finally {
      setLoading(false);
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'insight': return <BrainCircuit className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'opportunity': return <Zap className="w-4 h-4 text-green-500" />;
      case 'question': return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default: return <BrainCircuit className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'insight': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'opportunity': return 'border-green-200 bg-green-50';
      case 'question': return 'border-purple-200 bg-purple-50';
      default: return 'border-stone-200 bg-stone-50';
    }
  };

  return (
    <div className="w-80 p-4 border-l border-stone-200 bg-white h-full flex flex-col shrink-0">
      <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-stone-900 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          BWGA AI Copilot
        </h4>
        <button
          onClick={() => setIsAutonomous(!isAutonomous)}
          className={`px-2 py-1 rounded text-xs font-bold ${
            isAutonomous ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {isAutonomous ? 'Auto' : 'Manual'}
        </button>
      </div>

      {/* Proactive Suggestions */}
      {proactiveSuggestions.length > 0 && (
        <div className="mb-4 space-y-2">
          <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wide">Live Insights</h5>
          {proactiveSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-3 rounded-lg border ${getSuggestionColor(suggestion.type)} cursor-pointer hover:shadow-sm transition-all`}
              onClick={() => append(`💡 ${suggestion.title}: ${suggestion.content}`)}
            >
              <div className="flex items-start gap-2">
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-stone-900">{suggestion.title}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded font-bold border border-stone-100">
                      {suggestion.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">{suggestion.content}</p>
                  {suggestion.action && (
                    <span className="text-xs font-bold text-blue-600 mt-1 block hover:underline">
                      a' {suggestion.action}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-stone-50 p-3 rounded-lg border border-stone-100 mb-4 text-xs space-y-2 font-mono text-stone-600 shadow-inner">
        {messages.map((m,i) => <div key={i} className="border-b border-stone-100 pb-1 last:border-0">{m}</div>)}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
            onClick={() => runOption('clarify')}
            disabled={loading}
            className="px-2 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded text-xs font-bold text-stone-700 disabled:opacity-50 transition-colors"
        >
            Clarify
        </button>
        <button
            onClick={() => runOption('partners')}
            disabled={loading}
            className="px-2 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded text-xs font-bold text-stone-700 disabled:opacity-50 transition-colors"
        >
            Partners
        </button>
        <button
            onClick={() => runOption('risk')}
            disabled={loading}
            className="px-2 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded text-xs font-bold text-stone-700 disabled:opacity-50 transition-colors"
        >
            Quick Risk
        </button>
      </div>
    </div>
  );
}
