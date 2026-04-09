'use client';
// components/marketing/ValueStrip.tsx
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
    label: 'Quote and job in one place',
    desc: 'No more spreadsheets or missed texts. Everything about every customer lives in one dashboard.',
  },
  {
    Icon: MousePointerClick,
    value: 'Schedule, quote',
    label: 'Or follow up in a click',
    desc: 'Confirm a job, send a branded quote, or fire off a payment reminder without typing from scratch.',
  },
  {
    Icon: Sunrise,
    value: '6AM digest',
    label: 'Know your day before it starts',
    desc: "Every morning — who's scheduled, what's unpaid, what needs follow-up. Your admin work is already done.",
  },
];

export default function ValueStrip() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-16 sm:py-20 px-5 sm:px-6" style={{ background: '#ffffff', borderBottom: '1px solid #f3f4f6' }}>
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"
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
              {/* Value + icon inline */}
              <div className="flex items-center gap-2 mb-1">
                <stat.Icon size={16} style={{ color: '#1a6645' }} className="shrink-0" />
                <p
                  className="font-black leading-tight"
                  style={{ fontSize: 'clamp(16px, 2.5vw, 24px)', color: '#1a6645', letterSpacing: '-0.02em' }}
                >
                  {stat.value}
                </p>
              </div>

              {/* Label */}
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest mb-2 sm:mb-3" style={{ color: '#0f172a' }}>
                {stat.label}
              </p>

              {/* Description — hidden on mobile */}
              <p className="hidden sm:block text-sm font-medium leading-relaxed" style={{ color: '#6b7280' }}>
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}