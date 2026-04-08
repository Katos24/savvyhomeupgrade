'use client';

import { Instagram, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';

export default function HeroDashboardDemo() {
  return (
    <div className="relative w-full max-w-[640px] mx-auto lg:mx-0">

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[120%] h-[120%] bg-[#1a6645]/10 blur-[120px] rounded-full" />
      </div>

      {/* Browser shell */}
      <div className="relative rounded-[2rem] border border-[#1a6645]/20 bg-[#020617] shadow-2xl overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-white/10 rounded-full" />
            <div className="w-2 h-2 bg-white/10 rounded-full" />
            <div className="w-2 h-2 bg-white/10 rounded-full" />
          </div>
          <div className="flex-1 ml-4 bg-white/5 rounded-md py-1 px-3 text-[9px] font-mono text-slate-500">
            lead2project.com/dashboard
          </div>
        </div>

        {/* Static dashboard skeleton */}
        <div className="p-6 space-y-4 opacity-40">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-2 w-48 bg-white/5 rounded" />
            </div>
            <div className="h-8 w-8 bg-[#1a6645]/20 rounded-full" />
          </div>

          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-white/[0.02] border border-white/5 rounded-2xl" />
          ))}
        </div>

        {/* FLOATING CARDS */}

        {/* New Lead */}
        <div className="absolute top-[15%] -left-10 animate-in-left opacity-0">
          <Card icon={<Instagram size={16} />} label="New Lead" title="Curtis Wilson" sub="via QR scan" color="#22c55e" />
        </div>

        {/* Quote Sent */}
        <div className="absolute bottom-[25%] -right-10 animate-in-up opacity-0">
          <Card icon={<DollarSign size={16} />} label="Quote Sent" title="$5,385" sub="Roof Repair" light />
        </div>

        {/* Scheduled */}
        <div className="absolute -top-6 right-10 animate-in-down opacity-0">
          <Card icon={<Calendar size={16} />} label="Scheduled" title="Apr 12 · 9AM" sub="Auto-confirmed" dark />
        </div>

        {/* Paid */}
        <div className="absolute bottom-6 -left-6 animate-in-scale opacity-0">
          <div className="bg-emerald-500 text-white text-[11px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-xl">
            <CheckCircle2 size={14} />
            Paid $4,250
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes in-down {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes in-scale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-in-left { animation: in-left 0.7s ease forwards 0.3s; }
        .animate-in-up { animation: in-up 0.7s ease forwards 0.8s; }
        .animate-in-down { animation: in-down 0.7s ease forwards 1.2s; }
        .animate-in-scale { animation: in-scale 0.5s ease forwards 1.6s; }
      `}</style>
    </div>
  );
}

/* Reusable Card */
function Card({ icon, label, title, sub, color, light, dark }: any) {
  return (
    <div className={`
      p-3 rounded-2xl shadow-xl flex gap-3 items-center
      ${light ? 'bg-white text-black border border-slate-200' : ''}
      ${dark ? 'bg-[#0F1F3D] text-white border border-white/10' : ''}
      ${!light && !dark ? 'bg-[#1a6645] text-white border border-green-400/30' : ''}
    `}>
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/20">
        {icon}
      </div>
      <div>
        <p className="text-[8px] font-black uppercase opacity-70">{label}</p>
        <p className="text-xs font-black">{title}</p>
        <p className="text-[9px] opacity-60">{sub}</p>
      </div>
    </div>
  );
}