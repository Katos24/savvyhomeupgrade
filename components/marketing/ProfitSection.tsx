'use client';

import { motion } from 'framer-motion';
import { Receipt, TrendingUp } from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

// Illustrative job — numbers add up: 12,000 − 7,130 = 4,870 (about 41%).
const EXPENSES = [
  { label: 'Shingles & underlayment', amount: 4150 },
  { label: 'Crew labor', amount: 2600 },
  { label: 'Dumpster rental', amount: 380 },
];
const TOTAL = 12000;

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function ProfitSection() {
  const spent = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const profit = TOTAL - spent;
  const margin = Math.round((profit / TOTAL) * 100);

  return (
    <section
      className={`${jakarta.variable} font-[family-name:var(--font-jakarta)] bg-white text-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Copy */}
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold text-[#00828A] tracking-widest uppercase">Expenses &amp; profit</p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
            Know what you actually made on every job.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Log materials, labor and other costs right on the job, with receipt photos. You see the real profit,
            not just what you charged, and your bookkeeper gets a clean export at the end of the month.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700 inline-block text-left">
            <li className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#00828A]" /> Receipt photos saved on the job
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00828A]" /> Profit and margin per job
            </li>
          </ul>
        </div>

        {/* Mock job card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto rounded-2xl border border-slate-200 bg-[#F8FAF9] p-5 sm:p-6 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold">Roof Repair</p>
              <p className="text-xs text-slate-500">M. Johnson · Holbrook</p>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              ✓ Paid in full
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-slate-600">Job total</span>
            <span className="font-bold tabular-nums">{fmt(TOTAL)}</span>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {EXPENSES.map((e) => (
              <div key={e.label} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                <span className="text-slate-600">{e.label}</span>
                <span className="tabular-nums text-slate-700">− {fmt(e.amount)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Profit</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">{fmt(profit)}</p>
            </div>
            <span className="text-sm font-semibold text-slate-600">{margin}% margin</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}