'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Image from 'next/image';
const font = "'Nunito', sans-serif";
export default function SelfServeBanner() {
  return (
    <section className="relative bg-white py-20 sm:py-28 overflow-hidden border-b border-slate-100">
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">

          {/* LEFT: The message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-4"
              style={{ fontFamily: font }}
            >
              No demo. No sales call.
            </p>
            <h2
              className="text-4xl sm:text-5xl text-slate-900 font-black leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: font }}
            >
              Sign up and start <br />
              <span className="text-emerald-600">in under 2 minutes.</span>
            </h2>
            <p
              className="text-slate-500 font-bold text-base sm:text-lg leading-relaxed max-w-md"
              style={{ fontFamily: font }}
            >
You don&apos;t need to replace anything you already use. Keep your QuickBooks, keep your payment app. Lead2Project handles the part you&apos;re missing — catching leads and tracking jobs from one place.{' '}
<a href="/partners" className="text-emerald-600 hover:text-emerald-700 font-black underline underline-offset-2">
  Bookkeeper or CPA? See our partner program.
</a>
            </p>
          </motion.div>

          {/* RIGHT: Image with checklist top-right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden w-full">
              <Image
                src="/images/marketing-quote2.png"
                alt="Contractor sending quotes from the job site"
                width={1080}
                height={1080}
                className="w-full h-auto object-contain"
              />

              {/* Checklist — top right, stays in upper portion away from face */}
              <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl max-w-[180px]">
                <div className="space-y-2.5">
                  {[
                    'Full access immediately',
                    'No credit card on free plan',
                    'No waiting for approval',
                    'Set up your form and go',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={11} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] font-bold text-slate-300 leading-tight" style={{ fontFamily: font }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}