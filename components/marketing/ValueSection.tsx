'use client';

import { motion } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

const PAIN_POINTS = [
  {
    pain: 'Driving 45 mins for dead-end leads',
    fix: 'See photos and budget before starting the truck.',
    accent: '#f97316',
  },
  {
    pain: 'Writing quotes from scratch every time',
    fix: 'One-click branded templates that close faster.',
    accent: '#10b981',
  },
  {
    pain: 'Forgetting to follow up on last week’s leads',
    fix: 'Automatic reminders on a visual status board.',
    accent: '#3b82f6',
  },
];

export default function ValueSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32 bg-slate-950">
      {/* Background Decor */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          
          {/* ── LEFT: IMAGE FRAME ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/10">
              <Image
                src="/images/get-paid.webp"
                alt="Contractor shaking hands with happy customer"
                width={800}
                height={1000}
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative element behind image */}
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full z-0" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border-t-4 border-l-4 border-white/5 rounded-tl-[3rem] z-0" />
          </motion.div>

          {/* ── RIGHT: HEADER & INTRO ── */}
          <div className="order-1 lg:order-2">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4"
              style={{ fontFamily: font }}
            >
              The Cost of Chaos
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-7xl text-white leading-[1.1] mb-8"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Time is money. <br />
              <span className="text-yellow-400">You&apos;re losing both.</span>
            </motion.h2>
            <p className="text-lg text-slate-400 font-semibold max-w-lg leading-relaxed" style={{ fontFamily: font }}>
              Every minute spent on "can you come take a look" for a bad-fit lead is a minute you aren&apos;t closing profitable jobs. 
              Stop the bleeding with a system built for the field.
            </p>
          </div>
        </div>

        {/* ── BOTTOM: THE SOLUTIONS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_POINTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white/[0.03] border border-white/[0.08] p-8 rounded-[2rem] hover:bg-white/[0.06] transition-all duration-300"
            >
              {/* Pain Indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20">
                  <X size={16} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500" style={{ fontFamily: font }}>
                  The Problem
                </span>
              </div>
              
              <h3 className="text-white text-lg font-black leading-snug mb-6" style={{ fontFamily: font }}>
                {item.pain}
              </h3>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500" style={{ fontFamily: font }}>
                    The Fix
                  </span>
                </div>
                <p className="text-slate-300 text-sm font-bold leading-relaxed" style={{ fontFamily: font }}>
                  {item.fix}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Area */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 py-12 border-t border-white/5 flex flex-col items-center text-center"
        >
          <p className="text-slate-500 font-bold mb-8 max-w-2xl text-sm sm:text-base" style={{ fontFamily: font }}>
            Stop chasing dead ends. Start closing deals before the truck even leaves your driveway.
          </p>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Check size={14} strokeWidth={3} />
            Built for serious trades
          </div>
        </motion.div>

      </div>
    </section>
  );
}