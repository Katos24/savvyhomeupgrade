'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Check,
  Edit2,
  X,
  ChevronDown,
  Eye,
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  HelpCircle,
  Image as ImageIcon,
  Megaphone,
  Lock,
  Link2,
  Truck,
  Trash2,
  Tag,
  ArrowUpRight,
  Sparkles,
  Zap,
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

/* ═══════════════ Brand Marks ═══════════════ */

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

/* ═══════════════ Share Spots ═══════════════ */

type ShareSpot = {
  id: string;
  icon: React.ElementType;
  useCompanyLogo?: boolean;
  title: string;
  line: string;
};

const SHARE_SPOTS: ShareSpot[] = [
  { id: 'google', icon: GoogleLogo, title: 'Google Business Profile', line: 'Paste in your "Booking" or "Quote" URL field.' },
  { id: 'website', icon: Link2, useCompanyLogo: true, title: 'Your Website', line: 'Point your "Get a Quote" button directly to it.' },
  { id: 'facebook', icon: FacebookLogo, title: 'Facebook Page', line: 'Pin to your Page or drop in job post comments.' },
  { id: 'instagram', icon: InstagramLogo, title: 'Instagram Bio', line: 'Put in your bio link, then write "link in bio".' },
  { id: 'vehicle', icon: Truck, title: 'Truck & Cards', line: 'Print your QR code — let clients scan on site.' },
  { id: 'flyers', icon: ImageIcon, title: 'Flyers & Signs', line: 'Include QR codes on yard signs you leave behind.' },
];

/* ═══════════════ Helpers & Switches ═══════════════ */

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

function UpgradeNotice({ companySlug, feature }: { companySlug: string; feature: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-xs font-semibold leading-relaxed text-amber-900">
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
        enabled ? 'bg-slate-900' : 'bg-slate-200'
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
      {logoUrl && <img src={logoUrl} alt="Logo" className="mb-3 h-7 w-auto object-contain" />}
      <h3 className="text-sm font-bold tracking-tight text-white">{heading}</h3>
    </div>
  );
}

const fieldBox =
  'flex min-h-[40px] w-full items-center gap-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700';

function PhoneField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

/* ═══════════════ Control Row Components ═══════════════ */

function LockedControlRow({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800">{label}</p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{hint}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        <Lock className="h-3 w-3" /> Required
      </span>
    </div>
  );
}

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
    <div className={`flex items-center gap-3 px-5 py-4 ${planLocked ? 'bg-amber-50/40' : ''}`}>
      <Icon className={`h-4 w-4 shrink-0 ${enabled && !planLocked ? 'text-slate-700' : 'text-slate-400'}`} />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-bold ${enabled && !planLocked ? 'text-slate-900' : 'text-slate-500'}`}>
          {label}
        </p>
        {hint && <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{hint}</p>}
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

export default function FormTab({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'basic') as PlanTier;
  const canUsePhotoUpload = can(planTier, 'customer_video_upload');
  const canUseCustomQuestions = can(planTier, 'custom_form_questions');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const brandColor1 = company.email_brand_color_1 || '#0B3C6D';
  const brandColor2 = company.email_brand_color_2 || '#1F5F8F';

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

  // Preferred Date and Preferred Time aren't really two independent optional
  // fields — a time slot picker only makes sense once a date is selected, so
  // they're presented (and toggled) as one combined field now. Both keys are
  // kept in the underlying config and save payload in lockstep, since other
  // code (the public booking form, the settings API) may already read them
  // as separate fields and I haven't seen those files to know for sure.
  const togglePreferredDateTime = () =>
    setFieldConfig((prev) => {
      const next = !prev.preferred_date.enabled;
      return { ...prev, preferred_date: { enabled: next }, preferred_time: { enabled: next } };
    });

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

  /* ── Phone Previews ── */
  const RequiredPhone = (
    <PhoneFrame>
      <PhoneHeader logoUrl={company.logo_url} heading={getCtaHeading()} brandColor1={brandColor1} brandColor2={brandColor2} />
      <div className="space-y-3.5 p-4">
        <PhoneField label="Full Name">
          <div className={fieldBox}><User className="h-3.5 w-3.5 shrink-0 text-slate-400" />John Smith</div>
        </PhoneField>
        <PhoneField label="Email Address">
          <div className={fieldBox}><Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">john@example.com</span></div>
        </PhoneField>
        <PhoneField label="Phone Number">
          <div className={fieldBox}><Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />(555) 123-4567</div>
        </PhoneField>
        <PhoneField label="Service Needed">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat, i) => (
              <span
                key={i}
                className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                  i === 0 ? 'border-transparent text-white' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
                style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
              >
                {cat.label}
              </span>
            ))}
          </div>
        </PhoneField>
        <PhoneField label="Project Description">
          <div className="h-16 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-400">
            Describe your project here...
          </div>
        </PhoneField>
        <div
          className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
          style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
        >
          Submit Request
        </div>
      </div>
    </PhoneFrame>
  );

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
      <div className="space-y-3.5 p-4">
        {enabledCount === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
            <p className="text-xs font-bold text-slate-700">No extra fields active</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Clients will only see your standard required fields.
            </p>
          </div>
        )}

        {fieldConfig.address.enabled && (
          <PhoneField label="Address">
            <div className={fieldBox}><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">123 Main St, New York 12345</span></div>
          </PhoneField>
        )}
        {fieldConfig.preferred_date.enabled && (
          <PhoneField label="Preferred Date">
            <div className={fieldBox}><Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />MM / DD / YYYY</div>
          </PhoneField>
        )}
        {fieldConfig.preferred_time.enabled && (
          <PhoneField label="Preferred Time">
            <div className={fieldBox}><Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />Morning</div>
          </PhoneField>
        )}
        {fieldConfig.lead_source.enabled && (
          <PhoneField label="How did you hear about us?">
            <div className={fieldBox}><Megaphone className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">Google, referral, saw your truck...</span></div>
          </PhoneField>
        )}
        {fieldConfig.file_upload.enabled && (
          <PhoneField label="Site Photos">
            <div className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-4">
              <ImageIcon className="h-4 w-4 text-slate-400" />
              <p className="text-[11px] font-bold text-slate-600">Tap to upload photos</p>
            </div>
          </PhoneField>
        )}

        {canUseCustomQuestions &&
          customQuestions.map((q) => (
            <PhoneField key={q.id} label={q.label}>
              {q.type === 'text' && <div className={`${fieldBox} text-slate-400`}>Client answer...</div>}
              {q.type === 'select' && (
                <div className={`${fieldBox} justify-between`}>
                  <span className="truncate">{q.options?.[0] || 'Select an option...'}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </div>
              )}
              {q.type === 'checkbox' && (
                <div className="flex gap-4 py-1">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" /> Yes
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" /> No
                  </span>
                </div>
              )}
            </PhoneField>
          ))}

        <div
          className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
          style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
        >
          Submit Request
        </div>
      </div>
    </PhoneFrame>
  );

  return (
    <>
    <div className="w-full font-sans text-slate-900 antialiased space-y-6 pb-16">

        {company.plan_tier === 'free' && (
          <SettingsUpgradeBanner
            planLabel={REQUIRED_PLAN.label}
            price={REQUIRED_PLAN.price}
            message="Your booking form is live. Upgrade to add custom branding, photo uploads, and custom questions."
            companySlug={company.slug}
          />
        )}

        {/* Page Title — no header buttons. Preview now lives with the
            fields it previews (below), and Save only appears, via the
            floating bar, when there's actually something to save. Two
            persistent buttons plus a third floating one was the
            confusing part. */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Booking Form Editor</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Customize the interactive request intake form your clients see on mobile and web.
            </p>
          </div>
        </div>

        {/* Public Live Link Bar with "Try it Yourself" Callout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Live URL:</span>
            <code className="truncate font-mono text-xs font-bold text-slate-800">{publicUrl}</code>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 mr-1">
              ✨ <span className="text-slate-800">Try it out yourself!</span> Own your business growth.
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 1800);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {linkCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : null}
              {linkCopied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Test Form Live <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Instant Lead Capture Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-xs font-medium text-blue-950 shadow-xs">
          <Zap className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-blue-900">How Lead Capture Works</p>
            <p className="text-blue-800/90 leading-relaxed">
              When a customer completes the <span className="font-bold">Required Intake Fields</span> (Step 1) and taps submit, their request <span className="font-bold underline decoration-blue-300">lands on your dashboard immediately as a new lead</span>! If they proceed to complete any optional fields, site photos, or custom questions, those details will automatically update on their existing lead ticket.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex items-center gap-2 rounded-lg border p-4 text-xs font-semibold ${
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

        {/* Form Configuration Settings */}
        <div className="space-y-6 pt-2">

          {/* ONE table for every field, required or optional — required
              rows show a plain "Required" label instead of a toggle;
              optional rows carry the toggle switch. The distinction is
              carried by each row's own control, not by two separate
              heavy card sections. */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Form Fields</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Required fields (Step 1) are always included and sent instantly. Optional fields
                  (Step 2) are yours to toggle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5 text-slate-500" /> Preview
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              <LockedControlRow icon={User} label="Full Name" hint="Client's legal or full contact name" />
              <LockedControlRow icon={Mail} label="Email Address" hint="For quote delivery and booking updates" />
              <LockedControlRow icon={Phone} label="Phone Number" hint="For SMS updates and direct call-backs" />
              <LockedControlRow icon={Sparkles} label="Service Category" hint="Required service item or package choices" />
              <LockedControlRow icon={Edit2} label="Project Description" hint="Freeform scope or job details box" />

              <ControlRow
                icon={MapPin}
                label="Street Address"
                hint="Gather specific job site locations"
                enabled={fieldConfig.address.enabled}
                onToggle={() => toggleField('address')}
              />
              <ControlRow
                icon={Calendar}
                label="Preferred Date"
                hint="Let clients select target start dates"
                enabled={fieldConfig.preferred_date.enabled}
                onToggle={() => toggleField('preferred_date')}
              />
              <ControlRow
                icon={Clock}
                label="Preferred Time"
                hint="Allow morning/afternoon timeframe picks"
                enabled={fieldConfig.preferred_time.enabled}
                onToggle={() => toggleField('preferred_time')}
              />
              <ControlRow
                icon={Megaphone}
                label="Lead Referral Source"
                hint="Ask 'How did you hear about us?'"
                enabled={fieldConfig.lead_source.enabled}
                onToggle={() => toggleField('lead_source')}
              />
              <ControlRow
                icon={ImageIcon}
                label="Site Photos & Attachments"
                hint={canUsePhotoUpload ? 'Clients attach job site photos' : `${REQUIRED_PLAN.label} tier required`}
                enabled={fieldConfig.file_upload.enabled}
                onToggle={() => toggleField('file_upload')}
                planLocked={!canUsePhotoUpload}
                companySlug={company.slug}
              />
            </div>

            {!canUsePhotoUpload && (
              <div className="border-t border-slate-100 p-4">
                <UpgradeNotice companySlug={company.slug} feature="Photo Uploads" />
              </div>
            )}
          </div>

          {/* Pricing Notice */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Tag className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900">Managing Offered Services?</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Service item selections on this form are managed under{' '}
                <span className="font-semibold text-slate-800">Categories & Pricing</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Links & Distribution Locations */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 lg:p-8 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Where to Publish Your Link
          </h2>
          <p className="text-xs font-medium text-slate-500 mb-4">
            Maximize booking conversion by distributing your link across all customer touchpoints.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SHARE_SPOTS.map((spot) => (
              <div
                key={spot.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-xs"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {spot.useCompanyLogo && company.logo_url ? (
                    <img src={company.logo_url} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <spot.icon className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{spot.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">{spot.line}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Save Toolbar */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="sticky bottom-4 z-40 mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
                  You have unsaved changes.
                </p>
                <button
                  onClick={handleSaveAll}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {loading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>

      {/* Slide-out Mobile & Desktop Live Preview Drawer */}
      <AnimatePresence>
        {isPreviewOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Slide Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">Live Mobile Preview</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body — both steps shown together as a scrollable
                  list instead of a tab switcher. Seeing both phones at
                  once is clearer than flipping between them. */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
                <div className="mx-auto flex max-w-xs flex-col gap-8">
                  <div>
                    <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Step 1 — Required Fields
                    </p>
                    {RequiredPhone}
                  </div>
                  <div>
                    <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Step 2 — Optional Fields You've Enabled
                    </p>
                    {OptionalPhone}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}