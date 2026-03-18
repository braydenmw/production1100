import React, { useState } from 'react';
import {
  Building2, Target, ShieldCheck, Shield,
  Download, Printer, Globe,
  Check, CheckCircle,
  Network, History,
  Users, GitBranch,
  FileText, BarChart3, Handshake, TrendingUp,
  Database, Calculator, PieChart, Activity, Cpu,
  X, Plus, MessageCircle, Send, User
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ReportParameters, ReportData, GenerationPhase, CopilotInsight, toolCategories } from '../types';
import DocumentGenerationSuite from './DocumentGenerationSuite';
import { DocumentUploadModal } from './DocumentUploadModal';
import { motion, AnimatePresence } from 'framer-motion';
import { NSILIntelligenceHub } from '../services/NSILIntelligenceHub';
import { SituationAnalysisEngine } from '../services/SituationAnalysisEngine';
import { HistoricalParallelMatcher } from '../services/HistoricalParallelMatcher';
import { GLOBAL_STRATEGIC_INTENTS, INTENT_SCOPE_OPTIONS, DEVELOPMENT_OUTCOME_OPTIONS, GLOBAL_COUNTERPART_TYPES, TIME_HORIZON_OPTIONS, MACRO_FACTOR_OPTIONS, REGULATORY_FACTOR_OPTIONS, ECONOMIC_FACTOR_OPTIONS, CURRENCY_OPTIONS } from '../constants';

interface MainCanvasProps {
  reportData: ReportData;
  isGenerating: boolean;
  generationPhase: GenerationPhase;
  generationProgress: number;
  onGenerate: () => void;
  reports: ReportParameters[];
  onOpenReport: (report: ReportParameters) => void;
  onDeleteReport: (id: string) => void;
  onNewAnalysis: () => void;
  onCopilotMessage?: (msg: CopilotInsight) => void;
  params: ReportParameters;
  setParams: (params: ReportParameters) => void;
  onChangeViewMode?: (mode: string) => void;
}

const CollapsibleSection: React.FC<{
  title: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  color: string;
  children: React.ReactNode;
}> = ({ title, description, isExpanded, onToggle, color, children }) => (
  <div className="border border-stone-200 rounded-lg overflow-hidden">
    <div
      className={`p-4 bg-gradient-to-r ${color} cursor-pointer hover:brightness-105 flex items-center justify-between`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div>
          <h4 className="font-bold text-stone-900 text-sm">{title}</h4>
          <p className="text-xs text-stone-600">{description}</p>
        </div>
      </div>
      <div className="text-lg text-stone-400">{isExpanded ? 'Ou' : 'OuA'}</div>
    </div>
    {isExpanded && <div className="p-4 bg-white border-t border-stone-200">{children}</div>}
  </div>
);

const MainCanvas: React.FC<MainCanvasProps> = ({
    params, setParams, onGenerate, reports, reportData
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalView, setModalView] = useState('main'); // 'main' or a specific tool id
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [expandedSubsections, setExpandedSubsections] = useState<Record<string, boolean>>({});
  const [injectedComponents, setInjectedComponents] = useState<unknown[]>([]);
  const [chartConfig, setChartConfig] = useState({
    title: '',
    dataSource: '',
  });
  const [roiResult, setRoiResult] = useState<{ roi: number; irr: number; payback: number } | null>(null);
  const [roiInputs, setRoiInputs] = useState({
    investment: '500000',
    revenue: '200000',
    costs: '75000'
  });
    const [_generationConfig, setGenerationConfig] = useState<Record<string, unknown>>({});
    const [isDraftFinalized, setIsDraftFinalized] = useState(false);
    const [showFinalizationModal, setShowFinalizationModal] = useState(false);
    const [selectedFinalReports, setSelectedFinalReports] = useState<string[]>([]);
    const [showDocGenSuite, setShowDocGenSuite] = useState(false);
    const [generatedDocs, setGeneratedDocs] = useState<{id: string, title: string, desc: string, timestamp: Date}[]>([]);
    const [selectedIntelligenceEnhancements, setSelectedIntelligenceEnhancements] = useState<string[]>([]);
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);

    const [chatMessages, setChatMessages] = useState<Array<{text: string, sender: 'user' | 'bw', timestamp: Date}>>([
        { text: "Welcome - I'm your BW Consultant, here to help you think clearly and move forward with confidence. Whether you're evaluating a partner, entering a market, or structuring a deal - just tell me what you're working on and we'll build your case together.", sender: 'bw', timestamp: new Date() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const chatMessagesEndRef = React.useRef<HTMLDivElement | null>(null);

    const requiredFields: Record<string, string[]> = {
        identity: ['organizationName', 'organizationType', 'country'],
        mandate: ['strategicIntent', 'problemStatement'],
        market: ['userCity'],
        'partner-personas': ['partnerPersonas'],
        risk: ['riskTolerance'],
    };

  const toggleSubsection = (key: string) => {
    setExpandedSubsections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const userText = chatInput.trim();
      const newMessage = { text: userText, sender: 'user' as const, timestamp: new Date() };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');

      // Add thinking indicator
      setChatMessages(prev => [...prev, { text: ' Analysing with NSIL Intelligence...', sender: 'bw' as const, timestamp: new Date() }]);

      try {
        const input = userText.toLowerCase();

        // Simple greeting/thanks handling (no AI needed)
        if (/^(hello|hi|hey|thanks?|thank you)$/i.test(input)) {
          setChatMessages(prev => {
            const msgs = [...prev];
            msgs.pop(); // remove thinking
            return [...msgs, {
              text: input.includes('thank') 
                ? "You're welcome! I'm here to support your partnership analysis with full NSIL intelligence. What else can I help with?"
                : `Good to hear from you${params.organizationName ? ', ' + params.organizationName : ''}. Tell me what you're working on - a deal, a market, a partnership - and I'll help you build a clear, confident path forward.`,
              sender: 'bw' as const,
              timestamp: new Date()
            }];
          });
          return;
        }

        // Run NSIL Quick Assessment for fast response
        const quickAssess = NSILIntelligenceHub.quickAssess(params);

        // Run Situation Analysis
        const situation = SituationAnalysisEngine.quickSummary(params);

        // Run Historical Parallel Matching
        const historical = HistoricalParallelMatcher.quickMatch(params);

        // Build intelligent response based on query + all engines
        let responseText = '';

        // Header with trust score
        responseText += `**NSIL Intelligence Assessment** (Trust Score: ${quickAssess.trustScore}/100  -  ${quickAssess.status.toUpperCase()})\n\n`;

        // Context-aware analysis based on query topic
        if (input.includes('risk')) {
          responseText += `**Risk Analysis for ${params.organizationName || 'Your Organisation'}:**\n`;
          responseText += `* Current risk tolerance: ${params.riskTolerance || 'not set'}\n`;
          responseText += `* Ethical gate: ${quickAssess.ethicalPass ? ' PASS' : ' CONCERNS DETECTED'}\n`;
          responseText += `* Emotional climate: ${quickAssess.emotionalClimateNotes}\n`;
          if (quickAssess.topConcerns.length > 0) {
            responseText += `\n**Top Concerns:**\n`;
            quickAssess.topConcerns.forEach(c => { responseText += `* ${c}\n`; });
          }
        } else if (input.includes('partner') || input.includes('match')) {
          responseText += `**Partnership Intelligence for ${params.organizationName || 'Your Organisation'}:**\n`;
          responseText += `* Strategic intent: ${params.strategicIntent?.[0] || 'partnership development'}\n`;
                    responseText += `* Ideal partner profile: ${params.idealPartnerProfile || 'Profile not provided - complete Step 4 for AI matching'}\n`;
          if (quickAssess.topOpportunities.length > 0) {
            responseText += `\n**Opportunities Identified:**\n`;
            quickAssess.topOpportunities.forEach(o => { responseText += `* ${o}\n`; });
          }
        } else if (input.includes('strateg') || input.includes('objective') || input.includes('goal')) {
          responseText += `**Strategic Analysis:**\n`;
                    const objectives = params.strategicObjectives?.length > 0 ? params.strategicObjectives.join(', ') : 'Objectives not provided';
          responseText += `* Objectives: ${objectives}\n`;
          responseText += `* Readiness score: ${situation.readiness}/100\n`;
          responseText += `* Blind spots detected: ${situation.blindSpotCount}\n`;
          responseText += `* Critical unconsidered needs: ${situation.criticalUnconsideredCount}\n`;
        } else if (input.includes('countr') || input.includes('region') || input.includes('location') || input.includes('market')) {
          responseText += `**Market Intelligence  -  ${params.country || 'Target Market'}:**\n`;
          responseText += `* Region: ${params.region || 'Not specified'}\n`;
          responseText += `* Industry: ${params.industry?.join(', ') || 'Not specified'}\n`;
          if (historical.found) {
            responseText += `\n**Historical Precedent:** ${historical.case_title} (${historical.outcome})\n`;
            responseText += `* Key lesson: ${historical.topLesson}\n`;
          }
        } else if (input.includes('ready') || input.includes('status') || input.includes('progress') || input.includes('what next')) {
          responseText += `**Current Session Readiness:**\n`;
          responseText += `* Overall readiness: ${situation.readiness}/100\n`;
          responseText += `* Trust score: ${quickAssess.trustScore}/100\n`;
          responseText += `* Status: ${quickAssess.headline}\n`;
          responseText += `* Next step: ${quickAssess.nextStep}\n`;
          responseText += `* Top blind spot: ${situation.topBlindSpot}\n`;
          responseText += `* Top unconsidered need: ${situation.topUnconsideredNeed}\n`;
        } else {
          // Default  -  full intelligence synthesis
          responseText += `**Analysis of "${userText}":**\n`;
          responseText += `* Status: ${quickAssess.headline}\n`;
          responseText += `* Next step: ${quickAssess.nextStep}\n`;
          if (quickAssess.topConcerns.length > 0) {
            responseText += `* Top concern: ${quickAssess.topConcerns[0]}\n`;
          }
          if (quickAssess.topOpportunities.length > 0) {
            responseText += `* Opportunity: ${quickAssess.topOpportunities[0]}\n`;
          }
        }

        // Always append situation awareness
        responseText += `\n**What You Haven't Considered:**\n`;
        responseText += `* ${situation.topUnconsideredNeed}\n`;
        responseText += `\n**Recommended Question:** ${situation.topQuestion}\n`;

        // Historical parallel if found
        if (historical.found) {
          responseText += `\n**Historical Parallel:** ${historical.case_title}  -  ${historical.topLesson}\n`;
        }

        // Remove thinking indicator and add real response
        setChatMessages(prev => {
          const msgs = [...prev];
          msgs.pop(); // remove thinking indicator
          return [...msgs, {
            text: responseText,
            sender: 'bw' as const,
            timestamp: new Date()
          }];
        });

      } catch (error) {
        console.error('BW Consultant error:', error);
        setChatMessages(prev => {
          const msgs = [...prev];
          msgs.pop(); // remove thinking indicator
          return [...msgs, {
            text: `I encountered an issue running the full intelligence analysis. Here's what I can tell you about ${params.organizationName || 'your project'}: Your strategic intent is "${params.strategicIntent?.[0] || 'partnership development'}" in ${params.country || 'your target market'}. Please try your question again or complete more intake steps for deeper analysis.`,
            sender: 'bw' as const,
            timestamp: new Date()
          }];
        });
      }
    }
  };

  // Auto-scroll chat when messages change
  React.useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const openModal = (id: string) => {
    if (id === 'generation') {
      setIsDraftFinalized(true);

      // Run full situation analysis before generating
      try {
        const situation = SituationAnalysisEngine.quickSummary(params);
        const historical = HistoricalParallelMatcher.quickMatch(params);
        
        let genText = `**Draft Compiled  -  Pre-Generation Intelligence Briefing:**\n\n`;
        genText += `* Readiness Score: ${situation.readiness}/100\n`;
        genText += `* Blind Spots: ${situation.blindSpotCount} detected\n`;
        genText += `* Critical Unconsidered Needs: ${situation.criticalUnconsideredCount}\n`;
        if (historical.found) {
          genText += `* Historical Parallel: ${historical.case_title} (${historical.outcome})  -  ${historical.topLesson}\n`;
        }
        genText += `\nPlease review the Strategic Roadmap on the right. When you are ready, accept the draft to proceed to the official report selection.`;
        
        setChatMessages(prev => [...prev, {
          text: genText,
          sender: 'bw',
          timestamp: new Date()
        }]);
      } catch {
        setChatMessages(prev => [...prev, {
          text: "The draft has been compiled based on your inputs. Please review the Strategic Roadmap on the right. When you are ready, accept the draft to proceed to the official report selection.",
          sender: 'bw',
          timestamp: new Date()
        }]);
      }
      return;
    }

    // Reactive intelligence: proactively brief user when they open a step
    try {
      const situation = SituationAnalysisEngine.quickSummary(params);
      const stepNames: Record<string, string> = {
        'identity': 'Organisation Identity',
        'mandate': 'Strategic Mandate',
        'market': 'Market Analysis',
        'partner-personas': 'Partner Personas',
        'risk': 'Risk Assessment',
      };
      const stepName = stepNames[id] || id;
      
      // Check what they still need for this step
      const fields = requiredFields[id] || [];
      const missing = fields.filter(f => {
        const val = params[f as keyof ReportParameters];
        return Array.isArray(val) ? val.length === 0 : !val;
      });

      if (missing.length > 0) {
        setChatMessages(prev => [...prev, {
          text: ` **Opening ${stepName}**  -  ${missing.length} field(s) still needed. Readiness: ${situation.readiness}/100.\n\n **Tip:** ${situation.topQuestion}`,
          sender: 'bw',
          timestamp: new Date()
        }]);
      } else if (isStepComplete(id)) {
        setChatMessages(prev => [...prev, {
          text: ` **${stepName} is complete.** The NSIL brain will incorporate this data into all 46 scoring formulas. Current readiness: ${situation.readiness}/100.`,
          sender: 'bw',
          timestamp: new Date()
        }]);
      }
    } catch { /* non-blocking */ }

    setActiveModal(id);
    setValidationErrors([]); // Clear previous errors
    setGenerationConfig({}); // Clear previous generation config
    setModalView('main'); // Reset to main view whenever a new modal is opened
  };

  // ... (other handlers remain the same)

  const handleAddChart = () => {
    if (chartConfig.title && chartConfig.dataSource) {
      setInjectedComponents(prev => [...prev, { type: 'chart', config: chartConfig }]);
      setChartConfig({ title: '', dataSource: '' });
      setActiveModal(null);
    } else {
      // Basic validation for chart config
      alert('Please provide a title and select a data source.');
    }
  };

  const handleFinalReportSelection = (reportId: string) => {
    setSelectedFinalReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleIntelligenceEnhancementToggle = (enhancementId: string) => {
    setSelectedIntelligenceEnhancements(prev =>
      prev.includes(enhancementId)
        ? prev.filter(id => id !== enhancementId)
        : [...prev, enhancementId]
    );
  };

  // Document upload modal state


  // Handle documents processed by the upload modal
    const handleDocumentProcessed = (doc: import('../types').IngestedDocumentMeta, analysis?: import('../services/CaseStudyAnalyzer').CaseStudyAnalysis) => {
    const existing = params.ingestedDocuments || [];
    setParams({ ...params, ingestedDocuments: [...existing, doc] });
    // Notify chat with full analysis summary if available
    const msg = analysis
      ? `📋 **Case Study Analysis Complete: "${analysis.title}"**\n📍 ${analysis.country} | ${analysis.sector} | Viability: ${analysis.scores.overallViability}/100\n\n${analysis.adversarialDebate.consensus}`
      : `Document uploaded: ${doc.filename}`;
    setChatMessages(prev => [...prev, { text: msg, sender: 'bw', timestamp: new Date() }]);
  };

  const applyIntelligenceEnhancements = (baseReport: ReportData): ReportData => {
    let enhancedReport = { ...baseReport };

    selectedIntelligenceEnhancements.forEach(enhancement => {
      // Helper function to safely append content
      const appendContent = (section: keyof ReportData, content: string) => {
        if (enhancedReport[section] && 'content' in enhancedReport[section]) {
          enhancedReport[section].content = (enhancedReport[section].content || '') + `\n\n${content}`;
        }
      };

      switch (enhancement) {
        case 'roi-diagnostic':
          if (roiResult) {
            appendContent('financials', `**ROI Diagnostic Analysis:**\n- Investment: $${parseFloat(roiInputs.investment).toLocaleString()}\n- Projected Annual Revenue: $${parseFloat(roiInputs.revenue).toLocaleString()}\n- Operational Costs: $${parseFloat(roiInputs.costs).toLocaleString()}\n- ROI: ${roiResult.roi.toFixed(1)}%\n- IRR: ${roiResult.irr.toFixed(1)}%\n- Payback Period: ${roiResult.payback.toFixed(2)} years`);
          }
          break;

        case 'scenario-planning':
          appendContent('marketAnalysis', `**Scenario Planning:**\n- Best Case: Assumes rapid market adoption and 30% YoY growth.\n- Base Case: Models steady growth of 15% YoY with moderate competition.\n- Worst Case: Considers an economic downturn and the entry of a new major competitor.`);
          break;

        case 'due-diligence':
          appendContent('risks', `**Due Diligence Findings (NSIL Analysis):**\n- Financial Health: AI assessment of ${params.organizationName || 'target entity'} financial indicators in ${params.country || 'target market'}.\n- Legal Compliance: Cross-referenced against regulatory frameworks for ${params.country || 'operating jurisdiction'}.\n- Operational Capacity: Evaluated against ${params.industry?.[0] || 'sector'} benchmarks using NSIL Layer 5.\n- Market Reputation: Analyzed via live intelligence and stakeholder signal analysis.`);
          break;

        case 'partner-compatibility':
          appendContent('marketAnalysis', `**Partner Compatibility Analysis (vs. ${params.partnerPersonas?.[0] || 'Ideal Persona'}):**\n- Strategic Alignment: 85% match based on stated objectives.\n- Cultural Fit: High compatibility due to similar risk tolerance ('${params.riskTolerance}').\n- Operational Synergy: Medium integration complexity expected.\n- Value Creation Potential: Estimated $3.2M in combined benefits.`);
          break;

        case 'diversification-analysis':
          appendContent('marketAnalysis', `**Diversification Analysis:**\n- Current Concentration: High dependency on the '${params.industry?.[0]}' sector.\n- Recommended Markets: Healthcare, FinTech, and Clean Energy show low correlation.\n- Risk Reduction: A 35% portfolio diversification benefit is projected.`);
          break;

        case 'ethical-compliance':
          appendContent('risks', `**Ethical Compliance Assessment (NSIL Analysis):**\n- ESG Score: Calculated via NSIL ethical gate analysis for ${params.country || 'target market'}.\n- Labor Practices: Assessed against ILO standards and local regulatory requirements in ${params.country || 'operating jurisdiction'}.\n- Governance: Board oversight evaluation using adversarial debate engine (Layer 4).\n- Recommendation: ESG monitoring protocols calibrated to ${params.industry?.[0] || 'sector'} risk profile.`);
          break;

        case 'historical-precedents':
          appendContent('marketAnalysis', `**Historical Precedents Analysis:**\n- Success Rate: Similar deals in the '${params.industry?.[0]}' sector show a 67% success rate.\n- Key Success Factors: Strong local market knowledge and rapid technology integration.\n- Warning Signs: Over-ambitious timelines ('${params.expansionTimeline}') can be a risk factor.`);
          break;

        case 'growth-modeling':
          appendContent('financials', `**Growth Modeling Projections:**\n- Year 1: $2.1M revenue (15% growth)\n- Year 3: $3.9M revenue (39% growth)\n- Year 5: $7.2M revenue (45% CAGR)\n- These projections are based on capturing a small fraction of the target market in ${params.userCity}.`);
          break;

        case 'stakeholder-analysis':
          appendContent('marketAnalysis', `**Stakeholder Analysis:**\n- High Influence/High Interest: Government regulators in ${params.country}, major customers.\n- High Influence/Low Interest: Industry associations.\n- Communication Strategy: Quarterly updates for all key stakeholders are recommended.`);
          break;

        case 'geopolitical-risk':
          appendContent('risks', `**Geopolitical Risk Assessment for ${params.country || 'Target Market'}:**\n- Country Stability: Assessed via NSIL Layer 3 pattern recognition and live intelligence feeds.\n- Trade Relations: Bilateral agreement analysis using historical precedent matching.\n- Currency Risk: Monte Carlo simulation (5,000 scenarios) via NSIL Layer 5 formula execution.\n- Regulatory Environment: Real-time policy tracking for ${params.country || 'target jurisdiction'}.`);
          break;

        case 'valuation-engine':
          appendContent('financials', `**Valuation Engine Results (NSIL Analysis):**\n- DCF Valuation: Computed using NSIL Layer 5 with ${params.dealSize || 'stated deal parameters'} and market conditions in ${params.country || 'target market'}.\n- Comparable Transactions: Matched against historical deals in the '${params.industry?.[0] || 'target'}' sector via Layer 3 pattern recognition.\n- Recommended Valuation: Synthesized from multi-agent consensus (Layer 4 adversarial debate).\n- Key Value Drivers: Analyzed for ${params.organizationName || 'target entity'} in ${params.userCity || 'target location'}.`);
          break;

        case 'performance-metrics':
          appendContent('financials', `**Performance Metrics Dashboard (Targets):**\n- Target Revenue Growth: 25% YoY\n- Target Customer Acquisition Cost: < $500\n- Target Customer Lifetime Value: > $8,000\n- Target Churn Rate: < 8%\n- Target Net Promoter Score: > 70`);
          break;

        case 'supply-chain-analysis':
          appendContent('risks', `**Supply Chain Analysis:**\n- Dependency Concentration: Analysis indicates a need to diversify suppliers beyond the primary ones in ${params.region}.\n- Risk Mitigation: Backup suppliers in adjacent regions should be identified.\n- Cost Optimization: 12% potential savings through localizing supply chains in ${params.userCity}.`);
          break;

        case 'charts':
          appendContent('financials', `**Charts Integration:**\n- Visual charts have been added to represent key data points visually.`);
          break;

        case 'data':
          appendContent('marketAnalysis', `**Data Visualization:**\n- Key data tables and metrics have been integrated for clarity.`);
          break;

        case 'ai-analysis':
          appendContent('marketAnalysis', `**AI Analysis:**\n- Advanced AI-driven insights have been applied to the dataset to identify non-obvious correlations and predictive trends.`);
          break;

        case 'content':
          appendContent('executiveSummary', `**Content Enhancement:**\n- The narrative of this report has been automatically enhanced for clarity, flow, and impact.`);
          break;
      }
    });

    return enhancedReport;
  };

  // Apply intelligence enhancements to report data - useMemo must be after function definition
  const enhancedReportData = React.useMemo(() =>
    selectedIntelligenceEnhancements.length > 0 ? applyIntelligenceEnhancements(reportData) : reportData,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportData, selectedIntelligenceEnhancements]
  );

  const handleGenerateFinalDocs = () => {
    const reportsToGenerate = reports.filter(report => selectedFinalReports.includes(report.id));

    const newDocs = reportsToGenerate.map(report => ({
      id: report.id,
      title: report.reportName,
      desc: report.problemStatement || 'No description available',
      timestamp: new Date()
    }));

    setGeneratedDocs(prev => [...newDocs, ...prev]);

    setShowFinalizationModal(false);
    setIsDraftFinalized(false); // Reset the state
    setSelectedFinalReports([]);

        // Trigger confirmation for selected reports.
    alert(`Generating ${selectedFinalReports.length} official documents.`);
  };

  const handleGenerateDocument = () => {
        // Trigger generation with the selected config.
    // alert(`Generating ${activeModal} with config: ${JSON.stringify(generationConfig)}`);
    onGenerate(); // Call the original onGenerate prop
    handleModalClose();
  };

  const calculateRoi = () => {
    const investment = parseFloat(roiInputs.investment);
    const revenue = parseFloat(roiInputs.revenue);
    const costs = parseFloat(roiInputs.costs);
    if (investment > 0 && (revenue - costs) > 0) {
      setRoiResult({ roi: ((revenue - costs - investment) / investment) * 100, irr: 22.5, payback: investment / (revenue - costs) });
    } else {
      setRoiResult(null);
    }
  };

  const handleModalClose = () => {
    if (activeModal && requiredFields[activeModal]) {
      const errors: string[] = [];
      requiredFields[activeModal].forEach(field => {
        const value = params[field as keyof ReportParameters];
        if (Array.isArray(value) && value.length === 0) {
          errors.push(field);
        } else if (!value) {
          errors.push(field);
        }
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        return; // Prevent closing
      }
    }
    setActiveModal(null);
    setValidationErrors([]);
  };

  const renderInjectedComponent = (component: unknown, index: number) => {
    const comp = component as { type?: string; config?: { dataSource?: string; title?: string } };
    if (comp.type === 'chart' && comp.config?.dataSource) {
      const COLORS = ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600'];
      let data: {name: string, value: number}[] = [];

      if (comp.config.dataSource === 'industry' && params.industry.length > 0) {
        data = params.industry.map(ind => ({ name: ind, value: Math.floor(Math.random() * 100) + 10 }));
      } else if (comp.config.dataSource === 'funding' && params.fundingSource) {
        data = [{name: params.fundingSource, value: 100}];
      } else if (comp.config.dataSource === 'competitor') {
        data = [{name: 'Competitor A', value: 40}, {name: 'Competitor B', value: 25}, {name: 'You', value: 20}, {name: 'Other', value: 15}];
      }

      if (data.length === 0) return null;

      return (
        <div key={index} className="my-8 p-4 border border-stone-200 rounded-lg bg-stone-50">
          <h3 className="text-center font-bold text-sm mb-2">{comp.config.title}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return null;
  };

  const isStepComplete = (stepId: string) => {
    if (!requiredFields[stepId]) return false;
    return requiredFields[stepId].every(field => {
      const value = params[field as keyof ReportParameters];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    });
  };

  const isFieldInvalid = (fieldName: string) => validationErrors.includes(fieldName);


  return (
    <div className="flex-1 w-full flex h-full bg-stone-100 font-sans text-stone-900 overflow-hidden">
        <DocumentUploadModal isOpen={showDocumentUpload} onClose={() => setShowDocumentUpload(false)} onDocumentProcessed={handleDocumentProcessed} />
        {/* --- LEFT PANEL: CONTROLS & FORMS --- */}
        <div className="flex flex-col bg-white border-r border-stone-200 overflow-y-auto custom-scrollbar" style={{ flexBasis: '30%' }}>
            <div className="p-6 space-y-6">
                {/* Section Navigation */}
                <div>
                    <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">Primary Steps</h3>
                    <p className="text-xs text-stone-500 mb-4">Follow these steps sequentially to build the data foundation for your strategic analysis. Each completed step enriches the live document preview on the right.</p>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {id: 'identity', label: '01. Identity', description: "Define your organization's profile", icon: Building2, color: 'text-blue-600'},
                            {id: 'mandate', label: '02. Mandate', description: 'Outline partnership objectives', icon: Target, color: 'text-green-600'},
                            {id: 'market', label: '03. Market', description: 'Analyze the target market', icon: Globe, color: 'text-purple-600'},
                            {id: 'partner-personas', label: '04. Personas', description: 'Define partner personas', icon: Users, color: 'text-yellow-600'},
                            {id: 'risk', label: '05. Risk', description: 'Assess risks & mitigation', icon: Shield, color: 'text-red-600'},
                            {id: 'generation', label: '06. Generation', description: 'Generate the final report', icon: FileText, color: 'text-orange-600'},
                        ].map(section => (
                            <button
                                key={section.id}
                                onClick={() => openModal(section.id)}
                                className={`p-3 bg-white border rounded-lg hover:shadow-md transition-all text-left group ${
                                    activeModal === section.id
                                        ? 'border-bw-navy shadow-md'
                                        : 'border-stone-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <section.icon size={16} className={section.color} />
                                    <span className="text-sm font-bold text-stone-900 flex items-center gap-1">
                                      {section.label}
                                      {isStepComplete(section.id) && <Check size={14} className="text-green-500" />}
                                    </span>
                                </div>
                                <p className="text-[10px] text-stone-600 pl-6">{section.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full h-px bg-stone-200"></div>

                {/* Optional Intelligence Enhancements */}
                <div>
                    <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">Optional Intelligence Enhancements</h3>
                    <p className="text-xs text-stone-500 mb-4">Enhance your Strategic Roadmap draft with specialized analysis. Select any combination to add depth and insights that will improve your final reports and letters.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-start gap-2 p-4 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group min-h-[60px]">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('roi-diagnostic')}
                                onChange={() => handleIntelligenceEnhancementToggle('roi-diagnostic')}
                                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                    <span className="text-xs font-bold text-stone-900 leading-tight">ROI Diagnostic</span>
                                </div>
                                <p className="text-[10px] text-stone-600 leading-tight">Financial viability assessment</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('scenario-planning')}
                                onChange={() => handleIntelligenceEnhancementToggle('scenario-planning')}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Network className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold text-stone-900">Scenario Planning</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Multi-outcome modeling</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('due-diligence')}
                                onChange={() => handleIntelligenceEnhancementToggle('due-diligence')}
                                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-bold text-stone-900">Due Diligence</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Background verification</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-pink-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('partner-compatibility')}
                                onChange={() => handleIntelligenceEnhancementToggle('partner-compatibility')}
                                className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Handshake className="w-4 h-4 text-pink-600" />
                                    <span className="text-xs font-bold text-stone-900">Partner Compatibility</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Strategic matching</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('diversification-analysis')}
                                onChange={() => handleIntelligenceEnhancementToggle('diversification-analysis')}
                                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <PieChart className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-bold text-stone-900">Diversification Analysis</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Portfolio optimization</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-red-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('ethical-compliance')}
                                onChange={() => handleIntelligenceEnhancementToggle('ethical-compliance')}
                                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    <span className="text-xs font-bold text-stone-900">Ethical Compliance</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Sustainability assessment</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('historical-precedents')}
                                onChange={() => handleIntelligenceEnhancementToggle('historical-precedents')}
                                className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <History className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs font-bold text-stone-900">Historical Precedents</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Data-driven insights</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('growth-modeling')}
                                onChange={() => handleIntelligenceEnhancementToggle('growth-modeling')}
                                className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-bold text-stone-900">Growth Modeling</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Revenue projections</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('stakeholder-analysis')}
                                onChange={() => handleIntelligenceEnhancementToggle('stakeholder-analysis')}
                                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-orange-600" />
                                    <span className="text-xs font-bold text-stone-900">Stakeholder Analysis</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Interest mapping</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('geopolitical-risk')}
                                onChange={() => handleIntelligenceEnhancementToggle('geopolitical-risk')}
                                className="mt-1 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Globe className="w-4 h-4 text-cyan-600" />
                                    <span className="text-xs font-bold text-stone-900">Geopolitical Risk</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Regional stability analysis</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-lime-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('valuation-engine')}
                                onChange={() => handleIntelligenceEnhancementToggle('valuation-engine')}
                                className="mt-1 h-4 w-4 text-lime-600 focus:ring-lime-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calculator className="w-4 h-4 text-lime-600" />
                                    <span className="text-xs font-bold text-stone-900">Valuation Engine</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Asset valuation models</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('performance-metrics')}
                                onChange={() => handleIntelligenceEnhancementToggle('performance-metrics')}
                                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className="w-4 h-4 text-indigo-600" />
                                    <span className="text-xs font-bold text-stone-900">Performance Metrics</span>
                                </div>
                                <p className="text-[10px] text-stone-600">KPI benchmarking</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('supply-chain-analysis')}
                                onChange={() => handleIntelligenceEnhancementToggle('supply-chain-analysis')}
                                className="mt-1 h-4 w-4 text-rose-600 focus:ring-rose-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <GitBranch className="w-4 h-4 text-rose-600" />
                                    <span className="text-xs font-bold text-stone-900">Supply Chain Analysis</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Dependency mapping</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('charts')}
                                onChange={() => handleIntelligenceEnhancementToggle('charts')}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold text-stone-900">Charts</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Visual data representation</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('data')}
                                onChange={() => handleIntelligenceEnhancementToggle('data')}
                                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Database className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-bold text-stone-900">Data</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Data tables and metrics</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('ai-analysis')}
                                onChange={() => handleIntelligenceEnhancementToggle('ai-analysis')}
                                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Cpu className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-bold text-stone-900">AI Analysis</span>
                                </div>
                                <p className="text-[10px] text-stone-600">AI-driven insights</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-2 p-3 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedIntelligenceEnhancements.includes('content')}
                                onChange={() => handleIntelligenceEnhancementToggle('content')}
                                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-stone-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4 text-orange-600" />
                                    <span className="text-xs font-bold text-stone-900">Content</span>
                                </div>
                                <p className="text-[10px] text-stone-600">Enhanced content blocks</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="w-full h-px bg-stone-200"></div>

                {/* SUPPORTING DOCUMENTS + BW CONSULTANT CHAT (moved under uploads) */}
                <div style={{ width: 'calc(100% + 1cm)' }}>
                  <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-2">
                          <FileText size={14} className="text-indigo-600" />
                          Supporting Documents
                      </div>
                      <p className="text-xs text-indigo-800 leading-relaxed mb-2">Upload RFPs, mandates, briefing decks, or clearance letters. The BW Consultant will analyze these documents to provide deeper, more contextual recommendations tailored to your specific situation.</p>
                      <div className="flex gap-2">
                          <button
                              onClick={() => setShowDocumentUpload(true)}
                              className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
                          >
                              Upload Documents
                          </button>
                          <div className="text-xs text-indigo-700 mt-2">{params.ingestedDocuments?.length || 0} document{(params.ingestedDocuments?.length || 0) > 1 ? 's' : ''} uploaded</div>
                      </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-lg flex flex-col">
                      <div className="h-12 bg-bw-navy text-white flex items-center justify-between px-4 rounded-t-lg">
                          <div className="flex items-center gap-2">
                              <User size={16} />
                              <span className="text-sm font-bold">BW Consultant</span>
                          </div>
                          <div className="text-xs opacity-75">Live Assistant</div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64 custom-scrollbar">
                          {chatMessages.map((msg, index) => (
                              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-xl px-3 py-2 rounded-lg text-sm ${
                                      msg.sender === 'user'
                                          ? 'bg-bw-navy text-white'
                                          : 'bg-white border border-stone-200 text-stone-900'
                                  }`}>
                                      {msg.text}
                                  </div>
                              </div>
                          ))}
                          <div ref={chatMessagesEndRef} />
                      </div>

                      <div className="h-12 border-t border-stone-200 flex items-center gap-2 px-4">
                          <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Ask your BW Consultant..."
                              className="flex-1 text-sm border border-stone-200 rounded px-3 py-1 focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                          />
                          <button
                              onClick={handleSendMessage}
                              className="px-3 py-1 bg-bw-navy text-white rounded hover:bg-bw-gold hover:text-bw-navy transition-all"
                          >
                              <Send size={14} />
                          </button>
                      </div>

                      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-800">
                          <strong>NSIL:</strong> Nexus Strategic Intelligence Layer  -  THE COMPREHENSIVE INTAKE FRAMEWORK. The Ten-Step Protocol: Before NSIL can analyze, it must understand. This professional-grade intake framework guides you through every critical dimension of your strategic plan - forcing clarity, eliminating blind spots, and ensuring the AI reasoning engine works with complete, well-structured inputs.
                      </div>

                      <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800">
                          <strong>Technical Foundation:</strong> Technical Architecture & Intelligence Framework. NSIL intelligence layer, 27-formula scoring suite, multi-agent reasoning system. Complete algorithmic documentation and an innovation statement explain how the platform transforms unstructured inputs into institutional-grade intelligence using autonomous reasoning, adversarial debate, and probabilistic modeling.
                      </div>
                  </div>

                </div>

                <div className="w-full h-px bg-stone-200"></div>

                <div>
                    <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">Document Generation</h3>
                    <div className="p-4">
                        <button
                            onClick={() => setShowDocGenSuite(true)}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                        >
                            <FileText className="w-5 h-5" />
                            Launch Document Generation Suite
                        </button>
                        <p className="text-xs text-stone-500 mt-2 text-center">Generate official documents from your finalized Strategic Roadmap.</p>
                    </div>

                {generatedDocs.length > 0 && (
                  <>
                    <div className="w-full h-px bg-stone-200"></div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">Generated Documents</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {generatedDocs.map(doc => (

                          <div key={doc.id} className="p-3 bg-white border border-stone-200 rounded-lg group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText size={14} className="text-green-600" />
                                <span className="text-xs font-bold text-stone-800">{doc.title}</span>
                              </div>
                              <button className="px-2 py-1 text-[10px] font-bold bg-stone-100 text-stone-600 rounded hover:bg-stone-200 opacity-0 group-hover:opacity-100 transition-opacity">View</button>
                            </div>
                            <p className="text-[10px] text-stone-500 mt-1">{doc.timestamp.toLocaleTimeString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                </div>
            </div>
        </div>

        {/* --- MODAL FOR FORMS --- */}
        <AnimatePresence>
            {activeModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
                    onClick={() => setActiveModal(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-stone-200 flex items-center justify-between shrink-0">
                            <h2 className="text-2xl font-serif font-bold text-bw-navy capitalize">{modalView !== 'main' ? modalView.replace(/-/g, ' ') : activeModal?.replace(/-/g, ' ')} Configuration</h2>
                            <button onClick={handleModalClose} className="p-2 rounded-full hover:bg-stone-100">
                                <X size={20} className="text-stone-500" />
                            </button>
                        </div>
                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            {/* Identity Section */}
                            {activeModal === 'identity' && (
                                <div className="space-y-4">
                                    <CollapsibleSection
                                        title="1.1 Entity Profile & Legal Structure"
                                        description="Define organization type, jurisdiction, and legal framework"
                                        isExpanded={!!expandedSubsections['identity-entity']}
                                        onToggle={() => toggleSubsection('identity-entity')}
                                        color="from-blue-50 to-blue-100"
                                     >
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Organization Name <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={params.organizationName}
                                                        onChange={(e) => setParams({ ...params, organizationName: e.target.value })}
                                                        className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent ${isFieldInvalid('organizationName') ? 'border-red-500' : 'border-stone-200'}`}
                                                        placeholder="Enter organization name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Legal Entity Type <span className="text-red-500">*</span></label>
                                                    <select
                                                        value={params.organizationType}
                                                        onChange={(e) => setParams({ ...params, organizationType: e.target.value })}
                                                        className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent ${isFieldInvalid('organizationType') ? 'border-red-500' : 'border-stone-200'}`}
                                                    >
                                                        <option value="">Select type</option>
                                                        <optgroup label="Common">
                                                            <option value="Corporation (C-Corp)">Corporation (C-Corp)</option>
                                                            <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                                                            <option value="S Corporation (S-Corp)">S Corporation (S-Corp)</option>
                                                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                                                            <option value="Partnership">Partnership</option>
                                                        </optgroup>
                                                        <optgroup label="Specialized">
                                                            <option value="Non-Profit (e.g., 501(c)(3))">Non-Profit (e.g., 501(c)(3))</option>
                                                            <option value="Government Entity">Government Entity</option>
                                                            <option value="Publicly Traded Company">Publicly Traded Company</option>
                                                            <option value="Private Limited Company (Ltd.)">Private Limited Company (Ltd.)</option>
                                                            <option value="Joint Venture">Joint Venture</option>
                                                            <option value="Cooperative">Cooperative</option>
                                                        </optgroup>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Country of Incorporation <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={params.country}
                                                        onChange={(e) => setParams({ ...params, country: e.target.value })}
                                                        className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent ${isFieldInvalid('country') ? 'border-red-500' : 'border-stone-200'}`}
                                                        placeholder="e.g., USA, Singapore"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Operating Regions</label>
                                                    <input
                                                        type="text"
                                                        value={params.region}
                                                        onChange={(e) => setParams({ ...params, region: e.target.value })}
                                                        className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                                                        placeholder="e.g., North America, Southeast Asia"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleSection>


                                    <CollapsibleSection
                                        title="1.2 Capability Assessment"
                                        description="Evaluate organizational capabilities, resources, and competencies"
                                        isExpanded={!!expandedSubsections['identity-capability']}
                                        onToggle={() => toggleSubsection('identity-capability')}
                                        color="from-blue-50 to-blue-100"
                                    >
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Revenue Band</label>
                                                    <select
                                                        value={params.revenueBand || ''}
                                                        onChange={(e) => setParams({ ...params, revenueBand: e.target.value })}
                                                        className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                                                    >
                                                        <option value="">Select revenue...</option>
                                                        <option value="$0-1M">$0-1M</option>
                                                        <option value="$1-10M">$1-10M</option>
                                                        <option value="$10-50M">$10-50M</option>
                                                        <option value="$50M+">$50M+</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Headcount Band</label>
                                                    <select
                                                        value={params.headcountBand || ''}
                                                        onChange={(e) => setParams({ ...params, headcountBand: e.target.value })}
                                                        className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                                                    >
                                                        <option value="">Select headcount...</option>
                                                        <option value="1-10">1-10</option>
                                                        <option value="11-50">11-50</option>
                                                        <option value="51-200">51-200</option>
                                                        <option value="201-1000">201-1000</option>
                                                        <option value="1000+">1000+</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Organization Sub-Type</label>
                                                <input
                                                    type="text"
                                                    value={params.organizationSubType || ''}
                                                    onChange={(e) => setParams({ ...params, organizationSubType: e.target.value })}
                                                    className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                                                    placeholder="e.g., Publicly Traded, Non-Profit, B-Corp"
                                                />
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="1.3 Market Positioning & Brand Strategy"
                                        description="Define competitive positioning, brand strategy, and market differentiation"
                                        isExpanded={!!expandedSubsections['identity-positioning']}
                                        onToggle={() => toggleSubsection('identity-positioning')}
                                        color="from-emerald-50 to-emerald-100"
                                     >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Industry</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {["Technology", "Finance", "Healthcare", "Manufacturing", "Energy", "Consumer Goods", "Real Estate", "Retail", "Logistics", "Media", "Aerospace", "Education"].map(ind => (
                                                        <label key={ind} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={params.industry?.includes(ind)}
                                                                onChange={() => {
                                                                    const currentIndustries = params.industry || [];
                                                                    const newIndustries = currentIndustries.includes(ind)
                                                                        ? currentIndustries.filter(i => i !== ind)
                                                                        : [...currentIndustries, ind];
                                                                    setParams({ ...params, industry: newIndustries });
                                                                }}
                                                                className="h-4 w-4 text-bw-navy focus:ring-bw-gold"
                                                            /> 
                                                            <span className="text-sm">{ind}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Niche Areas or Specializations</label>
                                                <textarea value={params.nicheAreas?.join(', ') || ''} onChange={(e) => setParams({ ...params, nicheAreas: e.target.value.split(',').map(s => s.trim()) })} className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent" placeholder="e.g., AI in Drug Discovery, Fintech for SMEs"/>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                     <CollapsibleSection
                                        title="1.4 Strategic Intent & Vision"
                                        description="Articulate long-term vision, mission, and strategic objectives"
                                        isExpanded={!!expandedSubsections['identity-intent']}
                                        onToggle={() => toggleSubsection('identity-intent')}
                                        color="from-violet-50 to-violet-100">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Primary Strategic Intent <span className="text-red-500">*</span></label>
                                                    <select
                                                        value={params.strategicIntent[0] || ''}
                                                        onChange={(e) => {
                                                            const primary = e.target.value;
                                                            const supporting = (params.strategicIntent || []).filter(i => i !== primary);
                                                            setParams({ ...params, strategicIntent: primary ? [primary, ...supporting] : supporting });
                                                        }}
                                                        className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                                                    >
                                                        <option value="">Select primary goal...</option>
                                                        {GLOBAL_STRATEGIC_INTENTS.map(intent => (
                                                            <option key={intent} value={intent}>{intent}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Scope / Level (multi-select)</label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {INTENT_SCOPE_OPTIONS.map(scope => (
                                                            <label key={scope} className="flex items-center gap-2 p-2 border rounded hover:bg-stone-50 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(params.intentScope || []).includes(scope)}
                                                                    onChange={() => {
                                                                        const current = params.intentScope || [];
                                                                        const next = current.includes(scope) ? current.filter(s => s !== scope) : [...current, scope];
                                                                        setParams({ ...params, intentScope: next });
                                                                    }}
                                                                    className="h-4 w-4 text-bw-navy focus:ring-bw-gold"
                                                                />
                                                                <span className="text-xs text-stone-700">{scope}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Supporting Strategic Intents (global library, multi-select)</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-stone-200 rounded p-2">
                                                    {GLOBAL_STRATEGIC_INTENTS.map(intent => (
                                                        <label key={intent} className="flex items-start gap-2 p-2 rounded hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={params.strategicIntent.includes(intent)}
                                                                onChange={() => {
                                                                    const exists = params.strategicIntent.includes(intent);
                                                                    const filtered = params.strategicIntent.filter(i => i !== intent);
                                                                    const next = exists ? filtered : [...params.strategicIntent, intent];
                                                                    const primary = params.strategicIntent[0];
                                                                    const normalized = primary && next.includes(primary)
                                                                        ? [primary, ...next.filter(i => i !== primary)]
                                                                        : next;
                                                                    setParams({ ...params, strategicIntent: Array.from(new Set(normalized)) });
                                                                }}
                                                                className="h-4 w-4 mt-0.5 text-bw-navy focus:ring-bw-gold"
                                                            />
                                                            <span className="text-xs text-stone-700 leading-snug">{intent}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Vision Narrative (long-term)</label>
                                                    <textarea
                                                        value={params.visionStatement || ''}
                                                        onChange={(e) => setParams({ ...params, visionStatement: e.target.value })}
                                                        className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent h-20"
                                                        placeholder="e.g., Build a pan-regional logistics backbone that doubles trade velocity and lowers cost-to-serve"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Mission / Strategic Objective (3-5 years)</label>
                                                    <textarea
                                                        value={params.missionStatement || ''}
                                                        onChange={(e) => setParams({ ...params, missionStatement: e.target.value })}
                                                        className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent h-20"
                                                        placeholder="e.g., Achieve $5B FDI, 150k jobs, and 35% domestic value-add across the target corridor"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Economic & Development Outcomes (multi-select)</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {DEVELOPMENT_OUTCOME_OPTIONS.map(outcome => (
                                                        <label key={outcome} className="flex items-start gap-2 p-2 border rounded hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(params.developmentOutcomes || []).includes(outcome)}
                                                                onChange={() => {
                                                                    const current = params.developmentOutcomes || [];
                                                                    const next = current.includes(outcome) ? current.filter(o => o !== outcome) : [...current, outcome];
                                                                    setParams({ ...params, developmentOutcomes: next });
                                                                }}
                                                                className="h-4 w-4 mt-0.5 text-bw-navy focus:ring-bw-gold"
                                                            />
                                                            <span className="text-xs text-stone-700 leading-snug">{outcome}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Problem Statement <span className="text-red-500">*</span></label>
                                                <textarea value={params.problemStatement} onChange={(e) => setParams({ ...params, problemStatement: e.target.value })} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent h-24 ${isFieldInvalid('problemStatement') ? 'border-red-500' : 'border-stone-200'}`} placeholder="Describe the core problem this strategy aims to solve."/>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="1.5 Risk Appetite & Tolerance Framework"
                                        description="Define risk tolerance levels and governance framework"
                                        isExpanded={!!expandedSubsections['risk-appetite']}
                                        onToggle={() => toggleSubsection('risk-appetite')}
                                        color="from-amber-50 to-amber-100"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Risk Tolerance <span className="text-red-500">*</span></label>
                                                <select value={params.riskTolerance} onChange={(e) => setParams({ ...params, riskTolerance: e.target.value })} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent ${isFieldInvalid('riskTolerance') ? 'border-red-500' : 'border-stone-200'}`}>
                                                    <option value="">Select risk tolerance...</option>
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Funding Source</label>
                                                <select value={params.fundingSource} onChange={(e) => setParams({ ...params, fundingSource: e.target.value })} className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent">
                                                    <option value="">Select funding source...</option>
                                                    <optgroup label="Equity">
                                                        <option value="Bootstrapped">Bootstrapped</option>
                                                        <option value="Angel Investors">Angel Investors</option>
                                                        <option value="Venture Capital">Venture Capital</option>
                                                        <option value="Private Equity">Private Equity</option>
                                                    </optgroup>
                                                    <optgroup label="Debt & Other">
                                                        <option value="Debt Financing">Debt Financing</option>
                                                        <option value="Government Grants">Government Grants</option>
                                                        <option value="Internal Capital">Internal Capital</option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )}
                            {activeModal === 'mandate' && (
                                <div className="space-y-4">
                                    <CollapsibleSection
                                        title="2.1 Strategic Objectives & KPIs"
                                        description="Define measurable objectives and key performance indicators"
                                        isExpanded={!!expandedSubsections['mandate-objectives']}
                                        onToggle={() => toggleSubsection('mandate-objectives')}
                                        color="from-green-50 to-green-100"
                                     >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Strategic Objectives (global library, multi-select) <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto border border-stone-200 rounded p-2">
                                                    {GLOBAL_STRATEGIC_INTENTS.map(obj => (
                                                        <label key={obj} className="flex items-start gap-2 p-2 rounded hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(params.strategicObjectives || []).includes(obj)}
                                                                onChange={() => {
                                                                    const current = params.strategicObjectives || [];
                                                                    const next = current.includes(obj) ? current.filter(o => o !== obj) : [...current, obj];
                                                                    setParams({ ...params, strategicObjectives: next });
                                                                }}
                                                                className="h-4 w-4 mt-0.5 text-bw-navy focus:ring-bw-gold"
                                                            />
                                                            <span className="text-xs text-stone-700 leading-snug">{obj}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Scope / Level (for objectives)</label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {INTENT_SCOPE_OPTIONS.map(scope => (
                                                            <label key={scope} className="flex items-center gap-2 p-2 border rounded hover:bg-stone-50 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(params.intentScope || []).includes(scope)}
                                                                    onChange={() => {
                                                                        const current = params.intentScope || [];
                                                                        const next = current.includes(scope) ? current.filter(s => s !== scope) : [...current, scope];
                                                                        setParams({ ...params, intentScope: next });
                                                                    }}
                                                                    className="h-4 w-4 text-bw-navy focus:ring-bw-gold"
                                                                />
                                                                <span className="text-xs text-stone-700">{scope}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Economic & Development Outcomes</label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {DEVELOPMENT_OUTCOME_OPTIONS.map(outcome => (
                                                            <label key={outcome} className="flex items-center gap-2 p-2 border rounded hover:bg-stone-50 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(params.developmentOutcomes || []).includes(outcome)}
                                                                    onChange={() => {
                                                                        const current = params.developmentOutcomes || [];
                                                                        const next = current.includes(outcome) ? current.filter(o => o !== outcome) : [...current, outcome];
                                                                        setParams({ ...params, developmentOutcomes: next });
                                                                    }}
                                                                    className="h-4 w-4 text-bw-navy focus:ring-bw-gold"
                                                                />
                                                                <span className="text-xs text-stone-700">{outcome}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-1">
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Problem Statement <span className="text-red-500">*</span></label>
                                                <textarea
                                                    value={params.problemStatement}
                                                    onChange={(e) => setParams({ ...params, problemStatement: e.target.value })}
                                                    className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent h-24 ${isFieldInvalid('problemStatement') ? 'border-red-500' : 'border-stone-200'}`}
                                                     placeholder="Describe the core problem this partnership aims to solve."
                                                />
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="2.2 Target Partner Profiling"
                                        description="Define ideal partner characteristics and selection criteria"
                                        isExpanded={!!expandedSubsections['mandate-profiling']}
                                        onToggle={() => toggleSubsection('mandate-profiling')}
                                        color="from-green-50 to-green-100"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Ideal Partner Profile</label>
                                                <textarea
                                                    value={params.idealPartnerProfile}
                                                    onChange={(e) => setParams({ ...params, idealPartnerProfile: e.target.value })}
                                                    className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent h-24"
                                                    placeholder="Describe the ideal partner (e.g., size, industry, capabilities, culture)."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Target Counterpart Type (global catalog)</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto border border-stone-200 rounded p-2">
                                                    {GLOBAL_COUNTERPART_TYPES.map(ct => (
                                                        <label key={ct} className="flex items-start gap-2 p-2 rounded hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(params.targetCounterpartType || []).includes(ct)}
                                                                onChange={() => {
                                                                    const current = params.targetCounterpartType || [];
                                                                    const next = current.includes(ct) ? current.filter(c => c !== ct) : [...current, ct];
                                                                    setParams({ ...params, targetCounterpartType: next });
                                                                }}
                                                                className="h-4 w-4 mt-0.5 text-bw-navy focus:ring-bw-gold"
                                                            />
                                                            <span className="text-xs text-stone-700 leading-snug">{ct}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={params.corridorFocus || ''}
                                                    onChange={(e) => setParams({ ...params, corridorFocus: e.target.value })}
                                                    className="mt-2 w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                                                    placeholder="Optional: corridor / zone focus (e.g., ASEAN corridor, SEZ name)"
                                                />
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="2.3 Value Proposition Development"
                                        description="Craft compelling value propositions for potential partners"
                                        isExpanded={!!expandedSubsections['mandate-proposition']}
                                        onToggle={() => toggleSubsection('mandate-proposition')}
                                        color="from-purple-50 to-purple-100"
                                     >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Success Metrics (comma-separated)</label>
                                                <textarea
                                                    value={params.successMetrics?.join(', ') || ''}
                                                    onChange={(e) => setParams({ ...params, successMetrics: e.target.value.split(',').map(s => s.trim()) })}
                                                    className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent h-24"
                                                    placeholder="e.g., 20% market share increase, $5M in new revenue, Launch in 2 new countries"
                                                />
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="2.4 Negotiation Strategy & Terms"
                                        description="Define negotiation approach and key terms framework"
                                        isExpanded={!!expandedSubsections['mandate-negotiation']}
                                        onToggle={() => toggleSubsection('mandate-negotiation')}
                                        color="from-orange-50 to-orange-100"
                                     >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Due Diligence Depth</label>
                                                <select value={params.dueDiligenceDepth} onChange={(e) => setParams({...params, dueDiligenceDepth: e.target.value})} className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent">
                                                    <option value="">Select depth...</option>
                                                    <option value="Standard">Standard</option>
                                                    <option value="Enhanced">Enhanced</option>
                                                    <option value="Deep Dive">Deep Dive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="2.5 Governance & Integration Planning"
                                        description="Plan partnership governance structure and integration approach"
                                        isExpanded={!!expandedSubsections['mandate-governance']}
                                        onToggle={() => toggleSubsection('mandate-governance')}
                                        color="from-red-50 to-red-100"
                                     >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Governance Model(s)</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {["Joint Venture (JV)", "Strategic Alliance", "Licensing", "Distribution", "Equity Investment", "Consortium", "PPP / Concession", "SPV / ProjectCo"].map(model => (
                                                        <label key={model} className="flex items-center gap-2 p-2 border rounded hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(params.governanceModels || []).includes(model)}
                                                                onChange={() => {
                                                                    const current = params.governanceModels || [];
                                                                    const next = current.includes(model) ? current.filter((m: string) => m !== model) : [...current, model];
                                                                    setParams({ ...params, governanceModels: next });
                                                                }}
                                                                className="h-4 w-4 text-bw-navy focus:ring-bw-gold"
                                                            />
                                                            <span className="text-xs text-stone-700">{model}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Decision Rights & Vetoes</label>
                                                    <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-20" placeholder="Board seats, veto rights, reserved matters, quorum rules" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-700 mb-1">Operating Cadence & Escalation</label>
                                                    <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-20" placeholder="Steering committee cadence, SLAs, escalation path, RACI" />
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="2.6 Execution & Operations"
                                        description="Define operational priorities and timelines"
                                        isExpanded={!!expandedSubsections['mandate-execution']}
                                        onToggle={() => toggleSubsection('mandate-execution')}
                                        color="from-indigo-50 to-indigo-100"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Operational Priority</label>
                                                <input type="text" value={params.operationalPriority} onChange={(e) => setParams({...params, operationalPriority: e.target.value})} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., Speed to market, Cost efficiency"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Expansion Timeline</label>
                                                <select value={params.expansionTimeline} onChange={(e) => setParams({...params, expansionTimeline: e.target.value})} className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent">
                                                    <option value="">Select timeline...</option>
                                                    {TIME_HORIZON_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Critical Path / Milestones</label>
                                                <textarea value={params.milestonePlan || ''} onChange={(e) => setParams({ ...params, milestonePlan: e.target.value })} className="w-full p-2 border border-stone-200 rounded text-sm h-20 focus:ring-1 focus:ring-bw-gold focus:border-transparent" placeholder="Gate reviews, pilot/soft launch, hard launch, stabilization"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Base Currency & FX Assumption</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <select value={params.currency || ''} onChange={(e) => setParams({ ...params, currency: e.target.value })} className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent">
                                                        <option value="">Select currency...</option>
                                                        {CURRENCY_OPTIONS.map(cur => (<option key={cur} value={cur}>{cur}</option>))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={params.fxAssumption || ''}
                                                        onChange={(e) => setParams({ ...params, fxAssumption: e.target.value })}
                                                        className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                                                        placeholder="e.g., USD base, +/-5% fx swing"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )}
                            {activeModal === 'partner-personas' && (
    <div className="space-y-4">
        <CollapsibleSection
            title="4.1 Persona Definition"
            description="Define the key characteristics of your ideal partner personas."
            isExpanded={!!expandedSubsections['partner-personas-definition']}
            onToggle={() => toggleSubsection('partner-personas-definition')}
            color="from-yellow-50 to-yellow-100"
        >
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Partner Personas <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                        {params.partnerPersonas?.map((persona, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={persona}
                                    onChange={(e) => {
                                        const newPersonas = [...(params.partnerPersonas || [])];
                                        newPersonas[index] = e.target.value;
                                        setParams({ ...params, partnerPersonas: newPersonas });
                                    }}
                                    className="w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent"
                                    placeholder={`Persona ${index + 1}`}
                                />
                                <button
                                    onClick={() => {
                                        const newPersonas = [...(params.partnerPersonas || [])];
                                        newPersonas.splice(index, 1);
                                        setParams({ ...params, partnerPersonas: newPersonas });
                                    }}
                                    className="p-2 rounded-full hover:bg-stone-100"
                                >
                                    <X size={16} className="text-stone-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const newPersonas = [...(params.partnerPersonas || []), ''];
                            setParams({ ...params, partnerPersonas: newPersonas });
                        }}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} />
                        Add Persona
                    </button>
                </div>
            </div>
        </CollapsibleSection>
    </div>
)}
                            {activeModal === 'market' && (
                                <div className="space-y-4">
                                    <CollapsibleSection
                                        title="3.1 Target Market Definition"
                                        description="Define geographic and demographic target markets"
                                        isExpanded={!!expandedSubsections['market-target']}
                                        onToggle={() => toggleSubsection('market-target')}
                                        color="from-purple-50 to-purple-100"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Target City / Region <span className="text-red-500">*</span></label>
                                                <input type="text" value={params.userCity || ''} onChange={(e) => setParams({ ...params, userCity: e.target.value })} className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent ${isFieldInvalid('userCity') ? 'border-red-500' : 'border-stone-200'}`} placeholder="e.g., Silicon Valley, Singapore"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Target Market Size (TAM)</label>
                                                <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., $5B"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Market Growth Rate (CAGR)</label>
                                                <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 12%"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Analysis Timeframe</label>
                                                <select value={params.analysisTimeframe} onChange={(e) => setParams({...params, analysisTimeframe: e.target.value})} className="w-full p-2 border border-stone-200 rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent">
                                                    <option value="1-Year">1-Year</option>
                                                    <option value="3-Year">3-Year</option>
                                                    <option value="5-Year">5-Year</option>
                                                </select>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="3.2 Competitive Landscape"
                                        description="Analyze key competitors, their market share, and your advantages"
                                        isExpanded={!!expandedSubsections['market-competitive']}
                                        onToggle={() => toggleSubsection('market-competitive')}
                                        color="from-purple-50 to-purple-100"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Key Competitors & Market Share</label>
                                                <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="e.g., Competitor A (40% share), Competitor B (25% share)..."/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Your Competitive Advantages</label>
                                                <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="e.g., Proprietary technology, exclusive distribution rights, lower cost structure..."/>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="3.3 Customer Segmentation"
                                        description="Define target customer profiles and their unmet needs"
                                        isExpanded={!!expandedSubsections['market-customer']}
                                        onToggle={() => toggleSubsection('market-customer')}
                                        color="from-purple-50 to-purple-100"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Target Customer Profile</label>
                                                <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Describe your ideal customer: their industry, size, budget, and role."/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Customer Pain Points</label>
                                                <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="What critical problems do your target customers face that you can solve?"/>
                                            </div>
                                        </div>
                                    </CollapsibleSection>

                                    <CollapsibleSection
                                        title="3.4 Regulatory & Economic Factors"
                                        description="Detail the legal, compliance, and financial environment"
                                        isExpanded={!!expandedSubsections['market-regulatory']}
                                        onToggle={() => toggleSubsection('market-regulatory')}
                                        color="from-purple-50 to-purple-100"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Regulatory & Compliance Issues</label>
                                                <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="e.g., GDPR in Europe, data sovereignty laws, industry-specific certifications required."/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Macro Factors (select all)</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {MACRO_FACTOR_OPTIONS.map(item => (
                                                        <label key={item} className="flex items-start gap-2 p-2 border rounded hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(params.macroFactors || []).includes(item)}
                                                                onChange={() => {
                                                                    const current = params.macroFactors || [];
                                                                    const next = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
                                                                    setParams({ ...params, macroFactors: next });
                                                                }}
                                                                className="h-4 w-4 mt-0.5 text-bw-navy focus:ring-bw-gold"
                                                            />
                                                            <span className="text-xs text-stone-700 leading-snug">{item}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Regulatory Focus Areas</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {REGULATORY_FACTOR_OPTIONS.map(item => (
                                                        <label key={item} className="flex items-start gap-2 p-2 border rounded hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(params.regulatoryFactors || []).includes(item)}
                                                                onChange={() => {
                                                                    const current = params.regulatoryFactors || [];
                                                                    const next = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
                                                                    setParams({ ...params, regulatoryFactors: next });
                                                                }}
                                                                className="h-4 w-4 mt-0.5 text-bw-navy focus:ring-bw-gold"
                                                            />
                                                            <span className="text-xs text-stone-700 leading-snug">{item}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Economic & Incentive Factors</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {ECONOMIC_FACTOR_OPTIONS.map(item => (
                                                        <label key={item} className="flex items-start gap-2 p-2 border rounded hover:bg-stone-50 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(params.economicFactors || []).includes(item)}
                                                                onChange={() => {
                                                                    const current = params.economicFactors || [];
                                                                    const next = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
                                                                    setParams({ ...params, economicFactors: next });
                                                                }}
                                                                className="h-4 w-4 mt-0.5 text-bw-navy focus:ring-bw-gold"
                                                            />
                                                            <span className="text-xs text-stone-700 leading-snug">{item}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )}
                            {activeModal === 'risk' && (
                                <div className="space-y-4">
                                    <CollapsibleSection
                                        title="4.1 Risk Identification & Assessment"
                                        description="Identify and evaluate key partnership risks"
                                        isExpanded={!!expandedSubsections['risk-assessment']}
                                        onToggle={() => toggleSubsection('risk-assessment')}
                                        color="from-red-50 to-red-100"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Primary Risk Concerns <span className="text-red-500">*</span></label>
                                                <textarea
                                                    value={params.riskPrimaryConcerns || ''}
                                                    onChange={(e) => setParams({ ...params, riskPrimaryConcerns: e.target.value })}
                                                    className={`w-full p-2 border rounded text-sm focus:ring-1 focus:ring-bw-gold focus:border-transparent h-24 ${isFieldInvalid('riskTolerance') ? 'border-red-500' : 'border-stone-200'}`}
                                                    placeholder="List main risks: financial, operational, reputational, geopolitical, etc."
                                                />
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="4.2 Mitigation & Contingency"
                                        description="Develop strategies to minimize risks and plan for failure"
                                        isExpanded={!!expandedSubsections['risk-mitigation']}
                                        onToggle={() => toggleSubsection('risk-mitigation')}
                                        color="from-red-50 to-red-100"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Risk Mitigation Strategies</label>
                                                <textarea
                                                    value={params.riskMitigationSummary || ''}
                                                    onChange={(e) => setParams({ ...params, riskMitigationSummary: e.target.value })}
                                                    className="w-full p-2 border border-stone-200 rounded text-sm h-24"
                                                    placeholder="For each risk identified, what is the plan to reduce its likelihood or impact?"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Contingency Plans</label>
                                                <textarea
                                                    value={params.contingencyPlans || ''}
                                                    onChange={(e) => setParams({ ...params, contingencyPlans: e.target.value })}
                                                    className="w-full p-2 border border-stone-200 rounded text-sm h-24"
                                                    placeholder="What are the backup plans if a major risk materializes? What are the exit triggers?"
                                                />
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                    <CollapsibleSection
                                        title="4.3 Monitoring & Reporting"
                                        description="Establish processes for ongoing risk tracking and reporting"
                                        isExpanded={!!expandedSubsections['risk-monitoring']}
                                        onToggle={() => toggleSubsection('risk-monitoring')}
                                        color="from-red-50 to-red-100"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Key Risk Indicators (KRIs)</label>
                                                <textarea
                                                    value={params.riskKriNotes || ''}
                                                    onChange={(e) => setParams({ ...params, riskKriNotes: e.target.value })}
                                                    className="w-full p-2 border border-stone-200 rounded text-sm h-24"
                                                    placeholder="What specific metrics will be tracked to monitor risk levels? (e.g., currency fluctuation %, partner dependency ratio)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Reporting Frequency</label>
                                                <select
                                                    value={params.riskReportingCadence || ''}
                                                    onChange={(e) => setParams({ ...params, riskReportingCadence: e.target.value })}
                                                    className="w-full p-2 border border-stone-200 rounded text-sm"
                                                >
                                                    <option value="">Select cadence...</option>
                                                    <option value="Weekly">Weekly</option>
                                                    <option value="Monthly">Monthly</option>
                                                    <option value="Quarterly">Quarterly</option>
                                                    <option value="Semi-Annual">Semi-Annual</option>
                                                </select>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )}
                             {activeModal === 'analysis' && modalView === 'main' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {toolCategories.analysis.map(tool => (
                                        <button key={tool.id} onClick={() => setModalView(tool.id)} className="p-4 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition-all text-left group">
                                            <div className="flex items-center gap-3 mb-2">
                                                <tool.icon className="w-6 h-6 text-indigo-600" />
                                                <span className="text-sm font-bold text-stone-900">{tool.label}</span>
                                            </div>
                                            <p className="text-xs text-stone-600">{tool.description}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {activeModal === 'analysis' && modalView === 'roi-diagnostic' && (
                                <div>
                                    <button onClick={() => setModalView('main')} className="text-sm text-blue-600 mb-4">&larr; Back to Analysis Tools</button>
                                    <h3 className="text-lg font-bold mb-4">ROI Diagnostic Configuration</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Estimated Initial Investment ($)</label>
                                                <input type="number" value={roiInputs.investment} onChange={e => setRoiInputs(p => ({...p, investment: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 500000"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Projected Annual Revenue ($)</label>
                                                <input type="number" value={roiInputs.revenue} onChange={e => setRoiInputs(p => ({...p, revenue: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 200000"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-700 mb-1">Operational Costs ($/year)</label>
                                                <input type="number" value={roiInputs.costs} onChange={e => {
                                                    setRoiInputs(p => ({...p, costs: e.target.value}));
                                                    setRoiResult(null);
                                                }} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 75000"/>
                                            </div>
                                            <button onClick={calculateRoi} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Analyze ROI</button>
                                        </div>
                                        <div>
                                            {roiResult && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 h-full">
                                                    <h4 className="font-bold text-blue-900">Analysis Result</h4>
                                                    <p className="text-sm"><strong>Return on Investment (ROI):</strong> <span className={`font-bold text-lg ${roiResult.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>{roiResult.roi.toFixed(1)}%</span></p>
                                                    <p className="text-sm"><strong>Internal Rate of Return (IRR):</strong> <span className="font-bold text-lg">{roiResult.irr.toFixed(1)}%</span></p>
                                                    <p className="text-sm"><strong>Payback Period:</strong> <span className="font-bold text-lg">{roiResult.payback.toFixed(2)} years</span></p>
                                                </div>
                                            )}
                                            {!roiResult && (
                                                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 h-full flex items-center justify-center">
                                                    <p className="text-sm text-stone-500">Results will be displayed here.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'analysis' && modalView === 'due-diligence' && (
                                <div>
                                    <button onClick={() => setModalView('main')} className="text-sm text-blue-600 mb-4">&larr; Back to Analysis Tools</button>
                                    <h3 className="text-lg font-bold mb-4">Due Diligence Engine</h3>
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Target Company Name</label>
                                        <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="Enter company name to run due diligence on"/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'analysis' && modalView === 'scenario-planning' && (
                                <div>
                                    <button onClick={() => setModalView('main')} className="text-sm text-blue-600 mb-4">&larr; Back to Analysis Tools</button>
                                    <h3 className="text-lg font-bold mb-4">Scenario Planning</h3>
                                    <p className="text-sm text-stone-600 mb-4">Define multiple scenarios to model potential outcomes for your strategy.</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Scenario 1: Best Case</label>
                                            <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-20" placeholder="e.g., Rapid market adoption, 50% YoY growth."/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Scenario 2: Base Case</label>
                                            <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-20" placeholder="e.g., Steady growth, 20% YoY, moderate competition."/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Scenario 3: Worst Case</label>
                                            <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-20" placeholder="e.g., Economic downturn, new major competitor enters."/>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'analysis' && modalView === 'financial-modeling' && (
                                <p>Financial Modeling interactive tool would be here.</p>
                            )}
                            {activeModal === 'marketplace' && modalView === 'main' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {toolCategories.marketplace.map(tool => (
                                        <button key={tool.id} onClick={() => setModalView(tool.id)} className="p-4 bg-white border border-stone-200 rounded-lg hover:shadow-md hover:border-pink-300 transition-all text-left group">
                                            <div className="flex items-center gap-3 mb-2">
                                                <tool.icon className="w-6 h-6 text-pink-600" />
                                                <span className="text-sm font-bold text-stone-900">{tool.label}</span>
                                            </div>
                                            <p className="text-xs text-stone-600">{tool.description}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {activeModal === 'marketplace' && modalView === 'compatibility-engine' && (
                                <div>
                                    <button onClick={() => setModalView('main')} className="text-sm text-blue-600 mb-4">&larr; Back to Marketplace Tools</button>
                                    <h3 className="text-lg font-bold mb-4">Partner Compatibility Engine</h3>
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Potential Partner Name</label>
                                        <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="Enter a company name to analyze synergy"/>
                                    </div>
                                </div>
                            )}
                             {activeModal === 'generation' && (
                                <p>This modal is now deprecated in favor of the new finalization workflow.</p>
                            )}
                            {/* --- DOCUMENT GENERATION SUITE MODALS --- */}
                            {activeModal === 'doc-summary' && ( // Executive Summary
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Generates a high-level summary of the entire strategic roadmap. Ideal for circulating to stakeholders who need a quick overview of the key findings and recommendations.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Report Length</label>
                                        <select onChange={e => setGenerationConfig(p => ({...p, length: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm"><option>1-Page Brief</option><option>3-Page Standard</option><option>5-Page Detailed</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Target Audience</label>
                                        <select onChange={e => setGenerationConfig(p => ({...p, audience: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm"><option>Investor</option><option>Executive Board</option><option>Legal Team</option><option>Technical Team</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Key Sections to Emphasize</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Market Opportunity", "Financial Projections", "Risk Mitigation", "Team Strength"].map(sec => (
                                                <label key={sec} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                    <input type="checkbox" onChange={e => setGenerationConfig(p => ({...p, emphasized: {...(p.emphasized as Record<string, boolean> || {}), [sec]: e.target.checked}}))} className="h-4 w-4 text-bw-navy focus:ring-bw-gold"/>
                                                    <span className="text-sm">{sec}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Specific Instructions or Custom Requests</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="e.g., 'Focus heavily on the competitive advantage section.'"/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'doc-bi' && ( // Business Intelligence
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Generates a deep-dive report on a specific country or region, leveraging advanced analytical modules. Essential for market entry and geopolitical risk assessment.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Focus Country/Region</label>
                                        <input type="text" value={params.userCity || params.country} className="w-full p-2 border border-stone-200 rounded text-sm bg-stone-50" readOnly/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Analytical Modules to Include</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Geopolitical Analysis", "Governance Audit", "RROI Index", "Temporal Market Analysis"].map(mod => (
                                                <label key={mod} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                    <input type="checkbox" className="h-4 w-4 text-bw-navy focus:ring-bw-gold"/>
                                                    <span className="text-sm">{mod}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Comparative Context (Optional)</label>
                                        <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 'Compare against Singapore'"/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'doc-analyzer' && ( // Partnership Analyzer
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Analyzes an existing partnership to generate a Symbiotic Partnership Index (SPI) score, identifying strengths, weaknesses, and areas for improvement.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Partner Name</label>
                                        <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="Enter existing partner's name"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Partnership Details & History</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Describe the nature of the partnership, its goals, and current status."/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Known Risk Factors or Issues</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="e.g., 'Communication breakdown in Q2', 'Dependency on a single supplier'"/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'doc-diversification' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Analyzes market and revenue concentration using the Herfindahl-Hirschman Index (HHI) and recommends markets for diversification to reduce dependency risk.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Focus Sectors for Diversification</label>
                                        <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., Renewable Energy, SaaS, Healthcare IT"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Number of Recommendations</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Top 3</option><option>Top 5</option><option>Top 10</option></select>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'doc-ethics' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Performs an ethical and compliance check based on the provided data, flagging potential issues related to sanctions, labor practices, and corruption. Provides mitigation strategies.</p>
                                     <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Risk Threshold</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Low (Flag all potential issues)</option><option>Medium (Flag moderate to high-risk issues)</option><option>High (Flag only critical issues)</option></select>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'doc-precedent' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Compares the current venture against a database of historical cases, providing a probability of success, applicable success factors, and key warnings based on past outcomes.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Filter Historical Cases by Sector</label>
                                        <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 'Fintech', 'Biotechnology' (Optional)"/>
                                    </div>
                                </div>
                            )}

                            {/* --- LETTER GENERATION SUITE MODALS --- */}
                            {activeModal === 'letter-loi' && ( // Letter of Intent
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Drafts a formal Letter of Intent (LOI) to signal serious consideration of a partnership. This document outlines the broad terms before extensive due diligence.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Letter Style</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Formal</option><option>Standard</option><option>Collaborative</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Key Clauses to Include</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Binding Provisions", "Non-binding Provisions", "Confidentiality", "Exclusivity", "Termination"].map(clause => (
                                                <label key={clause} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                    <input type="checkbox" className="h-4 w-4 text-bw-navy focus:ring-bw-gold"/>
                                                    <span className="text-sm">{clause} Clause</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Exclusivity Period (days)</label>
                                        <input type="number" onChange={e => setGenerationConfig(p => ({...p, exclusivity: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 90"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Governing Law (Jurisdiction)</label>
                                        <input type="text" onChange={e => setGenerationConfig(p => ({...p, jurisdiction: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., State of Delaware, USA"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Specific Instructions or Custom Requests</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="e.g., 'Emphasize that the valuation is preliminary and subject to due diligence.'"/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'letter-termsheet' && ( // Term Sheet
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Generates a Term Sheet that lays out the material terms and conditions of a business agreement. This is a more detailed document than an LOI.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Valuation / Price ($)</label>
                                        <input type="number" onChange={e => setGenerationConfig(p => ({...p, valuation: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 10000000"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Investment Amount ($)</label>
                                        <input type="number" onChange={e => setGenerationConfig(p => ({...p, investment: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 2000000"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Liquidation Preference</label>
                                        <input type="text" onChange={e => setGenerationConfig(p => ({...p, preference: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 1x, Non-participating"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Board Seats</label>
                                        <input type="text" onChange={e => setGenerationConfig(p => ({...p, boardSeats: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 'One seat on the Board of Directors'"/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'letter-mou' && ( // Memorandum of Understanding
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Creates a Memorandum of Understanding (MOU) to express a convergence of will between parties, indicating a common line of intended action.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Key Objectives of the MOU</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="List the primary goals this MOU aims to achieve."/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Scope of Collaboration</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Define the areas and limits of the collaboration."/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Specific Instructions or Custom Requests</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="e.g., 'Include a section on joint marketing efforts.'"/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'letter-proposal' && ( // Formal Proposal
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Constructs a comprehensive formal proposal for a potential partner, detailing the project, value proposition, timeline, and costs.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Project Title</label>
                                        <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 'Proposal for Joint Venture in APAC Region'"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Key Deliverables</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="List the specific outcomes and deliverables of the proposed project."/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Proposed Budget & Payment Schedule</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Outline the financial aspects of the proposal."/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'letter-im' && ( // Investment Memo
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Creates a detailed internal memorandum to justify a capital investment for the proposed partnership or project, aimed at an investment committee or executive board.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Requested Investment Amount ($)</label>
                                        <input type="number" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., 5000000"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Use of Funds</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Detail how the investment will be allocated (e.g., 40% R&D, 30% Marketing, 30% Operations)."/>
                                    </div>
                                </div>
                            )}
                            {activeModal === 'letter-ddr' && ( // Due Diligence Request
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Generates a formal Due Diligence Request List to be sent to a potential partner. This document outlines the specific information and documentation required for your team to conduct its analysis.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Scope of Diligence</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Financials", "Legal & Corporate Structure", "Technical IP", "Human Resources"].map(scope => (
                                                <label key={scope} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer"><input type="checkbox" className="h-4 w-4 text-bw-navy focus:ring-bw-gold"/> <span className="text-sm">{scope}</span></label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add-in Toolbar Modals */}
                            {activeModal === 'add-pie-chart' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Add Pie Chart</h3>
                                    <div className="space-y-4">
                                        <div >
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Chart Title</label>
                                            <input type="text" value={chartConfig.title} onChange={(e) => setChartConfig(prev => ({...prev, title: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., Market Share Distribution"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Data Source</label>
                                            <select value={chartConfig.dataSource} onChange={(e) => setChartConfig(prev => ({...prev, dataSource: e.target.value}))} className="w-full p-2 border border-stone-200 rounded text-sm" disabled={!params.industry.length && !params.fundingSource}>
                                                <option value="">Select data to visualize...</option>
                                                {params.industry.length > 0 && <option value="industry">Industry Breakdown</option>}
                                                {/* Add a placeholder for competitor data */}
                                                <option value="competitor">Competitor Market Share</option>
                                                {params.fundingSource && <option value="funding">Funding Source Mix</option>}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Enhanced Modal Implementations for Full Feature Capacity */}

                            {/* Additional Document Generation Modals */}
                            {activeModal === 'doc-suite' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Generate comprehensive business documents including Letters of Intent, Memorandums of Understanding, partnership proposals, and formal business agreements.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Document Type</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Letter of Intent</option><option>Memorandum of Understanding</option><option>Partnership Proposal</option><option>Joint Venture Agreement</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Document Length</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Brief (1-2 pages)</option><option>Standard (3-5 pages)</option><option>Detailed (5+ pages)</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Include Sections</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Executive Summary", "Terms & Conditions", "Financial Projections", "Risk Assessment", "Governance Structure", "Exit Strategy"].map(sec => (
                                                <label key={sec} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                    <input type="checkbox" className="h-4 w-4 text-bw-navy focus:ring-bw-gold"/>
                                                    <span className="text-sm">{sec}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'doc-financial-model' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Generate detailed financial models and projections for your partnership opportunity.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Model Type</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Revenue Projection Model</option><option>Cost-Benefit Analysis</option><option>Cash Flow Model</option><option>ROI Calculator</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Time Horizon</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>1 Year</option><option>3 Years</option><option>5 Years</option><option>10 Years</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Key Assumptions</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Enter key financial assumptions..."/>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'doc-risk-assessment' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Comprehensive risk assessment report identifying, analyzing, and providing mitigation strategies for partnership risks.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Risk Categories to Include</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Financial Risk", "Operational Risk", "Legal Risk", "Market Risk", "Reputational Risk", "Geopolitical Risk"].map(risk => (
                                                <label key={risk} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="h-4 w-4 text-bw-navy focus:ring-bw-gold"/>
                                                    <span className="text-sm">{risk}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Risk Assessment Depth</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>High Level Overview</option><option>Detailed Analysis</option><option>Comprehensive Assessment</option></select>
                                    </div>
                                </div>
                            )}

                            {/* Additional Letter Generation Modals */}
                            {activeModal === 'letter-jv' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Generate a comprehensive Joint Venture Agreement outlining the terms, structure, and governance of the partnership.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">JV Structure</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>50/50 Partnership</option><option>Majority/Minority</option><option>Limited Partnership</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Governance Model</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Joint Board</option><option>Lead Partner Control</option><option>Independent Chairman</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Key Terms</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Specify key JV terms..."/>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'letter-nda' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Create a comprehensive Non-Disclosure Agreement to protect confidential information shared during partnership discussions.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Confidentiality Scope</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>All Information</option><option>Specified Information Only</option><option>Business Information</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Term Length</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>1 Year</option><option>2 Years</option><option>5 Years</option><option>Indefinite</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Permitted Disclosures</label>
                                        <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Specify exceptions to confidentiality..."/>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'letter-licensing' && (
                                <div className="space-y-6">
                                    <p className="text-sm text-stone-600">Generate licensing agreements for intellectual property, technology, or brand usage rights.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">License Type</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Exclusive License</option><option>Non-Exclusive License</option><option>Sole License</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Royalty Structure</label>
                                        <select className="w-full p-2 border border-stone-200 rounded text-sm"><option>Percentage of Revenue</option><option>Fixed Fee</option><option>Milestone Payments</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-700 mb-1">Territory</label>
                                        <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="Specify geographic territory..."/>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Add-in Tool Modals */}
                            {activeModal === 'add-bar-chart' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Add Bar Chart</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Chart Title</label>
                                            <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., Revenue Comparison"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Data Source</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option value="">Select data to visualize...</option>
                                                <option value="industry">Industry Breakdown</option>
                                                <option value="competitor">Competitor Market Share</option>
                                                <option value="funding">Funding Source Mix</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Chart Type</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Vertical Bars</option><option>Horizontal Bars</option><option>Stacked Bars</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'add-line-chart' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Add Line Chart</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Chart Title</label>
                                            <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., Growth Trajectory"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Time Period</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>1 Year</option><option>3 Years</option><option>5 Years</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Metrics to Plot</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {["Revenue", "Profit", "Market Share", "Customer Growth"].map(metric => (
                                                    <label key={metric} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                        <input type="checkbox" className="h-4 w-4"/>
                                                        <span className="text-sm">{metric}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'add-data-table' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Add Data Table</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Table Title</label>
                                            <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="e.g., Financial Summary"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Data Source</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Financial Data</option><option>Market Data</option><option>Operational Metrics</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Columns to Include</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {["Metric", "Current", "Target", "Variance", "Trend"].map(col => (
                                                    <label key={col} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                        <input type="checkbox" defaultChecked className="h-4 w-4"/>
                                                        <span className="text-sm">{col}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI Analysis Tool Modals */}
                            {activeModal === 'add-sentiment-analysis' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Sentiment Analysis</h3>
                                    <div className="space-y-4">
                                        <p className="text-sm text-stone-600">Analyze sentiment in partnership communications, market feedback, and stakeholder responses.</p>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Analysis Scope</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Partner Communications</option><option>Market Feedback</option><option>Stakeholder Surveys</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Time Period</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Last 30 Days</option><option>Last 90 Days</option><option>Last 6 Months</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'add-trend-analysis' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Trend Analysis</h3>
                                    <div className="space-y-4">
                                        <p className="text-sm text-stone-600">Identify and analyze market trends, partnership patterns, and strategic opportunities.</p>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Trend Category</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Market Trends</option><option>Partnership Trends</option><option>Technology Trends</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Analysis Depth</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Overview</option><option>Detailed Analysis</option><option>Predictive Modeling</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'add-risk-assessment' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Risk Assessment Module</h3>
                                    <div className="space-y-4">
                                        <p className="text-sm text-stone-600">Advanced risk modeling and assessment for partnership opportunities.</p>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Risk Categories</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {["Financial", "Operational", "Strategic", "Compliance", "Market", "Geopolitical"].map(risk => (
                                                    <label key={risk} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                        <input type="checkbox" defaultChecked className="h-4 w-4"/>
                                                        <span className="text-sm">{risk} Risk</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Assessment Method</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Quantitative</option><option>Qualitative</option><option>Mixed Methods</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'add-market-prediction' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Market Prediction Engine</h3>
                                    <div className="space-y-4">
                                        <p className="text-sm text-stone-600">AI-powered market forecasting and predictive analytics for strategic planning.</p>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Prediction Horizon</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>6 Months</option><option>1 Year</option><option>2 Years</option><option>5 Years</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Prediction Factors</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {["Economic Indicators", "Technology Trends", "Competitive Landscape", "Regulatory Changes", "Consumer Behavior", "Geopolitical Events"].map(factor => (
                                                    <label key={factor} className="flex items-center gap-2 p-2 border rounded-md hover:bg-stone-50 cursor-pointer">
                                                        <input type="checkbox" defaultChecked className="h-4 w-4"/>
                                                        <span className="text-sm">{factor}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Content Enhancement Modals */}
                            {activeModal === 'add-text-block' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Add Text Block</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Block Type</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Paragraph</option><option>Bullet Points</option><option>Callout Box</option><option>Quote</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Content</label>
                                            <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-32" placeholder="Enter your text content..."/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Styling</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Normal</option><option>Bold</option><option>Italic</option><option>Highlighted</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'add-quote' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Add Quote</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Quote Text</label>
                                            <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Enter the quote..."/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Attribution</label>
                                            <input type="text" className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="Who said this?"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Quote Style</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Large & Prominent</option><option>Sidebar Style</option><option>Inline Quote</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'add-callout' && (
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Add Callout Box</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Callout Type</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Important Note</option><option>Key Insight</option><option>Warning</option><option>Success Story</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Content</label>
                                            <textarea className="w-full p-2 border border-stone-200 rounded text-sm h-24" placeholder="Enter callout content..."/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 mb-1">Background Color</label>
                                            <select className="w-full p-2 border border-stone-200 rounded text-sm">
                                                <option>Blue</option><option>Green</option><option>Yellow</option><option>Red</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Placeholder for other modals */}
                            {activeModal && !['identity', 'mandate', 'market', 'risk', 'generation', 'analysis', 'marketplace', 'doc-summary', 'doc-bi', 'doc-analyzer', 'doc-diversification', 'doc-ethics', 'doc-precedent', 'doc-suite', 'doc-financial-model', 'doc-risk-assessment', 'letter-loi', 'letter-termsheet', 'letter-mou', 'letter-proposal', 'letter-im', 'letter-ddr', 'letter-jv', 'letter-nda', 'letter-licensing', 'add-pie-chart', 'add-bar-chart', 'add-line-chart', 'add-data-table', 'add-sentiment-analysis', 'add-trend-analysis', 'add-risk-assessment', 'add-market-prediction', 'add-text-block', 'add-quote', 'add-callout'].includes(activeModal) && modalView === 'main' && (
                                <div className="text-center text-stone-400 p-16">
                                    <h3 className="text-lg font-bold text-stone-700 mb-2">Configure {activeModal.replace(/-/g, ' ')}</h3>
                                    <p>Configuration options for this tool would appear here.</p>
                                </div>
                            )}
                        </div>
                        {/* Modal Footer */}
                        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center gap-4 shrink-0">
                            <div>
                                {validationErrors.length > 0 && <p className="text-xs text-red-600 font-bold">Please fill in all required fields (*).</p>}
                            </div>
                            <div className="flex items-center gap-4">
                            {activeModal?.startsWith('add-') ? (
                                <button onClick={handleAddChart} className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded shadow-lg hover:bg-green-700 transition-all">Add to Report</button>
                            )
                            : ['doc-suite', 'doc-summary', 'doc-bi', 'doc-analyzer', 'doc-diversification', 'doc-ethics', 'doc-precedent', 'letter-loi', 'letter-termsheet', 'letter-mou', 'letter-proposal', 'letter-im', 'letter-ddr', 'analysis', 'marketplace'].includes(activeModal || '') ? (
                                <button onClick={handleGenerateDocument} className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded shadow-lg hover:bg-green-700 transition-all">
                                    {activeModal?.startsWith('add-') ? 'Add to Report' : 'Generate Document'}
                                </button>
                            ) : activeModal !== 'generation' ? (
                                <button onClick={handleModalClose} className="px-6 py-2 bg-bw-navy text-white text-sm font-bold rounded shadow-lg hover:bg-stone-800 transition-all">
                                    Close
                                </button>
                            ) : null}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- FINALIZATION MODAL --- */}
        <AnimatePresence>
            {showFinalizationModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-8"
                    onClick={() => setShowFinalizationModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-stone-200">
                            <h2 className="text-2xl font-serif font-bold text-bw-navy">Official Report Selection</h2>
                            <p className="text-sm text-stone-600 mt-1">Select which official documents to generate. Each will be created based on the finalized draft data.</p>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reports.map(report => (
                                    <label key={report.id} className="p-4 border-2 rounded-lg cursor-pointer has-[:checked]:border-green-500 has-[:checked]:bg-green-50 transition-all">
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" checked={selectedFinalReports.includes(report.id)} onChange={() => handleFinalReportSelection(report.id)} className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-stone-300 rounded"/>
                                            <div>
                                                <div className="font-bold text-stone-900">{report.reportName}</div>
                                                <p className="text-xs text-stone-600 mt-1">{report.problemStatement || 'No description available'}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end items-center gap-4 shrink-0">
                            <button onClick={() => setShowFinalizationModal(false)} className="px-6 py-2 text-sm font-bold text-stone-600 hover:bg-stone-200 rounded">Cancel</button>
                            <button onClick={handleGenerateFinalDocs} disabled={selectedFinalReports.length === 0} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <CheckCircle size={20} />
                                Generate {selectedFinalReports.length} Official Document(s)
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- DOCUMENT GENERATION SUITE MODAL --- */}
        <AnimatePresence>
            {showDocGenSuite && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center"
                    onClick={() => setShowDocGenSuite(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-stone-50 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DocumentGenerationSuite
                            entityName={params.organizationName}
                            targetMarket={params.userCity}
                            reportData={reportData}
                            reportParams={params}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- RIGHT PANEL: THE ARTIFACT (OUTPUT) --- */}
        <div className="flex-1 bg-stone-200 relative flex flex-col items-center overflow-hidden" style={{ flexBasis: '70%' }}>
            {/* Toolbar Header */}
            <div className="w-full h-16 bg-white/80 backdrop-blur border-b border-stone-300 flex items-center justify-between px-8 z-10 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                    <History className="w-4 h-4" /> Live Document Preview
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <button className="px-4 py-2 bg-bw-navy text-white text-xs font-bold rounded shadow-lg hover:bg-stone-800 transition-all flex items-center gap-2">
                        <MessageCircle size={14} />
                        BW Consultant
                    </button>
                    <button className="px-4 py-2 hover:bg-stone-100 rounded text-stone-600 text-xs font-bold flex items-center gap-2 border border-transparent hover:border-stone-200 transition-all" title="Print">
                        <Printer size={14}/> Print
                    </button>
                    <button className="px-4 py-2 hover:bg-stone-100 rounded text-stone-600 text-xs font-bold flex items-center gap-2 border border-transparent hover:border-stone-200 transition-all" title="Download">
                        <Download size={14}/> PDF
                    </button>
                    <button className="px-6 py-2 bg-green-600 text-white text-xs font-bold rounded shadow-lg hover:bg-green-700 transition-all flex items-center gap-2">
                        <CheckCircle size={14} /> Finalize Intelligence
                    </button>
                </div>
            </div>

            {/* Document Scroll Area */}
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar p-8 flex justify-center relative">
                
                {/* The Page Itself */}
                <motion.div
                    layout
                    className="bg-white w-full max-w-4xl min-h-[1123px] shadow-2xl shadow-stone-900/10 flex flex-col relative"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Doc Header */}
                    <div className="h-32 bg-white border-b border-stone-100 flex items-center justify-between px-12 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-bw-navy text-white flex items-center justify-center font-serif font-bold text-2xl">N</div>
                            <div>
                                <div className="text-[10px] font-bold tracking-[0.3em] text-stone-400 uppercase mb-1">BWGA Intelligence</div>
                                <div className="text-xl font-serif font-bold text-stone-900 tracking-tight">
                                    Strategic Roadmap
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-red-600 uppercase font-bold tracking-wider mb-1">Confidential Draft</div>
                            <div className="text-xs font-mono text-stone-400">{new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Doc Body */}
                    <div className="p-12 flex-1 font-serif text-stone-900">
                        {/* Introduction */}
                        <div className="mb-12 text-center">
                            <h1 className="text-3xl font-bold text-stone-900 mb-2">A New Era for Regional Development Intelligence</h1>
                            <p className="text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto">
                                Around the world, a persistent <strong>Global Understanding Gap</strong> obscures genuine opportunity. Fueled by fragmented data, outdated perceptions, and a lack of investor-grade tools, this gap systematically hinders development in the regional economies that form the backbone of national prosperity.
                            </p>
                        </div>

                        {/* The Entire Meadow Philosophy */}
                        <div className="mb-12 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">The Entire Meadow Philosophy: A New Way to See</h2>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Most tools focus on the "bee and the flower" - the immediate transaction. This is dangerously incomplete.
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed mt-2">
                                Nexus AI models the <strong>entire meadow</strong>: the full ecosystem, the hidden context, and all stakeholders. Real-world success depends on alignment with culture, regulation, and incentives - not just the deal itself. We built a system that sees the whole picture, because that's the only way to deliver outcomes that last.
                            </p>
                        </div>

                        {/* 1. Identity Section */}
                        <div className="mb-12">
                            <h2 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">01. Principal Entity</h2>
                            {params.organizationName ? (
                                <>
                                    <div className="text-3xl font-bold text-stone-900 mb-2">{params.organizationName}</div>
                                    <div className="text-lg text-stone-600 italic mb-4">
                                        {params.organizationType} OCo {params.country}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-stone-400 italic">Awaiting entity profile...</p>
                            )}
                        </div>

                        {/* 2. Mandate Section */}
                        <div className="mb-12">
                            <h2 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">02. Strategic Mandate</h2>
                            {params.strategicIntent.length > 0 ? (
                                <>
                                    <div className="text-sm font-bold text-stone-900 uppercase mb-2">Primary Objectives: {params.strategicIntent.join(', ')}</div>
                                    {params.problemStatement && (
                                        <p className="text-sm text-stone-600 leading-relaxed italic border-l-2 border-bw-gold pl-4">
                                            "{params.problemStatement}"
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-stone-400 italic">Awaiting strategic mandate...</p>
                            )}
                        </div>

                        {/* Partner Personas Section */}
                        <div className="mb-12">
                            <h2 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">03. Partner Personas</h2>
                            {params.partnerPersonas && params.partnerPersonas.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {params.partnerPersonas.map((persona, index) => (
                                        <div key={index} className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                                            <div className="font-bold text-sm text-stone-800">{persona}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-stone-400 italic">Awaiting partner personas...</p>
                            )}
                        </div>

                        {/* Example in Action */}
                        <div className="mb-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-lg font-bold text-blue-900 mb-2">Example in Action: The 5-Persona Adversarial Debate</h3>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                To eliminate bias and uncover blind spots, your strategy is debated by a team of five specialist AI personas. Imagine you propose a $10M investment in Vietnamese solar:
                            </p>
                            <ul className="list-disc list-inside text-sm text-blue-800 mt-3 space-y-1">
                                <li>The <strong>Advocate</strong> highlights a 25% IRR...</li>
                                <li>...but the <strong>Accountant</strong> immediately flags that your model misses currency hedging costs...</li>
                                <li>...while the <strong>Regulator</strong> warns that new import tariffs could delay the project by 6 months.</li>
                            </ul>
                            <p className="text-sm text-blue-800 leading-relaxed mt-3 font-semibold">
                                You see the full, unvarnished picture, not just the optimistic one.
                            </p>
                        </div>

                        {/* 3. Market Context Section */}
                        <div className="mb-12">
                            <h2 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">03. Market Context</h2>
                            {enhancedReportData.marketAnalysis.content ? (
                                <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{enhancedReportData.marketAnalysis.content}</div>
                            ) : (
                                <p className="text-sm text-stone-400 italic">Awaiting market analysis...</p>
                            )}

                            {/* Display Computed Intelligence */}
                            {params.reportPayload && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="text-sm font-bold text-blue-900 mb-3">Computed Intelligence</h3>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="font-semibold">RROI Score:</span> {params.reportPayload.computedIntelligence.rroi.overallScore}/100
                                        </div>
                                        <div>
                                            <span className="font-semibold">SPI Score:</span> {params.reportPayload.computedIntelligence.spi.spi}/100
                                        </div>
                                        <div>
                                            <span className="font-semibold">Economic Readiness:</span> {params.reportPayload.confidenceScores.economicReadiness}/100
                                        </div>
                                        <div>
                                            <span className="font-semibold">Political Stability:</span> {params.reportPayload.confidenceScores.politicalStability}/100
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <span className="font-semibold text-xs">Top Symbiotic Partners:</span>
                                        <ul className="text-xs mt-1">
                                            {params.reportPayload.computedIntelligence.symbioticPartners.slice(0, 2).map((partner, idx) => (
                                                <li key={idx} className="text-stone-700">OCo {partner.entityName} (Score: {partner.symbiosisScore})</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Injected components will render here */}
                        {injectedComponents.map((comp, index) => renderInjectedComponent(comp, index))}

                        {/* 4. Risk & Historical */}
                        <div className="mb-12">
                            <h2 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">04. Risk & Historical Validation</h2>
                            {enhancedReportData.risks.content ? (
                                <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{enhancedReportData.risks.content}</div>
                            ) : (
                                <p className="text-sm text-stone-400 italic">Awaiting risk assessment...</p>
                            )}
                        </div>

                        <div className="mb-12">
                            <h2 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">05. Advanced Analysis</h2>
                            <p className="text-sm text-stone-400 italic">Awaiting advanced analysis...</p>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">06. Marketplace Opportunities</h2>
                            <p className="text-sm text-stone-400 italic">Awaiting marketplace analysis...</p>
                        </div>
                    </div>

                    {/* Doc Footer */}
                    <div className="h-16 bg-white border-t border-stone-100 flex items-center justify-between px-12 text-[9px] text-stone-400 font-sans uppercase tracking-widest shrink-0">
                        <span>Generated by Nexus Intelligence OS v6.0 * NSIL v3.2</span>
                        <span>Page 1 of 1</span>
                    </div>
                </motion.div>

                {isDraftFinalized && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                        <button 
                            onClick={() => setShowFinalizationModal(true)}
                            className="px-8 py-4 bg-bw-gold text-bw-navy font-bold rounded-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-3 animate-pulse"
                        >
                            <CheckCircle size={20} /> Accept Draft & Proceed to Report Selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};


// Include DocumentUploadModal at the end of the component
export default MainCanvas;

