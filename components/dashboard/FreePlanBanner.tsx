'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap, ChevronDown, Check, ArrowRight, X,
  Building2, PlusCircle, ExternalLink, Mail, Eye,
  Crown, Lock, Layout, FileText, Users,
} from 'lucide-react';

type Company = {
  id: number;
  name: string;
  slug: string;
  email?: string;
  logo_url?: string | null;
  phone?: string | null;
  form_categories?: any[];
  form_field_config?: any;
  plan_tier?: string;
  onboarding_steps?: Record<string, boolean>;
};

type FreePlanBannerProps = {
  company: Company;
  isDark: boolean;
  onStartTour: () => void;
  onCreateLead: () => void;
  leadCount: number;
  allLeads: any[];
};

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  done: boolean;
  action?: () => void;
  href?: string;
  external?: boolean;
  locked?: boolean;
  lockedLabel?: string;
};

export default function FreePlanBanner({
  company, isDark, onStartTour, onCreateLead, leadCount, allLeads,
}: FreePlanBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [steps, setSteps] = useState<Record<string, boolean>>(company.onboarding_steps || {});

  // Persist dismissal per company
  useEffect(() => {
    try {
      if (localStorage.getItem(`free-banner-dismissed-${company.slug}`) === 'true') {
        setDismissed(true);
      }
    } catch {}
  }, [company.slug]);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(`free-banner-dismissed-${company.slug}`, 'true'); } catch {}
  };

  // Save a step to the database
  const markStep = useCallback(async (step: string) => {
    if (steps[step]) return; // already done
    const updated = { ...steps, [step]: true };
    setSteps(updated);
    try {
      await fetch('/api/onboarding/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, step }),
      });
    } catch (e) {
      console.error('Failed to save onboarding step:', e);
    }
  }, [steps, company.id]);

  // Auto-detect completed steps
  useEffect(() => {
    const hasLogo = !!company.logo_url;
    const hasPhone = !!company.phone;
    if (hasLogo && hasPhone && !steps.company_setup) {
      markStep('company_setup');
    }
  }, [company.logo_url, company.phone, steps.company_setup, markStep]);

  useEffect(() => {
    if (leadCount > 1 && !steps.first_lead_created) {
      markStep('first_lead_created');
    }
  }, [leadCount, steps.first_lead_created, markStep]);

  // Detect self-test: a lead where email matches company email AND created_by is 'customer'
  useEffect(() => {
    if (steps.form_tested) return;
    const companyEmail = company.email?.toLowerCase();
    if (!companyEmail) return;
    const selfTest = allLeads.find(
      l => l.email?.toLowerCase() === companyEmail && l.created_by === 'customer'
    );
    if (selfTest) {
      markStep('form_tested');
      markStep('email_verified'); // if they tested the form, they'll see the email
    }
  }, [allLeads, company.email, steps.form_tested, markStep]);

  // Don't show for paid users
  if (company.plan_tier !== 'free') return null;
  if (dismissed) return null;

  // Build checklist
  const hasCompanyInfo = !!company.logo_url && !!company.phone;

  const freeChecklist: ChecklistItem[] = [
    {
      id: 'company_setup',
      label: 'Set up your company',
      description: hasCompanyInfo ? 'Logo and contact info added' : 'Add your logo, phone number, and business details',
      icon: Building2,
      done: !!steps.company_setup,
      href: `/${company.slug}/admin/settings`,
    },
    {
      id: 'first_lead_created',
      label: 'Create a lead from your dashboard',
      description: steps.first_lead_created ? 'You\'ve created leads — nice!' : 'Try adding a lead manually — like when a customer calls or texts you',
      icon: PlusCircle,
      done: !!steps.first_lead_created,
      action: onCreateLead,
    },
    {
      id: 'form_tested',
      label: 'Submit a test request as a customer',
      description: steps.form_tested
        ? 'You\'ve experienced what your customers see'
        : 'Open your booking link, fill it out with your own email, and see the full experience',
      icon: ExternalLink,
      done: !!steps.form_tested,
      href: `/${company.slug}`,
      external: true,
    },
    {
      id: 'email_verified',
      label: 'Check your email',
      description: steps.email_verified
        ? 'You\'ve seen both sides — customer confirmation and your lead notification'
        : 'After submitting, check your inbox — you\'ll see the confirmation your customers get AND your new lead alert',
      icon: Mail,
      done: !!steps.email_verified,
    },
  ];

  // Upgrade teaser items — locked for free users
  const upgradeChecklist: ChecklistItem[] = [
    {
      id: 'customize_form',
      label: 'Customize your booking form',
      description: 'Add your branding, categories, photo uploads, and custom questions',
      icon: FileText,
      done: false,
      locked: true,
      lockedLabel: 'Basic',
    },
    {
      id: 'setup_categories',
      label: 'Set up job categories & templates',
      description: 'Organize leads by type with auto-loaded tasks and quote templates',
      icon: Layout,
      done: false,
      locked: true,
      lockedLabel: 'Basic',
    },
    {
      id: 'invite_team',
      label: 'Invite your team',
      description: 'Add crew members and assign leads so nothing falls through the cracks',
      icon: Users,
      done: false,
      locked: true,
      lockedLabel: 'Basic',
    },
  ];

  const completedCount = freeChecklist.filter(c => c.done).length;
  const progress = Math.round((completedCount / freeChecklist.length) * 100);

  return (
    <div className="mb-6 space-y-3">
      {/* ── Main Banner ── */}
      <div className={`relative overflow-hidden rounded-2xl border transition-all ${
        isDark
          ? 'bg-gradient-to-r from-blue-950/80 via-[#0A0C14] to-blue-950/60 border-blue-500/20'
          : 'bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] pointer-events-none" />

        <div className="relative px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-blue-500/15' : 'bg-blue-100'
            }`}>
              <Zap className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Free Plan
                </p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  {completedCount}/{freeChecklist.length} done
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {completedCount === freeChecklist.length
                  ? 'You\'re all set! Upgrade to unlock the full toolkit.'
                  : 'Set up your business. Upgrade when you\'re ready.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onStartTour}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              <Eye className="w-3 h-3" />
              Tour
            </button>
            <a
              href={`/${company.slug}/admin/settings#billing`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20"
            >
              <Crown className="w-3 h-3" />
              <span className="hidden sm:inline">Upgrade</span>
              <span className="sm:hidden">Pro</span>
            </a>
            <button
              onClick={handleDismiss}
              className={`p-1.5 rounded-lg transition-all ${
                isDark ? 'text-slate-600 hover:text-slate-400 hover:bg-white/5' : 'text-slate-300 hover:text-slate-500'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`h-0.5 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
          <div
            className="h-full bg-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Checklist ── */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${
        isDark
          ? 'bg-[#0A0C14] border-white/5'
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => setChecklistOpen(v => !v)}
          className={`w-full px-5 py-3 flex items-center justify-between transition-all ${
            isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Getting Started
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${
            checklistOpen ? 'rotate-180' : ''
          } ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        </button>

        {checklistOpen && (
          <div className={`border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            {/* Free steps */}
            {freeChecklist.map((item, i) => (
              <ChecklistRow
                key={item.id}
                item={item}
                isDark={isDark}
                isLast={false}
              />
            ))}

            {/* Divider */}
            <div className={`px-5 py-2.5 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                isDark ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Unlock with upgrade
              </p>
            </div>

            {/* Locked upgrade teasers */}
            {upgradeChecklist.map((item, i) => (
              <ChecklistRow
                key={item.id}
                item={item}
                isDark={isDark}
                isLast={i === upgradeChecklist.length - 1}
                companySlug={company.slug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Checklist Row Component ──

function ChecklistRow({
  item, isDark, isLast, companySlug,
}: {
  item: ChecklistItem;
  isDark: boolean;
  isLast: boolean;
  companySlug?: string;
}) {
  const Icon = item.icon;

  if (item.locked) {
    return (
      <a
        href={companySlug ? `/${companySlug}/admin/settings#billing` : '#'}
        className={`flex items-center gap-4 px-5 py-3.5 transition-all group cursor-pointer ${
          isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
        } ${!isLast ? (isDark ? 'border-b border-white/[0.03]' : 'border-b border-slate-50') : ''}`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          isDark ? 'bg-white/5 text-slate-700' : 'bg-slate-100 text-slate-300'
        }`}>
          <Lock className="w-3 h-3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold leading-tight ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {item.label}
          </p>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
            {item.description}
          </p>
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shrink-0 ${
          isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-500'
        }`}>
          {item.lockedLabel}
        </span>
      </a>
    );
  }

  const Wrapper = item.href ? 'a' : item.action ? 'button' : 'div';
  const wrapperProps = item.href
    ? {
        href: item.href,
        ...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
      }
    : item.action
      ? { onClick: item.action, type: 'button' as const }
      : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={`flex items-center gap-4 px-5 py-3.5 transition-all group ${
        item.href || item.action ? 'cursor-pointer' : ''
      } ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} ${
        !isLast ? (isDark ? 'border-b border-white/[0.03]' : 'border-b border-slate-50') : ''
      }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
        item.done
          ? 'bg-emerald-500/15 text-emerald-500'
          : isDark ? 'bg-white/5 text-slate-600' : 'bg-slate-100 text-slate-300'
      }`}>
        {item.done
          ? <Check className="w-3.5 h-3.5 stroke-[3px]" />
          : <Icon className="w-3.5 h-3.5" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold leading-tight ${
          item.done
            ? isDark ? 'text-slate-500 line-through' : 'text-slate-400 line-through'
            : isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {item.label}
        </p>
        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          {item.description}
        </p>
      </div>

      {item.href && !item.done && (
        <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-all group-hover:translate-x-0.5 ${
          isDark ? 'text-slate-700 group-hover:text-blue-400' : 'text-slate-300 group-hover:text-blue-500'
        }`} />
      )}
      {item.external && !item.done && (
        <ExternalLink className={`w-3 h-3 shrink-0 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
      )}
    </Wrapper>
  );
}