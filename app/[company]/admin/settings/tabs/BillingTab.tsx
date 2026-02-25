'use client';

import { useState } from 'react';
import { CreditCard, Calendar, CheckCircle, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { PLAN_CONFIG } from '@/lib/permissions';

export default function BillingTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = (company.plan_tier || 'basic') as 'basic' | 'pro' | 'business';
  const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.basic;

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

  const getStatusInfo = () => {
    switch (company.subscription_status) {
      case 'active':
        return { icon: '✅', text: 'Active', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
      case 'trialing':
        return { icon: '🎉', text: 'Free Trial', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'past_due':
        return { icon: '⚠️', text: 'Payment Due', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'canceled':
        return { icon: '❌', text: 'Canceled', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { icon: '⚠️', text: 'Inactive', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const statusInfo = getStatusInfo();

  if (currentUser.role !== 'owner') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
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
        </div>
      )}

      {/* Main Billing Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Status Banner */}
        <div className={`${statusInfo.bg} ${statusInfo.border} border-b px-4 sm:px-6 py-4`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl">{statusInfo.icon}</div>
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
                {plan === 'pro' || plan === 'business'
                  ? <Sparkles className="w-5 h-5 text-indigo-600" />
                  : <Zap className="w-5 h-5 text-blue-600" />}
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Current Plan</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{planConfig.label}</p>
              <p className="text-slate-600 font-semibold">
                ${planConfig.price}<span className="text-sm font-normal">/month</span>
              </p>
              {/* Upgrade nudge for basic users */}
              {plan === 'basic' && (
                <a href="/subscribe?plan=pro"
                  className="inline-block mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                  Upgrade to Pro →
                </a>
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
                  <Calendar className="w-5 h-5 text-green-600" />
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

          {/* Features List — dynamic based on plan */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{planConfig.label} Plan Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {planConfig.features.map(feature => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <p className="text-sm text-slate-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl flex-shrink-0">💡</div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Manage Your Subscription</p>
                <p className="text-xs sm:text-sm text-blue-800">
                  Click "Manage Billing" to update payment methods, view invoices, change plans, or cancel your subscription through our secure billing portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}