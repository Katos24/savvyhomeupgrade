'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Star } from 'lucide-react';

const font = "'Nunito', sans-serif";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export default function GoogleReviewSection() {
  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-slate-800 py-20 sm:py-28 px-4 sm:px-6 border-t border-slate-700/80"
    >
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 mx-auto max-w-5xl">

        {/* Header — left-aligned to match the other sections and to give the
            body copy a sane measure instead of a centered 3-line ribbon. */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300 block mb-4">
            Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] mb-5">
            Mark the job complete.{' '}
            <span className="text-teal-300">The review request sends itself.</span>
          </h2>
          <p className="text-base sm:text-lg font-semibold text-slate-300 leading-relaxed">
            No extra step, nothing to remember, and no awkward asking in the driveway.
          </p>
        </div>

        {/* Trigger → result. Reading order now matches cause and effect;
            the old layout showed the email before the thing that sends it. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* The trigger */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 rounded-2xl border border-slate-700 bg-slate-900/70 overflow-hidden shadow-lg"
          >
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-700/80">
              <span className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-sm font-black text-white">You mark it complete</span>
            </div>

            <img
              src="/images/mark-job-complete.webp"
              alt="Marking a job complete on the board"
              className="w-full h-[220px] sm:h-[260px] object-cover object-top"
            />

            <p className="px-5 py-4 text-sm font-semibold text-slate-400 leading-relaxed border-t border-slate-700/80">
              That&apos;s the whole trigger. Turn it off per category if some jobs
              shouldn&apos;t get one.
            </p>
          </motion.div>

          {/* Connector — a real arrow on desktop, rotated on mobile so the
              stacked order still reads as a sequence. */}
          <div className="lg:col-span-1 flex lg:h-full items-center justify-center py-1 lg:py-0">
            <span className="w-9 h-9 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-teal-300 rotate-90 lg:rotate-0" strokeWidth={3} />
            </span>
          </div>

          {/* The email */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-black text-white">Your customer gets this</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Editable template
              </span>
            </div>

            {/* One level of nesting instead of three. The email is white on the
                dark section directly — no dark card wrapping a light card. */}
            <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <GoogleLogo className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">Ridge Line Roofing</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[11px] font-bold text-slate-500 ml-1">4.9 · 124 reviews</span>
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-5 sm:py-6">
                <p className="text-base font-black text-slate-900 mb-3">Hi Jennifer,</p>
                <p className="text-sm sm:text-base font-semibold text-slate-600 leading-relaxed mb-6">
                  Thanks for choosing Ridge Line Roofing. If you have a minute, a quick
                  review helps other homeowners find us.
                </p>

                <span className="inline-flex items-center justify-center gap-2.5 w-full bg-[#1a73e8] text-white font-black text-sm px-5 py-3.5 rounded-xl shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                    <GoogleLogo className="w-3.5 h-3.5" />
                  </span>
                  Leave a review
                </span>

                <p className="text-xs font-semibold text-slate-400 mt-4 text-center">
                  Opens your Google Business Profile
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-teal-300 mt-3 px-1">
              Edit the wording in Email Settings.
            </p>
          </motion.div>
        </div>

        {/* Footnotes — split, and readable. Was one 11px grey run-on sentence. */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          <p className="text-sm font-semibold text-slate-400 leading-relaxed">
            Needs a Google Business Profile with a review link. Takes a minute to add
            in settings.
          </p>
          <p className="text-sm font-semibold text-slate-400 leading-relaxed">
            Every review request lands in your Outbox alongside quotes and reminders,
            so you can see exactly what went out.
          </p>
        </div>

      </div>
    </section>
  );
}