'use client';

import { useState, useEffect } from 'react';
import {
  Zap, ChevronDown, Check, ArrowRight, X,
  Building2, FileText, PlusCircle, ExternalLink, Mail, Eye,
  Sparkles, Crown,
} from 'lucide-react';

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  phone?: string | null;
  form_categories?: any[];
  form_field_config?: any;
  plan_tier?: string;
};

type FreePlanBannerProps = {
  company: Company;
  isDark: boolean;
  onStartTour: () => void;
  leadCount: number;
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
};

export default function FreePlanBanner({ company, isDark, onStartTour, leadCount }: FreePlanBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(true);

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

  // Don't show for paid users
  if (company.plan_tier !== 'free') return null;
  if (dismissed) return null;

  // Compute checklist completion
  const hasLogo = !!company.logo_url;
  const hasPhone = !!company.phone;
  const hasCompanyInfo = hasLogo && hasPhone;
  const hasCategories = (company.form_categories?.length ?? 0) >= 1;
  const hasCreatedLead = leadCount > 1; // more than the sample lead

  const checklist: ChecklistItem[] = [
    {
      id: 'company-info',
      label: 'Set up your company profile',
      description: hasCompanyInfo ? 'Logo and contact info added' : 'Add your logo and phone number',
      icon: Building2,
      done: hasCompanyInfo,
      href: `/${company.slug}/admin/settings`,
    },
    {
      id: 'test-form',
      label: 'See what your customers see',
      description: 'Open your booking link and submit a test request',
      icon: Eye,
      done: false, // can't easily track this
      href: `/${company.slug}`,
      external: true,
    },
    {
      id: 'create-lead',
      label: 'Create your first real lead',
      description: hasCreatedLead ? 'You\'ve created leads' : 'Add a lead from a call, text, or walk-in',
      icon: PlusCircle,
      done: hasCreatedLead,
    },
    {
      id: 'test-email',
      label: 'Check your email after submitting',
      description: 'See the confirmation your customers receive',
      icon: Mail,
      done: false,
    },
  ];

  const completedCount = checklist.filter(c => c.done).length;
  const progress = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="mb-6 space-y-3">
      {/* ── Main Banner ── */}
      <div className={`relative overflow-hidden rounded-2xl border transition-all ${
        isDark
          ? 'bg-gradient-to-r from-blue-950/80 via-[#0A0C14] to-blue-950/60 border-blue-500/20'
          : 'bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200'
      }`}>
        {/* Subtle glow */}
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
                  {completedCount}/{checklist.length} steps
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Set up your business. Upgrade when you're ready.
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

      {/* ── Checklist (collapsible) ── */}
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
            {checklist.map((item, i) => {
              const Icon = item.icon;
              const Wrapper = item.href ? 'a' : 'div';
              const wrapperProps = item.href
                ? {
                    href: item.href,
                    ...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
                  }
                : {};

              return (
                <Wrapper
                  key={item.id}
                  {...(wrapperProps as any)}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-all group ${
                    item.href ? 'cursor-pointer' : ''
                  } ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} ${
                    i < checklist.length - 1
                      ? isDark ? 'border-b border-white/[0.03]' : 'border-b border-slate-50'
                      : ''
                  }`}
                >
                  {/* Check circle */}
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

                  {/* Text */}
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

                  {/* Arrow for actionable items */}
                  {item.href && !item.done && (
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-all group-hover:translate-x-0.5 ${
                      isDark ? 'text-slate-700 group-hover:text-blue-400' : 'text-slate-300 group-hover:text-blue-500'
                    }`} />
                  )}
                  {item.external && (
                    <ExternalLink className={`w-3 h-3 shrink-0 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                  )}
                </Wrapper>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}