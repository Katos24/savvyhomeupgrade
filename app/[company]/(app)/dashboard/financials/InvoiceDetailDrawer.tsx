'use client';

import { useEffect } from 'react';
import { X, CreditCard, Calendar, Mail, Receipt, ArrowRight, AlertCircle } from 'lucide-react';
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
    deposit_due_date?: string | null;
    quote_data?: string;
    // Phase-aware fields deriveInvoiceRow already computes, plus
    // deposit_paid_at and paid_at (project columns, mirrored onto the
    // invoice row) so this drawer can show the job's whole history.
    _billingPhase?: 'deposit' | 'balance' | null;
    _collectedUnsent?: boolean;
    inv_deposit_sent_at?: string | null;
    inv_sent_at?: string | null;
    deposit_paid_at?: string | null;
    paid_at?: string | null;
    // Card fees on this job's payments (from the Financials page query).
    stripe_fees?: string | number | null;
    platform_fees?: string | number | null;
  };
  stateMeta: StateMeta;
  onOpenBilling: () => void;
  onClose: () => void;
  /** Same app-controlled theme flag the Financials list uses. */
  isDark?: boolean;
}

// Theme tokens driven by the app's isDark flag (not the OS setting),
// so the drawer always matches the Financials page behind it.
const drawerTokens = (isDark: boolean) =>
  isDark
    ? {
        panel: 'bg-slate-950 sm:border-slate-800',
        bar: 'border-slate-800 bg-slate-900',
        card: 'rounded-2xl border border-slate-800 bg-slate-900 shadow-sm',
        divider: 'border-slate-800',
        divide: 'divide-slate-800',
        label: 'text-sm text-slate-400',
        value: 'text-sm font-medium text-slate-100',
        strong: 'text-slate-100',
        mid: 'text-slate-300',
        small: 'text-xs text-slate-400',
        icon: 'h-4 w-4 shrink-0 text-slate-500',
        paid: 'text-emerald-400',
        chip: 'bg-slate-800 text-slate-200',
        close: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
        notice: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
      }
    : {
        panel: 'bg-slate-50 sm:border-slate-200',
        bar: 'border-slate-200 bg-white',
        card: 'rounded-2xl border border-slate-200 bg-white shadow-sm',
        divider: 'border-slate-100',
        divide: 'divide-slate-100',
        label: 'text-sm text-slate-500',
        value: 'text-sm font-medium text-slate-900',
        strong: 'text-slate-900',
        mid: 'text-slate-700',
        small: 'text-xs text-slate-500',
        icon: 'h-4 w-4 shrink-0 text-slate-400',
        paid: 'text-emerald-700',
        chip: 'bg-slate-100 text-slate-800',
        close: 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
        notice: 'border-amber-200 bg-amber-50 text-amber-800',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
      };

type Tokens = ReturnType<typeof drawerTokens>;

function HistoryRow({
  t,
  icon,
  label,
  value,
  paid = false,
}: {
  t: Tokens;
  icon: React.ReactNode;
  label: string;
  value: string;
  paid?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <span className={t.label}>{label}</span>
      </div>
      <span className={paid ? `text-sm font-medium ${t.paid}` : t.value}>{value}</span>
    </div>
  );
}

export default function InvoiceDetailDrawer({
  project,
  stateMeta,
  onOpenBilling,
  onClose,
  isDark = false,
}: InvoiceDetailDrawerProps) {
  const t = drawerTokens(isDark);
  const lineItems: LineItem[] = safeJSONParse(project.quote_data) || [];

  const stripeFee = Number(project.stripe_fees) || 0;
  const platformFee = Number(project.platform_fees) || 0;
  const totalFees = stripeFee + platformFee;
  const hasFees = totalFees >= 0.005;
  const collected = project._collected ?? 0;
  const owed = project._owed ?? 0;

  const hasHistory =
    !!project.inv_deposit_sent_at ||
    !!project.deposit_paid_at ||
    !!project.inv_sent_at ||
    !!project.paid_at;

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
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className={`relative flex h-full w-full max-w-md flex-col shadow-2xl transition-transform duration-300 animate-in slide-in-from-right sm:border-l ${t.panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${t.bar}`}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={t.label}>{project.invoice_number || 'Draft invoice'}</span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: stateMeta.bg, color: stateMeta.text }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stateMeta.dot }} />
                {stateMeta.label}
              </span>
            </div>
            <h3 id="drawer-title" className={`mt-1 truncate text-lg font-semibold ${t.strong}`}>
              {project.customer_name || 'Unnamed client'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`shrink-0 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 ${t.close}`}
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {/* Money summary */}
          <div className={`${t.card} p-5`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={t.label}>Still owed</span>
              <span className={`text-2xl font-bold tabular-nums ${owed > 0.004 ? t.strong : t.paid}`}>
                {fmtExact(owed)}
              </span>
            </div>

            <div className={`mt-4 grid grid-cols-2 gap-4 border-t pt-4 ${t.divider}`}>
              <div>
                <span className={`block ${t.label}`}>Invoice total</span>
                <span className={`text-base font-semibold tabular-nums ${t.strong}`}>{fmtExact(project._total)}</span>
              </div>
              <div>
                <span className={`block ${t.label}`}>Collected</span>
                <span className={`text-base font-semibold tabular-nums ${t.paid}`}>{fmtExact(collected)}</span>
              </div>
            </div>

            {hasFees && (
              <div className={`mt-4 space-y-2 border-t pt-4 ${t.divider}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={t.label}>Card fees</span>
                  <span className={`text-sm font-medium tabular-nums ${t.mid}`}>−{fmtExact(totalFees)}</span>
                </div>
                <p className={t.small}>
                  Stripe {fmtExact(stripeFee)}
                  {platformFee > 0.004 ? ` · Lead2Project ${fmtExact(platformFee)}` : ''}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-sm font-medium ${t.strong}`}>You kept</span>
                  <span className={`text-base font-semibold tabular-nums ${t.strong}`}>
                    {fmtExact(collected - totalFees)}
                  </span>
                </div>
              </div>
            )}

            {project.payment_method && (
              <div className={`mt-4 flex items-center justify-between gap-3 border-t pt-4 ${t.divider}`}>
                <span className={t.label}>Payment method</span>
                <span className={`rounded-md px-2 py-0.5 text-sm font-medium capitalize ${t.chip}`}>
                  {project.payment_method.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className={`${t.card} space-y-3 p-4`}>
            {hasHistory ? (
              <>
                {/* Full real history: each line only appears if that field has a value. */}
                {project.inv_deposit_sent_at && (
                  <HistoryRow t={t} icon={<Calendar className={t.icon} />} label="Deposit sent" value={fmtDateLong(project.inv_deposit_sent_at)} />
                )}
                {project.deposit_paid_at && (
                  <HistoryRow t={t} icon={<Calendar className={t.icon} />} label="Deposit paid" value={fmtDateLong(project.deposit_paid_at)} paid />
                )}
                {project.inv_sent_at && (
                  <HistoryRow t={t} icon={<Calendar className={t.icon} />} label="Balance sent" value={fmtDateLong(project.inv_sent_at)} />
                )}
                {project.paid_at && (
                  <HistoryRow t={t} icon={<Calendar className={t.icon} />} label="Balance paid" value={fmtDateLong(project.paid_at)} paid />
                )}
                {project._collectedUnsent && (
                  <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${t.notice}`}>
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{fmtExact(collected)} collected, but nothing invoiced for this phase yet</span>
                  </div>
                )}
              </>
            ) : (
              // No deposit terms: only one phase ever existed, so the single field is correct.
              <HistoryRow t={t} icon={<Calendar className={t.icon} />} label="Sent" value={fmtDateLong(project.invoice_sent_at)} />
            )}

            <HistoryRow
              t={t}
              icon={<Receipt className={t.icon} />}
              label={
                project._billingPhase === 'deposit'
                  ? 'Deposit due'
                  : project._billingPhase === 'balance'
                  ? 'Balance due'
                  : 'Due'
              }
              value={fmtDateLong(
                project._billingPhase === 'deposit' ? project.deposit_due_date : project.payment_due_date
              )}
            />

            {project.customer_email && (
              <div className={`flex items-center justify-between gap-3 border-t pt-3 ${t.divider}`}>
                <div className="flex shrink-0 items-center gap-2">
                  <Mail className={t.icon} />
                  <span className={t.label}>Email</span>
                </div>
                <span className={`truncate pl-3 ${t.value}`} title={project.customer_email}>
                  {project.customer_email}
                </span>
              </div>
            )}
          </div>

          {/* Line items */}
          {lineItems.length > 0 && (
            <div className="space-y-2">
              <h4 className={`text-sm font-semibold ${t.mid}`}>Line items ({lineItems.length})</h4>
              <div className={`${t.card} divide-y overflow-hidden ${t.divide}`}>
                {lineItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${t.strong}`}>{item.description || 'Item'}</p>
                      <p className={`mt-0.5 ${t.small}`}>
                        Qty {item.quantity || 1}
                        {item.rate ? ` × ${fmtExact(item.rate)}` : ''}
                      </p>
                    </div>
                    <span className={`shrink-0 text-sm font-semibold tabular-nums ${t.strong}`}>
                      {fmtExact(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t px-5 pt-4 ${t.bar}`}
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onOpenBilling}
            className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold shadow-sm transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 ${t.primary}`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Open full billing</span>
            <ArrowRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}