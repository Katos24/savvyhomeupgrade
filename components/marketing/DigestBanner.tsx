'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

export default function DigestBanner() {
  return (
    <section className="relative min-h-[750px] lg:min-h-[800px] flex items-center overflow-hidden bg-slate-950">
      
      {/* ──── BACKGROUND IMAGE (Stretches whole section) ──── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/morning-brief.webp"
          alt="Contractor reviewing daily digest operations brief at 6 AM"
          fill
          className="object-cover object-center lg:object-[right_25%]"
          priority
        />
        {/* Premium Lighting Mask - heavier dark gradient on the left to make text pop */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent lg:from-slate-950 lg:via-slate-950/70 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        <div className="absolute inset-0 bg-slate-950/10 backdrop-blur-[0.5px]" />
      </div>

      {/* Structural Minimal Canvas Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-[1]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-20">
        <div className="max-w-2xl">
          
          {/* ──── NARRATIVE COPY ──── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <div className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 mb-6 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <p className="text-[10px] font-black uppercase tracking-wider text-sky-300" style={{ fontFamily: font }}>
                Automated Operations Brief
              </p>
            </div>

            <h3
              className="text-4xl sm:text-5xl lg:text-6xl text-white font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: font }}
            >
              Your business, <br />
              <span className="text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]">delivered at 6 AM.</span>
            </h3>

            <p
              className="text-slate-300 font-bold text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
              style={{ fontFamily: font }}
            >
              Every morning at 6AM, you get a digest email — new leads, upcoming jobs, unpaid invoices. Review everything before you ever turn the key.
            </p>

            {/* Structured Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-xl">
              {[
                "Today's active dispatches",
                'Stale, unaccepted quotes',
                'Overdue retainer invoices',
                'Real-time gross pipeline totals',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md border border-white/[0.06] rounded-xl px-4 py-3.5">
                  <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-slate-200 font-bold" style={{ fontFamily: font }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="self-start">
              <Link href="/signup" passHref>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-400 text-white px-8 h-14 rounded-xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer shadow-[0_20px_40px_rgba(14,165,233,0.3)] text-center"
                  style={{ fontFamily: font }}
                >
                  Activate Your Dashboard Free
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