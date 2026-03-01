'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, X } from 'lucide-react';

type SendCustomerEmailButtonsProps = {
  leadId: number;
  type: 'quote' | 'schedule';
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasQuote?: boolean;
  hasSchedule?: boolean;
  quoteSentAt?: string | null;
  scheduleSentAt?: string | null;
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
  scheduleSentAt = null,
  disabled = false,
}: SendCustomerEmailButtonsProps) {
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const sentAt = type === 'quote' ? quoteSentAt : scheduleSentAt;

  const handleClick = () => {
    if (type === 'quote' && !hasQuote) { toast.error('Create a quote first'); return; }
    if (type === 'schedule' && !hasSchedule) { toast.error('Set a schedule date first'); return; }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setSending(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          action: type === 'quote' ? 'send_quote_to_customer' : 'send_schedule_to_customer',
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(type === 'quote' ? 'Quote emailed to customer!' : 'Schedule confirmation emailed!');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const isDisabled = disabled || sending ||
    (type === 'quote' && !hasQuote) ||
    (type === 'schedule' && !hasSchedule);

  const buttonLabel = sending
    ? 'Sending...'
    : type === 'quote' ? 'Email Quote to Customer' : 'Email Schedule to Customer';

 const fmtDate = (d: string) => {
  const utcString = d.endsWith('Z') ? d : d + 'Z';
  return new Date(utcString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handleClick}
          disabled={isDisabled}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition text-sm"
        >
          <Mail className="w-3.5 h-3.5" />
          {buttonLabel}
        </button>

        {sentAt && (
          <p className="text-xs text-green-600 font-semibold text-center">
            ✓ Last sent {fmtDate(sentAt)}
          </p>
        )}
      </div>

      {/* Confirm popup */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-sm">
                {type === 'quote' ? 'Send Quote Email?' : 'Send Schedule Email?'}
              </p>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-gray-600">
                This will email the {type === 'quote' ? 'quote' : 'schedule confirmation'} to the customer.
              </p>
              {sentAt && (
                <p className="text-xs text-gray-400 mt-2">
                  Last sent: <strong className="text-gray-600">{fmtDate(sentAt)}</strong>
                </p>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}