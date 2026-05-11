'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, QrCode, Camera, Radio } from 'lucide-react';

const font = "'Nunito', sans-serif";

const BULLETS = [
  {
    icon: QrCode,
    title: 'Custom branded QR decals',
    desc: 'Slap it on trucks, yard signs, door hangers, business cards — anywhere.',
  },
  {
    icon: Camera,
    title: 'Photo uploads from customers',
    desc: 'See the job before you drive. Customers attach photos right on the form.',
  },
  {
    icon: Radio,
    title: 'Real-time board updates',
    desc: 'Lead hits your dashboard the second they submit. No refresh needed.',
  },
];

export default function NewWhySection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-slate-50 py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ──── LEFT: COPY ──── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            {/* Kicker */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md">
                <Zap size={20} className="text-white" fill="currentColor" />
              </div>
              <span
                className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-[0.2em]"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Lead Capture
              </span>
            </div>

            {/* Headline */}
            <h3
              className="text-2xl sm:text-3xl lg:text-4xl text-slate-900 mb-4 sm:mb-5 leading-tight"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Your Truck Is Now a{' '}
              <span className="text-emerald-600">Lead Machine.</span>
            </h3>

            {/* Body */}
            <p
              className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 sm:mb-10 max-w-lg"
              style={{ fontFamily: font, fontWeight: 600 }}
            >
              Most yard signs get eyeballs but zero calls. Your QR code and link
              turn every truck, sign, and card into a digital intake form that
              works while you&apos;re on the roof.
            </p>

            {/* Feature bullets */}
            <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              {BULLETS.map((bullet, i) => (
                <motion.div
                  key={bullet.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  className="flex gap-3.5 items-start"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <bullet.icon size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p
                      className="text-slate-900 text-sm sm:text-base mb-0.5"
                      style={{ fontFamily: font, fontWeight: 900 }}
                    >
                      {bullet.title}
                    </p>
                    <p
                      className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed"
                      style={{ fontFamily: font }}
                    >
                      {bullet.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm uppercase tracking-wide transition-colors cursor-pointer shadow-lg"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Get Started Free
                <ArrowRight size={16} strokeWidth={3} />
              </motion.div>
            </Link>
          </motion.div>

          {/* ──── RIGHT: IMAGE ──── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-[4/3] bg-slate-100 shadow-2xl border border-slate-200">
                <img
                  src="/images/qrbranded2.webp"
                  alt="QR code decals on a work truck"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Subtle shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-slate-900/5 blur-2xl rounded-full" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}