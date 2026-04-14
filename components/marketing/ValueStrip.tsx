'use client';

import { useRef, useState, useEffect } from 'react';
import { Link2, LayoutDashboard, MousePointerClick, Sunrise } from 'lucide-react';

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

const STATS = [
  {
    Icon: Link2,
    value: 'A booking page',
    label: 'No website needed',
    desc: 'Share it on your truck, yard signs, or Instagram bio. Customers submit jobs with photos any time.',
  },
  {
    Icon: LayoutDashboard,
    value: 'Every lead',
    label: 'Organized instantly',
    desc: 'No more spreadsheets or missed texts. Everything about every customer lives in one dashboard.',
  },
  {
    Icon: MousePointerClick,
    value: 'Schedule, quote',
    label: 'Or follow up in one click',
    desc: 'Confirm a job, send a branded quote, or fire off a payment reminder without typing from scratch.',
  },
  {
    Icon: Sunrise,
    value: '6AM email',
    label: 'Know your day early',
    desc: "Every morning — who's scheduled, what's unpaid, what needs follow-up. Admin work already done.",
  },
];

export default function ValueStrip() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      className="py-16 sm:py-24 px-5 sm:px-6 overflow-hidden"
      style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* 4-col grid */}
        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-10 lg:gap-12 mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`,
              }}
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-xl bg-[#1a6645]/8 flex items-center justify-center mb-3">
                <stat.Icon size={15} style={{ color: '#1a6645' }} />
              </div>

              {/* Value */}
              <p
                className="font-black leading-tight mb-1"
                style={{ fontSize: 'clamp(15px, 2vw, 22px)', color: '#1a6645', letterSpacing: '-0.03em' }}
              >
                {stat.value}
              </p>

              {/* Label */}
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: '#0f172a' }}>
                {stat.label}
              </p>

              {/* Desc — hidden on mobile */}
              <p className="hidden sm:block text-sm font-normal leading-relaxed" style={{ color: '#94a3b8' }}>
                {stat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Job site photo */}
        <div
          className="flex justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s',
          }}
        >
          <div
            className="relative overflow-hidden shadow-2xl"
            style={{
              maxWidth: 400,
              width: '100%',
              borderRadius: 32,
              border: '1px solid #e2e8f0',
            }}
          >
            <img
              src="/images/dashboard-jobsite.png"
              alt="Contractor checking dashboard on job site"
              className="w-full block"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
              }}
            />
            {/* Gradient overlay — bottom only */}
            <div
              className="absolute bottom-0 inset-x-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                height: '55%',
              }}
            />
            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 px-5 pb-5">
              <p className="text-white font-black text-base leading-snug mb-0.5" style={{ letterSpacing: '-0.02em' }}>
                Check your board from anywhere.
              </p>
              <p className="text-white/55 text-xs font-medium">
                Job site, truck, lunch break — leads always waiting.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}