import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Lock, ShieldCheck, AlertCircle, Sparkles, Plus } from 'lucide-react';
import { EvidenceType } from '../../types/index.js';
import { clientRedact } from '../../lib/redactor.js';
import { api } from '../../lib/api.js';

interface EvidenceUploadDropzoneProps {
  caseId: string;
  onEvidenceAdded: () => void;
}

export const EvidenceUploadDropzone: React.FC<EvidenceUploadDropzoneProps> = ({
  caseId,
  onEvidenceAdded
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [artifactType, setArtifactType] = useState<EvidenceType>('BANK_SMS');
  const [sourceIdentifier, setSourceIdentifier] = useState('');
  const [rawText, setRawText] = useState('');
  const [enableClientRedaction, setEnableClientRedaction] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Real-time client-side redaction preview
  const redactionPreview = clientRedact(rawText);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const textToSubmit = enableClientRedaction ? redactionPreview.redactedText : rawText;

      await api.ingestTextEvidence(caseId, {
        artifact_type: artifactType as any,
        source_identifier: sourceIdentifier.trim() || 'Direct Input',
        raw_text_content: textToSubmit
      });

      setRawText('');
      setSourceIdentifier('');
      onEvidenceAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to ingest evidence artifact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('artifact_type', artifactType);
      formData.append('source_identifier', sourceIdentifier.trim() || selectedFile.name);

      await api.uploadEvidenceFile(caseId, formData);

      setSelectedFile(null);
      setSourceIdentifier('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onEvidenceAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload evidence file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setExampleSMS = () => {
    setArtifactType('BANK_SMS');
    setSourceIdentifier('VK-HDFCBK');
    setRawText('Dear Customer, your A/c ending with XX4102 has been debited for Rs 25,000.00 on 24-Sep-24 via UPI. Ref UTR: 429817294812. Transferred to refund.discom@okaxis. Card PAN 4532 9812 7612 1234. If unauthorized call 18002586161.');
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'text'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Paste Raw Text / SMS / Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'file'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Screenshot / PDF Statement</span>
          </button>
        </div>

        {activeTab === 'text' && (
          <button
            type="button"
            onClick={setExampleSMS}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline underline-offset-4 font-mono"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Example Bank Alert</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TEXT INGESTION FORM */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Artifact Category
              </label>
              <select
                value={artifactType}
                onChange={(e) => setArtifactType(e.target.value as EvidenceType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="BANK_SMS">Bank Debit SMS Notification</option>
                <option value="CHAT_TRANSCRIPT">WhatsApp / Telegram Transcript</option>
                <option value="EMAIL_RECEIPT">Bank / Gateway Email Receipt</option>
                <option value="CALL_RECORDING_METADATA">Call Metadata / Voice Log</option>
                <option value="MALICIOUS_APP_INFO">Malicious APK / Remote Tool Info</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sender / Source Identifier
              </label>
              <input
                type="text"
                placeholder="e.g. VK-HDFCBK or +91-9876543210 or scammer@upi"
                value={sourceIdentifier}
                onChange={(e) => setSourceIdentifier(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Raw Evidence Text Content
              </label>

              {/* Client-Side Redaction Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={enableClientRedaction}
                  onChange={(e) => setEnableClientRedaction(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                  <Lock className="h-3 w-3" />
                  <span>Client-Side PII Masking: {enableClientRedaction ? 'Active' : 'Off'}</span>
                </span>
              </label>
            </div>

            <textarea
              rows={4}
              placeholder="Paste raw SMS message, WhatsApp message dump, or email headers here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed resize-y"
              required
            />
          </div>

          {/* Live Redaction Preview Guard */}
          {enableClientRedaction && redactionPreview.hasSensitiveData && (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero-Leak Redaction Preview ({redactionPreview.maskCount} sensitive items masked)</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Card numbers, PINs, and CVVs are masked in your browser before submission to Gemini or the server:
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-900 font-mono text-[11px] text-emerald-300 select-all whitespace-pre-wrap">
                {redactionPreview.redactedText}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !rawText.trim()}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Cataloging Artifact...' : 'Catalog Evidence Artifact'}</span>
            </button>
          </div>
        </form>
      )}

      {/* FILE UPLOAD FORM */}
      {activeTab === 'file' && (
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Artifact Category
              </label>
              <select
                value={artifactType}
                onChange={(e) => setArtifactType(e.target.value as EvidenceType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="TRANSACTION_SCREENSHOT">Payment App Screenshot (GPay/PhonePe)</option>
                <option value="BANK_STATEMENT_PDF">Bank Statement (PDF / Image)</option>
                <option value="CHAT_TRANSCRIPT">Chat Screenshot / APK Receipt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Source Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. PhonePe Debit Screenshot"
                value={sourceIdentifier}
                onChange={(e) => setSourceIdentifier(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setSelectedFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
              dragOver
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
            />

            <UploadCloud className="h-10 w-10 text-cyan-400 mx-auto mb-3" />
            {selectedFile ? (
              <div>
                <p className="text-xs font-bold text-slate-200">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB — Click to change file
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-300">
                  Click or drag and drop transaction screenshots or PDF statements
                </p>
                <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or PDF (Max 25 MB)</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{isSubmitting ? 'Uploading & Encrypting...' : 'Upload Evidence File'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
