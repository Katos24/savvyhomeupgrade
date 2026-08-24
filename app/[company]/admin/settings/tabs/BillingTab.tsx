'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Lock,
  TrendingUp,
  Clock,
  X,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { PLAN_CONFIG, type PlanTier } from '@/lib/permissions';

export default function BillingTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser: any;
}) {
  const [loading, setLoading] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    plan: 'basic' | 'pro' | null;
  }>({ isOpen: false, plan: null });

  const [activePlan, setActivePlan] = useState<'free' | 'basic' | 'pro'>(
    company.plan_tier === 'pro'
      ? 'pro'
      : company.plan_tier === 'basic'
      ? 'basic'
      : 'free'
  );

  const planTier = (company.plan_tier || 'free') as PlanTier;

  const [pendingDowngrade, setPendingDowngrade] = useState<{
    periodEnd: number;
  } | null>(
    company.pending_downgrade_at
      ? {
          periodEnd: Math.floor(
            new Date(company.pending_downgrade_at).getTime() / 1000
          ),
        }
      : null
  );

  const isTrialing = company.subscription_status === 'trialing';
  // What the trial is actually FOR — the plan/price the card gets charged
  // for once the trial ends. Falls back to 'basic' defensively; a trialing
  // company should always have a real plan_tier, but this avoids the banner
  // rendering "undefined/mo" if that assumption is ever wrong.
  const trialPlanConfig = PLAN_CONFIG[(activePlan === 'free' ? 'basic' : activePlan) as 'basic' | 'pro'];

  // --- ACTIONS ---

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
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError('Unable to open billing portal.');
    } finally {
      setLoading(false);
    }
  }

  async function executePlanChange() {
    const newPlan = confirmModal.plan;
    if (!newPlan) return;

    setConfirmModal({ isOpen: false, plan: null });
    setChangingPlan(true);
    setError('');
    setSuccess('');

    try {
      // Free users need checkout, not plan change
      if (activePlan === 'free') {
        const res = await fetch('/api/stripe/create-subscription-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: company.id,
            companyEmail: company.email,
            plan: newPlan,
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error(data.error || 'Failed to start checkout');
      }

      const res = await fetch('/api/stripe/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, newPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change plan');

      if (newPlan === 'pro') {
        setActivePlan('pro');
        setPendingDowngrade(null);
        setSuccess(`Upgraded to Pro! Premium features are now active.`);
      } else {
        setPendingDowngrade({ periodEnd: data.periodEnd });
        setSuccess('Downgrade scheduled for end of cycle.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setChangingPlan(false);
    }
  }

  if (currentUser.role !== 'owner') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Owner Access Only</h3>
        <p className="mt-1 text-xs text-slate-500">
          Only the workspace owner can manage billing subscriptions and plan upgrades.
        </p>
      </div>
    );
  }

  const statusInfo =
    {
      active: {
        icon: CheckCircle,
        text: 'Active',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50/60',
        border: 'border-emerald-200/80',
        badgeBg: 'bg-emerald-100 text-emerald-800',
      },
      trialing: {
        icon: Sparkles,
        text: 'Free Trial',
        color: 'text-blue-700',
        bg: 'bg-blue-50/60',
        border: 'border-blue-200/80',
        badgeBg: 'bg-blue-100 text-blue-800',
      },
      past_due: {
        icon: AlertCircle,
        text: 'Past Due',
        color: 'text-rose-700',
        bg: 'bg-rose-50/60',
        border: 'border-rose-200/80',
        badgeBg: 'bg-rose-100 text-rose-800',
      },
    }[company.subscription_status as 'active' | 'trialing' | 'past_due'] ||
    (company.plan_tier === 'free'
      ? {
          icon: Zap,
          text: 'Free Plan',
          color: 'text-blue-700',
          bg: 'bg-blue-50/60',
          border: 'border-blue-200/80',
          badgeBg: 'bg-blue-100 text-blue-800',
        }
      : {
          icon: AlertCircle,
          text: 'Inactive',
          color: 'text-slate-700',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          badgeBg: 'bg-slate-200 text-slate-700',
        });

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 px-4 sm:px-0">
      {/* ── HEADER ── */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Billing & Subscription
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Manage your subscription tier, billing period, and payment settings.
        </p>
      </div>

      {/* ── STATUS CARDS ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-xs md:col-span-2 sm:flex-row sm:items-center ${statusInfo.border} ${statusInfo.bg}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs">
              <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Current Plan Status
              </span>
              <div className="mt-0.5 flex items-center gap-2">
                <p className={`text-lg font-bold ${statusInfo.color}`}>
                  {statusInfo.text}
                </p>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusInfo.badgeBg}`}>
                  {planTier}
                </span>
              </div>
            </div>
          </div>

          {company.plan_tier !== 'free' && (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <CreditCard className="h-3.5 w-3.5 text-slate-500" />
              {loading ? 'Opening Portal...' : 'Manage Portal'}
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col justify-center rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Calendar className="h-3.5 w-3.5" /> Billing Cycle
          </div>
          <p className="mt-1.5 text-lg font-bold text-slate-900">Monthly</p>
          <p className="mt-0.5 text-xs text-slate-500">Renews automatically every month</p>
        </motion.div>
      </div>

      {/* ── TRIAL BANNER ── */}
      {isTrialing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-white shadow-md"
        >
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-md text-blue-300 ring-1 ring-blue-400/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  14-Day Free Trial &mdash; $0 charged today
                </p>
                <p className="mt-1 text-xs leading-relaxed text-blue-100/90">
                  On{' '}
                  <span className="font-semibold text-white">
                    {new Date(company.trial_ends_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  , your card will be automatically charged{' '}
                  <span className="font-semibold text-white">
                    ${trialPlanConfig?.price}/mo
                  </span>{' '}
                  for the {trialPlanConfig?.label} plan unless you cancel before then.
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-200/80">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Cancel anytime before your trial ends and you'll keep full access
                  through day 14 &mdash; no early cutoff.
                </p>
              </div>
            </div>

            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white shadow-xs backdrop-blur-md transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {loading ? 'Opening...' : 'Manage or Cancel Trial'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── FEEDBACK MESSAGES ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-xs"
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PENDING DOWNGRADE BANNER ── */}
      {pendingDowngrade && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">Plan Downgrade Scheduled</p>
              <p className="mt-0.5 text-xs text-amber-700">
                Your subscription transitions to Basic on{' '}
                <span className="font-bold">
                  {new Date(pendingDowngrade.periodEnd * 1000).toLocaleDateString(
                    'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' }
                  )}
                </span>
                . You keep full Pro capabilities until then.
              </p>
            </div>
          </div>
          <button
            onClick={handleManageSubscription}
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-white px-3.5 py-1.5 text-[11px] font-bold text-amber-900 shadow-xs transition hover:bg-amber-50"
          >
            Undo Downgrade
          </button>
        </motion.div>
      )}

      {/* ── PLAN SELECTION CARDS ── */}
      <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
        {(['basic', 'pro'] as const).map((planKey, idx) => {
          const config = PLAN_CONFIG[planKey];
          const isCurrent = planKey === activePlan && !pendingDowngrade;
          const isPro = planKey === 'pro';

          return (
            <motion.div
              key={planKey}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 shadow-xs transition-all duration-200 ${
                isCurrent
                  ? 'border-blue-600 bg-white ring-1 ring-blue-600'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              } ${
                isTrialing && !isCurrent && planKey !== 'pro'
                  ? 'opacity-70'
                  : ''
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isPro ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isPro ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-3xl font-extrabold text-slate-900">
                        ${config.price}
                      </span>
                      <span className="text-xs font-medium text-slate-400">/mo</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{config.label}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {isPro
                    ? 'Full power suite for growing operations with custom forms.'
                    : 'Essential tools for scheduling, quoting, and managing work.'}
                </p>

                <div className="my-6 border-t border-slate-100" />

                <ul className="mb-8 space-y-3">
                  {config.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-xs font-medium text-slate-700"
                    >
                      <CheckCircle
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isPro ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setConfirmModal({ isOpen: true, plan: planKey })}
                disabled={
                  changingPlan ||
                  isCurrent ||
                  (!!pendingDowngrade && planKey !== 'pro') ||
                  (isTrialing && planKey !== 'pro' && activePlan === 'pro')
                }
                className={`flex w-full items-center justify-center rounded-xl py-3 text-xs font-bold transition active:scale-[0.98] disabled:opacity-50 ${
                  isCurrent
                    ? 'border border-blue-200 bg-blue-50 text-blue-700 cursor-default'
                    : isTrialing && planKey !== 'pro'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isPro
                    ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                    : 'bg-slate-900 text-white shadow-xs hover:bg-slate-800'
                }`}
              >
                {isCurrent
                  ? 'Current Plan'
                  : changingPlan
                  ? 'Updating...'
                  : pendingDowngrade && planKey !== 'pro'
                  ? `Switching ${new Date(
                      pendingDowngrade.periodEnd * 1000
                    ).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}`
                  : activePlan === 'free'
                  ? `Upgrade to ${config.label}`
                  : `Select ${config.label}`}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ── CUSTOM CONFIRM MODAL ── */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ isOpen: false, plan: null })}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                  confirmModal.plan === 'pro'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {confirmModal.plan === 'pro' ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900">Confirm Plan Change</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {confirmModal.plan === 'pro'
                  ? 'Upgrade to Pro ($79.99/mo) and unlock custom intake forms, job photo uploads, full template customization, and more.'
                  : 'Switching to Basic ($49.99/mo). Your current feature set will remain active until the end of your billing cycle.'}
              </p>

              <div className="mt-6 space-y-2">
                <button
                  onClick={executePlanChange}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
                >
                  Confirm & Proceed
                </button>
                <button
                  onClick={() => setConfirmModal({ isOpen: false, plan: null })}
                  className="w-full rounded-xl py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}