'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, CheckCircle, AlertCircle, ArrowRight, Loader2, ChevronDown,
} from 'lucide-react';
import StripePaymentInfo from '@/components/dashboard/StripePaymentInfo';
import { describeRequirementReason } from '@/lib/stripe/requirementCopy';


const PAYMENT_COLORS: Record<string, string> = {
  venmo:   '#008CFF',
  zelle:   '#6D1ED4',
  cashapp: '#00D632',
  paypal:  '#003087',
  other:   '#64748b',
};

// Maps Stripe's requirement codes to plain-English copy a contractor can act on.
// Add to this as you encounter new codes in production — fall back to the
// generic message for anything unmapped rather than showing a raw Stripe code.
function describeBlockingReasons(reasons: { capability: string; code: string }[] | null | undefined): string {
  if (!reasons || reasons.length === 0) {
    return 'Your Stripe account needs more info before you can receive payouts.';
  }
  const messages = reasons.map(r => describeRequirementReason(r.code, r.capability));
  return Array.from(new Set(messages)).join(' ');
}

function StripeConnectSection({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [redirectStatus, setRedirectStatus] = useState<'idle' | 'error' | 'denied' | 'already_linked'>('idle');

  const isConnected = !!company.stripe_connect_onboarded;
  const paymentStatus: 'active' | 'restricted' | 'pending' | null = company.stripe_payment_status ?? null;
  const blockingReasons = company.stripe_requirements_summary ?? [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sc = params.get('stripe_connect');
    // 'success' is no longer a distinct banner — paymentStatus (read straight
    // from the company record, set by the redirect route + webhook) is now
    // the single source of truth for what to show. We still care about the
    // failure-path params since those don't have a DB equivalent.
    if (sc === 'error' || sc === 'denied' || sc === 'already_linked') setRedirectStatus(sc as any);
  }, []);

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
        <StripePaymentInfo
          accountStatus={
  !isConnected ? null : paymentStatus === 'active' ? 'active' : 'pending'
}
        />
      </div>

      {redirectStatus === 'error' && (
        <p className="mt-3 text-sm font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
          Something went wrong connecting Stripe. Please try again.
        </p>
      )}
      {redirectStatus === 'denied' && (
        <p className="mt-3 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          Stripe connection was cancelled.
        </p>
      )}
      {redirectStatus === 'already_linked' && (
        <p className="mt-3 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          That Stripe account is already connected to a different company. Use a different Stripe account, or contact support if you believe this is an error.
        </p>
      )}

      {isConnected ? (
        <div className="mt-4 space-y-3">
          {paymentStatus === 'active' && (
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle className="w-4 h-4" /> Connected — customers can pay invoices with a card.
            </div>
          )}

          {paymentStatus === 'restricted' && (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{describeBlockingReasons(blockingReasons)} Manage it on Stripe to finish setup.</span>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Stripe is reviewing your information.
            </div>
          )}

        {paymentStatus === null && (
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
          action: 'update-payment-link',
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

function HowSendingWorks({ company }: { company: any }) {
  const stripeActive = company.stripe_payment_status === 'active';
  const hasManualLink = !!company.payment_link_url;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
      <p className="text-xs font-black text-slate-700 mb-3">What customers see when you send an invoice</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={`rounded-xl border p-3.5 ${stripeActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
          <p className="text-[11px] font-black text-slate-700 mb-1">
            {stripeActive ? 'Currently active — Stripe' : 'If Stripe is connected'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            The email and PDF include a one-click "Pay Now" button. Customers pay by card, and your dashboard updates automatically — no manual tracking needed.
          </p>
        </div>
        <div className={`rounded-xl border p-3.5 ${!stripeActive && hasManualLink ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-white'}`}>
          <p className="text-[11px] font-black text-slate-700 mb-1">
            {!stripeActive && hasManualLink ? 'Currently active — manual link' : 'If using a manual link instead'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            {hasManualLink
              ? `The email includes your ${company.payment_link_type || 'payment'} link with a note asking the customer to enter the invoice amount themselves when they pay — there's no automatic confirmation when they do.`
              : 'No manual payment link is set up yet. Add one below as a backup, or connect Stripe above for automatic payment links.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function SampleInvoicePreview({ company }: { company: any }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <p className="text-xs font-black text-slate-700 mb-3">Example invoice customers receive</p>
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50" style={{ height: '600px' }}>
        <iframe
          src={`/api/company/${company.slug}/preview-invoice`}
          title="Sample invoice"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}

export default function PaymentsTab({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-0">
      <StripeConnectSection company={company} />
      <HowSendingWorks company={company} />
      <SampleInvoicePreview company={company} />
      <ManualPaymentLinkSection company={company} />
    </div>
  );
}