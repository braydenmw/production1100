
import React, { useEffect, useState } from 'react';
import { Radio, ScanLine, Users, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
        <section className="relative w-full overflow-hidden bg-bw-light">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-bw-light to-white" />
                <img
                    src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2600&q=80"
                    alt="Urban Complexity"
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.06] grayscale"
                />
                <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-bw-gold/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-bw-navy/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left: Narrative */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-3">
                                <span className="h-px w-10 bg-bw-gold/70" aria-hidden="true" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-bw-navy/70">
                                    Adversarial Intelligence Quorum * 5 Independent AI Minds * 54+ Formulas * 240+ Documents
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-bw-navy leading-[1.05]">
                                Beyond Data. Beyond Consulting.
                                <span className="block mt-3 text-bw-gold">The World's First Adversarial Intelligence Quorum.</span>
                            </h1>

                            <div className="space-y-5 max-w-3xl text-[15px] sm:text-lg text-slate-700 leading-[1.85]">
                                <p>
                                    Every organisation on earth that uses AI to make high-stakes decisions has the same problem: <strong className="text-bw-navy">How do you trust the output?</strong> LLMs hallucinate. Dashboards show data without argument. Consultants give opinions. Nobody formally verifies decisions before they're made.
                                </p>
                                <p className="text-bw-navy font-medium">
                                    This system does. Whether you're an investor, a business owner, a government planner, or a consultant — the ADVERSIQ Consultant formally verifies every decision through adversarial debate, contradiction detection, Monte Carlo stress-testing, and full audit trail before any output reaches you.
                                </p>
                                <p>
                                    We architected the <strong className="text-bw-navy">Nexus Strategic Intelligence Layer (NSIL)</strong> — a 10-layer deterministic pipeline where five independent AI minds argue every conclusion, a SAT solver catches logical impossibilities, and 54+ proprietary formulas score every dimension. Nothing is guessed. Everything is auditable.
                                </p>
                                <p>
                                    Built from the ground up because trillions of dollars in economic potential sit locked in overlooked places — and no tool existed to surface, prove, and defend that value. This system was born in regional development. Its architecture solves the universal problem of decision trust.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 bg-white/70 border border-black/5 rounded-xl">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-bw-navy/60 mb-2">Decision Verification</div>
                                    <div className="text-sm text-slate-700 leading-relaxed">
                                        SAT Contradiction Detection, 5-Persona Adversarial Debate, Monte Carlo Stress-Testing, Bayesian Belief Updating.
                                    </div>
                                </div>
                                <div className="p-5 bg-white/70 border border-black/5 rounded-xl">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-bw-navy/60 mb-2">Institutional Output</div>
                                    <div className="text-sm text-slate-700 leading-relaxed">
                                        240+ Document Types, Full Audit Trail, Traceable Reasoning Chain, Boardroom-Ready Intelligence.
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-bw-navy text-white rounded-full border border-bw-navy/20 text-[11px] font-bold uppercase tracking-widest">
                                    <Users className="w-3.5 h-3.5 text-bw-gold" aria-hidden="true" /> Adversarial Debate
                                </span>
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-bw-navy text-white rounded-full border border-bw-navy/20 text-[11px] font-bold uppercase tracking-widest">
                                    <Activity className="w-3.5 h-3.5 text-bw-gold" aria-hidden="true" /> Monte Carlo
                                </span>
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-bw-navy text-white rounded-full border border-bw-navy/20 text-[11px] font-bold uppercase tracking-widest">
                                    <AlertTriangle className="w-3.5 h-3.5 text-bw-gold" aria-hidden="true" /> SAT Verification
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Signal Panel */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                            className="space-y-6"
                        >
                            <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-md shadow-2xl overflow-hidden">
                                <div className="p-6 border-b border-black/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ScanLine className="w-4 h-4 text-bw-gold" />
                                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-bw-navy/70">Signal Panel</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-bw-navy/60">Verifying Decision Logic...</span>
                                </div>

                                <div className="relative p-6 bg-bw-navy text-white">
                                    {/* Scan accent */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#b49b67 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                                    <div
                                        className="absolute left-0 right-0 border-t-2 border-bw-gold/60 shadow-[0_0_18px_rgba(180,155,103,0.25)] transition-all duration-100 ease-linear"
                                        style={{ top: `${scanLine}%` }}
                                    />

                                    <div className="relative">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold">System Active</div>
                                            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/70">
                                                <span className="w-2 h-2 bg-bw-gold rounded-full animate-pulse" /> Live
                                            </div>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Verification</div>
                                                <div className="mt-1 text-sm text-white/90">SAT + Adversarial + Monte Carlo</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Rigour</div>
                                                <div className="mt-1 text-sm text-white/90">Deterministic, auditable logic</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Coverage</div>
                                                <div className="mt-1 text-sm text-white/90">50+ engines + 240+ documents</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Purpose</div>
                                                <div className="mt-1 text-sm text-white/90">Adversarial Intelligence Quorum</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 border border-black/5 rounded-2xl p-6 shadow-lg">
                                <h3 className="text-bw-gold font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                                    <Radio className="w-4 h-4" /> The Core Mandate
                                </h3>
                                <p className="text-bw-navy text-sm leading-relaxed">
                                    "We don't guess. We verify. Five AI minds argue every conclusion. A SAT solver catches contradictions. Monte Carlo runs thousands of scenarios. Every claim traces to its source — so decisions survive scrutiny before capital moves."
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="mt-14 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-bw-navy/60">
                    <span className="inline-block h-px w-10 bg-bw-navy/15" aria-hidden="true" />
                    <span>Scroll to explore the architecture</span>
                </div>
            </div>
        </section>
  );
};

