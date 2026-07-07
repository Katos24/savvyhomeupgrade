'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, AlertCircle, Check, Edit2, X,
  ChevronDown, Eye, Tag,
  User, Mail, Phone, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
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

export default function FormTab({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'basic') as PlanTier;
  const canUsePhotoUpload     = can(planTier, 'customer_video_upload');
  const canUseCustomQuestions = can(planTier, 'custom_form_questions');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);
  const [previewStep, setPreviewStep] = useState<1 | 2>(1);

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

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 sm:px-6">
      {(company.plan_tier === 'free') && (
        <SettingsUpgradeBanner
          planLabel="Basic"
          price="$49.99/mo"
          message="Your booking form is live. Upgrade to add custom branding, photo uploads, and custom questions."
          companySlug={company.slug}
        />
      )}

      {/* ── TOP BAR (mobile: buttons go full-width side by side under the title) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-6 border-b border-slate-200 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Booking form</h1>
          <p className="text-sm text-slate-500 mt-0.5 leading-snug">
            Toggle fields directly on the form below — it's exactly what customers see.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            title="View live form"
          >
            <Eye className="w-4 h-4" />
            View
          </a>

          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* ── STATUS TOAST ── */}
      <AnimatePresence>
        {status.type && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border mb-4 text-sm font-medium ${
              status.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {status.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STEP SWITCHER ── */}
      <div className="flex items-center gap-1.5 mb-3">
        {([1, 2] as const).map((step) => (
          <button
            key={step}
            onClick={() => setPreviewStep(step)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              previewStep === step
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
          >
            {step === 1 ? 'Step 1' : 'Step 2 · editable'}
          </button>
        ))}
      </div>

      {/* ── LIVE, EDITABLE FORM ── */}
<div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full max-w-full sm:max-w-[480px] mx-auto">        <AnimatePresence mode="wait">
          <motion.div
            key={previewStep}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={spring}
          >
            {previewStep === 1 && (
              <FormStep1
                heading={getCtaHeading()}
                categories={categories}
                brandColor1={brandColor1}
                brandColor2={brandColor2}
                logoUrl={company.logo_url}
              />
            )}
            {previewStep === 2 && (
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
            )}
          </motion.div>
        </AnimatePresence>
      </div>

   <button
        onClick={handleSaveAll}
        disabled={loading}
        className="w-full py-3.5 mt-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? 'Saving...' : 'Save changes'}
      </button>

      {/* ── SHARE YOUR LINK IDEAS ── */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Get the word out
        </p>
        <p className="text-sm text-slate-600 mb-4">
          Your booking link works anywhere you can put a link or a QR code.
        </p>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 mb-5">
          <code className="text-[12px] font-mono text-slate-700 truncate flex-1">{publicUrl}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 1800);
            }}
            className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition"
          >
            {linkCopied ? 'Copied' : 'Copy'}
          </button>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ShareIdeaCard
            title="Google Business Profile"
            description="Add your booking link to your Google Business Profile website field — it's often the first place customers look before they even reach your site."
          />
          <ShareIdeaCard
            title="Social media"
            description="Add it to your Instagram or Facebook bio, or drop it in a post."
          />
          <ShareIdeaCard
            title="Your website"
            description="Link it from a 'Get a Quote' or 'Book Now' button."
          />
          <ShareIdeaCard
            title="Flyers & signs"
            description="Print it — or the QR code from your Overview tab — on flyers, yard signs, or door hangers."
          />
          <ShareIdeaCard
            title="Vehicle & business cards"
            description="A QR code on your truck magnet or business card lets people book on the spot."
          />
        </div>
      </div>
    </div>
  );
}

function ShareIdeaCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <p className="text-[12px] font-semibold text-slate-800">{title}</p>
      <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">{description}</p>
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
      className={`w-10 h-6 rounded-full relative transition-all duration-300 shrink-0 shadow-inner ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <div
        className="absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-300"
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
      className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        locked
          ? 'border-slate-100 bg-slate-50'
          : active
          ? 'border-blue-500 bg-blue-50/30'
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* Header row — this is ALL a disabled field shows */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
        <p className={`flex-1 min-w-0 truncate text-[10px] font-bold uppercase tracking-wider ${
          active ? 'text-slate-800' : 'text-slate-400'
        }`}>
          {label}
        </p>
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 ${
          locked ? 'bg-slate-100 text-slate-400'
          : active ? 'bg-blue-100 text-blue-700'
          : 'bg-slate-100 text-slate-400'
        }`}>
          {locked ? 'Locked' : active ? 'Active' : 'Off'}
        </span>
        {locked ? (
          <a
            href={`/company/${companySlug}/settings/billing`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
          >
            <Lock className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-tight">Upgrade</span>
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

/* ─────────────────── STEP 1 (read-only mock — always-collected fields) ─────────────────── */
function FormStep1({ heading, categories, brandColor1, brandColor2, logoUrl }: {
  heading: string; categories: Category[]; brandColor1: string; brandColor2: string; logoUrl?: string | null;
}) {
  const labelClass = "text-[9px] font-bold text-slate-800 uppercase tracking-wider ml-1 mb-1.5";
  const inputClass = "w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-slate-800 text-[11px] flex items-center gap-3 shadow-sm";

  return (
    <div className="bg-white">
      <div className="p-5 sm:p-6 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        {logoUrl && <img src={logoUrl} alt="" className="h-8 w-auto object-contain mb-4" />}
        <h3 className="text-lg font-bold tracking-tight text-white">{heading || 'Request a Free Quote'}</h3>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Lock className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-slate-800">Always collected</p>
            <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">Name, email, phone, category, and description are essential.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className={labelClass}>Full Name</p>
            <div className={inputClass}><User className="w-3.5 h-3.5 text-slate-400 shrink-0" />John Smith</div>
          </div>

          {/* Stacks on phones, two columns from sm up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className={labelClass}>Email</p>
              <div className={inputClass}><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />john@example.com</div>
            </div>
            <div>
              <p className={labelClass}>Phone</p>
              <div className={inputClass}><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />(555) 123-4567</div>
            </div>
          </div>

          <div>
            <p className={labelClass}>Service Needed</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${
                    i === 0 ? 'text-white border-transparent' : 'bg-white text-slate-800 border-slate-200'
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
            <div className="w-full h-20 bg-white border border-slate-200 rounded-xl p-4 text-slate-600 text-[11px] shadow-sm">
              Describe your project here...
            </div>
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
}) {
  return (
    <div className="bg-white">
      <div className="p-5 sm:p-6 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <h3 className="text-lg font-bold tracking-tight">Step 2: Extra Details</h3>
        <p className="text-white/80 text-[11px] mt-1 font-medium">Toggle fields on to see their preview. Off fields stay collapsed.</p>
      </div>

      <div className="p-4 sm:p-5 space-y-2.5">
        <EditableFieldRow
          icon={MapPin}
          label="Address"
          enabled={fieldConfig.address.enabled}
          onToggle={() => toggleField('address')}
          mockContent={
            <div className="space-y-2">
              <div>
                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Street Address</p>
                <div className="h-9 w-full bg-white border border-slate-200 rounded-xl px-3 text-xs text-slate-600 flex items-center">123 Main St</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">City</p>
                  <div className="h-9 w-full bg-white border border-slate-200 rounded-xl px-3 text-xs text-slate-600 flex items-center">New York</div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Zip Code</p>
                  <div className="h-9 w-full bg-white border border-slate-200 rounded-xl px-3 text-xs text-slate-600 flex items-center">12345</div>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Unit / Apt</p>
                <div className="h-9 w-full bg-white border border-slate-200 rounded-xl px-3 text-xs text-slate-600 flex items-center">Apt 4B</div>
              </div>
            </div>
          }
        />

        <EditableFieldRow
          icon={Calendar}
          label="Preferred Date"
          enabled={fieldConfig.preferred_date.enabled}
          onToggle={() => toggleField('preferred_date')}
          mockContent={<div className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs text-slate-600 flex items-center">MM/DD/YYYY</div>}
        />

        <EditableFieldRow
          icon={Clock}
          label="Preferred Time"
          enabled={fieldConfig.preferred_time.enabled}
          onToggle={() => toggleField('preferred_time')}
          mockContent={<div className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs text-slate-600 flex items-center">Morning, Afternoon...</div>}
        />

        <EditableFieldRow
          icon={Megaphone}
          label="Lead Source"
          enabled={fieldConfig.lead_source.enabled}
          onToggle={() => toggleField('lead_source')}
          mockContent={<div className="h-10 w-full bg-white border border-slate-200 rounded-xl px-4 text-xs text-slate-600 flex items-center">Selection dropdown...</div>}
        />

        <EditableFieldRow
          icon={ImageIcon}
          label="Photo Upload"
          enabled={fieldConfig.file_upload.enabled}
          onToggle={() => toggleField('file_upload')}
          locked={!canUsePhotoUpload}
          companySlug={companySlug}
          mockContent={
            <div className="w-full border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center gap-1.5 py-4 bg-blue-50/50">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Click to upload photos</p>
              <p className="text-[10px] text-slate-600">JPG, PNG, or video</p>
            </div>
          }
        />

        {/* Custom Questions */}
        <div className="space-y-2.5 pt-2">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Custom Questions</p>

          {customQuestions.map(q => (
            <div key={q.id} className="group relative rounded-2xl border-2 border-blue-100 bg-white p-3.5 shadow-sm transition-all hover:border-blue-200">
              {/* Actions — always visible on touch devices (no hover on mobile) */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setNewQuestion(q); setEditingQuestionId(q.id); setShowAddQuestion(true); }}
                  className="p-1.5 bg-white border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 shadow-sm"
                  aria-label="Edit question"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))}
                  className="p-1.5 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 shadow-sm"
                  aria-label="Delete question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2.5 pr-20">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">{q.label}</p>
              </div>

              {q.type === 'text' && (
                <div className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg flex items-center px-4 text-xs text-slate-600">
                  User will type text here...
                </div>
              )}

              {q.type === 'select' && (
                <div className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between px-4 text-xs text-slate-600">
                  <span className="truncate">
                    {q.options?.length ? `${q.options.length} option${q.options.length === 1 ? '' : 's'}: ${q.options.slice(0, 3).join(', ')}${q.options.length > 3 ? '…' : ''}` : 'Select an option...'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                </div>
              )}

              {q.type === 'checkbox' && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <div className="w-4 h-4 rounded border-2 border-slate-300" /> Yes
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <div className="w-4 h-4 rounded border-2 border-slate-300" /> No
                  </div>
                </div>
              )}
            </div>
          ))}

          {!canUseCustomQuestions ? (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <p className="text-[11px] font-medium text-slate-500">Upgrade to add custom questions</p>
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
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider hover:border-blue-400 hover:text-blue-600 transition-all"
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
    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4 space-y-4 shadow-sm">
      <input
        type="text"
        value={question.label}
        onChange={e => onChange({ ...question, label: e.target.value })}
        className="w-full px-4 py-2.5 rounded-xl border border-blue-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm font-semibold"
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
            className={`py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all ${
              question.type === t.val
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {question.type === 'select' && (
        <div className="space-y-2 border-t border-blue-100 pt-3">
          <AnimatePresence>
            {question.options?.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200"
              >
                <span className="text-xs font-medium text-slate-700">{opt}</span>
                <button
                  onClick={() => onChange({ ...question, options: question.options?.filter((_, idx) => idx !== i) })}
                  className="text-slate-400 hover:text-red-500 transition-colors"
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
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-400 transition"
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
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
        >
          {isEditing ? 'Update Question' : 'Add Question'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}