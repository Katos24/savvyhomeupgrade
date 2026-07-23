'use client';

import { Check, X, ArrowDown } from 'lucide-react';

const font = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const COMPARISON_ROWS = [
  { layer: 'Customer Management', us: 'All-in-one dashboard', others: 'Texts & spreadsheets' },
  { layer: 'Estimates & Pricing', us: 'Built-in templates', others: 'Manual, from scratch' },
  { layer: 'Scheduling & Confirmations', us: 'Fully connected', others: 'Disconnected calendar' },
  { layer: 'Invoicing & Payments', us: 'Built-in payment flow', others: 'Separate app or none' },
  { layer: 'Leads & Follow-up', us: 'Automated workflow', others: 'Manual, easy to forget' },
];

export default function ComparisonSection() {
  return (
    <section
      style={{ fontFamily: font }}
      className="bg-slate-100 py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-300/70 text-left"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        
        {/* Left Copy Column */}
        <div>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-600 bg-rose-100/80 border border-rose-200/80 px-3 py-1 rounded-full inline-block mb-3">
            How Lead2Project Compares
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            One connected platform, <span className="text-slate-600 block sm:inline">not disconnected tools.</span>
          </h2>
          <p className="text-slate-700 font-semibold text-base sm:text-lg leading-relaxed">
            Run your entire business from one place — leads, quotes, scheduling, invoicing, and follow-up all working together, instead of stitched across texts, spreadsheets, and separate apps.
          </p>
        </div>

        {/* Right Comparison Table */}
        <div className="rounded-2xl border-2 border-slate-300 bg-white shadow-xl overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-[1.2fr_1fr_1fr] bg-slate-200/80 border-b-2 border-slate-300 px-5 sm:px-6 py-4">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">Operations</span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-800">Lead2Project</span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">Others</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-200">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.layer}
                className="grid grid-cols-[1.2fr_1fr_1fr] items-center px-5 sm:px-6 py-4 sm:py-5 hover:bg-slate-50/80 transition-colors"
              >
                {/* Feature / Layer Name */}
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug pr-2">
                  {row.layer}
                </span>

                {/* Lead2Project Column */}
                <span className="flex items-start gap-1.5 text-xs sm:text-sm font-bold text-emerald-900 leading-snug">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-emerald-700 stroke-[3]" />
                  </div>
                  <span>{row.us}</span>
                </span>

                {/* Others Column */}
                <span className="flex items-start gap-1.5 text-xs sm:text-sm font-medium text-slate-600 leading-snug">
                  <div className="w-5 h-5 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3.5 w-3.5 text-rose-500 stroke-[2.5]" />
                  </div>
                  <span>{row.others}</span>
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Footer Navigation Link */}
      <div className="flex justify-center mt-10">
        <a
          href="#intake-form"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#intake-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="inline-flex items-center gap-2 text-sm font-black text-slate-800 hover:text-emerald-700 bg-slate-200/80 hover:bg-slate-200 border border-slate-300 px-5 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <span>See how it works below</span>
          <ArrowDown className="h-4 w-4 text-emerald-700" />
        </a>
      </div>
    </section>
  );
}