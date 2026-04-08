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

function HConnector({ visible }: { visible: boolean }) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center shrink-0 px-4"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s 0.4s' }}>
      <div style={{ width: 40, height: 1, background: 'repeating-linear-gradient(90deg,#475569 0,#475569 5px,transparent 5px,transparent 10px)' }} />
      <div className="flex items-center justify-center w-7 h-7 rounded-full my-1.5"
        style={{ background: '#1e293b', border: '1px solid #475569' }}>
        <ArrowRight size={12} className="text-blue-400" />
      </div>
      <div style={{ width: 40, height: 1, background: 'repeating-linear-gradient(90deg,#475569 0,#475569 5px,transparent 5px,transparent 10px)' }} />
    </div>
  );
}

function VConnector({ visible }: { visible: boolean }) {
  return (
    <div className="flex lg:hidden flex-col items-center my-6"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s 0.4s' }}>
      <div style={{ width: 1, height: 24, background: 'repeating-linear-gradient(180deg,#475569 0,#475569 5px,transparent 5px,transparent 10px)' }} />
      <div className="flex items-center justify-center w-7 h-7 rounded-full my-1.5"
        style={{ background: '#1e293b', border: '1px solid #475569' }}>
        <ChevronDown size={12} className="text-blue-400" />
      </div>
      <div style={{ width: 1, height: 24, background: 'repeating-linear-gradient(180deg,#475569 0,#475569 5px,transparent 5px,transparent 10px)' }} />
    </div>
  );
}

function StepLabel({ number, title, caption }: { number: string; title: string; caption: string }) {
  return (
    <div className="mb-5 text-center lg:text-left">
      <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff' }}>
          {number}
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">{title}</p>
      </div>
      <p className="text-slate-300 text-[13px] font-medium leading-relaxed max-w-[280px] mx-auto lg:mx-0">{caption}</p>
    </div>
  );
}

export function HeroStoryStrip() {
  const { ref, visible } = useFadeUp();

  const panelStyle = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <div ref={ref} className="w-full">
      <div className="flex flex-col lg:flex-row items-center lg:items-start w-full">

        {/* Panel 1 — QR */}
        <div className="flex flex-col items-center lg:items-start w-full lg:flex-1 min-w-0" style={panelStyle(0)}>
          <StepLabel number="1" title="Scan or share"
            caption="A custom QR code and link — yours the moment you sign up. Put it on your truck, yard signs, or social. Your 24/7 lead machine." />
          <div className="w-full max-w-[280px] lg:max-w-none rounded-2xl overflow-hidden border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <img
              src="/images/qr-scan-2.png"
              alt="Customer scanning QR code"
              className="w-full h-auto block"
              style={{ maxHeight: 280, objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        </div>

        <HConnector visible={visible} />
        <VConnector visible={visible} />

        {/* Panel 2 — Form — shrink-0 so phone never gets crushed */}
        <div className="flex flex-col items-center lg:items-start shrink-0" style={panelStyle(0.15)}>
          <StepLabel number="2" title="They fill it out"
            caption="Customers answer your questions and upload photos. You get a complete lead — ready to quote, instantly." />
          <FastDemoForm autoPlay />
        </div>

        <HConnector visible={visible} />
        <VConnector visible={visible} />

        {/* Panel 3 — Dashboard */}
        <div className="flex flex-col items-center lg:items-start w-full lg:flex-1 min-w-0" style={panelStyle(0.3)}>
          <StepLabel number="3" title="You close the job"
            caption="Every lead lands on your dashboard. Schedule, quote, collect payment, and send branded emails — one click each." />
          <div className="w-full overflow-visible">
  <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', marginBottom: '-15%' }}>
              <DashboardLaptopMockup />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}