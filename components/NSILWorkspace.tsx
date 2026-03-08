import React, { useEffect } from 'react';
import { type ReportParameters, type ReportData, type GenerationPhase, type CopilotInsight } from '../types';

interface NSILWorkspaceProps {
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
  insights?: CopilotInsight[];
  autonomousMode?: boolean;
  autonomousSuggestions?: string[];
  isAutonomousThinking?: boolean;
  initialConsultantQuery?: string;
  onInitialConsultantQueryHandled?: () => void;
  initialContext?: { city: string; country: string; summary: string; profile: Record<string, unknown>; research: object | null } | null;
  onInitialContextHandled?: () => void;
}

/**
 * NSILWorkspace — redirects to Consultant OS.
 * The full workspace UI has been consolidated into BWConsultantOS.
 * If no redirect callback is available, shows a minimal message.
 */
const NSILWorkspace: React.FC<NSILWorkspaceProps> = ({ onChangeViewMode }) => {
  useEffect(() => {
    if (onChangeViewMode) onChangeViewMode('consultant-os');
  }, [onChangeViewMode]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Redirecting to BW Consultant&hellip;</h2>
        <p className="text-sm text-slate-500">The workspace has been consolidated into the Consultant OS.</p>
        {onChangeViewMode && (
          <button
            onClick={() => onChangeViewMode('consultant-os')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
          >
            Open Consultant OS
          </button>
        )}
      </div>
    </div>
  );
};

export default NSILWorkspace;
