'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send, X, Clock, Mail, Eye, CheckCircle2, Loader2, Calendar } from 'lucide-react';

export type EmailType = 'quote' | 'schedule' | 'payment_reminder';

type SendEmailModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
  type: EmailType;
  leadId: number;
  currentUser: {
    name?: string;
    email?: string;
  };
  customerName: string;
  customerEmail?: string | null;
  contextLine?: string | null;
  scheduledDateDisplay?: string | null;
  scheduledTimeDisplay?: string | null;
  lastSentAt?: string | null;
  lastHtmlBody?: string | null;
};

const CONFIG: Record<EmailType, { title: string; subtitle: string; action: string; color: string; bg: string }> = {
  quote: {
    title: 'Send Quote?',
    subtitle: 'Official Quote Email',
    action: 'send_quote_to_customer',
    color: '#16a34a', // Emerald 600
    bg: '#dcfce7',
  },
  schedule: {
    title: 'Send Schedule?',
    subtitle: 'Schedule Confirmation',
    action: 'send_schedule_to_customer',
    color: '#0284c7', // Sky 600
    bg: '#e0f2fe',
  },
  payment_reminder: {
    title: 'Send Payment Reminder?',
    subtitle: 'Invoice & Payment Notice',
    action: 'send_payment_reminder',
    color: '#d97706', // Amber 600
    bg: '#fef3c7',
  },
};

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return d;
  }
};

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
  scheduledDateDisplay,
  scheduledTimeDisplay,
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
          type === 'quote'
            ? 'Quote sent successfully!'
            : type === 'schedule'
            ? 'Schedule confirmation sent!'
            : 'Payment reminder sent!'
        );
        onClose();
        await onSuccess?.();
      } else {
        toast.error(data.error || 'Failed to send email');
      }
    } catch {
      toast.error('Connection error. Failed to send.');
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
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => !sending && onClose()}
        />
        
        <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden">
          
          {/* Top color accent bar */}
          <div className="h-1.5 w-full" style={{ background: cfg.color }} />

          <div className="p-6 sm:p-7">
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={sending}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Icon */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{ background: cfg.bg }}
              >
                <Send className="w-5 h-5" style={{ color: cfg.color }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{cfg.title}</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  {cfg.subtitle}
                </p>
              </div>
            </div>

            {/* Recipient Details & Scheduled Time Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Details</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs"
                    style={{ background: cfg.color }}
                  >
                    {customerName ? customerName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{customerName}</p>
                    {customerEmail ? (
                      <p className="text-xs text-slate-500 font-medium truncate">{customerEmail}</p>
                    ) : (
                      <p className="text-xs text-rose-500 font-medium italic">No email address on file</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SCHEDULE TIME / DATE DISPLAY */}
              {type === 'schedule' && (scheduledDateDisplay || scheduledTimeDisplay) && (
                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2.5 bg-blue-50/50 -mx-4 -mb-4 p-3.5 rounded-b-2xl border-b border-blue-100/60">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/80 flex items-center justify-center shrink-0 text-blue-600">
                    <Calendar size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-blue-900/60 uppercase tracking-wider">Scheduled Event</p>
                    <p className="text-xs font-bold text-blue-950 truncate">
                      {scheduledDateDisplay || 'Date unset'}
                      {scheduledTimeDisplay ? ` at ${scheduledTimeDisplay}` : ''}
                    </p>
                  </div>
                </div>
              )}

              {contextLine && type !== 'schedule' && (
                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
                  <p className="text-xs font-semibold" style={{ color: cfg.color }}>{contextLine}</p>
                </div>
              )}
            </div>

            {/* QUOTE ACTION NOTE */}
            {type === 'quote' && (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 mb-4 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-950">Interactive Quote Actions</p>
                  <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                    When sent, the customer can direct accept or decline straight from their email. You’ll be notified instantly, and your dashboard status will auto-update.
                  </p>
                </div>
              </div>
            )}

            {/* HISTORY STATUS: Only displayed if an email was sent previously */}
            {lastSentAt && (
              <div className={`rounded-2xl p-3.5 mb-4 flex items-start gap-3 border ${
                daysSince === 0
                  ? 'bg-amber-50/50 border-amber-100 text-amber-900'
                  : 'bg-slate-50 border-slate-100 text-slate-700'
              }`}>
                <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${
                  daysSince === 0 ? 'text-amber-600' : 'text-slate-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">Last sent {fmtDate(lastSentAt)}</p>
                  <p className="text-[11px] opacity-80 font-medium mt-0.5">
                    {daysSince === 0
                      ? 'Already sent today — click below to resend.'
                      : `Sent ${daysSince} day${daysSince !== 1 ? 's' : ''} ago.`}
                  </p>
                </div>
              </div>
            )}

            {/* Preview Button */}
            {lastHtmlBody && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold transition"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Preview Last Rendered Email
              </button>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold rounded-2xl text-xs transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !customerEmail}
                className="py-3 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-xs"
                style={{
                  background: cfg.color,
                }}
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Send Now</>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      {showPreview && lastHtmlBody && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            style={{ height: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full shrink-0" style={{ background: cfg.color }} />
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Email Template Preview</p>
                  <p className="text-[10px] text-slate-400 font-medium">Read-only render of actual email body</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2 bg-slate-50" style={{ minHeight: 0 }}>
              <iframe
                title="Email Preview"
                srcDoc={`${lastHtmlBody}<style>a,button{pointer-events:none!important;cursor:default!important;}*{user-select:none!important;}</style>`}
                className="w-full border-0 rounded-xl bg-white shadow-2xs"
                style={{ height: '100%', width: '100%', display: 'block' }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}