import React from 'react';
import { Cpu, Globe, Activity, Layers, Radio } from 'lucide-react';

export const About: React.FC = () => {
  return (
        <section id="identity" className="py-24 bg-bw-light relative overflow-hidden border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            
            {/* Left: Text Content */}
            <div>
                <div className="mb-12">
                    <h2 className="text-bw-gold font-bold uppercase tracking-widest text-xs mb-3">System Philosophy</h2>
                    <h3 className="text-4xl md:text-5xl font-serif font-bold text-bw-navy leading-tight mb-6">
                    Adversarial Intelligence Quorum.<br/>Trust the Output.
                    </h3>
                </div>

                <div className="space-y-14">
                    {/* Our Mandate */}
                    <div className="relative pl-8 border-l-2 border-stone-200 hover:border-bw-gold transition-colors duration-300 group">
                        <div className="absolute -left-[9px] top-0 bg-white py-1 transition-transform group-hover:scale-110">
                            <Globe className="w-4 h-4 text-bw-gold" />
                        </div>
                        <h4 className="text-xl font-bold text-bw-navy mb-3">The Problem We Solve</h4>
                        <h5 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-2">Decision Trust, Verified.</h5>
                        <p className="leading-[1.85] text-[15px] md:text-base text-[#1C1C1C]" style={{fontFamily:'Inter, Arial, sans-serif'}}>
                            Every organisation using AI to make high-stakes decisions has the same problem: how do you trust the output? LLMs hallucinate. Dashboards show data without argument. Consultants give opinions. Nobody formally verifies decisions before they're made.
                        </p>
                        <p className="leading-[1.85] text-[15px] md:text-base mt-4 text-[#808080]" style={{fontFamily:'Inter, Arial, sans-serif'}}>
                            This system does. Every conclusion is adversarially debated, logically validated, stress-tested across thousands of scenarios, and traced to its source — the kind of defensible logic that regulators, boards, and fiduciary committees require.
                        </p>
                    </div>

                    {/* Operational Philosophy */}
                    <div className="relative pl-8 border-l-2 border-stone-200 hover:border-bw-gold transition-colors duration-300 group">
                        <div className="absolute -left-[9px] top-0 bg-white py-1 transition-transform group-hover:scale-110">
                            <Cpu className="w-4 h-4 text-bw-gold" />
                        </div>
                        <h4 className="text-xl font-bold text-bw-navy mb-3">Deterministic Intelligence</h4>
                        <h5 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-2">Verified, Not Generated.</h5>
                        <p className="leading-[1.85] text-[15px] md:text-base text-[#1C1C1C]" style={{fontFamily:'Inter, Arial, sans-serif'}}>
                            This is not a chatbot that generates plausible text. It is an <strong>Adversarial Intelligence Quorum</strong> — five independent AI minds debate every conclusion, a SAT solver catches logical impossibilities, and nothing reaches you without surviving formal adversarial scrutiny.
                        </p>
                        <p className="leading-[1.85] text-[15px] md:text-base mt-4 text-[#808080]" style={{fontFamily:'Inter, Arial, sans-serif'}}>
                            It ingests your strategic intent and stress-tests it using 54+ proprietary formulas, Monte Carlo simulation, Bayesian belief updating, and causal reasoning. We don't guess if a strategy will work; we calculate the specific ways it might fail — and how to correct for them.
                        </p>
                    </div>

                    {/* NSIL Provenance Callout */}
                    <div className="relative pl-8 border-l-2 border-stone-200 hover:border-bw-gold transition-colors duration-300 group">
                        <div className="absolute -left-[9px] top-0 bg-white py-1 transition-transform group-hover:scale-110">
                            <Layers className="w-4 h-4 text-bw-gold" />
                        </div>
                        <h4 className="text-xl font-bold text-bw-navy mb-3">NSIL: The Live Data Spine</h4>
                        <h5 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-2">Provenance Anchored.</h5>
                        <p className="leading-[1.85] text-[15px] md:text-base text-[#1C1C1C]" style={{fontFamily:'Inter, Arial, sans-serif'}}>
                            NSIL - Nexus Strategic Intelligence Layer - is the 10-layer pipeline that powers everything. It standardises signals from 20+ real-time data sources into a coherent, machine-readable format that feeds every engine.
                        </p>
                        <p className="leading-[1.85] text-[15px] md:text-base mt-4 text-[#808080]" style={{fontFamily:'Inter, Arial, sans-serif'}}>
                            Outputs like <strong>SPI</strong>, <strong>IVAS</strong>, <strong>SCF</strong>, <strong>RROI</strong>, and <strong>SEAM</strong> stay explainable and auditable: every calculation traces back to its source data, and every claim can be verified independently.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: The Visual */}
            <div className="relative h-full min-h-[520px] flex items-center justify-center">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-3/4 h-full bg-white rounded-2xl -z-10 transform translate-x-4 translate-y-4 border border-black/5"></div>
                
                {/* Main Image Container */}
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-black/10 group">
                    <img 
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2301" 
                        alt="Global Architecture" 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-bw-navy/20 mix-blend-multiply pointer-events-none transition-opacity duration-500 group-hover:opacity-0"></div>
                    
                    {/* Floating Overlay */}
                    <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6 border border-black/10 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <Activity className="w-8 h-8 text-bw-navy animate-pulse" />
                            <div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">System Status</div>
                                <div className="text-lg font-bold text-bw-navy leading-none">Operational & Calculating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-black/10 pt-12">
            {[
                { val: '54+', label: 'Proprietary Formulas', icon: <Layers className="w-4 h-4 mb-2 text-bw-gold" /> },
                { val: '240+', label: 'Document Types', icon: <Activity className="w-4 h-4 mb-2 text-bw-gold" /> },
                { val: '20+', label: 'Real-Time Data Sources', icon: <Cpu className="w-4 h-4 mb-2 text-bw-gold" /> },
                { val: '5', label: 'Independent AI Minds', icon: <Globe className="w-4 h-4 mb-2 text-bw-gold" /> },
            ].map((stat, i) => (
                <div key={i} className="text-center md:text-left group cursor-default">
                    {stat.icon}
                    <div className="text-4xl font-serif font-bold text-bw-navy group-hover:text-bw-gold transition-colors duration-300">{stat.val}</div>
                    <div className="text-xs uppercase tracking-widest mt-1 font-bold text-[#808080]">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* The Core Mandate */}
        <div className="bg-bw-navy border border-white/10 p-8 rounded-2xl shadow-xl relative overflow-hidden mt-24">
            <h3 className="text-bw-gold font-bold uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                <Radio className="w-5 h-5 animate-pulse" /> The Core Mandate
            </h3>
            <p className="text-lg leading-relaxed relative z-10 font-serif text-[#1C1C1C]" style={{fontFamily:'Inter, Arial, sans-serif'}}>
                "We don't guess. We verify. Five AI minds argue every conclusion. A SAT solver catches contradictions. Monte Carlo runs thousands of scenarios. Every claim traces to its source — so decisions survive scrutiny before capital moves."
            </p>
        </div>

      </div>
    </section>
  );
};

