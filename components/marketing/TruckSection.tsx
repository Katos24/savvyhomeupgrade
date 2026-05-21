'use client';

import { motion } from 'framer-motion';
import { QrCode, Link2, Zap, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const FEATURES = [
  {
    icon: QrCode,
    title: 'Branded QR code',
    desc: 'Your logo, your colors. Put it on trucks, yard signs, business cards, anywhere.',
  },
  {
    icon: Link2,
    title: 'One link for everything',
    desc: 'Share it on Facebook, text it to customers, add it to your website. One link, one form.',
  },
  {
    icon: Zap,
    title: 'Leads land instantly',
    desc: 'Every submission hits your dashboard with photos, details, and contact info. No email, no manual entry.',
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
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3"
            style={{ fontFamily: font }}
          >
            One link, everywhere
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.1] px-2"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Yard signs. Trucks. Social media.{' '}
            <br className="hidden sm:block" />
            <span className="text-emerald-400">One form. Every lead.</span>
          </h2>
          <p
            className="text-sm sm:text-base text-white mt-6 max-w-xl mx-auto font-medium leading-relaxed"
            style={{ fontFamily: font }}
          >
            You get a branded link and QR code. Put it anywhere. Every scan
            and click goes to your custom form and every lead lands on your dashboard.
          </p>
        </motion.div>

        {/* MAIN LAYOUT */}
        <div className="flex flex-col items-center max-w-6xl mx-auto space-y-10 sm:space-y-12">
          
          {/* Branded QR Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full max-w-3xl"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/images/qrbranded2.webp"
                alt="Branded QR code on truck, yard sign, and social media"
                width={1400}
                height={900}
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
                priority
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-emerald-500/10 blur-2xl rounded-full" />
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
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
                  <p className="text-slate-400 text-[11px] sm:text-xs leading-snug font-medium" style={{ fontFamily: font }}>
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
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