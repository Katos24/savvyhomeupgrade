'use client';

import React from 'react';
import { Clock, ArrowDown, AlertCircle, Zap } from 'lucide-react';

const COMPARISONS = [
  {
    title: 'Leads',
    old: 'Chasing leads in your texts',
    new: 'Captured automatically on your dashboard',
  },
  {
    title: 'Quotes',
    old: 'Writing quotes by hand',
    new: 'Built and sent in under 60 seconds',
  },
  {
    title: 'Payments',
    old: 'Texting reminders yourself',
    new: 'One-click from your dashboard',
  },
  {
    title: 'Follow-ups',
    old: 'Forgetting to check in',
    new: '6AM digest tells you who to call',
  },
];

export default function RealCost() {
  return (
    <section className="bg-[#020617] py-16 px-4">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <Clock size={12} className="text-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
              The Cost of Doing Nothing
            </span>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            You are losing <br />
            <span className="text-[#1a6645]">16 hours a week.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            That's 2 full working days — every single week — wasted on admin instead of running jobs.
          </p>
          <p className="text-slate-600 text-[10px] mt-2 font-medium">
            Based on research from ServiceNow & Time Etc
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {COMPARISONS.map((item, idx) => (
            <div key={idx} className="relative">
              {/* Old state */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-t-2xl p-4 flex items-center gap-3">
                <AlertCircle size={16} className="text-slate-500 shrink-0" />
                <span className="text-slate-400 text-xs font-medium italic">{item.old}</span>
              </div>

              {/* Connector */}
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#1a6645] rounded-full p-1 border-4 border-[#020617]">
                <ArrowDown size={12} className="text-white" />
              </div>

              {/* New state */}
              <div className="bg-white rounded-b-2xl p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1a6645]/10 p-1.5 rounded-lg shrink-0">
                    <Zap size={16} className="text-[#1a6645] fill-[#1a6645]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-tighter text-[#1a6645] mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-slate-900 text-sm font-bold leading-tight">{item.new}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}