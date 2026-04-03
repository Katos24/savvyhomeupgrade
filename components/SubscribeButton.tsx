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
  plan?: 'starter' | 'basic' | 'pro';
};

const PLAN_META: Record<string, { label: string; price: string }> = {
  starter: { label: 'Starter', price: '$29/month'    },
  basic:   { label: 'Basic',   price: '$49.99/month' },
  pro:     { label: 'Pro',     price: '$79.99/month' },
};

export default function SubscribeButton({
  companyId,
  companyEmail,
  isSubscribed = false,
  subscriptionStatus,
  trialEndsAt,
  variant = 'primary',
  plan = 'starter',
}: SubscribeButtonProps) {
  const [loading, setLoading]       = useState(false);
  const [showModal, setShowModal]   = useState(false);

  const meta = PLAN_META[plan] ?? PLAN_META.starter;

  const handleSubscribe = async () => {
    setLoading(true);
    setShowModal(true); // ← immediate feedback on click

    try {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, companyEmail, plan }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Small pause so user sees the final step land before redirect
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

  // ── Status badge base ─────────────────────────────────────────────────────
  const badgeBase =
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border';

  // ── Active ────────────────────────────────────────────────────────────────
  if (isSubscribed || subscriptionStatus === 'active') {
    return (
      <div className={`${badgeBase} bg-emerald-50 text-emerald-700 border-emerald-100`}>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Active — {meta.price}
      </div>
    );
  }

  // ── Trialing ──────────────────────────────────────────────────────────────
  if (subscriptionStatus === 'trialing' && trialEndsAt) {
    const daysLeft = Math.ceil(
      (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return (
      <div className={`${badgeBase} bg-indigo-50 text-indigo-700 border-indigo-100`}>
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        {daysLeft} Day{daysLeft !== 1 ? 's' : ''} Left in Trial
      </div>
    );
  }

  // ── Past due ──────────────────────────────────────────────────────────────
  if (subscriptionStatus === 'past_due') {
    return (
      <>
        <CheckoutLoadingModal isOpen={showModal} planLabel={meta.label} planPrice={meta.price} />
        <div className="flex flex-col gap-3">
          <div className={`${badgeBase} bg-rose-50 text-rose-700 border-rose-100`}>
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            Payment Failed
          </div>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl transition-all text-sm uppercase tracking-widest shadow-lg shadow-rose-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Update Payment Method'}
          </button>
        </div>
      </>
    );
  }

  // ── Main CTA button styles ────────────────────────────────────────────────
 const styles = {
  primary: 'bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]',
banner: 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-3 sm:px-8 sm:py-5 rounded-xl sm:rounded-2xl shadow-xl transition-all active:scale-[0.98] text-center',
  cta:     'bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]',
};

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
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Opening Checkout...</span>
          </>
        ) : (
          <span className="uppercase tracking-widest text-sm">
            {subscriptionStatus === 'canceled' ? 'Resubscribe' : 'Start 14-Day Free Trial'}
          </span>
        )}
      </button>
    </>
  );
}