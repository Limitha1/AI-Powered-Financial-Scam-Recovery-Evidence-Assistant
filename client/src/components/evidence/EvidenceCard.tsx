import React, { useState } from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  Mail,
  Smartphone,
  FileSpreadsheet,
  AlertOctagon,
  Copy,
  Check,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { EvidenceArtifact, EvidenceType } from '../../types/index.js';

interface EvidenceCardProps {
  artifact: EvidenceArtifact;
  onDelete: (id: string) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ artifact, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const getArtifactIcon = (type: EvidenceType) => {
    switch (type) {
      case 'BANK_SMS':
        return <Smartphone className="h-4 w-4 text-cyan-400" />;
      case 'TRANSACTION_SCREENSHOT':
        return <ImageIcon className="h-4 w-4 text-blue-400" />;
      case 'CHAT_TRANSCRIPT':
        return <MessageSquare className="h-4 w-4 text-emerald-400" />;
      case 'EMAIL_RECEIPT':
        return <Mail className="h-4 w-4 text-purple-400" />;
      case 'BANK_STATEMENT_PDF':
        return <FileSpreadsheet className="h-4 w-4 text-amber-400" />;
      default:
        return <AlertOctagon className="h-4 w-4 text-rose-400" />;
    }
  };

  const copyContent = () => {
    if (artifact.raw_text_content) {
      navigator.clipboard.writeText(artifact.raw_text_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(artifact.created_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="glass-card rounded-xl p-4 transition duration-200 hover:border-slate-700 relative group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            {getArtifactIcon(artifact.artifact_type)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-200">
                {artifact.artifact_type.replace(/_/g, ' ')}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                {artifact.source_identifier || 'Unknown Source'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
          <button
            onClick={copyContent}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Copy Text"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => onDelete(artifact.id)}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
            title="Delete Artifact"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-900 font-mono text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
        {artifact.raw_text_content || 'No text extracted.'}
      </div>

      {/* Footer Indicators */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-1.5 text-emerald-400/90 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>PII Sanitized & Tokenized</span>
        </div>
        {artifact.file_size_bytes && (
          <span className="font-mono">{(artifact.file_size_bytes / 1024).toFixed(1)} KB</span>
        )}
      </div>
    </div>
  );
};
