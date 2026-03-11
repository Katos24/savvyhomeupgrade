'use client';
import { useState } from 'react';
import { toast } from 'sonner';

type SubscribeButtonProps = {
  companyId: number;
  companyEmail: string;
  isSubscribed?: boolean;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  variant?: 'primary' | 'banner' | 'cta';
  plan?: 'basic' | 'pro';
};

const PLAN_PRICES: Record<string, string> = {
  basic: '$49/month',
  pro: '$99/month',
};

export default function SubscribeButton({
  companyId,
  companyEmail,
  isSubscribed = false,
  subscriptionStatus,
  trialEndsAt,
  variant = 'primary',
  plan = 'basic',
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, companyEmail, plan }),
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start checkout');
        setLoading(false);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('Something went wrong');
      setLoading(false);
    }
  };

  // --- Status Badge Styles ---
  const badgeBase = "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border";

  if (isSubscribed || subscriptionStatus === 'active') {
    return (
      <div className={`${badgeBase} bg-emerald-50 text-emerald-700 border-emerald-100`}>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Active — {PLAN_PRICES[plan]}
      </div>
    );
  }

  if (subscriptionStatus === 'trialing' && trialEndsAt) {
    const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return (
      <div className={`${badgeBase} bg-indigo-50 text-indigo-700 border-indigo-100`}>
        <span className="text-base">🎉</span> {daysLeft} Days Left in Trial
      </div>
    );
  }

  if (subscriptionStatus === 'past_due') {
    return (
      <div className="flex flex-col gap-3">
        <div className={`${badgeBase} bg-rose-50 text-rose-700 border-rose-100`}>
          ⚠️ Payment Failed
        </div>
        <button 
          onClick={handleSubscribe} 
          disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 rounded-xl transition-all text-sm uppercase tracking-widest shadow-lg shadow-rose-100 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Update Payment Method'}
        </button>
      </div>
    );
  }

  // --- Main Button Styles ---
  const styles = {
    primary: 'bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]',
    banner: 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] text-center',
    cta: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-100 active:scale-[0.98]',
  };

  return (
    <button 
      onClick={handleSubscribe} 
      disabled={loading}
      className={`${styles[variant]} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <span className="uppercase tracking-widest text-sm">
          {subscriptionStatus === 'canceled' ? 'Resubscribe' : 'Start 14-Day Free Trial'}
        </span>
      )}
    </button>
  );
}