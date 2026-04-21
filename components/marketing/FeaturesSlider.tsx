'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  QrCode, Smartphone, Camera, Database, 
  ChevronRight, ChevronLeft, Coffee, BellRing, Heart, Sparkles 
} from 'lucide-react';

export default function FeaturesSlider() {
  const [activeTab, setActiveTab] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive math for the "peek" effect
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      desc: "Your competitor is still texting quotes at 9:00 PM. Stay professional even when you're off the clock with automated systems.",
      features: [
        { title: 'Quiet Weekends', icon: <Coffee size={18} /> },
        { title: 'Automated Reminders', icon: <BellRing size={18} /> },
        { title: 'Live Lead Alerts', icon: <Sparkles size={18} /> }
      ],
      img: "/images/og-image.webp",
      dark: false
    }
  ];

  const handleTabClick = useCallback((idx: number) => {
    setActiveTab(idx);
  }, []);

  const current = slides[activeTab];

  return (
    <section 
      id="features" 
      className={`relative transition-colors duration-1000 overflow-hidden py-12 lg:py-32 scroll-mt-16 ${current.dark ? 'bg-[#0a0f1e]' : 'bg-white'}`}
    >
      <div className="relative max-w-7xl mx-auto">
        
        {/* TAB CONTROLS */}
        <div className="flex gap-2 sm:gap-4 mb-8 lg:mb-16 justify-center lg:justify-start px-6 relative z-20">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => handleTabClick(idx)}
              className={`px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[11px] uppercase tracking-widest transition-all duration-500 ${
                activeTab === idx 
                ? (current.dark ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-900 text-white') 
                : (current.dark ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200')
              }`}
            >
              {idx === 0 ? 'The Tech' : 'The Lifestyle'}
            </button>
          ))}
        </div>

        {/* SLIDER TRACK */}
        <div className="relative px-6 lg:px-8"> 
          <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ 
              // on mobile, we move by 88% to keep a sliver of the next card visible
              transform: `translateX(-${activeTab * (isMobile ? 88 : 100)}%)` 
            }}
          >
            {slides.map((slide, idx) => {
              const isActive = activeTab === idx;
              return (
                <div 
                  key={slide.id}
                  className={`min-w-[85%] lg:min-w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center transition-all duration-1000 ${
                    !isActive ? 'blur-sm lg:blur-md opacity-20 scale-[0.92] lg:scale-95 pointer-events-none' : 'opacity-100 scale-100'
                  } mr-4 lg:mr-0`}
                >
                  
                  {/* VISUAL BLOCK (Order 1 on Mobile, respect slide dark mode) */}
                  <div className={`relative order-1 ${idx === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className={`relative rounded-[1.75rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border transition-all duration-700 ${slide.dark ? 'border-white/10' : 'border-slate-200'}`}>
                      <img 
                        src={slide.img} 
                        alt="Feature visual" 
                        className="w-full h-[280px] lg:h-auto object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${slide.dark ? 'from-black/60' : 'from-slate-900/20'}`} />
                    </div>

                    {/* Floating Metric */}
                    <div className={`absolute -bottom-4 -right-4 p-5 lg:p-7 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-2xl max-w-[160px] lg:max-w-[220px] border hidden xs:block transition-colors duration-700 ${slide.dark ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-900 text-white border-white/10'}`}>
                       <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 lg:mb-2">Success Metric</p>
                       <p className="text-sm lg:text-xl font-black leading-tight tracking-tight">
                         {idx === 0 ? 'Save 4 hours per week on intake.' : 'Zero missed leads while on site.'}
                       </p>
                    </div>
                  </div>

                  {/* CONTENT BLOCK */}
                  <div className={`flex flex-col order-2 ${idx === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5 lg:mb-8 self-start ${slide.dark ? 'border-emerald-500/30 bg-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
                      {slide.icon}
                      <span className={`text-[9px] lg:text-[11px] font-black uppercase tracking-[0.25em] ${slide.dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {slide.tag}
                      </span>
                    </div>

                    <h2 className={`font-black tracking-tighter leading-[1.1] lg:leading-[0.95] mb-5 ${slide.dark ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: 'clamp(1.75rem, 7vw, 4.25rem)' }}>
                      {slide.title}
                    </h2>

                    <p className={`text-[15px] lg:text-lg font-medium leading-relaxed mb-8 lg:mb-12 max-w-xl ${slide.dark ? 'text-white/50' : 'text-slate-600'}`}>
                      {slide.desc}
                    </p>

                    <div className="grid grid-cols-1 gap-4 lg:gap-6">
                      {slide.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${slide.dark ? 'bg-white/5 text-emerald-400 group-hover:bg-white/10' : 'bg-slate-50 text-emerald-600 group-hover:bg-slate-100'}`}>
                            {f.icon}
                          </div>
                          <h4 className={`font-bold text-xs lg:text-sm uppercase tracking-widest ${slide.dark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h4>
                        </div>
                      ))}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-3 lg:gap-4 mt-10 lg:mt-16">
                      <button 
                        onClick={() => handleTabClick(activeTab === 0 ? 1 : 0)}
                        className={`p-4 lg:p-5 rounded-full border transition-all ${slide.dark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => handleTabClick(activeTab === 0 ? 1 : 0)}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 lg:px-12 py-4 lg:py-5 rounded-full font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] transition-all ${slide.dark ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                      >
                        {idx === 0 ? 'Next Benefit' : 'Back to Tech'}
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}