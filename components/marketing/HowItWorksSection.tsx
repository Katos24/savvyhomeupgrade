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
  },
  {
    num: '03',
    icon: LayoutGrid,
    title: 'Run every job from one board',
    desc: 'Leads land with photos and details. Quote, schedule, and track payments all from one card. Nothing in a text thread.',
  },
];
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};
export default function HowItWorksSection() {
  return (
    <>
      <div className="relative bg-slate-50 z-10 -mb-1">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full block" style={{ height: 48 }}>
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#0f172a" />
        </svg>
      </div>

      <section id="how-it-works" className="relative bg-slate-900 py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-14"
          >
            <p className="text-emerald-400 font-black text-[11px] uppercase tracking-[0.15em] mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight" style={{ fontFamily: font }}>
              Up and running <span className="text-emerald-400">in minutes.</span>
            </h2>
          </motion.div>

          {/* ── MOBILE: horizontal scrolling pill row ── */}
          <div className="flex md:hidden gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="flex-shrink-0 snap-start bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center gap-3 w-[72vw] max-w-[260px]"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 tracking-widest mb-0.5">{step.num}</p>
                    <p className="text-white font-black text-sm leading-tight" style={{ fontFamily: font }}>{step.title}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── DESKTOP: 3 column cards with desc ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="hidden md:grid grid-cols-3 gap-4"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 tracking-widest leading-none mb-1">{step.num}</p>
                      <h3 className="text-white font-bold text-base leading-tight" style={{ fontFamily: font }}>{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>

      <div className="relative bg-slate-950 z-10 -mt-1 rotate-180">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full block" style={{ height: 48 }}>
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#0f172a" />
        </svg>
      </div>
    </>
  );
}