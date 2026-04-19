'use client';

import { useFadeIn } from '@/components/marketing/hooks';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ROWS = [
  { feature: 'Price',                    l2p: '$49–$80/mo',  jobber: '$49–$249/mo', sheets: 'Free'    },
  { feature: 'Setup time',               l2p: '2 minutes',   jobber: 'Hours',       sheets: 'Forever' },
  { feature: 'Branded QR code',          l2p: true,          jobber: false,         sheets: false     },
  { feature: 'Customer booking link',    l2p: true,          jobber: false,         sheets: false     },
  { feature: 'Lead capture from photos', l2p: true,          jobber: false,         sheets: false     },
  { feature: 'One-click quote email',    l2p: 'Pro',         jobber: true,          sheets: false     },
  { feature: 'Daily digest email',       l2p: 'Pro',         jobber: false,         sheets: false     },
  { feature: 'AI quote & brief',         l2p: 'Pro',         jobber: false,         sheets: false     },
  { feature: 'No learning curve',        l2p: true,          jobber: false,         sheets: false     },
];

type CellValue = boolean | string;

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlight ? 'bg-[#1a6645]' : 'bg-slate-100'}`}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 4" stroke={highlight ? '#fff' : '#64748b'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
        highlight
          ? value === 'Pro'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-[#1a6645]/10 text-[#1a6645]'
          : 'bg-slate-100 text-slate-500'
      }`}>
        {value}
      </span>
    </div>
  );
}

export default function Comparison() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-3xl mx-auto">

        <div
          ref={ref}
          className="text-center mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            Built for the solo contractor,{' '}
            <span className="text-[#1a6645]">not the enterprise.</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Jobber is powerful — and priced for businesses with office managers.
          </p>
        </div>

        <div
          className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
          <div className="grid grid-cols-4 border-b border-slate-200">
            <div className="px-3 py-3 bg-slate-50 border-r border-slate-200">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Feature</p>
            </div>
            <div className="px-3 py-3 bg-[#1a6645] border-r border-[#1a6645]/30 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300">Lead2Project</p>
            </div>
            <div className="px-3 py-3 bg-slate-50 border-r border-slate-200 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Jobber</p>
            </div>
            <div className="px-3 py-3 bg-slate-50 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sheets</p>
            </div>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-4 border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
            >
              <div className="px-3 py-2.5 border-r border-slate-100 flex items-center">
                <p className="text-[11px] font-semibold text-slate-700">{row.feature}</p>
              </div>
              <div className="px-3 py-2.5 border-r border-slate-100 flex items-center justify-center bg-[#1a6645]/[0.03]">
                <Cell value={row.l2p} highlight />
              </div>
              <div className="px-3 py-2.5 border-r border-slate-100 flex items-center justify-center">
                <Cell value={row.jobber} />
              </div>
              <div className="px-3 py-2.5 flex items-center justify-center">
                <Cell value={row.sheets} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#1a6645] shadow-lg shadow-emerald-900/20"
          >
            Start free today
            <ArrowRight size={15} />
          </Link>
          <p className="text-[10px] text-slate-400 mt-2">14-day free trial · Cancel anytime</p>
        </div>

      </div>
    </section>
  );
}