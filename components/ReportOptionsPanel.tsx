/**
 * REPORT OPTIONS PANEL — Compact inline suggestion (ChatGPT-style)
 *
 * Renders as a slim card inside the chat flow.  Shows the recommended tier
 * with a one-click Generate button.  "View more options" expands to reveal
 * all tiers, additional reports, ideas, and letters without a heavy modal.
 */

import React, { useState } from 'react';
import {
  FileText,
  Lightbulb,
  Mail,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Zap,
  Download,
  X,
} from 'lucide-react';
import type { ReportOptionsMenu, ReportTierKey } from '../services/ReportLengthRouter';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ReportOptionsPanelProps {
  menu: ReportOptionsMenu;
  documentTitle: string;
  documentType: string;
  onSelectTier: (tierKey: ReportTierKey, includeAnnotation: boolean) => void;
  onAddReport: (reportId: string, title: string) => void;
  onAddLetter: (letterId: string, title: string) => void;
  onGenerateAnnotatedPDF: () => void;
  onDismiss: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ReportOptionsPanel: React.FC<ReportOptionsPanelProps> = ({
  menu,
  documentTitle,
  documentType,
  onSelectTier,
  onAddReport,
  onAddLetter,
  onGenerateAnnotatedPDF,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedTier, setSelectedTier] = useState<ReportTierKey>(menu.recommendedTier);
  const [includeAnnotation, setIncludeAnnotation] = useState(false);
  const [addedReports, setAddedReports] = useState<Set<string>>(new Set());
  const [addedLetters, setAddedLetters] = useState<Set<string>>(new Set());

  const { diagnostics } = menu;
  const recommended = menu.tiers.find(t => t.recommended) ?? menu.tiers[0];
  const otherTiers = menu.tiers.filter(t => t.key !== recommended?.key);
  const selectedTierObj = menu.tiers.find(t => t.key === selectedTier) ?? recommended;

  const handleAddReport = (id: string, title: string) => {
    setAddedReports(prev => new Set([...prev, id]));
    onAddReport(id, title);
  };
  const handleAddLetter = (id: string, title: string) => {
    setAddedLetters(prev => new Set([...prev, id]));
    onAddLetter(id, title);
  };

  // ── Compact view (default) ────────────────────────────────────────────────

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden transition-all">

      {/* ── Inline header row ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
          <FileText size={15} className="text-stone-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-stone-800 truncate">{documentTitle}</div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
            <span>{documentType}</span>
            <span>·</span>
            <span>~{diagnostics.sourcePageEstimate} pg</span>
            <span>·</span>
            <span>{diagnostics.complexityScore}/100 complexity</span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-stone-300 hover:text-stone-500 transition-colors p-1 rounded-full hover:bg-stone-100"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Recommended tier — one-click generate ── */}
      <div className="px-4 pb-3">
        <div className="text-[11px] text-stone-400 mb-2">
          Recommended based on {diagnostics.sourcePageEstimate}-page source &amp; {diagnostics.complexityScore}/100 complexity
        </div>

        <button
          className="w-full flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 p-3 text-left transition-colors group"
          onClick={() => onSelectTier(recommended.key, includeAnnotation)}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-stone-800">{recommended.label}</div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              {recommended.pageRange} pages · {recommended.wordRange} words · {recommended.sectionCount} sections · {recommended.turnaround}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-600 group-hover:text-amber-700 whitespace-nowrap">
            Generate
          </span>
        </button>

        {/* ── Annotated PDF toggle inline ── */}
        <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
          <button
            type="button"
            className={`w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-all ${
              includeAnnotation ? 'bg-blue-600 border-blue-600' : 'border-stone-300 bg-white'
            }`}
            onClick={() => setIncludeAnnotation(v => !v)}
          >
            {includeAnnotation && <CheckCircle size={8} className="text-white" />}
          </button>
          <span className="text-[11px] text-stone-500">Include annotated source PDF</span>
        </label>

        {/* ── Expand / collapse toggle ── */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-stone-400 hover:text-stone-600 transition-colors py-1"
        >
          {expanded ? (
            <>Less options <ChevronUp size={12} /></>
          ) : (
            <>View {otherTiers.length} more options · {menu.additionalReports.length} reports · {menu.letters.length} letters <ChevronDown size={12} /></>
          )}
        </button>
      </div>

      {/* ── Expanded detail panel ── */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 space-y-3 max-h-80 overflow-y-auto">

          {/* Other tier options */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Other formats</div>
            {otherTiers.map(tier => {
              const isSel = selectedTier === tier.key;
              return (
                <button
                  key={tier.key}
                  className={`w-full flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
                    isSel ? 'border-amber-400 bg-amber-50' : 'border-stone-150 bg-white hover:bg-stone-50'
                  }`}
                  onClick={() => setSelectedTier(tier.key)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-stone-700">{tier.label}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {tier.pageRange} pg · {tier.wordRange} words · {tier.turnaround}
                    </div>
                  </div>
                  {isSel && (
                    <span
                      className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap cursor-pointer"
                      onClick={e => { e.stopPropagation(); onSelectTier(tier.key, includeAnnotation); }}
                    >
                      Generate
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Selected tier detail ── */}
          {selectedTierObj && selectedTier !== recommended.key && (
            <div className="bg-stone-50 rounded-lg p-2.5">
              <div className="text-[10px] text-stone-500 leading-relaxed">{selectedTierObj.description}</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {selectedTierObj.sections.map(s => (
                  <span key={s} className="text-[9px] bg-white border border-stone-200 text-stone-500 px-1.5 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>
              <button
                className="mt-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-1.5 px-3 font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                onClick={() => onSelectTier(selectedTier, includeAnnotation)}
              >
                <Zap size={11} />
                Generate {selectedTierObj.label}
              </button>
            </div>
          )}

          {/* ── Additional reports ── */}
          {menu.additionalReports.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Additional reports</div>
              {menu.additionalReports.map(report => {
                const isAdded = addedReports.has(report.id);
                return (
                  <div key={report.id} className="flex items-center gap-2.5 py-1.5">
                    <FileText size={12} className="text-stone-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-stone-700 truncate">{report.title}</div>
                      <div className="text-[10px] text-stone-400">{report.pages}</div>
                    </div>
                    {isAdded ? (
                      <span className="text-[10px] text-green-600 font-medium">Added</span>
                    ) : (
                      <button
                        className="text-[10px] font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-md px-2 py-0.5 hover:bg-stone-50 transition-colors"
                        onClick={() => handleAddReport(report.id, report.title)}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Unconventional ideas ── */}
          {menu.unconventionalIdeas.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide flex items-center gap-1">
                <Lightbulb size={10} className="text-amber-500" /> Bold ideas
              </div>
              {menu.unconventionalIdeas.map(idea => (
                <div key={idea.id} className="flex items-center gap-2.5 py-1.5">
                  <Lightbulb size={12} className="text-amber-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-stone-700 truncate">{idea.title}</div>
                    <div className="text-[10px] text-stone-400 truncate">{idea.concept}</div>
                  </div>
                  <button
                    className="text-[10px] font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-md px-2 py-0.5 hover:bg-stone-50 transition-colors"
                    onClick={() => handleAddReport(idea.id, idea.title)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Letters ── */}
          {menu.letters.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Letters</div>
              {menu.letters.map(letter => {
                const isAdded = addedLetters.has(letter.id);
                return (
                  <div key={letter.id} className="flex items-center gap-2.5 py-1.5">
                    <Mail size={12} className="text-stone-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-stone-700 truncate">{letter.title}</div>
                      <div className="text-[10px] text-stone-400 truncate">To: {letter.addressedTo} · {letter.pages}</div>
                    </div>
                    {isAdded ? (
                      <span className="text-[10px] text-green-600 font-medium">Added</span>
                    ) : (
                      <button
                        className="text-[10px] font-medium text-stone-500 hover:text-stone-700 border border-stone-200 rounded-md px-2 py-0.5 hover:bg-stone-50 transition-colors"
                        onClick={() => handleAddLetter(letter.id, letter.title)}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Annotated PDF standalone action ── */}
          <button
            className="w-full flex items-center gap-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 p-2.5 text-left transition-colors"
            onClick={onGenerateAnnotatedPDF}
          >
            <Download size={13} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-stone-700">Download Annotated Source PDF</div>
              <div className="text-[10px] text-stone-400">Highlighted passages with analysis callouts</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportOptionsPanel;
