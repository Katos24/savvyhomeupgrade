'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Calendar, CheckCircle, AlertCircle, Sparkles,
  Zap, ArrowRight, Lock, TrendingUp, Clock, X
} from 'lucide-react';
import { PLAN_CONFIG } from '@/lib/permissions';

export default function BillingTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    plan: 'basic' | 'pro' | null 
  }>({ isOpen: false, plan: null });

  const [activePlan, setActivePlan] = useState<'free' | 'basic' | 'pro'>(
    company.plan_tier === 'pro' ? 'pro' : company.plan_tier === 'basic' ? 'basic' : 'free'
  );

  const [pendingDowngrade, setPendingDowngrade] = useState<{ periodEnd: number } | null>(
    company.pending_downgrade_at
      ? { periodEnd: Math.floor(new Date(company.pending_downgrade_at).getTime() / 1000) }
      : null
  );

  const isTrialing = company.subscription_status === 'trialing';

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
          body: JSON.stringify({ companyId: company.id, companyEmail: company.email, plan: newPlan }),
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
        setSuccess("Downgrade scheduled for end of cycle.");
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setChangingPlan(false);
    }
  }

  if (currentUser.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-xl font-black text-slate-900">Owner Access Only</h3>
      </div>
    );
  }

  const statusInfo = {
    active: { icon: CheckCircle, text: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    trialing: { icon: Sparkles, text: 'Free Trial', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
    past_due: { icon: AlertCircle, text: 'Past Due', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' },
 }[company.subscription_status as 'active' | 'trialing' | 'past_due'] || (
    company.plan_tier === 'free' 
      ? { icon: Zap, text: 'Free Plan', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' }
      : { icon: AlertCircle, text: 'Inactive', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' }
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-0">
      
      {/* ── STATUS CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`md:col-span-2 p-6 rounded-[2.5rem] border ${statusInfo.border} ${statusInfo.bg} flex items-center justify-between`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <statusInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subscription</p>
              <p className={`text-xl font-black ${statusInfo.color}`}>{statusInfo.text}</p>
            </div>
          </div>
          {company.plan_tier !== 'free' && (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="px-5 py-3 bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 transition-all active:scale-95 font-black text-xs uppercase tracking-wider"
            >
              {loading ? '...' : 'Manage'}
            </button>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-6 rounded-[2.5rem] border border-slate-200 bg-white flex flex-col justify-center"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cycle</p>
          <p className="text-xl font-black text-slate-900 mt-1">Monthly</p>
        </motion.div>
      </div>

      {/* ── TRIAL BANNER ── */}
      {isTrialing && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-[2.5rem] bg-slate-950 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px]" />
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/40">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="text-center md:text-left flex-1">
            <p className="font-black text-lg">Free Trial Active</p>
<p className="text-slate-400 text-sm">
              Ends {new Date(company.trial_ends_at).toLocaleDateString()}.
              {activePlan === 'pro' ? ' You\'re on the top plan.' : ' You can upgrade anytime.'}
            </p>
                      </div>
        </motion.div>
      )}

      {/* ── FEEDBACK MESSAGES ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

     {/* ── PENDING DOWNGRADE BANNER ── */}
      {pendingDowngrade && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[2.5rem] bg-amber-50 border border-amber-100 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-amber-900">Plan change scheduled</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your plan switches to Basic on{' '}
              <strong>
                {new Date(pendingDowngrade.periodEnd * 1000).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </strong>
              . You keep full Pro access until then.
            </p>
          </div>
          <button
            onClick={handleManageSubscription}
            className="px-4 py-2 bg-white text-amber-900 rounded-xl border border-amber-200 text-[10px] font-black uppercase tracking-widest shrink-0"
          >
            Undo
          </button>
        </motion.div>
      )}

      {/* ── PLAN SELECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {(['basic', 'pro'] as const).map((planKey, idx) => {
          const config = PLAN_CONFIG[planKey];
          const isCurrent = planKey === activePlan && !pendingDowngrade;
          const isPro = planKey === 'pro';

          return (
            <motion.div
              key={planKey}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className={`relative p-8 rounded-[3rem] border-2 transition-all duration-300 flex flex-col ${
                isCurrent ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-white'
} ${isTrialing && !isCurrent && planKey !== 'pro' ? 'opacity-60 grayscale-[0.3]' : ''}`}
            >
              {isPro && (
                <div className="absolute -top-3 right-10 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">
                  PRO FEATURES
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPro ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  {isPro ? <Sparkles className="w-7 h-7 text-blue-600" /> : <Zap className="w-7 h-7 text-slate-600" />}
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-slate-900">${config.price}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ month</p>
                </div>
              </div>

              <h4 className="text-2xl font-black text-slate-900 mb-4">{config.label}</h4>
              <ul className="space-y-4 mb-10 flex-1">
                {config.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-600 font-bold leading-tight">
                    <CheckCircle className={`w-5 h-5 shrink-0 ${isPro ? 'text-blue-500' : 'text-slate-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setConfirmModal({ isOpen: true, plan: planKey })}
disabled={changingPlan || isCurrent || (!!pendingDowngrade && planKey !== 'pro') || (isTrialing && planKey !== 'pro' && activePlan === 'pro')}
                className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all active:scale-[0.98] ${
  isCurrent 
    ? 'bg-blue-100 text-blue-600 cursor-default' 
    : isTrialing && planKey !== 'pro'
      ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
      : isPro 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
        : 'bg-slate-900 text-white'
}`}
              >
{isCurrent
  ? 'Current Plan'
  : changingPlan
    ? '...'
    : pendingDowngrade && planKey !== 'pro'
      ? `Switching ${new Date(pendingDowngrade.periodEnd * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : activePlan === 'free'
        ? `Upgrade to ${config.label}`
        : `Select ${config.label}`
}              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ── CUSTOM CONFIRM MODAL ── */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ isOpen: false, plan: null })}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100]" 
            />
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl pointer-events-auto border border-slate-100"
              >
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${confirmModal.plan === 'pro' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  {confirmModal.plan === 'pro' ? <TrendingUp className="w-8 h-8 text-blue-600" /> : <Clock className="w-8 h-8 text-slate-600" />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Confirm Change</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                  {confirmModal.plan === 'pro' 
                    ? `Upgrade to Pro ($79.99/mo) and unlock custom forms, photo uploads, and more.`
                    : `Switching to Basic ($49.99/mo). Your features will change at the end of the current cycle.`}
                </p>
                <div className="space-y-3">
                  <button onClick={executePlanChange} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-100">
                    Confirm Change
                  </button>
                  <button onClick={() => setConfirmModal({ isOpen: false, plan: null })} className="w-full py-4 text-slate-400 font-black text-sm">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}