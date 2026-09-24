import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Sparkles,
  Building,
  Shield,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { IncidentDossier } from '../../types/index.js';
import { api } from '../../lib/api.js';

interface DossierViewerProps {
  caseId: string;
  dossiers: IncidentDossier[];
  onDossierGenerated: () => void;
}

export const DossierViewer: React.FC<DossierViewerProps> = ({
  caseId,
  dossiers,
  onDossierGenerated
}) => {
  const [selectedType, setSelectedType] = useState<string>('BANK_FORMAL_DISPUTE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeDossier = dossiers.find((d) => d.dossier_type === selectedType);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await api.generateDossier(caseId);
      onDossierGenerated();
    } catch (err) {
      console.error('Failed to generate dossier:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await api.downloadDossierPdf(caseId);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = () => {
    if (activeDossier?.content_markdown) {
      navigator.clipboard.writeText(activeDossier.content_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Convert markdown bold, headers, and bullet lists to clean styled HTML safely
  const formatMarkdownPreview = (text: string) => {
    if (!text) return '';
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-cyan-300 mt-4 mb-2 pb-1 border-b border-slate-800">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-white mt-5 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-white mt-2 mb-3 pb-2 border-b border-slate-700">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-900 border border-slate-800 text-cyan-400 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>')
      .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-0.5">$1</li>')
      .replace(/\n\n/g, '<div class="h-3"></div>');

    return DOMPurify.sanitize(html);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Statutory Dispute Dossier & Legal Export
            </h3>
            <p className="text-xs text-slate-400">
              Formally structured for Bank Nodal Grievance Officers and National Cyber Crime Portals
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isGenerating ? 'Synthesizing Dossier...' : 'Synthesize / Re-generate Dossier'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading || dossiers.length === 0}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedType('BANK_FORMAL_DISPUTE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              selectedType === 'BANK_FORMAL_DISPUTE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Bank Dispute Notice (Zero-Liability)</span>
          </button>

          <button
            onClick={() => setSelectedType('CYBERCRIME_PORTAL_BRIEF')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
              selectedType === 'CYBERCRIME_PORTAL_BRIEF'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-red-400" />
            <span>Cybercrime Portal Brief (1930 / FIR)</span>
          </button>
        </div>

        {activeDossier && (
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Raw Markdown</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Dossier Document Sheet View */}
      {dossiers.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
          <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-300">No Dispute Dossier Synthesized</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Click "Synthesize / Re-generate Dossier" to draft your formal bank notice citing RBI Zero Liability and Cybercrime portal narrative.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-extrabold text-xs"
          >
            Generate Dispute Dossier Now
          </button>
        </div>
      ) : activeDossier ? (
        <div className="bg-slate-950 rounded-xl p-6 border border-slate-800/80 shadow-inner font-sans text-xs text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto">
          <div
            dangerouslySetInnerHTML={{
              __html: formatMarkdownPreview(activeDossier.content_markdown)
            }}
          />
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 text-xs">
          Select a dossier tab above to inspect document contents.
        </div>
      )}
    </div>
  );
};
