'use client';

import { useState } from 'react';
import { 
  QrCode, Smartphone, Camera, Database, 
  ChevronRight, ChevronLeft, Coffee, BellRing, Heart, Sparkles 
} from 'lucide-react';

export default function FeaturesSlider() {
  const [activeTab, setActiveTab] = useState(0);

  const slides = [
    {
      id: 'marketing',
      tag: 'Marketing on Autopilot',
      icon: <Smartphone size={12} className="text-emerald-400" />,
      title: <>Turn your truck into a <span className="text-emerald-500 italic">lead machine.</span></>,
      desc: "Most yard signs are wasted money because customers forget the number. Use a custom QR code to bridge the gap from your truck to your project board.",
      features: [
        { title: 'Custom Branded Decals', icon: <QrCode size={18} /> },
        { title: 'Photo & Video Briefs', icon: <Camera size={18} /> },
        { title: 'Zero Data Lock-in', icon: <Database size={18} /> }
      ],
      img: "/images/qrbranded2.webp",
      dark: true
    },
    {
      id: 'lifestyle',
      tag: 'The Contractor Lifestyle',
      icon: <Heart size={12} className="text-emerald-600 fill-emerald-600" />,
      title: <>Stop chasing leads. <span className="text-emerald-600 italic">Start owning your time.</span></>,
      desc: "Your competitor is still texting quotes at 9:00 PM. Stay professional even when you’re off the clock with automated systems.",
      features: [
        { title: 'Quiet Weekends', icon: <Coffee size={18} /> },
        { title: 'Automated Reminders', icon: <BellRing size={18} /> },
        { title: 'Live Lead Alerts', icon: <Sparkles size={18} /> }
      ],
      img: "/images/og-image.webp",
      dark: false
    }
  ];

  const current = slides[activeTab];

  return (
    <section id="features" className={`relative transition-colors duration-700 overflow-hidden py-20 sm:py-32 scroll-mt-16 ${current.dark ? 'bg-[#0a0f1e]' : 'bg-white'}`}>
      
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* TAB CONTROLS */}
        <div className="flex gap-4 mb-12 justify-center lg:justify-start">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === idx 
                ? (current.dark ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-white') 
                : (current.dark ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-400')
              }`}
            >
              {idx === 0 ? 'The Tech' : 'The Lifestyle'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* CONTENT BLOCK */}
          <div className={`flex flex-col order-2 ${activeTab === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 self-start ${current.dark ? 'border-emerald-500/30 bg-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
              {current.icon}
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${current.dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {current.tag}
              </span>
            </div>

            <h2 className={`font-black tracking-tight leading-[0.95] mb-6 ${current.dark ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {current.title}
            </h2>

            <p className={`text-base sm:text-lg font-medium leading-relaxed mb-10 max-w-xl ${current.dark ? 'text-white/60' : 'text-slate-600'}`}>
              {current.desc}
            </p>

            <div className="grid grid-cols-1 gap-6">
              {current.features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${current.dark ? 'bg-white/5 text-emerald-400 group-hover:bg-white/10' : 'bg-slate-50 text-emerald-600 group-hover:bg-slate-100'}`}>
                    {f.icon}
                  </div>
                  <h4 className={`font-bold text-sm uppercase tracking-wide ${current.dark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h4>
                </div>
              ))}
            </div>

            {/* NAVIGATION ARROWS */}
            <div className="flex gap-4 mt-12">
              <button 
                onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
                className={`p-4 rounded-full transition-all border ${current.dark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
                className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all ${current.dark ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                Next {activeTab === 0 ? 'Benefit' : 'Feature'}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* VISUAL BLOCK */}
          <div className={`relative order-1 ${activeTab === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className={`relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border transition-all duration-700 ${current.dark ? 'border-white/10' : 'border-slate-200'}`}>
              <img 
                key={current.id}
                src={current.img} 
                alt="Feature visual" 
                className="w-full h-auto object-cover animate-in fade-in zoom-in duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${current.dark ? 'from-black/60' : 'from-slate-900/20'}`} />
            </div>

            {/* Floating Stats Card */}
            <div className={`absolute -bottom-6 -right-6 p-6 rounded-[2rem] shadow-2xl max-w-[200px] border hidden sm:block animate-in slide-in-from-bottom-4 duration-1000 ${current.dark ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-900 text-white border-white/10'}`}>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Success Metric</p>
               <p className="text-lg font-black leading-tight">
                 {activeTab === 0 ? 'Save 4 hours per week on intake.' : 'Zero missed leads while on site.'}
               </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}