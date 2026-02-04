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

  if (subscriptionStatus === 'active' || !trialEndsAt) {
    return null;
  }

  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Trial expired
  if (daysLeft <= 0) {
    return (
      <div className="bg-red-600 text-white border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-medium">
              🚫 Trial Expired • Subscribe to continue
            </p>
            <button
              onClick={() => router.push('/subscribe')}
              className="bg-white text-red-600 font-semibold px-3 py-1 rounded text-xs whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trial ending soon (3 days or less)
  if (daysLeft <= 3) {
    return (
      <div className="bg-orange-500 text-white border-b border-orange-600">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm font-medium">
              ⚠️ Trial ends in <span className="font-bold">{daysLeft}</span> day{daysLeft !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => router.push('/subscribe')}
              className="bg-white text-orange-600 font-semibold px-3 py-1 rounded text-xs whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal trial (4+ days left)
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-b border-purple-700">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-medium">
            🎉 Free Trial • <span className="font-bold">{daysLeft}</span> days left
          </p>
          <button
            onClick={() => router.push('/subscribe')}
            className="bg-white/20 border border-white/30 text-white font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-white hover:text-purple-600 transition"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}