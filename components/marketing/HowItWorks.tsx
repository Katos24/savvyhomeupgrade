'use client';

import React from 'react';
import { Truck, Instagram, MapPin, Mail, Zap, Clock, AlertCircle, ArrowDown, ArrowRight } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

const PILLS = [
  { icon: Truck, label: 'Truck Wraps' },
  { icon: Instagram, label: 'Social Bio' },
  { icon: MapPin, label: 'Yard Signs' },
  { icon: Mail, label: 'Email Footer' },
];

const PAIN_POINTS = [
  { title: 'Leads', old: 'Chasing leads in texts', new: 'Captured automatically' },
  { title: 'Quotes', old: 'Writing quotes by hand', new: 'Sent in 60 seconds' },
  { title: 'Payments', old: 'Manual reminders', new: 'One-click from dashboard' },
  { title: 'Follow-ups', old: 'Forgetting to check in', new: '6AM Daily Digest' },
];

export default function HowItWorks() {
  const { ref, visible } = useFadeIn();

  const animationClass = "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]";
  const visibleClass = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';

  return (
    <section className="py-16 md:py-32 px-5 md:px-6 bg-[#020617] overflow-hidden">
      <div className="max-w-7xl mx-auto" ref={ref}>
        
        

        {/* ── 2. THE HERO (NOW THE SOLUTION) ── */}
        <div className={`${animationClass} ${visibleClass} delay-300`}>
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <div className="text-center lg:text-left order-1">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[#1a6645]/15 border border-[#1a6645]/30">
                <Zap size={12} className="text-[#1a6645] fill-[#1a6645]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a6645]">
                  The Lead2Project System
                </span>
              </div>

              <h3 className="text-white font-black leading-[0.95] tracking-tight mb-8 text-[clamp(2.2rem,5vw,3.8rem)]">
                If your competition<br />
                is getting leads<br />
                while they sleep,<br />
                <span className="text-[#1a6645]">you should be too.</span>
              </h3>

              {/* Desktop Pills */}
              <div className="hidden lg:flex flex-wrap justify-start gap-3">
                {PILLS.map((p) => (
                  <div key={p.label} className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-700 bg-white/5 hover:border-white transition-all group">
                    <p.icon size={14} className="text-[#1a6645]" />
                    <span className="text-[11px] font-bold tracking-wide text-slate-200 uppercase">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The Visual Relief */}
            <div className="relative order-2 w-full max-w-[480px] lg:max-w-none mx-auto lg:translate-x-6">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#1a6645]/20 blur-[100px] rounded-full -z-10" />
              <div className="relative rounded-[2rem] md:rounded-[2.5rem] p-2 border border-[#1a6645]/40 bg-white/5 backdrop-blur-sm shadow-2xl">
                <img src="/images/qrbranded2.webp" alt="System" className="w-full h-auto rounded-[1.8rem] block" />
              </div>
            </div>

            {/* Mobile Pills Grid */}
            <div className="lg:hidden order-3 grid grid-cols-2 gap-2 w-full max-w-[480px] mx-auto pt-8">
              {PILLS.map((p) => (
                <div key={p.label} className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-slate-700 bg-white/5">
                  <p.icon size={14} className="text-[#1a6645]" />
                  <span className="text-[11px] font-bold tracking-wide text-slate-200 uppercase">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}