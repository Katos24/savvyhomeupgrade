'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

function Pricing() {
  const { ref, visible } = useFadeIn();

  const plans = [
    {
      name: 'Basic',
      price: 49.99,
      desc: 'Your entire digital storefront and job tracking in one link.',
      highlight: false,
      cta: 'Start 14-Day Free Trial',
      href: '/signup?plan=basic',
      features: [
        'Custom Booking Link (No Website Needed)',
        'Branded QR Code for Trucks & Signs',
        'Unlimited Lead Capture & Photo Uploads',
        'Visual Lead Board (Kanban & Table)',
        'Job Scheduling & Quote Builder',
        'Custom Pipeline Stages & Task Lists',
        'CSV Export for Bookkeeping',
        'Unlimited Team Members'
      ],
    },
    {
      name: 'Pro',
      price: 79.99,
      desc: 'The complete AI-powered office for contractors who want to scale.',
      highlight: true,
      cta: 'Go Pro — 14 Days Free',
      href: '/signup?plan=pro',
      features: [
        'Everything in Basic',
        'AI Quote Generator from Photos ✦',
        'AI Project Briefs for Crews ✦',
        '6AM Daily Digest Email Briefing ✦',
        'One-Click Email Sending (Quotes/Reminders)',
        'Full Email Outbox & Sent History',
        'Custom Email Templates & Branding',
        'AI Assistant — Ask Anything ✦'
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 bg-[#080C14] border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div
          ref={ref}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-12 sm:mb-20">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4 block">Simple Monthly Billing</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4 sm:mb-6">
              One job pays for<br/>
              <span className="text-slate-500">the whole year.</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg font-medium max-w-xl mx-auto">
              Choose the plan that fits your stage. No setup fees, no contracts, cancel anytime.
            </p>
          </div>

          {/* Plan Cards — always 2 columns */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`group rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 lg:p-10 border transition-all duration-500 relative ${
                  plan.highlight
                    ? 'bg-[#0F172A] border-blue-500 shadow-2xl shadow-blue-900/20'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 sm:-top-4 left-4 sm:left-10 bg-blue-600 text-white text-[7px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-xl whitespace-nowrap">
                    <span className="hidden sm:inline">Recommended for Growth</span>
                    <span className="sm:hidden">Most Popular</span>
                  </div>
                )}

                {/* Plan Name + Price */}
                <div className="mb-4 sm:mb-8 mt-2 sm:mt-0">
                  <h3 className={`text-[10px] sm:text-xl font-black uppercase tracking-widest ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-0.5 sm:gap-1 mt-1 sm:mt-2">
                    <span className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter">${plan.price}</span>
                    <span className="text-slate-500 font-bold text-xs sm:text-lg">/mo</span>
                  </div>
                </div>

                {/* Description — hidden on smallest screens */}
                <p className="hidden sm:block text-slate-400 font-medium mb-6 sm:mb-10 text-sm sm:text-lg leading-relaxed min-h-[60px]">
                  {plan.desc}
                </p>

                {/* CTA Button */}
                <Link
                  href={plan.href}
                  className={`block text-center w-full py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-sm tracking-wider sm:tracking-widest uppercase transition-all active:scale-95 mb-4 sm:mb-10 ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="hidden sm:inline">{plan.cta}</span>
                  <span className="sm:hidden">Try Free</span>
                </Link>

                {/* Features */}
                <div className="space-y-2 sm:space-y-4">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3 sm:mb-6 border-b border-white/5 pb-2">
                    What's included:
                  </p>
                  <ul className="grid gap-2 sm:gap-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 sm:gap-3">
                        <div className={`mt-0.5 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 ${
                          f.includes('✦') ? 'bg-violet-500/20' : plan.highlight ? 'bg-blue-500/20' : 'bg-white/10'
                        }`}>
                          <Check className={`w-2 h-2 sm:w-3 sm:h-3 ${
                            f.includes('✦') ? 'text-violet-400' : plan.highlight ? 'text-blue-400' : 'text-slate-400'
                          }`} strokeWidth={4} />
                        </div>
                        <span className={`text-[9px] sm:text-sm font-semibold tracking-tight leading-tight ${
                          f.includes('✦') ? 'text-violet-200' : 'text-slate-300'
                        }`}>
                          {f.replace(' ✦', '')}
                          {f.includes('✦') && (
                            <span className="ml-1 sm:ml-2 text-[7px] sm:text-[8px] bg-violet-500/20 text-violet-400 px-1 sm:px-1.5 py-0.5 rounded-md font-black border border-violet-500/30 uppercase tracking-tighter">
                              AI
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 sm:mt-20 flex flex-col items-center justify-center gap-6 sm:gap-8">
         
            
            <div className="flex items-center gap-6 sm:gap-10 opacity-30 grayscale pointer-events-none">
              <span className="text-white font-black tracking-tighter text-base sm:text-xl uppercase">Stripe Secure</span>
              <span className="text-white font-black tracking-tighter text-base sm:text-xl uppercase">256-Bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pricing;