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
};

export default function SubscribeButton({ 
  companyId, 
  companyEmail, 
  isSubscribed = false,
  subscriptionStatus,
  trialEndsAt,
  variant = 'primary'
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, companyEmail }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
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

  // Show different states based on subscription status
  if (isSubscribed || subscriptionStatus === 'active') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
        ✓ Active - $39.99/month
      </div>
    );
  }

  if (subscriptionStatus === 'trialing' && trialEndsAt) {
    const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">
        🎉 Free Trial - {daysLeft} days left
      </div>
    );
  }

  if (subscriptionStatus === 'past_due') {
    return (
      <div className="inline-flex flex-col gap-2">
        <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-semibold">
          ⚠️ Payment Failed
        </div>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Update Payment Method'}
        </button>
      </div>
    );
  }

  if (subscriptionStatus === 'canceled') {
    return (
      <div className="inline-flex flex-col gap-2">
        <div className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold">
          Subscription Canceled
        </div>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Resubscribe'}
        </button>
      </div>
    );
  }

  // Default: Not subscribed - show subscribe button
  const styles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition',
    banner: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg transition text-lg',
    cta: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition shadow-md'
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`${styles[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Loading...' : 'Start 14-Day Free Trial'}
    </button>
  );
}