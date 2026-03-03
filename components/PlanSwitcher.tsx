'use client';

import { useState } from 'react';

const PLANS = {
  basic: {
    label: 'Basic',
    price: '$49',
    description: 'Lead tracking, contact forms, CSV export',
  },
  pro: {
    label: 'Pro',
    price: '$99',
    description: 'Everything in Basic + projects, quotes, AI features',
  },
};

interface PlanSwitcherProps {
  companyId: number;
  currentPlan: 'basic' | 'pro';
  subscriptionStatus: string;
  onPlanChanged?: (newPlan: string) => void;
}

export default function PlanSwitcher({
  companyId,
  currentPlan,
  subscriptionStatus,
  onPlanChanged,
}: PlanSwitcherProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activePlan, setActivePlan] = useState(currentPlan);

  const isActive = ['active', 'trialing'].includes(subscriptionStatus);

  async function handleChangePlan(newPlan: 'basic' | 'pro') {
    if (newPlan === activePlan || loading) return;

    const isUpgrade = newPlan === 'pro';
    const confirmed = window.confirm(
      isUpgrade
        ? 'Upgrade to Pro ($99/mo)? The price difference will be prorated on your next invoice.'
        : 'Downgrade to Basic ($49/mo)? You\'ll receive a prorated credit on your next invoice.'
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/stripe/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, newPlan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change plan');
      }

      setActivePlan(newPlan);
      setSuccess(
        isUpgrade
          ? 'Upgraded to Pro! Your new features are available now.'
          : 'Downgraded to Basic. Changes are effective immediately.'
      );
      onPlanChanged?.(newPlan);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isActive) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-600">
          No active subscription.{' '}
          <a href="/subscribe" className="text-blue-600 hover:underline font-medium">
            Subscribe to get started
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Your Plan</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 mb-4">
          {success}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {(['basic', 'pro'] as const).map((planKey) => {
          const plan = PLANS[planKey];
          const isCurrent = planKey === activePlan;

          return (
            <div
              key={planKey}
              className={`relative rounded-xl border-2 p-5 transition ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isCurrent && (
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  CURRENT
                </span>
              )}

              <h4 className="text-xl font-bold text-gray-900">{plan.label}</h4>
              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

              {!isCurrent && (
                <button
                  onClick={() => handleChangePlan(planKey)}
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition ${
                    planKey === 'pro'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading
                    ? 'Processing...'
                    : planKey === 'pro'
                    ? 'Upgrade to Pro'
                    : 'Downgrade to Basic'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Plan changes are prorated. Upgrades are charged immediately; downgrades are credited to your next invoice.
      </p>
    </div>
  );
}