'use client';

import { useState } from 'react';
import { Truck, Instagram, MapPin, Mail, LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

export default function HowItWorks() {
  const { ref, visible } = useFadeIn();
  const [leadVisible] = useState(true);

  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 px-4 md:px-6 overflow-hidden"
      style={{ backgroundColor: '#020617', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Section 1: Blast it everywhere ── */}
        <div
          ref={ref}
          className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-24 md:mb-32"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Left: Copy */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Your Link. Everywhere.</span>
            </div>

            <h2 className="font-black tracking-tight leading-[1.05] mb-6 text-white text-4xl md:text-5xl lg:text-6xl">
              If your competition<br />
              is getting leads<br />
              <span className="text-blue-500">while they sleep,</span><br />
              <span className="text-slate-400 italic font-serif">you should be too.</span>
            </h2>

            <p className="text-base md:text-lg font-medium leading-relaxed mb-8 text-slate-400 max-w-md mx-auto lg:mx-0">
              Blast your custom link and QR code everywhere. Every scan, every click, every form submission lands directly on your dashboard — day or night, whether you're on the job or asleep.
            </p>

            {/* Placement pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 max-w-xl mx-auto lg:mx-0">
              {[
                { icon: <Truck size={13} />,      label: 'Truck Wraps',    color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
                { icon: <Instagram size={13} />,  label: 'Social Media',   color: 'text-pink-400',   bg: 'bg-pink-500/10'   },
                { icon: <MapPin size={13} />,     label: 'Yard Signs',     color: 'text-emerald-400',bg: 'bg-emerald-500/10'},
                { icon: <Mail size={13} />,       label: 'Email Footers',  color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
                { icon: <LayoutGrid size={13} />, label: 'Door Hangers',   color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map(item => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/20 ${item.bg}`}
                >
                  <span className={`${item.color} shrink-0`}>{item.icon}</span>
                  <span className="text-[11px] md:text-xs font-black uppercase tracking-wider text-white/90">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Branded QR image */}
          <div className="relative order-1 lg:order-2 w-full max-w-[500px] mx-auto">
            <div className="absolute inset-0 bg-blue-600/20 blur-[80px] rounded-full" />
            <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="/images/qrbranded2.png" alt="QR Feature" className="w-full h-auto block" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}