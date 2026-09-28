'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Tag, FileText, ArrowRight, Sun, Moon } from 'lucide-react';
import CategoriesTab from './CategoriesTab';
import BookingFormConfig from './BookingFormConfig';
import { useFormTabLogic } from '../../../admin/settings/tabs/useFormTabLogic';
import { themeTokens } from './CategoriesTaskEditorModal';

type View = 'landing' | 'services' | 'form';

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
  const activeCategoriesCount = Array.isArray(formLogic.categories) ? formLogic.categories.length : 0;

   const backBar = (max: string, _icon: React.ReactNode, _label: string) => (
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
        {backBar('max-w-5xl', <Tag className="w-3.5 h-3.5 text-blue-500" />, 'Services')}
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
        {backBar('max-w-5xl', <FileText className="w-3.5 h-3.5 text-emerald-500" />, 'Booking Form')}
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setView('services')}
            className={`rounded-2xl border ${t.border} ${t.cardBg} p-6 text-left transition hover:border-blue-400`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white mb-4">
              <Tag className="h-5 w-5" />
            </div>
            <p className={`text-lg font-bold ${t.cardText}`}>Services</p>
            <p className={`mt-1 text-xs leading-relaxed ${t.subText}`}>
              Categories, pricing, deposits, and questions per service.
            </p>
            <p className={`mt-4 text-xs font-semibold ${t.subText}`}>
              {activeCategoriesCount} active
            </p>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-blue-500">
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setView('form')}
            className={`rounded-2xl border ${t.border} ${t.cardBg} p-6 text-left transition hover:border-emerald-400`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <p className={`text-lg font-bold ${t.cardText}`}>Booking Form</p>
            <p className={`mt-1 text-xs leading-relaxed ${t.subText}`}>
              Choose your form fields, share your link, and test it.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
              Open <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}