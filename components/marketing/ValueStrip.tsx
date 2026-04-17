'use client';

import { useRef, useState, useEffect } from 'react';
import { Sunrise, Bell, ArrowRight, AlertCircle, Send, CheckCircle2, Smartphone, Zap } from 'lucide-react';
import Link from 'next/link';

/**
 * Custom hook for scroll-triggered entrance animations
 */
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

/**
 * Left Card: Morning Digest UI
 */
function DailyBriefCard() {
  return (
    <div className="group rounded-[2.5rem] overflow-hidden bg-white border-b-4 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col transition-all hover:shadow-[0_32px_64px_rgba(0,0,0,0.1)] hover:-translate-y-2">
      <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-100 bg-emerald-50/30">
        <div className="w-12 h-12 rounded-2xl bg-[#1a6645] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
          <Sunrise size={24} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">6:00 AM Sync</p>
          <p className="text-xl font-black text-slate-900 leading-tight">Your Morning Digest</p>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <div className="space-y-3 mb-6">
          {[
            { color: '#3b82f6', label: 'Crews Scheduled', value: '2 Teams', sub: 'Torres · Martinez' },
            { color: '#f59e0b', label: 'Receivables', value: '$3,200', sub: '2 Overdue' },
            { color: '#10b981', label: 'New Inquiries', value: '4 New', sub: 'Overnight Sync' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-4 text-left">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: row.color }} />
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{row.label}</p>
                  <p className="text-sm font-black text-slate-800">{row.sub}</p>
                </div>
              </div>
              <p className="text-base font-black text-slate-900">{row.value}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 font-bold leading-relaxed text-left">
          Every morning at 6AM — see your schedule, new leads, and unpaid balances before you leave the house.
        </p>
      </div>
    </div>
  );
}

/**
 * Center Card: Mobile Field Command
 */
function FieldCommandCard() {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border-b-4 border-slate-900 shadow-2xl h-full min-h-[450px] transition-all hover:-translate-y-2 bg-[#0F172A]">
      <img
        src="/images/dashboard-jobsite.webp" 
        alt="Mobile Dashboard in Field"
        className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
      
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20">
        <Bell size={14} className="text-emerald-400 animate-bounce" />
        <p className="text-[11px] font-black text-white uppercase tracking-widest">Live Lead Alert</p>
      </div>

      <div className="absolute bottom-0 inset-x-0 px-8 pb-10 text-left">
       
        <h3 className="text-white font-black text-3xl leading-[0.9] mb-4 tracking-tighter italic">
          Check your board <br/> from anywhere.
        </h3>
        <p className="text-white/70 text-sm font-bold mb-8 leading-snug">
          Job site, truck, or lunch break — your leads and project data are always waiting for you.
        </p>
        <Link
          href="/demo"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-500 transition-all shadow-2xl group/btn"
        >
          See live demo <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Right Card: Payment/AR Automation
 */
function PaymentCard() {
  const [sent, setSent] = useState<number | null>(null);

  const sendReminder = (id: number) => {
    setSent(id);
    setTimeout(() => setSent(null), 3000);
  };

  return (
    <div className="group rounded-[2.5rem] overflow-hidden bg-white border-b-4 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col transition-all hover:shadow-[0_32px_64px_rgba(0,0,0,0.1)] hover:-translate-y-2">
      <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-100 bg-amber-50/50">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200 group-hover:-rotate-6 transition-transform">
          <AlertCircle size={24} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em]">Automated AR</p>
          <p className="text-xl font-black text-slate-900 leading-tight">Never miss a payment</p>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
                <span className="px-2 py-1 rounded-lg bg-red-100 text-[10px] font-black text-red-600 uppercase">2 Overdue</span>
                <span className="px-2 py-1 rounded-lg bg-amber-100 text-[10px] font-black text-amber-600 uppercase">1 Due Soon</span>
            </div>
            <button className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-xl uppercase tracking-widest hover:bg-emerald-700 transition-colors">Send All</button>
        </div>
        <div className="space-y-2 mb-6">
          {[
            { id: 1, name: 'Torres Roofing', amount: '$7,950', status: 'OVERDUE' },
            { id: 2, name: 'Apex Fencing', amount: '$3,100', status: 'OVERDUE' },
          ].map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-emerald-200">
              <div className="text-left">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{r.status}</p>
                <p className="text-sm font-black text-slate-900">{r.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-slate-900">{r.amount}</span>
                <button 
                  onClick={() => sendReminder(r.id)}
                  className={`p-3 rounded-xl transition-all ${sent === r.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-900'}`}
                >
                  {sent === r.id ? <CheckCircle2 size={16} /> : <Send size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 font-bold leading-relaxed text-left">
          Your dashboard flags every overdue payment. One click sends a branded reminder—no chasing required.
        </p>
      </div>
    </div>
  );
}

/**
 * Main Section Component
 */
export default function ValueStrip() {
  const { ref, visible } = useFadeIn();

  return (
    <section 
      ref={ref} 
      className="py-24 sm:py-32 bg-[#F7F5F0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="mb-16 text-center lg:text-left">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 mb-8">
            <Zap size={14} className="text-emerald-700" />
            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800">Built for the field</p>
          </div>
          <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-6">
            Know your day before <br className="hidden sm:block"/>
            <span className="text-[#1a6645]">you start your truck.</span>
          </h2>
        </div>

        {/* Grid Container */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          <DailyBriefCard />
          <FieldCommandCard />
          <PaymentCard />
        </div>
      </div>
    </section>
  );
}