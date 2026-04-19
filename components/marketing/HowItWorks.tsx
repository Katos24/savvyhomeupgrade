'use client';
import { QrCode, Smartphone, MousePointer2, CheckCircle } from 'lucide-react';

export default function QRMarketingSection() {
  return (
    <section className="py-24 bg-[#020617] overflow-hidden border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT: Visual */}
          <div className="relative">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
              <img
                src="/images/qrbranded2.webp"
                alt="Branded QR Marketing"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* subtle dark vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-white/5 backdrop-blur-md border border-white/10 text-white p-5 rounded-3xl shadow-2xl max-w-[200px] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Mobile Ready</span>
              </div>
              <p className="text-sm font-bold leading-tight text-white">
                Leads hit your board in &lt; 2 seconds.
              </p>
            </div>
          </div>

          {/* RIGHT: Copy */}
          <div className="flex flex-col text-left">
            <div className="inline-flex items-center gap-2 mb-6">
              <QrCode size={18} className="text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                Automated Acquisition
              </span>
            </div>

            <h2 className="text-5xl font-black text-white tracking-tighter leading-[0.9] mb-10">
              Every yard sign is a<br />
              <span className="text-emerald-400">digital salesperson.</span>
            </h2>

            <div className="space-y-7 mb-10">
              {[
                {
                  title: 'Branded QR Decals',
                  desc: 'We generate custom codes for your truck and yard signs that match your brand perfectly.',
                  icon: <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />,
                },
                {
                  title: 'High-Conversion Intake',
                  desc: 'The link goes to a mobile-optimized form designed specifically for contractors to qualify leads fast.',
                  icon: <MousePointer2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />,
                },
                {
                  title: 'Instant Board Sync',
                  desc: 'No manual entry. The lead pops up on your project board with all details pre-filled.',
                  icon: <QrCode size={20} className="text-emerald-400 shrink-0 mt-0.5" />,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  {item.icon}
                  <div>
                    <h4 className="font-black text-white text-lg leading-tight">{item.title}</h4>
                    <p className="text-white/50 font-medium text-sm mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

           
          </div>

        </div>
      </div>
    </section>
  );
}