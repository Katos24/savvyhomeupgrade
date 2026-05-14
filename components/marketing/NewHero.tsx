'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    /* 
       pt-32 (Mobile) and lg:pt-36 (Desktop) 
       This provides the necessary clearance for your navigation bar.
    */
    <section className="relative bg-white pt-32 lg:pt-36 pb-14 lg:pb-28 overflow-hidden">

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
            
            {/* 1. HEADLINE */}
            <h1
              className="text-slate-900 font-black tracking-tighter leading-[1.05] lg:leading-[0.95] text-5xl sm:text-7xl lg:text-[7.5rem]"
              style={{ fontFamily: font }}
            >
              Capture. <br />
              Convert. <br />
              <span className="text-emerald-600">Run Work.</span>
            </h1>

           {/* 2. MOBILE IMAGE */}
            <div className="lg:hidden relative w-full pt-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-50/50">
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Dashboard"
                  width={1200}
                  height={900}
                  priority
                  className="w-full h-auto object-contain mix-blend-multiply" 
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-slate-900/10 blur-xl rounded-full" />
            </div>

           {/* 3. SUBHEAD */}
            <p className="text-slate-700 font-semibold leading-relaxed text-lg lg:text-xl max-w-md border-l-4 border-emerald-500 pl-5">
              Stop playing phone tag and chasing dead ends. 
              Build a professional, lead-generating machine that 
              captures every job opportunity while you're busy in the field.
            </p>

            {/* 4. CTA SECTION - Updated with Demo Link */}
            <div className="flex flex-col space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Primary CTA */}
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-wide shadow-xl transition-all cursor-pointer text-center"
                  >
                    Get Started Free
                    <ArrowRight size={20} strokeWidth={3} />
                  </motion.div>
                </Link>

                {/* Secondary CTA (Demo) */}
                <Link href="/demo">
                  <motion.div
                    whileHover={{ scale: 1.03, backgroundColor: '#f8fafc' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 px-8 py-5 rounded-2xl font-black uppercase tracking-wide transition-all cursor-pointer text-center"
                  >
                    <Play size={18} fill="currentColor" className="text-emerald-600" />
                    Watch Demo
                  </motion.div>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <Check size={18} className="text-emerald-600" strokeWidth={3} />
                No credit card required
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative"
          >
           <div 
                className="relative w-[125%] origin-left -ml-32"
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