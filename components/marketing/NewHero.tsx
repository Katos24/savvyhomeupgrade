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
  FileText,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const BRAND_NAVY = '#0B3C6D';
const ACCENT_TEAL = '#0F766E';

// Trade Background Images List
const TRADE_IMAGES = [
  { name: 'Roofing', src: '/images/roofing.webp' },
  { name: 'HVAC', src: '/images/hvac.webp' },
  { name: 'Plumbing', src: '/images/plumbing.webp' },
  { name: 'Electrical', src: '/images/electrical.webp' },
];

// Custom Google Logo Component
const GoogleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const POWERFUL_FEATURES = [
  { 
    id: 'intake',
    label: 'Intake Form', 
    desc: 'Custom Branding', 
    icon: ClipboardList, 
    accentColor: 'text-blue-400', 
    border: 'border-blue-500/30',
    details: [
      'Branded booking form via shareable link or QR code.',
      'Capture photos, site details, and intake questions instantly.',
      'Customized with your business logo and visual style.'
    ]
  },
  { 
    id: 'estimates',
    label: 'Faster Estimates', 
    desc: 'Reusable Templates', 
    icon: DollarSign, 
    accentColor: 'text-emerald-400', 
    border: 'border-emerald-500/30',
    details: [
      'Pre-build pricing templates for common line items.',
      'Quickly adjust quantities or custom scope before sending.',
      'Clients approve or request changes with one click.'
    ]
  },
  { 
    id: 'jobs',
    label: 'Track Jobs', 
    desc: 'Cards & Calendar', 
    icon: Zap, 
    accentColor: 'text-amber-400', 
    border: 'border-amber-500/30',
    details: [
      'Switch between Kanban boards, table, or calendar views.',
      'Custom pipeline stages configured around your team.',
      'Automated confirmation emails on schedule updates.'
    ]
  },
  { 
    id: 'pay',
    label: 'Invoices & Pay', 
    desc: 'Powered by Stripe', 
    icon: Send, 
    accentColor: 'text-teal-400', 
    border: 'border-teal-500/30',
    details: [
      'Send branded digital invoices with direct payment links.',
      'Process card payments securely via Stripe Connect.',
      'Automated reminders for outstanding balances.'
    ]
  },
  { 
    id: 'reviews',
    label: 'Google Reviews', 
    desc: 'Auto Request', 
    customIcon: GoogleLogo, 
    accentColor: 'text-slate-200', 
    border: 'border-slate-500/30',
    details: [
      'Trigger review emails as soon as a job status marks complete.',
      'Direct link pointing to your Google Business Profile.',
      'Build your online reputation on autopilot.'
    ]
  },
];

export default function HumanDesignedHero() {
  const [currentTradeIndex, setCurrentTradeIndex] = useState(0);
  const [openFeature, setOpenFeature] = useState<string | null>(null);

  // Cycle trade background images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTradeIndex((prevIndex) => (prevIndex + 1) % TRADE_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const toggleFeature = (id: string) => {
    setOpenFeature((prev) => (prev === id ? null : id));
  };

  return (
    <section 
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-slate-950 pt-24 sm:pt-36 pb-16 sm:pb-28 px-4 sm:px-8 border-b border-slate-800 text-left"
    >
      {/* Background Image Layer with Lighter Overlay Filters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTradeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={TRADE_IMAGES[currentTradeIndex].src}
              alt={TRADE_IMAGES[currentTradeIndex].name}
              className="w-full h-full object-cover filter brightness-110 opacity-75 saturate-110"
            />
          </motion.div>
        </AnimatePresence>

        {/* Softer Directional Overlay Gradients for Higher Visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Main Hero Split Grid */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-14 sm:mb-20">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7">
            
            {/* Dynamic Trade Pill */}
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-slate-950/80 px-3.5 py-1 mb-5 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black text-teal-300 uppercase tracking-wide">
                Built for {TRADE_IMAGES[currentTradeIndex].name} and Local Service Crews
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl text-white font-black tracking-tight leading-[1.08] mb-5">
              Run your trade better.{' '}
              <span className="text-teal-400 block sm:inline">
                Never chase another invoice.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-white font-medium text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              Capture leads, dispatch crews, send quotes, and auto-collect payments, without bouncing between five clunky apps.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link href="/signup">
                <button 
                  style={{ backgroundColor: ACCENT_TEAL }}
                  className="w-full sm:w-auto text-white font-black text-xs sm:text-sm uppercase tracking-wider px-7 py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300 text-xs font-bold px-2 py-2">
                <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
                No credit card required
              </div>
            </div>

          </div>

          {/* Right Column: Screenshot + Payment Badge */}
          <div className="lg:col-span-5 flex flex-col gap-6 items-center lg:items-end">
            
            {/* Product Screenshot */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-md flex items-center justify-center"
            >
              <img 
                src="/images/heroimagefull.webp" 
                alt="Ridge Line Roofing Dashboard and Mobile Booking Form" 
                className="w-full h-auto object-contain max-h-[360px] sm:max-h-[440px] md:max-h-[480px] filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] scale-105"
              />
            </motion.div>

            {/* Glass Payment Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="w-full max-w-sm bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-3.5"
            >
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 px-0.5 flex items-center justify-between">
                <span>Automated Payment Workflow</span>
                <span className="text-[8px] text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded-md">
                  Live Sync
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-white/10">
                
                {/* Draft Invoice */}
                <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-700/60">
                  <div className="w-7 h-8 bg-slate-800 rounded flex flex-col justify-between p-1 shrink-0 border border-slate-700/50">
                    <FileText size={11} className="text-teal-400" />
                    <div className="space-y-0.5">
                      <div className="h-0.5 w-full bg-slate-600 rounded" />
                      <div className="h-0.5 w-2/3 bg-slate-600 rounded" />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-black text-slate-100 leading-tight">Invoice #019</span>
                    <span className="block text-[9px] font-bold text-slate-400">$9,290.00</span>
                  </div>
                </div>

                {/* Arrow Flow */}
                <div className="shrink-0">
                  <svg className="w-5 h-5 text-teal-400" viewBox="0 0 50 50" fill="none">
                    <path d="M8 30 C 16 12, 32 12, 40 22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <path d="M32 23 L 41 23 L 39 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Paid Badge */}
                <div className="flex flex-col items-end gap-0.5 bg-emerald-950/70 p-2 rounded-lg border border-emerald-500/40">
                  <div className="flex items-center gap-1 text-emerald-400 font-black text-[11px]">
                    <CheckCircle2 size={12} strokeWidth={3} />
                    <span>PAID</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-200">$9,290.00</span>
                </div>

              </div>
            </motion.div>

          </div>

        </div>

        {/* POWERFUL FEATURES ACCORDION SECTION */}
        <div className="pt-8 sm:pt-10 border-t border-white/10">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-teal-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-black text-slate-200 uppercase tracking-widest">
                Powerful Features
              </h3>
            </div>
            <span className="text-[10px] sm:text-xs text-teal-300 font-bold uppercase tracking-wider">
              Tap to expand
            </span>
          </div>

          {/* Interactive Feature Accordions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {POWERFUL_FEATURES.map((item) => {
              const IconComponent = item.icon;
              const CustomIcon = item.customIcon;
              const isOpen = openFeature === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleFeature(item.id)}
                  className={`cursor-pointer rounded-2xl p-4 text-white bg-slate-900/80 border ${item.border} backdrop-blur-md transition-all duration-200 shadow-md ${
                    isOpen ? 'ring-2 ring-teal-400 bg-slate-900/95 shadow-teal-500/10' : 'hover:bg-slate-900/90 hover:border-slate-600'
                  }`}
                >
                  {/* Top Row: Icon + Indicator */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 shrink-0">
                      {CustomIcon ? (
                        <CustomIcon className="h-4 w-auto max-w-[22px]" />
                      ) : IconComponent ? (
                        <IconComponent size={18} strokeWidth={2.5} className={item.accentColor} />
                      ) : null}
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-1 rounded-md ${isOpen ? 'text-teal-300 bg-teal-500/20' : 'text-slate-400'}`}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </div>

                  {/* Card Label & Description */}
                  <div>
                    <span className="block text-sm sm:text-xs font-black uppercase tracking-tight text-white">
                      {item.label}
                    </span>
                    <span className="block text-xs sm:text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">
                      {item.desc}
                    </span>
                  </div>

                  {/* Expandable Drawer */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden mt-3 pt-3 border-t border-white/15"
                      >
                        <ul className="space-y-2">
                          {item.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed">
                              <span className="text-teal-400 font-black text-sm leading-none mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}