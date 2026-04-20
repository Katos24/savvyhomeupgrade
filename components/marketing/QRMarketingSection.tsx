'use client';

import { QrCode, Smartphone, MousePointer2, CheckCircle, ArrowDown } from 'lucide-react';

export default function QRMarketingSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a0f1e] py-20 sm:py-28">

      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* emerald glow top-left */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1a6645, transparent 70%)' }}
        />
        {/* blue glow bottom-right */}
        <div
          className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1d4ed8, transparent 70%)' }}
        />
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT: Visual (now first on desktop for variety vs. other sections) */}
          <div className="relative order-1">
            <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="/images/qrbranded2.webp"
                alt="Branded QR Marketing"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* bottom fade so the floating card reads cleanly */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Floating card — "live lead" */}
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white text-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl max-w-[220px] border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Live
                </span>
              </div>
              <p className="text-sm font-bold leading-tight text-slate-900">
                Leads hit your board in &lt; 2 seconds.
              </p>
            </div>
          </div>

          {/* RIGHT: Copy */}
          <div className="flex flex-col order-2">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6 self-start">
              <QrCode size={12} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                One link. Every channel.
              </span>
            </div>

            <h2
              className="font-black text-white tracking-[-0.035em] leading-[0.95] mb-5"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Every yard sign is a{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #4ade80, #1a6645)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                digital salesperson.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-white/60 font-medium leading-relaxed mb-10 max-w-lg">
              One QR code. Paste it on your truck, your signs, your Facebook bio — and watch qualified leads land on your board automatically.
            </p>

            <div className="space-y-5">
              {[
                {
                  title: 'Branded QR decals',
                  desc: 'Custom codes for your truck and yard signs that match your brand perfectly.',
                  icon: <CheckCircle size={18} />,
                },
                {
                  title: 'High-conversion intake',
                  desc: 'Mobile-optimized form built specifically for contractors to qualify leads fast.',
                  icon: <MousePointer2 size={18} />,
                },
                {
                  title: 'Instant board sync',
                  desc: 'No manual entry. Lead pops up on your project board with every field pre-filled.',
                  icon: <QrCode size={18} />,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition">
                    <span className="text-emerald-400">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-white text-base sm:text-lg leading-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-white/50 font-medium text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TRANSITION CUE TO NEXT SECTION ── */}
        <div className="flex flex-col items-center mt-20 sm:mt-28">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30 mb-4">
            Then what?
          </p>
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-bounce">
            <ArrowDown size={16} className="text-white/60" />
          </div>
        </div>
      </div>

      {/* ── BOTTOM FADE INTO NEXT (WHITE) SECTION ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #ffffff)' }}
      />
    </section>
  );
}