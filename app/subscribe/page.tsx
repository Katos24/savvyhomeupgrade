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
  basic: {
    name: 'Basic',
    price: 49.99,
    desc: 'Your entire digital storefront and job tracking in one link.',
    highlight: false,
    cta: 'Start 14-Day Free Trial',
    features: [
      'Custom Booking Link (No Website Needed)',
      'Branded QR Code for Trucks & Signs',
      'Unlimited Lead Capture & Photo Uploads',
      'Visual Lead Board (Kanban & Table)',
      'Job Scheduling & Quote Builder',
      'Custom Pipeline Stages & Task Lists',
      'CSV Export for Bookkeeping',
      'Unlimited Team Members',
    ],
  },
  pro: {
    name: 'Pro',
    price: 79.99,
    desc: 'The complete AI-powered office for contractors who want to scale.',
    highlight: true,
    cta: 'Go Pro — 14 Days Free',
    features: [
      'Everything in Basic',
      '6AM Daily Digest Email Briefing',
      'One-Click Email Sending (Quotes/Reminders)',
      'Full Email Outbox & Sent History',
      'Custom Email Templates & Branding',
      'AI Quote Generator from Photos ✦',
      'AI Project Briefs for Crews ✦',
      'AI Assistant — Ask Anything ✦',
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
  const MAX_ATTEMPTS = 15;
  const HARD_TIMEOUT_MS = 90000;

  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (status !== 'polling') return;
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatus('timeout');
    }, HARD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status !== 'polling') return;
    const getDelay = (attempt: number) => Math.min(2000 + Math.max(0, attempt - 2) * 1000, 8000);

    const poll = async () => {
      try {
        attempts.current += 1;
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch('/api/subscription/status', { cache: 'no-store', signal: controller.signal });
        clearTimeout(fetchTimeout);

        if (!res.ok) { if (attempts.current >= MAX_ATTEMPTS) setStatus('timeout'); return; }

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

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setTimeout(poll, getDelay(attempts.current));
      } catch (err: any) {
        if (err.name === 'AbortError') {
          if (attempts.current >= MAX_ATTEMPTS) setStatus('timeout');
          else intervalRef.current = setTimeout(poll, getDelay(attempts.current));
        } else {
          if (attempts.current >= MAX_ATTEMPTS) setStatus('error');
          else intervalRef.current = setTimeout(poll, getDelay(attempts.current));
        }
      }
    };

    poll();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

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
           <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-white text-3xl font-black mb-3">You're in!</h1>
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
          <p className="text-slate-400 mb-2 font-medium">Your payment was likely successful — Stripe can sometimes take a moment to confirm.</p>
          <p className="text-slate-500 text-sm mb-8">Check your email for a confirmation, or try logging in to your dashboard.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/login')} className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition">Go to Login</button>
            <button onClick={() => { attempts.current = 0; setElapsedSeconds(0); setStatus('polling'); }} className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/10 transition">Try Again</button>
          </div>
          <p className="text-slate-600 text-xs mt-6">Need help? Email us at support@lead2project.com</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="text-center">
        <div className="relative inline-block mb-8">
         <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
          </div>
        </div>
        <h2 className="text-white text-xl font-black mb-2">Activating your account{'.'.repeat(dots)}</h2>
        <p className="text-slate-500 text-sm mb-4">Confirming payment with Stripe...</p>
        {elapsedSeconds > 10 && <p className="text-slate-600 text-xs max-w-xs mx-auto">This is taking a bit longer than usual. Please don't close this page.</p>}
        {elapsedSeconds > 30 && <p className="text-slate-600 text-xs max-w-xs mx-auto mt-2">Almost there — Stripe webhooks occasionally have a short delay.</p>}
      </div>
    </div>
  );
}

// ─── Cancelled screen ─────────────────────────────────────────────────────────
function CancelledScreen({ companySlug }: { companySlug?: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-md">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-6 h-6 text-slate-400" />
        </div>
        <h1 className="text-white text-2xl font-black mb-2">Checkout Cancelled</h1>
        <p className="text-slate-400 mb-8 font-medium">No worries — your progress is saved.</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push('/subscribe')} className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition">Change Plan</button>
          <button onClick={() => router.back()} className="w-full py-3.5 rounded-xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition">Go Back</button>
          {companySlug && (
            <button onClick={() => router.push(`/${companySlug}/dashboard`)} className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-white transition">
              Back to Dashboard
            </button>
          )}
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
        if (!userData.success || !userData.user) { window.location.href = '/login'; return; }
        setCurrentUser(userData.user);
        const slug = userData.user.companySlug || userData.user.company_slug;
        if (!slug) return;
        const companyRes = await fetch(`/api/company/${slug}/info`);
        const companyData = await companyRes.json();
        if (companyData.success && companyData.company) setCompany(companyData.company);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (subscriptionStatus === 'success') return <SuccessPolling />;
  if (subscriptionStatus === 'cancelled') return <CancelledScreen companySlug={company?.slug} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080C14]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-white overflow-x-hidden">

      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 z-50 bg-[#080C14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1">
              <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white">Lead2Project</span>
          </div>
          {company?.slug && (
            <a href={`/${company.slug}/dashboard`} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition">
              ← Dashboard
            </a>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 relative">

  
        {/* Header */}
        <div className="text-center mb-12 sm:mb-20 relative">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4 block">Final Step — Choose Your Plan</span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4 sm:mb-6">
            One job pays for<br/>
            <span className="text-slate-500">the whole year.</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg font-medium max-w-xl mx-auto">
            Try free for <span className="text-blue-400 font-bold">14 days</span>. No credit card charge today. Cancel anytime.
          </p>
        </div>

        {/* ── Plan Cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-16 sm:mb-24 relative">
          {(['basic', 'pro'] as const).map((planKey) => {
            const plan = PLAN_CONFIG[planKey];

            return (
              <div
                key={planKey}
                className={`group rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 lg:p-10 border transition-all duration-500 relative ${
                  plan.highlight
                    ? 'bg-[#0F172A] border-blue-500 shadow-2xl shadow-blue-900/20'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 sm:-top-4 left-4 sm:left-10 bg-blue-600 text-white text-[7px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-xl whitespace-nowrap">
                    <span className="hidden sm:inline">Recommended for Growth</span>
                    <span className="sm:hidden">Most Popular</span>
                  </div>
                )}

                {/* Plan name + price */}
                <div className="mb-4 sm:mb-8 mt-2 sm:mt-0">
                  <h3 className={`text-[10px] sm:text-xl font-black uppercase tracking-widest ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-0.5 sm:gap-1 mt-1 sm:mt-2">
                    <span className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter">${plan.price}</span>
                    <span className="text-slate-500 font-bold text-xs sm:text-lg">/mo</span>
                  </div>
                </div>

                {/* Description */}
                <p className="hidden sm:block text-slate-400 font-medium mb-6 sm:mb-10 text-sm sm:text-lg leading-relaxed min-h-[60px]">
                  {plan.desc}
                </p>

                {/* CTA */}
                {company && currentUser ? (
                  <div className="mb-4 sm:mb-10">
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
                  <div className="h-12 sm:h-16 bg-white/5 animate-pulse rounded-xl sm:rounded-2xl mb-4 sm:mb-10" />
                )}

                {/* Features */}
                <div className="space-y-2 sm:space-y-4">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3 sm:mb-6 border-b border-white/5 pb-2">
                    What's included:
                  </p>
                  <ul className="grid gap-2 sm:gap-4">
                    {plan.features.map(f => {
                      const isAI = f.includes('✦');
                      return (
                        <li key={f} className="flex items-start gap-1.5 sm:gap-3">
                         <div className={`mt-0.5 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isAI ? 'bg-blue-500/20' : plan.highlight ? 'bg-blue-500/20' : 'bg-white/10'
                          }`}>
                            <Check className={`w-2 h-2 sm:w-3 sm:h-3 ${
                              isAI ? 'text-blue-400' : plan.highlight ? 'text-blue-400' : 'text-slate-400'
                            }`} strokeWidth={4} />
                          </div>
                         <span className="text-[9px] sm:text-sm font-semibold tracking-tight leading-tight text-slate-300">
                            {f.replace(' ✦', '')}
                            {isAI && (
                              <span className="ml-1 sm:ml-2 text-[7px] sm:text-[8px] bg-blue-500/20 text-blue-400 px-1 sm:px-1.5 py-0.5 rounded-md font-black border border-blue-500/30 uppercase tracking-tighter">
                                AI
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <p className="text-[9px] sm:text-xs text-center text-slate-600 mt-6 sm:mt-8">
                  All sales are final. Cancel anytime to stop future charges.
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust + FAQ */}
        <div className="max-w-4xl mx-auto border-t border-white/[0.06] pt-16 relative">

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 mb-16 opacity-30 grayscale">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-white" />
              <span className="text-white font-black tracking-tighter text-sm sm:text-lg uppercase">256-Bit SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-white font-black tracking-tighter text-sm sm:text-lg uppercase">Stripe Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-white" />
              <span className="text-white font-black tracking-tighter text-sm sm:text-lg uppercase">PCI Compliant</span>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12">
            <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-blue-400" /> FAQ
            </h3>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
              {[
                { q: 'When is the first charge?', a: 'Exactly 14 days from now. We will send a reminder email 48 hours before the trial ends.' },
                { q: 'Can I cancel immediately?', a: 'Yes. You can cancel 1 minute after signing up and you will still have access for the full 14 days.' },
                { q: 'Do you offer annual plans?', a: 'Currently we only offer month-to-month to keep things simple and flexible for you.' },
                { q: 'What happens to my data?', a: 'If you cancel, your data is kept for 30 days in case you decide to return, then it is securely deleted.' },
              ].map(({ q, a }) => (
                <div key={q} className="space-y-2">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight leading-tight">{q}</h4>
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    }>
      <SubscribePageContent />
    </Suspense>
  );
}