'use client';
import Link from 'next/link';
import { Check, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

const plans = [
  {
    name: 'Basic',
    price: 49.99,
    desc: 'Your entire digital storefront and job tracking in one link.',
    highlight: false,
    cta: 'Start 14-Day Free Trial',
    href: '/signup',
    features: [
      'Custom Booking Link',
      'Branded QR Codes',
      'Unlimited Lead Capture',
      'Visual Lead Board',
      'Job Scheduling',
      'Quote Builder',
      'CSV Data Export',
      'Unlimited Team Members',
    ],
  },
  {
    name: 'Pro',
    price: 79.99,
    desc: 'The complete AI-powered office for contractors who want to scale.',
    highlight: true,
    cta: 'Go Pro | 14 Days Free',
    href: '/signup',
    features: [
      'Everything in Basic',
      'One-Click Email Sending',
      'Full Email Sent History',
      'Custom Email Branding',
      'AI Quote Generator✦',
      'AI Project Briefs✦',
      '6AM Daily Digest✦',
      'AI Business Assistant✦',
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative py-16 sm:py-24 px-5 sm:px-6 overflow-hidden bg-slate-950"
    >
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-10" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              One Job Pays for
              <br />
              <span className="text-emerald-500">The Whole Year.</span>
            </h2>
            <p
              className="text-slate-400 max-w-md mx-auto text-base sm:text-lg leading-relaxed"
              style={{ fontFamily: font, fontWeight: 700 }}
            >
              No setup fees, no contracts, cancel anytime.
            </p>
          </div>

          {/* Free tier banner */}
          <div className="max-w-4xl mx-auto mb-8 sm:mb-10">
            <Link href="/signup?plan=free">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4 sm:py-5 rounded-2xl border-3 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                style={{ borderWidth: '3px' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 border-2 border-blue-400"
                  >
                    <Zap size={18} className="text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p
                      className="text-white text-base sm:text-lg leading-none mb-0.5"
                      style={{ fontFamily: font, fontWeight: 900 }}
                    >
                      Start Free
                    </p>
                    <p className="text-slate-400 text-xs sm:text-sm" style={{ fontFamily: font, fontWeight: 600 }}>
                      QR codes, lead dashboard & booking link — $0
                    </p>
                  </div>
                </div>
                <span
                  className="hidden sm:block shrink-0 px-4 py-2 rounded-full text-xs text-blue-300 bg-blue-500/20 uppercase tracking-wider"
                  style={{ fontFamily: font, fontWeight: 900 }}
                >
                  Sign Up Free →
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto items-stretch">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-4 flex flex-col ${
                  plan.highlight
                    ? 'bg-white border-emerald-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]'
                    : 'bg-slate-50 border-slate-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)]'
                }`}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-full whitespace-nowrap border-2 border-emerald-400"
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    Recommended for Growth
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-xs uppercase tracking-widest mb-2 ${plan.highlight ? 'text-emerald-500' : 'text-slate-400'}`}
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    {plan.name} Plan
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl sm:text-5xl ${plan.highlight ? 'text-slate-900' : 'text-slate-700'}`}
                      style={{ fontFamily: font, fontWeight: 900 }}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={`text-base uppercase ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}
                      style={{ fontFamily: font, fontWeight: 800 }}
                    >
                      /mo
                    </span>
                  </div>
                </div>

                <Link href={plan.href}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`block text-center w-full py-4 rounded-xl text-sm uppercase mb-8 border-3 ${
                      plan.highlight
                        ? 'bg-emerald-500 text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                    style={{ fontFamily: font, fontWeight: 900, borderWidth: '3px' }}
                  >
                    {plan.cta}
                  </motion.div>
                </Link>

                <div className="space-y-3.5 flex-1">
                  <p
                    className="text-[10px] uppercase tracking-widest pb-3 border-b-2 text-slate-400 border-slate-200"
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    Everything you need:
                  </p>
                  {plan.features.map(f => {
                    const isAI = f.includes('✦');
                    const label = f.replace('✦', '').trim();
                    return (
                      <div key={f} className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 ${
                            isAI
                              ? 'bg-emerald-500 border-emerald-400'
                              : plan.highlight
                              ? 'bg-emerald-500 border-emerald-400'
                              : 'bg-slate-300 border-slate-200'
                          }`}
                        >
                          <Check size={11} strokeWidth={4} className="text-white" />
                        </div>
                        <span
                          className={`text-sm ${
                            isAI ? 'text-emerald-600' : plan.highlight ? 'text-slate-700' : 'text-slate-600'
                          }`}
                          style={{ fontFamily: font, fontWeight: isAI ? 800 : 700 }}
                        >
                          {label}
                          {isAI && (
                            <span
                              className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 uppercase tracking-wider"
                              style={{ fontFamily: font, fontWeight: 900 }}
                            >
                              AI
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex items-center justify-center gap-8 sm:gap-12">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck size={18} />
              <span className="text-xs uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 800 }}>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Zap size={18} />
              <span className="text-xs uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 800 }}>Instant Access</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}