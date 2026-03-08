'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscribeButton from '@/components/SubscribeButton';

const PLAN_CONFIG = {
  basic: {
    label: 'Basic',
    price: '$49',
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
    price: '$99',
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
// Never trusts the ?subscription=success URL param for access.
// Polls /api/subscription/status (auth-gated) until webhook confirms payment.

function SuccessPolling() {
  const router = useRouter();
  const [status, setStatus] = useState<'polling' | 'confirmed' | 'timeout'>('polling');
  const [dots, setDots] = useState(0);
  const [slug, setSlug] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const attempts = useRef(0);
  const MAX_ATTEMPTS = 20; // 20 × 3s = 60s max wait

  // Animate dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  // Poll subscription status from server (uses auth cookie — not URL param)
  useEffect(() => {
    if (status !== 'polling') return;

    const poll = async () => {
      try {
        attempts.current += 1;
        const res = await fetch('/api/subscription/status', { cache: 'no-store' });
        if (!res.ok) return; // keep retrying on server errors

        const data = await res.json();

        if (data.isActive) {
          setSlug(data.slug);
          setOnboardingCompleted(data.onboardingCompleted);
          setStatus('confirmed');
          return;
        }

        if (attempts.current >= MAX_ATTEMPTS) {
          setStatus('timeout');
        }
      } catch {
        // network error — keep trying
      }
    };

    poll(); // immediate first check
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [status]);

  // Auto-redirect 2s after confirmed
  useEffect(() => {
    if (status !== 'confirmed' || !slug) return;
    const dest = onboardingCompleted ? `/${slug}/dashboard` : '/onboarding';
    const t = setTimeout(() => router.push(dest), 2000);
    return () => clearTimeout(t);
  }, [status, slug, onboardingCompleted, router]);

  if (status === 'confirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
          <style>{`
            @keyframes fadeUp { from { opacity:0; transform:translateY(20px);} to { opacity:1; transform:translateY(0);} }
            @keyframes pop { 0%{transform:scale(0.4);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
            @keyframes ripple { 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(2.2);opacity:0} }
          `}</style>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(99,102,241,0.3)',
              animation: 'ripple 1.2s ease-out infinite',
            }} />
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
              boxShadow: '0 0 40px rgba(99,102,241,0.5)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>You're in! 🎉</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 8 }}>
            Payment confirmed. Taking you to {onboardingCompleted ? 'your dashboard' : 'setup'}…
          </p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === dots % 3 ? '#6366f1' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'timeout') {
    // Webhook took too long — show manual continue option
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="max-w-md w-full bg-white/10 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            Almost there…
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Your payment was received but activation is taking a moment.
            Check your email for confirmation, then head to your dashboard.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              border: 'none', cursor: 'pointer',
            }}
          >
            Continue to Setup →
          </button>
          <button
            onClick={() => { attempts.current = 0; setStatus('polling'); }}
            style={{
              marginTop: 12, background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 13,
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Polling state
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366f1',
          animation: 'spin 0.9s linear infinite',
          margin: '0 auto 28px',
        }} />
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
          Activating your account{'.'.repeat(dots)}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
          Confirming payment with Stripe…
        </p>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 8 }}>
          This usually takes under 5 seconds
        </p>
      </div>
    </div>
  );
}

// ─── Cancelled screen ─────────────────────────────────────────────────────────
function CancelledScreen() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="max-w-md w-full bg-white/10 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
        <div style={{ fontSize: 56, marginBottom: 16 }}>😔</div>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Checkout Cancelled</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>No worries — you can subscribe anytime.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.back()}
            style={{ flex: 1, padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
            ← Go Back
          </button>
          <button onClick={() => router.push('/subscribe')}
            style={{ flex: 1, padding: '12px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
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

  // These screens don't need company data loaded first
  if (subscriptionStatus === 'success') return <SuccessPolling />;
  if (subscriptionStatus === 'cancelled') return <CancelledScreen />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                L2P
              </div>
            )}
            <span className="text-xl font-bold">Lead2Project</span>
          </div>
          {company?.subscription_status === 'active' && (
            <a href={`/${company.slug}/dashboard`} className="text-gray-600 hover:text-gray-900 font-medium">
              ← Back to Dashboard
            </a>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🚀 Almost There!
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">Complete Your Signup</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Add your payment method to start your 14-day free trial. You won't be charged until the trial ends.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {(['basic', 'pro'] as const).map((planKey) => {
            const config = PLAN_CONFIG[planKey];
            const isPro = planKey === 'pro';
            return (
              <div key={planKey} className={`bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden border-4 ${isPro ? 'border-indigo-400' : 'border-blue-200'}`}>
                {isPro && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-sm font-bold">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div className="text-center pt-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.label} Plan</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-6">
                    <span className="text-5xl font-extrabold text-gray-900">{config.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-8">
                    <p className="text-green-800 font-semibold">🎉 First 14 days FREE</p>
                    <p className="text-green-700 text-sm">Card required — charged {config.price}/mo after trial</p>
                  </div>
                  <div className="text-left space-y-3 mb-8">
                    {config.features.map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                        <span className="text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>
                  {company && currentUser ? (
                    <SubscribeButton
                      companyId={company.id}
                      companyEmail={company.email}
                      subscriptionStatus={company.subscription_status}
                      trialEndsAt={company.trial_ends_at}
                      variant="banner"
                      plan={planKey}
                    />
                  ) : (
                    <div className="text-gray-500">Loading…</div>
                  )}
                  <p className="text-xs text-gray-500 mt-4">By subscribing, you agree to our Terms of Service</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            {[
              { q: '💳 When will I be charged?', a: 'Your card will be charged after your 14-day free trial ends. Cancel anytime before then to avoid charges.' },
              { q: '🔒 Can I cancel during the trial?', a: "Yes! Cancel anytime during your trial from billing settings. You won't be charged if you cancel before the trial ends." },
              { q: '🔄 Can I switch plans?', a: 'Yes — upgrade or downgrade anytime. Changes take effect immediately.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="font-bold text-gray-900 mb-2">{q}</h4>
                <p className="text-gray-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.9s linear infinite' }} />
      </div>
    }>
      <SubscribePageContent />
    </Suspense>
  );
}