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
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [steps, setSteps] = useState<Record<string, boolean>>(company.onboarding_steps || {});

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

  const markStep = useCallback(async (step: string) => {
    if (steps[step]) return;
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
    if (!!company.logo_url && !!company.phone && !steps.company_setup) {
      markStep('company_setup');
    }
  }, [company.logo_url, company.phone, steps.company_setup, markStep]);

  useEffect(() => {
    if (leadCount > 1 && !steps.first_lead_created) {
      markStep('first_lead_created');
    }
  }, [leadCount, steps.first_lead_created, markStep]);

  useEffect(() => {
    if (steps.form_tested) return;
    const companyEmail = company.email?.toLowerCase();
    if (!companyEmail) return;
    const selfTest = allLeads.find(
      l => l.email?.toLowerCase() === companyEmail && l.created_by === 'customer'
    );
    if (selfTest) {
      markStep('form_tested');
      markStep('email_verified');
    }
  }, [allLeads, company.email, steps.form_tested, markStep]);

  if (company.plan_tier !== 'free') return null;
  if (dismissed) return null;

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
    <div className="mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner row */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-900 tracking-tight">
                  Free Plan
                </p>
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {completedCount}/{freeChecklist.length}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {completedCount === freeChecklist.length
                  ? 'All set! Upgrade to unlock the full toolkit.'
                  : 'Set up your business. Upgrade when you\'re ready.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onStartTour}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            >
              <Eye className="w-3 h-3" />
              Tour
            </button>
            <a
              href={`/${company.slug}/admin/settings#billing`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white transition-all"
            >
              <Crown className="w-3 h-3" />
              <span className="hidden sm:inline">Upgrade</span>
            </a>
            <button
              onClick={() => setChecklistOpen(v => !v)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${checklistOpen ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-100">
          <div
            className="h-full bg-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Checklist (collapsed by default) */}
        {checklistOpen && (
          <div className="border-t border-slate-100">
            {/* Free steps */}
            {freeChecklist.map((item, i) => (
              <ChecklistRow
                key={item.id}
                item={item}
                isLast={i === freeChecklist.length - 1 && upgradeChecklist.length === 0}
              />
            ))}

            {/* Divider */}
            <div className="px-4 py-2 bg-slate-50">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Unlock with upgrade
              </p>
            </div>

            {/* Locked upgrade teasers */}
            {upgradeChecklist.map((item, i) => (
              <ChecklistRow
                key={item.id}
                item={item}
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
  item, isLast, companySlug,
}: {
  item: ChecklistItem;
  isLast: boolean;
  companySlug?: string;
}) {
  const Icon = item.icon;

  if (item.locked) {
    return (
      <a
        href={companySlug ? `/${companySlug}/admin/settings#billing` : '#'}
        className={`flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-all group cursor-pointer ${
          !isLast ? 'border-b border-slate-100' : ''
        }`}
      >
        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
          <Lock className="w-3 h-3 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-400 leading-tight">
            {item.label}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {item.description}
          </p>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0">
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
      className={`flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-all group w-full text-left ${
        item.href || item.action ? 'cursor-pointer' : ''
      } ${!isLast ? 'border-b border-slate-100' : ''}`}
    >
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
        item.done
          ? 'bg-emerald-100 text-emerald-600'
          : 'bg-slate-100 text-slate-400'
      }`}>
        {item.done
          ? <Check className="w-3 h-3 stroke-[3px]" />
          : <Icon className="w-3 h-3" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold leading-tight ${
          item.done ? 'text-slate-400 line-through' : 'text-slate-800'
        }`}>
          {item.label}
        </p>
        <p className={`text-[10px] mt-0.5 ${item.done ? 'text-slate-400' : 'text-slate-500'}`}>
          {item.description}
        </p>
      </div>

      {item.href && !item.done && (
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
      )}
      {item.external && !item.done && (
        <ExternalLink className="w-3 h-3 text-slate-300 shrink-0" />
      )}
    </Wrapper>
  );
}