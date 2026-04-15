'use client';

import { useRef, useState, useEffect } from 'react';
import { Sunrise, Bell, ArrowRight, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
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
      className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden"
      style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div
          className="mb-10 sm:mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-3">Built for the field</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-lg">
            Know your day before you start your truck.
          </h2>
        </div>

        {/* 3-col grid: Brief | Image | Reminders */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >

          {/* CARD 1 — Daily Brief */}
          <div className="order-1 rounded-3xl overflow-hidden bg-white border-2 border-slate-900/10 shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-slate-900/10 bg-slate-50">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                <Sunrise size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Daily Brief</p>
                <p className="text-sm font-black text-slate-900 leading-tight">Inbox at 6:00 AM</p>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-2xl overflow-hidden border-2 border-slate-900/10">
                <div className="px-4 py-2.5 bg-slate-50 border-b-2 border-slate-900/10 flex justify-between items-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Morning Digest</p>
                  <p className="text-[9px] font-bold text-slate-400">Today</p>
                </div>
                <div className="divide-y-2 divide-slate-900/5">
                  {[
                    { color: '#6366f1', label: 'Scheduled today', value: '2 jobs', sub: 'Torres · Kim' },
                    { color: '#f59e0b', label: 'Unpaid balances', value: '$3,200', sub: '2 invoices' },
                    { color: '#10b981', label: 'New leads overnight', value: '1 new', sub: 'M. Johnson' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 bg-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{row.label}</p>
                          <p className="text-[10px] text-slate-400">{row.sub}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black" style={{ color: row.color }}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500 font-medium leading-relaxed">
                Every morning at 6AM — schedule, new leads, and unpaid balances before you leave the house.
              </p>
            </div>
          </div>

          {/* CARD 2 — Job site image (middle on desktop, bottom on mobile) */}
          <div className="order-3 lg:order-2 relative overflow-hidden rounded-3xl border-2 border-slate-900/10 shadow-sm min-h-[280px] lg:min-h-0">
            <img
              src="/images/dashboard-jobsite.png"
              alt="Contractor checking dashboard on job site"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-lg border-2 border-slate-900/10">
              <Bell size={11} className="text-emerald-600 shrink-0" />
              <p className="text-[10px] font-black text-slate-900">New lead just came in</p>
            </div>

            <div className="absolute bottom-0 inset-x-0 px-5 pb-5">
              <p className="text-white font-black text-lg leading-tight mb-1">Check your board from anywhere.</p>
              <p className="text-white/70 text-xs font-medium mb-4">Job site, truck, lunch break — leads always waiting.</p>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-all border-2 border-white/20"
              >
                See live demo <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* CARD 3 — Payment Reminders */}
          <div className="order-2 lg:order-3 rounded-3xl overflow-hidden bg-white border-2 border-slate-900/10 shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-slate-900/10 bg-amber-50">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Payment Reminders</p>
                <p className="text-sm font-black text-slate-900 leading-tight">Never miss a payment</p>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-2xl overflow-hidden border-2 border-slate-900/10 mb-4">
                <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border-b-2 border-slate-900/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-[10px] font-black text-red-600">2 Overdue</span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] font-black text-amber-600">1 Due Soon</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[9px] font-black shrink-0">
                    Send All
                  </div>
                </div>
                <div className="divide-y-2 divide-slate-900/5">
                  {[
                    { name: 'Torres Roofing', amount: '$7,950', status: 'Overdue', color: 'text-red-600', sent: false },
                    { name: 'Kim Gutters', amount: '$2,400', status: 'Due Apr 18', color: 'text-amber-600', sent: true },
                    { name: 'Apex Fencing', amount: '$3,100', status: 'Overdue', color: 'text-red-600', sent: false },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 bg-white">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 truncate">{r.name}</p>
                        <p className={`text-[10px] font-bold ${r.color}`}>{r.status}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs font-black text-slate-900">{r.amount}</span>
                        <div className={`p-1.5 rounded-lg border-2 ${r.sent ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                          <Send size={9} className={r.sent ? 'text-emerald-600' : 'text-slate-400'} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Your dashboard flags every overdue and upcoming payment. One click sends a branded reminder — no chasing required.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}