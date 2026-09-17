'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Clock, Sparkles, XCircle } from 'lucide-react';

type TrialBannerProps = {
  subscriptionStatus: string;
  trialEndsAt: string | null;
  companySlug: string;
  cancelAtPeriodEnd?: boolean;
  subscriptionCancelAt?: string | null;
  planTier?: string;
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
};

export default function TrialBanner({
  subscriptionStatus,
  trialEndsAt,
  companySlug,
  cancelAtPeriodEnd,
  subscriptionCancelAt,
  planTier = 'basic',
}: TrialBannerProps) {
  const router = useRouter();
  const go = () => router.push(`/${companySlug}/admin/settings`);

  const planLabel = PLAN_LABELS[planTier] || planTier;

  // Free plan — no trial banner
  if (subscriptionStatus === 'free' || (!subscriptionStatus && !trialEndsAt)) return null;

  // Scheduled cancellation — show over anything else
  if (cancelAtPeriodEnd && subscriptionCancelAt) {
    const until = new Date(subscriptionCancelAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return (
      <div className="bg-amber-50 border-b border-amber-200/80 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                {planLabel} subscription cancelled — full access until{' '}
                <strong className="text-amber-950 dark:text-amber-100 font-semibold">{until}</strong>
              </span>
            </div>
            <button
              onClick={go}
              className="bg-amber-100 border border-amber-300 text-amber-900 font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-amber-200 dark:bg-amber-900/50 dark:border-amber-700/60 dark:text-amber-200 dark:hover:bg-amber-800/60 transition cursor-pointer"
            >
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
      <div className="bg-red-50 border-b border-red-200/80 text-red-900 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <XCircle className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              <span>{planLabel} trial expired — subscribe to continue</span>
            </div>
            <button
              onClick={go}
              className="bg-red-600 text-white font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition cursor-pointer"
            >
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
      <div className="bg-orange-50 border-b border-orange-200/80 text-orange-900 dark:bg-orange-950/40 dark:border-orange-900/50 dark:text-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <Clock className="w-4 h-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
              <span>
                {planLabel} trial ends in{' '}
                <strong className="font-semibold text-orange-950 dark:text-orange-100 mx-0.5">{daysLeft}</strong> day
                {daysLeft !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={go}
              className="bg-orange-600 text-white font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 transition cursor-pointer"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal trial
  return (
    <div className="bg-blue-50 border-b border-blue-200/80 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              {planLabel} Trial —{' '}
              <strong className="font-semibold text-blue-950 dark:text-blue-100 mx-0.5">{daysLeft}</strong> days left
            </span>
          </div>
          <button
            onClick={go}
            className="bg-blue-600 text-white font-semibold px-3 py-1 rounded text-xs whitespace-nowrap hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition cursor-pointer"
          >
            Manage Billing
          </button>
        </div>
      </div>
    </div>
  );
}