'use client';

import React from 'react';
import { Truck, Instagram, MapPin, Mail, Zap, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

const PILLS = [
  { icon: Truck, label: 'Truck Wraps' },
  { icon: Instagram, label: 'Social Bio' },
  { icon: MapPin, label: 'Yard Signs' },
  { icon: Mail, label: 'Email Footer' },
];

const COMPARISON = [
  { title: 'Inbound Leads', old: 'Text threads & lost voicemails', new: 'Instant Dashboard Entry' },
  { title: 'Photos/Files', old: 'Scattered in phone gallery', new: 'Attached to Project Card' },
  { title: 'Quoting', old: 'Manual pen & paper at night', new: 'Sent via SMS in 60s' },
  { title: 'Status', old: "Customer calling for 'Update?'", new: 'Auto-Update Portal' },
];

export default function QRPowerSection() {
  const { ref, visible } = useFadeIn();

  const animationClass = "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]";
  const visibleClass = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';

  return (
    <section className="py-20 md:py-32 px-5 md:px-6 bg-[#020617] overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto">
        
        {/* ── THE HERO BLOCK ── */}
        <div className={`${animationClass} ${visibleClass} delay-200`}>
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 md:mb-32">
            
            <div className="text-center lg:text-left order-1">
              <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-[#1a6645]/15 border border-[#1a6645]/30">
                <Zap size={14} className="text-[#1a6645] fill-[#1a6645]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1a6645]">
                  The Lead2Project QR System
                </span>
              </div>

              <h3 className="text-white font-black leading-[0.95] tracking-tighter mb-8 text-[clamp(2.5rem,6vw,4.2rem)]">
                The hardest working<br />
                member of your team<br />
                <span className="text-[#1a6645]">doesn't need a salary.</span>
              </h3>

              <p className="text-slate-400 text-lg md:text-xl font-medium mb-10 max-w-xl mx-auto lg:mx-0">
                Slap your custom QR code on everything. It doesn't just collect info—it builds the project, files the photos, and notifies your team while you're on a ladder.
              </p>

              {/* Desktop Pills */}
              <div className="hidden lg:flex flex-wrap justify-start gap-3">
                {PILLS.map((p) => (
                  <div key={p.label} className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 hover:border-[#1a6645]/50 hover:bg-white/10 transition-all cursor-default">
                    <p.icon size={16} className="text-[#1a6645]" />
                    <span className="text-[12px] font-black tracking-widest text-slate-200 uppercase">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The Branded QR Visual */}
            <div className="relative order-2 w-full max-w-[500px] lg:max-w-none mx-auto group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#1a6645]/10 blur-[120px] rounded-full" />
              <div className="relative rounded-[2.5rem] p-2 border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                <img 
                  src="/images/qrbranded2.webp" 
                  alt="Branded QR Code Interface" 
                  className="w-full h-auto rounded-[2rem] block" 
                />
              </div>
            </div>

            {/* Mobile Pills Grid */}
            <div className="lg:hidden order-3 grid grid-cols-2 gap-3 w-full max-w-[480px] mx-auto pt-4">
              {PILLS.map((p) => (
                <div key={p.label} className="flex items-center justify-center gap-2.5 px-4 py-4 rounded-2xl border border-white/5 bg-white/5">
                  <p.icon size={14} className="text-[#1a6645]" />
                  <span className="text-[10px] font-bold tracking-widest text-slate-200 uppercase">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── THE "OLD WAY vs NEW WAY" COMPARISON ── */}
        <div className={`${animationClass} ${visibleClass} delay-500`}>
          <div className="rounded-[3rem] bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Pain Point Side */}
              <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5">
                <h4 className="flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-xs mb-8">
                  <AlertCircle size={16} /> The Chaos Method
                </h4>
                <div className="space-y-8">
                  {COMPARISON.map((item, i) => (
                    <div key={i} className="opacity-40">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-tighter mb-1">{item.title}</p>
                      <p className="text-white text-lg font-bold line-through decoration-red-500/50">{item.old}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution Side */}
              <div className="p-8 md:p-12 bg-[#1a6645]/5">
                <h4 className="flex items-center gap-3 text-[#1a6645] font-black uppercase tracking-widest text-xs mb-8">
                  <CheckCircle2 size={16} /> The Lead2Project Way
                </h4>
                <div className="space-y-8">
                  {COMPARISON.map((item, i) => (
                    <div key={i} className="group cursor-default">
                      <p className="text-[#1a6645] text-[10px] font-black uppercase tracking-tighter mb-1">{item.title}</p>
                      <p className="text-white text-lg font-black italic flex items-center gap-2">
                        {item.new}
                        <ArrowRight size={16} className="text-[#1a6645] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}