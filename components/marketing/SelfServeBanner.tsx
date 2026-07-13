'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const font = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function SelfServeBanner() {
  return (
    <section 
      style={{ fontFamily: font }}
      className="relative bg-white py-20 sm:py-28 overflow-hidden border-b border-slate-100"
    >
      {/* Structural Accent Blur */}
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-center">

          {/* LEFT COLUMN: Narrative & Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col text-left"
          >
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">
              No sales demo. No credit card required.
            </span>
            
            <h2 className="text-slate-900 font-black tracking-tight leading-[1.05] text-4xl sm:text-5xl mb-6">
              Sign up and start <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">in under 2 minutes.</span>
            </h2>
            
           <p className="text-slate-500 font-bold text-base sm:text-lg leading-relaxed max-w-xl mb-6">
  Keep using your current bookkeeping software like QuickBooks. Lead2Project simply handles the pieces you are missing: capturing incoming job-site leads, tracking your pipeline, and collecting instant payouts from one easy dashboard screen.
</p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <Link href="/signup" className="w-full sm:w-auto">
                <div className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-black text-sm transition-all cursor-pointer shadow-sm">
                  Create Free Account
                  <ArrowRight size={14} strokeWidth={3} />
                </div>
              </Link>
              
              <Link href="/partners" className="text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-4 py-2">
                Bookkeeper or CPA? See our partner program
              </Link>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Enhanced Image & Floating Glass Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative w-full max-w-[400px] lg:max-w-none mx-auto"
          >
            <div className="relative rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 p-2 shadow-2xs">
              <div className="rounded-xl overflow-hidden bg-white border border-slate-200/60">
                <Image
                  src="/images/marketing-quote2.webp"
                  alt="Contractor sending quotes directly from the job site workspace"
                  width={1080}
                  height={1080}
                  priority
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* High-End Clean Glassmorphism Checklist Overlays */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-xl p-4 border border-white/80 shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Full instant access',
                    'No credit card needed',
                    'Zero approval waiting',
                    'Live booking forms',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span className="text-[11px] font-black text-slate-700 leading-none">
                        {item}
                      </span>
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