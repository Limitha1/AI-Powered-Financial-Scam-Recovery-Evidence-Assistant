import React, { useState } from 'react';
import { CreditCard, Plus, ShieldAlert, CheckCircle2, Building, ArrowUpRight } from 'lucide-react';
import { ForensicTransaction } from '../../types/index.js';
import { api } from '../../lib/api.js';

interface TransactionTableProps {
  caseId: string;
  transactions: ForensicTransaction[];
  onTransactionAdded: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  caseId,
  transactions,
  onTransactionAdded
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [ref, setRef] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceBank, setSourceBank] = useState('');
  const [sourceTail, setSourceTail] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [beneficiaryPlatform, setBeneficiaryPlatform] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalDebited = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref || !amount || !beneficiary) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.addForensicTransaction(caseId, {
        transaction_reference: ref.trim(),
        timestamp: new Date().toISOString(),
        amount: parseFloat(amount),
        sender_bank: sourceBank.trim() || 'Victim Bank',
        sender_account_masked: sourceTail.trim() ? `XX${sourceTail.trim()}` : 'XX4102',
        beneficiary_identifier: beneficiary.trim(),
        beneficiary_bank_or_platform: beneficiaryPlatform.trim() || 'UPI Network',
        is_unauthorized: true
      });

      setShowAddModal(false);
      setRef('');
      setAmount('');
      setSourceBank('');
      setSourceTail('');
      setBeneficiary('');
      setBeneficiaryPlatform('');
      onTransactionAdded();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Reconciled Forensic Transaction Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Audit-ready transactional discrepancies verified from SMS alerts, UPI gateways, and statements
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Disputed Loss</span>
            <span className="text-base font-extrabold text-red-400 font-mono">
              ₹{totalDebited.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">#</th>
              <th className="py-3 px-3">UTR / RRN Reference</th>
              <th className="py-3 px-3">Disputed Amount</th>
              <th className="py-3 px-3">Source Bank & Tail</th>
              <th className="py-3 px-3">Destination Mule Beneficiary</th>
              <th className="py-3 px-3">Debited Timestamp</th>
              <th className="py-3 px-3 text-right">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No forensic transactions reconciled yet. Ingest an SMS or screenshot to run AI extraction.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-cyan-400">
                    <span className="bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded text-xs select-all">
                      {tx.transaction_reference}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-red-400">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <div className="flex items-center space-x-1.5 font-sans">
                      <Building className="h-3 w-3 text-slate-500" />
                      <span>{tx.sender_bank || 'Victim Bank'}</span>
                      <span className="font-mono text-slate-400">({tx.sender_account_masked || 'Primary'})</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-amber-300 bg-amber-950/40 border border-amber-800/30 px-2 py-0.5 rounded select-all">
                      {tx.beneficiary_identifier}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {new Date(tx.timestamp).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-400 text-[10px] font-bold font-sans">
                      <ShieldAlert className="h-3 w-3" />
                      <span>UNAUTHORIZED</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Record Forensic Transaction</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter transaction details from your bank alert SMS or mobile banking app.
            </p>

            {errorMsg && (
              <div className="p-3 mb-3 rounded-lg bg-red-950 border border-red-500/40 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  UTR / RRN / Transaction Reference *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 423984129482 or UPI/42918239"
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-cyan-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Disputed Amount (INR) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-red-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Source Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, SBI"
                    value={sourceBank}
                    onChange={(e) => setSourceBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Debit Account Tail
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4102"
                    value={sourceTail}
                    onChange={(e) => setSourceTail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Beneficiary UPI / Account *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. suspect@okaxis"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-amber-300"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold"
                >
                  {isSubmitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
