'use client';
import Link from 'next/link';
import { ArrowRight, Camera, Zap, Shield, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

const VALUE_PROPS = [
  { icon: Camera, text: 'See the job site' },
  { icon: Zap, text: 'Instant leads' },
  { icon: Shield, text: 'No tire-kickers' },
  { icon: Star, text: 'Your branding' },
];

export default function NewHero() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-12 sm:pt-32 sm:pb-20">
      {/* Background stays subtle to keep focus on text */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, #000 1.2px, transparent 1.2px)', backgroundSize: '32px 32px' }} 
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 text-center">
        
        {/* Compact Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white mb-6 shadow-lg"
        >
          <Sparkles size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: font }}>
            Built for Contractors
          </span>
        </motion.div>

        {/* Headline - Tightened leading for mobile */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-slate-950 text-4xl sm:text-7xl mb-4 leading-[1.1] tracking-tight"
          style={{ fontFamily: font, fontWeight: 900 }}
        >
          Your Form.{' '}
          <span className="text-slate-500">Your Logo.</span>
          <br className="hidden sm:block" />
          <span className="text-emerald-600"> Your Questions.</span>
        </motion.h1>

        {/* Subtext - Shorter and bolder for quick scanning */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-800 mb-8 max-w-xl mx-auto font-bold"
          style={{ fontFamily: font }}
        >
          Capture job details and photos instantly with a branded toolkit that qualifies leads for you.
        </motion.p>

        {/* Value Props - 2x2 Grid on Mobile for height efficiency */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 max-w-2xl mx-auto">
          {VALUE_PROPS.map((prop, i) => (
            <div
              key={prop.text}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 bg-slate-50 rounded-xl border-2 border-slate-200"
            >
              <prop.icon size={14} className="text-emerald-600 shrink-0" strokeWidth={3} />
              <span className="text-[11px] sm:text-sm text-slate-900 font-extrabold" style={{ fontFamily: font }}>
                {prop.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs - Responsive sizing */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-8">
          <Link href="/signup" className="w-full sm:w-auto">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-3 bg-emerald-500 py-4 sm:px-10 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
            >
              <span className="text-lg text-white uppercase font-black" style={{ fontFamily: font }}>
                Start Free
              </span>
              <ArrowRight size={20} strokeWidth={3} className="text-white" />
            </motion.div>
          </Link>

          <Link href="/demo" className="w-full sm:w-auto">
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="py-4 sm:px-10 rounded-xl border-[3px] border-slate-900 text-slate-900 text-lg font-black uppercase bg-white flex items-center justify-center"
              style={{ fontFamily: font }}
            >
              Live Demo
            </motion.div>
          </Link>
        </div>

        {/* Trust line - Very compact */}
        <div
          className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4"
          style={{ fontFamily: font }}
        >
          <span>No Credit Card</span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span>5 Min Setup</span>
        </div>
      </div>
    </section>
  );
}