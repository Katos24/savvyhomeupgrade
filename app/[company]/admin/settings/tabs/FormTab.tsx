'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Check, Edit2, X, ChevronDown, Eye, Plus,
  User, Mail, Phone, MapPin, Calendar, Clock, HelpCircle,
  Image as ImageIcon, Megaphone, Lock, Link2, Truck, Trash2,
  Tag, ArrowUpRight, FileText,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';

type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

type Category = { emoji?: string; label: string; value: string };
type FieldConfigItem = { enabled: boolean; required?: boolean };

type FieldConfig = {
  address: FieldConfigItem & { required: boolean };
  preferred_date: FieldConfigItem;
  preferred_time: FieldConfigItem;
  lead_source: FieldConfigItem;
  file_upload: FieldConfigItem;
};

const DEFAULT_FIELD_CONFIG: FieldConfig = {
  address: { enabled: true, required: false },
  preferred_date: { enabled: true },
  preferred_time: { enabled: true },
  lead_source: { enabled: true },
  file_upload: { enabled: false },
};

const REQUIRED_PLAN = { label: 'Basic', price: '$49.99/mo' };

/* ═══════════════ Brand marks ═══════════════ */

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M15.5 12.5h-2v7h-3v-7H9v-2.6h1.5V8.4c0-1.5.9-2.9 3.2-2.9h2v2.5h-1.5c-.3 0-.7.2-.7.8v1.6H16l-.5 2.6z" />
    </svg>
  );
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ig-card-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="30%" stopColor="#FA7E1E" />
          <stop offset="60%" stopColor="#D62976" />
          <stop offset="85%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-card-gradient)" />
      <rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="#fff" />
    </svg>
  );
}

/* ═══════════════ Share spots ═══════════════ */

type ShareSpot = {
  id: string;
  icon: React.ElementType;
  useCompanyLogo?: boolean;
  title: string;
  line: string;
};

const SHARE_SPOTS: ShareSpot[] = [
  { id: 'google', icon: GoogleLogo, title: 'Google Business Profile', line: 'Paste it in the "Booking" or "Quote" link field.' },
  { id: 'website', icon: Link2, useCompanyLogo: true, title: 'Your website', line: 'Point your "Get a Quote" button at it.' },
  { id: 'facebook', icon: FacebookLogo, title: 'Facebook', line: 'Pin it to your Page and drop it in job posts.' },
  { id: 'instagram', icon: InstagramLogo, title: 'Instagram', line: 'Put it in your bio, then say "link in bio".' },
  { id: 'vehicle', icon: Truck, title: 'Truck & business cards', line: 'Print the QR code — they scan it on the spot.' },
  { id: 'flyers', icon: ImageIcon, title: 'Flyers & yard signs', line: 'QR code on every sign you leave behind.' },
];

/* ═══════════════ Upgrade ═══════════════ */

function UpgradePill({ companySlug }: { companySlug: string }) {
  return (
    <a
      href={`/${companySlug}/admin/settings`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-2 text-white transition hover:bg-amber-700"
    >
      <Lock className="h-3 w-3" />
      <span className="text-[11px] font-bold uppercase tracking-wide">{REQUIRED_PLAN.label}</span>
    </a>
  );
}

function UpgradeNotice({ companySlug, feature }: { companySlug: string; feature: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-sm font-semibold leading-relaxed text-amber-900">
          {feature} is on the <span className="font-bold">{REQUIRED_PLAN.label} plan ({REQUIRED_PLAN.price})</span>.
        </p>
      </div>
      <a
        href={`/${companySlug}/admin/settings`}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700"
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
      className={`relative h-7 w-12 shrink-0 rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 ${
        enabled ? 'bg-emerald-600' : 'bg-stone-300'
      }`}
    >
      <span
        className="absolute left-[3px] top-[3px] block h-[22px] w-[22px] rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

/* ═══════════════ Phone shell ═══════════════
   Fixed size at every breakpoint so the two previews always match. Content
   scrolls inside rather than stretching the frame.                        */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative h-[560px] rounded-[2.25rem] border-[8px] border-stone-800 bg-stone-800 shadow-xl">
        <div className="absolute left-1/2 top-1.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-stone-800" />
        <div className="h-full overflow-y-auto rounded-[1.6rem] bg-white">{children}</div>
      </div>
    </div>
  );
}

function PhoneHeader({
  logoUrl,
  heading,
  brandColor1,
  brandColor2,
}: {
  logoUrl?: string | null;
  heading: string;
  brandColor1: string;
  brandColor2: string;
}) {
  return (
    <div
      className="px-5 pb-5 pt-8 text-white"
      style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
    >
      {logoUrl && <img src={logoUrl} alt="" className="mb-3 h-7 w-auto object-contain" />}
      <h3 className="text-base font-bold tracking-tight text-white">{heading}</h3>
    </div>
  );
}

const fieldBox =
  'flex min-h-[42px] w-full items-center gap-2.5 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 px-3 text-[13px] font-semibold text-stone-700';

function PhoneField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[12px] font-bold text-stone-600">{label}</p>
      {children}
    </div>
  );
}

/* ═══════════════ Editable control row ═══════════════ */

function ControlRow({
  icon: Icon,
  label,
  hint,
  enabled,
  onToggle,
  planLocked,
  companySlug,
}: {
  icon: React.ElementType;
  label: string;
  hint?: string;
  enabled: boolean;
  onToggle: () => void;
  planLocked?: boolean;
  companySlug?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
        planLocked
          ? 'border-amber-200 bg-amber-50/50'
          : enabled
          ? 'border-stone-200 bg-white'
          : 'border-stone-200 bg-stone-50'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${enabled && !planLocked ? 'text-stone-600' : 'text-stone-400'}`} />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-bold ${enabled && !planLocked ? 'text-stone-900' : 'text-stone-500'}`}>
          {label}
        </p>
        {hint && <p className="mt-0.5 truncate text-[12px] font-medium text-stone-500">{hint}</p>}
      </div>

      {planLocked && companySlug ? (
        <UpgradePill companySlug={companySlug} />
      ) : (
        <ToggleSwitch enabled={enabled} onToggle={onToggle} ariaLabel={`Show ${label} on your form`} />
      )}
    </div>
  );
}

/* ═══════════════ Main ═══════════════ */

export default function FormTab({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'basic') as PlanTier;
  const canUsePhotoUpload = can(planTier, 'customer_video_upload');
  const canUseCustomQuestions = can(planTier, 'custom_form_questions');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);

  // Mobile only — desktop shows both phones side by side.
  const [mobileTab, setMobileTab] = useState<'optional' | 'required'>('optional');

  const existingConfig = company.form_field_config;
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>(() => {
    const base = existingConfig
      ? {
          address: {
            enabled: existingConfig.address?.enabled ?? DEFAULT_FIELD_CONFIG.address.enabled,
            required: existingConfig.address?.required ?? DEFAULT_FIELD_CONFIG.address.required,
          },
          preferred_date: { enabled: existingConfig.preferred_date?.enabled ?? DEFAULT_FIELD_CONFIG.preferred_date.enabled },
          preferred_time: { enabled: existingConfig.preferred_time?.enabled ?? DEFAULT_FIELD_CONFIG.preferred_time.enabled },
          lead_source: { enabled: existingConfig.lead_source?.enabled ?? DEFAULT_FIELD_CONFIG.lead_source.enabled },
          file_upload: { enabled: existingConfig.file_upload?.enabled ?? DEFAULT_FIELD_CONFIG.file_upload.enabled },
        }
      : {
          address: {
            enabled: company.address_enabled ?? DEFAULT_FIELD_CONFIG.address.enabled,
            required: company.address_required ?? DEFAULT_FIELD_CONFIG.address.required,
          },
          preferred_date: { enabled: DEFAULT_FIELD_CONFIG.preferred_date.enabled },
          preferred_time: { enabled: DEFAULT_FIELD_CONFIG.preferred_time.enabled },
          lead_source: { enabled: DEFAULT_FIELD_CONFIG.lead_source.enabled },
          file_upload: { enabled: DEFAULT_FIELD_CONFIG.file_upload.enabled },
        };
    if (!canUsePhotoUpload) base.file_upload = { enabled: false };
    return base;
  });

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({ id: '', label: '', type: 'text', required: false, options: [] });
  const [newOption, setNewOption] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [publicUrl, setPublicUrl] = useState(`https://lead2project.com/${company.slug}`);

  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify({ fieldConfig, customQuestions }));
  const isDirty = JSON.stringify({ fieldConfig, customQuestions }) !== savedSnapshot;

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/${company.slug}`);
  }, [company.slug]);

  const categories: Category[] = company.form_categories?.length > 0
    ? company.form_categories
    : [{ label: 'General', value: 'general' }];

  const brandColor1 = company.email_brand_color_1 || '#6366f1';
  const brandColor2 = company.email_brand_color_2 || '#4f46e5';

  const getCtaHeading = () => {
    if (company.cta_heading) return company.cta_heading;
    switch (company.business_type) {
      case 'restaurant': return 'Order Your Custom Meal';
      case 'salon': return 'Book Your Appointment';
      case 'photography': return 'Request a Photo Session';
      default: return 'Submit Your Request';
    }
  };

  const toggleField = (field: keyof FieldConfig) =>
    setFieldConfig((prev) => ({ ...prev, [field]: { ...prev[field], enabled: !prev[field].enabled } }));

  const handleSaveAll = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });

    const payload = {
      action: 'update-form',
      data: {
        cta: { cta_success_message: ctaSuccessMessage },
        questions: canUseCustomQuestions ? customQuestions : [],
        field_config: {
          ...fieldConfig,
          file_upload: { enabled: canUsePhotoUpload ? fieldConfig.file_upload.enabled : false },
        },
      },
    };

    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to update settings');
      setStatus({ type: 'success', message: 'Form settings saved!' });
      setSavedSnapshot(JSON.stringify({ fieldConfig, customQuestions }));
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong — please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateQuestion = () => {
    if (!newQuestion.label.trim()) return setStatus({ type: 'error', message: 'Label is required' });
    if (editingQuestionId) {
      setCustomQuestions(customQuestions.map((q) => (q.id === editingQuestionId ? { ...newQuestion, required: false } : q)));
    } else {
      setCustomQuestions([...customQuestions, { ...newQuestion, id: `q_${Date.now()}`, required: false }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setNewQuestion({ id: '', label: '', type: 'text', required: false, options: [] });
    setNewOption('');
    setShowAddQuestion(false);
    setEditingQuestionId(null);
  };

  /* ── Phone 1: the locked half ── */
  const RequiredPhone = (
    <PhoneFrame>
      <PhoneHeader logoUrl={company.logo_url} heading={getCtaHeading()} brandColor1={brandColor1} brandColor2={brandColor2} />
      <div className="space-y-4 p-4">
        <PhoneField label="Full name">
          <div className={fieldBox}><User className="h-3.5 w-3.5 shrink-0 text-stone-400" />John Smith</div>
        </PhoneField>
        <PhoneField label="Email address">
          <div className={fieldBox}><Mail className="h-3.5 w-3.5 shrink-0 text-stone-400" /><span className="truncate">john@example.com</span></div>
        </PhoneField>
        <PhoneField label="Phone number">
          <div className={fieldBox}><Phone className="h-3.5 w-3.5 shrink-0 text-stone-400" />(555) 123-4567</div>
        </PhoneField>
        <PhoneField label="Service needed">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat, i) => (
              <span
                key={i}
                className={`rounded-md border px-2.5 py-1 text-[12px] font-bold ${
                  i === 0 ? 'border-transparent text-white' : 'border-stone-200 bg-stone-50 text-stone-600'
                }`}
                style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
              >
                {cat.label}
              </span>
            ))}
          </div>
        </PhoneField>
        <PhoneField label="Project description">
          <div className="h-20 w-full rounded-lg border border-stone-200 bg-stone-50 p-3 text-[13px] font-semibold text-stone-400">
            Describe your project here...
          </div>
        </PhoneField>
      </div>
    </PhoneFrame>
  );

  /* ── Phone 2: whatever they've switched on ── */
  const enabledCount =
    Number(fieldConfig.address.enabled) +
    Number(fieldConfig.preferred_date.enabled) +
    Number(fieldConfig.preferred_time.enabled) +
    Number(fieldConfig.lead_source.enabled) +
    Number(fieldConfig.file_upload.enabled) +
    (canUseCustomQuestions ? customQuestions.length : 0);

  const OptionalPhone = (
    <PhoneFrame>
      <PhoneHeader logoUrl={company.logo_url} heading={getCtaHeading()} brandColor1={brandColor1} brandColor2={brandColor2} />
      <div className="space-y-4 p-4">
        {enabledCount === 0 && (
          <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center">
            <p className="text-[13px] font-bold text-stone-600">Nothing switched on</p>
            <p className="mt-1 text-[12px] font-medium text-stone-500">
              Customers will only see the five required fields.
            </p>
          </div>
        )}

        {fieldConfig.address.enabled && (
          <PhoneField label="Address">
            <div className={fieldBox}><MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" /><span className="truncate">123 Main St, New York 12345</span></div>
          </PhoneField>
        )}
        {fieldConfig.preferred_date.enabled && (
          <PhoneField label="Preferred date">
            <div className={fieldBox}><Calendar className="h-3.5 w-3.5 shrink-0 text-stone-400" />MM / DD / YYYY</div>
          </PhoneField>
        )}
        {fieldConfig.preferred_time.enabled && (
          <PhoneField label="Preferred time">
            <div className={fieldBox}><Clock className="h-3.5 w-3.5 shrink-0 text-stone-400" />Morning</div>
          </PhoneField>
        )}
        {fieldConfig.lead_source.enabled && (
          <PhoneField label="How did you hear about us?">
            <div className={fieldBox}><Megaphone className="h-3.5 w-3.5 shrink-0 text-stone-400" /><span className="truncate">Google, referral, saw your truck...</span></div>
          </PhoneField>
        )}
        {fieldConfig.file_upload.enabled && (
          <PhoneField label="Site photos">
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 py-5">
              <ImageIcon className="h-5 w-5 text-stone-400" />
              <p className="text-[12px] font-bold text-stone-600">Drag or click to upload</p>
            </div>
          </PhoneField>
        )}

        {canUseCustomQuestions &&
          customQuestions.map((q) => (
            <PhoneField key={q.id} label={q.label}>
              {q.type === 'text' && <div className={`${fieldBox} text-stone-400`}>Their answer...</div>}
              {q.type === 'select' && (
                <div className={`${fieldBox} justify-between`}>
                  <span className="truncate">{q.options?.[0] || 'Select an option...'}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-stone-400" />
                </div>
              )}
              {q.type === 'checkbox' && (
                <div className="flex gap-5 py-1">
                  <span className="flex items-center gap-2 text-[13px] font-bold text-stone-600">
                    <span className="h-4 w-4 rounded border border-stone-300 bg-white" /> Yes
                  </span>
                  <span className="flex items-center gap-2 text-[13px] font-bold text-stone-600">
                    <span className="h-4 w-4 rounded border border-stone-300 bg-white" /> No
                  </span>
                </div>
              )}
            </PhoneField>
          ))}

        <div
          className="flex h-11 w-full items-center justify-center rounded-lg text-[13px] font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
        >
          Submit request
        </div>
      </div>
    </PhoneFrame>
  );

  return (
    <div className="bg-stone-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {company.plan_tier === 'free' && (
          <div className="mb-6">
            <SettingsUpgradeBanner
              planLabel={REQUIRED_PLAN.label}
              price={REQUIRED_PLAN.price}
              message="Your booking form is live. Upgrade to add custom branding, photo uploads, and custom questions."
              companySlug={company.slug}
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">Booking form</h2>
              {isDirty && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" /> Unsaved
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-stone-500">
              This is exactly what your customer sees on their phone.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm transition hover:bg-stone-50 sm:flex-none"
            >
              <Eye className="h-4 w-4 text-stone-600" /> View live
            </a>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60 sm:flex-none"
            >
              {loading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm font-semibold ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
            >
              {status.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════ The link, in their colors, above everything ══════════
            This is the thing they came here to get. It shouldn't be tucked in
            a sidebar next to six other cards. */}
        <div
          className="mb-8 overflow-hidden rounded-2xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
        >
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link2 className="h-5 w-5 shrink-0 text-white" />
              <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                This is your booking form link
              </p>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-white/85">
              Anyone who opens it sees the form below, in your colors. Every submission
              lands straight on your board.
            </p>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-white/25 bg-white/15 px-4 py-3 backdrop-blur-sm">
                <code className="whitespace-nowrap font-mono text-sm font-bold text-white sm:text-base">
                  {publicUrl}
                </code>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 1800);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-900 shadow-sm transition hover:bg-white/90 sm:flex-none"
                >
                  {linkCopied ? (
                    <><Check className="h-4 w-4 text-emerald-600" /> Copied</>
                  ) : (
                    'Copy link'
                  )}
                </button>

                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 sm:flex-none"
                >
                  Open <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ MOBILE: tabbed single phone ══════════ */}
        <div className="lg:hidden">
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-stone-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setMobileTab('optional')}
              className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                mobileTab === 'optional' ? 'bg-stone-900 text-white' : 'text-stone-600'
              }`}
            >
              Extra details
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('required')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                mobileTab === 'required' ? 'bg-stone-900 text-white' : 'text-stone-600'
              }`}
            >
              <Lock className="h-3.5 w-3.5" /> Required
            </button>
          </div>

          {mobileTab === 'required' ? (
            <>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5">
                <Lock className="h-4 w-4 shrink-0 text-stone-500" />
                <p className="text-[13px] font-semibold text-stone-700">
                  These five are locked — you always get them.
                </p>
              </div>
              {RequiredPhone}
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <Eye className="h-4 w-4 shrink-0 text-emerald-700" />
                <p className="text-[13px] font-semibold text-emerald-900">
                  Live preview — toggle fields below to change it.
                </p>
              </div>
              {OptionalPhone}
            </>
          )}
        </div>

        {/* ══════════ DESKTOP: both phones ══════════ */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 text-stone-500" />
              <div>
                <p className="text-sm font-bold text-stone-900">Required — locked</p>
                <p className="text-[13px] font-medium text-stone-600">
                  Every customer fills these in. They can&apos;t be removed.
                </p>
              </div>
            </div>
            {RequiredPhone}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <Eye className="h-4 w-4 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Extra details — your choice</p>
                <p className="text-[13px] font-medium text-emerald-800">
                  Updates as you toggle the fields below.
                </p>
              </div>
            </div>
            {OptionalPhone}
          </div>
        </div>

        {/* ══════════ Controls — full width ══════════ */}
        <div className="mt-8 space-y-6">

          <div>
            <p className="mb-1 text-lg font-bold text-stone-900">Extra details to collect</p>
            <p className="mb-4 text-sm font-medium text-stone-600">
              Optional for the customer — they can leave any of these blank and still submit.
            </p>

            {/* Two columns of toggles on wide screens; the rows are short, so a
                single column wasted most of the width. */}
            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              <ControlRow
                icon={MapPin}
                label="Address"
                enabled={fieldConfig.address.enabled}
                onToggle={() => toggleField('address')}
              />
              <ControlRow
                icon={Calendar}
                label="Preferred date"
                enabled={fieldConfig.preferred_date.enabled}
                onToggle={() => toggleField('preferred_date')}
              />
              <ControlRow
                icon={Clock}
                label="Preferred time"
                enabled={fieldConfig.preferred_time.enabled}
                onToggle={() => toggleField('preferred_time')}
              />
              <ControlRow
                icon={Megaphone}
                label="Lead source"
                hint="How did you hear about us?"
                enabled={fieldConfig.lead_source.enabled}
                onToggle={() => toggleField('lead_source')}
              />
              <ControlRow
                icon={ImageIcon}
                label="Site photos"
                hint={canUsePhotoUpload ? 'Customers attach job photos' : `${REQUIRED_PLAN.label} plan`}
                enabled={fieldConfig.file_upload.enabled}
                onToggle={() => toggleField('file_upload')}
                planLocked={!canUsePhotoUpload}
                companySlug={company.slug}
              />
            </div>

            {!canUsePhotoUpload && (
              <div className="mt-2.5">
                <UpgradeNotice companySlug={company.slug} feature="Photo upload" />
              </div>
            )}
          </div>

          {/* Custom questions */}
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 sm:p-5">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-lg font-bold text-violet-900">
                <HelpCircle className="h-5 w-5" /> Your own questions
              </p>
              {!canUseCustomQuestions && <UpgradePill companySlug={company.slug} />}
            </div>
            <p className="mb-4 text-sm font-medium text-violet-800">
              Anything else you want to know before you quote.
            </p>

            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {canUseCustomQuestions &&
                customQuestions.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 rounded-xl border border-violet-200 bg-white px-4 py-3">
                    <HelpCircle className="h-4 w-4 shrink-0 text-violet-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-violet-900">{q.label}</p>
                      <p className="mt-0.5 text-[12px] font-medium text-stone-500">
                        {q.type === 'text' && 'Text answer'}
                        {q.type === 'checkbox' && 'Yes / No'}
                        {q.type === 'select' && `Dropdown · ${q.options?.length || 0} option${q.options?.length === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setNewQuestion(q);
                        setEditingQuestionId(q.id);
                        setShowAddQuestion(true);
                      }}
                      className="rounded-lg border border-violet-200 bg-white p-2 text-violet-700 shadow-sm transition hover:bg-violet-50"
                      aria-label={`Edit ${q.label}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setCustomQuestions(customQuestions.filter((x) => x.id !== q.id))}
                      className="rounded-lg border border-violet-200 bg-white p-2 text-rose-600 shadow-sm transition hover:bg-rose-50"
                      aria-label={`Delete ${q.label}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

              {canUseCustomQuestions && (
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-violet-300 bg-white px-4 py-3 text-sm font-bold text-violet-800 transition hover:border-violet-400 hover:bg-violet-50"
                >
                  <Plus className="h-4 w-4" /> Add your own question
                </button>
              )}
            </div>

            {!canUseCustomQuestions && (
              <UpgradeNotice companySlug={company.slug} feature="Custom questions" />
            )}
          </div>

          {/* Services live elsewhere — pointer only, no link. */}
          <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
              <Tag className="h-4 w-4 text-stone-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-stone-900">Changing your services?</p>
              <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-stone-600">
                The service options customers pick from are managed under{' '}
                <span className="font-bold text-stone-900">Categories &amp; Pricing</span>.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════ Where to put the link — full width, last ══════════ */}
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-lg font-bold text-stone-900">Capture more jobs</p>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-stone-600">
            Every place your link or QR code sits is another way someone books you
            without picking up the phone. Put it everywhere.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {SHARE_SPOTS.map((spot) => (
              <div
                key={spot.id}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3.5 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white">
                  {spot.useCompanyLogo && company.logo_url ? (
                    <img src={company.logo_url} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <spot.icon className="h-4 w-4 text-stone-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-900">{spot.title}</p>
                  <p className="mt-0.5 text-[13px] font-medium leading-snug text-stone-600">{spot.line}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[13px] font-medium leading-relaxed text-stone-600">
            Your QR code is on the Overview tab — download it and print it on anything.
          </p>
        </div>

        {/* Save bar */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="sticky bottom-0 z-40 -mx-4 mt-6 border-t border-stone-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:-mx-8 sm:px-8"
            >
              <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />
                  You have unsaved changes.
                </p>
                <button
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60 sm:w-auto"
                >
                  {loading && <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showAddQuestion && (
        <QuestionModal
          question={newQuestion}
          newOption={newOption}
          isEditing={!!editingQuestionId}
          onChange={setNewQuestion}
          onOptionChange={setNewOption}
          onSave={addOrUpdateQuestion}
          onCancel={resetForm}
        />
      )}
    </div>
  );
}

/* ═══════════════ Question modal ═══════════════ */

function QuestionModal({
  question, newOption, isEditing, onChange, onOptionChange, onSave, onCancel,
}: {
  question: CustomQuestion;
  newOption: string;
  isEditing: boolean;
  onChange: (q: CustomQuestion) => void;
  onOptionChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md overflow-hidden rounded-t-2xl border border-stone-200 bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-6">
          <span className="text-base font-bold text-stone-900">
            {isEditing ? 'Edit question' : 'Add question'}
          </span>
          <button onClick={onCancel} className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-bold text-stone-900">Question</label>
            <input
              type="text"
              value={question.label}
              onChange={(e) => onChange({ ...question, label: e.target.value })}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-100"
              placeholder='e.g., "How old is your roof?"'
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-stone-900">Answer type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'text', label: 'Text' },
                { val: 'select', label: 'Dropdown' },
                { val: 'checkbox', label: 'Yes/No' },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => onChange({ ...question, type: t.val as any, options: t.val === 'select' ? question.options : [] })}
                  className={`rounded-lg border py-2.5 text-[13px] font-bold transition ${
                    question.type === t.val
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {question.type === 'select' && (
            <div className="space-y-2 border-t border-stone-200 pt-4">
              <label className="mb-2 block text-sm font-bold text-stone-900">Options</label>

              <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
                <AnimatePresence>
                  {question.options?.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5"
                    >
                      <span className="text-[13px] font-semibold text-stone-800">{opt}</span>
                      <button
                        onClick={() => onChange({ ...question, options: question.options?.filter((_, idx) => idx !== i) })}
                        className="text-stone-400 transition hover:text-rose-600"
                        aria-label="Remove option"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => onOptionChange(e.target.value)}
                  className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[13px] font-semibold outline-none transition focus:border-stone-900"
                  placeholder="Add option..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newOption) {
                      e.preventDefault();
                      onChange({ ...question, options: [...(question.options || []), newOption] });
                      onOptionChange('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newOption) {
                      onChange({ ...question, options: [...(question.options || []), newOption] });
                      onOptionChange('');
                    }
                  }}
                  className="rounded-xl bg-stone-900 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-stone-800"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800"
            >
              {isEditing ? 'Update' : 'Add question'}
            </button>
            <button
              onClick={onCancel}
              className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}