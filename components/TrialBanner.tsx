'use client';

import { useRouter } from 'next/navigation';

type TrialBannerProps = {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  companySlug: string;
};

export default function TrialBanner({ 
  subscriptionStatus, 
  trialEndsAt,
  companySlug 
}: TrialBannerProps) {
  const router = useRouter();

  // Don't show banner if already subscribed
  if (subscriptionStatus === 'active') {
    return null;
  }

  // Don't show if no trial date
  if (!trialEndsAt) {
    return null;
  }

  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Trial expired
  if (daysLeft <= 0) {
    return (
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 text-white border-b-4 border-red-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 animate-pulse">
                🚫
              </div>
              <div>
                <p className="font-bold text-xl mb-1">Trial Expired</p>
                <p className="text-sm text-red-100">
                  Subscribe now to continue tracking leads and getting paid
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/subscribe')}
              className="group relative bg-white text-red-600 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <span>Subscribe Now</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-black px-2 py-1 rounded-full">
                $39.99/mo
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trial ending soon (3 days or less)
  if (daysLeft <= 3) {
    return (
      <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 text-white border-b-4 border-orange-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 animate-bounce">
                ⚠️
              </div>
              <div>
                <p className="font-bold text-xl mb-1">Trial Ending Soon!</p>
                <p className="text-sm text-orange-100">
                  Only <span className="font-black text-2xl mx-1">{daysLeft}</span> 
                  day{daysLeft !== 1 ? 's' : ''} left • Don't lose access to your leads
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/subscribe')}
              className="group relative bg-white text-orange-600 font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <span>Subscribe Now</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute -top-2 -right-2 bg-green-400 text-gray-900 text-xs font-black px-2 py-1 rounded-full animate-pulse">
                SAVE NOW
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal trial (4+ days left)
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-b-4 border-purple-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              🎉
            </div>
            <div>
              <p className="font-bold text-xl mb-1 flex items-center gap-2">
                Free Trial Active
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-black">
                  {daysLeft} DAYS LEFT
                </span>
              </p>
              <p className="text-sm text-blue-100">
                Enjoying Lead2Project? Lock in your pricing before your trial ends
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/subscribe')}
            className="group relative bg-white/10 backdrop-blur border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <span>View Plans</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}