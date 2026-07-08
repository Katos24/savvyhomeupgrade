'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Check, Edit2, X,
  ChevronDown, Eye,
  User, Mail, Phone, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
  Globe, Link2, Truck, Trash2,
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

type FieldConfig = {
  address: { enabled: boolean; required: boolean };
  preferred_date: { enabled: boolean };
  preferred_time: { enabled: boolean };
  lead_source: { enabled: boolean };
  file_upload: { enabled: boolean };
};

const DEFAULT_FIELD_CONFIG: FieldConfig = {
  address: { enabled: true, required: false },
  preferred_date: { enabled: true },
  preferred_time: { enabled: true },
  lead_source: { enabled: true },
  file_upload: { enabled: false },
};

const spring: Transition = { type: 'spring', damping: 28, stiffness: 320 };

/* ───────────────────────── Top info-card bar ─────────────────────────
   Each card opens a modal with an image + text slot. Swap the `image`
   path and `body` copy below for your own content — layout doesn't need
   to change when you do. */
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
    id: 'step1',
    icon: User,
    title: 'Step 1 fields',
    teaser: "What customers fill out first",
    image: '/images/form-guide/step1.png',
    body: 'Add your own explanation here of what step 1 covers and why these fields are always collected.',
  },
  {
    id: 'custom-questions',
    icon: HelpCircle,
    title: 'Custom questions',
    teaser: 'Ask anything you need',
    image: '/images/form-guide/custom-questions.png',
    body: 'Add your own explanation here of how custom questions work and when to use them.',
  },
  {
    id: 'photo-upload',
    icon: ImageIcon,
    title: 'Photo uploads',
    teaser: 'Let customers attach photos',
    image: '/images/form-guide/photo-upload.png',
    body: 'Add your own explanation here of the photo upload feature.',
  },
  {
    id: 'share',
    icon: Megaphone,
    title: 'Sharing your form',
    teaser: 'Where to put your link',
    image: '/images/form-guide/share.png',
    body: 'Add your own explanation here, or point people to the ideas at the bottom of this page.',
  },
];

// Shows the real image if it loads; falls back to a plain placeholder
// instead of a broken-image icon if the path isn't filled in yet.
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
    // eslint-disable-next-line @next/next/no-img-element
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
          className="flex min-w-[190px] shrink-0 items-start gap-3 rounded-lg border-2 border-stone-300 bg-white p-3.5 text-left transition-colors hover:border-stone-400 hover:bg-stone-50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-stone-200 bg-stone-50">
            <card.icon className="h-4 w-4 text-stone-700" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-stone-900">{card.title}</p>
            <p className="mt-0.5 truncate text-[11.5px] font-semibold text-stone-500">{card.teaser}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function InfoModal({ card, onClose }: { card: InfoCard; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-stone-200 px-5 py-4">
          <span className="text-[15px] font-extrabold text-stone-900">{card.title}</span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          <ImageOrPlaceholder
            src={card.image}
            alt={card.title}
            className="block h-48 w-full rounded-lg object-cover"
          />
          <p className="mt-4 text-[14px] font-semibold leading-relaxed text-stone-700">
            {card.body}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FormTab({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'basic') as PlanTier;
  const canUsePhotoUpload     = can(planTier, 'customer_video_upload');
  const canUseCustomQuestions = can(planTier, 'custom_form_questions');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

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
    <div className="bg-[#F3F2FB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl pb-16">
        {(company.plan_tier === 'free') && (
          <div className="mb-6">
            <SettingsUpgradeBanner
              planLabel="Basic"
              price="$49.99/mo"
              message="Your booking form is live. Upgrade to add custom branding, photo uploads, and custom questions."
              companySlug={company.slug}
            />
          </div>
        )}

        {/* ── TITLE + ACTIONS ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Booking form</h2>
            <p className="mt-1 text-[15px] font-semibold text-stone-700">
              This is exactly what customers see. Toggle fields below to change it.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-800 transition-colors hover:bg-stone-50 sm:flex-none"
            >
              <Eye className="h-4 w-4" /> View
            </a>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60 sm:flex-none"
            >
              {loading && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* ── INFO CARD BAR ── */}
        <div className="mb-6">
          <InfoCardBar onSelect={setActiveCardId} />
        </div>

        {/* ── STATUS TOAST ── */}
        <AnimatePresence>
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className={`mb-4 flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-bold ${
                status.type === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-rose-300 bg-rose-50 text-rose-800'
              }`}
            >
              {status.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FORM PREVIEW: step 1 fixed, step 2 editable, one card ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b-2 border-stone-200 bg-stone-100 px-5 py-3">
            <span className="text-[13px] font-extrabold uppercase tracking-wide text-stone-700">
              Step 1
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-600">
              <Lock className="h-3 w-3" /> Always collected, can&apos;t be edited
            </span>
          </div>

          <FormStep1
            heading={getCtaHeading()}
            categories={categories}
            brandColor1={brandColor1}
            brandColor2={brandColor2}
            logoUrl={company.logo_url}
          />

          <div className="border-t-2 border-stone-200">
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
              ctaSuccessMessage={ctaSuccessMessage}
              setCtaSuccessMessage={setCtaSuccessMessage}
            />
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
        >
          {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {loading ? 'Saving...' : 'Save changes'}
        </button>

        {/* ── SHARE YOUR LINK IDEAS ── */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-1 text-[13px] font-extrabold uppercase tracking-wide text-stone-700">
            Get the word out
          </p>
          <p className="mb-4 text-[14px] font-semibold text-stone-600">
            Your booking link works anywhere you can put a link or a QR code.
          </p>

          <div className="mb-5 flex items-center gap-2 rounded-lg border-2 border-stone-300 bg-stone-50 px-3.5 py-3">
            <code className="flex-1 truncate font-mono text-[13px] font-bold text-stone-800">{publicUrl}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 1800);
              }}
              className="shrink-0 rounded-md border-2 border-stone-300 bg-white px-3 py-1.5 text-[12px] font-bold text-stone-800 transition-colors hover:bg-stone-100"
            >
              {linkCopied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ShareIdeaCard
              icon={Globe}
              title="Google Business Profile"
              description="Add your booking link to your Google Business Profile website field — it's often the first place customers look before they even reach your site."
            />
            <ShareIdeaCard
              icon={Megaphone}
              title="Social media"
              description="Add it to your Instagram or Facebook bio, or drop it in a post."
            />
            <ShareIdeaCard
              icon={Link2}
              title="Your website"
              description="Link it from a 'Get a Quote' or 'Book Now' button."
            />
            <ShareIdeaCard
              icon={ImageIcon}
              title="Flyers & signs"
              description="Print it — or the QR code from your Overview tab — on flyers, yard signs, or door hangers."
            />
            <ShareIdeaCard
              icon={Truck}
              title="Vehicle & business cards"
              description="A QR code on your truck magnet or business card lets people book on the spot."
            />
          </div>
        </div>
      </div>

      {activeCard && <InfoModal card={activeCard} onClose={() => setActiveCardId(null)} />}
    </div>
  );
}

function ShareIdeaCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border-2 border-stone-200 bg-white p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-stone-200 bg-stone-50">
        <Icon className="h-4 w-4 text-stone-700" />
      </div>
      <div>
        <p className="text-[13px] font-bold text-stone-900">{title}</p>
        <p className="mt-0.5 text-[12.5px] font-medium leading-relaxed text-stone-600">{description}</p>
      </div>
    </div>
  );
}

/* ─────────────────── SMALL TOGGLE SWITCH ─────────────────── */
function ToggleSwitch({ enabled, onToggle, ariaLabel }: { enabled: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative h-6 w-10 shrink-0 rounded-full shadow-inner transition-all duration-300 ${enabled ? 'bg-emerald-600' : 'bg-stone-300'}`}
    >
      <div
        className="absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-300"
        style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}

/* ─────────────────── FIELD ROW — CONDENSED ───────────────────
   Disabled fields collapse to a slim single-line row (still visible,
   still greyed, still toggleable). Enabled fields expand to show the
   customer-facing preview. This is what shortens the step-2 list. */
function EditableFieldRow({
  icon: Icon, label, mockContent, enabled, onToggle, locked, companySlug,
}: {
  icon: React.ElementType; label: string; mockContent: React.ReactNode;
  enabled: boolean; onToggle?: () => void; locked?: boolean; companySlug?: string;
}) {
  const active = enabled && !locked;

  return (
    <div
      className={`overflow-hidden rounded-lg border-2 transition-all duration-300 ${
        locked
          ? 'border-stone-200 bg-stone-50'
          : active
          ? 'border-emerald-600 bg-emerald-50/40'
          : 'border-stone-300 bg-white'
      }`}
    >
      {/* Header row — this is ALL a disabled field shows */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
        <p className={`min-w-0 flex-1 truncate text-[11px] font-bold uppercase tracking-wider ${
          active ? 'text-stone-900' : 'text-stone-500'
        }`}>
          {label}
        </p>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${
          locked ? 'bg-stone-200 text-stone-500'
          : active ? 'bg-emerald-100 text-emerald-800'
          : 'bg-stone-200 text-stone-500'
        }`}>
          {locked ? 'Locked' : active ? 'Active' : 'Off'}
        </span>
        {locked ? (
          <a
            href={`/company/${companySlug}/settings/billing`}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-white transition-colors hover:bg-stone-800"
          >
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Upgrade</span>
          </a>
        ) : (
          <ToggleSwitch enabled={enabled} onToggle={onToggle!} ariaLabel={`Toggle ${label}`} />
        )}
      </div>

      {/* Preview — only when active, animated open/closed */}
      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-3.5">
              {mockContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── STEP 1 (fixed, read-only preview — always-collected fields) ─────────────────── */
function FormStep1({ heading, categories, brandColor1, brandColor2, logoUrl }: {
  heading: string; categories: Category[]; brandColor1: string; brandColor2: string; logoUrl?: string | null;
}) {
  const labelClass = "text-[9px] font-bold text-stone-800 uppercase tracking-wider ml-1 mb-1.5";
  const inputClass = "w-full h-11 bg-white border border-stone-200 rounded-xl px-4 text-stone-800 text-[11px] flex items-center gap-3 shadow-sm";

  return (
    <div className="bg-white">
      {/* This gradient reflects the company's real brand colors — it's an
          accurate live preview of the customer-facing form, not decoration. */}
      <div className="p-5 sm:p-6 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-8 w-auto object-contain mb-4" />
        )}
        <h3 className="text-lg font-bold tracking-tight text-white">{heading || 'Request a Free Quote'}</h3>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div>
          <p className={labelClass}>Full Name</p>
          <div className={inputClass}><User className="w-3.5 h-3.5 text-stone-400 shrink-0" />John Smith</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className={labelClass}>Email</p>
            <div className={inputClass}><Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />john@example.com</div>
          </div>
          <div>
            <p className={labelClass}>Phone</p>
            <div className={inputClass}><Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />(555) 123-4567</div>
          </div>
        </div>

        <div>
          <p className={labelClass}>Service Needed</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${
                  i === 0 ? 'text-white border-transparent' : 'bg-white text-stone-800 border-stone-200'
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
          <div className="w-full h-20 bg-white border border-stone-200 rounded-xl p-4 text-stone-600 text-[11px] shadow-sm">
            Describe your project here...
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── STEP 2 — EDITABLE, CONDENSED ─────────────────── */
function FormStep2Editable({
  fieldConfig, toggleField, customQuestions, setCustomQuestions,
  canUseCustomQuestions, canUsePhotoUpload, brandColor1, brandColor2, companySlug,
  showAddQuestion, setShowAddQuestion, editingQuestionId, setEditingQuestionId,
  newQuestion, setNewQuestion, newOption, setNewOption, onSaveQuestion, onCancelQuestion,
  ctaSuccessMessage, setCtaSuccessMessage,
}: {
  fieldConfig: FieldConfig; toggleField: (f: keyof FieldConfig) => void;
  customQuestions: CustomQuestion[]; setCustomQuestions: (q: CustomQuestion[]) => void;
  canUseCustomQuestions: boolean; canUsePhotoUpload: boolean;
  brandColor1: string; brandColor2: string; companySlug: string;
  showAddQuestion: boolean; setShowAddQuestion: (v: boolean) => void;
  editingQuestionId: string | null; setEditingQuestionId: (v: string | null) => void;
  newQuestion: CustomQuestion; setNewQuestion: (q: CustomQuestion) => void;
  newOption: string; setNewOption: (v: string) => void;
  onSaveQuestion: () => void; onCancelQuestion: () => void;
  ctaSuccessMessage: string; setCtaSuccessMessage: (v: string) => void;
}) {
  return (
    <div className="bg-white">
      <div className="p-5 sm:p-6 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <h3 className="text-lg font-bold tracking-tight">Step 2: Extra Details</h3>
        <p className="text-white/80 text-[11px] mt-1 font-medium">Toggle fields on to see their preview. Off fields stay collapsed.</p>
      </div>

      <div className="p-4 sm:p-5 space-y-2.5">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-700 ml-1">
            Success message
          </label>
          <textarea
            value={ctaSuccessMessage}
            onChange={(e) => setCtaSuccessMessage(e.target.value)}
            placeholder="Thanks! We'll be in touch within 24 hours."
            rows={2}
            className="w-full rounded-xl border-2 border-stone-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-900 outline-none transition focus:border-stone-900"
          />
          <p className="mt-1.5 ml-1 text-[10.5px] font-semibold text-stone-500">
            Shown to customers right after they submit the form.
          </p>
        </div>

        <EditableFieldRow
          icon={MapPin}
          label="Address"
          enabled={fieldConfig.address.enabled}
          onToggle={() => toggleField('address')}
          mockContent={
            <div className="space-y-2">
              <div>
                <p className="text-[9px] font-bold text-stone-700 uppercase tracking-wider mb-1">Street Address</p>
                <div className="h-9 w-full bg-white border border-stone-200 rounded-xl px-3 text-xs text-stone-600 flex items-center">123 Main St</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] font-bold text-stone-700 uppercase tracking-wider mb-1">City</p>
                  <div className="h-9 w-full bg-white border border-stone-200 rounded-xl px-3 text-xs text-stone-600 flex items-center">New York</div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-stone-700 uppercase tracking-wider mb-1">Zip Code</p>
                  <div className="h-9 w-full bg-white border border-stone-200 rounded-xl px-3 text-xs text-stone-600 flex items-center">12345</div>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-stone-700 uppercase tracking-wider mb-1">Unit / Apt</p>
                <div className="h-9 w-full bg-white border border-stone-200 rounded-xl px-3 text-xs text-stone-600 flex items-center">Apt 4B</div>
              </div>
            </div>
          }
        />

        <EditableFieldRow
          icon={Calendar}
          label="Preferred Date"
          enabled={fieldConfig.preferred_date.enabled}
          onToggle={() => toggleField('preferred_date')}
          mockContent={<div className="h-10 w-full bg-white border border-stone-200 rounded-xl px-4 text-xs text-stone-600 flex items-center">MM/DD/YYYY</div>}
        />

        <EditableFieldRow
          icon={Clock}
          label="Preferred Time"
          enabled={fieldConfig.preferred_time.enabled}
          onToggle={() => toggleField('preferred_time')}
          mockContent={<div className="h-10 w-full bg-white border border-stone-200 rounded-xl px-4 text-xs text-stone-600 flex items-center">Morning, Afternoon...</div>}
        />

        <EditableFieldRow
          icon={Megaphone}
          label="Lead Source"
          enabled={fieldConfig.lead_source.enabled}
          onToggle={() => toggleField('lead_source')}
          mockContent={<div className="h-10 w-full bg-white border border-stone-200 rounded-xl px-4 text-xs text-stone-600 flex items-center">Selection dropdown...</div>}
        />

        <EditableFieldRow
          icon={ImageIcon}
          label="Photo Upload"
          enabled={fieldConfig.file_upload.enabled}
          onToggle={() => toggleField('file_upload')}
          locked={!canUsePhotoUpload}
          companySlug={companySlug}
          mockContent={
            <div className="w-full border-2 border-dashed border-emerald-300 rounded-xl flex flex-col items-center justify-center gap-1.5 py-4 bg-emerald-50/50">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-emerald-700" />
              </div>
              <p className="text-xs font-semibold text-stone-700">Click to upload photos</p>
              <p className="text-[10px] text-stone-600">JPG, PNG, or video</p>
            </div>
          }
        />

        {/* Custom Questions */}
        <div className="space-y-2.5 pt-2">
          <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider ml-1">Custom Questions</p>

          {customQuestions.map(q => (
            <div key={q.id} className="group relative rounded-lg border-2 border-stone-200 bg-white p-3.5 transition-all hover:border-stone-300">
              {/* Actions — always visible on touch devices (no hover on mobile) */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setNewQuestion(q); setEditingQuestionId(q.id); setShowAddQuestion(true); }}
                  className="p-1.5 bg-white border-2 border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                  aria-label="Edit question"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))}
                  className="p-1.5 bg-white border-2 border-rose-300 rounded-lg text-rose-700 hover:bg-rose-50"
                  aria-label="Delete question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2.5 pr-20">
                <HelpCircle className="w-4 h-4 text-stone-700 shrink-0" />
                <p className="text-xs font-bold text-stone-900 uppercase tracking-tight truncate">{q.label}</p>
              </div>

              {q.type === 'text' && (
                <div className="h-10 w-full bg-stone-50 border border-stone-200 rounded-lg flex items-center px-4 text-xs text-stone-600">
                  User will type text here...
                </div>
              )}

              {q.type === 'select' && (
                <div className="h-10 w-full bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between px-4 text-xs text-stone-600">
                  <span className="truncate">
                    {q.options?.length ? `${q.options.length} option${q.options.length === 1 ? '' : 's'}: ${q.options.slice(0, 3).join(', ')}${q.options.length > 3 ? '…' : ''}` : 'Select an option...'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-2" />
                </div>
              )}

              {q.type === 'checkbox' && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                    <div className="w-4 h-4 rounded border-2 border-stone-300" /> Yes
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                    <div className="w-4 h-4 rounded border-2 border-stone-300" /> No
                  </div>
                </div>
              )}
            </div>
          ))}

          {!canUseCustomQuestions ? (
            <div className="p-4 rounded-lg border-2 border-stone-200 bg-stone-50 flex items-center gap-3">
              <Lock className="w-4 h-4 text-stone-400 shrink-0" />
              <p className="text-[11px] font-semibold text-stone-500">Upgrade to add custom questions</p>
            </div>
          ) : showAddQuestion ? (
            <InlineQuestionEditor
              question={newQuestion}
              newOption={newOption}
              isEditing={!!editingQuestionId}
              onChange={setNewQuestion}
              onOptionChange={setNewOption}
              onSave={onSaveQuestion}
              onCancel={onCancelQuestion}
            />
          ) : (
            <button
              onClick={() => setShowAddQuestion(true)}
              className="w-full py-3 rounded-lg border-2 border-dashed border-stone-300 text-stone-600 text-[11px] font-bold uppercase tracking-wider hover:border-stone-500 hover:text-stone-800 transition-all"
            >
              + Add Custom Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── INLINE QUESTION EDITOR ─────────────────── */
function InlineQuestionEditor({
  question, newOption, isEditing, onChange, onOptionChange, onSave, onCancel
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
    <div className="rounded-lg border-2 border-stone-300 bg-stone-50 p-4 space-y-4">
      <input
        type="text"
        value={question.label}
        onChange={e => onChange({ ...question, label: e.target.value })}
        className="w-full px-4 py-2.5 rounded-lg border-2 border-stone-300 bg-white text-stone-900 placeholder-stone-400 outline-none transition text-sm font-semibold focus:border-stone-900"
        placeholder='e.g., "What is your budget range?"'
        autoFocus
      />

      <div className="grid grid-cols-3 gap-2">
        {[
          { val: 'text', label: 'Text' },
          { val: 'select', label: 'Dropdown' },
          { val: 'checkbox', label: 'Yes/No' },
        ].map(t => (
          <button
            key={t.val}
            onClick={() => onChange({ ...question, type: t.val as any, options: t.val === 'select' ? question.options : [] })}
            className={`py-2 rounded-lg border-2 text-[10px] font-bold uppercase tracking-wide transition-all ${
              question.type === t.val
                ? 'bg-stone-900 border-stone-900 text-white'
                : 'bg-white border-stone-300 text-stone-600 hover:border-stone-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {question.type === 'select' && (
        <div className="space-y-2 border-t-2 border-stone-200 pt-3">
          <AnimatePresence>
            {question.options?.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border-2 border-stone-200"
              >
                <span className="text-xs font-semibold text-stone-800">{opt}</span>
                <button
                  onClick={() => onChange({ ...question, options: question.options?.filter((_, idx) => idx !== i) })}
                  className="text-stone-400 hover:text-rose-600 transition-colors"
                  aria-label="Remove option"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={e => onOptionChange(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-lg border-2 border-stone-300 bg-white outline-none focus:border-stone-900 transition"
              placeholder="Add an option..."
              onKeyDown={e => {
                if (e.key === 'Enter' && newOption) {
                  onChange({ ...question, options: [...(question.options || []), newOption] });
                  onOptionChange('');
                }
              }}
            />
            <button
              onClick={() => { if (newOption) { onChange({ ...question, options: [...(question.options || []), newOption] }); onOptionChange(''); } }}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
        >
          {isEditing ? 'Update Question' : 'Add Question'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 bg-white border-2 border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}