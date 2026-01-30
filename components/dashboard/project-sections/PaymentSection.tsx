'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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

  return (
    <div className="p-4 space-y-3">
      {lead?.quote_total && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Quote Total:</span>
            <span className="text-base font-bold text-emerald-600">
              {formatCurrency(parseFloat(lead.quote_total))}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder={lead?.quote_total || "0.00"}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none bg-white text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
          >
            <option value="">Select...</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="venmo">Venmo</option>
            <option value="zelle">Zelle</option>
            <option value="square">Square</option>
            <option value="stripe">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="relative z-10">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm flex items-center">
            <span className={`font-semibold ${
              paymentStatus === 'paid' ? 'text-green-600' : 
              paymentStatus === 'partial' ? 'text-orange-600' : 
              'text-gray-600'
            }`}>
              {paymentStatus === 'paid' ? '✅ Paid in Full' : 
               paymentStatus === 'partial' ? '⏳ Partial Payment' : 
               'Unpaid'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
          <textarea
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {lead?.quote_total && paymentAmount && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                {parseFloat(lead.quote_total) - parseFloat(paymentAmount) <= 0 ? 'Status:' : 'Remaining Balance:'}
              </span>
              <span className={`text-base font-bold ${
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

        <button
          onClick={handleUpdatePayment}
          disabled={saving}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-2.5 text-sm rounded-lg transition"
        >
          {saving ? 'Saving...' : 'Update Payment'}
        </button>
      </div>
    </div>
  );
}