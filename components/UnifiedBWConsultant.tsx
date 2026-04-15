/**
 * UNIFIED VERDIX CONSULTANT COMPONENT
 * 
 * Landing Page: Drawer/Modal with A4 fact sheet
 * Live Report: Normal chat interface showing conversational responses
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader, Brain, X, ExternalLink } from 'lucide-react';
import ContextAwareBWConsultant, { 
  ConsultantResponse, 
  FactSheetResponse
} from '../services/ContextAwareBWConsultant';

interface UnifiedBWConsultantProps {
  context?: 'landing' | 'live-report';
  reportData?: Record<string, unknown> | object;
  initialPrompt?: string;
  onQueryProcessed?: (response: ConsultantResponse) => void;
  onEnterPlatform?: (payload?: { query?: string; results?: Record<string, unknown>[] }) => void;
  className?: string;
  minHeight?: string;
}

/**
 * Landing Page: A4 Fact Sheet Drawer
 */
const FactSheetDrawer: React.FC<{ 
  response: FactSheetResponse; 
  query: string;
  onClose: () => void;
  onEnterPlatform?: (payload?: { query?: string }) => void;
}> = ({ response, query, onClose, onEnterPlatform }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    
    {/* A4 Drawer */}
    <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 z-10"
      >
        <X size={20} />
      </button>

      {/* A4 Content */}
      <div className="p-8 space-y-4 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b pb-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Fact Sheet</p>
          <h2 className="text-2xl font-bold text-stone-900">{response.title}</h2>
          <p className="text-sm text-stone-600 mt-1">Query: {response.topic}</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {response.sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{section.heading}</h3>
              <p className="text-sm text-stone-700 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Key Metrics */}
        {Object.keys(response.keyMetrics).length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-stone-900 mb-2">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(response.keyMetrics).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-stone-600">{key}</p>
                  <p className="font-semibold text-stone-900">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Data if available */}
        {response.liveData && (
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h3 className="font-bold text-stone-900 mb-2">📊 Live Market Data</h3>
            <div className="space-y-1 text-sm">
              {response.liveData.gdp && <p><strong>GDP:</strong> {response.liveData.gdp}</p>}
              {response.liveData.population && <p><strong>Population:</strong> {response.liveData.population}</p>}
              {response.liveData.growth && <p><strong>Growth Rate:</strong> {response.liveData.growth}%</p>}
            </div>
          </div>
        )}

        {/* Confidence */}
        <p className="text-xs text-stone-500">Confidence: {Math.round(response.confidence * 100)}%</p>
      </div>

      {/* Footer Actions */}
      <div className="border-t bg-stone-50 p-4 flex gap-2">
        <button
          onClick={() => {
            onClose();
            onEnterPlatform?.({ query });
          }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <ExternalLink size={14} />
          Enter Live Report Builder
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-stone-200 text-stone-900 rounded-lg font-semibold text-sm hover:bg-stone-300 transition"
        >
          Back
        </button>
      </div>
    </div>
  </div>
);

/**
 * Main Component
 */
export const UnifiedBWConsultant: React.FC<UnifiedBWConsultantProps> = ({
  context,
  reportData,
  initialPrompt,
  onQueryProcessed,
  onEnterPlatform,
  className = '',
  minHeight = 'h-96'
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedContext, setDetectedContext] = useState<'landing' | 'live-report'>(context || 'landing');
  
  // For landing page: store fact sheet response for drawer
  const [factSheetResponse, setFactSheetResponse] = useState<FactSheetResponse | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  
  // For live report: store chat messages
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bw'; text: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAutoPromptRef = useRef<string | null>(null);

  useEffect(() => {
    if (!context) {
      const detected = ContextAwareBWConsultant.detectContext();
      setDetectedContext(detected);
    } else {
      setDetectedContext(context);
    }
  }, [context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const processQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await ContextAwareBWConsultant.processQuery(
        queryText,
        detectedContext,
        reportData as Record<string, unknown>
      );

      if (detectedContext === 'landing') {
        // Landing page: show response inline as chat + open fact sheet drawer
        setChatMessages(prev => [...prev, { type: 'user', text: queryText }]);
        if (result.format === 'fact-sheet') {
          const firstSection = result.sections?.[0]?.content?.toLowerCase?.() || '';
          const looksLikeError =
            firstSection.includes('ai service error') ||
            firstSection.includes('temporarily unavailable') ||
            firstSection.includes('api key expired') ||
            firstSection.includes('error fetching');
          const looksLikeGenericFallback =
            firstSection.includes('VERDIX consultant ai analysis') ||
            firstSection.includes('bw consultant ai analysis') ||
            firstSection.includes('to provide more targeted insights') ||
            firstSection.includes('what i can help with');

          if (looksLikeError || looksLikeGenericFallback) {
            setChatMessages(prev => [
              ...prev,
              {
                type: 'bw',
                text:
                  'I could not generate a valid live Fact Sheet for that query. The AI provider returned a fallback/service response. ' +
                  'Please refresh API credentials and retry. I can still guide a manual analysis right now if you share your priority angle.'
              }
            ]);
            setFactSheetResponse(null);
            setCurrentQuery('');
            setInput('');
            return;
          }

          // Build a concise proactive summary for the chat area
          const summaryLines = result.sections
            .slice(0, 3)
            .map((s: { heading: string; content: string }) => `**${s.heading}:** ${s.content.slice(0, 180)}...`);
          const proactiveNote = `Here's what I found for "${queryText}":\n\n${summaryLines.join('\n\n')}\n\nI've prepared a full Fact Sheet with deeper analysis - it's open now. Need me to dig into a specific angle? Just tell me what detail matters most.`;
          setChatMessages(prev => [...prev, { type: 'bw', text: proactiveNote }]);
          setCurrentQuery(queryText);
          setFactSheetResponse(result);
        } else if (result.format === 'chat-response') {
          setChatMessages(prev => [...prev, { type: 'bw', text: (result as unknown as { message: string }).message }]);
        }
      } else {
        // Live report: show as natural chat
        setChatMessages(prev => [...prev, { type: 'user', text: queryText }]);
        if (result.format === 'chat-response') {
          setChatMessages(prev => [...prev, { type: 'bw', text: result.message }]);
        }
      }

      onQueryProcessed?.(result);
    } catch (error) {
      console.error('VERDIX Consultant error:', error);
      if (detectedContext === 'live-report') {
        setChatMessages(prev => [...prev, 
          { type: 'user', text: queryText },
          { type: 'bw', text: 'I encountered an error. Please try again.' }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [detectedContext, isLoading, onQueryProcessed, reportData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;
    setInput('');
    await processQuery(message);
  };

  useEffect(() => {
    const prompt = initialPrompt?.trim();
    if (!prompt || detectedContext !== 'landing') return;
    if (lastAutoPromptRef.current === prompt) return;

    lastAutoPromptRef.current = prompt;
    void processQuery(prompt);
  }, [initialPrompt, detectedContext, processQuery]);

  // Landing page UI - Landscape ChatGPT-style: wide, compact, no vertical scroll
  if (detectedContext === 'landing') {
    return (
      <>
        <div className={`flex flex-col bg-white overflow-hidden ${className}`} style={{ fontFamily: "'Söhne', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
          {/* LANDSCAPE LAYOUT - response left, input right */}
          <div className="flex flex-col md:flex-row" style={{ height: '340px' }}>
            {/* LEFT: Response / Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-stone-50 border-r border-stone-200">
              {chatMessages.length === 0 && !factSheetResponse ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Brain size={36} className="text-blue-200 mb-3" />
                  <h3 className="text-base font-semibold text-slate-700 mb-1">How can I help you today?</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
                    Proactive intelligence - provide a location, company, or topic and I'll deliver strategic insights.
                  </p>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                    {[
                      { label: 'Analyze a market', example: 'Vietnam renewable energy sector' },
                      { label: 'Assess a company', example: 'Vestas Wind Systems risk profile' },
                      { label: 'Regional intelligence', example: 'Philippines infrastructure outlook' },
                      { label: 'Investment guidance', example: 'Saudi Arabia NEOM project viability' },
                    ].map((hint, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInput(hint.example)}
                        className="text-left px-3 py-2 bg-white border border-slate-200 hover:border-blue-400 hover:shadow transition-all group"
                      >
                        <p className="text-xs font-medium text-slate-700 group-hover:text-blue-700">{hint.label}</p>
                        <p className="text-[10px] text-slate-400 truncate">{hint.example}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-2 text-sm leading-relaxed ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-stone-200 text-stone-900 shadow-sm'
                      }`}>
                        {msg.type === 'bw' && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Brain size={11} className="text-blue-600" />
                            <span className="text-[9px] font-semibold text-blue-600 uppercase">VERDIX Consultant</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="px-4 py-2 bg-white border border-stone-200 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Loader size={14} className="animate-spin text-blue-600" />
                          Analyzing...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* RIGHT: Input Panel */}
            <div className="w-full md:w-[380px] flex flex-col bg-white">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border-b border-stone-200">
                <Brain size={14} className="text-blue-600" />
                <span className="text-xs font-semibold text-slate-600">Your Query</span>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4">
                <textarea
                  data-testid="bwai-search-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Describe what you need - a location, company, sector, investment question, or risk scenario...\n\nThe more detail you provide, the more precise my analysis."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-slate-400">
                    Enter to send • Shift+Enter new line
                  </p>
                  <button
                    data-testid="bwai-search-button"
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center gap-2"
                  >
                    {isLoading ? <Loader size={14} className="animate-spin" /> : <><Send size={14} /> Send</>}
                  </button>
                </div>
              </form>
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 text-[10px] text-blue-700">
                <strong>NSIL Agentic Runtime</strong> - Proactive intelligence activates when you provide
              </div>
            </div>
          </div>
        </div>

        {/* Fact Sheet Drawer */}
        {factSheetResponse && (
          <FactSheetDrawer 
            response={factSheetResponse}
            query={currentQuery}
            onClose={() => setFactSheetResponse(null)}
            onEnterPlatform={onEnterPlatform}
          />
        )}
      </>
    );
  }

  // Live report UI (natural chat)
  return (
    <div className={`flex flex-col bg-white border border-stone-200 rounded-lg overflow-hidden ${className}`}>
      {/* HEADER */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white border-b border-blue-900">
        <Brain size={16} />
        <span className="font-bold text-sm">VERDIX Consultant</span>
        <span className="text-xs opacity-75">💬 Live Chat</span>
      </div>

      {/* MESSAGES AREA */}
      <div className={`flex-1 overflow-y-auto ${minHeight} p-4 space-y-3 bg-stone-50 custom-scrollbar`}>
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Brain size={40} className="text-stone-300 mb-2" />
            <p className="text-sm text-stone-600">I'm here to help. Ask me anything.</p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-stone-200 text-stone-900'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <form onSubmit={handleSubmit} className="border-t border-stone-200 p-3 flex gap-2 bg-white">
        <input
          data-testid="bwai-search-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for guidance or help..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          data-testid="bwai-search-button"
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>

      {/* INFO */}
      <div className="px-3 py-2 bg-blue-50 border-t border-blue-200 text-[10px] text-blue-700">
        <strong>NSIL v3.2</strong> - Powered by multi-agent intelligence
      </div>
    </div>
  );
};

export default UnifiedBWConsultant;
