import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Clock,
  FileCheck,
  AlertTriangle,
  Sparkles,
  Download,
  ArrowLeft,
  LifeBuoy,
  RefreshCw,
  FolderLock,
  Layers,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { FullCaseDetails, WorkspaceTab } from '../types/index.js';
import { api } from '../lib/api.js';
import { EvidenceUploadDropzone } from '../components/evidence/EvidenceUploadDropzone.js';
import { EvidenceCard } from '../components/evidence/EvidenceCard.js';
import { ForensicTimelineView } from '../components/timeline/ForensicTimelineView.js';
import { TransactionTable } from '../components/timeline/TransactionTable.js';
import { DossierViewer } from '../components/dossier/DossierViewer.js';
import { RecoveryActionChecklist } from '../components/dossier/RecoveryActionChecklist.js';

export const CaseWorkspace: React.FC = () => {
  const { id: caseId } = useParams<{ id: string }>();

  const [caseDetails, setCaseDetails] = useState<FullCaseDetails | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('evidence');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchCase = async () => {
    if (!caseId) return;
    try {
      const data = await api.getCaseById(caseId);
      setCaseDetails(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load case data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const handleRunAIAnalysis = async () => {
    if (!caseId) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await api.analyzeEvidence(caseId);
      showToast('Gemini 2.5 Flash Forensic Extraction Complete! Transactions Reconciled.');
      await fetchCase();
      setActiveTab('timeline');
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!caseId) return;
    try {
      await api.deleteEvidence(caseId, evidenceId);
      showToast('Evidence artifact removed.');
      fetchCase();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 text-xs font-mono">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-cyan-400" />
        <span>Decrypting and loading incident vault...</span>
      </div>
    );
  }

  if (!caseDetails || !caseDetails.case) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Incident Vault Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested case file is unavailable or access was denied.
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-slate-800 text-cyan-400 text-xs font-bold inline-flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const { case: fraudCase, evidence, transactions, timeline, dossiers } = caseDetails;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-cyan-950 border border-cyan-500/60 text-cyan-200 text-xs font-bold flex items-center space-x-2 shadow-2xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Back button & Navigation Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link
          to="/dashboard"
          className="text-xs text-slate-400 hover:text-slate-200 font-semibold flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Cases Ledger</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to="/emergency"
            className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition flex items-center space-x-1.5"
          >
            <LifeBuoy className="h-3.5 w-3.5 text-red-400" />
            <span>Emergency Containment</span>
          </Link>
        </div>
      </div>

      {/* CASE MASTER TITLE BANNER */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                CASE #{fraudCase.id.slice(0, 8)}
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                Rail: {fraudCase.primary_payment_rail}
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                {fraudCase.scam_type.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                STATUS: {fraudCase.status}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {fraudCase.title}
            </h1>

            {fraudCase.ai_summary && (
              <p className="text-xs text-slate-300 mt-2 font-sans bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                <strong className="text-cyan-400 font-mono">Forensic Summary:</strong> {fraudCase.ai_summary}
              </p>
            )}
          </div>

          {/* Loss & Action Header Cards */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-right min-w-[140px]">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Disputed Loss</span>
              <span className="text-xl font-extrabold text-red-400 font-mono block">
                ₹{fraudCase.total_financial_loss.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {transactions.length} Reconciled Txns
              </span>
            </div>

            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing || evidence.length === 0}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isAnalyzing ? 'Extracting with Gemini 2.5...' : 'Run AI Forensic Extraction'}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 WORKSPACE TABS */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'evidence'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FolderLock className="h-4 w-4" />
          <span>Tab 1: Evidence Locker ({evidence.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'timeline'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Tab 2: Forensic Timeline ({timeline.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'dossier'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Tab 3: Dispute Dossier ({dossiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'recovery'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Tab 4: Containment Tracker</span>
        </button>
      </div>

      {/* TAB 1: EVIDENCE LOCKER */}
      {activeTab === 'evidence' && (
        <div>
          <EvidenceUploadDropzone caseId={fraudCase.id} onEvidenceAdded={fetchCase} />

          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Cataloged Digital Artifacts ({evidence.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Encrypted in Evidence Vault
              </span>
            </div>

            {evidence.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No artifacts cataloged yet. Paste raw SMS alerts or upload screenshots above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidence.map((art) => (
                  <EvidenceCard key={art.id} artifact={art} onDelete={handleDeleteEvidence} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FORENSIC TIMELINE & TRANSACTIONS */}
      {activeTab === 'timeline' && (
        <div>
          <TransactionTable
            caseId={fraudCase.id}
            transactions={transactions}
            onTransactionAdded={fetchCase}
          />

          <ForensicTimelineView
            caseId={fraudCase.id}
            timeline={timeline}
            onTimelineUpdated={fetchCase}
          />
        </div>
      )}

      {/* TAB 3: DISPUTE DOSSIER */}
      {activeTab === 'dossier' && (
        <DossierViewer
          caseId={fraudCase.id}
          dossiers={dossiers}
          onDossierGenerated={fetchCase}
        />
      )}

      {/* TAB 4: CONTAINMENT & RECOVERY TRACKER */}
      {activeTab === 'recovery' && (
        <RecoveryActionChecklist
          incidentStartTime={fraudCase.incident_start_time}
          checklist={(dossiers[0]?.generated_json as any)?.checklist}
        />
      )}
    </div>
  );
};
