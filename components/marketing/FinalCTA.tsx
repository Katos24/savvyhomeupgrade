'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

// Same demo link as the hero. Leave empty to hide the demo button.
const DEMO_URL = '';
// Optional: path to your photo in /public (e.g. '/alex.jpg'). Leave empty to hide it.
const PHOTO_SRC = '';

export default function FinalCTA() {
  return (
    <section
      className={`${jakarta.variable} font-[family-name:var(--font-jakarta)] bg-[#0B1520] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8`}
    >
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
            className="mx-auto mb-5 h-16 w-16 rounded-full object-cover border-2 border-white/10"
          />
        )}

        <p className="text-xs font-bold text-[#2bb3ba] tracking-widest uppercase">Built on Long Island</p>

        <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          Built by one person, for local contractors.
        </h2>

        <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
          I&rsquo;m Alex. I built Lead2Project so contractors can quote, collect deposits and get paid without
          chasing anyone. If something&rsquo;s missing for your trade, tell me, and I&rsquo;ll build it.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-[#00828A] hover:bg-[#006e75] text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-colors text-center"
          >
            Start free
          </Link>
          {DEMO_URL && (
            <Link
              href={DEMO_URL}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition-colors text-center"
            >
              Book a 15-min demo
            </Link>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-400">Free plan available · Cancel anytime</p>
      </motion.div>
    </section>
  );
}