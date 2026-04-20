'use client';

import { Coffee, Zap, Heart, BellRing } from 'lucide-react';

export default function LifestyleSection() {
  return (
    <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* LEFT SIDE: The Emotional Hook */}
          <div className="flex flex-col order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-8 self-start">
              <Heart size={12} className="text-emerald-600 fill-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                The Contractor Lifestyle
              </span>
            </div>

            <h2 className="font-black text-slate-900 tracking-[-0.04em] leading-[0.9] mb-8" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
              Stop bleeding leads. <br />
              <span className="text-emerald-600 italic">Get your life back.</span>
            </h2>

            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed mb-10 max-w-xl">
              Your competitor is still texting quotes from his personal phone at 9:00 PM. 
              With Lead2Project, your board tracks the job while you’re at the game. 
              <span className="text-slate-900 font-bold"> Professionalism on autopilot.</span>
            </p>

            {/* Feature Grid inside the Lifestyle block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <Coffee className="text-emerald-600" size={20} />
                  </div>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Quiet Weekends</h4>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Leads are captured and organized 24/7 without a single phone call or messy text thread.
                </p>
              </div>

              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <BellRing className="text-blue-600" size={20} />
                  </div>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Automated Reminders</h4>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We handle the "payday nag" emails so you don't have to play debt collector.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Visual Proof */}
          <div className="relative order-1 lg:order-2 group">
            {/* Soft decorative glow behind image */}
            <div className="absolute -inset-10 bg-emerald-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-slate-100 bg-slate-50">
              <img 
                src="/images/og-image.png" 
                alt="Contractor relaxing at baseball game" 
                className="w-full h-auto object-cover transform transition-transform duration-[2000ms] group-hover:scale-105"
              />
              
              {/* Floating "Real-time" Alert Badge */}
              <div className="absolute bottom-8 left-8 right-8 sm:left-auto sm:right-8 sm:w-64 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-xl">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Live Alert</p>
                 </div>
                 <p className="text-slate-600 text-xs font-medium">New Lead: <span className="text-slate-900 font-bold">Jason Merritt</span></p>
                 <p className="text-emerald-600 text-[10px] font-bold mt-1 uppercase tracking-tighter">Photos & Video Received</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Subtle bottom divider decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
    </section>
  );
}