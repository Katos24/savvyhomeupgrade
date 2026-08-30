'use client';

import { X, CreditCard } from 'lucide-react';
import { safeJSONParse } from '@/lib/utils';

const fmtExact = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
const fmtDateLong = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

type StateMeta = { label: string; dot: string; text: string; bg: string };

export default function InvoiceDetailDrawer({
  project,
  stateMeta,
  onOpenBilling,
  onClose,
}: {
  project: any;
  stateMeta: StateMeta;
  onOpenBilling: () => void;
  onClose: () => void;
}) {
  const lineItems = safeJSONParse(project.quote_data) || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-[12px] text-stone-500">{project.invoice_number || 'No invoice #'}</p>
            <h3 className="text-base font-semibold text-stone-900">{project.customer_name || 'Unnamed'}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <span
            className="mb-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ backgroundColor: stateMeta.bg, color: stateMeta.text }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stateMeta.dot }} />
            {stateMeta.label}
          </span>

          <div className="mb-5 space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-stone-500">Total</span>
              <span className="text-[13px] font-medium tabular-nums text-stone-900">{fmtExact(project._total)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-stone-500">Collected</span>
              <span className="text-[13px] font-medium tabular-nums text-teal-800">{fmtExact(project._collected)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-stone-200 pt-2">
              <span className="text-[12px] text-stone-500">Owed</span>
              <span className="text-[15px] font-semibold tabular-nums text-stone-900">{fmtExact(project._owed)}</span>
            </div>
            {project.payment_method && (
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] text-stone-500">Method</span>
                <span className="text-[13px] text-stone-700 capitalize">{project.payment_method.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          <div className="mb-5 space-y-2 text-[13px] text-stone-600">
            <div className="flex items-baseline justify-between">
              <span className="text-stone-500">Sent</span>
              <span>{fmtDateLong(project.invoice_sent_at)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-stone-500">Due</span>
              <span>{fmtDateLong(project.payment_due_date)}</span>
            </div>
            {project.customer_email && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-stone-500">Email</span>
                <span className="min-w-0 truncate text-right">{project.customer_email}</span>
              </div>
            )}
          </div>

          {lineItems.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-stone-500">Line items</p>
              <div className="divide-y divide-stone-100 rounded-xl border border-stone-200">
                {lineItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-stone-800">{item.description || '—'}</p>
                      <p className="text-[12px] text-stone-400">Qty {item.quantity || 1}</p>
                    </div>
                    <span className="shrink-0 text-[13px] tabular-nums text-stone-900">{fmtExact(item.amount || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

              <div className="border-t border-stone-200 px-5 py-4">
          <button
            onClick={onOpenBilling}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-700 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-teal-800"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Open Full Billing
          </button>
        </div>
      </div>
    </div>
  );
}