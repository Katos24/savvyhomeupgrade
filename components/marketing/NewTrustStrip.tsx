'use client';

import { Zap, QrCode, Mail, Download, Wrench } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   TRUST / METRICS STRIP — NO PURPLE
   ─────────────────────────────────────────────────────────
   Light gray-blue background. Dark text. Navy/emerald accents.
   ───────────────────────────────────────────────────────── */

const TRADES = [
  'Roofing', 'Fencing', 'Cleaning', 'Painting',
  'HVAC', 'Electrical', 'Plumbing', 'Landscaping',
];

export default function NewTrustStrip() {
  return (
    <section style={{ background: '#f1f5f9' }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-14 sm:mb-20">
          {[
            { icon: <Zap size={24} className="text-emerald-600" />, value: '2 Minutes', label: 'Setup Time' },
            { icon: <QrCode size={24} className="text-emerald-600" />, value: '1 Link', label: 'Everything You Need' },
            { icon: <Mail size={24} className="text-emerald-600" />, value: '6:00 AM', label: 'Daily Digest' },
            { icon: <Download size={24} className="text-emerald-600" />, value: '100%', label: 'Your Data, Always' },
          ].map((m, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center px-4 py-7 sm:py-8 rounded-2xl bg-white"
              style={{ border: '1px solid #e2e8f0' }}
            >
              <div className="mb-3">{m.icon}</div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
                {m.value}
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Built for trades */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <Wrench size={15} className="text-slate-400" />
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.18em]">
              Built for every trade
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {TRADES.map((trade) => (
              <span
                key={trade}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-sm font-semibold text-slate-700 bg-white"
                style={{ border: '1px solid #e2e8f0' }}
              >
                {trade}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}