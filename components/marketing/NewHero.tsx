'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, User, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-28 sm:pt-40 pb-10 overflow-hidden">

      {/* background texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-[48%_52%] gap-10 items-start">

          {/* RIGHT IMAGE FIRST ON MOBILE */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">

            {/* glow */}
            <div className="absolute inset-0 bg-emerald-100/40 blur-[120px] rounded-full" />

            {/* LAPTOP */}
            <div
              className="relative w-full max-w-[680px] lg:transform"
              style={{
                transform:
                  'perspective(1200px) rotateY(-14deg) rotateX(6deg)',
              }}
            >
              <Image
                src="/images/hero-image-laptop.webp"
                alt="Lead2Project Dashboard"
                width={1600}
                height={1200}
                priority
                className="w-full h-auto rounded-2xl drop-shadow-2xl"
              />
            </div>

            {/* 📱 DESKTOP PHONE MOCK (ONLY LG+) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block absolute right-[-10px] bottom-[20px] w-[140px] sm:w-[160px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-900 px-3 py-2 text-white text-[9px] font-bold">
                New Lead · Leak Detection
              </div>

              <div className="p-2.5 space-y-2">

                <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                  <User size={10} /> Jennifer L
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                  <Phone size={10} /> (631) 555-0192
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                  <Mail size={10} /> jennifer@email.com
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                  <MapPin size={10} /> Holbrook, NY
                </div>

                <div className="text-[9px] text-slate-500 leading-snug pt-1">
                  Possible slab leak detected. Water meter running overnight.
                </div>

                <div className="mt-2 bg-emerald-500 text-white text-[9px] font-bold text-center py-1.5 rounded-lg">
                  Submit Request
                </div>

              </div>
            </motion.div>

          </div>

          {/* LEFT TEXT SECOND ON MOBILE */}
          <div className="flex flex-col order-2 lg:order-1">

            {/* HEADER STRIP */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-6 w-1 bg-emerald-500 rounded-full" />
              <span
                className="text-[11px] uppercase font-black tracking-[0.25em] text-slate-400"
                style={{ fontFamily: font }}
              >
                QR → Lead → Job Workflow
              </span>
            </motion.div>

            {/* TITLE */}
            <h1
              className="text-slate-950 text-4xl sm:text-6xl lg:text-[6.8rem] leading-[0.9] tracking-[-0.04em] mb-6"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Capture. <br />
              Convert. <br />
              <span className="text-emerald-500">Run Work.</span>
            </h1>

            {/* SUBTEXT */}
            <p
              className="text-slate-600 text-base sm:text-lg lg:text-xl font-bold leading-relaxed border-l-4 border-slate-100 pl-5 mb-6"
              style={{ fontFamily: font }}
            >
              Turn any scan or link into a structured job instantly.
              Customers submit through your branded QR form while your team manages everything.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">

              <Link href="/signup" className="w-full sm:w-auto">
                <div
                  className="flex items-center justify-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase shadow-xl"
                  style={{ fontFamily: font }}
                >
                  Get Your QR System
                  <ArrowRight size={18} />
                </div>
              </Link>

              <Link href="/demo" className="w-full sm:w-auto">
                <div
                  className="flex items-center justify-center gap-3 text-slate-900 font-black uppercase text-[11px]"
                  style={{ fontFamily: font }}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Play size={12} />
                  </div>
                  Watch Demo
                </div>
              </Link>

            </div>

            {/* FEATURE ROW */}
            <p
              className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold"
              style={{ fontFamily: font }}
            >
              Custom Forms • Pipelines • One-Click Emails • CSV Export • Daily Digest
            </p>

            {/* 📱 MOBILE PHONE MOCK (STACKED BELOW ON SMALL SCREENS) */}
            <div className="lg:hidden mt-8 w-[180px] mx-auto bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">

              <div className="bg-slate-900 px-3 py-2 text-white text-[9px] font-bold">
                New Lead · Leak Detection
              </div>

              <div className="p-3 space-y-2">

                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <User size={10} /> Jennifer L
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Phone size={10} /> (631) 555-0192
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Mail size={10} /> jennifer@email.com
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <MapPin size={10} /> Holbrook, NY
                </div>

                <div className="text-[10px] text-slate-500 leading-snug pt-1">
                  Possible slab leak detected. Water meter running overnight.
                </div>

                <div className="mt-2 bg-emerald-500 text-white text-[10px] font-bold text-center py-1.5 rounded-lg">
                  Submit Request
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}