'use client';

import { motion, Variants } from 'framer-motion';
import { Link2, LayoutGrid } from 'lucide-react';

const font = "'Nunito', sans-serif";

const STEPS = [
  {
    num: '01',
    icon: Link2,
    title: 'Get your link',
    desc: 'Sign up free. Your branded booking form is live in under 2 minutes. No setup call. No demo.',
    tag: 'Instant',
    tagColor: 'bg-emerald-950/50 text-emerald-300',
  },
  {
    num: '02',
    icon: ({ size }: { size: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    title: 'Share it everywhere',
    desc: 'Google Business Profile, yard signs, truck wraps, social bio. One link works across all of it.',
    tag: 'Any surface',
    tagColor: 'bg-slate-700/50 text-slate-200',
  },
  {
    num: '03',
    icon: LayoutGrid,
    title: 'Run every job from one board',
    desc: 'Leads land with photos and details. Quote, schedule, and track payments all from one card. Nothing in a text thread.',
    tag: 'Zero chaos',
    tagColor: 'bg-emerald-950/50 text-emerald-300',
  },
];

// Added type annotation to resolve TS errors
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.55, 
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number] 
    } 
  },
};

export default function HowItWorksSection() {
  return (
    <>
      {/* Wave Transition */}
      <div className="relative bg-slate-50 z-10 -mb-1">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full block" style={{ height: 48 }}>
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#0f172a" />
        </svg>
      </div>

      <section className="relative bg-slate-900 py-16 md:py-24 overflow-hidden">
        {/* Mobile-friendly decorative elements */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="text-center mb-12 md:mb-20"
          >
            <p className="text-emerald-400 font-black text-[11px] uppercase tracking-[0.15em] mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight" style={{ fontFamily: font }}>
              Up and running <span className="text-emerald-400">in minutes.</span>
            </h2>
          </motion.div>

          {/* Grid optimized for mobile (1 col) to desktop (3 cols) */}
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-50px" }} 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={i} 
                  variants={cardVariants} 
                  className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 hover:border-emerald-500/50 transition-colors"
                >
                  <p className="text-[11px] font-black tracking-[0.15em] text-slate-500 mb-4" style={{ fontFamily: font }}>{step.num}</p>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 mb-5">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3" style={{ fontFamily: font }}>{step.title}</h3>
                  <p className="text-slate-300 font-medium text-[15px] leading-relaxed mb-5">{step.desc}</p>
                  <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${step.tagColor}`}>
                    {step.tag}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Bottom Wave */}
      <div className="relative bg-slate-950 z-10 -mt-1 rotate-180">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full block" style={{ height: 48 }}>
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#0f172a" />
        </svg>
      </div>
    </>
  );
}