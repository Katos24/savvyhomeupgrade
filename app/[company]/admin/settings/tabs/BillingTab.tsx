'use client';

import { useState } from 'react';
import {
  CreditCard, Calendar, CheckCircle, AlertCircle, Sparkles,
  Zap, ArrowRight, Lock, TrendingUp, Clock
} from 'lucide-react';
import { PLAN_CONFIG } from '@/lib/permissions';

export default function BillingTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activePlan, setActivePlan] = useState<'starter' | 'basic' | 'pro'>(
  (company.plan_tier || 'starter') as 'starter' | 'basic' | 'pro'
);
  const [pendingDowngrade, setPendingDowngrade] = useState<{ periodEnd: number } | null>(
    company.pending_downgrade_at
      ? { periodEnd: Math.floor(new Date(company.pending_downgrade_at).getTime() / 1000) }
      : null
  );

  const planConfig = PLAN_CONFIG[activePlan] || PLAN_CONFIG.basic;
  const isActive = ['active', 'trialing'].includes(company.subscription_status);

  async function handleManageSubscription() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Unable to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      setError('Error opening billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  }

async function handleChangePlan(newPlan: 'starter' | 'basic' | 'pro') {
    if (changingPlan) return;
    // Allow clicking Basic card to cancel a pending downgrade (upgrade back to pro)
    if (newPlan === activePlan && !pendingDowngrade) return;

    const isUpgrade = newPlan === 'pro';
    const confirmed = window.confirm(
      isUpgrade
        ? 'Upgrade to Pro ($99/mo)? The price difference will be prorated on your next invoice.'
        : `Downgrade to ${PLAN_CONFIG[newPlan].label} ($${PLAN_CONFIG[newPlan].price}/mo)? You'll keep your current access until the end of your billing period.`
    );

    if (!confirmed) return;

    setChangingPlan(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/stripe/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, newPlan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change plan');
      }

      if (isUpgrade) {
        setActivePlan(newPlan);
        setPendingDowngrade(null);
        setSuccess('Upgraded to Pro! Your new features are available now.');
      } else {
        setPendingDowngrade({ periodEnd: data.periodEnd });
        setSuccess("Downgrade scheduled. You'll keep Pro access until the end of your current billing period.");
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setChangingPlan(false);
    }
  }

  const getStatusInfo = () => {
    switch (company.subscription_status) {
      case 'active':
        return { icon: CheckCircle, text: 'Active', color: 'text-green-700', iconColor: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'trialing':
        return { icon: Sparkles, text: 'Free Trial', color: 'text-blue-700', iconColor: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'past_due':
        return { icon: AlertCircle, text: 'Payment Due', color: 'text-amber-700', iconColor: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'canceled':
        return { icon: AlertCircle, text: 'Canceled', color: 'text-red-700', iconColor: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { icon: AlertCircle, text: 'Inactive', color: 'text-gray-700', iconColor: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (currentUser.role !== 'owner') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Owner Access Only</h3>
          <p className="text-slate-600">Only the company owner can access billing and subscription settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Billing & Subscription</h2>
        <p className="text-sm sm:text-base text-slate-600">Manage your subscription, payment methods, and billing history.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 text-lg leading-none">&times;</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Pending downgrade banner */}
      {pendingDowngrade && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
          <Clock className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <span className="flex-1">
            Your plan will switch to Basic on{' '}
            <strong>
              {new Date(pendingDowngrade.periodEnd * 1000).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </strong>
            . You have full Pro access until then.
          </span>
        </div>
      )}

      {/* Main Billing Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Status Banner */}
        <div className={`${statusInfo.bg} ${statusInfo.border} border-b px-4 sm:px-6 py-4`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                <StatusIcon className={`w-5 h-5 ${statusInfo.iconColor}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Subscription Status</p>
                <p className={`text-lg sm:text-xl font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
              </div>
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition shadow-sm disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'Loading...' : 'Manage Billing'}
            </button>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Plan Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {activePlan === 'pro'
  ? <Sparkles className="w-5 h-5 text-indigo-600" />
  : activePlan === 'basic'
  ? <Zap className="w-5 h-5 text-blue-600" />
  : <Zap className="w-5 h-5 text-slate-500" />}
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Current Plan</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{planConfig.label}</p>
              <p className="text-slate-600 font-semibold">
                ${planConfig.price}<span className="text-sm font-normal">/month</span>
              </p>
              {pendingDowngrade && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Switching to Basic on {new Date(pendingDowngrade.periodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>

            {/* Billing Period */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Billing Period</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900">Monthly</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">Auto-renews each month</p>
            </div>

            {/* Trial End Date */}
            {company.trial_ends_at && company.subscription_status === 'trialing' && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Trial Ends</p>
                </div>
                <p className="text-lg sm:text-xl font-bold text-slate-900">
                  {new Date(company.trial_ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>
            )}
          </div>

          {/* Plan Switcher */}
          {isActive && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Change Plan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {(['starter', 'basic', 'pro'] as const).map((planKey) => {
  const config = PLAN_CONFIG[planKey];
  const ORDER = ['starter', 'basic', 'pro'] as const;
  const isCurrent = planKey === activePlan && !pendingDowngrade;
  const isPendingDowngradePlan = ORDER.indexOf(planKey) < ORDER.indexOf(activePlan) && !!pendingDowngrade;
  const isUpgrade = ORDER.indexOf(planKey) > ORDER.indexOf(activePlan);

                  return (
                    <div
                      key={planKey}
                      className={`relative rounded-xl border-2 p-5 transition ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/50'
                          : isPendingDowngradePlan
                          ? 'border-amber-300 bg-amber-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          CURRENT
                        </span>
                      )}
                      {isPendingDowngradePlan && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          PENDING
                        </span>
                      )}
                      {planKey === 'pro' && !isCurrent && !pendingDowngrade && (
                        <span className="absolute top-3 right-3 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}

                      <div className="flex items-center gap-2 mb-1">
                        {planKey === 'pro'
                          ? <Sparkles className="w-5 h-5 text-indigo-600" />
                          : <Zap className="w-5 h-5 text-blue-600" />}
                        <h4 className="text-lg font-bold text-slate-900">{config.label}</h4>
                      </div>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-2xl font-extrabold text-slate-900">${config.price}</span>
                        <span className="text-slate-500 text-sm">/month</span>
                      </div>

                      <ul className="space-y-1.5 mb-4">
                        {config.features.slice(0, 5).map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                        {config.features.length > 5 && (
                          <li className="text-xs text-slate-400 pl-6">
                            +{config.features.length - 5} more features
                          </li>
                        )}
                      </ul>

         {/* Button area */}
{isPendingDowngradePlan ? (
  // Case 1: The Basic card when a downgrade is already scheduled
  <div className="w-full py-2.5 px-4 rounded-lg text-sm bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center gap-2">
    <Clock className="w-4 h-4 flex-shrink-0" />
    Starts {new Date(pendingDowngrade!.periodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
  </div>
) : planKey === 'pro' && pendingDowngrade ? (
  // Case 2: The Pro card when a downgrade is scheduled (Show "Resume Pro" or "Cancel Downgrade")
  <button
    onClick={() => handleChangePlan('pro')}
    disabled={changingPlan}
    className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
  >
  {changingPlan ? 'Processing...' : 'Keep Current Plan'}
  </button>
) : !isCurrent ? (
  // Case 3: Standard Switch/Upgrade buttons
  <button
    onClick={() => handleChangePlan(planKey)}
    disabled={changingPlan}
    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${
      isUpgrade
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {changingPlan ? (
      'Processing...'
    ) : isUpgrade ? (
      <><TrendingUp className="w-4 h-4" /> Upgrade to Pro <ArrowRight className="w-4 h-4" /></>
    ) : (
      'Switch to Basic'
    )}
  </button>
) : null}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Upgrades take effect immediately and are prorated. Downgrades take effect at the end of your current billing period.
              </p>
            </div>
          )}

          {/* Features List */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{planConfig.label} Plan Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {planConfig.features.map(feature => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <p className="text-sm text-slate-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Manage Your Subscription</p>
                <p className="text-xs sm:text-sm text-blue-800">
                  Click "Manage Billing" to update payment methods, view invoices, or cancel your subscription through our secure billing portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}