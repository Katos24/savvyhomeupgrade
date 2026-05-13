'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles, ChevronRight, ChevronLeft, X, Check,
  LayoutGrid, List, Calendar, Sun, Moon, Menu,
  Search, Filter, Plus, MessageSquare, Zap,
  ArrowRight, PartyPopper, Rocket, Eye, MousePointer,
} from 'lucide-react';
import { type PlanTier } from '@/lib/permissions';

const PLAN_ORDER: PlanTier[] = ['free', 'basic', 'pro'];

function planMeetsMin(userPlan: PlanTier, minPlan: PlanTier): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(minPlan);
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

type TourStep = {
  id: string;
  minPlan: PlanTier;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'toggle-theme' | 'toggle-view' | 'open-menu';
  actionLabel?: string;
  highlight?: boolean;
};

type DashboardTourProps = {
  companyName: string;
  companySlug: string;
  userName?: string;
  isDark: boolean;
  planTier: PlanTier;
  onToggleTheme: () => void;
  onToggleView: (view: 'cards' | 'table' | 'calendar') => void;
  onOpenSidebar: () => void;
  onOpenCreateModal: () => void;
  onComplete: () => void;
};

// ─── TOUR STEPS ───────────────────────────────────────────────────────────────

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    minPlan: 'free',
    title: 'Welcome to your command center',
    description: 'This is where you\'ll manage every lead, job, and dollar. Let\'s take a 60-second tour so you know where everything lives.',
    icon: <Rocket className="w-6 h-6" />,
    position: 'center',
  },
  {
    id: 'sample-lead',
    minPlan: 'free',
    title: 'Your first lead is waiting',
    description: 'We created a sample lead so you can explore tasks, quotes, scheduling, and notes. Tap any lead card to open it.',
    icon: <MousePointer className="w-6 h-6" />,
    targetSelector: '[data-tour="lead-card"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'create-lead',
    minPlan: 'basic',
    title: 'Add leads in one tap',
    description: 'New customer calls? Tap this button to create a lead instantly — or share your booking link and let customers submit their own.',
    icon: <Plus className="w-6 h-6" />,
    targetSelector: '[data-tour="create-lead"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'view-modes',
    minPlan: 'basic',
    title: 'Three ways to see your work',
    description: 'Cards for a quick scan, Table for bulk actions and CSV export, Calendar to see your schedule at a glance.',
    icon: <LayoutGrid className="w-6 h-6" />,
    targetSelector: '[data-tour="view-switcher"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'theme-toggle',
    minPlan: 'free',
    title: 'Light mode or dark mode',
    description: 'Your eyes, your rules. Switch between dark and light themes anytime. Your preference is saved automatically.',
    icon: <Sun className="w-6 h-6" />,
    targetSelector: '[data-tour="theme-toggle"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'filters',
    minPlan: 'basic',
    title: 'Find anything instantly',
    description: 'Filter by status, category, date, assignee, or payment. Use quick-filter pills for common views like "Unpaid" or "New leads."',
    icon: <Filter className="w-6 h-6" />,
    targetSelector: '[data-tour="filters"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'sidebar',
    minPlan: 'free',
    title: 'Your main menu',
    description: 'Settings, team management, email templates, your booking page, and integrations — everything lives here.',
    icon: <Menu className="w-6 h-6" />,
    targetSelector: '[data-tour="sidebar-toggle"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'ai-chat',
    minPlan: 'pro',
    title: 'AI that knows your business',
    description: 'Ask questions like "What\'s scheduled this week?" or "Which jobs are unpaid?" and get instant answers from your data.',
    icon: <Sparkles className="w-6 h-6" />,
    targetSelector: '[data-tour="ai-chat"]',
    position: 'left',
    highlight: true,
  },
  {
    id: 'complete',
    minPlan: 'free',
    title: 'You\'re all set!',
    description: 'Your dashboard is ready. Start by opening that sample lead to see how everything connects — tasks, quotes, scheduling, payments, and notes.',
    icon: <PartyPopper className="w-6 h-6" />,
    position: 'center',
  },
];

// ─── SPOTLIGHT OVERLAY ────────────────────────────────────────────────────────

function SpotlightOverlay({
  targetRect,
  visible,
}: {
  targetRect: DOMRect | null;
  visible: boolean;
}) {
  if (!visible) return null;

  if (!targetRect) {
    return (
      <div className="fixed inset-0 z-[9990] transition-opacity duration-500"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      />
    );
  }

  const pad = 12;
  const x = targetRect.left - pad;
  const y = targetRect.top - pad;
  const w = targetRect.width + pad * 2;
  const h = targetRect.height + pad * 2;
  const r = 16;

  return (
    <div className="fixed inset-0 z-[9990] transition-opacity duration-500">
      {/* Dark overlay with cutout — blocks clicks everywhere except the target */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect x={x} y={y} width={w} height={h} rx={r} ry={r} fill="black" />
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="rgba(0,0,0,0.72)"
          mask="url(#spotlight-mask)"
        />
      </svg>
      {/* Animated border ring */}
      <div
        className="absolute border-2 border-blue-400 rounded-2xl animate-pulse pointer-events-none"
        style={{
          left: x, top: y, width: w, height: h,
          boxShadow: '0 0 30px rgba(59,130,246,0.4), inset 0 0 30px rgba(59,130,246,0.1)',
        }}
      />
      {/* The cutout area is NOT covered by the SVG, so clicks pass through to the real element */}
    </div>
  );
}

// ─── TOOLTIP CARD ─────────────────────────────────────────────────────────────

function TourTooltip({
  step,
  stepIndex,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  onAction,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onAction?: () => void;
}) {
  const isCenter = step.position === 'center' || !targetRect;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isCenter || !targetRect || !tooltipRef.current) return;

    const tt = tooltipRef.current.getBoundingClientRect();
    const pad = 20;
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = targetRect.bottom + pad;
        left = targetRect.left + targetRect.width / 2 - tt.width / 2;
        break;
      case 'top':
        top = targetRect.top - tt.height - pad;
        left = targetRect.left + targetRect.width / 2 - tt.width / 2;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tt.height / 2;
        left = targetRect.right + pad;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tt.height / 2;
        left = targetRect.left - tt.width - pad;
        break;
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tt.width - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tt.height - 16));

    setPos({ top, left });
  }, [targetRect, step.position, isCenter, stepIndex]);

  const cardContent = (
    <>
      {/* Icon + Step Counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: '#2563eb' }}>
            {step.icon}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === stepIndex ? 20 : 6,
                  background: i <= stepIndex
                    ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                    : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={onSkip}
          className="text-white/30 hover:text-white/60 text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <h3 className="text-white font-black text-lg leading-tight mb-2">
        {step.title}
      </h3>
      <p className="text-white/50 text-sm leading-relaxed mb-6">
        {step.description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!isFirst && (
          <button
            onClick={onPrev}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-bold rounded-xl transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}

        {step.action && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-bold rounded-xl transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {step.actionLabel}
          </button>
        )}

        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-white font-black text-sm rounded-xl transition-all active:scale-[0.97] shadow-lg"
          style={{ background: '#2563eb', boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }}
        >
          {isLast ? (
            <><Check className="w-4 h-4" /> Open Dashboard</>
          ) : (
            <><span>Next</span> <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </>
  );

  // Center-positioned modal
  if (isCenter) {
    return (
      <div className="fixed inset-0 z-[9995] flex items-center justify-center p-6">
        <div
          className="w-full max-w-md p-6 rounded-3xl border border-white/10 animate-in fade-in zoom-in-95 duration-300"
          style={{
            background: '#0a0f1e',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)',
          }}
        >
          {isFirst && (
            <div className="text-center mb-6">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center"
                style={{
                  background: '#2563eb',
                  boxShadow: '0 8px 40px rgba(99,102,241,0.4)',
                }}
              >
                {step.icon}
              </div>
            </div>
          )}
          {isLast && (
            <div className="text-center mb-6">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center text-4xl"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  boxShadow: '0 8px 40px rgba(16,185,129,0.4)',
                }}
              >
                {step.icon}
              </div>
            </div>
          )}
          {cardContent}
        </div>
      </div>
    );
  }

  // Positioned tooltip near target
  return (
    <div
      ref={tooltipRef}
className="fixed z-[9995] w-[calc(100vw-32px)] sm:w-[380px] p-5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{
        top: pos.top,
        left: pos.left,
        background: '#0a0f1e',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)',
      }}
    >
      {cardContent}
    </div>
  );
}

// ─── MAIN TOUR COMPONENT ─────────────────────────────────────────────────────

export default function DashboardTour({
  companyName,
  companySlug,
  userName,
  isDark,
  planTier,
  onToggleTheme,
  onToggleView,
  onOpenSidebar,
  onOpenCreateModal,
  onComplete,
}: DashboardTourProps) {
  const [active, setActive] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showPostHighlight, setShowPostHighlight] = useState(false);

  const filteredSteps = TOUR_STEPS.filter(s => planMeetsMin(planTier, s.minPlan));

  // After tour ends, pulse all toured elements briefly
  useEffect(() => {
    if (!showPostHighlight) return;

    const selectors = filteredSteps
      .map(s => s.targetSelector)
      .filter(Boolean) as string[];

    const els = selectors
      .map(sel => document.querySelector(sel) as HTMLElement)
      .filter(Boolean);

    // Add highlight class
    els.forEach(el => {
      el.style.transition = 'box-shadow 0.5s ease, transform 0.5s ease';
el.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.6), 0 0 20px rgba(59,130,246,0.3)';
      el.style.transform = 'scale(1.03)';
      el.style.borderRadius = '12px';
      el.style.position = 'relative';
      el.style.zIndex = '50';
    });

  // Remove after 2 seconds
    const timer = setTimeout(() => {
      els.forEach(el => {
        el.style.boxShadow = '';
        el.style.transform = '';
        el.style.zIndex = '';
      });
      setShowPostHighlight(false);
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer);
      els.forEach(el => {
        el.style.boxShadow = '';
        el.style.transform = '';
        el.style.zIndex = '';
      });
    };
  }, [showPostHighlight, onComplete]);

  const step = filteredSteps[currentStep];

  // Find and measure the target element
  const measureTarget = useCallback(() => {
    if (!step.targetSelector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    measureTarget();
    const handler = () => measureTarget();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [measureTarget, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep >= filteredSteps.length - 1) {
      setActive(false);
      try {
        localStorage.setItem(`tour-completed-${companySlug}`, 'true');
      } catch {}
      setShowPostHighlight(true);
      return;
    }
    setCurrentStep(prev => prev + 1);
  }, [currentStep, companySlug]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const handleSkip = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(`tour-completed-${companySlug}`, 'true');
    } catch {}
    // Still show the highlight so they see what they skipped
    setShowPostHighlight(true);
  }, [companySlug]);

  const handleAction = useCallback(() => {
    switch (step.action) {
      case 'toggle-theme':
        onToggleTheme();
        break;
      case 'toggle-view':
        onToggleView('table');
        // Re-measure after DOM updates
        setTimeout(measureTarget, 100);
        break;
     case 'open-menu':
  onOpenSidebar();
  // Brief delay to let sidebar animate in above tour overlay
  setTimeout(measureTarget, 300);
  break;
      case 'click':
        if (step.targetSelector) {
          const el = document.querySelector(step.targetSelector) as HTMLElement;
          el?.click();
        }
        break;
    }
  }, [step, onToggleTheme, onToggleView, onOpenSidebar, measureTarget]);



  if (!active) return null;

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} visible={active} />
      <TourTooltip
        step={step}
        stepIndex={currentStep}
        totalSteps={filteredSteps.length}
        targetRect={targetRect}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleSkip}
        onAction={step.action ? handleAction : undefined}
      />
    </>
  );
}

// ─── HOOK: Should show tour? ──────────────────────────────────────────────────

export function useShouldShowTour(companySlug: string): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const completed = localStorage.getItem(`tour-completed-${companySlug}`);
      if (completed !== 'true') {
        setShow(true);
      }
    } catch {}
  }, [companySlug]);
  return show;
}