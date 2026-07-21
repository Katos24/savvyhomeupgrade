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
  ChevronUp
} from 'lucide-react';
import StripePaymentInfo from '@/components/dashboard/StripePaymentInfo';
import { describeRequirementReason } from '@/lib/stripe/requirementCopy';

const PAYMENT_COLORS: Record<string, string> = {
  venmo: '#008CFF',
  zelle: '#6D1ED4',
  cashapp: '#00D632',
  paypal: '#003087',
  other: '#44403c',
};

const CARD_NETWORKS = ['visa', 'mastercard', 'amex', 'discover', 'applepay', 'googlepay'];

// Maps Stripe's requirement codes to plain copy a contractor can act on.
function describeBlockingReasons(
  reasons: { capability: string; code: string }[] | null | undefined
): string {
  if (!reasons || reasons.length === 0) {
    return 'Stripe needs more information before payouts can resume.';
  }
  const messages = reasons.map((r) => describeRequirementReason(r.code, r.capability));
  return Array.from(new Set(messages)).join(' ');
}

function StripeWordmark() {
  return (
    <span className="text-lg font-extrabold tracking-tight" style={{ color: '#4B45D6' }}>
      stripe
    </span>
  );
}

function CardNetworkMark({ network, large }: { network: string; large?: boolean }) {
  const base = `flex ${large ? 'h-6 w-9' : 'h-5 w-7'} shrink-0 items-center justify-center rounded-[3px] bg-white`;
  const textSize = large ? 'text-[10px]' : 'text-[9px]';
  const microTextSize = large ? 'text-[8px]' : 'text-[7px]';
  switch (network) {
    case 'visa':
      return (
        <span className={base}>
          <span className={`${textSize} font-black italic tracking-tighter`} style={{ color: '#1A1F71' }}>
            VISA
          </span>
        </span>
      );
    case 'mastercard':
      return (
        <span className={base}>
          <span className={`relative flex ${large ? 'h-3.5 w-6' : 'h-3 w-5'} items-center`}>
            <span
              className={`absolute left-0 ${large ? 'h-3.5 w-3.5' : 'h-3 w-3'} rounded-full`}
              style={{ backgroundColor: '#EB001B' }}
            />
            <span
              className={`absolute ${large ? 'left-[9px] h-3.5 w-3.5' : 'left-[7px] h-3 w-3'} rounded-full opacity-90`}
              style={{ backgroundColor: '#F79E1B' }}
            />
          </span>
        </span>
      );
    case 'amex':
      return (
        <span className={base} style={{ backgroundColor: '#1F72CD' }}>
          <span className={`${microTextSize} font-extrabold tracking-tight text-white`}>AMEX</span>
        </span>
      );
    case 'discover':
      return (
        <span className={base}>
          <span className={`${microTextSize} font-black italic tracking-tight`} style={{ color: '#FF6000' }}>
            DISCOVER
          </span>
        </span>
      );
    case 'applepay':
      return (
        <span className={`${base} gap-0.5 px-1`} style={{ backgroundColor: '#000' }}>
          <svg viewBox="0 0 14 16" width="9" height="10" aria-hidden="true">
            <path
              fill="#fff"
              d="M9.6 2.6c-.5.6-1.3 1.1-2.1 1-.1-.8.3-1.7.7-2.2C8.7.8 9.6.4 10.3.3c.1.8-.2 1.6-.7 2.3zM10.3 3.8c-1.2-.1-2.2.7-2.8.7-.6 0-1.4-.6-2.4-.6-1.2 0-2.4.7-3 1.8-1.3 2.2-.3 5.5.9 7.3.6.9 1.3 1.9 2.3 1.8.9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2.1-.1 0-1.9-.7-1.9-2.8 0-1.7 1.4-2.5 1.5-2.6-.8-1.2-2.1-1.3-2.5-1.3z"
            />
          </svg>
          <span className={`${microTextSize} font-bold text-white`}>Pay</span>
        </span>
      );
    case 'googlepay':
      return (
        <span className={base}>
          <span className={`${microTextSize} font-bold text-stone-700`}>
            <span style={{ color: '#4285F4' }}>G</span>
            <span style={{ color: '#EA4335' }}>o</span>
            <span style={{ color: '#FBBC05' }}>o</span>
            <span style={{ color: '#4285F4' }}>g</span>
            <span style={{ color: '#34A853' }}>l</span>
            <span style={{ color: '#EA4335' }}>e</span> Pay
          </span>
        </span>
      );
    default:
      return null;
  }
}

function CardBadge({ network }: { network: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-stone-100 p-1.5">
      <CardNetworkMark network={network} large />
    </span>
  );
}

function StatusStamp({ state }: { state: 'active' | 'pending' | 'restricted' | 'none' }) {
  const config = {
    active: { label: 'Active', pill: 'bg-emerald-600 text-white', dot: 'bg-white' },
    pending: { label: 'In review', pill: 'bg-amber-500 text-white', dot: 'bg-white' },
    restricted: { label: 'On hold', pill: 'bg-rose-600 text-white', dot: 'bg-white' },
    none: { label: 'Not connected', pill: 'bg-stone-200 text-stone-700', dot: 'bg-stone-500' },
  }[state];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold ${config.pill}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

/* Collapsible "How this works" drawer to eliminate visual noise */
function HowThisWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/80 transition">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left font-semibold text-stone-800 hover:text-stone-900"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <HelpCircle className="h-4 w-4 text-stone-500" />
          How do payment links work?
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
      </button>

      {open && (
        <div className="space-y-4 border-t border-stone-200 p-4 pt-3 text-[14px]">
          <h3 className="text-base font-extrabold text-stone-900">Get paid without chasing customers down</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="leading-relaxed text-stone-800">
                <span className="font-bold text-stone-900">Every invoice includes a payment link</span> — in the email and on the invoice itself.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="leading-relaxed text-stone-800">
                <span className="font-bold text-stone-900">Connect Stripe and payments are tracked automatically.</span> The customer pays by card, and the invoice is marked paid on your dashboard the moment it happens — no follow-up required.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="leading-relaxed text-stone-800">
                <span className="font-bold text-stone-900">Prefer a manual link instead (Venmo, Zelle, Cash App, PayPal)?</span> The customer enters the amount themselves, and you&apos;ll need to check for the payment and mark the invoice paid yourself.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    const inUnsettledState =
      !!company.stripe_connect_onboarded && company.stripe_payment_status !== 'active';
    if (justReturnedFromStripe || inUnsettledState) {
      refreshLiveStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const stampState: 'active' | 'pending' | 'restricted' | 'none' = !isConnected
    ? 'none'
    : paymentStatus === 'active'
    ? 'active'
    : paymentStatus === 'restricted'
    ? 'restricted'
    : 'pending';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StripeWordmark />
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            <Zap className="h-3 w-3" /> Recommended
          </span>
        </div>
        <div className="flex items-center gap-2">
          {checkingStatus && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking with Stripe
            </span>
          )}
          <StatusStamp state={stampState} />
        </div>
      </div>

      {isConnected && paymentStatus !== 'active' && !checkingStatus && (
        <button
          type="button"
          onClick={refreshLiveStatus}
          className="mt-2 text-[12px] font-bold text-stone-500 underline hover:text-stone-800"
        >
          Refresh status
        </button>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {CARD_NETWORKS.map((n) => (
          <CardBadge key={n} network={n} />
        ))}
      </div>

      {isConnected && paymentStatus === 'restricted' && (
        <div className="mt-4 rounded-lg border-2 border-rose-300 bg-rose-50 px-4 py-3">
          <p className="text-sm font-bold text-rose-900">Payments paused</p>
          <p className="mt-0.5 text-[13.5px] font-medium leading-relaxed text-rose-800">
            {describeBlockingReasons(blockingReasons)}
          </p>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[12.5px] font-bold text-rose-800 underline"
          >
            Go to Stripe
          </a>
        </div>
      )}

      <div className="mt-4">
        <StripePaymentInfo accountStatus={!isConnected ? null : paymentStatus} />
      </div>

      {redirectStatus === 'error' && (
        <p className="mt-3 rounded-lg border-2 border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-800">
          Something went wrong connecting Stripe. Try again.
        </p>
      )}
      {redirectStatus === 'denied' && (
        <p className="mt-3 rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800">
          Stripe connection was cancelled.
        </p>
      )}
      {redirectStatus === 'already_linked' && (
        <p className="mt-3 rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800">
          That Stripe account is already connected to a different company. Use a different account, or contact support if this looks wrong.
        </p>
      )}
      {connectError && (
        <p className="mt-3 rounded-lg border-2 border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-800">
          {connectError}
        </p>
      )}

      {isConnected ? (
        <div className="mt-5">
          {paymentStatus === null ? (
            <div className="flex items-center gap-2 text-sm font-bold text-stone-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking account status
            </div>
          ) : paymentStatus === 'active' ? (
            <div>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800"
              >
                Manage on Stripe
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <p className="mt-2.5 text-[13px] font-semibold text-stone-600">
                You&apos;re connected — card payments are live. Issue refunds, see payouts, and view full account details on Stripe.
              </p>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Redirecting' : 'Finish setup on Stripe'}
                {!loading && <ArrowUpRight className="h-3.5 w-3.5" />}
              </button>
              <p className="mt-2.5 text-[13px] font-semibold text-stone-600">
                {paymentStatus === 'restricted'
                  ? "You're connected, but Stripe needs more information before payments can resume — see the details above."
                  : "You're connected, but setup isn't finished yet. Pick up where you left off on Stripe."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-4 space-y-3 rounded-lg border-2 border-stone-200 bg-stone-50 p-4 text-[13px] font-medium leading-relaxed text-stone-800">
            <p>
              <span className="font-bold text-stone-900">Already have a Stripe account? </span>
              Log in and you&apos;re linked in under a minute — no new paperwork needed.
            </p>
            <p>
              <span className="font-bold text-stone-900">Starting fresh? </span>
              You&apos;ll complete Stripe&apos;s own signup: your legal name and date of birth, the last 4 digits of your SSN (or an EIN if you&apos;re a registered business), and a bank account and routing number for payouts. It usually takes 5–10 minutes.
            </p>
            <p className="text-stone-600">
              This is Stripe&apos;s identity verification, required by law for anyone accepting card payments — the same info you&apos;d give any payment processor. We never see or store it; it goes directly to Stripe. Once approved, every invoice gets a pay now button, and standard card processing rates apply (
              <a
                href="https://stripe.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-stone-800 underline"
              >
                see Stripe&apos;s current rates
              </a>
              ).
            </p>
          </div>

          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition-colors disabled:opacity-60 sm:w-auto"
            style={{ backgroundColor: '#4B45D6' }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Redirecting' : 'Connect Stripe account'}
            {!loading && <ArrowUpRight className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

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
      // Intentionally unhandled failure
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-start gap-2.5 rounded-lg border-2 border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-[13px] font-semibold leading-relaxed text-amber-900">
          Reminder: the customer types in the amount themselves, and there&apos;s no automatic confirmation. Mark the invoice paid yourself once you see it come through.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border-2 border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-900 outline-none transition focus:border-stone-900 sm:w-40 sm:shrink-0"
        >
          <option value="">Method</option>
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
          className="flex-1 rounded-lg border-2 border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-400 focus:border-stone-900"
        />
      </div>

      {type && (
        <span
          className="mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: PAYMENT_COLORS[type] || '#44403c' }}
        >
          {type}
        </span>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Saving' : saved ? 'Saved' : 'Save link'}
        {saved && !saving && <CheckCircle2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

function MethodTabs({
  method,
  onChange,
  hasManualLink,
}: {
  method: 'stripe' | 'manual';
  onChange: (m: 'stripe' | 'manual') => void;
  hasManualLink: boolean;
}) {
  const tabs: { id: 'stripe' | 'manual'; label: string }[] = [
    { id: 'stripe', label: 'Stripe' },
    { id: 'manual', label: 'Manual link' },
  ];
  return (
    <div className="flex items-center gap-1 border-b-2 border-stone-300">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors ${
            method === tab.id ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {tab.label}
          {tab.id === 'manual' && hasManualLink && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          )}
          {method === tab.id && (
            <span className="absolute inset-x-0 -bottom-[2px] h-[3px] bg-stone-900" />
          )}
        </button>
      ))}
    </div>
  );
}

const SAMPLE_INVOICE_NUMBER = 'SAMPLE-001';
const SAMPLE_TOTAL = 505;
const SAMPLE_CUSTOMER_NAME = 'Jane Customer';
const SAMPLE_DUE_DATE = 'July 22, 2026';

function MockEmailPreview({ company }: { company: any }) {
  const stripeActive =
    !!company.stripe_connect_onboarded && company.stripe_payment_status === 'active';
  const hasManualLink = !!company.payment_link_url;

  const paymentMethodLabels: Record<string, string> = {
    venmo: 'Pay with Venmo',
    zelle: 'Pay with Zelle',
    cashapp: 'Pay with Cash App',
    paypal: 'Pay with PayPal',
    stripe: 'Pay with card',
    other: 'Pay now',
  };

  const effectiveType = stripeActive ? 'stripe' : hasManualLink ? company.payment_link_type || 'other' : null;
  const payLabel = effectiveType ? paymentMethodLabels[effectiveType] || 'Pay now' : null;
  const accent = company.email_brand_color_1 || '#4B45D6';
  const companyName = company.name || 'Your company';

  return (
    <div className="overflow-hidden rounded-lg border-2 border-stone-300 bg-white">
      <div className="flex items-center gap-1.5 border-b-2 border-stone-200 bg-stone-100 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <span className="ml-2 text-[15px] font-extrabold text-stone-900">Inbox preview</span>
      </div>

      <div className="space-y-1 border-b-2 border-stone-200 px-4 py-3 text-[12px] font-semibold text-stone-500 sm:px-5">
        <p className="truncate">
          <span className="font-bold text-stone-700">From </span>
          {companyName} &lt;hello@lead2project.com&gt;
        </p>
        <p className="truncate">
          <span className="font-bold text-stone-700">To </span>customer@email.com
        </p>
      </div>

      <div className="bg-stone-200 p-3 sm:p-4">
        <div className="mx-auto max-w-[480px] overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="px-5 py-6 text-center sm:px-6" style={{ backgroundColor: accent }}>
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt={companyName} className="mx-auto h-8 object-contain" />
            ) : (
              <p className="text-[19px] font-extrabold text-white">{companyName}</p>
            )}
          </div>

          <div className="px-5 py-6 sm:px-6">
            <p className="text-[14px] font-semibold text-stone-800">Hi {SAMPLE_CUSTOMER_NAME},</p>
            <p className="mt-2 text-[14px] leading-relaxed text-stone-700">
              Here&apos;s invoice {SAMPLE_INVOICE_NUMBER} for ${SAMPLE_TOTAL.toFixed(2)}.
              You can pay online or download the PDF below.
            </p>

            <div className="mt-5 space-y-2.5">
              {payLabel && (
                <div
                  className="rounded-lg px-4 py-3 text-center text-[14px] font-extrabold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {payLabel} — ${SAMPLE_TOTAL.toFixed(2)}
                </div>
              )}
              <div className="rounded-lg bg-stone-900 px-4 py-3 text-center text-[14px] font-extrabold text-white">
                Download invoice PDF
              </div>
              <p className="text-center text-[11px] font-semibold text-stone-400">
                {SAMPLE_INVOICE_NUMBER} · ${SAMPLE_TOTAL.toFixed(2)}
              </p>
            </div>

            <div className="mt-5 rounded-lg border-2 border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-[13px] font-bold text-amber-900">
                Payment due {SAMPLE_DUE_DATE}
              </p>
            </div>

            {!payLabel && (
              <p className="mt-4 rounded-lg border-2 border-stone-200 bg-stone-50 px-3 py-2 text-[12px] font-semibold text-stone-600">
                No payment method connected yet — this email only includes the PDF download until Stripe or a manual link is set up.
              </p>
            )}
          </div>

          <div className="border-t-2 border-stone-100 px-5 py-4 text-center text-[11px] font-semibold text-stone-400 sm:px-6">
            {companyName}
            {company.phone ? ` · ${company.phone}` : ''}
            {company.website ? ` · ${company.website}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

function SampleInvoicePreview({ company }: { company: any }) {
  const [expanded, setExpanded] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [thumbTimedOut, setThumbTimedOut] = useState(false);
  const [modalLoaded, setModalLoaded] = useState(false);
  const [modalTimedOut, setModalTimedOut] = useState(false);
  const previewUrl = `/api/company/${company.slug}/preview-invoice`;

  useEffect(() => {
    const t = setTimeout(() => {
      if (!thumbLoaded) setThumbTimedOut(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [thumbLoaded]);

  useEffect(() => {
    if (!expanded) return;
    const t = setTimeout(() => {
      if (!modalLoaded) setModalTimedOut(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [expanded, modalLoaded]);

  return (
    <>
      <div className="rounded-lg border-2 border-stone-300 bg-white">
        <div className="flex items-center justify-between border-b-2 border-stone-200 bg-stone-100 px-4 py-3">
          <span className="text-[15px] font-extrabold text-stone-900">Invoice preview</span>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-bold text-stone-900 hover:underline"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="block w-full bg-stone-100 p-3 sm:p-4"
        >
          <div
            className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded border-2 border-stone-300 bg-white"
            style={{ height: 360 }}
          >
            {!thumbLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                {thumbTimedOut ? (
                  <p className="px-4 text-center text-[11px] font-bold text-stone-500">
                    Preview didn&apos;t load — try &quot;Open&quot; above.
                  </p>
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-stone-300" />
                )}
              </div>
            )}
            <iframe
              src={previewUrl}
              title="Sample invoice"
              onLoad={() => setThumbLoaded(true)}
              style={{ width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
            />
          </div>
          <p className="mt-2 text-center text-[12px] font-bold text-stone-600">
            Tap to view larger
          </p>
        </button>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-2 sm:p-6"
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex h-[88vh] max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-stone-200 px-4 py-3">
              <span className="text-[15px] font-extrabold text-stone-900">Invoice preview</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 bg-stone-100">
              {!modalLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                  {modalTimedOut ? (
                    <div className="text-center">
                      <p className="text-sm font-bold text-stone-700">
                        The preview didn&apos;t load.
                      </p>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-stone-900 underline"
                      >
                        Open in a new tab <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  )}
                </div>
              )}
              <iframe
                src={previewUrl}
                title="Sample invoice, enlarged"
                onLoad={() => setModalLoaded(true)}
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PaymentsTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [method, setMethod] = useState<'stripe' | 'manual'>('stripe');
  const hasManualLink = !!company.payment_link_url;

  return (
    <div className="bg-[#F3F2FB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl pb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Get paid</h2>
          <p className="mt-1 text-[15px] font-semibold text-stone-700">
            Choose how customers pay the invoices you send.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Main Action Block — Stripe / Manual config placed first */}
          <div className="border-b-2 border-stone-200 bg-stone-50 p-6 sm:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
              <div>
                <MethodTabs method={method} onChange={setMethod} hasManualLink={hasManualLink} />
                <div className="mt-6">
                  {method === 'stripe' ? (
                    <StripeConnectSection company={company} />
                  ) : (
                    <ManualPaymentLinkSection company={company} />
                  )}
                </div>
              </div>

              <div className="lg:pt-1">
                <div className="overflow-hidden rounded-xl border-2 border-stone-200 bg-white">
                  <img
                    src="/images/invoice_thumbnail.webp"
                    alt="Pay now button on the invoice"
                    className="w-full object-contain"
                  />
                </div>
                <p className="mt-2 text-center text-[11px] font-bold text-stone-500">
                  What your customer sees on the invoice
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Informational Blocks */}
          <div className="p-6 sm:p-10 border-b-2 border-stone-100">
            <HowThisWorks />
          </div>

          <div className="p-6 sm:p-10">
            <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-stone-700">
              Sending invoices
            </p>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
              <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-emerald-300 bg-white">
                  <Send className="h-6 w-6 text-emerald-700" />
                </div>
                <p className="text-xl leading-relaxed text-stone-800">
                  When your invoice is ready, click the <span className="font-bold text-stone-900">Send</span> button on the invoice card. The invoice will be emailed to your customer&apos;s primary email address along with a payment link (if enabled).
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border-2 border-stone-200 bg-stone-50">
                <img
                  src="/images/invoice_send.webp"
                  alt="Invoice send button"
                  className="w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-stone-100 p-6 sm:p-10">
            <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-stone-700">
              What the customer receives
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MockEmailPreview company={company} />
              <SampleInvoicePreview company={company} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}