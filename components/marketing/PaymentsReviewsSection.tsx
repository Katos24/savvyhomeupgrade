'use client';

import { Eyebrow } from './marketingUI';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Star, Landmark, CheckCircle2, ArrowRight } from 'lucide-react';
// Two call-outs side by side: card payments through Stripe, and Google review requests.
// Brand names are shown as plain text on purpose (no third-party logos).
export default function PaymentsReviewsSection() {
  return (
    <section
      className={`bg-[#F4EFE6] text-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* ── Stripe payments ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="flex flex-col rounded-md border border-slate-200 bg-white shadow-sm p-6 sm:p-8"
        >
          <Eyebrow>Payments by Stripe</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-none">
            Customers pay by card. The money goes to your bank.
          </h2>
          <p className="mt-3 text-[15px] text-[#3a3f45] leading-relaxed">
            Connect your own Stripe account once. Every deposit and invoice gets a secure pay link, and payouts go
            straight to your bank account.
          </p>

          {/* Mock checkout */}
          <div className="mt-6 rounded-md border-2 border-dashed border-slate-300 bg-[#FBF8F2] p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Summit Roofing</span>
              <span className="inline-flex items-center gap-1">
                <Lock className="w-3 h-3" /> Secure checkout
              </span>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">Deposit for Roof Repair</p>
            <p className="text-2xl font-extrabold tabular-nums">$4,800.00</p>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-400">
              Card number
            </div>
            <div className="mt-3 rounded-lg bg-[#00828A] py-2.5 text-center text-xs font-bold text-white">
              Pay $4,800.00
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-[15px] text-[#1C1F23]">
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#1C1F23]" /> Card details handled by Stripe, never stored by us
            </li>
            <li className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#1C1F23]" /> Payouts to your own bank account
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1C1F23]" /> Balance and receipt update automatically
            </li>
          </ul>
          <div className="mt-auto">
            <Link
            href="/features/payments"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00828A] hover:underline underline-offset-4"
          >
            See how payments work <ArrowRight className="h-4 w-4" />
          </Link>
          </div>
        </motion.div>

        {/* ── Google reviews ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-col rounded-md border border-slate-200 bg-white shadow-sm p-6 sm:p-8"
        >
          <Eyebrow>Google reviews</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-none">
            Ask for the review while the job is fresh.
          </h2>
          <p className="mt-3 text-[15px] text-[#3a3f45] leading-relaxed">
            Mark a job complete and your customer gets a thank-you email with a button to your Google review page.
            More reviews help you show up higher when neighbors search for your trade.
          </p>

          {/* Mock email */}
          <div className="mt-6 rounded-md border-2 border-dashed border-slate-300 bg-[#FBF8F2] p-4 sm:p-5">
            <p className="text-[11px] text-slate-500">From Summit Roofing</p>
            <p className="mt-0.5 text-sm font-bold">Thanks for choosing us, Maria!</p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Your roof repair is all done. If you were happy with the work, a quick Google review would mean a lot.
            </p>
            <div className="mt-3 flex items-center gap-0.5 text-amber-400">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4" fill="currentColor" />
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-[#00828A] py-2.5 text-center text-xs font-bold text-white">
              Leave a Google review
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-[15px] text-[#1C1F23]">
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#1C1F23]" /> Sent when you mark the job complete
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1C1F23]" /> You choose per job, so a rough job doesn&rsquo;t get one
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}