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
  Link2,
} from 'lucide-react';

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
   PAYMENT PROCESSING — one status card, one truth, no duplicate
   messaging between a hero banner and a separate setup card. All
   the real logic (live status refresh, redirect handling, connect
   flow) is unchanged from before — only the presentation collapsed
   from two stacked cards into one, and the four-item prep
   checklist moved behind a disclosure instead of always-expanded.
───────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────
   PAYMENT PROCESSING — rebuilt to match SetupTab's exact visual
   language (bordered white card, uppercase header strip, divided
   rows with a status box + description + status badge + chevron)
   for a consistent look across Settings tabs.

   Both real options — Stripe and a manual link — are shown as
   genuinely visible, comparable rows with their real tradeoffs
   stated in normal-weight, readable text. Neither is hidden behind
   a collapsed disclosure; Stripe is still the recommended default
   (marked as such), but the manual alternative is a first-class,
   equally legible option, not an afterthought.

   MANUAL LINK NEEDS BACKEND SUPPORT NOT YET CONFIRMED TO EXIST:
   posts action: 'update-payment-link' to the same settings
   endpoint InvoiceTermsCard already uses for
   'update-invoice-terms'. If that action doesn't exist yet on
   /api/company/[slug]/settings, it needs to be added — same
   shape, writing payment_link_url/payment_link_type.
───────────────────────────────────────────────────────────── */

function PaymentProcessingSection({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [redirectStatus, setRedirectStatus] = useState<'idle' | 'error' | 'denied' | 'already_linked'>('idle');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [stripeExpanded, setStripeExpanded] = useState(false);
  const [manualExpanded, setManualExpanded] = useState(false);

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

  const checklistItems = [
    { title: 'Tax ID', desc: 'EIN for a business, or SSN/ITIN if you\u2019re a sole proprietor' },
    { title: 'Legal information', desc: 'Registered business name, contact info, and address' },
    { title: 'Payout destination', desc: 'Bank account and routing number for daily transfers' },
    { title: 'Identity check', desc: 'Legal representative details and photo ID, if Stripe asks' },
  ];

  return (
    <section>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Payment Processing</p>

      {redirectStatus === 'error' && (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          Something went wrong during Stripe setup. Please try connecting again.
        </div>
      )}
      {connectError && (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {connectError}
        </div>
      )}

      {/* ONE bordered card, header strip + divided rows — matching
          SetupTab's checklist table exactly, so Settings tabs share a
          consistent visual language instead of each inventing their own. */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Choose How You Get Paid</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* ── ROW 1: STRIPE ── */}
          <div>
            <button
              type="button"
              onClick={() => setStripeExpanded((v) => !v)}
              className="group flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50/60"
            >
              <div className="flex min-w-0 items-start gap-3.5 pr-4">
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                    stripeActive
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {stripeActive ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : (
                    <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-600">1</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-900 sm:text-sm">
                    Stripe
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">Recommended</span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                    Customers pay online with a card, and your ledger updates the moment they do — nothing to
                    record by hand. Stripe takes a small processing fee on every payment, and setup takes a
                    few minutes of real business verification.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  stripeActive
                    ? 'border-slate-200 bg-slate-100 text-slate-500'
                    : isConnected
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  {stripeActive ? 'Connected' : isConnected ? 'Pending' : 'Not Connected'}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${stripeExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {stripeExpanded && (
              <div className="px-5 pb-5 pl-[3.1rem]">
                {isConnected && paymentStatus === 'restricted' && (
                  <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-sm">
                    <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
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
                    className="inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#534ae6] transition disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Resume Setup <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}

                {!isConnected && (
                  <>
                    <button
                      type="button"
                      onClick={handleConnect}
                      disabled={loading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#534ae6] disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Connect Stripe <ArrowRight className="h-4 w-4" /></>}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowChecklist((v) => !v)}
                      className="mt-3 flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      What you&rsquo;ll need (takes about 2 minutes)
                      <ChevronDown className={`h-3 w-3 transition-transform ${showChecklist ? 'rotate-180' : ''}`} />
                    </button>
                    {showChecklist && (
                      <div className="mt-2 space-y-2 rounded-xl bg-slate-50 p-3">
                        {checklistItems.map((item) => (
                          <div key={item.title} className="text-[11px] leading-relaxed">
                            <span className="font-semibold text-slate-700">{item.title}:</span>{' '}
                            <span className="text-slate-500">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── ROW 2: MANUAL LINK ── */}
          <div>
            <button
              type="button"
              onClick={() => setManualExpanded((v) => !v)}
              className="group flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50/60"
            >
              <div className="flex min-w-0 items-start gap-3.5 pr-4">
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                    linkIsSet
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {linkIsSet ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : (
                    <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-600">2</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 sm:text-sm">Manual Link</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                    Venmo, Zelle, Cash App, or PayPal — no processing fee, and works right away with no setup.
                    The tradeoff: nothing updates automatically. Customers pay you directly, and you have to
                    open the job and record the payment yourself once it lands. No card payments.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  linkIsSet
                    ? 'border-slate-200 bg-slate-100 text-slate-500'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  {linkIsSet ? 'Set' : 'Not Set'}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${manualExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {manualExpanded && (
              <div className="px-5 pb-5 pl-[3.1rem]">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
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
                    className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSaveLink}
                    disabled={savingLink || !linkIsDirty}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-30"
                  >
                    {savingLink && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {savingLink ? 'Saving...' : linkSaved ? 'Saved' : 'Save'}
                    {linkSaved && !savingLink && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowHowItWorks((v) => !v)}
        className="mt-2 flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
      >
        How does this affect what customers see?
        <ChevronDown className={`h-3 w-3 transition-transform ${showHowItWorks ? 'rotate-180' : ''}`} />
      </button>
      {showHowItWorks && (
        <div className="mt-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500 space-y-2">
          <p>
            <span className="font-semibold text-slate-700">With Stripe connected:</span> every invoice
            automatically includes a secure pay-online link. The moment a customer pays, your ledger updates
            on its own.
          </p>
          <p>
            <span className="font-semibold text-slate-700">With a manual link:</span> customers pay you
            directly. Record it yourself with &ldquo;Record Payment&rdquo; on the job&rsquo;s Invoice tab.
          </p>
        </div>
      )}
    </section>
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
   MAIN PAGE LAYOUT
───────────────────────────────────────────────────────────── */

export default function PaymentsTab({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="w-full space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Connect card payments and set how your invoices look to customers.
        </p>
      </div>

      <PaymentProcessingSection company={company} />

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