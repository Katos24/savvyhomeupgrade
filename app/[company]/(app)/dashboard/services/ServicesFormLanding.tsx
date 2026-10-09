'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, Tag, FileText, ChevronRight, Sun, Moon, Check } from 'lucide-react';
import CategoriesTab from './CategoriesTab';
import BookingFormConfig from './BookingFormConfig';
import { useFormTabLogic } from '../../../admin/settings/tabs/useFormTabLogic';
import { themeTokens } from './CategoriesTaskEditorModal';
import { useQuoteTemplates } from '@/hooks/useQuoteTemplates';
import { can, type PlanTier } from '@/lib/permissions';

type View = 'landing' | 'services' | 'form';

const MAX_PILLS = 8;

const parseArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

function landingTokens(isDark: boolean) {
  return isDark
    ? {
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        card: 'border-white/10 bg-[#0f1420] hover:border-white/25',
        icon: 'bg-white/[0.06] text-slate-200',
        pillOn: 'border-white/15 bg-white/[0.08] text-white',
        pillOff: 'border-dashed border-white/20 text-slate-400',
        btn: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
        divider: 'border-white/10',
        link: 'text-white',
      }
    : {
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        card: 'border-slate-200 bg-white hover:border-slate-400',
        icon: 'bg-slate-100 text-slate-700',
        pillOn: 'border-slate-200 bg-slate-50 text-slate-900',
        pillOff: 'border-dashed border-slate-300 text-slate-500',
        btn: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
        divider: 'border-slate-200',
        link: 'text-slate-900',
      };
}

export default function ServicesFormLanding({ company, currentUser }: { company: any; currentUser: any }) {
  const [view, setView] = useState<View>('landing');

  // Theme: same key + event as the rest of the app.
  const [isDark, setIsDark] = useState<boolean>(true);
  const skipFirstThemeWrite = useRef(true);
  useEffect(() => {
    try {
      setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
    } catch {}
  }, []);
  useEffect(() => {
    if (skipFirstThemeWrite.current) {
      skipFirstThemeWrite.current = false;
      return;
    }
    try {
      localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
    } catch {}
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDark]);

  // Scroll to top when switching views (matters most on phones).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const t = themeTokens(isDark);
  const l = landingTokens(isDark);
  const formLogic = useFormTabLogic(company);
  const { data: templates = [], isLoading: templatesLoading } = useQuoteTemplates(company?.slug, {
    enabled: can((company?.plan_tier || 'free') as PlanTier, 'quote_templates'),
  });

  const services = useMemo(() => {
    return parseArray(formLogic.categories)
      .filter((c: any) => c && (c.value || c.label))
      .map((c: any) => {
        const value = c.value || c.label;
        return {
          value,
          label: c.label || String(value).replace(/_/g, ' '),
          hasTemplate: templates.some((tpl: any) => tpl.category === value),
        };
      });
  }, [formLogic.categories, templates]);
  const servicesWithTemplate = services.filter((s) => s.hasTemplate).length;
  const missingTemplates = services.length - servicesWithTemplate;

  const fc: any = (formLogic as any).fieldConfig || {};
  const customQuestions = parseArray((formLogic as any).customQuestions ?? company?.custom_questions);
  const formFields = [
    { label: 'Name', on: true },
    { label: 'Email', on: true },
    { label: 'Phone', on: true },
    { label: 'Service', on: true },
    { label: 'Description', on: true },
    { label: 'Address', on: !!fc.address?.enabled },
    { label: 'Timing', on: !!fc.preferred_date?.enabled },
    { label: 'How they found you', on: !!fc.lead_source?.enabled },
    { label: 'Photos', on: !!fc.file_upload?.enabled },
  ];
  const fieldsOn = formFields.filter((f) => f.on);
  const fieldsOff = formFields.filter((f) => !f.on);

  const pill = 'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[13px] font-medium';

  const backBar = (max: string) => (
    <div className={`mx-auto ${max} px-4 pt-4 sm:px-6`}>
      <button
        type="button"
        onClick={() => setView('landing')}
        className={`-ml-2 inline-flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-sm font-medium transition hover:opacity-80 ${l.sub}`}
      >
        <ChevronLeft className="h-4 w-4" /> Services &amp; booking form
      </button>
    </div>
  );

  if (view === 'services') {
    return (
      <div className={`min-h-screen ${t.bg} transition-colors`}>
        {backBar('max-w-4xl')}
        <CategoriesTab company={company} currentUser={currentUser} isDark={isDark} onToggleTheme={() => setIsDark((v) => !v)} />
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className={`min-h-screen ${t.bg} transition-colors`}>
        {backBar('max-w-4xl')}
        <BookingFormConfig company={company} formLogic={formLogic} isDark={isDark} t={t} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.bg} transition-colors`}>
      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className={`text-xl font-semibold tracking-tight sm:text-2xl ${l.text}`}>Services &amp; booking form</h1>
            <p className={`mt-0.5 text-sm ${l.sub}`}>What customers can book, and the form they use to book it.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${l.btn}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Services */}
          <button
            type="button"
            onClick={() => setView('services')}
            className={`group flex flex-col rounded-2xl border p-5 text-left transition sm:p-6 ${l.card}`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${l.icon}`}>
                <Tag className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-lg font-semibold ${l.text}`}>Services</p>
                <p className={`text-[13px] ${l.sub}`}>
                  {services.length} service{services.length === 1 ? '' : 's'}
                  {!templatesLoading && services.length > 0 && ` · ${servicesWithTemplate} priced`}
                </p>
              </div>
              <ChevronRight className={`h-5 w-5 shrink-0 transition group-hover:translate-x-0.5 ${l.faint}`} />
            </div>

            <p className={`mt-3 text-sm leading-relaxed ${l.sub}`}>
              Your deposit, the services you offer, and a starting price, questions and checklist for each.
            </p>

            <div className="mt-4 flex-1">
              {services.length === 0 ? (
                <p className={`text-sm ${l.sub}`}>No services yet. Add your first one.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {services.slice(0, MAX_PILLS).map((s) => {
                    const priced = !templatesLoading && s.hasTemplate;
                    return (
                      <span
                        key={s.value}
                        className={`${pill} ${priced || templatesLoading ? l.pillOn : l.pillOff}`}
                        title={s.hasTemplate ? 'Has an estimate template' : 'No estimate template yet'}
                      >
                        {priced && <Check className="h-3 w-3" />}
                        {s.label}
                      </span>
                    );
                  })}
                  {services.length > MAX_PILLS && (
                    <span className={`${pill} ${l.pillOn}`}>+{services.length - MAX_PILLS} more</span>
                  )}
                </div>
              )}
              {!templatesLoading && missingTemplates > 0 && (
                <p className={`mt-2.5 text-[13px] ${l.faint}`}>
                  {missingTemplates} without a starting price yet (dashed). Add one so quotes load in one click.
                </p>
              )}
            </div>

            <span className={`mt-5 border-t pt-3 text-sm font-semibold ${l.divider} ${l.link}`}>Manage services</span>
          </button>

          {/* Booking form */}
          <button
            type="button"
            onClick={() => setView('form')}
            className={`group flex flex-col rounded-2xl border p-5 text-left transition sm:p-6 ${l.card}`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${l.icon}`}>
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-lg font-semibold ${l.text}`}>Booking form</p>
                <p className={`text-[13px] ${l.sub}`}>
                  {fieldsOn.length} fields on
                  {customQuestions.length > 0 &&
                    ` · ${customQuestions.length} service question${customQuestions.length === 1 ? '' : 's'}`}
                </p>
              </div>
              <ChevronRight className={`h-5 w-5 shrink-0 transition group-hover:translate-x-0.5 ${l.faint}`} />
            </div>

            <p className={`mt-3 text-sm leading-relaxed ${l.sub}`}>
              Choose which fields customers fill in, get your booking link, and test it as a customer.
            </p>

            <div className="mt-4 flex-1">
              <div className="flex flex-wrap gap-1.5">
                {fieldsOn.map((f) => (
                  <span key={f.label} className={`${pill} ${l.pillOn}`}>
                    <Check className="h-3 w-3" />
                    {f.label}
                  </span>
                ))}
                {fieldsOff.map((f) => (
                  <span key={f.label} className={`${pill} ${l.pillOff}`} title="Turned off">
                    {f.label}
                  </span>
                ))}
              </div>
              {fieldsOff.length > 0 && <p className={`mt-2.5 text-[13px] ${l.faint}`}>Dashed fields are turned off.</p>}
            </div>

            <span className={`mt-5 border-t pt-3 text-sm font-semibold ${l.divider} ${l.link}`}>Edit and test form</span>
          </button>
        </div>
      </div>
    </div>
  );
}