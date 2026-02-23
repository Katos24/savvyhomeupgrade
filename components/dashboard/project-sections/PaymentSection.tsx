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
  const [markPaidInFull, setMarkPaidInFull] = useState(false);
  const [error, setError] = useState('');

  // Populate from saved payment data
  useEffect(() => {
    setPaymentAmount(lead?.payment_amount || '');
    setPaymentMethod(lead?.payment_method || '');
    setPaymentDate(lead?.payment_date ? new Date(lead.payment_date).toISOString().split('T')[0] : '');
    setPaymentNotes(lead?.payment_notes || '');
    setMarkPaidInFull(false);
  }, [lead?.id]);

  // Auto-fill when marking paid in full
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const remainingBalance = lead?.quote_total
    ? Math.max(parseFloat(lead.quote_total) - parseFloat(paymentAmount || '0'), 0)
    : null;

  const handleSavePayment = async () => {
    setError('');

    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_payment',
          payment_status: paymentStatus,
          payment_amount: paymentAmount || null,
          payment_method: paymentMethod || null,
          payment_date: paymentDate || null,
          payment_notes: paymentNotes || null,
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || '',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Payment updated!');
        setMarkPaidInFull(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to update payment');
      }
    } catch (err) {
      console.error('Payment update error:', err);
      setError('Failed to save payment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">

      {/* Header */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-800">Add Payment</div>
        {remainingBalance !== null && (
          <div className="text-xs text-gray-500">
            Remaining Balance: {formatCurrency(remainingBalance)}
            {lead?.quote_total && (
              <span className="ml-2 text-gray-400">
                (Quote: {formatCurrency(parseFloat(lead.quote_total))})
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="space-y-4">

          {/* Payment Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Payment Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => {
                setPaymentAmount(e.target.value);
                if (markPaidInFull) setMarkPaidInFull(false);
              }}
              disabled={markPaidInFull}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="0.00"
            />
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
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

          {/* Mark Paid in Full */}
          {lead?.quote_total && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={markPaidInFull}
                onChange={(e) => setMarkPaidInFull(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Mark Paid in Full
              </label>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Notes
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional payment notes..."
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSavePayment}
              disabled={saving}
              className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>

        </div>
      </div>

      {/* Balance Status Card */}
      {lead?.quote_total && (
        <div className={`mt-5 rounded-xl p-4 border-2 ${
          paymentAmount && parseFloat(paymentAmount) > 0
            ? (parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200')
            : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {paymentAmount && parseFloat(paymentAmount) > 0 ? (
                parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
                  ? <CheckCircle className="w-5 h-5 text-green-600" />
                  : <Clock className="w-5 h-5 text-orange-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">
                  {paymentAmount && parseFloat(paymentAmount) > 0
                    ? (parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
                        ? 'Payment Status'
                        : 'Remaining Balance')
                    : 'Payment Status'}
                </span>
                <span className={`text-lg font-bold ${
                  paymentAmount && parseFloat(paymentAmount) > 0
                    ? (parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
                        ? 'text-green-600'
                        : 'text-orange-600')
                    : 'text-gray-600'
                }`}>
                  {paymentAmount && parseFloat(paymentAmount) > 0
                    ? (parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
                        ? 'Paid in Full ✓'
                        : formatCurrency(parseFloat(lead.quote_total) - parseFloat(paymentAmount)))
                    : 'Unpaid'}
                </span>
              </div>
            </div>
            {paymentAmount && parseFloat(paymentAmount) > 0 && parseFloat(lead.quote_total) - parseFloat(paymentAmount) > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-600">Paid</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(parseFloat(paymentAmount))}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-sm text-red-600 font-medium">{error}</div>
      )}

    </div>
  );
}