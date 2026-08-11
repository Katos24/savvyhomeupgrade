'use client';

import { Sparkles, ArrowRight } from 'lucide-react';

type Props = {
  planLabel: string;
  price: string;
  message: string;
  companySlug: string;
};

export default function SettingsUpgradeBanner({ planLabel, price, message, companySlug }: Props) {
  const isPro = planLabel === 'Pro';

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl">
      <div
        className="h-1.5"
        style={{
          background: isPro
            ? 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)'
            : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
        }}
      />
      <div className="px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 sm:h-12 sm:w-12"
            style={{
              background: isPro
                ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))'
                : 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.1))',
            }}
          >
            <Sparkles className={`h-5 w-5 sm:h-6 sm:w-6 ${isPro ? 'text-violet-400' : 'text-blue-400'}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                Free Plan
              </span>
              <ArrowRight className="h-3 w-3 text-slate-600" />
              <span
                className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: isPro ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)',
                  color: isPro ? '#a78bfa' : '#60a5fa',
                }}
              >
                {planLabel} — {price}
              </span>
            </div>

            <p className="text-sm font-semibold leading-relaxed text-white sm:text-[15px]">
              {message}
            </p>

            <a
         href={`/${companySlug}/home?section=billing`}
className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
>
              Go to Billing to upgrade your plan
<ArrowRight className="h-3 w-3" />
</a>
          </div>
        </div>
      </div>
    </div>
  );
}