'use client';

// Settings → Money → Auto invoices.
// Two company-wide rules for when invoices go to the customer by themselves.
// Saved through /api/company/[slug]/settings (action: update-invoice-automation).
// The sending itself is lib/sendCollectionInvoice.ts, the same code as the Send button.
//
// Locked until the company has a way to get paid online: card payments
// (Stripe active and turned on) or a saved pay link (Venmo, Zelle, ...).
// A rule that's already on can always be turned off.

import { useEffect, useState } from 'react';
import { Check, Loader2, Lock } from 'lucide-react';

type OnAccept = 'none' | 'deposit';

export default function AutomationTab({ company }: { company: any }) {
  const [loading, setLoading] = useState(true);
  const [onAccept, setOnAccept] = useState<OnAccept>('none');
  const [onComplete, setOnComplete] = useState(false);
  const [saving, setSaving] = useState<'accept' | 'complete' | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment setup. Start from the page's company object, refresh from the API.
  const [pay, setPay] = useState({
    stripeStatus: company?.stripe_payment_status ?? null,
    cardsEnabled: company?.card_payments_enabled !== false,
    payLink: !!company?.payment_link_url,
  });

  const cardsOn = pay.stripeStatus === 'active' && pay.cardsEnabled;
  const canAutomate = cardsOn || pay.payLink;
  const paymentsHref = `/${company.slug}/home?section=payments`;

  // Read the current values (the page's company object may not include the new columns).
  useEffect(() => {
    let alive = true;
    fetch(`/api/company/${company.slug}/settings`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.success) return;
        const c = d.company || {};
        setOnAccept(c.on_accept_collect === 'deposit' ? 'deposit' : 'none');
        setOnComplete(!!c.auto_send_balance_on_complete);
        setPay((prev) => ({
          stripeStatus: c.stripe_payment_status !== undefined ? c.stripe_payment_status : prev.stripeStatus,
          cardsEnabled: c.card_payments_enabled !== undefined ? c.card_payments_enabled !== false : prev.cardsEnabled,
          payLink: c.payment_link_url !== undefined ? !!c.payment_link_url : prev.payLink,
        }));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [company.slug]);

  const save = async (next: { on_accept_collect: OnAccept; auto_send_balance_on_complete: boolean }, which: 'accept' | 'complete') => {
    setSaving(which);
    setError(null);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-invoice-automation', data: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not save. Try again.');
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.');
      return false;
    } finally {
      setSaving(null);
    }
  };

  const toggleAccept = async () => {
    if (saving) return;
    const prev = onAccept;
    const next: OnAccept = onAccept === 'deposit' ? 'none' : 'deposit';
    if (next === 'deposit' && !canAutomate) return; // can't turn on without a way to pay
    setOnAccept(next);
    const ok = await save({ on_accept_collect: next, auto_send_balance_on_complete: onComplete }, 'accept');
    if (!ok) setOnAccept(prev);
  };

  const toggleComplete = async () => {
    if (saving) return;
    const next = !onComplete;
    if (next && !canAutomate) return; // can't turn on without a way to pay
    setOnComplete(next);
    const ok = await save({ on_accept_collect: onAccept, auto_send_balance_on_complete: next }, 'complete');
    if (!ok) setOnComplete(!next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const acceptOn = onAccept === 'deposit';

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Auto invoices</h2>
          <p className="mt-1 text-sm text-stone-600">
            Send invoices automatically at the right moment. They go out exactly like the Send button on a job.
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity ${
            saved ? 'opacity-100 bg-emerald-50 text-emerald-700' : 'opacity-0'
          }`}
          aria-live="polite"
        >
          <Check className="h-3.5 w-3.5" /> Saved
        </span>
      </div>

      {!canAutomate ? (
        <div className="flex flex-col gap-3 rounded-xl border border-stone-300 bg-stone-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-stone-600" />
            <div>
              <p className="text-sm font-semibold text-stone-900">Set up a way to get paid first</p>
              <p className="mt-0.5 text-sm text-stone-600">
                Auto invoices need card payments (Stripe) or a pay link (Venmo, Zelle, Cash App, PayPal), so customers can
                pay right from the email.
              </p>
            </div>
          </div>
          <a
            href={paymentsHref}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Set up payments
          </a>
        </div>
      ) : !cardsOn ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          Invoices will use your pay link. Turn on card payments under{' '}
          <a href={paymentsHref} className="font-semibold text-stone-900 underline underline-offset-2">
            Payments
          </a>{' '}
          so customers can pay by card and jobs update automatically.
        </div>
      ) : null}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Deposit request when a quote is accepted */}
      <ToggleRow
        title="Send the deposit request when a customer accepts a quote"
        desc="Only for quotes that have a deposit. The customer gets the deposit invoice by email and a Pay deposit button right after they accept. Quotes without a deposit send nothing."
        on={acceptOn}
        busy={saving === 'accept'}
        disabled={!!saving}
        locked={!canAutomate && !acceptOn}
        onToggle={toggleAccept}
      />

      {/* Final invoice when a job is completed */}
      <ToggleRow
        title="Send the final invoice when I mark a job completed"
        desc="Bills whatever is still owed. Nothing is sent if the job is fully paid or a final invoice already went out. Leave this off if you like to check extra materials or changes before billing."
        on={onComplete}
        busy={saving === 'complete'}
        disabled={!!saving}
        locked={!canAutomate && !onComplete}
        onToggle={toggleComplete}
      />
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  on,
  busy,
  disabled,
  locked,
  onToggle,
}: {
  title: string;
  desc: string;
  on: boolean;
  busy: boolean;
  disabled: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white p-5 shadow-sm ${locked ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-stone-600">{desc}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={title}
          aria-disabled={locked || disabled}
          onClick={onToggle}
          disabled={disabled || locked}
          title={locked ? 'Set up payments first' : undefined}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${
            on ? 'bg-stone-900' : 'bg-stone-300'
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>
      <p className={`mt-3 flex items-center gap-1 text-xs font-semibold ${on ? 'text-stone-900' : 'text-stone-500'}`}>
        {locked ? (
          <>
            <Lock className="h-3 w-3" /> Locked until payments are set up
          </>
        ) : on ? (
          'On'
        ) : (
          'Off'
        )}
      </p>
    </section>
  );
}