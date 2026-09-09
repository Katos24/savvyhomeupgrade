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
  PenLine,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Mail,
  FileText,
  Calendar,
  CreditCard,
  Building2,
  UserCheck,
  Receipt,
  Eye,
  Check,
  SparkleIcon,
  ArrowRight
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
   BRAND & BADGE COMPONENTS
───────────────────────────────────────────────────────────── */

function StripeWordmark({ className = 'text-xl' }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight text-[#635BFF] ${className}`}>
      stripe
    </span>
  );
}

function MethodBadge({ network }: { network: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-2xs transition-all hover:bg-white hover:shadow-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {network}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO / STATUS BANNER
───────────────────────────────────────────────────────────── */

function ConnectionStatusHero({ company }: { company: any }) {
  const stripeActive = !!company.stripe_connect_onboarded && company.stripe_payment_status === 'active';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 p-6 text-white shadow-xl sm:p-8">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md">
            {stripeActive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live Payment Gateway
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Manual Collection Default
              </>
            )}
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {stripeActive ? 'Automatic Card Payments Active' : 'Connect Stripe to Accept Cards'}
          </h2>

          <p className="max-w-xl text-xs sm:text-sm text-slate-400 leading-relaxed">
            {stripeActive
              ? 'Invoices automatically issue digital checkout links. Real-time webhook notifications update your ledger instantly.'
              : 'Record cash, check, or external transfers instantly with zero fees. Connect Stripe below whenever you are ready to accept cards.'}
          </p>
        </div>

        <div className="shrink-0">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {stripeActive ? <Zap className="h-5 w-5 text-emerald-400" /> : <PenLine className="h-5 w-5 text-indigo-300" />}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Default Mode</p>
              <p className="text-sm font-bold text-white">{stripeActive ? 'Stripe Checkout' : 'Manual / Offline'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STRIPE SETUP CARD (HERO STYLE)
───────────────────────────────────────────────────────────── */

function StripeSetupCard({ company }: { company: any }) {
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

  const checklistItems = [
    { icon: Building2, title: 'Tax ID', desc: 'EIN for entities, or SSN/ITIN for sole proprietors' },
    { icon: FileText, title: 'Legal Information', desc: 'Registered business name, contact info, and address' },
    { icon: CreditCard, title: 'Payout Destination', desc: 'Bank account and routing number for standard daily transfers' },
    { icon: UserCheck, title: 'Identity Check', desc: 'Legal representative details and photo ID (if prompted)' },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#635BFF]/10 text-[#635BFF]">
            <StripeWordmark className="text-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Direct Card Integration</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                <Sparkles className="h-3 w-3" /> Recommended
              </span>
            </div>
            <p className="text-xs text-slate-500">Instant deposits, automatic ledger updates, zero manual intervention.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {checkingStatus && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" /> Syncing...
            </span>
          )}
          <div className="flex items-center gap-1">
            {['Visa', 'Mastercard', 'Amex', 'Apple Pay'].map((net) => (
              <MethodBadge key={net} network={net} />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {isConnected && paymentStatus === 'restricted' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              Payouts temporarily on hold
            </div>
            <p className="mt-1 text-xs leading-relaxed text-rose-700">{describeBlockingReasons(blockingReasons)}</p>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-800 underline hover:text-rose-900"
            >
              Complete verification on Stripe <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        )}

        {redirectStatus === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
            Something went wrong during Stripe setup. Please try connecting again.
          </div>
        )}
        {connectError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
            {connectError}
          </div>
        )}

        {isConnected ? (
          paymentStatus === 'active' ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-emerald-50/50 border border-emerald-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900">Connected and Ready</p>
                  <p className="text-xs text-emerald-700">Online pay links are active on all new customer invoices.</p>
                </div>
              </div>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all"
              >
                Stripe Dashboard <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-indigo-50/50 border border-indigo-100 p-5">
              <div>
                <p className="text-sm font-bold text-indigo-900">Setup Pending Completion</p>
                <p className="text-xs text-indigo-700">Stripe requires additional business verification before payouts open.</p>
              </div>
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#534ae6] disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Resume Setup <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Secure 2-Minute Setup:</span> Existing Stripe accounts pair instantly. New setups take ~5 minutes and are managed end-to-end on Stripe's encrypted infrastructure.
              </div>
            </div>

            {/* Preparation Cards Grid */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Have these items ready before clicking connect:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {checklistItems.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-2xs">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConnect}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635BFF] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-[#534ae6] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Connect with Stripe
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TERMS & CONDITIONS
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
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Receipt className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Standard Payment Terms</h3>
          <p className="mt-0.5 text-xs text-slate-500">Fine print automatically appended to all generated PDF invoices.</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={3}
          placeholder="e.g. Net 15 days. A 1.5% monthly late fee applies to overdue balances. All work is warrantied for 12 months."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-slate-400">Applies globally across all invoices.</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-30"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? 'Saving...' : saved ? 'Saved Successfully' : 'Save Default Terms'}
          {saved && !saving && <Check className="h-3.5 w-3.5 text-emerald-400" />}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PREVIEWS & EMAIL OVERVIEW
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

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Client Presentation Preview</h3>
          <p className="text-xs text-slate-500">How your invoices and digital notifications display to customers.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Control */}
          <div className="inline-flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('invoice')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'invoice' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Invoice PDF
            </button>
          </div>

          <a
            href={`/${company.slug}/home?section=email-templates`}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            Templates <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {activeTab === 'email' && (
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md">
          {/* Email Frame Bar */}
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
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Live Dynamic Render</span>
            <button
              type="button"
              onClick={() => setExpandedInvoice(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Full Screen <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mx-auto h-[480px] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
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
            className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <span className="text-sm font-bold text-slate-900">Document Inspection</span>
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
   HOW IT WORKS ACCORDION
───────────────────────────────────────────────────────────── */

function HowItWorksAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left font-bold text-slate-800 hover:bg-slate-50/50 transition"
      >
        <span className="flex items-center gap-2.5 text-sm">
          <HelpCircle className="h-4 w-4 text-indigo-600" />
          How do online invoice payments work?
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-slate-100 p-6 pt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
          <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/50 p-4">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <div>
              <p className="font-bold text-slate-900">With Stripe Connected</p>
              <p className="mt-0.5 text-xs text-slate-600">Invoices automatically append secure pay-online checkout links. The moment a client pays, webhooks mark the invoice paid and log the deposit.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
            <div>
              <p className="font-bold text-slate-900">Without Stripe (Manual Mode)</p>
              <p className="mt-0.5 text-xs text-slate-600">Accept cash, Zelle, Venmo, or check offline. Click "Record Payment" manually on the invoice tab to update balances.</p>
            </div>
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
    <div className="mx-auto max-w-5xl space-y-8 font-sans text-slate-900 antialiased pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Payments & Processing</h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
          Manage payment processing, automatic card collection, and invoice layout settings.
        </p>
      </div>

      {/* Connection State Banner */}
      <ConnectionStatusHero company={company} />

      {/* Stripe Interactive Card */}
      <StripeSetupCard company={company} />

      {/* Help & Workflow FAQ */}
      <HowItWorksAccordion />

      {/* Global Invoice Terms */}
      <InvoiceTermsSection company={company} />

      {/* Realtime Previews */}
      <PreviewsSection company={company} />
    </div>
  );
}