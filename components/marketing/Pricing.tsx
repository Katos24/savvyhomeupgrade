'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

const plans = [
  {
    name: 'Basic',
    price: 49.99,
    desc: 'Your entire digital storefront and job tracking in one link.',
    highlight: false,
    cta: 'Start 14-Day Free Trial',
    ctaShort: 'Try Free',
    href: '/signup?plan=basic',
    features: [
      'Custom Booking Link (No Website Needed)',
      'Branded QR Code for Trucks & Signs',
      'Unlimited Lead Capture & Photo Uploads',
      'Visual Lead Board (Kanban & Table)',
      'Job Scheduling & Quote Builder',
      'Custom Pipeline Stages & Task Lists',
      'CSV Export for Bookkeeping',
      'Unlimited Team Members',
    ],
  },
  {
    name: 'Pro',
    price: 79.99,
    desc: 'The complete AI-powered office for contractors who want to scale.',
    highlight: true,
    cta: 'Go Pro — 14 Days Free',
    ctaShort: 'Try Free',
    href: '/signup?plan=pro',
    features: [
      'Everything in Basic',
      'One-Click Email Sending (Quotes/Reminders)',
      'Full Email Outbox & Sent History',
      'Custom Email Templates & Branding',
      'AI Quote Generator from Photos✦',
      'AI Project Briefs for Crews✦',
      '6AM Daily Digest Email Briefing✦',
      'AI Assistant — Ask Anything✦',
    ],
  },
];

export default function Pricing() {
  const { ref, visible } = useFadeIn();

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#0F1F3D] border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-5xl mx-auto relative">

        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
          style={{ background: '#1a6645' }} />

        <div
          ref={ref}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: '#4ade80' }}>
              Simple Monthly Billing
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              One job pays for<br />
              <span className="text-slate-500">the whole year.</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-md mx-auto">
              No setup fees, no contracts, cancel anytime.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-4xl mx-auto items-start">
            {plans.map(plan => (
              <div
                key={plan.name}
                className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 border transition-all duration-300"
                style={plan.highlight
                  ? { background: '#fff', borderColor: '#e2e8f0', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }
                }
              >
                {plan.highlight && (
                  <div className="absolute -top-3 sm:-top-4 left-4 sm:left-8 text-white text-[7px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: '#1a6645' }}>
                    <span className="hidden sm:inline">Recommended for Growth</span>
                    <span className="sm:hidden">Most Popular</span>
                  </div>
                )}

                {/* Name + Price */}
                <div className="mb-4 sm:mb-6 mt-2 sm:mt-0">
                  <h3 className={`text-[10px] sm:text-sm font-black uppercase tracking-widest mb-1 ${plan.highlight ? 'text-[#1a6645]' : 'text-slate-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-0.5 sm:gap-1">
                    <span className={`text-3xl sm:text-5xl font-black tracking-tight ${plan.highlight ? 'text-slate-900' : 'text-white'}`}>
                      ${plan.price}
                    </span>
                    <span className={`font-bold text-xs sm:text-base ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>
                  </div>
                </div>

                {/* Desc */}
                <p className={`hidden sm:block text-sm font-medium mb-6 leading-relaxed ${plan.highlight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {plan.desc}
                </p>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className="block text-center w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-sm uppercase tracking-wider transition-all active:scale-95 mb-4 sm:mb-8"
                  style={plan.highlight
                    ? { background: '#0F1F3D', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }
                  }
                >
                  <span className="hidden sm:inline">{plan.cta}</span>
                  <span className="sm:hidden">{plan.ctaShort}</span>
                </Link>

                {/* Features */}
                <div className="space-y-2 sm:space-y-3">
                  <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest pb-2 border-b ${plan.highlight ? 'text-slate-400 border-slate-100' : 'text-slate-600 border-white/5'}`}>
                    What's included:
                  </p>
                  {plan.features.map(f => {
                    const isAI = f.includes('✦');
                    const label = f.replace('✦', '').trim();
                    return (
                      <div key={f} className="flex items-start gap-1.5 sm:gap-2.5">
                        <div className={`mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isAI ? 'bg-violet-100' : plan.highlight ? 'bg-[#1a6645]/10' : 'bg-white/10'
                        }`}>
                          <Check size={8} strokeWidth={3} className={isAI ? 'text-violet-500' : plan.highlight ? 'text-[#1a6645]' : 'text-slate-400'} />
                        </div>
                        <span className={`text-[9px] sm:text-[13px] font-semibold leading-tight ${
                          isAI ? (plan.highlight ? 'text-violet-600' : 'text-violet-300') : plan.highlight ? 'text-slate-700' : 'text-slate-300'
                        }`}>
                          {label}
                          {isAI && (
                            <span className={`ml-1 text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-tight ${
                              plan.highlight ? 'bg-violet-100 text-violet-600' : 'bg-violet-500/20 text-violet-300'
                            }`}>AI</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div className="mt-10 flex items-center justify-center gap-8 opacity-25 pointer-events-none">
            <span className="text-white font-black tracking-tight text-sm uppercase">Stripe Secure</span>
            <span className="text-white font-black tracking-tight text-sm uppercase">256-Bit SSL</span>
          </div>

        </div>
      </div>
    </section>
  );
}