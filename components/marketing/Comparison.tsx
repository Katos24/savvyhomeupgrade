'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

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
        <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${highlight ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-100 border-slate-200'}`}>
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
        <div className="w-5 h-5 rounded-md bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <span
        className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
          highlight
            ? value === 'Pro'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
        }`}
        style={{ fontFamily: font, fontWeight: 900 }}
      >
        {value}
      </span>
    </div>
  );
}

export default function Comparison() {
  return (
    <section className="relative py-12 sm:py-16 px-5 sm:px-6 bg-white">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2
            className="text-2xl sm:text-3xl text-slate-900 leading-tight mb-2"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Built for the solo contractor,{' '}
            <span className="text-emerald-500">not the enterprise.</span>
          </h2>
          <p
            className="text-sm text-slate-400 max-w-sm mx-auto"
            style={{ fontFamily: font, fontWeight: 700 }}
          >
            Jobber is powerful — and priced for businesses with office managers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border-3 border-slate-200 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)]"
          style={{ borderWidth: '3px' }}
        >
          {/* Header row */}
          <div className="grid grid-cols-4 border-b-2 border-slate-200">
            <div className="px-3 py-3 bg-slate-50 border-r-2 border-slate-200">
              <p className="text-[8px] uppercase tracking-widest text-slate-400" style={{ fontFamily: font, fontWeight: 900 }}>Feature</p>
            </div>
            <div className="px-3 py-3 bg-emerald-500 border-r-2 border-emerald-400 text-center">
              <p className="text-[8px] uppercase tracking-widest text-white" style={{ fontFamily: font, fontWeight: 900 }}>Lead2Project</p>
            </div>
            <div className="px-3 py-3 bg-slate-50 border-r-2 border-slate-200 text-center">
              <p className="text-[8px] uppercase tracking-widest text-slate-500" style={{ fontFamily: font, fontWeight: 900 }}>Jobber</p>
            </div>
            <div className="px-3 py-3 bg-slate-50 text-center">
              <p className="text-[8px] uppercase tracking-widest text-slate-500" style={{ fontFamily: font, fontWeight: 900 }}>Sheets</p>
            </div>
          </div>

          {/* Data rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-4 border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
            >
              <div className="px-3 py-2.5 border-r border-slate-100 flex items-center">
                <p className="text-[11px] text-slate-700" style={{ fontFamily: font, fontWeight: 700 }}>{row.feature}</p>
              </div>
              <div className="px-3 py-2.5 border-r border-slate-100 flex items-center justify-center bg-emerald-500/[0.03]">
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
        </motion.div>

    
      </div>
    </section>
  );
}