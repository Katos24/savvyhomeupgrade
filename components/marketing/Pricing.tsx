'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

const plans = [
  {
    name: 'Free',
    price: 0,
    desc: 'See your leads come in. Upgrade when you\'re ready.',
    highlight: false,
    cta: 'Get Started Free',
    href: '/signup',
    borderStyle: 'border-dashed',
    features: [
      'Booking link and QR code',
      'Basic lead form',
      'Lead dashboard',
      'Table and calendar view',
      'Create leads manually',
    ],
  },
  {
    name: 'Basic',
    price: 49.99,
    desc: 'Full job management for growing crews.',
    highlight: false,
    cta: 'Start 14-Day Free Trial',
    href: '/signup',
    borderStyle: '',
    features: [
      'Everything in Free',
      'Custom booking form and branding',
      'Quotes, scheduling, and payments',
      'QuickBooks and CSV export',
      'Receipts and financials page',
      'Unlimited team members',
    ],
  },
  {
    name: 'Pro',
    price: 79.99,
    desc: 'Automation and AI for serious contractors.',
    highlight: true,
    cta: 'Go Pro | 14 Days Free',
    href: '/signup',
    borderStyle: '',
    features: [
      'Everything in Basic',
      'One-click quote and schedule emails',
      'Payment reminder emails',
      'Full email history and templates',
      '6AM Daily Digest',
      'AI Quote Generator✦',
      'AI Project Briefs✦',
      'Smart AI Assistant✦',
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 px-6 sm:px-8 overflow-hidden bg-slate-950">
      {/* ... keeping your background elements as they were ... */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-20 left-20 w-96 h-96 bg-sky-500 rounded-full blur-3xl opacity-5" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-5" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl text-white mb-4 font-black tracking-tight leading-[1.05]" style={{ fontFamily: font }}>
              One job pays for <br />
              <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.15)]">the whole year.</span>
            </h2>
            <p className="text-slate-400 max-w-sm mx-auto text-sm sm:text-base font-bold leading-relaxed" style={{ fontFamily: font }}>
              Cancel anytime. No hidden setup fees. Just better business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, idx) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 sm:p-8 border flex flex-col justify-between ${plan.highlight ? 'bg-slate-900/60 border-emerald-500/50 shadow-xl shadow-black/20' : `bg-slate-900/30 border-white/[0.06] ${plan.borderStyle}`}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-6 bg-emerald-500 text-slate-950 text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-md" style={{ fontFamily: font }}>
                    Most Popular
                  </div>
                )}
                
                <div>
                  <div className="mb-6 border-b border-white/[0.05] pb-6">
                    <h3 className={`text-[10px] uppercase tracking-widest font-black mb-1 ${plan.highlight ? 'text-emerald-400' : 'text-slate-500'}`} style={{ fontFamily: font }}>
                      {plan.name} Tier
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: font }}>${plan.price}</span>
                      <span className="text-xs uppercase font-extrabold text-slate-500" style={{ fontFamily: font }}>/ mo</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-3" style={{ fontFamily: font }}>{plan.desc}</p>
                  </div>

                  <div className="space-y-3.5 mb-8">
                    {plan.features.map(f => {
                      const isAI = f.includes('✦');
                      const label = f.replace('✦', '').trim();
                      return (
                        <div key={f} className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${isAI ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : plan.highlight ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/[0.08] text-slate-500'}`}>
                            <Check size={10} strokeWidth={3} />
                          </div>
                          <span className={`text-xs font-bold ${isAI ? 'text-emerald-400' : 'text-slate-300'}`} style={{ fontFamily: font }}>
                            {label}
                            {isAI && <span className="ml-1.5 text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase tracking-wide font-black">AI</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Link href={plan.href}>
                  <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} className={`block text-center w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border ${plan.highlight ? 'bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400' : 'bg-white/[0.02] text-white border-white/[0.08] hover:bg-white/[0.05]'}`} style={{ fontFamily: font }}>
                    {plan.cta}
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}