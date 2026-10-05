'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscribeButton from '@/components/SubscribeButton';
import { Check, ShieldCheck, Loader2, X } from 'lucide-react';
import { PLAN_CONFIG } from '@/lib/permissions';
import { fontVars } from '@/components/marketing/marketingTheme';

// One paid plan: 'basic' internally, shown as "Pro".
const PAID = PLAN_CONFIG.basic;
const D = 'font-[family-name:var(--font-display)]';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen antialiased bg-[#F4EFE6] text-[#1C1F23]`}
      style={{
        backgroundImage:
          'linear-gradient(rgba(28,31,35,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.05) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      {children}
    </div>
  );
}

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
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (status !== 'polling') return;
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (status !== 'confirmed' || !slug) return;
    const dest = onboardingCompleted ? `/${slug}/dashboard` : '/onboarding';
    const t = setTimeout(() => router.push(dest), 2000);
    return () => clearTimeout(t);
  }, [status, slug, onboardingCompleted, router]);

  if (status === 'confirmed') {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#00828A] shadow-lg">
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
            <h1 className={`${D} text-4xl font-extrabold uppercase tracking-tight`}>You&rsquo;re in.</h1>
            <p className="mt-2 text-[#3a3f45]">Confirmed. Taking you to your dashboard…</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (status === 'timeout' || status === 'error') {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-lg">
            <div className="h-1.5 bg-amber-500" />
            <div className="p-8">
              <h2 className={`${D} text-3xl font-extrabold uppercase tracking-tight`}>Taking longer than expected</h2>
              <p className="mt-3 text-[#3a3f45]">
                Your payment most likely went through. Stripe can take a moment to confirm.
              </p>
              <p className="mt-2 text-sm text-slate-500">Check your email for a confirmation, or log in to your dashboard.</p>
              <div className="mt-7 flex flex-col gap-3">
                <button
                  onClick={() => router.push('/login')}
                  className={`w-full rounded-md bg-[#00828A] py-3 text-white hover:bg-[#006e75] ${D} text-base font-bold uppercase tracking-wider`}
                >
                  Go to login
                </button>
                <button
                  onClick={() => {
                    attempts.current = 0;
                    setElapsedSeconds(0);
                    setStatus('polling');
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Try again
                </button>
              </div>
              <p className="mt-6 text-xs text-slate-500">Need help? Email support@lead2project.com</p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-[#00828A]/20 border-t-[#00828A]" />
          <h2 className="text-xl font-bold">Activating your account{'.'.repeat(dots)}</h2>
          <p className="mt-1 text-sm text-slate-500">Confirming with Stripe…</p>
          {elapsedSeconds > 10 && (
            <p className="mx-auto mt-4 max-w-xs text-xs text-slate-500">This is taking a little longer than usual. Please keep this page open.</p>
          )}
        </div>
      </div>
    </Shell>
  );
}

// ─── Cancelled screen ─────────────────────────────────────────────────────────
function CancelledScreen({ companySlug }: { companySlug?: string }) {
  const router = useRouter();
  return (
    <Shell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white text-center shadow-lg">
          <div className="h-1.5 bg-slate-300" />
          <div className="p-8">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <X className="h-6 w-6 text-slate-500" />
            </div>
                        <h1 className={`${D} text-3xl font-extrabold uppercase tracking-tight`}>Not ready yet?</h1>
            <p className="mt-2 text-[#3a3f45]">No problem. Nothing was charged. Your account is on the Free plan.</p>
            <div className="mt-7 flex flex-col gap-3">
              <button
                onClick={() => router.push('/subscribe')}
                className={`w-full rounded-md bg-[#00828A] py-3 text-white hover:bg-[#006e75] ${D} text-base font-bold uppercase tracking-wider`}
              >
                              See the Pro plan
              </button>
              {companySlug && (
                <button
                  onClick={() => router.push(`/${companySlug}/dashboard`)}
                  className="w-full rounded-md border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Continue on the Free plan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ─── Main subscribe page ──────────────────────────────────────────────────────
function SubscribePageContent() {
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
      <Shell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00828A]" />
        </div>
      </Shell>
    );
  }

  const alreadyTrialed = company?.trial_ends_at != null;

  return (
    <Shell>
      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Lead2ProjectLogo.webp" alt="" className="h-8 w-8 rounded-md bg-white object-contain p-1 shadow-sm" />
          <span className={`${D} text-xl font-extrabold uppercase tracking-tight`}>Lead2Project</span>
        </div>
        {company?.slug && (
          <a href={`/${company.slug}/dashboard`} className="text-sm font-semibold text-slate-600 hover:text-[#1C1F23]">
            ← Dashboard
          </a>
        )}
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:pt-10">
        <div className="text-center">
          <p className={`${D} text-sm font-bold uppercase tracking-[0.14em] text-[#00828A]`}>Last step</p>
          <h1 className={`mt-3 ${D} text-4xl sm:text-6xl font-extrabold uppercase leading-[0.92] tracking-tight`}>
            One job pays for the whole year.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#3a3f45]">
            {alreadyTrialed
              ? 'Billed monthly. Cancel anytime.'
              : 'Free for 14 days. Nothing charged today. Cancel anytime.'}
          </p>
        </div>

        {/* The plan */}
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="h-1.5 bg-[#00828A]" />
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-5">
            <div className="md:col-span-2">
              <h2 className={`${D} text-3xl font-extrabold uppercase`}>{PAID.label}</h2>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`${D} text-5xl font-extrabold tracking-tight`}>${PAID.price}</span>
                <span className="text-sm font-semibold text-[#3a3f45]">/mo</span>
              </div>
              <p className="mt-2 text-[15px] text-[#3a3f45]">{PAID.description}</p>

              <div className="mt-6">
                {company && currentUser ? (
                  <SubscribeButton
                    companyId={company.id}
                    companyEmail={company.email}
                    subscriptionStatus={company.subscription_status}
                    trialEndsAt={company.trial_ends_at}
                    variant="banner"
                    plan="basic"
                  />
                ) : (
                  <div className="h-12 animate-pulse rounded-md bg-slate-100" />
                )}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 shrink-0" /> Payments are handled securely by Stripe.
              </p>
            </div>

            <ul className="space-y-2.5 md:col-span-3 md:border-l md:border-slate-100 md:pl-8">
              {PAID.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00828A]" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {[
              {
                q: 'When is the first charge?',
                a: alreadyTrialed
                  ? 'Today, since you’ve already used your free trial. Then monthly on the same date.'
                  : '14 days from today, when your trial ends. Then monthly on the same date.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from Billing in your dashboard. You keep access until the end of your trial or billing period.',
              },
              { q: 'Is there a contract?', a: 'No. It’s month to month.' },
              {
                q: 'What happens if I cancel?',
                a: 'Your account moves to the Free plan. Your booking link and job board keep working.',
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-[15px] font-bold">{q}</h3>
                <p className="mt-1 text-sm text-[#3a3f45] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-xs text-slate-500">All sales are final. Cancel anytime to stop future charges.</p>
        </div>
      </div>
    </Shell>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00828A]" />
        </div>
      }
    >
      <SubscribePageContent />
    </Suspense>
  );
}