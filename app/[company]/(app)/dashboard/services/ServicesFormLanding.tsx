'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Tag, FileText, ArrowRight, Sun, Moon, Check, X } from 'lucide-react';
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

export default function ServicesFormLanding({ company, currentUser }: { company: any; currentUser: any }) {
  const [view, setView] = useState<View>('landing');

  const [isDark, setIsDark] = useState<boolean>(true);
  const skipFirstThemeWrite = useRef(true);

  useEffect(() => {
    setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
  }, []);

  useEffect(() => {
    if (skipFirstThemeWrite.current) {
      skipFirstThemeWrite.current = false;
      return;
    }
    localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDark]);

  const t = themeTokens(isDark);
  const formLogic = useFormTabLogic(company);
  const { data: templates = [], isLoading: templatesLoading } = useQuoteTemplates(company?.slug, { enabled: can((company?.plan_tier || 'free') as PlanTier, 'quote_templates') });

  // ── Services summary: every service + whether it has a pricing template ──
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

  // ── Booking form summary: which fields customers actually see ──
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

  const pillOn = isDark
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  const pillOff = isDark
    ? 'border-white/10 bg-white/5 text-slate-400'
    : 'border-slate-200 bg-slate-50 text-slate-500';
  const pillBase = 'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold';

  const backBar = (max: string) => (
    <div className={`mx-auto ${max} px-4 pt-5 sm:px-6`}>
      <button
        onClick={() => setView('landing')}
        className={`inline-flex items-center gap-1.5 text-xs font-bold ${t.subText} hover:opacity-80 transition`}
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
    </div>
  );

  if (view === 'services') {
    return (
      <div className={`min-h-screen ${t.bg} transition-colors`}>
        {backBar('max-w-5xl')}
        <CategoriesTab
          company={company}
          currentUser={currentUser}
          isDark={isDark}
          onToggleTheme={() => setIsDark((v) => !v)}
        />
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className={`min-h-screen ${t.bg} transition-colors`}>
        {backBar('max-w-5xl')}
        <BookingFormConfig company={company} formLogic={formLogic} isDark={isDark} t={t} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.bg} transition-colors font-sans`}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8 pb-20">
        <div
          className="flex items-center justify-between gap-4 pb-6 border-b"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
        >
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${t.heading}`}>
              Services &amp; Booking Form
            </h1>
            <p className={`mt-1 text-xs sm:text-sm ${t.subText}`}>
              What customers can request, and how they ask for it.
            </p>
          </div>
          <button
            onClick={() => setIsDark((v) => !v)}
            className={`shrink-0 rounded-xl border p-2.5 transition-colors ${
              isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 items-stretch">
          {/* SERVICES CARD */}
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setView('services')}
            className={`flex flex-col rounded-2xl border ${t.border} ${t.cardBg} p-6 text-left transition hover:border-blue-400`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white mb-4">
              <Tag className="h-5 w-5" />
            </div>
            <p className={`text-lg font-bold ${t.cardText}`}>Services & Templates</p>
            <p className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${t.subText}`}>
              Add the services you offer. Create reusable templates for estimates/quotes so you can price jobs instantly in 1-click.
            </p>

            <div className="mt-5 flex-1">
              <p className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${t.subText}`}>
                {templatesLoading
                  ? `${services.length} services`
                  : `${services.length} services · ${servicesWithTemplate} with estimate templates`}
              </p>
              {services.length === 0 ? (
                <p className={`text-xs ${t.subText}`}>No services yet — add your first one.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {services.slice(0, MAX_PILLS).map((s) => (
                    <span
                      key={s.value}
                      className={`${pillBase} ${!templatesLoading && s.hasTemplate ? pillOn : pillOff}`}
                      title={s.hasTemplate ? 'Estimate template set up' : 'No estimate template yet'}
                    >
                      {!templatesLoading &&
                        (s.hasTemplate ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3 text-rose-400" />
                        ))}
                      {s.label}
                    </span>
                  ))}
                  {services.length > MAX_PILLS && (
                    <span className={`${pillBase} ${pillOff}`}>+{services.length - MAX_PILLS} more</span>
                  )}
                </div>
              )}
              {!templatesLoading && services.length > 0 && servicesWithTemplate < services.length && (
                <p className={`mt-2 text-[11px] ${t.subText}`}>
                  <X className="mr-0.5 inline h-3 w-3 text-rose-400" /> = no estimate template yet. Add one so quotes load in one click.
                </p>
              )}
            </div>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-500">
              Add services & templates <ArrowRight className="h-4 w-4" />
            </span>
          </motion.button>

          {/* BOOKING FORM CARD */}
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setView('form')}
            className={`flex flex-col rounded-2xl border ${t.border} ${t.cardBg} p-6 text-left transition hover:border-emerald-400`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <p className={`text-lg font-bold ${t.cardText}`}>Booking Form</p>
            <p className={`mt-1.5 text-xs sm:text-sm leading-relaxed ${t.subText}`}>
              Update and test your live booking form. Toggle fields on or off, grab your booking link, and see exactly what customers see.
            </p>

            <div className="mt-5 flex-1">
              <p className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${t.subText}`}>
                Active customer fields
              </p>
              <div className="flex flex-wrap gap-1.5">
                {formFields.map((f) => (
                  <span key={f.label} className={`${pillBase} ${f.on ? pillOn : pillOff}`}>
                    {f.on ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-rose-400" />}
                    {f.label}
                  </span>
                ))}
              </div>
              <p className={`mt-2 text-[11px] ${t.subText}`}>
                {customQuestions.length > 0
                  ? `+ ${customQuestions.length} custom question${customQuestions.length === 1 ? '' : 's'} (shown based on the service selected)`
                  : 'No custom questions yet — add them per service in the Services tab.'}
              </p>
            </div>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-500">
              Update & test form <ArrowRight className="h-4 w-4" />
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}