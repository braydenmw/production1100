import React from 'react';
import { Shield, Brain, Calculator, FileText, CheckCircle, ArrowRight, Users, Globe, Lock } from 'lucide-react';

const AttractWorkspace = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Hero Section */}
      <header className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            The VERDIX Difference
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto">
            From "Search" to "Strategic Reasoning"
          </p>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Most tools help you find documents. Some help you write them. VERDIX is different because it helps you reason about them. We built a system that behaves like a senior investment committee member - not a passive search engine.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all border border-slate-700">
              View Demo
            </button>
          </div>
        </div>
      </header>

      {/* Core Value Props */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Adversarial by Design</h3>
            <p className="text-slate-600 leading-relaxed">
              We trained the system to disagree with you. While other tools try to be helpful, ours subjects every claim to adversarial review - mimicking the scrutiny of a credit committee. It finds the holes in your logic before the bank does.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Removing the "Complexity Tax"</h3>
            <p className="text-slate-600 leading-relaxed">
              Regional deals fail because they are hard to understand - crossing languages, legal systems, and local regulations. Our system absorbs this complexity cost, synthesizing cross-domain factors into a single, verified investment thesis.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Actionable Documentation</h3>
            <p className="text-slate-600 leading-relaxed">
              VERDIX is designed to help you generate the kinds of structured documents - memos, risk registers, compliance matrices - that support real-world decision making and capital allocation.
            </p>
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm mt-12 max-w-4xl mx-auto">
          * The information and outputs provided by VERDIX are for general guidance only and do not constitute formal financial, legal, or investment advice. Users should seek professional advice for specific decisions.
        </p>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How VERDIX Works</h2>
            <p className="text-xl text-slate-600">Intelligence That Bridges Local Opportunity to Global Capital</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">The Attract Workspace: Your Live Intelligence Partner</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                At the heart of VERDIX is Attract - a reactive workspace that works alongside you like a seasoned investment advisor. Unlike static forms or one-way submissions, Attract operates as an active collaborator.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-blue-600">1</div>
                  <div>
                    <h4 className="font-bold mb-1">Describe Your Opportunity</h4>
                    <p className="text-slate-600 text-sm">Start anywhere. Type a project description, paste a business plan excerpt, or just note key details. No special formatting required.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-blue-600">2</div>
                  <div>
                    <h4 className="font-bold mb-1">Real-Time Intelligence Activation</h4>
                    <p className="text-slate-600 text-sm">As you input, Attract researches regulatory frameworks, validates claims, and surfaces critical questions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-blue-600">3</div>
                  <div>
                    <h4 className="font-bold mb-1">Live Document Preview</h4>
                    <p className="text-slate-600 text-sm">Watch your inputs transform into professional documents right before your eyes. The A4 preview updates instantly.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-xl text-white shadow-xl">
              <div className="border-b border-slate-700 pb-4 mb-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">System Status</div>
                <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  NSIL Intelligence Layer Active
                </div>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="text-slate-400">{'>'} Analyzing input...</div>
                <div className="text-blue-300">Detected: Manufacturing Opportunity (Vietnam)</div>
                <div className="text-slate-400">{'>'} Running adversarial check...</div>
                <div className="text-yellow-300">Flag: Regulatory framework change in 2024 for foreign ownership.</div>
                <div className="text-slate-400">{'>'} Calculating scores...</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <div className="text-xs text-slate-500">SPI Score</div>
                    <div className="text-xl font-bold text-white">78/100</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <div className="text-xs text-slate-500">Risk Profile</div>
                    <div className="text-xl font-bold text-yellow-400">Moderate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Layers */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Technology Behind Attract</h2>
            <p className="text-xl text-slate-400">A Complete Intelligence Architecture</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="text-blue-400 font-bold text-lg mb-2">01</div>
              <h3 className="text-xl font-bold mb-3">NSIL - Nexus Strategic Intelligence Layer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The governance and orchestration framework that ensures every output is evidence-based, auditable, and honest about its limitations. NSIL controls how AI capabilities are deployed.
              </p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="text-blue-400 font-bold text-lg mb-2">02</div>
              <h3 className="text-xl font-bold mb-3">Five-Persona Agentic Framework</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A multi-perspective reasoning engine where five specialized AI personas (Skeptic, Advocate, Regulator, Accountant, Operator) debate every opportunity in parallel.
              </p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="text-blue-400 font-bold text-lg mb-2">03</div>
              <h3 className="text-xl font-bold mb-3">27 Proprietary Scoring Formulas</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Mathematical engines that quantify partnership viability, regional ROI, social alignment, execution risk, and more. Calculated outputs with confidence intervals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring Formulas Detail */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <h2 className="text-3xl font-bold mb-6">Twenty-Seven Scoring Formulas</h2>
              <p className="text-slate-600 mb-6">
                5 Core Engines + 22 Derivative Indices. Automatically Engaged.
              </p>
              <p className="text-slate-600 text-sm mb-6">
                Every opportunity is automatically scored across twenty-seven proprietary formulas. You do not select which formulas apply - the system determines relevance based on your input.
              </p>
              <button className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
                View Complete Formulas Catalog <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="font-bold text-blue-800 mb-1">SPI(TM)</div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Strategic Partnership Index</div>
                <p className="text-sm text-slate-600">Quantifies counterparty reliability, alignment, and partnership viability.</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="font-bold text-blue-800 mb-1">RROI(TM)</div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Regional Return on Investment</div>
                <p className="text-sm text-slate-600">Adjusts expected yields for location-specific risk premiums and market access.</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="font-bold text-blue-800 mb-1">SEAM(TM)</div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Socio-Economic Alignment</div>
                <p className="text-sm text-slate-600">Measures community benefit, sustainability, and social license to operate.</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="font-bold text-blue-800 mb-1">IVAS(TM)</div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Investment Viability Assessment</div>
                <p className="text-sm text-slate-600">Calculates capital deployment feasibility and execution probability.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Clamping */}
      <section className="py-16 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-6">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">Evidence Clamping Protocol</span>
          </div>
          <h3 className="text-2xl font-bold mb-4">Honest Intelligence</h3>
          <p className="text-slate-600 leading-relaxed">
            When evidence quality is insufficient, formulas produce low scores with wide confidence bands. The system does not compensate with optimistic language. It flags the data gap and blocks document export until the gap is addressed. This is how institutional-grade intelligence maintains integrity.
          </p>
        </div>
      </section>

      {/* Validation Stats */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Rigorous System Validation</h2>
              <p className="text-slate-400 mb-6">
                The problem with AI for high-stakes decisions: Most systems work in demos but fail under production conditions.
              </p>
              <p className="text-slate-400 mb-8">
                Our solution: We subjected every scoring formula, every persona's reasoning chain, and every output template to adversarial stress testing - real historical scenarios where we knew the outcomes.
              </p>
              <button className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                Explore Test Results
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">100+</div>
                <div className="text-sm text-slate-400">Validation Scenarios</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">6</div>
                <div className="text-sm text-slate-400">Continents Tested</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">$12B+</div>
                <div className="text-sm text-slate-400">Simulated Deal Value</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-xl text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">15+</div>
                <div className="text-sm text-slate-400">Industry Sectors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Quote & CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-center mb-16">
            <p className="text-2xl font-serif italic text-slate-700 mb-6">
              "We built this system because the gap between 'investable' and 'uninvestable' is often just a gap in information. I watched for years as incredible regional opportunities were passed over - not because the fundamentals were weak, but because the cost of verifying them was too high."
            </p>
            <footer className="text-slate-900 font-bold">
              Brayden Walls
              <span className="block text-slate-500 font-normal text-sm mt-1">Founder, VERDIX Intelligence</span>
            </footer>
          </blockquote>

          <div className="bg-blue-50 rounded-2xl p-8 md:p-12 border border-blue-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">What Beta Partners Receive</h2>
              <p className="text-slate-600">We are inviting you to be a Founding Beta Partner not to "test software," but to deploy this ten-step protocol on your region's toughest challenges.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">Full platform access for pilot engagement</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">Direct collaboration with founding architect</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">Influence on roadmap priorities</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">Preferred terms as platform scales</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">Skeptic's Report on priority projects</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">Board-ready artifacts for investors</span>
              </div>
            </div>

            <div className="text-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Get Started
              </button>
              <p className="text-slate-500 text-sm mt-4">
                No onboarding required. Try a live demo or contact us for a pilot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="font-bold text-white text-lg mb-1">VERDIX Intelligence</div>
            <div>Melbourne, Australia | ABN 55 978 113 300</div>
          </div>
          <div className="text-right">
            <div>&copy; 2025 VERDIX Intelligence. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AttractWorkspace;
