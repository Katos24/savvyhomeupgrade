'use client';

import { motion, Variants } from 'framer-motion';
import { Link2, Network, LayoutGrid, CreditCard } from 'lucide-react';

const STEPS = [
  { num: '01', icon: Link2, title: 'Get your link', desc: 'Sign up free. Your branded booking form is live in under 2 minutes.' },
  { num: '02', icon: Network, title: 'Share everywhere', desc: 'Google, social bios, or truck wraps. One link works for all of it.' },
  { num: '03', icon: LayoutGrid, title: 'Run the job from one card', desc: 'Leads land with photos and details. Schedule, quote, and assign in one place.' },
  { num: '04', icon: CreditCard, title: 'Get paid', desc: 'Send the invoice and a Stripe payment link goes with it automatically.' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function StepCard({ step }: { step: typeof STEPS[number] }) {
  const Icon = step.icon;
  return (
    <motion.div
      variants={cardVariants}
      className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 md:p-6 hover:border-emerald-500/50 transition-all hover:bg-slate-800 flex flex-col"
    >
      <div className="flex justify-between items-start mb-5">
        <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-xl text-emerald-400">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className="text-xl md:text-2xl font-black text-slate-700 font-mono leading-none">
          {step.num}
        </span>
      </div>
      <h3 className="text-white font-bold text-base md:text-lg mb-2">{step.title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        {step.desc}
      </p>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  return (
    <>
      {/* Top SVG Divider */}
      <div className="relative bg-slate-50 z-10 -mb-1">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full block h-8 md:h-12">
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#0f172a" />
        </svg>
      </div>

      <section id="how-it-works" className="relative bg-slate-900 py-16 md:py-24 px-4 sm:px-6 overflow-hidden">
        {/* Subtle Background Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="text-emerald-400 font-bold text-[11px] md:text-xs tracking-[0.15em] uppercase block mb-3">
              Simple flow
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Up and running <span className="text-emerald-500">in minutes.</span>
            </h2>
          </motion.div>

          {/* 
            MOBILE: 1 Column (Stacks neatly)
            TABLET: 2 Columns
            DESKTOP: 4 Columns
          */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
          >
            {STEPS.map((step) => (
              <StepCard key={step.num} step={step} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom SVG Divider */}
      <div className="relative bg-slate-950 z-10 -mt-1 rotate-180">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full block h-8 md:h-12">
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#0f172a" />
        </svg>
      </div>
    </>
  );
}