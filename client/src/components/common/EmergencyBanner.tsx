import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X, ExternalLink, ChevronRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showQuickFreezeModal, setShowQuickFreezeModal] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-b border-red-500/40 text-white px-4 py-2.5 text-sm shadow-lg relative z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-red-300" />
              <span className="font-bold text-red-200 uppercase tracking-wide text-xs">Active Crisis Alert:</span>
            </div>
            <span className="text-slate-100 hidden sm:inline">
              If an unauthorized debit just occurred, the first <strong>24 Hours</strong> are crucial for <strong>Zero-Liability</strong> recovery.
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="tel:1930"
              className="inline-flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold transition shadow-sm"
              title="Call National Cyber Crime Reporting Helpline"
            >
              <PhoneCall className="h-3.5 w-3.5 animate-bounce" />
              <span>Call 1930 (Helpline)</span>
            </a>

            <button
              onClick={() => setShowQuickFreezeModal(true)}
              className="inline-flex items-center space-x-1.5 bg-slate-900/80 hover:bg-slate-800 text-red-200 border border-red-500/30 px-3 py-1 rounded-md text-xs font-semibold transition"
            >
              <Lock className="h-3.5 w-3.5 text-red-400" />
              <span>Instant Freeze Guide</span>
              <ChevronRight className="h-3 w-3" />
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="text-red-300 hover:text-white p-1 transition"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Freeze Modal */}
      {showQuickFreezeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowQuickFreezeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency 1-Click Containment Steps</h3>
                <p className="text-xs text-slate-400">Perform these actions immediately to prevent further debits</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs sm:text-sm">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start space-x-3">
                <span className="bg-red-600/30 text-red-300 px-2 py-0.5 rounded font-mono font-bold text-xs mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-slate-200">Dial 1930 (National Cyber Crime Helpline)</p>
                  <p className="text-slate-400 text-xs mt-0.5">Report transaction UTR within 2 hours so police can dispatch automated freeze tokens to mule beneficiary banks.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start space-x-3">
                <span className="bg-red-600/30 text-red-300 px-2 py-0.5 rounded font-mono font-bold text-xs mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-slate-200">De-link UPI via USSD Code (*99#)</p>
                  <p className="text-slate-400 text-xs mt-0.5">Dial <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-400">*99*4#</code> from your registered SIM to disable all UPI services immediately.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-start space-x-3">
                <span className="bg-red-600/30 text-red-300 px-2 py-0.5 rounded font-mono font-bold text-xs mt-0.5">3</span>
                <div>
                  <p className="font-semibold text-slate-200">Call Bank Hotlines & Request Immediate Lien</p>
                  <p className="text-slate-400 text-xs mt-0.5">State: <em>"I want to dispute an unauthorized electronic transaction and request an immediate lien on the beneficiary account under RBI circular."</em></p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <Link
                to="/emergency"
                onClick={() => setShowQuickFreezeModal(false)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center space-x-1"
              >
                <span>Open Complete Emergency Guide</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button
                onClick={() => setShowQuickFreezeModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
