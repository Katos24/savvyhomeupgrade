'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, AlertCircle, Check, Edit2, X,
  ChevronRight,
  User, Mail, Phone, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
  ExternalLink,
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
  const [previewStep, setPreviewStep] = useState<1 | 2 | 3>(2);

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

      {/* ── TOP BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-6 border-b border-slate-200 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Booking form</h1>
          <p className="text-sm text-slate-500 mt-0.5 leading-snug">
            Toggle fields directly on the form below — it's exactly what customers see.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors shrink-0 shadow-sm"
        >
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? 'Saving...' : 'Save changes'}
        </button>
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
        {([1, 2, 3] as const).map((step) => (
          <button
            key={step}
            onClick={() => setPreviewStep(step)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              previewStep === step
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 hover:text-slate-700'
            }`}
          >
            {step === 1 ? 'Step 1' : step === 2 ? 'Step 2 · editable' : 'Confirmation'}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-medium text-slate-500 uppercase tracking-wide">Live form</span>
      </div>

      {/* ── LIVE, EDITABLE FORM ── */}
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
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
            {previewStep === 3 && (
              <FormStep3
                message={ctaSuccessMessage}
                brandColor1={brandColor1}
                logoUrl={company.logo_url}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 border border-slate-300 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" /> Open real form
      </a>

      {/* ── CONFIRMATION MESSAGE ── */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mt-6">
        <div className="px-4 py-3.5 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-900">Confirmation message</span>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">What customers see on screen after they submit.</p>
        </div>
        <div className="px-4 py-3.5">
          <textarea
            value={ctaSuccessMessage}
            onChange={e => setCtaSuccessMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg outline-none resize-none text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder='e.g. "Thanks! We will review your request and reach out within 24 hours."'
          />
          <div className="mt-2 flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
            <Mail className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-800 leading-relaxed">
              A confirmation email is sent automatically on submit. This message only shows on screen.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveAll}
        disabled={loading}
        className="w-full py-3.5 mt-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  );
}

/* ─────────────────── SMALL TOGGLE SWITCH ─────────────────── */
function ToggleSwitch({ enabled, onToggle, ariaLabel }: { enabled: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`w-9 h-5 rounded-full relative transition-colors duration-150 shrink-0 ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <div
        className="absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform duration-150"
        style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}

/* ─────────────────── FIELD ROW — the field itself doubles as the editor ─────────────────── */
function EditableFieldRow({
  icon: Icon, label, mockContent, enabled, onToggle, locked, companySlug,
}: {
  icon: any; label: string; mockContent: React.ReactNode;
  enabled: boolean; onToggle?: () => void; locked?: boolean; companySlug?: string;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
        locked
          ? 'border-slate-200 bg-slate-50'
          : enabled
          ? 'border-blue-200 bg-blue-50/30'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-[9px] font-semibold mb-1 flex items-center gap-1 ${locked || !enabled ? 'text-slate-400' : 'text-slate-500'}`}>
          <Icon className="w-2.5 h-2.5" /> {label}
        </p>
        <div className={locked || !enabled ? 'opacity-40 pointer-events-none' : ''}>
          {mockContent}
        </div>
      </div>

      {locked ? (
        <a
          href={`/company/${companySlug}/settings/billing`}
          title="Upgrade to enable this field"
          className="shrink-0 mt-0.5 w-9 h-5 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
        >
          <Lock className="w-2.5 h-2.5 text-slate-500" />
        </a>
      ) : (
        <div className="shrink-0 mt-0.5">
          <ToggleSwitch enabled={enabled} onToggle={onToggle!} ariaLabel={`Toggle ${label}`} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────── STEP 1 (read-only mock — always-collected fields) ─────────────────── */
function FormStep1({ heading, categories, brandColor1, brandColor2, logoUrl }: {
  heading: string; categories: Category[]; brandColor1: string; brandColor2: string; logoUrl?: string | null;
}) {
  const inputClass = "w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-400 text-[10px] flex items-center gap-2";

  return (
    <div>
      <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        {logoUrl && <img src={logoUrl} alt="" className="h-6 w-auto object-contain mb-2" />}
        <h3 className="text-xs font-semibold leading-tight">{heading || 'Request a Free Quote'}</h3>
        <div className="flex items-center gap-2 mt-2.5 text-[9px]">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ color: brandColor1 }}>
            <span className="font-semibold text-[7px]">1</span>
          </div>
          <span className="text-white font-medium text-[8px]">Your Info</span>
          <div className="flex-1 h-px bg-white/25" />
          <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
            <span className="font-semibold text-[7px]">2</span>
          </div>
          <span className="text-white/60 font-medium text-[8px]">Details</span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg mb-1">
          <Lock className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Name, email, phone, service category, and project description are always collected — they can't be turned off.
          </p>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-slate-500 ml-1 mb-1">Full Name</p>
          <div className={inputClass}><User className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>John Smith</span></div>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-slate-500 ml-1 mb-1">Email</p>
          <div className={inputClass}><Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>john@example.com</span></div>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-slate-500 ml-1 mb-1">Phone</p>
          <div className={inputClass}><Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>(555) 123-4567</span></div>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-slate-500 ml-1 mb-1">Service Needed</p>
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 3).map((cat, i) => (
              <div
                key={i}
                className={`px-2 py-1 rounded-md text-[8px] font-semibold border ${
                  i === 0 ? 'text-white border-transparent' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
                style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
              >
                {cat.label}
              </div>
            ))}
            {categories.length > 3 && (
              <div className="px-2 py-1 rounded-md text-[8px] font-semibold border bg-slate-50 text-slate-400 border-slate-200">
                +{categories.length - 3}
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-slate-500 ml-1 mb-1">Tell Us About Your Project</p>
          <div className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-3 pt-2 text-slate-400 text-[10px]">
            Describe what you need done…
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── STEP 2 — EDITABLE: toggles live on the fields themselves ─────────────────── */
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
  const inputClass = "w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-400 text-[10px] flex items-center gap-2";

  return (
    <div>
      <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <div className="flex items-center gap-1.5 text-[8px] mb-2">
          <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center"><span className="font-semibold text-[7px]">1</span></div>
          <ChevronRight className="w-2 h-2 opacity-50" />
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ color: brandColor1 }}><span className="font-semibold text-[7px]">2</span></div>
        </div>
        <h3 className="text-xs font-semibold">Step 2 — extra details</h3>
        <p className="text-white/70 text-[9px] mt-0.5">Flip a switch to add or remove a field. None of these block submission.</p>
      </div>

      <div className="p-4 space-y-2">
        <EditableFieldRow
          icon={MapPin}
          label="Address"
          enabled={fieldConfig.address.enabled}
          onToggle={() => toggleField('address')}
          mockContent={<div className={inputClass}><MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>Start typing your address…</span></div>}
        />

        <EditableFieldRow
          icon={Calendar}
          label="Preferred Date"
          enabled={fieldConfig.preferred_date.enabled}
          onToggle={() => toggleField('preferred_date')}
          mockContent={<div className={inputClass}><Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>MM/DD/YYYY</span></div>}
        />

        <EditableFieldRow
          icon={Clock}
          label="Preferred Time"
          enabled={fieldConfig.preferred_time.enabled}
          onToggle={() => toggleField('preferred_time')}
          mockContent={<div className={inputClass}><Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>Morning, 2PM…</span></div>}
        />

        <EditableFieldRow
          icon={Megaphone}
          label="How Did You Hear About Us?"
          enabled={fieldConfig.lead_source.enabled}
          onToggle={() => toggleField('lead_source')}
          mockContent={
            <div className="flex flex-wrap gap-1">
              {['Google', 'Referral', 'Yard Sign', 'Other'].map((s, i) => (
                <div key={i} className="px-2 py-1 rounded-md text-[8px] font-semibold border bg-white text-slate-500 border-slate-200">{s}</div>
              ))}
            </div>
          }
        />

        <EditableFieldRow
          icon={ImageIcon}
          label="Photo / Video Upload"
          enabled={fieldConfig.file_upload.enabled}
          onToggle={() => toggleField('file_upload')}
          locked={!canUsePhotoUpload}
          companySlug={companySlug}
          mockContent={
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-2.5 text-center bg-white">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
              <p className="text-[9px] text-slate-400">Click or drag photos here</p>
            </div>
          }
        />

        {/* CUSTOM QUESTIONS — inline in the form itself */}
        {customQuestions.map(q => (
          <div key={q.id} className="group relative rounded-xl border border-blue-200 bg-blue-50/30 px-3 py-2.5">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <button
                onClick={() => { setNewQuestion(q); setEditingQuestionId(q.id); setShowAddQuestion(true); }}
                className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                aria-label="Edit question"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Delete question"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[9px] font-semibold text-slate-500 mb-1 flex items-center gap-1 pr-10">
              <HelpCircle className="w-2.5 h-2.5" /> {q.label}
            </p>
            {q.type === 'text' && (
              <div className={inputClass}><span>Your answer…</span></div>
            )}
            {q.type === 'select' && (
              <div className="flex flex-wrap gap-1">
                {(q.options?.length ? q.options : ['Option']).slice(0, 3).map((opt, i) => (
                  <div key={i} className="px-2 py-1 rounded-md text-[8px] font-semibold border bg-white text-slate-500 border-slate-200">{opt}</div>
                ))}
              </div>
            )}
            {q.type === 'checkbox' && (
              <div className="flex gap-1.5">
                <div className="flex-1 flex items-center gap-1.5 h-9 px-3 border border-slate-200 rounded-xl text-[9px] text-slate-400 bg-white">
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-300" /> Yes
                </div>
                <div className="flex-1 flex items-center gap-1.5 h-9 px-3 border border-slate-200 rounded-xl text-[9px] text-slate-400 bg-white">
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-300" /> No
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ADD QUESTION — inline "+" or inline editor */}
        {!canUseCustomQuestions ? (
          <a
            href={`/company/${companySlug}/settings/billing`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <Lock className="w-3 h-3 shrink-0" />
            <span className="text-[10px] font-medium">Custom questions — upgrade to enable</span>
          </a>
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
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-slate-500 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Add a question</span>
          </button>
        )}

        <button
          className="w-full py-2 text-white rounded-xl font-semibold text-[10px] shadow-sm mt-1"
          style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
        >
          Submit Details
        </button>
      </div>
    </div>
  );
}


/* ─────────────────── INLINE QUESTION EDITOR (compact, sits inline in the form) ─────────────────── */
function InlineQuestionEditor({ question, newOption, isEditing, onChange, onOptionChange, onSave, onCancel }: {
  question: CustomQuestion; newOption: string; isEditing: boolean;
  onChange: (q: CustomQuestion) => void; onOptionChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-2.5">
      <input
        type="text" value={question.label}
        onChange={e => onChange({ ...question, label: e.target.value })}
        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-xs font-medium"
        placeholder='e.g. "What is your budget range?"'
        autoFocus
      />
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { val: 'text', label: 'Text' },
          { val: 'select', label: 'Dropdown' },
          { val: 'checkbox', label: 'Yes / No' },
        ].map(t => (
          <button
            key={t.val}
            onClick={() => onChange({ ...question, type: t.val as any, options: t.val === 'select' ? question.options : [] })}
            className={`py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${
              question.type === t.val
                ? 'bg-blue-700 border-blue-700 text-white'
                : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {question.type === 'select' && (
        <div className="space-y-1.5">
          <AnimatePresence>
            {question.options?.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200"
              >
                <span className="text-xs text-slate-700">{opt}</span>
                <button onClick={() => onChange({ ...question, options: question.options?.filter((_, idx) => idx !== i) })} className="text-slate-400 hover:text-red-600 transition-colors" aria-label="Remove option">
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex gap-1.5">
            <input
              type="text" value={newOption}
              onChange={e => onOptionChange(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 transition"
              placeholder="Add option…"
              onKeyDown={e => {
                if (e.key === 'Enter' && newOption) {
                  onChange({ ...question, options: [...(question.options || []), newOption] });
                  onOptionChange('');
                }
              }}
            />
            <button
              onClick={() => { if (newOption) { onChange({ ...question, options: [...(question.options || []), newOption] }); onOptionChange(''); } }}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1.5 pt-0.5">
        <button
          onClick={onSave}
          className="flex-1 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          {isEditing ? 'Update question' : 'Add question'}
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── STEP 3 (confirmation preview, still read-only) ─────────────────── */
function FormStep3({ message, brandColor1, logoUrl }: {
  message: string; brandColor1: string; logoUrl?: string | null;
}) {
  return (
    <div className="p-6 bg-slate-50">
      <div className="w-full bg-white rounded-3xl p-5 text-center shadow-sm border border-slate-200">
        {logoUrl ? (
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-slate-50 border border-slate-200">
            <img src={logoUrl} alt="" className="w-9 h-9 object-contain" />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: brandColor1 }}>
            <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        )}

        <h3 className="text-sm font-semibold text-slate-900 mb-1.5">Request received!</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {message || "We've got your request and will be in touch soon."}
        </p>

        <div className="mt-4 space-y-2 text-left">
          {[
            { label: 'Check your email', sub: 'Confirmation sent to your inbox', Icon: Mail },
            { label: "We'll reach out shortly", sub: 'Our team reviews every request', Icon: Clock },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center bg-white border border-slate-200">
                <s.Icon className="w-3 h-3 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-700">{s.label}</p>
                <p className="text-[9px] text-slate-500">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-slate-400 mt-4">Powered by Lead2Project</p>
      </div>
    </div>
  );
}