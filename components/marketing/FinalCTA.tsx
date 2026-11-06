'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Check } from 'lucide-react';

// Same demo link as the hero. Leave empty to hide the demo button.
const DEMO_URL = '/book-demo';
// Optional: path to your photo in /public (e.g. '/alex.jpg'). Leave empty to show an "A" badge instead.
const PHOTO_SRC: string = '';

const DOTS = 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)';

export default function FinalCTA() {
  return (
    <section className="bg-white px-4 pb-14 pt-4 sm:px-6 sm:pb-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#00828A] via-[#006f76] to-[#0b3d44] px-6 py-12 text-white shadow-[0_40px_90px_-40px_rgba(0,90,96,0.8)] sm:px-10 sm:py-16 lg:px-14"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: DOTS, backgroundSize: '22px 22px' }} />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#5EC4C9]/40 blur-[100px]" />

        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          {/* Headline + buttons */}
          <div className="text-center lg:text-left">
            <span className="inline-block font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.2em] text-[#A6E3E6]">
              Built on Long Island
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[34px] font-extrabold uppercase leading-[0.92] tracking-tight sm:text-5xl lg:text-6xl">
              Built by one person, <span className="text-[#A6E3E6]">for local contractors.</span>
            </h2>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              <Link
                href="/signup"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-[#00828A] shadow-lg transition-all hover:-translate-y-0.5 sm:text-lg"
              >
                Start free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              {DEMO_URL && (
                <Link
                  href={DEMO_URL}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-7 py-3 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:text-lg"
                >
                  Book a 15-min demo <PlayCircle className="h-5 w-5" />
                </Link>
              )}
            </div>

            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-semibold text-white/80 lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#A6E3E6]" strokeWidth={3} /> Free plan available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#A6E3E6]" strokeWidth={3} /> Cancel anytime
              </span>
            </p>
          </div>

          {/* Founder note */}
          <div className="mx-auto w-full max-w-md rounded-2xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-sm sm:p-7">
            <p className="text-base leading-relaxed text-white/90 sm:text-lg">
              &ldquo;I&rsquo;m Alex. I built Lead2Project so contractors can quote, collect deposits and get paid without chasing
              anyone. If something&rsquo;s missing for your trade, tell me, and I&rsquo;ll build it.&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              {PHOTO_SRC ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={PHOTO_SRC}
                  alt="Alex, founder of Lead2Project"
                  className="h-12 w-12 rounded-full border-2 border-white/60 object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white font-[family-name:var(--font-display)] text-lg font-extrabold text-[#00828A]">
                  A
                </span>
              )}
              <div>
                <p className="font-bold leading-tight">Alex</p>
                <p className="text-sm text-white/70">Founder, Lead2Project</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}