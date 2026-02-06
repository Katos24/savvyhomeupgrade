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
  const [paymentAmount, setPaymentAmount] = useState(lead?.payment_amount || '');
  const [paymentMethod, setPaymentMethod] = useState(lead?.payment_method || '');
  const [paymentDate, setPaymentDate] = useState(
    lead?.payment_date ? new Date(lead.payment_date).toISOString().split('T')[0] : ''
  );
  const [paymentNotes, setPaymentNotes] = useState(lead?.payment_notes || '');

  const calculatePaymentStatus = () => {
    if (!lead?.quote_total || !paymentAmount) return 'unpaid';
    
    const total = parseFloat(lead.quote_total);
    const paid = parseFloat(paymentAmount);
    
    if (paid >= total) return 'paid';
    if (paid > 0) return 'partial';
    return 'unpaid';
  };

  const paymentStatus = calculatePaymentStatus();

  useEffect(() => {
    if (lead?.quote_total && !lead?.payment_amount) {
      setPaymentAmount(lead.quote_total);
    }
  }, [lead?.quote_total, lead?.payment_amount]);

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

  const getStatusIcon = () => {
    if (paymentStatus === 'paid') return <CheckCircle className="w-5 h-5" />;
    if (paymentStatus === 'partial') return <Clock className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getStatusColor = () => {
    if (paymentStatus === 'paid') return 'text-green-600 bg-green-50 border-green-200';
    if (paymentStatus === 'partial') return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusText = () => {
    if (paymentStatus === 'paid') return 'Paid in Full';
    if (paymentStatus === 'partial') return 'Partial Payment';
    return 'Unpaid';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Quote Total Banner */}
      {lead?.quote_total && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Quote Total</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(parseFloat(lead.quote_total))}
            </span>
          </div>
        </div>
      )}

      {/* Payment Status Card */}
      <div className={`rounded-xl p-4 border-2 ${getStatusColor()} transition-all`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide opacity-75">Payment Status</p>
            <p className="text-lg font-bold">{getStatusText()}</p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
            Payment Amount
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none select-none">
              $
            </div>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={lead?.quote_total || "0.00"}
              className="w-full pl-12 pr-4 py-3 text-sm rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Method */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <CreditCard className="w-4 h-4" style={{ color: '#3b82f6' }} />
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-gray-900 transition"
          >
            <option value="">Select payment method...</option>
            <option value="cash">💵 Cash</option>
            <option value="check">📝 Check</option>
            <option value="venmo">💜 Venmo</option>
            <option value="zelle">⚡ Zelle</option>
            <option value="square">🟦 Square</option>
            <option value="stripe">💳 Credit Card (Stripe)</option>
            <option value="paypal">🅿️ PayPal</option>
            <option value="other">📋 Other</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" style={{ color: '#6b7280' }} />
            Payment Notes (Optional)
          </label>
          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Add any notes about this payment..."
            rows={3}
            className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 focus:outline-none transition"
          />
        </div>

        {/* Remaining Balance Card */}
        {lead?.quote_total && paymentAmount && (
          <div className={`rounded-xl p-4 border-2 ${
            parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-600" />
                )}
                <span className="text-sm font-semibold text-gray-700">
                  {parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0 
                    ? 'Balance Status' 
                    : 'Remaining Balance'}
                </span>
              </div>
              <span className={`text-xl font-bold ${
                parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0 
                  ? 'text-green-600' 
                  : 'text-orange-600'
              }`}>
                {parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0
                  ? 'Paid in Full'
                  : formatCurrency(parseFloat(lead.quote_total) - parseFloat(paymentAmount))
                }
              </span>
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