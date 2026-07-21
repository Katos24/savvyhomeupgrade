'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Check, Edit2, X,
  ChevronDown, Eye, Plus,
  User, Mail, Phone, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
  Link2, Truck, Trash2, SlidersHorizontal, Inbox, Sparkles,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
import type { Transition } from 'framer-motion';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';

type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

type Category = {
  emoji?: string;
  label: string;
  value: string;
};

type FieldConfigItem = {
  enabled: boolean;
  required?: boolean;
};

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

const spring: Transition = { type: 'spring', damping: 28, stiffness: 320 };

/* ───────────────────────── Brand Logo Marks ───────────────────────── */
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
      <path
        fill="#fff"
        d="M15.5 12.5h-2v7h-3v-7H9v-2.6h1.5V8.4c0-1.5.9-2.9 3.2-2.9h2v2.5h-1.5c-.3 0-.7.2-.7.8v1.6H16l-.5 2.6z"
      />
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

/* ───────────────────────── Info Cards ───────────────────────── */
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
    body: 'Add your booking link under "Booking link" or "Quote link" on your Google Business Profile. When a customer finds you on Google, they can click straight through and fill out your form — no extra steps, no phone tag. It\u2019s one of the easiest ways to capture more leads from people who are already searching for someone like you.',
  },
  {
    id: 'facebook',
    icon: FacebookLogo,
    title: 'Facebook',
    teaser: 'Add it to your bio or a post',
    image: '/images/form-guide/facebook.png',
    body: 'Pin your booking link to the top of your Facebook Page, or add it to a post whenever you post a job photo. People scrolling their feed can tap through and book right then — while the job you just finished is still fresh in their mind.',
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
    body: "If you have a website, link your booking form from a \u201cGet a Quote\u201d or \u201cBook Now\u201d button. It's a better handoff than listing a phone number — the visitor stays on your site and fills out the form instead of having to remember to call later.",
  },
  {
    id: 'flyers',
    icon: ImageIcon,
    title: 'Flyers & signs',
    teaser: 'Print the link or QR code',
    image: '/images/flyers.webp',
    body: 'Print your booking link, or better, the QR code from your Overview tab, on flyers, yard signs, or door hangers. Someone can scan it standing right in front of their house instead of typing a URL by hand — fewer steps means more of them actually follow through.',
  },
  {
    id: 'vehicle',
    icon: Truck,
    title: 'Vehicle & business cards',
    teaser: 'Book on the spot',
    image: '/images/qrbranded2.webp',
    body: "Put a QR code on your truck magnet or business card. A neighbor who sees your truck parked down the street, or someone you hand a card to on the spot, can book in the time it takes to scan it — no need to remember your name later.",
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
  return (
    <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />
  );
}

function InfoCardBar({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
      {FORM_INFO_CARDS.map((card) => (
        <button
          key={card.id}
          onClick={() => onSelect(card.id)}
          className="flex min-w-[200px] shrink-0 items-start gap-3 rounded-xl border border-stone-250 bg-white p-4 text-left transition hover:border-stone-400 hover:bg-stone-50"
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
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-150 px-5 py-4">
          <span className="text-sm font-bold uppercase tracking-wider text-stone-900">{card.title}</span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-stone-450 hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <ImageOrPlaceholder
            src={card.image}
            alt={card.title}
            className="block h-44 w-full rounded-xl object-cover shadow-sm border border-stone-200"
          />
          <p className="mt-4 text-[13px] font-semibold leading-relaxed text-stone-700">
            {card.body}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Main FormTab Component ───────────────────────── */
export default function FormTab({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'basic') as PlanTier;
  const canUsePhotoUpload     = can(planTier, 'customer_video_upload');
  const canUseCustomQuestions = can(planTier, 'custom_form_questions');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);
 const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [step1Open, setStep1Open] = useState(false);

  const existingConfig = company.form_field_config;
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>(() => {
    const base = existingConfig ? {
      address: {
        enabled: existingConfig.address?.enabled ?? DEFAULT_FIELD_CONFIG.address.enabled,
        required: existingConfig.address?.required ?? DEFAULT_FIELD_CONFIG.address.required,
      },
      preferred_date: { enabled: existingConfig.preferred_date?.enabled ?? DEFAULT_FIELD_CONFIG.preferred_date.enabled },
      preferred_time: { enabled: existingConfig.preferred_time?.enabled ?? DEFAULT_FIELD_CONFIG.preferred_time.enabled },
      lead_source: { enabled: existingConfig.lead_source?.enabled ?? DEFAULT_FIELD_CONFIG.lead_source.enabled },
      file_upload: { enabled: existingConfig.file_upload?.enabled ?? DEFAULT_FIELD_CONFIG.file_upload.enabled },
    } : {
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

  const getCtaHeading = () => {
    if (company.cta_heading) return company.cta_heading;
    switch (company.business_type) {
      case 'restaurant': return 'Order Your Custom Meal';
      case 'salon': return 'Book Your Appointment';
      case 'photography': return 'Request a Photo Session';
      default: return 'Submit Your Request';
    }
  };

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({ id: '', label: '', type: 'text', required: false, options: [] });
  const [newOption, setNewOption] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [publicUrl, setPublicUrl] = useState(`https://lead2project.com/${company.slug}`);

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({ fieldConfig, customQuestions })
  );
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

  const toggleField = (field: keyof FieldConfig) =>
    setFieldConfig(prev => ({ ...prev, [field]: { ...prev[field], enabled: !prev[field].enabled } }));

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
        message: err instanceof Error ? err.message : 'Something went wrong — please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateQuestion = () => {
    if (!newQuestion.label.trim()) return setStatus({ type: 'error', message: 'Label is required' });
    if (editingQuestionId) {
      setCustomQuestions(customQuestions.map(q => q.id === editingQuestionId ? { ...newQuestion, required: false } : q));
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
      <div className="mx-auto max-w-4xl pb-24">
        {company.plan_tier === 'free' && (
          <div className="mb-6">
            <SettingsUpgradeBanner
              planLabel="Basic"
              price="$49.99/mo"
              message="Your booking form is live. Upgrade to add custom branding, photo uploads, and custom questions."
              companySlug={company.slug}
            />
          </div>
        )}

        {/* ── HEADER PANEL ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">Booking form</h2>
              {isDirty && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-stone-500">
              Customize how customers schedule and share project details.
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

        {/* ── QUICK TIPS PANEL ── */}
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-bold text-stone-900">
            Get leads without lifting a finger
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
                <SlidersHorizontal className="h-4 w-4 text-stone-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">1. Customize form</p>
                <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-stone-500">
                  Toggle custom questions and extra details below.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
                <Inbox className="h-4 w-4 text-stone-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">2. Share anywhere</p>
                <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-stone-500">
                  Copy your link to Google Maps, social bios, or flyers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
                <Sparkles className="h-4 w-4 text-stone-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">3. Collect details</p>
                <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-stone-500">
                  Submissions land straight onto your active pipeline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CUSTOMER BOOKING LINK ── */}
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
            Your Public Form Link
          </p>
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="flex-1 truncate rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5">
              <code className="truncate font-mono text-[13px] font-semibold text-stone-700">
                {publicUrl}
              </code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 1800);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-850 transition hover:bg-stone-50"
            >
              {linkCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                </>
              ) : (
                'Copy link'
              )}
            </button>
          </div>
        </div>

        {/* ── WHERE TO PUT YOUR LINK ── */}
        <div className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-stone-700">
            Where to display your link
          </p>
          <InfoCardBar onSelect={setActiveCardId} />
        </div>

        {/* ── STATUS TOAST ── */}
        <AnimatePresence>
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm font-semibold ${
                status.type === 'success'
                  ? 'border-emerald-250 bg-emerald-50 text-emerald-800'
                  : 'border-rose-250 bg-rose-50 text-rose-800'
              }`}
            >
              {status.type === 'success' ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FORM PREVIEW SECTION ── */}
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-stone-700">
          Form Layout & Live Customization
        </p>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {/* Step 1 Title Panel — accordion trigger */}
          <button
            type="button"
            onClick={() => setStep1Open((prev) => !prev)}
            className="flex w-full items-center justify-between border-b border-stone-150 bg-stone-50/45 px-5 py-3 text-left"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
              Step 1: Contact details
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                <Lock className="h-3 w-3" /> Always Required
              </span>
              <ChevronDown
                className={`h-4 w-4 text-stone-500 transition-transform duration-200 ${step1Open ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {step1Open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <FormStep1
                  heading={getCtaHeading()}
                  categories={categories}
                  brandColor1={brandColor1}
                  brandColor2={brandColor2}
                  logoUrl={company.logo_url}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2 Section */}
          <div className="border-t border-stone-200">
            <FormStep2Editable
              fieldConfig={fieldConfig}
              toggleField={toggleField}
              customQuestions={customQuestions}
              setCustomQuestions={setCustomQuestions}
              canUseCustomQuestions={canUseCustomQuestions}
              canUsePhotoUpload={canUsePhotoUpload}
              brandColor1={brandColor1}
              brandColor2={brandColor2}
              companySlug={company.slug}
              showAddQuestion={showAddQuestion}
              setShowAddQuestion={setShowAddQuestion}
              editingQuestionId={editingQuestionId}
              setEditingQuestionId={setEditingQuestionId}
              newQuestion={newQuestion}
              setNewQuestion={setNewQuestion}
              newOption={newOption}
              setNewOption={setNewOption}
              onSaveQuestion={addOrUpdateQuestion}
              onCancelQuestion={resetForm}
            />
          </div>
        </div>
      </div>

      {/* ── STICKY SAVING PROMPT ── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
          >
            <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-stone-800">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 animate-pulse" />
                You have unsaved changes.
              </p>
              <button
                onClick={handleSaveAll}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-60 sm:w-auto"
              >
                {loading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-1.5" />}
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeCard && (
        <InfoModal card={activeCard} onClose={() => setActiveCardId(null)} />
      )}
    </div>
  );
}

/* ─────────────────── TOGGLE SWITCH ─────────────────── */
function ToggleSwitch({ enabled, onToggle, ariaLabel }: { enabled: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative h-5.5 w-9.5 shrink-0 rounded-full transition-all duration-200 outline-none ${
        enabled ? 'bg-emerald-600' : 'bg-stone-200'
      }`}
    >
      <div
        className="absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}

/* ─────────────────── EDITABLE FIELD ROW ─────────────────── */
function EditableFieldRow({
  icon: Icon,
  label,
  mockContent,
  enabled,
  onToggle,
  locked,
  companySlug,
  planTier,
}: {
  icon: React.ElementType;
  label: string;
  mockContent: React.ReactNode;
  enabled: boolean;
  onToggle?: () => void;
  locked?: boolean;
  companySlug?: string;
  planTier?: string;
}) {
  const active = enabled && !locked;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-200 ${
        locked
          ? 'border-stone-200 bg-stone-50/50'
          : active
          ? 'border-stone-250 bg-stone-50/20 shadow-sm'
          : 'border-stone-200/80 bg-white'
      }`}
    >
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
          active ? 'border-stone-300 bg-white' : 'border-transparent bg-stone-50'
        }`}>
          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-stone-800' : 'text-stone-400'}`} />
        </div>
        
        <p className={`min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wider ${
          active ? 'text-stone-700' : 'text-stone-500'
        }`}>
          {label}
        </p>

        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
          locked
            ? 'bg-stone-50 border-stone-200 text-stone-500'
            : active
            ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
            : 'bg-stone-50 border-stone-200 text-stone-500'
        }`}>
          {locked ? 'Locked' : active ? 'Active' : 'Off'}
        </span>

       {locked ? (
          planTier === 'free' ? (
            <a
              href={`/${companySlug}/admin/settings`}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1.5 text-white transition hover:bg-amber-700"
            >
              <Lock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Upgrade</span>
            </a>
          ) : (
            <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1.5 text-stone-400">
              <Lock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Locked</span>
            </span>
          )
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
            <div className="border-t border-stone-150/60 bg-stone-50/20 px-5 pb-4.5 pt-4">
              {mockContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── STEP 1 READ-ONLY PREVIEW ─────────────────── */
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
  const labelClass = "text-[9px] font-bold text-stone-750 uppercase tracking-widest ml-1 mb-1.5";
  const inputClass =
    "w-full h-11 bg-stone-50/50 border border-stone-200/70 rounded-xl px-4 text-stone-800 text-xs flex items-center gap-3 font-semibold";

  return (
    <div className="bg-white">
      <div
        className="p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
      >
        {logoUrl && (
          <img src={logoUrl} alt="" className="h-8 w-auto object-contain mb-4" />
        )}
        <h3 className="text-lg font-bold tracking-tight text-white">
          {heading || 'Request a Free Quote'}
        </h3>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <p className={labelClass}>Full Name</p>
          <div className={inputClass}>
            <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            John Smith
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className={labelClass}>Email Address</p>
            <div className={inputClass}>
              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              john@example.com
            </div>
          </div>
          <div>
            <p className={labelClass}>Phone Number</p>
            <div className={inputClass}>
              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              (555) 123-4567
            </div>
          </div>
        </div>

        <div>
          <p className={labelClass}>Service Needed</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${
                  i === 0
                    ? 'text-white border-transparent'
                    : 'bg-white text-stone-800 border-stone-200'
                }`}
                style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
              >
                {cat.label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className={labelClass}>Project Description</p>
          <div className="w-full h-20 bg-stone-50/50 border border-stone-200/70 rounded-xl p-4 text-stone-500 text-xs font-semibold">
            Describe your project here...
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── STEP 2 — EDITABLE PANEL ─────────────────── */
function FormStep2Editable({
  fieldConfig,
  toggleField,
  customQuestions,
  setCustomQuestions,
  canUseCustomQuestions,
  canUsePhotoUpload,
  brandColor1,
  brandColor2,
  companySlug,
  showAddQuestion,
  setShowAddQuestion,
  editingQuestionId,
  setEditingQuestionId,
  newQuestion,
  setNewQuestion,
  newOption,
  setNewOption,
  onSaveQuestion,
  onCancelQuestion,
}: {
  fieldConfig: FieldConfig;
  toggleField: (f: keyof FieldConfig) => void;
  customQuestions: CustomQuestion[];
  setCustomQuestions: (q: CustomQuestion[]) => void;
  canUseCustomQuestions: boolean;
  canUsePhotoUpload: boolean;
  brandColor1: string;
  brandColor2: string;
  companySlug: string;
  showAddQuestion: boolean;
  setShowAddQuestion: (v: boolean) => void;
  editingQuestionId: string | null;
  setEditingQuestionId: (v: string | null) => void;
  newQuestion: CustomQuestion;
  setNewQuestion: (q: CustomQuestion) => void;
  newOption: string;
  setNewOption: (v: string) => void;
  onSaveQuestion: () => void;
  onCancelQuestion: () => void;
}) {
  const innerLabelClass = "text-[9px] font-bold text-stone-750 uppercase tracking-widest mb-1.5 block";
  const innerInputClass = "h-10 w-full bg-white border border-stone-200 rounded-xl px-3 text-xs text-stone-600 flex items-center font-semibold";

  return (
    <div className="bg-white">
      <div
        className="p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
      >
        <h3 className="text-lg font-bold tracking-tight">Step 2: Extra Details</h3>
        <p className="text-white/80 text-xs mt-1 font-medium">
          Toggle optional fields to customize additional information collected.
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Address */}
        <EditableFieldRow
          icon={MapPin}
          label="Address"
          enabled={fieldConfig.address.enabled}
          onToggle={() => toggleField('address')}
          mockContent={
            <div className="space-y-4 max-w-xl">
              <div>
                <label className={innerLabelClass}>Street Address</label>
                <div className={innerInputClass}>123 Main St</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={innerLabelClass}>City</label>
                  <div className={innerInputClass}>New York</div>
                </div>
                <div>
                  <label className={innerLabelClass}>Zip Code</label>
                  <div className={innerInputClass}>12345</div>
                </div>
              </div>
            </div>
          }
        />

        {/* Preferred Date */}
        <EditableFieldRow
          icon={Calendar}
          label="Preferred Date"
          enabled={fieldConfig.preferred_date.enabled}
          onToggle={() => toggleField('preferred_date')}
          mockContent={
            <div className="max-w-md">
              <label className={innerLabelClass}>Requested Date</label>
              <div className={innerInputClass}>MM / DD / YYYY</div>
            </div>
          }
        />

        {/* Preferred Time */}
        <EditableFieldRow
          icon={Clock}
          label="Preferred Time"
          enabled={fieldConfig.preferred_time.enabled}
          onToggle={() => toggleField('preferred_time')}
          mockContent={
            <div className="max-w-md">
              <label className={innerLabelClass}>Best Time of Day</label>
              <div className={innerInputClass}>Morning, Afternoon...</div>
            </div>
          }
        />

        {/* Lead Source */}
        <EditableFieldRow
          icon={Megaphone}
          label="Lead Source"
          enabled={fieldConfig.lead_source.enabled}
          onToggle={() => toggleField('lead_source')}
          mockContent={
            <div className="max-w-md">
              <label className={innerLabelClass}>How did you hear about us?</label>
              <div className={innerInputClass}>Selection dropdown...</div>
            </div>
          }
        />

        {/* File Upload */}
        <EditableFieldRow
          icon={ImageIcon}
          label="Photo Upload"
          enabled={fieldConfig.file_upload.enabled}
          onToggle={() => toggleField('file_upload')}
          locked={!canUsePhotoUpload}
          companySlug={companySlug}
          mockContent={
            <div className="max-w-xl border-2 border-dashed border-stone-200 hover:border-stone-300 rounded-xl flex flex-col items-center justify-center gap-2 py-6 bg-stone-50/50">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                <ImageIcon className="w-5 h-5 text-stone-600" />
              </div>
              <p className="text-xs font-bold text-stone-800">Drag or click to upload photos</p>
              <p className="text-[10px] font-medium text-stone-500">Supports JPG, PNG, or video files up to 25MB</p>
            </div>
          }
        />

        {/* Custom Questions Section */}
        <div className="space-y-3 pt-4">
         <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
              Custom Questions
            </p>
            <a
            
          href={`/${companySlug}/admin/settings`}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1.5 text-white transition hover:bg-amber-700"
            >
              <Lock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Upgrade</span>
            </a>
          </div>

          <div className="space-y-3">
            {customQuestions.map((q) => (
              <div
                key={q.id}
                className="group relative rounded-xl border border-stone-200 bg-stone-50/20 p-5 transition-all hover:border-stone-300 hover:shadow-sm"
              >
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setNewQuestion(q);
                      setEditingQuestionId(q.id);
                      setShowAddQuestion(true);
                    }}
                    className="p-1.5 bg-white border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 shadow-sm"
                    aria-label="Edit question"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCustomQuestions(customQuestions.filter((x) => x.id !== q.id))}
                    className="p-1.5 bg-white border border-stone-200 rounded-lg text-rose-600 hover:bg-rose-50/50 shadow-sm"
                    aria-label="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pr-24 mb-3">
                  <HelpCircle className="w-4 h-4 text-stone-600 shrink-0" />
                  <p className="text-xs font-bold text-stone-800 uppercase tracking-wider truncate">
                    {q.label}
                  </p>
                </div>

                {q.type === 'text' && (
                  <div className="h-10 w-full max-w-xl bg-white border border-stone-200 rounded-xl flex items-center px-4 text-xs font-medium text-stone-400">
                    User types response text...
                  </div>
                )}

                {q.type === 'select' && (
                  <div className="h-10 w-full max-w-xl bg-white border border-stone-200 rounded-xl flex items-center justify-between px-4 text-xs font-medium text-stone-600">
                    <span className="truncate">
                      {q.options?.length
                        ? `${q.options.length} option${q.options.length === 1 ? '' : 's'}: ${q.options.slice(0, 3).join(', ')}${q.options.length > 3 ? '…' : ''}`
                        : 'Select an option...'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 ml-2" />
                  </div>
                )}

                {q.type === 'checkbox' && (
                  <div className="flex gap-5">
                    <div className="flex items-center gap-2.5 text-xs text-stone-650 font-bold">
                      <div className="w-4.5 h-4.5 rounded border border-stone-300 bg-white" /> Yes
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-stone-650 font-bold">
                      <div className="w-4.5 h-4.5 rounded border border-stone-300 bg-white" /> No
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!canUseCustomQuestions ? (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center gap-3">
              <Lock className="w-4 h-4 text-stone-400 shrink-0" />
              <p className="text-xs font-bold text-stone-500">
                Upgrade to add custom fields and questionnaires
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowAddQuestion(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-50"
            >
              <Plus className="h-4 w-4 text-stone-600" /> Add Custom Question
            </button>
          )}
        </div>
      </div>

      {showAddQuestion && (
        <QuestionModal
          question={newQuestion}
          newOption={newOption}
          isEditing={!!editingQuestionId}
          onChange={setNewQuestion}
          onOptionChange={setNewOption}
          onSave={onSaveQuestion}
          onCancel={onCancelQuestion}
        />
      )}
    </div>
  );
}

/* ─────────────────── QUESTION MODAL ─────────────────── */
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white border border-stone-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-150 px-6 py-4">
          <span className="text-[14px] font-bold uppercase tracking-wider text-stone-900">
            {isEditing ? 'Edit Question' : 'Add Custom Question'}
          </span>
          <button
            onClick={onCancel}
            className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
              Question Title
            </label>
            <input
              type="text"
              value={question.label}
              onChange={(e) => onChange({ ...question, label: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 outline-none transition text-sm font-semibold focus:border-stone-900 focus:ring-4 focus:ring-stone-100"
              placeholder='e.g., "What is your budget range?"'
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
              Input Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'text', label: 'Text Input' },
                { val: 'select', label: 'Dropdown' },
                { val: 'checkbox', label: 'Yes/No' },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() =>
                    onChange({
                      ...question,
                      type: t.val as any,
                      options: t.val === 'select' ? question.options : [],
                    })
                  }
                  className={`py-2 rounded-lg border text-[11px] font-bold transition ${
                    question.type === t.val
                      ? 'bg-stone-900 border-stone-900 text-white'
                      : 'bg-white border-stone-250 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {question.type === 'select' && (
            <div className="space-y-2 border-t border-stone-150 pt-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                Dropdown Options
              </label>
              
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                <AnimatePresence>
                  {question.options?.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="flex items-center justify-between bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg"
                    >
                      <span className="text-xs font-semibold text-stone-800">{opt}</span>
                      <button
                        onClick={() =>
                          onChange({
                            ...question,
                            options: question.options?.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-stone-400 hover:text-rose-600 transition"
                        aria-label="Remove option"
                      >
                        <X className="w-3.5 h-3.5" />
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
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white outline-none focus:border-stone-900 transition font-semibold"
                  placeholder="Add custom option..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newOption) {
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
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition shadow-sm"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              {isEditing ? 'Update' : 'Add Question'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}