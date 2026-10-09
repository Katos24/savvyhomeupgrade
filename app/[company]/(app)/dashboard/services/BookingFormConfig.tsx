'use client';

import {
  AlertCircle, Check, X, ChevronDown, Eye, User, Mail, Phone, MapPin, Calendar, ImageIcon, Megaphone,
  Lock, ArrowUpRight, Play, Link2, ExternalLink, Loader2, FileText, Tag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TestModeModal from './TestModeModal';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';
import { REQUIRED_PLAN, type Category } from '../../../admin/settings/tabs/useFormTabLogic';
import { themeTokens } from './CategoriesTaskEditorModal';

type Theme = ReturnType<typeof themeTokens>;

// Neutral slate tokens, same family as Services / Financials.
function tokens(isDark: boolean) {
  return isDark
    ? {
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        card: 'border-white/10 bg-[#0f1420]',
        divide: 'divide-white/10',
        border: 'border-white/10',
        btn: 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        chip: 'border-white/15 bg-white/[0.06] text-slate-100',
        code: 'border-white/10 bg-black/20 text-slate-200',
        icon: 'bg-white/[0.06] text-slate-300',
        lockPill: 'border-white/15 text-slate-300 hover:bg-white/10',
        sticky: 'border-white/10 bg-[#0f1420]/95',
        drawer: 'border-white/10 bg-[#0b0f17] text-slate-100',
        drawerBody: 'bg-black/20',
      }
    : {
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        card: 'border-slate-200 bg-white',
        divide: 'divide-slate-100',
        border: 'border-slate-200',
        btn: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        chip: 'border-slate-200 bg-slate-50 text-slate-800',
        code: 'border-slate-200 bg-slate-50 text-slate-800',
        icon: 'bg-slate-100 text-slate-700',
        lockPill: 'border-slate-300 text-slate-600 hover:bg-slate-50',
        sticky: 'border-slate-200 bg-white/95',
        drawer: 'border-slate-200 bg-white text-slate-900',
        drawerBody: 'bg-slate-50',
      };
}
type Tok = ReturnType<typeof tokens>;

/* ─────────────── Small pieces ─────────────── */

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
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${enabled ? on : off}`}
    >
      <span className={`h-6 w-6 rounded-full shadow transition-transform ${knob} ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function PlanPill({ companySlug, c }: { companySlug: string; c: Tok }) {
  return (
    <a
      href={`/${companySlug}/home?section=billing`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${c.lockPill}`}
    >
      <Lock className="h-3 w-3" /> {REQUIRED_PLAN.label}
    </a>
  );
}

function FieldRow({
  icon: Icon, label, hint, enabled, onToggle, planLocked, companySlug, c, isDark,
}: {
  icon: React.ElementType; label: string; hint: string; enabled: boolean; onToggle: () => void;
  planLocked?: boolean; companySlug: string; c: Tok; isDark: boolean;
}) {
  const active = enabled && !planLocked;
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.icon} ${active ? '' : 'opacity-60'}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] font-semibold ${active ? c.text : c.sub}`}>{label}</p>
        <p className={`text-[13px] leading-snug ${c.faint}`}>{hint}</p>
      </div>
      {planLocked ? (
        <PlanPill companySlug={companySlug} c={c} />
      ) : (
        <ToggleSwitch enabled={enabled} onToggle={onToggle} ariaLabel={`Show ${label} on your form`} isDark={isDark} />
      )}
    </div>
  );
}

/* ─────────────── Phone mockups (customer's view, keeps their brand colors) ─────────────── */

function PhoneFrame({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="relative h-[520px] rounded-[2.25rem] border-[8px] border-slate-900 bg-slate-900 shadow-xl">
        <div className="absolute left-1/2 top-1.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className={`h-full overflow-y-auto rounded-[1.6rem] ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>{children}</div>
      </div>
    </div>
  );
}

function PhoneHeader({ logoUrl, heading, brandColor1, brandColor2 }: { logoUrl?: string | null; heading: string; brandColor1: string; brandColor2: string }) {
  return (
    <div className="px-5 pb-5 pt-8 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
      {logoUrl && <img src={logoUrl} alt="" className="mb-3 h-7 w-auto object-contain" />}
      <h3 className="text-sm font-bold tracking-tight text-white">{heading}</h3>
    </div>
  );
}

const fieldBoxCls = (isDark: boolean) =>
  `flex min-h-[40px] w-full items-center gap-2 overflow-hidden rounded-lg border px-3 text-xs font-medium ${
    isDark ? 'border-slate-800 bg-slate-800/60 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'
  }`;

function PhoneField({ label, children, isDark }: { label: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div>
      <p className={`mb-1 text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
      {children}
    </div>
  );
}

/* ─────────────── Main ─────────────── */

export default function BookingFormConfig({
  company,
  formLogic,
  isDark,
}: {
  company: any;
  formLogic: any;
  isDark: boolean;
  t?: Theme; // still accepted from the parent; this screen uses its own tokens
}) {
  const {
    canUsePhotoUpload, canUseCustomQuestions, canCustomizeForm, loading, status, customQuestions,
    isPreviewOpen, setIsPreviewOpen, fieldConfig, isDirty, categories,
    brandColor1, brandColor2, getCtaHeading, toggleField, togglePreferredDateTime,
    handleSaveAll, enabledCount,
  } = formLogic;
  const { publicUrl, linkCopied, setLinkCopied } = formLogic;
  const [isTestModeOpen, setIsTestModeOpen] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const c = tokens(isDark);
  const fieldBox = fieldBoxCls(isDark);

  // Esc closes the preview drawer.
  useEffect(() => {
    if (!isPreviewOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsPreviewOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPreviewOpen, setIsPreviewOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyFailed(false);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setCopyFailed(true);
    }
  };

  // The preview shows the first service as selected, so only its questions.
  const firstService: Category | undefined = categories?.[0];
  const previewQuestions = canUseCustomQuestions
    ? (customQuestions || []).filter((q: any) => !firstService || q.category === firstService.value)
    : [];

  const alwaysAsked = ['Name', 'Email', 'Phone', 'Service', 'Description'];

  const RequiredPhone = (
    <PhoneFrame isDark={isDark}>
      <PhoneHeader logoUrl={company.logo_url} heading={getCtaHeading()} brandColor1={brandColor1} brandColor2={brandColor2} />
      <div className="space-y-3.5 p-4">
        <PhoneField label="Full name" isDark={isDark}><div className={fieldBox}><User className="h-3.5 w-3.5 shrink-0 text-slate-400" />John Smith</div></PhoneField>
        <PhoneField label="Email" isDark={isDark}><div className={fieldBox}><Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">john@example.com</span></div></PhoneField>
        <PhoneField label="Phone" isDark={isDark}><div className={fieldBox}><Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />(555) 123-4567</div></PhoneField>
        <PhoneField label="Service needed" isDark={isDark}>
          <div className="flex flex-wrap gap-1.5">
            {(categories || []).map((cat: Category, i: number) => (
              <span
                key={cat.value || i}
                className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${i === 0 ? 'border-transparent text-white' : isDark ? 'border-slate-800 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
              >
                {cat.label}
              </span>
            ))}
          </div>
        </PhoneField>
        <PhoneField label="Describe the job" isDark={isDark}>
          <div className={`h-16 w-full rounded-lg border p-2.5 text-xs ${isDark ? 'border-slate-800 bg-slate-800/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>Describe your project here…</div>
        </PhoneField>
        <div className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>Submit request</div>
      </div>
    </PhoneFrame>
  );

  const chipCls = isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600';

  const OptionalPhone = (
    <PhoneFrame isDark={isDark}>
      <PhoneHeader logoUrl={company.logo_url} heading={getCtaHeading()} brandColor1={brandColor1} brandColor2={brandColor2} />
      <div className="space-y-3.5 p-4">
        {enabledCount === 0 && previewQuestions.length === 0 && (
          <div className={`rounded-lg border border-dashed px-4 py-8 text-center ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>No extra fields on</p>
            <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Customers only fill in step 1.</p>
          </div>
        )}
        {fieldConfig.address.enabled && <PhoneField label="Address" isDark={isDark}><div className={fieldBox}><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">123 Main St, New York 12345</span></div></PhoneField>}
        {fieldConfig.preferred_date.enabled && (
          <>
            <PhoneField label="How soon do you need this?" isDark={isDark}>
              <div className="flex flex-wrap gap-1.5">
                {['ASAP', 'Within a week', 'Within a month', 'Just getting prices'].map((l, i) => (
                  <span key={l} className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${i === 0 ? 'border-transparent bg-slate-900 text-white' : chipCls}`}>{l}</span>
                ))}
              </div>
            </PhoneField>
            <PhoneField label="Best time to reach you" isDark={isDark}>
              <div className="flex flex-wrap gap-1.5">
                {['Weekday mornings', 'Weekday afternoons', 'Evenings', 'Weekends'].map((l) => (
                  <span key={l} className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${chipCls}`}>{l}</span>
                ))}
              </div>
            </PhoneField>
          </>
        )}
        {fieldConfig.lead_source.enabled && <PhoneField label="How did you hear about us?" isDark={isDark}><div className={fieldBox}><Megaphone className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">Google, referral, saw your truck…</span></div></PhoneField>}
        {fieldConfig.file_upload.enabled && canUsePhotoUpload && (
          <PhoneField label="Photos" isDark={isDark}>
            <div className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed py-4 ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
              <ImageIcon className="h-4 w-4 text-slate-400" />
              <p className="text-[11px] font-semibold">Tap to upload photos</p>
            </div>
          </PhoneField>
        )}
        {previewQuestions.map((q: any) => (
          <PhoneField key={q.id} label={q.label} isDark={isDark}>
            {q.type === 'text' && <div className={`${fieldBox} text-slate-400`}>Their answer…</div>}
            {q.type === 'select' && (
              <div className={`${fieldBox} justify-between`}>
                <span className="truncate text-slate-400">Select an option…</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </div>
            )}
            {q.type === 'checkbox' && (
              <div className="flex gap-4 py-1">
                {['Yes', 'No'].map((v) => (
                  <span key={v} className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className={`h-3.5 w-3.5 rounded-full border ${isDark ? 'border-slate-600' : 'border-slate-300 bg-white'}`} /> {v}
                  </span>
                ))}
              </div>
            )}
          </PhoneField>
        ))}
        <div className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>Submit</div>
      </div>
    </PhoneFrame>
  );

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-28 pt-4 sm:px-6">
        {/* Header */}
        <div>
          <h1 className={`text-xl font-semibold tracking-tight sm:text-2xl ${c.text}`}>Booking form</h1>
          <p className={`mt-0.5 text-sm ${c.sub}`}>Where customers request a job. Share the link, test it, and pick what it asks.</p>
        </div>

        {company.plan_tier === 'free' && (
          <SettingsUpgradeBanner
            planLabel={REQUIRED_PLAN.label}
            price={REQUIRED_PLAN.price}
            message="Your booking form is live. Upgrade to add photo uploads, service questions, and more fields."
            companySlug={company.slug}
          />
        )}

        <AnimatePresence>
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
                status.type === 'success' ? `${c.card} ${c.text}` : 'border-rose-500/30 bg-rose-500/5 font-medium text-rose-500'
              }`}
            >
              {status.type === 'success' ? <Check className="h-4 w-4 shrink-0 text-emerald-500" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link + Test */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={`flex flex-col rounded-2xl border p-4 sm:p-5 ${c.card}`}>
            <div className="flex items-center gap-2.5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.icon}`}><Link2 className="h-4 w-4" /></span>
              <div>
                <p className={`text-base font-semibold ${c.text}`}>Your booking link</p>
                <p className={`text-[13px] ${c.faint}`}>Put it on your website, Google profile and socials.</p>
              </div>
            </div>
            <code className={`mt-3 block truncate rounded-lg border px-3 py-2 font-mono text-xs ${c.code}`} title={publicUrl}>
              {publicUrl}
            </code>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={copyLink}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition ${c.btn}`}
              >
                {linkCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Link2 className="h-4 w-4" />}
                {linkCopied ? 'Copied' : 'Copy link'}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${c.btn}`}
              >
                Open <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            {copyFailed && <p className="mt-2 text-xs font-medium text-rose-500">Couldn't copy. Press and hold the link to copy it.</p>}
            <p className={`mt-2 text-[13px] ${c.faint}`}>Sending a request from the live link creates a real lead. Delete it after if it was a test.</p>
          </div>

          <div className={`flex flex-col rounded-2xl border p-4 sm:p-5 ${c.card}`}>
            <div className="flex items-center gap-2.5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.icon}`}><Play className="h-4 w-4" /></span>
              <div>
                <p className={`text-base font-semibold ${c.text}`}>Test it as a customer</p>
                <p className={`text-[13px] ${c.faint}`}>Nothing is saved and no lead is created.</p>
              </div>
            </div>
            <p className={`mt-3 flex-1 text-sm ${c.sub}`}>
              Fill out both steps, including the questions for each service, and email yourself what you&apos;d receive.
            </p>
            <button
              type="button"
              onClick={() => setIsTestModeOpen(true)}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${c.primary}`}
            >
              <Play className="h-4 w-4" /> Start test
            </button>
          </div>
        </div>

        {/* Fields */}
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className={`text-lg font-semibold ${c.text}`}>What the form asks</h2>
              <p className={`mt-0.5 text-sm ${c.sub}`}>Step 1 is always asked. Turn step 2 fields on or off.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${c.btn}`}
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
          </div>

          <div className={`overflow-hidden rounded-2xl border ${c.card}`}>
            {/* Step 1 */}
            <div className={`border-b px-4 py-4 sm:px-5 ${c.border}`}>
              <p className={`text-sm font-semibold ${c.text}`}>Step 1 · always asked</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {alwaysAsked.map((f) => (
                  <span key={f} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[13px] font-medium ${c.chip}`}>
                    <Lock className="h-3 w-3 opacity-60" /> {f}
                  </span>
                ))}
              </div>
              <p className={`mt-2.5 text-[13px] ${c.faint}`}>
                The request lands on your dashboard as a new lead as soon as they finish step 1. Step 2 adds to that same lead.
              </p>
            </div>

            {/* Step 2 */}
            <div className={`px-4 pt-4 sm:px-5 ${c.sub}`}>
              <p className={`text-sm font-semibold ${c.text}`}>Step 2 · optional fields</p>
            </div>
            <div className={`divide-y ${c.divide}`}>
              <FieldRow icon={MapPin} label="Address" hint="Where the job is" enabled={fieldConfig.address.enabled} onToggle={() => toggleField('address')} planLocked={!canCustomizeForm} companySlug={company.slug} c={c} isDark={isDark} />
              <FieldRow icon={Calendar} label="Timing" hint="How soon they need it and the best times to reach them" enabled={fieldConfig.preferred_date.enabled} onToggle={togglePreferredDateTime} planLocked={!canCustomizeForm} companySlug={company.slug} c={c} isDark={isDark} />
              <FieldRow icon={Megaphone} label="How they found you" hint="Google, referral, saw your truck…" enabled={fieldConfig.lead_source.enabled} onToggle={() => toggleField('lead_source')} planLocked={!canCustomizeForm} companySlug={company.slug} c={c} isDark={isDark} />
              <FieldRow icon={ImageIcon} label="Photos" hint="Customers attach photos of the job" enabled={fieldConfig.file_upload.enabled} onToggle={() => toggleField('file_upload')} planLocked={!canUsePhotoUpload} companySlug={company.slug} c={c} isDark={isDark} />
            </div>

            {/* Service questions pointer */}
            <div className={`flex items-start gap-3 border-t px-4 py-4 sm:px-5 ${c.border}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.icon}`}><Tag className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className={`text-[15px] font-semibold ${c.text}`}>Service questions</p>
                <p className={`text-[13px] leading-snug ${c.faint}`}>
                  {canUseCustomQuestions
                    ? `${(customQuestions || []).length} set up. Add or edit them on each service under Services. Customers only see the ones for the service they pick.`
                    : `Ask extra questions per service on the ${REQUIRED_PLAN.label} plan.`}
                </p>
              </div>
              {!canUseCustomQuestions && (
                <a
                  href={`/${company.slug}/home?section=billing`}
                  className={`ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${c.lockPill}`}
                >
                  Upgrade <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Unsaved changes */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className={`sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl rounded-2xl border p-3 pl-4 shadow-xl backdrop-blur-md ${c.sticky}`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className={`flex items-center gap-2 text-sm font-medium ${c.text}`}>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  Unsaved form changes
                </p>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${c.primary}`}
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview drawer: full screen on phones, side panel on desktop */}
      <AnimatePresence>
        {isPreviewOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              role="dialog"
              aria-modal="true"
              aria-label="Booking form preview"
              className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-2xl ${c.drawer}`}
            >
              <div className={`flex items-center justify-between border-b px-5 py-4 ${c.border}`}>
                <div className="flex items-center gap-2">
                  <FileText className={`h-4 w-4 ${c.sub}`} />
                  <span className={`text-sm font-semibold ${c.text}`}>What customers see</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${c.btn} border-transparent`}
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className={`flex-1 overflow-y-auto px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] ${c.drawerBody}`}>
                <div className="mx-auto flex max-w-xs flex-col gap-8">
                  <div>
                    <p className={`mb-3 text-center text-xs font-semibold ${c.sub}`}>Step 1</p>
                    {RequiredPhone}
                  </div>
                  <div>
                    <p className={`mb-1 text-center text-xs font-semibold ${c.sub}`}>Step 2</p>
                    {firstService && previewQuestions.length > 0 && (
                      <p className={`mb-3 text-center text-[13px] ${c.faint}`}>Showing questions for {firstService.label}</p>
                    )}
                    {!(firstService && previewQuestions.length > 0) && <div className="mb-3" />}
                    {OptionalPhone}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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