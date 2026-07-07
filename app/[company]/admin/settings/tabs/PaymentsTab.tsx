'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import StripePaymentInfo from '@/components/dashboard/StripePaymentInfo';
import { describeRequirementReason } from '@/lib/stripe/requirementCopy';

const PAYMENT_COLORS: Record<string, string> = {
  venmo: '#008CFF',
  zelle: '#6D1ED4',
  cashapp: '#00D632',
  paypal: '#003087',
  other: '#64748b',
};

const CARD_BADGES = ['Visa', 'Mastercard', 'Amex', 'Discover', 'Apple Pay', 'Google Pay'];

// Maps Stripe's requirement codes to plain-English copy a contractor can act on.
// Add to this as you encounter new codes in production — fall back to the
// generic message for anything unmapped rather than showing a raw Stripe code.
function describeBlockingReasons(
  reasons: { capability: string; code: string }[] | null | undefined
): string {
  if (!reasons || reasons.length === 0) {
    return 'Your Stripe account needs more info before you can receive payouts.';
  }
  const messages = reasons.map((r) => describeRequirementReason(r.code, r.capability));
  return Array.from(new Set(messages)).join(' ');
}

// Text-based wordmark in Stripe's brand purple — avoids pulling in an actual
// logo asset while still making it unmistakably "this is Stripe."
function StripeWordmark({ className = 'text-xl' }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`} style={{ color: '#635BFF' }}>
      stripe
    </span>
  );
}

function CardBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200">
      {label}
    </span>
  );
}

/* ─────────────────── METHOD SELECTOR ─────────────────── */
function MethodOption({
  active,
  onClick,
  icon: Icon,
  iconBg,
  iconColor,
  eyebrow,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left rounded-xl border-2 p-4 transition-all ${
        active ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {eyebrow}
          </p>
          <p className="text-[15px] font-semibold text-slate-900">{title}</p>
          <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
            active ? 'border-slate-900' : 'border-slate-300'
          }`}
        >
          {active && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
        </div>
      </div>
    </button>
  );
}

/* ─────────────────── STRIPE PATH ─────────────────── */
function StripeConnectSection({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [redirectStatus, setRedirectStatus] = useState<
    'idle' | 'error' | 'denied' | 'already_linked'
  >('idle');
  const [connectError, setConnectError] = useState<string | null>(null);

  const isConnected = !!company.stripe_connect_onboarded;
  const paymentStatus: 'active' | 'restricted' | 'pending' | null =
    company.stripe_payment_status ?? null;
  const blockingReasons = company.stripe_requirements_summary ?? [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sc = params.get('stripe_connect');
    if (sc === 'error' || sc === 'denied' || sc === 'already_linked') {
      setRedirectStatus(sc as any);
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
        setConnectError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setLoading(false);
      setConnectError('Something went wrong. Please try again.');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Restricted state gets its own top banner, matching Stripe's own
          "Payments Paused" pattern so it reads as a Stripe-level alert. */}
      {isConnected && paymentStatus === 'restricted' && (
        <div className="bg-rose-50 border-b border-rose-100 px-5 py-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-rose-800">Payments paused</p>
            <p className="text-[13px] text-rose-700 mt-0.5 leading-relaxed">
              {describeBlockingReasons(blockingReasons)}
            </p>
          </div>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-semibold text-rose-700 underline shrink-0 whitespace-nowrap mt-0.5"
          >
            Go to Stripe
          </a>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <StripeWordmark />
          {!isConnected && (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-slate-900 text-white">
              Recommended
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {CARD_BADGES.map((label) => (
            <CardBadge key={label} label={label} />
          ))}
        </div>

        <StripePaymentInfo accountStatus={!isConnected ? null : paymentStatus} />

        {redirectStatus === 'error' && (
          <p className="mt-3 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2.5">
            Something went wrong connecting Stripe. Please try again.
          </p>
        )}
        {redirectStatus === 'denied' && (
          <p className="mt-3 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
            Stripe connection was cancelled.
          </p>
        )}
        {redirectStatus === 'already_linked' && (
          <p className="mt-3 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
            That Stripe account is already connected to a different company. Use a
            different Stripe account, or contact support if you believe this is an
            error.
          </p>
        )}
        {connectError && (
          <p className="mt-3 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2.5">
            {connectError}
          </p>
        )}

        {isConnected ? (
          <div className="mt-4 space-y-3">
            {paymentStatus === 'active' && (
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <CheckCircle className="w-4 h-4" /> Connected — customers can pay
                invoices with a card.
              </div>
            )}

            {paymentStatus === 'pending' && (
              <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Stripe is reviewing your
                information.
              </div>
            )}

            {paymentStatus === null && (
              <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking account
                status...
              </div>
            )}

            {paymentStatus === null ? null : paymentStatus === 'active' ? (
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-all active:scale-95"
              >
                Manage on Stripe
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-all active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Redirecting...' : 'Finish setup on Stripe'}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 mb-4">
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Already have a Stripe account?
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Log in and you're connected in under a minute — same account you'd
                use anywhere else that takes Stripe payments.
              </p>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Don't have one yet?
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stripe walks you through creating one — it's the same standard
                business and banking info you'd give any payment processor or CRM
                when signing up to accept cards. Once approved, every invoice you
                send automatically includes a "Pay Now" button, and standard card
                processing rates apply (
                <a
                  href="https://stripe.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  see Stripe's current rates
                </a>
                ).
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-3 bg-[#635BFF] hover:bg-[#5147e8] text-white rounded-lg font-semibold text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Redirecting...' : 'Connect with Stripe'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────── MANUAL PATH ─────────────────── */
function ManualPaymentLinkSection({ company }: { company: any }) {
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
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // no-op, keep it simple
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Manual link
          </p>
          <p className="text-[15px] font-semibold text-slate-900">
            Venmo, Zelle, Cash App, or PayPal
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-4 py-3 mb-4 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-amber-800 leading-relaxed">
          Heads up — with a manual link, the customer has to open it and{' '}
          <strong>type in the invoice amount themselves</strong> when they pay.
          There's no automatic confirmation on your end when they do, so you'll
          need to mark the invoice paid yourself once you see the payment come
          through.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="sm:w-40 shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 ring-blue-100 transition"
        >
          <option value="">Method...</option>
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
          placeholder="https://venmo.com/your-handle"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 ring-blue-100 transition placeholder:text-slate-400 placeholder:font-normal"
        />
      </div>

      {type && (
        <span
          className="inline-block mt-3 text-[10px] font-semibold px-2 py-1 rounded-full text-white"
          style={{ background: PAYMENT_COLORS[type] || '#64748b' }}
        >
          {type}
        </span>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-all active:scale-95"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <CheckCircle className="w-4 h-4" />
        ) : null}
        {saving ? 'Saving...' : saved ? 'Saved' : 'Save link'}
      </button>
    </div>
  );
}

/* ─────────────────── CONTEXT PANELS ─────────────────── */
function HowSendingWorks({ company }: { company: any }) {
  const stripeActive = company.stripe_payment_status === 'active';
  const hasManualLink = !!company.payment_link_url;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
      <p className="text-xs font-semibold text-slate-700 mb-3">
        What customers see when you send an invoice
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`rounded-lg border p-3.5 ${
            stripeActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'
          }`}
        >
          <p className="text-[11px] font-semibold text-slate-700 mb-1">
            {stripeActive ? 'Currently active — Stripe' : 'If Stripe is connected'}
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            The email and PDF include a one-click "Pay Now" button. Customers pay
            by card, and your dashboard updates automatically — no manual
            tracking needed.
          </p>
        </div>
        <div
          className={`rounded-lg border p-3.5 ${
            !stripeActive && hasManualLink
              ? 'border-amber-200 bg-amber-50/50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <p className="text-[11px] font-semibold text-slate-700 mb-1">
            {!stripeActive && hasManualLink
              ? 'Currently active — manual link'
              : 'If using a manual link instead'}
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {hasManualLink
              ? `The email includes your ${
                  company.payment_link_type || 'payment'
                } link with a note asking the customer to enter the invoice amount themselves when they pay — there's no automatic confirmation when they do.`
              : 'No manual payment link is set up yet. Add one instead of Stripe if you\'d rather not connect a processor.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Base "design" size the invoice renders at before scaling down — a rough
// letter-page proportion. If a long invoice (lots of line items) still gets
// cut off at the bottom, bump BASE_HEIGHT up; this is a guess, not measured
// from real rendered output.
const PREVIEW_SCALE = 0.42;
const BASE_WIDTH = 850;
const BASE_HEIGHT = 1100;

function SampleInvoicePreview({ company }: { company: any }) {
  const boxWidth = BASE_WIDTH * PREVIEW_SCALE;
  const boxHeight = BASE_HEIGHT * PREVIEW_SCALE;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-700">
          Example invoice customers receive
        </p>
        <a
          href={`/api/company/${company.slug}/preview-invoice`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-medium text-blue-600 hover:underline"
        >
          View full size
        </a>
      </div>
      <div
        className="mx-auto rounded-lg border border-slate-200 overflow-hidden bg-slate-50"
        style={{ width: boxWidth, height: boxHeight }}
      >
        <div
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            src={`/api/company/${company.slug}/preview-invoice`}
            title="Sample invoice"
            style={{ width: BASE_WIDTH, height: BASE_HEIGHT, border: 0 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── MAIN ─────────────────── */
export default function PaymentsTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [method, setMethod] = useState<'stripe' | 'manual'>(() => {
    if (company.payment_link_url && !company.stripe_connect_onboarded) return 'manual';
    return 'stripe';
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4 sm:px-0">
      {/* ── HEADER ── */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Payment settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure how you collect money from customers.
        </p>
      </div>

      {/* ── METHOD SELECTOR ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <MethodOption
          active={method === 'stripe'}
          onClick={() => setMethod('stripe')}
          icon={CreditCard}
          iconBg="rgba(99, 91, 255, 0.1)"
          iconColor="#635BFF"
          eyebrow="Full payment experience"
          title="Connect with Stripe"
          description="Automatic card payments and payout tracking, right on your invoice."
        />
        <MethodOption
          active={method === 'manual'}
          onClick={() => setMethod('manual')}
          icon={Wallet}
          iconBg="#f1f5f9"
          iconColor="#64748b"
          eyebrow="Backup option"
          title="Use a manual link"
          description="Venmo, Zelle, Cash App, or PayPal — customer enters the amount."
        />
      </div>

      {/* ── MAIN ACTIONS ── */}
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          {method === 'stripe' ? (
            <StripeConnectSection company={company} />
          ) : (
            <ManualPaymentLinkSection company={company} />
          )}
        </div>

        {/* ── CONTEXTUAL HELPER (sticky on desktop) ── */}
        <div className="md:col-span-2 space-y-6">
          <div className="sticky top-6">
            <HowSendingWorks company={company} />
          </div>
        </div>
      </div>

      {/* ── PREVIEW ── */}
      <SampleInvoicePreview company={company} />
    </div>
  );
}