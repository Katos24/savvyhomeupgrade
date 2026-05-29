'use client';

import Link from 'next/link';
import { Check, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

const plans = [
  {
    name: 'Starter',
    price: 0,
    desc: 'Perfect for individuals and new ventures getting started.',
    cta: 'Get Started Free',
    highlight: false,
    features: [
      'Custom Booking Form',
      'Branded QR Codes',
      'Unlimited Lead Capture',
      'Visual Lead Board',
    ],
  },
  {
    name: 'Basic',
    price: 49.99,
    desc: 'Your entire digital storefront and job tracking workflow in one linked system.',
    highlight: false,
    cta: 'Start 14-Day Trial',
    href: '/signup',
    features: [
      'Everything in Starter',
      'Job Scheduling',
      'Quote Builder',
      'CSV Data Export',
      'Unlimited Team Members',
    ],
  },
  {
    name: 'Pro',
    price: 79.99,
    desc: 'The complete AI-powered office engine built for teams ready to scale.',
    highlight: true,
    cta: 'Go Pro | 14 Days Free',
    href: '/signup',
    features: [
      'Everything in Basic',
      'One-Click Email Sending',
      'AI Quote Generator✦',
      'AI Project Briefs✦',
      'AI Business Assistant✦',
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 px-6 sm:px-8 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl text-white mb-4 font-black tracking-tight" style={{ fontFamily: font }}>
            One job pays for <br />
            <span className="text-emerald-400">the whole year.</span>
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto font-bold" style={{ fontFamily: font }}>
            No hidden setup fees, no rigid contracts, cancel online anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border flex flex-col justify-between ${
                plan.highlight
                  ? 'bg-slate-900/60 border-emerald-500/50 shadow-2xl shadow-emerald-900/10'
                  : 'bg-slate-900/30 border-white/[0.08]'
              } ${idx === 0 ? 'border-dashed' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-6 bg-emerald-500 text-slate-950 text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-md">
                  Recommended
                </div>
              )}

              <div>
                <h3 className={`text-[10px] uppercase tracking-widest font-black mb-2 ${plan.highlight ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {plan.name} Tier
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white tracking-tight">${plan.price}</span>
                  <span className="text-xs uppercase font-extrabold text-slate-500">/ mo</span>
                </div>
                <p className="text-xs text-slate-400 font-medium mb-6">{plan.desc}</p>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-3 text-xs text-slate-300">
                      <Check size={14} className={f.includes('✦') ? 'text-emerald-400' : 'text-sky-500'} />
                      {f.replace('✦', '')}
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`text-center py-3.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors ${
                    plan.highlight
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400'
                      : 'bg-white/[0.03] text-white border-white/[0.1] hover:bg-white/[0.08]'
                  }`}
                >
                  {plan.cta}
                </motion.div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}