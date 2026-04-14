'use client';

import { useRef, useState, useEffect } from 'react';
import { Link2, LayoutDashboard, MousePointerClick, Sunrise, ExternalLink, Instagram } from 'lucide-react';

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}



export default function ValueStrip() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 overflow-hidden bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto">

   

        {/* FEATURE SHOWCASE: DIGEST + PHOTO */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(30px)',
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}
        >
          
          {/* DAILY DIGEST CARD */}
          <div className="rounded-[2rem] overflow-hidden bg-white border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-[#1a6645] flex items-center justify-center shrink-0 shadow-lg shadow-[#1a6645]/20">
                <Sunrise size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#1a6645] uppercase tracking-widest">The Daily Brief</p>
                <p className="text-lg font-black text-slate-900 leading-none mt-1">Inbox at 6:00 AM</p>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Morning Digest</p>
                   <p className="text-[10px] text-slate-400">Today</p>
                </div>
                <div className="p-4 space-y-4 bg-white">
                  {[
                    { dot: '#6366f1', label: 'Scheduled today',     value: '2 jobs',     sub: 'Torres · Kim'  },
                    { dot: '#f59e0b', label: 'Unpaid balances',     value: '$3,200',     sub: '2 invoices'    },
                    { dot: '#10b981', label: 'New leads overnight', value: '1 new',      sub: 'M. Johnson'    },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: row.dot }} />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{row.label}</p>
                          <p className="text-[10px] text-slate-400">{row.sub}</p>
                        </div>
                      </div>
                      <p className="text-xs font-black" style={{ color: row.dot }}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-500 font-medium leading-relaxed">
                Know your day before you even start your truck. Every morning we email a summary of your schedules, leads, and unpaid bills. Open it on your phone before you leave the driveway.
              </p>
            </div>
          </div>

          {/* THE PHOTO CARD */}
          <div className="relative overflow-hidden shadow-2xl rounded-[2rem] border border-slate-200 group">
            <img
              src="/images/dashboard-jobsite.png"
              alt="Contractor checking dashboard on job site"
              className="w-full block group-hover:scale-105 transition-transform duration-700"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
              }}
            />
            {/* Gradient overlay — bottom only */}
            <div
              className="absolute bottom-0 inset-x-0"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                height: '60%',
              }}
            />
            {/* Caption */}
            <div className="absolute bottom-0 inset-x-0 px-6 pb-6">
              <p className="text-white font-black text-lg leading-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
                Check your board from anywhere.
              </p>
              <p className="text-white/60 text-sm font-medium">
                Job site, truck, lunch break — leads always waiting.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}