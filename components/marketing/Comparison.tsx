'use client';

import { useFadeIn } from '@/components/marketing/hooks';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ROWS = [
  { feature: 'Price',                    l2p: '$49–$80/mo',      jobber: '$49–$249/mo',     sheets: 'Free'           },
  { feature: 'Setup time',               l2p: '2 minutes',       jobber: 'Hours',            sheets: 'Forever'        },
  { feature: 'Customer booking link',    l2p: true,              jobber: false,              sheets: false            },
  { feature: 'Branded QR code',          l2p: true,              jobber: false,              sheets: false            },
  { feature: 'Lead capture from photos', l2p: true,              jobber: false,              sheets: false            },
  { feature: 'Visual lead board',        l2p: true,              jobber: true,               sheets: false            },
  { feature: 'One-click quote email',    l2p: 'Pro',             jobber: true,               sheets: false            },
  { feature: 'One-click schedule email', l2p: 'Pro',             jobber: true,               sheets: false            },
  { feature: 'Payment reminder email',   l2p: 'Pro',             jobber: true,               sheets: false            },
  { feature: 'Email outbox & history',   l2p: 'Pro',             jobber: true,               sheets: false            },
  { feature: 'Custom pipeline stages',   l2p: true,              jobber: true,               sheets: false            },
  { feature: 'Custom form questions',    l2p: true,              jobber: false,              sheets: false            },
  { feature: 'CSV export',               l2p: true,              jobber: true,               sheets: 'Native'         },
  { feature: 'Daily digest email',       l2p: 'Pro',             jobber: false,              sheets: false            },
  { feature: 'AI quote & brief',         l2p: 'Pro',             jobber: false,              sheets: false            },
  { feature: 'No learning curve',        l2p: true,              jobber: false,              sheets: false            },
];

type CellValue = boolean | string;

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${highlight ? 'bg-[#1a6645]' : 'bg-slate-100'}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 4" stroke={highlight ? '#fff' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  }

  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  // String value
  return (
    <div className="flex justify-center">
      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
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
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-100">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a6645] mb-3">
            How we stack up
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Built for the solo contractor.<br />
            <span className="text-[#1a6645]">Not the enterprise.</span>
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Jobber is powerful — and priced for businesses with office managers. Lead2Project is built for the contractor who runs their own show.
          </p>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
         {/* Column headers */}
          <div className="grid grid-cols-3 sm:grid-cols-4 border-b border-slate-200">
            <div className="px-3 sm:px-4 py-4 bg-slate-50 border-r border-slate-200">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400">Feature</p>
            </div>
            <div className="px-3 sm:px-4 py-4 bg-[#1a6645] border-r border-[#1a6645]/30 text-center">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#4ade80]">Lead2Project</p>
              <p className="text-[9px] sm:text-[10px] text-white/60 mt-0.5">from $49/mo</p>
            </div>
            <div className="px-3 sm:px-4 py-4 bg-slate-50 border-r border-slate-200 text-center sm:border-r">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500">Jobber</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">from $49/mo</p>
            </div>
            <div className="hidden sm:block px-4 py-4 bg-slate-50 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Spreadsheets</p>
              <p className="text-[10px] text-slate-400 mt-0.5">free forever</p>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
          <div
              key={row.feature}
              className={`grid grid-cols-3 sm:grid-cols-4 border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              <div className="px-3 sm:px-4 py-3 border-r border-slate-100 flex items-center">
                <p className="text-[11px] sm:text-[12px] font-semibold text-slate-700">{row.feature}</p>
              </div>
              <div className="px-3 sm:px-4 py-3 border-r border-slate-100 flex items-center justify-center bg-[#1a6645]/[0.03]">
                <Cell value={row.l2p} highlight />
              </div>
              <div className="px-3 sm:px-4 py-3 border-r border-slate-100 sm:border-r flex items-center justify-center">
                <Cell value={row.jobber} />
              </div>
              <div className="hidden sm:flex px-4 py-3 items-center justify-center">
                <Cell value={row.sheets} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            style={{ background: '#1a6645', boxShadow: '0 8px 32px rgba(26,102,69,0.25)' }}
          >
            Start free today
            <ArrowRight size={16} />
          </Link>
          <p className="text-[11px] text-slate-400 font-medium mt-3">14-day free trial · Cancel anytime</p>
        </div>

      </div>
    </section>
  );
}