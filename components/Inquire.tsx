import React, { useState, useEffect, useRef } from 'react';
import { ReportParameters, ChatMessage, CopilotOption } from '../types';
import { runCopilotAnalysis, generateSearchGroundedContent } from '../services/geminiService';
import { NSILIntelligenceHub } from '../services/NSILIntelligenceHub';
import { SituationAnalysisEngine } from '../services/SituationAnalysisEngine';
import { HistoricalParallelMatcher } from '../services/HistoricalParallelMatcher';
import { BrainCircuit, Zap } from 'lucide-react';

interface InquireProps {
    params: ReportParameters;
    onApplySuggestions?: (suggestions: any) => void;
}

const Inquire: React.FC<InquireProps> = ({ params, onApplySuggestions }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial Welcome Message
    useEffect(() => {
        setMessages([{
                sender: 'copilot',
                text: "I'm your BWGA AI Copilot. I can analyze your objectives, find partners, or assess risks in real-time. How can I assist?"
            }]);
    }, []);

    const handleSendMessage = async (textOverride?: string) => {
        const text = textOverride || inputText;
        if (!text.trim()) return;

        // Add User Message
        const userMsg: ChatMessage = { sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsProcessing(true);

        // Add Placeholder for AI Response (Thinking State)
        const thinkingId = Date.now();
        setMessages(prev => [...prev, { sender: 'copilot', text: '', isThinking: true, thinkingStep: 'Initializing...' }]);

        try {
            // Simulate "Thinking" Steps
            const updateThinking = (step: string) => {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    if (lastMsg && lastMsg.isThinking) {
                        lastMsg.thinkingStep = step;
                    }
                    return newMsgs;
                });
            };

            updateThinking('Summarising input...');
            // Let state update render

            updateThinking('Searching global index...');
            // Perform actual search if needed context
            const searchContext = await generateSearchGroundedContent(text); 
            
            updateThinking('Running NSIL intelligence engines...');
            // Run NSIL quick assessment + situation analysis for context enrichment
            let nsilContext = '';
            try {
              const quickAssess = NSILIntelligenceHub.quickAssess(params);
              const situation = SituationAnalysisEngine.quickSummary(params);
              const historical = HistoricalParallelMatcher.quickMatch(params);
              
              nsilContext = `\nNSIL Intelligence:\n`;
              nsilContext += `- Trust Score: ${quickAssess.trustScore}/100 (${quickAssess.status})\n`;
              nsilContext += `- Ethical Gate: ${quickAssess.ethicalPass ? 'PASS' : 'CONCERNS'}\n`;
              nsilContext += `- Readiness: ${situation.readiness}/100\n`;
              nsilContext += `- Blind Spots: ${situation.blindSpotCount}\n`;
              nsilContext += `- Top Concern: ${quickAssess.topConcerns[0] || 'None'}\n`;
              nsilContext += `- Top Opportunity: ${quickAssess.topOpportunities[0] || 'None'}\n`;
              nsilContext += `- Unconsidered Need: ${situation.topUnconsideredNeed}\n`;
              if (historical.found) {
                nsilContext += `- Historical Parallel: ${historical.case_title} (${historical.outcome}) - ${historical.topLesson}\n`;
              }
            } catch (e) {
              console.warn('NSIL enrichment non-blocking error:', e);
            }

            updateThinking('Reasoning & generating options...');
            // Let state update render

            // Perform Deep Analysis with NSIL-enriched context
            const context = `User Context: ${params.organizationType} in ${params.region}. Industry: ${params.industry.join(', ')}. Goal: ${params.problemStatement}. Recent Search Context: ${searchContext.text}${nsilContext}`;
            const result = await runCopilotAnalysis(text, context);

            // Replace Thinking Message with Result
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs.pop(); // Remove thinking placeholder
                return [...newMsgs, {
                    sender: 'copilot',
                    text: result.summary,
                    options: result.options,
                    meta: { followUp: result.followUp }
                }];
            });

        } catch (e) {
            console.error("Copilot Error", e);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs.pop();
                return [...newMsgs, { sender: 'system', text: "Connection interrupted. Please try again." }];
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOptionClick = (option: CopilotOption) => {
        // Feed option back into chat as a user selection
        handleSendMessage(`Apply option: ${option.title}`);
        if (onApplySuggestions) {
            // potentially update parent state if logic exists
            console.log("Applied option:", option);
        }
    };

    const runQuickAction = (action: string) => {
        if (action === 'clarify') handleSendMessage("Clarify my strategic objective based on current market trends.");
        if (action === 'partners') handleSendMessage("Find 3 potential partners for this mission.");
        if (action === 'risk') handleSendMessage("What are the top 3 risks for this region?");
    };

    return (
        <div className="h-full flex flex-col bg-white border-l border-stone-200 shadow-xl relative font-sans">
            {/* Header */}
            <div className="p-4 bg-gradient-to-b from-white to-stone-50 border-b border-stone-200 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-700 to-stone-600 flex items-center justify-center text-white font-bold shadow-md">
                    BW
                </div>
                <div>
                    <h3 className="text-sm font-bold text-stone-900">BWGA AI Copilot</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] text-stone-500 font-medium uppercase tracking-wide">Live Assistant</span>
                    </div>
                </div>
            </div>

            {/* Stream Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Bubble */}
                        <div className={`max-w-[90%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.sender === 'user' 
                                ? 'bg-stone-700 text-white rounded-tr-none' 
                                : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                        }`}>
                            {msg.isThinking ? (
                                <div className="flex items-center gap-2 text-stone-500 italic">
                                    <BrainCircuit className="w-4 h-4 animate-spin" />
                                    <span>{msg.thinkingStep}</span>
                                </div>
                            ) : (
                                <div>
                                    {msg.text}
                                    {msg.meta?.followUp && (
                                        <div className="mt-2 pt-2 border-t border-stone-100 text-xs text-stone-500 font-medium">
                                            Follow-up: {msg.meta.followUp}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Options (if any) */}
                        {msg.options && msg.options.length > 0 && (
                            <div className="mt-2 w-[90%] space-y-2">
                                {msg.options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleOptionClick(opt)}
                                        className="w-full text-left p-3 bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-xl transition-all group shadow-sm"
                                    >
                                        <div className="font-bold text-xs text-stone-900 group-hover:text-stone-700 mb-0.5">
                                            {opt.title}
                                        </div>
                                        <div className="text-[10px] text-stone-500 leading-tight">
                                            {opt.rationale}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
                <button onClick={() => runQuickAction('clarify')} className="flex-shrink-0 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors shadow-sm whitespace-nowrap">
                    🔍 Clarify Objective
                </button>
                <button onClick={() => runQuickAction('partners')} className="flex-shrink-0 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors shadow-sm whitespace-nowrap">
                    🤝 Find Partners
                </button>
                <button onClick={() => runQuickAction('risk')} className="flex-shrink-0 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors shadow-sm whitespace-nowrap">
                    🛡 Check Risks
                </button>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-stone-200 flex-shrink-0">
                <div className="relative">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
                        placeholder={isProcessing ? "Processing..." : "Ask Copilot..."}
                        disabled={isProcessing}
                        className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-600 focus:bg-white transition-all shadow-inner"
                    />
                    <button 
                        onClick={() => handleSendMessage()}
                        disabled={!inputText.trim() || isProcessing}
                        className="absolute right-2 top-2 p-1.5 bg-stone-600 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 disabled:hover:bg-stone-600 transition-colors shadow-sm"
                    >
                        <Zap className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Inquire;
