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

function DailyBriefCard() {
  return (
    <div className="group rounded-[2.5rem] overflow-hidden bg-white border-b-4 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-emerald-50/30">
        <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200 group-hover:rotate-6 transition-transform">
          <Sunrise size={20} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.15em]">Daily Brief</p>
          <p className="text-base font-black text-slate-900 leading-tight">Inbox at 6:00 AM</p>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/50 p-1">
          <div className="px-4 py-2 flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Morning Digest</p>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            {[
              { color: '#3b82f6', label: 'Scheduled today', value: '2 jobs',  sub: 'Torres · Kim', bg: 'bg-blue-50/50' },
              { color: '#f59e0b', label: 'Unpaid balances', value: '$3,200',  sub: '2 invoices', bg: 'bg-amber-50/50' },
              { color: '#10b981', label: 'New leads overnight', value: '1 new', sub: 'M. Johnson', bg: 'bg-emerald-50/50' },
            ].map((row, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-[1.02]`}>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                  <div>
                    <p className="text-xs font-black text-slate-800">{row.label}</p>
                    <p className="text-[10px] font-bold text-slate-400">{row.sub}</p>
                  </div>
                </div>
                <p className="text-sm font-black" style={{ color: row.color }}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-5 text-sm text-slate-500 font-bold leading-snug">
          Every morning at 6AM — schedule, new leads, and unpaid balances before you leave the house.
        </p>
      </div>
    </div>
  );
}

function JobSiteCard() {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border-b-4 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full min-h-[380px] transition-all hover:-translate-y-1">
      <img
        src="/images/dashboard-jobsite.webp"
        alt="Contractor checking dashboard on job site"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
      
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-2xl border border-white">
        <div className="relative">
          <Bell size={14} className="text-emerald-600 shrink-0" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </div>
        <p className="text-[11px] font-black text-slate-900">New lead just came in</p>
      </div>

      <div className="absolute bottom-0 inset-x-0 px-8 pb-8">
        <h3 className="text-white font-black text-2xl leading-[0.9] mb-3 tracking-tight">Check your board from anywhere.</h3>
        <p className="text-white/80 text-sm font-bold mb-6 leading-tight">Job site, truck, lunch break — leads always waiting.</p>
        <Link
          href="/demo"
          className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#1a6645] text-white font-black text-sm hover:bg-[#145336] transition-all shadow-xl shadow-emerald-900/20 group/btn"
        >
          See live demo <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function PaymentCard() {
  return (
    <div className="group rounded-[2.5rem] overflow-hidden bg-white border-b-4 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-amber-50/50">
        <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200 group-hover:-rotate-6 transition-transform">
          <AlertCircle size={20} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.15em]">Payment Reminders</p>
          <p className="text-base font-black text-slate-900 leading-tight">Never miss a payment</p>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/50 p-1 mb-5 shadow-inner">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-red-100 text-[10px] font-black text-red-600 uppercase tracking-tighter">2 Overdue</span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-[10px] font-black text-amber-600 uppercase tracking-tighter">1 Due Soon</span>
            </div>
            <button className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black hover:bg-slate-800 transition-colors shadow-lg">
              Send All
            </button>
          </div>
          <div className="space-y-1">
            {[
              { name: 'Torres Roofing', amount: '$7,950', status: 'Overdue',    color: 'text-red-600',   sent: false },
              { name: 'Kim Gutters',    amount: '$2,400', status: 'Due Apr 18', color: 'text-amber-600', sent: true  },
              { name: 'Apex Fencing',   amount: '$3,100', status: 'Overdue',    color: 'text-red-600',   sent: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:translate-x-1">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate tracking-tight">{r.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${r.color}`}>{r.status}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-sm font-black text-slate-900">{r.amount}</span>
                  <div className={`p-2 rounded-xl border transition-all ${r.sent ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                    <Send size={12} className={r.sent ? 'text-emerald-600' : 'text-slate-400'} strokeWidth={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500 font-bold leading-snug">
          Your dashboard flags every overdue and upcoming payment. One click sends a branded reminder — no chasing required.
        </p>
      </div>
    </div>
  );
}

export default function ValueStrip() {
  const { ref, visible } = useFadeIn();
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards = [
    { label: 'Daily Brief',  component: <DailyBriefCard />  },
    { label: 'Job Site',     component: <JobSiteCard />     },
    { label: 'Payments',     component: <PaymentCard />     },
  ];

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIdx(idx);
  };

  const scrollTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' });
    setActiveIdx(i);
  };

  return (
    <section
      ref={ref}
      className="py-20 sm:py-32 overflow-hidden relative"
      style={{ background: '#F7F5F0' }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div
          className="mb-16 sm:mb-24 text-center sm:text-left"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Built for the field</p>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-[-0.04em] leading-[0.9] max-w-2xl mx-auto sm:mx-0">
            Know your day before you start your truck.
          </h2>
        </div>

        {/* ── MOBILE: horizontal scroll ── */}
        <div
          className="lg:hidden relative"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-5 pb-8 snap-x snap-mandatory no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {cards.map((card, i) => (
              <div
                key={i}
                className="shrink-0 snap-center first:ml-0"
                style={{ width: 'calc(90vw)', maxWidth: 360 }}
              >
                {card.component}
              </div>
            ))}
          </div>

          {/* Improved Dot indicators */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: activeIdx === i ? 24 : 8,
                  background: activeIdx === i ? '#1a6645' : '#cbd5e1',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── DESKTOP: 3-col grid ── */}
        <div
          className="hidden lg:grid grid-cols-3 gap-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          <DailyBriefCard />
          <JobSiteCard />
          <PaymentCard />
        </div>

      </div>
    </section>
  );
}