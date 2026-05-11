'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-24 lg:pt-40 pb-14 lg:pb-28 overflow-hidden">

      {/* background grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />

      {/* bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-100/70 to-transparent" />

      <div className="relative z-10 max-w-[1350px] mx-auto px-5 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-10 items-center">

          {/* LEFT */}
          <div className="space-y-6 lg:space-y-10 flex flex-col">

            {/* 0. KICKER — anti-enterprise punch */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="order-[0]"
            >
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
                <Zap size={13} className="text-emerald-600" fill="currentColor" />
                <span
                  className="text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] text-emerald-700"
                  style={{ fontFamily: font }}
                >
                  No demo calls. No contracts. Just sign up.
                </span>
              </div>
            </motion.div>

            {/* 1. HEADLINE */}
            <h1
              className="
                order-1
                text-slate-900 font-black tracking-tight leading-[1.05]
                text-4xl sm:text-5xl lg:text-[6.8rem]
              "
              style={{ fontFamily: font }}
            >
              Capture. <br />
              Convert. <br />
              <span className="text-emerald-600">Run Work.</span>
            </h1>

            {/* 2. LAPTOP IMAGE (mobile only) */}
            <div className="order-2 lg:hidden relative w-full">
              <Image
                src="/images/hero-image-laptop.webp"
                alt="Dashboard"
                width={1600}
                height={1200}
                priority
                className="w-full h-auto object-contain rounded-xl drop-shadow-[0_40px_80px_rgba(15,23,42,0.15)]"
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-slate-900/10 blur-2xl rounded-full" />
            </div>

            {/* 3. SUBHEAD — speaks contractor */}
            <p
              className="
                order-3
                text-black font-semibold leading-relaxed
                text-base sm:text-lg lg:text-xl
                max-w-md border-l-4 border-emerald-500 pl-5
              "
            >
              Put your link on trucks, yard signs, cards — anywhere.
              Customers fill out your branded form with photos and details.
              Leads hit your dashboard ready to quote, schedule, and close.
            </p>

            {/* 4. CTA */}
            <div className="order-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">

              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wide shadow-lg transition-colors cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight size={18} strokeWidth={3} />
                </motion.div>
              </Link>

              <div className="flex flex-col gap-1.5 text-sm font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <Check size={15} className="text-emerald-600" strokeWidth={3} />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check size={15} className="text-emerald-600" strokeWidth={3} />
                  Live in under 5 minutes
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT (DESKTOP LAPTOP) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative hidden lg:flex justify-center items-center"
          >

            <div className="relative w-full max-w-[1000px]">

              <motion.div
                animate={{ rotateY: -9, rotateX: 3 }}
                transition={{ type: "tween", duration: 1 }}
                style={{ perspective: 1400 }}
              >
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Dashboard showing leads from QR code scans"
                  width={1600}
                  height={1200}
                  priority
                  className="w-full h-auto object-contain rounded-xl drop-shadow-[0_50px_90px_rgba(15,23,42,0.18)]"
                />
              </motion.div>

              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-10 bg-slate-900/10 blur-2xl rounded-full" />

              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="absolute top-6 right-6 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
              >
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                <div className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Live Intake Active
                </div>
              </motion.div>

            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}