'use client';

import { Truck, Instagram, MapPin, Mail, ExternalLink, Zap } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

const PILLS = [
  { icon: <Truck size={14} />,     label: 'Truck Wraps'  },
  { icon: <Instagram size={14} />, label: 'Social Bio'   },
  { icon: <MapPin size={14} />,    label: 'Yard Signs'   },
  { icon: <Mail size={14} />,      label: 'Email Footer' },
];

export default function HowItWorks() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      className="py-16 md:py-32 px-5 md:px-6 overflow-hidden"
      style={{ backgroundColor: '#020617' }}
    >
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >

          {/* ── TEXT ── */}
          <div className="text-center lg:text-left order-1">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[#1a6645]/15 border border-[#1a6645]/30">
              <Zap size={12} className="text-[#1a6645] fill-[#1a6645]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a6645]">
                Built for Growth
              </span>
            </div>

           <h2
              className="font-black mb-6 text-white"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
            >
              If your competition<br />
              is getting leads<br />
              while they sleep,<br />
              <span style={{ color: '#1a6645' }}>you should be too.</span>
            </h2>

      

            {/* PLACEMENT PILLS — desktop only */}
            <div className="hidden lg:flex flex-wrap justify-start gap-3">
              {PILLS.map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all group"
                >
                  <span className="text-[#1a6645] group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-[11px] font-bold tracking-wide text-slate-800 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── IMAGE ── */}
          <div className="relative order-2 w-full max-w-[560px] lg:max-w-none mx-auto lg:translate-x-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#1a6645]/15 blur-[80px] rounded-full pointer-events-none" style={{ zIndex: -1 }} />

            {/* QR image */}
            <div className="relative rounded-[2rem] md:rounded-[2.5rem] p-1.5 md:p-2 border border-[#1a6645]/30 bg-white/5 backdrop-blur-sm shadow-2xl">
              <img
                src="/images/qrbranded2.png"
                alt="Branded QR System"
                className="w-full h-auto rounded-[1.5rem] md:rounded-[1.8rem] block shadow-2xl"
              />
              <div className="hidden md:block absolute -top-6 -right-6 bg-[#1a6645] border border-[#4ade80]/30 p-5 rounded-2xl shadow-2xl rotate-3 transition-transform hover:rotate-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                    <Instagram size={20} className="text-[#4ade80]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest leading-none mb-1">Bio Link</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1 truncate">
                      lead2project.com/ridgeline-roofing <ExternalLink size={10} className="opacity-50" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PLACEMENT PILLS — mobile only, under image */}
          <div className="lg:hidden order-3 grid grid-cols-2 gap-2 w-full max-w-[560px] mx-auto px-1">
            {PILLS.map(item => (
              <div
                key={item.label}
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 bg-white"
              >
                <span className="text-[#1a6645]">{item.icon}</span>
                <span className="text-[11px] font-bold tracking-wide text-slate-800 uppercase">{item.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}