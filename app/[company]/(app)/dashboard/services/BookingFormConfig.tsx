'use client';

import {
  AlertCircle, Check, Edit2, X, ChevronDown, Eye, User, Mail, Phone,
  MapPin, Calendar, Clock, ImageIcon, Megaphone, Lock, ArrowUpRight, Sparkles, Zap, Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';
import { REQUIRED_PLAN, type Category } from '../../../admin/settings/tabs/useFormTabLogic';
import { themeTokens } from './CategoriesTaskEditorModal';

type Theme = ReturnType<typeof themeTokens>;

/* ═══════════════ Helpers ═══════════════ */

function UpgradePill({ companySlug }: { companySlug: string }) {
  return (
    <a
      href={`/${companySlug}/home?section=billing`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-amber-700 shadow-xs"
    >
      <Lock className="h-3 w-3" />
      <span>{REQUIRED_PLAN.label}</span>
    </a>
  );
}

function UpgradeNotice({ companySlug, feature, t, isDark }: { companySlug: string; feature: string; t: Theme; isDark: boolean }) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl border ${isDark ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-50/80'} p-4 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="flex items-start gap-3">
        <Lock className={`mt-0.5 h-4 w-4 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
        <p className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
          {feature} is available on the <span className="font-bold">{REQUIRED_PLAN.label} plan ({REQUIRED_PLAN.price})</span>.
        </p>
      </div>
      <a
        href={`/${companySlug}/home?section=billing`}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 shadow-xs"
      >
        Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function ToggleSwitch({ enabled, onToggle, ariaLabel }: { enabled: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-blue-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/* ═══════════════ Phone Frame Mockups ═══════════════ */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative h-[540px] rounded-[2.25rem] border-[8px] border-slate-900 bg-slate-900 shadow-xl">
        <div className="absolute left-1/2 top-1.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="h-full overflow-y-auto rounded-[1.6rem] bg-white">{children}</div>
      </div>
    </div>
  );
}

function PhoneHeader({ logoUrl, heading, brandColor1, brandColor2 }: { logoUrl?: string | null; heading: string; brandColor1: string; brandColor2: string }) {
  return (
    <div className="px-5 pb-5 pt-8 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
      {logoUrl && <img src={logoUrl} alt="Logo" className="mb-3 h-7 w-auto object-contain" />}
      <h3 className="text-sm font-bold tracking-tight text-white">{heading}</h3>
    </div>
  );
}

const fieldBox = 'flex min-h-[40px] w-full items-center gap-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700';

function PhoneField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

/* ═══════════════ Control Row Components — theme-aware ═══════════════ */

function LockedControlRow({ icon: Icon, label, hint, t, isDark }: { icon: React.ElementType; label: string; hint: string; t: Theme; isDark: boolean }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <Icon className={`h-4 w-4 shrink-0 ${t.subText}`} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-bold ${t.cardText}`}>{label}</p>
        <p className={`mt-0.5 truncate text-[11px] font-medium ${t.subText}`}>{hint}</p>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${t.subText}`}>
        <Lock className="h-3 w-3" /> Required
      </span>
    </div>
  );
}

function ControlRow({
  icon: Icon, label, hint, enabled, onToggle, planLocked, companySlug, t, isDark,
}: {
  icon: React.ElementType; label: string; hint?: string; enabled: boolean; onToggle: () => void;
  planLocked?: boolean; companySlug?: string; t: Theme; isDark: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 ${planLocked ? (isDark ? 'bg-amber-500/5' : 'bg-amber-50/40') : ''}`}>
      <Icon className={`h-4 w-4 shrink-0 ${enabled && !planLocked ? t.cardText : t.subText}`} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-bold ${enabled && !planLocked ? t.cardText : t.subText}`}>{label}</p>
        {hint && <p className={`mt-0.5 truncate text-[11px] font-medium ${t.subText}`}>{hint}</p>}
      </div>
      {planLocked && companySlug ? (
        <UpgradePill companySlug={companySlug} />
      ) : (
        <ToggleSwitch enabled={enabled} onToggle={onToggle} ariaLabel={`Show ${label} on your form`} />
      )}
    </div>
  );
}

/* ═══════════════ Main Component ═══════════════ */

export default function BookingFormConfig({
  company,
  formLogic,
  isDark,
  t,
}: {
  company: any;
  formLogic: any;
  isDark: boolean;
  t: Theme;
}) {
  const {
    canUsePhotoUpload, canUseCustomQuestions, loading, status, customQuestions,
    isPreviewOpen, setIsPreviewOpen, fieldConfig, isDirty, categories,
    brandColor1, brandColor2, getCtaHeading, toggleField, togglePreferredDateTime,
    handleSaveAll, enabledCount,
  } = formLogic;

  const RequiredPhone = (
    <PhoneFrame>
      <PhoneHeader logoUrl={company.logo_url} heading={getCtaHeading()} brandColor1={brandColor1} brandColor2={brandColor2} />
      <div className="space-y-3.5 p-4">
        <PhoneField label="Full Name"><div className={fieldBox}><User className="h-3.5 w-3.5 shrink-0 text-slate-400" />John Smith</div></PhoneField>
        <PhoneField label="Email Address"><div className={fieldBox}><Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">john@example.com</span></div></PhoneField>
        <PhoneField label="Phone Number"><div className={fieldBox}><Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />(555) 123-4567</div></PhoneField>
        <PhoneField label="Service Needed">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat: Category, i: number) => (
              <span key={i} className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${i === 0 ? 'border-transparent text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`} style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}>
                {cat.label}
              </span>
            ))}
          </div>
        </PhoneField>
        <PhoneField label="Project Description"><div className="h-16 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-400">Describe your project here...</div></PhoneField>
        <div className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>Submit Request</div>
      </div>
    </PhoneFrame>
  );

  const OptionalPhone = (
    <PhoneFrame>
      <PhoneHeader logoUrl={company.logo_url} heading={getCtaHeading()} brandColor1={brandColor1} brandColor2={brandColor2} />
      <div className="space-y-3.5 p-4">
        {enabledCount === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
            <p className="text-xs font-bold text-slate-700">No extra fields active</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Clients will only see your standard required fields.</p>
          </div>
        )}
        {fieldConfig.address.enabled && <PhoneField label="Address"><div className={fieldBox}><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">123 Main St, New York 12345</span></div></PhoneField>}
        {fieldConfig.preferred_date.enabled && (
          <PhoneField label="Preferred Date & Time">
            <div className="space-y-2">
              <div className={fieldBox}><Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />MM / DD / YYYY</div>
              <div className={fieldBox}><Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />Morning</div>
            </div>
          </PhoneField>
        )}
        {fieldConfig.lead_source.enabled && <PhoneField label="How did you hear about us?"><div className={fieldBox}><Megaphone className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">Google, referral, saw your truck...</span></div></PhoneField>}
        {fieldConfig.file_upload.enabled && (
          <PhoneField label="Site Photos">
            <div className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-4">
              <ImageIcon className="h-4 w-4 text-slate-400" />
              <p className="text-[11px] font-bold text-slate-600">Tap to upload photos</p>
            </div>
          </PhoneField>
        )}
        {canUseCustomQuestions && customQuestions.map((q: any) => (
          <PhoneField key={q.id} label={q.label}>
            {q.type === 'text' && <div className={`${fieldBox} text-slate-400`}>Client answer...</div>}
            {q.type === 'select' && <div className={`${fieldBox} justify-between`}><span className="truncate">{q.options?.[0] || 'Select an option...'}</span><ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" /></div>}
            {q.type === 'checkbox' && (
              <div className="flex gap-4 py-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" /> Yes</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"><span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" /> No</span>
              </div>
            )}
          </PhoneField>
        ))}
        <div className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>Submit Request</div>
      </div>
    </PhoneFrame>
  );

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 space-y-6">
        {company.plan_tier === 'free' && (
          <SettingsUpgradeBanner planLabel={REQUIRED_PLAN.label} price={REQUIRED_PLAN.price} message="Your booking form is live. Upgrade to add custom branding, photo uploads, and custom questions." companySlug={company.slug} />
        )}

        <AnimatePresence>
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className={`flex items-center gap-2 rounded-lg border p-4 text-xs font-semibold ${
                status.type === 'success'
                  ? isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : isDark ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
            >
              {status.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`rounded-xl border ${t.border} ${t.cardBg} overflow-hidden`}>
          <div className={`flex items-center justify-between gap-3 border-b ${t.border} px-5 py-4`}>
            <div>
              <h2 className={`text-sm font-bold ${t.cardText}`}>Form Fields</h2>
              <p className={`mt-0.5 text-xs ${t.subText}`}>Required fields (Step 1) are always included. Optional fields (Step 2) are yours to toggle.</p>
            </div>
            <button type="button" onClick={() => setIsPreviewOpen(true)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border ${t.border} px-3 py-1.5 text-xs font-semibold ${t.cardText} transition ${t.hoverBg}`}>
              <Eye className={`h-3.5 w-3.5 ${t.subText}`} /> Preview
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x ${isDark ? 'divide-white/10' : 'divide-slate-100'}`}>
            <div className="p-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${t.subText} mb-3`}>Step 1 — Required Fields</h3>
              <div className="space-y-2">
                <LockedControlRow icon={User} label="Full Name" hint="Client's legal or full contact name" t={t} isDark={isDark} />
                <LockedControlRow icon={Mail} label="Email Address" hint="For quote delivery and booking updates" t={t} isDark={isDark} />
                <LockedControlRow icon={Phone} label="Phone Number" hint="For SMS updates and direct call-backs" t={t} isDark={isDark} />
                <LockedControlRow icon={Sparkles} label="Service Category" hint="Required service item or package choices" t={t} isDark={isDark} />
                <LockedControlRow icon={Edit2} label="Project Description" hint="Freeform scope or job details box" t={t} isDark={isDark} />
              </div>
            </div>

            <div className="p-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${t.subText} mb-3`}>Step 2 — Optional Fields You Control</h3>
              <div className="space-y-2">
                <ControlRow icon={MapPin} label="Street Address" hint="Gather specific job site locations" enabled={fieldConfig.address.enabled} onToggle={() => toggleField('address')} t={t} isDark={isDark} />
                <ControlRow icon={Calendar} label="Preferred Date & Time" hint="Clients pick a target date and time" enabled={fieldConfig.preferred_date.enabled} onToggle={togglePreferredDateTime} t={t} isDark={isDark} />
                <ControlRow icon={Megaphone} label="Lead Referral Source" hint="Ask 'How did you hear about us?'" enabled={fieldConfig.lead_source.enabled} onToggle={() => toggleField('lead_source')} t={t} isDark={isDark} />
                <ControlRow
                  icon={ImageIcon}
                  label="Site Photos & Attachments"
                  hint={canUsePhotoUpload ? 'Clients attach job site photos' : `${REQUIRED_PLAN.label} tier required`}
                  enabled={fieldConfig.file_upload.enabled}
                  onToggle={() => toggleField('file_upload')}
                  planLocked={!canUsePhotoUpload}
                  companySlug={company.slug}
                  t={t}
                  isDark={isDark}
                />
              </div>
              {!canUsePhotoUpload && <div className={`border-t ${t.border} mt-3 pt-3`}><UpgradeNotice companySlug={company.slug} feature="Photo Uploads" t={t} isDark={isDark} /></div>}
            </div>
          </div>

          <div className={`flex items-start gap-3 border-t p-4 text-xs font-medium ${isDark ? 'border-blue-500/20 bg-blue-500/5 text-blue-200' : 'border-blue-100 bg-blue-50/60 text-blue-950'}`}>
            <Zap className={`h-4 w-4 shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className="space-y-1">
              <p className={`font-bold ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>How Lead Capture Works</p>
              <p className="leading-relaxed">
                When a customer completes Step 1 and taps submit, their request{' '}
                <span className="font-bold underline decoration-blue-400/50">lands on your dashboard immediately as a new lead</span>.
                Optional fields update that same lead automatically.
              </p>
            </div>
          </div>

          <div className={`flex items-start gap-3 border-t ${t.border} p-4`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'} ${t.subText}`}>
              <Tag className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold ${t.cardText}`}>Managing Services &amp; Questions?</p>
              <p className={`mt-0.5 text-xs ${t.subText}`}>Service item selections and custom questions are managed under Services — they show up here automatically, under Step 2.</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              className={`sticky bottom-4 z-40 mx-auto max-w-xl rounded-xl border ${t.border} ${t.overlayCard} p-4 shadow-xl backdrop-blur-md`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className={`flex items-center gap-2 text-xs font-bold ${t.cardText}`}>
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
                  You have unsaved changes.
                </p>
                <button onClick={handleSaveAll} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition">
                  {loading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isPreviewOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPreviewOpen(false)} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 220 }} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2"><Eye className="h-4 w-4 text-emerald-600" /><span className="text-sm font-bold text-slate-900">Live Mobile Preview</span></div>
                <button type="button" onClick={() => setIsPreviewOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
                <div className="mx-auto flex max-w-xs flex-col gap-8">
                  <div><p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 1 — Required Fields</p>{RequiredPhone}</div>
                  <div><p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Step 2 — Optional Fields You've Enabled</p>{OptionalPhone}</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}