'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Zap, X, ArrowRight, DollarSign,
  FileText, CreditCard, ChevronRight, CheckCircle2
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type TourStep =
  | 'idle'        // banner showing
  | 'open-lead'   // step 1: open Michael's lead
  | 'save-quote'  // step 2: save the quote
  | 'send-quote'  // step 3: send the quote
  | 'accepted'    // step 3b: quote accepted animation
  | 'mark-paid'   // step 4: mark as paid
  | 'done';       // completion

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;
const stepIndex: Record<TourStep, number> = {
  'idle': 0, 'open-lead': 1, 'save-quote': 2,
  'send-quote': 3, 'accepted': 3, 'mark-paid': 4, 'done': 4,
};

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────

interface TooltipProps {
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  title: string;
  body: string;
  cta: string;
  ctaGradient: string;
  step: TourStep;
  onCta: () => void;
  onSkip: () => void;
}

export function TourTooltip({
  Icon, iconColor, iconBg,
  label, title, body, cta, ctaGradient,
  step, onCta, onSkip,
}: TooltipProps) {
  const idx = stepIndex[step];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      className="rounded-2xl border p-4 mb-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderColor: 'rgba(99,102,241,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-3">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ background: i < idx ? 'linear-gradient(90deg,#6366f1,#10b981)' : 'rgba(255,255,255,0.1)' }} />
        ))}
        <button onClick={onSkip} className="ml-2 text-white/20 hover:text-white/50 transition shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon style={{ color: iconColor, width: 18, height: 18 }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: iconColor }}>
            {label}
          </p>
          <p className="text-sm font-black text-white leading-snug mb-1">{title}</p>
          <p className="text-xs text-white/50 leading-relaxed">{body}</p>
        </div>
      </div>

      <button
        onClick={onCta}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white transition hover:opacity-90 active:scale-95"
        style={{ background: ctaGradient }}
      >
        {cta} <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── ACCEPTED NOTIFICATION ────────────────────────────────────────────────────

export function QuoteAcceptedNotification({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="rounded-2xl border p-4 mb-4 flex items-center gap-3"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))',
        borderColor: 'rgba(16,185,129,0.3)',
      }}
    >
      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white">Michael just accepted</p>
        <p className="text-xs text-emerald-400 font-bold">$4,200 quote confirmed</p>
      </div>
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
    </motion.div>
  );
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
        Every lead your customers submit lands on your board like this — ready to quote, schedule, and collect. No spreadsheets, no missed follow-ups.
      </p>
      <div className="flex gap-2">
        <a
          href="/signup"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-white transition hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #1a6645, #059669)' }}
        >
          Start free trial <ArrowRight className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={onDismiss}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/40 hover:text-white/70 border border-white/10 hover:bg-white/5 transition"
        >
          Explore
        </button>
      </div>
    </motion.div>
  );
}

// ─── OPT-IN BANNER ───────────────────────────────────────────────────────────

export function DemoTourBanner({
  darkMode,
  onStart,
  onDismiss,
}: {
  darkMode: boolean;
  onStart: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl border flex-wrap sm:flex-nowrap"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.06))'
          : 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(16,185,129,0.04))',
        borderColor: darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)',
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(99,102,241,0.15)' }}>
        <Zap style={{ color: '#818cf8', width: 18, height: 18 }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-black leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Close a job in 30 seconds
        </p>
        <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>
          Walk through lead → quote → payment.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <button
          onClick={onStart}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white transition hover:opacity-90 active:scale-95 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
        >
          Show me <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={onDismiss}
          className={`p-2 rounded-xl transition ${
            darkMode
              ? 'text-white/30 hover:text-white/60 hover:bg-white/5'
              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useDemoTour() {
  const [tourStep, setTourStep] = useState<TourStep>('idle');
  const startTour   = () => setTourStep('open-lead');
  const advanceTo   = (s: TourStep) => setTourStep(s);
  const dismissTour = () => setTourStep('idle');
  return { tourStep, startTour, advanceTo, dismissTour };
}