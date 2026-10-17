'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertTriangle, ExternalLink, Check, X, FileText, Plus, RefreshCw, Star, ShieldCheck, CreditCard, Landmark, Lock } from 'lucide-react';
import { platformFeeEnabled, PLATFORM_FEE_RATE, PLATFORM_FEE_CAP_CENTS, PLATFORM_FEE_LABEL } from '@/lib/stripe/platformFee';

/* ─────────────────────────────────────────────────────────────
   Small card marks (shown once, as a single row)
───────────────────────────────────────────────────────────── */

function CardMarks() {
  const box = 'h-6 w-9 rounded-[4px]';
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay">
      <svg viewBox="0 0 48 32" className={box}><rect width="48" height="32" rx="4" fill="#1A1F71" /><text x="24" y="21" textAnchor="middle" fontFamily="Arial" fontWeight="900" fontStyle="italic" fontSize="13" fill="#fff">VISA</text></svg>
      <svg viewBox="0 0 48 32" className={box}><rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0" /><circle cx="20" cy="16" r="9" fill="#EB001B" /><circle cx="28" cy="16" r="9" fill="#F79E1B" fillOpacity="0.9" /></svg>
      <svg viewBox="0 0 48 32" className={box}><rect width="48" height="32" rx="4" fill="#2E77BC" /><text x="24" y="19" textAnchor="middle" fontFamily="Arial" fontWeight="800" fontSize="9" fill="#fff">AMEX</text></svg>
      <svg viewBox="0 0 48 32" className={box}><rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0" /><text x="20" y="19" textAnchor="middle" fontFamily="Arial" fontWeight="800" fontSize="8" fill="#1a1a1a">DISC</text><circle cx="38" cy="16" r="6" fill="#FF6000" /></svg>
      <svg viewBox="0 0 48 32" className={box}><rect width="48" height="32" rx="4" fill="#000" /><text x="24" y="20" textAnchor="middle" fontFamily="-apple-system, Arial" fontWeight="600" fontSize="10" fill="#fff"> Pay</text></svg>
      <svg viewBox="0 0 48 32" className={box}><rect width="48" height="32" rx="4" fill="#fff" stroke="#e2e8f0" /><text x="24" y="20" textAnchor="middle" fontFamily="Arial" fontWeight="600" fontSize="9" fill="#5F6368"><tspan fill="#4285F4">G</tspan> Pay</text></svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Shared bits
───────────────────────────────────────────────────────────── */

type StripeState = 'not_connected' | 'finishing' | 'needs_attention' | 'active';

const STATE_LABEL: Record<StripeState, { label: string; cls: string; dot: string }> = {
  not_connected: { label: 'Not set up', cls: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  finishing: { label: 'Finishing setup', cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  needs_attention: { label: 'Needs attention', cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

function StatusPill({ state }: { state: StripeState }) {
  const s = STATE_LABEL[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}

function Notice({ tone, children }: { tone: 'error' | 'warn'; children: React.ReactNode }) {
  const cls = tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-900';
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${cls}`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const card = 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6';
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40';
const secondaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-40';
const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 sm:text-sm';

const LINK_METHODS = [
  { value: 'venmo', label: 'Venmo', placeholder: 'venmo.com/u/YourBusiness' },
  { value: 'cashapp', label: 'Cash App', placeholder: 'cash.app/$YourBusiness' },
  { value: 'paypal', label: 'PayPal', placeholder: 'paypal.me/YourBusiness' },
  { value: 'zelle', label: 'Zelle', placeholder: 'Your Zelle email or phone' },
  { value: 'other', label: 'Other', placeholder: 'https://…' },
];

const PAY_BUTTON_LABEL: Record<string, string> = {
  stripe: 'Pay with card',
  venmo: 'Pay with Venmo',
  zelle: 'Pay with Zelle',
  cashapp: 'Pay with Cash App',
  paypal: 'Pay with PayPal',
  other: 'Pay invoice',
};

/* Fees on a card payment, spelled out with a real example. */
function FeeBreakdown() {
  const feeOn = platformFeeEnabled();
  const example = 1000;
  const stripeFee = Math.round((example * 0.029 + 0.3) * 100) / 100;
  const ourFee = feeOn ? Math.min(Math.round(example * PLATFORM_FEE_RATE * 100) / 100, PLATFORM_FEE_CAP_CENTS / 100) : 0;
  const youGet = Math.round((example - stripeFee - ourFee) * 100) / 100;
  const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-900">Fees per card payment</p>
      <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
        <li className="flex justify-between gap-3">
          <span>Stripe (card processing)</span>
          <span className="font-semibold text-slate-900">2.9% + 30¢</span>
        </li>
        {feeOn && (
          <li className="flex justify-between gap-3">
            <span>Lead2Project</span>
            <span className="font-semibold text-slate-900">{PLATFORM_FEE_LABEL}</span>
          </li>
        )}
      </ul>
      <p className="mt-2 border-t border-slate-200 pt-2 text-[13px] text-slate-600">
        Example: on a {money(example)} payment, Stripe keeps {money(stripeFee)}
        {feeOn ? `, Lead2Project keeps ${money(ourFee)}` : ''}, and you get{' '}
        <span className="font-semibold text-slate-900">{money(youGet)}</span>. Your customer pays {money(example)}, no extra charge.
        {feeOn && ' If you refund a payment, our fee is refunded too.'}
      </p>
    </div>
  );
}

function describeBlockingReasons(
  reasons: { capability: string; code: string }[] | null | undefined): string {
  if (!reasons || reasons.length === 0) return 'Open Stripe to see what it’s asking for.';
  const msgs = reasons.map((r) => r.code.replace(/_/g, ' '));
  return `Stripe says: ${Array.from(new Set(msgs)).join(', ')}.`;
}

/* ─────────────────────────────────────────────────────────────
   Choice marker (radio-style circle with a check when chosen)
───────────────────────────────────────────────────────────── */

function ChoiceMark({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
        on ? 'border-emerald-600 bg-emerald-600 text-white' : disabled ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-slate-300 bg-white'
      }`}
    >
      {on ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : disabled ? <Lock className="h-3 w-3" /> : null}
    </span>
  );
}

/* Stripe setup as a 3-step checklist, so it's clear where they are. */
function StripeSteps({ state }: { state: StripeState }) {
  const steps: { label: string; detail: string; status: 'done' | 'current' | 'problem' | 'todo' }[] = [
    {
      label: 'Create your Stripe account',
      detail: 'Your business details and the bank account to pay you into.',
      status: state === 'not_connected' ? 'current' : 'done',
    },
    {
      label: 'Stripe checks your details',
      detail:
        state === 'needs_attention'
          ? 'Stripe needs more information. Fix it in Stripe.'
          : state === 'finishing'
          ? 'Usually quick. Finish any steps Stripe still asks for.'
          : 'Happens right after you sign up.',
      status: state === 'active' ? 'done' : state === 'needs_attention' ? 'problem' : state === 'finishing' ? 'current' : 'todo',
    },
    {
      label: 'Take card payments',
      detail: 'Invoices and deposit requests get a card button.',
      status: state === 'active' ? 'done' : 'todo',
    },
  ];
  return (
    <ol className="space-y-3">
      {steps.map((st, i) => (
        <li key={st.label} className="flex items-start gap-3">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              st.status === 'done'
                ? 'bg-slate-900 text-white'
                : st.status === 'current'
                ? 'border-2 border-amber-500 bg-amber-50 text-amber-800'
                : st.status === 'problem'
                ? 'border-2 border-rose-500 bg-rose-50 text-rose-700'
                : 'border-2 border-slate-200 bg-white text-slate-400'
            }`}
          >
            {st.status === 'done' ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : st.status === 'problem' ? '!' : i + 1}
          </span>
          <div className="min-w-0">
            <p className={`text-[15px] font-semibold ${st.status === 'todo' ? 'text-slate-500' : 'text-slate-900'}`}>{st.label}</p>
            <p className="text-sm text-slate-600">{st.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ConfirmDialog({
  title,
  children,
  confirmLabel,
  danger,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => !busy && onCancel()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-slate-700">{children}</div>
        {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className={secondaryBtn}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={danger ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50' : primaryBtn}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Option 1: Card payments (Stripe)
───────────────────────────────────────────────────────────── */

function CardOption({
  company,
  selected,
  onStateChange,
  onTurnOn,
}: {
  company: any;
  selected: boolean;
  onStateChange: (s: StripeState) => void;
  onTurnOn: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [redirectStatus, setRedirectStatus] = useState<'error' | 'denied' | 'already_linked' | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [live, setLive] = useState<{
    isConnected: boolean;
    paymentStatus: 'active' | 'restricted' | 'pending' | null;
    blockingReasons: { capability: string; code: string }[];
  } | null>(null);

  const isConnected = live ? live.isConnected : !!company.stripe_connect_onboarded;
  const paymentStatus = live ? live.paymentStatus : company.stripe_payment_status ?? null;
  const blockingReasons = live ? live.blockingReasons : company.stripe_requirements_summary ?? [];

  const state: StripeState = !isConnected
    ? 'not_connected'
    : paymentStatus === 'active'
    ? 'active'
    : paymentStatus === 'restricted'
    ? 'needs_attention'
    : 'finishing';

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  async function refreshLiveStatus() {
    setChecking(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/stripe/refresh-status`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLive({
          isConnected: !!data.stripe_connect_onboarded,
          paymentStatus: data.stripe_payment_status ?? null,
          blockingReasons: data.stripe_requirements_summary ?? [],
        });
      }
    } catch {
      // keep the last known status
    } finally {
      setChecking(false);
    }
  }

  // Just came back from Stripe's setup pages: Stripe can take a little while
  // to finish its checks, so look again a few times instead of showing a stale status.
  const [cameBackFromStripe, setCameBackFromStripe] = useState(false);
  const [autoChecks, setAutoChecks] = useState(0);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sc = url.searchParams.get('stripe_connect');
    if (sc === 'error' || sc === 'denied' || sc === 'already_linked') setRedirectStatus(sc);
    else if (sc !== null) setCameBackFromStripe(true);
    // Drop the flag from the address bar so a refresh doesn't show the message again.
    if (sc !== null) {
      url.searchParams.delete('stripe_connect');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    const unsettled = !!company.stripe_connect_onboarded && company.stripe_payment_status !== 'active';
    if (sc !== null || unsettled) refreshLiveStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cameBackFromStripe || state === 'active' || checking || autoChecks >= 6) return;
    const id = setTimeout(() => {
      setAutoChecks((n) => n + 1);
      refreshLiveStatus();
    }, 5000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameBackFromStripe, state, checking, autoChecks]);

  async function handleConnect() {
    setLoading(true);
    setConnectError(null);
    try {
      const res = await fetch(`/api/company/${company.slug}/stripe/connect-onboard`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setConnectError(data.error || 'Something went wrong. Try again.');
    } catch {
      setConnectError('Something went wrong. Try again.');
    }
    setLoading(false);
  }

  const ready = state === 'active';

  // Tapping the option: turn cards on if Stripe is ready, otherwise explain what's missing.
  const [triedToSelect, setTriedToSelect] = useState(false);
  const select = () => {
    if (ready) {
      if (!selected) onTurnOn();
      return;
    }
    setTriedToSelect(true);
  };

  const actionButtons = (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {state === 'not_connected' && (
        <button type="button" onClick={handleConnect} disabled={loading} className={primaryBtn}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Set up card payments
        </button>
      )}
      {state === 'finishing' && (
        <button type="button" onClick={handleConnect} disabled={loading} className={primaryBtn}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Continue Stripe setup
        </button>
      )}
      {state === 'needs_attention' && (
        <>
          <button type="button" onClick={handleConnect} disabled={loading} className={primaryBtn}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Give Stripe what it needs
          </button>
          <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
            Stripe dashboard <ExternalLink className="h-4 w-4" />
          </a>
        </>
      )}
      {(state === 'finishing' || state === 'needs_attention') && (
        <button type="button" onClick={refreshLiveStatus} disabled={checking} className={secondaryBtn}>
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> {checking ? 'Checking…' : 'Check status'}
        </button>
      )}
      {ready && !selected && (
        <button type="button" onClick={onTurnOn} className={primaryBtn}>
          Use card payments
        </button>
      )}
      {ready && (
        <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
          Stripe dashboard <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );

  return (
    <div
      className={`rounded-2xl border-2 bg-white transition ${
        selected ? 'border-emerald-600' : triedToSelect && !ready ? 'border-amber-400' : 'border-slate-200'
      }`}
    >
      {/* Tappable header: this is the "choice" */}
      <button
        type="button"
        onClick={select}
        aria-pressed={selected}
        className="flex w-full items-start gap-3 rounded-t-2xl p-5 pb-0 text-left sm:p-6 sm:pb-0"
      >
        <ChoiceMark on={selected} disabled={!ready} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Card payments <span className="text-sm font-normal text-slate-600">· Stripe</span>
              </h3>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                <Star className="h-3 w-3 fill-current" /> Recommended
              </span>
            </div>
            {selected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> On · customers pay by card
              </span>
            ) : ready ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Ready · turned off
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                <Lock className="h-3 w-3" /> Not available yet
              </span>
            )}
          </div>
          <p className="mt-1 text-[15px] text-slate-700">
            The easiest way to get paid. Customers tap the pay button on their invoice and pay in seconds.
          </p>
        </div>
      </button>

      <div className="p-5 pt-3 sm:p-6 sm:pt-3 sm:pl-[3.75rem]">
        {/* Tried to pick cards before Stripe is ready: say why, and what to do */}
        {triedToSelect && !ready && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {state === 'needs_attention' ? 'Card payments are paused' : "You can't use card payments yet"}
            </p>
            <p className="mt-1 text-sm text-amber-900">
              {state === 'not_connected' &&
                'Set up your Stripe account first. Stripe asks for your business details and the bank account to pay you into.'}
              {state === 'finishing' && 'Your Stripe setup isn’t finished. Continue where you left off, then card payments turn on.'}
              {state === 'needs_attention' && `Stripe needs more information before it can pay you. ${describeBlockingReasons(blockingReasons)}`}
            </p>
            <div className="mt-3">{actionButtons}</div>
          </div>
        )}

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, text: 'Payments processed securely by Stripe' },
            { icon: RefreshCw, text: 'Deposits and balances update automatically when paid' },
            { icon: CreditCard, text: 'Cards, Apple Pay and Google Pay' },
            { icon: Landmark, text: 'Payouts go straight to your bank account' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-[15px] text-slate-800">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Icon className="h-3 w-3" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-3">
          {redirectStatus === 'error' && <Notice tone="error">Stripe setup didn&apos;t finish. Try again.</Notice>}
          {redirectStatus === 'denied' && <Notice tone="warn">Stripe setup was cancelled. You can start again any time.</Notice>}
          {redirectStatus === 'already_linked' && (
            <Notice tone="error">That Stripe account is already linked to another business. Use a different Stripe account.</Notice>
          )}
          {connectError && <Notice tone="error">{connectError}</Notice>}
        </div>

        {/* Setup progress until Stripe is active */}
        {!ready && (
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            {cameBackFromStripe && state === 'finishing' && autoChecks < 6 && (
              <p className="mb-3 flex items-center gap-2 text-sm text-slate-700">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking with Stripe. This usually takes a moment.
              </p>
            )}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[15px] font-semibold text-slate-900">Stripe setup</p>
              <StatusPill state={state} />
            </div>
            <StripeSteps state={state} />
            {!triedToSelect && <div className="mt-4">{actionButtons}</div>}
          </div>
        )}

                <div className="mt-4">
          <CardMarks />
        </div>
        <div className="mt-3">
          <FeeBreakdown />
        </div>

        {ready && <div className="mt-4">{actionButtons}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Option 2: Pay link (Venmo, Zelle…)
───────────────────────────────────────────────────────────── */

function LinkOption({
  company,
  selected,
  cardSelected,
  onSavedChange,
  onUseInstead,
}: {
  company: any;
  selected: boolean;
  cardSelected: boolean;
  onSavedChange: (hasLink: boolean, type: string) => void;
  onUseInstead: () => void;
}) {
  const [savedType, setSavedType] = useState<string>(company.payment_link_type || 'venmo');
  const [savedUrl, setSavedUrl] = useState<string>(company.payment_link_url || '');
  const [linkType, setLinkType] = useState(savedType);
  const [linkUrl, setLinkUrl] = useState(savedUrl);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState('');

  const dirty = linkUrl.trim() !== savedUrl || linkType !== savedType;
  const linkInputRef = useRef<HTMLInputElement>(null);
  const method = LINK_METHODS.find((m) => m.value === linkType) || LINK_METHODS[0];
  const locked = cardSelected; // greyed while cards are the active choice

  async function save(nextUrl = linkUrl.trim()) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-payment-link',
          data: { payment_link_url: nextUrl || null, payment_link_type: linkType },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedUrl(nextUrl);
        setSavedType(linkType);
        setLinkUrl(nextUrl);
        onSavedChange(!!nextUrl, linkType);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
      } else {
        setError(data.error || 'Could not save. Try again.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`rounded-2xl border-2 bg-white p-5 transition sm:p-6 ${selected ? 'border-emerald-600' : 'border-slate-200'}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => (locked ? onUseInstead() : linkInputRef.current?.focus())}
          aria-pressed={selected}
          aria-label="Use a pay link"
          className="mt-0.5 shrink-0 rounded-full"
        >
          <ChoiceMark on={selected} />
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => (locked ? onUseInstead() : linkInputRef.current?.focus())}
            className="block w-full text-left"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={`text-lg font-semibold ${locked ? 'text-slate-500' : 'text-slate-900'}`}>
                Pay link <span className="text-sm font-normal text-slate-600">· Venmo, Zelle, Cash App, PayPal</span>
              </h3>
              {selected && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> On
                </span>
              )}
            </div>
            <p className={`mt-1 text-[15px] ${locked ? 'text-slate-500' : 'text-slate-700'}`}>
              No fees. Customers pay you in that app, and <span className="font-semibold">you mark the job paid yourself</span>.
            </p>
          </button>

          {locked ? (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Off while card payments are on.
                {savedUrl && (
                  <>
                    {' '}Saved: <span className="font-medium text-slate-800">{LINK_METHODS.find((m) => m.value === savedType)?.label}</span>
                  </>
                )}
              </p>
              <button type="button" onClick={onUseInstead} className={`${secondaryBtn} shrink-0`}>
                Use pay link instead
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {LINK_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setLinkType(m.value)}
                    aria-pressed={linkType === m.value}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      linkType === m.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  ref={linkInputRef}
                  type="text"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && dirty && save()}
                  placeholder={method.placeholder}
                  maxLength={300}
                  aria-label={`${method.label} link`}
                  className={inputCls}
                />
                <button type="button" onClick={() => save()} disabled={saving || !dirty} className={`${primaryBtn} shrink-0`}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Saving…' : justSaved ? 'Saved' : 'Save link'}
                </button>
              </div>
              {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
              {!savedUrl && (
                <p className="mt-2 text-sm text-slate-600">Until you add a link, invoices have no pay button and customers pay you directly.</p>
              )}
              {savedUrl && !dirty && (
                <button
                  type="button"
                  onClick={() => {
                    setLinkUrl('');
                    save('');
                  }}
                  className="mt-2 text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
                >
                  Remove pay link
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Invoice terms
───────────────────────────────────────────────────────────── */

function InvoiceTermsCard({ company }: { company: any }) {
  const [savedTerms, setSavedTerms] = useState<string>(company.invoice_terms || '');
  const [terms, setTerms] = useState(savedTerms);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState('');
  const dirty = terms !== savedTerms;

  const clauses = [
    { label: 'Due in 15 days', text: 'Payment is due within 15 days of the invoice date.' },
    { label: '1.5% late fee', text: 'A 1.5% monthly late fee applies to past-due balances.' },
    { label: '1-year warranty', text: 'All workmanship is guaranteed for 12 months.' },
  ];

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-invoice-terms', data: { invoice_terms: terms } }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedTerms(terms);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
      } else {
        setError(data.error || 'Could not save. Try again.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={card}>
      <h3 className="text-lg font-semibold text-slate-900">Invoice terms</h3>
      <p className="text-sm text-slate-600">The fine print at the bottom of every invoice.</p>

      <textarea
        value={terms}
        onChange={(e) => {
          setTerms(e.target.value);
          setError('');
        }}
        rows={4}
        maxLength={2000}
        placeholder="e.g. Payment is due within 15 days. A 1.5% monthly late fee applies to past-due balances."
        className={`${inputCls} mt-4 resize-y`}
      />

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-sm text-slate-600">Add:</span>
        {clauses.map((cl) => {
          const already = terms.includes(cl.text);
          return (
            <button
              key={cl.label}
              type="button"
              disabled={already}
              onClick={() => setTerms((prev) => (prev.trim() ? `${prev.trim()} ${cl.text}` : cl.text))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              {already ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} {cl.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        {error && <p className="mr-auto text-sm font-medium text-rose-600">{error}</p>}
        {dirty && !saving && (
          <button type="button" onClick={() => setTerms(savedTerms)} className="text-sm font-medium text-slate-600 hover:underline">
            Undo
          </button>
        )}
        <button type="button" onClick={save} disabled={saving || !dirty} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving…' : justSaved ? 'Saved' : 'Save terms'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   What customers see — real invoice previews
───────────────────────────────────────────────────────────── */

function CustomerViewCard({ company, payWith }: { company: any; payWith: string | null }) {
  const [preview, setPreview] = useState<'invoice' | 'deposit' | null>(null);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreview(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const previewUrl = preview
    ? `/api/company/${company.slug}/preview-invoice${preview === 'deposit' ? '?variant=deposit' : ''}`
    : '';

  return (
    <div className={card}>
      <h3 className="text-lg font-semibold text-slate-900">What customers see</h3>
      <p className="text-[15px] text-slate-700">Open a sample invoice with your logo, terms and pay button.</p>

      <div className="mt-4 rounded-xl border border-slate-200 px-4 py-3">
        <p className="text-sm text-slate-600">Pay button on invoices</p>
        {payWith ? (
          <p className="mt-0.5 text-base font-semibold text-slate-900">“{PAY_BUTTON_LABEL[payWith] || 'Pay invoice'}”</p>
        ) : (
          <p className="mt-0.5 text-base font-semibold text-slate-900">
            None <span className="text-sm font-normal text-slate-600">· customers pay you directly (cash, check)</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => setPreview('invoice')} className={secondaryBtn}>
          <FileText className="h-4 w-4" /> Sample invoice
        </button>
        <button type="button" onClick={() => setPreview('deposit')} className={secondaryBtn}>
          <FileText className="h-4 w-4" /> Sample deposit invoice
        </button>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setPreview(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Invoice preview"
            className="flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[88vh] sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {(['invoice', 'deposit'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPreview(v)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      preview === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {v === 'invoice' ? 'Invoice' : 'Deposit invoice'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe key={previewUrl} src={previewUrl} title="Sample invoice" className="h-full w-full flex-1 border-0 bg-slate-100" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */

export default function PaymentsTab({ company }: { company: any; currentUser?: any }) {
  const initialState: StripeState = !company.stripe_connect_onboarded
    ? 'not_connected'
    : company.stripe_payment_status === 'active'
    ? 'active'
    : company.stripe_payment_status === 'restricted'
    ? 'needs_attention'
    : 'finishing';
  const [stripeState, setStripeState] = useState<StripeState>(initialState);
  // Cards are on by default once Stripe is active; the owner can turn them off.
  const [cardEnabled, setCardEnabled] = useState<boolean>(company.card_payments_enabled !== false);
  const [hasLink, setHasLink] = useState<boolean>(!!company.payment_link_url);
  const [linkType, setLinkType] = useState<string>(company.payment_link_type || 'other');

  const [confirm, setConfirm] = useState<'turn_off_cards' | 'turn_on_cards' | null>(null);
  const [savingMethod, setSavingMethod] = useState(false);
  const [methodError, setMethodError] = useState('');

  const cardSelected = stripeState === 'active' && cardEnabled;
  const linkSelected = !cardSelected && hasLink;
  const payWith = cardSelected ? 'stripe' : linkSelected ? linkType : null;
  const linkLabel = LINK_METHODS.find((m) => m.value === linkType)?.label || 'your pay link';

  async function saveCardEnabled(next: boolean) {
    setSavingMethod(true);
    setMethodError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-payment-method', data: { card_payments_enabled: next } }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setCardEnabled(next);
        setConfirm(null);
      } else {
        setMethodError(data.error || 'Could not save. Try again.');
      }
    } catch {
      setMethodError('Network error. Try again.');
    } finally {
      setSavingMethod(false);
    }
  }

  const closeConfirm = () => {
    setConfirm(null);
    setMethodError('');
  };

  return (
    <div className="w-full text-slate-900 antialiased">
      <div className="w-full space-y-8 pb-16">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Payments</h1>
          <p className="mt-1 text-base text-slate-700">How customers pay you, and what your invoices say.</p>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">How customers pay</h2>
            <p className="text-[15px] text-slate-700">Pick one. It&apos;s the pay button on your invoices and deposit requests.</p>
          </div>

          {/* What invoices use right now */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Invoices use right now:</span>
            {cardSelected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Card payments
              </span>
            ) : linkSelected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-sm font-semibold text-slate-800">
                {linkLabel} link
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5" /> No pay button
              </span>
            )}
            {stripeState !== 'active' && (
              <span className="text-sm text-slate-600">
                · Card payments {stripeState === 'needs_attention' ? 'are paused' : 'aren’t available until Stripe setup is done'}
              </span>
            )}
          </div>

          <CardOption
            company={company}
            selected={cardSelected}
            onStateChange={setStripeState}
            onTurnOn={() => setConfirm('turn_on_cards')}
          />
          <LinkOption
            company={company}
            selected={linkSelected}
            cardSelected={cardSelected}
            onSavedChange={(has, type) => {
              setHasLink(has);
              setLinkType(type);
            }}
            onUseInstead={() => setConfirm('turn_off_cards')}
          />

          {!cardSelected && !linkSelected && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-700">
              <span className="font-semibold text-slate-900">Right now: no online payment.</span> Invoices go out without a pay
              button and customers pay you directly. Set up card payments or add a pay link above.
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Invoices</h2>
          <InvoiceTermsCard company={company} />
          <CustomerViewCard company={company} payWith={payWith} />
        </section>
      </div>

      {confirm === 'turn_off_cards' && (
        <ConfirmDialog
          title="Turn off card payments?"
          confirmLabel="Turn off cards"
          danger
          busy={savingMethod}
          error={methodError}
          onCancel={closeConfirm}
          onConfirm={() => saveCardEnabled(false)}
        >
          {hasLink ? (
            <p>
              New invoices and deposit requests will show <span className="font-semibold">{linkLabel}</span> instead of a card button.
            </p>
          ) : (
            <p>
              You haven&apos;t added a pay link yet, so new invoices will have <span className="font-semibold">no pay button</span> until
              you add one.
            </p>
          )}
          <p>
            Payments made outside Stripe aren&apos;t tracked automatically.{' '}
            <span className="font-semibold">You&apos;ll need to mark each job paid yourself.</span>
          </p>
          <p className="text-sm text-slate-600">Your Stripe account stays connected. You can turn cards back on any time.</p>
        </ConfirmDialog>
      )}

      {confirm === 'turn_on_cards' && (
        <ConfirmDialog
          title="Use card payments?"
          confirmLabel="Turn on cards"
          busy={savingMethod}
          error={methodError}
          onCancel={closeConfirm}
          onConfirm={() => saveCardEnabled(true)}
        >
          <p>New invoices and deposit requests will have a card button. Jobs are marked paid automatically when customers pay.</p>
                   <p>
            Stripe charges 2.9% + 30¢ per payment
            {platformFeeEnabled() ? <>, and Lead2Project&apos;s fee is {PLATFORM_FEE_LABEL}</> : null}. Your customer pays the invoice
            amount, nothing extra.
          </p>
          {hasLink && <p className="text-sm text-slate-600">Your {linkLabel} link stays saved but won&apos;t show on invoices.</p>}
        </ConfirmDialog>
      )}
    </div>
  );
}