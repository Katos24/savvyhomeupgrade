'use client';

import { motion, Variants } from 'framer-motion';
import { Link2, Network, LayoutGrid, CreditCard } from 'lucide-react';

const font = "'Nunito', sans-serif";

const STEPS = [
  { num: '01', icon: Link2, title: 'Get your link', desc: 'Sign up free. Your branded booking form is live in under 2 minutes.' },
  { num: '02', icon: Network, title: 'Share everywhere', desc: 'Google, social bios, or truck wraps. One link works for all of it.' },
  { num: '03', icon: LayoutGrid, title: 'Run the job from one card', desc: 'Leads land with photos and details. Schedule, quote, and assign in one place.' },
  { num: '04', icon: CreditCard, title: 'Get paid', desc: 'Send the invoice and a Stripe payment link goes with it automatically.' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

function StepCard({ step }: { step: typeof STEPS[number] }) {
  const Icon = step.icon;
  return (
    <motion.div
      variants={cardVariants}
      className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-emerald-500/30 transition-all hover:bg-slate-900/80 flex flex-col justify-between relative group"
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="w-9 h-9 flex items-center justify-center bg-slate-950 border border-white/10 rounded-xl text-emerald-400 group-hover:text-emerald-300 transition-colors">
            <Icon size={16} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-slate-800 font-mono tracking-tight group-hover:text-slate-700 transition-colors select-none">
            {step.num}
          </span>
        </div>
        <h3 className="text-white font-black text-base sm:text-lg mb-1.5 tracking-tight">{step.title}</h3>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  return (
    <section 
      id="how-it-works" 
      className="relative bg-slate-950 py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-200/10 overflow-hidden"
    >
      {/* Subtle background tech matrix pattern instead of distracting vectors */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <span className="text-emerald-500 font-black text-[10px] sm:text-xs tracking-[0.2em] uppercase block mb-2">
            The Flow Framework
          </span>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
            style={{ fontFamily: font }}
          >
            Up and running <span className="text-emerald-500">in minutes.</span>
          </h2>
        </div>

        {/* 
          Responsive Adaptive Grid:
          - Mobile (xs): 1 column stack (compact and clear)
          - Tablet (sm): 2 columns 
          - Desktop (lg): 4 columns clean linear stream layout
        */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
        >
          {STEPS.map((step) => (
            <StepCard key={step.num} step={step} />
          ))}
        </motion.div>
        
      </div>
    </section>
  );
}