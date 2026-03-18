import React, { useMemo } from 'react';
import { Zap, AlertTriangle, Lightbulb, HelpCircle, ArrowRight, Loader2, CheckCircle, Sparkles, ShieldCheck, FileText, Flag } from 'lucide-react';
import { CopilotInsight } from '../types';

interface LeftSidebarProps {
  insights: CopilotInsight[];
  isLoading: boolean;
  readinessPercent?: number;
  stepStates?: Array<{ id: string; label: string; missing: number }>;
  docReadiness?: Array<{ id: string; label: string; ready: boolean }>;
  blockers?: string[];
  onContinueIntake?: () => void;
  onOpenDraft?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  insights,
  isLoading,
  readinessPercent = 50,
  stepStates = [
    { id: 'identity', label: 'Identity', missing: 1 },
    { id: 'mission', label: 'Mission', missing: 1 },
    { id: 'partner', label: 'Partner', missing: 1 },
    { id: 'constraints', label: 'Constraints/Proof', missing: 2 },
  ],
  docReadiness = [
    { id: 'executive-summary', label: 'Exec Summary', ready: false },
    { id: 'entry-advisory', label: 'Entry Advisory', ready: false },
    { id: 'cultural-brief', label: 'Cultural Brief', ready: false },
    { id: 'loi', label: 'LOI', ready: false },
    { id: 'risk', label: 'Risk', ready: false },
  ],
  blockers = ['Set country and city', 'Add at least one partner persona'],
  onContinueIntake,
  onOpenDraft,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} className="text-amber-600" />;
      case 'opportunity': return <Lightbulb size={16} className="text-emerald-600" />;
      case 'question': return <HelpCircle size={16} className="text-blue-600" />;
      default: return <Zap size={16} className="text-purple-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'opportunity': return 'bg-emerald-50 border-emerald-100';
      case 'question': return 'bg-blue-50 border-blue-100';
      default: return 'bg-purple-50 border-purple-100';
    }
  };

  const grouped = useMemo(() => {
    return ['warning', 'opportunity', 'question'].map(type => ({
      type,
      items: insights.filter(i => i.type === type as CopilotInsight['type']),
    })).filter(group => group.items.length > 0);
  }, [insights]);

  const progressClamp = Math.min(Math.max(readinessPercent, 0), 100);

  // --- LINEAR-STYLE SIDEBAR ---
  return (
    <aside className="w-80 bg-white border-r border-stone-200 flex flex-col h-[calc(100vh-64px)] overflow-hidden shrink-0 hidden xl:flex">
      {/* Header */}
      <div className="p-5 border-b border-stone-100 bg-gradient-to-r from-slate-50 via-white to-amber-50/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-stone-500 font-semibold mb-1">
          <Sparkles size={14} className="text-amber-500" /> Workflow
        </div>
        <h2 className="font-semibold text-stone-900 text-lg leading-tight">Strategic Steps</h2>
        <p className="text-[12px] text-stone-500">Complete each step to progress your report. Click any step to jump.</p>
      </div>

      {/* Stepper */}
      <nav className="flex-1 overflow-y-auto p-5 bg-stone-50/40">
        <ol className="space-y-2">
          {stepStates.map((step, idx) => {
            const isComplete = step.missing === 0;
            const isCurrent = stepStates.findIndex(s => s.missing > 0) === idx || (stepStates.every(s => s.missing === 0) && idx === stepStates.length - 1);
            return (
              <li key={step.id}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left shadow-sm group
                    ${isCurrent ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : isComplete ? 'border-emerald-300 bg-emerald-50' : 'border-stone-200 bg-white hover:bg-stone-100'}
                  `}
                  style={{ fontWeight: isCurrent ? 700 : 500 }}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full border-2 text-xs font-bold
                    ${isComplete ? 'border-emerald-400 bg-emerald-200 text-emerald-900' : isCurrent ? 'border-blue-600 bg-blue-100 text-blue-700 animate-pulse' : 'border-stone-300 bg-white text-stone-400'}`}
                  >
                    {isComplete ? <CheckCircle size={16} /> : idx + 1}
                  </span>
                  <span className="flex-1 text-sm">{step.label}</span>
                  <span className="text-[11px] font-mono text-stone-400">{isComplete ? 'Done' : step.missing > 0 ? `${step.missing} left` : ''}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Upload Button (always visible) */}
        <div className="mt-8 flex flex-col gap-2">
          <button className="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2 shadow hover:bg-indigo-700 transition">
            <FileText size={16} /> Upload Documents
          </button>
        </div>

        {/* Blockers */}
        <div className="mt-8 p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-stone-800">
            <AlertTriangle size={14} className="text-amber-500" /> Blockers
            <span className="ml-auto text-[11px] text-stone-500">{blockers.length} open</span>
          </div>
          <ul className="space-y-1">
            {blockers.slice(0, 3).map((b, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-stone-700">
                <Flag size={12} className="text-amber-500" /> {b}
              </li>
            ))}
            {blockers.length === 0 && <li className="text-xs text-emerald-700">No blockers - ready to generate.</li>}
          </ul>
        </div>

        {/* Document Readiness */}
        <div className="mt-6 p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-stone-800">
            <FileText size={14} className="text-blue-500" /> Document Readiness
            <span className="ml-auto text-[11px] text-stone-500">{docReadiness.filter(d => d.ready).length}/{docReadiness.length} ready</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {docReadiness.map(doc => (
              <div key={doc.id} className={`px-3 py-2 rounded-lg text-xs border flex items-center gap-2 ${doc.ready ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-stone-50 text-stone-700'}`}>
                <CheckCircle size={12} className={doc.ready ? 'text-emerald-600' : 'text-stone-400'} />
                <span>{doc.label}</span>
              </div>
            ))}
          </div>
          {!docReadiness.some(d => d.ready) && (
            <div className="mt-2 text-[11px] text-amber-700">Add country, city, and partner to unlock.</div>
          )}
        </div>
      </nav>

      {/* AI Consultant (more space) */}
      <section className="p-5 border-t border-stone-100 bg-gradient-to-r from-blue-50 via-white to-blue-100 flex flex-col" style={{ minHeight: 180 }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-blue-500" />
          <span className="font-bold text-blue-900 text-sm">Live AI Consultant</span>
        </div>
        <div className="flex-1 overflow-y-auto max-h-40">
          <div className="text-xs text-blue-900/80">Ask questions or get guidance at any step. The AI consultant will provide context-aware help and suggestions here.</div>
        </div>
        <div className="mt-3 flex gap-2">
          <input className="flex-1 px-3 py-2 rounded-lg border border-blue-200 text-xs focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Ask the AI consultant..." />
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition">Send</button>
        </div>
      </section>
    </aside>
  );
};

export default LeftSidebar;
