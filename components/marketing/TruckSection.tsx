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
    <section id="how-it-works" className="relative bg-slate-950 py-14 sm:py-24 lg:py-32 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Aesthetic Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-20"
        >
          <p
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3"
            style={{ fontFamily: font }}
          >
            Built for the truck, not the office
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.1] px-2"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            While you&apos;re on the road,{' '}
            <br className="hidden sm:block" />
            <span className="text-emerald-400">leads are rolling in.</span>
          </h2>
          <p
            className="text-sm sm:text-base text-slate-300 mt-6 max-w-xl mx-auto font-medium leading-relaxed"
            style={{ fontFamily: font }}
          >
            Your customers scan, fill out your branded form, and the lead
            lands on your dashboard — before you finish your coffee.
          </p>
        </motion.div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          
          {/* LEFT COLUMN: Image + Features */}
          {/* Use 'order-2 lg:order-1' to push this below the form on mobile */}
          <div className="order-2 lg:order-1 space-y-10 sm:space-y-12">
            
            {/* Contractor Photo - Constrained width */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative max-w-2xl mx-auto lg:mx-0"
            >
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-[400px]">
                <Image
                  src="/images/qr-scan-2.webp"
                  alt="Contractor checking phone from truck"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                {/* Time badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 z-20">
                  <Clock size={12} className="text-emerald-400" />
                  <span
                    className="text-[10px] font-black text-white uppercase tracking-wider"
                    style={{ fontFamily: font }}
                  >
                    6:14 AM · Between jobs
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-emerald-500/10 blur-2xl rounded-full" />
            </motion.div>

            {/* Feature Cards - Mobile Friendly Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 sm:py-6 sm:text-center hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <feature.icon size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold mb-1" style={{ fontFamily: font }}>
                      {feature.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] sm:text-xs leading-snug font-medium" style={{ fontFamily: font }}>
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-wide text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  style={{ fontFamily: font }}
                >
                  Start Free — 2 Min Setup
                  <ArrowRight size={18} strokeWidth={3} />
                </motion.div>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: The Interactive Form */}
          {/* Use 'order-1 lg:order-2' to make this the first thing seen on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 flex flex-col items-center"
          >
            {/* Animated Status Label */}
            <div className="flex items-center gap-2 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400" style={{ fontFamily: font }}>
                Live Customer View
              </p>
            </div>

            {/* Phone Container */}
            <div className="relative group scale-90 sm:scale-100 transition-transform">
              <div className="absolute inset-0 blur-3xl opacity-20 rounded-[3rem] bg-emerald-500 scale-75 group-hover:scale-90 transition-transform" />
              <div className="relative z-10">
                <FastDemoForm autoPlay />
              </div>
            </div>

            <p className="text-[10px] sm:text-xs text-slate-500 font-bold text-center mt-6 max-w-[260px] leading-relaxed" style={{ fontFamily: font }}>
              Customers scan your QR code — branded form, photo upload, instant lead.
            </p>

            {/* Mobile CTA - Visible only on small screens */}
            <div className="lg:hidden mt-8 w-full px-4">
              <Link href="/signup">
                <div className="flex items-center justify-center gap-3 bg-emerald-500 text-slate-950 w-full py-4 rounded-2xl font-black uppercase tracking-wide text-xs shadow-lg shadow-emerald-500/20">
                  Start Free — 2 Min Setup
                  <ArrowRight size={16} strokeWidth={3} />
                </div>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}