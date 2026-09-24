import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Cpu
} from 'lucide-react';
import {
  SCAM_TAXONOMY_DETAILS,
  ScamType,
  FraudRail,
  FRAUD_RAILS,
  SCAM_TYPES
} from '../types/index.js';
import { api } from '../lib/api.js';

export const CaseIntakeWizard: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [scamType, setScamType] = useState<ScamType>('UPI_COLLECT_REQUEST_FRAUD');
  const [primaryRail, setPrimaryRail] = useState<FraudRail>('UPI');
  const [estimatedLoss, setEstimatedLoss] = useState('45000');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16));
  const [victimNarrative, setVictimNarrative] = useState('');

  const loadExampleNarrative = () => {
    setTitle('Unauthorized PhonePe Debit - Discom Electricity Bill Pretext');
    setScamType('UPI_COLLECT_REQUEST_FRAUD');
    setPrimaryRail('UPI');
    setEstimatedLoss('45000');
    setVictimNarrative(
      'Received an urgent SMS at 8:15 PM from VK-EBILL stating electricity power to my residence would be disconnected tonight due to an unpaid charge of Rs 12. I called the helpline number listed in the SMS. The representative told me to pay Rs 10 on PhonePe to update my bill KYC. They dispatched a collect request of Rs 45,000 disguised with the remark "Refund Verification - Enter PIN". Under pressure, I approved it and entered my MPIN, and Rs 45,000 was debited immediately to suspect VPA power.discom.refund@okaxis. Transaction UTR is 423984129482.'
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !estimatedLoss) return;
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (victimNarrative.length < 20) {
      setErrorMsg('Please provide a detailed narrative of at least 20 characters.');
      return;
    }
    setErrorMsg(null);
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await api.createCase({
        title,
        scam_type: scamType,
        primary_payment_rail: primaryRail,
        estimated_loss: parseFloat(estimatedLoss) || 0,
        currency: 'INR',
        incident_start_time: new Date(incidentDate).toISOString(),
        victim_narrative: victimNarrative
      });

      navigate(`/cases/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize incident case.');
      setIsSubmitting(false);
    }
  };

  const currentTaxonomy = SCAM_TAXONOMY_DETAILS[scamType];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className={`font-bold ${step >= 1 ? 'text-cyan-400' : 'text-slate-600'}`}>
            01. FRAUD CLASSIFICATION
          </span>
          <span className={`font-bold ${step >= 2 ? 'text-cyan-400' : 'text-slate-600'}`}>
            02. VICTIM NARRATIVE
          </span>
          <span className={`font-bold ${step >= 3 ? 'text-cyan-400' : 'text-slate-600'}`}>
            03. EMERGENCY TRIAGE
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: CLASSIFICATION & LOSS */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-black text-white">Step 1: Incident Metadata & Loss Tally</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Classify the threat profile and record estimated financial loss
              </p>
            </div>
            <button
              type="button"
              onClick={loadExampleNarrative}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 font-mono underline underline-offset-4"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Load Realistic Sample Case</span>
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Case Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Unauthorized UPI Collect Request Debit - Electricity Bill Pretext"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scam Typology Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {SCAM_TYPES.map((type) => {
                  const details = SCAM_TAXONOMY_DETAILS[type];
                  const isSelected = scamType === type;
                  return (
                    <div
                      key={type}
                      onClick={() => setScamType(type)}
                      className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-glow-cyan'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`text-xs font-bold block ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {details.name}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 block line-clamp-2">
                        {details.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Payment Rail *
                </label>
                <select
                  value={primaryRail}
                  onChange={(e) => setPrimaryRail(e.target.value as FraudRail)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {FRAUD_RAILS.map((rail) => (
                    <option key={rail} value={rail}>
                      {rail}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Estimated Financial Loss (INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    value={estimatedLoss}
                    onChange={(e) => setEstimatedLoss(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-red-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Approx Incident Time *
                </label>
                <input
                  type="datetime-local"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8 pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
            >
              <span>Next: Record Victim Narrative</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: VICTIM NARRATIVE */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-black text-white">Step 2: Detailed Victim Narrative</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Recount the step-by-step chronology in your own words. Gemini will extract exact entities and reconstruct the forensic sequence.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs text-slate-300">
            <span className="font-bold text-cyan-400 block mb-1">Recommended Forensic Details to Include:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>How the scammer initiated contact (SMS header, WhatsApp call, email link).</li>
              <li>Pretexts used (fake electricity bill, law enforcement digital arrest, KYC update).</li>
              <li>Any remote tools or APKs you were instructed to download (AnyDesk, QuickSupport).</li>
              <li>Transaction timestamps, amounts, and destination UPI VPAs or bank accounts.</li>
            </ul>
          </div>

          <div className="mb-6">
            <textarea
              rows={8}
              placeholder="Start describing what happened from the first communication to the unauthorized debit..."
              value={victimNarrative}
              onChange={(e) => setVictimNarrative(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              required
            />
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Character count: {victimNarrative.length} (minimum 20 characters)
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
            >
              <span>Next: Emergency Triage Advisory</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: EMERGENCY TRIAGE ADVISORY */}
      {step === 3 && (
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <div className="mb-6 pb-4 border-b border-slate-800">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950 border border-red-500/40 text-red-300 text-xs font-mono font-bold mb-2">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              <span>Customized Containment Advisory</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Immediate Action Blueprint: {currentTaxonomy.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review immediate containment steps before opening your forensic workspace
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Priority Containment Protocol</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentTaxonomy.priorityAction}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start space-x-3">
              <Cpu className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-cyan-300 mb-0.5">Next in Incident Workspace:</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  You will upload transaction screenshots and SMS text dumps into your private Evidence Locker.
                  Gemini 2.5 Flash will automatically extract UTR codes, synthesize an immutable chronological timeline,
                  and export your formal Bank Dispute Letter & Cybercrime FIR Brief.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Initializing Vault...' : 'Initialize Forensic Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
