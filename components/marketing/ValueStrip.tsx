'use client';

import { useState, ReactNode } from 'react';
import { 
  Sunrise, SlidersHorizontal, 
  Camera, BrainCircuit, MailCheck, Download, 
  MousePointerClick, Sparkles 
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────────────────────────

type Feature = {
  id: string;
  icon: ReactNode;
  badge: string;
  title: string;
  desc: string;
  img: string;
};

type FeatureIconBoxProps = {
  icon: ReactNode;
  title: string;
  desc: string;
};

// ─── TRANSITION HEADER ──────────────────────────────────────────────────

function TransitionHeader() {
  return (
    <div className="relative text-center pb-12 lg:pb-24 max-w-5xl mx-auto z-10 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
        <Sparkles size={14} className="text-emerald-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
          The Operations Engine
        </span>
      </div>

      <h2 className="text-4xl sm:text-6xl lg:text-[110px] font-black text-white tracking-tighter leading-[0.9] mb-6 lg:mb-10">
        Branded Front-end.<br />
        <span className="text-emerald-400 italic font-serif">
          Deep-tech back-end.
        </span>
      </h2>

      <p className="text-slate-400 text-lg lg:text-2xl font-medium max-w-2xl mx-auto leading-relaxed px-4">
        We provide the infrastructure to quote, schedule, and close leads in half the time.
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────

export default function ValueStrip() {
  const [activeTab, setActiveTab] = useState(0);

  const FEATURES: Feature[] = [
    {
      id: 'intake',
      icon: <Camera size={20} />,
      badge: 'Visual Intake',
      title: 'The Gritty Truth',
      desc: 'Customers upload photos of the damage before you pick up the phone. Know the scope before you burn fuel.',
      img: '/images/fence-damage.webp',
    },
    {
      id: 'automation',
      icon: <MousePointerClick size={20} />,
      badge: 'One-Click Admin',
      title: 'The Workflow',
      desc: 'Send branded quotes with Accept/Decline buttons and trigger payment reminders automatically.',
      img: '/images/quote-send-tablet.webp',
    },
  {
      id: 'settings', // Updating the ID to match the concept
      icon: <SlidersHorizontal size={20} />, // Swapping to a settings/sliders icon
      badge: 'Mastery', // New high-level concept
      title: 'Full OS Configuration', // Reflecting the "System Configuration" title in the image
      
      // NEW DESC: Integrating the visual and retaining the digest mention
      desc: 'Customize your pipeline, service categories, booking forms, and team roles from one central hub. Master your workflows and get 6:00 AM Daily Digests automatically.',
      
      // The path to your new image from image_1.png
      img: '/images/settings-view.webp',
    },
  ];
  return (
    <section className="relative pt-24 lg:pt-32 bg-[#020617] overflow-hidden">

      {/* ─── BACKGROUND GRADIENT ─── */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-white via-white/90 to-transparent z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <TransitionHeader />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-20 items-start pb-20 lg:pb-32">

          {/* VISUAL */}
          <div className="lg:col-span-7 order-1 lg:sticky lg:top-32">
            <div className="relative aspect-video lg:aspect-[16/10] rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900">

              {FEATURES.map((f, i) => (
                <img
                  key={f.id}
                  src={f.img}
                  alt={f.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    activeTab === i ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                />
              ))}

            </div>
          </div>

          {/* ACCORDION (SLIMMED + TYPED) */}
          <div className="lg:col-span-5 space-y-2 lg:space-y-3 order-2">

            {FEATURES.map((item, i) => {
              const isActive = activeTab === i;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left p-4 lg:p-5 rounded-xl lg:rounded-2xl transition-all duration-300 border ${
  isActive
    ? 'bg-slate-900 border-emerald-500/30 shadow-xl'
    : 'bg-slate-950 border-slate-800 hover:bg-slate-900/70 opacity-90'
}`}
                >
                  <div className="flex gap-3 lg:gap-4 items-start">

                    <div
                      className={`shrink-0 p-2.5 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-emerald-500 text-white scale-105'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="leading-tight">

                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                        {item.badge}
                      </span>

                      <h3 className="text-base lg:text-lg font-black text-white mb-1">
                        {item.title}
                      </h3>

                      <div className={`grid transition-all duration-300 ${
                        isActive
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}>
                        <p className="text-slate-400 text-xs lg:text-sm font-medium leading-relaxed overflow-hidden">
                          {item.desc}
                        </p>
                      </div>

                    </div>

                  </div>
                </button>
              );
            })}

          </div>
        </div>

        {/* PROOF BAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 py-16 border-t border-slate-200 relative z-20">
          <FeatureIconBox icon={<Download className="text-blue-600" />} title="CSV Export" desc="Full portability." />
          <FeatureIconBox icon={<Sunrise className="text-orange-500" />} title="6AM Digest" desc="Daily briefings." />
          <FeatureIconBox icon={<MailCheck className="text-emerald-600" />} title="Outbox" desc="Email tracking." />
          <FeatureIconBox icon={<SlidersHorizontal className="text-purple-600" />} title="Pipelines" desc="Trade specific." />
        </div>

      </div>
    </section>
  );
}

// ─── PROOF BAR ITEM ──────────────────────────────────────────────────────

function FeatureIconBox({ icon, title, desc }: FeatureIconBoxProps) {
  return (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-3">

      <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h4 className="text-slate-900 font-black text-[10px] uppercase tracking-tight">
          {title}
        </h4>
        <p className="text-slate-500 text-[10px] font-medium leading-tight">
          {desc}
        </p>
      </div>

    </div>
  );
}