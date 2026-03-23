'use client';

import type { FeatureKey } from '@/hooks/usePlan';
import { PLAN_CONFIG, UPGRADE_PROMPTS } from '@/lib/permissions';
import type { PlanTier } from '@/lib/permissions';

type Props = {
  feature: FeatureKey;
  planTier: PlanTier;
  companySlug: string;
  children: React.ReactNode;
};

const PLAN_LABELS: Record<PlanTier, string> = {
  basic:    'Basic',
  pro:      'Pro',
  business: 'Business',
};

const PLAN_COLORS: Record<PlanTier, {
  bg: string; text: string; border: string; badge: string; badgeText: string;
}> = {
  basic: {
    bg: 'from-gray-50 to-gray-100', text: 'text-gray-900',
    border: 'border-gray-200', badge: 'bg-gray-800', badgeText: 'text-white',
  },
  pro: {
    bg: 'from-blue-50 to-indigo-50', text: 'text-blue-900',
    border: 'border-blue-200', badge: 'bg-blue-600', badgeText: 'text-white',
  },
  business: {
    bg: 'from-purple-50 to-violet-50', text: 'text-purple-900',
    border: 'border-purple-200', badge: 'bg-purple-600', badgeText: 'text-white',
  },
};

// Which plan is required for each feature
const FEATURE_REQUIRED_PLAN: Partial<Record<FeatureKey, PlanTier>> = {
  pipeline:              'pro',
  categories:            'pro',
  custom_tasks:          'pro',
  quote_templates:       'pro',
  scheduling:            'pro',
  quotes:                'pro',
  one_click_emails:      'pro',
  outbox:                'pro',
  email_templates:       'pro',
  csv_export:            'pro',
  customer_video:        'pro',
  custom_form_questions: 'pro',
  manage_roles:          'pro',
  ai_brief:              'business',
  ai_quote:              'business',
  ai_chat:               'business',
  ai_photo:              'business',
  daily_digest:          'business',
};

const PLAN_ORDER: PlanTier[] = ['basic', 'pro', 'business'];

export default function LockedTab({ feature, planTier, companySlug, children }: Props) {
  const requiredPlan: PlanTier = FEATURE_REQUIRED_PLAN[feature] ?? 'pro';
  const hasAccess = PLAN_ORDER.indexOf(planTier) >= PLAN_ORDER.indexOf(requiredPlan);

  // Has access — render children as-is
  if (hasAccess) return <>{children}</>;

  // Locked — show blur + upgrade card
  const prompt = UPGRADE_PROMPTS[feature as string];
  const colors = PLAN_COLORS[requiredPlan];
  const planLabel = PLAN_LABELS[requiredPlan];
  const planPrice = PLAN_CONFIG[requiredPlan]?.price;
  const planFeatures = [...(PLAN_CONFIG[requiredPlan]?.features ?? [])];

  return (
    <div className="relative min-h-[300px]">
      {/* Blurred background content */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: 'blur(4px)', opacity: 0.4 }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
        <div className={`w-full max-w-md rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} shadow-xl p-6`}>

          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.badge}`}>
              <LockIcon className={`w-5 h-5 ${colors.badgeText}`} />
            </div>
            <div>
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors.badge} ${colors.badgeText} mb-1`}>
                {planLabel} plan
              </span>
              <h3 className={`text-base font-semibold leading-tight ${colors.text}`}>
                {prompt?.title ?? 'Upgrade to unlock'}
              </h3>
            </div>
          </div>

          {prompt?.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {prompt.description}
            </p>
          )}

          {planFeatures.length > 0 && (
            <ul className="space-y-1.5 mb-5">
              {planFeatures.slice(0, 4).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <a
            href={`/${companySlug}/settings?tab=billing`}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold ${colors.badgeText} ${colors.badge} hover:opacity-90 transition-opacity`}
          >
            Upgrade to {planLabel}
            {planPrice && <span className="opacity-75 font-normal">— ${planPrice}/mo</span>}
            <ArrowIcon className={`w-4 h-4 ${colors.badgeText}`} />
          </a>

          <p className="text-xs text-center text-gray-400 mt-3">
            Cancel anytime. No contracts.
          </p>
        </div>
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}