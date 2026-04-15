import React from 'react';
import { Globe, AlertTriangle, ShieldCheck, ShieldOff, Zap } from 'lucide-react';

export const RegionalContextIntro: React.FC = () => {
  return (
    <section className="bg-white py-24 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
          <div className="lg:col-span-5">
            <div className="text-bw-gold font-bold uppercase tracking-widest text-xs mb-3">Who This Is For</div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-bw-navy leading-tight">
              Trust the Decision Before You Make It
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg text-slate-700 leading-relaxed">
              Whether you are a regional council, a government agency, a business expanding into new markets, or a first-time exporter &mdash; this system formally verifies decisions before capital moves, so your case is built on proof, not belief.
            </p>
            <div className="mt-6 p-6 bg-bw-light border border-black/5 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.35em] text-bw-navy/60">How It Shows Up For You</div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl border border-black/5">
                  <div className="flex items-center gap-2 text-bw-navy font-bold text-sm"><Globe className="w-4 h-4 text-bw-gold" /> Be Understood</div>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">Your assets, risks, and opportunities translate into the same structured intelligence used by elite firms.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-black/5">
                  <div className="flex items-center gap-2 text-bw-navy font-bold text-sm"><ShieldCheck className="w-4 h-4 text-bw-gold" /> Be Verified</div>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">Claims are cross-checked against live feeds - so you present evidence, not belief.</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-black/5">
                  <div className="flex items-center gap-2 text-bw-navy font-bold text-sm"><Zap className="w-4 h-4 text-bw-gold" /> Be Ready</div>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">Mandates, decks, and negotiations get backed by computed "what happens next."</p>
                </div>
              </div>
              <p className="mt-5 text-xs text-slate-600 italic">
                The rest of this page walks you through how the Adversarial Intelligence Quorum works &mdash; from the core protocol, to the five engines, to the Workbench you use every day.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 bg-white rounded-2xl border border-black/5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-bw-light border border-black/5 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-bw-gold" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-bw-navy">The Problem: Unverified Decisions</h3>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              Every high-stakes decision today is made on unverified assumptions. Decision-makers don&rsquo;t see the asset base &mdash; they see uncertainty, fragmented data, and complexity that no existing tool can formally validate.
            </p>
          </div>

          <div className="p-7 bg-white rounded-2xl border border-black/5 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-bw-light border border-black/5 flex items-center justify-center">
              <ShieldOff className="w-6 h-6 text-bw-gold" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-bw-navy">The Barrier: The High Cost of Trust</h3>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              The old bridge was elite consulting: expensive, slow, and inaccessible. Most organisations never get adversarial verification &mdash; the kind where every claim is stress-tested, contradicted, and proven before it reaches the table.
            </p>
          </div>

          <div className="p-7 bg-bw-navy rounded-2xl border border-bw-navy text-white shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-bw-gold" />
            </div>
            <h3 className="mt-5 text-lg font-bold">The Solution: Adversarial Intelligence Quorum</h3>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              Five independent AI minds argue every claim. A SAT solver catches contradictions. Monte Carlo simulations stress-test every projection. The result: verified decisions, not generated opinions.
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs tracking-[0.4em] text-bw-gold uppercase">Why This System Exists</div>
            <p className="text-base md:text-lg text-slate-700 leading-[1.85]">
              I built NSIL &mdash; the Nexus Strategic Intelligence Layer &mdash; because markets needed more than another dashboard. They needed an adversarial verification system that could read messy, complex reality, argue with itself about what&rsquo;s true, and express the result in the precise, structured language that decision-makers already trust.
            </p>
            <p className="text-base md:text-lg text-slate-700 leading-[1.85]">
              For centuries, the bridge between complex reality and structured proof was elite consulting: expensive, slow, and inaccessible to most. There was no affordable, end-to-end intelligence system designed to standardize proof for everyone - until now.
            </p>
            <p className="text-base md:text-lg text-slate-700 leading-[1.85]">
              This system began boots-on-the-ground and was built through 16 months of field observation and synthesis - mapping how the last 200 years of business growth repeatedly fails when translation, trust, and execution capacity are ignored.
            </p>
            <p className="text-base md:text-lg text-slate-700 leading-[1.85]">
              It is not a passive report generator. It is an always-on Adversarial Intelligence Quorum that sits between your mandate and the world&rsquo;s data: it ingests your intent, runs five independent AI minds against it, catches contradictions with a SAT solver, stress-tests projections through Monte Carlo simulation, and returns a strategy that has already been formally verified &mdash; so your documents match what you actually need, not what you&rsquo;re told you should want.
            </p>
          </div>
          <div className="lg:col-span-5 rounded-2xl border border-black/5 bg-bw-light p-7">
            <div className="text-xs uppercase tracking-[0.4em] text-bw-navy/70 mb-4">Quick Summary</div>
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-bw-gold" />
                </div>
                <div><strong className="text-bw-navy">Translation:</strong> Local complexity becomes legible proof.</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-bw-gold" />
                </div>
                <div><strong className="text-bw-navy">Verification:</strong> Live feeds anchor what you claim.</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-bw-gold" />
                </div>
                <div><strong className="text-bw-navy">Readiness:</strong> Strategy gets stress-tested before capital moves.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

