'use client';

import { useRef, useState, useEffect } from 'react';
import { Sunrise, AlertCircle, Send, CheckCircle2, SlidersHorizontal, Bell, ArrowRight } from 'lucide-react';
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

// ─── CINEMATIC BANNER ─────────────────────────────────────────────────────────

function FieldBanner() {
  return (
    <div className="relative w-full h-64 sm:h-80 rounded-[2rem] overflow-hidden mb-16 lg:mb-24 group">
      <img
        src="/images/dashboard-jobsite.webp"
        alt="Dashboard in the field"
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}
      />

      {/* Live badge */}
      <div className="absolute top-5 right-5 flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5">
        <Bell size={13} className="text-emerald-400 animate-bounce" />
        <p className="text-[11px] font-black text-white uppercase tracking-widest">Live Lead Alert</p>
      </div>

      {/* Bottom copy */}
      <div className="absolute bottom-0 inset-x-0 px-6 sm:px-10 pb-7 sm:pb-9 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] mb-1.5">From the field</p>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter leading-[0.9]">
            Your board.<br />
            <span className="text-emerald-400">Always in your pocket.</span>
          </h2>
        </div>
        <Link
          href="/demo"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-xl shrink-0 group/btn"
        >
          See demo
          <ArrowRight size={15} className="transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

// ─── VISUALS ──────────────────────────────────────────────────────────────────

function DigestVisual() {
  return (
    <div className="relative w-full h-full min-h-[320px] rounded-[1.5rem] overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f4c2a 0%, #1a6645 50%, #15803d 100%)' }}>
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }} />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #86efac, transparent)' }} />
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 self-start">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[11px] font-black text-white uppercase tracking-widest">6:00 AM · Daily Brief</p>
        </div>
        <div className="space-y-2 mt-4">
          {[
            { label: 'Crews Out Today',     value: '2 Teams', accent: '#4ade80', sub: 'Torres · Martinez' },
            { label: 'Overdue Invoices',    value: '$3,200',  accent: '#fbbf24', sub: '2 accounts'        },
            { label: 'New Overnight Leads', value: '4',       accent: '#60a5fa', sub: 'via QR scan'       },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full" style={{ background: row.accent }} />
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{row.label}</p>
                  <p className="text-xs font-bold text-white/80">{row.sub}</p>
                </div>
              </div>
              <p className="text-base font-black text-white">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentVisual() {
  const [sent, setSent] = useState<number | null>(null);
  const send = (id: number) => { setSent(id); setTimeout(() => setSent(null), 2500); };
  return (
    <div className="relative w-full h-full min-h-[320px] rounded-[1.5rem] overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)' }}>
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #fde68a, transparent)' }} />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #fcd34d, transparent)' }} />
      <div className="absolute inset-0 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <p className="text-[11px] font-black text-white uppercase tracking-widest">2 Overdue</p>
          </div>
          <button className="bg-white/15 border border-white/20 rounded-xl px-3 py-2 text-[10px] font-black text-white uppercase tracking-widest">
            Send All
          </button>
        </div>
        <div className="space-y-2 flex-1">
          {[
            { id: 1, name: 'Torres Roofing', amount: '$7,950', days: '14 days late' },
            { id: 2, name: 'Apex Fencing',   amount: '$3,100', days: '7 days late'  },
          ].map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
              <div>
                <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest">{r.days}</p>
                <p className="text-sm font-black text-white">{r.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-white">{r.amount}</span>
                <button
                  onClick={() => send(r.id)}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${sent === r.id ? 'bg-emerald-500 text-white scale-110' : 'bg-white/15 border border-white/20 text-white hover:bg-white/25'}`}
                >
                  {sent === r.id ? <CheckCircle2 size={14} /> : <Send size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/40 font-bold mt-4">Branded reminder sent · Tracked in outbox</p>
      </div>
    </div>
  );
}

function SettingsVisual() {
  return (
    <div className="relative w-full h-full min-h-[320px] rounded-[1.5rem] overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)' }}>
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #93c5fd, transparent)' }} />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #bfdbfe, transparent)' }} />
      <div className="absolute inset-0 p-5 flex flex-col gap-2.5">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 self-start">
          <p className="text-[11px] font-black text-white uppercase tracking-widest">Your rules · Your workflow</p>
        </div>
        {[
          { label: 'Pipeline Stages',  sub: 'New → Quoted → Closed',           dot: '#4ade80' },
          { label: 'Job Categories',   sub: 'Auto-load tasks & quote items',    dot: '#fbbf24' },
          { label: 'Branded Emails',   sub: 'Quotes, reminders, confirmations', dot: '#f472b6' },
          { label: 'Custom Questions', sub: 'Capture exactly what you need',    dot: '#a78bfa' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.dot }} />
            <div className="flex-1">
              <p className="text-sm font-black text-white leading-tight">{item.label}</p>
              <p className="text-[11px] text-white/50 font-medium">{item.sub}</p>
            </div>
          </div>
        ))}
        <p className="text-[11px] text-white/30 font-bold mt-auto">No coding · Set up in minutes</p>
      </div>
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 'digest',
    icon: <Sunrise size={20} />,
    color: '#1a6645',
    eyebrow: '6:00 AM sync',
    title: 'Your morning digest',
    desc: 'Before you leave the house, see which crews are scheduled, which invoices are overdue, and how many new leads came in overnight.',
    visual: <DigestVisual />,
  },
  {
    id: 'payment',
    icon: <AlertCircle size={20} />,
    color: '#d97706',
    eyebrow: 'Automated AR',
    title: 'Never miss a payment',
    desc: 'Your dashboard flags every overdue balance automatically. One click sends a branded reminder — no spreadsheets, no chasing.',
    visual: <PaymentVisual />,
  },
  {
    id: 'settings',
    icon: <SlidersHorizontal size={20} />,
    color: '#1d4ed8',
    eyebrow: 'Your workflow',
    title: 'Built around your business',
    desc: 'Customize pipeline stages, job categories, and branded emails to match exactly how you run your crew. No coding required.',
    visual: <SettingsVisual />,
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ValueStrip() {
  const { ref, visible } = useFadeIn();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── CINEMATIC BANNER ── */}
        <FieldBanner />

        {/* ── DESKTOP ACCORDION ── */}
        <div ref={ref} className="hidden lg:grid lg:grid-cols-2 lg:gap-20 items-center">
          <div
            key={activeTab}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}
          >
            {FEATURES[activeTab].visual}
          </div>

          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease 0.1s' }}>
            <h2 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[0.9] mb-10">
              Know your day<br />before you start<br />
              <span className="text-[#1a6645]">your truck.</span>
            </h2>
            {FEATURES.map((item, i) => {
              const isActive = activeTab === i;
              return (
                <button key={i} onClick={() => setActiveTab(i)} className="w-full text-left outline-none">
                  <div className={`flex items-start gap-4 py-6 border-b border-slate-100 transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-30 hover:opacity-55'}`}>
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300"
                      style={{ background: isActive ? item.color : '#f1f5f9' }}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.eyebrow}</p>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">{item.title}</h3>
                      <div className={`grid transition-all duration-500 ${isActive ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                        <p className="text-slate-500 text-sm font-normal leading-relaxed overflow-hidden">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE ── */}
        <div className="lg:hidden">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-[0.9] mb-8">
            Know your day before<br />
            <span className="text-[#1a6645]">you start your truck.</span>
          </h2>
          {FEATURES.map((item, i) => {
            const isActive = activeTab === i;
            return (
              <div key={i} className="border-b border-slate-100">
                <button onClick={() => setActiveTab(i)} className="w-full text-left outline-none py-5">
                  <div className={`flex items-center gap-4 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-35'}`}>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isActive ? item.color : '#f1f5f9' }}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.eyebrow}</p>
                      <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                    </div>
                    <div className="w-2 h-2 rounded-full shrink-0 transition-all"
                      style={{ background: isActive ? item.color : '#e2e8f0' }} />
                  </div>
                </button>
                <div className={`grid transition-all duration-500 ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                    <div className="mb-5">{item.visual}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Mobile demo link */}
          <div className="mt-8">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg group/btn"
            >
              See live demo
              <ArrowRight size={15} className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}