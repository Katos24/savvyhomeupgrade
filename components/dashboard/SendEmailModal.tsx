'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send, X, Clock, Mail, Eye } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmailType = 'quote' | 'schedule' | 'payment_reminder';

type SendEmailModalProps = {
  // Control
  open: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;

  // What to send
  type: EmailType;
  leadId: number;
  currentUser: any;

  // Context shown in confirm step
  customerName: string;
  customerEmail?: string | null;
  contextLine?: string | null; // e.g. "Apr 12" for schedule, "$1,200.00 due" for payment

  // History
  lastSentAt?: string | null;
  lastHtmlBody?: string | null; // if available, shows Preview button
};

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<EmailType, { title: string; action: string; icon: typeof Send; color: string }> = {
  quote: {
    title: 'Send Quote?',
    action: 'send_quote_to_customer',
    icon: Send,
    color: '#f97316',
  },
  schedule: {
    title: 'Send Schedule?',
    action: 'send_schedule_to_customer',
    icon: Send,
    color: '#6366f1',
  },
  payment_reminder: {
    title: 'Send Payment Reminder?',
    action: 'send_payment_reminder',
    icon: Send,
    color: '#f59e0b',
  },
};

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return d; }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SendEmailModal({
  open,
  onClose,
  onSuccess,
  type,
  leadId,
  currentUser,
  customerName,
  customerEmail,
  contextLine,
  lastSentAt,
  lastHtmlBody,
}: SendEmailModalProps) {
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const cfg = CONFIG[type];
  const daysSince = lastSentAt
    ? Math.floor((Date.now() - new Date(lastSentAt).getTime()) / 86_400_000)
    : null;

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          action: cfg.action,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          type === 'quote' ? 'Quote sent!' :
          type === 'schedule' ? 'Schedule sent!' :
          'Reminder sent!'
        );
        onClose();
        await onSuccess?.();
      } else {
        toast.error(data.error || 'Failed to send');
      }
    } catch {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* CONFIRM MODAL */}
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={() => !sending && onClose()}
        />
        <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

          {/* Close */}
          <button
            onClick={onClose}
            disabled={sending}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${cfg.color}15` }}>
            <Send className="w-5 h-5" style={{ color: cfg.color }} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-slate-900 mb-1">{cfg.title}</h3>

          {/* Description */}
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            An email will be sent to{' '}
            <span className="font-bold text-slate-800">{customerName}</span>
            {customerEmail ? (
              <> at <span className="font-bold text-slate-800">{customerEmail}</span></>
            ) : null}
            {contextLine ? (
              <> — <span className="font-bold" style={{ color: cfg.color }}>{contextLine}</span></>
            ) : null}.
          </p>

          {/* History chip */}
          <div className={`rounded-xl p-3.5 mb-5 text-xs font-bold flex items-start gap-2.5 ${
            !lastSentAt
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : daysSince === 0
                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                : 'bg-slate-50 border border-slate-200 text-slate-500'
          }`}>
            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              {!lastSentAt ? (
                <p className="font-black">No email sent yet.</p>
              ) : (
                <>
                  <p className="font-black">Last sent: {fmtDate(lastSentAt)}</p>
                  <p className="font-medium mt-0.5">
                    {daysSince === 0
                      ? 'Already sent today — send another?'
                      : `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`
                    }
                  </p>
                </>
              )}
            </div>
            {/* Preview button if html_body available */}
            {lastHtmlBody && (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-current font-black transition hover:opacity-80 shrink-0"
              >
                <Eye className="w-3 h-3" /> View Last
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={sending}
              className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="py-3.5 text-white font-black rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
              style={{ background: cfg.color }}
            >
              {sending
                ? <><Clock className="w-4 h-4 animate-spin" /> Sending...</>
                : <><Send className="w-4 h-4" /> Send It</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      {showPreview && lastHtmlBody && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{ maxHeight: '88vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Email Preview</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 bg-slate-50 p-3 overflow-hidden">
              <iframe
                title="Email Preview"
                srcDoc={lastHtmlBody}
                className="w-full h-full border-0 rounded-xl bg-white"
                style={{ minHeight: '400px' }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}