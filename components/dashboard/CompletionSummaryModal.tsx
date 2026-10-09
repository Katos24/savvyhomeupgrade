'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star, Receipt, Loader2 } from 'lucide-react';

type CompletionSummaryModalProps = {
  lead: any;
  onConfirm: (sendReview: boolean) => void;
  onCancel: () => void;
};

type CheckItem = { label: string; done: boolean; detail?: string };

// Same shape as app/api/leads/[id]/completion-preview/route.ts
type Preview = {
  invoice:
    | { state: 'will_send'; amount: number; kind: 'deposit' | 'balance' | 'full'; email: string; payLink: boolean }
    | { state: 'off' | 'plan' | 'paid' | 'no_email' | 'no_items' }
    | { state: 'already_sent'; sentAt: string };
  review:
    | { state: 'can_send'; email: string }
    | { state: 'plan' | 'no_email' | 'no_link' }
    | { state: 'already_sent'; sentAt: string };
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Parses a JSON array field that may arrive as a string, an array, or not at all.
// Returns null when the field isn't present on this lead object (e.g. opened
// from the board, where the list data doesn't carry photos/tasks) so we skip
// the check instead of wrongly calling it "missing".
const parseList = (val: any): any[] | null => {
  if (val === undefined) return null;
  if (val === null) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function CompletionSummaryModal({ lead, onConfirm, onCancel }: CompletionSummaryModalProps) {
  // On by default — most finished jobs should get a review ask. The toggle
  // exists because the app can't know when a job ended badly.
  const [sendReview, setSendReview] = useState(true);

  // What the server will actually do on completion (invoice + review).
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lead?.id) {
      setLoading(false);
      return;
    }
    let alive = true;
    fetch(`/api/leads/${lead.id}/completion-preview`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.success) setPreview(d.preview);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [lead?.id]);

  const firstName = lead?.name?.split(' ')[0] || 'the customer';

  // ── Money ──
  const total = parseFloat(lead?.quote_total || '0') || 0;
  const paid = parseFloat(lead?.payment_amount || '0') || 0;
  const balance = Math.max(Math.round((total - paid) * 100) / 100, 0);
  const paidInFull = total > 0 && balance <= 0;

  // ── Review: server answer when we have it, otherwise the old lead-only check ──
  const fallbackCanAsk = !!lead?.email && !lead?.review_request_sent_at;
  const reviewAllowed = preview ? preview.review.state === 'can_send' : fallbackCanAsk;
  const reviewOn = reviewAllowed && sendReview;

  const invoiceWillSend = preview?.invoice.state === 'will_send';

  // ── Checklist (only items we actually have data for) ──
  const quoteItems = parseList(lead?.quote_data);
  const afterPhotos = parseList(lead?.after_photos);
  const documents = parseList(lead?.documents);
  const tasks = parseList(lead?.tasks);
  const receipts = documents ? documents.filter((d: any) => d?.type === 'receipt') : null;
  const openTasks = tasks ? tasks.filter((t: any) => !t?.completed) : null;

  const checks: CheckItem[] = [
    { label: 'Scheduled', done: !!lead?.scheduled_date },
    ...(quoteItems
      ? [{
          label: 'Quote',
          done: quoteItems.length > 0,
          detail: quoteItems.length > 0 ? `${quoteItems.length} item${quoteItems.length === 1 ? '' : 's'}` : undefined,
        }]
      : []),
    ...(total > 0 ? [{ label: 'Paid in full', done: paidInFull }] : []),
    ...(afterPhotos
      ? [{
          label: 'After photos',
          done: afterPhotos.length > 0,
          detail: afterPhotos.length > 0 ? `${afterPhotos.length}` : undefined,
        }]
      : []),
    ...(receipts
      ? [{
          label: 'Receipts',
          done: receipts.length > 0,
          detail: receipts.length > 0 ? `${receipts.length}` : undefined,
        }]
      : []),
    ...(openTasks && tasks && tasks.length > 0
      ? [{
          label: 'Tasks',
          done: openTasks.length === 0,
          detail: openTasks.length > 0 ? `${openTasks.length} open` : 'All done',
        }]
      : []),
  ];

  const missingCount = checks.filter((c) => !c.done).length;

  // ── Invoice line: what happens to the money when this is completed ──
  const invoiceLine = ((): { title: string; sub?: string; tone: 'send' | 'warn' | 'ok' | 'muted' } | null => {
    if (!preview) {
      // Couldn't load the preview: say only what we know for sure.
      if (total <= 0) return null;
      if (balance <= 0) return { title: 'Paid in full', tone: 'ok' };
      return { title: `${fmt(balance)} still owed`, sub: 'You can collect it from the Invoice tab after completing.', tone: 'warn' };
    }
    const inv = preview.invoice;
    switch (inv.state) {
      case 'will_send':
        return {
          title: `Final invoice for ${fmt(inv.amount)} will be emailed to ${firstName}`,
          sub: inv.payLink
            ? `Sent to ${inv.email} with a card payment button.`
            : `Sent to ${inv.email}. Card payments are off, so it uses your pay link if you have one.`,
          tone: 'send',
        };
      case 'paid':
        return total > 0 ? { title: 'Paid in full — no invoice needed', tone: 'ok' } : null;
      case 'already_sent':
        return {
          title: `${fmt(balance)} still owed`,
          sub: `Final invoice already sent ${fmtDay(inv.sentAt)}, so it won't be sent again.`,
          tone: 'warn',
        };
      case 'no_email':
        return {
          title: `${fmt(balance)} still owed`,
          sub: `No email on file for ${firstName}, so the final invoice can't go out automatically.`,
          tone: 'warn',
        };
      case 'no_items':
        return {
          title: `${fmt(balance)} still owed`,
          sub: 'The quote has no line items, so no invoice will be sent automatically.',
          tone: 'warn',
        };
      case 'off':
      case 'plan':
      default:
        if (balance <= 0) return total > 0 ? { title: 'Paid in full — no invoice needed', tone: 'ok' } : null;
        return {
          title: `${fmt(balance)} still owed`,
          sub: 'No invoice goes out automatically. Send it from the Invoice tab, or turn on Auto invoices in Settings.',
          tone: 'warn',
        };
    }
  })();

  // ── Review line when the switch isn't available ──
  const reviewNote = (() => {
    if (preview) {
      const rv = preview.review;
      switch (rv.state) {
        case 'already_sent':
          return `Review request already sent ${fmtDay(rv.sentAt)}`;
        case 'no_email':
          return `No email on file for ${firstName}, so no review request`;
        case 'no_link':
          return 'Add your Google review link in Settings to ask for reviews';
        case 'plan':
          return 'Google review requests are on the Pro plan';
        default:
          return null;
      }
    }
    if (lead?.review_request_sent_at) return `Review request already sent ${fmtDay(lead.review_request_sent_at)}`;
    if (!lead?.email) return `No email on file for ${firstName}, so no review request`;
    return null;
  })();

  const reviewEmail = preview?.review.state === 'can_send' ? preview.review.email : lead?.email;

  const confirmLabel = invoiceWillSend ? 'Complete & send invoice' : 'Mark complete';

  const toneClasses: Record<'send' | 'warn' | 'ok' | 'muted', string> = {
    send: 'border-slate-200 bg-slate-50 text-slate-900',
    warn: 'border-amber-100 bg-amber-50 text-amber-900',
    ok: 'border-emerald-100 bg-emerald-50 text-emerald-800',
    muted: 'border-slate-200 bg-white text-slate-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 32, stiffness: 340 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:pt-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Complete job</p>
            <h3 className="mt-0.5 text-lg font-bold text-slate-900 truncate">{lead?.name || 'This job'}</h3>
            {lead?.category && (
              <p className="text-xs text-slate-500 capitalize">{String(lead.category).replace(/_/g, ' ')}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-2 -mr-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 space-y-4 overflow-y-auto">
          {/* Money */}
          {total > 0 && (
            <div className="grid grid-cols-3 rounded-xl border border-slate-200 divide-x divide-slate-200">
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">{fmt(total)}</p>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collected</p>
                <p className="text-sm font-bold text-emerald-700 tabular-nums">{fmt(paid)}</p>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Balance</p>
                <p className={`text-sm font-bold tabular-nums ${balance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {fmt(balance)}
                </p>
              </div>
            </div>
          )}

          {/* Checklist */}
          {checks.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500">
                {missingCount === 0 ? 'Everything is in place' : `${missingCount} thing${missingCount === 1 ? '' : 's'} not done — fine to complete anyway`}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {checks.map((c) => (
                  <div
                    key={c.label}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${c.done ? 'bg-slate-50' : 'bg-white border border-dashed border-slate-200'}`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        c.done ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {c.done && <Check className="w-2.5 h-2.5" strokeWidth={3.5} />}
                    </span>
                    <span className={`text-sm font-medium truncate ${c.done ? 'text-slate-800' : 'text-slate-500'}`}>
                      {c.label}
                    </span>
                    {c.detail && <span className="ml-auto text-[13px] text-slate-600 shrink-0">{c.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What happens next */}
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500">When you mark this complete</p>

            {loading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Checking invoice and review settings…
              </div>
            ) : (
              <div className="space-y-2">
                {/* Invoice */}
                {invoiceLine && (
                  <div className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 ${toneClasses[invoiceLine.tone]}`}>
                    {invoiceLine.tone === 'ok' ? (
                      <Check className="w-4 h-4 shrink-0 mt-px text-emerald-600" strokeWidth={3} />
                    ) : (
                      <Receipt
                        className={`w-4 h-4 shrink-0 mt-px ${invoiceLine.tone === 'warn' ? 'text-amber-500' : 'text-slate-500'}`}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug">{invoiceLine.title}</p>
                      {invoiceLine.sub && (
                        <p className={`mt-0.5 text-[13px] leading-relaxed ${invoiceLine.tone === 'warn' ? 'text-amber-800' : 'text-slate-600'}`}>
                          {invoiceLine.sub}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Review request */}
                <div className="rounded-xl border border-slate-200 px-3.5 py-3">
                  {reviewAllowed ? (
                    <button
                      type="button"
                      onClick={() => setSendReview((v) => !v)}
                      className="w-full flex items-center gap-3 text-left"
                      role="switch"
                      aria-checked={sendReview}
                    >
                      <Star
                        className={`w-4 h-4 shrink-0 ${sendReview ? 'text-amber-400' : 'text-slate-300'}`}
                        fill={sendReview ? 'currentColor' : 'none'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">Ask {firstName} for a Google review</p>
                        <p className="text-[13px] text-slate-600 truncate">
                          {sendReview
                            ? `Review email goes to ${reviewEmail || firstName}`
                            : 'No review email will be sent'}
                        </p>
                      </div>
                      <span
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                          sendReview ? 'bg-slate-900' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                            sendReview ? 'left-[18px]' : 'left-0.5'
                          }`}
                        />
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 shrink-0 text-slate-300" />
                      <p className="text-xs text-slate-500">{reviewNote || 'No review request will be sent'}</p>
                    </div>
                  )}
                </div>

                {!invoiceWillSend && !reviewOn && (
                  <p className="px-1 text-[13px] text-slate-600">Nothing will be emailed to {firstName}.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="grid grid-cols-2 gap-2.5 px-5 pt-3"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onCancel}
            className="py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reviewOn)}
            disabled={loading}
            className="py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-wait text-sm font-semibold text-white transition active:scale-[0.98] inline-flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}