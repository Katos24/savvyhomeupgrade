'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  CheckCircle, AlertCircle, Clock, X, 
  CreditCard, Calendar, MessageSquare, 
  ChevronDown, ChevronUp, DollarSign 
} from 'lucide-react';

type PaymentUpdateProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function PaymentUpdate({ lead, currentUser, onRefresh, hasProject }: PaymentUpdateProps) {
  const [saving, setSaving] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [markPaidInFull, setMarkPaidInFull] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPaymentAmount(lead?.payment_amount || '');
    setPaymentMethod(lead?.payment_method || '');
   setPaymentDate(lead?.payment_date ? String(lead.payment_date).split('T')[0] : '');
setPaymentNotes(lead?.payment_notes || '');
setPaymentDueDate(lead?.payment_due_date ? String(lead.payment_due_date).split('T')[0] : '');
    setMarkPaidInFull(false);
  }, [lead?.id]);

  useEffect(() => {
    if (markPaidInFull && lead?.quote_total) {
      setPaymentAmount(lead.quote_total.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [markPaidInFull, lead?.quote_total]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  
  const total = parseFloat(lead?.quote_total || '0');
  const paid = parseFloat(paymentAmount || '0');
  const remaining = Math.max(total - paid, 0);
  const isPaid = total > 0 && paid >= total;
  const isPartial = paid > 0 && !isPaid;

  const handleSave = async () => {
    setError('');
    if (!hasProject) { toast.error('Convert to project first'); return; }
    
    const amount = paymentAmount === '' ? 0 : parseFloat(paymentAmount);
    if (isNaN(amount)) { setError('Please enter a valid number.'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_payment',
          payment_status: isPaid ? 'paid' : isPartial ? 'partial' : 'unpaid',
          payment_amount: amount, 
          payment_method: paymentMethod || null,
          payment_date: paymentDate === '' ? null : paymentDate,
          payment_due_date: paymentDueDate === '' ? null : paymentDueDate,
          payment_notes: paymentNotes || null,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Payment updated!');
        setMarkPaidInFull(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to update payment');
      }
    } catch {
      setError('Failed to save payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with Glass Effect */}
      <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Payment Hub</h3>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Quote</p>
            <p className="text-sm font-black text-slate-900">{fmt(total)}</p>
          </div>
        )}
      </div>

      {/* Dynamic Status Progress Bar */}
      {total > 0 && (
        <div className="px-6 py-4 bg-white border-b border-slate-50">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
              {isPaid ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : isPartial ? <Clock className="w-4 h-4 text-amber-500" /> : <AlertCircle className="w-4 h-4 text-slate-300" />}
              <span className="text-sm font-bold text-slate-700">
                {isPaid ? 'Settled' : isPartial ? `${fmt(paid)} collected` : 'Awaiting Payment'}
              </span>
            </div>
            {isPartial && <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{fmt(remaining)} left</span>}
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min((paid / total) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Amount Input */}
          <div className="relative group">
            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => { setPaymentAmount(e.target.value); if (markPaidInFull) setMarkPaidInFull(false); }}
                disabled={markPaidInFull}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all disabled:opacity-50"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Method Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Select...</option>
              <option value="cash">💵 Cash</option>
              <option value="check">✍️ Check</option>
              <option value="credit_card">💳 Credit Card</option>
              <option value="zelle">📱 Zelle</option>
              <option value="venmo">✌️ Venmo</option>
              <option value="stripe">💳 Stripe</option>
              <option value="other">⚙️ Other</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              Payment Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Due Date Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              Due Date
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="date"
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Paid in Full Toggle */}
        {total > 0 && (
          <div 
            onClick={() => setMarkPaidInFull(!markPaidInFull)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              markPaidInFull ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                markPaidInFull ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'
              }`}>
                {markPaidInFull && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
              <span className="text-sm font-bold text-slate-700">Mark as Paid in Full</span>
            </div>
            <span className={`text-xs font-black ${markPaidInFull ? 'text-emerald-600' : 'text-slate-400'}`}>
              {fmt(total)}
            </span>
          </div>
        )}

        {/* Notes Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {showNotes ? 'Hide Notes' : 'Add Internal Notes'}
            {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {showNotes && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Write payment details, check numbers, or balance notes..."
              />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-bold">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="group relative w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-black py-4 rounded-xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] overflow-hidden"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : (
            'Sync Payment Data'
          )}
        </button>
        {!isPaid && total > 0 && (
  <button
    onClick={async () => {
      setSaving(true);
      try {
        const slug = window.location.pathname.split('/')[1];
const res = await fetch(`/api/company/${slug}/payment-reminders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: lead.id,
            project_id: lead.project_id,
          }),
        });
        const data = await res.json();
        if (data.success) toast.success('Payment reminder sent!');
        else toast.error(data.error || 'Failed to send reminder');
      } catch {
        toast.error('Failed to send reminder');
      } finally {
        setSaving(false);
      }
    }}
    disabled={saving || !lead.project_id}
    className="w-full border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 text-slate-600 hover:text-indigo-600 font-black py-4 rounded-xl text-sm uppercase tracking-[0.2em] transition-all"
  >
    Send Payment Reminder
  </button>
)}
      </div>
    </div>
  );
}