'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

type PaymentSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function PaymentSection({ lead, currentUser, onRefresh, hasProject }: PaymentSectionProps) {
  const [saving, setSaving] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [markPaidInFull, setMarkPaidInFull] = useState(false);

  // Only populate from saved payment data, never auto-fill
  useEffect(() => {
    setPaymentAmount(lead?.payment_amount || '');
    setPaymentMethod(lead?.payment_method || '');
    setPaymentDate(lead?.payment_date ? new Date(lead.payment_date).toISOString().split('T')[0] : '');
    setPaymentNotes(lead?.payment_notes || '');
    setMarkPaidInFull(false);
  }, [lead?.id]);

  // Auto-fill when toggled
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

  const handleUpdatePayment = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
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
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Payment updated!');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Payment update error:', error);
      toast.error('Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-4">

        {/* Amount / Method / Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Amount */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
              Amount
              {lead?.quote_total && (
                <span className="ml-auto text-xs text-gray-500 font-normal">
                  Quote: {formatCurrency(parseFloat(lead.quote_total))}
                </span>
              )}
            </label>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none select-none">
                $
              </div>
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => {
                  setPaymentAmount(e.target.value);
                  setMarkPaidInFull(false);
                }}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 text-sm rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <CreditCard className="w-4 h-4" style={{ color: '#3b82f6' }} />
              Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-gray-900 transition"
            >
              <option value="">Select...</option>
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
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4" style={{ color: '#8b5cf6' }} />
              Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Paid in Full Toggle */}
        {lead?.quote_total && (
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">
                Mark as Paid in Full
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMarkPaidInFull(!markPaidInFull)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                markPaidInFull ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  markPaidInFull ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" style={{ color: '#6b7280' }} />
            Payment Notes (Optional)
          </label>
          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 focus:outline-none transition"
          />
        </div>

        {/* Remaining Balance Card — Your Full Gradient Logic Preserved */}
        {lead?.quote_total && (
          <div className={`rounded-xl p-4 border-2 ${
            paymentAmount && parseFloat(paymentAmount) > 0
              ? (parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200')
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {paymentAmount && parseFloat(paymentAmount) > 0 ? (
                  parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-600" />
                  )
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
                      : 'Unpaid'
                    }
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

        {/* Save Button */}
        <button
          onClick={handleUpdatePayment}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 text-sm rounded-lg transition shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Update Payment'}
        </button>

      </div>
    </div>
  );
}