'use client';

import { useState } from 'react';
import { Check, Clock, Send, ChevronDown, ChevronUp, ArrowRight, Mail } from 'lucide-react';
import { Lead, fmt } from '@/app/demo/page';
import NextLink from 'next/link';

const noSpinners = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
const METHODS = ['Cash', 'Check', 'Credit Card', 'Venmo', 'Zelle', 'Other'];

export default function PaymentTab({ lead, onUpdate, tourStep, onTourAdvance }: {
  lead: Lead;
  onUpdate: (u: Partial<Lead>) => void;
  tourStep?: string;
  onTourAdvance?: (step: any) => void;
}) {
  const total = parseFloat(lead.quote_total || '0');

  const [amount, setAmount]       = useState('');
  const [method, setMethod]       = useState('');
  const [paidDate, setPaidDate]   = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate]     = useState('');
  const [markFull, setMarkFull]   = useState(false);
  const [collected, setCollected] = useState(
    lead.payment_status === 'paid' ? total : lead.payment_status === 'partial' ? total * 0.5 : 0
  );
  const [saved, setSaved]         = useState(false);
  const [reminded, setReminded]       = useState(false);
const [justPaid, setJustPaid]       = useState(false);
const [showHistory, setShowHistory] = useState(false);
const [reminderHistory, setReminderHistory] = useState<{date: string}[]>([]);

  const remaining  = Math.max(0, total - collected);
  const pct        = total > 0 ? Math.min(100, Math.round((collected / total) * 100)) : 0;
  const saveAmount = markFull ? remaining : parseFloat(amount) || 0;
  const isPaidFull = collected >= total && total > 0;

  const handleSave = () => {
    if (saveAmount <= 0) return;
    const newCollected = Math.min(total, collected + saveAmount);
    const newStatus = newCollected >= total ? 'paid' : newCollected > 0 ? 'partial' : 'unpaid';
    setCollected(newCollected);
    onUpdate({ payment_status: newStatus });
    if (tourStep === 'mark-paid' && newCollected >= total) {
      setJustPaid(true);
      setTimeout(() => onTourAdvance?.('done'), 1200);
    }
    // Keep showing amount briefly so user sees what was recorded, then clear
    setSaved(true);
    setTimeout(() => {
      setAmount('');
      setMarkFull(false);
      setSaved(false);
    }, 2500);
  };

  const handleRemind = () => {
  setReminded(true);
  setReminderHistory(prev => [{ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, ...prev]);
  setTimeout(() => setReminded(false), 2500);
};

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-400 focus:bg-white transition-all';

  return (
    <div className="space-y-4">

      {/* ── TOUR TIP — rendered here only, LeadModal should NOT render its own ── */}
      {tourStep === 'mark-paid' && !justPaid && onTourAdvance && (
        <div
          className="flex items-center gap-3 px-4 py-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #312e81, #4338ca)',
            border: '2px solid #818cf8',
            boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />
          <p className="text-sm font-black text-white flex-1 leading-snug">
Log the payment below — check "Mark as Paid in Full" then hit Record Payment    </p>
          <ArrowBounce />
        </div>
      )}

      {/* ── JUST PAID SUCCESS ── */}
      {justPaid && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #052e16, #065f46)', border: '2px solid #10b981' }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-400" strokeWidth={3} />
            </div>
            <div>
            <p className="text-base font-black text-white">{fmt(total)} logged as paid</p>
<p className="text-sm text-emerald-300 mt-0.5">Lead → Quote → Payment recorded in 30 seconds</p>
            </div>
          </div>
          <p className="text-xs text-emerald-400/80 leading-relaxed mb-4">
            Every lead your customers submit lands on your board like this — ready to quote, schedule, and collect. No spreadsheets, no missed follow-ups.
          </p>
          <NextLink
            href="/signup"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm rounded-xl transition active:scale-95"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </NextLink>
        </div>
      )}

      {/* ── PROGRESS CARD ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.5" className="w-4 h-4">
                <rect x="1" y="3" width="14" height="10" rx="2"/>
                <path d="M1 7h14"/>
              </svg>
            </div>
<span className="text-sm font-black text-gray-900 uppercase tracking-wide">Payment Tracker</span>
          </div>
          {lead.quote_total && (
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</p>
              <p className="text-lg font-black text-gray-900">{fmt(lead.quote_total)}</p>
            </div>
          )}
        </div>
        {total > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-gray-600">{fmt(collected)} collected</span>
              </div>
              {isPaidFull ? (
                <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                  <Check className="w-3 h-3" strokeWidth={3} /> Paid in full
                </span>
              ) : (
                <span className="text-xs font-black text-amber-500">{fmt(remaining)} remaining</span>
              )}
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: pct >= 100 ? '#10b981' : '#6366f1' }}
              />
            </div>
            {pct > 0 && pct < 100 && (
              <p className="text-[10px] text-slate-400 font-bold mt-1.5 text-right">{pct}% paid</p>
            )}
          </div>
        )}
      </div>

      {/* ── INPUT FORM — hidden once fully paid ── */}
      {!isPaidFull && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold pointer-events-none">$</span>
                <input
                  type="number"
                  value={markFull ? remaining.toFixed(2) : amount}
                  onChange={e => { setAmount(e.target.value); setMarkFull(false); }}
                  placeholder="0.00"
                  className={`${inputCls} pl-7 ${noSpinners}`}
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Method</label>
              <div className="relative">
                <select value={method} onChange={e => setMethod(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer focus:border-indigo-400 focus:bg-white transition-all">
                  <option value="">Select...</option>
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Paid Date</label>
              <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Mark Paid in Full */}
          {remaining > 0 && (
            <button
              onClick={() => setMarkFull(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all active:scale-[0.99] ${
                markFull
                  ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                  : tourStep === 'mark-paid'
                    ? 'border-indigo-300 bg-indigo-50/40 hover:border-indigo-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  markFull ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                }`}>
                  {markFull && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm font-bold transition-colors ${markFull ? 'text-emerald-800' : 'text-gray-800'}`}>
                  Mark as Paid in Full
                </span>
              </div>
              <span className={`text-sm font-black transition-colors ${markFull ? 'text-emerald-600' : 'text-slate-400'}`}>
                {fmt(remaining)}
              </span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSave}
              disabled={saveAmount <= 0}
              className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : markFull
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
{saved ? <><Check className="w-3.5 h-3.5" /> Recorded!</> : markFull ? <><Check className="w-3.5 h-3.5" /> Record Payment</> : 'Record Payment'}
            </button>
            <button
              onClick={handleRemind}
              className={`py-4 bg-white border-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                reminded ? 'border-blue-300 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
{reminded ? <><Check className="w-3.5 h-3.5" /> Sent!</> : <><Send className="w-3.5 h-3.5" /> Send Reminder</>}
            </button>
          </div>

          {reminderHistory.length > 0 && (
  <div className="border-t border-slate-100 pt-2">
    <button
      onClick={() => setShowHistory(v => !v)}
      className="flex items-center justify-between w-full py-1"
    >
      <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
        <Mail className="w-3 h-3" /> Sent History ({reminderHistory.length})
      </span>
      {showHistory
        ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
    </button>
    {showHistory && (
      <div className="mt-2 space-y-2">
        {reminderHistory.map((entry, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-800">{entry.date}</span>
                <p className="text-[10px] text-slate-400 truncate">Reminder sent to customer</p>
              </div>
            </div>
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 shrink-0 ml-2">
              sent
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)}

<p className="text-center text-xs text-gray-400">
  Log cash, check, Venmo — whatever you collected. Reminders send a branded email to the customer.
</p>
        </>
      )}
    </div>
  );
}

function ArrowBounce() {
  return (
    <svg className="w-4 h-4 text-indigo-300 shrink-0 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  );
}