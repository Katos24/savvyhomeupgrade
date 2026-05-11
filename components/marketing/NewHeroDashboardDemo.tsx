'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ChevronRight, ArrowRight, Check, Sparkles
} from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

// -------------------- PHONE --------------------

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 280, height: 520 }}>
      <div className="absolute inset-0 blur-3xl opacity-20 rounded-[3rem] bg-emerald-500" />

      <div className="relative w-full h-full rounded-[3.5rem] border-[8px] border-slate-900 bg-slate-950 p-3 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-8 h-1 bg-white/10 rounded-full" />
        </div>

        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col bg-slate-950">
          {children}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

// -------------------- DASHBOARD --------------------

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
          <p className="text-sm font-black">Pipeline</p>
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Sparkles size={12} className="text-emerald-400" />
          </div>
        </div>

        <div className="flex-1 p-3 space-y-3 overflow-hidden">
          <AnimatePresence>
            {leadVisible && (
              <motion.div
                initial={{ y: -40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 16 }}
                className="bg-slate-900 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-xl"
              >
                <div className="h-16 relative">
                  <img
                    src="/images/roof-damage.webp"
                    className="w-full h-full object-cover"
                    alt="roof"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-[8px] font-black rounded-full text-white">
                    NEW
                  </div>
                </div>

                <div className="p-4 flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full bg-emerald-500" />
                  <div className="flex-1">
                    <p className="text-xs font-black">Jason Merritt</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                      QR Scan • Just Now
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-slate-700" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {leads.map((lead) => (
            <div
              key={lead.name}
              className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-white/5 opacity-60"
            >
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

// -------------------- MAIN --------------------

export default function HeroDashboardDemo() {
  const [leadVisible, setLeadVisible] = useState(false);
  const [arrowPulse, setArrowPulse] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'board'>('form');

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];

    function run() {
      setLeadVisible(false);
      setArrowPulse(false);

      timers.push(setTimeout(() => setArrowPulse(true), 3000));

      timers.push(setTimeout(() => {
        setLeadVisible(true);
        setArrowPulse(false);
        setMobileTab('board');
      }, 4200));

      timers.push(setTimeout(() => setMobileTab('form'), 8200));
      timers.push(setTimeout(run, 10000));
    }

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: 'Submit', icon: <QrCode size={10} /> },
    { label: 'Live Lead', icon: <Check size={10} /> },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">

      {/* ---------------- STEPS ---------------- */}
      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border bg-white shadow-sm">
              {s.icon} {s.label}
            </div>
            {i < steps.length - 1 && (
              <div className="w-4 h-px bg-slate-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* ---------------- DESKTOP (STAGGERED) ---------------- */}
      <div className="hidden lg:block">
        <div className="relative flex items-center justify-center min-h-[600px]">

          {/* FORM (higher left) */}
          <motion.div
            className="absolute left-0 top-0"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="transform -translate-y-6">
              <FastDemoForm autoPlay />
            </div>
          </motion.div>

          {/* ARROW (center floating) */}
          <motion.div
            animate={{
              scale: arrowPulse ? 1.3 : 1,
              backgroundColor: arrowPulse ? '#10b981' : '#fff'
            }}
            className="z-10 w-14 h-14 rounded-full border shadow-lg flex items-center justify-center"
          >
            <ArrowRight
              className={arrowPulse ? 'text-white' : 'text-slate-400'}
              size={20}
              strokeWidth={3}
            />
          </motion.div>

          {/* DASHBOARD (lower right) */}
          <motion.div
            className="absolute right-0 bottom-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="transform translate-y-6">
              <DashboardPhone leadVisible={leadVisible} />
            </div>
          </motion.div>

        </div>
      </div>

      {/* ---------------- MOBILE ---------------- */}
      <div className="lg:hidden relative">

        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setMobileTab('form')}
            className={`h-2 rounded-full transition-all ${mobileTab === 'form' ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-300'}`}
          />
          <button
            onClick={() => setMobileTab('board')}
            className={`h-2 rounded-full transition-all ${mobileTab === 'board' ? 'w-6 bg-blue-500' : 'w-2 bg-slate-300'}`}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mobileTab}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="min-h-[520px]"
          >
            {mobileTab === 'form' && <FastDemoForm autoPlay />}
            {mobileTab === 'board' && <DashboardPhone leadVisible={leadVisible} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <div className="mt-14 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            Live Sync
          </p>
        </div>

        <p className="text-sm text-slate-500 mt-4 max-w-md mx-auto">
          Leads flow instantly from form → dashboard in real time.
        </p>
      </div>
    </div>
  );
}