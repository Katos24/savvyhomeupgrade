'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Clock, Sparkles, XCircle } from 'lucide-react';

type TrialBannerProps = {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  companySlug: string;
  cancelAtPeriodEnd?: boolean;
  subscriptionCancelAt?: string | null;
};

export default function TrialBanner({
  subscriptionStatus,
  trialEndsAt,
  companySlug,
  cancelAtPeriodEnd,
  subscriptionCancelAt,
}: TrialBannerProps) {
  const router = useRouter();

  const go = () => router.push(`/${companySlug}/admin/settings`);

  // Scheduled cancellation — show over anything else
  if (cancelAtPeriodEnd && subscriptionCancelAt) {
    const until = new Date(subscriptionCancelAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Subscription cancelled — full access until <strong className="text-amber-200 ml-1">{until}</strong>
            </div>
            <button onClick={go}
              className="bg-amber-500/20 border border-amber-500/30 text-amber-200 font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-amber-500/30 transition">
              Reactivate
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active — no banner
  if (subscriptionStatus === 'active' || !trialEndsAt) return null;

  const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Expired
  if (daysLeft <= 0) {
    return (
      <div className="bg-red-600 border-b border-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              Trial expired — subscribe to continue
            </div>
            <button onClick={go}
              className="bg-white text-red-600 font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-red-50 transition">
              Manage Billing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ending soon
  if (daysLeft <= 3) {
    return (
      <div className="bg-orange-500 border-b border-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <Clock className="w-4 h-4 flex-shrink-0" />
              Trial ends in <strong className="mx-1">{daysLeft}</strong> day{daysLeft !== 1 ? 's' : ''}
            </div>
            <button onClick={go}
              className="bg-white text-orange-600 font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-orange-50 transition">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal trial
  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 border-b border-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            Free Trial — <strong className="mx-1">{daysLeft}</strong> days left
          </div>
          <button onClick={go}
className="bg-white/20 border border-white/30 text-white font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-white hover:text-blue-600 transition">            Manage Billing
          </button>
        </div>
      </div>
    </div>
  );
}