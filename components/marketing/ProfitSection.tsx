'use client';

import { Eyebrow } from './marketingUI';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp } from 'lucide-react';
// Mirrors Financials → Expenses (FinancialsExpenses.tsx). Illustrative jobs;
// every job's line items and expenses add up to its totals.
type Line = { description: string; amount: number; category?: string };
type Job = { id: number; name: string; meta: string; income: Line[]; expenses: Line[] };

const JOBS: Job[] = [
  {
    id: 1,
    name: 'M. Johnson',
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

export default function ProfitSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <section
      className={`bg-white text-[#1C1F23] py-16 sm:py-24 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-center">
        {/* Copy */}
        <div className="text-center sm:text-left">
          <Eyebrow>Expenses &amp; profit</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
            Know what you actually made on every job.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#3a3f45] leading-relaxed">
            Log materials, labor and other costs on the job as you go. Every job shows what came in, what went out,
            and what you kept, and your bookkeeper gets a clean export.
          </p>
          <ul className="mt-5 space-y-2 text-[15px] font-semibold text-[#1C1F23] inline-block text-left">
            <li className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1C1F23]" /> Income, expenses and profit per job
            </li>
          </ul>
          <p className="mt-4 text-xs text-slate-400">Tap a job to see the breakdown.</p>
        </div>

        {/* Interactive mock: Financials → Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl mx-auto rounded-md bg-[#faf9f5] p-3 sm:p-4 border border-slate-200 shadow-lg space-y-2.5"
        >

          {JOBS.map((job) => {
            const income = sum(job.income);
            const spent = sum(job.expenses);
            const isOpen = openId === job.id;
            return (
              <div key={job.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : job.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-stone-50/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">{job.name}</p>
                    <p className="text-xs text-stone-400">{job.meta}</p>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-5 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] uppercase tracking-wide text-stone-400">Income</p>
                      <p className="text-sm font-semibold tabular-nums text-emerald-700">{fmt(income)}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] uppercase tracking-wide text-stone-400">Expenses</p>
                      <p className="text-sm font-semibold tabular-nums text-rose-600">{fmt(spent)}</p>
                    </div>
                    <div className="text-right min-w-[84px]">
                      <p className="text-[10px] uppercase tracking-wide text-stone-400">Profit</p>
                      <p className="text-base font-bold tabular-nums text-stone-900">{fmt(income - spent)}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                      <div className="border-t border-stone-100 px-4 pt-3 pb-4 space-y-4">
                        <div>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Income</p>
                          <div className="space-y-1.5">
                            {job.income.map((l) => (
                              <div key={l.description} className="flex items-center justify-between gap-3 text-sm text-stone-900">
                                <span>{l.description}</span>
                                <span className="tabular-nums">{fmt(l.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Expenses</p>
                            <span className="text-[11px] font-semibold underline text-emerald-700">Add / Edit</span>
                          </div>
                          <div className="space-y-1.5">
                            {job.expenses.map((l) => (
                              <div key={l.description} className="flex items-center justify-between gap-3 text-sm text-stone-900">
                                <span className="min-w-0">
                                  {l.description} <span className="text-stone-400">({l.category})</span>
                                </span>
                                <span className="tabular-nums shrink-0">{fmt(l.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Mobile-only totals (desktop shows them in the row) */}
                        <div className="sm:hidden flex justify-between border-t border-stone-100 pt-3 text-xs">
                          <span className="text-emerald-700 font-semibold">In {fmt(income)}</span>
                          <span className="text-rose-600 font-semibold">Out {fmt(spent)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}