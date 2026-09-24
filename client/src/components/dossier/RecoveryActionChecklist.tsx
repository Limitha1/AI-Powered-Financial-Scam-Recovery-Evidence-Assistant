import React, { useState, useEffect } from 'react';
import {
  Timer,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Building,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from 'lucide-react';
import { RecoveryChecklistItem } from '../../types/index.js';

interface RecoveryActionChecklistProps {
  incidentStartTime?: string | null;
  checklist?: RecoveryChecklistItem[];
}

export const RecoveryActionChecklist: React.FC<RecoveryActionChecklistProps> = ({
  incidentStartTime,
  checklist = []
}) => {
  // 24-Hour & 72-Hour countdown calculation
  const incidentDate = incidentStartTime ? new Date(incidentStartTime).getTime() : Date.now() - 4 * 3600000;
  const deadline24h = incidentDate + 24 * 3600 * 1000;
  const deadline72h = incidentDate + 72 * 3600 * 1000;

  const [timeLeft24, setTimeLeft24] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const [timeLeft72, setTimeLeft72] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Checked state for tasks
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  const [showBankDirectory, setShowBankDirectory] = useState(true);

  useEffect(() => {
    const updateCountdowns = () => {
      const now = Date.now();

      // 24H Window
      const diff24 = deadline24h - now;
      if (diff24 <= 0) {
        setTimeLeft24({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const h = Math.floor(diff24 / (1000 * 60 * 60));
        const m = Math.floor((diff24 % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff24 % (1000 * 60)) / 1000);
        setTimeLeft24({ hours: h, minutes: m, seconds: s, isExpired: false });
      }

      // 72H Window
      const diff72 = deadline72h - now;
      if (diff72 <= 0) {
        setTimeLeft72({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const h = Math.floor(diff72 / (1000 * 60 * 60));
        const m = Math.floor((diff72 % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff72 % (1000 * 60)) / 1000);
        setTimeLeft72({ hours: h, minutes: m, seconds: s, isExpired: false });
      }
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [deadline24h, deadline72h]);

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const defaultChecklist: RecoveryChecklistItem[] = checklist.length > 0 ? checklist : [
    {
      target: "Bank Fraud Helpline / Branch",
      action_required: "Submit formal dispute letter and obtain a 10-digit Grievance Ticket Number.",
      urgency_window: "Within 24 Hours (Crucial for Zero Liability)"
    },
    {
      target: "National Cyber Crime Helpline (1930 / portal)",
      action_required: "Call 1930 or lodge complaint at cybercrime.gov.in to obtain NCRP Acknowledgement Slip.",
      urgency_window: "Immediate (Within 2 Hours)"
    },
    {
      target: "UPI App / Payment Gateway (NPCI)",
      action_required: "Raise dispute on PhonePe / Google Pay / Paytm marking UTR as fraudulent debit.",
      urgency_window: "Within 6 Hours"
    },
    {
      target: "Telecom Operator (Airtel / Jio / Vi)",
      action_required: "If SIM swap or OTP interception was suspected, request immediate SIM re-verification.",
      urgency_window: "Within 12 Hours"
    },
    {
      target: "Device Hygiene & Security",
      action_required: "If remote tools (AnyDesk / APK) were installed, put phone in Airplane mode and factory reset.",
      urgency_window: "Immediate"
    }
  ];

  const bankDirectory = [
    { name: "HDFC Bank", helpline: "1800 258 6161 / 1800 266 4060", email: "grievance.redressal@hdfcbank.com", pno: "pno@hdfcbank.com" },
    { name: "State Bank of India (SBI)", helpline: "1800 1234 / 1800 2100", email: "customercare@sbi.co.in", pno: "nodalofficer@sbi.co.in" },
    { name: "ICICI Bank", helpline: "1800 1080", email: "customer.care@icicibank.com", pno: "headservicequality@icicibank.com" },
    { name: "Axis Bank", helpline: "1860 419 5555", email: "nodal.officer@axisbank.com", pno: "pno@axisbank.com" },
    { name: "Punjab National Bank", helpline: "1800 180 2222", email: "care@pnb.co.in", pno: "nodalofficer@pnb.co.in" },
    { name: "Google Pay UPI", helpline: "1800 419 0157", email: "support-in@google.com", pno: "In-App Dispute Center" },
    { name: "PhonePe UPI", helpline: "080-68727374", email: "support@phonepe.com", pno: "grievance@phonepe.com" },
    { name: "Paytm Payments Bank", helpline: "0120-4456-456", email: "nodal@paytmbank.com", pno: "grievance@paytm.com" }
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* COUNTDOWN CLOCKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 24-Hour Zero-Liability Window */}
        <div className={`p-5 rounded-2xl border transition shadow-xl ${
          timeLeft24.isExpired
            ? 'bg-red-950/40 border-red-500/40'
            : 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/40'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Timer className={`h-5 w-5 ${timeLeft24.isExpired ? 'text-red-400' : 'text-cyan-400 animate-spin'}`} style={{ animationDuration: '6s' }} />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                RBI 24-Hour Zero-Liability Window
              </h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              timeLeft24.isExpired ? 'bg-red-900/60 text-red-300' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
            }`}>
              {timeLeft24.isExpired ? 'EXPIRED' : 'ACTIVE WINDOW'}
            </span>
          </div>

          <div className="flex items-baseline space-x-2 font-mono">
            {timeLeft24.isExpired ? (
              <span className="text-xl font-bold text-red-400">
                24-Hour Zero-Liability Expired (Proceed to 72H Window)
              </span>
            ) : (
              <>
                <span className="text-3xl font-extrabold text-white">
                  {String(timeLeft24.hours).padStart(2, '0')}:
                  {String(timeLeft24.minutes).padStart(2, '0')}:
                  {String(timeLeft24.seconds).padStart(2, '0')}
                </span>
                <span className="text-xs text-slate-400">Hours Remaining</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Reporting within this window legally limits customer liability to <strong>₹0.00</strong> under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18.
          </p>
        </div>

        {/* 72-Hour Secondary Window */}
        <div className={`p-5 rounded-2xl border transition shadow-xl ${
          timeLeft72.isExpired
            ? 'bg-red-950/40 border-red-500/40'
            : 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/40'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                72-Hour Capped Liability Window
              </h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              timeLeft72.isExpired ? 'bg-red-900/60 text-red-300' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {timeLeft72.isExpired ? 'EXPIRED' : 'SECONDARY DEADLINE'}
            </span>
          </div>

          <div className="flex items-baseline space-x-2 font-mono">
            {timeLeft72.isExpired ? (
              <span className="text-xl font-bold text-red-400">
                72-Hour Secondary Window Expired (Ombudsman Escalation Required)
              </span>
            ) : (
              <>
                <span className="text-3xl font-extrabold text-white">
                  {String(timeLeft72.hours).padStart(2, '0')}:
                  {String(timeLeft72.minutes).padStart(2, '0')}:
                  {String(timeLeft72.seconds).padStart(2, '0')}
                </span>
                <span className="text-xs text-slate-400">Hours Remaining</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Reporting between 3 to 7 working days caps customer liability at maximum ₹10,000 for savings accounts under RBI regulations.
          </p>
        </div>
      </div>

      {/* PRIORITY ACTION CHECKLIST */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Mandatory Containment & Dispute Checklist
            </h3>
            <p className="text-xs text-slate-400">
              Track statutory notifications to preserve legal standing and secure beneficiary liens
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {defaultChecklist.map((item, idx) => {
            const isDone = completedTasks[idx] || false;
            return (
              <div
                key={idx}
                onClick={() => toggleTask(idx)}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start space-x-3 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button type="button" className="mt-0.5 text-emerald-400 shrink-0">
                  {isDone ? <CheckCircle2 className="h-5 w-5 fill-emerald-500/20" /> : <Circle className="h-5 w-5 text-slate-600" />}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {item.target}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                      {item.urgency_window}
                    </span>
                  </div>
                  <p className={`text-xs ${isDone ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {item.action_required}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BANK ESCALATION DIRECTORY */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <button
          onClick={() => setShowBankDirectory(!showBankDirectory)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Bank Nodal Grievance & Escalation Contacts
              </h3>
              <p className="text-xs text-slate-400">
                Direct contacts for emergency fraud containment and Principal Nodal Officers
              </p>
            </div>
          </div>
          {showBankDirectory ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {showBankDirectory && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {bankDirectory.map((b, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <h5 className="font-bold text-slate-200 mb-1">{b.name}</h5>
                <p className="text-slate-400 flex items-center space-x-1.5 font-mono text-[11px]">
                  <PhoneCall className="h-3 w-3 text-cyan-400" />
                  <span>{b.helpline}</span>
                </p>
                <p className="text-slate-400 font-mono text-[11px] truncate mt-0.5">
                  <span className="text-slate-500">PNO Email:</span> {b.pno}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
