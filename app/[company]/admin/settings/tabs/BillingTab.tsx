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
  ShieldCheck,
} from 'lucide-react';
import { PLAN_CONFIG } from '@/lib/permissions';

// One paid plan: 'basic' internally, shown to customers as "Pro".
// Any legacy 'pro' account is treated as paid too.
const PAID = PLAN_CONFIG.basic;

export default function BillingTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser: any;
}) {
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  const isPaid = company.plan_tier === 'basic' || company.plan_tier === 'pro';
  const isTrialing = company.subscription_status === 'trialing';
  const alreadyTrialed = company.trial_ends_at != null;
  const planLabel = isPaid ? PAID.label : 'Free';

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
      else throw new Error();
    } catch {
      setError('Unable to open billing portal.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setCheckingOut(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'basic' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.error || 'Failed to start checkout');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setCheckingOut(false);
    }
  }

  if (currentUser.role !== 'owner') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Owner access only</h3>
        <p className="mt-1 text-sm text-slate-500">
          Only the account owner can manage billing.
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
        text: 'Free trial',
        color: 'text-blue-700',
        bg: 'bg-blue-50/60',
        border: 'border-blue-200/80',
        badgeBg: 'bg-blue-100 text-blue-800',
      },
      past_due: {
        icon: AlertCircle,
        text: 'Past due',
        color: 'text-rose-700',
        bg: 'bg-rose-50/60',
        border: 'border-rose-200/80',
        badgeBg: 'bg-rose-100 text-rose-800',
      },
    }[company.subscription_status as 'active' | 'trialing' | 'past_due'] ||
    (!isPaid
      ? {
          icon: Zap,
          text: 'Free plan',
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
    <div className="w-full font-sans text-slate-900 antialiased space-y-6 pb-16">
      {/* ── HEADER ── */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Billing</h1>
        <p className="mt-0.5 text-sm font-medium text-slate-500">
          Your plan, your trial, and your payment details.
        </p>
      </div>

      {/* ── STATUS CARDS ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col justify-between gap-4 rounded-xl border p-5 shadow-xs md:col-span-2 sm:flex-row sm:items-center ${statusInfo.border} ${statusInfo.bg}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs">
              <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Your plan</span>
              <div className="mt-0.5 flex items-center gap-2">
                <p className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusInfo.badgeBg}`}>
                  {planLabel}
                </span>
              </div>
            </div>
          </div>

          {isPaid && (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4 text-slate-500" />
              {loading ? 'Opening…' : 'Manage billing'}
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col justify-center rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Calendar className="h-4 w-4" /> Billing cycle
          </div>
          <p className="mt-1.5 text-lg font-bold text-slate-900">Monthly</p>
          <p className="mt-0.5 text-sm text-slate-500">Cancel anytime</p>
        </motion.div>
      </div>

      {/* ── TRIAL BANNER ── */}
      {isTrialing && company.trial_ends_at && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-900 to-slate-900 p-6 text-white shadow-md"
        >
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-md text-blue-300 ring-1 ring-blue-400/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold text-white">14-day free trial: $0 charged today</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-100/90">
                  On{' '}
                  <span className="font-semibold text-white">
                    {new Date(company.trial_ends_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  , your card will be charged{' '}
                  <span className="font-semibold text-white">${PAID.price}/mo</span> for the {PAID.label} plan unless
                  you cancel before then.
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-200/80">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Cancel before your trial ends and you keep full access through day 14.
                </p>
              </div>
            </div>

            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-xs backdrop-blur-md transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {loading ? 'Opening…' : 'Manage or cancel trial'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── ERROR ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── THE PLAN ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`overflow-hidden rounded-xl border bg-white shadow-xs ${isPaid ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200/80'}`}
      >
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">{PAID.label}</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900">${PAID.price}</span>
              <span className="text-sm font-medium text-slate-500">/mo</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{PAID.description}</p>

            {isPaid ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700">
                <CheckCircle className="h-4 w-4" /> Current plan
              </div>
            ) : (
              <>
                <button
                  onClick={handleUpgrade}
                  disabled={checkingOut}
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
                >
                  {checkingOut ? 'Opening checkout…' : alreadyTrialed ? `Upgrade to ${PAID.label}` : 'Start 14-day free trial'}
                </button>
                <p className="mt-2 text-center text-xs text-slate-500">
                  {alreadyTrialed ? 'Billed monthly. Cancel anytime.' : 'No charge for 14 days. Cancel anytime.'}
                </p>
              </>
            )}
          </div>

          <ul className="space-y-2.5 md:col-span-3 md:border-l md:border-slate-100 md:pl-6">
            {PAID.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}