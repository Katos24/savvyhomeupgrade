'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowLeft,
  ExternalLink,
  Zap,
  X,
  Link2,
  PenLine,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Mail,
  FileText,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────────── */

const PAYMENT_COLORS: Record<string, string> = {
  venmo: '#008CFF',
  zelle: '#6D1ED4',
  cashapp: '#00D632',
  paypal: '#003087',
  other: '#52525b',
};

const PAYMENT_LABELS: Record<string, string> = {
  venmo: 'Venmo',
  zelle: 'Zelle',
  cashapp: 'Cash App',
  paypal: 'PayPal',
  other: 'Custom Link',
};

const SAMPLE_INVOICE_NUMBER = 'INV-1042';
const SAMPLE_TOTAL = 505.0;
const SAMPLE_CUSTOMER_NAME = 'Jane Customer';
const SAMPLE_DUE_DATE = 'July 22, 2026';

/* Helper fallback for Stripe requirements */
function describeRequirementReason(code: string, capability: string): string {
  return `Action required for ${capability} (${code.replace(/_/g, ' ')})`;
}

function describeBlockingReasons(
  reasons: { capability: string; code: string }[] | null | undefined
): string {
  if (!reasons || reasons.length === 0) {
    return 'Stripe needs additional information before payouts can resume.';
  }
  const messages = reasons.map((r) => describeRequirementReason(r.code, r.capability));
  return Array.from(new Set(messages)).join(' ');
}

/* ─────────────────────────────────────────────────────────────
   BRAND & BADGE COMPONENTS
───────────────────────────────────────────────────────────── */

function StripeWordmark({ className = 'text-xl' }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight text-[#635BFF] ${className}`}>
      stripe
    </span>
  );
}

function CardNetworkBadge({ network }: { network: string }) {
  const base =
    'inline-flex h-6 px-2 shrink-0 items-center justify-center rounded-md border shadow-xs';

  switch (network) {
    case 'visa':
      return (
        <span className={`${base} border-slate-200/80 bg-white`}>
          <span className="text-[10px] font-black italic tracking-tighter text-[#1A1F71]">
            VISA
          </span>
        </span>
      );
    case 'mastercard':
      return (
        <span className={`${base} border-slate-200/80 bg-white`}>
          <span className="relative flex h-3 w-5 items-center justify-center">
            <span className="absolute left-0 h-3 w-3 rounded-full bg-[#EB001B]" />
            <span className="absolute right-0 h-3 w-3 rounded-full bg-[#F79E1B] opacity-90" />
          </span>
        </span>
      );
    case 'amex':
      return (
        <span className={`${base} border-transparent bg-[#0077A6]`}>
          <span className="text-[8px] font-black tracking-tight text-white">AMEX</span>
        </span>
      );
    case 'applepay':
      return (
        <span className={`${base} border-transparent bg-slate-900 px-1.5`}>
          <span className="flex items-center gap-0.5 text-[9px] font-bold text-white">
             Pay
          </span>
        </span>
      );
    case 'googlepay':
      return (
        <span className={`${base} border-slate-200/80 bg-white`}>
          <span className="text-[9px] font-bold text-slate-700">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
        </span>
      );
    default:
      return null;
  }
}

function StatusBadge({ state }: { state: 'active' | 'pending' | 'restricted' | 'none' }) {
  const config = {
    active: {
      label: 'Active',
      container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    pending: {
      label: 'In Review',
      container: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500 animate-pulse',
    },
    restricted: {
      label: 'Action Required',
      container: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
    none: {
      label: 'Not Connected',
      container: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    },
  }[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.container}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   HELP & HOW IT WORKS (ACCORDION)
───────────────────────────────────────────────────────────── */

function HowItWorksAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left font-medium text-slate-700 hover:text-slate-900"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          How do online invoice payments work?
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-200/80 p-4 pt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
          <div className="flex items-start gap-2.5">
            <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p>
              <strong className="font-semibold text-slate-800">Automatic payment links:</strong> Every email sent includes a secure link allowing clients to settle invoices online.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p>
              <strong className="font-semibold text-slate-800">Automated tracking (Stripe):</strong> Payments via credit or debit cards auto-update your dashboard to &quot;Paid&quot; instantly.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p>
              <strong className="font-semibold text-slate-800">Manual payment links:</strong> If using Venmo, Zelle, or Cash App, clients type the total manually and you check for receipt prior to marking paid.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STRIPE CONNECT SECTION
───────────────────────────────────────────────────────────── */

function StripeConnectSection({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [redirectStatus, setRedirectStatus] = useState<
    'idle' | 'error' | 'denied' | 'already_linked'
  >('idle');
  const [connectError, setConnectError] = useState<string | null>(null);

  const [liveStatus, setLiveStatus] = useState<{
    isConnected: boolean;
    paymentStatus: 'active' | 'restricted' | 'pending' | null;
    blockingReasons: { capability: string; code: string }[];
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const isConnected = liveStatus
    ? liveStatus.isConnected
    : !!company.stripe_connect_onboarded;
  const paymentStatus: 'active' | 'restricted' | 'pending' | null = liveStatus
    ? liveStatus.paymentStatus
    : company.stripe_payment_status ?? null;
  const blockingReasons = liveStatus
    ? liveStatus.blockingReasons
    : company.stripe_requirements_summary ?? [];

  async function refreshLiveStatus() {
    setCheckingStatus(true);
    try {
      const res = await fetch(
        `/api/company/${company.slug}/stripe/refresh-status`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (res.ok) {
        setLiveStatus({
          isConnected: !!data.stripe_connect_onboarded,
          paymentStatus: data.stripe_payment_status ?? null,
          blockingReasons: data.stripe_requirements_summary ?? [],
        });
      }
    } catch {
      // Silent catch
    } finally {
      setCheckingStatus(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sc = params.get('stripe_connect');
    if (sc === 'error' || sc === 'denied' || sc === 'already_linked') {
      setRedirectStatus(sc as any);
    }

    const justReturnedFromStripe = sc !== null;
    const inUnsettledState =
      !!company.stripe_connect_onboarded &&
      company.stripe_payment_status !== 'active';
    if (justReturnedFromStripe || inUnsettledState) {
      refreshLiveStatus();
    }
  }, []);

  async function handleConnect() {
    setLoading(true);
    setConnectError(null);
    try {
      const res = await fetch(
        `/api/company/${company.slug}/stripe/connect-onboard`
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        setConnectError(data.error || 'Something went wrong. Try again.');
      }
    } catch {
      setLoading(false);
      setConnectError('Something went wrong. Try again.');
    }
  }

  const stampState: 'active' | 'pending' | 'restricted' | 'none' = !isConnected
    ? 'none'
    : paymentStatus === 'active'
    ? 'active'
    : paymentStatus === 'restricted'
    ? 'restricted'
    : 'pending';

  return (
    <div className="space-y-6">
      {/* Card Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <StripeWordmark className="text-2xl" />
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              <Sparkles className="h-3 w-3" /> Recommended
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Accept credit cards, Apple Pay, & debit payments directly on invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {checkingStatus && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing...
            </span>
          )}
          <StatusBadge state={stampState} />
        </div>
      </div>

      {/* Network badges preview */}
      <div className="flex items-center gap-2 pt-1">
        {['visa', 'mastercard', 'amex', 'applepay', 'googlepay'].map((net) => (
          <CardNetworkBadge key={net} network={net} />
        ))}
      </div>

      {/* Account Restricted Notice */}
      {isConnected && paymentStatus === 'restricted' && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-rose-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            Payouts temporarily on hold
          </div>
          <p className="mt-1 text-xs leading-relaxed text-rose-700">
            {describeBlockingReasons(blockingReasons)}
          </p>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-rose-800 underline hover:text-rose-900"
          >
            Complete verification on Stripe <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Action / Connect States */}
      {redirectStatus === 'error' && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          Something went wrong during Stripe setup. Please try connecting again.
        </p>
      )}

      {connectError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {connectError}
        </p>
      )}

      {isConnected ? (
        <div className="pt-2">
          {paymentStatus === 'active' ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-indigo-700"
              >
                Manage Stripe Dashboard
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <p className="text-xs text-slate-500">
                Card payments are live. View payouts and refunds inside Stripe.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Resume Setup on Stripe
                {!loading && <ArrowUpRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5">
          <div className="space-y-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <p className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-indigo-600" /> Fast & Secure Setup
            </p>
            <p>
              Connect an existing Stripe account or set up a new one in ~5 minutes. Identity verification is securely managed directly by Stripe.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#635BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#534ae6] disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Connect with Stripe <ArrowUpRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MANUAL PAYMENT LINK SECTION
───────────────────────────────────────────────────────────── */

function ManualPaymentLinkSection({
  company,
  supersededByStripe,
}: {
  company: any;
  supersededByStripe?: boolean;
}) {
  const [type, setType] = useState(company.payment_link_type || '');
  const [url, setUrl] = useState(company.payment_link_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-payment-link',
          data: { payment_link_type: type, payment_link_url: url },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      // Unhandled
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {supersededByStripe ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-800 sm:text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>
            <strong>Note:</strong> Stripe is currently active. Invoices will prioritize direct card payments over custom links.
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Add your payment link or tag (Venmo, Zelle, Cash App). Customers enter the balance manually when paying.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-36"
        >
          <option value="">Select Platform</option>
          <option value="venmo">Venmo</option>
          <option value="zelle">Zelle</option>
          <option value="cashapp">Cash App</option>
          <option value="paypal">PayPal</option>
          <option value="other">Other</option>
        </select>

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => {
            const val = url.trim();
            if (val && !val.startsWith('http')) setUrl(`https://${val}`);
          }}
          placeholder="https://venmo.com/your-username"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        {type && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: PAYMENT_COLORS[type] || '#52525b' }}
          >
            {PAYMENT_LABELS[type] || type}
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Link'}
          {saved && !saving && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PREVIEW COMPONENTS (INBOX & INVOICE)
───────────────────────────────────────────────────────────── */

function PreviewsSection({ company }: { company: any }) {
  const [activeTab, setActiveTab] = useState<'email' | 'invoice'>('email');
  const [expandedInvoice, setExpandedInvoice] = useState(false);

  const stripeActive =
    !!company.stripe_connect_onboarded &&
    company.stripe_payment_status === 'active';
  const hasManualLink = !!company.payment_link_url;

  const paymentMethodLabels: Record<string, string> = {
    venmo: 'Pay with Venmo',
    zelle: 'Pay with Zelle',
    cashapp: 'Pay with Cash App',
    paypal: 'Pay with PayPal',
    stripe: 'Pay with Credit Card',
    other: 'Pay Invoice',
  };

  const effectiveType = stripeActive
    ? 'stripe'
    : hasManualLink
    ? company.payment_link_type || 'other'
    : null;
  const payLabel = effectiveType ? paymentMethodLabels[effectiveType] || 'Pay Now' : null;
  const accent = company.email_brand_color_1 || '#4F46E5';
  const companyName = company.name || 'Your Business Name';
  const previewUrl = `/api/company/${company.slug}/preview-invoice`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'email'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Mail className="h-3.5 w-3.5" /> Email Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'invoice'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Invoice Document
          </button>
        </div>
      </div>

      {/* Render Email View */}
      {activeTab === 'email' && (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/70 p-3 sm:p-5">
          <div className="mx-auto max-w-[440px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
            {/* Header */}
            <div
              className="px-5 py-6 text-center"
              style={{ backgroundColor: accent }}
            >
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo_url}
                  alt={companyName}
                  className="mx-auto h-7 object-contain"
                />
              ) : (
                <p className="text-base font-bold text-white">{companyName}</p>
              )}
            </div>

            {/* Email Body */}
            <div className="p-5 text-xs sm:text-sm">
              <p className="font-medium text-slate-800">Hi {SAMPLE_CUSTOMER_NAME},</p>
              <p className="mt-1.5 leading-relaxed text-slate-600">
                Here is invoice <strong>{SAMPLE_INVOICE_NUMBER}</strong> for{' '}
                <strong>${SAMPLE_TOTAL.toFixed(2)}</strong>. You can pay securely online or download your PDF below.
              </p>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {payLabel ? (
                  <div
                    className="rounded-lg py-2.5 text-center text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: accent }}
                  >
                    {payLabel} — ${SAMPLE_TOTAL.toFixed(2)}
                  </div>
                ) : (
                  <p className="rounded-lg bg-amber-50 p-2.5 text-center text-xs font-medium text-amber-800">
                    No payment link attached yet
                  </p>
                )}
                <div className="rounded-lg border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700">
                  Download Invoice PDF
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-2.5 text-center text-xs text-slate-500">
                Due by <strong>{SAMPLE_DUE_DATE}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Invoice Preview View */}
      {activeTab === 'invoice' && (
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/70 p-3 sm:p-5">
          <div className="relative mx-auto h-[380px] max-w-[480px] overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-xs">
            <iframe
              src={previewUrl}
              title="Sample invoice preview"
              className="h-full w-full border-0 pointer-events-none"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-slate-900/40 to-transparent pb-4 pt-8">
              <button
                type="button"
                onClick={() => setExpandedInvoice(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-md transition hover:bg-slate-50"
              >
                Expand Full Screen <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Modal Modal */}
      {expandedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => setExpandedInvoice(false)}
        >
          <div
            className="relative flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-slate-800">
                Invoice Preview
              </span>
              <button
                type="button"
                onClick={() => setExpandedInvoice(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              src={previewUrl}
              title="Full preview"
              className="h-full w-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAYMENTS TAB COMPONENT
───────────────────────────────────────────────────────────── */

type MethodType = 'stripe' | 'manual';

export default function PaymentsTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser: any;
}) {
  const stripeConnected = !!company.stripe_connect_onboarded;
  const stripeActive =
    stripeConnected && company.stripe_payment_status === 'active';
  const hasManualLink = !!company.payment_link_url;

  const [selectedMethod, setSelectedMethod] = useState<MethodType>(() => {
    if (stripeConnected) return 'stripe';
    if (hasManualLink) return 'manual';
    return 'stripe';
  });

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Payment Methods
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure how your customers pay their digital invoices.
          </p>
        </div>

        {/* Method Picker Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/60 p-1">
          <button
            type="button"
            onClick={() => setSelectedMethod('stripe')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition sm:text-sm ${
              selectedMethod === 'stripe'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="h-4 w-4 text-indigo-600" />
            Credit Card (Stripe)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('manual')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition sm:text-sm ${
              selectedMethod === 'manual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="h-4 w-4 text-slate-600" />
            Custom Payment Link
          </button>
        </div>

        {/* Main Content Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-7">
          {selectedMethod === 'stripe' ? (
            <StripeConnectSection company={company} />
          ) : (
            <ManualPaymentLinkSection
              company={company}
              supersededByStripe={stripeActive}
            />
          )}
        </div>

        {/* Informational Accordion */}
        <HowItWorksAccordion />

        {/* Invoice Sending Flow Info */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-7 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Sending & Client View
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                When you dispatch an invoice, clients receive an email with your choice of direct payment options.
              </p>
            </div>
          </div>

          <PreviewsSection company={company} />
        </div>
      </div>
    </div>
  );
}