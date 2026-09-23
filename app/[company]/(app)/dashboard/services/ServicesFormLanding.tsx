'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Tag, FileText, ArrowRight, ArrowDown, Sparkles, Link2, Check,
  ArrowUpRight, Sun, Moon, Mail, HandCoins, CreditCard, CheckCircle2,
  Sliders, ShieldCheck, ExternalLink, HelpCircle, Layers, Settings2, Zap
} from 'lucide-react';
import CategoriesTab from './CategoriesTab';
import BookingFormConfig from './BookingFormConfig';
import TestModeModal from './TestModeModal';
import { useFormTabLogic } from '../../../admin/settings/tabs/useFormTabLogic';
import { themeTokens } from './CategoriesTaskEditorModal';

type View = 'landing' | 'services' | 'form';

/* ═══════════════ Flow Pipeline Diagram ═══════════════ */
function HowItWorksDiagram({ t, isDark }: { t: ReturnType<typeof themeTokens>; isDark: boolean }) {
  const steps = [
    { icon: Mail, label: 'Quote Sent', desc: 'Customer requests job' },
    { icon: HandCoins, label: 'Deposit Paid', desc: 'Locks in schedule' },
    { icon: CreditCard, label: 'Balance Invoiced', desc: 'Sent upon completion' },
    { icon: CheckCircle2, label: 'Paid in Full', desc: 'Auto-reconciled' },
  ];

  return (
    <div className={`relative overflow-hidden rounded-3xl border ${t.border} ${t.cardBg} p-6 sm:p-8 shadow-sm transition-all`}>
      {/* Background Accent Glow */}
      <div className={`absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-blue-600/10' : 'bg-blue-500/10'
      }`} />
      
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 mb-2">
            <Zap className="w-3 h-3" /> System Architecture
          </div>
          <h3 className={`text-base font-bold tracking-tight ${t.cardText}`}>How Services & Booking Connect</h3>
          <p className={`text-xs ${t.subText} mt-0.5`}>Real-time mapping between your catalog, booking intake, and client billing lifecycle.</p>
        </div>
      </div>

      {/* Services → Form Visual Connector */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-dashed border-blue-500/20 bg-blue-500/5">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${t.subText} mb-4 text-center sm:text-left`}>
          1. Intake Pipeline Architecture
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
          
          {/* Card 1: Services */}
          <div className={`w-full sm:flex-1 rounded-xl border ${isDark ? 'border-blue-500/30 bg-slate-900/80' : 'border-blue-200 bg-white'} p-4 shadow-sm`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-xs font-bold ${t.cardText}`}>Services Catalog</p>
                <p className="text-[10px] text-blue-500 font-medium">Source Configuration</p>
              </div>
            </div>
            <p className={`text-[11px] leading-relaxed ${t.subText}`}>
              Configures category pricing, mandatory deposit amounts, and conditional custom questions.
            </p>
          </div>

          {/* Animated Arrow Connector */}
          <div className="flex items-center justify-center py-1 sm:py-0">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden text-blue-500 sm:block"
            >
              <div className="p-2 rounded-full bg-blue-500/10">
                <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-blue-500 sm:hidden"
            >
              <div className="p-2 rounded-full bg-blue-500/10">
                <ArrowDown className="h-4 w-4" />
              </div>
            </motion.div>
          </div>

          {/* Card 2: Booking Form */}
          <div className={`w-full sm:flex-1 rounded-xl border ${t.border} ${isDark ? 'bg-slate-900/80' : 'bg-white'} p-4 shadow-sm`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-xs font-bold ${t.cardText}`}>Public Booking Form</p>
                <p className="text-[10px] text-emerald-500 font-medium">Customer Facing</p>
              </div>
            </div>
            <p className={`text-[11px] leading-relaxed ${t.subText}`}>
              Dynamically presents tailored questions and field logic based on chosen services.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Lifecycle Step Diagram */}
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-wider ${t.subText} mb-4`}>
          2. Client Payment Lifecycle Flow
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className={`relative rounded-xl border ${t.border} ${
                isDark ? 'bg-white/[0.02]' : 'bg-slate-50/70'
              } p-3.5 flex flex-row sm:flex-col items-center sm:items-start gap-3 transition-hover hover:border-blue-500/40`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold text-xs">
                <step.icon className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold tracking-widest text-blue-500 uppercase">Step 0{i + 1}</span>
                <p className={`text-xs font-bold ${t.cardText} mt-0.5`}>{step.label}</p>
                <p className={`text-[10px] ${t.subText} mt-0.5`}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServicesFormLanding({ company, currentUser }: { company: any; currentUser: any }) {
  const [view, setView] = useState<View>('landing');
  const [isTestModeOpen, setIsTestModeOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
  const { publicUrl, categories, customQuestions, fieldConfig, canUseCustomQuestions, brandColor1, brandColor2, getCtaHeading } = formLogic;

  // Render Sub-Views (Services tab or Booking Form tab) with styled header return bars
  if (view === 'services') {
    return (
      <div className={`min-h-screen ${t.bg} transition-colors`}>
        <div className={`sticky top-0 z-40 border-b ${t.border} ${isDark ? 'bg-[#0b0f17]/80' : 'bg-white/80'} backdrop-blur-md`}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex items-center justify-between">
            <button
              onClick={() => setView('landing')}
              className={`inline-flex items-center gap-2 text-xs font-bold ${t.subText} hover:${isDark ? 'text-white' : 'text-slate-900'} px-3 py-1.5 rounded-lg border ${t.border} transition-all`}
            >
              <ChevronLeft className="h-4 w-4" /> Return to Overview
            </button>
            <span className={`text-xs font-bold ${t.cardText} flex items-center gap-1.5`}>
              <Tag className="w-3.5 h-3.5 text-blue-500" /> Services & Category Manager
            </span>
          </div>
        </div>
        <CategoriesTab company={company} currentUser={currentUser} />
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className={`min-h-screen ${t.bg} transition-colors`}>
        <div className={`sticky top-0 z-40 border-b ${t.border} ${isDark ? 'bg-[#0b0f17]/80' : 'bg-white/80'} backdrop-blur-md`}>
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 flex items-center justify-between">
            <button
              onClick={() => setView('landing')}
              className={`inline-flex items-center gap-2 text-xs font-bold ${t.subText} hover:${isDark ? 'text-white' : 'text-slate-900'} px-3 py-1.5 rounded-lg border ${t.border} transition-all`}
            >
              <ChevronLeft className="h-4 w-4" /> Return to Overview
            </button>
            <span className={`text-xs font-bold ${t.cardText} flex items-center gap-1.5`}>
              <FileText className="w-3.5 h-3.5 text-emerald-500" /> Booking Form Configuration
            </span>
          </div>
        </div>
        <BookingFormConfig company={company} formLogic={formLogic} isDark={isDark} t={t} />
      </div>
    );
  }

  // Active categories count for status badge
  const activeCategoriesCount = Array.isArray(categories) ? categories.length : 0;

  return (
    <>
      <div className={`min-h-screen ${t.bg} transition-colors font-sans`}>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8 pb-20">
          
          {/* Main Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Intake Ready
                </span>
                <span className={`text-xs ${t.subText}`}>• {activeCategoriesCount} Active Services</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${t.heading}`}>
                Services & Booking Portal
              </h1>
              <p className={`text-xs sm:text-sm ${t.subText} max-w-xl`}>
                Configure your service menu, pricing logic, intake form fields, and preview live customer experience.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsDark((v) => !v)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  isDark 
                    ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' 
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
                }`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

          {/* Primary Action Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            
            {/* Services Module Card */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => setView('services')}
              className={`group relative overflow-hidden rounded-3xl border ${t.border} ${t.cardBg} p-6 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-500/50`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                  <Tag className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full">
                  {activeCategoriesCount} Active <Layers className="w-3 h-3" />
                </span>
              </div>

              <h2 className={`text-lg font-bold ${t.cardText} group-hover:text-blue-500 transition-colors`}>
                Services & Pricing Catalog
              </h2>
              <p className={`mt-2 text-xs leading-relaxed ${t.subText}`}>
                Define service offerings, pricing calculation rules, deposits, and service-specific intake questions.
              </p>

              <div className="mt-6 flex items-center justify-between pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <span className="text-xs font-bold text-blue-500 flex items-center gap-1">
                  Manage Catalog <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <Sliders className={`h-4 w-4 ${t.subText}`} />
              </div>
            </motion.div>

            {/* Booking Form Card */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => setView('form')}
              className={`group relative overflow-hidden rounded-3xl border ${t.border} ${t.cardBg} p-6 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:border-emerald-500/50`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  Form Layout <Settings2 className="w-3 h-3" />
                </span>
              </div>

              <h2 className={`text-lg font-bold ${t.cardText} group-hover:text-emerald-500 transition-colors`}>
                Public Booking Form Builder
              </h2>
              <p className={`mt-2 text-xs leading-relaxed ${t.subText}`}>
                Customize customer intake fields, address validation, photo upload requirements, and primary CTA messaging.
              </p>

              <div className="mt-6 flex items-center justify-between pt-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  Configure Fields <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <ShieldCheck className={`h-4 w-4 ${t.subText}`} />
              </div>
            </motion.div>

          </div>

          {/* Workflow Architecture Diagram */}
          <HowItWorksDiagram t={t} isDark={isDark} />

          {/* Live Link vs Test Sandbox Row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            
            {/* Live Share Link Box */}
            <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-5 flex flex-col justify-between shadow-sm`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <span className={`text-xs font-bold ${t.cardText}`}>Live Production URL</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                </div>

                <div className={`flex items-center justify-between rounded-xl border ${t.border} ${isDark ? 'bg-black/20' : 'bg-slate-50'} p-2.5 gap-2`}>
                  <code className={`block truncate font-mono text-xs font-semibold ${t.cardText}`}>
                    {publicUrl}
                  </code>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 1800);
                  }}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border ${t.border} py-2 text-xs font-semibold ${t.cardText} transition hover:bg-slate-500/10`}
                >
                  {linkCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
                  {linkCopied ? 'Copied to Clipboard' : 'Copy Link'}
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  Open <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Test Mode Preview Box */}
            <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-5 flex flex-col justify-between shadow-sm relative overflow-hidden`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className={`text-xs font-bold ${t.cardText}`}>Interactive Test Sandbox</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">Safe Preview</span>
                </div>

                <p className={`text-xs leading-relaxed ${t.subText}`}>
                  Test your two-step booking flow end-to-end. Experience custom question logic and conditional fields without generating real lead records.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <button
                  onClick={() => setIsTestModeOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" /> Launch Test Mode
                </button>
              </div>
            </div>

          </div>

          {/* Quick Helper Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              onClick={() => setView('services')}
              className={`flex items-start gap-3 rounded-2xl border ${t.border} ${t.cardBg} p-4 text-left cursor-pointer transition-all hover:border-blue-400/50`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 mt-0.5">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${t.cardText}`}>Custom Service Questions</p>
                <p className={`mt-0.5 text-xs ${t.subText}`}>Attach unique intake questions to specific categories under Services.</p>
              </div>
            </div>

            <div
              onClick={() => setView('form')}
              className={`flex items-start gap-3 rounded-2xl border ${t.border} ${t.cardBg} p-4 text-left cursor-pointer transition-all hover:border-emerald-400/50`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5">
                <Sliders className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${t.cardText}`}>Form Field Toggles</p>
                <p className={`mt-0.5 text-xs ${t.subText}`}>Turn address fields, photo attachments, and date picking on or off.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Integration */}
      <AnimatePresence>
        {isTestModeOpen && (
          <TestModeModal
            company={company}
            categories={categories}
            customQuestions={customQuestions}
            fieldConfig={fieldConfig}
            canUseCustomQuestions={canUseCustomQuestions}
            brandColor1={brandColor1}
            brandColor2={brandColor2}
            getCtaHeading={getCtaHeading}
            isDark={isDark}
            onClose={() => setIsTestModeOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}