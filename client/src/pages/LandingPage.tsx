import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  LifeBuoy,
  Lock,
  ArrowRight,
  FileCheck2,
  Clock,
  Cpu,
  FileSearch,
  AlertTriangle,
  ChevronRight,
  PhoneCall,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { SCAM_TAXONOMY_DETAILS, ScamType } from '../types/index.js';

export const LandingPage: React.FC = () => {
  const scamEntries = Object.entries(SCAM_TAXONOMY_DETAILS) as [ScamType, typeof SCAM_TAXONOMY_DETAILS[ScamType]][];

  return (
    <div className="relative overflow-hidden">
      {/* Glow Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-red-600/10 blur-[110px] rounded-full pointer-events-none -z-10"></div>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-300 mb-6 shadow-glow-cyan animate-pulse-slow">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="font-semibold text-cyan-300">Statutory FinTech Recovery Engine</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Powered by Gemini 2.5 Flash Forensics</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Recover Stolen Funds.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Synthesize Audit-Ready
          </span>{' '}
          Dispute Dossiers.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          ShieldTrace AI ingests fragmented bank SMS alerts, WhatsApp transcripts, payment UTRs, and screenshots.
          Using Gemini structured outputs, it reconstructs an immutable forensic timeline and generates formal dispute
          notices citing RBI Zero-Liability regulations for banks and cybercrime police portals.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/cases/new"
            className="px-7 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm transition flex items-center space-x-2 shadow-xl shadow-cyan-500/25 group"
          >
            <span>Report Active Fraud Incident</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/emergency"
            className="px-7 py-3.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 font-bold text-sm transition flex items-center space-x-2 shadow-xl shadow-red-950/40"
          >
            <LifeBuoy className="h-4 w-4 text-red-400" />
            <span>Emergency 1-Click Freeze Guide</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-2xl font-black text-white font-mono block">24 Hours</span>
            <span className="text-xs text-slate-400">RBI Zero-Liability Window</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-2xl font-black text-cyan-400 font-mono block">1930</span>
            <span className="text-xs text-slate-400">Direct National Helpline</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-2xl font-black text-emerald-400 font-mono block">100% Client-Side</span>
            <span className="text-xs text-slate-400">Zero-Leak PII Masking</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-2xl font-black text-indigo-400 font-mono block">Court & Bank</span>
            <span className="text-xs text-slate-400">Admissible PDF Dossiers</span>
          </div>
        </div>
      </section>

      {/* CORE WORKFLOW HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 font-mono">
            Forensic Workflow Pipeline
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            From Fragmented Chat Dumps to Statutory Restitution
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">1. Ingest & Redact</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste SMS alerts, WhatsApp logs, or screenshots. Full 16-digit card PANs and PINs are masked client-side before any upload.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">2. Gemini 2.5 Extraction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts exact 12-digit UTRs, destination VPAs, mule accounts, phone numbers, and malicious APK names with zero hallucination.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">3. Minute-by-Minute Timeline</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reconstructs initial contact, psychological manipulation, APK credential harvesting, and unauthorized fund transfers.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">4. Official Dispute Dossier</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exports formal Bank Dispute Notice under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18 plus Cybercrime Portal FIR briefs as PDF.
            </p>
          </div>
        </div>
      </section>

      {/* FRAUD TAXONOMY MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 font-mono">
            Supported Fraud Typologies
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tailored Dispute Blueprints for High-Frequency Scams
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scamEntries.map(([key, item]) => (
            <div key={key} className="glass-card rounded-2xl p-5 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300 font-mono">{item.name}</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{key.split('_')[0]}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{item.description}</p>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 mb-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Common Signals:</span>
                <ul className="text-[11px] text-slate-300 space-y-0.5">
                  {item.commonIndicators.slice(0, 2).map((sig, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-cyan-500">•</span>
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-emerald-400 font-medium flex items-start space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{item.priorityAction}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EMERGENCY CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border border-red-500/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-red-900/60 text-red-300 text-xs font-mono font-bold inline-flex items-center space-x-1.5 mb-4">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span>Time is Critical</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Act within the 24-Hour Zero-Liability Dispute Window
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
              Central banking circulars require prompt reporting to prevent customer liability. Begin your evidence
              intake or follow our immediate emergency freeze protocol right now.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/cases/new"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition shadow-lg shadow-cyan-500/20"
              >
                Start New Recovery Case
              </Link>
              <Link
                to="/emergency"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition"
              >
                View Emergency Hotline Codes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
