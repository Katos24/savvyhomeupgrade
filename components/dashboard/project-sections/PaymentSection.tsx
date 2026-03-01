'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

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
  const [error, setError] = useState('');

  useEffect(() => {
    setPaymentAmount(lead?.payment_amount || '');
    setPaymentMethod(lead?.payment_method || '');
    setPaymentDate(lead?.payment_date ? new Date(lead.payment_date).toISOString().split('T')[0] : '');
    setPaymentNotes(lead?.payment_notes || '');
    setPaymentDueDate(lead?.payment_due_date ? new Date(lead.payment_due_date).toISOString().split('T')[0] : '');
    setMarkPaidInFull(false);
  }, [lead?.id]);

  useEffect(() => {
    if (markPaidInFull && lead?.quote_total) {
      setPaymentAmount(lead.quote_total.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [markPaidInFull, lead?.quote_total]);

  const calculatePaymentStatus = () => {
    if (!lead?.quote_total || !paymentAmount) return 'unpaid';
    const total = parseFloat(lead.quote_total);
    const paid = parseFloat(paymentAmount);
    if (paid >= total) return 'paid';
    if (paid > 0) return 'partial';
    return 'unpaid';
  };

  const paymentStatus = calculatePaymentStatus();
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const remaining = lead?.quote_total
    ? Math.max(parseFloat(lead.quote_total) - parseFloat(paymentAmount || '0'), 0)
    : null;
  const isPaid = paymentAmount && parseFloat(paymentAmount) > 0 && parseFloat(lead?.quote_total || '0') - parseFloat(paymentAmount) <= 0;
  const isPartial = paymentAmount && parseFloat(paymentAmount) > 0 && !isPaid;

  const handleSave = async () => {
    setError('');
    if (!hasProject) { toast.error('Convert to project first'); return; }
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) { setError('Please enter a valid payment amount.'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_payment',
          payment_status: paymentStatus,
          payment_amount: paymentAmount || null,
          payment_method: paymentMethod || null,
          payment_date: paymentDate || null,
          payment_due_date: paymentDueDate || null,
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
      setError('Failed to save payment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden">

      {/* Section header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-5 h-5 bg-amber-50 flex items-center justify-center text-xs">💳</span>
          Payment
        </h3>
        {lead?.quote_total && (
          <span className="text-xs text-gray-400">
            Quote: <span className="font-bold text-gray-600">{fmt(parseFloat(lead.quote_total))}</span>
          </span>
        )}
      </div>

      {/* Status bar */}
      {lead?.quote_total && (
        <div className={`px-5 py-3 border-b flex items-center justify-between ${
          isPaid
            ? 'bg-emerald-50 border-emerald-100'
            : isPartial
            ? 'bg-orange-50 border-orange-100'
            : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            {isPaid
              ? <CheckCircle className="w-4 h-4 text-emerald-600" />
              : isPartial
              ? <Clock className="w-4 h-4 text-orange-500" />
              : <AlertCircle className="w-4 h-4 text-gray-400" />}
            <span className={`text-sm font-bold ${isPaid ? 'text-emerald-700' : isPartial ? 'text-orange-600' : 'text-gray-500'}`}>
              {isPaid ? 'Paid in Full' : isPartial ? `${fmt(parseFloat(paymentAmount))} paid · ${fmt(remaining!)} remaining` : 'Unpaid'}
            </span>
          </div>
          {isPartial && (
            <span className="text-xs text-orange-500 font-semibold">
              {Math.round((parseFloat(paymentAmount) / parseFloat(lead.quote_total)) * 100)}%
            </span>
          )}
        </div>
      )}

      {/* Form */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            Payment Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => { setPaymentAmount(e.target.value); if (markPaidInFull) setMarkPaidInFull(false); }}
            disabled={markPaidInFull}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none disabled:bg-gray-50 transition"
            placeholder="0.00"
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
          >
            <option value="">Select method</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="credit_card">Credit Card</option>
            <option value="venmo">Venmo</option>
            <option value="zelle">Zelle</option>
            <option value="paypal">PayPal</option>
            <option value="square">Square</option>
            <option value="stripe">Stripe</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
          />
        </div>

        {/* Due Date */}
<div>
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
    Due Date
  </label>
  <input
    type="date"
    value={paymentDueDate}
    onChange={(e) => setPaymentDueDate(e.target.value)}
    className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
  />
</div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            Notes
          </label>
          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none resize-none transition"
            placeholder="Optional notes..."
          />
        </div>

        {/* Mark paid in full checkbox */}
        {lead?.quote_total && (
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="paid-in-full"
              checked={markPaidInFull}
              onChange={(e) => setMarkPaidInFull(e.target.checked)}
              className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="paid-in-full" className="text-sm font-semibold text-gray-700 cursor-pointer">
              Mark Paid in Full ({fmt(parseFloat(lead.quote_total))})
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="sm:col-span-2 text-sm text-red-600 font-medium">{error}</div>
        )}

        {/* Save */}
        <div className="sm:col-span-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 text-sm transition"
          >
            {saving ? 'Saving...' : 'Save Payment'}
          </button>
        </div>

      </div>
    </div>
  );
}