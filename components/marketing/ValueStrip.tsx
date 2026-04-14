'use client';

import { useRef, useState, useEffect } from 'react';
import { Sunrise } from 'lucide-react';

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export default function ValueStrip() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={ref}
      className="py-16 sm:py-24 px-5 sm:px-6 overflow-hidden bg-white border-b border-slate-100"
    >
      <div className="max-w-6xl mx-auto">

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >

          {/* LEFT CARD */}
          <div className="rounded-[2rem] overflow-hidden bg-white border border-slate-200 shadow-lg">

            {/* HEADER */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                <Sunrise size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  The Daily Brief
                </p>
                <p className="text-lg font-black text-slate-900 leading-none mt-1">
                  Inbox at 6:00 AM
                </p>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">

                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Morning Digest
                  </p>
                  <p className="text-[10px] text-slate-400">Today</p>
                </div>

                <div className="p-4 space-y-4 bg-white">
                  {[
                    { color: '#6366f1', label: 'Scheduled today', value: '2 jobs', sub: 'Torres · Kim' },
                    { color: '#f59e0b', label: 'Unpaid balances', value: '$3,200', sub: '2 invoices' },
                    { color: '#10b981', label: 'New leads overnight', value: '1 new', sub: 'M. Johnson' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{row.label}</p>
                          <p className="text-[10px] text-slate-400">{row.sub}</p>
                        </div>
                      </div>

                      <p className="text-xs font-black" style={{ color: row.color }}>
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-500 font-medium leading-relaxed">
                Know your day before you even start your truck. Every morning we email a summary of your schedules, leads, and unpaid bills.
              </p>
            </div>
          </div>

          {/* RIGHT IMAGE CARD */}
          <div className="relative overflow-hidden shadow-xl rounded-[2rem] border border-slate-200">

            <img
              src="/images/dashboard-jobsite.png"
              alt="Contractor checking dashboard on job site"
              className="w-full h-full object-cover block"
              loading="lazy"
            />

            {/* overlay */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* text */}
            <div className="absolute bottom-0 inset-x-0 px-6 pb-6">
              <p className="text-white font-black text-lg leading-tight mb-1">
                Check your board from anywhere.
              </p>
              <p className="text-white/70 text-sm">
                Job site, truck, lunch break — leads always waiting.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}