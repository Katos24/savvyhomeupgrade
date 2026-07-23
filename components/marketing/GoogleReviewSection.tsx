'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Mail, Star } from 'lucide-react';

const font = "'Nunito', sans-serif";

const ACCENT = '#0D9488'; // Vibrant Teal 600

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
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
      className="relative overflow-hidden bg-slate-800 py-16 sm:py-24 border-t border-slate-700/80 text-left"
    >
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">

        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span 
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white shadow-md shadow-slate-900/40"
              style={{ backgroundColor: ACCENT }}
            >
              6
            </span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-teal-300 font-mono">
              Collect the review
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Mark the job complete.{' '}
            <span className="text-teal-300">The review request sends itself.</span>
          </h2>
          <p className="text-sm sm:text-base font-bold text-slate-300 max-w-xl mx-auto mt-4">
            Automatically dispatch a review request the moment you mark a job Completed — no extra step, nothing to remember.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">

          {/* Email preview card with explicit Google Stars */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-slate-700 bg-slate-900/80 shadow-lg p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white font-black text-sm">
                  <Mail className="w-4 h-4 text-teal-400" /> Customer email preview
                </div>
                {/* Google 5-star badge pill */}
                <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <span className="text-[10px] font-black text-amber-300">5.0</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Clean White Card inside the preview for high contrast */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 text-sm text-slate-800 shadow-md relative text-left">
                <p className="mb-2.5 font-bold text-slate-900">Hi Jennifer,</p>
                <p className="mb-4 text-xs font-semibold text-slate-600 leading-relaxed">
                  &quot;Thanks for choosing Ridge Line Roofing! Could you spare a moment to leave us a 5-star Google review?&quot;
                </p>

                {/* Interactive Star Rating Callout */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 text-center my-3">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <GoogleLogo className="w-4 h-4" />
                    <span className="text-xs font-black text-slate-800">Rate us on Google</span>
                  </div>
                  
                  {/* Visual Star Selector */}
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-xs" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">Tap a star to leave feedback</span>
                </div>

                <div className="mt-3 text-center">
                  <div className="inline-flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-black text-xs px-5 py-2.5 rounded-lg shadow-sm w-full transition-colors cursor-pointer">
                    <GoogleLogo className="w-4 h-4 bg-white rounded-full p-0.5" />
                    Leave a Google Review
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-teal-300 font-bold mt-4 text-left">
              Customize this template in Email Settings.
            </p>
          </motion.div>

          {/* Trigger card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-slate-700 bg-slate-900/80 shadow-lg p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4 text-white font-black text-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> Trigger: mark job complete
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 shadow-sm h-[250px] sm:h-[280px]">
                <img
                  src="/images/mark-job-complete.webp"
                  alt="Mark job as complete"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-300 border-t border-slate-700/60 pt-3">
              <span className="font-semibold">Automatic Dispatch</span>
              <span className="text-emerald-400 font-black flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
              </span>
            </div>
          </motion.div>

        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-center text-[11px] font-bold text-slate-400 mt-8"
        >
          Requires a Google Business Profile review link. Every email sent — quotes, reminders, and reviews — is logged in your Outbox, so you always know what went out and when.
        </motion.p>

      </div>
    </section>
  );
}