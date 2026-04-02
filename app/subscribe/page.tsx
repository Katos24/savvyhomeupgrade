'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscribeButton from '@/components/SubscribeButton';
import { 
  Check, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Zap, 
  HelpCircle,
  Star,
  Loader2,
  X
} from 'lucide-react';

const PLAN_CONFIG = {
  starter: {
    label: 'Starter',
    price: '$29',
    tagline: 'Lead capture machine for solo contractors.',
    features: [
      'Custom QR code & booking form',
      'Lead board (kanban view)',
      'Photo & doc uploads on cards',
      'Payment status tracking',
      'Unlimited team members',
      'Form branding (logo & colors)',
      'Cancel anytime',
    ],
  },
  basic: {
    label: 'Basic',
    price: '$49.99',
    tagline: 'Perfect for getting organized.',
    features: [
      'Unlimited lead tracking',
      'Cards + table view',
      'Status management',
      'Customer contact form',
      'Activity log & notes',
      'CSV export',
      'Email support',
      'Cancel anytime',
    ],
  },
  pro: {
    label: 'Pro',
    price: '$79.99',
    tagline: 'The full operating system.',
    features: [
      'Everything in Basic',
      'Convert leads to projects',
      'Quotes & payment tracking',
      'Tasks & scheduling',
      'Docs & photo management',
      'Repeat customer detection',
      'AI Brief on every job card',
      'AI Assistant chat',
      'Cancel anytime',
    ],
  },
};

// ─── Secure polling success screen ───────────────────────────────────────────
function SuccessPolling() {
  const router = useRouter();
  const [status, setStatus] = useState<'polling' | 'confirmed' | 'timeout' | 'error'>('polling');
  const [dots, setDots] = useState(0);
  const [slug, setSlug] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const attempts = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_ATTEMPTS = 15;      // ~60 seconds total with backoff
  const HARD_TIMEOUT_MS = 90000; // 90 second hard stop

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  // Elapsed seconds counter for UX feedback
  useEffect(() => {
    if (status !== 'polling') return;
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Hard timeout — 90s no matter what
  useEffect(() => {
    const t = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatus('timeout');
    }, HARD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  // Polling with exponential backoff
  useEffect(() => {
    if (status !== 'polling') return;

    const getDelay = (attempt: number) => {
      // 2s, 2s, 3s, 4s, 5s, 6s, 7s... capped at 8s
      return Math.min(2000 + Math.max(0, attempt - 2) * 1000, 8000);
    };

    const poll = async () => {
      try {
        attempts.current += 1;

        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch('/api/subscription/status', {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(fetchTimeout);

        if (!res.ok) {
          if (attempts.current >= MAX_ATTEMPTS) setStatus('timeout');
          return;
        }

        const data = await res.json();

        if (data.isActive) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setSlug(data.slug);
          setOnboardingCompleted(data.onboardingCompleted);
          setStatus('confirmed');
          return;
        }

        if (attempts.current >= MAX_ATTEMPTS) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus('timeout');
          return;
        }

        // Schedule next poll with backoff
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setTimeout(poll, getDelay(attempts.current));

      } catch (err: any) {
        if (err.name === 'AbortError') {
          // fetch timed out — retry
          if (attempts.current >= MAX_ATTEMPTS) {
            setStatus('timeout');
          } else {
            intervalRef.current = setTimeout(poll, getDelay(attempts.current));
          }
        } else {
          // Network error
          if (attempts.current >= MAX_ATTEMPTS) {
            setStatus('error');
          } else {
            intervalRef.current = setTimeout(poll, getDelay(attempts.current));
          }
        }
      }
    };

    // First poll immediately
    poll();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  // Redirect after confirmed
  useEffect(() => {
    if (status !== 'confirmed' || !slug) return;
    const dest = onboardingCompleted ? `/${slug}/dashboard` : '/onboarding';
    const t = setTimeout(() => router.push(dest), 2000);
    return () => clearTimeout(t);
  }, [status, slug, onboardingCompleted, router]);

  if (status === 'confirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-white text-3xl font-black mb-3">You're in! 🎉</h1>
          <p className="text-slate-400 font-medium">Payment confirmed. Redirecting you now...</p>
        </div>
      </div>
    );
  }

  if (status === 'timeout' || status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-md">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-white text-2xl font-black mb-3">Taking longer than expected</h2>
          <p className="text-slate-400 mb-2 font-medium">
            Your payment was likely successful — Stripe can sometimes take a moment to confirm.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Check your email for a confirmation, or try logging in to your dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition"
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                attempts.current = 0;
                setElapsedSeconds(0);
                setStatus('polling');
              }}
              className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/10 transition"
            >
              Try Again
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-6">
            Need help? Email us at support@lead2project.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
          </div>
        </div>
        <h2 className="text-white text-xl font-black mb-2">
          Activating your account{'.'.repeat(dots)}
        </h2>
        <p className="text-slate-500 text-sm mb-4">Confirming payment with Stripe...</p>
        {elapsedSeconds > 10 && (
          <p className="text-slate-600 text-xs max-w-xs mx-auto">
            This is taking a bit longer than usual. Please don't close this page.
          </p>
        )}
        {elapsedSeconds > 30 && (
          <p className="text-slate-600 text-xs max-w-xs mx-auto mt-2">
            Almost there — Stripe webhooks occasionally have a short delay.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Cancelled screen ─────────────────────────────────────────────────────────
function CancelledScreen() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-md">
        <div className="text-5xl mb-6">😔</div>
        <h1 className="text-white text-2xl font-black mb-2 text-white">Checkout Cancelled</h1>
        <p className="text-slate-400 mb-8 font-medium">No worries — your progress is saved.</p>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition">
            Go Back
          </button>
          <button onClick={() => router.push('/subscribe')} className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition">
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main subscribe page ──────────────────────────────────────────────────────
function SubscribePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [company, setCompany] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const subscriptionStatus = searchParams.get('subscription');

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        if (!userData.success || !userData.user) {
          window.location.href = '/login';
          return;
        }
        setCurrentUser(userData.user);
        const slug = userData.user.companySlug || userData.user.company_slug;
        if (!slug) return;
        const companyRes = await fetch(`/api/company/${slug}/info`);
        const companyData = await companyRes.json();
        if (companyData.success && companyData.company) {
          setCompany(companyData.company);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (subscriptionStatus === 'success') return <SuccessPolling />;
  if (subscriptionStatus === 'cancelled') return <CancelledScreen />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm text-white">
              L2P
            </div>
            <span className="text-lg font-black tracking-tighter">Lead2Project</span>
          </div>
          {company?.subscription_status === 'active' && (
            <a href={`/${company.slug}/dashboard`} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition">
              ← Dashboard
            </a>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full mb-6">
            <Zap className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Final Step</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Choose your workspace</h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Try any plan <span className="text-indigo-600 font-bold underline decoration-2 underline-offset-4">free for 14 days</span>. You won't be charged a cent today.
          </p>
        </div>

<div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
{(['starter', 'basic', 'pro'] as const).map((planKey) => {
            const config = PLAN_CONFIG[planKey];
            const isPro = planKey === 'pro';
            
            return (
              <div 
                key={planKey} 
                className={`relative bg-white rounded-[2.5rem] p-8 md:p-12 border-2 transition-all ${
                  isPro 
                  ? 'border-indigo-600 shadow-2xl shadow-indigo-100 lg:scale-105 z-10' 
                  : 'border-slate-200 shadow-xl shadow-slate-200/50'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-indigo-200">
                    <Star className="w-3 h-3 fill-white" /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">{config.label}</h3>
                  <p className="text-slate-400 text-sm font-bold">{config.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-6xl font-black text-slate-900">{config.price}</span>
                  <span className="text-slate-400 font-bold text-sm">/mo</span>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Check className="w-6 h-6 text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-black text-xs uppercase tracking-tight">14 Days Free Trial</p>
                    <p className="text-emerald-600/80 text-[11px] font-bold">Risk-free. Cancel anytime.</p>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Included features</p>
                  {config.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Check className="w-3 h-3 text-slate-500" strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold text-slate-600 leading-snug">{f}</span>
                    </div>
                  ))}
                </div>

                {company && currentUser ? (
                  <div className="w-full">
                    <SubscribeButton
                      companyId={company.id}
                      companyEmail={company.email}
                      subscriptionStatus={company.subscription_status}
                      trialEndsAt={company.trial_ends_at}
                      variant="banner"
                      plan={planKey}
                    />
                  </div>
                ) : (
                  <div className="h-14 bg-slate-100 animate-pulse rounded-2xl" />
                )}

                <p className="text-xs text-center text-slate-400 mt-3">
  All sales are final. No refunds. Cancel anytime to stop future charges.
</p>
                
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6 opacity-50">
                  Secure Billing via Stripe
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Footer */}
        <div className="max-w-4xl mx-auto border-t border-slate-200 pt-16">
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            {[
              { icon: <Lock className="w-5 h-5 text-indigo-500" />, title: 'Fully Secure', desc: 'Bank-grade encryption for all your business data.' },
              { icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />, title: 'PCI Compliant', desc: 'We never store your card details on our servers.' },
              { icon: <CreditCard className="w-5 h-5 text-indigo-500" />, title: 'Easy Cancel', desc: 'No phone calls or emails needed to cancel.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="mb-4 p-3 bg-white rounded-xl shadow-sm border border-slate-100">{item.icon}</div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">{item.title}</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-indigo-600" /> FAQ
            </h3>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
              {[
                { q: 'When is the first charge?', a: 'Exactly 14 days from now. We will send a reminder email 48 hours before the trial ends.' },
                { q: 'Can I cancel immediately?', a: 'Yes. You can cancel 1 minute after signing up and you will still have access for the full 14 days.' },
                { q: 'Do you offer annual plans?', a: 'Currently we only offer month-to-month to keep things simple and flexible for you.' },
                { q: 'What happens to my data?', a: 'If you cancel, your data is kept for 30 days in case you decide to return, then it is securely deleted.' },
              ].map(({ q, a }) => (
                <div key={q} className="space-y-2">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">{q}</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>}>
      <SubscribePageContent />
    </Suspense>
  );
}