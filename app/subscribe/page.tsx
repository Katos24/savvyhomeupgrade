'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscribeButton from '@/components/SubscribeButton';

const PLAN_CONFIG = {
  basic: {
    label: 'Basic',
    price: '$49',
    cents: '.00',
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
    cents: '.00',
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
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (subscriptionStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-7xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Lead2Project!</h1>
            <p className="text-xl text-gray-600 mb-8">Your 14-day free trial is now active. Let's get started!</p>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-green-900 mb-2">What's Next?</h3>
              <ul className="text-left text-green-800 space-y-2">
                <li>✓ Start tracking leads</li>
                <li>✓ Convert leads to projects</li>
                <li>✓ Try the AI Assistant</li>
                <li>✓ Get paid faster</li>
              </ul>
            </div>
            <button onClick={() => router.push(`/${company?.slug}/dashboard`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg transition">
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled state
  if (subscriptionStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="text-7xl mb-6">😔</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Checkout Cancelled</h1>
            <p className="text-xl text-gray-600 mb-8">No worries! You can subscribe anytime.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => router.push(`/${company?.slug}/dashboard`)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition">
                Back to Dashboard
              </button>
              <button onClick={() => router.push('/subscribe')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: show subscribe page with both plans
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

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🚀 Almost There!
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">Complete Your Signup</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Add your payment method to start your 14-day free trial. You won't be charged until the trial ends.
          </p>
        </div>

        {/* Both Plan Cards Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {(['basic', 'pro'] as const).map((planKey) => {
            const config = PLAN_CONFIG[planKey];
            const isPro = planKey === 'pro';

            return (
              <div
                key={planKey}
                className={`bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden border-4 ${
                  isPro ? 'border-indigo-400' : 'border-blue-200'
                }`}
              >
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
                    <p className="text-green-700 text-sm">
                      Card required — charged {config.price}/mo after trial
                    </p>
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
                    <div className="text-gray-500">Loading...</div>
                  )}

                  <p className="text-xs text-gray-500 mt-4">
                    By subscribing, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-6xl">⏳</div>
      </div>
    }>
      <SubscribePageContent />
    </Suspense>
  );
}