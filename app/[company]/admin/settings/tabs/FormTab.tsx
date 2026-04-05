'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, AlertCircle, Check, Edit2, X,
  Settings2, Eye, Layout, Save, ChevronRight,
  User, Mail, Phone, Building, FileText, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
  ToggleLeft, ToggleRight, ExternalLink, Link2, Sparkles,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
import { InlineLockBanner } from '@/components/LockedTab';
import type { Transition } from 'framer-motion';


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


const spring: Transition = { type: 'spring', damping: 28, stiffness: 320 };const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

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
  const [urlCopied, setUrlCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${company.slug}`
    : `https://yourdomain.com/${company.slug}`;

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
        // Wait 1.5s then retry once
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

  return (
    <div className="max-w-7xl mx-auto pb-20">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Booking Form</h1>
<p className="text-sm text-gray-400 mt-0.5">This is the form your customers see when they visit your public link.</p>        </div>
        <div className="flex items-center gap-3">
     

          {/* Save */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveAll}
            disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save className="w-3.5 h-3.5" />
            }
            Save
          </motion.button>
        </div>
      </div>

      {/* ── STATUS TOAST ── */}
      <AnimatePresence>
        {status.type && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 text-sm font-medium ${
              status.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : 'bg-red-50 border-red-100 text-red-700'
            }`}
          >
            {status.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

{/* ── PUBLIC URL BANNER ── */}
    <div className="flex items-center gap-4 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm font-semibold text-slate-500">Your customer form</p>
        </div>
        <div className="flex-1 min-w-0 px-4 py-2 bg-white border border-slate-200 rounded-xl">
          <span className="text-sm font-medium text-slate-700 truncate block">{publicUrl}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { navigator.clipboard.writeText(publicUrl); setUrlCopied(true); setTimeout(() => setUrlCopied(false), 2000); }}
          className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
        >
          {urlCopied ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>

      {/* ── MOBILE TAB BAR ── */}
      <div className="flex lg:hidden bg-gray-100 rounded-2xl p-1 mb-6">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
            mobileTab === 'edit'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Edit
        </button>
          <button
          onClick={() => setMobileTab('preview')}
         className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
            mobileTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-indigo-400 hover:text-indigo-600'
          }`}
        >
          Preview
        </button>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

    {/* ── LEFT: PHONE PREVIEW ── */}
        <div className={`lg:col-span-5 order-2 lg:order-1 ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-6 space-y-3">

            {/* Step pills */}
            <div className="flex items-center gap-1.5">
              {([1, 2, 3] as const).map((step) => (
                <motion.button
                  key={step}
                  onClick={() => setPreviewStep(step)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                    previewStep === step
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {step === 1 ? 'Step 1' : step === 2 ? 'Step 2' : 'Done'}
                </motion.button>
              ))}
<span className="ml-auto text-[10px] text-gray-300 font-medium tracking-wide">Customer view</span>            </div>

            {/* Phone shell */}
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-4 rounded-[3rem] opacity-20 blur-2xl pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }} />

              <div className="relative bg-gray-950 rounded-[2.8rem] p-3.5 border-[6px] border-gray-900 shadow-2xl overflow-hidden aspect-[9/19] max-h-[700px] flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-950 rounded-b-2xl z-10" />
                <div className="bg-white rounded-[2rem] flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
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
            </div>

            {/* Open real form */}
            <a
              href={publicUrl}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-400 rounded-xl text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open real form
            </a>
          </div>
        </div>

      {/* ── RIGHT: CONFIG ── */}
        <div className={`lg:col-span-7 space-y-4 order-1 lg:order-2 ${mobileTab === 'edit' ? 'block' : 'hidden lg:block'}`}>

          {/* STEP 1 — subtle, locked, collapsed */}
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 px-5 py-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-xs font-bold text-gray-400">Step 1 — always collected</span>
<span className="ml-auto text-[10px] text-gray-300 font-medium hidden sm:block">Required to create a lead — can't be turned off</span>            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {['Full name', 'Email', 'Phone', 'Service category', 'Project description'].map(f => (
                <span key={f} className="text-[11px] text-gray-300 font-medium">{f}</span>
              ))}
            </div>
          </div>

          {/* STEP 2 — Optional fields */}
          <Section
            icon={<Settings2 className="w-4 h-4 text-indigo-500" />}
            title="Step 2 — extra details"
            subtitle="Toggle the fields customers see after submitting step 1. None of these block submission."
            badge="You control these"
            badgeColor="indigo"
          >
<div className="space-y-0.5 pt-1">
              <FieldToggle
                icon={MapPin} iconColor="text-rose-500"
                label="Service address"
                description="Street address with autocomplete"
                enabled={fieldConfig.address.enabled}
                onToggle={() => toggleField('address')}
              />
              <FieldToggle
                icon={Calendar} iconColor="text-emerald-500"
                label="Preferred date"
                description="Lets customers suggest a date — you confirm the real schedule"
                enabled={fieldConfig.preferred_date.enabled}
                onToggle={() => toggleField('preferred_date')}
              />
              <FieldToggle
                icon={Clock} iconColor="text-blue-500"
                label="Preferred time"
                description="Morning, afternoon, or a specific time"
                enabled={fieldConfig.preferred_time.enabled}
                onToggle={() => toggleField('preferred_time')}
              />
              <FieldToggle
                icon={Megaphone} iconColor="text-violet-500"
                label="How did you hear about us?"
                description="Google, Referral, Social Media, etc."
                enabled={fieldConfig.lead_source.enabled}
                onToggle={() => toggleField('lead_source')}
              />
              {canUsePhotoUpload ? (
                <FieldToggle
                  icon={ImageIcon} iconColor="text-pink-500"
                  label="Photo / video upload"
                  description="Customers attach job site photos — great for quotes"
                  enabled={fieldConfig.file_upload.enabled}
                  onToggle={() => toggleField('file_upload')}
                />
              ) : (
                <InlineLockBanner
                  title="Photo & Video Uploads"
                  description="Let customers attach job site photos — available on Pro."
                  planLabel="Pro"
                  priceLabel="$79.99/mo"
                  companySlug={company.slug}
                />
              )}
            </div>
          </Section>

          {/* CUSTOM QUESTIONS */}
          <Section
            icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            title="Your own questions"
            subtitle="Add custom questions that appear on step 2 — text, dropdown, or yes/no."
            action={canUseCustomQuestions && !showAddQuestion ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddQuestion(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add question
              </motion.button>
            ) : null}
          >
            {!canUseCustomQuestions ? (
              <InlineLockBanner
                title="Custom Questions"
                description='Ask customers anything — budget range, gate codes, pet info. Available on Pro.'
                planLabel="Pro"
                priceLabel="$79.99/mo"
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
                      <div className="space-y-2 pt-1">
                        {customQuestions.map((q, i) => (
                          <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors shrink-0">
                                <HelpCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{q.label}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">
                                  {q.type}{q.type === 'select' && q.options?.length ? ` · ${q.options.length} options` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() => { setNewQuestion(q); setEditingQuestionId(q.id); setShowAddQuestion(true); }}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-sm text-gray-300 font-medium">No custom questions yet</p>
                        <p className="text-xs text-gray-200 mt-1">e.g. "Budget range?", "Do you have a gate code?", "Pet on site?"</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </Section>

          {/* CONFIRMATION MESSAGE */}
          <Section
            icon={<Check className="w-4 h-4 text-emerald-500" />}
            title="Confirmation message"
            subtitle="What customers see on screen after they hit submit."
          >
             <textarea
  value={ctaSuccessMessage}
  onChange={e => setCtaSuccessMessage(e.target.value)}
  rows={2}
  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none text-sm text-gray-800 placeholder-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
              placeholder='e.g. "Thanks! We will review your request and reach out within 24 hours."'
            />
            <div className="mt-2 flex items-start gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-600 leading-relaxed">
                A confirmation email is automatically sent to the customer on submit. This message only shows on screen.
              </p>
            </div>
</Section>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSaveAll}
          disabled={loading}
          className="w-full py-4 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save className="w-3.5 h-3.5" />
          }
          {loading ? 'Saving...' : 'Save changes'}
        </motion.button>

      </div>
    </div>

    </div>
  );
}

/* ─────────────────── SECTION WRAPPER ─────────────────── */
function Section({ icon, title, subtitle, badge, badgeColor, action, children }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'indigo' | 'gray';
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
<div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-800">{title}</span>
            {badge && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                badgeColor === 'indigo' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'
              }`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
        {action}
      </div>
     <div className="px-4 py-3">
  {children}
</div>
    </div>
  );
}

/* ─────────────────── FIELD TOGGLE ─────────────────── */
function FieldToggle({ icon: Icon, iconColor, label, description, enabled, onToggle }: {
  icon: any; iconColor: string; label: string; description: string;
  enabled: boolean; onToggle: () => void;
}) {
  return (
    <motion.div
      layout
className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
        enabled ? 'bg-indigo-50/60' : 'hover:bg-gray-50'
      }`}
      onClick={onToggle}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        enabled ? 'bg-white shadow-sm' : 'bg-gray-100'
      }`}>
        <Icon className={`w-3.5 h-3.5 transition-colors ${enabled ? iconColor : 'text-gray-300'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-colors ${enabled ? 'text-gray-800' : 'text-gray-400'}`}>{label}</p>
        <p className="text-[11px] text-gray-400 truncate">{description}</p>
      </div>
      <div className="shrink-0" onClick={e => { e.stopPropagation(); onToggle(); }}>
        <motion.div
          className={`w-10 h-6 rounded-full relative transition-colors ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
        >
          <motion.div
            layout
            transition={spring}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            style={{ left: enabled ? 22 : 4 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
/* ─────────────────── QUESTION EDITOR ─────────────────── */
function QuestionEditor({ question, newOption, isEditing, onChange, onOptionChange, onSave, onCancel }: {
  question: CustomQuestion; newOption: string; isEditing: boolean;
  onChange: (q: CustomQuestion) => void; onOptionChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="bg-indigo-50/60 rounded-xl p-5 border border-indigo-100 space-y-4 mt-1">
      <div>
        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">Question label</label>
        <input
          type="text" value={question.label}
          onChange={e => onChange({ ...question, label: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm font-medium"
          placeholder='e.g. "What is your budget range?"'
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">Input type</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: 'text', label: 'Text', desc: 'Open answer' },
            { val: 'select', label: 'Dropdown', desc: 'Pick one' },
            { val: 'checkbox', label: 'Yes / No', desc: 'Toggle' },
          ].map(t => (
            <button
              key={t.val}
              onClick={() => onChange({ ...question, type: t.val as any, options: t.val === 'select' ? question.options : [] })}
              className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                question.type === t.val
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-200'
              }`}
            >
              {t.label}
              <span className={`text-[9px] font-medium ${question.type === t.val ? 'text-indigo-200' : 'text-gray-400'}`}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {question.type === 'select' && (
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest">Options</label>
          <AnimatePresence>
            {question.options?.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100"
              >
                <span className="text-sm text-gray-700">{opt}</span>
                <button onClick={() => onChange({ ...question, options: question.options?.filter((_, idx) => idx !== i) })} className="text-gray-300 hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex gap-2">
            <input
              type="text" value={newOption}
              onChange={e => onOptionChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:border-indigo-400 transition"
              placeholder="Add option..."
              onKeyDown={e => {
                if (e.key === 'Enter' && newOption) {
                  onChange({ ...question, options: [...(question.options || []), newOption] });
                  onOptionChange('');
                }
              }}
            />
            <button
              onClick={() => { if (newOption) { onChange({ ...question, options: [...(question.options || []), newOption] }); onOptionChange(''); } }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
        >
          {isEditing ? 'Update question' : 'Add question'}
        </motion.button>
        <button onClick={onCancel} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── PREVIEW STEP 1 ─────────────────── */
function PreviewStep1({heading, categories, brandColor1, brandColor2, logoUrl, companyName }: {
  heading: string; categories: Category[]; brandColor1: string; brandColor2: string;
  logoUrl?: string | null; companyName?: string;
}) {
  const inputClass = "w-full h-9 bg-gray-50 border border-gray-200 rounded-2xl px-3 text-gray-300 text-[10px] flex items-center gap-2";

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <div className="w-6 h-0.5 bg-white/20 rounded-full mx-auto mb-3" />
        {logoUrl && <img src={logoUrl} alt="" className="h-6 w-auto object-contain mb-2" />}
        <h3 className="text-xs font-black leading-tight">{heading || 'Request a Free Quote'}</h3>
        <div className="flex items-center gap-2 mt-2.5 text-[9px]">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ color: brandColor1 }}>
            <span className="font-black text-[7px]">1</span>
          </div>
          <span className="text-white font-black uppercase tracking-widest text-[8px]">Your Info</span>
          <div className="flex-1 h-px bg-white/20" />
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <span className="font-black text-[7px]">2</span>
          </div>
          <span className="text-white/50 font-black uppercase tracking-widest text-[8px]">Details</span>
        </div>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-2">
        <div>
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.12em] ml-1 mb-1">Full Name</p>
          <div className={inputClass}>
            <User className="w-2.5 h-2.5 text-gray-300 shrink-0" />
            <span>John Smith</span>
          </div>
        </div>
        <div>
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.12em] ml-1 mb-1">Email</p>
          <div className={inputClass}>
            <Mail className="w-2.5 h-2.5 text-gray-300 shrink-0" />
            <span>john@example.com</span>
          </div>
        </div>
        <div>
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.12em] ml-1 mb-1">Phone</p>
          <div className={inputClass}>
            <Phone className="w-2.5 h-2.5 text-gray-300 shrink-0" />
            <span>(555) 123-4567</span>
          </div>
        </div>
        <div>
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.12em] ml-1 mb-1">Service Needed</p>
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 3).map((cat, i) => (
              <div
                key={i}
                className={`px-2 py-1 rounded-lg text-[8px] font-bold border ${
                  i === 0
                    ? 'text-white border-transparent'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
                style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
              >
                {cat.label}
              </div>
            ))}
            {categories.length > 3 && (
              <div className="px-2 py-1 rounded-lg text-[8px] font-bold border bg-gray-50 text-gray-300 border-gray-200">
                +{categories.length - 3}
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.12em] ml-1 mb-1">Tell Us About Your Project</p>
          <div className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-3 pt-2 text-gray-300 text-[10px]">
            Describe what you need done...
          </div>
        </div>
        <button
          className="w-full py-2 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-sm mt-1"
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
  const inputClass = "w-full h-9 bg-gray-50 border border-gray-200 rounded-2xl px-3 text-gray-300 text-[10px] flex items-center gap-2";
  const labelClass = "text-[8px] font-black text-gray-500 uppercase tracking-[0.12em] ml-1 mb-1";

  const hasAnything = fieldConfig.address.enabled || fieldConfig.preferred_date.enabled ||
    fieldConfig.preferred_time.enabled || fieldConfig.lead_source.enabled ||
    (canUsePhotoUpload && fieldConfig.file_upload.enabled) || customQuestions.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <div className="flex items-center gap-1.5 text-[8px] mb-2">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <span className="font-black text-[7px]">1</span>
          </div>
          <ChevronRight className="w-2 h-2 opacity-40" />
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ color: brandColor1 }}>
            <span className="font-black text-[7px]">2</span>
          </div>
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 mb-0.5">Step 2 of 2</p>
        <h3 className="text-xs font-black">Your request is saved.</h3>
        <p className="text-white/60 text-[9px] mt-0.5 font-medium">A few more details — all optional.</p>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-2.5">
        {!hasAnything && (
          <div className="py-8 text-center">
            <p className="text-[10px] text-gray-300 font-medium">No optional fields enabled</p>
            <p className="text-[9px] text-gray-200 mt-1">Toggle fields on to see them here</p>
          </div>
        )}

        {fieldConfig.address.enabled && (
          <>
            <div>
              <p className={labelClass}>Address</p>
              <div className={inputClass}>
                <MapPin className="w-2.5 h-2.5 text-gray-300 shrink-0" />
                <span>Start typing your address...</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <p className={labelClass}>Zip Code</p>
                <div className={inputClass}><span>12345</span></div>
              </div>
              <div>
                <p className={labelClass}>Unit / Apt</p>
                <div className={inputClass}><span>Apt 4B</span></div>
              </div>
            </div>
          </>
        )}

        {(fieldConfig.preferred_date.enabled || fieldConfig.preferred_time.enabled) && (
          <div className={`grid gap-1.5 ${fieldConfig.preferred_date.enabled && fieldConfig.preferred_time.enabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {fieldConfig.preferred_date.enabled && (
              <div>
                <p className={labelClass}>Preferred Date</p>
                <div className={inputClass}>
                  <Calendar className="w-2.5 h-2.5 text-gray-300 shrink-0" />
                  <span>MM/DD/YYYY</span>
                </div>
              </div>
            )}
            {fieldConfig.preferred_time.enabled && (
              <div>
                <p className={labelClass}>Preferred Time</p>
                <div className={inputClass}>
                  <Clock className="w-2.5 h-2.5 text-gray-300 shrink-0" />
                  <span>Morning, 2PM...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {customQuestions.map(q => (
          <div key={q.id}>
            <p className={labelClass}>{q.label}</p>
            {q.type === 'text' && (
              <div className={inputClass}>
                <HelpCircle className="w-2.5 h-2.5 text-gray-300 shrink-0" />
                <span>Your answer...</span>
              </div>
            )}
            {q.type === 'select' && (
              <div className="flex flex-wrap gap-1">
                {q.options?.slice(0, 3).map((opt, i) => (
                  <div
                    key={i}
                    className={`px-2 py-1 rounded-lg text-[8px] font-bold border ${
                      i === 0 ? 'text-white border-transparent' : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                    style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
            {q.type === 'checkbox' && (
              <div className="flex gap-1.5">
                <div className="flex-1 flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-2xl text-[9px] text-gray-300 bg-gray-50">
                  <div className="w-2.5 h-2.5 rounded-full border border-gray-300" /> Yes
                </div>
                <div className="flex-1 flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-2xl text-[9px] text-gray-300 bg-gray-50">
                  <div className="w-2.5 h-2.5 rounded-full border border-gray-300" /> No
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
                <div
                  key={i}
                  className={`px-2 py-1 rounded-lg text-[8px] font-bold border ${
                    i === 0 ? 'text-white border-transparent' : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}
                  style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {canUsePhotoUpload && fieldConfig.file_upload.enabled && (
          <div>
            <p className={labelClass}>Photos or Videos</p>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-3 text-center bg-gray-50">
              <ImageIcon className="w-4 h-4 text-gray-300 mx-auto mb-1" />
              <p className="text-[9px] text-gray-300 font-medium">Click or drag photos here</p>
            </div>
          </div>
        )}

        {hasAnything && (
          <button
            className="w-full py-2 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-sm"
            style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
          >
            Submit Details
          </button>
        )}

     
      </div>
    </div>
  );
}

function PreviewStep3({ message, brandColor1, brandColor2, companyName, logoUrl }: {
  message: string; brandColor1: string; brandColor2: string; companyName?: string; logoUrl?: string | null;
}) {
  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-gray-50 rounded-3xl">
      <div className="w-full bg-white rounded-3xl p-5 text-center shadow-md border border-gray-200">

        {/* Logo hero — matches success page */}
        {logoUrl ? (
          <div
            className="relative w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-black/5"
            style={{
              background: 'white',
              boxShadow: `0 4px 12px color-mix(in srgb, ${brandColor1} 15%, transparent)`,
            }}
          >
            {/* Soft brand ring behind */}
            <div
              className="absolute -inset-1.5 rounded-[18px] opacity-10 -z-10"
              style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
            />
            <img
              src={logoUrl}
              alt=""
              className="w-10 h-10 object-contain"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}
            />
          </div>
        ) : (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
          >
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
        )}

        <h3 className="text-sm font-black text-gray-900 mb-1.5">Request received!</h3>
        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
          {message || "We've got your request and will be in touch soon."}
        </p>

        {/* Steps */}
        <div className="mt-4 space-y-2 text-left">
          {[
            { label: 'Check your email', sub: 'Confirmation sent to your inbox' },
            { label: "We'll reach out shortly", sub: 'Our team reviews every request' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <div
                className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px]"
                style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${brandColor1} 12%, white), color-mix(in srgb, ${brandColor2} 12%, white))` }}
              >
                {i === 0 ? '✉' : '⏳'}
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-800">{s.label}</p>
                <p className="text-[8px] text-gray-400 font-medium">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[8px] text-gray-300 mt-4 uppercase tracking-widest font-black">Powered by Lead2Project</p>
      </div>
    </div>
  );
}