'use client';

import { Truck, Instagram, MapPin, Mail, ExternalLink, Zap, Sunrise } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

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
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', lineHeight: 0.92, letterSpacing: '-0.04em' }}
            >
              If your competition<br />
              is getting leads<br />
              while they sleep,<br />
              <span style={{ color: '#1a6645' }}>you should be too.</span>
            </h2>

            <p className="text-sm font-light leading-loose mb-8 text-slate-400 max-w-md mx-auto lg:mx-0">
              While you're on a roof or under a sink, customers are scanning your
              truck and submitting jobs with photos. You pull up your dashboard
              at lunch and three leads are waiting — name, number, photos, budget.
              No missed calls. No texts lost in your phone.
            </p>

            {/* PLACEMENT PILLS */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:justify-start gap-3">
              {[
                { icon: <Truck size={14} />,     label: 'Truck Wraps'  },
                { icon: <Instagram size={14} />, label: 'Social Bio'   },
                { icon: <MapPin size={14} />,    label: 'Yard Signs'   },
                { icon: <Mail size={14} />,      label: 'Email Footer' },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-2.5 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#1a6645]/60 transition-all group"
                >
                  <span className="text-[#1a6645] group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-[11px] font-bold tracking-wide text-slate-300 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── IMAGE + DIGEST ── */}
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

            {/* DAILY DIGEST — fully light, readable on mobile */}
            <div className="mt-4 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xl">

            {/* Header */}
<div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
  <div className="w-9 h-9 rounded-xl bg-[#1a6645]/10 flex items-center justify-center shrink-0">
    <Sunrise size={16} className="text-[#1a6645]" />
  </div>
  <div>
    <p className="text-[10px] font-black text-[#1a6645] uppercase tracking-widest">
      Daily Email · Sent at 6AM
    </p>
    <p className="text-base font-black text-slate-900 leading-snug mt-0.5">
      Know your day before you start your truck
    </p>
  </div>
</div>
              {/* Email preview */}
              <div className="p-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">

                  {/* Email header */}
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400">digest@lead2project.com</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5">Ridge Line Roofing · Morning Brief</p>
                      </div>
                      <p className="text-[10px] text-slate-400 shrink-0 ml-3">6:00 AM</p>
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="px-4 py-3 space-y-3 bg-white">
                    {[
                      { dot: '#6366f1', label: 'Scheduled today',     value: '2 jobs',     sub: 'Torres · Kim Gutters'  },
                      { dot: '#f59e0b', label: 'Unpaid balances',     value: '$3,200',     sub: '2 invoices overdue'    },
                      { dot: '#10b981', label: 'New leads overnight', value: '1 new',      sub: 'Michael Johnson'       },
                      { dot: '#ef4444', label: 'Follow-ups needed',   value: '3 contacts', sub: 'Last contact 4d ago'   },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.dot }} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{row.label}</p>
                            <p className="text-[11px] text-slate-400 truncate">{row.sub}</p>
                          </div>
                        </div>
                        <p className="text-sm font-black shrink-0" style={{ color: row.dot }}>{row.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest">
                      Powered by Lead2Project · Pro plan
                    </p>
                  </div>

                </div>
              </div>

             {/* Caption */}
<div className="px-5 pb-4">
  <p className="text-sm text-slate-600 font-medium leading-relaxed">
    Every morning we email you a summary — jobs scheduled today, unpaid balances, and any new leads that came in overnight. Open it on your phone before you leave the driveway.
  </p>
</div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}