'use client';
import { QrCode, Smartphone, MousePointer2, CheckCircle } from 'lucide-react';

export default function QRMarketingSection() {
  return (
    <section className="pt-24 pb-0 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT: Copy */}
          <div className="flex flex-col text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 mb-6">
              <QrCode size={18} className="text-emerald-600" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                Automated Acquisition
              </span>
            </div>
            
            <div className="space-y-7">
              {[
                {
                  title: 'Branded QR Decals',
                  desc: 'We generate custom codes for your truck and yard signs that match your brand perfectly.',
                  icon: <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />,
                },
                {
                  title: 'High-Conversion Intake',
                  desc: 'The link goes to a mobile-optimized form designed specifically for contractors to qualify leads fast.',
                  icon: <MousePointer2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />,
                },
                {
                  title: 'Instant Board Sync',
                  desc: 'No manual entry. The lead pops up on your project board with all details pre-filled.',
                  icon: <QrCode size={20} className="text-emerald-500 shrink-0 mt-0.5" />,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  {item.icon}
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight">{item.title}</h4>
                    <p className="text-slate-500 font-medium text-sm mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Visual */}
          <div className="relative pb-8 md:pb-0 order-1 lg:order-2">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 group">
              <img
                src="/images/qrbranded2.webp"
                alt="Branded QR Marketing"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-2 -right-6 bg-slate-900 border border-slate-700 text-white p-5 rounded-3xl shadow-2xl max-w-[200px] hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Mobile Ready</span>
              </div>
              <p className="text-sm font-bold leading-tight text-white">
                Leads hit your board in &lt; 2 seconds.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}