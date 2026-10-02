'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Same demo link as the hero. Leave empty to hide the demo button.
const DEMO_URL = '';
// Optional: path to your photo in /public (e.g. '/alex.jpg'). Leave empty to hide it.
const PHOTO_SRC = '';

export default function FinalCTA() {
  return (
    <section className="bg-[#00828A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        {PHOTO_SRC && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={PHOTO_SRC}
            alt="Alex, founder of Lead2Project"
            className="mx-auto mb-5 h-20 w-20 rounded-full object-cover border-2 border-white/60"
          />
        )}

        <span className="inline-block font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.16em] text-white/80">
          Built on Long Island
        </span>

        <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.92]">
          Built by one person, for local contractors.
        </h2>

        <p className="mt-5 text-base sm:text-lg leading-relaxed">
          I&rsquo;m Alex. I built Lead2Project so contractors can quote, collect deposits and get paid without
          chasing anyone. If something&rsquo;s missing for your trade, tell me, and I&rsquo;ll build it.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-white text-[#00828A] hover:bg-slate-50 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider px-8 py-3 rounded-md shadow-sm transition-colors text-center"
          >
            Start free
          </Link>
          {DEMO_URL && (
            <Link
              href={DEMO_URL}
              className="w-full sm:w-auto bg-transparent text-white hover:bg-white/10 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider px-6 py-3 rounded-md border border-white/40 transition-colors text-center"
            >
              Book a 15-min demo
            </Link>
          )}
        </div>

        <p className="mt-6 text-sm font-semibold text-white/80">Free plan available · Cancel anytime</p>
      </motion.div>
    </section>
  );
}