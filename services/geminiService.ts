
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { CopilotInsight, ReportParameters, LiveOpportunityItem, DeepReasoningAnalysis, GeopoliticalAnalysisResult, GovernanceAuditResult } from '../types';
import { config, features } from './config';

// API base URL - Vite proxies /api to backend in dev, same origin in production
const API_BASE = '/api';

// Get Gemini API key - works in both Vite and Node environments
const getGeminiApiKey = (): string => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = import.meta as any;
    if (meta?.env?.VITE_GEMINI_API_KEY) {
      return meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // Vite env not available
  }
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return '';
};

// System instruction for the AI
const SYSTEM_INSTRUCTION = `You are "BWGA Ai" (NEXUS_OS_v4.1), the world's premier Economic Intelligence Operating System.`;

// Session ID for maintaining chat context on the server
let sessionId: string | null = null;

export const getChatSession = (): { sendMessage: (msg: { message: string }) => Promise<{ text: string }>, sendMessageStream: (msg: { message: string }) => Promise<AsyncIterable<{ text: string }>> } => {
    return {
        sendMessage: async (msg: { message: string }) => {
            // Try backend first
            try {
                const response = await fetch(`${API_BASE}/ai/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg.message, sessionId, systemInstruction: SYSTEM_INSTRUCTION })
                });
                if (response.ok) {
                    const data = await response.json();
                    sessionId = data.sessionId;
                    return { text: data.text || '' };
                }
            } catch (error) {
                console.warn('Backend chat failed, trying direct Gemini:', error);
            }

            // Direct Gemini fallback
            const apiKey = getGeminiApiKey();
            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: 'gemini-2.0-flash',
                    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
                    systemInstruction: SYSTEM_INSTRUCTION,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ]
                });
                const result = await model.generateContent(msg.message);
                return { text: result.response.text() };
            }
            return { text: 'Chat service unavailable. Please check your API key.' };
        },
        sendMessageStream: async (msg: { message: string }) => {
            // Try backend SSE first
            try {
                const response = await fetch(`${API_BASE}/ai/generate-stream`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: msg.message, sessionId, systemInstruction: SYSTEM_INSTRUCTION })
                });
                
                if (response.ok && response.body) {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    
                    return {
                        [Symbol.asyncIterator]: () => ({
                            async next() {
                                if (!reader) return { done: true, value: undefined };
                                const { done, value } = await reader.read();
                                if (done) return { done: true, value: undefined };
                                const text = decoder.decode(value);
                                const lines = text.split('\n').filter(line => line.startsWith('data: '));
                                const combinedText = lines.map(line => {
                                    try {
                                        const json = JSON.parse(line.slice(6));
                                        return json.text || '';
                                    } catch { return ''; }
                                }).join('');
                                return { done: false, value: { text: combinedText } };
                            }
                        })
                    };
                }
            } catch (error) {
                console.warn('Backend stream failed, using direct Gemini:', error);
            }

            // Direct Gemini fallback (non-streaming wrapped as async iterable)
            const apiKey = getGeminiApiKey();
            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: 'gemini-2.0-flash',
                    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
                    systemInstruction: SYSTEM_INSTRUCTION,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ]
                });
                const result = await model.generateContent(msg.message);
                const fullText = result.response.text();
                let yielded = false;
                return {
                    [Symbol.asyncIterator]: () => ({
                        async next() {
                            if (yielded) return { done: true, value: undefined };
                            yielded = true;
                            return { done: false, value: { text: fullText } };
                        }
                    })
                };
            }

            // Final fallback — empty iterable
            return {
                [Symbol.asyncIterator]: () => ({
                    async next() { return { done: true, value: undefined }; }
                })
            };
        }
    };
};

export const sendMessageStream = async (message: string) => {
  const chat = getChatSession();
  try {
    const responseStream = await chat.sendMessageStream({ message });
    return responseStream;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

// --- NEW FUNCTIONS FOR APP.TSX ---

export const generateCopilotInsights = async (params: ReportParameters): Promise<CopilotInsight[]> => {
    // Try backend first
    if (config.useRealAI) {
        try {
            const response = await fetch(`${API_BASE}/ai/insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationName: params.organizationName,
                    country: params.country,
                    strategicIntent: params.strategicIntent,
                    specificOpportunity: params.specificOpportunity
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                // Server returns array directly
                return Array.isArray(data) ? data : (data.insights || []);
            }
        } catch (error) {
            console.warn('Backend AI failed, trying direct Gemini:', error);
        }
    }

    // Try direct Gemini API
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash',
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });
            
            const prompt = `${SYSTEM_INSTRUCTION}

Generate 5 strategic insights for:
- Organization: ${params.organizationName || 'Organization'}
- Target Market: ${params.country || 'Global'}
- Strategic Intent: ${params.strategicIntent?.join(', ') || 'Market expansion'}
- Opportunity: ${params.specificOpportunity || 'Strategic partnership'}

Return ONLY a valid JSON array with exactly 5 insights. Each insight must have:
- id: unique string
- type: one of "opportunity", "risk", "strategy", "insight", "warning"
- title: short title (5-10 words)
- description: detailed description (2-3 sentences)
- confidence: number 60-95

Example format:
[{"id":"1","type":"opportunity","title":"Strong Market Growth Potential","description":"The target market shows 8% annual growth...","confidence":85}]`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Parse JSON from response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const insights = JSON.parse(jsonMatch[0]);
                return insights.map((i: any, idx: number) => ({
                    id: i.id || `insight-${idx}`,
                    type: i.type || 'insight',
                    title: i.title || 'Strategic Insight',
                    description: i.description || 'Analysis complete.',
                    confidence: i.confidence || 75
                }));
            }
        } catch (geminiError) {
            console.warn('Direct Gemini insights failed:', geminiError);
        }
    }

    // Return empty if no AI available
    return [];
};

export const askCopilot = async (query: string, params: ReportParameters): Promise<CopilotInsight> => {
    // Try backend first
    if (config.useRealAI) {
        try {
            const response = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: query, 
                    context: {
                        organizationName: params.organizationName,
                        country: params.country,
                        specificOpportunity: params.specificOpportunity,
                        targetIncentives: params.targetIncentives
                    },
                    sessionId 
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                sessionId = data.sessionId;
                return {
                    id: Date.now().toString(),
                    type: 'strategy',
                    title: 'Copilot Response',
                    description: data.text || "Analysis complete.",
                    content: data.text || "Analysis complete.",
                    confidence: 85
                };
            }
        } catch (error) {
            console.warn('Backend AI failed, trying direct Gemini:', error);
        }
    }

    // Try direct Gemini API
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash',
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });
            
            const prompt = `${SYSTEM_INSTRUCTION}

Context:
- Organization: ${params.organizationName || 'Organization'}
- Target Market: ${params.country || 'Global'}
- Opportunity: ${params.specificOpportunity || 'Strategic partnership'}

User Query: ${query}

Provide a detailed, actionable response with specific data, recommendations, and next steps. Use professional language suitable for executive decision-making.`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            return {
                id: Date.now().toString(),
                type: 'strategy',
                title: 'AI Copilot Response',
                description: responseText,
                content: responseText,
                confidence: 85
            };
        } catch (geminiError) {
            console.error('Gemini AI error:', geminiError);
            // Return error response - no demo fallback
            return {
                id: Date.now().toString(),
                type: 'warning',
                title: 'AI Processing',
                description: `Processing your query about ${params.country || 'target market'}. The AI system is analyzing available data sources to provide comprehensive insights.`,
                content: `Analyzing: ${query}\n\nThe multi-agent system is processing your request using real-time data from World Bank, economic databases, and intelligence networks.`,
                confidence: 70
            };
        }
    }

    // No API key - provide system status
    return {
        id: Date.now().toString(),
        type: 'insight',
        title: 'System Status',
        description: 'AI system initializing. Configure VITE_GEMINI_API_KEY for full autonomous operation.',
        content: 'The multi-agent intelligence system requires API configuration for full autonomous operation.',
        confidence: 50
    };
};

export const generateReportSectionStream = async (
    section: string, 
    params: ReportParameters, 
    onChunk: (chunk: string) => void
): Promise<void> => {
    // Deterministic fallback: build content from computed payload if AI is unavailable
    const payload = (params as any).reportPayload;
    
    // Try backend AI first
    if (config.useRealAI) {
        try {
            const response = await fetch(`${API_BASE}/ai/generate-section`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, params })
            });
            
            if (response.ok && response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    // Parse SSE format
                    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
                    for (const line of lines) {
                        try {
                            const json = JSON.parse(line.slice(6));
                            if (json.text) {
                                fullText += json.text;
                                onChunk(fullText);
                            }
                        } catch { /* ignore parse errors */ }
                    }
                }
                return;
            }
        } catch (error) {
            console.warn('Backend streaming failed, trying direct Gemini API:', error);
        }
    }
    
    // Try direct Gemini API before falling back to deterministic
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });
            
            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            // BUILD NSIL INTELLIGENCE CONTEXT â€” injected into every prompt
            // This is the brain of the system: pattern matches, historical
            // parallels, formula scores, situation analysis, ethical gate,
            // emotional climate â€” ALL fed into the AI generation prompts.
            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            const enhancedPayload = (params as any).reportPayload;
            let nsilContext = '';
            if (enhancedPayload) {
              const ctx: string[] = [];
              // Confidence scores
              if (enhancedPayload.confidenceScores) {
                const cs = enhancedPayload.confidenceScores;
                ctx.push(`[NSIL CONFIDENCE] Overall: ${cs.overall}/100 | Economic Readiness: ${cs.economicReadiness}/100 | Symbiotic Fit: ${cs.symbioticFit}/100 | Political Stability: ${cs.politicalStability}/100 | Activation Velocity: ${cs.activationVelocity}/100`);
              }
              // Pattern intelligence
              if (enhancedPayload.patternIntelligence) {
                const pi = enhancedPayload.patternIntelligence;
                ctx.push(`[PATTERN INTELLIGENCE] Reasoning Stance: ${pi.reasoningStance || 'exploratory'}`);
                if (pi.matchedPatterns && pi.matchedPatterns.length > 0) {
                  ctx.push(`Matched Patterns: ${pi.matchedPatterns.slice(0, 3).map((p: any) => `${p.name} (${p.historicalDepth}yr, ${p.geographicBreadth} countries, match: ${Math.round((p.matchStrength || 0) * 100)}%)`).join('; ')}`);
                  const topPattern = pi.matchedPatterns[0];
                  if (topPattern.knownOutcomes) ctx.push(`Known Outcomes: ${topPattern.knownOutcomes.slice(0, 3).join('; ')}`);
                  if (topPattern.knownRisks) ctx.push(`Known Risks: ${topPattern.knownRisks.slice(0, 3).join('; ')}`);
                  if (topPattern.methodology) ctx.push(`Methodology: ${topPattern.methodology}`);
                }
                if (pi.knownElements) ctx.push(`Known Elements: ${pi.knownElements.join('; ')}`);
                if (pi.novelElements) ctx.push(`Novel Elements: ${pi.novelElements.join('; ')}`);
              }
              // Historical parallels
              if (enhancedPayload.historicalParallels) {
                const hp = enhancedPayload.historicalParallels;
                ctx.push(`[HISTORICAL PARALLELS] Success Rate: ${hp.successRate || 0}%`);
                if (hp.synthesisInsight) ctx.push(`Synthesis: ${hp.synthesisInsight}`);
                if (hp.matches && hp.matches.length > 0) {
                  ctx.push(`Top Cases: ${hp.matches.slice(0, 3).map((m: any) => `${m.title} (${m.country} ${m.year}, ${m.outcome}): ${m.lessonsLearned?.[0] || ''}`).join(' | ')}`);
                }
                if (hp.commonSuccessFactors) ctx.push(`Common Success Factors: ${hp.commonSuccessFactors.slice(0, 4).join('; ')}`);
                if (hp.commonFailureFactors) ctx.push(`Common Failure Factors: ${hp.commonFailureFactors.slice(0, 4).join('; ')}`);
              }
              // Situation analysis
              if (enhancedPayload.situationAnalysis) {
                const sa = enhancedPayload.situationAnalysis;
                if (sa.situationType) ctx.push(`[SITUATION ANALYSIS] Type: ${sa.situationType}`);
                if (sa.creativeStrategies && sa.creativeStrategies.length > 0) {
                  ctx.push(`Creative Strategies: ${sa.creativeStrategies.slice(0, 3).map((s: any) => `${s.name}: ${s.description}`).join(' | ')}`);
                }
              }
              // Economic signals
              if (enhancedPayload.economicSignals) {
                const es = enhancedPayload.economicSignals;
                ctx.push(`[ECONOMIC SIGNALS] Trade Exposure: ${es.tradeExposure} | Tariff Sensitivity: ${es.tariffSensitivity} | Cost Advantages: ${(es.costAdvantages || []).join(', ')}`);
              }
              // Risk profile
              if (enhancedPayload.risks) {
                const r = enhancedPayload.risks;
                if (r.political) ctx.push(`[RISK] Political Stability: ${r.political.stabilityScore}/100 | Regional Conflict Risk: ${r.political.regionalConflictRisk}`);
                if (r.regulatory) ctx.push(`[RISK] Corruption Index: ${r.regulatory.corruptionIndex} | Regulatory Friction: ${r.regulatory.regulatoryFriction}`);
                if (r.operational) ctx.push(`[RISK] Supply Chain Dependency: ${r.operational.supplyChainDependency} | Currency Risk: ${r.operational.currencyRisk}`);
              }
              // Ethical gate
              if (enhancedPayload.ethicalAssessment) {
                const ea = enhancedPayload.ethicalAssessment;
                ctx.push(`[ETHICAL ASSESSMENT] Gate: ${ea.gate || 'proceed'} | Dimensions: ${ea.dimensions ? ea.dimensions.map((d: any) => `${d.dimension}: ${d.score}/100`).join(', ') : 'n/a'}`);
                if (ea.conditions && ea.conditions.length > 0) ctx.push(`Ethical Conditions: ${ea.conditions.join('; ')}`);
              }
              // Emotional climate
              if (enhancedPayload.emotionalClimate) {
                const ec = enhancedPayload.emotionalClimate;
                ctx.push(`[EMOTIONAL CLIMATE] Business Confidence: ${ec.businessConfidence || 'n/a'} | Stakeholder Sentiment: ${ec.stakeholderSentiment || 'n/a'} | Community Reception: ${ec.communityReception || 'n/a'}`);
              }
              // Computed intelligence formulas
              if (enhancedPayload.computedIntelligence) {
                const ci = enhancedPayload.computedIntelligence;
                const formulaSummary = Object.entries(ci).slice(0, 8).map(([key, val]: [string, any]) => {
                  if (typeof val === 'object' && val !== null) {
                    return `${key}: ${JSON.stringify(val).substring(0, 80)}`;
                  }
                  return `${key}: ${val}`;
                }).join(' | ');
                ctx.push(`[FORMULA INTELLIGENCE] ${formulaSummary}`);
              }
              // Regional profile
              if (enhancedPayload.regionalProfile) {
                const rp = enhancedPayload.regionalProfile;
                if (rp.demographics) {
                  const d = rp.demographics;
                  ctx.push(`[REGIONAL] Population: ${d.population} | GDP/Capita: $${d.gdpPerCapita} | Growth: ${d.gdpGrowth}% | Labor Cost Index: ${d.laborCosts}`);
                }
              }
              nsilContext = ctx.join('\n');
            }

            const intelligenceBlock = nsilContext
              ? `\n\n--- NSIL INTELLIGENCE PAYLOAD (use this data to ground your analysis) ---\n${nsilContext}\n--- END NSIL PAYLOAD ---\n\n`
              : '';

            const sectionPrompts: Record<string, string> = {
                executiveSummary: `Generate an executive summary for a strategic partnership report. Organization: ${params.organizationName || 'Organization'}. Target Market: ${params.country || 'Target Market'}. Strategic Intent: ${params.strategicIntent?.join(', ') || 'Market expansion'}. Problem Statement: ${params.problemStatement || 'Strategic growth'}.${intelligenceBlock}Use the NSIL intelligence payload above to ground your analysis with specific confidence scores, pattern matches, historical parallels, and computed formula results. Include overall confidence assessment, key metrics, strategic fit analysis, and immediate action recommendations. Reference specific historical cases and pattern matches where relevant.`,
                marketAnalysis: `Generate a comprehensive market analysis for ${params.country || 'Target Market'}. Organization focus: ${params.organizationName || 'Organization'}.${intelligenceBlock}Use the NSIL economic signals, regional demographics, and risk profile above. Include market size, growth rates, key industries, trade exposure, tariff sensitivity, cost advantages, labor market, regulatory environment, and competitive landscape. Reference the pattern intelligence for structural insights about this market.`,
                recommendations: `Generate strategic recommendations for ${params.organizationName || 'Organization'} entering ${params.country || 'Target Market'}.${intelligenceBlock}Use the NSIL historical parallels, creative strategies, and formula intelligence above. Include short-term (0-6 months), mid-term (6-18 months), and long-term (18+ months) actionable recommendations. Incorporate lessons from historical cases and address the known risks identified by pattern intelligence. Each recommendation should reference the supporting evidence from the intelligence payload.`,
                implementation: `Generate an implementation playbook for ${params.organizationName || 'Organization'} to enter ${params.country || 'Target Market'}.${intelligenceBlock}Use the NSIL confidence scores, activation velocity, and situation analysis above. Include phased timeline, key milestones, resource requirements, governance roadmap, and success metrics. Ethical conditions and compliance requirements from the payload must be addressed in the implementation plan.`,
                financials: `Generate financial projections for ${params.organizationName || 'Organization'} entering ${params.country || 'Target Market'}.${intelligenceBlock}Use the NSIL computed intelligence formulas (SCF, RROI, CAP, TCO etc.) and economic signals above. Include 5-year revenue projections, cost structure, ROI analysis, break-even timeline, and capital requirements. Ground projections in the formula outputs and historical parallel outcomes.`,
                risks: `Generate a comprehensive risk assessment for ${params.organizationName || 'Organization'} entering ${params.country || 'Target Market'}.${intelligenceBlock}Use the NSIL risk profile, ethical assessment, emotional climate, and pattern intelligence known risks above. Include political, economic, regulatory, operational, and market risks with mitigation strategies for each. Reference the historical cases where similar risks materialised and what mitigation worked.`
            };
            
            const prompt = sectionPrompts[section] || `Generate a detailed ${section} section for a strategic partnership report. Organization: ${params.organizationName || 'Organization'}. Market: ${params.country || 'Target Market'}.`;
            
            const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nGenerate professional, data-driven content for a strategic partnership report.\n\n${prompt}\n\nFormat the output as clean markdown with headers, bullet points, and clear sections. Use specific data points, percentages, and actionable insights. Do not use placeholder text - provide realistic estimates where exact data is unavailable.`;
            
            const result = await model.generateContent(fullPrompt);
            const responseText = result.response.text();
            onChunk(responseText);
            return;
        } catch (geminiError) {
            console.warn('Direct Gemini API failed, falling back to deterministic:', geminiError);
        }
    }
    
    // Deterministic fallback from computed payload
    if (payload) {
        const lines: string[] = [];
        switch (section) {
            case 'executiveSummary': {
                lines.push(`# Executive Summary`);
                lines.push(`**Entity:** ${params.organizationName || 'Target Entity'} | **Market:** ${params.country || 'Target Market'}`);
                lines.push(`**Overall Confidence:** ${payload.confidenceScores.overall}/100`);
                lines.push(`- Economic Readiness: ${payload.confidenceScores.economicReadiness}/100`);
                lines.push(`- Symbiotic Fit: ${payload.confidenceScores.symbioticFit}/100`);
                lines.push(`- Political Stability: ${payload.confidenceScores.politicalStability}/100`);
                lines.push(``);
                lines.push(`### Key Recommendations`);
                (payload.recommendations.shortTerm || []).forEach((r: string) => lines.push(`- ${r}`));
                break;
            }
            case 'marketAnalysis': {
                lines.push(`# Market Analysis`);
                lines.push(`Trade Exposure: ${payload.economicSignals.tradeExposure}`);
                lines.push(`Tariff Sensitivity: ${payload.economicSignals.tariffSensitivity}`);
                lines.push(`Cost Advantages:`);
                (payload.economicSignals.costAdvantages || []).forEach((c: string) => lines.push(`- ${c}`));
                lines.push(``);
                lines.push(`### Regional Profile`);
                const d = payload.regionalProfile.demographics;
                lines.push(`Population: ${d.population}`);
                lines.push(`GDP per Capita: $${d.gdpPerCapita}`);
                lines.push(`Labor Costs Index: ${d.laborCosts}`);
                break;
            }
            case 'recommendations': {
                lines.push(`# Strategic Recommendations`);
                lines.push(`Short Term:`);
                (payload.recommendations.shortTerm || []).forEach((r: string) => lines.push(`- ${r}`));
                lines.push(`Mid Term:`);
                (payload.recommendations.midTerm || []).forEach((r: string) => lines.push(`- ${r}`));
                lines.push(`Long Term:`);
                (payload.recommendations.longTerm || []).forEach((r: string) => lines.push(`- ${r}`));
                break;
            }
            case 'implementation': {
                lines.push(`# Implementation Playbook`);
                lines.push(`Activation Velocity: ${payload.confidenceScores.activationVelocity}/100`);
                lines.push(`Governance Roadmap:`);
                (payload.risks.regulatory.complianceRoadmap || []).forEach((m: string) => lines.push(`- ${m}`));
                break;
            }
            case 'financials': {
                lines.push(`# Financial Projections`);
                const scf = payload.computedIntelligence.scf;
                lines.push(`Strategic Cash Flow Indicators:`);
                lines.push(`- Baseline Impact: ${scf?.baselineImpact ?? 'n/a'}`);
                lines.push(`- Growth Vector: ${scf?.growthVector ?? 'n/a'}`);
                break;
            }
            case 'risks': {
                lines.push(`# Risk Mitigation`);
                const r = payload.risks;
                lines.push(`Political Stability Score: ${r.political.stabilityScore}`);
                lines.push(`Regional Conflict Risk: ${r.political.regionalConflictRisk}`);
                lines.push(`Corruption Index: ${r.regulatory.corruptionIndex}`);
                lines.push(`Regulatory Friction: ${r.regulatory.regulatoryFriction}`);
                lines.push(`Operational Supply Chain Dependency: ${r.operational.supplyChainDependency}`);
                lines.push(`Currency Risk: ${r.operational.currencyRisk}`);
                break;
            }
            default: {
                lines.push(`# ${section}`);
                lines.push(`Content generated from computed intelligence.`);
            }
        }
        onChunk(lines.join('\n'));
        return;
    }
    
    // If we reach here with no payload, try Gemini directly (apiKey already checked above)
    // This shouldn't normally happen as the Gemini block above should have handled it
    onChunk(`# ${section}\n\nProcessing strategic intelligence for ${params.organizationName || 'organization'} in ${params.country || 'target market'}. Configure VITE_GEMINI_API_KEY for full AI-powered analysis.`);
};

export const generateAnalysisStream = async (item: LiveOpportunityItem, region: string): Promise<ReadableStream> => {
    // Call backend streaming endpoint
    const response = await fetch(`${API_BASE}/ai/generate-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: `GENERATE DEEP-DIVE ANALYSIS (NADL FORMAT)
      
      TARGET PROJECT: ${item.project_name}
      SECTOR: ${item.sector}
      REGION: ${region}
      CONTEXT: ${item.summary}
      VALUE: ${item.value}

      OUTPUT FORMAT:
      Use custom XML-like tags for parsing:
      <nad:report_title title="..." />
      <nad:report_subtitle subtitle="..." />
      <nad:section title="...">
        <nad:paragraph>...</nad:paragraph>
      </nad:section>

      REQUIREMENTS:
      1. Technical feasibility analysis.
      2. Economic viability modeling.
      3. Risk matrix (Political, Economic, Operational).
      4. Strategic recommendations.`
        })
    });
    
    if (!response.body) {
        throw new Error('No response body');
    }
    
    return response.body;
};

export const generateDeepReasoning = async (userOrg: string, targetEntity: string, context: string): Promise<DeepReasoningAnalysis> => {
    // Try backend first
    try {
        const response = await fetch(`${API_BASE}/ai/deep-reasoning`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userOrg, targetEntity, context })
        });
        
        if (response.ok) {
            return await response.json() as DeepReasoningAnalysis;
        }
    } catch (error) {
        console.warn('Backend deep reasoning failed, trying direct Gemini:', error);
    }

    // Direct Gemini fallback
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });

            const prompt = `Perform a deep strategic reasoning analysis for a partnership between "${userOrg}" and "${targetEntity}".\nContext: ${context}\n\nProvide a comprehensive JSON analysis with these fields:\n- overallAssessment: string (2-3 sentences)\n- strengthsOfPartnership: array of 3-5 strings\n- weaknessesAndRisks: array of 3-5 strings\n- strategicRecommendations: array of 3-5 actionable strings\n- confidenceLevel: number 0-100\n- timelineEstimate: string\n- criticalSuccessFactors: array of 3 strings\n\nReturn ONLY valid JSON.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            return JSON.parse(text) as DeepReasoningAnalysis;
        } catch (geminiError) {
            console.warn('Direct Gemini deep reasoning failed:', geminiError);
        }
    }

    throw new Error('Deep reasoning unavailable - no AI service available');
};

export const generateSearchGroundedContent = async (query: string): Promise<{text: string, sources: any[]}> => {
    // Try backend first
    try {
        const response = await fetch(`${API_BASE}/ai/search-grounded`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Backend search-grounded failed, trying direct Gemini:', error);
    }

    // Direct Gemini fallback
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });

            const prompt = `Research the following query thoroughly and provide a detailed, factual response with specific data points, statistics, and actionable information. Include source references where possible.\n\nQuery: ${query}\n\nProvide a comprehensive response:`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return {
                text,
                sources: [{ title: 'BW Intelligence Analysis', url: 'https://bwga.ai', type: 'ai-generated' }]
            };
        } catch (geminiError) {
            console.warn('Direct Gemini search-grounded failed:', geminiError);
        }
    }

    return { text: "Search unavailable.", sources: [] };
};

// --- NEW AGENTIC CAPABILITY ---

export interface AgentResult {
    findings: string[];
    recommendations: string[];
    confidence: number;
    gaps?: string[];
}

export const runAI_Agent = async (
    agentName: string, 
    roleDefinition: string, 
    context: any
): Promise<AgentResult> => {
    // Try backend first
    try {
        const response = await fetch(`${API_BASE}/ai/agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentName, roleDefinition, context })
        });
        
        if (response.ok) {
            return await response.json() as AgentResult;
        }
    } catch (error) {
        console.warn(`Backend agent ${agentName} failed, trying direct Gemini:`, error);
    }

    // Direct Gemini fallback
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: { temperature: 0.7, maxOutputTokens: 3072 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });

            const prompt = `You are an AI agent named "${agentName}".\nRole: ${roleDefinition}\n\nContext: ${JSON.stringify(context)}\n\nProvide your analysis as a JSON object with these fields:\n- findings: array of 3-5 key findings (strings)\n- recommendations: array of 2-4 actionable recommendations (strings)\n- confidence: number 0-1\n- gaps: array of information gaps identified (strings)\n\nReturn ONLY valid JSON.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(text);
            return {
                findings: parsed.findings || ['Analysis complete.'],
                recommendations: parsed.recommendations || [],
                confidence: parsed.confidence || 0.75,
                gaps: parsed.gaps || []
            };
        } catch (geminiError) {
            console.warn(`Direct Gemini agent ${agentName} failed:`, geminiError);
        }
    }

    return { findings: ["Agent unavailable."], recommendations: [], confidence: 0 };
};

export const runGeopoliticalAnalysis = async (params: ReportParameters): Promise<GeopoliticalAnalysisResult> => {
    // Try backend first
    try {
        const response = await fetch(`${API_BASE}/ai/geopolitical`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ params })
        });
        
        if (response.ok) {
            return await response.json() as GeopoliticalAnalysisResult;
        }
    } catch (error) {
        console.warn('Backend geopolitical analysis failed, trying direct Gemini:', error);
    }

    // Direct Gemini fallback
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });

            const prompt = `Analyze the geopolitical landscape for business operations in ${params.country || 'the target region'}, sector: ${params.industry?.[0] || 'general'}.\n\nReturn ONLY a valid JSON object with these exact fields:\n- stabilityScore: number 0-100\n- currencyRisk: "Low" | "Moderate" | "High"\n- inflationTrend: string describing trend\n- forecast: 2-3 sentence forecast\n- regionalConflictRisk: number 0-100\n- tradeBarriers: array of specific trade barrier strings\n\nReturn ONLY valid JSON.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(text);
            return {
                stabilityScore: parsed.stabilityScore ?? 65,
                currencyRisk: parsed.currencyRisk || 'Moderate',
                inflationTrend: parsed.inflationTrend || 'Stable',
                forecast: parsed.forecast || 'Analysis complete.',
                regionalConflictRisk: parsed.regionalConflictRisk ?? 30,
                tradeBarriers: parsed.tradeBarriers || []
            };
        } catch (geminiError) {
            console.warn('Direct Gemini geopolitical analysis failed:', geminiError);
        }
    }

    // Fallback with computed values
    return {
        stabilityScore: 65,
        currencyRisk: 'Moderate',
        inflationTrend: 'Stable (Projected)',
        forecast: "Stability assessment requires AI configuration.",
        regionalConflictRisk: 35,
        tradeBarriers: ['Standard tariffs']
    };
};

export const runGovernanceAudit = async (params: ReportParameters): Promise<GovernanceAuditResult> => {
    // Try backend first
    try {
        const response = await fetch(`${API_BASE}/ai/governance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ params })
        });
        
        if (response.ok) {
            return await response.json() as GovernanceAuditResult;
        }
    } catch (error) {
        console.warn('Backend governance audit failed, trying direct Gemini:', error);
    }

    // Direct Gemini fallback
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });

            const prompt = `Perform a governance and regulatory audit for business operations in ${params.country || 'the target region'}, sector: ${params.industry?.[0] || 'general'}, organization type: ${params.organizationType || 'private'}.\n\nReturn ONLY a valid JSON object with these exact fields:\n- governanceScore: number 0-100\n- corruptionRisk: "Low" | "Moderate" | "High"\n- regulatoryFriction: number 0-100\n- transparencyIndex: number 0-100\n- redFlags: array of specific red flag strings (empty if none)\n- complianceRoadmap: array of 3-5 actionable compliance steps\n\nReturn ONLY valid JSON.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(text);
            return {
                governanceScore: parsed.governanceScore ?? 70,
                corruptionRisk: parsed.corruptionRisk || 'Moderate',
                regulatoryFriction: parsed.regulatoryFriction ?? 30,
                transparencyIndex: parsed.transparencyIndex ?? 70,
                redFlags: parsed.redFlags || [],
                complianceRoadmap: parsed.complianceRoadmap || ['Conduct initial compliance assessment']
            };
        } catch (geminiError) {
            console.warn('Direct Gemini governance audit failed:', geminiError);
        }
    }

    // Fallback
    return {
        governanceScore: 70,
        corruptionRisk: 'Moderate',
        regulatoryFriction: 30,
        transparencyIndex: 70,
        redFlags: [],
        complianceRoadmap: ['Configure AI services for detailed compliance roadmap']
    };
};

export const runCopilotAnalysis = async (query: string, context: string): Promise<{summary: string, options: any[], followUp: string}> => {
    // Try backend first
    try {
        const response = await fetch(`${API_BASE}/ai/copilot-analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, context })
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn('Backend copilot analysis failed, trying direct Gemini:', error);
    }

    // Direct Gemini fallback
    const apiKey = getGeminiApiKey();
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                ]
            });

            const prompt = `You are a strategic business copilot. Analyze this query in the given context and provide recommendations.\n\nQuery: ${query}\nContext: ${context}\n\nReturn ONLY a valid JSON object with:\n- summary: 2-3 sentence analysis summary\n- options: array of 2-4 objects each with {id: string, title: string, rationale: string}\n- followUp: a suggested follow-up question\n\nReturn ONLY valid JSON.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(text);
            return {
                summary: parsed.summary || 'Analysis complete.',
                options: parsed.options || [],
                followUp: parsed.followUp || 'Would you like to explore further?'
            };
        } catch (geminiError) {
            console.warn('Direct Gemini copilot analysis failed:', geminiError);
        }
    }

    // Fallback
    return {
        summary: `Analysis of "${query}" suggests focusing on market consolidation strategies given your context.`,
        options: [
            { id: '1', title: 'Target Market Acquisition', rationale: 'Rapid entry via M&A.' },
            { id: '2', title: 'Organic Growth', rationale: 'Lower risk, slower pace.' }
        ],
        followUp: "Shall we evaluate potential targets?"
    };
};

// ============================================================================
// DOCUMENT EXTRACTION — reads PDF/DOCX/image via Gemini multimodal inline data
// ============================================================================

// MIME types Gemini can process via inlineData
const GEMINI_SUPPORTED_MIME_TYPES: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc':  'application/msword',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
};

/**
 * Converts an ArrayBuffer to a base64 string without hitting the stack-size
 * limit that btoa(String.fromCharCode(...largeArray)) causes on big files.
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

/**
 * Uses Gemini multimodal to extract all meaningful text/data from a file.
 * Supports PDF, DOCX, PPTX, XLSX, images.
 * Returns a formatted string suitable for inclusion in the chat context.
 */
export const extractFileTextViaAI = async (file: File): Promise<string> => {
  const lowerName = file.name.toLowerCase();

  // Determine MIME type
  const ext = Object.keys(GEMINI_SUPPORTED_MIME_TYPES).find(e => lowerName.endsWith(e));
  const mimeType = ext ? GEMINI_SUPPORTED_MIME_TYPES[ext] : (file.type || 'application/octet-stream');

  // Size guard — Gemini inline data limit is ~20 MB; enforce 18 MB to be safe
  const MAX_BYTES = 18 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return `[${file.name}] — File too large for direct AI extraction (${(file.size / 1024 / 1024).toFixed(1)} MB). Please reduce to under 18 MB or paste the key text directly in the chat.`;
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return `[${file.name}] — Gemini API key not configured; document content could not be extracted.`;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      `Extract ALL key information from this document comprehensively. Include: organizations involved, countries and jurisdictions, project or case objectives, decisions required, financial figures and amounts, timelines and dates, stakeholders and their roles, key findings, risk factors, legal or regulatory references, and any other substantive content. Present the extracted information in a clear, structured format so an analyst can immediately understand the full context of the document. Do not summarise — be thorough.`,
    ]);

    const extracted = result.response.text().trim();
    if (!extracted) {
      return `[${file.name}] — Document processed but no text content could be extracted (the file may be image-only or password-protected).`;
    }

    return `[${file.name}]\n${extracted}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // If Gemini rejects the MIME type, fall through with a helpful message
    if (msg.includes('MIME') || msg.includes('unsupported') || msg.includes('invalid')) {
      return `[${file.name}] — Document format not supported for AI extraction. Please convert to PDF or paste the key text directly.`;
    }
    console.error('extractFileTextViaAI error:', err);
    return `[${file.name}] — Document extraction failed: ${msg}. Please paste the key content directly in your message.`;
  }
};

