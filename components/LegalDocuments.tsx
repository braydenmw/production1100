import React from 'react';
import { X, Shield, FileText, BookOpen, Scale } from 'lucide-react';

// ---------------------------------------------------------------------------
// LEGAL & REFERENCE DOCUMENTS - Full Popup Modals
// User Manual, Terms & Conditions, Privacy Policy, Ethical AI Framework
// ---------------------------------------------------------------------------

export type DocumentType = 'user-manual' | 'terms' | 'privacy' | 'ethics' | null;

interface DocumentModalProps {
    activeDocument: DocumentType;
    onClose: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ activeDocument, onClose }) => {
    if (!activeDocument) return null;

    const getIcon = () => {
        switch (activeDocument) {
            case 'user-manual': return <BookOpen size={20} className="text-amber-400" />;
            case 'terms': return <FileText size={20} className="text-amber-400" />;
            case 'privacy': return <Shield size={20} className="text-amber-400" />;
            case 'ethics': return <Scale size={20} className="text-amber-400" />;
        }
    };

    const getTitle = () => {
        switch (activeDocument) {
            case 'user-manual': return 'BW Ai - User Manual';
            case 'terms': return 'Terms & Conditions';
            case 'privacy': return 'Privacy Policy';
            case 'ethics': return 'Ethical AI Framework';
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-4xl my-8 mx-4" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button onClick={onClose} className="fixed top-4 right-4 z-20 w-10 h-10 bg-stone-800 border border-stone-600 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors shadow-lg">
                    <X size={16} className="text-stone-300" />
                </button>

                {/* Document Container */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-black text-sm">BW</div>
                        <div>
                            <div className="flex items-center gap-2">
                                {getIcon()}
                                <h1 className="text-lg font-semibold text-white">{getTitle()}</h1>
                            </div>
                            <p className="text-xs text-white/50 mt-1">BW Global Advisory - ABN 55 978 113 300</p>
                        </div>
                    </div>

                    {/* Document Body */}
                    <div className="px-8 py-8 text-sm text-slate-700 leading-relaxed space-y-6 max-h-[80vh] overflow-y-auto">
                        {activeDocument === 'user-manual' && <UserManualContent />}
                        {activeDocument === 'terms' && <TermsContent />}
                        {activeDocument === 'privacy' && <PrivacyContent />}
                        {activeDocument === 'ethics' && <EthicsContent />}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex items-center justify-between">
                        <p className="text-[10px] text-slate-400">A(c) 2026 BW Global Advisory. All rights reserved. | ABN 55 978 113 300 | Melbourne, Australia</p>
                        <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// -------------------------------------------------------------------------------
// USER MANUAL - Comprehensive Platform Guide (~15 pages)
// -------------------------------------------------------------------------------
const UserManualContent: React.FC = () => (
    <div className="space-y-8">
        {/* Cover / Title */}
        <div className="text-center border-b border-slate-200 pb-8">
            <p className="text-xs text-amber-600 uppercase tracking-[0.3em] font-semibold mb-2">Official User Manual</p>
            <h1 className="text-3xl font-light text-slate-900 mb-2">BW Ai</h1>
            <h2 className="text-lg text-slate-500 font-light">Nexus Intelligence Operating System v7.0</h2>
            <p className="text-xs text-slate-400 mt-4">Version 7.0 * February 2026 * R&D Phase</p>
            <p className="text-xs text-slate-400">Developed in Melbourne, Australia & Pagadian City, Philippines</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Table of Contents</h3>
            <div className="grid md:grid-cols-2 gap-1 text-xs text-slate-600">
                <p>1. Welcome & Getting Started</p>
                <p>8. Step 5 - Financial Model</p>
                <p>2. System Requirements & Access</p>
                <p>9. Step 6 - Risk & Mitigation</p>
                <p>3. Platform Overview</p>
                <p>10. Step 7 - Resources & Capability</p>
                <p>4. The Command Page (Landing)</p>
                <p>11. Step 8 - Execution Plan</p>
                <p>5. Entering the Platform</p>
                <p>12. Step 9 - Governance & Monitoring</p>
                <p>6. Step 1 - Identity & Foundation</p>
                <p>13. Step 10 - Scoring & Readiness</p>
                <p>7. Steps 2a"4 - Strategy, Market, Partners</p>
                <p>14. Generating Your Report</p>
                <p>&nbsp;</p>
                <p>15. The BW Consultant</p>
                <p>&nbsp;</p>
                <p>16. The Document Factory</p>
                <p>&nbsp;</p>
                <p>17. Understanding Your Scores</p>
                <p>&nbsp;</p>
                <p>18. Guidance Modes</p>
                <p>&nbsp;</p>
                <p>19. Troubleshooting & Support</p>
            </div>
        </div>

        {/* Chapter 1 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">1. Welcome & Getting Started</h3>
            <p className="mb-3">Thank you for choosing BW Ai. This manual will guide you through every feature of the platform, from your first search to exporting board-ready documents.</p>
            <p className="mb-3"><strong>What is BW Ai?</strong> It is a Sovereign-Grade Intelligence Operating System designed to help regional communities, businesses, government agencies, and first-time exporters produce institutional-quality strategic analysis - the same calibre of work that multinational corporations commission from top-tier consulting firms.</p>
            <p className="mb-3">The platform is not a chatbot. It is a structured intelligence pipeline that:</p>
            <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Captures your opportunity through a structured 10-step intake process</li>
                <li>Scores your project using 38 proprietary mathematical formulas</li>
                <li>Stress-tests your assumptions using 5 adversarial AI personas</li>
                <li>Simulates decision-maker reactions using 7 behavioural models</li>
                <li>Produces traceable, auditable, board-ready documents</li>
                <li>Continuously improves through proactive intelligence monitoring</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-amber-800 mb-1">Important Note</p>
                <p className="text-xs text-amber-700">BW AI is a decision-support tool. All outputs are advisory in nature. Users retain full accountability for decisions made using the platform's analysis and recommendations.</p>
            </div>
        </div>

        {/* Chapter 2 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">2. System Requirements & Access</h3>
            <p className="mb-3"><strong>Supported Browsers:</strong> Google Chrome (recommended), Microsoft Edge, Mozilla Firefox, Safari. The platform is web-based - no software installation required.</p>
            <p className="mb-3"><strong>Device Compatibility:</strong> Desktop and laptop computers are recommended for the full experience. Tablet devices are supported with a responsive layout. Mobile phones can access the Command Page and the BW Consultant but the full report builder is optimised for larger screens.</p>
            <p className="mb-3"><strong>Internet Connection:</strong> A stable broadband connection is required. The platform communicates with AI services and live data sources in real time. Slow or intermittent connections may cause search timeouts or report generation delays.</p>
            <p className="mb-3"><strong>Access:</strong> During the R&D phase, access is provided via direct URL. No account registration is currently required. Future commercial releases will include authenticated user accounts with role-based access controls.</p>
        </div>

        {/* Chapter 3 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">3. Platform Overview</h3>
            <p className="mb-3">The platform consists of four primary areas:</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 mb-3">
                <div><strong className="text-slate-900">Command Page</strong> - The landing page you see when you first arrive. It explains the platform, its architecture, and a live case-study demo. It is your launch point into the system.</div>
                <div><strong className="text-slate-900">Main Canvas (Report Builder)</strong> - The primary workspace where you complete the 10-step intake protocol, view live report generation, and interact with the BW Consultant.</div>
                <div><strong className="text-slate-900">BW Consultant</strong> - A unified AI advisor that occupies the right sidebar of the Main Canvas. You can ask it anything - location research, company analysis, strategic advice, score explanations - all in one chat window. It is also proactive, automatically pushing intelligence briefings and live analysis updates into the conversation.</div>
                <div><strong className="text-slate-900">Document Factory</strong> - The output system that compiles your analysis into 200+ institutional-grade document types.</div>
            </div>
            <p className="mb-3"><strong>10-Layer Processing Architecture (NSIL):</strong> Every report passes through ten processing layers in sequence:</p>
            <ol className="list-decimal ml-6 space-y-1">
                <li><strong>Input Validation & Governance</strong> - Screens inputs for completeness and consistency</li>
                <li><strong>Multi-Agent Adversarial Debate</strong> - 5 AI personas challenge every claim</li>
                <li><strong>Quantitative Formula Scoring</strong> - 38 formulas calculate hard metrics</li>
                <li><strong>Monte Carlo Stress Testing</strong> - 10,000+ scenario simulations</li>
                <li><strong>Neuroscience-Based Cognition Modelling</strong> - 7 behavioural models simulate decision-maker responses</li>
                <li><strong>Autonomous Agent Intelligence</strong> - Goal-directed agents plan research, spawn specialists, and verify outcomes</li>
                <li><strong>Proactive Self-Monitoring</strong> - Detects overconfidence, drift, and reasoning errors in its own output</li>
                <li><strong>Reflexive Analysis</strong> - Analyses the user, not just the market &mdash; detecting what you are not saying</li>
                <li><strong>Compliance & Ethics Checking</strong> - Scores against IFC standards, Rawlsian ethics, and 195-country regulatory frameworks</li>
                <li><strong>Audience-Adaptive Output Synthesis</strong> - Reframes for investors, governments, communities, partners, and executives with full provenance</li>
            </ol>
        </div>

        {/* Chapter 4 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">4. The Command Page (Landing)</h3>
            <p className="mb-3">When you first visit the platform, you arrive at the Command Page. This page serves two purposes:</p>
            <ol className="list-decimal ml-6 space-y-2 mb-3">
                <li><strong>Education</strong> - Explains what the system does, how it works, and who it is built for. Scroll down to read about the 7-layer architecture, the scoring engine, proprietary behavioural models, and a live case-study demonstration with real outputs.</li>
                <li><strong>Launch</strong> - At the bottom of the page, accept the Terms & Conditions checkbox and click "Launch Intelligence OS" to enter the full report builder and access the BW Consultant.</li>
            </ol>
            <p className="mb-3"><strong>What you'll find on the page:</strong></p>
            <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>10-Layer NSIL Processing Architecture breakdown</li>
                <li>Original Developments section - what makes this platform unique</li>
                <li>Proactive Intelligence Layer overview</li>
                <li>Live case-study walkthrough (Vestas A -  Philippines)</li>
                <li>Legal documents - User Manual, Terms & Conditions, Privacy Policy, Ethical AI Framework</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-800 mb-1">Tip</p>
                <p className="text-xs text-blue-700">All location research, company intelligence, and strategic analysis is handled by the BW Consultant inside the Main Canvas. Launch the platform to access the full AI advisor.</p>
            </div>
        </div>

        {/* Chapter 5 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">5. Entering the Platform</h3>
            <p className="mb-3">After accepting the Terms & Conditions and clicking "Launch Intelligence OS" on the Command Page, you enter the Main Canvas - the primary workspace.</p>
            <p className="mb-3"><strong>Layout Overview:</strong></p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 mb-3">
                <div><strong>Left Sidebar (narrow):</strong> Navigation icons for switching between the wizard steps, accessing the document factory, and system controls.</div>
                <div><strong>Centre Panel (main area):</strong> The live document view. This is where your report builds in real time as you complete each intake step. It displays formatted sections, scores, and analysis as they are generated.</div>
                <div><strong>Right Sidebar - BW Consultant:</strong> A single unified AI advisor chat that fills the entire right sidebar. You can ask it anything: location research, company analysis, score explanations, strategic recommendations. It also proactively pushes intelligence briefings and live analysis summaries into the conversation as you work.</div>
                <div><strong>Top Bar:</strong> Contains the 10-step intake wizard progress indicators, the Report Library, and the Generate Report button.</div>
            </div>
            <p className="mb-3"><strong>Getting Started:</strong> When you first enter the platform, the BW Consultant will greet you and explain what it can do. You can begin by completing Step 1 of the intake wizard, or type a question directly into the consultant chat - for example, "Research Pagadian City, Philippines" to get a full intelligence brief.</p>
        </div>

        {/* Chapter 6 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">6. Step 1 - Identity & Foundation</h3>
            <p className="mb-3">Click on Step 1 in the intake wizard to open the Identity modal. This is where you establish who you are.</p>
            <p className="mb-3"><strong>Required Information:</strong></p>
            <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Organisation Name:</strong> Your entity's official name</li>
                <li><strong>Entity Type:</strong> Select from options (Government Agency, Private Company, Non-Profit, Public Authority, etc.)</li>
                <li><strong>Country:</strong> Where your organisation is headquartered</li>
                <li><strong>Industry:</strong> Primary industry or sector</li>
                <li><strong>Contact Information:</strong> Email and key contact details</li>
                <li><strong>Competitive Positioning:</strong> A brief description of your competitive advantages</li>
            </ul>
            <p className="mb-3"><strong>Why this matters:</strong> The Identity data feeds directly into the SPI (Success Probability Index) weighting system. The engine selects industry-specific archetypes and regional benchmarks based on what you enter here. Accurate information produces more relevant scoring.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-amber-700"><strong>Tip:</strong> Don't worry about getting everything perfect on your first pass. You can return to any step and update your inputs at any time. The system recalculates all scores when you re-generate.</p>
            </div>
        </div>

        {/* Chapter 7 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">7. Steps 2a"4 - Strategy, Market & Partners</h3>
            
            <p className="mb-2"><strong>Step 2 - Mandate & Strategy:</strong> Define your strategic vision, objectives (short/medium/long-term), target partner profile, and value proposition. This feeds the SPI strategic intent calculation.</p>
            
            <p className="mb-2"><strong>Step 3 - Market & Context:</strong> Describe your market size, growth projections, competitive landscape, and regulatory environment. You can ask the BW Consultant to research any target location and it will provide relevant data to inform this step. This feeds the RROI (Regional Return on Investment) market access component and the RFI (Regulatory Friction Index).</p>
            
            <p className="mb-2"><strong>Step 4 - Partners & Ecosystem:</strong> Map your stakeholder landscape - who are your potential partners, what are their profiles, and how do they align with your objectives? This feeds the CIS (Counterparty Integrity Score) and SPI partner reliability component.</p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-3">
                <p className="text-xs text-purple-700"><strong>Location Intelligence Integration:</strong> Steps 3a"10 are enhanced by research data. Ask the BW Consultant to research your target location (e.g. "Research Pagadian City, Philippines") and it will provide GDP data, demographics, regulatory frameworks, and risk assessments to inform your inputs.</p>
            </div>
        </div>

        {/* Chapter 8 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">8. Step 5 - Financial Model</h3>
            <p className="mb-3">This step captures your investment requirements, revenue projections, cost structure, and ROI scenarios.</p>
            <p className="mb-3"><strong>Key Fields:</strong></p>
            <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Investment amount required</li>
                <li>Revenue model and Year 1 projections</li>
                <li>Operating cost breakdown</li>
                <li>Funding sources (grants, equity, debt, public-private)</li>
                <li>Base case / best case / worst case scenarios</li>
            </ul>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs text-red-700"><strong>Important:</strong> The Accountant persona and SCF (Strategic Cash Flow) formula will flag revenue projections that significantly exceed regional benchmarks. Be prepared to justify or revise projections - this is the system working as designed, stress-testing your assumptions before an investor does.</p>
            </div>
        </div>

        {/* Chapter 9 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">9. Step 6 - Risk & Mitigation</h3>
            <p className="mb-3">Identify and categorise the risks facing your project. The system uses your inputs to calculate the CRPS (Composite Risk Priority Score), PSS (Policy Shock Sensitivity), and RFI bottleneck detection.</p>
            <p className="mb-3"><strong>Risk Categories:</strong> Political, Economic, Regulatory, Operational, Environmental, Financial, Reputational, Supply Chain.</p>
            <p className="mb-3">For each risk, you assign a probability (Low/Medium/High) and impact level. The system generates a risk matrix and mitigation framework automatically.</p>
        </div>

        {/* Chapter 10 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">10. Step 7 - Resources & Capability</h3>
            <p className="mb-3">Assess your team's strengths, technology stack, and capability gaps. This feeds the ORS (Organisational Readiness Score), TCS (Team Capability Score), and CGI (Capability Gap Index).</p>
            <p className="mb-3">Be honest about gaps - the system is designed to identify them constructively and recommend how to address them, not penalise you for transparency.</p>
        </div>

        {/* Chapter 11 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">11. Step 8 - Execution Plan</h3>
            <p className="mb-3">Define your implementation roadmap: phases, milestones, dependencies, timelines, go/no-go decision gates, and resource allocation per phase.</p>
            <p className="mb-3">This feeds the IVAS (Investment Velocity & Activation Speed) calculation, which estimates your activation timeline across P10 (best case), P50 (median), and P90 (worst case) scenarios.</p>
        </div>

        {/* Chapter 12 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">12. Step 9 - Governance & Monitoring</h3>
            <p className="mb-3">Establish your oversight structure: decision-making authority, reporting cadence, escalation procedures, KPI tracking, and audit frameworks.</p>
            <p className="mb-3">This feeds the GCI (Governance Confidence Index), CCS (Compliance Certainty Score), and SPI ethical alignment component.</p>
        </div>

        {/* Chapter 13 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">13. Step 10 - Scoring & Readiness</h3>
            <p className="mb-3">The final intake step is a readiness self-assessment. Rate your confidence levels, review the pre-launch checklist, and confirm your data is complete.</p>
            <p className="mb-3">Once all 10 steps are complete, the system has a comprehensive, machine-readable dataset. You are now ready to generate your report.</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-xs text-emerald-700"><strong>Completeness Indicator:</strong> The system shows a completeness percentage on the right sidebar. You can generate a report at any time, but higher completeness produces more accurate scoring and richer document output.</p>
            </div>
        </div>

        {/* Chapter 14 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">14. Generating Your Report</h3>
            <p className="mb-3">Click the <strong>"Generate Report"</strong> button in the top bar. The system will:</p>
            <ol className="list-decimal ml-6 space-y-2 mb-3">
                <li><strong>Validate your inputs</strong> - Checks for completeness and consistency</li>
                <li><strong>Run the NSIL engine</strong> - Calculates all 38 formula scores across your data</li>
                <li><strong>Activate adversarial personas</strong> - 5 AI agents (Advocate, Skeptic, Regulator, Accountant, Operator) debate your project's merits</li>
                <li><strong>Apply Monte Carlo simulations</strong> - 10,000+ scenarios test your project's resilience</li>
                <li><strong>Engage the Human Cognition Engine</strong> - 7 behavioural models simulate how decision-makers will react</li>
                <li><strong>Run proactive intelligence agents</strong> - Deep research, document enhancement, and self-improvement agents refine the output</li>
                <li><strong>Assemble the report</strong> - All scores, debates, and analysis are compiled into a formatted, traceable document</li>
            </ol>
            <p className="mb-3"><strong>Real-Time Visibility:</strong> You can watch this process happen live in the centre panel. Progress indicators show which agents are active, which formulas are being calculated, and the current completeness percentage.</p>
            <p className="mb-3"><strong>Classification:</strong> Your project will receive a final classification:</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <table className="w-full text-xs">
                    <thead><tr className="border-b border-slate-300"><th className="text-left py-2">SPI Score</th><th className="text-left py-2">Grade</th><th className="text-left py-2">Classification</th></tr></thead>
                    <tbody>
                        <tr className="border-b border-slate-100"><td className="py-1.5 text-emerald-700 font-bold">aJPY 80</td><td>Grade A</td><td>Investment Ready</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 text-emerald-600 font-bold">aJPY 70</td><td>Grade B</td><td>Investment Ready</td></tr>
                        <tr className="border-b border-slate-100"><td className="py-1.5 text-amber-600 font-bold">aJPY 60</td><td>Grade C</td><td>Proceed With Caution</td></tr>
                        <tr><td className="py-1.5 text-red-600 font-bold">&lt; 60</td><td>Grade D</td><td>Do Not Proceed</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* Chapter 15 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">15. The BW Consultant</h3>
            <p className="mb-3">The BW Consultant is the unified AI advisor that occupies the entire right sidebar of the report builder. It is your single point of contact for all intelligence, research, analysis, and strategic guidance within the platform.</p>
            <p className="mb-3"><strong>Capabilities - what you can do in one chat window:</strong></p>
            <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Location Research:</strong> "Research Pagadian City, Philippines" - returns a full intelligence brief with demographics, GDP, industries, leadership, infrastructure, regulatory environment, and risk assessment</li>
                <li><strong>Company Analysis:</strong> "Tell me about Vestas" - returns corporate intelligence and strategic context</li>
                <li><strong>Score Explanations:</strong> "Why is my SPI score low?" - analyses your intake data and explains score drivers</li>
                <li><strong>Strategic Advice:</strong> "What partners should I consider for this project?" - provides contextual recommendations</li>
                <li><strong>Risk Analysis:</strong> "What are the regulatory risks in Indonesia?" - delivers region-specific risk intelligence</li>
                <li><strong>Formula Explanations:</strong> "Explain the RFI bottleneck on my project" - breaks down how scoring formulas apply to your data</li>
            </ul>
            <p className="mb-3"><strong>Proactive Intelligence:</strong> The BW Consultant is not just reactive. It proactively pushes intelligence into the conversation without being asked:</p>
            <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Advisor Briefings:</strong> When the multi-agent system (Advocate, Skeptic, Regulator, Accountant, Operator) completes analysis, a summary briefing is automatically posted to the chat</li>
                <li><strong>Live Analysis Summaries:</strong> When the system generates new insights during report processing, these are injected into the chat in real time</li>
                <li><strong>Follow-Up Suggestions:</strong> Every response includes suggested follow-up questions so you always know what to explore next</li>
            </ul>
            <p className="mb-3"><strong>Voice Output:</strong> Click the speaker icon in the consultant header to enable voice responses. The system will read responses aloud using text-to-speech.</p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-indigo-800 mb-1">How It Works</p>
                <p className="text-xs text-indigo-700">The consultant is powered by multi-source intelligence. Location queries are routed through the platform's research pipeline (server-side AI, OpenAI, and public data APIs). Strategic queries use your intake data, scores, and the multi-agent debate system to generate context-aware advice. All responses are traceable to their intelligence sources.</p>
            </div>
        </div>

        {/* Chapter 16 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">16. The Document Factory</h3>
            <p className="mb-3">Once your report is generated, you can produce institutional-grade documents from the Document Factory. The system offers 200+ report types and 150+ letter templates.</p>
            <p className="mb-3"><strong>Document Categories:</strong></p>
            <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900 mb-2">Strategic Reports</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>* Investment Prospectus</li>
                        <li>* Partnership Viability Assessment</li>
                        <li>* Market Entry Analysis</li>
                        <li>* Risk Assessment Report</li>
                        <li>* Competitive Landscape Report</li>
                    </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900 mb-2">Financial Documents</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>* ROI Projection Model</li>
                        <li>* Financial Due Diligence Pack</li>
                        <li>* Investment Term Sheet</li>
                        <li>* Monte Carlo Simulation Report</li>
                        <li>* Sensitivity Analysis</li>
                    </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900 mb-2">Legal Templates</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>* Letter of Intent (LOI)</li>
                        <li>* Memorandum of Understanding</li>
                        <li>* Non-Disclosure Agreement</li>
                        <li>* Grant Application Template</li>
                        <li>* Compliance Checklist</li>
                    </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900 mb-2">Communication Packs</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                        <li>* Executive Summary Brief</li>
                        <li>* Board Presentation Deck</li>
                        <li>* Investor Pitch Document</li>
                        <li>* Stakeholder Update Letter</li>
                        <li>* Media Release Template</li>
                    </ul>
                </div>
            </div>
            <p className="mb-3"><strong>Audit Trail:</strong> Every document produced by the Document Factory carries a full audit trail. Each recommendation, score, and conclusion can be traced back to specific data inputs, formula calculations, and persona debate transcripts.</p>
        </div>

        {/* Chapter 17 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">17. Understanding Your Scores</h3>
            <p className="mb-3">The NSIL engine produces 38 scores organised into six categories:</p>
            <div className="space-y-3 mb-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900">Core Indices (5)</p>
                    <p className="text-xs text-slate-600">SPI (Success Probability), RROI (Regional Return on Investment), SEAM (Stakeholder Alignment), PVI (Partnership Viability), RRI (Regional Resilience)</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900">Risk Formulas (7)</p>
                    <p className="text-xs text-slate-600">CRPS, RME, VaR, SRCI, DCS, PSS, PRS - covering composite risk, mitigation effectiveness, value at risk, supply chain, dependency, policy sensitivity, and political risk</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900">Financial Metrics (6)</p>
                    <p className="text-xs text-slate-600">IRR, NPV, WACC, DSCR, FMS, ROE - standard financial analysis adapted for regional development contexts</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900">Operational Scores (6)</p>
                    <p className="text-xs text-slate-600">ORS, TCS, EEI, SEQ, CGI, LCI - measuring organisational readiness, team capability, execution efficiency, and leadership confidence</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900">Market Formulas (5)</p>
                    <p className="text-xs text-slate-600">MPI, CAI, TAM, SAM, GRI - market penetration, competitive advantage, total/serviceable market, growth rate</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-xs text-slate-900">Governance Metrics (9)</p>
                    <p className="text-xs text-slate-600">GCI, CCS, TPI, ARI, DQS, GCS, RFI, CIS, ESG - covering governance confidence, compliance, transparency, audit readiness, data quality, regulatory friction, counterparty integrity, and ESG</p>
                </div>
            </div>
            <p className="mb-3">Each score is presented on a 0a"100 scale. Scores above 70 are generally considered strong. Scores below 50 indicate areas requiring attention. The system colour-codes scores: <span className="text-emerald-600 font-semibold">green (strong)</span>, <span className="text-amber-600 font-semibold">amber (caution)</span>, <span className="text-red-600 font-semibold">red (critical)</span>.</p>
        </div>

        {/* Chapter 18 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">18. Guidance Modes</h3>
            <p className="mb-3">Before beginning, you can select your preferred guidance level. The system adapts its explanations, prompts, and interface density accordingly.</p>
            <div className="space-y-3 mb-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-sm text-slate-900 mb-1">📊 Orientation Mode</p>
                    <p className="text-xs text-slate-600">Full explanations at every step, contextual help panels, step-by-step walkthroughs, and educational tooltips. Recommended for first-time users, community groups, and anyone new to strategic planning.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-sm text-slate-900 mb-1">🤝 Collaborative Mode</p>
                    <p className="text-xs text-slate-600">Balanced guidance with smart suggestions. You drive the process while the system surfaces insights. Recommended for regional councils, growing businesses, and small teams.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-sm text-slate-900 mb-1">⚡ Expert Mode</p>
                    <p className="text-xs text-slate-600">Streamlined interface, minimal hand-holding, full access to advanced controls and raw formula outputs. Recommended for experienced operators, government analysts, and corporate development teams.</p>
                </div>
            </div>
            <p>Your guidance level can be changed at any time from the sidebar settings.</p>
        </div>

        {/* Chapter 19 */}
        <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 border-b border-amber-400 pb-2">19. Troubleshooting & Support</h3>
            <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-xs text-slate-900 mb-1">Search returns an error or times out</p>
                    <p className="text-xs text-slate-600">Check your internet connection. Try a simpler search term (e.g., city name only). If the problem persists, try again in a few minutes - the AI service may be experiencing high demand.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-xs text-slate-900 mb-1">Report generation stalls or shows no progress</p>
                    <p className="text-xs text-slate-600">Ensure you have a stable internet connection. Reports require multiple AI service calls. On slower connections, generation may take 30a"60 seconds. If stalled beyond 2 minutes, refresh the page and try again - your intake data is preserved in local storage.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-xs text-slate-900 mb-1">Scores seem unexpected or low</p>
                    <p className="text-xs text-slate-600">This is usually caused by incomplete intake data. Check your completeness percentage in the right sidebar. Fill in any missing steps and re-generate. The system scores conservatively - missing data is treated as risk.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="font-semibold text-xs text-slate-900 mb-1">Need help or want to provide feedback?</p>
                    <p className="text-xs text-slate-600">Contact us at <strong>brayden@bwglobaladvis.info</strong> or call <strong>+63 960 835 4283</strong>. We welcome all feedback during this R&D phase.</p>
                </div>
            </div>
        </div>

        {/* End Mark */}
        <div className="text-center border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-400">- End of User Manual a"</p>
            <p className="text-xs text-slate-400">BW Ai * Nexus Intelligence OS v7.0 * NSIL Engine v4.0</p>
        </div>
    </div>
);


// -------------------------------------------------------------------------------
// TERMS & CONDITIONS
// -------------------------------------------------------------------------------
const TermsContent: React.FC = () => (
    <div className="space-y-6">
        <div className="text-center border-b border-slate-200 pb-6">
            <h1 className="text-2xl font-light text-slate-900 mb-1">Terms & Conditions</h1>
            <p className="text-xs text-slate-400">Effective Date: 1 February 2026 * Last Updated: 9 February 2026</p>
        </div>

        <p>These Terms & Conditions ("Terms") govern your access to and use of the BW Ai platform ("Platform"), operated by BW Global Advisory, trading as a registered Australian sole trader under ABN 55 978 113 300 ("BWGA", "we", "us", "our").</p>
        <p>By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, you must not access or use the Platform.</p>

        <h4 className="font-bold text-slate-900 mt-6">1. About the Platform</h4>
        <p>1.1. BW Ai is a strategic decision-support platform currently in active Research & Development (R&D). The Platform is developed in Melbourne, Australia, with development operations also conducted in Pagadian City, Philippines.</p>
        <p>1.2. The Platform is designed for global use and is intended to meet international standards for data protection, AI ethics, and information security across all jurisdictions in which it operates or may operate.</p>
        <p>1.3. The Platform is not a financial advisor, legal advisor, or licensed consulting service. All outputs are advisory and informational in nature.</p>

        <h4 className="font-bold text-slate-900 mt-6">2. Eligibility</h4>
        <p>2.1. You must be at least 18 years of age to use the Platform.</p>
        <p>2.2. If you are using the Platform on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.</p>

        <h4 className="font-bold text-slate-900 mt-6">3. Use of the Platform</h4>
        <p>3.1. You may use the Platform for lawful strategic planning and analysis purposes only.</p>
        <p>3.2. You agree not to:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li>Use the Platform for any illegal, fraudulent, or harmful purpose</li>
            <li>Attempt to reverse-engineer, copy, or reproduce the Platform's proprietary algorithms, formulas, or architecture</li>
            <li>Submit deliberately false or misleading data with intent to produce deceptive documents</li>
            <li>Use outputs to misrepresent your project's viability to investors or regulatory bodies</li>
            <li>Circumvent security measures or attempt unauthorised access</li>
            <li>Use the Platform in any manner that could damage, disable, or impair its operation</li>
        </ul>

        <h4 className="font-bold text-slate-900 mt-6">4. Intellectual Property</h4>
        <p>4.1. All intellectual property in the Platform - including but not limited to the NSIL engine, 38 proprietary formulas, Human Cognition Engine, Proactive Intelligence Layer, persona architecture, and Document Factory templates - is owned exclusively by BW Global Advisory.</p>
        <p>4.2. The following are proprietary indices created by BWGA: SPI(TM), RROI(TM), SEAM(TM), PVI(TM), RRI(TM), and all other named indices listed in the Platform's architecture documentation.</p>
        <p>4.3. You retain ownership of all data you input into the Platform. You grant BWGA a limited, non-exclusive licence to process your data solely for the purpose of providing the Platform's services.</p>
        <p>4.4. Documents generated by the Platform are produced for your use. You may use, distribute, and present these documents as your own. However, you may not claim authorship of the underlying analytical methodology or scoring architecture.</p>

        <h4 className="font-bold text-slate-900 mt-6">5. Advisory Nature & Disclaimer</h4>
        <p>5.1. <strong>All Platform outputs are advisory.</strong> Scores, classifications, persona debates, risk assessments, and document outputs are produced by automated systems and are intended to inform - not replace - human decision-making.</p>
        <p>5.2. BWGA does not guarantee the accuracy, completeness, or suitability of any output for any particular purpose. Outputs are generated based on user inputs and available data sources, which may be incomplete or contain inaccuracies.</p>
        <p>5.3. Users retain full and sole accountability for all decisions made using the Platform's analysis, recommendations, and documents.</p>
        <p>5.4. BWGA is not liable for any loss, damage, or adverse outcome arising from reliance on Platform outputs, including but not limited to investment losses, regulatory penalties, failed partnerships, or reputational damage.</p>

        <h4 className="font-bold text-slate-900 mt-6">6. R&D Phase Provisions</h4>
        <p>6.1. The Platform is currently in R&D phase. Features, scoring methodologies, and available outputs may change without notice.</p>
        <p>6.2. During the R&D phase, access may be limited, suspended, or modified at BWGA's discretion.</p>
        <p>6.3. No service level agreements (SLAs) apply during the R&D phase.</p>

        <h4 className="font-bold text-slate-900 mt-6">7. Data & Privacy</h4>
        <p>7.1. Your use of the Platform is also governed by our Privacy Policy, which forms part of these Terms.</p>
        <p>7.2. By using the Platform, you consent to the collection, processing, and storage of data as described in the Privacy Policy.</p>

        <h4 className="font-bold text-slate-900 mt-6">8. Limitation of Liability</h4>
        <p>8.1. To the maximum extent permitted by law, BWGA's total liability for any claim arising from or related to the Platform is limited to the amount you have paid to BWGA for use of the Platform in the 12 months preceding the claim (or AUD $0 if no fees have been charged).</p>
        <p>8.2. BWGA is not liable for any indirect, incidental, consequential, special, or punitive damages.</p>

        <h4 className="font-bold text-slate-900 mt-6">9. International Standards Compliance</h4>
        <p>9.1. The Platform is designed to meet or align with the following international standards and frameworks:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li>Australian Privacy Act 1988 and Australian Privacy Principles (APPs)</li>
            <li>EU General Data Protection Regulation (GDPR)</li>
            <li>Philippines Data Privacy Act of 2012 (Republic Act No. 10173)</li>
            <li>ISO/IEC 27001 (Information Security Management) - alignment target</li>
            <li>OECD AI Principles</li>
            <li>UNESCO Recommendation on the Ethics of Artificial Intelligence</li>
            <li>EU AI Act transparency and risk classification requirements</li>
            <li>NIST AI Risk Management Framework</li>
        </ul>
        <p>9.2. While the Platform has not yet undergone formal certification by these bodies, it is designed and developed with the express intention of meeting these standards as it progresses toward commercial deployment.</p>

        <h4 className="font-bold text-slate-900 mt-6">10. Governing Law</h4>
        <p>10.1. These Terms are governed by the laws of the State of Victoria, Australia.</p>
        <p>10.2. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Victoria, Australia.</p>

        <h4 className="font-bold text-slate-900 mt-6">11. Changes to Terms</h4>
        <p>11.1. BWGA reserves the right to update these Terms at any time. Changes will be posted on the Platform with an updated "Last Updated" date.</p>
        <p>11.2. Continued use of the Platform after changes constitutes acceptance of the revised Terms.</p>

        <h4 className="font-bold text-slate-900 mt-6">12. Contact</h4>
        <p>For questions about these Terms, contact:</p>
        <p className="mt-2"><strong>BW Global Advisory</strong><br />Email: brayden@bwglobaladvis.info<br />Phone: +63 960 835 4283<br />ABN: 55 978 113 300<br />Melbourne, Australia</p>

        <div className="text-center border-t border-slate-200 pt-4 mt-4">
            <p className="text-xs text-slate-400">- End of Terms & Conditions a"</p>
        </div>
    </div>
);


// -------------------------------------------------------------------------------
// PRIVACY POLICY
// -------------------------------------------------------------------------------
const PrivacyContent: React.FC = () => (
    <div className="space-y-6">
        <div className="text-center border-b border-slate-200 pb-6">
            <h1 className="text-2xl font-light text-slate-900 mb-1">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: 1 February 2026 * Last Updated: 9 February 2026</p>
        </div>

        <p>This Privacy Policy explains how BW Global Advisory (ABN 55 978 113 300) ("BWGA", "we", "us", "our") collects, uses, stores, and protects your personal information when you use the BW Ai platform ("Platform").</p>
        <p>This Policy is designed to comply with the Australian Privacy Act 1988, the Australian Privacy Principles (APPs), the EU General Data Protection Regulation (GDPR), the Philippines Data Privacy Act of 2012, and other applicable international data protection laws.</p>

        <h4 className="font-bold text-slate-900 mt-6">1. Information We Collect</h4>
        <p><strong>1.1. Information You Provide:</strong></p>
        <ul className="list-disc ml-6 space-y-1">
            <li>Organisation name, entity type, industry, and country</li>
            <li>Strategic objectives, market descriptions, partner profiles</li>
            <li>Financial projections, risk assessments, capability descriptions</li>
            <li>Contact information (email, phone) if voluntarily provided</li>
            <li>Chat messages sent to the BW Consultant</li>
            <li>Location search queries</li>
        </ul>
        <p className="mt-3"><strong>1.2. Information Collected Automatically:</strong></p>
        <ul className="list-disc ml-6 space-y-1">
            <li>Browser type and version</li>
            <li>Device type and operating system</li>
            <li>IP address (anonymised where possible)</li>
            <li>Pages viewed, features used, and session duration</li>
            <li>Error logs for debugging and platform improvement</li>
        </ul>
        <p className="mt-3"><strong>1.3. Information from Third-Party Sources:</strong></p>
        <ul className="list-disc ml-6 space-y-1">
            <li>Public data from government databases, World Bank, REST Countries API, and other open data sources - used to enrich location intelligence and scoring</li>
            <li>AI-generated research content from API providers (Google Gemini, OpenAI) - processed transiently and not stored with your personal data</li>
        </ul>

        <h4 className="font-bold text-slate-900 mt-6">2. How We Use Your Information</h4>
        <p>We use collected information for the following purposes:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li>Providing the Platform's core services: report generation, scoring, and document production</li>
            <li>Powering the BW Consultant AI advisor with context-aware responses</li>
            <li>Improving the Platform's accuracy, performance, and user experience</li>
            <li>Diagnosing and fixing technical issues</li>
            <li>Communicating with you about the Platform (only if you have provided contact details)</li>
            <li>Complying with legal obligations</li>
        </ul>

        <h4 className="font-bold text-slate-900 mt-6">3. Data Storage & Security</h4>
        <p>3.1. <strong>Local Storage:</strong> During the R&D phase, user intake data is primarily stored in your browser's local storage. This means your data remains on your device. We do not currently operate centralised user databases for intake data.</p>
        <p>3.2. <strong>AI Service Processing:</strong> When you generate reports or use BW AI Search, your inputs are sent to AI service providers (Google Gemini, OpenAI) for processing. These transmissions are encrypted in transit (TLS 1.2+). AI providers process data according to their respective privacy policies and data processing agreements.</p>
        <p>3.3. <strong>Security Measures:</strong> We implement appropriate technical and organisational measures to protect your information, including encryption in transit, secure API key management, and access controls. As the Platform moves toward commercial deployment, additional security certifications (ISO 27001 alignment) will be pursued.</p>

        <h4 className="font-bold text-slate-900 mt-6">4. Data Sharing</h4>
        <p>4.1. We do not sell your personal information to third parties.</p>
        <p>4.2. We may share data with:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li><strong>AI Service Providers</strong> (Google, OpenAI) - for processing queries and generating analysis, subject to their data processing terms</li>
            <li><strong>Public Data Sources</strong> - we access publicly available datasets; no personal data is shared with these sources</li>
            <li><strong>Law Enforcement</strong> - only where required by law or valid legal process</li>
        </ul>

        <h4 className="font-bold text-slate-900 mt-6">5. Your Rights</h4>
        <p>Depending on your jurisdiction, you may have the following rights:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
            <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
            <li><strong>Objection:</strong> Object to processing of your personal data for certain purposes</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
        </ul>
        <p className="mt-2">To exercise these rights, contact us at brayden@bwglobaladvis.info.</p>

        <h4 className="font-bold text-slate-900 mt-6">6. International Data Transfers</h4>
        <p>6.1. The Platform is developed in Australia and the Philippines. AI processing services may be located in the United States, Europe, or other regions.</p>
        <p>6.2. Where personal data is transferred internationally, we ensure appropriate safeguards are in place, including reliance on adequacy decisions, standard contractual clauses, or binding corporate rules as applicable.</p>
        <p>6.3. The Platform is designed as a global application and aims to comply with data protection requirements in all jurisdictions where it operates, including but not limited to:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li>Australia - Privacy Act 1988, APPs</li>
            <li>European Union - GDPR</li>
            <li>Philippines - Data Privacy Act of 2012</li>
            <li>United Kingdom - UK GDPR and Data Protection Act 2018</li>
            <li>New Zealand - Privacy Act 2020</li>
            <li>Canada - PIPEDA</li>
            <li>United States - applicable state privacy laws (CCPA/CPRA where relevant)</li>
        </ul>

        <h4 className="font-bold text-slate-900 mt-6">7. Cookies & Tracking</h4>
        <p>7.1. The Platform uses essential browser storage (localStorage) for saving your intake progress and preferences. These are functional, not tracking cookies.</p>
        <p>7.2. We do not currently use third-party advertising cookies or cross-site tracking technologies.</p>

        <h4 className="font-bold text-slate-900 mt-6">8. Data Retention</h4>
        <p>8.1. Browser local storage data persists until you clear your browser data or explicitly reset the Platform.</p>
        <p>8.2. AI processing data is transient - queries are processed and responses returned without permanent storage by BWGA.</p>
        <p>8.3. Contact information voluntarily provided is retained until you request its deletion.</p>

        <h4 className="font-bold text-slate-900 mt-6">9. Children's Privacy</h4>
        <p>The Platform is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children.</p>

        <h4 className="font-bold text-slate-900 mt-6">10. Changes to This Policy</h4>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on the Platform with an updated date. Continued use constitutes acceptance.</p>

        <h4 className="font-bold text-slate-900 mt-6">11. Contact & Complaints</h4>
        <p><strong>Data Protection Contact:</strong><br />BW Global Advisory<br />Email: brayden@bwglobaladvis.info<br />Phone: +63 960 835 4283</p>
        <p className="mt-2"><strong>Australian Privacy Complaints:</strong> If you are unsatisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au.</p>
        <p><strong>Philippines Privacy Complaints:</strong> You may contact the National Privacy Commission (NPC) at privacy.gov.ph.</p>
        <p><strong>EU/UK Complaints:</strong> You may lodge a complaint with your local supervisory authority.</p>

        <div className="text-center border-t border-slate-200 pt-4 mt-4">
            <p className="text-xs text-slate-400">- End of Privacy Policy a"</p>
        </div>
    </div>
);


// -------------------------------------------------------------------------------
// ETHICAL AI FRAMEWORK
// -------------------------------------------------------------------------------
const EthicsContent: React.FC = () => (
    <div className="space-y-6">
        <div className="text-center border-b border-slate-200 pb-6">
            <h1 className="text-2xl font-light text-slate-900 mb-1">Ethical AI Framework</h1>
            <p className="text-xs text-slate-400">Effective Date: 1 February 2026 * Last Updated: 9 February 2026</p>
        </div>

        <p>This Ethical AI Framework sets out the principles, safeguards, and governance structures that guide the design, development, and deployment of BW Ai. It reflects our commitment to responsible AI practices aligned with international standards.</p>

        <h4 className="font-bold text-slate-900 mt-6">1. Our AI Ethics Principles</h4>
        <p>BW Ai is built on six core ethical principles:</p>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-sm text-slate-900 mb-1">Transparency</p>
                <p className="text-xs text-slate-600">Every score, recommendation, and conclusion produced by the system is traceable to specific data inputs, formula calculations, and persona debate transcripts. No black boxes.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-sm text-slate-900 mb-1">Accountability</p>
                <p className="text-xs text-slate-600">The system is a decision-support tool. Users retain full accountability for decisions. BWGA takes responsibility for the integrity of its analytical methodology.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-sm text-slate-900 mb-1">Fairness & Non-Discrimination</p>
                <p className="text-xs text-slate-600">The platform is designed to serve all users equally - from regional councils in rural Australia to government agencies in Southeast Asia. Scoring formulas do not discriminate based on location, organisation size, or economic status.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-sm text-slate-900 mb-1">Privacy & Data Protection</p>
                <p className="text-xs text-slate-600">User data is processed minimally and purposefully. We do not sell, share, or monetise user data. Data processing is governed by our Privacy Policy and applicable international law.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-sm text-slate-900 mb-1">Human Oversight</p>
                <p className="text-xs text-slate-600">All AI outputs are advisory. The system is designed to augment human decision-making, not replace it. Critical decisions always require human review and approval.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-sm text-slate-900 mb-1">Public Benefit</p>
                <p className="text-xs text-slate-600">The platform exists to democratise access to institutional-quality strategic analysis - specifically for communities and organisations that have historically been excluded from such tools.</p>
            </div>
        </div>

        <h4 className="font-bold text-slate-900 mt-6">2. Adversarial Design as an Ethical Safeguard</h4>
        <p>Unlike most AI systems that optimise for agreeable responses, BW AI is designed for adversarial reasoning. The 5-persona system (Advocate, Skeptic, Regulator, Accountant, Operator) ensures that every analysis is stress-tested from multiple perspectives before a recommendation is issued.</p>
        <p className="mt-2">This design is an ethical safeguard in itself - it prevents the system from producing uncritical, confirmation-biased outputs that could mislead users into overconfident decisions.</p>

        <h4 className="font-bold text-slate-900 mt-6">3. Transparency & Auditability</h4>
        <p>3.1. <strong>Formula Transparency:</strong> All 38 scoring formulas have defined methodology, documented inputs, and published calculation logic. Users can inspect how every score was derived.</p>
        <p>3.2. <strong>Audit Trail:</strong> Every document produced by the Platform carries a provenance chain showing: which data inputs were used, which formulas were applied, how persona debates concluded, and what threshold gates were evaluated.</p>
        <p>3.3. <strong>Reproducibility:</strong> Given identical inputs, the scoring pipeline produces identical outputs. There is no randomness in the formula layer - only in Monte Carlo simulation ranges, which are documented with P10/P50/P90 bands.</p>

        <h4 className="font-bold text-slate-900 mt-6">4. AI Risk Classification</h4>
        <p>Under the EU AI Act risk classification framework, BW Ai would be classified as a <strong>limited-risk</strong> system. It does not:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li>Make autonomous decisions that directly affect individuals' rights or safety</li>
            <li>Perform biometric identification or social scoring</li>
            <li>Operate critical infrastructure or medical devices</li>
            <li>Engage in law enforcement or judicial decision-making</li>
        </ul>
        <p className="mt-2">It does provide decision-support for investment and strategic planning, which requires transparency obligations that we meet through our audit trail and score provenance systems.</p>

        <h4 className="font-bold text-slate-900 mt-6">5. Bias Mitigation</h4>
        <p>5.1. <strong>Formula-Based Scoring:</strong> The primary scoring pipeline uses deterministic mathematical formulas, not language-model generation. This eliminates the majority of LLM-related bias risks in the scoring layer.</p>
        <p>5.2. <strong>Regional Equity:</strong> The platform is purpose-built for regional and underserved communities. Scoring benchmarks are calibrated for diverse economic contexts - not biased toward developed-market norms.</p>
        <p>5.3. <strong>Persona Diversity:</strong> The adversarial persona system ensures multiple viewpoints are represented in every analysis, reducing the risk of single-perspective bias.</p>
        <p>5.4. <strong>Continuous Calibration:</strong> The Proactive Intelligence Layer includes a backtesting calibration engine that validates scoring accuracy against real-world outcomes and flags drift.</p>

        <h4 className="font-bold text-slate-900 mt-6">6. Human-in-the-Loop</h4>
        <p>BW AI is designed with a strict human-in-the-loop philosophy:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li>No output is automatically actioned - all reports, documents, and recommendations require human review</li>
            <li>Users explicitly initiate report generation and document production</li>
            <li>The system presents go/no-go recommendations but does not execute actions on users' behalf</li>
            <li>The "Draft Finalization" step requires explicit user acceptance before documents are finalised</li>
        </ul>

        <h4 className="font-bold text-slate-900 mt-6">7. Environmental Responsibility</h4>
        <p>7.1. We are committed to minimising the environmental impact of AI computation. The Platform uses efficient prompt engineering, response caching, and selective API calls to reduce unnecessary compute.</p>
        <p>7.2. As we scale, we will evaluate and disclose the carbon footprint of our AI operations and pursue carbon-neutral or carbon-negative computing where feasible.</p>

        <h4 className="font-bold text-slate-900 mt-6">8. International Standards Alignment</h4>
        <p>This Ethical AI Framework is designed to align with:</p>
        <ul className="list-disc ml-6 space-y-1">
            <li><strong>OECD AI Principles</strong> - including inclusive growth, human-centred values, transparency, robustness, and accountability</li>
            <li><strong>UNESCO Recommendation on the Ethics of AI</strong> - proportionality, safety, fairness, sustainability, and human oversight</li>
            <li><strong>EU AI Act</strong> - transparency requirements and risk classification</li>
            <li><strong>NIST AI Risk Management Framework</strong> - governance, mapping, measurement, and management of AI risks</li>
            <li><strong>Australia's AI Ethics Principles</strong> - human-centred, fairness, privacy, reliability, transparency, contestability, and accountability</li>
            <li><strong>Philippines DICT AI Roadmap</strong> - responsible and ethical AI development aligned with national development goals</li>
        </ul>

        <h4 className="font-bold text-slate-900 mt-6">9. 10% Community Commitment</h4>
        <p>BWGA commits that during the beta phase and in future commercial subscriptions, <strong>10% of every paid transaction</strong> will be directed back into initiatives that support regional development and long-term community outcomes. This commitment is a core part of our ethical framework - ensuring that the value created by this platform flows back to the communities it serves.</p>

        <h4 className="font-bold text-slate-900 mt-6">10. Reporting Concerns</h4>
        <p>If you believe the Platform has produced biased, inaccurate, or harmful outputs, or if you have any ethical concerns about the system, please contact us:</p>
        <p className="mt-2"><strong>Ethics Contact:</strong><br />Email: brayden@bwglobaladvis.info<br />Subject line: "AI Ethics Concern"</p>
        <p className="mt-2">All concerns will be reviewed, investigated, and responded to within 14 business days.</p>

        <div className="text-center border-t border-slate-200 pt-4 mt-4">
            <p className="text-xs text-slate-400">- End of Ethical AI Framework a"</p>
        </div>
    </div>
);

export default DocumentModal;

