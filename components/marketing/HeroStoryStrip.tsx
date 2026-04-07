'use client';

import { useRef, useEffect, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';
import { DashboardLaptopMockup } from '@/components/marketing/DashboardLaptopMockup';

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

// ── Desktop horizontal connector ─────────────────────────────────────────────
function HConnector({ visible }: { visible: boolean }) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center shrink-0 px-2"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s 0.4s' }}>
      <div style={{ width: 32, height: 1, background: 'repeating-linear-gradient(90deg,#334155 0,#334155 5px,transparent 5px,transparent 10px)' }} />
      <div className="flex items-center justify-center w-6 h-6 rounded-full my-1" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <ArrowRight size={11} className="text-blue-400" />
      </div>
      <div style={{ width: 32, height: 1, background: 'repeating-linear-gradient(90deg,#334155 0,#334155 5px,transparent 5px,transparent 10px)' }} />
    </div>
  );
}

// ── Mobile vertical connector ─────────────────────────────────────────────────
function VConnector({ visible }: { visible: boolean }) {
  return (
    <div className="flex lg:hidden flex-col items-center my-2"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s 0.4s' }}>
      <div style={{ width: 1, height: 20, background: 'repeating-linear-gradient(180deg,#334155 0,#334155 5px,transparent 5px,transparent 10px)' }} />
      <div className="flex items-center justify-center w-6 h-6 rounded-full my-1" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <ChevronDown size={11} className="text-blue-400" />
      </div>
      <div style={{ width: 1, height: 20, background: 'repeating-linear-gradient(180deg,#334155 0,#334155 5px,transparent 5px,transparent 10px)' }} />
    </div>
  );
}

// ── Step label ────────────────────────────────────────────────────────────────
function StepLabel({ number, title, caption }: { number: string; title: string; caption: string }) {
  return (
    <div className="mb-4 text-center lg:text-left">
      <div className="flex items-center justify-center lg:justify-start gap-2 mb-1.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff' }}>
          {number}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{title}</p>
      </div>
      <p className="text-slate-500 text-[12px] font-medium leading-snug max-w-[280px] mx-auto lg:mx-0">{caption}</p>
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
function Panel({ children, visible, delay }: { children: React.ReactNode; visible: boolean; delay: number }) {
  return (
    <div
      className="flex flex-col items-center lg:items-start flex-1 min-w-0 w-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function HeroStoryStrip() {
  const { ref, visible } = useFadeUp();

  return (
    <div ref={ref} className="w-full">
      <div className="flex flex-col lg:flex-row items-center lg:items-start lg:gap-0 w-full">

        {/* Panel 1 — QR */}
        <Panel visible={visible} delay={0}>
          <StepLabel
            number="1"
            title="Scan or share"
            caption="Your QR code goes on the truck. Customers scan, land on your form, and submit in minutes."
          />
          <div className="w-full max-w-[260px] lg:max-w-full rounded-2xl overflow-hidden border border-white/8 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
            <img
              src="/images/qr-scan-2.png"
              alt="Customer scanning QR code"
              className="w-full h-auto block"
              style={{ maxHeight: 300, objectFit: 'cover', objectPosition: 'center' }}
            />
            <div className="absolute bottom-0 inset-x-0 px-3 py-2" style={{ background: 'linear-gradient(to top,rgba(2,6,23,0.9),transparent)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-white text-[10px] font-black uppercase tracking-widest">Live on your truck</p>
              </div>
            </div>
          </div>
        </Panel>

        <HConnector visible={visible} />
        <VConnector visible={visible} />

        {/* Panel 2 — Form */}
        <Panel visible={visible} delay={0.15}>
          <StepLabel
            number="2"
            title="They fill it out"
            caption="Custom questions, your colors, your logo. Photos, address, budget — collected upfront."
          />
          <div className="flex justify-center w-full">
            <div className="scale-90 lg:scale-100 origin-top">
              <FastDemoForm autoPlay />
            </div>
          </div>
        </Panel>

        <HConnector visible={visible} />
        <VConnector visible={visible} />

        {/* Panel 3 — Dashboard */}
        <Panel visible={visible} delay={0.3}>
          <StepLabel
            number="3"
            title="You close the job"
            caption="Lead lands on your dashboard. Schedule, quote, collect payment, send emails — one click each."
          />
          <div className="w-full overflow-hidden">
            <div className="scale-75 lg:scale-100 origin-top-left lg:origin-top-left -mb-16 lg:mb-0">
              <DashboardLaptopMockup />
            </div>
          </div>
        </Panel>

      </div>
    </div>
  );
}