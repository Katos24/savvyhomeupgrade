'use client';

import { useRef, useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fire immediately if already in view on load
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setVisible(true); return; }
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
  { step: '01', title: 'Lead lands on your board',  desc: 'Name, contact, service, photos — all captured from the form. No manual entry, no missed details.',        color: '#6366f1' },
  { step: '02', title: 'Schedule with one click',   desc: 'Assign crew, pick date and time. A branded confirmation email goes to the customer automatically.',         color: '#3b82f6' },
  { step: '03', title: 'Send a quote in seconds',   desc: 'Build from templates or use the AI brief. Customer gets a branded email with accept / decline.',            color: '#10b981' },
  { step: '04', title: 'Collect payment & close',   desc: 'Send a payment reminder in one click. Track every unpaid balance. Every email logged in your outbox.',     color: '#f59e0b' },
];

export default function LeadModalSection() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="features"
      className="py-16 lg:py-24 px-4 sm:px-6 border-y"
      style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 mb-4">
            <CheckCircle2 size={12} className="text-green-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700">Lead lands. You take action.</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.95] text-slate-900 mb-4" style={{ letterSpacing: '-0.03em' }}>
            The only job card<br />
            <span style={{ color: '#1a6645' }}>you'll ever need.</span>
          </h2>
          <p className="text-sm font-normal leading-loose text-slate-400 max-w-md mx-auto">
            Every submission hits your dashboard instantly. Tap a lead and get a full command center — schedule, quote, collect, email. One click each.
          </p>
        </div>

        {/* Grid — demo LEFT, steps RIGHT */}
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >

          {/* LEFT — modal image + phone */}
          <div className="relative order-1" style={{ paddingBottom: 40 }}>

            {/* Glow */}
            <div className="absolute -inset-4 rounded-[32px] blur-2xl -z-10 pointer-events-none"
              style={{ background: 'rgba(26,102,69,0.08)' }} />

            {/* Modal screenshot */}
            <div className="relative rounded-2xl lg:rounded-[2rem] overflow-hidden border border-slate-200 bg-white"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.12)' }}>
              <img src="/images/modal-overview.png" alt="Lead2Project Job Card" className="w-full h-auto block" />
            </div>

            {/* Phone — absolutely positioned, no hidden sm:block so always shows */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: -8,
                zIndex: 10,
                willChange: 'opacity, transform',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease 0.35s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))',
              }}
            >
              <div style={{ transform: 'scale(0.72)', transformOrigin: 'bottom left' }}>
                <CyclingPhoneMockup visible={visible} hideIndicators />
              </div>
            </div>

            {/* Paid badge */}
            <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-slate-100"
              style={{ position: 'absolute', bottom: 0, right: -8, zIndex: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
              <div className="bg-green-100 p-1.5 rounded-lg">
                <CheckCircle2 size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Accepted Quote</p>
                <p className="text-[11px] font-black text-slate-900">$4,250 — Paid</p>
              </div>
            </div>

          </div>

          {/* RIGHT — steps */}
          <div className="flex flex-col gap-6 order-2">
            {STEPS.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black text-white mt-0.5"
                  style={{ background: item.color }}>
                  {item.step}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-[15px] mb-1">{item.title}</p>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}