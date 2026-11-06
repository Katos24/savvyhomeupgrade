'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, Receipt, FileDown } from 'lucide-react';

// Mirrors Financials → Expenses (FinancialsExpenses.tsx). Illustrative jobs;
// every job's line items and expenses add up to its totals.
type Line = { description: string; amount: number; category?: string };
type Job = { id: number; name: string; service: string; meta: string; income: Line[]; expenses: Line[] };

const JOBS: Job[] = [
  {
    id: 1,
    name: 'M. Johnson',
    service: 'Roof repair',
    meta: '#INV-041 · Sep 10',
    income: [
      { description: 'Tear-off & materials', amount: 7400 },
      { description: 'Labor & installation', amount: 4600 },
    ],
    expenses: [
      { description: 'Shingles & underlayment', category: 'Materials', amount: 4150 },
      { description: 'Crew labor', category: 'Labor', amount: 2600 },
      { description: 'Dumpster rental', category: 'Equipment', amount: 380 },
    ],
  },
  {
    id: 2,
    name: 'S. Patel',
    service: 'Siding',
    meta: '#INV-038 · Sep 22',
    income: [
      { description: 'Old siding removal', amount: 1900 },
      { description: 'New vinyl siding', amount: 6500 },
    ],
    expenses: [
      { description: 'Vinyl siding & trim', category: 'Materials', amount: 3480 },
      { description: 'Crew labor', category: 'Labor', amount: 1550 },
      { description: 'Disposal fee', category: 'Other', amount: 180 },
    ],
  },
  {
    id: 3,
    name: 'D. Kim',
    service: 'Gutters',
    meta: '#INV-036 · Sep 18',
    income: [
      { description: 'Gutter cleaning', amount: 350 },
      { description: 'Gutter guard install', amount: 600 },
    ],
    expenses: [{ description: 'Gutter guards', category: 'Materials', amount: 120 }],
  },
];

const sum = (lines: Line[]) => lines.reduce((s, l) => s + l.amount, 0);
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const fmt0 = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const TOTAL_IN = JOBS.reduce((s, j) => s + sum(j.income), 0);
const TOTAL_OUT = JOBS.reduce((s, j) => s + sum(j.expenses), 0);
const TOTAL_PROFIT = TOTAL_IN - TOTAL_OUT;

export default function ProfitSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section className="relative overflow-hidden bg-slate-900 px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-[480px] w-[480px] rounded-full bg-[#00828A]/25 blur-[130px]"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.2em] text-[#5EC4C9]">
            Expenses &amp; profit
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[30px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl lg:text-5xl">
            Know what you <span className="text-[#5EC4C9]">actually made</span> on every job.
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white/70 sm:text-base lg:mx-0">
            Log materials, labor and other costs on the job as you go. Every job shows what came in, what went out, and what
            you kept, and your bookkeeper gets a clean export.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {[
              { icon: TrendingUp, label: 'Profit per job' },
              { icon: Receipt, label: 'Log costs as you go' },
              { icon: FileDown, label: 'Export for your bookkeeper' },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/15"
              >
                <Icon className="h-3.5 w-3.5 text-[#5EC4C9]" /> {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive mock: Financials → Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-xl"
        >
          <div className="overflow-hidden rounded-2xl bg-white text-[#1C1F23] shadow-2xl shadow-black/40 ring-1 ring-white/10">
            {/* Summary strip */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50">
              {[
                { label: 'Income', value: fmt0(TOTAL_IN), tone: 'text-emerald-700' },
                { label: 'Expenses', value: fmt0(TOTAL_OUT), tone: 'text-rose-600' },
                { label: 'You kept', value: fmt0(TOTAL_PROFIT), tone: 'text-[#00828A]' },
              ].map((s) => (
                <div key={s.label} className="px-3 py-3 text-center sm:px-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
                  <p className={`mt-0.5 font-[family-name:var(--font-display)] text-xl font-extrabold tabular-nums sm:text-2xl ${s.tone}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100">
              {JOBS.map((job) => {
                const income = sum(job.income);
                const spent = sum(job.expenses);
                const profit = income - spent;
                const margin = income > 0 ? Math.round((profit / income) * 100) : 0;
                const isOpen = openId === job.id;
                return (
                  <div key={job.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : job.id)}
                      aria-expanded={isOpen}
                      className={`w-full px-4 py-3.5 text-left transition-colors ${isOpen ? 'bg-[#00828A]/[0.04]' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {job.name} <span className="font-medium text-slate-400">· {job.service}</span>
                          </p>
                          <p className="text-xs text-slate-400">{job.meta}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-right">
                            <p className="text-base font-bold tabular-nums text-slate-900">{fmt(profit)}</p>
                            <p className="text-[11px] font-semibold text-[#00828A]">{margin}% kept</p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {/* Where the money went: expenses vs what you kept */}
                      <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                        <motion.div
                          className="h-full bg-rose-400"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${100 - margin}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <motion.div
                          className="h-full bg-[#00828A]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${margin}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 gap-4 px-4 pb-4 pt-1 sm:grid-cols-2">
                            <div>
                              <p className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                                Came in <span className="tabular-nums">{fmt(income)}</span>
                              </p>
                              <div className="space-y-1">
                                {job.income.map((l) => (
                                  <div key={l.description} className="flex items-center justify-between gap-3 text-[13px] text-slate-700">
                                    <span className="min-w-0 truncate">{l.description}</span>
                                    <span className="shrink-0 tabular-nums">{fmt(l.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                                Went out <span className="tabular-nums">{fmt(spent)}</span>
                              </p>
                              <div className="space-y-1">
                                {job.expenses.map((l) => (
                                  <div key={l.description} className="flex items-center justify-between gap-3 text-[13px] text-slate-700">
                                    <span className="min-w-0 truncate">
                                      {l.description} <span className="text-slate-400">({l.category})</span>
                                    </span>
                                    <span className="shrink-0 tabular-nums">{fmt(l.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-white/50">Tap a job to see the breakdown.</p>
        </motion.div>
      </div>
    </section>
  );
}