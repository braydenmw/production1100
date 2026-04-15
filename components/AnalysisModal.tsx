import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { generateAnalysisStream } from '../services/geminiService';
import type { LiveOpportunityItem } from '../types';
import { X, Download, LayoutGrid, Loader2 } from 'lucide-react';

interface AnalysisModalProps {
  item: LiveOpportunityItem;
  region: string;
  onClose: () => void;
}

interface ParsedAnalysis {
    title: string;
    subtitle: string;
    sections: { title: string; content: string[] }[];
}

const parseNADL = (nadlString: string): ParsedAnalysis | null => {
    if (!nadlString) return null;

    const titleMatch = nadlString.match(/<nad:report_title title="(.*?)" \/>/);
    const subtitleMatch = nadlString.match(/<nad:report_subtitle subtitle="(.*?)" \/>/);
    
    const sections: { title: string; content: string[] }[] = [];
    const sectionRegex = /<nad:section title="(.*?)">([\s\S]*?)<\/nad:section>/g;
    let match;
    while ((match = sectionRegex.exec(nadlString)) !== null) {
        const sectionTitle = match[1];
        const sectionContent = match[2];
        const paragraphs = (sectionContent.match(/<(nad:paragraph|nad:recommendation)>(.*?)<\/\1>/g) || [])
            .map(p => p.replace(/<[^>]+>/g, '').trim());
        
        sections.push({ title: sectionTitle, content: paragraphs });
    }

    if (!titleMatch || sections.length === 0) return null;

    return {
        title: titleMatch[1],
        subtitle: subtitleMatch ? subtitleMatch[1] : '',
        sections: sections,
    };
};

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ item, region, onClose }) => {
  const [reportText, setReportText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const generateReport = async () => {
      setIsLoading(true);
      setError(null);
      setReportText('');
      try {
        const stream = await generateAnalysisStream(item, region);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            setReportText((prev) => prev + decoder.decode(value, { stream: true }));
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to generate analysis: ${errorMessage}`);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    generateReport();
  }, [item, region]);

  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('analysis-report-content');
    if (!reportElement) return;

    setIsDownloading(true);
    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2,
            backgroundColor: '#ffffff', // Match the document background
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        pdf.save(`Nexus-Analysis-${item.project_name.replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
        console.error("Failed to generate PDF", e);
        setError("PDF generation failed. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  const parsedReport = useMemo(() => parseNADL(reportText), [reportText]);

  const renderContent = () => {
      if (isLoading && !parsedReport) {
          return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-stone-500 gap-4">
              <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
              <div className="text-center">
                  <h3 className="text-lg font-bold text-stone-800">Constructing Deep-Dive Analysis</h3>
                  <p className="text-sm">Synthesizing {item.project_name} context...</p>
              </div>
            </div>
          );
      }

      if (error) {
          return (
              <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100 m-8">
                  <h3 className="font-bold text-lg mb-2">Analysis Generation Failed</h3>
                  <p className="text-sm">{error}</p>
              </div>
          );
      }
      
      if (!parsedReport) {
          return (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                  <Loader2 className="animate-spin text-stone-400" />
              </div>
          );
      }

      return (
          <div id="analysis-report-content" className="report-document p-12 sm:p-16 mx-auto bg-white max-w-4xl shadow-sm border border-stone-100 min-h-[800px]">
              <header className="text-center border-b-2 border-stone-900 pb-8 mb-8">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Nexus Confidential</div>
                  <h1 className="text-4xl font-black font-serif text-stone-900 mb-2">{parsedReport.title}</h1>
                  {parsedReport.subtitle && <p className="text-xl text-stone-500 font-light italic">{parsedReport.subtitle}</p>}
              </header>
              
              <main className="space-y-8">
                  {parsedReport.sections.map((section, index) => (
                      <section key={index}>
                          <h2 className="text-lg font-bold text-stone-900 mb-4 uppercase tracking-wide border-l-4 border-blue-500 pl-4">{section.title}</h2>
                          <div className="space-y-4 text-stone-700 leading-relaxed text-justify">
                              {section.content.map((p, pIndex) => (
                                  <p key={pIndex} className={p.length < 100 ? "font-bold text-stone-900 bg-stone-50 p-3 rounded border border-stone-200" : ""}>{p}</p>
                              ))}
                          </div>
                      </section>
                  ))}
              </main>

              <footer className="mt-16 pt-8 border-t border-stone-200 text-center text-[10px] text-stone-400 font-mono uppercase tracking-widest">
                  <p>VERDIX | Generated on {new Date().toLocaleDateString()}</p>
              </footer>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col border border-stone-700 overflow-hidden">
        
        {/* Header */}
        <header className="p-4 flex justify-between items-center border-b border-stone-200 bg-white shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center shadow-lg">
                <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">Nexus Deep-Dive</h2>
              <p className="text-xs text-stone-500 font-mono uppercase tracking-wide">Target: {item.project_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {parsedReport && (
                 <button 
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-blue-50 text-stone-600 hover:text-blue-600 rounded-lg font-bold text-xs transition-colors"
                 >
                    {isDownloading ? <Loader2 className="animate-spin w-4 h-4"/> : <Download className="w-4 h-4"/>}
                    Export PDF
                 </button>
             )}
             <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors">
                <X className="w-6 h-6"/>
             </button>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-stone-100/50 p-6 custom-scrollbar">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};
