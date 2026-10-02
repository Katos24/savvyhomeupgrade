'use client';

import { Eyebrow } from './marketingUI';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Camera, CalendarDays, QrCode, Link2 } from 'lucide-react';
// Mock data for the board preview — illustrative only.
type MockCard = { name: string; service: string; amount: string; date: string; fresh?: boolean; paid?: string };

const COLUMNS: { label: string; dot: string; cards: MockCard[] }[] = [
  {
    label: 'New',
    dot: 'bg-blue-500',
    cards: [
      { name: 'Maria Lopez', service: 'Roof repair', amount: '', date: 'Unscheduled', fresh: true },
      { name: 'Dan Kim', service: 'Gutter cleaning', amount: '', date: 'Unscheduled' },
    ],
  },
  {
    label: 'Quoted',
    dot: 'bg-purple-500',
    cards: [{ name: 'S. Patel', service: 'Siding', amount: '$8,400', date: 'Unscheduled' }],
  },
  {
    label: 'Scheduled',
    dot: 'bg-amber-500',
    cards: [{ name: 'M. Johnson', service: 'Roof repair', amount: '$12,000', date: 'Oct 9', paid: 'Deposit paid' }],
  },
];

export default function FormAndDashboardSection() {
  return (
    <section
      className={`bg-white text-[#1C1F23] py-16 sm:py-24 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
          <Eyebrow>Your booking form</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
            Customers request a quote. It lands in your dashboard.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#3a3f45] leading-relaxed">
            Share your link or QR code anywhere: your Google profile, your truck, your invoices. Every request shows up
            with the details and photos you need to quote it.
          </p>
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-0.5 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-[#00828A]">
              <Link2 className="w-3.5 h-3.5" /> Booking link
            </span>
            <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-0.5 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-[#00828A]">
              <QrCode className="w-3.5 h-3.5" /> QR code
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_auto_1fr] items-center gap-6 lg:gap-8">
          {/* ── Phone: the customer's form ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-[300px] rounded-[2rem] bg-[#1C1F23] p-2.5 shadow-2xl"
          >
            <div className="rounded-[1.6rem] bg-white overflow-hidden">
              <div className="bg-[#00828A] px-5 pt-6 pb-4 text-white">
                <p className="text-[11px] font-semibold opacity-80">Summit Roofing</p>
                <p className="text-base font-bold">Request a free quote</p>
              </div>
              <div className="p-4 space-y-2.5 text-[11px]">
                {[
                  ['Name', 'Maria Lopez'],
                  ['Service', 'Roof repair'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="mb-1 font-semibold text-slate-500">{label}</p>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 font-medium text-slate-800">
                      {value}
                    </div>
                  </div>
                ))}
                <div>
                  <p className="mb-1 font-semibold text-slate-500">What do you need?</p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-700 leading-snug">
                    Leak over the back bedroom after the last storm.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-700">
                    <Camera className="w-3.5 h-3.5 text-slate-400" /> 2 photos
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-700">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Oct 7
                  </div>
                </div>
                <div className="mt-1 rounded-lg bg-[#00828A] py-2.5 text-center text-xs font-bold text-white">
                  Send request
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Arrow ── */}
          <div className="flex justify-center text-[#1C1F23]">
            <ArrowRight className="hidden lg:block w-10 h-10" strokeWidth={2.5} />
            <ArrowDown className="lg:hidden w-9 h-9" strokeWidth={2.5} />
          </div>

          {/* ── Dashboard: the job board ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-md border border-slate-200 bg-[#F4F7F6] p-3 sm:p-4 shadow-lg overflow-hidden"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-bold">Jobs</p>
              <span className="text-[11px] font-semibold text-slate-500">Board view</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {COLUMNS.map((col) => (
                <div key={col.label} className="rounded-xl bg-white/70 border border-slate-200 p-2 space-y-2 min-w-0">
                  <div className="flex items-center gap-1.5 px-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">{col.label}</span>
                    <span className="text-[10px] text-slate-400">{col.cards.length}</span>
                  </div>
                  {col.cards.map((c) => (
                    <div
                      key={c.name}
                      className={`rounded-lg border bg-white p-2 ${
                        c.fresh ? 'border-[#00828A] ring-2 ring-[#00828A]/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="text-[11px] font-bold truncate">{c.name}</p>
                        {c.amount && <span className="text-[10px] font-bold shrink-0">{c.amount}</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{c.service}</p>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <span className="text-[9px] text-slate-400 truncate">{c.date}</span>
                        {c.fresh && <span className="text-[9px] font-bold text-[#00828A] shrink-0">Just now</span>}
                        {c.paid && <span className="text-[9px] font-semibold text-emerald-600 shrink-0">{c.paid}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}