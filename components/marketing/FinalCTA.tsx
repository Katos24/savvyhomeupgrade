'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

export default function FinalCTA() {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-8 text-center overflow-hidden bg-slate-950">
      
      {/* Structural Subtle Canvas Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      
      {/* Deep Luxury Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-sky-500/5 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        {/* Upper Micro Label */}
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-white/[0.03] rounded-full border border-white/[0.08]">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400" style={{ fontFamily: font }}>
            Instant Workspace Deployment
          </span>
        </div>

        <h2
          className="text-4xl sm:text-5xl lg:text-6xl text-white font-black mb-6 leading-[1.05] tracking-tight"
          style={{ fontFamily: font }}
        >
          Run your trade better. <br />
          <span className="text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.15)]">Never chase another invoice.</span>
        </h2>

        <p
          className="text-slate-400 text-sm sm:text-base mb-10 leading-relaxed max-w-md mx-auto font-medium"
          style={{ fontFamily: font }}
        >
          Your competitors are still writing line items on loose paper and texting quotes from personal devices. Run a tier above.
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-col items-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-colors cursor-pointer w-full sm:w-auto shadow-lg shadow-emerald-500/10 group"
              style={{ fontFamily: font }}
            >
              Start Building Free
              <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.div>
          </Link>
        </div>

        {/* Micro Footer Trust Points */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500 text-[11px] font-bold">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-slate-700" /> No Card Obligation
          </div>
          <span className="text-slate-800 hidden sm:inline">•</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-slate-700" /> Cancel Online Anytime
          </div>
          <span className="text-slate-800 hidden sm:inline">•</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-slate-700" /> 2-Minute Onboarding
          </div>
        </div>
        
      </motion.div>
    </section>
  );
}