'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, CheckCircle, AlertCircle, ArrowRight, Loader2, ChevronDown,
} from 'lucide-react';
import StripePaymentInfo from '@/components/dashboard/StripePaymentInfo';

const PAYMENT_COLORS: Record<string, string> = {
  venmo:   '#008CFF',
  zelle:   '#6D1ED4',
  cashapp: '#00D632',
  paypal:  '#003087',
  other:   '#64748b',
};

function StripeConnectSection({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'denied' | 'already_linked'>('idle');
  const [accountStatus, setAccountStatus] = useState<'checking' | 'active' | 'pending' | null>(null);
  const isConnected = !!company.stripe_connect_onboarded;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sc = params.get('stripe_connect');
    if (sc === 'success' || sc === 'error' || sc === 'denied' || sc === 'already_linked') setStatus(sc as any);
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    setAccountStatus('checking');
    fetch(`/api/company/${company.slug}/stripe/connect-status`)
      .then(res => res.json())
      .then(data => setAccountStatus(data.chargesEnabled ? 'active' : 'pending'))
      .catch(() => setAccountStatus(null));
  }, [isConnected, company.slug]);

  async function handleConnect() {
    setLoading(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/stripe/connect-onboard`);
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[2.5rem] border border-slate-200 bg-white"
    >
      <div className="flex items-center gap-4 mb-1">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
          <CreditCard className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recommended</p>
          <p className="text-xl font-black text-slate-900">Accept cards with Stripe</p>
        </div>
      </div>

      <div className="mt-2">
        <StripePaymentInfo accountStatus={isConnected ? accountStatus : null} />
      </div>

      {status === 'success' && (
        <p className="mt-3 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
          Stripe connected successfully.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
          Something went wrong connecting Stripe. Please try again.
        </p>
      )}
      {status === 'denied' && (
        <p className="mt-3 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          Stripe connection was cancelled.
        </p>
      )}
      {status === 'already_linked' && (
        <p className="mt-3 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          That Stripe account is already connected to a different company. Use a different Stripe account, or contact support if you believe this is an error.
        </p>
      )}

      {isConnected ? (
        <div className="mt-4 space-y-3">
          {accountStatus === 'pending' && (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Your Stripe account needs more info before you can receive payouts. Manage it on Stripe to finish setup.</span>
            </div>
          )}
          {accountStatus === 'active' && (
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle className="w-4 h-4" /> Connected — customers can pay invoices with a card.
            </div>
          )}
          {accountStatus === 'checking' && (
            <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking account status...
            </div>
          )}

          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            Manage on Stripe
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="mt-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 mb-4">
            <p className="text-xs font-black text-slate-700 mb-3">What happens when you connect</p>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 mt-0.5">1</div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Already have a Stripe account? Log in and you're connected in under a minute. No account yet? Stripe will walk you through creating one.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 mt-0.5">2</div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  New accounts need basic business and banking info — this is standard for anyone handling customer payments, and Stripe requires it before payouts can start.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 mt-0.5">3</div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Once connected, every invoice you send automatically includes a payment link — customers pay by card, no extra steps for you.
                </p>
              </li>
            </ul>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Redirecting...' : 'Connect Stripe to accept payments'}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function ManualPaymentLinkSection({ company }: { company: any }) {
  const [open, setOpen] = useState(!company.payment_link_url && !company.stripe_connect_onboarded);
  const [type, setType] = useState(company.payment_link_type || '');
  const [url, setUrl] = useState(company.payment_link_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-general',
          data: { payment_link_type: type, payment_link_url: url },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // no-op, keep it simple
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Backup option</p>
            <p className="text-xl font-black text-slate-900">Or use a manual payment link</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-6 pb-6 -mt-2">
          <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
            Don't want to connect a payment processor? Add a Venmo, Zelle, Cash App, or PayPal link instead.
            Customers will see this on quotes and payment reminders if Stripe isn't connected.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="sm:w-40 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 ring-blue-100 transition"
            >
              <option value="">Method...</option>
              <option value="venmo">Venmo</option>
              <option value="zelle">Zelle</option>
              <option value="cashapp">Cash App</option>
              <option value="paypal">PayPal</option>
              <option value="other">Other</option>
            </select>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onBlur={() => {
                const val = url.trim();
                if (val && !val.startsWith('http')) setUrl(`https://${val}`);
              }}
              placeholder="https://venmo.com/your-handle"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 ring-blue-100 transition placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {type && (
            <span
              className="inline-block mt-3 text-[10px] font-bold px-2 py-1 rounded-full text-white"
              style={{ background: PAYMENT_COLORS[type] || '#64748b' }}
            >
              {type}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save link'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PaymentsTab({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-0">
      <StripeConnectSection company={company} />
      <ManualPaymentLinkSection company={company} />
    </div>
  );
}