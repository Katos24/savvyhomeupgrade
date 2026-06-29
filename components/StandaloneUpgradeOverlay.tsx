'use client';

import { Lock } from 'lucide-react';
import { PLAN_CONFIG, UPGRADE_PROMPTS, type PlanTier } from '@/lib/permissions';

export default function StandaloneUpgradeOverlay({
  feature, companySlug, requiredPlan,
}: {
  feature: string;
  companySlug: string;
  requiredPlan: PlanTier;
}) {
  const prompt = UPGRADE_PROMPTS[feature];
  const config = PLAN_CONFIG[requiredPlan === 'pro' ? 'pro' : 'basic'];

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-5 sm:p-8 text-center max-w-sm w-full mx-auto">
      <div className="w-11 h-11 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-[15px] font-semibold text-indigo-900 mb-2">{prompt?.title ?? 'Upgrade to unlock'}</h3>
      {prompt?.description && (
        <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">{prompt.description}</p>
      )}
      <a
        href={`/${companySlug}/admin/settings`}
        className="inline-flex flex-wrap items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
      >
        <span>Upgrade to {config.label}</span>
        {config?.price && <span className="opacity-75 font-normal">— ${config.price}/mo</span>}
      </a>
      <p className="text-[11px] text-slate-400 mt-3">Cancel anytime. No contracts.</p>
    </div>
  );
}