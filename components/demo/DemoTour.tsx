'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, X, ArrowRight, DollarSign, Calendar, CheckSquare, CheckCircle2 } from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type TourFlow = 'schedule' | 'tasks' | 'close-job';

export type TourStep =
  | 'idle'
  // schedule flow
  | 'schedule-assign'   // set crew + date
  | 'schedule-done'     // saved — see it on calendar
  // tasks flow
  | 'tasks-check'       // check off tasks
  | 'tasks-done'        // all done
  // close-job flow
  | 'save-quote'
  | 'send-quote'
  | 'accepted'
  | 'mark-paid'
  | 'done';

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useDemoTour() {
  const [tourStep, setTourStep] = useState<TourStep>('idle');
  const [tourFlow, setTourFlow] = useState<TourFlow | null>(null);

  const startFlow = (flow: TourFlow) => {
    setTourFlow(flow);
    if (flow === 'schedule')  setTourStep('schedule-assign');
    if (flow === 'tasks')     setTourStep('tasks-check');
    if (flow === 'close-job') setTourStep('save-quote');
  };

  const advanceTo   = (s: TourStep) => setTourStep(s);
  const dismissTour = () => { setTourStep('idle'); setTourFlow(null); };

  return { tourStep, tourFlow, startFlow, advanceTo, dismissTour };
}

// ─── COMPLETION CARD ──────────────────────────────────────────────────────────

export function TourCompletionCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="rounded-2xl border p-5 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(99,102,241,0.08))',
        borderColor: 'rgba(16,185,129,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-black text-white">$4,200 just hit your books</p>
          <p className="text-[11px] font-bold text-emerald-400">Lead → Quote → Paid in 30 seconds</p>
        </div>
      </div>
      <p className="text-xs text-white/40 leading-relaxed mb-4">
        Every lead your customers submit lands on your board like this — ready to quote, schedule, and collect.
      </p>
      <div className="flex gap-2">
        <a href="/signup"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white transition hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #1a6645, #059669)' }}
        >
          Start free trial <ArrowRight className="w-3.5 h-3.5" />
        </a>
        <button onClick={onDismiss}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/40 hover:text-white/70 border border-white/10 hover:bg-white/5 transition"
        >
          Explore
        </button>
      </div>
    </motion.div>
  );
}

// ─── TOUR BANNER — 3 option cards ────────────────────────────────────────────

export function DemoTourBanner({
  darkMode,
  onStart,
  onDismiss,
}: {
  darkMode: boolean;
  onStart: (flow: TourFlow) => void;
  onDismiss: () => void;
}) {
  const flows: {
    flow: TourFlow;
    icon: React.ElementType;
    iconColor: string;
    step: string;
    title: string;
    sub: string;
  }[] = [
    {
      flow: 'schedule',
      icon: Calendar,
      iconColor: '#38bdf8',
      step: '1 min',
      title: 'Schedule a job',
      sub: 'Assign crew, set date & time',
    },
    {
      flow: 'tasks',
      icon: CheckSquare,
      iconColor: '#a78bfa',
      step: '30 sec',
      title: 'Track tasks',
      sub: 'Check off work as you go',
    },
    {
      flow: 'close-job',
      icon: DollarSign,
      iconColor: '#34d399',
      step: '30 sec',
      title: 'Close a job',
      sub: 'Quote → record payment',
    },
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: darkMode ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: darkMode ? '#a5b4fc' : '#6366f1' }} />
          </div>
          <div>
            <p className={`text-sm font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Try a live walkthrough
            </p>
            <p className={`text-[11px] font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
              Pick a flow below — takes under a minute
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className={`p-1.5 rounded-lg transition ${darkMode ? 'text-white/25 hover:text-white/60 hover:bg-white/5' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 flow cards */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        {flows.map(({ flow, icon: Icon, iconColor, step, title, sub }) => (
          <button
            key={flow}
            onClick={() => onStart(flow)}
            className="group flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all active:scale-[0.98]"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : '#fff',
              borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = iconColor + '60';
              (e.currentTarget as HTMLElement).style.background = iconColor + '10';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
              (e.currentTarget as HTMLElement).style.background = darkMode ? 'rgba(255,255,255,0.03)' : '#fff';
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: iconColor + '20' }}>
                <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: iconColor + 'aa' }}>
                {step}
              </span>
            </div>
            <div>
              <p className={`text-xs font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </p>
              <p className={`text-[10px] mt-0.5 leading-snug ${darkMode ? 'text-white/35' : 'text-slate-400'}`}>
                {sub}
              </p>
            </div>
            <div className="flex items-center gap-1 mt-0.5"
              style={{ color: iconColor }}>
              <span className="text-[10px] font-black">Try it</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── INLINE TIP BANNER (used inside tabs) ────────────────────────────────────

export function TourTipBanner({
  message,
  color = 'indigo',
  onDismiss,
}: {
  message: string;
  color?: 'indigo' | 'sky' | 'violet' | 'emerald';
  onDismiss?: () => void;
}) {
  const palettes = {
    indigo:  { bg: 'linear-gradient(135deg,#312e81,#4338ca)', border: '#818cf8', pulse: 'bg-white' },
    sky:     { bg: 'linear-gradient(135deg,#0c4a6e,#0369a1)', border: '#38bdf8', pulse: 'bg-sky-200' },
    violet:  { bg: 'linear-gradient(135deg,#3b0764,#6d28d9)', border: '#a78bfa', pulse: 'bg-violet-200' },
    emerald: { bg: 'linear-gradient(135deg,#052e16,#065f46)', border: '#34d399', pulse: 'bg-emerald-200' },
  };
  const p = palettes[color];
  return (
    <div
      className="flex items-center gap-3 px-4 py-4 rounded-2xl mb-1"
      style={{ background: p.bg, border: `2px solid ${p.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
    >
      <div className={`w-2.5 h-2.5 rounded-full animate-pulse shrink-0 ${p.pulse}`} />
      <p className="text-sm font-black text-white flex-1 leading-snug">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-white/30 hover:text-white/60 transition shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── FLOW DONE CARD (schedule + tasks completion) ─────────────────────────────

export function FlowDoneCard({
  title,
  subtitle,
  body,
  onDismiss,
  accentColor,
}: {
  title: string;
  subtitle: string;
  body: string;
  onDismiss: () => void;
  accentColor: string;
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
      <div className="flex gap-2">
        <a href="/signup"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white transition hover:opacity-90 active:scale-95"
          style={{ background: `linear-gradient(135deg,${accentColor}cc,${accentColor})` }}
        >
          Start free trial <ArrowRight className="w-3.5 h-3.5" />
        </a>
        <button onClick={onDismiss}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/40 hover:text-white/60 border border-white/10 hover:bg-white/5 transition"
        >
          Explore
        </button>
      </div>
    </motion.div>
  );
}