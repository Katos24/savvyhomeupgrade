'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send, X, Clock, Mail, Eye } from 'lucide-react';

export type EmailType = 'quote' | 'schedule' | 'payment_reminder';

type SendEmailModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
  type: EmailType;
  leadId: number;
  currentUser: any;
  customerName: string;
  customerEmail?: string | null;
  contextLine?: string | null;
  lastSentAt?: string | null;
  lastHtmlBody?: string | null;
};

const CONFIG: Record<EmailType, { title: string; action: string; color: string; bg: string }> = {
  quote: {
    title: 'Send Quote?',
    action: 'send_quote_to_customer',
    color: '#1a6645',
    bg: '#dcfce7',
  },
  schedule: {
    title: 'Send Schedule?',
    action: 'send_schedule_to_customer',
    color: '#0891b2',
    bg: '#e0f2fe',
  },
  payment_reminder: {
    title: 'Send Payment Reminder?',
    action: 'send_payment_reminder',
    color: '#d97706',
    bg: '#fef3c7',
  },
};

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return d; }
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => !sending && onClose()}
        />
        <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 overflow-hidden">

          {/* Top color bar */}
          <div className="h-1 w-full" style={{ background: cfg.color }} />

          <div className="p-6 sm:p-7">

            {/* Close */}
            <button
              onClick={onClose}
              disabled={sending}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon + title row */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: cfg.bg }}
              >
                <Send className="w-5 h-5" style={{ color: cfg.color }} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">{cfg.title}</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-widest">
                  {type === 'quote' ? 'Quote Email' : type === 'schedule' ? 'Schedule Confirmation' : 'Payment Reminder'}
                </p>
              </div>
            </div>

            {/* Recipient info */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sending to</p>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ background: cfg.color }}
                >
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{customerName}</p>
                  {customerEmail && (
                    <p className="text-[11px] text-slate-400 font-medium truncate">{customerEmail}</p>
                  )}
                </div>
              </div>
              {contextLine && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
                  <p className="text-xs font-bold" style={{ color: cfg.color }}>{contextLine}</p>
                </div>
              )}
            </div>

            {/* History chip */}
            <div className={`rounded-xl p-3 mb-4 flex items-start gap-2.5 ${
              !lastSentAt
                ? 'bg-emerald-50 border border-emerald-100'
                : daysSince === 0
                  ? 'bg-amber-50 border border-amber-100'
                  : 'bg-slate-50 border border-slate-100'
            }`}>
              <Clock className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                !lastSentAt ? 'text-emerald-500' : daysSince === 0 ? 'text-amber-500' : 'text-slate-400'
              }`} />
              <div className="flex-1">
                {!lastSentAt ? (
                  <p className="text-xs font-black text-emerald-700">No email sent yet — first send.</p>
                ) : (
                  <>
                    <p className={`text-xs font-black ${daysSince === 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                      Last sent {fmtDate(lastSentAt)}
                    </p>
                    <p className={`text-[11px] font-medium mt-0.5 ${daysSince === 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {daysSince === 0
                        ? 'Already sent today — send another?'
                        : `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Preview button */}
            {lastHtmlBody && (
              <button
                onClick={() => setShowPreview(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 text-xs font-bold transition"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Last Email
              </button>
            )}

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
                className="py-3.5 text-white font-black rounded-2xl text-sm transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                style={{
                  background: cfg.color,
                  boxShadow: `0 8px 20px -4px ${cfg.color}50`,
                }}
              >
                {sending
                  ? <><Clock className="w-4 h-4 animate-spin" /> Sending...</>
                  : <><Send className="w-4 h-4" /> Send It</>
                }
              </button>
            </div>

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
            style={{ height: '88vh', maxHeight: '88vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1 w-full shrink-0" style={{ background: cfg.color }} />
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                </div>
                <p className="text-sm font-black text-slate-800">Email Preview</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3" style={{ minHeight: 0 }}>
              <iframe
                title="Email Preview"
                srcDoc={`${lastHtmlBody}<style>a,button{pointer-events:none!important;cursor:default!important;}*{user-select:none!important;}</style>`}
                className="w-full border-0 rounded-xl bg-white"
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