'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ChevronRight, ArrowRight, Camera, Check, Sparkles
} from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

// --- Sub-Components ---

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 280, height: 520 }}>
      {/* Outer Glow */}
      <div className="absolute inset-0 blur-3xl opacity-20 rounded-[3rem] bg-emerald-500" />
      
      {/* Hardware Shell - Dark */}
      <div className="relative w-full h-full rounded-[3.5rem] border-[8px] border-slate-900 bg-slate-950 p-3 shadow-2xl">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-8 h-1 bg-white/10 rounded-full" />
        </div>
        
        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col bg-slate-950">
          {children}
        </div>
        
        {/* Home Bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

function DashboardPhone({ leadVisible }: { leadVisible: boolean }) {
  const leads = [
    { name: 'Sarah Kim', amount: '$5,200', color: '#10b981' },
    { name: 'David Reyes', amount: '$2,400', color: '#f59e0b' },
    { name: 'Marcus T.', amount: '$7,950', color: '#3b82f6' },
  ];

  return (
    <PhoneFrame>
      <div className="pt-8 flex flex-col h-full text-white">
        <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <p className="text-sm font-black tracking-tight">Pipeline</p>
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Sparkles size={12} className="text-emerald-400" />
          </div>
        </div>

        <div className="flex-1 p-3 space-y-3 overflow-hidden">
          <AnimatePresence>
            {leadVisible && (
              <motion.div
                initial={{ y: -50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl overflow-hidden shadow-xl"
              >
                <div className="h-16 relative overflow-hidden">
                  <img src="/images/roof-damage.webp" className="w-full h-full object-cover" alt="roof damage" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-[8px] font-black rounded-full text-white">NEW LEAD</div>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full bg-emerald-500" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-white">Jason Merritt</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-tighter">via QR Scan • Just Now</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-700" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {leads.map((lead) => (
            <div key={lead.name} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-white/5 opacity-60">
              <div className="w-1 h-6 rounded-full" style={{ background: lead.color }} />
              <p className="text-xs font-bold flex-1">{lead.name}</p>
              <p className="text-xs font-black text-emerald-500">{lead.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// --- Main Hero ---

export default function HeroDashboardDemo() {
  const [leadVisible, setLeadVisible] = useState(false);
  const [arrowPulse, setArrowPulse] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'board'>('form');

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    function run() {
      setLeadVisible(false);
      setArrowPulse(false);
      timers.push(setTimeout(() => setArrowPulse(true), 3800));
      timers.push(setTimeout(() => {
        setLeadVisible(true);
        setArrowPulse(false);
        setMobileTab('board');
      }, 4600));
      timers.push(setTimeout(() => setMobileTab('form'), 8500));
      timers.push(setTimeout(run, 10000));
    }
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: 'Customer Submits', icon: <QrCode size={10} /> },
    { label: 'Lead Lands', icon: <Check size={10} /> },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      {/* Step indicators */}
      <div className="flex justify-center gap-2 mb-12">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <motion.div
              animate={{ 
                backgroundColor: (i === 0 && !leadVisible) || (i === 1 && leadVisible) ? '#10b981' : '#f1f5f9',
                color: (i === 0 && !leadVisible) || (i === 1 && leadVisible) ? '#fff' : '#94a3b8'
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-slate-200"
            >
              {s.icon} <span>{s.label}</span>
            </motion.div>
            {i < steps.length - 1 && <div className="w-4 h-px bg-slate-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-center gap-8">
        <div className="transition-transform duration-500 hover:scale-[1.02]">
          <FastDemoForm autoPlay />
        </div>

        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ 
              scale: arrowPulse ? 1.4 : 1,
              opacity: arrowPulse ? 1 : 0.3
            }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: arrowPulse ? '#10b981' : '#fff' }}
          >
            <ArrowRight 
              className={arrowPulse ? 'text-white' : 'text-slate-300'} 
              size={20} 
              strokeWidth={3} 
            />
          </motion.div>
        </div>

        <div className="transition-transform duration-500 hover:scale-[1.02]">
          <DashboardPhone leadVisible={leadVisible} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden relative h-[560px]">
        {/* Tab indicator dots */}
        <div className="flex gap-2 mb-5 justify-center">
          <button
            onClick={() => setMobileTab('form')}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${mobileTab === 'form' ? 'bg-emerald-500 w-6' : 'bg-slate-300'}`}
          />
          <button
            onClick={() => setMobileTab('board')}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${mobileTab === 'board' ? 'bg-blue-500 w-6' : 'bg-slate-300'}`}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mobileTab}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute inset-0"
          >
            {mobileTab === 'form' && <FastDemoForm autoPlay />}
            {mobileTab === 'board' && <DashboardPhone leadVisible={leadVisible} />}
          </motion.div>
        </AnimatePresence>

        {/* Status hints */}
        {mobileTab === 'form' && !leadVisible && (
          <p className="mt-4 text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">
            Customer filling form...
          </p>
        )}
        {mobileTab === 'board' && leadVisible && (
          <p className="mt-4 text-center text-[11px] text-emerald-600 font-bold uppercase tracking-widest">
            ✓ Lead landed instantly
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 mb-4 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Live Sync Enabled</p>
        </div>
        <p className="text-slate-600 text-sm max-w-md">
          Submissions sync to your dashboard in real-time—no refresh needed.
        </p>
      </div>
    </div>
  );
}