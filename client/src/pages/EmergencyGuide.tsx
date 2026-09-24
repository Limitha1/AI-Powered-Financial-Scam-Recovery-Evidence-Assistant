import React from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy,
  PhoneCall,
  Smartphone,
  CreditCard,
  Lock,
  AlertTriangle,
  ShieldCheck,
  Building,
  Terminal,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

export const EmergencyGuide: React.FC = () => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const ussdGuides = [
    {
      title: "Universal UPI Block (*99#)",
      code: "*99*4#",
      instruction: "Dial *99*4# from the SIM registered with your bank. Select 'Disable UPI' to freeze all UPI transactions immediately across Google Pay, PhonePe, Paytm, and BHIM.",
      rail: "All Indian Banks / NPCI"
    },
    {
      title: "USSD Bank Account Freeze",
      code: "*99#",
      instruction: "Dial *99# -> Enter 3-digit bank code (e.g. HDF for HDFC, SBI for State Bank) -> Security Options -> Temporary Block.",
      rail: "Feature Phones & Smartphones"
    }
  ];

  const bankSmsBlock = [
    { bank: "HDFC Bank", syntax: "BLOCK <Last 4 digits of Card>", sendTo: "5676712", tollfree: "1800 258 6161" },
    { bank: "State Bank of India (SBI)", syntax: "BLOCK <Last 4 digits of Card>", sendTo: "567676", tollfree: "1800 1234 / 1800 2100" },
    { bank: "ICICI Bank", syntax: "BLOCK <Last 4 digits of Card>", sendTo: "5676766", tollfree: "1800 1080" },
    { bank: "Axis Bank", syntax: "BLOCKCARD <Last 4 digits of Card>", sendTo: "5676782", tollfree: "1860 419 5555" },
    { bank: "Kotak Mahindra Bank", syntax: "KBLOCK <Last 4 digits of Card>", sendTo: "9971056767", tollfree: "1860 266 2666" },
    { bank: "Punjab National Bank", syntax: "HOT <Last 4 digits of Card>", sendTo: "5607040", tollfree: "1800 180 2222" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-xs text-red-300 mb-4 font-mono">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
          <span>Active Incident Containment</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
          Emergency Financial Scam Freeze Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Follow these immediate USSD codes, SMS syntax, and toll-free hotlines to halt unauthorized fund siphoning,
          revoke remote access, and establish statutory Zero-Liability defense within the 24-hour window.
        </p>
      </div>

      {/* STEP 1: NATIONAL CYBERCRIME EMERGENCY LINE */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border border-red-500/50 shadow-2xl mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              <PhoneCall className="h-7 w-7 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-red-400 font-bold block">
                Primary National Incident Hotline
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Dial 1930 (Cyber Crime Helpline)
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Operated by the Ministry of Home Affairs (MHA) & I4C. Calling within 2 hours triggers automated
                inter-bank lien commands (CFCFRMS) stopping money withdrawal at destination mule bank branches.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="tel:1930"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-lg shadow-red-600/30"
            >
              Call 1930 Now
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Lodge at cybercrime.gov.in
            </a>
          </div>
        </div>
      </div>

      {/* STEP 2: INSTANT USSD UPI FREEZE */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/40 text-cyan-400">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Step 2: Instant USSD UPI De-linking (*99#)
            </h3>
            <p className="text-xs text-slate-400">
              Works without internet or WiFi directly through mobile telecom towers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ussdGuides.map((guide, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200">{guide.title}</span>
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {guide.rail}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm text-cyan-300 font-bold mb-2">
                <span>{guide.code}</span>
                <button
                  onClick={() => copyToClipboard(guide.code, `ussd-${idx}`)}
                  className="p-1 hover:text-white text-slate-400 transition"
                  title="Copy code"
                >
                  {copiedCode === `ussd-${idx}` ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">{guide.instruction}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 3: EMERGENCY CARD BLOCK SMS SYNTAX */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800/40 text-purple-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Step 3: Bank Debit / Credit Card Emergency Block SMS
            </h3>
            <p className="text-xs text-slate-400">
              Send SMS from your bank-registered mobile number to freeze cards immediately
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankSmsBlock.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-white mb-2">{item.bank}</h4>
              <div className="p-2 rounded bg-slate-950 border border-slate-900 font-mono text-xs text-cyan-300 mb-2 flex items-center justify-between">
                <span>{item.syntax}</span>
                <button
                  onClick={() => copyToClipboard(item.syntax, `card-${idx}`)}
                  className="text-slate-500 hover:text-white"
                >
                  {copiedCode === `card-${idx}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>Send to: <strong className="text-slate-200 font-mono">{item.sendTo}</strong></p>
                <p>Toll-Free: <strong className="text-slate-200 font-mono">{item.tollfree}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 4: REMOTE ACCESS & MALICIOUS APK CONTAINMENT */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-800/40 text-rose-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Step 4: Remote Control / Malicious APK Emergency Quarantine
            </h3>
            <p className="text-xs text-slate-400">
              If instructed to install AnyDesk, TeamViewer, QuickSupport, or an APK from WhatsApp
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] mb-2 font-mono">1</span>
            <h5 className="font-bold text-white mb-1">Airplane Mode Immediately</h5>
            <p className="text-slate-400 text-[11px]">Sever Wi-Fi and mobile data connection instantly to terminate live screen mirroring and OTP exfiltration.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] mb-2 font-mono">2</span>
            <h5 className="font-bold text-white mb-1">Revoke Device Admin</h5>
            <p className="text-slate-400 text-[11px]">Go to Settings -&gt; Security -&gt; Device Admin Apps. Deactivate permissions for any recently installed tools.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] mb-2 font-mono">3</span>
            <h5 className="font-bold text-white mb-1">Uninstall & Factory Reset</h5>
            <p className="text-slate-400 text-[11px]">Delete the downloaded APK file. Back up only critical contacts/photos and perform a clean factory wipe.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] mb-2 font-mono">4</span>
            <h5 className="font-bold text-white mb-1">Reset Passwords Elsewhere</h5>
            <p className="text-slate-400 text-[11px]">Use a trusted, clean secondary computer to change your netbanking passwords, UPI PINs, and email credentials.</p>
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="text-center pt-4">
        <Link
          to="/cases/new"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition shadow-lg shadow-cyan-500/20"
        >
          <span>Catalog Incident Artifacts & Generate Formal Dispute Dossier</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
