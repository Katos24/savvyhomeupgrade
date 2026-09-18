'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Mail,
  FileText,
  Calendar,
  Eye,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';

/* Real inline SVG brand marks — same technique as GoogleLogo/FacebookLogo/
   InstagramLogo already used in FormTab.tsx this session. No external
   image requests, nothing that can fail to load. */

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
   CONSTANTS & HELPERS
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
   PAYMENT OPTIONS PANEL — static, informational right-column
   card. Only lists fees and features that are genuinely real and
   built: standard published Stripe card rate, deposits/partial
   payments (built and hardened extensively this session),
   automatic ledger updates on payment (built), and PDF/email
   invoices (built). ACH is marked "Coming soon" rather than live,
   since it's still an unbuilt, scoped item — not something to
   silently claim as available. No tip collection or saved-card
   features listed, since neither exists in this app.
───────────────────────────────────────────────────────────── */

// Font import scoped to this file/component only — not applied
// site-wide, since that's a bigger change than "fix this one tab."
// Poppins is the closest common match to the bold rounded heading
// style in the reference; it isn't Jobber's literal proprietary font.
function PaymentsFontLoader() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&display=swap');
    `}</style>
  );
}

function PaymentOptionsPanel() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:p-6 lg:sticky lg:top-6">
      <p className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
        Payment Options
      </p>

      <div className="mt-4 space-y-4">
                <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bank Payment (ACH)</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
            <VisaMark className="h-6 w-auto" />
            <MastercardMark className="h-6 w-auto" />
            <AmexMark className="h-6 w-auto" />
            <DiscoverMark className="h-6 w-auto" />
            <ApplePayMark className="h-6 w-auto" />
            <GooglePayMark className="h-6 w-auto" />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-700">2.9% + 30&cent;</p>
          <p className="text-[11px] text-slate-500">Stripe&rsquo;s standard published rate for online card payments.</p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bank Payment (ACH)</p>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">Coming soon</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Lower-fee bank transfers for larger invoices — not available yet.</p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Built Into Every Lead2Project Invoice</p>
                    <ul className="space-y-1.5">
            {[
              'Secure online payment link on every invoice',
              'Deposits & partial payments',
              'Ledger updates automatically the moment a customer pays',
              'Branded PDF + email invoices',
            ].map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAYMENT PROCESSING — two always-visible step cards on the left,
   no more click-to-expand accordions. All real logic (live status
   refresh, redirect handling, connect flow, manual link save) is
   unchanged — only the presentation changed to match a step-by-
   step setup flow instead of a collapsed disclosure list.

   MANUAL LINK NEEDS BACKEND SUPPORT NOT YET CONFIRMED TO EXIST:
   posts action: 'update-payment-link' to the same settings
   endpoint InvoiceTermsCard already uses for
   'update-invoice-terms'. If that action doesn't exist yet on
   /api/company/[slug]/settings, it needs to be added — same
   shape, writing payment_link_url/payment_link_type.
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
  const [checkingStatus, setCheckingStatus] = useState(false);

  const isConnected = liveStatus ? liveStatus.isConnected : !!company.stripe_connect_onboarded;
  const paymentStatus: 'active' | 'restricted' | 'pending' | null = liveStatus
    ? liveStatus.paymentStatus
    : company.stripe_payment_status ?? null;
  const blockingReasons = liveStatus ? liveStatus.blockingReasons : company.stripe_requirements_summary ?? [];
  const stripeActive = isConnected && paymentStatus === 'active';

  const [linkType, setLinkType] = useState(company.payment_link_type || 'venmo');
  const [linkUrl, setLinkUrl] = useState(company.payment_link_url || '');
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Set Up Payments</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Connect Stripe to accept cards online, or set a manual link as a no-fee fallback.
        </p>
      </div>

      {redirectStatus === 'error' && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          Something went wrong during Stripe setup. Please try connecting again.
        </div>
      )}
      {connectError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {connectError}
        </div>
      )}

      {/* STEP 1 — STRIPE, always expanded, matching the reference's
          always-visible step cards instead of a collapsed row. */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              stripeActive ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
            }`}
          >
            {stripeActive ? <Check className="h-4 w-4 stroke-[3]" /> : '1'}
          </div>
          <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Connect Stripe
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">Recommended</span>
              {stripeActive && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">Connected</span>
              )}
            </p>
                       <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
              Customers pay online with a card, and your Lead2Project ledger updates the moment they do.
              Business verification (legal name, tax ID, and bank account for payouts) happens securely
              inside Stripe&rsquo;s own onboarding — nothing extra to set up here.
            </p>
            <div className="mt-4">
              {isConnected && paymentStatus === 'restricted' && (
                <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    Payouts temporarily on hold
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-rose-700">{describeBlockingReasons(blockingReasons)}</p>
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-800 underline hover:text-rose-900"
                  >
                    Complete verification on Stripe <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              )}

              {stripeActive && (
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  View Stripe Dashboard <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {isConnected && !stripeActive && paymentStatus !== 'restricted' && (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#534ae6] transition disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Resume Setup <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}

              {!isConnected && (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Started'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2 — MANUAL LINK, same always-expanded treatment */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              linkIsSet ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {linkIsSet ? <Check className="h-4 w-4 stroke-[3]" /> : '2'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Manual Link (optional)</p>
                        <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
              Venmo, Zelle, Cash App, or PayPal — no processing fee, works right away. The tradeoff: nothing
              updates automatically, so you&rsquo;ll record each payment yourself once it lands. No card
              payments through this method.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value)}
                className="shrink-0 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
              >
                {methods.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="e.g. venmo.com/u/YourBusiness"
                className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleSaveLink}
                disabled={savingLink || !linkIsDirty}
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-30"
              >
                {savingLink && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {savingLink ? 'Saving...' : linkSaved ? 'Saved' : 'Save'}
                {linkSaved && !savingLink && <Check className="h-3.5 w-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceTermsCard({ company }: { company: any }) {
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
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6">
      <p className="text-sm font-bold text-slate-900">Standard Payment Terms</p>
      <p className="mt-0.5 text-xs text-slate-500">Appears on every PDF invoice you send.</p>

      <textarea
        value={terms}
        onChange={(e) => setTerms(e.target.value)}
        rows={3}
        placeholder="e.g. Net 15 days. A 1.5% monthly late fee applies to overdue balances. All work is warrantied for 12 months."
        className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
      />

      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-30"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
          {saved && !saving && <Check className="h-3.5 w-3.5 text-emerald-400" />}
        </button>
      </div>
    </div>
  );
}

function InvoicePreviewCard({ company }: { company: any }) {
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

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Preview</p>
          <p className="text-xs text-slate-500">Exactly what customers see.</p>
        </div>
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'invoice' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Invoice PDF
          </button>
        </div>
      </div>

      {activeTab === 'email' && (
        <div className="mx-auto mt-4 w-full max-w-xl overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </div>
            <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-500">
              {companyName} &lt;{company.email || 'billing@yourbusiness.com'}&gt;
            </p>
          </div>

          <div className="border-b border-slate-100 px-6 py-3 bg-slate-50/30">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</p>
            <p className="mt-0.5 truncate text-xs font-bold text-slate-900">
              Invoice {SAMPLE_INVOICE_NUMBER} from {companyName}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6">
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo_url} alt={companyName} className="h-8 w-auto object-contain" />
              ) : (
                <span className="text-sm font-black tracking-tight text-slate-900">{companyName}</span>
              )}
            </div>

            <p className="text-sm font-bold text-slate-900">Hello {SAMPLE_CUSTOMER_NAME},</p>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
              Your invoice <span className="font-semibold text-slate-900">{SAMPLE_INVOICE_NUMBER}</span> for{' '}
              <span className="font-semibold text-slate-900">${SAMPLE_TOTAL.toFixed(2)}</span> is ready. You can review details or pay securely online below.
            </p>

            <div className="mt-6 space-y-2.5">
              {payLabel ? (
                <div
                  className="rounded-xl py-3 text-center text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  {payLabel} — ${SAMPLE_TOTAL.toFixed(2)}
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 py-3 text-center text-xs font-bold text-amber-800">
                  Manual Collection — No Online Link
                </div>
              )}
              <div className="rounded-xl border border-slate-200 py-3 text-center text-xs font-bold text-slate-700">
                Download Attached PDF
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              Due on <span className="font-semibold text-slate-600">{SAMPLE_DUE_DATE}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoice' && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setExpandedInvoice(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              Full Screen <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mx-auto h-[420px] w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200/80 bg-white">
            <iframe src={previewUrl} title="Sample invoice preview" className="h-full w-full border-0 pointer-events-none" />
          </div>
        </div>
      )}

      {expandedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => setExpandedInvoice(false)}
        >
          <div
            className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <span className="text-sm font-bold text-slate-900">Invoice Preview</span>
              <button type="button" onClick={() => setExpandedInvoice(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
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
   MAIN PAGE LAYOUT — two-column at the top (setup steps + static
   fee/features panel), matching the reference's structure. Invoice
   presentation stays full-width below, since it doesn't have a
   natural "info sidebar" counterpart the way payment setup does.
───────────────────────────────────────────────────────────── */

export default function PaymentsTab({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="w-full space-y-8 pb-12">
               <div>
          <PaymentsFontLoader />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Lead2Project Payments
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Connect card payments and set how Lead2Project invoices look to your customers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <PaymentSetupSteps company={company} />
          <PaymentOptionsPanel />
        </div>

        <section>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Invoice Presentation</p>
          <div className="space-y-3">
            <InvoiceTermsCard company={company} />
            <InvoicePreviewCard company={company} />
          </div>
        </section>
      </div>
    </div>
  );
}