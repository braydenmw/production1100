
import React from 'react';
import { 
    Network, BarChart3, TrendingUp, Layers, Database, Globe, 
    ShieldCheck, Zap, Target, Scale, Activity,
  Anchor, Compass, Lock, Share2, BrainCircuit, Briefcase, Users,
    FileCode, Fingerprint, GitBranch, Key, UserCheck, CheckCircle2
} from 'lucide-react';
import { Service } from '../types';

const CORE_TRINITY: Service[] = [
  {
    id: 'ivas',
    title: 'IVAS Engine',
    subtitle: 'Investment Viability Assessment',
    description: 'Calculates the "Velocity of Capital." IVAS models how quickly an investment can actually be deployed in a specific region, factoring in bureaucratic friction, infrastructure lag, and local partner capability.',
    icon: <BarChart3 className="h-8 w-8 text-bw-gold" />,
  },
  {
    id: 'spi',
    title: 'SPI Engine',
    subtitle: 'Strategic Partnership Index',
    description: 'Measures "Symbiotic Fit." SPI moves beyond basic due diligence to analyze operational compatibility. It assigns a probability score to a partnership\'s long-term survival based on historical cultural and operational data.',
    icon: <Network className="h-8 w-8 text-bw-gold" />,
  },
  {
    id: 'scf',
    title: 'SCF Engine',
    subtitle: 'Strategic Cash Flow',
    description: 'Projects the "Knock-On Effect." SCF is a non-linear financial model that simulates second and third-order economic impacts, showing how a single investment creates ripples across the regional ecosystem.',
    icon: <TrendingUp className="h-8 w-8 text-bw-gold" />,
  },
];

const SPECIALIZED_ENGINES = [
  // Strategic
  { acronym: 'RROI', name: 'Regional Readiness & Opportunity Index', icon: <Globe className="w-4 h-4" />, cat: 'Strategic' },
  { acronym: 'SEAM', name: 'Strategic Ecosystem Alignment Map', icon: <Layers className="w-4 h-4" />, cat: 'Strategic' },
  { acronym: 'LAI', name: 'Latent Asset Identification', icon: <Zap className="w-4 h-4" />, cat: 'Strategic' },
  { acronym: 'BARNA', name: 'Best Alternative to Negotiated Agreement Plus', icon: <Scale className="w-4 h-4" />, cat: 'Strategic' },
  { acronym: 'NVI', name: 'Negotiation Value Index', icon: <Briefcase className="w-4 h-4" />, cat: 'Strategic' },
  { acronym: 'CRI', name: 'Cultural Resonance Index', icon: <Users className="w-4 h-4" />, cat: 'Strategic' },

  // Operational
  { acronym: 'CAP', name: 'Counterparty Analysis Protocol', icon: <Users className="w-4 h-4" />, cat: 'Operational' },
  { acronym: 'AGI', name: 'Accelerated Growth Index', icon: <TrendingUp className="w-4 h-4" />, cat: 'Operational' },
  { acronym: 'VCI', name: 'Value Creation Index', icon: <Activity className="w-4 h-4" />, cat: 'Operational' },
  { acronym: 'ATI', name: 'Adaptability & Transition Index', icon: <Compass className="w-4 h-4" />, cat: 'Operational' },
  { acronym: 'ESI', name: 'Execution Superiority Index', icon: <Target className="w-4 h-4" />, cat: 'Operational' },
  { acronym: 'ISI', name: 'Innovation Strength Index', icon: <BrainCircuit className="w-4 h-4" />, cat: 'Operational' },
  { acronym: 'OSI', name: 'Operational Sustainability Index', icon: <Anchor className="w-4 h-4" />, cat: 'Operational' },
  { acronym: 'TCO', name: 'Total Cost of Ownership (Regional)', icon: <BarChart3 className="w-4 h-4" />, cat: 'Operational' },

  // Risk
  { acronym: 'PRI', name: 'Portfolio Risk Index', icon: <ShieldCheck className="w-4 h-4" />, cat: 'Risk' },
  { acronym: 'RNI', name: 'Regulatory Navigation Index', icon: <Lock className="w-4 h-4" />, cat: 'Risk' },
  { acronym: 'SRA', name: 'Sovereign Risk Assessment', icon: <Globe className="w-4 h-4" />, cat: 'Risk' },
  { acronym: 'IDV', name: 'Institutional Distance Vector', icon: <Scale className="w-4 h-4" />, cat: 'Risk' },
];

const FOUNDATION_MODELS = [
  { name: 'Gravity Model of Trade', desc: 'Trade Flow Physics' },
  { name: 'Location Quotient (LQ)', desc: 'Cluster Identification' },
  { name: 'Shift-Share Analysis', desc: 'Competitive Deconstruction' },
];

export const Services: React.FC = () => {
  return (
    <section id="nexus-core" className="py-0 bg-stone-50 relative overflow-hidden">
      
      {/* 1. THE ARCHITECT'S ORIGIN STORY (Full Width Feature) */}
      <div className="bg-white border-b border-stone-200 py-24 relative">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Visual / Portrait Placeholder */}
                <div className="relative order-2 lg:order-1">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-bw-gold/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 bg-stone-100 p-2 rounded-sm rotate-1 shadow-xl border border-stone-200">
                        <div className="aspect-[4/5] bg-stone-200 rounded-sm overflow-hidden relative group">
                             <img 
                                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2342" 
                                alt="System Architect" 
                                className="w-full h-full object-cover grayscale contrast-125"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-bw-navy via-transparent to-transparent opacity-90"></div>
                             
                             <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <UserCheck className="w-8 h-8 text-bw-gold mb-4" />
                                <div className="font-serif font-bold text-2xl mb-1">Brayden Walls</div>
                                <div className="text-xs uppercase tracking-widest text-bw-gold mb-4">Founder & System Architect</div>
                                <div className="text-[10px] font-mono text-stone-300 border-t border-white/20 pt-4 leading-relaxed">
                                    LOCATION: Pagadian City<br/>
                                    STATUS: Field Observation<br/>
                                    RESULT: The Core Kernel v1.0
                                </div>
                             </div>
                        </div>
                    </div>
                    {/* Decorative Quote */}
                    <div className="absolute -bottom-6 -right-6 bg-bw-navy text-white p-6 rounded-sm shadow-xl max-w-xs z-20 border-l-4 border-bw-gold hidden md:block">
                        <p className="font-serif italic text-sm leading-relaxed">
                            "The gap isn't capital. The gap is translation."
                        </p>
                    </div>
                </div>

                {/* The Narrative */}
                <div className="order-1 lg:order-2">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-bw-navy mb-6 leading-tight">
                        Verifying the <br/>
                        <span className="text-stone-400">Unverified.</span>
                    </h2>
                    
                    <div className="prose prose-lg text-stone-600 leading-[1.85] space-y-7 text-base md:text-lg">
                        <p>
                            There are trillions of dollars in economic potential locked away in overlooked places &mdash; regions, industries, and markets that global capital consistently misprices because their reality has never been formally verified. The problem was never the markets. It was the intelligence layer.
                        </p>
                        <p>
                            This system was built from the field up. Over 16 months of boots-on-the-ground observation and synthesis, we traced the repeating failure modes across 200 years of global business and growth - then converted those lessons into a machine-operable intelligence layer.
                        </p>
                        <p>
                            We built the <strong>Nexus Strategic Intelligence Layer (NSIL)</strong> to solve this specific inequity. It is not a tool for extraction; it is an engine for connection. By translating complex reality into structured, auditable intelligence, we ensure that no viable opportunity is lost to translation errors.
                        </p>
                        <p>
                            Most systems only see the bee and the flower - the visible transaction. This architecture is designed to see the entire meadow: the ecosystem context, the execution constraints, and the hidden connections that determine whether a strategy survives contact with reality.
                        </p>
                        <p>
                            This system is the world&rsquo;s first <strong>Verified Decision Intelligence Exchange</strong>. Five independent AI minds argue every claim. A SAT solver catches contradictions. Monte Carlo simulations stress-test every projection. It provides the same level of analytical rigour found in elite consulting firms, but is purpose-built to formally verify decisions across any domain &mdash; from regional development to corporate strategy, legal advisory, financial analysis, and beyond.
                        </p>
                        <p>
                            Operational capabilities include <strong>Partner Discovery</strong>, <strong>SPI-driven Matchmaking</strong>, <strong>240+ Document Types</strong>, <strong>Monte Carlo Simulation</strong>, <strong>Adversarial Debate</strong>, <strong>Causal Reasoning</strong>, <strong>Due Diligence Intelligence</strong>, and <strong>NSIL/API Export</strong> for downstream workflows.
                        </p>
                    </div>

                    {/* Regional Commitment Card */}
                    <div className="mt-10 p-7 md:p-8 bg-stone-50 border border-stone-200 rounded-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-bw-navy uppercase tracking-widest flex items-center gap-2">
                                <Globe className="w-4 h-4 text-bw-gold" />
                                System Dedication
                            </h4>
                            <span className="bg-bw-gold/15 text-bw-navy px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 border border-bw-gold/30">
                                <CheckCircle2 size={10} /> Committed
                            </span>
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed italic mb-4">
                            "We architected this system to formally verify decisions in the 'blind spots' of the global economy. Five AI minds argue. A SAT solver catches contradictions. Nothing reaches you until it has been stress-tested, debated, and proven &mdash; across any domain, any market, any decision."
                        </p>
                        <div className="flex gap-6 pt-3 border-t border-stone-200">
                            <div>
                                <span className="block text-[10px] font-bold text-stone-400 uppercase">Target Markets</span>
                                <span className="text-xs font-bold text-bw-navy">All Domains & Markets</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-stone-400 uppercase">Mission</span>
                                <span className="text-xs font-bold text-bw-navy">Adversarial Verification</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 relative z-10">
        
        {/* SECTION 2: THE GENESIS - NSIL */}
        <div className="mb-24">
            <div className="bg-stone-900 text-white rounded-sm overflow-hidden relative border border-stone-800 shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <FileCode size={400} />
                </div>
                
                <div className="grid md:grid-cols-2">
                    <div className="p-12 flex flex-col justify-center border-r border-stone-800 relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-bw-gold/20 rounded-md border border-bw-gold/50">
                                <Database className="w-6 h-6 text-bw-gold" />
                            </div>
                            <span className="text-xs font-bold text-bw-gold uppercase tracking-[0.2em]">Level 1: The Protocol</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                            NSIL <br/>
                            <span className="text-stone-500">Nexus Strategic Intelligence Layer</span>
                        </h2>
                        <p className="text-stone-400 text-lg leading-relaxed mb-8">
                            Before the engines could be built, we had to invent the language they speak. <strong>NSIL</strong> was the first invention. It is the XML-based protocol designed specifically to standardize unstructured regional economic data into a coherent, machine-readable format.
                        </p>
                        <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
                            <span className="flex items-center gap-2"><GitBranch size={14} /> v4.2.0 Stable</span>
                            <span className="flex items-center gap-2"><Key size={14} /> Encrypted Core</span>
                        </div>
                    </div>
                    
                    <div className="bg-black/50 p-12 flex flex-col justify-center relative">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-col items-center flex">
                                    <div className="w-px h-full bg-stone-800 mb-2"></div>
                                    <div className="p-2 bg-stone-800 rounded-full"><BrainCircuit size={20} className="text-bw-gold" /></div>
                                    <div className="w-px h-full bg-stone-800 mt-2"></div>
                                </div>
                                <div className="py-4">
                                    <h4 className="text-xl font-bold text-white mb-2">Level 2: The Core Brain</h4>
                                    <p className="text-sm text-stone-400 leading-relaxed">
                                        The central processing unit that ingests NSIL data. It doesn't just read data; it understands <i>strategic intent</i>. It was developed immediately after NSIL to parse "Case Observations (CO)"a"our proprietary dataset of failure points - and to model ecosystem context, not just the visible transaction.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-6 border-l-2 border-bw-gold bg-bw-gold/5">
                                <h5 className="font-bold text-bw-gold uppercase text-xs tracking-widest mb-3">Verification of Origin</h5>
                                <p className="text-sm text-stone-300 italic leading-relaxed">
                                    "We built this because the tools didn't exist. Standard consulting models are priced for the Fortune 500 and designed for stability. We built The Core for everyone else - to operate in complexity, at a cost that democratizes intelligence."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 3: THE CORE TRINITY (Outputs of NSIL) */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                Level 3: The Applications
            </div>
            <h3 className="text-3xl font-serif font-bold text-bw-navy">The Core Trinity</h3>
            <p className="text-stone-500 mt-2">The primary analytical outputs generated by the Core Brain.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {CORE_TRINITY.map((engine) => (
            <div key={engine.id} className="group p-8 border border-gray-200 bg-white hover:border-bw-gold transition-all duration-500 rounded-sm relative shadow-sm hover:shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                {React.cloneElement(engine.icon as React.ReactElement<{ className?: string }>, { className: 'h-40 w-40 text-bw-navy' })}
              </div>
              <div className="mb-8 p-4 bg-bw-light rounded-sm w-fit group-hover:bg-bw-navy transition-colors duration-300">
                {React.cloneElement(engine.icon as React.ReactElement<{ className?: string }>, { className: 'h-8 w-8 text-bw-navy group-hover:text-bw-gold transition-colors duration-300' })}
              </div>
              <div className="relative z-10">
                <h4 className="text-2xl font-serif font-bold text-bw-navy mb-2">{engine.title}</h4>
                <p className="text-xs font-bold text-bw-gold uppercase tracking-widest mb-6">{engine.subtitle}</p>
                <p className="text-gray-600 leading-relaxed text-sm border-l-2 border-gray-100 pl-4 group-hover:border-bw-gold transition-colors duration-300">
                  {engine.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 4: THE SPECIALIZED MATRIX */}
        <div className="mb-8 flex items-center gap-4">
            <div className="h-px bg-stone-200 flex-1"></div>
            <span className="text-xs font-bold text-bw-gold uppercase tracking-widest flex items-center gap-2">
                <Fingerprint size={16} /> 
                Case Observation (CO) Derivatives
            </span>
            <div className="h-px bg-stone-200 flex-1"></div>
        </div>
        
        <p className="text-center text-stone-500 mb-12 max-w-3xl mx-auto text-sm">
            These 18 specialized engines were developed iteratively to address specific failure modes identified in our historical dataset. They are proprietary architectures, not standard economic theories.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-20">
            {SPECIALIZED_ENGINES.map((eng, idx) => (
                <div key={idx} className="bg-stone-50 border border-stone-200 p-4 rounded-sm hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-stone-400 group-hover:text-bw-navy transition-colors">{eng.icon}</div>
                        <div className="text-[9px] font-bold text-stone-300 uppercase">{eng.cat}</div>
                    </div>
                    <div className="text-lg font-bold text-bw-navy mb-1">{eng.acronym}</div>
                    <div className="text-[10px] font-medium text-stone-500 leading-tight">{eng.name}</div>
                </div>
            ))}
        </div>

        {/* SECTION 5: FOUNDATION MODELS */}
        <div className="grid md:grid-cols-12 gap-8 border-t border-stone-200 pt-12">
            <div className="md:col-span-4">
                <h4 className="font-serif font-bold text-xl text-bw-navy mb-2">Foundation Models</h4>
                <p className="text-sm text-stone-500">
                    The only standard components in our system. We utilize these accepted physics models as a baseline, then apply our proprietary engines on top.
                </p>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {FOUNDATION_MODELS.map((model, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded border border-stone-100">
                        <Share2 className="w-4 h-4 text-stone-400" />
                        <div>
                            <div className="font-bold text-xs text-stone-800">{model.name}</div>
                            <div className="text-[10px] text-stone-500">{model.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </section>
  );
};

