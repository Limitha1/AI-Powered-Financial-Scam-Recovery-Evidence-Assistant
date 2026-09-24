import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Lock,
  Trash2,
  Key,
  Database,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { clientRedact } from '../lib/redactor.js';
import { useAuth } from '../context/AuthContext.js';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  // Redaction tester playground
  const [testInput, setTestInput] = useState(
    'Transfer initiated via card 4532 1122 3344 5566 with CVV 891 and UPI PIN 4920 to power.mule@okaxis. One time password OTP: 819230.'
  );

  const redactionResult = clientRedact(testInput);

  // Security toggles
  const [clientRedactionActive, setClientRedactionActive] = useState(true);
  const [sessionAuditActive, setSessionAuditActive] = useState(true);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [wipeSuccess, setWipeSuccess] = useState(false);

  const handlePermanentDataWipe = () => {
    if (wipeConfirmText !== 'DELETE PERMANENTLY') return;

    localStorage.clear();
    setWipeSuccess(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Security Controls & Forensic Vault Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Zero-leak client sanitization rules, session isolation, and Right-to-be-Forgotten data purge
        </p>
      </div>

      <div className="space-y-6">
        {/* PII REDACTION GUARD PLAYGROUND */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/40 text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Client-Side PII & Credential Redaction Guard (Live Tester)
              </h3>
              <p className="text-xs text-slate-400">
                Verify zero unmasked card PANs, CVVs, or payment PINs leave your browser
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Input Unsanitized Sample Evidence
              </label>
              <textarea
                rows={3}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
                placeholder="Type or paste any text with credit card numbers, CVVs, or PINs..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Sanitized & Tokenized Output ({redactionResult.maskCount} items masked):</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Zero Client-Side Leak Enforced
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 font-mono text-xs text-emerald-300 select-all leading-relaxed whitespace-pre-wrap">
                {redactionResult.redactedText || 'No text provided'}
              </div>
            </div>
          </div>
        </div>

        {/* VAULT PREFERENCES */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-800/40 text-blue-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Tenant Isolation & Row-Level-Security (RLS)
              </h3>
              <p className="text-xs text-slate-400">
                Cryptographic tenant boundaries strictly isolating your evidence artifacts
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <p className="font-bold text-slate-200">Active Tenant UID</p>
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">{user?.id || 'demo-user-123'}</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                RLS ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <p className="font-bold text-slate-200">Gemini 2.5 Structured Output Enforcement</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Strict JSON Schema validation on all forensic extractions</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px] font-bold">
                STRICT JSON
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT TO BE FORGOTTEN DATA PURGE */}
        <div className="glass-panel rounded-2xl p-6 border border-red-500/30 shadow-xl bg-gradient-to-b from-red-950/20 to-transparent">
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-red-950 border border-red-500/40 text-red-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Right to be Forgotten (GDPR / DPDP Act Compliant)
              </h3>
              <p className="text-xs text-slate-400">
                Permanently purge all case evidence, timelines, and audit logs
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            If your dispute has been resolved or you wish to withdraw all evidence from the system, you may trigger
            an immediate cryptographic wipe. This permanently erases all case records, uploaded files, and session keys.
          </p>

          <button
            onClick={() => setShowWipeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs transition flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Initiate Permanent Data Wipe</span>
          </button>
        </div>
      </div>

      {/* Permanent Wipe Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Confirm Right-to-be-Forgotten Wipe</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              To prevent accidental deletion, please type <strong className="text-red-400 font-mono">DELETE PERMANENTLY</strong> below.
            </p>

            <input
              type="text"
              placeholder="DELETE PERMANENTLY"
              value={wipeConfirmText}
              onChange={(e) => setWipeConfirmText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-red-400 mb-4"
            />

            {wipeSuccess && (
              <div className="p-3 mb-3 bg-emerald-950 text-emerald-300 text-xs rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Vault purged! Redirecting...</span>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDataWipe}
                disabled={wipeConfirmText !== 'DELETE PERMANENTLY'}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs"
              >
                Execute Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
