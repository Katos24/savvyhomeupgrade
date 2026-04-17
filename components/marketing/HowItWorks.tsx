'use client';

import { QrCode, Smartphone, ArrowRight, MousePointer2, CheckCircle } from 'lucide-react';

export default function QRMarketingSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: The Visual Proof */}
          <div className="relative">
            {/* Main Image from your upload */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
              <img 
                src="/images/qrbranded2.webp" 
                alt="Branded QR Marketing" 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Floating Tag: Direct Intake */}
            <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl max-w-[200px] hidden md:block border-4 border-white">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone size={18} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Mobile Ready</span>
              </div>
              <p className="text-sm font-bold leading-tight">Leads hit your board in &lt; 2 seconds.</p>
            </div>
          </div>

          {/* RIGHT: The Breakdown */}
          <div className="flex flex-col text-left">
            <div className="inline-flex items-center gap-2 mb-6">
              <QrCode size={20} className="text-[#1a6645]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#1a6645]">Automated Acquisition</span>
            </div>

            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
              Every yard sign is a <br/>
              <span className="text-emerald-600">digital salesperson.</span>
            </h2>

            <div className="space-y-8 mb-10">
              {[
                {
                  title: "Branded QR Decals",
                  desc: "We generate custom codes for your truck and yard signs that match your brand perfectly.",
                  icon: <CheckCircle className="text-emerald-500" />
                },
                {
                  title: "High-Conversion Intake",
                  desc: "The link goes to a mobile-optimized form designed specifically for contractors to qualify leads fast.",
                  icon: <MousePointer2 className="text-emerald-500" />
                },
                {
                  title: "Instant Board Sync",
                  desc: "No manual entry. The lead pops up on your project board with all details pre-filled.",
                  icon: <QrCode className="text-emerald-500" />
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">{item.icon}</div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight">{item.title}</h4>
                    <p className="text-slate-500 font-medium text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <p className="text-slate-900 font-black text-lg mb-2">"We get 30% more leads from yard signs now."</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div>
                  <p className="text-xs font-black text-slate-900">Alex Katas</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ridge Line Roofing</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}