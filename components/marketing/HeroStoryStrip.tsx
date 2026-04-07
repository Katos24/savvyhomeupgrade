'use client';

import { useRef, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';
import { DashboardLaptopMockup } from '@/components/marketing/DashboardLaptopMockup';

function useFadeUp(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible, delay };
}

// ── Connector arrow between panels ──────────────────────────────────────────
function Connector({ visible }: { visible: boolean }) {
  return (
    <div
      className="hidden lg:flex flex-col items-center justify-center gap-2 shrink-0"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateX(-8px)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s',
      }}
    >
      {/* Dashed line */}
      <div style={{
        width: 48,
        height: 1,
        background: 'repeating-linear-gradient(90deg, #334155 0px, #334155 6px, transparent 6px, transparent 12px)',
      }} />
      <div className="flex items-center justify-center w-7 h-7 rounded-full"
        style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <ArrowRight size={12} className="text-blue-400" />
      </div>
      <div style={{
        width: 48,
        height: 1,
        background: 'repeating-linear-gradient(90deg, #334155 0px, #334155 6px, transparent 6px, transparent 12px)',
      }} />
    </div>
  );
}

// ── Step label ───────────────────────────────────────────────────────────────
function StepLabel({ number, title, caption }: { number: string; title: string; caption: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff' }}>
          {number}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{title}</p>
      </div>
      <p className="text-slate-400 text-[13px] font-medium leading-snug">{caption}</p>
    </div>
  );
}

// ── Panel wrapper ────────────────────────────────────────────────────────────
function Panel({ children, visible, delay }: { children: React.ReactNode; visible: boolean; delay: number }) {
  return (
    <div
      className="flex flex-col items-center flex-1 min-w-0"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function HeroStoryStrip() {
  const { ref, visible } = useFadeUp();

  return (
    <div ref={ref} className="w-full">

      {/* ── Three panels ── */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-0 w-full">

        {/* Panel 1 — QR scan */}
        <Panel visible={visible} delay={0}>
          <StepLabel
            number="1"
            title="Scan or share"
            caption="Put your QR code on trucks, yard signs, social. Customers scan and land on your form."
          />
          <div className="relative w-full max-w-[320px] rounded-2xl overflow-hidden border border-white/8 shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
            <img
              src="/images/qr-scan-2.png"
              alt="Customer scanning QR code"
              className="w-full h-auto block"
              style={{ maxHeight: 340, objectFit: 'cover', objectPosition: 'center' }}
            />
            {/* Overlay badge */}
            <div className="absolute bottom-0 inset-x-0 px-4 py-3"
              style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.9), transparent)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-white text-[11px] font-black uppercase tracking-widest">Live on your truck right now</p>
              </div>
            </div>
          </div>
        </Panel>

        <Connector visible={visible} />

        {/* Panel 2 — Form */}
        <Panel visible={visible} delay={0.15}>
          <StepLabel
            number="2"
            title="They fill it out"
            caption="Your custom branded form — colors, questions, photos. No app. No account. 2 minutes."
          />
          <div className="flex justify-center">
            <FastDemoForm autoPlay />
          </div>
        </Panel>

        <Connector visible={visible} />

        {/* Panel 3 — Dashboard */}
        <Panel visible={visible} delay={0.3}>
          <StepLabel
            number="3"
            title="You close the job"
            caption="Lead lands on your dashboard. Schedule, quote, collect payment, send emails — one click each."
          />
          <DashboardLaptopMockup />
        </Panel>

      </div>

    </div>
  );
}