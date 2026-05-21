'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

export default function TruckSection() {
  return (
    <section className="relative bg-slate-950 py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <p
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3"
            style={{ fontFamily: font }}
          >
            One link, everywhere
          </p>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl text-white leading-[1.15]"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Yard signs. Trucks. Social media.{' '}
            <br className="hidden sm:block" />
            <span className="text-emerald-400">One form. Every lead.</span>
          </h2>
        </motion.div>

        {/* IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mb-10 sm:mb-14"
        >
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="/images/qrbranded2.png"
              alt="Branded QR code on truck, yard sign, and social media"
              width={1400}
              height={900}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
              priority
            />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-6 bg-emerald-500/10 blur-2xl rounded-full" />
        </motion.div>

        {/* CTA */}
        <div className="text-center">
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
    </section>
  );
}