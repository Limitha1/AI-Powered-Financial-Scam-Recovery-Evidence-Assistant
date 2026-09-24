import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  Trash2,
  DollarSign,
  Activity,
  Layers,
  LifeBuoy
} from 'lucide-react';
import { FraudCase, IncidentStatus } from '../types/index.js';
import { api } from '../lib/api.js';

export const Dashboard: React.FC = () => {
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleDelete = async (caseId: string) => {
    try {
      await api.deleteCase(caseId);
      setDeleteConfirmId(null);
      fetchCases();
    } catch (err) {
      console.error('Failed to delete case:', err);
    }
  };

  // Metrics
  const totalLoss = cases.reduce((acc, c) => acc + (c.total_financial_loss || 0), 0);
  const activeCasesCount = cases.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const readyDossiersCount = cases.filter((c) => c.status === 'DOSSIER_GENERATED' || c.status === 'TIMELINE_READY').length;

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'ANALYZING':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse';
      case 'TIMELINE_READY':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'DOSSIER_GENERATED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'FILED_WITH_BANK':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Incident Workspace & Case Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active forensic recovery pipelines, transactional discrepancy ledgers, and statutory dispute packets
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/emergency"
            className="px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-bold transition flex items-center space-x-2"
          >
            <LifeBuoy className="h-4 w-4 text-red-400" />
            <span>Emergency Freeze</span>
          </Link>

          <Link
            to="/cases/new"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Report New Fraud Case</span>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Total Disputed Loss</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono block">
            ₹{totalLoss.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-red-400/90 mt-1 block">
            Subject to Statutory Zero-Liability claims
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Active Fraud Cases</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-cyan-400 font-mono block">
            {activeCasesCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Ongoing forensic evidence reconciliation
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Ready Dispute Packets</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-400 font-mono block">
            {readyDossiersCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Bank dispute letters & cyber briefs synthesized
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Statutory Windows</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-400 font-mono block">
            24H / 72H
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            RBI & NCRP complaint action windows
          </span>
        </div>
      </div>

      {/* CASES LIST */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                Recorded Incident Vaults
              </h2>
              <p className="text-xs text-slate-400">
                Click on any case to review evidence artifacts, edit the forensic timeline, and download PDFs
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Loading incident records...
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-300">No Incident Cases Recorded</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Create your first case session to catalog fraudulent SMS, WhatsApp chats, and transaction UTRs.
            </p>
            <Link
              to="/cases/new"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs inline-flex items-center space-x-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Report First Incident</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <div
                key={c.id}
                className="glass-card-hover rounded-xl p-5 border border-slate-800/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                      Rail: {c.primary_payment_rail}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">
                      {c.scam_type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-sans">
                    {c.ai_summary || c.victim_narrative || 'Evidence analysis pending.'}
                  </p>

                  <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-500 font-mono">
                    <span>Loss: <strong className="text-red-400">₹{c.total_financial_loss.toLocaleString('en-IN')}</strong></span>
                    <span>•</span>
                    <span>Date: {new Date(c.incident_start_time || c.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => setDeleteConfirmId(c.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition"
                    title="Delete Case (Right to be Forgotten)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    to={`/cases/${c.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black text-cyan-300 text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Permanently Delete Case File?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              In compliance with the <strong>Right to be Forgotten</strong>, this action will immediately and
              cryptographically purge all evidence artifacts, reconstructed timeline milestones, and dispute letters.
              This cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Permanent Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
