'use client';

import { motion } from 'framer-motion';
import { ArrowRight, User, MapPin, Phone, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-10 lg:pt-40 pb-10 lg:pb-24 overflow-hidden">

      {/* Subtle background */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* soft ground shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 lg:h-60 bg-gradient-to-t from-slate-100/60 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-5 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-10 items-center">

          {/* LEFT */}
          <div className="space-y-6 lg:space-y-10 text-left">

            <h1
              className="text-slate-900 text-5xl sm:text-6xl lg:text-[7rem] leading-[1.05] tracking-tight font-black"
              style={{ fontFamily: font }}
            >
              Capture. <br />
              Convert. <br />
              <span className="text-emerald-500">Run Work.</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg lg:text-xl font-bold max-w-md leading-relaxed border-l-4 border-slate-100 pl-5">
              Turn any scan or link into a structured job instantly.
              Customers submit through your branded QR form while your team manages everything.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/signup">
                <div className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase shadow-xl transition-all">
                  Get Started Free
                  <ArrowRight size={18} strokeWidth={3} />
                </div>
              </Link>

              <div className="hidden sm:flex items-center text-sm font-bold text-slate-500">
                No setup • Cancel anytime
              </div>
            </div>

          </div>

          {/* RIGHT — LAPTOP FOCUSED */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center items-center"
          >

            <div className="relative w-full max-w-[900px]">

              {/* laptop */}
              <motion.div
                animate={{ rotateY: -10, rotateX: 3 }}
                className="transition-transform duration-700"
                style={{ perspective: 1400 }}
              >
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Dashboard"
                  width={1600}
                  height={1200}
                  priority
                  className="w-full h-auto object-contain drop-shadow-[0_40px_90px_rgba(15,23,42,0.15)] rounded-xl"
                />
              </motion.div>

              {/* glow */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-slate-900/10 blur-3xl rounded-full" />

              {/* small floating “live lead” badge */}
              <div className="hidden lg:flex absolute top-6 right-6 bg-white border border-slate-100 shadow-lg rounded-2xl px-4 py-3 items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Live Lead Flow
                </p>
              </div>

            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}