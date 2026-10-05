'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import CheckoutLoadingModal from './CheckoutLoadingModal';

type SubscribeButtonProps = {
  companyId: number;
  companyEmail: string;
  isSubscribed?: boolean;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  variant?: 'primary' | 'banner' | 'cta';
  plan?: 'basic' | 'pro';
  currentPlanTier?: string;
};

// One paid plan: 'basic' internally, shown as "Pro".
const PLAN_META: Record<string, { label: string; price: string }> = {
  basic: { label: 'Pro', price: '$49.99/month' },
  pro: { label: 'Crew', price: '$49.99/month' },
};

export default function SubscribeButton({
  companyId,
  companyEmail,
  isSubscribed = false,
  subscriptionStatus,
  trialEndsAt,
  variant = 'primary',
  plan = 'basic',
  currentPlanTier,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const meta = PLAN_META[plan] ?? PLAN_META.basic;
  // trial_ends_at is set on the first checkout, so non-null means the trial was used.
  const alreadyTrialed = trialEndsAt != null && subscriptionStatus !== 'trialing';

  const handleSubscribe = async () => {
    setLoading(true);
    setShowModal(true);

    try {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, companyEmail, plan: 'basic' }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        await new Promise((r) => setTimeout(r, 400));
        window.location.href = data.url;
      } else {
        setShowModal(false);
        setLoading(false);
        toast.error(data.error || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setShowModal(false);
      setLoading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Past-due customers already have a subscription. Send them to Stripe's
  // billing portal to fix their card, not a new checkout (which could
  // create a second subscription).
  const handleFixPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error();
    } catch {
      setLoading(false);
      toast.error('Unable to open billing. Please try again.');
    }
  };

  // ── Shared styles ────────────────────────────────────────────────────────
  const badgeBase =
    'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border';

  const styles: Record<string, string> = {
    primary:
      'bg-[#1C1F23] hover:bg-black text-white font-bold px-6 py-3.5 rounded-md transition-colors shadow-sm',
    banner:
      'w-full bg-[#00828A] hover:bg-[#006e75] text-white font-bold px-5 py-3.5 rounded-md shadow-sm transition-colors text-center',
    cta: 'bg-[#00828A] hover:bg-[#006e75] text-white font-bold px-8 py-4 rounded-md transition-colors shadow-sm',
  };

  const spinnerSvg = (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  const ctaLabel = alreadyTrialed ? `Subscribe to ${meta.label}, ${meta.price}` : 'Start 14-day free trial';

  // ── Active ────────────────────────────────────────────────────────────────
  if (isSubscribed || subscriptionStatus === 'active') {
    return (
      <div className={`${badgeBase} bg-emerald-50 text-emerald-700 border-emerald-200`}>
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        {meta.label} is active, {meta.price}
      </div>
    );
  }

  // ── Trialing ──────────────────────────────────────────────────────────────
  if (subscriptionStatus === 'trialing' && trialEndsAt) {
    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    return (
      <div className={`${badgeBase} bg-[#00828A]/10 text-[#006e75] border-[#00828A]/25`}>
        <div className="w-2 h-2 rounded-full bg-[#00828A]" />
        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your free trial
      </div>
    );
  }

  // ── Past due ──────────────────────────────────────────────────────────────
  if (subscriptionStatus === 'past_due') {
    return (
      <div className="flex flex-col gap-3">
        <div className={`${badgeBase} bg-rose-50 text-rose-700 border-rose-200`}>
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          Your last payment failed
        </div>
        <button
          onClick={handleFixPayment}
          disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-md transition-colors text-sm shadow-sm disabled:opacity-50"
        >
          {loading ? 'Opening…' : 'Update payment method'}
        </button>
      </div>
    );
  }

  // ── Free, canceled or new → checkout ──────────────────────────────────────
  return (
    <>
      <CheckoutLoadingModal isOpen={showModal} planLabel={meta.label} planPrice={meta.price} />
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`${styles[variant]} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
      >
        {loading ? (
          <>
            {spinnerSvg}
            <span>Opening checkout…</span>
          </>
        ) : (
          <span className="text-sm sm:text-base">{ctaLabel}</span>
        )}
      </button>
    </>
  );
}