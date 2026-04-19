'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, X, Play,
  DollarSign, Calendar, CheckSquare,
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type TourFlow = 'close-job' | 'schedule' | 'tasks';

export type TourStep =
  | 'idle'
  | 'welcome'         // auto modal on page load
  | 'pick-card'       // michael card highlighted, everything else dimmed
  | 'save-quote'
  | 'send-quote'
  | 'accepted'
  | 'mark-paid'
  | 'done'
  | 'schedule-assign'
  | 'schedule-done'
  | 'tasks-check'
  | 'tasks-done';

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useDemoTour() {
  const [tourStep, setTourStep] = useState<TourStep>('welcome');
  const [tourFlow, setTourFlow] = useState<TourFlow>('close-job');

  const startFlow  = (flow: TourFlow) => { setTourFlow(flow); setTourStep('welcome'); };
  const advanceTo  = (s: TourStep)    => setTourStep(s);
  const dismissTour = ()              => setTourStep('idle');

  return { tourStep, tourFlow, startFlow, advanceTo, dismissTour };
}

// ─── WELCOME MODAL — auto shows on page load ──────────────────────────────────

export function WelcomeModal({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip:  () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300, delay: 0.05 }}
       className="w-full max-w-sm rounded-2xl overflow-hidden"
style={{
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
}}
      >
      {/* Top bar */}
<div className="flex items-center justify-between px-5 pt-5 pb-1">
  <div className="flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
      Live Demo
    </span>
  </div>

  <button
    onClick={onSkip}
    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition"
  >
    Skip
  </button>
</div>  {/* ✅ THIS WAS MISSING */}



        {/* Content */}
        <div className="px-5 pt-4 pb-5">
          <h2 className="text-xl font-black text-slate-900 leading-snug mb-2">
  See how a job goes from lead to paid.
</h2>
<p className="text-sm text-slate-500 leading-relaxed mb-5">
  This is a real working dashboard. We'll walk you through one job — start to finish — in under 60 seconds.
</p>

          {/* Steps preview */}
          <div className="space-y-2 mb-6">
            {[
              { n: '1', label: 'A customer submits a roofing job' },
              { n: '2', label: 'You send a quote — they accept'   },
              { n: '3', label: 'You record the payment'           },
            ].map(({ n, label }) => (
             <div key={n} className="flex items-center gap-3">
  <div
    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}
  >
    <span className="text-[9px] font-black text-blue-500">{n}</span>
  </div>
  <span className="text-xs font-medium text-slate-500">{label}</span>
</div>
            ))}
          </div>

          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-white transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            }}
          >
            <Play className="w-4 h-4" />
            Start walkthrough
          </button>

         <p className="text-center text-[10px] text-slate-400 mt-3">
  Takes under 60 seconds
</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CARD SPOTLIGHT — dims everything, highlights Michael's card ───────────────

export function CardSpotlightOverlay({ onSkip }: { onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[400] pointer-events-none"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      {/* Skip button — only interactive element */}
      <div className="pointer-events-auto absolute top-4 right-4">
        <button
          onClick={onSkip}
          className="text-[11px] font-semibold text-white/30 hover:text-white/60 transition px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          Skip tour
        </button>
      </div>

      {/* Instruction badge — centered top */}
      <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 24 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: 'rgba(15,15,26,0.95)',
            border: '1px solid rgba(99,102,241,0.4)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-black text-white whitespace-nowrap">
            Click on Michael Johnson to begin
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── TOUR PROGRESS BAR (inside LeadModal header) ─────────────────────────────

const CLOSE_JOB_STEPS: { label: string; steps: TourStep[] }[] = [
  { label: 'Review',        steps: ['save-quote']           },
  { label: 'Send quote',    steps: ['send-quote', 'accepted'] },
  { label: 'Record payment', steps: ['mark-paid']           },
  { label: 'Done',          steps: ['done']                 },
];

export function TourProgressBar({ step }: { step: TourStep }) {
  const activeIndex = CLOSE_JOB_STEPS.findIndex(s => s.steps.includes(step));

  return (
    <div
      className="flex items-center gap-0 px-4 py-2.5 overflow-x-auto"
      style={{ background: '#1e1b4b', scrollbarWidth: 'none' }}
    >
      {CLOSE_JOB_STEPS.map((s, i) => {
        const isActive   = i === activeIndex;
        const isComplete = i < activeIndex;
        return (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                isComplete ? 'bg-emerald-500' :
                isActive   ? 'bg-white' :
                'bg-white/10'
              }`}>
                {isComplete
                  ? <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  : <span className={`text-[8px] font-black ${isActive ? 'text-blue-900' : 'text-white/25'}`}>{i + 1}</span>
                }
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                isActive ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-white/20'
              }`}>
                {s.label}
              </span>
            </div>
            {i < CLOSE_JOB_STEPS.length - 1 && (
              <div className={`w-6 h-px mx-2 shrink-0 transition-all ${isComplete ? 'bg-emerald-500' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── TOUR TIP BANNER (inside tabs) ───────────────────────────────────────────

export function TourTipBanner({
  message,
  color = 'blue',
  onDismiss,
}: {
  message: string;
  color?: 'blue' | 'sky' | 'violet' | 'emerald';
  onDismiss?: () => void;
}) {
  const palettes = {
    blue:  { bg: 'linear-gradient(135deg,#312e81,#4338ca)', border: '#818cf8' },
    sky:     { bg: 'linear-gradient(135deg,#0c4a6e,#0369a1)', border: '#38bdf8' },
    violet:  { bg: 'linear-gradient(135deg,#3b0764,#6d28d9)', border: '#a78bfa' },
    emerald: { bg: 'linear-gradient(135deg,#052e16,#065f46)', border: '#34d399' },
  };
  const p = palettes[color];

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
      style={{ background: p.bg, border: `2px solid ${p.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
    >
      <div className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 mt-1" />
      <p className="text-sm font-black text-white flex-1 leading-snug">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-white/30 hover:text-white/60 transition shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── FLOW DONE CARD ───────────────────────────────────────────────────────────

export function FlowDoneCard({
  title, subtitle, body, onDismiss, accentColor,
}: {
  title: string; subtitle: string; body: string;
  onDismiss: () => void; accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg,#0f1729,#1e293b)',
        border: `2px solid ${accentColor}60`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accentColor + '20' }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <p className="text-xs font-bold mt-0.5" style={{ color: accentColor }}>{subtitle}</p>
        </div>
      </div>
      <p className="text-xs text-white/40 leading-relaxed mb-4">{body}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Link href="/signup"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black text-white transition hover:opacity-90 active:scale-95"
          style={{ background: `linear-gradient(135deg,${accentColor}cc,${accentColor})` }}
        >
          Start free trial <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button onClick={onDismiss}
          className="sm:flex-none px-4 py-3 rounded-xl text-xs font-bold text-white/40 hover:text-white/60 border border-white/10 hover:bg-white/5 transition text-center"
        >
          Explore dashboard
        </button>
      </div>
    </motion.div>
  );
}

// ─── SECONDARY BANNER (after tour, shows other flows) ────────────────────────

export function DemoTourBanner({
  darkMode,
  onStart,
  onDismiss,
}: {
  darkMode: boolean;
  onStart: (flow: TourFlow) => void;
  onDismiss: () => void;
}) {
  const flows: { flow: TourFlow; icon: React.ElementType; iconColor: string; time: string; title: string; sub: string }[] = [
    { flow: 'schedule',  icon: Calendar,    iconColor: '#38bdf8', time: '1 min',  title: 'Schedule a job', sub: 'Assign crew, set date and time' },
    { flow: 'tasks',     icon: CheckSquare, iconColor: '#a78bfa', time: '30 sec', title: 'Track tasks',    sub: 'Check off work as you go'       },
    { flow: 'close-job', icon: DollarSign,  iconColor: '#34d399', time: '30 sec', title: 'Close a job',   sub: 'Send quote, record payment'      },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="mb-6 rounded-2xl border overflow-hidden"
      style={{
        background: darkMode ? '#0f1729' : '#f8faff',
        borderColor: darkMode ? '#3730a3' : '#c7d2fe',
        boxShadow: darkMode
          ? '0 0 0 1px #3730a3, 0 8px 32px rgba(0,0,0,0.4)'
          : '0 0 0 1px #c7d2fe, 0 4px 16px rgba(99,102,241,0.1)',
      }}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <p className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Try another walkthrough
          </p>
          <p className={`text-xs mt-0.5 ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>
            Each one shows a different part of the product
          </p>
        </div>
        <button
          onClick={onDismiss}
          className={`text-[11px] font-semibold transition ${darkMode ? 'text-white/20 hover:text-white/50' : 'text-slate-300 hover:text-slate-500'}`}
        >
          Dismiss
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 pb-4">
        {flows.map(({ flow, icon: Icon, iconColor, time, title, sub }) => (
          <button
            key={flow}
            onClick={() => onStart(flow)}
            className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.98]"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : '#fff',
              borderColor: darkMode ? 'rgba(255,255,255,0.07)' : '#e2e8f0',
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: iconColor + '18' }}>
              <Icon className="w-4 h-4" style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</p>
              <p className={`text-[10px] truncate ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>{sub}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0" style={{ color: iconColor }}>
              <span className="text-[10px] font-black">{time}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}