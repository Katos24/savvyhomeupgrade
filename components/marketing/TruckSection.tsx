'use client';

import { motion } from 'framer-motion';
import { Clock, Mail, BarChart3, Send, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

const font = "'Nunito', sans-serif";

const FEATURES = [
  {
    icon: Mail,
    title: 'One-click emails',
    desc: 'Quotes, confirmations, payment reminders — all branded, all tracked.',
  },
  {
    icon: BarChart3,
    title: 'Full pipeline',
    desc: 'Every lead, every status, every dollar — one dashboard.',
  },
  {
    icon: Clock,
    title: '6 AM digest',
    desc: "Know your entire day before you start the truck.",
  },
];

export default function TruckSection() {
  return (
    <section className="relative bg-slate-950 py-14 sm:py-24 lg:py-32 overflow-hidden">

      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <p
            className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3"
            style={{ fontFamily: font }}
          >
            Built for the truck, not the office
          </p>
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl text-white leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            While you&apos;re on the road,{' '}
            <br className="hidden sm:block" />
            <span className="text-emerald-400">leads are rolling in.</span>
          </h2>
          <p
            className="text-sm sm:text-base text-white mt-4 max-w-xl mx-auto font-semibold"
            style={{ fontFamily: font }}
          >
            Your customers scan, fill out your branded form, and the lead
            lands on your dashboard — before you finish your coffee.
          </p>
        </motion.div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-14 items-start max-w-6xl mx-auto">

          {/* LEFT — Photo + features */}
          <div className="order-1 space-y-8 sm:space-y-10">

            {/* Contractor photo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  <Image
                    src="/images/morning-brief.webp"
                    alt="Contractor checking phone from truck"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Time badge */}
                  <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
                    <Clock size={12} className="text-emerald-400" />
                    <span
                      className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider"
                      style={{ fontFamily: font }}
                    >
                      6:14 AM · Between jobs
                    </span>
                  </div>

                  {/* Bottom quote */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
                    <p
                      className="text-white text-sm sm:text-base font-bold leading-snug"
                      style={{ fontFamily: font }}
                    >
                      &ldquo;I check my pipeline before I even grab coffee.
                      Every lead, every job — right from the truck.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-emerald-500/10 blur-2xl rounded-full" />
              </div>
            </motion.div>

            {/* Feature pills — horizontal on desktop, stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 sm:p-5 sm:text-center"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4
                      className="text-white text-xs sm:text-sm font-black mb-0.5"
                      style={{ fontFamily: font }}
                    >
                      {feature.title}
                    </h4>
                    <p
                      className="text-slate-500 text-[11px] sm:text-xs font-semibold leading-snug"
                      style={{ fontFamily: font }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA — desktop only (mobile CTA is below the form) */}
            <div className="hidden lg:block pt-2">
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-wide text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                  style={{ fontFamily: font }}
                >
                  Start Free — Takes 2 Minutes
                  <ArrowRight size={16} strokeWidth={3} />
                </motion.div>
              </Link>
            </div>
          </div>

          {/* RIGHT — Animated form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 flex flex-col items-center"
          >
            {/* Label above phone */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p
                className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"
                style={{ fontFamily: font }}
              >
                What your customer sees
              </p>
            </div>

            {/* Phone */}
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 blur-3xl opacity-15 rounded-[3rem] bg-orange-500 scale-90" />
              <FastDemoForm autoPlay />
            </div>

            {/* Caption below */}
            <p
              className="text-[10px] text-slate-600 font-bold text-center mt-4 max-w-[240px]"
              style={{ fontFamily: font }}
            >
              Customers scan your QR code or tap your link — branded form, photo upload, instant submission.
            </p>

            {/* Mobile CTA */}
            <div className="lg:hidden mt-6">
              <Link href="/signup">
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black uppercase tracking-wide text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                  style={{ fontFamily: font }}
                >
                  Start Free — Takes 2 Minutes
                  <ArrowRight size={14} strokeWidth={3} />
                </motion.div>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}