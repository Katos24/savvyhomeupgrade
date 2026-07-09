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
    <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0f172a] shadow-2xl">
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
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
            style={{
              background: isPro
                ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))'
                : 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.1))',
            }}
          >
            <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 ${isPro ? 'text-violet-400' : 'text-blue-400'}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/10">
                Free Plan
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/10"
                style={{
                  backgroundColor: isPro ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)',
                  color: isPro ? '#a78bfa' : '#60a5fa',
                }}
              >
                {planLabel} — {price}
              </span>
            </div>

            <p className="text-sm sm:text-[15px] font-semibold text-white leading-relaxed">
              {message}
            </p>
            <p className="text-xs text-white mt-2">
              Go to <span className="text-blue-400 font-semibold">Settings</span> to upgrade your plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}