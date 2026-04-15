import React, { useState } from 'react';
import { FileText, Blocks, Sparkles, X, Users, Globe, Building2, Brain, Shield, BarChart3, FileCheck, Mail, Briefcase, Scale, TrendingUp, Eye, CheckCircle2, Target, ShieldCheck } from 'lucide-react';
import { termsOfEngagement } from '../constants/commandCenterData';

interface UserManualProps {
  onLaunchOS?: () => void;
  onOpenCommandCenter?: () => void;
}

// Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-slate-200">
        <header className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-200 rounded">
            <X size={24} />
          </button>
        </header>
        <main className="p-8 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

// Protocol Section with Click Modal (replacing hover)
const ProtocolSection: React.FC<{
  num: number;
  title: string;
  desc: string;
  fullDetails: { subtitle: string; items: string[] }[];
  onOpenDetails: (num: number, title: string, details: { subtitle: string; items: string[] }[]) => void;
}> = ({ num, title, desc, onOpenDetails, fullDetails }) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-medium">{num}</span>
        <span className="text-xs text-slate-400">Step {num}</span>
      </div>
      <h3 className="font-semibold text-slate-900 text-sm mb-2">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-grow">{desc}</p>
      <div className="flex justify-center">
        <button
          onClick={() => onOpenDetails(num, title, fullDetails)}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
        >
          Click here for details
        </button>
      </div>
    </div>
  );
};

const UserManual: React.FC<UserManualProps> = ({ onLaunchOS, onOpenCommandCenter }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [protocolDetail, setProtocolDetail] = useState<{ num: number; title: string; details: { subtitle: string; items: string[] }[] } | null>(null);
  const [expandedReport, setExpandedReport] = useState<number | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const openProtocolDetail = (num: number, title: string, details: { subtitle: string; items: string[] }[]) => {
    setProtocolDetail({ num, title, details });
  };

  return (
    <div className="bg-white text-slate-800 min-h-screen" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Hero Section - Large with gradient background */}
      <header className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
          <div className="max-w-3xl">
            <p className="text-slate-300 uppercase tracking-widest text-sm mb-6">BRAYDEN WALLS GLOBAL ADVISORY</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 leading-tight tracking-tight">
              Every satisfying answer<br/>deserves to be verified.
            </h1>
            <p className="text-xl text-slate-200 leading-relaxed max-w-xl mb-4">
              The world&rsquo;s first Verified Decision Intelligence Exchange &mdash; institutional-grade intelligence that formally verifies every conclusion through adversarial debate, contradiction detection, and stress-testing before any output reaches you.
            </p>
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              Built from regional development. Architected for every high-stakes decision.
            </p>
          </div>
        </div>
      </header>

      {/* Content section with founder box on right */}
      <section className="bg-white pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left side - Main content (3 columns) */}
            <div className="lg:col-span-3">
              <p className="text-slate-500 uppercase tracking-widest text-xs mb-3">OUR MISSION</p>
              <p className="text-lg text-slate-700 leading-relaxed mb-5 text-justify">
                <strong className="text-slate-900">Every satisfying answer deserves to be verified.</strong> The decisions that shape economies, partnerships, and policy are too often made on unverified assumptions. Five independent AI minds now argue every claim, a SAT solver catches contradictions, and Monte Carlo simulations stress-test every projection &mdash; so what reaches you has already survived adversarial scrutiny.
              </p>

              <p className="text-base text-slate-600 leading-relaxed mb-5 text-justify">
                That problem isn&rsquo;t unique to regions. Every high-stakes decision &mdash; investment, policy, partnership, expansion &mdash; suffers the same failure: unverified assumptions passed off as analysis. Five independent AI minds now argue every claim. A SAT solver catches contradictions. Monte Carlo simulations stress-test projections. The result is institutional-grade intelligence that has already survived scrutiny before it reaches you.
              </p>

              <p className="text-base text-slate-600 leading-relaxed mb-5 text-justify">
                This system was built from regional development &mdash; where the cost of a wrong decision is highest and the margin for error is thinnest. It is now architected for every decision that matters.
              </p>
            </div>
            
            {/* Right side - Founder box (2 columns), overlapping hero above */}
            <div className="lg:col-span-2 lg:-mt-32 relative z-30">
              <div className="bg-white p-6 shadow-xl border-4 border-black text-center">
                <p className="text-slate-500 uppercase tracking-widest text-xs mb-4 font-semibold">WHY THIS PLATFORM EXISTS</p>
                <p className="text-slate-900 text-base leading-relaxed font-bold mb-4">
                  We built this platform to change that. Every formula, every adversarial engine, every verification layer was crafted with one goal: giving every decision-maker the same institutional-grade intelligence that was once reserved for elite firms &mdash; so verified decisions replace unverified assumptions.
                </p>
                <p className="text-xl text-slate-800 font-medium italic" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  - Brayden Walls, Founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE STORY OF VERDIX - Full Width with Side Column */}
      <section className="bg-white py-16 border-b border-slate-200">
          {/* Full-width banner across the entire page */}
          <div className="relative w-full min-h-[32rem] overflow-hidden shadow-lg mb-8 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
            <div className="relative z-10 flex items-center justify-center h-full px-4 py-12">
              <div className="w-full max-w-4xl text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-10 md:p-16 shadow-lg">
                  <p className="text-slate-600 uppercase tracking-widest text-xs mb-3">OUR ORIGIN</p>
                  <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">The Story of VERDIX</h2>
                  <div className="space-y-6 text-left max-w-3xl mx-auto">
                    <p className="text-lg text-slate-800 leading-relaxed text-justify">
                      VERDIX (Verified Decision Intelligence Exchange) wasn't founded in a glass skyscraper in New York or London. It was born on the edge of the developing world, in a small coastal city where the gap between potential and opportunity is painfully clear.
                    </p>
                    <p className="text-base text-slate-700 leading-relaxed text-justify">
                      For years, we watched dedicated regional leaders - mayors, local entrepreneurs, and councils - work tirelessly to attract investment to their communities. They had the vision. They had the drive. They had the raw assets. But time and again, they were ignored by global capital.
                    </p>
                    <p className="text-base text-slate-700 leading-relaxed text-justify">
                      We realized the problem wasn't their ideas; it was their language. Wall Street and global investors speak a specific dialect of risk matrices, financial models, and feasibility studies. If you can't speak that language, you don't get a seat at the table. Wealthy corporations hire armies of consultants costing $50,000 a month to write these documents for them. Regional communities simply couldn't afford that admission fee, so they were left behind.
                    </p>
                    <p className="text-base text-slate-700 leading-relaxed text-justify">
                      We built VERDIX to break that barrier. Our mission is simple: to give the underdog - the regional council, the local business, the emerging exporter - the same strategic firepower as a multinational corporation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6">

          {/* Section 2: What VERDIX Actually Is - Full Width */}
          <div className="max-w-7xl mx-auto px-6">
            <div className="border-t border-slate-200 pt-6">
              <p className="text-slate-500 uppercase tracking-widest text-xs mb-3">THE TECHNOLOGY</p>
              <h3 className="text-2xl font-light text-slate-900 mb-4">What VERDIX Actually Is</h3>
              <p className="text-base text-slate-600 leading-relaxed mb-4 text-justify">
                Standard AI tools generate text - they predict the next word. That's useful for writing emails, but it's not enough to structure a complex deal, stress-test a business case, or produce a document you'd stake your reputation on. We built VERDIX to close that gap: an intelligence system that reasons through problems, validates assumptions with hard data, and delivers outputs you can confidently present to investors, boards, and government bodies.
              </p>
              <p className="text-base text-slate-600 leading-relaxed mb-4 text-justify">
                <strong className="text-slate-900">VERDIX</strong> is a Sovereign-Grade Intelligence Operating System. It is not a chatbot. It is a <strong className="text-slate-900">digital boardroom</strong>: a team of specialized AI agents that research, debate, score, and write - coordinated by two proprietary engines working in concert. The <strong className="text-slate-900">NSIL (Nexus Strategic Intelligence Layer)</strong> is a reasoning engine with 38 proprietary mathematical formulas that stress-test every dimension of your project, from financial viability to regulatory friction.
              </p>
              <p className="text-base text-slate-600 leading-relaxed mb-4 text-justify">
                The second engine is the <strong className="text-slate-900">Human Cognition Engine</strong>a"7 proprietary behavioural models that simulate how real decision-makers process complexity, allocate attention, and react under pressure. These models address neural field dynamics, predictive processing, attention allocation, emotional valence, and working memory constraints. Together, these <strong className="text-slate-900">38 mathematical formulations</strong> create an intelligence platform that doesn't just analyze data - it anticipates how humans will respond to it.
              </p>
              <p className="text-base text-slate-600 leading-relaxed mb-4 text-justify">
                In practice, this powers every feature of the platform: <strong className="text-slate-900">VERDIX Search</strong> for instant intelligence on any city, company, or government; the <strong className="text-slate-900">Live Report System</strong> for real-time multi-agent analysis; the <strong className="text-slate-900">VERDIX Consultant</strong> as an embedded AI advisor; and a <strong className="text-slate-900">Document Factory</strong> producing 200+ institutional-grade outputs.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Left side - Main content (9 columns) */}
            <div className="lg:col-span-9">

                {/* Section 3: Why This Is Different (The "Magic") - Full Script in White Boxes */}
                <div className="border-t border-slate-200 pt-6 mt-4">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                      <p className="text-slate-500 uppercase tracking-widest text-xs mb-3">THE DIFFERENCE</p>
                      <h3 className="text-2xl font-light text-slate-900 mb-4">Why This Is Different <span className="text-slate-400">(The "Magic")</span></h3>
                      <p className="text-base text-slate-600 leading-relaxed mb-5 text-justify">
                        VERDIX doesn't just generate text like other AI; it puts your ideas through a <strong className="text-slate-900">digital gauntlet</strong>, rigorously stress-testing them. This stems from a fundamental design philosophy that contrasts sharply with most AI-driven strategic tools:
                      </p>
                      <p className="text-lg text-slate-900 font-bold mb-2">Beyond Echo Chambers</p>
                      <p className="text-base text-slate-600 leading-relaxed mb-0 text-justify">Unlike generic Large Language Models (LLMs) such as ChatGPT or Bard, which are designed to be helpful and agreeable, VERDIX is built for adversarial reasoning. These LLMs can generate business plans, but independent analysis reveals a tendency to confirm user biases and a lack of critical evaluation. They are optimized for language prediction, not strategic validation. VERDIX, in contrast, actively seeks weaknesses.</p>
                      <p className="text-lg text-slate-900 font-bold mb-2">Consultant-Level Scrutiny, Automated</p>
                      <p className="text-base text-slate-600 leading-relaxed mb-0 text-justify">Traditional consulting firms do offer critical review, but this process is expensive and often subjective. A small team of analysts, potentially lacking diverse expertise or regional understanding, formulates an opinion. VERDIX replicates this scrutiny using a multi-agent system. It splits your project into five specialized AI personas - a Skeptic, Regulator, Accountant, Advocate, and Operator. Each persona acts as a dedicated consultant, applying its own analytical framework to assess your plan from a unique angle.</p>
                      <p className="text-lg text-slate-900 font-bold mb-2">Quantified, Not Just "Considered"</p>
                      <p className="text-base text-slate-600 leading-relaxed mb-0 text-justify">While other systems might acknowledge risks qualitatively, VERDIX goes further: The system subjects your project to <strong className="text-slate-900">38 proprietary mathematical formulas</strong>, generating hard metrics like the Success Probability Index (SPI) and Regional Return on Investment (RROI). These indices aren't based on subjective opinion; they provide a quantifiable, comparable score, allowing you to benchmark your project against a data-backed standard. This level of granular, quantitative analysis is rarely found in standard strategic AI platforms that focus on text generation rather than numerical validation.</p>
                      <p className="text-lg text-slate-900 font-bold mb-2">Simulating Real-World Pressure</p>
                      <p className="text-base text-slate-600 leading-relaxed mb-0 text-justify">The combination of these personas and the rigid scoring creates a simulation of a real-world investment committee. The AI isn't just "generating content"; it's processing, debating, and scoring your idea as if it were in a high-stakes pitch.</p>
                      <p className="text-base text-slate-600 leading-relaxed text-justify">
                        This multi-faceted, adversarial approach, combined with its quantitative rigor, sets VERDIX apart, offering a level of strategic validation that's simply not available in most other AI-driven systems or through traditional, less accessible consulting avenues.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Section 4: Why This Matters */}
                <div className="border-t border-slate-200 pt-6 mt-4">
                  <p className="text-slate-500 uppercase tracking-widest text-xs mb-3">THE IMPACT</p>
                  <h3 className="text-2xl font-light text-slate-900 mb-4">Why This Matters</h3>
                  
                  <p className="text-base text-slate-600 leading-relaxed mb-4 text-justify">
                    This system changes the game because it <strong className="text-slate-900">turns ambition into proof</strong>. Instead of a rough idea, you walk away with <strong className="text-slate-900">institutional-grade documentation</strong>a"Investment Prospectuses, Risk Assessments, and Legal Frameworks - that look like they came from a top-tier firm. Every document comes with an audit trail showing exactly why the system made its recommendations.
                  </p>
                  <p className="text-base text-slate-700 leading-relaxed text-justify">
                    <strong className="text-slate-900">This is the massive difference:</strong> It means a small town in regional Australia or a startup in Southeast Asia can finally compete on a level playing field with the biggest players in the world. It removes the "consultant tax" and ensures that great projects are judged on their merit, not on who they know or how much they paid for advice.
                  </p>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* DESIGNED FOR EVERYONE - Gradient Banner */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          
          {/* Content */}
          <div className="relative max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-6 shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <p className="text-orange-400 uppercase tracking-widest text-xs mb-3 font-semibold">DESIGNED FOR EVERYONE</p>
            <h3 className="text-3xl md:text-4xl font-light text-white mb-6">You Don't Need to Be an Expert.<br/><span className="font-medium">You Just Need to Try.</span></h3>
            
            <p className="text-slate-200 leading-relaxed text-base mb-10 max-w-3xl mx-auto">
              Most strategic tools assume you already have a team, a budget, and a plan. This one doesn't. 
              It was built for the person staring at a blank page, wondering where to even start - and for the 
              experienced operator who's tired of reinventing the wheel every time a new opportunity lands on their desk.
            </p>

            {/* Two boxes side by side */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-left">
                <p className="text-orange-400 uppercase tracking-widest text-xs mb-3 font-semibold">WHO THIS IS BUILT FOR</p>
                <p className="text-white font-medium mb-3 text-base">
                  Regional Councils & RDAs * State & Federal Agencies * Businesses Looking Regional * First-Time Exporters
                </p>
                <p className="text-slate-200 text-base leading-relaxed">
                  Whether you're a council trying to attract new industries, a government agency evaluating investment proposals, 
                  a business exploring regional expansion, or an entrepreneur looking to export for the first time - this platform 
                  gives you the analytical firepower and document automation that was once reserved for major corporations.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-left">
                <p className="text-indigo-400 uppercase tracking-widest text-xs mb-3 font-semibold">THE SYSTEM DOES WHAT YOU SHOULDN'T HAVE TO</p>
                <p className="text-white font-medium mb-3 text-base">
                  Structure your thinking. Score your viability. Stress-test your assumptions. Build your documents.
                </p>
                <p className="text-slate-200 text-base leading-relaxed">
                  You focus on your opportunity. The platform handles the analysis, the formatting, and the professional presentation 
                  that makes decision-makers take you seriously.
                </p>
              </div>
            </div>

            {/* Closing statement */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-3xl mx-auto">
              <p className="text-slate-100 leading-relaxed text-base">
                The technology behind this is complexa"27 formulas, five AI personas, Monte Carlo simulations, 200+ document types. 
                But you don't need to understand any of that. <strong className="text-white">The complexity is hidden. What you see is clarity.</strong>
              </p>
            </div>
          </div>
        </section>

      {/* Partnership & Pilots Section */}
      <section className="py-12 bg-gradient-to-br from-amber-700 via-orange-700 to-amber-800 text-white border-b border-amber-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-200 uppercase tracking-widest text-xs mb-3">NEXT STEPS</p>
              <h2 className="text-3xl font-light text-white mb-6">Partnership & Pilot Programs</h2>
                <p className="text-amber-100 leading-relaxed mb-6">
                The most effective way to demonstrate the value of VERDIX is to apply it to real-world challenges. 
                We propose collaborative partnerships through structured pilot programs.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Investment Screening Pilot</p>
                    <p className="text-amber-100 text-sm">Use the platform for screening test cases with foreign investment review boards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Regional Development Pilot</p>
                    <p className="text-amber-100 text-sm">Create investment prospectuses for target regions with economic development agencies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">PPP Modeling Pilot</p>
                    <p className="text-amber-100 text-sm">Model forthcoming Public-Private Partnerships with infrastructure ministries</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl h-80 flex items-end">
              <div className="p-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-amber-300">
                  <p className="text-amber-800 font-medium mb-1">Vision for the Future</p>
                  <p className="text-slate-600 text-sm">Deploy as a shared, national strategic asset - a sovereign-grade intelligence platform enhancing high-stakes decision-making across government.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10-Section Protocol - Consolidated */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Intelligence System Banner - FIRST */}
          <div className="mb-16 border-4 border-slate-400 rounded-2xl p-6 bg-white">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-slate-500 uppercase tracking-widest text-xs mb-2">THE INTELLIGENCE PIPELINE</p>
              <h2 className="text-2xl font-light text-slate-900 mb-4">From Rough Brief to Board-Ready Package</h2>
              <p className="text-slate-600 max-w-4xl mx-auto text-base leading-relaxed mb-4">
                Most AI tools take your input and generate a response. This system takes your input and <strong className="text-slate-900">interrogates it</strong>. 
                It doesn't ask "what do you want me to write?"a"it asks "is this opportunity real, and can you prove it?"
              </p>
              <p className="text-slate-600 max-w-4xl mx-auto text-base leading-relaxed">
                The pipeline works in three stages: <strong className="text-slate-900">Structured Intake</strong> (the 10-Step Protocol forces you to articulate every dimension of your opportunity), 
                <strong className="text-slate-900">Adversarial Analysis</strong> (five AI personas debate your case while 27 formulas score it mathematically), 
                and <strong className="text-slate-900">Institutional Output</strong> (the Document Factory generates board-ready deliverables with full audit trails). 
                What takes consulting firms weeks and tens of thousands of dollars happens here in minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Document Factory */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 to-amber-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 uppercase tracking-widest text-xs">INSTITUTIONAL-GRADE OUTPUTS</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">The Document Factory</h3>
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                  <strong className="text-white">Why it exists:</strong> Regional projects fail not because they lack merit, but because they lack presentation. 
                  Investors and government bodies expect documents that look like they came from McKinsey or Deloitte. 
                  Without institutional-grade formatting, credible projects get dismissed.
                </p>
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                  <strong className="text-white">How it works:</strong> The Document Factory doesn't just fill in templates - it synthesizes your 10-Step Protocol data 
                  with NSIL's analysis scores, persona debate outcomes, and risk simulations into cohesive narratives. Every document includes 
                  embedded provenance: the specific formulas used, the confidence intervals, and the audit trail for every claim.
                </p>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  <strong className="text-white">What you get:</strong> Investment Prospectuses, Risk Assessment Matrices, Partnership Briefs, LOI/MOU Templates, 
                  Grant Applications, Due Diligence Packs - all scored, cross-referenced, and ready for board-level presentation.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white/10 rounded-lg p-2 border border-orange-400/30 text-center">
                    <div className="text-xl font-bold text-orange-400">200+</div>
                    <div className="text-[11px] text-slate-300">Report & Document Types</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 border border-orange-400/30 text-center">
                    <div className="text-xl font-bold text-orange-400">150+</div>
                    <div className="text-[11px] text-slate-300">Letter Templates</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveModal('outputs')} className="flex-1 px-3 py-2 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-100 transition-all inline-flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Full Catalog
                  </button>
                </div>
                <p>
                  <strong className="text-slate-900">The audit trail:</strong> Every recommendation traces back to specific data inputs, formula calculations, 
                  and persona debate transcripts. This isn't a black box - it's court-defensible, investor-ready documentation of exactly 
                  why the system reached each conclusion.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setActiveModal('outputs')} className="flex-1 px-3 py-2 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-100 transition-all inline-flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Full Catalog
                  </button>
                </div>
              </div>

              {/* Reasoning Engine */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 uppercase tracking-widest text-xs">THE REASONING ENGINE</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">NSIL - Nexus Strategic Intelligence Layer</h3>
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                  <strong className="text-white">The problem it solves:</strong> Standard AI (GPT, Claude, etc.) predicts the next word. It has no concept of "is this actually viable?" or "what could go wrong?" It will happily write you a business plan for an impossible idea because it has no mechanism to challenge assumptions.
                </p>
                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                  <strong className="text-white">The architecture:</strong> NSIL is a Neuro-Symbolic system - it fuses neural network creativity with symbolic logic and mathematical proof. Before generating any output, it runs your opportunity through five specialized AI personas (Advocate, Skeptic, Regulator, Accountant, Operator) that argue with each other. Only after reaching consensus does it generate conclusions - and those conclusions are scored by 27 proprietary formulas including SPI(TM) (Success Probability Index), RROI(TM) (Regional ROI), and SEAM(TM) (Stakeholder Alignment Matrix).
                </p>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  <strong className="text-white">The audit trail:</strong> Every recommendation traces back to specific data inputs, formula calculations, and persona debate transcripts. This isn't a black box - it's court-defensible, investor-ready documentation of exactly why the system reached each conclusion.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-slate-900">5-Layer Architecture</span>
                    </div>
                    <ul className="text-[11px] text-slate-500 space-y-0">
                      <li>* Input Validation & Governance</li>
                      <li>* Multi-Agent Adversarial Debate</li>
                      <li>* Quantitative Formula Scoring</li>
                      <li>* Monte Carlo Stress Testing</li>
                      <li>* Output Synthesis & Provenance</li>
                    </ul>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-slate-900">5 AI Personas</span>
                    </div>
                    <ul className="text-[11px] text-slate-500 space-y-0">
                      <li>* Advocate - finds the upside</li>
                      <li>* Skeptic - attacks weak points</li>
                      <li>* Regulator - checks compliance</li>
                      <li>* Accountant - validates numbers</li>
                      <li>* Operator - tests execution</li>
                    </ul>
                  </div>
                </div>
                <button onClick={() => setActiveModal('architecture')} className="w-full px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all inline-flex items-center justify-center gap-2">
                  <Blocks className="w-4 h-4" />
                  View Full Architecture & 27 Formulas
                </button>
              </div>
            </div>
          </div>

          {/* Ten-Step Protocol - SECOND */}
          <p className="text-slate-500 uppercase tracking-widest text-xs mb-3 text-center">THE COMPREHENSIVE INTAKE FRAMEWORK</p>
          <h2 className="text-3xl font-light text-slate-900 mb-4 text-center">The Ten-Step Protocol</h2>
          <p className="text-lg text-slate-500 mb-4 max-w-3xl mx-auto text-center">
            Before <strong className="text-slate-700">NSIL (Nexus Strategic Intelligence Layer)</strong> can analyze, it must understand. 
            This professional-grade intake framework guides you through every critical dimension of your strategic plan - forcing clarity, 
            eliminating blind spots, and ensuring the AI reasoning engine works with complete, well-structured inputs.
          </p>
          <p className="text-xs text-slate-400 mb-4 max-w-xl mx-auto text-center">
            <span className="text-indigo-500">a'</span> For more on how NSIL transforms your inputs into intelligence, see the 
            <button onClick={() => setActiveModal('architecture')} className="text-indigo-600 hover:underline font-medium ml-1">Technical Architecture</button> section above.
          </p>
          <p className="text-sm text-slate-400 mb-8 max-w-2xl mx-auto text-center">
            <span className="text-slate-500 font-medium">Click any step</span> to see the detailed data requirements.
          </p>
          
          {/* Protocol Steps Grid - 2 rows of 5 in landscape */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
            <ProtocolSection 
              num={1} 
              title="Identity & Foundation" 
              desc="Establish organizational credibility, legal structure, and competitive positioning."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Organization Core", items: ["Legal Entity Name & Registration", "Entity Type (Public/Private/Startup/NGO)", "Industry Classification (NAICS/SIC)", "Years in Operation", "Headquarters & Operating Regions"] },
                { subtitle: "Organizational Capacity", items: ["Total Employees & Revenue Bands", "EBITDA / Net Income", "Market Share Analysis", "Profitability Trend Assessment"] },
                { subtitle: "Competitive Position", items: ["Primary Competitors (3-5)", "Unique IP / Technology / Moat", "Brand Recognition Level", "Customer Concentration Risk"] },
                { subtitle: "Financial Stability", items: ["Credit Rating / Payment History", "Audit Status", "Debt Levels & Cash Position"] }
              ]}
            />
            <ProtocolSection 
              num={2} 
              title="Mandate & Strategy" 
              desc="Define strategic vision, objectives, target partner profile, and value proposition."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Strategic Vision", items: ["3-5 Year Outlook", "Market Expansion Goals", "Capability Acquisition Targets", "ESG/Sustainability Objectives"] },
                { subtitle: "Core Problem", items: ["Problem We're Solving (measurable)", "Current State vs Desired State", "Why Now - Urgency Factors", "Cost of Inaction Analysis"] },
                { subtitle: "Objectives & KPIs", items: ["Top 3 Strategic Objectives", "Primary KPI (the one number)", "Success Timeline", "Measurement Methodology"] },
                { subtitle: "Value Proposition", items: ["What We Bring (quantified)", "What We Expect (quantified)", "Win-Win Framework", "Risk & Upside Share Model"] }
              ]}
            />
            <ProtocolSection 
              num={3} 
              title="Market & Context" 
              desc="Analyze market dynamics, regulatory environment, and macro-economic factors."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Market Definition", items: ["TAM/SAM/SOM in $ and units", "Market Growth Rate (CAGR %)", "Market Maturity Stage", "Key Segments & Mix"] },
                { subtitle: "Market Dynamics", items: ["Top 5 Market Trends", "Technology Disruption Threats", "Regulatory Headwinds/Tailwinds", "Buyer Decision Cycle"] },
                { subtitle: "Geographic Context", items: ["Target Country/Region/City", "Import/Export Regulations", "Tax Treaty Status", "IP Protection Quality", "Geopolitical Risk Score"] },
                { subtitle: "Macro Factors", items: ["GDP Growth Forecast", "Inflation & Currency Risk", "Trade Policy & Tariffs", "Labor Cost Trends"] }
              ]}
            />
            <ProtocolSection 
              num={4} 
              title="Partners & Ecosystem" 
              desc="Map stakeholder landscape, alignment scores, and relationship dynamics."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Target Counterparties", items: ["Partner Name(s) & Size", "Partner Core Capabilities", "Partner Geographic Footprint", "Decision-Maker Contacts"] },
                { subtitle: "Stakeholder Landscape", items: ["Executive Stakeholders", "Operational Stakeholders", "Legal/Compliance Stakeholders", "Board/Investor Interests"] },
                { subtitle: "Alignment Assessment", items: ["Strategic Alignment Score (1-10)", "Cultural Fit Assessment", "Decision-making Speed Match", "Risk Tolerance Alignment"] },
                { subtitle: "Relationship Dynamics", items: ["Trust Level (1-10)", "Prior Dealings History", "Communication Cadence", "Deal Experience Level"] }
              ]}
            />
            <ProtocolSection 
              num={5} 
              title="Financial Model" 
              desc="Structure investment requirements, revenue projections, and ROI scenarios."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Investment Requirements", items: ["Capital Investment Needed ($)", "Investment Type (equity/debt/grant)", "Working Capital Needed", "Contingency Buffer %"] },
                { subtitle: "Revenue Model", items: ["Revenue Streams (up to 3)", "Year 1/3/5 Revenue Targets", "Revenue Growth Rate %", "Recurring vs One-time Split"] },
                { subtitle: "Cost Structure", items: ["COGS as % of Revenue", "Gross Margin Target", "Operating Expense Budget", "Head Count Plan"] },
                { subtitle: "Return Analysis", items: ["Break-even Timeline", "NPV @ Discount Rate", "IRR & Return Multiple", "Payback Period (months)"] }
              ]}
            />
            <ProtocolSection 
              num={6} 
              title="Risk & Mitigation" 
              desc="Identify and quantify risks with probability/impact matrices and mitigation plans."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Risk Register", items: ["Top 5 Risks with Probability %", "Impact Assessment ($M)", "Mitigation Plan per Risk", "Risk Owner Assignment"] },
                { subtitle: "Market Risks", items: ["Market Size Risk", "Competitive Response Risk", "Customer Acceptance Risk", "Technology Obsolescence"] },
                { subtitle: "Operational Risks", items: ["Key Person Risk", "Supply Chain Risk", "Integration Risk", "Talent Acquisition Risk"] },
                { subtitle: "Financial & Legal Risks", items: ["Currency & Interest Rate Risk", "Regulatory & Litigation Risk", "Contract & Tax Risk", "Data Privacy/Security Risk"] }
              ]}
            />
            <ProtocolSection 
              num={7} 
              title="Resources & Capability" 
              desc="Assess organizational readiness, team strength, and capability gaps."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Technology Stack", items: ["Core Technology Platform", "Integration Requirements", "IP/Patents Protected", "Scalability Assessment"] },
                { subtitle: "Team & Talent", items: ["Executive Team Profiles", "Specialized Roles Needed", "Bench Strength Analysis", "External Advisor Needs"] },
                { subtitle: "Organizational Capabilities", items: ["Sales & Operations Capability", "P&L Management Track Record", "M&A Integration Experience", "Change Management Ability"] },
                { subtitle: "Capability Gaps", items: ["What We Have", "What Partner Must Provide", "What We Can Build", "What We Must Acquire"] }
              ]}
            />
            <ProtocolSection 
              num={8} 
              title="Execution Plan" 
              desc="Define implementation roadmap, milestones, dependencies, and go/no-go gates."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Phase 1: Foundation (M1-3)", items: ["Key Milestones & Owners", "Decisions to Make", "Approvals Needed", "Budget Required"] },
                { subtitle: "Phase 2: Ramp (M4-9)", items: ["Scaling Milestones", "Resource Ramp Plan", "Integration Checkpoints", "Performance Gates"] },
                { subtitle: "Phase 3: Scale (M10-18)", items: ["Full Operation Milestones", "Optimization Targets", "Expansion Triggers", "Exit/Continuation Criteria"] },
                { subtitle: "Critical Path", items: ["Blocking Dependencies", "Parallel Workstreams", "Buffer Time Allocation", "Go/No-Go Decision Points"] }
              ]}
            />
            <ProtocolSection 
              num={9} 
              title="Governance & Monitoring" 
              desc="Establish oversight structure, decision matrices, and performance tracking."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Governance Structure", items: ["Steering Committee Members", "Working Groups Defined", "Decision Authority Matrix", "Escalation Path Protocol"] },
                { subtitle: "Key Metrics", items: ["Financial KPIs (revenue, margin)", "Operational KPIs (efficiency)", "Strategic KPIs (market share)", "Health Indicators (engagement)"] },
                { subtitle: "Decision Framework", items: ["Committee Approval Thresholds", "Operational Decision Rights", "Financial Approval Limits", "Disagreement Resolution Process"] },
                { subtitle: "Contingency Planning", items: ["Revenue Miss Response", "Key Person Exit Plan", "Partner Relationship Protocol", "Market Change Triggers"] }
              ]}
            />
            <ProtocolSection 
              num={10} 
              title="Scoring & Readiness" 
              desc="Final validation and readiness assessment with go/no-go recommendation."
              onOpenDetails={openProtocolDetail}
              fullDetails={[
                { subtitle: "Completion Scoring", items: ["Green (Ready): >90% complete", "Yellow (In Progress): 70-90%", "Red (Not Ready): <70%", "Critical Fields Validation"] },
                { subtitle: "Readiness Assessment", items: ["All Sections Reviewed", "No Red Flags Detected", "Key Gaps Identified", "Remediation Plan if Needed"] },
                { subtitle: "Final Recommendation", items: ["Proceed / Pause / Re-structure", "Confidence Score (0-100)", "Key Drivers of Decision", "Pressure Points to Address"] },
                { subtitle: "Next Steps", items: ["Immediate Actions Required", "Owner Assignments", "Timeline to Decision", "Stakeholder Communications"] }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Key Features Section with Modal Triggers */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-full">
          {/* Regional Growth Commitment - with gradient banner */}
          <div className="mb-16">
            {/* Gradient Banner with Text Overlay - Full Width */}
            <div 
              className="relative w-full overflow-hidden mb-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            >
              
              {/* Content */}
              <div className="relative z-10 py-16 px-8 md:px-16">
                <p className="text-blue-400 uppercase tracking-widest text-xs mb-3 text-center font-medium">SOLVING REAL PROBLEMS</p>
                <h2 className="text-3xl md:text-4xl font-light text-white mb-6 text-center">Regional Challenges, Intelligent Solutions</h2>
                
                <p className="text-lg text-slate-200 mb-6 max-w-3xl mx-auto text-center leading-relaxed">
                  This platform exists for one reason: to help capital, partnerships, and capability reach the places that are too often overlooked - despite holding extraordinary, investable potential.
                </p>
                <p className="text-lg text-slate-200 mb-6 max-w-3xl mx-auto text-center leading-relaxed">
                  VERDIX is 100% dedicated to regional growth. During this beta phase and in future subscriptions, we commit that <strong className="text-white">10% of every paid transaction</strong> will be directed back into initiatives that support regional development and long-term community outcomes. This is more than an AI/human report system - it's a practical bridge between global decision-makers and real opportunities on the ground.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-6 text-left">
                  <div className="bg-white/5 border border-white/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">Starter Access</p>
                    <h3 className="text-xl font-bold text-white mb-1">5 Days</h3>
                    <p className="text-sm text-slate-200 mb-2">Full Access Pass</p>
                    <p className="text-2xl font-bold text-white">Free</p>
                  </div>
                  <div className="bg-white/5 border border-white/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">Subscription</p>
                    <h3 className="text-xl font-bold text-white mb-1">3 Months</h3>
                    <p className="text-sm text-slate-200 mb-2">Full Access</p>
                    <p className="text-2xl font-bold text-white">$239</p>
                  </div>
                  <div className="bg-white/5 border border-white/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">Subscription</p>
                    <h3 className="text-xl font-bold text-white mb-1">6 Months</h3>
                    <p className="text-sm text-slate-200 mb-2">Full Access</p>
                    <p className="text-2xl font-bold text-white">$429</p>
                  </div>
                  <div className="bg-white/5 border border-white/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">Subscription</p>
                    <h3 className="text-xl font-bold text-white mb-1">12 Months</h3>
                    <p className="text-sm text-slate-200 mb-2">Full Access</p>
                    <p className="text-2xl font-bold text-white">$610</p>
                  </div>
                </div>
                <p className="text-lg text-slate-300 max-w-3xl mx-auto text-center leading-relaxed">
                  What started as an "over-engineered" idea is now a working intelligence layer designed to clarify complexity, surface what matters, and turn promising briefs into credible, defensible action. A new voice for regions. A new standard for how opportunity is evaluated - anywhere in the world.
                </p>
              </div>
            </div>
          </div>

          {/* Launch Platform CTA */}
            <div className="max-w-6xl mx-auto px-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-10 text-center border border-slate-700 mt-16">
              <h3 className="text-2xl font-light text-white mb-3">Ready to Experience the Platform?</h3>
              <p className="text-slate-400 mb-6 max-w-xl mx-auto">
                Launch the full VERDIX Intelligence OS to start analyzing partnership opportunities with sovereign-grade analytical depth.
              </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => onOpenCommandCenter?.()}
                    className="px-8 py-4 bg-transparent text-white font-semibold border border-slate-600 rounded-lg hover:bg-slate-800/60 transition-all inline-flex items-center justify-center gap-3 text-lg"
                  >
                    <Eye className="w-6 h-6" />
                    View Command Center
                  </button>
                  <button 
                    onClick={() => setShowTermsModal(true)}
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all inline-flex items-center justify-center gap-3 text-lg"
                  >
                    <Blocks className="w-6 h-6" />
                    Launch Intelligence OS
                  </button>
                </div>
              <p className="text-slate-500 text-xs mt-4">By accessing the platform, you agree to our Terms & Conditions</p>
            </div>
          </div>
        </div>
      </section>

      {/* OUTPUTS MODAL - Complete Document Catalog */}
      <Modal isOpen={activeModal === 'outputs'} onClose={() => setActiveModal(null)} title="Document Factory: Complete Output Catalog">
        <div className="space-y-6">
          
          {/* Introduction */}
          <div className="bg-slate-900 text-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Complete Document Library
              </h3>
              <div className="flex gap-4 text-center">
                <div><div className="text-2xl font-bold">265+</div><div className="text-xs text-slate-400">Documents</div></div>
                <div><div className="text-2xl font-bold">150+</div><div className="text-xs text-slate-400">Letters</div></div>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Every document below is auto-generated from your 10-Step Protocol data, fully populated with your specific
              opportunity details, and scored using the 27-formula algorithm suite. Export to PDF, Word, or PowerPoint.
            </p>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Flexible Report Lengths & Multiple Selections
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div>
                  <strong className="text-white">Report Length Options:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>* 1-Page Executive Summary</li>
                    <li>* 5-10 Page Strategic Brief</li>
                    <li>* 20-50 Page Comprehensive Analysis</li>
                    <li>* Multi-Paper Research Reports</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-white">Selection Flexibility:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>* Pick multiple reports to cover all areas</li>
                    <li>* Select as many letters as needed</li>
                    <li>* Mix document types for complete coverage</li>
                    <li>* No limits on your approach to understanding</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 italic">
                You're not limited in how you understand and connect with ideal partners. Choose exactly what you need to build comprehensive strategic intelligence.
              </p>
            </div>
          </div>

          {/* STRATEGIC INTELLIGENCE REPORTS (25+ types) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-600" />
                Strategic Intelligence Reports (25+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">Executive Summary Report</div>
              <div className="p-2 bg-slate-50 rounded">Strategic Intelligence Brief</div>
              <div className="p-2 bg-slate-50 rounded">Board Presentation Deck</div>
              <div className="p-2 bg-slate-50 rounded">Investment Thesis Document</div>
              <div className="p-2 bg-slate-50 rounded">Opportunity Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Strategic Options Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Competitive Intelligence Report</div>
              <div className="p-2 bg-slate-50 rounded">Market Entry Strategy</div>
              <div className="p-2 bg-slate-50 rounded">Partnership Recommendation</div>
              <div className="p-2 bg-slate-50 rounded">Go/No-Go Decision Memo</div>
              <div className="p-2 bg-slate-50 rounded">Scenario Planning Report</div>
              <div className="p-2 bg-slate-50 rounded">Strategic Roadmap (1-5 Year)</div>
              <div className="p-2 bg-slate-50 rounded">SWOT Analysis Report</div>
              <div className="p-2 bg-slate-50 rounded">Porter's Five Forces Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Blue Ocean Strategy Canvas</div>
              <div className="p-2 bg-slate-50 rounded">Value Chain Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Strategic Fit Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Synergy Quantification Report</div>
              <div className="p-2 bg-slate-50 rounded">Integration Playbook</div>
              <div className="p-2 bg-slate-50 rounded">100-Day Plan</div>
              <div className="p-2 bg-slate-50 rounded">Transformation Roadmap</div>
              <div className="p-2 bg-slate-50 rounded">Exit Strategy Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Succession Planning Brief</div>
              <div className="p-2 bg-slate-50 rounded">Strategic Review (Annual)</div>
              <div className="p-2 bg-slate-50 rounded">Quarterly Strategy Update</div>
            </div>
          </div>

          {/* MARKET & INDUSTRY ANALYSIS (30+ types) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-600" />
                Market & Industry Analysis (30+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">Market Analysis Dossier</div>
              <div className="p-2 bg-slate-50 rounded">TAM/SAM/SOM Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Industry Landscape Report</div>
              <div className="p-2 bg-slate-50 rounded">Competitive Benchmarking</div>
              <div className="p-2 bg-slate-50 rounded">Market Sizing Study</div>
              <div className="p-2 bg-slate-50 rounded">Customer Segmentation Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Buyer Persona Profiles</div>
              <div className="p-2 bg-slate-50 rounded">Market Entry Feasibility</div>
              <div className="p-2 bg-slate-50 rounded">Country Risk Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Regulatory Environment Scan</div>
              <div className="p-2 bg-slate-50 rounded">Trade Policy Analysis</div>
              <div className="p-2 bg-slate-50 rounded">FDI Climate Report</div>
              <div className="p-2 bg-slate-50 rounded">Economic Indicators Dashboard</div>
              <div className="p-2 bg-slate-50 rounded">Currency Risk Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Labor Market Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Supply Chain Mapping</div>
              <div className="p-2 bg-slate-50 rounded">Distribution Channel Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Pricing Strategy Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Technology Landscape Scan</div>
              <div className="p-2 bg-slate-50 rounded">Digital Maturity Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Innovation Ecosystem Map</div>
              <div className="p-2 bg-slate-50 rounded">Startup & Venture Landscape</div>
              <div className="p-2 bg-slate-50 rounded">M&A Activity Report</div>
              <div className="p-2 bg-slate-50 rounded">IPO Pipeline Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Private Equity Landscape</div>
              <div className="p-2 bg-slate-50 rounded">Trend Forecast (3-5 Year)</div>
              <div className="p-2 bg-slate-50 rounded">Disruption Risk Assessment</div>
              <div className="p-2 bg-slate-50 rounded">ESG/Sustainability Scan</div>
              <div className="p-2 bg-slate-50 rounded">Geopolitical Risk Brief</div>
              <div className="p-2 bg-slate-50 rounded">Trade Corridor Analysis</div>
            </div>
          </div>

          {/* FINANCIAL DOCUMENTS (35+ types) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                Financial Documents (35+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">Financial Model (Excel)</div>
              <div className="p-2 bg-slate-50 rounded">Pro Forma Financials</div>
              <div className="p-2 bg-slate-50 rounded">DCF Valuation Model</div>
              <div className="p-2 bg-slate-50 rounded">Comparable Company Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Precedent Transaction Analysis</div>
              <div className="p-2 bg-slate-50 rounded">LBO Model</div>
              <div className="p-2 bg-slate-50 rounded">Merger Model</div>
              <div className="p-2 bg-slate-50 rounded">Synergy Valuation</div>
              <div className="p-2 bg-slate-50 rounded">Revenue Forecast Model</div>
              <div className="p-2 bg-slate-50 rounded">Cost Structure Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Unit Economics Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Break-even Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Sensitivity Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Monte Carlo Simulation</div>
              <div className="p-2 bg-slate-50 rounded">Scenario Modeling (Bull/Bear/Base)</div>
              <div className="p-2 bg-slate-50 rounded">Working Capital Model</div>
              <div className="p-2 bg-slate-50 rounded">Cash Flow Projection</div>
              <div className="p-2 bg-slate-50 rounded">Funding Requirements Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Capital Structure Options</div>
              <div className="p-2 bg-slate-50 rounded">Debt Capacity Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Term Sheet (Draft)</div>
              <div className="p-2 bg-slate-50 rounded">Investment Memorandum</div>
              <div className="p-2 bg-slate-50 rounded">Pitch Deck (Financial)</div>
              <div className="p-2 bg-slate-50 rounded">Data Room Index</div>
              <div className="p-2 bg-slate-50 rounded">Investor Q&A Document</div>
              <div className="p-2 bg-slate-50 rounded">ROI Analysis Report</div>
              <div className="p-2 bg-slate-50 rounded">Payback Period Analysis</div>
              <div className="p-2 bg-slate-50 rounded">NPV/IRR Summary</div>
              <div className="p-2 bg-slate-50 rounded">Earnout Structure Options</div>
              <div className="p-2 bg-slate-50 rounded">Purchase Price Allocation</div>
              <div className="p-2 bg-slate-50 rounded">Tax Structure Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Transfer Pricing Framework</div>
              <div className="p-2 bg-slate-50 rounded">FX Hedging Strategy</div>
              <div className="p-2 bg-slate-50 rounded">Insurance Requirements</div>
              <div className="p-2 bg-slate-50 rounded">Budget Template (Annual)</div>
            </div>
          </div>

          {/* DUE DILIGENCE DOCUMENTS (25+ types) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-slate-600" />
                Due Diligence Documents (25+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">Due Diligence Checklist (Master)</div>
              <div className="p-2 bg-slate-50 rounded">Financial Due Diligence Report</div>
              <div className="p-2 bg-slate-50 rounded">Commercial Due Diligence Report</div>
              <div className="p-2 bg-slate-50 rounded">Legal Due Diligence Summary</div>
              <div className="p-2 bg-slate-50 rounded">Tax Due Diligence Report</div>
              <div className="p-2 bg-slate-50 rounded">IT/Technology Due Diligence</div>
              <div className="p-2 bg-slate-50 rounded">HR/Talent Due Diligence</div>
              <div className="p-2 bg-slate-50 rounded">Environmental Due Diligence</div>
              <div className="p-2 bg-slate-50 rounded">IP Due Diligence Report</div>
              <div className="p-2 bg-slate-50 rounded">Regulatory Due Diligence</div>
              <div className="p-2 bg-slate-50 rounded">Compliance Due Diligence</div>
              <div className="p-2 bg-slate-50 rounded">Customer Due Diligence</div>
              <div className="p-2 bg-slate-50 rounded">Supplier Due Diligence</div>
              <div className="p-2 bg-slate-50 rounded">Contract Review Summary</div>
              <div className="p-2 bg-slate-50 rounded">Litigation Review</div>
              <div className="p-2 bg-slate-50 rounded">Insurance Review</div>
              <div className="p-2 bg-slate-50 rounded">Real Estate Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Asset Verification Report</div>
              <div className="p-2 bg-slate-50 rounded">Quality of Earnings Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Working Capital Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Red Flag Report</div>
              <div className="p-2 bg-slate-50 rounded">Management Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Culture Compatibility Audit</div>
              <div className="p-2 bg-slate-50 rounded">Synergy Validation Report</div>
              <div className="p-2 bg-slate-50 rounded">Integration Risk Assessment</div>
            </div>
          </div>

          {/* RISK MANAGEMENT (20+ types) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-600" />
                Risk Management (20+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">Risk Register (Master)</div>
              <div className="p-2 bg-slate-50 rounded">Risk Mitigation Strategy</div>
              <div className="p-2 bg-slate-50 rounded">Risk Heat Map</div>
              <div className="p-2 bg-slate-50 rounded">Probability/Impact Matrix</div>
              <div className="p-2 bg-slate-50 rounded">Contingency Planning Framework</div>
              <div className="p-2 bg-slate-50 rounded">Business Continuity Plan</div>
              <div className="p-2 bg-slate-50 rounded">Crisis Management Playbook</div>
              <div className="p-2 bg-slate-50 rounded">Political Risk Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Country Risk Scorecard</div>
              <div className="p-2 bg-slate-50 rounded">Regulatory Risk Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Compliance Risk Map</div>
              <div className="p-2 bg-slate-50 rounded">Cybersecurity Risk Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Data Privacy Risk Review</div>
              <div className="p-2 bg-slate-50 rounded">Third-Party Risk Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Supply Chain Risk Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Concentration Risk Report</div>
              <div className="p-2 bg-slate-50 rounded">Key Person Risk Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Reputational Risk Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Scenario Stress Testing</div>
              <div className="p-2 bg-slate-50 rounded">Exit Risk Assessment</div>
            </div>
          </div>

          {/* GOVERNANCE & OPERATIONS (25+ types) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-600" />
                Governance & Operations (25+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">Governance Framework</div>
              <div className="p-2 bg-slate-50 rounded">Steering Committee Charter</div>
              <div className="p-2 bg-slate-50 rounded">Board Pack Template</div>
              <div className="p-2 bg-slate-50 rounded">Decision Authority Matrix</div>
              <div className="p-2 bg-slate-50 rounded">Escalation Protocol</div>
              <div className="p-2 bg-slate-50 rounded">Meeting Cadence Framework</div>
              <div className="p-2 bg-slate-50 rounded">Reporting Requirements</div>
              <div className="p-2 bg-slate-50 rounded">KPI Dashboard</div>
              <div className="p-2 bg-slate-50 rounded">Scorecard Template</div>
              <div className="p-2 bg-slate-50 rounded">Execution Roadmap (Gantt)</div>
              <div className="p-2 bg-slate-50 rounded">Milestone Tracker</div>
              <div className="p-2 bg-slate-50 rounded">RACI Matrix</div>
              <div className="p-2 bg-slate-50 rounded">Workstream Plan</div>
              <div className="p-2 bg-slate-50 rounded">Resource Allocation Plan</div>
              <div className="p-2 bg-slate-50 rounded">Change Management Plan</div>
              <div className="p-2 bg-slate-50 rounded">Communication Plan</div>
              <div className="p-2 bg-slate-50 rounded">Stakeholder Map</div>
              <div className="p-2 bg-slate-50 rounded">Training Plan</div>
              <div className="p-2 bg-slate-50 rounded">Knowledge Transfer Protocol</div>
              <div className="p-2 bg-slate-50 rounded">SOP Template Library</div>
              <div className="p-2 bg-slate-50 rounded">Process Mapping Document</div>
              <div className="p-2 bg-slate-50 rounded">Quality Assurance Framework</div>
              <div className="p-2 bg-slate-50 rounded">Performance Review Template</div>
              <div className="p-2 bg-slate-50 rounded">Lessons Learned Report</div>
              <div className="p-2 bg-slate-50 rounded">Post-Mortem Analysis</div>
            </div>
          </div>

          {/* PARTNER ASSESSMENT (15+ types) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-600" />
                Partner Assessment (15+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">Partner Compatibility Assessment</div>
              <div className="p-2 bg-slate-50 rounded">SEAM(TM) Alignment Report</div>
              <div className="p-2 bg-slate-50 rounded">Stakeholder Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Network Value Assessment</div>
              <div className="p-2 bg-slate-50 rounded">Cultural Fit Scorecard</div>
              <div className="p-2 bg-slate-50 rounded">Decision-Maker Profiles</div>
              <div className="p-2 bg-slate-50 rounded">Relationship Mapping</div>
              <div className="p-2 bg-slate-50 rounded">Influence Diagram</div>
              <div className="p-2 bg-slate-50 rounded">Partner Scorecard</div>
              <div className="p-2 bg-slate-50 rounded">Reference Check Framework</div>
              <div className="p-2 bg-slate-50 rounded">Background Verification</div>
              <div className="p-2 bg-slate-50 rounded">Reputation Analysis</div>
              <div className="p-2 bg-slate-50 rounded">Media/Press Review</div>
              <div className="p-2 bg-slate-50 rounded">Social Listening Report</div>
              <div className="p-2 bg-slate-50 rounded">Sanctions/Watchlist Check</div>
            </div>
          </div>

          {/* LETTER TEMPLATES (150+ types) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-600" />
                Letter & Communication Templates (150+ Types)
              </h3>
            </div>
            <div className="p-4">
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Outreach & Introduction</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>* Initial Contact Letter</div>
                    <div>* Introduction Request</div>
                    <div>* Meeting Request</div>
                    <div>* Partnership Inquiry</div>
                    <div>* Investment Interest Letter</div>
                    <div>* JV Exploration Letter</div>
                    <div>* Alliance Proposal</div>
                    <div>* Collaboration Request</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Formal Agreements</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>* Letter of Intent (LOI)</div>
                    <div>* Memorandum of Understanding</div>
                    <div>* Non-Disclosure Agreement</div>
                    <div>* Exclusivity Agreement</div>
                    <div>* Term Sheet Cover Letter</div>
                    <div>* Heads of Terms</div>
                    <div>* Binding Offer Letter</div>
                    <div>* Acceptance Letter</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Government & Regulatory</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>* Minister Introduction Letter</div>
                    <div>* Embassy Correspondence</div>
                    <div>* Trade Commissioner Letter</div>
                    <div>* Regulatory Inquiry</div>
                    <div>* License Application Cover</div>
                    <div>* Permit Request</div>
                    <div>* Compliance Certification</div>
                    <div>* Policy Submission</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Investor Relations</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>* Investor Update Letter</div>
                    <div>* Funding Request</div>
                    <div>* Capital Call Notice</div>
                    <div>* Distribution Notice</div>
                    <div>* Annual Letter to Investors</div>
                    <div>* Quarterly Update</div>
                    <div>* Board Report Cover</div>
                    <div>* Shareholder Communication</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Negotiation & Deal</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>* Counter-Proposal Letter</div>
                    <div>* Price Adjustment Request</div>
                    <div>* Extension Request</div>
                    <div>* Deadline Modification</div>
                    <div>* Condition Waiver Request</div>
                    <div>* Closing Confirmation</div>
                    <div>* Signing Ceremony Agenda</div>
                    <div>* Post-Signing Acknowledgment</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Follow-Up & Relationship</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>* Thank You Letter</div>
                    <div>* Meeting Follow-Up</div>
                    <div>* Action Item Summary</div>
                    <div>* Progress Update</div>
                    <div>* Milestone Celebration</div>
                    <div>* Anniversary Acknowledgment</div>
                    <div>* Relationship Renewal</div>
                    <div>* Referral Request</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-500 text-center">
                + 100 more templates including: Termination notices, Dispute resolution, Force majeure, 
                Amendment requests, Guarantee letters, Comfort letters, Reference letters, and more...
              </div>
            </div>
          </div>

          {/* Legal Documents Note */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-slate-600" />
                Legal Document Frameworks (20+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">JV Agreement Framework</div>
              <div className="p-2 bg-slate-50 rounded">Shareholders Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Share Purchase Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Asset Purchase Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Subscription Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Convertible Note</div>
              <div className="p-2 bg-slate-50 rounded">SAFE Agreement</div>
              <div className="p-2 bg-slate-50 rounded">License Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Distribution Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Franchise Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Management Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Service Level Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Supply Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Off-take Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Guarantee Agreement</div>
              <div className="p-2 bg-slate-50 rounded">Security Agreement</div>
            </div>
            <div className="px-4 pb-4 text-xs text-slate-500">
              <em>Note: Legal frameworks require review by qualified legal counsel before execution.</em>
            </div>
          </div>

          {/* GOVERNMENT SUBMISSIONS & INTERNATIONAL BODY APPLICATIONS (20+ types) - NEW */}
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Government Submissions & International Body Applications (20+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Government Grant Application</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">National Development Plan Submission</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">SEZ/Industrial Zone Application</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Investment Incentive Request</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Trade Agreement Policy Brief</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">World Bank Project Proposal</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">ADB Funding Application</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">IFC Investment Proposal</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">UNIDO Technical Cooperation Request</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">UNDP Development Programme Application</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Green Climate Fund Proposal</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">AfDB Project Application</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">EBRD Financing Proposal</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">GEF Grant Application</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Municipal Investment Pitch</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Provincial Development Submission</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Cross-Border Cooperation Proposal</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Public-Private Partnership Proposal</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Bilateral Aid Cooperation Framework</div>
              <div className="p-2 bg-blue-50 rounded border border-blue-100">Climate Adaptation Fund Application</div>
            </div>
          </div>

          {/* TRADE & CUSTOMS DOCUMENTS (15+ types) - NEW */}
          <div className="border border-green-200 rounded-lg overflow-hidden">
            <div className="bg-green-50 px-4 py-3 border-b border-green-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Trade, Customs & Export Documents (15+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-green-50 rounded border border-green-100">Export Readiness Assessment</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Market Access Strategy</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Trade Facilitation Analysis</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Customs Tariff Classification Guide</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Rules of Origin Compliance Brief</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">FTA Utilisation Strategy</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Certificate of Origin Application</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Sanitary/Phytosanitary Compliance</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Trade Finance Facility Application</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Letter of Credit Documentation</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Incoterms Selection Analysis</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Anti-Dumping Response Brief</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Trade Remedies Application</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Export Insurance Application</div>
              <div className="p-2 bg-green-50 rounded border border-green-100">Bonded Warehouse Application</div>
            </div>
          </div>

          {/* COMMUNITY & SOCIAL IMPACT (15+ types) - NEW */}
          <div className="border border-purple-200 rounded-lg overflow-hidden">
            <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Community Engagement & Social Impact (15+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Community Impact Assessment</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Social License Strategy</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Stakeholder Engagement Plan</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Community Benefit Agreement</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Indigenous Consultation Protocol</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Environmental Social Governance Report</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Gender Equality Impact Brief</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Youth Employment Strategy</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Local Content Development Plan</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Community Development Fund Design</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Resettlement Action Plan</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Free Prior Informed Consent (FPIC)</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Social Return on Investment (SROI)</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Cultural Heritage Impact Assessment</div>
              <div className="p-2 bg-purple-50 rounded border border-purple-100">Grievance Redress Mechanism</div>
            </div>
          </div>

          {/* COMPLIANCE & REGULATORY (15+ types) - NEW */}
          <div className="border border-amber-200 rounded-lg overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Compliance, Anti-Corruption & Regulatory (15+ Types)
              </h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-amber-50 rounded border border-amber-100">AML/KYC Compliance Framework</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Anti-Bribery Compliance Manual</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Sanctions Screening Report</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">FCPA/UKBA Compliance Brief</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Beneficial Ownership Declaration</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">PEP Screening Assessment</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">EITI Compliance Report</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Data Protection Impact Assessment</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">GDPR Compliance Framework</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Environmental Compliance Audit</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Labor Standards Compliance</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Tax Compliance Certificate</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Regulatory Change Impact Assessment</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Cross-Border Compliance Map</div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">Whistleblower Policy Framework</div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900 text-white rounded-lg p-6 text-center">
            <h4 className="font-bold text-lg mb-2">Complete the 10-Step Protocol to Generate Your Documents</h4>
            <p className="text-sm text-slate-300">
              Every document is populated with your specific opportunity data, scored using our 27-formula suite, 
              and exportable in PDF, Word, PowerPoint, or Excel format.
            </p>
          </div>
        </div>
      </Modal>

      {/* ARCHITECTURE MODAL - Formal University Technical Report */}
      <Modal isOpen={activeModal === 'architecture'} onClose={() => setActiveModal(null)} title="VERDIX: Technical Architecture Report">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
          
          {/* Title Block */}
          <div className="text-center border-b border-slate-300 pb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Technical Report * January 2026</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">VERDIX</h2>
            <h3 className="text-lg text-slate-700 mb-4">A Neuro-Symbolic Decision-Support Architecture for Cross-Border Partnership Intelligence</h3>
            <p className="text-xs text-slate-500">Brayden Walls Global Advisory * Research & Development Division</p>
          </div>

          {/* Abstract */}
          <div className="border-l-4 border-slate-400 pl-4 py-2 bg-slate-50">
            <h4 className="font-bold text-slate-900 mb-2">Abstract</h4>
            <p className="text-slate-700 mb-2">
              This document presents the technical architecture of VERDIX, a decision-support system designed for cross-border partnership analysis and regional investment intelligence. The system integrates three core innovations: (1) a neuro-symbolic reasoning layer combining large language models with formal logic validation, (2) a multi-agent adversarial debate framework using five specialist personas, and (3) a 21-formula quantified scoring suite executed via directed acyclic graph (DAG) scheduling.
            </p>
            <p className="text-slate-700 mb-4">
              Unlike conventional AI assistants that produce unstructured text, VERDIX generates auditable, explainable outputs where every recommendation is traceable to its inputs, scoring components, and debate evidence. This architecture addresses the limitations of both traditional consulting (slow, expensive, subjective) and generic AI tools (unstructured, unverifiable, hallucination-prone).
            </p>
            {/* Sample Formula */}
            <div className="text-center py-4 border-t border-slate-300">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sample Quantified Index</p>
              <p className="text-base font-bold text-slate-900" style={{ fontSize: '16px' }}>
                RROI = (1 a^' TCO) A -  0.3 + CRI A -  0.4 + DealMultiplier A -  0.8
              </p>
              <p className="text-xs text-slate-500 mt-2 italic">
                Risk-adjusted Return on Investment: Inversely weighted cost efficiency plus country readiness plus deal scale factor
              </p>
            </div>
          </div>

          {/* 1. Introduction */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">1. Introduction</h4>
            <p className="mb-3">
              Strategic decision-making in cross-border partnerships requires synthesis of diverse information: market conditions, regulatory environments, partner capabilities, risk factors, and financial projections. Traditional approaches rely on consulting teams who manually gather data, apply subjective frameworks, and produce narrative recommendations over weeks or months.
            </p>
            <p className="mb-3">
              Recent advances in large language models (LLMs) offer speed and accessibility, but introduce new problems: outputs are unstructured, unverifiable, and prone to hallucination. There is no audit trail, no quantified scoring, and no mechanism to detect logical contradictions in user inputs or AI reasoning.
            </p>
            <p>
              VERDIX addresses these gaps by implementing a hybrid architecture that preserves the generative capabilities of LLMs while adding structure, validation, and explainability. The system processes user inputs through a formal intake protocol, validates them for logical consistency, subjects strategic options to multi-perspective adversarial debate, scores outcomes using mathematical indices, and delivers recommendations with full provenance chains.
            </p>
          </div>

          {/* 2. System Architecture */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">2. System Architecture Overview</h4>
            <p className="mb-3">
              The architecture comprises six integrated subsystems, collectively termed the <strong>Nexus Strategic Intelligence Layer (NSIL)</strong>:
            </p>
            <div className="bg-slate-100 p-4 rounded border border-slate-200 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 font-semibold">Phase</th>
                    <th className="text-left py-2 font-semibold">Subsystem</th>
                    <th className="text-left py-2 font-semibold">Function</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">1. Validate</td>
                    <td className="py-2 font-mono">SATContradictionSolver</td>
                    <td className="py-2">Checks user inputs for logical inconsistencies using DPLL satisfiability algorithm</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">2. Debate</td>
                    <td className="py-2 font-mono">BayesianDebateEngine</td>
                    <td className="py-2">Five-persona adversarial evaluation with Bayesian belief updating</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">3. Score</td>
                    <td className="py-2 font-mono">DAGScheduler</td>
                    <td className="py-2">Parallel execution of 21 quantified indices with dependency resolution</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">4. Synthesize</td>
                    <td className="py-2 font-mono">DecisionTreeSynthesizer</td>
                    <td className="py-2">Template selection and section ordering based on scores and context</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">5. Cognify</td>
                    <td className="py-2 font-mono">HumanCognitionEngine</td>
                    <td className="py-2">Proprietary behavioural processing using 7 models (neural field dynamics, predictive processing, action selection, attention allocation, emotional valence, information integration, working memory)</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">6. Deliver</td>
                    <td className="py-2 font-mono">ReportOrchestrator</td>
                    <td className="py-2">Final assembly with provenance chain attachment</td>
                  </tr>
                  <tr>
                    <td className="py-2">7. Enhance</td>
                    <td className="py-2 font-mono">ProactiveOrchestrator</td>
                    <td className="py-2">Autonomous monitoring, backtesting calibration, anomaly detection, opportunity scanning, and self-improvement on every report</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Each phase produces structured outputs that feed into subsequent phases, creating a traceable pipeline from raw user input to final deliverable.
            </p>
          </div>

          {/* Representative Formula Display */}
          {/* 3. Quantified Scoring Suite */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">3. Quantified Scoring Suite</h4>
            <p className="mb-3">
              The system implements 38 mathematically-defined indices organized into a directed acyclic graph (DAG). This structure enables parallel execution of independent formulas while respecting dependencies between composite indices. The suite combines 21 traditional strategic formulas with 7 proprietary behavioural models and 10 advanced risk assessment indices.
            </p>
            
            <p className="mb-3"><strong>3.1 Primary Indices (5)</strong></p>
            <p className="mb-2">These are the highest-level strategic scores, synthesizing multiple subordinate indices:</p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 font-semibold w-16">Index</th>
                    <th className="text-left py-2 font-semibold">Full Name</th>
                    <th className="text-left py-2 font-semibold">Function</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">SPI</td><td className="py-2">Success Probability Index</td><td className="py-2">Weighted synthesis of market, partner, regulatory, and execution readiness factors</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">RROI</td><td className="py-2">Regional Return on Investment</td><td className="py-2">Risk-adjusted ROI incorporating regional cost structures and opportunity size</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">SEAM</td><td className="py-2">Stakeholder Ecosystem Alignment Model</td><td className="py-2">Measures alignment, influence mapping, and incentive structure coherence</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">IVAS</td><td className="py-2">Implementation Velocity & Activation Score</td><td className="py-2">Activation readiness, implementation friction, and timeline realism</td></tr>
                  <tr><td className="py-2 font-mono">SCF</td><td className="py-2">Strategic Consensus Factor</td><td className="py-2">Aggregates readiness, value capture potential, and stakeholder consensus</td></tr>
                </tbody>
              </table>
            </div>

            <p className="mb-3"><strong>3.2 Foundation Indices (4)</strong></p>
            <p className="mb-2">Independent indices computed at DAG Level 0 (no dependencies):</p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 font-semibold w-16">Index</th>
                    <th className="text-left py-2 font-semibold">Full Name</th>
                    <th className="text-left py-2 font-semibold">Function</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">PRI</td><td className="py-2">Political Risk Index</td><td className="py-2">Political stability, regulatory environment, market stability assessment</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">CRI</td><td className="py-2">Country Risk Index</td><td className="py-2">Economic indicators, infrastructure quality, talent availability</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">BARNA</td><td className="py-2">Barriers & Regulatory Navigation Assessment</td><td className="py-2">Regulatory, competitive, capital, and cultural barriers</td></tr>
                  <tr><td className="py-2 font-mono">TCO</td><td className="py-2">Total Cost of Ownership</td><td className="py-2">Operating costs, capital expenditure, compliance overhead</td></tr>
                </tbody>
              </table>
            </div>

            <p className="mb-3"><strong>3.3 Derived Indices (8)</strong></p>
            <p className="mb-2">Indices computed from foundation indices at DAG Levels 1-2:</p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 font-semibold w-16">Index</th>
                    <th className="text-left py-2 font-semibold">Full Name</th>
                    <th className="text-left py-2 font-semibold">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">NVI</td><td className="py-2">Network Value Index</td><td className="py-2">BARNA</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">RNI</td><td className="py-2">Regulatory Navigation Index</td><td className="py-2">PRI</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">CAP</td><td className="py-2">Capability Readiness</td><td className="py-2">CRI</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">ESI</td><td className="py-2">Ecosystem Supplier Index</td><td className="py-2">NVI, BARNA</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">FRS</td><td className="py-2">Flywheel Resilience Score</td><td className="py-2">SPI, RROI</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">AGI</td><td className="py-2">Activation Gate Index</td><td className="py-2">IVAS</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">VCI</td><td className="py-2">Value Creation Index</td><td className="py-2">SEAM</td></tr>
                  <tr><td className="py-2 font-mono">ATI</td><td className="py-2">Asset Transfer Index</td><td className="py-2">ESI, CAP</td></tr>
                </tbody>
              </table>
            </div>

            <p className="mb-3"><strong>3.4 Terminal Indices (4)</strong></p>
            <p className="mb-2">Final-stage indices computed at DAG Level 3:</p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 font-semibold w-16">Index</th>
                    <th className="text-left py-2 font-semibold">Full Name</th>
                    <th className="text-left py-2 font-semibold">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">ISI</td><td className="py-2">Integration Speed Index</td><td className="py-2">SEAM, CAP</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">OSI</td><td className="py-2">Operational Synergy Index</td><td className="py-2">ESI, VCI</td></tr>
                  <tr className="border-b border-slate-200"><td className="py-2 font-mono">SRA</td><td className="py-2">Sovereign Risk Assessment</td><td className="py-2">SCF, PRI</td></tr>
                  <tr><td className="py-2 font-mono">IDV</td><td className="py-2">Index of Decision Variance</td><td className="py-2">SCF, RROI</td></tr>
                </tbody>
              </table>
            </div>

            <p className="mb-3">
              Each index produces a score (0-100), a letter grade (A+ through F), a list of component weights, and a set of driver explanations. This structure ensures that every score is fully explainable and auditable.
            </p>
          </div>

          {/* 4. Multi-Agent Debate Framework */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">4. Multi-Agent Debate Framework</h4>
            <p className="mb-3">
              The system implements adversarial validation through a five-persona debate mechanism. Each persona represents a distinct analytical perspective, and all five evaluate every strategic option independently before a Bayesian consensus algorithm synthesizes their positions.
            </p>
            
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 font-semibold w-24">Persona</th>
                    <th className="text-left py-2 font-semibold">Analytical Focus</th>
                    <th className="text-left py-2 font-semibold">Key Questions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 font-semibold">Skeptic</td>
                    <td className="py-2">Risk identification, assumption stress-testing, downside scenarios</td>
                    <td className="py-2">"What could go wrong? What are we missing?"</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 font-semibold">Advocate</td>
                    <td className="py-2">Upside potential, synergies, optionality, value creation</td>
                    <td className="py-2">"What's the opportunity? How do we maximize value?"</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 font-semibold">Regulator</td>
                    <td className="py-2">Compliance, legal pathways, sanctions, ethical constraints</td>
                    <td className="py-2">"Is this permissible? What approvals are required?"</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 font-semibold">Accountant</td>
                    <td className="py-2">Financial viability, cash flow, margins, economic sustainability</td>
                    <td className="py-2">"Do the numbers work? When is break-even?"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold">Operator</td>
                    <td className="py-2">Execution feasibility, team capacity, infrastructure, supply chain</td>
                    <td className="py-2">"Can we actually do this? Do we have the resources?"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mb-3">
              <strong>Consensus Algorithm:</strong> The debate engine uses Bayesian belief updating with an early stopping threshold. When 75% consensus is reached (typically in 2-3 rounds), the debate concludes. Unresolved disagreements are preserved as explicit decision points rather than being artificially resolved.
            </p>
          </div>

          {/* 5. Validation & Contradiction Detection */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">5. Validation & Contradiction Detection</h4>
            <p className="mb-3">
              The system employs a SAT (Boolean Satisfiability) solver based on the DPLL algorithm to detect logical contradictions in user inputs. This addresses a common failure mode where users provide internally inconsistent requirements (e.g., "low risk, high ROI, fast timeline, minimal investment").
            </p>
            <p className="mb-3">
              When contradictions are detected, the system generates specific warnings identifying which constraints are in tension, rather than proceeding with impossible assumptions.
            </p>
          </div>

          {/* 6. Provenance & Auditability */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">6. Provenance & Auditability</h4>
            <p className="mb-3">
              Every recommendation produced by VERDIX includes a complete provenance chain. This chain links each output to:
            </p>
            <ul className="list-disc list-inside mb-3 text-slate-700">
              <li><strong>Input Provenance:</strong> Source data, timestamp, and confidence level for each input parameter</li>
              <li><strong>Computation Trace:</strong> Formula inputs, weights applied, intermediate values, and final scores</li>
              <li><strong>Debate Evidence:</strong> Persona arguments, supporting data, vote rationale, and consensus metrics</li>
            </ul>
            <p>
              This structure enables regulatory review, board scrutiny, and post-hoc analysis of decision rationale. It also facilitates outcome learning: when actual results become available, they can be compared against predictions to improve future scoring accuracy.
            </p>
          </div>

          {/* 7. Comparative Analysis */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">7. Comparative Analysis</h4>
            <p className="mb-4">
              The following table compares VERDIX capabilities against alternative approaches:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded overflow-hidden">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-2 text-left font-semibold">Capability</th>
                    <th className="p-2 text-center font-semibold">Generic LLMs</th>
                    <th className="p-2 text-center font-semibold">Consulting Firms</th>
                    <th className="p-2 text-center font-semibold">BI Dashboards</th>
                    <th className="p-2 text-center font-semibold bg-slate-300">VERDIX</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200"><td className="p-2">Structured Intake</td><td className="p-2 text-center">No</td><td className="p-2 text-center">Manual</td><td className="p-2 text-center">No</td><td className="p-2 text-center bg-slate-100 font-medium">10-Section Protocol</td></tr>
                  <tr className="border-t border-slate-200"><td className="p-2">Multi-Perspective Validation</td><td className="p-2 text-center">No</td><td className="p-2 text-center">Team-dependent</td><td className="p-2 text-center">No</td><td className="p-2 text-center bg-slate-100 font-medium">5-Persona Debate</td></tr>
                  <tr className="border-t border-slate-200"><td className="p-2">Quantified Scoring</td><td className="p-2 text-center">No</td><td className="p-2 text-center">Subjective</td><td className="p-2 text-center">Metrics only</td><td className="p-2 text-center bg-slate-100 font-medium">21 Indices</td></tr>
                  <tr className="border-t border-slate-200"><td className="p-2">Contradiction Detection</td><td className="p-2 text-center">No</td><td className="p-2 text-center">Manual</td><td className="p-2 text-center">No</td><td className="p-2 text-center bg-slate-100 font-medium">SAT Solver</td></tr>
                  <tr className="border-t border-slate-200"><td className="p-2">Audit Trail</td><td className="p-2 text-center">No</td><td className="p-2 text-center">Documents</td><td className="p-2 text-center">Logs</td><td className="p-2 text-center bg-slate-100 font-medium">Full Provenance</td></tr>
                  <tr className="border-t border-slate-200"><td className="p-2">Processing Time</td><td className="p-2 text-center">Seconds</td><td className="p-2 text-center">Weeks</td><td className="p-2 text-center">Real-time</td><td className="p-2 text-center bg-slate-100 font-medium">1-3 seconds</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 8. Performance Characteristics */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">8. Performance Characteristics</h4>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 font-semibold">Component</th>
                    <th className="text-left py-2 font-semibold">Algorithm</th>
                    <th className="text-left py-2 font-semibold">Performance Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">Vector Memory</td>
                    <td className="py-2">LSH + cosine similarity</td>
                    <td className="py-2">O(log n) retrieval, 10-50x faster than linear search</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">Debate Engine</td>
                    <td className="py-2">Bayesian belief updating</td>
                    <td className="py-2">Early stopping at 75% consensus (2-3 rounds typical)</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">DAG Scheduler</td>
                    <td className="py-2">Topological sort + memoization</td>
                    <td className="py-2">4-level parallel execution, 3-5x speedup</td>
                  </tr>
                  <tr>
                    <td className="py-2">Lazy Evaluation</td>
                    <td className="py-2">On-demand computation</td>
                    <td className="py-2">2-4x resource savings for unused indices</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 9. Conclusion */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">9. Conclusion</h4>
            <p className="mb-3">
              VERDIX represents a novel approach to strategic decision-support that addresses fundamental limitations of both traditional consulting and generic AI tools. By combining neuro-symbolic reasoning, multi-agent adversarial debate, and quantified scoring with full provenance tracking, the system produces outputs that are:
            </p>
            <ul className="list-disc list-inside mb-3 text-slate-700">
              <li>Explainable (every score traces to its inputs and reasoning)</li>
              <li>Auditable (complete provenance chain for regulatory and board review)</li>
              <li>Validated (multi-perspective debate prevents single-thread bias)</li>
              <li>Quantified (mathematical indices replace subjective assessments)</li>
              <li>Fast (seconds instead of weeks)</li>
            </ul>
            <p>
              This architecture establishes a foundation for continued development toward sovereign-grade decision intelligence for cross-border partnerships and regional investment analysis.
            </p>
          </div>

          {/* References Footer */}
          <div className="border-t border-slate-300 pt-4 mt-6">
            <p className="text-xs text-slate-500 text-center">
              VERDIX * Technical Architecture Report * Version 3.2 * January 2026<br/>
              A(c) 2026 Brayden Walls Global Advisory. All formulas and methodologies are proprietary.
            </p>
          </div>

        </div>
      </Modal>

      {/* TESTING MODAL - 12 Sample Reports Archive */}
      <Modal isOpen={activeModal === 'testing'} onClose={() => setActiveModal(null)} title="Training Archive: 12 Sample Intelligence Reports">
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-slate-900 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Real Examples: What the 10-Step Protocol Produces</h3>
            <p className="text-slate-300 text-sm mb-4">
              These 12 reports were generated during system development, demonstrating exactly what you'll receive after 
              completing the <strong className="text-white">10-Step Intelligence Protocol</strong>. Each one applies the full 
              27-formula scoring suite and 5-persona debate engine to produce board-ready strategic intelligence.
            </p>
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">How These Were Created</div>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-700 rounded px-2 py-1 text-white font-semibold">1</span>
                  <span>10-Step Protocol Completed</span>
                </div>
                <span className="text-slate-500">a'</span>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-700 rounded px-2 py-1 text-white font-semibold">2</span>
                  <span>27 Algorithms Applied</span>
                </div>
                <span className="text-slate-500">a'</span>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-700 rounded px-2 py-1 text-white font-semibold">3</span>
                  <span>Full Report Generated</span>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
              <div className="bg-slate-800 px-3 py-2 rounded"><span className="text-xl font-bold block">12</span>Full Reports</div>
              <div className="bg-slate-800 px-3 py-2 rounded"><span className="text-xl font-bold block">8</span>Industries</div>
              <div className="bg-slate-800 px-3 py-2 rounded"><span className="text-xl font-bold block">6</span>Regions</div>
              <div className="bg-slate-800 px-3 py-2 rounded"><span className="text-xl font-bold block">27</span>Formulas Applied</div>
            </div>
          </div>

          {/* Letter of Intent - Ice Breaker */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-slate-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900">Partnership Outreach Letter Template</h4>
                <p className="text-sm text-slate-600">Generated alongside each report to facilitate initial partner engagement</p>
              </div>
            </div>
            <div className="bg-white border border-slate-300 rounded-lg p-4 font-mono text-xs text-slate-700 leading-relaxed">
              <div className="mb-3 text-slate-500">[ORGANIZATION LETTERHEAD]</div>
              <div className="mb-2"><strong>RE: Strategic Partnership Inquiry</strong></div>
              <p className="mb-2">Dear [Partner Name],</p>
              <p className="mb-2">
                [Organization] is exploring strategic opportunities in [Target Region] within the [Industry] sector. 
                Based on our analysis using VERDIX's proprietary scoring framework, we have identified 
                your organization as a high-compatibility partner (SEAM(TM) Score: [XX]/100).
              </p>
              <p className="mb-2">
                We would welcome the opportunity to discuss potential collaboration models including [JV/Alliance/Investment]. 
                Our initial assessment indicates mutual value creation potential with projected [ROI/Synergy metrics].
              </p>
              <p className="mb-2">
                Please find attached our Strategic Intelligence Brief for your review. We would be pleased to arrange 
                an introductory call at your earliest convenience.
              </p>
              <p className="mt-3">Respectfully,<br/>[Signatory]<br/>[Title]</p>
            </div>
          </div>

          {/* 12 Sample Reports Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">12 Training Reports - Full Strategic Dossiers</h3>
              <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                <strong>Note:</strong> Click any report to view full one-page document
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Each report demonstrates the system's ability to produce comprehensive strategic intelligence. 
              Reports can be generated at varying lengths - from 1-2 page executive briefs to 50+ page comprehensive dossiers 
              based on client requirements.
            </p>
            <div className="space-y-4">
              
              {/* Report 1: Australian AgriTech Ã¢â€ â€™ Vietnam */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 1 ? null : 1)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #1: Market Entry - AgriTech</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SEAM(TM): 89/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 1 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                
                {/* Collapsed Preview */}
                {expandedReport !== 1 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">GreenHarvest Technologies Pty Ltd</div>
                      <div className="text-xs text-slate-500">Australia * Private * AUD $45M Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Ho Chi Minh City, Vietnam</div>
                      <div className="text-xs text-slate-500">Joint Venture * $15M Investment</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">Market Entry + JV Formation</div>
                      <div className="text-xs text-slate-500">12-18 Month Timeline</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      Vietnam's AgriTech market ($1.8B Ã¢â€ â€™ $3.2B by 2027, CAGR 21.4%) presents compelling expansion opportunity. 
                      Recommended JV partner: Vietnam Agricultural Supply Co. (VASCO) - 12 provinces, $38M revenue, MARD relationships.
                      Monte Carlo simulation (10,000 iterations): P50 IRR 18.4%, break-even Month 28, 8% probability of loss.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">82</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">18.4%</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">76</div><div className="text-slate-400">IVAS(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">78</div><div className="text-slate-400">FRS(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> World Bank Open Data API, Vietnam General Statistics Office, MARD (Ministry of Agriculture), 
                    VCCI (Vietnam Chamber of Commerce), IMF Country Data, World Economic Forum Global Competitiveness Index
                  </div>
                </div>
                )}
                
                {/* EXPANDED FULL REPORT */}
                {expandedReport === 1 && (
                <div className="p-6 bg-white">
                  {/* Report Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                        <p className="text-slate-600">Market Entry Analysis: Vietnam AgriTech Sector</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold text-slate-900">VERDIX</div>
                        <div className="text-slate-500">Report Generated: {new Date().toLocaleDateString()}</div>
                        <div className="text-slate-500">Classification: CONFIDENTIAL</div>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">
                      GreenHarvest Technologies Pty Ltd, an Australian agricultural technology company with AUD $45M in annual revenue, 
                      seeks to establish a strategic presence in Vietnam's rapidly expanding AgriTech market through a joint venture 
                      formation with a local distribution partner.
                    </p>
                    <p className="text-sm text-slate-700 mb-3">
                      Our analysis indicates Vietnam represents a <strong>high-opportunity market</strong> with the AgriTech sector 
                      projected to grow from $1.8B (2024) to $3.2B by 2027, representing a CAGR of 21.4%. The recommended partner, 
                      Vietnam Agricultural Supply Co. (VASCO), demonstrates strong strategic alignment with a SEAM(TM) score of 89/100.
                    </p>
                    <div className="bg-slate-100 rounded-lg p-4 mt-4">
                      <div className="font-bold text-slate-900 mb-2">RECOMMENDATION: PROCEED</div>
                      <p className="text-sm text-slate-600">
                        The opportunity meets all strategic criteria with favorable risk-adjusted returns. Proceed to Phase 2: 
                        Partner Due Diligence and Term Sheet negotiation.
                      </p>
                    </div>
                  </div>

                  {/* Score Dashboard */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORE DASHBOARD</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">82</div>
                        <div className="text-xs text-slate-400">SPI(TM) Score</div>
                        <div className="text-xs text-slate-300 mt-1">Strategic Priority Index</div>
                      </div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">89</div>
                        <div className="text-xs text-slate-400">SEAM(TM) Score</div>
                        <div className="text-xs text-slate-300 mt-1">Partner Alignment</div>
                      </div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">18.4%</div>
                        <div className="text-xs text-slate-400">RROI(TM)</div>
                        <div className="text-xs text-slate-300 mt-1">Risk-Adjusted Return</div>
                      </div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">76</div>
                        <div className="text-xs text-slate-400">IVAS(TM) Score</div>
                        <div className="text-xs text-slate-300 mt-1">Implementation Viability</div>
                      </div>
                    </div>
                  </div>

                  {/* Market Analysis */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">MARKET ANALYSIS</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Market Size & Growth</h4>
                        <ul className="space-y-1 text-slate-600">
                          <li>* Current Market Size: $1.8B (2024)</li>
                          <li>* Projected Size: $3.2B (2027)</li>
                          <li>* CAGR: 21.4%</li>
                          <li>* TAM Addressable: $420M</li>
                          <li>* SAM Realistic: $85M</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Competitive Landscape</h4>
                        <ul className="space-y-1 text-slate-600">
                          <li>* Fragmented market, no dominant player</li>
                          <li>* Top 5 players hold 23% market share</li>
                          <li>* High demand for precision agriculture</li>
                          <li>* Government subsidies for AgriTech adoption</li>
                          <li>* Limited competition from Western firms</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Partner Assessment */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">PARTNER ASSESSMENT: VASCO</h3>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="font-semibold text-slate-700">Company Profile</div>
                          <div className="text-slate-600 mt-1">
                            Vietnam Agricultural Supply Co.<br/>
                            Revenue: $38M<br/>
                            Employees: 450<br/>
                            Founded: 1998
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700">Network Reach</div>
                          <div className="text-slate-600 mt-1">
                            Coverage: 12 provinces<br/>
                            Distribution Points: 340+<br/>
                            Farmer Relationships: 28,000+<br/>
                            MARD Connections: Strong
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700">Strategic Fit</div>
                          <div className="text-slate-600 mt-1">
                            SEAM(TM) Score: 89/100<br/>
                            Cultural Alignment: High<br/>
                            Technology Readiness: Moderate<br/>
                            Financial Stability: Strong
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Projections */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">FINANCIAL PROJECTIONS</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Investment Structure</h4>
                        <ul className="space-y-1 text-slate-600">
                          <li>* Total Investment: $15M</li>
                          <li>* GreenHarvest Equity: $9M (60%)</li>
                          <li>* VASCO Equity: $6M (40%)</li>
                          <li>* Working Capital Reserve: $2M</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Return Analysis</h4>
                        <ul className="space-y-1 text-slate-600">
                          <li>* P50 IRR: 18.4%</li>
                          <li>* Break-even: Month 28</li>
                          <li>* 5-Year NPV: $12.3M</li>
                          <li>* Probability of Loss: 8%</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">RISK ASSESSMENT</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                        <span className="font-semibold text-yellow-700 w-24">MEDIUM</span>
                        <span className="text-slate-600">Regulatory approval timeline uncertainty (MARD licensing 4-8 months)</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                        <span className="font-semibold text-green-700 w-24">LOW</span>
                        <span className="text-slate-600">Currency risk mitigated by USD invoicing for equipment</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                        <span className="font-semibold text-green-700 w-24">LOW</span>
                        <span className="text-slate-600">Partner financial stability verified through due diligence</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">RECOMMENDED NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300">
                      <li>1. Execute NDA with VASCO (Week 1-2)</li>
                      <li>2. Conduct on-site due diligence visit (Week 3-4)</li>
                      <li>3. Engage local legal counsel for JV structure (Week 4-6)</li>
                      <li>4. Draft Heads of Terms for board approval (Week 6-8)</li>
                      <li>5. Initiate MARD pre-licensing consultation (Week 8-10)</li>
                    </ol>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">
                    Generated by VERDIX * ABN: 55 978 113 300 * This report is confidential and intended for internal strategic planning purposes only.
                  </div>
                </div>
                )}
              </div>

              {/* Report 2: Singapore MedTech Ã¢â€ â€™ Vietnam */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 2 ? null : 2)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #2: Manufacturing Expansion - Medical Devices</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 78/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 2 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                
                {/* Collapsed Preview */}
                {expandedReport !== 2 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">MediTech Solutions Inc.</div>
                      <div className="text-xs text-slate-500">Singapore * Private * $75M Revenue * 320 Employees</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Ho Chi Minh City, Vietnam</div>
                      <div className="text-xs text-slate-500">Greenfield Manufacturing * $15M Investment</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">Cost Reduction + Market Entry</div>
                      <div className="text-xs text-slate-500">ASEAN Distribution Hub</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      Singapore manufacturing at 90% capacity; labor costs $4,500/month per technician prohibitive for scaling. 
                      Vietnam offers 40-50% cost reduction, 50,000+ engineering graduates annually, and FTA access to ASEAN.
                      Investment structure: $8M factory, $4M partner equity, $2M regulatory, $1M working capital.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">78</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">2.4x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">72</div><div className="text-slate-400">IVAS(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">85%</div><div className="text-slate-400">SCF(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> Singapore EDB Statistics, Vietnam FDI Agency, World Bank Doing Business Index, 
                    FDA ASEAN Regulatory Database, ILO Labor Cost Data, Vietnam Ministry of Labor
                  </div>
                </div>
                )}
                
                {/* EXPANDED FULL REPORT */}
                {expandedReport === 2 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                        <p className="text-slate-600">Manufacturing Expansion: Vietnam Medical Device Sector</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold text-slate-900">VERDIX</div>
                        <div className="text-slate-500">Classification: CONFIDENTIAL</div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">
                      MediTech Solutions, a Singapore-based medical device manufacturer, faces critical capacity constraints at 90% utilization 
                      with labor costs of $4,500/month per technician. Vietnam offers a strategic manufacturing base with 40-50% cost reduction, 
                      ASEAN FTA access, and a growing pool of 50,000+ engineering graduates annually.
                    </p>
                    <div className="bg-slate-100 rounded-lg p-4">
                      <div className="font-bold text-slate-900 mb-2">RECOMMENDATION: PROCEED WITH CONDITIONS</div>
                      <p className="text-sm text-slate-600">Proceed contingent on successful regulatory pathway validation with Vietnam FDA equivalent.</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">78</div><div className="text-xs">SPI(TM)</div>
                      </div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">2.4x</div><div className="text-xs">RROI(TM)</div>
                      </div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">72</div><div className="text-xs">IVAS(TM)</div>
                      </div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">85%</div><div className="text-xs">SCF(TM)</div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">INVESTMENT STRUCTURE</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div><ul className="space-y-1 text-slate-600"><li>* Factory Construction: $8M</li><li>* Partner Equity: $4M</li><li>* Regulatory Compliance: $2M</li><li>* Working Capital: $1M</li></ul></div>
                      <div><ul className="space-y-1 text-slate-600"><li>* Total Investment: $15M</li><li>* Expected ROI: 2.4x over 5 years</li><li>* Break-even: Month 32</li><li>* Annual Cost Savings: $3.2M</li></ul></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300">
                      <li>1. Engage Vietnam FDA consultant for regulatory pathway</li>
                      <li>2. Site visit to HCMC industrial zones</li>
                      <li>3. Partner identification and due diligence</li>
                    </ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">
                    Generated by VERDIX * ABN: 55 978 113 300
                  </div>
                </div>
                )}
              </div>

              {/* Report 3: US FinTech Ã¢â€ â€™ EU */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 3 ? null : 3)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #3: Regulatory Expansion - FinTech</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 71/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 3 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 3 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">PayStream Technologies</div>
                      <div className="text-xs text-slate-500">USA (Delaware) * Series C * $120M Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Dublin, Ireland Ã¢â€ â€™ EU Passporting</div>
                      <div className="text-xs text-slate-500">Regulatory License * $8M Setup</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">EU Market Access + PSD2 Compliance</div>
                      <div className="text-xs text-slate-500">27-Country Passporting</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      Ireland offers optimal EU gateway: 12.5% corporate tax, English-speaking, fintech cluster (Stripe, Fidelity HQ). 
                      Central Bank of Ireland e-money license timeline: 6-12 months. Alternative considered: Lithuania (faster, smaller talent pool).
                      Risk factors: Brexit uncertainty, GDPR compliance costs, ECB regulatory tightening cycle.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">71</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">22.1%</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">68</div><div className="text-slate-400">RNI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">82</div><div className="text-slate-400">NVI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> ECB Regulatory Database, Central Bank of Ireland, EU PSD2 Directive Documentation, 
                    OECD Tax Database, IDA Ireland Investment Data, Eurostat Labor Market Statistics
                  </div>
                </div>
                )}
                {expandedReport === 3 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">EU Market Entry: FinTech Regulatory Expansion via Ireland</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">PayStream Technologies seeks EU market access through Irish regulatory licensing. Ireland offers an optimal gateway with 12.5% corporate tax, established fintech ecosystem (Stripe, Fidelity HQ), and English-speaking workforce. E-money license timeline of 6-12 months via Central Bank of Ireland enables passporting to all 27 EU member states.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: PROCEED</div><p className="text-sm text-slate-600">Ireland represents optimal EU gateway; begin CBI pre-application engagement.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">71</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">22.1%</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">68</div><div className="text-xs">RNI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">82</div><div className="text-xs">NVI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Engage Irish regulatory counsel and CBI pre-application</li><li>2. GDPR compliance framework development</li><li>3. Dublin office setup and talent acquisition</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 4: Japanese Manufacturer Ã¢â€ â€™ Mexico */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 4 ? null : 4)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #4: Nearshoring - Automotive Components</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 84/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 4 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 4 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">Takahashi Precision Parts K.K.</div>
                      <div className="text-xs text-slate-500">Japan * Public (TSE) * JPY85B Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Monterrey, Nuevo LeA3n, Mexico</div>
                      <div className="text-xs text-slate-500">Greenfield Factory * $45M Investment</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">USMCA Access + Supply Chain Resilience</div>
                      <div className="text-xs text-slate-500">US OEM Proximity</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      Monterrey = "Mexico's Industrial Capital" - 400+ Japanese manufacturers, mature supplier ecosystem, bilingual engineering talent.
                      USMCA Rule of Origin compliance achieved with 75%+ regional content. Logistics: 24hr trucking to Texas OEM plants.
                      Risk: Peso volatility (+/-12% annual), cartel activity in transit corridors (mitigated by established security protocols).
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">84</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">2.8x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">91</div><div className="text-slate-400">ESI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">76</div><div className="text-slate-400">PRI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> USMCA Text & Annex 4-B, INEGI Mexico, JETRO (Japan External Trade), 
                    Banxico Economic Data, US CBP Trade Statistics, OICA Automotive Production Data
                  </div>
                </div>
                )}
                {expandedReport === 4 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">Nearshoring Strategy: Mexico Automotive Manufacturing</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">Takahashi Precision Parts seeks USMCA-compliant manufacturing base in Monterrey, Mexico's industrial capital with 400+ Japanese manufacturers already established. The mature supplier ecosystem, bilingual engineering talent, and 24-hour trucking access to Texas OEM plants provide compelling strategic advantages for supply chain resilience.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: STRONG PROCEED</div><p className="text-sm text-slate-600">Monterrey offers optimal nearshoring location with proven Japanese manufacturing cluster.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">84</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">2.8x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">91</div><div className="text-xs">ESI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">76</div><div className="text-xs">PRI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Industrial park site selection (FINSA/PIMSA)</li><li>2. USMCA Rule of Origin compliance mapping</li><li>3. Engage JETRO Mexico for investment support</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 5: German Renewables Ã¢â€ â€™ Saudi Arabia */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 5 ? null : 5)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #5: Government Partnership - Renewable Energy</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 76/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 5 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 5 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">SolarWind GmbH</div>
                      <div className="text-xs text-slate-500">Germany * Private (Family) * a'320M Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">NEOM / Riyadh, Saudi Arabia</div>
                      <div className="text-xs text-slate-500">PPP Contract * $200M+ Project Value</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">Vision 2030 Alignment + Tech Transfer</div>
                      <div className="text-xs text-slate-500">Hydrogen Production</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      Saudi Vision 2030 targets 50% renewable by 2030 (from 0.3% today). NEOM green hydrogen project = $5B opportunity.
                      Required: Local partner (51% Saudi ownership for PPP), technology transfer agreement, Saudization employment quotas.
                      SEAM(TM) partner match: ACWA Power (84/100 fit), Public Investment Fund subsidiaries.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">76</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">3.2x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">62</div><div className="text-slate-400">PRI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">88</div><div className="text-slate-400">VCI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> Saudi Vision 2030 Official Documents, MISA (Ministry of Investment), IRENA Renewable Capacity Statistics,
                    PIF Annual Reports, NEOM Project Announcements, IEA World Energy Outlook
                  </div>
                </div>
                )}
                {expandedReport === 5 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">Vision 2030 Partnership: Saudi Arabia Renewable Energy</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">SolarWind GmbH targets Saudi Arabia's Vision 2030 renewable energy transformation, which aims to achieve 50% renewable capacity by 2030 from a current 0.3%. The NEOM green hydrogen project represents a $5B+ opportunity. Entry requires local partnership (51% Saudi ownership for PPP), technology transfer agreements, and compliance with Saudization employment quotas.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: PROCEED WITH CONDITIONS</div><p className="text-sm text-slate-600">High opportunity but complex entry requirements; engage ACWA Power (SEAM(TM) 84/100) for partnership.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">76</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">3.2x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">62</div><div className="text-xs">PRI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">88</div><div className="text-xs">VCI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Initiate ACWA Power partnership discussions</li><li>2. Develop technology transfer framework</li><li>3. Engage MISA for investment licensing</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 6: UK EdTech Ã¢â€ â€™ India */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 6 ? null : 6)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #6: Market Expansion - EdTech</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 81/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 6 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 6 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">LearnPath Digital Ltd</div>
                      <div className="text-xs text-slate-500">UK * Series B * GBP28M Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Bangalore / Mumbai, India</div>
                      <div className="text-xs text-slate-500">Acquisition + Organic * $12M Budget</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">User Base Acquisition + Content Localization</div>
                      <div className="text-xs text-slate-500">K-12 + Test Prep Segments</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      India EdTech: $6.3B market, 32% CAGR, 300M students. Post-COVID digital adoption sustained at 78%.
                      Acquisition targets evaluated: TestBook (test prep, 15M users), Vedantu (live tutoring), Unacademy (exam prep).
                      Recommended approach: Acquire regional player + build vernacular content team (Hindi, Tamil, Telugu priority).
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">81</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">4.1x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">94</div><div className="text-slate-400">FRS(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">79</div><div className="text-slate-400">NVI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> IBEF India Education Sector Reports, RedSeer Consulting EdTech Analysis, 
                    NASSCOM Digital Education Study, Ministry of Education AISHE Data, Tracxn Funding Database
                  </div>
                </div>
                )}
                {expandedReport === 6 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">India EdTech Market Entry: Acquisition Strategy</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">India's EdTech market ($6.3B, 32% CAGR) serves 300M students with sustained 78% digital adoption post-COVID. LearnPath Digital should pursue regional acquisition combined with vernacular content development. Priority targets include TestBook (15M users, test prep), with vernacular localization in Hindi, Tamil, and Telugu as key differentiator.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: STRONG PROCEED</div><p className="text-sm text-slate-600">High-growth market with clear acquisition targets; execute vernacular content strategy.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">81</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">4.1x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">94</div><div className="text-xs">FRS(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">79</div><div className="text-xs">NVI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Engage M&A advisors for target outreach</li><li>2. Conduct commercial due diligence on TestBook</li><li>3. Build vernacular content team in Bangalore</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 7: Canadian Mining Ã¢â€ â€™ Chile */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 7 ? null : 7)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #7: Resource Investment - Lithium Mining</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 69/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 7 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 7 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">Northern Minerals Corp</div>
                      <div className="text-xs text-slate-500">Canada (TSX) * Public * CAD $890M Market Cap</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Atacama Region, Chile</div>
                      <div className="text-xs text-slate-500">Concession Acquisition * $65M Investment</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">Battery Supply Chain Integration</div>
                      <div className="text-xs text-slate-500">EV Manufacturer Offtake Agreements</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      Chile holds 52% of global lithium reserves. New royalty framework (2023) increases state take to 40% above $10K/ton.
                      Community relations critical: AtacameA+/-o indigenous consultation required per ILO 169. Water usage under SEIA scrutiny.
                      Comparable: SQM-Albemarle model = government partnership with private operation. Timeline: 3-5 years to production.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">69</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">2.1x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">58</div><div className="text-slate-400">PRI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">72</div><div className="text-slate-400">CRI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> USGS Mineral Commodity Summaries, Chile Mining Ministry, COCHILCO Statistics, 
                    ILO Convention 169 Guidelines, S&P Global Market Intelligence, Benchmark Mineral Intelligence
                  </div>
                </div>
                )}
                {expandedReport === 7 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">Lithium Concession: Chile Atacama Region Investment</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">Chile holds 52% of global lithium reserves, critical for EV battery supply chains. The 2023 royalty framework increases government take to 40% above $10K/ton, requiring careful financial modeling. Indigenous consultation (AtacameA+/-o communities per ILO 169) and water usage (SEIA environmental review) are critical path items. Timeline to production: 3-5 years.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: PROCEED WITH CAUTION</div><p className="text-sm text-slate-600">High strategic value but complex regulatory and community engagement requirements.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">69</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">2.1x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">58</div><div className="text-xs">PRI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">72</div><div className="text-xs">CRI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Engage indigenous community liaison specialists</li><li>2. Commission SEIA environmental pre-assessment</li><li>3. Model 40% royalty impact on project economics</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 8: Swiss Pharma Ã¢â€ â€™ Singapore */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 8 ? null : 8)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #8: R&D Hub Establishment - Pharmaceuticals</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 88/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 8 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 8 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">Helvetica BioSciences AG</div>
                      <div className="text-xs text-slate-500">Switzerland * Public (SIX) * CHF 4.2B Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Biopolis, Singapore</div>
                      <div className="text-xs text-slate-500">R&D Center * $85M over 5 Years</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">APAC Clinical Trials + Talent Access</div>
                      <div className="text-xs text-slate-500">Cell & Gene Therapy Focus</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      Singapore Biopolis = purpose-built biomedical hub, A*STAR collaboration opportunities, HSA regulatory fast-track.
                      Tax incentives: Pioneer Certificate (5% tax for 15 years), R&D tax deduction (250%), IP development incentive.
                      Talent pool: NUS, Duke-NUS, Nanyang - 2,000+ PhD graduates annually in life sciences.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">88</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">1.9x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">96</div><div className="text-slate-400">ESI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">94</div><div className="text-slate-400">RNI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> EDB Singapore Investment Reports, A*STAR Annual Reports, HSA Regulatory Guidelines, 
                    OECD R&D Tax Incentives Database, QS World University Rankings Life Sciences, Nature Index
                  </div>
                </div>
                )}
                {expandedReport === 8 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">Biopolis R&D Hub: Singapore Life Sciences Investment</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">Singapore's Biopolis offers a purpose-built biomedical research hub with A*STAR collaboration opportunities and HSA regulatory fast-track. Tax incentives include Pioneer Certificate (5% tax for 15 years), 250% R&D tax deduction, and IP development incentive. The talent ecosystem delivers 2,000+ PhD graduates annually from NUS, Duke-NUS, and Nanyang in life sciences.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: STRONG PROCEED</div><p className="text-sm text-slate-600">Premier APAC R&D location with exceptional incentives and talent access.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">88</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">1.9x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">96</div><div className="text-xs">ESI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">94</div><div className="text-xs">RNI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. EDB Singapore investment negotiation</li><li>2. A*STAR collaboration framework</li><li>3. Pioneer Certificate application</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 9: UAE Logistics Ã¢â€ â€™ East Africa */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 9 ? null : 9)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #9: Infrastructure Investment - Logistics</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 72/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 9 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 9 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">Emirates Global Logistics</div>
                      <div className="text-xs text-slate-500">UAE * Sovereign-Linked * $2.8B Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Mombasa, Kenya + Dar es Salaam, Tanzania</div>
                      <div className="text-xs text-slate-500">Port & Warehouse Concession * $180M</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">Belt & Road Alternative + Africa Gateway</div>
                      <div className="text-xs text-slate-500">Corridor Development</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      East Africa trade volume +8.2% CAGR. Mombasa Port handles 1.4M TEUs, feeds Uganda/Rwanda/South Sudan corridor.
                      Competition: DP World (Berbera), China Merchants (Djibouti). AfCFTA implementation = rising intra-Africa trade.
                      Kenya political risk moderate (2027 election cycle), Tanzania more stable under Samia government.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">72</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">2.6x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">64</div><div className="text-slate-400">PRI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">81</div><div className="text-slate-400">AGI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> UNCTAD Review of Maritime Transport, Kenya Ports Authority, AfDB Infrastructure Index, 
                    World Bank Logistics Performance Index, AfCFTA Secretariat Trade Statistics, BMI Fitch Solutions Country Risk
                  </div>
                </div>
                )}
                {expandedReport === 9 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">East Africa Logistics: Port Infrastructure Investment</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">East Africa trade volume is growing at 8.2% CAGR with Mombasa Port handling 1.4M TEUs annually, serving the Uganda/Rwanda/South Sudan corridor. AfCFTA implementation will drive rising intra-Africa trade. Competition from DP World (Berbera) and China Merchants (Djibouti) requires differentiated service offering. Kenya political risk is moderate (2027 election cycle), while Tanzania offers more stability.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: PROCEED</div><p className="text-sm text-slate-600">Strategic Africa gateway position; prioritize Tanzania for political stability.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">72</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">2.6x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">64</div><div className="text-xs">PRI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">81</div><div className="text-xs">AGI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Kenya Ports Authority concession negotiations</li><li>2. TPA Tanzania partnership framework</li><li>3. Corridor feasibility study commissioning</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 10: Korean Gaming Ã¢â€ â€™ Southeast Asia */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 10 ? null : 10)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #10: Market Expansion - Gaming & Entertainment</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 85/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 10 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 10 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">StarPlay Entertainment Co., Ltd</div>
                      <div className="text-xs text-slate-500">South Korea (KOSDAQ) * Public * a'(c)420B Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Indonesia, Thailand, Philippines</div>
                      <div className="text-xs text-slate-500">Publishing Partnerships * $25M Budget</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">User Acquisition + Localization</div>
                      <div className="text-xs text-slate-500">Mobile-First Strategy</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      SEA gaming market: $8.4B, 270M gamers, mobile 78% of revenue. Indonesia = largest (106M gamers, $2.1B).
                      Localization critical: Bahasa Indonesia, Thai, Tagalog. Payment integration: GoPay, OVO, GCash required.
                      Regulatory: Indonesia content restrictions (religious/cultural), Philippines PAGCOR licensing for real-money elements.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">85</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">3.8x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">92</div><div className="text-slate-400">FRS(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">78</div><div className="text-slate-400">NVI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> Newzoo Global Games Market Report, App Annie Mobile Gaming Data, 
                    Sensor Tower Revenue Estimates, KOMINFO Indonesia Regulations, PAGCOR Licensing Guidelines, Google Temasek SEA Economy Report
                  </div>
                </div>
                )}
                {expandedReport === 10 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">Southeast Asia Gaming: Mobile Market Expansion</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">The Southeast Asian gaming market ($8.4B, 270M gamers) is mobile-dominant at 78% of revenue. Indonesia represents the largest opportunity with 106M gamers and $2.1B market size. Critical success factors include localization (Bahasa Indonesia, Thai, Tagalog), payment integration (GoPay, OVO, GCash), and regulatory compliance with Indonesia content restrictions and Philippines PAGCOR licensing.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: STRONG PROCEED</div><p className="text-sm text-slate-600">High-growth mobile gaming market; prioritize Indonesia for scale, Thailand for ARPU.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">85</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">3.8x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">92</div><div className="text-xs">FRS(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">78</div><div className="text-xs">NVI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Local publisher partnership (Garena, VNG consideration)</li><li>2. Localization team setup in Jakarta</li><li>3. Payment gateway integration roadmap</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 11: Brazilian Agribusiness Ã¢â€ â€™ Africa */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 11 ? null : 11)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #11: Technology Transfer - Agribusiness</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 74/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 11 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 11 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">AgroBrasil Tecnologia S.A.</div>
                      <div className="text-xs text-slate-500">Brazil (B3) * Public * BRL 2.1B Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Mozambique, Angola, Nigeria</div>
                      <div className="text-xs text-slate-500">Tech Transfer + Land Lease * $40M Phase 1</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">Tropical Agriculture Export + Food Security</div>
                      <div className="text-xs text-slate-500">Soy, Corn, Cotton Systems</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      Brazil's Cerrado transformation model applicable to African savannas. Mozambique's Nacala Corridor priority area.
                      ProSAVANA framework (Japan-Brazil-Mozambique) provides precedent. Land tenure complexity requires government MOU.
                      Portuguese-speaking markets (Mozambique, Angola) reduce cultural friction. Nigeria = largest market but higher risk.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">74</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">2.3x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">61</div><div className="text-slate-400">PRI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">86</div><div className="text-slate-400">ATI(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> EMBRAPA Technical Papers, FAO Africa Agriculture Statistics, 
                    Mozambique Ministry of Agriculture, JICA ProSAVANA Reports, World Bank Africa Land Governance, IFPRI Food Security Index
                  </div>
                </div>
                )}
                {expandedReport === 11 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">Africa Agribusiness: Brazil Tropical Agriculture Transfer</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">Brazil's Cerrado transformation model is highly applicable to African savannas. Mozambique's Nacala Corridor is the priority area with established ProSAVANA framework (Japan-Brazil-Mozambique) providing precedent. Land tenure complexity requires government-level MOUs. Portuguese-speaking markets (Mozambique, Angola) offer reduced cultural friction, while Nigeria represents largest market with higher risk profile.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: PROCEED WITH CONDITIONS</div><p className="text-sm text-slate-600">Begin with Mozambique Nacala Corridor; leverage ProSAVANA framework.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">74</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">2.3x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">61</div><div className="text-xs">PRI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">86</div><div className="text-xs">ATI(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Mozambique Ministry of Agriculture engagement</li><li>2. ProSAVANA framework alignment review</li><li>3. Pilot project in Nacala Corridor design</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

              {/* Report 12: Indian IT Services Ã¢â€ â€™ Middle East */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all">
                <div 
                  className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedReport(expandedReport === 12 ? null : 12)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Report #12: Government Digital Transformation - IT Services</span>
                    <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">SPI(TM): 79/100</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-700 transition-all">
                    {expandedReport === 12 ? '<- Close Report' : 'View Full Report ->'}
                  </button>
                </div>
                {expandedReport !== 12 && (
                <div className="p-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Organization</span>
                      <div className="font-medium">Nexus Digital Solutions Ltd</div>
                      <div className="text-xs text-slate-500">India (NSE) * Public * INR 8,500Cr Revenue</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Target Region</span>
                      <div className="font-medium">Saudi Arabia, UAE, Qatar</div>
                      <div className="text-xs text-slate-500">Government Contracts * $120M Pipeline</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs uppercase tracking-wide">Strategic Intent</span>
                      <div className="font-medium">Smart City + E-Government Projects</div>
                      <div className="text-xs text-slate-500">Vision 2030 / Qatar 2030 Alignment</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-xs">
                    <div className="font-semibold text-slate-700 mb-2">AI Analysis Summary:</div>
                    <p className="text-slate-600 mb-2">
                      GCC government IT spending: $12B annually, +15% CAGR. Nationalization requirements (Saudization, Emiratization) mandate local partnerships.
                      Established players: Wipro, Infosys, TCS have footholds. Differentiation via AI/ML capabilities and sector specialization.
                      Required: Saudi CITC certification, UAE TDRA approvals, security clearances for government projects.
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-white rounded p-2"><div className="font-bold">79</div><div className="text-slate-400">SPI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">2.7x</div><div className="text-slate-400">RROI(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">71</div><div className="text-slate-400">BARNA(TM)</div></div>
                      <div className="bg-white rounded p-2"><div className="font-bold">84</div><div className="text-slate-400">CAP(TM)</div></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Data Sources:</strong> IDC Middle East IT Spending Report, Saudi CITC Digital Government Framework, 
                    UAE Smart Government Initiative, Qatar Ministry of Transport & Communications, Gartner GCC Technology Outlook, NASSCOM Industry Reports
                  </div>
                </div>
                )}
                {expandedReport === 12 && (
                <div className="p-6 bg-white">
                  <div className="border-b-2 border-slate-900 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">STRATEGIC INTELLIGENCE REPORT</h2>
                    <p className="text-slate-600">GCC Government IT: Digital Transformation Partnership</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">EXECUTIVE SUMMARY</h3>
                    <p className="text-sm text-slate-700 mb-3">GCC government IT spending is $12B annually with 15% CAGR growth. Nationalization requirements (Saudization, Emiratization) mandate local partnerships for market access. Competition from Wipro, Infosys, and TCS requires differentiation via AI/ML capabilities and sector specialization. Regulatory requirements include Saudi CITC certification, UAE TDRA approvals, and security clearances for government projects.</p>
                    <div className="bg-slate-100 rounded-lg p-4"><div className="font-bold text-slate-900 mb-2">RECOMMENDATION: PROCEED</div><p className="text-sm text-slate-600">Strong growth market; prioritize local partnership for compliance and access.</p></div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-300 pb-2 mb-3">ALGORITHM SCORES</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">79</div><div className="text-xs">SPI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">2.7x</div><div className="text-xs">RROI(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">71</div><div className="text-xs">BARNA(TM)</div></div>
                      <div className="bg-slate-900 text-white rounded-lg p-4 text-center"><div className="text-3xl font-bold">84</div><div className="text-xs">CAP(TM)</div></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <h3 className="font-bold mb-2">NEXT STEPS</h3>
                    <ol className="text-sm space-y-1 text-slate-300"><li>1. Saudi CITC certification application</li><li>2. Local partner identification (51% ownership structure)</li><li>3. AI/ML center of excellence establishment</li></ol>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">Generated by VERDIX * ABN: 55 978 113 300</div>
                </div>
                )}
              </div>

            </div>
          </div>

          {/* System Capabilities Demonstrated */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-5">
            <h4 className="font-bold text-slate-900 mb-3">Capabilities Demonstrated Across 12 Reports</h4>
            <div className="grid md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Industries Covered</div>
                <p className="text-slate-600">AgriTech, MedTech, FinTech, Automotive, Renewables, EdTech, Mining, Pharma, Logistics, Gaming, IT Services</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Strategic Intents</div>
                <p className="text-slate-600">Market Entry, JV Formation, M&A, Greenfield, PPP, Technology Transfer, Government Partnership, R&D Establishment</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Regions Analyzed</div>
                <p className="text-slate-600">Asia-Pacific, Europe, Middle East, Africa, Latin America, North America - 20+ countries total</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Data Sources Used</div>
                <p className="text-slate-600">World Bank, IMF, OECD, UNCTAD, ILO, government ministries, industry bodies, academic research, regulatory databases</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* GLOBAL COVERAGE MODAL */}
      <Modal isOpen={activeModal === 'coverage'} onClose={() => setActiveModal(null)} title="Global Coverage & Industry Expertise">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Worldwide Intelligence Capability</h3>
            <p className="text-slate-300 mb-6">
              VERDIX processes strategic scenarios across every continent, leveraging real-time data feeds 
              from international organizations, government databases, and proprietary research networks. The system can 
              generate one-page executive briefs for rapid assessment, or comprehensive 50+ page strategic dossiers 
              with full due diligence documentation.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="text-4xl font-bold mb-2">195</div>
                <div className="text-slate-400">Countries Supported</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="text-4xl font-bold mb-2">40+</div>
                <div className="text-slate-400">Industries Analyzed</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="text-4xl font-bold mb-2">35+</div>
                <div className="text-slate-400">Entity Types</div>
              </div>
            </div>
          </div>

          {/* Regional Coverage */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-600" />
              Regional Coverage
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Asia Pacific */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h4 className="font-bold text-white mb-2">Asia-Pacific</h4>
                <p className="text-xs text-slate-300">Vietnam, Singapore, Japan, Australia, China, Indonesia, Thailand, Philippines, Korea, Malaysia, India</p>
              </div>

              {/* Middle East */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h4 className="font-bold text-white mb-2">Middle East & GCC</h4>
                <p className="text-xs text-slate-300">UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, Oman, Jordan, Egypt, Israel, Turkey</p>
              </div>

              {/* Europe */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h4 className="font-bold text-white mb-2">Europe & UK</h4>
                <p className="text-xs text-slate-300">Ireland, Germany, UK, France, Netherlands, Switzerland, Poland, Spain, Italy, Nordics</p>
              </div>

              {/* Africa */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h4 className="font-bold text-white mb-2">Africa</h4>
                <p className="text-xs text-slate-300">Kenya, Tanzania, Nigeria, South Africa, Mozambique, Angola, Ghana, Rwanda, Ethiopia, Egypt</p>
              </div>

              {/* Americas */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h4 className="font-bold text-white mb-2">Americas</h4>
                <p className="text-xs text-slate-300">USA, Canada, Mexico, Brazil, Chile, Colombia, Argentina, Peru, Panama</p>
              </div>

              {/* Regional Farm/Agriculture Focus */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h4 className="font-bold text-white mb-2">Agricultural Regions</h4>
                <p className="text-xs text-slate-300">Specialized in regional agribusiness corridors, farmland investment, and agricultural technology transfer</p>
              </div>
            </div>
          </div>

          {/* Industry Coverage */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-600" />
              Industry Expertise
            </h3>
            <div className="grid md:grid-cols-4 gap-3">
              {[
                { name: "Agriculture & AgriTech", icon: "\uD83C\uDF3E", count: "12 sub-sectors" },
                { name: "Healthcare & MedTech", icon: "\uD83C\uDFE5", count: "15 sub-sectors" },
                { name: "Financial Services", icon: "\uD83D\uDCB3", count: "18 sub-sectors" },
                { name: "Manufacturing", icon: "\uD83C\uDFED", count: "22 sub-sectors" },
                { name: "Energy & Renewables", icon: "\u26A1", count: "10 sub-sectors" },
                { name: "Education & EdTech", icon: "\uD83C\uDF93", count: "8 sub-sectors" },
                { name: "Mining & Resources", icon: "\u26CF", count: "14 sub-sectors" },
                { name: "Pharmaceuticals", icon: "\uD83D\uDC8A", count: "12 sub-sectors" },
                { name: "Logistics & Transport", icon: "\uD83D\uDE9A", count: "11 sub-sectors" },
                { name: "Gaming & Entertainment", icon: "\uD83C\uDFAE", count: "9 sub-sectors" },
                { name: "IT Services & Software", icon: "\uD83D\uDCBB", count: "16 sub-sectors" },
                { name: "Real Estate & Construction", icon: "\uD83C\uDFD7", count: "13 sub-sectors" },
              ].map((industry, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-400 transition-all cursor-pointer">
                  <div className="text-2xl mb-2">{industry.icon}</div>
                  <div className="font-semibold text-slate-900 text-sm">{industry.name}</div>
                  <div className="text-xs text-slate-500">{industry.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Workers and Team Section */}
          <div className="bg-slate-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">On-the-Ground Intelligence</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h4 className="font-bold text-white mb-2">Agricultural Operations</h4>
                <p className="text-sm text-slate-300">From smallholder cooperatives to industrial agribusiness, our intelligence covers the full spectrum of agricultural investment scenarios.</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                <h4 className="font-bold text-white mb-2">Manufacturing & Industrial</h4>
                <p className="text-sm text-slate-300">Labor cost analysis, skill availability, infrastructure quality, and supply chain integration for manufacturing investments.</p>
              </div>
            </div>
          </div>

          {/* Report Length Options */}
          <div className="border-2 border-slate-300 rounded-xl p-6 bg-white">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Flexible Report Formats
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-slate-900 mb-2">1-2</div>
                <div className="text-sm font-medium text-slate-700">Page Executive Brief</div>
                <p className="text-xs text-slate-500 mt-2">Quick assessment for initial screening. Key scores, go/no-go recommendation.</p>
              </div>
              <div className="text-center p-4 bg-slate-100 rounded-lg border-2 border-slate-400">
                <div className="text-3xl font-bold text-slate-900 mb-2">10-20</div>
                <div className="text-sm font-medium text-slate-700">Page Strategic Report</div>
                <p className="text-xs text-slate-500 mt-2">Standard deliverable. Full scoring, analysis, recommendations, and action plan.</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-3xl font-bold text-slate-900 mb-2">50+</div>
                <div className="text-sm font-medium text-slate-700">Page Strategic Dossier</div>
                <p className="text-xs text-slate-500 mt-2">Comprehensive due diligence. Appendices, data tables, risk matrices, implementation roadmaps.</p>
              </div>
            </div>
          </div>

          {/* CTA to Sample Reports */}
          <div className="text-center">
            <button 
              onClick={() => setActiveModal('testing')} 
              className="px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all inline-flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              View 12 Sample Reports
            </button>
          </div>
        </div>
      </Modal>

      {/* Protocol Detail Modal */}
      {protocolDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={() => setProtocolDetail(null)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg font-bold">{protocolDetail.num}</span>
                <h2 className="text-xl font-bold text-slate-900">{protocolDetail.title}</h2>
              </div>
              <button onClick={() => setProtocolDetail(null)} className="text-slate-500 hover:text-slate-900 transition-colors p-2 hover:bg-slate-200 rounded-lg">
                <X size={24} />
              </button>
            </header>
            <main className="p-6 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {protocolDetail.details.map((section, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h5 className="font-semibold text-slate-900 text-sm mb-3 uppercase tracking-wide">{section.subtitle}</h5>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-slate-400 mt-1">*</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </main>
            <footer className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <p className="text-xs text-slate-500">Step {protocolDetail.num} of 10 in the Comprehensive Intake Framework</p>
              <button onClick={() => setProtocolDetail(null)} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all">
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold">VERDIX</span>
                  <p className="text-xs text-slate-400">Strategic Partnership Intelligence</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                VERDIX Intelligence is an Australian strategic intelligence firm developing sovereign-grade 
                AI systems for cross-border investment and regional economic development.
              </p>
            </div>
            
            {/* R&D Status */}
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Development Status</h4>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">CURRENT PHASE</p>
                <p className="text-sm text-white font-medium mb-3">Research & Development</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  VERDIX is currently in active R&D phase, operating under Brayden Walls as a registered 
                  Australian sole trader. The platform is being developed for future commercial deployment 
                  to government and enterprise clients.
                </p>
              </div>
            </div>
            
            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Legal & Governance</h4>
              <div className="space-y-2">
                <button onClick={() => setActiveModal('terms')} className="block text-sm text-slate-400 hover:text-white transition-colors">
                  Terms & Conditions
                </button>
                <button onClick={() => setActiveModal('privacy')} className="block text-sm text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </button>
                <button onClick={() => setActiveModal('ethics')} className="block text-sm text-slate-400 hover:text-white transition-colors">
                  Ethical AI Framework
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-slate-400">
                  A(c) 2026 VERDIX Intelligence. All rights reserved. | brayden@bwglobaladvis.info | +63 960 835 4283
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Trading as Sole Trader (R&D Phase) | ABN 55 978 113 300 | Melbourne, Australia
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Nexus Intelligence OS v6.0</span>
                <span>*</span>
                <span>NSIL Engine v3.2</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      <Modal isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)} title="Terms & Conditions">
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-6">Effective May 2025 | Last Updated January 2026</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Authorized Use & Access</h3>
              <p className="text-slate-600 text-sm">This system is strictly for authorized strategic analysis. Access rights and data depth are calibrated to the user's declared Skill Level. All inputs are processed via secure enterprise gateways. Unlawful data injection is prohibited.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">2. Decision Support & Authority</h3>
              <p className="text-slate-600 text-sm">VERDIX Intelligence provides insights for informational purposes only. All Nexus OS outputs are probabilistic and advisory in nature. Strategic decisions remain the sole responsibility of the user. No output should be regarded as deterministic, final, or binding.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">3. Data Privacy & Sovereignty</h3>
              <p className="text-slate-600 text-sm">We adhere to GDPR and Australian Privacy Act requirements. Custom operational data and strategic intents are isolated. No user-specific data is used to train public foundation models.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">4. Financial & Operational Models</h3>
              <p className="text-slate-600 text-sm">SCF (Strategic Cash Flow) and IVAS (Investment Viability Assessment) models are simulations based on provided inputs and historical benchmarks. They do not constitute financial advice.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">5. Intellectual Property</h3>
              <p className="text-slate-600 text-sm">All algorithms, formulas, scoring methodologies, and system architecture are the exclusive intellectual property of VERDIX Intelligence. The 27-formula suite, NSIL architecture, and multi-persona reasoning system are proprietary innovations developed during R&D.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Privacy Modal */}
      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Privacy Policy">
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-6">VERDIX Intelligence Privacy Policy</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Collection</h3>
              <p className="text-slate-600 text-sm">We collect only data necessary to fulfill legitimate analytical purposes. This includes organizational information, strategic parameters, and market context provided by users during platform interaction.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Usage</h3>
              <p className="text-slate-600 text-sm">User data is processed exclusively for generating strategic intelligence outputs. Personal information is not sold or shared for commercial exploitation. All analysis is performed in isolated environments.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Security</h3>
              <p className="text-slate-600 text-sm">All data is stored securely using enterprise-grade encryption. We implement strict access controls and regular security audits to protect user information.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Regulatory Compliance</h3>
              <p className="text-slate-600 text-sm">VERDIX operates in alignment with GDPR and Australian Privacy Act requirements. Users have the right to request access to, correction of, or deletion of their personal data.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Ethics Modal */}
      <Modal isOpen={activeModal === 'ethics'} onClose={() => setActiveModal(null)} title="Ethical AI Framework">
        <div className="prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-6">Governance Doctrine | Version 1.0</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Statement of Commitment</h3>
              <p className="text-slate-600 text-sm">VERDIX Intelligence is founded upon the principle that artificial intelligence must be developed and deployed with the highest degree of ethical responsibility. We acknowledge that the power of advanced computational systems carries a corresponding obligation to ensure technology is never used in a manner that compromises human rights, privacy, or social stability.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Human Authority</h3>
              <p className="text-slate-600 text-sm">VERDIX affirms without qualification that artificial intelligence shall never replace human authority. All outputs produced by the Nexus engine are advisory in nature and exist solely to assist decision-makers. The human user always remains in control.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Transparency & Explainability</h3>
              <p className="text-slate-600 text-sm">Every score, recommendation, and insight is accompanied by its provenance: the specific data points, logical rules, and persona arguments that led to that conclusion. Users can audit the system's reasoning from start to finish.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Adversarial Validation</h3>
              <p className="text-slate-600 text-sm">The platform's adversarial-by-design architecture ensures that strategies are stress-tested and challenged before deployment. The Skeptic persona and Counterfactual Lab actively try to break plans to expose fragile assumptions.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* TERMS OF ENGAGEMENT MODAL */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Terms of Engagement - VERDIX">
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">Important Legal Notice</h4>
                <p className="text-amber-700 text-sm mt-1">
                  Please read these terms carefully. By accessing the VERDIX OS, you agree to be bound by these terms and conditions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {termsOfEngagement.map((term, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 text-sm mb-2">{term.title}</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{term.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="terms-acceptance"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
              />
              <label htmlFor="terms-acceptance" className="text-sm text-slate-700 leading-relaxed">
                I have read, understood, and agree to the Terms of Engagement for the VERDIX OS. I acknowledge that this is a decision support platform and all outputs are advisory in nature.
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowTermsModal(false);
                  setTermsAccepted(false);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (termsAccepted) {
                    setShowTermsModal(false);
                    setTermsAccepted(false);
                    onLaunchOS?.();
                  }
                }}
                disabled={!termsAccepted}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
              >
                <Blocks className="w-4 h-4" />
                Accept & Launch OS
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManual;

