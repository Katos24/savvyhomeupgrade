'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, X, CheckCircle2, Send } from 'lucide-react';

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
        toast.success(type === 'quote' ? 'Quote emailed successfully!' : 'Schedule sent successfully!');
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
    ? 'Processing...'
    : type === 'quote' ? 'Email Quote' : 'Email Schedule';

  const fmtDate = (d: string) => {
    const utcString = d.endsWith('Z') ? d : d + 'Z';
    return new Date(utcString).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={handleClick}
          disabled={isDisabled}
          // Changed to Slate/Zinc to differ from the Indigo "Save" button
          className="w-full h-10 inline-flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-900 active:bg-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] shadow-sm"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 text-slate-400" />
          )}
          {buttonLabel}
        </button>

        {sentAt && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-700 font-black uppercase tracking-tight">
              Last Sent {fmtDate(sentAt)}
            </span>
          </div>
        )}
      </div>

      {/* Modern Pop-up Overlay */}
      {showConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ zIndex: 9999 }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[280px] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">
                  {type === 'quote' ? 'Send Digital Quote?' : 'Send Schedule?'}
                </h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed px-2">
                  The customer will receive an email with {type === 'quote' ? 'pricing details' : 'the arrival time'}.
                </p>
              </div>

              {sentAt && (
                <div className="py-2 px-3 bg-amber-50 rounded-xl border border-amber-100 inline-block">
                   <p className="text-[9px] text-amber-700 font-bold uppercase tracking-tighter">
                    Re-sending: Last sent {fmtDate(sentAt)}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex flex-col gap-2">
              <button 
                onClick={handleConfirm}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-200"
              >
                {sending ? 'Sending...' : 'Confirm & Send'}
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold text-[11px] uppercase tracking-widest rounded-xl transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}