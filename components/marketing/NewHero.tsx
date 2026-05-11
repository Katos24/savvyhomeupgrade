'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-20 lg:pt-36 pb-14 lg:pb-28 overflow-hidden">

      {/* Subtle Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:pr-0 lg:pl-12">
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-12 items-center">

          {/* LEFT CONTENT */}
          <div className="flex flex-col space-y-6 lg:space-y-10 relative z-20">
            
            {/* 0. KICKER */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
                <Zap size={13} className="text-emerald-600" fill="currentColor" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-emerald-700" style={{ fontFamily: font }}>
                  No demo calls. No contracts.
                </span>
              </div>
            </motion.div>

            {/* 1. HEADLINE */}
            <h1
              className="text-slate-900 font-black tracking-tighter leading-[0.95] text-5xl sm:text-7xl lg:text-[7.5rem]"
              style={{ fontFamily: font }}
            >
              Capture. <br />
              Convert. <br />
              <span className="text-emerald-600">Run Work.</span>
            </h1>

            {/* 2. MOBILE IMAGE (Visible only on mobile, order 2) */}
            <div className="lg:hidden relative w-full pt-4">
              <Image
                src="/images/hero-image-laptop.webp"
                alt="Dashboard"
                width={1200}
                height={900}
                priority
                className="w-full h-auto object-contain rounded-2xl shadow-2xl border border-slate-100"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-slate-900/10 blur-2xl rounded-full" />
            </div>

            {/* 3. SUBHEAD */}
            <p className="text-slate-700 font-semibold leading-relaxed text-lg lg:text-xl max-w-md border-l-4 border-emerald-500 pl-5">
              Put your link on trucks, yard signs, cards — anywhere. 
              Leads hit your dashboard ready to quote, schedule, and close.
            </p>

            {/* 4. CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-wide shadow-xl transition-all cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight size={20} strokeWidth={3} />
                </motion.div>
              </Link>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <Check size={18} className="text-emerald-600" strokeWidth={3} />
                No credit card required
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT (Desktop Only Tilt & Fade) */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative"
          >
            <div 
              className="relative w-[125%] origin-left"
              style={{ perspective: '2000px' }}
            >
              <motion.div
                animate={{ rotateY: -18, rotateX: 4, rotateZ: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="rounded-3xl shadow-[0_50px_100px_rgba(15,23,42,0.2)] border border-slate-200/50 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 15%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)',
                }}
              >
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Dashboard Overview"
                  width={1800}
                  height={1300}
                  priority
                  className="w-full h-auto object-cover"
                />
              </motion.div>

            
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}