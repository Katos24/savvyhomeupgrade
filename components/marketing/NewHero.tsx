'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-12 lg:pt-40 pb-14 lg:pb-28 overflow-hidden">

      {/* subtle industrial grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />

      {/* ground shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-100/70 to-transparent" />

      <div className="relative z-10 max-w-[1350px] mx-auto px-5 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-10 items-center">

          {/* LEFT */}
          <div className="space-y-7 lg:space-y-10">

            <h1
              className="text-slate-900 text-5xl sm:text-6xl lg:text-[6.8rem] leading-[1.05] font-black tracking-tight"
              style={{ fontFamily: font }}
            >
              Capture. <br />
              Convert. <br />
              <span className="text-emerald-600">Run Work.</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg lg:text-xl font-semibold max-w-md leading-relaxed border-l-4 border-slate-200 pl-5">
              Turn any scan or link into structured jobs instantly.
              No spreadsheets. No missed leads. Just clean intake → live dashboard.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">

              <Link href="/signup">
                <div className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wide shadow-lg transition-all">
                  Get Started Free
                  <ArrowRight size={18} strokeWidth={3} />
                </div>
              </Link>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Check size={16} className="text-emerald-600" />
                No credit card • Setup in minutes
              </div>

            </div>

          </div>

          {/* RIGHT — LAPTOP (HERO FOCUS) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center items-center"
          >

            <div className="relative w-full max-w-[900px]">

              {/* laptop */}
              <motion.div
                animate={{ rotateY: -9, rotateX: 3 }}
                transition={{ type: "tween", duration: 1 }}
                className="transition-transform"
                style={{ perspective: 1400 }}
              >
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Dashboard"
                  width={1600}
                  height={1200}
                  priority
                  className="w-full h-auto object-contain rounded-xl drop-shadow-[0_50px_90px_rgba(15,23,42,0.18)]"
                />
              </motion.div>

              {/* grounded shadow */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-10 bg-slate-900/10 blur-2xl rounded-full" />

              {/* subtle status badge (NOT flashy AI vibe) */}
              <div className="hidden lg:flex absolute top-6 right-6 bg-white border border-slate-200 rounded-xl px-4 py-3 items-center gap-3 shadow-sm">

                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />

                <div className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Live Intake Active
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}