// ============================================================
// components/LockedTab.tsx
// ============================================================
// Wraps any content. If the plan doesn't have access,
// blurs the content and shows an upgrade card.
//
// Usage:
//   <LockedTab feature="csv_export" planTier={planTier} companySlug={slug}>
//     <CsvExportButton />
//   </LockedTab>
//
// To change what's locked: edit FEATURE_PLAN_MAP in permissions.ts.
// This component never needs to change.
// ============================================================

'use client';

import {
  can,
  PLAN_CONFIG,
  UPGRADE_PROMPTS,
  FEATURE_PLAN_MAP,
  type PlanTier,
  type FeatureKey,
} from '@/lib/permissions';

type Props = {
  feature: FeatureKey;
  planTier: PlanTier;
  companySlug: string;
  children: React.ReactNode;
  // Optional: render inline banner instead of full overlay
  inline?: boolean;
};

export default function LockedTab({
  feature,
  planTier,
  companySlug,
  children,
  inline = false,
}: Props) {
  // Has access — render children as-is
  if (can(planTier, feature)) return <>{children}</>;

  const prompt = UPGRADE_PROMPTS[feature];
  const requiredPlan = FEATURE_PLAN_MAP[feature] as PlanTier;
  const config = PLAN_CONFIG[requiredPlan];

  if (inline) {
    return (
      <InlineLockBanner
        title={prompt?.title ?? 'Upgrade to unlock'}
        description={prompt?.description ?? ''}
        planLabel={config.label}
        priceLabel={config.priceLabel}
        companySlug={companySlug}
      />
    );
  }

  return (
    <div className="relative min-h-[280px]">
      {/* Blurred background */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: 'blur(4px)', opacity: 0.35 }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay card */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
        <UpgradeCard
          title={prompt?.title ?? 'Upgrade to unlock'}
          description={prompt?.description}
          planLabel={config.label}
          priceLabel={config.priceLabel}
          features={[...config.features].slice(0, 4)}
          companySlug={companySlug}
        />
      </div>
    </div>
  );
}

// ── Full upgrade card (used in overlay) ──────────────────────
function UpgradeCard({ title, description, planLabel, priceLabel, features, companySlug }: {
  title: string;
  description?: string;
  planLabel: string;
  priceLabel: string;
  features: readonly string[];
  companySlug: string;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50 shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <LockIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-600 text-white mb-1">
            {planLabel} plan
          </span>
          <h3 className="text-base font-semibold leading-tight text-blue-900">{title}</h3>
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
      )}

      {features.length > 0 && (
        <ul className="space-y-1.5 mb-5">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <a
        href={`/${companySlug}/admin/settings`}
        onClick={e => { e.preventDefault(); window.location.href = `/${companySlug}/admin/settings`; }}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:opacity-90 transition"
      >
        Upgrade to {planLabel}
        <span className="opacity-75 font-normal">— {priceLabel}</span>
        <ArrowIcon className="w-4 h-4 text-white" />
      </a>

      <p className="text-xs text-center text-gray-400 mt-3">Cancel anytime. No contracts.</p>
    </div>
  );
}

// ── Inline banner (used inside form tab etc) ─────────────────
export function InlineLockBanner({ title, description, planLabel, priceLabel, companySlug }: {
  title: string;
  description: string;
  planLabel: string;
  priceLabel: string;
  companySlug: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/50">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        <LockIcon className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white mt-0.5">{description}</p>
      </div>
      <a
        href={`/${companySlug}/admin/settings`}
        onClick={e => { e.preventDefault(); window.location.href = `/${companySlug}/admin/settings`; }}
        className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition whitespace-nowrap"
      >
        Upgrade to {planLabel}
      </a>
    </div>
  );
}

// ── Inline SVG icons ─────────────────────────────────────────
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
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