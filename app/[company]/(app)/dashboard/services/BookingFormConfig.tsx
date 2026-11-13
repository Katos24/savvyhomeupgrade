'use client';

// Booking form settings. Kept deliberately quiet:
//   left  = four switches ("Ask customers for…")
//   right = the real form, updating as you flip them
//   top   = one Share button (link, QR code, website, test email)

import {
  AlertCircle, Check, X, Eye, MapPin, Calendar, ImageIcon, Megaphone,
  Lock, ArrowRight, Loader2, Share2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TestModeModal from './TestModeModal';
import ShareFormModal from './ShareFormModal';
import UploadForm from '@/components/UploadForm';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';
import { REQUIRED_PLAN } from '../../../admin/settings/tabs/useFormTabLogic';
import { themeTokens } from './CategoriesTaskEditorModal';

type Theme = ReturnType<typeof themeTokens>;

function tokens(isDark: boolean) {
  return isDark
    ? {
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        card: 'border-white/10 bg-[#0f1420]',
        divide: 'divide-white/10',
        btn: 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        icon: 'text-slate-400',
        iconOn: 'text-white',
        lockPill: 'border-white/15 text-slate-300 hover:bg-white/10',
        panel: 'border-white/10 bg-white/[0.03]',
        link: 'text-slate-200',
      }
    : {
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        card: 'border-slate-200 bg-white',
        divide: 'divide-slate-100',
        btn: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        icon: 'text-slate-400',
        iconOn: 'text-slate-900',
        lockPill: 'border-slate-300 text-slate-600 hover:bg-slate-50',
        panel: 'border-slate-200 bg-slate-100',
        link: 'text-slate-900',
      };
}
type Tok = ReturnType<typeof tokens>;

function ToggleSwitch({ enabled, onToggle, ariaLabel, isDark }: { enabled: boolean; onToggle: () => void; ariaLabel: string; isDark: boolean }) {
  const on = isDark ? 'bg-white' : 'bg-slate-900';
  const off = isDark ? 'bg-white/15' : 'bg-slate-300';
  const knob = enabled && isDark ? 'bg-slate-900' : 'bg-white';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${enabled ? on : off}`}
    >
      <span className={`h-5 w-5 rounded-full shadow transition-transform ${knob} ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function FieldRow({
  icon: Icon, label, enabled, onToggle, locked, companySlug, c, isDark,
}: {
  icon: React.ElementType; label: string; enabled: boolean; onToggle: () => void;
  locked?: boolean; companySlug: string; c: Tok; isDark: boolean;
}) {
  const active = enabled && !locked;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className={`h-4 w-4 shrink-0 ${active ? c.iconOn : c.icon}`} />
      <p className={`flex-1 text-[15px] font-medium ${active ? c.text : c.sub}`}>{label}</p>
      {locked ? (
        <a
          href={`/${companySlug}/home?section=billing`}
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition ${c.lockPill}`}
        >
          <Lock className="h-3 w-3" /> {REQUIRED_PLAN.label}
        </a>
      ) : (
        <ToggleSwitch enabled={enabled} onToggle={onToggle} ariaLabel={`Ask for ${label}`} isDark={isDark} />
      )}
    </div>
  );
}

/**
 * The real booking form component, in demo mode, using the switches as they
 * are right now. Opens on step 2 (the part the switches change).
 */
function LivePreview({
  company, fieldConfig, customQuestions, categories,
  canUseCustomQuestions, canUsePhotoUpload, canCustomizeForm, scrollClass,
}: {
  company: any; fieldConfig: any; customQuestions: any[]; categories: any[];
  canUseCustomQuestions: boolean; canUsePhotoUpload: boolean; canCustomizeForm: boolean; scrollClass: string;
}) {
  const [step, setStep] = useState<1 | 2>(2);
  const [nonce, setNonce] = useState(0);
  const [service, setService] = useState<string>(categories?.[0]?.value || '');
  const go = (s: 1 | 2) => { setStep(s); setNonce((n) => n + 1); };

  const questions = canUseCustomQuestions ? customQuestions || [] : [];
  const questionsForService = questions.filter((q: any) => !q.category || q.category === service);
  // Service chips only matter when services actually have different questions.
  const showServicePicker = step === 2 && categories.length > 1 && questions.some((q: any) => q.category);

  const anyField =
    canCustomizeForm &&
    (fieldConfig.address?.enabled ||
      fieldConfig.preferred_date?.enabled ||
      fieldConfig.lead_source?.enabled ||
      (canUsePhotoUpload && fieldConfig.file_upload?.enabled));
  const step2Empty = !canCustomizeForm || (!anyField && questionsForService.length === 0);

  const previewCompany = {
    ...company,
    form_field_config: {
      ...fieldConfig,
      file_upload: { enabled: canUsePhotoUpload ? !!fieldConfig.file_upload?.enabled : false },
    },
    custom_questions: questions,
  };

  const tabCls = (on: boolean) =>
    `rounded-lg py-1.5 text-sm font-semibold transition ${on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1">
        <button type="button" onClick={() => go(1)} className={tabCls(step === 1)} aria-pressed={step === 1}>Step 1 · Contact</button>
        <button type="button" onClick={() => go(2)} className={tabCls(step === 2)} aria-pressed={step === 2}>Step 2 · Details</button>
      </div>

      {showServicePicker && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Questions for</span>
          {categories.map((cat: any) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setService(cat.value)}
              className={`rounded-md border px-2 py-0.5 text-xs font-semibold transition ${
                service === cat.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className={`overflow-y-auto rounded-xl border border-slate-200 bg-white ${scrollClass}`}>
        {step === 2 && step2Empty ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-800">
              {canCustomizeForm ? 'Nothing extra is asked' : `Step 2 is on the ${REQUIRED_PLAN.label} plan`}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {canCustomizeForm ? 'Customers are done after step 1. Turn on a switch to ask more.' : 'Customers are done after step 1.'}
            </p>
          </div>
        ) : (
          <UploadForm
            company={previewCompany}
            demo
            embedded
            showHeader={false}
            previewStep={step}
            previewNonce={nonce}
            previewCategory={service}
          />
        )}
      </div>
    </div>
  );
}

export default function BookingFormConfig({
  company,
  formLogic,
  isDark,
}: {
  company: any;
  formLogic: any;
  isDark: boolean;
  t?: Theme; // still accepted from the parent
}) {
  const {
    canUsePhotoUpload, canUseCustomQuestions, canCustomizeForm, loading, status, customQuestions,
    fieldConfig, isDirty, categories, brandColor1, brandColor2, getCtaHeading, toggleField,
    togglePreferredDateTime, handleSaveAll, publicUrl,
  } = formLogic;
  const autoSave: boolean = !!formLogic.autoSave;
  const retrySave: () => void = formLogic.retrySave ?? handleSaveAll;

  const [isTestModeOpen, setIsTestModeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // phones
  const c = tokens(isDark);

  useEffect(() => {
    if (!isPreviewOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsPreviewOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPreviewOpen]);

  const previewProps = {
    company,
    fieldConfig,
    customQuestions,
    categories: categories || [],
    canUseCustomQuestions,
    canUsePhotoUpload,
    canCustomizeForm,
  };

  const saveIndicator = autoSave
    ? loading || (isDirty && status.type !== 'error')
      ? <span className={`inline-flex items-center gap-1 text-xs ${c.faint}`}><Loader2 className="h-3 w-3 animate-spin" /> Saving</span>
      : status.type === 'error'
      ? <button type="button" onClick={retrySave} className="inline-flex items-center gap-1 text-xs font-medium text-rose-500"><AlertCircle className="h-3 w-3" /> Try again</button>
      : status.type === 'success'
      ? <span className={`inline-flex items-center gap-1 text-xs ${c.faint}`}><Check className="h-3 w-3" /> Saved</span>
      : null
    : null;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6">
        {/* Header: title + one Share button */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className={`text-xl font-semibold tracking-tight sm:text-2xl ${c.text}`}>Booking form</h1>
            <p className={`mt-0.5 text-sm ${c.sub}`}>What customers fill out to request a job.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition lg:hidden ${c.btn}`}
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${c.primary}`}
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>

        {company.plan_tier === 'free' && (
          <div className="mt-5">
            <SettingsUpgradeBanner
              planLabel={REQUIRED_PLAN.label}
              price={REQUIRED_PLAN.price}
              message="Your booking form is live. Upgrade to ask for photos, address, and questions per service."
              companySlug={company.slug}
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Left: the switches */}
          <div className="min-w-0">
            <div className={`overflow-hidden rounded-2xl border ${c.card}`}>
              <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
                <p className={`text-sm font-semibold ${c.text}`}>Ask customers for…</p>
                {saveIndicator}
              </div>
              <div className={`divide-y ${c.divide}`}>
                <FieldRow icon={MapPin} label="Address" enabled={fieldConfig.address.enabled} onToggle={() => toggleField('address')} locked={!canCustomizeForm} companySlug={company.slug} c={c} isDark={isDark} />
                <FieldRow icon={Calendar} label="Timing" enabled={fieldConfig.preferred_date.enabled} onToggle={togglePreferredDateTime} locked={!canCustomizeForm} companySlug={company.slug} c={c} isDark={isDark} />
                <FieldRow icon={Megaphone} label="How they found you" enabled={fieldConfig.lead_source.enabled} onToggle={() => toggleField('lead_source')} locked={!canCustomizeForm} companySlug={company.slug} c={c} isDark={isDark} />
                <FieldRow icon={ImageIcon} label="Photos" enabled={fieldConfig.file_upload.enabled} onToggle={() => toggleField('file_upload')} locked={!canUsePhotoUpload} companySlug={company.slug} c={c} isDark={isDark} />
              </div>
            </div>

            <a
              href={`/${company.slug}/dashboard/services?view=services`}
              className={`mt-3 flex items-center justify-between gap-2 rounded-xl px-1 py-1.5 text-sm transition hover:opacity-80 ${c.sub}`}
            >
              <span>Services and their questions are set in <strong className={c.link}>Services</strong></span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </a>

            {/* Manual-save mode only */}
            {!autoSave && isDirty && (
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={loading}
                className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50 ${c.primary}`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Saving…' : 'Save changes'}
              </button>
            )}
            {!autoSave && status.type === 'error' && (
              <p className="mt-2 text-sm font-medium text-rose-500">{status.message}</p>
            )}
          </div>

          {/* Right: the real form (desktop) */}
          <div className="hidden min-w-0 lg:block">
            <div className="sticky top-6">
              <div className={`rounded-2xl border p-2.5 ${c.panel}`}>
                <LivePreview {...previewProps} scrollClass="h-[min(620px,calc(100vh-12rem))]" />
              </div>
              <p className={`mt-2 text-center text-[12px] ${c.faint}`}>This is your real form. Try it — nothing here is sent.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phones: full-screen preview */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex flex-col bg-slate-100 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Booking form preview"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Your booking form</p>
                <p className="text-xs text-slate-500">Try it — nothing here is sent.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <LivePreview {...previewProps} scrollClass="h-[calc(100dvh-10.5rem)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareFormModal
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        publicUrl={publicUrl}
        companyName={company.name}
        isDark={isDark}
        onTestEmail={() => setIsTestModeOpen(true)}
      />

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