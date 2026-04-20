'use client';

import { useState } from 'react';
import { 
  Sunrise, SlidersHorizontal, 
  Camera, BrainCircuit, MailCheck, Download, 
  MousePointerClick, Sparkles 
} from 'lucide-react';

// ─── TRANSITION HEADER ──────────────────────────────────────────────────

function TransitionHeader() {
  return (
    <div className="relative text-center pb-12 lg:pb-32 max-w-5xl mx-auto z-10 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 lg:mb-8">
        <Sparkles size={14} className="text-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">The Operations Engine</span>
      </div>
      {/* Optimized text sizes for mobile */}
      <h2 className="text-4xl sm:text-6xl lg:text-[110px] font-black text-white tracking-tighter leading-[0.9] lg:leading-[0.8] mb-6 lg:mb-10">
        Branded Front-end.<br />
        <span className="text-emerald-400 italic font-serif">Deep-tech back-end.</span>
      </h2>
      <p className="text-slate-400 text-lg lg:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
        We provide the infrastructure to quote, schedule, and close leads in half the time.
      </p>
    </div>
  );
}

// ─── VALUE STRIP COMPONENT ──────────────────────────────────────────────────

export default function ValueStrip() {
  const [activeTab, setActiveTab] = useState(0);

  const FEATURES = [
    {
      id: 'intake',
      icon: <Camera size={22} />,
      badge: 'Visual Intake',
      title: 'The Gritty Truth',
      desc: 'Customers upload photos of the damage before you pick up the phone. Know the scope before you burn fuel.',
      img: '/images/fence-damage.webp', 
    },
    {
      id: 'automation',
      icon: <MousePointerClick size={22} />,
      badge: 'One-Click Admin',
      title: 'The Workflow',
      desc: 'Send branded quotes with Accept/Decline buttons and trigger payment reminders automatically.',
      img: '/images/quote-send-tablet.webp', 
    },
    {
      id: 'intelligence',
      icon: <BrainCircuit size={22} />,
      badge: 'AI + Data',
      title: 'Portability',
      desc: 'Get 6:00 AM Daily Digests and export everything to CSV in one click. Own your data.',
      img: '/images/dashboard-jobsite.webp', 
    },
  ];

  return (
    <section className="relative pt-24 lg:pt-32 bg-[#020617] overflow-hidden">
      
      {/* Background Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] lg:h-[500px] bg-gradient-to-t from-white to-transparent z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <TransitionHeader />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-20 items-start pb-20 lg:pb-32">
          
          {/* TABS - Appears first on Desktop, second on Mobile if you want the visual first */}
          <div className="lg:col-span-5 space-y-3 lg:space-y-4 order-2 lg:order-1">
            {FEATURES.map((item, i) => {
              const isActive = activeTab === i;
              return (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(i)} // Added Click for mobile
                  onMouseEnter={() => setActiveTab(i)}
                  className={`w-full text-left p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] transition-all duration-500 border ${
                    isActive 
                      ? 'bg-white/10 border-white/20 shadow-xl' 
                      : 'bg-transparent border-transparent opacity-50 lg:opacity-40'
                  }`}
                >
                  <div className="flex gap-4 lg:gap-6">
                    <div className={`shrink-0 p-3 h-fit rounded-xl transition-colors ${isActive ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white'}`}>
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">
                        {item.badge}
                      </span>
                      <h3 className="text-xl lg:text-2xl font-black text-white mb-2">{item.title}</h3>
                      {/* Hidden desc on mobile unless active to save space */}
                      <div className={`grid transition-all duration-500 ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed overflow-hidden">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* VISUAL PREVIEW - Sticky on Desktop, Static on Mobile */}
          <div className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-32">
            <div className="relative aspect-video lg:aspect-[4/3] rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
               {FEATURES.map((f, i) => (
                 <img 
                   key={f.id}
                   src={f.img} 
                   alt={f.title}
                   className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${activeTab === i ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                 />
               ))}
            </div>
          </div>
        </div>

        {/* PROOF BAR - Grid 1 on mobile, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-12 lg:py-16 border-t border-slate-200 relative z-20">
          <FeatureIconBox icon={<Download className="text-blue-600" />} title="CSV Export" desc="Take your data anywhere." />
          <FeatureIconBox icon={<Sunrise className="text-orange-500" />} title="6AM Digest" desc="Daily briefings on crews." />
          <FeatureIconBox icon={<MailCheck className="text-emerald-600" />} title="Outbox" desc="Every email verified." />
          <FeatureIconBox icon={<SlidersHorizontal className="text-purple-600" />} title="Custom Pipelines" desc="Built for your trade." />
        </div>
      </div>
    </section>
  );
}

function FeatureIconBox({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex sm:block items-center gap-4 sm:space-y-3">
      <div className="w-12 h-12 shrink-0 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="text-slate-900 font-black text-sm uppercase tracking-tight">{title}</h4>
        <p className="text-slate-500 text-xs font-medium leading-snug">{desc}</p>
      </div>
    </div>
  );
}