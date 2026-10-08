'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Send, X, Clock, Mail, Eye, Loader2, Calendar, FileText, Receipt, Bell, AlertTriangle } from 'lucide-react';

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

// Same shape as app/api/leads/[id]/send-preview/route.ts
type QuotePreview = {
  total: number;
  itemCount: number;
  deposit: { amount: number; label?: string } | null;
  autoDeposit: boolean;
  payLink: boolean;
  acceptedAt: string | null;
  declinedAt: string | null;
  depositPaid: boolean;
  paidAmount: number;
};

const CONFIG: Record<EmailType, { title: string; subtitle: string; action: string; success: string; Icon: typeof Send }> = {
  quote: {
    title: 'Send quote',
    subtitle: 'Quote email with Accept and Decline buttons',
    action: 'send_quote_to_customer',
    success: 'Quote sent',
    Icon: FileText,
  },
  schedule: {
    title: 'Send schedule',
    subtitle: 'Appointment confirmation email',
    action: 'send_schedule_to_customer',
    success: 'Schedule confirmation sent',
    Icon: Calendar,
  },
  payment_reminder: {
    title: 'Send payment reminder',
    subtitle: 'Payment reminder email',
    action: 'send_payment_reminder',
    success: 'Payment reminder sent',
    Icon: Bell,
  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

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

const fmtDay = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  // Quote only: what the customer gets and what happens when they answer.
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  // Second tap for resending a quote the customer already accepted.
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!open || type !== 'quote' || !leadId) return;
    let alive = true;
    setConfirmReset(false);
    setQuoteLoading(true);
    fetch(`/api/leads/${leadId}/send-preview`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.success) setQuote(d.preview);
      })
      .catch(() => {})
      .finally(() => alive && setQuoteLoading(false));
    return () => {
      alive = false;
    };
  }, [open, type, leadId]);

  const cfg = CONFIG[type];
  const firstName = customerName?.split(' ')[0] || 'the customer';
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
          ...(type === 'quote' && confirmReset ? { confirm_resend_accepted: true } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(cfg.success);
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

  const Icon = cfg.Icon;
  const isResend = !!lastSentAt;

  // Quote resend rules (the server enforces the same ones):
  // - money already collected → can't resend (the quote is locked, like tax/deposit)
  // - accepted, nothing paid → allowed only after ticking the confirm box
  const quotePaidLocked = type === 'quote' && !!quote && (quote.paidAmount > 0 || quote.depositPaid);
  const needsResetConfirm = type === 'quote' && !!quote?.acceptedAt && !quotePaidLocked;
  const sendBlocked = quotePaidLocked || (needsResetConfirm && !confirmReset);

  // What happens when the customer taps Accept.
  const acceptLine = (() => {
    if (!quote) return null;
    if (quote.deposit && !quote.depositPaid) {
      if (quote.autoDeposit) {
        return quote.payLink
          ? `${firstName} gets the ${fmt(quote.deposit.amount)} deposit request right away and can pay by card on the spot.`
          : `${firstName} gets the ${fmt(quote.deposit.amount)} deposit request by email right away. No card payment button — Stripe isn't connected yet.`;
      }
      return `You send the ${fmt(quote.deposit.amount)} deposit request yourself from the Invoice tab. To send it automatically, turn on Auto invoices in Settings.`;
    }
    return 'You get an email letting you know.';
  })();

  return (
    <>
      {/* CONFIRM MODAL */}
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => !sending && onClose()}
        />

        <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden max-h-[92vh] flex flex-col">
          <div className="flex justify-center pt-3 sm:hidden">
            <div className="w-9 h-1 rounded-full bg-slate-200" />
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto">
            {/* Close */}
            <button
              onClick={onClose}
              disabled={sending}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pr-8">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-slate-700" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {isResend ? cfg.title.replace('Send', 'Resend') : cfg.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{cfg.subtitle}</p>
              </div>
            </div>

            {/* Recipient */}
            <div className="rounded-xl border border-slate-200 p-3.5 mb-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">To</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {customerName ? customerName.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{customerName}</p>
                  {customerEmail ? (
                    <p className="text-xs text-slate-500 truncate">{customerEmail}</p>
                  ) : (
                    <p className="text-xs text-red-600">No email on file — add one on the job first</p>
                  )}
                </div>
              </div>

              {/* Schedule date / time */}
              {type === 'schedule' && (scheduledDateDisplay || scheduledTimeDisplay) && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {scheduledDateDisplay || 'Date not set'}
                    {scheduledTimeDisplay ? ` at ${scheduledTimeDisplay}` : ''}
                  </p>
                </div>
              )}

              {/* Other context (e.g. reminder amount) */}
              {contextLine && type === 'payment_reminder' && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-slate-400 shrink-0" />
                  <p className="text-sm font-semibold text-slate-900">{contextLine}</p>
                </div>
              )}
            </div>

            {/* QUOTE: what they get + what happens when they answer */}
            {type === 'quote' && (
              <div className="rounded-xl border border-slate-200 mb-3 overflow-hidden">
                {quoteLoading && !quote ? (
                  <div className="flex items-center gap-2 px-3.5 py-3 text-xs text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking the saved quote…
                  </div>
                ) : quote ? (
                  <>
                    {/* Amounts */}
                    <div className="px-3.5 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-xs text-slate-500">
                          Quote total{quote.itemCount > 0 ? ` · ${quote.itemCount} item${quote.itemCount === 1 ? '' : 's'}` : ''}
                        </p>
                        <p className="text-base font-bold text-slate-900 tabular-nums">{fmt(quote.total)}</p>
                      </div>
                      {quote.deposit && (
                        <>
                          <div className="mt-1.5 flex items-baseline justify-between gap-3">
                            <p className="text-xs text-slate-500">
                              Deposit to get started{quote.deposit.label ? ` (${quote.deposit.label})` : ''}
                            </p>
                            <p className="text-sm font-semibold text-slate-900 tabular-nums">{fmt(quote.deposit.amount)}</p>
                          </div>
                          <div className="mt-0.5 flex items-baseline justify-between gap-3">
                            <p className="text-xs text-slate-400">Balance on completion</p>
                            <p className="text-xs text-slate-400 tabular-nums">{fmt(quote.total - quote.deposit.amount)}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* When they accept */}
                    <div className="border-t border-slate-100 bg-slate-50 px-3.5 py-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">When they accept</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{acceptLine}</p>
                    </div>
                  </>
                ) : (
                  // Preview failed: fall back to what the caller passed in.
                  <div className="px-3.5 py-3 text-xs text-slate-600">
                    {contextLine ? `Quote total ${contextLine}. ` : ''}
                    {firstName} can accept or decline straight from the email.
                  </div>
                )}
              </div>
            )}

            {/* QUOTE: already paid — locked */}
            {quotePaidLocked && quote && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 mb-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-px" />
                <p className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold">
                    {firstName} has already paid {fmt(quote.paidAmount)} on this quote, so it can&rsquo;t be sent again.
                  </span>{' '}
                  For extra work or changes, update the invoice instead.
                </p>
              </div>
            )}

            {/* QUOTE: accepted, nothing paid — resending resets it, needs a confirm tap */}
            {needsResetConfirm && quote?.acceptedAt && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 mb-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-px" />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-semibold">{firstName} already accepted this quote on {fmtDay(quote.acceptedAt)}.</span>{' '}
                    Sending it again clears that, and they&rsquo;ll need to accept again.
                  </p>
                </div>
                <label className="mt-3 flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmReset}
                    onChange={(e) => setConfirmReset(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-300 text-slate-900 focus:ring-slate-400"
                  />
                  <span className="text-xs font-semibold text-amber-900">Yes, send it again and reset the acceptance</span>
                </label>
              </div>
            )}
            {type === 'quote' && !quote?.acceptedAt && quote?.declinedAt && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 mb-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0 mt-px" />
                <p className="text-xs text-slate-700 leading-relaxed">
                  {firstName} declined this quote on {fmtDay(quote.declinedAt)}. Sending it again lets them accept or decline again.
                </p>
              </div>
            )}

            {/* Last sent */}
            {lastSentAt && (
              <div
                className={`rounded-xl p-3.5 mb-3 flex items-start gap-2.5 border ${
                  daysSince === 0 ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <Clock className={`w-4 h-4 shrink-0 mt-px ${daysSince === 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Last sent {fmtDate(lastSentAt)}</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {daysSince === 0
                      ? 'Already sent today. Sending again emails it a second time.'
                      : `Sent ${daysSince} day${daysSince !== 1 ? 's' : ''} ago.`}
                  </p>
                </div>
                {lastHtmlBody && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="w-3 h-3" /> View
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-1" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !customerEmail || sendBlocked}
                className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> {isResend ? 'Send again' : 'Send now'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LAST SENT EMAIL PREVIEW */}
      {showPreview && lastHtmlBody && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            style={{ height: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Last sent email</p>
                  <p className="text-[10px] text-slate-400">
                    Exactly what {firstName} received{lastSentAt ? ` on ${fmtDate(lastSentAt)}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2 bg-slate-50" style={{ minHeight: 0 }}>
              <iframe
                title="Email Preview"
                srcDoc={`${lastHtmlBody}<style>a,button,input,select,textarea,label,form,area,summary,[role="button"],[onclick]{pointer-events:none!important;cursor:default!important}</style>`}
                className="w-full border-0 rounded-xl bg-white"
                style={{ height: '100%', width: '100%', display: 'block' }}
                sandbox=""
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}