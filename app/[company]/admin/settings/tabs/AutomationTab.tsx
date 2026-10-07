'use client';

// Settings → Money → Auto invoices.
// Two company-wide rules for when invoices go to the customer by themselves.
// Saved through /api/company/[slug]/settings (action: update-invoice-automation).
// The sending itself is lib/sendCollectionInvoice.ts, the same code as the Send button.

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

type OnAccept = 'none' | 'deposit';

export default function AutomationTab({ company }: { company: any }) {
  const [loading, setLoading] = useState(true);
  const [onAccept, setOnAccept] = useState<OnAccept>('none');
  const [onComplete, setOnComplete] = useState(false);
  const [saving, setSaving] = useState<'accept' | 'complete' | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stripeActive = company?.stripe_payment_status === 'active';

  // Read the current values (the page's company object may not include the new columns).
  useEffect(() => {
    let alive = true;
    fetch(`/api/company/${company.slug}/settings`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d?.success) return;
        const v = d.company?.on_accept_collect;
        setOnAccept(v === 'deposit' ? 'deposit' : 'none');
        setOnComplete(!!d.company?.auto_send_balance_on_complete);
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
    setOnAccept(next);
    const ok = await save({ on_accept_collect: next, auto_send_balance_on_complete: onComplete }, 'accept');
    if (!ok) setOnAccept(prev);
  };

  const toggleComplete = async () => {
    if (saving) return;
    const next = !onComplete;
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

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Auto invoices</h2>
          <p className="mt-1 text-sm text-stone-500">
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

      {!stripeActive && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Stripe isn&rsquo;t connected yet, so automatic invoices go out without a card payment button. Connect Stripe under
          Payments to let customers pay right away.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Deposit request when a quote is accepted */}
      <ToggleRow
        title="Send the deposit request when a customer accepts a quote"
        desc="Only for quotes that have a deposit. The customer gets the deposit invoice by email and a Pay deposit button right after they accept. Quotes without a deposit send nothing."
        on={onAccept === 'deposit'}
        busy={saving === 'accept'}
        disabled={!!saving}
        onToggle={toggleAccept}
      />

      {/* Final invoice when a job is completed */}
      <ToggleRow
        title="Send the final invoice when I mark a job completed"
        desc="Bills whatever is still owed. Nothing is sent if the job is fully paid or a final invoice already went out. Leave this off if you like to check extra materials or changes before billing."
        on={onComplete}
        busy={saving === 'complete'}
        disabled={!!saving}
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
  onToggle,
}: {
  title: string;
  desc: string;
  on: boolean;
  busy: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">{desc}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={title}
          onClick={onToggle}
          disabled={disabled}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-wait ${
            on ? 'bg-stone-900' : 'bg-stone-300'
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
              on ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <p className={`mt-3 text-xs font-semibold ${on ? 'text-stone-900' : 'text-stone-400'}`}>{on ? 'On' : 'Off'}</p>
    </section>
  );
}