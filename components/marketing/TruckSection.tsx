'use client';

import { motion } from 'framer-motion';
import { Truck, CreditCard, Instagram, Facebook, ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

/**
 * One stat, chosen because it argues for this product rather than for the
 * general idea of having a link. Verify against the primary ServiceTitan
 * report before publishing — this was sourced secondhand.
 */
const STAT = {
  slow: { pct: 28, label: 'at a 42-minute average reply' },
  fast: { pct: 62, label: 'when you reply within 2 minutes' },
  source: 'ServiceTitan 2025 Home Services Benchmark Report, 100,000+ businesses',
};

const SURFACES = [
  { label: 'Truck & yard signs', icon: Truck },
  { label: 'Cards & invoices', icon: CreditCard },
  { label: 'Google profile', icon: Check },
  { label: 'Instagram', icon: Instagram },
  { label: 'Facebook', icon: Facebook },
];

export default function TruckSection() {
  return (
    <section
      id="distribution"
      style={{ fontFamily: font }}
      className="bg-slate-100 py-20 sm:py-24 px-4 sm:px-6 border-b border-slate-300/70"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

        {/* Left: the argument */}
        <div className="lg:col-span-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 block mb-4">
            Get your link out there
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 tracking-tight leading-[1.08] mb-5">
            The first one to answer{' '}
            <span className="text-teal-700">usually gets the job.</span>
          </h2>

          <p className="text-slate-600 font-semibold text-base sm:text-lg leading-relaxed mb-8">
            A voicemail sits until you get off the roof. A form fills your board the
            second it&apos;s sent — photos, address, and what they need, ready to
            answer from your phone.
          </p>

          {/* The stat, as a contrast rather than a chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-slate-300 bg-white shadow-sm p-5 sm:p-6 mb-8"
          >
            <div className="flex items-center gap-5 sm:gap-8">
              <div>
                <p className="text-3xl sm:text-4xl font-black text-slate-300 tabular-nums leading-none">
                  {STAT.slow.pct}%
                </p>
                <p className="text-[11px] font-bold text-slate-500 mt-2 leading-snug">
                  {STAT.slow.label}
                </p>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" strokeWidth={3} />

              <div>
                <p className="text-3xl sm:text-4xl font-black text-teal-700 tabular-nums leading-none">
                  {STAT.fast.pct}%
                </p>
                <p className="text-[11px] font-bold text-slate-600 mt-2 leading-snug">
                  {STAT.fast.label}
                </p>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-slate-400 mt-4 pt-4 border-t border-slate-100 leading-relaxed">
              Share of inbound leads that convert. {STAT.source}.
            </p>
          </motion.div>

          <Link href="/signup">
            <span className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-colors">
              Get your link free
              <ArrowRight size={15} />
            </span>
          </Link>
        </div>

        {/* Right: where the link lives (Hidden on mobile, full image visible on desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="hidden lg:block lg:col-span-6"
        >
          <div className="rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-lg">
            <Image
              src="/images/qrbranded2.webp"
              alt="A branded QR code and booking link on printed material"
              width={1920}
              height={1300}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Channels as inline chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SURFACES.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-2xs"
              >
                <s.icon size={13} className="text-teal-700" strokeWidth={2.5} />
                {s.label}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}