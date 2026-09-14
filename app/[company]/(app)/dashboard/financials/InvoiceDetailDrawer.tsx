'use client';

import { useEffect } from 'react';
import { X, CreditCard, Calendar, Mail, Receipt, ArrowRight } from 'lucide-react';
import { safeJSONParse } from '@/lib/utils';

// Accepts undefined or null safely
const fmtExact = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

// Accepts undefined or null safely
const fmtDateLong = (d?: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type StateMeta = { label: string; dot: string; text: string; bg: string };

interface LineItem {
  description?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
}

interface InvoiceDetailDrawerProps {
  project: {
    invoice_number?: string;
    customer_name?: string;
    customer_email?: string;
    _total?: number;
    _collected?: number;
    _owed?: number;
    payment_method?: string;
    invoice_sent_at?: string | null;
    payment_due_date?: string | null;
    quote_data?: string;
    // Added — phase-aware fields deriveInvoiceRow already computes,
    // plus deposit_paid_at and paid_at (project columns, already
    // mirrored onto the invoice row) so this drawer can show the
    // job's whole real history at once, not one field elected as "the"
    // sent/paid date.
    _billingPhase?: 'deposit' | 'balance' | null;
    _collectedUnsent?: boolean;
    inv_deposit_sent_at?: string | null;
    inv_sent_at?: string | null;
    deposit_paid_at?: string | null;
    paid_at?: string | null;
  };
  stateMeta: StateMeta;
  onOpenBilling: () => void;
  onClose: () => void;
}

export default function InvoiceDetailDrawer({
  project,
  stateMeta,
  onOpenBilling,
  onClose,
}: InvoiceDetailDrawerProps) {
  const lineItems: LineItem[] = safeJSONParse(project.quote_data) || [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-stone-50 shadow-2xl transition-transform duration-300 animate-in slide-in-from-right sm:border-l sm:border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                {project.invoice_number || 'Draft Invoice'}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: stateMeta.bg, color: stateMeta.text }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: stateMeta.dot }}
                />
                {stateMeta.label}
              </span>
            </div>
            <h3 id="drawer-title" className="mt-0.5 truncate text-lg font-semibold text-stone-900">
              {project.customer_name || 'Unnamed Client'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-baseline justify-between border-b border-stone-100 pb-3">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Amount Owed
              </span>
              <span className="text-2xl font-bold tabular-nums text-stone-900">
                {fmtExact(project._owed)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block">Total Invoice</span>
                <span className="text-sm font-semibold text-stone-700 tabular-nums">
                  {fmtExact(project._total)}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">Total Collected</span>
                <span className="text-sm font-semibold text-emerald-700 tabular-nums">
                  {fmtExact(project._collected)}
                </span>
              </div>
            </div>

            {project.payment_method && (
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">Payment Method</span>
                <span className="font-medium text-stone-800 capitalize bg-stone-100 px-2 py-0.5 rounded">
                  {project.payment_method.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm space-y-3">
            {project.inv_deposit_sent_at || project.deposit_paid_at || project.inv_sent_at || project.paid_at ? (
              <>
                {/* Full real history — each line only appears if that
                    field actually has a value. Was a single "Sent Date"
                    field elected by whatever phase is currently active,
                    which threw away real facts (the deposit's own dates
                    just disappeared once the job moved into its balance
                    phase). This shows everything the data actually
                    knows, unconditionally. */}
                {project.inv_deposit_sent_at && (
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
                      <span className="text-stone-500">Deposit Sent</span>
                    </div>
                    <span className="font-medium text-stone-800">{fmtDateLong(project.inv_deposit_sent_at)}</span>
                  </div>
                )}
                {project.deposit_paid_at && (
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
                      <span className="text-stone-500">Deposit Paid</span>
                    </div>
                    <span className="font-medium text-emerald-700">{fmtDateLong(project.deposit_paid_at)}</span>
                  </div>
                )}
                {project.inv_sent_at && (
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
                      <span className="text-stone-500">Balance Sent</span>
                    </div>
                    <span className="font-medium text-stone-800">{fmtDateLong(project.inv_sent_at)}</span>
                  </div>
                )}
                {project.paid_at && (
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
                      <span className="text-stone-500">Balance Paid</span>
                    </div>
                    <span className="font-medium text-emerald-700">{fmtDateLong(project.paid_at)}</span>
                  </div>
                )}
                {project._collectedUnsent && (
                  <div className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-medium text-violet-700">
                    {fmtExact(project._collected)} collected — nothing invoiced for this phase yet
                  </div>
                )}
              </>
            ) : (
              // No deposit terms at all — only one phase ever existed,
              // so the legacy single field is already correct here.
              <div className="flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
                  <span className="text-stone-500">Sent Date</span>
                </div>
                <span className="font-medium text-stone-800">{fmtDateLong(project.invoice_sent_at)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-stone-400 shrink-0" />
                <span className="text-stone-500">Due Date</span>
              </div>
              <span className="font-medium text-stone-800">{fmtDateLong(project.payment_due_date)}</span>
            </div>

            {project.customer_email && (
              <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2 shrink-0">
                  <Mail className="h-4 w-4 text-stone-400 shrink-0" />
                  <span className="text-stone-500">Email</span>
                </div>
                <span className="truncate pl-3 font-medium text-stone-800" title={project.customer_email}>
                  {project.customer_email}
                </span>
              </div>
            )}
          </div>

          {lineItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Line Items ({lineItems.length})
              </h4>
              <div className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm divide-y divide-stone-100">
                {lineItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3.5 transition-colors hover:bg-stone-50/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-stone-900">
                        {item.description || 'Item Description'}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Qty: {item.quantity || 1}
                        {item.rate ? ` × ${fmtExact(item.rate)}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-stone-900">
                      {fmtExact(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 bg-white px-6 py-4">
          <button
            onClick={onOpenBilling}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1"
          >
            <CreditCard className="h-4 w-4" />
            <span>Open Full Billing</span>
            <ArrowRight className="h-3.5 w-3.5 text-teal-200 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}