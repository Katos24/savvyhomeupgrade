'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Check, Edit2, X,
  ChevronDown, Eye, Plus,
  User, Mail, Phone, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
  Link2, Truck, Trash2, Tag, ArrowUpRight,
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

/** Single source of truth for what unlocks the gated features. */
const REQUIRED_PLAN = { label: 'Basic', price: '$49.99/mo' };

/* ───────────────────────── Brand marks ───────────────────────── */

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

/* ───────────────────────── Share-your-link cards ───────────────────────── */

type InfoCard = {
  id: string;
  icon: React.ElementType;
  title: string;
  teaser: string;
  image: string;
  body: string;
};

const FORM_INFO_CARDS: InfoCard[] = [
  {
    id: 'google',
    icon: GoogleLogo,
    title: 'Google Business Profile',
    teaser: 'Often the first thing customers see',
    image: '/images/form-guide/google.png',
    body: 'Add your booking link under "Booking link" or "Quote link" on your Google Business Profile. When a customer finds you on Google, they can click straight through and fill out your form \u2014 no extra steps, no phone tag.',
  },
  {
    id: 'facebook',
    icon: FacebookLogo,
    title: 'Facebook',
    teaser: 'Add it to your bio or a post',
    image: '/images/form-guide/facebook.png',
    body: 'Pin your booking link to the top of your Facebook Page, or add it to a post whenever you share a job photo. People scrolling their feed can tap through and book right then \u2014 while the job you just finished is still fresh in their mind.',
  },
  {
    id: 'instagram',
    icon: InstagramLogo,
    title: 'Instagram',
    teaser: 'Add it to your bio link',
    image: '/images/form-guide/instagram.png',
    body: 'Put your booking link in your Instagram bio, then point to it ("link in bio") whenever you post before-and-after shots or a job in progress. It turns people who like your work into people who actually reach out.',
  },
  {
    id: 'website',
    icon: Link2,
    title: 'Your website',
    teaser: "Link it from a 'Book Now' button",
    image: '/images/form-guide/website.png',
    body: 'If you have a website, link your booking form from a "Get a Quote" or "Book Now" button. It\u2019s a better handoff than listing a phone number \u2014 the visitor stays on your site and fills out the form instead of having to remember to call later.',
  },
  {
    id: 'flyers',
    icon: ImageIcon,
    title: 'Flyers & signs',
    teaser: 'Print the link or QR code',
    image: '/images/flyers.webp',
    body: 'Print your booking link, or better, the QR code from your Overview tab, on flyers, yard signs, or door hangers. Someone can scan it standing right in front of their house instead of typing a URL by hand.',
  },
  {
    id: 'vehicle',
    icon: Truck,
    title: 'Vehicle & business cards',
    teaser: 'Book on the spot',
    image: '/images/qrbranded2.webp',
    body: 'Put a QR code on your truck magnet or business card. A neighbor who sees your truck parked down the street, or someone you hand a card to on the spot, can book in the time it takes to scan it.',
  },
];

function ImageOrPlaceholder({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-stone-100 text-stone-400 ${className || ''}`}>
        <ImageIcon className="h-6 w-6" />
        <span className="text-[11px] font-bold uppercase tracking-wide">Add image</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />;
}

function InfoCardBar({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {FORM_INFO_CARDS.map((card) => (
        <button
          key={card.id}
          onClick={() => onSelect(card.id)}
          className="flex min-w-[210px] shrink-0 items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left transition hover:border-stone-400 hover:bg-stone-50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
            <card.icon className="h-4 w-4 text-stone-700" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-stone-900">{card.title}</p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-stone-500">{card.teaser}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function InfoModal({ card, onClose }: { card: InfoCard; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <span className="text-sm font-bold uppercase tracking-wider text-stone-900">{card.title}</span>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <ImageOrPlaceholder src={card.image} alt={card.title} className="block h-44 w-full rounded-xl border border-stone-200 object-cover shadow-sm" />
          <p className="mt-4 text-[13px] font-semibold leading-relaxed text-stone-700">{card.body}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Upgrade affordances ─────────────────────────
   One component, used everywhere something is gated, so the message and the
   destination never drift apart again.                                     */

function UpgradePill({ companySlug, className = '' }: { companySlug: string; className?: string }) {
  return (
    <a
      href={`/${companySlug}/admin/settings`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1.5 text-white transition hover:bg-amber-700 ${className}`}
    >
      <Lock className="h-3 w-3" />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {REQUIRED_PLAN.label} plan
      </span>
    </a>
  );
}

function UpgradeNotice({ companySlug, feature }: { companySlug: string; feature: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-[13px] font-semibold leading-relaxed text-amber-900">
          {feature} is on the{' '}
          <span className="font-bold">
            {REQUIRED_PLAN.label} plan ({REQUIRED_PLAN.price})
          </span>
          .
        </p>
      </div>
      <a
        href={`/${companySlug}/admin/settings`}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
      >
        Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

/* ───────────────────────── Main ───────────────────────── */

export default function FormTab({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'basic') as PlanTier;
  const canUsePhotoUpload = can(planTier, 'customer_video_upload');
  const canUseCustomQuestions = can(planTier, 'custom_form_questions');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

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
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong \u2014 please try again.',
      });
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

  const activeCard = FORM_INFO_CARDS.find((c) => c.id === activeCardId) || null;

  return (
    <div className="bg-stone-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl pb-28">

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

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">Booking form</h2>
              {isDirty && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" /> Unsaved changes
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-stone-500">
              Choose what customers are asked when they book with you.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 shadow-sm transition hover:bg-stone-50 sm:flex-none"
            >
              <Eye className="h-4 w-4 text-stone-600" /> View
            </a>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60 sm:flex-none"
            >
              {loading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* ── Link + sharing ── */}
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Your public form link</p>
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="flex-1 truncate rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5">
              <code className="truncate font-mono text-[13px] font-semibold text-stone-700">{publicUrl}</code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 1800);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-50"
            >
              {linkCopied ? (<><Check className="h-3.5 w-3.5 text-emerald-600" /> Copied</>) : 'Copy link'}
            </button>
          </div>

          <p className="mb-3 mt-6 text-[11px] font-bold uppercase tracking-widest text-stone-700">
            Where to put it
          </p>
          <InfoCardBar onSelect={setActiveCardId} />
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

        {/* ══ Two columns: what's fixed | what you control ══ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* LEFT — always-on fields, read only */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-stone-700">
                  Always on the form
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                  <Lock className="h-3 w-3" /> Can&apos;t be removed
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <FormStep1
                  heading={getCtaHeading()}
                  categories={categories}
                  brandColor1={brandColor1}
                  brandColor2={brandColor2}
                  logoUrl={company.logo_url}
                />
              </div>

              {/* Where services actually get edited */}
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
                  <Tag className="h-4 w-4 text-stone-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-stone-900">Editing your services?</p>
                  <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-stone-500">
                    The service options customers pick from come from your{' '}
                    <a
                      href={`/${company.slug}/categories`}
                      className="font-bold text-stone-900 underline underline-offset-2 hover:text-stone-700"
                    >
                      Categories &amp; Pricing
                    </a>{' '}
                    section — add or rename them there and they update here.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — the controls */}
          <div className="space-y-6 lg:col-span-7">

            {/* Additional details */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 bg-stone-50 px-5 py-4 sm:px-6">
                <p className="text-[13px] font-bold text-stone-900">Additional details</p>
                <p className="mt-0.5 text-[12px] font-medium text-stone-500">
                  Turn these on to collect more up front. Each one shows a preview when it&apos;s on.
                </p>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                <EditableFieldRow
                  icon={MapPin}
                  label="Address"
                  enabled={fieldConfig.address.enabled}
                  onToggle={() => toggleField('address')}
                  mockContent={
                    <div className="max-w-xl space-y-4">
                      <div>
                        <label className={innerLabelClass}>Street address</label>
                        <div className={innerInputClass}>123 Main St</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={innerLabelClass}>City</label>
                          <div className={innerInputClass}>New York</div>
                        </div>
                        <div>
                          <label className={innerLabelClass}>Zip code</label>
                          <div className={innerInputClass}>12345</div>
                        </div>
                      </div>
                    </div>
                  }
                />

                <EditableFieldRow
                  icon={Calendar}
                  label="Preferred date"
                  enabled={fieldConfig.preferred_date.enabled}
                  onToggle={() => toggleField('preferred_date')}
                  mockContent={
                    <div className="max-w-md">
                      <label className={innerLabelClass}>Requested date</label>
                      <div className={innerInputClass}>MM / DD / YYYY</div>
                    </div>
                  }
                />

                <EditableFieldRow
                  icon={Clock}
                  label="Preferred time"
                  enabled={fieldConfig.preferred_time.enabled}
                  onToggle={() => toggleField('preferred_time')}
                  mockContent={
                    <div className="max-w-md">
                      <label className={innerLabelClass}>Best time of day</label>
                      <div className={innerInputClass}>Morning, afternoon...</div>
                    </div>
                  }
                />

                <EditableFieldRow
                  icon={Megaphone}
                  label="Lead source"
                  enabled={fieldConfig.lead_source.enabled}
                  onToggle={() => toggleField('lead_source')}
                  mockContent={
                    <div className="max-w-md">
                      <label className={innerLabelClass}>How did you hear about us?</label>
                      <div className={innerInputClass}>Selection dropdown...</div>
                    </div>
                  }
                />

                <EditableFieldRow
                  icon={ImageIcon}
                  label="Photo upload"
                  enabled={fieldConfig.file_upload.enabled}
                  onToggle={() => toggleField('file_upload')}
                  locked={!canUsePhotoUpload}
                  companySlug={company.slug}
                  mockContent={
                    <div className="flex max-w-xl flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 py-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white shadow-sm">
                        <ImageIcon className="h-5 w-5 text-stone-600" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">Drag or click to upload photos</p>
                      <p className="text-[10px] font-medium text-stone-500">JPG, PNG, or video up to 25MB</p>
                    </div>
                  }
                />

                {!canUsePhotoUpload && (
                  <UpgradeNotice companySlug={company.slug} feature="Photo upload" />
                )}
              </div>
            </div>

            {/* Custom questions */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[13px] font-bold text-stone-900">Custom questions</p>
                  <p className="mt-0.5 text-[12px] font-medium text-stone-500">
                    Anything else you want to know before you quote.
                  </p>
                </div>
                {/* Only shown when it's actually locked. */}
                {!canUseCustomQuestions && <UpgradePill companySlug={company.slug} />}
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {customQuestions.length === 0 && canUseCustomQuestions && (
                  <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
                    <HelpCircle className="mx-auto mb-2 h-5 w-5 text-stone-400" />
                    <p className="text-[13px] font-bold text-stone-700">No custom questions yet</p>
                    <p className="mt-0.5 text-[12px] font-medium text-stone-500">
                      Roof age, gate code, budget range — whatever saves you a phone call.
                    </p>
                  </div>
                )}

                {customQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="group relative rounded-xl border border-stone-200 bg-stone-50 p-5 transition-all hover:border-stone-300 hover:shadow-sm"
                  >
                    <div className="absolute right-4 top-4 flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setNewQuestion(q);
                          setEditingQuestionId(q.id);
                          setShowAddQuestion(true);
                        }}
                        className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-700 shadow-sm hover:bg-stone-50"
                        aria-label="Edit question"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setCustomQuestions(customQuestions.filter((x) => x.id !== q.id))}
                        className="rounded-lg border border-stone-200 bg-white p-1.5 text-rose-600 shadow-sm hover:bg-rose-50"
                        aria-label="Delete question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mb-3 flex items-center gap-2 pr-24">
                      <HelpCircle className="h-4 w-4 shrink-0 text-stone-600" />
                      <p className="truncate text-xs font-bold uppercase tracking-wider text-stone-800">{q.label}</p>
                    </div>

                    {q.type === 'text' && (
                      <div className="flex h-10 w-full max-w-xl items-center rounded-xl border border-stone-200 bg-white px-4 text-xs font-medium text-stone-400">
                        User types response text...
                      </div>
                    )}

                    {q.type === 'select' && (
                      <div className="flex h-10 w-full max-w-xl items-center justify-between rounded-xl border border-stone-200 bg-white px-4 text-xs font-medium text-stone-600">
                        <span className="truncate">
                          {q.options?.length
                            ? `${q.options.length} option${q.options.length === 1 ? '' : 's'}: ${q.options.slice(0, 3).join(', ')}${q.options.length > 3 ? '\u2026' : ''}`
                            : 'Select an option...'}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-stone-400" />
                      </div>
                    )}

                    {q.type === 'checkbox' && (
                      <div className="flex gap-5">
                        <div className="flex items-center gap-2.5 text-xs font-bold text-stone-600">
                          <div className="h-4 w-4 rounded border border-stone-300 bg-white" /> Yes
                        </div>
                        <div className="flex items-center gap-2.5 text-xs font-bold text-stone-600">
                          <div className="h-4 w-4 rounded border border-stone-300 bg-white" /> No
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {canUseCustomQuestions ? (
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-50"
                  >
                    <Plus className="h-4 w-4 text-stone-600" /> Add custom question
                  </button>
                ) : (
                  <UpgradeNotice companySlug={company.slug} feature="Custom questions" />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Sticky save ── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
          >
            <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-stone-800">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />
                You have unsaved changes.
              </p>
              <button
                onClick={handleSaveAll}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60 sm:w-auto"
              >
                {loading && <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeCard && <InfoModal card={activeCard} onClose={() => setActiveCardId(null)} />}

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

const innerLabelClass = 'mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-stone-600';
const innerInputClass = 'flex h-10 w-full items-center rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600';

/* ─────────────────── Toggle ─────────────────── */

function ToggleSwitch({ enabled, onToggle, ariaLabel }: { enabled: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative h-6 w-10 shrink-0 rounded-full outline-none transition-all duration-200 ${
        enabled ? 'bg-emerald-600' : 'bg-stone-300'
      }`}
    >
      <div
        className="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}

/* ─────────────────── Field row ─────────────────── */

function EditableFieldRow({
  icon: Icon,
  label,
  mockContent,
  enabled,
  onToggle,
  locked,
  companySlug,
}: {
  icon: React.ElementType;
  label: string;
  mockContent: React.ReactNode;
  enabled: boolean;
  onToggle?: () => void;
  locked?: boolean;
  companySlug?: string;
}) {
  const active = enabled && !locked;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200 ${
        locked ? 'border-stone-200 bg-stone-50' : active ? 'border-stone-300 bg-white shadow-sm' : 'border-stone-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
          active ? 'border-stone-300 bg-white' : 'border-transparent bg-stone-100'
        }`}>
          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-stone-800' : 'text-stone-400'}`} />
        </div>

        <p className={`min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wider ${
          active ? 'text-stone-700' : 'text-stone-500'
        }`}>
          {label}
        </p>

        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
          locked
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : active
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-stone-200 bg-stone-50 text-stone-500'
        }`}>
          {locked ? `${REQUIRED_PLAN.label} plan` : active ? 'On' : 'Off'}
        </span>

        {locked && companySlug ? (
          <UpgradePill companySlug={companySlug} />
        ) : (
          <ToggleSwitch enabled={enabled} onToggle={onToggle!} ariaLabel={`Toggle ${label}`} />
        )}
      </div>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="border-t border-stone-200 bg-stone-50 px-5 pb-5 pt-4">{mockContent}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── Step 1 preview ─────────────────── */

function FormStep1({
  heading,
  categories,
  brandColor1,
  brandColor2,
  logoUrl,
}: {
  heading: string;
  categories: Category[];
  brandColor1: string;
  brandColor2: string;
  logoUrl?: string | null;
}) {
  const labelClass = 'mb-1.5 ml-1 text-[9px] font-bold uppercase tracking-widest text-stone-600';
  const inputClass =
    'flex h-11 w-full items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 text-xs font-semibold text-stone-800';

  return (
    <div className="bg-white">
      <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        {logoUrl && <img src={logoUrl} alt="" className="mb-4 h-8 w-auto object-contain" />}
        <h3 className="text-lg font-bold tracking-tight text-white">{heading || 'Request a Free Quote'}</h3>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <p className={labelClass}>Full name</p>
          <div className={inputClass}>
            <User className="h-3.5 w-3.5 shrink-0 text-stone-400" />
            John Smith
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className={labelClass}>Email address</p>
            <div className={inputClass}>
              <Mail className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              john@example.com
            </div>
          </div>
          <div>
            <p className={labelClass}>Phone number</p>
            <div className={inputClass}>
              <Phone className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              (555) 123-4567
            </div>
          </div>
        </div>

        <div>
          <p className={labelClass}>Service needed</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`rounded-lg border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  i === 0 ? 'border-transparent text-white' : 'border-stone-200 bg-white text-stone-800'
                }`}
                style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
              >
                {cat.label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className={labelClass}>Project description</p>
          <div className="h-20 w-full rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs font-semibold text-stone-500">
            Describe your project here...
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Question modal ─────────────────── */

function QuestionModal({
  question,
  newOption,
  isEditing,
  onChange,
  onOptionChange,
  onSave,
  onCancel,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <span className="text-[14px] font-bold uppercase tracking-wider text-stone-900">
            {isEditing ? 'Edit question' : 'Add custom question'}
          </span>
          <button onClick={onCancel} className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-700">Question title</label>
            <input
              type="text"
              value={question.label}
              onChange={(e) => onChange({ ...question, label: e.target.value })}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-4 focus:ring-stone-100"
              placeholder='e.g., "How old is your roof?"'
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-700">Input type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'text', label: 'Text input' },
                { val: 'select', label: 'Dropdown' },
                { val: 'checkbox', label: 'Yes/No' },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => onChange({ ...question, type: t.val as any, options: t.val === 'select' ? question.options : [] })}
                  className={`rounded-lg border py-2 text-[11px] font-bold transition ${
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
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-stone-700">Dropdown options</label>

              <div className="max-h-36 space-y-1.5 overflow-y-auto pr-1">
                <AnimatePresence>
                  {question.options?.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-3 py-2"
                    >
                      <span className="text-xs font-semibold text-stone-800">{opt}</span>
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
                  className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold outline-none transition focus:border-stone-900"
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
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-stone-800"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              className="flex-1 rounded-xl bg-stone-900 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-stone-800"
            >
              {isEditing ? 'Update' : 'Add question'}
            </button>
            <button
              onClick={onCancel}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}