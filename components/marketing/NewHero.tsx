'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ClipboardList, 
  Wrench, 
  Zap, Send
} from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

// --- Custom Logo Components ---
const StripeLogo = ({ className, color = 'currentColor' }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 60 25" className={className} fill={color}>
    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 3.25 3.58 3.25 1.49 0 2.87-.68 3.49-2.53h3.36c-.79 3.32-3.69 5.38-6.9 5.38-4.5 0-7.39-3.23-7.39-7.46 0-4.32 2.76-7.53 6.97-7.53 4.26 0 6.95 3.33 6.95 7.64v1.25zm-6.9-5.11c-1.46 0-2.8.96-3.13 2.7h6.05c-.24-1.78-1.55-2.7-2.92-2.7zM43.08 19.98h3.81V5.55h-3.81v14.43zm-7.65.37c-3.03 0-4.73-1.63-4.73-4.82V8.92h-3.8V5.55h3.8V1.5l3.81-1.12v5.17h4.86v3.37h-4.86v5.77c0 1.56.71 2.31 2 2.31.96 0 1.9-.38 2.53-.94v3.3c-.92.65-2.29.99-3.61.99zM20.25 19.98h3.8V5.55h-3.8v14.43zM22.14 0c1.33 0 2.4.99 2.4 2.21 0 1.23-1.07 2.22-2.4 2.22-1.32 0-2.39-.99-2.39-2.22 0-1.22 1.07-2.21 2.39-2.21zm-10.45 20.35c-4.44 0-7.23-3.17-7.23-7.47 0-4.22 2.65-7.48 6.95-7.48 4.3 0 6.82 3.34 6.82 7.64v1.25H9.6c.19 1.93 1.6 3.25 3.58 3.25 1.5 0 2.88-.68 3.5-2.53h3.36c-.79 3.32-3.69 5.38-6.9 5.38zm-1.85-8.88c-.24-1.78-1.55-2.7-2.91-2.7-1.46 0-2.81.96-3.14 2.7h6.05zM5.59 13.91c0-1.4-.95-2.26-2.58-2.26-1.58 0-2.5.83-2.5 2.11 0 1.24 1.15 1.77 2.71 2.24 1.83.56 3.28 1.34 3.28 3.4 0 2.2-1.92 3.66-4.5 3.66-2.67 0-4.63-1.46-4.96-3.74h3.58c.24 1.25 1.21 1.67 2 1.67s1.77-.52 1.77-1.46c0-1.07-.94-1.53-2.61-2-1.95-.55-3.37-1.45-3.37-3.52 0-2.14 1.89-3.54 4.14-3.54 2.44 0 4.18 1.18 4.54 3.44H5.59z"/>
  </svg>
);

// True multi-color Google "G" mark — reads correctly regardless of what
// background it sits on, unlike a single-currentColor version.
const GoogleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);
// ------------------------------

const FEATURES = [
  { 
    label: 'Intake Form', 
    desc: 'Custom Qs & QR', 
    icon: ClipboardList, 
    bg: 'bg-blue-600', 
    border: 'border-blue-800' 
  },
  { 
    label: 'Your Branding', 
    desc: 'Templates', 
    icon: Wrench, 
    bg: 'bg-emerald-600', 
    border: 'border-emerald-800' 
  },
  { 
    label: 'Track Jobs', 
    desc: 'Live Kanban', 
    icon: Zap, 
    bg: 'bg-amber-600', 
    border: 'border-amber-800' 
  },
{ 
    label: 'Invoices & Pay', 
    desc: 'Via Stripe',
    icon: Send,
    bg: 'bg-teal-600', 
    border: 'border-teal-800',
  },
  { 
    label: 'Google Reviews', 
    desc: 'Auto Sync',
    customIcon: GoogleLogo,
    bg: 'bg-slate-700', 
    border: 'border-slate-900',
  },
];

export default function SimpleHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-20 pb-24 sm:pt-28 sm:pb-32 px-6 sm:px-8 border-b border-slate-900">
      
      {/* Subtle Dark Background Grid & Orbs */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        
        {/* Simple Pill Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400" style={{ fontFamily: font }}>
            Built for Local Contractors
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl text-white font-black tracking-tight leading-[1.05] mb-6 max-w-3xl mx-auto" style={{ fontFamily: font }}>
          Everything you need for your trade in{' '}
          <span className="text-emerald-400 relative inline-block">
            one simple dashboard.
            <span className="absolute bottom-1 left-0 right-0 h-1.5 bg-emerald-500/20 rounded-full -z-10" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 font-bold text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ fontFamily: font }}>
          The operating system for growing service crews. Capture leads via custom forms, track active bookings, and collect automated review payouts.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup">
            <button 
              className="w-full sm:w-auto bg-emerald-600 text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl border-b-4 border-emerald-800 shadow-md shadow-emerald-900/30 hover:bg-emerald-500 active:translate-y-[2px] active:border-b-2 transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: font }}
            >
              Get Started Free
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          </Link>
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider" style={{ fontFamily: font }}>
            No credit card required
          </span>
        </div>

        {/* Centered Premium Tactile Feature Track */}
        <div className="max-w-4xl mx-auto">
          <div className="relative p-5 pb-6 bg-slate-900/60 border border-slate-800/80 rounded-[2rem] shadow-2xl shadow-black/40 backdrop-blur-sm">
            
            {/* Snap Blocks Wrapper */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 relative z-10">
              {FEATURES.map((item, index) => {
                const IconComponent = item.icon;
                const CustomIcon = item.customIcon;
                return (
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98, y: 1 }}
                    key={index}
                    className={`flex flex-col items-center justify-between text-center p-4 rounded-2xl text-white ${item.bg} border-b-[5px] ${item.border} shadow-lg cursor-pointer transition-all select-none`}
                  >
                    {/* Glassmorphic Icon Bubble — holds either a lucide icon
                        or a real brand logo (Stripe / Google), sized to sit
                        comfortably inside the same bubble. */}
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-[inset_0_1.5px_3px_rgba(255,255,255,0.25)] border border-white/10 mb-4">
                      {CustomIcon ? (
                        <CustomIcon className="h-4 w-auto max-w-[26px]" />
                      ) : IconComponent ? (
                        <IconComponent size={18} strokeWidth={2.5} />
                      ) : null}
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wide leading-none" style={{ fontFamily: font }}>
                        {item.label}
                      </span>
                      <span className="block mt-1.5 text-[8px] text-white/70 font-black leading-tight uppercase tracking-wider opacity-90" style={{ fontFamily: font }}>
                        {item.desc}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Playful Base Track (Tactile Studs) */}
            <div className="absolute bottom-2 left-6 right-6 h-3 flex justify-between px-2 pointer-events-none opacity-10">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-white" />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}