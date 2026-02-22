'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

type SendCustomerEmailButtonsProps = {
  leadId: number;
  type: 'quote' | 'schedule';
  currentUser: any;
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
  onRefresh,
  hasQuote = false,
  hasSchedule = false,
  quoteSentAt = null,
  disabled = false,
}: SendCustomerEmailButtonsProps) {
  const canSend = type === 'quote' ? hasQuote : hasSchedule;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (type === 'quote' && !hasQuote) {
      toast.error('Create a quote first');
      return;
    }

    if (type === 'schedule' && !hasSchedule) {
      toast.error('Set a schedule date first');
      return;
    }

    const action = type === 'quote' ? 'send_quote_to_customer' : 'send_schedule_to_customer';
    const successMessage =
      type === 'quote' ? 'Quote emailed to customer!' : 'Schedule confirmation emailed!';

    const response = await fetch('/api/leads/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: leadId,
        action,
        personal_note: '',
        user_name: currentUser?.name || 'Unknown User',
        user_email: currentUser?.email || '',
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      toast.success(successMessage);
      await onRefresh();
    } else {
      toast.error(result.error || 'Failed to send email');
    }
  };

  const buttonText =
    type === 'quote' ? 'Email Quote to Customer' : 'Email Schedule to Customer';
  const isDisabled = disabled || !canSend;

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
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