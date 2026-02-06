'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

type SendCustomerEmailButtonsProps = {
  leadId: number;
  type: 'quote' | 'schedule';
  currentUser: any;
  companyId: number; // Add this
  onRefresh: () => Promise<void>;
  hasQuote?: boolean;
  hasSchedule?: boolean;
  quoteSentAt?: string | null;
  disabled?: boolean;
};

export default function SendCustomerEmailButtons({
  leadId,
  type,
  currentUser,
  companyId, // Add this
  onRefresh,
  hasQuote = false,
  hasSchedule = false,
  quoteSentAt = null,
  disabled = false
}: SendCustomerEmailButtonsProps) {
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    if (type === 'quote' && !hasQuote) {
      toast.error('Create a quote first');
      return;
    }

    if (type === 'schedule' && !hasSchedule) {
      toast.error('Set a schedule date first');
      return;
    }

    setSending(true);
    const action = type === 'quote' ? 'send_quote_to_customer' : 'send_schedule_to_customer';
    const successMessage = type === 'quote' 
      ? 'Quote emailed to customer!' 
      : 'Schedule confirmation emailed!';

    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          action: action,
          company_id: companyId, // Add this
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(successMessage);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const buttonText = type === 'quote' 
    ? (sending ? 'Sending...' : 'Email Quote to Customer')
    : (sending ? 'Sending...' : 'Email Schedule to Customer');

  const isDisabled = disabled || sending || (type === 'quote' && !hasQuote) || (type === 'schedule' && !hasSchedule);

  return (
    <div className="space-y-2">
      <button
        onClick={handleSendEmail}
        disabled={isDisabled}
        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition text-sm"
      >
        <Mail className="w-3.5 h-3.5" />
        {buttonText}
      </button>

      {type === 'quote' && quoteSentAt && (
        <p className="text-xs text-green-600 font-semibold text-center">
          Quote emailed on {new Date(quoteSentAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
