'use client';

import { motion } from 'framer-motion';
import { ArrowRight, QrCode, Play, Mail, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-28 sm:pt-40 pb-0 overflow-hidden">
      
      {/* subtle background texture */}
      <div
        className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] gap-14 lg:gap-10 items-center">

          {/* LEFT */}
          <div className="flex flex-col text-left">

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-6 w-1 bg-emerald-500 rounded-full" />
              <span
                className="text-[11px] uppercase font-black tracking-[0.25em] text-slate-400"
                style={{ fontFamily: font }}
              >
                QR → Lead → Job Workflow
              </span>
            </motion.div>

            {/* HERO TITLE */}
            <h1
              className="text-slate-950 text-4xl sm:text-6xl lg:text-[6.8rem] leading-[0.9] tracking-[-0.04em] mb-8"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Capture. <br />
              Convert. <br />
              <span className="text-emerald-500">Run Work.</span>
            </h1>

            {/* SUBHEAD */}
            <div className="max-w-xl space-y-8">
              <p
                className="text-slate-600 text-base sm:text-lg lg:text-xl font-bold leading-relaxed border-l-4 border-slate-100 pl-5"
                style={{ fontFamily: font }}
              >
                Turn any scan or link into a structured job instantly.
                Customers submit through your branded QR form while your team manages everything—
                leads, quotes, scheduling, payments, and updates—in one dashboard.
              </p>

              {/* FEATURE STRIP */}
              <p
                className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold"
                style={{ fontFamily: font }}
              >
                Custom Forms • Pipelines • One-Click Emails • CSV Export • Daily Digest
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-2">

                <Link href="/signup" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase shadow-xl shadow-slate-200"
                    style={{ fontFamily: font }}
                  >
                    Get Your QR System
                    <ArrowRight size={18} strokeWidth={3} />
                  </motion.div>
                </Link>

                <Link href="/demo" className="w-full sm:w-auto group">
                  <div
                    className="flex items-center justify-center gap-3 text-slate-900 font-black uppercase text-[11px] tracking-[0.15em]"
                    style={{ fontFamily: font }}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <Play size={12} fill="currentColor" />
                    </div>
                    Watch Demo
                  </div>
                </Link>

              </div>
            </div>
          </div>

          {/* RIGHT - 3D IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            <div className="relative w-full flex justify-center lg:justify-end">

              <div
                className="w-full max-w-[700px] transition-transform duration-700"
                style={{
                  transform:
                    'perspective(1200px) rotateY(-14deg) rotateX(6deg)',
                }}
              >
                <Image
                  src="/images/hero-image.webp"
                  alt="Lead2Project Dashboard"
                  width={1600}
                  height={1200}
                  priority
                  className="w-full h-auto rounded-2xl drop-shadow-2xl"
                />
              </div>

              {/* glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-50/40 rounded-full blur-[120px] -z-10" />
            </div>
          </motion.div>

        </div>
      </div>

      

    </section>
  );
}