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
  slow: { pct: 28, label: 'at a 42-min avg reply' },
  fast: { pct: 62, label: 'when replying < 2 mins' },
  source: 'ServiceTitan Home Services Benchmark Report, 100,000+ businesses',
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
      className="bg-slate-100 py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-300/70 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

        {/* Left: Content & Argument */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-teal-700 block mb-3">
            Get your link out there
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 tracking-tight leading-[1.1] mb-5">
            The first one to answer{' '}
            <span className="text-teal-700">usually gets the job.</span>
          </h2>

          <p className="text-slate-600 font-semibold text-base sm:text-lg leading-relaxed mb-8">
            A voicemail sits until you get off the roof. A form fills your board the
            second it&apos;s sent — photos, address, and what they need, ready to
            answer straight from your phone.
          </p>

          {/* Mobile Image Preview Card (Visible on mobile & tablet) */}
          <div className="block lg:hidden mb-8">
            <div className="rounded-2xl overflow-hidden border border-slate-300/80 bg-white shadow-md">
              <Image
                src="/images/qrbranded2.webp"
                alt="A branded QR code and booking link on printed material"
                width={1920}
                height={1300}
                className="w-full h-auto object-cover max-h-[300px] sm:max-h-[380px]"
                priority={false}
              />
            </div>
            {/* Surface Chips for Mobile */}
            <div className="flex flex-wrap gap-2 mt-3.5">
              {SURFACES.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/80 bg-white px-2.5 py-1.5 text-[11px] font-black text-slate-700 shadow-xs"
                >
                  <s.icon size={13} className="text-teal-700 shrink-0" strokeWidth={2.5} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* The Stat Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl border border-slate-300/80 bg-white shadow-sm p-5 sm:p-6 mb-8"
          >
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
              Lead Conversion Rates
            </p>

            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8">
              <div className="min-w-0">
                <p className="text-3xl sm:text-4xl font-black text-slate-300 tabular-nums leading-none">
                  {STAT.slow.pct}%
                </p>
                <p className="text-[11px] font-bold text-slate-500 mt-2 leading-tight">
                  {STAT.slow.label}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
              </div>

              <div className="min-w-0">
                <p className="text-3xl sm:text-4xl font-black text-teal-700 tabular-nums leading-none">
                  {STAT.fast.pct}%
                </p>
                <p className="text-[11px] font-bold text-slate-700 mt-2 leading-tight">
                  {STAT.fast.label}
                </p>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-slate-400 mt-5 pt-4 border-t border-slate-100 leading-relaxed">
              Share of inbound leads that convert into booked revenue. {STAT.source}.
            </p>
          </motion.div>

          <div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider px-6 py-4 rounded-xl shadow-md transition-all"
            >
              Get your link free
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Right: Desktop Visual Container (Hidden on mobile, pristine on desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="hidden lg:block lg:col-span-6"
        >
          <div className="rounded-3xl overflow-hidden border border-slate-300/80 bg-white shadow-xl">
            <Image
              src="/images/qrbranded2.webp"
              alt="A branded QR code and booking link on printed material"
              width={1920}
              height={1300}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Desktop Surface Chips */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            {SURFACES.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white px-3.5 py-2 text-xs font-black text-slate-700 shadow-xs hover:border-slate-400 transition-colors"
              >
                <s.icon size={14} className="text-teal-700 shrink-0" strokeWidth={2.5} />
                {s.label}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}