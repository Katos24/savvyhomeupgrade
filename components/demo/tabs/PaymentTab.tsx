'use client';

import { useState } from 'react';
import { Check, Clock, Send, ChevronDown } from 'lucide-react';
import { Lead, fmt } from '@/app/demo/page';

const noSpinners = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
const METHODS = ['Cash', 'Check', 'Credit Card', 'Venmo', 'Zelle', 'Other'];

export default function PaymentTab({ lead, onUpdate }: { lead: Lead; onUpdate: (u: Partial<Lead>) => void }) {
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
  const [reminded, setReminded]   = useState(false);

  const remaining = Math.max(0, total - collected);
  const pct       = total > 0 ? Math.min(100, Math.round((collected / total) * 100)) : 0;

  const handleSave = () => {
    const addAmount = markFull ? remaining : parseFloat(amount) || 0;
    const newCollected = Math.min(total, collected + addAmount);
    setCollected(newCollected);
    const newStatus = newCollected >= total ? 'paid' : newCollected > 0 ? 'partial' : 'unpaid';
    onUpdate({ payment_status: newStatus });
    setAmount('');
    setMarkFull(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemind = () => {
    setReminded(true);
    setTimeout(() => setReminded(false), 2000);
  };

  const inputCls = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0F1F3D] outline-none focus:border-blue-500 focus:bg-white transition-all';

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.5" className="w-4 h-4">
                <rect x="1" y="3" width="14" height="10" rx="2"/>
                <path d="M1 7h14"/>
              </svg>
            </div>
            <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Payment Hub</span>
          </div>
          {lead.quote_total && (
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Quote</p>
              <p className="text-lg font-black text-gray-900">{fmt(lead.quote_total)}</p>
            </div>
          )}
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-gray-600">{fmt(collected)} collected</span>
              </div>
              {remaining > 0 && (
                <span className="text-xs font-black text-amber-500">{fmt(remaining)} left</span>
              )}
              {remaining === 0 && collected > 0 && (
                <span className="text-xs font-black text-emerald-500">Paid in full</span>
              )}
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : '#6366f1' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Amount + Method */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Amount</label>
          <input
            type="number"
            value={markFull ? remaining.toFixed(2) : amount}
            onChange={e => { setAmount(e.target.value); setMarkFull(false); }}
            placeholder="0.00"
            className={`${inputCls} ${noSpinners}`}
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Method</label>
          <div className="relative">
            <select value={method} onChange={e => setMethod(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0F1F3D] outline-none appearance-none cursor-pointer focus:border-blue-500 focus:bg-white transition-all">
              <option value="">Select...</option>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Paid Date + Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Paid Date</label>
          <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Mark as Paid in Full */}
      {remaining > 0 && (
        <button
          onClick={() => setMarkFull(v => !v)}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all ${
            markFull ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              markFull ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
            }`}>
              {markFull && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm font-bold text-gray-800">Mark as Paid in Full</span>
          </div>
          <span className="text-sm font-black text-slate-400">{fmt(total)}</span>
        </button>
      )}

      {/* Save + Reminder */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSave}
          className={`py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition ${
            saved ? 'bg-emerald-600 text-white' : 'bg-[#0F1F3D] hover:bg-[#1a2a4a] text-white'
          }`}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saved ? 'Saved!' : 'Save Payment'}
        </button>
        <button
          onClick={handleRemind}
          className={`py-3.5 bg-white border-2 border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition ${
            reminded ? 'border-blue-300 text-blue-600' : 'text-[#0F1F3D] hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {reminded ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
          {reminded ? 'Sent!' : 'Reminder'}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        In your real account, payment reminders send a branded email to the customer.
      </p>
    </div>
  );
}