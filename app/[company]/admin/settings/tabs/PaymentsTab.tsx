'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Zap,
  X,
  Link2,
  PenLine,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Mail,
  FileText,
  ClipboardCheck,
  Calendar,
  Bell,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const SAMPLE_INVOICE_NUMBER = 'INV-1042';
const SAMPLE_TOTAL = 505.0;
const SAMPLE_CUSTOMER_NAME = 'Jane Customer';
const SAMPLE_DUE_DATE = 'July 22, 2026';

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
   SHARED UI
───────────────────────────────────────────────────────────── */

function StripeWordmark({ className = 'text-xl' }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight text-[#635BFF] ${className}`}>
      stripe
    </span>
  );
}

function SupportedNetworks() {
  const networks = ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {networks.map((n) => (
        <span key={n} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
          {n}
        </span>
      ))}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  title,
  subtitle,
  children,
}: {
  icon: any;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACTIVE METHOD BANNER — two states only: Stripe live, or not.
   Manual collection (cash/Venmo/check/etc.) always works from the
   Invoice tab's Record Payment action with zero setup, so it's not
   a "method" this page configures — just what happens by default.
───────────────────────────────────────────────────────────── */

function ActiveMethodBanner({ company }: { company: any }) {
  const stripeActive = !!company.stripe_connect_onboarded && company.stripe_payment_status === 'active';

  if (stripeActive) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">Stripe is live on your invoices</p>
          <p className="mt-0.5 text-xs leading-relaxed text-emerald-800">
            Automatic — when a customer pays by card, this app is notified instantly and the
            invoice updates itself. No action needed from you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
        <PenLine className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">No automatic payment method connected</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          That's fine — collect payment however your customer prefers (cash, Venmo, Zelle, check)
          and record it yourself from the Invoice tab. Connect Stripe below if you'd rather cards
          get tracked automatically.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────────────────────── */

function HowItWorksAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left font-medium text-slate-700 hover:text-slate-900 sm:p-5"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          How do invoice payments work?
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-100 p-4 pt-4 text-xs leading-relaxed text-slate-600 sm:p-5 sm:text-sm">
          <div className="flex items-start gap-2.5">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p><strong className="font-semibold text-slate-800">With Stripe connected:</strong> every invoice email includes a secure pay-online link, and the invoice updates itself to "Paid" the instant a card payment clears — nothing for you to do.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p><strong className="font-semibold text-slate-800">Without it:</strong> collect payment however works for the job — cash, Venmo, Zelle, check — then hit "Record Payment" on the invoice yourself once it lands.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STRIPE CONNECT — logic unchanged from before
───────────────────────────────────────────────────────────── */

function StripeConnectSection({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [redirectStatus, setRedirectStatus] = useState<'idle' | 'error' | 'denied' | 'already_linked'>('idle');
  const [connectError, setConnectError] = useState<string | null>(null);

  const [liveStatus, setLiveStatus] = useState<{
    isConnected: boolean;
    paymentStatus: 'active' | 'restricted' | 'pending' | null;
    blockingReasons: { capability: string; code: string }[];
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const isConnected = liveStatus ? liveStatus.isConnected : !!company.stripe_connect_onboarded;
  const paymentStatus: 'active' | 'restricted' | 'pending' | null = liveStatus
    ? liveStatus.paymentStatus
    : company.stripe_payment_status ?? null;
  const blockingReasons = liveStatus ? liveStatus.blockingReasons : company.stripe_requirements_summary ?? [];

  async function refreshLiveStatus() {
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/stripe/refresh-status`, { method: 'POST' });
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
    const inUnsettledState = !!company.stripe_connect_onboarded && company.stripe_payment_status !== 'active';
    if (justReturnedFromStripe || inUnsettledState) {
      refreshLiveStatus();
    }
  }, []);

  async function handleConnect() {
    setLoading(true);
    setConnectError(null);
    try {
      const res = await fetch(`/api/company/${company.slug}/stripe/connect-onboard`);
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StripeWordmark className="text-lg" />
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            <Sparkles className="h-3 w-3" /> Recommended
          </span>
        </div>
        {checkingStatus && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing...
          </span>
        )}
      </div>

      <p className="text-sm text-slate-500">
        Accept credit cards, Apple Pay, and debit payments directly on invoices.
      </p>

      <SupportedNetworks />

      {isConnected && paymentStatus === 'restricted' && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-rose-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            Payouts temporarily on hold
          </div>
          <p className="mt-1 text-xs leading-relaxed text-rose-700">{describeBlockingReasons(blockingReasons)}</p>
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
        paymentStatus === 'active' ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-indigo-700"
            >
              Manage Stripe Dashboard <ArrowUpRight className="h-4 w-4" />
            </a>
            <p className="text-xs text-slate-500">Card payments are live. View payouts and refunds inside Stripe.</p>
          </div>
        ) : (
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
        )
      ) : (
        <div className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5">
          <div className="space-y-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <p className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-indigo-600" /> Fast & secure setup
            </p>
            <p>
              Already have a Stripe account? Connecting takes under a minute — Stripe recognizes
              you and skips straight to linking it. First time with Stripe? Plan on about 5–10
              minutes; identity verification is handled entirely by Stripe, not by us.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3.5 sm:p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              If you're setting up Stripe for the first time, have these ready
            </p>
            <ul className="mt-2.5 space-y-2 text-xs text-slate-600 sm:text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  <span className="font-semibold text-slate-800">Tax ID</span> — an EIN if you're
                  a registered business, or your SSN/ITIN if you're a sole proprietor
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  <span className="font-semibold text-slate-800">Business basics</span> — legal
                  name, address, and phone number
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  <span className="font-semibold text-slate-800">Bank account &amp; routing
                  number</span> — where your payouts get deposited
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  <span className="font-semibold text-slate-800">Your personal details</span> —
                  name, date of birth, and address, as the account's responsible person
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  Sometimes a <span className="font-semibold text-slate-800">photo ID</span> —
                  only if Stripe can't verify your identity automatically
                </span>
              </li>
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Exact requirements can vary by business type and location — Stripe will only ask
              for what applies to you.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#635BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#534ae6] disabled:opacity-60 sm:w-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Connect with Stripe <ArrowUpRight className="h-4 w-4" /></>)}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INVOICE TERMS — unchanged
───────────────────────────────────────────────────────────── */

function InvoiceTermsSection({ company }: { company: any }) {
  const [terms, setTerms] = useState(company.invoice_terms || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDirty = terms !== (company.invoice_terms || '');

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-invoice-terms',
          data: { invoice_terms: terms },
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
    <SectionCard
      icon={ClipboardCheck}
      iconColor="text-slate-600"
      iconBg="bg-slate-100"
      title="Terms & Conditions"
      subtitle="Fine print appended to every invoice PDF — late fees, warranty terms, payment policy."
    >
      <textarea
        value={terms}
        onChange={(e) => setTerms(e.target.value)}
        rows={4}
        placeholder="e.g. Payment due within 15 days. A 1.5% monthly late fee applies to overdue balances. All work is warrantied for 12 months from completion."
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-slate-400">Applies to every invoice automatically — no need to re-enter it per job.</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Terms'}
          {saved && !saving && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        </button>
      </div>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────────────────────────
   PREVIEWS — unchanged; still correctly reflects whichever method
   is actually active, including legacy manual links if a company
   already has one set from before this page was simplified
───────────────────────────────────────────────────────────── */

function PreviewsSection({ company }: { company: any }) {
  const [activeTab, setActiveTab] = useState<'email' | 'invoice'>('email');
  const [expandedInvoice, setExpandedInvoice] = useState(false);

  const stripeActive = !!company.stripe_connect_onboarded && company.stripe_payment_status === 'active';
  const hasManualLink = !!company.payment_link_url;

  const paymentMethodLabels: Record<string, string> = {
    venmo: 'Pay with Venmo',
    zelle: 'Pay with Zelle',
    cashapp: 'Pay with Cash App',
    paypal: 'Pay with PayPal',
    stripe: 'Pay with Credit Card',
    other: 'Pay Invoice',
  };

  const effectiveType = stripeActive ? 'stripe' : hasManualLink ? company.payment_link_type || 'other' : null;
  const payLabel = effectiveType ? paymentMethodLabels[effectiveType] || 'Pay Now' : null;
  const accent = company.email_brand_color_1 || '#4F46E5';
  const companyName = company.name || 'Your Business Name';
   const previewUrl = `/api/company/${company.slug}/preview-invoice`;

  // Grounded in the real send actions that actually exist today — not
  // every conceivable email, just the ones this app can genuinely send.
  const emailTypes = [
    {
      key: 'quote',
      icon: FileText,
      label: 'Quote',
      trigger: 'Sent when you email a quote from the Quote tab.',
      tag: 'Manual send',
    },
    {
      key: 'schedule',
      icon: Calendar,
      label: 'Schedule Confirmation',
      trigger: 'Sent when you schedule the job and notify the customer.',
      tag: 'Manual send',
    },
    {
      key: 'invoice',
      icon: FileText,
      label: 'Deposit / Balance / Invoice',
      trigger: 'Sent when you send an invoice — automatically shows the deposit or remaining balance, whichever applies.',
      tag: 'Manual send',
    },
    {
      key: 'reminder',
      icon: Bell,
      label: 'Payment Reminder',
      trigger: 'Sent when you remind a customer about an unpaid invoice.',
      tag: 'Manual send',
    },
    {
      key: 'confirmation',
      icon: CheckCircle2,
      label: 'Payment Confirmation',
      trigger: stripeActive
        ? "Stripe automatically emails the customer a receipt when they pay by card. That's a generic Stripe receipt, not a branded email from your business."
        : "Nothing is sent automatically today. When you record cash, check, or Venmo manually, the customer isn't notified — worth a personal follow-up.",
      tag: stripeActive ? 'Automatic (Stripe)' : 'Not sent yet',
    },
  ];

    return (
    <div className="space-y-6">
      {/* Full catalog of email types lives in Settings > Emails — one
          source of truth instead of a second copy here that could drift
          out of sync with it. */}
      <a
        href={`/${company.slug}/home?section=email-templates`}
        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">See every customer email type</p>
            <p className="text-xs text-slate-500">Which ones are editable, and which aren't — in Settings → Emails</p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
      </a>

      {/* Segmented control — one tab lifted on a white pill, the way
          macOS/iOS switches between views, instead of two flat buttons */}
      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            activeTab === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Mail className="h-3.5 w-3.5" /> Email
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('invoice')}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            activeTab === 'invoice' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> Invoice
        </button>
      </div>

      {activeTab === 'email' && (
        <div className="mx-auto w-full max-w-[580px] overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          {/* Window chrome — frames this as "what lands in their inbox"
              rather than a floating card with no context */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-500">
              {companyName} &lt;{company.email || 'you@yourbusiness.com'}&gt;
            </p>
          </div>

          <div className="border-b border-slate-100 px-6 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Subject</p>
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
              Invoice {SAMPLE_INVOICE_NUMBER} from {companyName}
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <div className="mb-6">
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo_url} alt={companyName} className="h-8 w-auto object-contain" />
              ) : (
                <span className="text-sm font-extrabold tracking-tight text-slate-900">{companyName}</span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-900">Hi {SAMPLE_CUSTOMER_NAME},</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Here's invoice <span className="font-semibold text-slate-900">{SAMPLE_INVOICE_NUMBER}</span> for{' '}
              <span className="font-semibold text-slate-900">${SAMPLE_TOTAL.toFixed(2)}</span>. You can pay
              securely online or download the PDF below.
            </p>

            <div className="mt-6 space-y-2.5">
              {payLabel ? (
                <div
                  className="rounded-xl py-3 text-center text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  {payLabel} — ${SAMPLE_TOTAL.toFixed(2)}
                </div>
              ) : (
                <p className="rounded-xl bg-amber-50 py-3 text-center text-xs font-semibold text-amber-800">
                  No payment link attached yet
                </p>
              )}
              <div className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700">
                Download Invoice PDF
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              Due by <span className="font-semibold text-slate-600">{SAMPLE_DUE_DATE}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoice' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <span className="text-xs font-semibold text-slate-600">Live preview — reflects your real invoice template</span>
            <button
              type="button"
              onClick={() => setExpandedInvoice(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              Open Full Screen <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="bg-slate-100/60 p-4 sm:p-6">
            <div className="mx-auto h-[520px] w-full max-w-[640px] overflow-hidden rounded-lg border border-slate-200/70 bg-white shadow-xs">
              <iframe src={previewUrl} title="Sample invoice preview" className="h-full w-full border-0 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

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
              <span className="text-sm font-semibold text-slate-800">Invoice Preview</span>
              <button type="button" onClick={() => setExpandedInvoice(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe src={previewUrl} title="Full preview" className="h-full w-full border-0" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN — no method picker. One thing to configure (Stripe);
   manual collection just works from the Invoice tab regardless.
───────────────────────────────────────────────────────────── */

export default function PaymentsTab({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <div className="w-full font-sans text-slate-900 antialiased space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Payments & Invoicing</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Connect Stripe for automatic card payments, or collect however you normally do and
            record it on the invoice.
          </p>
        </div>
      </div>

        <ActiveMethodBanner company={company} />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <StripeConnectSection company={company} />
        </div>

        <HowItWorksAccordion />

        <InvoiceTermsSection company={company} />

        <SectionCard icon={Send} title="Sending & Client View" subtitle="When you send an invoice, this is what the customer sees.">
          <PreviewsSection company={company} />
        </SectionCard>
    </div>
  );
}