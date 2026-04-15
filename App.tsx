import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { 
  ReportParameters, 
  CopilotInsight, 
  ReportData, 
  ReportSection,
  GenerationPhase,
  ReportPayload
} from './types';
import { INITIAL_PARAMETERS } from './constants';
import ErrorBoundary from './components/ErrorBoundary';

// Wraps lazy() so a failed chunk fetch auto-reloads the page (picks up new
// index.html + chunk hashes after a redeploy. sessionStorage guard
// prevents an infinite reload loop if the chunk is genuinely missing.
const CHUNK_RELOAD_KEY = 'bw_chunk_reload_at';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyWithReload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(() =>
    factory().catch(() => {
      const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
      if (Date.now() - last > 15_000) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
        window.location.reload();
      }
      return new Promise<{ default: T }>(() => {});
    })
  );
}

const NSILWorkspace = lazyWithReload(() => import('./components/NSILWorkspace'));
const UserManual = lazyWithReload(() => import('./components/UserManual'));
const CommandCenter = lazyWithReload(() => import('./components/CommandCenter'));
const BWConsultantOS = lazyWithReload(() => import('./components/BWConsultantOS'));
const GlobalLocationIntelligence = lazyWithReload(() => import('./components/GlobalLocationIntelligence'));
const AdminDashboard = lazyWithReload(() => import('./components/AdminDashboard'));
const Gateway = lazyWithReload(() => import('./components/Gateway').then(module => ({ default: module.Gateway })));
const MatchmakingEngine = lazyWithReload(() => import('./components/MatchmakingEngine'));
const DocumentGenerationSuite = lazyWithReload(() => import('./components/DocumentGenerationSuite'));
const AdvancedReportGenerator = lazyWithReload(() => import('./components/AdvancedReportGenerator'));
const ExecutiveSummaryGenerator = lazyWithReload(() => import('./components/ExecutiveSummaryGenerator'));
const LettersCatalogModal = lazyWithReload(() => import('./components/LettersCatalogModal'));
import useEscapeKey from './hooks/useEscapeKey';
import type { AgenticRun } from './services/agenticWorker';
import type { ConsultantInsight } from './services/BWConsultantAgenticAI';
// EventBus for ecosystem connectivity
import { EventBus, type EcosystemPulse } from './services/EventBus';
// Location intelligence types
import { type CityProfile } from './data/globalLocationProfiles';
import { type LocationResult } from './services/geminiLocationService';

// --- TYPES & INITIAL STATE ---
const initialSection: ReportSection = { id: '', title: '', content: '', status: 'pending' };

const initialReportData: ReportData = {
  executiveSummary: { ...initialSection, id: 'exec', title: 'Executive Summary' },
  marketAnalysis: { ...initialSection, id: 'market', title: 'Background & Market Dossier' },
  recommendations: { ...initialSection, id: 'rec', title: 'Strategic Analysis & Options' },
  implementation: { ...initialSection, id: 'imp', title: 'Engagement & Execution Playbook' },
  financials: { ...initialSection, id: 'fin', title: 'Financial Projections' },
  risks: { ...initialSection, id: 'risk', title: 'Risk Mitigation Strategy' },
};

type ViewMode = 'main' | 'user-manual' | 'command-center' | 'consultant-os' | 'report-generator' | 'global-location-intel' | 'admin' | 'intake' | 'matchmaking' | 'documents' | 'advanced-report' | 'exec-summary' | 'letters';

const App: React.FC = () => {
    // --- STATE ---
    const [params, setParams] = useState<ReportParameters>(INITIAL_PARAMETERS);
    const [viewMode, setViewMode] = useState<ViewMode>('command-center');
    const [savedReports, setSavedReports] = useState<ReportParameters[]>([]);
    const [pendingLocationData, setPendingLocationData] = useState<{
        profile: CityProfile;
        research: LocationResult;
        city: string;
        country: string;
    } | null>(null);

    useEffect(() => {
        const loadReports = async () => {
            try {
                const { ReportsService } = await import('./services/ReportsService');
                const reports = await ReportsService.list();
                setSavedReports(reports);
            } catch (error) {
                console.error('Failed to load reports from API', error);
            }
        };
        loadReports();
    }, []);

    // Bootstrap autonomous runtime services once on mount
    useEffect(() => {
        void (async () => {
            const { initAutonomousRuntime } = await import('./services/autonomousRuntime');
            initAutonomousRuntime();
        })();
    }, []);

    // Generation State
    const [insights, setInsights] = useState<CopilotInsight[]>([]);
    const [reportData, setReportData] = useState<ReportData>(initialReportData);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [genPhase, setGenPhase] = useState<GenerationPhase>('idle');
    const [genProgress, setGenProgress] = useState(0);

    // AUTONOMOUS CAPABILITIES STATE
    const [autonomousMode] = useState(true); // DEFAULT ON
    const [autonomousInsights, setAutonomousInsights] = useState<CopilotInsight[]>([]);
    const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    const [isAutonomousThinking, setIsAutonomousThinking] = useState(false);
    const [autonomousSuggestions, setAutonomousSuggestions] = useState<string[]>([]);
    // FULLY AUTONOMOUS SYSTEM STATE
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isFullyAutonomous, setIsFullyAutonomous] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const [autonomousSystemStatus, setAutonomousSystemStatus] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selfImprovementSuggestions, setSelfImprovementSuggestions] = useState<string[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const [activeSubAgents, setActiveSubAgents] = useState<any[]>([]);
    // ADVERSIQ CONSULTANT AI STATE
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [consultantInsights, setConsultantInsights] = useState<ConsultantInsight[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isConsultantActive, setIsConsultantActive] = useState(true);
    const [pendingConsultantQuery, setPendingConsultantQuery] = useState<string | null>(null);
    const [pendingConsultantContext, setPendingConsultantContext] = useState<{
        city: string; country: string; summary: string;
        profile: Record<string, unknown>; research: object | null;
    } | null>(null);
    // ECOSYSTEM STATE (from EventBus "meadow" signals)
    const [, setEcosystemPulse] = useState<EcosystemPulse | null>(null);

    // Self-learning report timing
    const reportStartTimeRef = useRef<number>(0);

    // COMBINED INSIGHTS - Merge regular and autonomous insights
    const combinedInsights = useMemo(() => {
        return [...insights, ...autonomousInsights];
    }, [insights, autonomousInsights]);

    // --- EventBus subscriptions (bee  flower  meadow) ---
    useEffect(() => {
        // Subscribe to insights from anywhere in the system
        const unsubInsights = EventBus.subscribe('insightsGenerated', (event) => {
            // Merge ecosystem insights with existing
            setAutonomousInsights(prev => {
                const ids = new Set(prev.map(i => i.id));
                const newOnes = event.insights.filter(i => !ids.has(i.id));
                return [...prev, ...newOnes];
            });
        });

        // Subscribe to suggestions from anywhere in the system
        const unsubSuggestions = EventBus.subscribe('suggestionsReady', (event) => {
            setAutonomousSuggestions(event.actions);
        });

        // Subscribe to ecosystem pulse ("meadow" view)
        const unsubPulse = EventBus.subscribe('ecosystemPulse', (event) => {
            setEcosystemPulse(event.signals);
        });

        // Subscribe to learning updates (self-learning feedback)
        const unsubLearning = EventBus.subscribe('learningUpdate', (_event) => {
            // Could show a toast or update a learning status indicator
        });

        // Subscribe to fully autonomous system events
        const unsubFullyAutonomous = EventBus.subscribe('fullyAutonomousRunComplete', (event) => {
            setAutonomousSystemStatus(event);
            setSelfImprovementSuggestions(event.improvements || []);
            setActiveSubAgents(event.spawnedAgents || []);
        });

        const unsubImprovements = EventBus.subscribe('improvementsSuggested', (event) => {
            setSelfImprovementSuggestions(event.suggestions);
        });

        const unsubAgentSpawned = EventBus.subscribe('agentSpawned', (event) => {
            setActiveSubAgents(prev => [...prev, event.agent]);
        });

        // Subscribe to consultant AI events
        const unsubConsultantInsights = EventBus.subscribe('consultantInsightsGenerated', (event) => {
            setConsultantInsights(event.insights);
        });

        const unsubSearchResult = EventBus.subscribe('searchResultReady', (_event) => {
            // Note: Do NOT call bwConsultantAI.consult() here.
            // It triggers proactiveSearchForReport  triggerSearch  emit(searchResultReady)  consult  infinite loop.
            // Search results are already stored and available to the consultant when next consulted.
        });

        return () => {
            unsubInsights();
            unsubSuggestions();
            unsubPulse();
            unsubLearning();
            unsubFullyAutonomous();
            unsubImprovements();
            unsubAgentSpawned();
            unsubConsultantInsights();
            unsubSearchResult();
        };
    }, []); // FIXED: EventBus is a singleton; handler updates use functional state setters


    // --- EFFECTS ---
    // Copilot Auto-Gen - runs on key param changes with debounced trigger
    const copilotKey = useMemo(
        () => `${params.organizationName}|${params.country}|${viewMode}`,
        [params.organizationName, params.country, viewMode]
    );

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (viewMode !== 'report-generator') return;
            if (!params.organizationName || !params.country || params.organizationName.length <= 2) return;
            if (insights.length > 0) return;

            try {
                const [{ generateCopilotInsights }, { config }] = await Promise.all([
                    import('./services/geminiService'),
                    import('./services/config')
                ]);
                if (!config.useRealAI) {
                    return;
                }
                const newInsights = await generateCopilotInsights(params);
                setInsights(newInsights);
            } catch (error) {
                console.error('DEBUG: Error in copilot generation:', error);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [copilotKey, params, viewMode, insights.length]);

    // AUTONOMOUS CAPABILITIES EFFECTS

    // Agentic Worker — stable deps via key fields to avoid frequent re-runs
    const agenticKey = useMemo(
        () => `${params.organizationName}|${params.country}|${(Array.isArray(params.industry) ? params.industry.join(',') : params.industry)}`,
        [params.organizationName, params.country, params.industry]
    );

    useEffect(() => {
        if (!autonomousMode || !params.organizationName || params.organizationName.length <= 2) return;

        const timer = setTimeout(async () => {
            setIsAutonomousThinking(true);
            try {
                const { runSmartAgenticWorker } = await import('./services/agenticWorker');
                const agenticResult: AgenticRun = await runSmartAgenticWorker(params, { maxSimilarCases: 5 });
                setAutonomousInsights(agenticResult.insights);
                setAutonomousSuggestions(agenticResult.executiveBrief.nextActions);
            } catch (error) {
                console.error(' AGENTIC WORKER: Error running digital worker:', error);
                try {
                    const { solveAndAct: autonomousSolve } = await import('./services/autonomousClient');
                    const problem = `Analyze partnership and investment opportunities for ${params.organizationName} in ${params.country}`;
                    const context = {
                        region: params.country,
                        industry: params.industry,
                        dealSize: params.dealSize,
                        strategicIntent: params.strategicIntent
                    };
                    const result = await autonomousSolve(problem, context, params, { autoAct: false, urgency: 'normal' });
                    const fallbackInsights: CopilotInsight[] = result.solutions.map((solution: { action: string; reasoning: string; confidence?: number }, index: number) => ({
                        id: `autonomous-${Date.now()}-${index}`,
                        type: 'strategy' as const,
                        title: `Autonomous Discovery: ${solution.action}`,
                        description: solution.reasoning,
                        content: `Autonomous analysis suggests: ${solution.action}. Reasoning: ${solution.reasoning}`,
                        confidence: solution.confidence || 75,
                        isAutonomous: true
                    }));
                    setAutonomousInsights(fallbackInsights);
                    setAutonomousSuggestions(result.solutions.map((s: { action: string }) => s.action));
                } catch {
                    // Fallback failed silently
                }
            } finally {
                setIsAutonomousThinking(false);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [agenticKey, autonomousMode, params]);

    // ADVERSIQ Consultant AI - Proactive guidance and automatic search
    useEffect(() => {
        if (isConsultantActive && (params.organizationName || params.country || params.industry)) {
            const timer = setTimeout(async () => {
                try {
                    const [{ bwConsultantAI }, { automaticSearchService }] = await Promise.all([
                        import('./services/BWConsultantAgenticAI'),
                        import('./services/AutomaticSearchService')
                    ]);
                    const insights = await bwConsultantAI.consult(params, 'parameter_analysis');
                    setConsultantInsights(insights);

                    // Trigger automatic searches based on params
                    await automaticSearchService.proactiveSearchForReport(params);

                } catch (error) {
                    console.error(' ADVERSIQ Consultant: Error during analysis:', error);
                }
            }, 2000); // 2 second delay to avoid too frequent updates

            return () => clearTimeout(timer);
        }
    }, [params.organizationName, params.country, params.industry, params.region, isConsultantActive, params]);

    // Self-Learning Data Collection - Records performance after report generation
    useEffect(() => {
        if (genPhase === 'complete' && params.id) {
            void (async () => {
                try {
                    const { selfLearningEngine } = await import('./services/selfLearningEngine');
                    // Calculate performance metrics
                    const startTime = Date.now() - (genProgress * 1000); // Estimate based on progress
                    const generationTime = Date.now() - startTime;

                    selfLearningEngine.recordTest({
                        timestamp: new Date().toISOString(),
                        testId: params.id,
                        scenario: 'report_generation',
                        inputs: params,
                        outputs: {
                            spiScore: params.opportunityScore?.totalScore,
                            rroiScore: params.opportunityScore?.marketPotential,
                            reportQuality: 85, // Could be user-rated
                            generationTime: generationTime
                        },
                        feedback: {
                            successful: true,
                            errors: [],
                            warnings: [],
                            suggestions: autonomousSuggestions
                        },
                        improvements: ['Enhanced autonomous analysis', 'Improved insight generation']
                    });
                } catch (error) {
                    console.error(" SELF-LEARNING: Error recording data:", error);
                }
            })();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [genPhase, params.id, genProgress, autonomousSuggestions]);

    // Proactive Intelligence Monitoring — runs one-shot on key param changes with debounce
    useEffect(() => {
        if (!autonomousMode || !params.organizationName || params.organizationName.length <= 2) return;

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const { ReactiveIntelligenceEngine } = await import('./services/ReactiveIntelligenceEngine');
                const opportunities = await ReactiveIntelligenceEngine.thinkAndAct(
                    `Monitor for new opportunities related to ${params.organizationName} in ${params.country || 'target markets'}`,
                    params,
                    { autoAct: false, urgency: 'low' }
                );

                if (!cancelled && opportunities.actions.length > 0) {
                    const newSuggestions = opportunities.actions.map(action => action.action);
                    setAutonomousSuggestions(prev => [...new Set([...prev, ...newSuggestions])]);
                }
            } catch (error) {
                if (!cancelled) console.error(' PROACTIVE: Error in monitoring:', error);
            }
        }, 5000); // One-shot 5 second debounce after params change

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [autonomousMode, params]);

    // --- ACTIONS ---
    const handleEscape = useCallback(() => {
        if (viewMode !== 'report-generator') {
            setViewMode('report-generator');
        }
    }, [viewMode]);

    useEscapeKey(handleEscape);

    const startNewMission = () => {
        const newParams = { 
            ...INITIAL_PARAMETERS, 
            id: Math.random().toString(36).substr(2, 9), 
            createdAt: Date.now().toString(),
            // STRICT FRESH START with proper empty values for placeholders
            organizationName: '',
            userName: '',
            userDepartment: '',
            country: '',
            strategicIntent: [],
            problemStatement: '',
            industry: [],
            region: '',
            organizationType: '', // Reset type
            organizationSubType: ''
        };
        setParams(newParams);
        setReportData(initialReportData);
        setInsights([]);
        setAutonomousInsights([]); // Clear autonomous insights for new mission
        setAutonomousSuggestions([]); // Clear autonomous suggestions
        // UPDATED: Start directly in the Unified Control Matrix
        setViewMode('report-generator'); 
    };

    const loadReport = (report: ReportParameters) => {
        setParams(report);
        setReportData(initialReportData);
        setInsights([]);
        // Always load into Unified Control Matrix
        setViewMode('report-generator');
    };

    const deleteReport = async (id: string) => {
        setSavedReports(prev => prev.filter(r => r.id !== id));
        try {
            const { ReportsService } = await import('./services/ReportsService');
            await ReportsService.delete(id);
        } catch (error) {
            console.error('Failed to delete report via API', error);
        }
    };

    const handleGenerateReport = useCallback(async () => {
        const [
            { ConsultantGateService },
            { ReportOrchestrator },
            { DocumentIntegrityService },
            { generateReportSectionStream },
            { ReportsService }
        ] = await Promise.all([
            import('./services/ConsultantGateService'),
            import('./services/ReportOrchestrator'),
            import('./services/DocumentIntegrityService'),
            import('./services/geminiService'),
            import('./services/ReportsService')
        ]);

        const consultantGate = ConsultantGateService.evaluate(params);
        if (!consultantGate.isReady) {
            setReportData(prev => ({
                ...prev,
                executiveSummary: {
                    ...prev.executiveSummary,
                    content: `# Consultant Gate Blocked\n\nThe system requires complete consultant-grade intake before report generation.\n\n**Missing required inputs:**\n${consultantGate.missing.map((item) => `- ${item}`).join('\n')}\n\n**Current capture summary:**\n- Who: ${consultantGate.summary.who}\n- Where: ${consultantGate.summary.where}\n- Objective: ${consultantGate.summary.objective}\n- Audience: ${consultantGate.summary.audience}\n- Deadline: ${consultantGate.summary.deadline}`,
                    status: 'completed'
                }
            }));
            return;
        }

        reportStartTimeRef.current = Date.now();
        setIsGeneratingReport(true);
        setGenPhase('intake');
        setGenProgress(5);

        // Assemble complete ReportPayload using ReportOrchestrator
        const reportPayload = await ReportOrchestrator.assembleReportPayload(params);
        ReportOrchestrator.logPayload(reportPayload); // Debug logging

        // Validate payload completeness
        const validation = ReportOrchestrator.validatePayload(reportPayload);
        if (!validation.isComplete) {
            console.warn('DEBUG: Incomplete payload, missing fields:', validation.missingFields);
        }

        // 
        // ETHICAL GATE ENFORCEMENT  -  block or warn based on ethical assessment
        // 
        const extendedPayload = reportPayload as ReportPayload & { ethicalAssessment?: { gate?: string; conditions?: string[] }; patternIntelligence?: { matchedPatterns?: unknown[] } };
        const ethicalGate = extendedPayload.ethicalAssessment?.gate;
        if (ethicalGate === 'reject') {
            const ethicalReasons = extendedPayload.ethicalAssessment?.conditions || ['Ethical review failed'];
            console.error('ETHICAL GATE: Report generation BLOCKED', ethicalReasons);
            setReportData(prev => ({
                ...prev,
                executiveSummary: {
                    ...prev.executiveSummary,
                    content: `#  Report Generation Blocked  -  Ethical Review\n\nThe NSIL Ethical Reasoning Engine has determined that this engagement cannot proceed in its current form.\n\n**Reasons:**\n${ethicalReasons.map((r: string) => `- ${r}`).join('\n')}\n\n**What this means:** The system has identified fundamental ethical concerns that prevent responsible analysis. This is not a technical limitation  -  it is a governance safeguard.\n\n**Next Steps:**\n- Review and address the ethical concerns identified above\n- Consider restructuring the engagement parameters\n- Consult with compliance officers on the flagged issues\n\n*This gate is enforced by the Autonomous Ethical Reasoning Engine (7-dimension framework) and cannot be overridden.*`,
                    status: 'completed'
                }
            }));
            setGenPhase('complete');
            setGenProgress(100);
            setIsGeneratingReport(false);
            return;
        }
        if (ethicalGate === 'redesign' || ethicalGate === 'proceed-with-conditions') {
            const ethicalWarnings = extendedPayload.ethicalAssessment?.conditions || [];
            console.warn(`ETHICAL GATE: ${ethicalGate}`, ethicalWarnings);
            // Allow generation to proceed but include warning in executive summary
            setReportData(prev => ({
                ...prev,
                executiveSummary: {
                    ...prev.executiveSummary,
                    content: `>  **Ethical Advisory:** ${ethicalWarnings.slice(0, 3).join(' | ')}\n\n`
                }
            }));
        }

        // 
        // DOCUMENT INTEGRITY  -  wrap with provenance tracking
        // 
        const dataSources = ['NSIL Intelligence Hub', 'Pattern Confidence Engine', 'Historical Parallel Matcher',
                             'Situation Analysis Engine', 'Formula Suite (29 formulas)', 'Ethical Reasoning Engine'];
        if ((extendedPayload.patternIntelligence?.matchedPatterns?.length ?? 0) > 0) {
            dataSources.push('Methodology Knowledge Base');
        }
        const integrityConfidence = (reportPayload.confidenceScores?.overall || 50) >= 70 ? 'high' as const
            : (reportPayload.confidenceScores?.overall || 50) >= 45 ? 'medium' as const
            : (reportPayload.confidenceScores?.overall || 50) >= 20 ? 'low' as const
            : 'insufficient-data' as const;
        DocumentIntegrityService.generateIntegrityHeader({
            documentType: 'strategic-report',
            confidence: integrityConfidence,
            country: params.country,
            sector: (params.industry || [])[0],
        });

        setReportData(prev => ({
            ...prev,
            confidenceScores: reportPayload.confidenceScores,
            computedIntelligence: reportPayload.computedIntelligence
        }));

        // Extract scores for backward compatibility
        const spiResult = reportPayload.computedIntelligence.spi;
        const marketPotential = reportPayload.confidenceScores.economicReadiness;
        const riskFactors = 100 - reportPayload.confidenceScores.politicalStability;

        const updatedScore = {
            totalScore: spiResult.spi,
            marketPotential: marketPotential,
            riskFactors: riskFactors
        };

        const updatedParams = {
            ...params,
            opportunityScore: updatedScore,
            status: 'generating' as const
        };

        setParams(updatedParams);

        // Save to repository immediately
        setSavedReports(prev => {
            const existing = prev.findIndex(r => r.id === updatedParams.id);
            if (existing >= 0) return prev.map((r, i) => i === existing ? updatedParams : r);
            return [updatedParams, ...prev];
        });

        try {
            await ReportsService.upsert(updatedParams);
        } catch (error) {
            console.error('Failed to persist report (generating)', error);
        }

        // Sim Phases
        await new Promise(r => setTimeout(r, 2000));
        setGenPhase('orchestration'); setGenProgress(25);
        await new Promise(r => setTimeout(r, 3000));
        setGenPhase('modeling'); setGenProgress(50);
        await new Promise(r => setTimeout(r, 2000));
        setGenPhase('synthesis'); setGenProgress(75);

        // Generate Sections with computed intelligence
        const sectionsToGenerate = ['executiveSummary', 'marketAnalysis', 'recommendations', 'implementation', 'financials', 'risks'];
        for (const sectionKey of sectionsToGenerate) {
            setReportData(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey as keyof ReportData], status: 'generating' } }));

            // Generate content using both AI and computed data
            const enhancedParams = { ...updatedParams, reportPayload };
            await generateReportSectionStream(sectionKey, enhancedParams, (chunk) => {
                setReportData(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey as keyof ReportData], content: chunk } }));
            });

            setReportData(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey as keyof ReportData], status: 'completed' } }));
        }

        const completedReport = { ...updatedParams, status: 'complete' as const };
        const elapsedMs = Date.now() - reportStartTimeRef.current;
        console.info(`Report generation completed in ${elapsedMs}ms`);
        reportStartTimeRef.current = 0;

        setGenPhase('complete');
        setGenProgress(100);
        setIsGeneratingReport(false);
        setSavedReports(prev => prev.map(r => r.id === completedReport.id ? completedReport : r));

        try {
            await ReportsService.upsert(completedReport);
        } catch (error) {
            console.error('Failed to persist report (complete)', error);
        }
    }, [params]);

    // Fully Autonomous System Runner
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const runFullyAutonomousSystem = useCallback(async () => {
        setIsFullyAutonomous(true);
        try {
            const { runFullyAutonomousAgenticWorker } = await import('./services/agenticWorker');

            const result = await runFullyAutonomousAgenticWorker(params, {
                generateDocument: true,
                documentAudience: 'executive',
                executeAutonomousActions: true,
                enableSelfImprovement: true,
                spawnSubAgents: true
            });

            // Update UI with results
            setAutonomousSystemStatus(result);

        } catch (error) {
            console.error(' FULLY AUTONOMOUS SYSTEM: Error', error);
        } finally {
            setIsFullyAutonomous(false);
        }
    }, [params]);

    // --- RENDER ---

    const renderContent = () => {
        if (viewMode === 'user-manual') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <UserManual
                        onLaunchOS={() => setViewMode('main')}
                        onOpenCommandCenter={() => setViewMode('command-center')}
                    />
                </div>
            );
        }

        if (viewMode === 'command-center') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <CommandCenter
                        onEnterPlatform={(payload) => {
                          if (payload?.query) setPendingConsultantQuery(payload.query);
                          setViewMode('consultant-os');
                        }}
                        onOpenGlobalLocationIntel={() => setViewMode('global-location-intel')}
                        onLocationResearched={(data) => setPendingLocationData(data)}
                    />
                </div>
            );
        }

        if (viewMode === 'consultant-os') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <BWConsultantOS
                        onOpenWorkspace={(payload) => {
                            if (payload?.query) setPendingConsultantQuery(payload.query);
                            setViewMode('main');
                        }}
                        onNavigate={(mode) => setViewMode(mode as ViewMode)}
                        domainMode={params.domainMode}
                    />
                </div>
            );
        }

        if (viewMode === 'main') {
            return (
                <div className="flex flex-1 w-full h-full overflow-hidden">
                    <NSILWorkspace 
                        params={params}
                        setParams={setParams}
                        reportData={reportData}
                        isGenerating={isGeneratingReport}
                        generationPhase={genPhase}
                        generationProgress={genProgress}
                        onGenerate={handleGenerateReport}
                        reports={savedReports}
                        onOpenReport={loadReport}
                        onDeleteReport={deleteReport}
                        onNewAnalysis={startNewMission}
                        onCopilotMessage={(msg) => setInsights(prev => [msg, ...prev])}
                        onChangeViewMode={(mode: string) => setViewMode(mode as ViewMode)}
                        insights={combinedInsights}
                        autonomousMode={autonomousMode}
                        autonomousSuggestions={autonomousSuggestions}
                        isAutonomousThinking={isAutonomousThinking}
                        initialConsultantQuery={pendingConsultantQuery || undefined}
                        onInitialConsultantQueryHandled={() => setPendingConsultantQuery(null)}
                        initialContext={pendingConsultantContext}
                        onInitialContextHandled={() => setPendingConsultantContext(null)}
                    />
                </div>
            );
        }

        if (viewMode === 'global-location-intel') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <GlobalLocationIntelligence
                        onBack={() => setViewMode('main')}
                        onOpenCommandCenter={() => setViewMode('command-center')}
                        pendingLocation={pendingLocationData}
                        onLocationLoaded={() => setPendingLocationData(null)}
                        onPushToConsultant={(data) => {
                            setPendingConsultantContext(data as unknown as { city: string; country: string; summary: string; profile: Record<string, unknown>; research: object | null });
                            setViewMode('consultant-os');
                        }}
                    />
                </div>
            );
        }

        if (viewMode === 'admin') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <AdminDashboard />
                </div>
            );
        }

        if (viewMode === 'intake') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <Gateway
                        params={params}
                        onUpdate={setParams}
                        onComplete={() => setViewMode('consultant-os')}
                    />
                </div>
            );
        }

        if (viewMode === 'matchmaking') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <MatchmakingEngine params={params} autoRun />
                </div>
            );
        }

        if (viewMode === 'documents') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <DocumentGenerationSuite
                        entityName={params.organizationName || undefined}
                        targetMarket={params.country || undefined}
                        reportParams={params}
                        reportData={reportData}
                    />
                </div>
            );
        }

        if (viewMode === 'advanced-report') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <AdvancedReportGenerator
                        params={params}
                        onReportGenerated={() => setViewMode('main')}
                        onClose={() => setViewMode('command-center')}
                    />
                </div>
            );
        }

        if (viewMode === 'exec-summary') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <ExecutiveSummaryGenerator
                        entity={params}
                        targetMarket={params.country || undefined}
                        targetIndustry={(params.industry?.[0]) || undefined}
                    />
                </div>
            );
        }

        if (viewMode === 'letters') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <LettersCatalogModal
                        isOpen={true}
                        onClose={() => setViewMode('command-center')}
                    />
                </div>
            );
        }


        
        // Fallback or default view
        return (
            <div className="flex flex-1 w-full h-full overflow-hidden">
                <NSILWorkspace 
                    params={params}
                    setParams={setParams}
                    reportData={reportData}
                    isGenerating={isGeneratingReport}
                    generationPhase={genPhase}
                    generationProgress={genProgress}
                    onGenerate={handleGenerateReport}
                    reports={savedReports}
                    onOpenReport={loadReport}
                    onDeleteReport={deleteReport}
                    onNewAnalysis={startNewMission}
                    onCopilotMessage={(msg) => setInsights(prev => [msg, ...prev])}
                    onChangeViewMode={(mode: string) => setViewMode(mode as ViewMode)}
                    insights={combinedInsights}
                    autonomousMode={autonomousMode}
                    autonomousSuggestions={autonomousSuggestions}
                    isAutonomousThinking={isAutonomousThinking}
                    initialConsultantQuery={pendingConsultantQuery || undefined}
                    onInitialConsultantQueryHandled={() => setPendingConsultantQuery(null)}
                    initialContext={pendingConsultantContext}
                    onInitialContextHandled={() => setPendingConsultantContext(null)}
                />
            </div>
        );
    };

    if (!isOnline) {
        return (
            <div className="h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6">
                <div className="max-w-md text-center border border-white/20 rounded-lg p-8 bg-black/60 shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">No Internet Connection</h1>
                    <p className="text-sm mb-4">You are currently offline. Please reconnect to the internet to use ADVERSIQ Consultant features.</p>
                    <p className="text-xs text-slate-300">The app is available here once your network is restored.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-stone-50 font-sans text-stone-900 flex flex-col overflow-hidden">
            <ErrorBoundary>
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-sm text-stone-500">Loading workspace...</div>}>
                    {renderContent()}
                </Suspense>
            </ErrorBoundary>
        </div>
    );
};

export default App;
