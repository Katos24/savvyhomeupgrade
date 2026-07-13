'use client';

import { motion, Variants } from 'framer-motion';
import { Link2, Network, LayoutGrid, CreditCard } from 'lucide-react';

const font = "'Nunito', sans-serif";

const STEPS = [
  { num: '01', icon: Link2, title: 'Get your link', desc: 'Sign up free. Your branded booking form is live in under 2 minutes.' },
  { num: '02', icon: Network, title: 'Share everywhere', desc: 'Google, social bios, or truck wraps. One link works for all of it.' },
  { num: '03', icon: LayoutGrid, title: 'Run from one card', desc: 'Leads land with photos and details. Schedule, quote, and assign in one place.' },
  { num: '04', icon: CreditCard, title: 'Get paid faster', desc: 'Send the invoice and a Stripe payment link goes with it automatically.' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function StepCard({ step }: { step: typeof STEPS[number] }) {
  const Icon = step.icon;
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-slate-900/60 backdrop-blur-md border-2 border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 shadow-xl hover:shadow-emerald-950/20 transition-colors flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Massive ambient background layout numbers */}
      <span className="absolute -bottom-6 -right-4 text-7xl font-black text-slate-800/20 font-mono tracking-tighter group-hover:text-emerald-500/10 transition-colors select-none pointer-events-none z-0">
        {step.num}
      </span>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5">
          <div className="w-10 h-10 flex items-center justify-center bg-slate-950/80 border-2 border-slate-800 group-hover:border-emerald-500/30 rounded-xl text-emerald-400 group-hover:text-emerald-300 transition-colors shadow-inner">
            <Icon size={18} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-slate-950 text-slate-500 font-mono tracking-widest border border-slate-800 group-hover:text-emerald-400 group-hover:border-emerald-900/50 transition-colors">
            STEP {step.num}
          </span>
        </div>
        <h3 className="text-white font-black text-base sm:text-lg mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">
          {step.title}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-bold">
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
      className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden border-t border-b border-white/5"
      style={{
        backgroundColor: '#0a0f1d',
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 40px),
          linear-gradient(180deg, #090d16, #04060b)
        `,
      }}
    >
      {/* Structural ambient lighting anchors */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20">
         
          <h2 
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]"
            style={{ fontFamily: font }}
          >
            Up and running <span className="text-emerald-400 underline decoration-emerald-500/30 decoration-wavy decoration-2 underline-offset-8">in minutes.</span>
          </h2>
        </div>

        {/* Unified Linear Step Track */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {STEPS.map((step) => (
            <StepCard key={step.num} step={step} />
          ))}
        </motion.div>
        
      </div>
    </section>
  );
}