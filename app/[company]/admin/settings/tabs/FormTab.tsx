'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, AlertCircle, Check, Edit2, X,
  Settings2, ChevronRight,
  User, Mail, Phone, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
  ExternalLink, Sparkles,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
import { InlineLockBanner } from '@/components/LockedTab';
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
const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

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
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('preview');

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${company.slug}`
    : `https://lead2project.com/${company.slug}`;

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

    const attempt = async () => {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to update settings');
      return result;
    };

    try {
      try {
        await attempt();
      } catch (firstErr) {
        await new Promise(r => setTimeout(r, 1500));
        await attempt();
      }
      setStatus({ type: 'success', message: 'Form settings saved!' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Connection interrupted — please try again.',
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

  /* ============================================================================
   DROP-IN REPLACEMENT SCOPE
   This replaces your `return ( ... )` statement and the four helper
   components below it: Section, FieldToggle, QuestionEditor,
   PreviewStep1, PreviewStep2, PreviewStep3.

   Nothing above this point in your file changes — same imports, same state
   (company, status, mobileTab/setMobileTab, previewStep/setPreviewStep,
   categories, fieldConfig, toggleField, customQuestions/setCustomQuestions,
   showAddQuestion/setShowAddQuestion, newQuestion/setNewQuestion,
   newOption/setNewOption, editingQuestionId/setEditingQuestionId,
   addOrUpdateQuestion, resetForm, ctaSuccessMessage/setCtaSuccessMessage,
   handleSaveAll, loading, publicUrl, brandColor1, brandColor2,
   canUseCustomQuestions, canUsePhotoUpload, getCtaHeading, spring),
   same types (Category, CustomQuestion, FieldConfig).
   ============================================================================ */

  // Small derived summary — real counts, not decoration.
  const optionalOnCount = [
    fieldConfig.address.enabled,
    fieldConfig.preferred_date.enabled,
    fieldConfig.preferred_time.enabled,
    fieldConfig.lead_source.enabled,
    canUsePhotoUpload && fieldConfig.file_upload.enabled,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6">
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
            Configure what customers see, then confirm it in the live preview.
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
          Save changes
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

      {/* ── MOBILE TAB BAR ── (unified active style — both tabs now use the same
          selected/unselected treatment, since two different colors for two
          tabs of equal importance was the bug, not a feature) */}
      <div className="flex lg:hidden bg-slate-100 rounded-lg p-1 mb-6 border border-slate-200">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors ${
            mobileTab === 'edit'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-colors ${
            mobileTab === 'preview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Preview
        </button>
      </div>

      {/* ── MAIN GRID — config left, preview right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ── LEFT: CONFIG ── */}
        <div className={`lg:col-span-7 space-y-4 order-1 lg:order-1 ${mobileTab === 'edit' ? 'block' : 'hidden lg:block'}`}>

          {/* Summary strip — states real facts instead of making someone count toggles */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              {optionalOnCount} of 5 optional fields on
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {customQuestions.length} custom question{customQuestions.length === 1 ? '' : 's'}
            </span>
            <span className="ml-auto text-slate-400 font-medium capitalize">{company.plan_tier ?? 'free'} plan</span>
          </div>

          {/* STEP 1 — always collected */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Step 1 · Always collected</span>
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-1.5">
              {['Full name', 'Email', 'Phone', 'Service category', 'Project description'].map(f => (
                <span key={f} className="text-xs font-medium text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">{f}</span>
              ))}
            </div>
          </div>

          {/* STEP 2 — Optional fields */}
          <Section
            icon={<Settings2 className="w-4 h-4" />}
            title="Step 2 — extra details"
            subtitle="Toggle the fields customers see after submitting step 1. None of these block submission."
            badge="You control these"
          >
            <div>
              <FieldToggle
                icon={MapPin}
                label="Service address"
                description="Street address with autocomplete"
                enabled={fieldConfig.address.enabled}
                onToggle={() => toggleField('address')}
              />
              <FieldToggle
                icon={Calendar}
                label="Preferred date"
                description="Customer suggests a date — you confirm the real schedule"
                enabled={fieldConfig.preferred_date.enabled}
                onToggle={() => toggleField('preferred_date')}
              />
              <FieldToggle
                icon={Clock}
                label="Preferred time"
                description="Morning, afternoon, or a specific time"
                enabled={fieldConfig.preferred_time.enabled}
                onToggle={() => toggleField('preferred_time')}
              />
              <FieldToggle
                icon={Megaphone}
                label="How did you hear about us?"
                description="Google, referral, social media, etc."
                enabled={fieldConfig.lead_source.enabled}
                onToggle={() => toggleField('lead_source')}
              />
              {canUsePhotoUpload ? (
                <FieldToggle
                  icon={ImageIcon}
                  label="Photo / video upload"
                  description="Customers attach job site photos — useful for quotes"
                  enabled={fieldConfig.file_upload.enabled}
                  onToggle={() => toggleField('file_upload')}
                  last
                />
              ) : (
                <InlineLockBanner
                  title="Photo & video uploads"
                  description="Let customers attach job site photos. Available on Basic."
                  planLabel="Basic"
                  priceLabel="$49.99/mo"
                  companySlug={company.slug}
                />
              )}
            </div>
          </Section>

          {/* CUSTOM QUESTIONS */}
          <Section
            icon={<Sparkles className="w-4 h-4" />}
            title="Your own questions"
            subtitle="Add custom questions that appear on step 2 — text, dropdown, or yes/no."
            action={canUseCustomQuestions && !showAddQuestion ? (
              <button
                onClick={() => setShowAddQuestion(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-semibold transition-colors border border-blue-100"
              >
                <Plus className="w-3.5 h-3.5" /> Add question
              </button>
            ) : null}
          >
            {!canUseCustomQuestions ? (
              <InlineLockBanner
                title="Custom questions"
                description="Ask customers anything — budget range, gate codes, pet info. Available on Basic."
                planLabel="Basic"
                priceLabel="$49.99/mo"
                companySlug={company.slug}
              />
            ) : (
              <AnimatePresence mode="sync">
                {showAddQuestion ? (
                  <motion.div key="editor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring}>
                    <QuestionEditor
                      question={newQuestion}
                      newOption={newOption}
                      isEditing={!!editingQuestionId}
                      onChange={setNewQuestion}
                      onOptionChange={setNewOption}
                      onSave={addOrUpdateQuestion}
                      onCancel={resetForm}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {customQuestions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {customQuestions.map((q, i) => (
                          <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group relative bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
                          >
                            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setNewQuestion(q); setEditingQuestionId(q.id); setShowAddQuestion(true); }}
                                className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                aria-label="Edit question"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                aria-label="Delete question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-sm font-semibold text-slate-900 pr-16 truncate">{q.label}</p>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                {q.type === 'select' ? 'Dropdown' : q.type === 'checkbox' ? 'Yes / No' : 'Text'}
                              </span>
                              {q.type === 'select' && q.options?.length ? (
                                <span className="text-[11px] text-slate-500">{q.options.length} options</span>
                              ) : null}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center border border-dashed border-slate-200 rounded-lg">
                        <p className="text-sm font-medium text-slate-500">No custom questions yet</p>
                        <p className="text-xs text-slate-400 mt-1">e.g. "Budget range?", "Gate code?", "Pet on site?"</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </Section>

          {/* CONFIRMATION MESSAGE */}
          <Section
            icon={<Check className="w-4 h-4" />}
            title="Confirmation message"
            subtitle="What customers see on screen after they submit."
          >
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
          </Section>

          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {/* ── RIGHT: LIVE PREVIEW ── */}
        <div className={`lg:col-span-5 order-2 lg:order-2 ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-6 space-y-3">

            <div className="flex items-center gap-1.5">
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
                  {step === 1 ? 'Step 1' : step === 2 ? 'Step 2' : 'Done'}
                </button>
              ))}
              <span className="ml-auto text-[11px] font-medium text-slate-500 uppercase tracking-wide">Customer view</span>
            </div>

            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-h-[680px]">
              <div className="overflow-y-auto h-full" style={{ scrollbarWidth: 'none' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewStep}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={spring}
                    className="h-full"
                  >
                    {previewStep === 1 && (
                      <PreviewStep1
                        heading={getCtaHeading()}
                        categories={categories}
                        brandColor1={brandColor1}
                        brandColor2={brandColor2}
                        logoUrl={company.logo_url}
                        companyName={company.name}
                      />
                    )}
                    {previewStep === 2 && (
                      <PreviewStep2
                        fieldConfig={fieldConfig}
                        customQuestions={canUseCustomQuestions ? customQuestions : []}
                        brandColor1={brandColor1}
                        brandColor2={brandColor2}
                        companyName={company.name}
                        canUsePhotoUpload={canUsePhotoUpload}
                      />
                    )}
                    {previewStep === 3 && (
                      <PreviewStep3
                        message={ctaSuccessMessage}
                        brandColor1={brandColor1}
                        brandColor2={brandColor2}
                        companyName={company.name}
                        logoUrl={company.logo_url}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <a
              href={publicUrl}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-300 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open real form
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────── SECTION WRAPPER — enterprise card, no color-per-icon noise ─────────────────── */
function Section({ icon, title, subtitle, badge, action, children }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">{title}</span>
            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-4 py-3.5">
        {children}
      </div>
    </div>
  );
}

/* ─────────────────── FIELD TOGGLE — enabled state is structural, not just a switch color ─────────────────── */
function FieldToggle({ icon: Icon, label, description, enabled, onToggle, last }: {
  icon: any; label: string; description: string;
  enabled: boolean; onToggle: () => void; last?: boolean;
}) {
  return (
    <div
      role="switch"
      aria-checked={enabled}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
      className={`flex items-center gap-3 -mx-4 px-4 py-3 cursor-pointer transition-colors border-l-[3px] ${
        last ? '' : 'border-b border-slate-100'
      } ${
        enabled ? 'border-l-blue-600 bg-blue-50/40 hover:bg-blue-50' : 'border-l-transparent hover:bg-slate-50'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${enabled ? 'text-blue-700' : 'text-slate-400'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${enabled ? 'text-slate-900' : 'text-slate-600'}`}>{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="shrink-0">
        <div className={`w-10 h-6 rounded-full relative transition-colors duration-150 ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
          <div
            className="absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-150"
            style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── QUESTION EDITOR ─────────────────── */
function QuestionEditor({ question, newOption, isEditing, onChange, onOptionChange, onSave, onCancel }: {
  question: CustomQuestion; newOption: string; isEditing: boolean;
  onChange: (q: CustomQuestion) => void; onOptionChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Question label</label>
        <input
          type="text" value={question.label}
          onChange={e => onChange({ ...question, label: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm font-medium"
          placeholder='e.g. "What is your budget range?"'
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Input type</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: 'text', label: 'Text', desc: 'Open answer' },
            { val: 'select', label: 'Dropdown', desc: 'Pick one' },
            { val: 'checkbox', label: 'Yes / No', desc: 'Toggle' },
          ].map(t => (
            <button
              key={t.val}
              onClick={() => onChange({ ...question, type: t.val as any, options: t.val === 'select' ? question.options : [] })}
              className={`py-3 rounded-lg border text-xs font-semibold transition-colors flex flex-col items-center gap-0.5 ${
                question.type === t.val
                  ? 'bg-blue-700 border-blue-700 text-white'
                  : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
              }`}
            >
              {t.label}
              <span className={`text-[10px] font-normal ${question.type === t.val ? 'text-blue-100' : 'text-slate-400'}`}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {question.type === 'select' && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600">Options</label>
          <AnimatePresence>
            {question.options?.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-slate-200"
              >
                <span className="text-sm text-slate-700">{opt}</span>
                <button onClick={() => onChange({ ...question, options: question.options?.filter((_, idx) => idx !== i) })} className="text-slate-400 hover:text-red-600 transition-colors" aria-label="Remove option">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex gap-2">
            <input
              type="text" value={newOption}
              onChange={e => onOptionChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 transition"
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
              className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {isEditing ? 'Update question' : 'Add question'}
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── PREVIEW STEP 1 ─────────────────── */
function PreviewStep1({ heading, categories, brandColor1, brandColor2, logoUrl, companyName }: {
  heading: string; categories: Category[]; brandColor1: string; brandColor2: string;
  logoUrl?: string | null; companyName?: string;
}) {
  const inputClass = "w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-400 text-[10px] flex items-center gap-2";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <div className="w-6 h-0.5 bg-white/25 rounded-full mx-auto mb-3" />
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
        <button
          className="w-full py-2 text-white rounded-xl font-semibold text-[10px] shadow-sm mt-1"
          style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── PREVIEW STEP 2 ─────────────────── */
function PreviewStep2({ fieldConfig, customQuestions, brandColor1, brandColor2, companyName, canUsePhotoUpload }: {
  fieldConfig: FieldConfig; customQuestions: CustomQuestion[];
  brandColor1: string; brandColor2: string;
  companyName?: string; canUsePhotoUpload: boolean;
}) {
  const inputClass = "w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-400 text-[10px] flex items-center gap-2";
  const labelClass = "text-[9px] font-semibold text-slate-500 ml-1 mb-1";

  const hasAnything = fieldConfig.address.enabled || fieldConfig.preferred_date.enabled ||
    fieldConfig.preferred_time.enabled || fieldConfig.lead_source.enabled ||
    (canUsePhotoUpload && fieldConfig.file_upload.enabled) || customQuestions.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <div className="flex items-center gap-1.5 text-[8px] mb-2">
          <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center"><span className="font-semibold text-[7px]">1</span></div>
          <ChevronRight className="w-2 h-2 opacity-50" />
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ color: brandColor1 }}><span className="font-semibold text-[7px]">2</span></div>
        </div>
        <p className="text-[9px] text-white/60 mb-0.5">Step 2 of 2</p>
        <h3 className="text-xs font-semibold">Your request is saved.</h3>
        <p className="text-white/70 text-[9px] mt-0.5">A few more details — all optional.</p>
      </div>

      <div className="p-4 space-y-2.5">
        {!hasAnything && (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
            <p className="text-[11px] font-medium text-slate-400">No optional fields enabled</p>
            <p className="text-[10px] text-slate-400 mt-1">Toggle fields on the left to see them here</p>
          </div>
        )}

        {fieldConfig.address.enabled && (
          <>
            <div>
              <p className={labelClass}>Address</p>
              <div className={inputClass}><MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>Start typing your address…</span></div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div><p className={labelClass}>Zip Code</p><div className={inputClass}><span>12345</span></div></div>
              <div><p className={labelClass}>Unit / Apt</p><div className={inputClass}><span>Apt 4B</span></div></div>
            </div>
          </>
        )}

        {(fieldConfig.preferred_date.enabled || fieldConfig.preferred_time.enabled) && (
          <div className={`grid gap-1.5 ${fieldConfig.preferred_date.enabled && fieldConfig.preferred_time.enabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {fieldConfig.preferred_date.enabled && (
              <div><p className={labelClass}>Preferred Date</p><div className={inputClass}><Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>MM/DD/YYYY</span></div></div>
            )}
            {fieldConfig.preferred_time.enabled && (
              <div><p className={labelClass}>Preferred Time</p><div className={inputClass}><Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>Morning, 2PM…</span></div></div>
            )}
          </div>
        )}

        {customQuestions.map(q => (
          <div key={q.id}>
            <p className={labelClass}>{q.label}</p>
            {q.type === 'text' && (
              <div className={inputClass}><HelpCircle className="w-2.5 h-2.5 text-slate-400 shrink-0" /><span>Your answer…</span></div>
            )}
            {q.type === 'select' && (
              <div className="flex flex-wrap gap-1">
                {q.options?.slice(0, 3).map((opt, i) => (
                  <div key={i} className={`px-2 py-1 rounded-md text-[8px] font-semibold border ${i === 0 ? 'text-white border-transparent' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                    style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
            {q.type === 'checkbox' && (
              <div className="flex gap-1.5">
                <div className="flex-1 flex items-center gap-1.5 h-9 px-3 border border-slate-200 rounded-xl text-[9px] text-slate-400 bg-slate-50">
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-300" /> Yes
                </div>
                <div className="flex-1 flex items-center gap-1.5 h-9 px-3 border border-slate-200 rounded-xl text-[9px] text-slate-400 bg-slate-50">
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-300" /> No
                </div>
              </div>
            )}
          </div>
        ))}

        {fieldConfig.lead_source.enabled && (
          <div>
            <p className={labelClass}>How Did You Hear About Us?</p>
            <div className="flex flex-wrap gap-1">
              {['Google', 'Referral', 'Yard Sign', 'Other'].map((s, i) => (
                <div key={i} className={`px-2 py-1 rounded-md text-[8px] font-semibold border ${i === 0 ? 'text-white border-transparent' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                  style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {canUsePhotoUpload && fieldConfig.file_upload.enabled && (
          <div>
            <p className={labelClass}>Photos or Videos</p>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50">
              <ImageIcon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400">Click or drag photos here</p>
            </div>
          </div>
        )}

        {hasAnything && (
          <button className="w-full py-2 text-white rounded-xl font-semibold text-[10px] shadow-sm" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
            Submit Details
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── PREVIEW STEP 3 ─────────────────── */
function PreviewStep3({ message, brandColor1, brandColor2, companyName, logoUrl }: {
  message: string; brandColor1: string; brandColor2: string; companyName?: string; logoUrl?: string | null;
}) {
  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-slate-50 rounded-3xl">
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