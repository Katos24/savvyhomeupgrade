'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ClipboardList, 
  Zap, 
  Send, 
  DollarSign,
  CheckCircle2,
  FileText
} from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const BRAND_NAVY = '#0B3C6D';
const ACCENT_TEAL = '#0F766E';

// --- Trade Background Images List ---
const TRADE_IMAGES = [
  { name: 'Roofing', src: '/images/roofing.webp' },
  { name: 'HVAC', src: '/images/hvac.webp' },
  { name: 'Plumbing', src: '/images/plumbing.webp' },
  { name: 'Electrical', src: '/images/electrical.webp' },
];

// --- Custom Google Logo Component ---
const GoogleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const FEATURES = [
  { label: 'Intake Form', desc: 'Custom Branding', icon: ClipboardList, accentColor: 'text-blue-400', bgGlow: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30' },
  { label: 'Faster Estimates', desc: 'Templates', icon: DollarSign, accentColor: 'text-emerald-400', bgGlow: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30' },
  { label: 'Track Jobs', desc: 'Live Kanban', icon: Zap, accentColor: 'text-amber-400', bgGlow: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30' },
  { label: 'Invoices & Pay', desc: 'Via Stripe', icon: Send, accentColor: 'text-teal-400', bgGlow: 'from-teal-500/20 to-teal-600/5', border: 'border-teal-500/30' },
  { label: 'Google Reviews', desc: 'Auto Sync', customIcon: GoogleLogo, accentColor: 'text-slate-200', bgGlow: 'from-slate-500/20 to-slate-600/5', border: 'border-slate-500/30' },
];

export default function CleanHeroWithInvoice() {
  const [currentTradeIndex, setCurrentTradeIndex] = useState(0);

  // Cycle background trade photo every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTradeIndex((prevIndex) => (prevIndex + 1) % TRADE_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-slate-950 pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-8 border-b border-slate-800 text-left"
    >
      
      {/* --- VIVID BACKGROUND TRADE PHOTO --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTradeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={TRADE_IMAGES[currentTradeIndex].src}
              alt={TRADE_IMAGES[currentTradeIndex].name}
              className="w-full h-full object-cover filter brightness-105 saturate-110"
            />
          </motion.div>
        </AnimatePresence>

        {/* Directional Vignette: Dark behind text on left, open to photo on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Split Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-center mb-12 sm:mb-16">
          
          {/* Left Hero Text Column */}
          <div className="lg:col-span-7">
            
            {/* Dynamic Trade Pill */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/30 bg-slate-950/70 px-3.5 py-1 mb-5 backdrop-blur-md shadow-xl"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs font-black text-teal-300 tracking-wide uppercase">
                Built for {TRADE_IMAGES[currentTradeIndex].name} & Local Trades
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white font-black tracking-tight leading-[1.08] mb-5 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Everything you need for your trade in{' '}
              <span className="text-teal-400 relative inline-block">
                one simple dashboard.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-200 font-bold text-base sm:text-lg mb-8 leading-relaxed max-w-xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              The operating system for growing service crews. Capture leads via custom forms, track active bookings, and collect automated review payouts.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/signup">
                <button 
                  style={{ backgroundColor: ACCENT_TEAL }}
                  className="w-full sm:w-auto text-white font-black text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-xl shadow-teal-900/40 hover:brightness-110 transition-all flex items-center justify-center gap-2.5 group"
                >
                  Get Started Free
                  <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-200 text-xs font-bold px-2 py-2 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
                No credit card required
              </div>
            </div>

          </div>

       {/* Right Column: "Paid Invoice" Badge + Standalone Floating Product Showcase */}
<div className="lg:col-span-5 flex flex-col gap-4 items-center lg:items-end mt-4 lg:mt-0">
  
  {/* 1. Transparent Automated Payment Badge */}
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
    className="w-full max-w-sm 
               bg-slate-900/40 
               backdrop-blur-md 
               border border-white/10 
               shadow-lg
               rounded-2xl p-3.5"
  >
    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-0.5 flex items-center justify-between">
      <span>Automated Payment Workflow</span>
      <span className="text-[8px] text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded-md">
        Live Sync
      </span>
    </div>

    <div className="flex items-center justify-between gap-2.5 bg-slate-950/50 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
      
      {/* Invoice Draft Card */}
      <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-700/60 shadow-sm">
        <div className="w-7 h-8 bg-slate-800/80 rounded flex flex-col justify-between p-1 shrink-0 border border-slate-700/50">
          <FileText size={11} className="text-teal-400" />
          <div className="space-y-0.5">
            <div className="h-0.5 w-full bg-slate-600/80 rounded" />
            <div className="h-0.5 w-2/3 bg-slate-600/80 rounded" />
          </div>
        </div>
        <div>
          <span className="block text-[11px] font-black text-slate-100 leading-tight">Invoice #019</span>
          <span className="block text-[9px] font-bold text-slate-400">$9,290.00</span>
        </div>
      </div>

      {/* Glow Arrow */}
      <div className="shrink-0">
        <svg 
          className="w-5 h-5 text-teal-400 filter drop-shadow-[0_0_6px_rgba(20,184,166,0.6)]" 
          viewBox="0 0 50 50" 
          fill="none" 
        >
          <path 
            d="M8 30 C 16 12, 32 12, 40 22" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
          <path 
            d="M32 23 L 41 23 L 39 14" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>

      {/* Paid Badge */}
      <div className="flex flex-col items-end gap-0.5 bg-emerald-950/50 p-2 rounded-lg border border-emerald-500/40 shadow-sm backdrop-blur-xs">
        <div className="flex items-center gap-1 text-emerald-400 font-black text-[11px]">
          <CheckCircle2 size={12} strokeWidth={3} />
          <span>PAID</span>
        </div>
        <span className="text-[9px] font-bold text-slate-200">$9,290.00</span>
      </div>

    </div>
  </motion.div>

  {/* 2. Seamless Floating Image (No Background Box) */}
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
    className="w-full max-w-sm flex items-center justify-center pt-2"
  >
    <img 
      src="/images/heroimagefull.webp" 
      alt="Ridge Line Roofing Dashboard and Mobile Booking Form" 
      className="w-full h-auto object-contain max-h-[340px] filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.75)]"
    />
  </motion.div>

</div>
        </div>

        {/* Bottom Feature Cards Row - Slim Transparent Glass */}
        <div className="max-w-5xl mx-auto">
          <div className="p-3 sm:p-4 bg-slate-900/40 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
              {FEATURES.map((item, index) => {
                const IconComponent = item.icon;
                const CustomIcon = item.customIcon;
                return (
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    key={index}
                    className={`flex flex-col items-center justify-between text-center p-3.5 rounded-xl text-white bg-gradient-to-b ${item.bgGlow} border ${item.border} backdrop-blur-xs shadow-md transition-all`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 mb-2.5">
                      {CustomIcon ? (
                        <CustomIcon className="h-3.5 w-auto max-w-[22px]" />
                      ) : IconComponent ? (
                        <IconComponent size={16} strokeWidth={2.5} className={item.accentColor} />
                      ) : null}
                    </div>
                    <div>
                      <span className="block text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-none text-slate-100">
                        {item.label}
                      </span>
                      <span className="block mt-1 text-[8px] sm:text-[9px] text-slate-400 font-bold leading-tight uppercase tracking-wider">
                        {item.desc}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}