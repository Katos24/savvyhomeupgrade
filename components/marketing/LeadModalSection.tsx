'use client';

import { useRef, useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

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

const STEPS = [
  {
    step: '01',
    title: 'Lead lands on your board',
    desc: 'Name, contact, service, photos, budget — all captured from the form. No manual entry, no missed details.',
    color: '#6366f1',
  },
  {
    step: '02',
    title: 'Schedule with one click',
    desc: 'Assign crew, pick date and time. A branded confirmation email goes to the customer automatically.',
    color: '#3b82f6',
  },
  {
    step: '03',
    title: 'Send a quote in seconds',
    desc: 'Build from your templates or use the AI brief. Customer gets a branded email with accept / decline.',
    color: '#10b981',
  },
  {
    step: '04',
    title: 'Collect payment & close',
    desc: 'Send a payment reminder in one click. Track every unpaid balance. Every email logged in your outbox.',
    color: '#f59e0b',
  },
];

export default function LeadModalSection() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="features"
      className="py-16 lg:py-24 px-4 sm:px-6 bg-slate-50 border-y border-slate-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 mb-4">
            <CheckCircle2 size={12} className="text-green-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700">
              Lead lands. You take action.
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-slate-900 mb-4">
            The only job card<br />
            <span className="text-[#1a6645]">you'll ever need.</span>
          </h2>
          <p className="text-lg font-medium leading-relaxed text-slate-500 max-w-xl mx-auto">
            Every submission hits your dashboard instantly. Tap a lead and get a full command center — schedule, quote, collect, email. One click each.
          </p>
        </div>

        {/* Main grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >

          {/* LEFT — 4 steps */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            {STEPS.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black text-white mt-0.5"
                  style={{ background: item.color }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-[15px] mb-1">{item.title}</p>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — modal screenshot + bigger phone overlay */}
          <div className="relative order-1 lg:order-2">

            {/* Glow */}
            <div className="absolute -inset-4 bg-green-200/30 rounded-[32px] blur-2xl -z-10" />

            {/* Modal screenshot */}
            <div className="relative rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.18)] border border-slate-200 bg-white">
              <img
                src="/images/modal-overview.png"
                alt="Lead2Project Job Card"
                className="w-full h-auto block"
              />
            </div>

            {/* Floating phone — bigger, bottom left */}
            <div
              className="absolute -bottom-10 -left-6 lg:-left-20 z-10 hidden sm:block"
              style={{
                filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.35))',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
              }}
            >
              <div style={{ transform: 'scale(0.75)', transformOrigin: 'bottom left' }}>
<CyclingPhoneMockup visible={visible} hideIndicators />
              </div>
            </div>

            {/* Floating badge — bottom right */}
            <div className="absolute -bottom-5 -right-3 hidden sm:flex items-center gap-3 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100">
              <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Accepted Quote</p>
                <p className="text-xs font-black text-slate-900">$4,250.00 — Paid</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}