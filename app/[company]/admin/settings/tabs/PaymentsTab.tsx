'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Check,
  X,
  ArrowRight,
  FileText,
  CreditCard,
  Building2,
  Sparkles,
  ShieldCheck,
  Link2,
  Eye,
  Plus,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   INLINE SVG BRAND MARKS
───────────────────────────────────────────────────────────── */

function VisaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text x="24" y="21" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="13" fill="#fff">VISA</text>
    </svg>
  );
}

function MastercardMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0" />
      <circle cx="20" cy="16" r="9" fill="#EB001B" />
      <circle cx="28" cy="16" r="9" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  );
}

function AmexMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="American Express">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <text x="24" y="19" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="9" fill="#fff">AMEX</text>
    </svg>
  );
}

function DiscoverMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="Discover">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0" />
      <text x="20" y="19" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="8" fill="#1a1a1a">DISC</text>
      <circle cx="38" cy="16" r="6" fill="#FF6000" />
    </svg>
  );
}

function ApplePayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="Apple Pay">
      <rect width="48" height="32" rx="4" fill="#000" />
      <text x="24" y="20" textAnchor="middle" fontFamily="-apple-system, Arial, sans-serif" fontWeight="600" fontSize="10" fill="#fff"> Pay</text>
    </svg>
  );
}

function GooglePayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="Google Pay">
      <rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0" />
      <text x="24" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="9" fill="#5F6368">
        <tspan fill="#4285F4">G</tspan> Pay
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   HELPERS & CONSTANTS
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
   PAYMENT OPTIONS SIDEBAR PANEL
───────────────────────────────────────────────────────────── */

function PaymentOptionsPanel() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 lg:sticky lg:top-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900">Supported Methods</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          <ShieldCheck className="h-3 w-3" /> Stripe Secure
        </span>
      </div>

      <div className="mt-5 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cards & Mobile Wallets</p>
            <span className="text-xs font-bold text-slate-900">2.9% + 30¢</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Standard rate per successful online transaction.</p>
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            <VisaMark className="h-7 w-auto shadow-2xs" />
            <MastercardMark className="h-7 w-auto shadow-2xs" />
            <AmexMark className="h-7 w-auto shadow-2xs" />
            <DiscoverMark className="h-7 w-auto shadow-2xs" />
            <ApplePayMark className="h-7 w-auto shadow-2xs" />
            <GooglePayMark className="h-7 w-auto shadow-2xs" />
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">ACH Bank Transfers</span>
            <span className="rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800">Coming Soon</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Lower 0.8% capped fees for larger invoices.</p>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Included Features</p>
          <ul className="space-y-2">
            {[
              'Direct online payment link on invoices',
              'Milestone deposits & partial payments',
              'Auto-ledger reconciliation upon payment',
              'Custom branded PDF & email invoices',
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SETUP STEPS MODULE
───────────────────────────────────────────────────────────── */

function PaymentSetupSteps({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [redirectStatus, setRedirectStatus] = useState<'idle' | 'error' | 'denied' | 'already_linked'>('idle');
  const [connectError, setConnectError] = useState<string | null>(null);

  const [liveStatus, setLiveStatus] = useState<{
    isConnected: boolean;
    paymentStatus: 'active' | 'restricted' | 'pending' | null;
    blockingReasons: { capability: string; code: string }[];
  } | null>(null);

  const isConnected = liveStatus ? liveStatus.isConnected : !!company.stripe_connect_onboarded;
  const paymentStatus: 'active' | 'restricted' | 'pending' | null = liveStatus
    ? liveStatus.paymentStatus
    : company.stripe_payment_status ?? null;
  const blockingReasons = liveStatus ? liveStatus.blockingReasons : company.stripe_requirements_summary ?? [];
  const stripeActive = isConnected && paymentStatus === 'active';

  const [linkType, setLinkType] = useState<string>(company.payment_link_type || 'venmo');
  const [linkUrl, setLinkUrl] = useState<string>(company.payment_link_url || '');
  const [savingLink, setSavingLink] = useState(false);
  const [linkSaved, setLinkSaved] = useState(false);
  const linkIsSet = !!company.payment_link_url;
  const linkIsDirty =
    linkUrl !== (company.payment_link_url || '') || linkType !== (company.payment_link_type || 'venmo');

  const methods = [
    { value: 'venmo', label: 'Venmo' },
    { value: 'zelle', label: 'Zelle' },
    { value: 'cashapp', label: 'Cash App' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'other', label: 'Other' },
  ];

  async function refreshLiveStatus() {
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

  async function handleSaveLink() {
    setSavingLink(true);
    setLinkSaved(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-payment-link',
          data: { payment_link_url: linkUrl.trim() || null, payment_link_type: linkType },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinkSaved(true);
        setTimeout(() => setLinkSaved(false), 2500);
      }
    } catch {
      // Unhandled
    } finally {
      setSavingLink(false);
    }
  }

  return (
    <div className="space-y-5">
      {redirectStatus === 'error' && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-2xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          Stripe setup could not be completed. Please attempt connection again.
        </div>
      )}
      {connectError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-2xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          {connectError}
        </div>
      )}

      {/* STEP 1: STRIPE CARD */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md ring-1 ring-slate-900/5">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900" />
        
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold transition-all ${
            stripeActive ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-lg' : 'bg-slate-900 text-white shadow-slate-200 shadow-lg'
          }`}>
            {stripeActive ? <Check className="h-5 w-5 stroke-[3]" /> : '1'}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Automated Credit Card Processing</h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-700 border border-slate-200">
                  Recommended
                </span>
              </div>
              {stripeActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              )}
            </div>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
              Accept all major credit cards and digital wallets natively on every invoice. Payments sync instantly to your financial ledger. Business identity verification is handled directly by Stripe.
            </p>

            {isConnected && paymentStatus === 'restricted' && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  Payouts temporarily on hold
                </div>
                <p className="mt-1 text-xs text-amber-800">{describeBlockingReasons(blockingReasons)}</p>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:underline"
                >
                  Resolve on Stripe Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!isConnected && (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-400" />}
                  Connect Stripe Account
                </button>
              )}

              {isConnected && !stripeActive && paymentStatus !== 'restricted' && (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Resume Stripe Onboarding <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}

              {stripeActive && (
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  Open Stripe Dashboard <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: MANUAL LINK FALLBACK */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:shadow-md ring-1 ring-slate-900/5">
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold transition-all ${
            linkIsSet ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-lg' : 'bg-slate-100 text-slate-700'
          }`}>
            {linkIsSet ? <Check className="h-5 w-5 stroke-[3]" /> : '2'}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Direct Payment Link (Optional)</h3>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-600">
                0% Processing Fee
              </span>
            </div>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Provide a direct link to Venmo, Zelle, Cash App, or PayPal. No fees are charged, but payments must be logged into your ledger manually.
            </p>

            <div className="mt-4 space-y-3">
              {/* Brand Pills Selectors */}
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => {
                  const active = linkType === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setLinkType(m.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer border ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* URL Input Group */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Link2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder={`e.g. ${linkType}.com/u/YourBusiness`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveLink}
                  disabled={savingLink || !linkIsDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  {savingLink && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {savingLink ? 'Saving...' : linkSaved ? 'Saved' : 'Save Payment Link'}
                  {linkSaved && !savingLink && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INVOICE TERMS CARD WITH QUICK TEMPLATES
───────────────────────────────────────────────────────────── */

function InvoiceTermsCard({ company }: { company: any }) {
  const [terms, setTerms] = useState<string>(company.invoice_terms || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDirty = terms !== (company.invoice_terms || '');

  const templates = [
    { label: '+ Net 15', text: 'Payment is due within 15 days of invoice date.' },
    { label: '+ 1.5% Late Fee', text: 'A 1.5% monthly late fee applies to all past due balances.' },
    { label: '+ 1-Year Warranty', text: 'All workmanship guaranteed for 12 months.' },
  ];

  function appendTemplate(text: string) {
    setTerms((prev: string) => (prev ? `${prev.trim()} ${text}` : text));
  }

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
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Standard Payment Terms</h3>
          <p className="mt-0.5 text-xs text-slate-500">Appears in the fine print section on generated invoice PDFs.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={5}
          placeholder="e.g. Payment due within 15 days. A 1.5% monthly late fee applies to balances over 30 days past due."
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
        />

        {/* Template Quick Chips */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Quick Insert Clause</p>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => appendTemplate(tpl.text)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <Plus className="h-3 w-3 text-slate-400" />
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? 'Saving...' : saved ? 'Saved Terms' : 'Save Terms'}
            {saved && !saving && <Check className="h-3.5 w-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INVOICE PREVIEW CARD & MODAL
───────────────────────────────────────────────────────────── */

function InvoicePreviewCard({ company }: { company: any }) {
  const [emailVariant, setEmailVariant] = useState<'deposit' | 'invoice'>('invoice');
  const [showPdfModal, setShowPdfModal] = useState(false);

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
  const payVerb = effectiveType ? paymentMethodLabels[effectiveType] || 'Pay Now' : null;
  const accent = company.email_brand_color_1 || '#0F172A';
  const companyName = company.name || 'Your Business Name';
  const previewUrl = `/api/company/${company.slug}/preview-invoice${emailVariant === 'deposit' ? '?variant=deposit' : ''}`;

  const variants = {
    deposit: {
      subject: `Deposit Request — Invoice ${SAMPLE_INVOICE_NUMBER} from ${companyName}`,
      heading: `Hi ${SAMPLE_CUSTOMER_NAME},`,
      body: `A deposit is required to lock in your project on our schedule. Your deposit total is `,
      amount: 155.0,
      payLabel: payVerb ? payVerb.replace('Pay', 'Pay Deposit') : null,
      footNote: `The remaining balance of $${(SAMPLE_TOTAL - 155.0).toFixed(2)} will be invoiced upon project completion.`,
    },
    invoice: {
      subject: `Invoice ${SAMPLE_INVOICE_NUMBER} from ${companyName}`,
      heading: `Hi ${SAMPLE_CUSTOMER_NAME},`,
      body: `Your invoice is ready for review. You can pay securely online using the button below. Your total due is `,
      amount: SAMPLE_TOTAL,
      payLabel: payVerb,
      footNote: null,
    },
  };
  const v = variants[emailVariant];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Live Customer View</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time preview of emails dispatched to your clients.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPdfModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5 text-slate-700" />
          Preview PDF Attachment
        </button>
      </div>

      {/* Segmented Variant Controller */}
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setEmailVariant('deposit')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              emailVariant === 'deposit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Deposit Request
          </button>
          <button
            type="button"
            onClick={() => setEmailVariant('invoice')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              emailVariant === 'invoice' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Full Invoice
          </button>
        </div>
      </div>

      {/* Email Inbox Browser Frame */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner">
        {/* Browser Topbar */}
        <div className="flex items-center gap-3 border-b border-slate-200/80 bg-slate-100/80 px-4 py-3">
          <div className="flex gap-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="min-w-0 flex-1 rounded-md bg-white px-3 py-1 text-[11px] font-mono text-slate-500 border border-slate-200/60 truncate">
            {companyName} &lt;{company.email || 'billing@yourbusiness.com'}&gt;
          </div>
        </div>

        {/* Email Header */}
        <div className="border-b border-slate-200/60 bg-white px-6 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</p>
          <p className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900">{v.subject}</p>
        </div>

        {/* Email Body Preview */}
        <div className="bg-white p-6 sm:p-8">
          <div className="mb-6">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={companyName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-lg font-black tracking-tight text-slate-900">{companyName}</span>
            )}
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-900">{v.heading}</p>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
            {v.body}
            <span className="font-semibold text-slate-900">${v.amount.toFixed(2)}</span>.
          </p>

          <div className="mt-6 space-y-2.5 max-w-sm">
            {v.payLabel ? (
              <div className="rounded-xl py-3 text-center text-xs sm:text-sm font-bold text-white shadow-sm transition hover:opacity-95" style={{ backgroundColor: accent }}>
                {v.payLabel} — ${v.amount.toFixed(2)}
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 py-3 text-center text-xs font-bold text-amber-800">
                Manual Collection — Check/Cash Payment
              </div>
            )}
            <div className="rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-700 shadow-2xs">
              Download Invoice PDF
            </div>
          </div>

          {v.footNote && (
            <p className="mt-4 text-xs text-slate-500 italic">{v.footNote}</p>
          )}

          <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-100 pt-4">
            <Calendar className="h-3.5 w-3.5" />
            Payment Due Date: <span className="font-semibold text-slate-700">{SAMPLE_DUE_DATE}</span>
          </div>
        </div>
      </div>

      {showPdfModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setShowPdfModal(false)}
        >
          <div
            className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <span className="text-sm font-bold text-slate-900">PDF Document Preview</span>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe src={previewUrl} title="Full invoice preview" className="h-full w-full border-0" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CONTAINER & HEADER
───────────────────────────────────────────────────────────── */

export default function PaymentsTab({ company }: { company: any; currentUser?: any }) {
  const stripeActive = !!company.stripe_connect_onboarded && company.stripe_payment_status === 'active';

  return (
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="w-full space-y-8 pb-12">
        {/* Page Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Payment Settings</h1>
              {stripeActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Card Payments
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                  Setup Required
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Configure how clients pay online and manage invoice formatting.
            </p>
          </div>
        </div>

        {/* Section 1: Payment Processing Setup */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <PaymentSetupSteps company={company} />
          <PaymentOptionsPanel />
        </div>

        {/* Section 2: Invoice Terms & Customer Email Preview */}
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Invoice Presentation</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
            <InvoiceTermsCard company={company} />
            <InvoicePreviewCard company={company} />
          </div>
        </div>
      </div>
    </div>
  );
}