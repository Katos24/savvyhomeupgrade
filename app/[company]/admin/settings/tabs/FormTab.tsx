'use client';

import { useState } from 'react';
import {
  Plus, Trash2, AlertCircle, Check, Edit2, X,
  Settings2, Eye, Layout, Save, ChevronRight,
  User, Mail, Phone, Building, FileText, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
  ToggleLeft, ToggleRight, ExternalLink, Link2,
} from 'lucide-react';
import type { PlanTier } from '@/lib/permissions';

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
  file_upload: { enabled: false }, // off by default — only on if plan allows
};

const PLAN_ORDER: PlanTier[] = ['basic', 'pro', 'business'];
function planHasAccess(userPlan: PlanTier, required: PlanTier) {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(required);
}

// ── Small inline locked feature banner ───────────────────────
function LockedFeatureBanner({ label, description, companySlug, requiredPlan = 'Pro' }: {
  label: string;
  description: string;
  companySlug: string;
  requiredPlan?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/50">
      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
        <Lock className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900">{label}</p>
        <p className="text-xs text-blue-600 mt-0.5">{description}</p>
      </div>
      <a
        href={`/${companySlug}/admin/settings`}
        onClick={e => { e.preventDefault(); window.location.href = `/${companySlug}/admin/settings`; }}
        className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition whitespace-nowrap"
      >
        Upgrade to {requiredPlan}
      </a>
    </div>
  );
}

export default function FormTab({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'basic') as PlanTier;
  const canUsePhotoUpload     = planHasAccess(planTier, 'pro');
  const canUseCustomQuestions = planHasAccess(planTier, 'pro');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);

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

    // Always force file_upload off for Basic — they can't offer it
    if (!canUsePhotoUpload) {
      base.file_upload = { enabled: false };
    }

    return base;
  });

  const [previewStep, setPreviewStep] = useState<1 | 2 | 3>(1);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({ id: '', label: '', type: 'text', required: false, options: [] });
  const [newOption, setNewOption] = useState('');
  const [urlCopied, setUrlCopied] = useState(false);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${company.slug}`
    : `https://yourdomain.com/${company.slug}`;

  const categories: Category[] = company.form_categories?.length > 0
    ? company.form_categories
    : [{ label: 'General', value: 'general' }];

  const brandColor1 = company.email_brand_color_1 || '#6366f1';
  const brandColor2 = company.email_brand_color_2 || '#8b5cf6';

  const toggleField = (field: keyof FieldConfig) => {
    setFieldConfig(prev => ({ ...prev, [field]: { ...prev[field], enabled: !prev[field].enabled } }));
  };

  const toggleRequired = (field: 'address') => {
    setFieldConfig(prev => ({ ...prev, [field]: { ...prev[field], required: !prev[field].required } }));
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-form',
          data: {
            cta: { cta_success_message: ctaSuccessMessage },
            questions: canUseCustomQuestions ? customQuestions : [],
            field_config: {
              ...fieldConfig,
              // Always enforce file_upload off for Basic before saving
              file_upload: { enabled: canUsePhotoUpload ? fieldConfig.file_upload.enabled : false },
            },
          },
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to update settings');
      setStatus({ type: 'success', message: 'Form settings saved!' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateQuestion = () => {
    if (!newQuestion.label.trim()) return setStatus({ type: 'error', message: 'Label is required' });
    if (editingQuestionId) {
      setCustomQuestions(customQuestions.map(q => q.id === editingQuestionId ? newQuestion : q));
    } else {
      setCustomQuestions([...customQuestions, { ...newQuestion, id: `q_${Date.now()}` }]);
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
    <div className="max-w-7xl mx-auto space-y-5 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Form</h1>
          <p className="text-gray-500 text-sm mt-1">Customize what your customers fill out. Preview updates live on the right.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition shadow-sm"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Status */}
      {status.type && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
          status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {status.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      {/* EXPLAINER BANNER */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-black text-indigo-900">This is the form your customers fill out</p>
            <p className="text-xs text-indigo-700 leading-relaxed">
              When a customer taps your booking link or scans your QR code, they land on this form and submit a project request. It goes straight into your dashboard as a new lead.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-3 py-2">
              <Link2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[11px] font-mono text-slate-700 truncate max-w-[160px] sm:max-w-[200px]">{publicUrl}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(publicUrl); setUrlCopied(true); setTimeout(() => setUrlCopied(false), 2000); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black transition"
              >
                {urlCopied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                {urlCopied ? 'Copied!' : 'Copy Link'}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-600 rounded-lg text-xs font-black transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* LEFT: Configuration */}
        <div className="lg:col-span-7 space-y-5">

          {/* Step 1 — Always-on fields */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-sm text-gray-700">Step 1 — Basic Info</span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide ml-auto">Always collected</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">These fields are always on the form.</p>
            </div>
            <div className="p-4 space-y-1">
              {[
                { icon: User, label: 'Full Name', color: 'text-blue-500' },
                { icon: Mail, label: 'Email Address', color: 'text-blue-500' },
                { icon: Phone, label: 'Phone Number', color: 'text-green-500' },
                { icon: Building, label: 'Service Category', color: 'text-amber-500', note: 'Uses your configured categories' },
                { icon: FileText, label: 'Project Description', color: 'text-purple-500', note: 'Free-text, no limit' },
              ].map(({ icon: Icon, label, color, note }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50/50">
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {note && <p className="text-[10px] text-gray-400 mt-0.5">{note}</p>}
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide shrink-0">Required</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 — Optional fields */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-sm text-gray-700">Step 2 — Extra Details</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wide ml-auto">You control these</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                After step 1, customers see these optional fields. Toggle on or off — they never block submission.
              </p>
            </div>
            <div className="p-4 space-y-1">
              <FieldToggle
                icon={MapPin} iconColor="text-red-500"
                label="Service Address"
                description="Street address with autocomplete — useful for quotes"
                enabled={fieldConfig.address.enabled}
                onToggle={() => toggleField('address')}
              >
                {fieldConfig.address.enabled && (
                  <label className="flex items-center gap-2 mt-2 ml-11 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fieldConfig.address.required}
                      onChange={() => toggleRequired('address')}
                      className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-gray-500">Make this required before they can submit step 2</span>
                  </label>
                )}
              </FieldToggle>

              <FieldToggle
                icon={Calendar} iconColor="text-emerald-500"
                label="Preferred Date"
                description="Lets customers suggest a date — you still confirm the real schedule"
                enabled={fieldConfig.preferred_date.enabled}
                onToggle={() => toggleField('preferred_date')}
              />

              <FieldToggle
                icon={Clock} iconColor="text-blue-500"
                label="Preferred Time"
                description="Morning, afternoon, specific time — free text"
                enabled={fieldConfig.preferred_time.enabled}
                onToggle={() => toggleField('preferred_time')}
              />

              <FieldToggle
                icon={Megaphone} iconColor="text-purple-500"
                label="How Did You Hear About Us?"
                description="Dropdown: Google, Referral, Social Media, etc."
                enabled={fieldConfig.lead_source.enabled}
                onToggle={() => toggleField('lead_source')}
              />

              {/* Photo upload — locked for Basic */}
              {canUsePhotoUpload ? (
                <FieldToggle
                  icon={ImageIcon} iconColor="text-pink-500"
                  label="Photo / Video Upload"
                  description="Customers can attach images of the job — great for quotes"
                  enabled={fieldConfig.file_upload.enabled}
                  onToggle={() => toggleField('file_upload')}
                />
              ) : (
                <LockedFeatureBanner
                  label="Photo & Video Uploads"
                  description="Let customers attach job site photos directly on the form — available on Pro."
                  companySlug={company.slug}
                />
              )}
            </div>
          </div>

          {/* Custom Questions — locked for Basic */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-sm text-gray-700">Your Own Questions</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Add custom questions that appear on step 2 — text, dropdown, or yes/no.</p>
              </div>
              {canUseCustomQuestions && !showAddQuestion && (
                <button onClick={() => setShowAddQuestion(true)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-1 shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            <div className="p-5">
              {!canUseCustomQuestions ? (
                <LockedFeatureBanner
                  label="Custom Questions"
                  description="Ask customers anything — budget range, gate codes, pet info. Available on Pro."
                  companySlug={company.slug}
                />
              ) : showAddQuestion ? (
                <QuestionEditor
                  question={newQuestion}
                  newOption={newOption}
                  isEditing={!!editingQuestionId}
                  onChange={setNewQuestion}
                  onOptionChange={setNewOption}
                  onSave={addOrUpdateQuestion}
                  onCancel={resetForm}
                />
              ) : (
                <div className="space-y-2">
                  {customQuestions.length > 0 ? customQuestions.map(q => (
                    <div key={q.id} className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 text-gray-400 rounded-lg group-hover:bg-white group-hover:text-indigo-500 transition">
                          <Layout className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{q.label} {q.required && <span className="text-red-500">*</span>}</p>
                          <p className="text-[11px] text-gray-400 uppercase font-medium">{q.type} field{q.type === 'select' && q.options?.length ? ` — ${q.options.length} options` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => { setNewQuestion(q); setEditingQuestionId(q.id); setShowAddQuestion(true); }} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No custom questions yet</p>
                      <p className="text-xs text-gray-300 mt-1">Examples: "Budget range?", "Do you have a pet?", "Gate code needed?"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-sm text-gray-700">Confirmation Message</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">What customers see after they hit submit.</p>
            </div>
            <div className="p-5">
              <textarea
                value={ctaSuccessMessage}
                onChange={e => setCtaSuccessMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none text-sm"
                placeholder='e.g. "Thanks! We will review your request and reach out within 24 hours."'
              />
              <p className="text-[11px] text-gray-400 mt-2">Leave blank to use the default message.</p>
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700 leading-relaxed">
                  A confirmation email is automatically sent to the customer when they submit. This message appears on screen after submission.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-black text-gray-800">Live Preview</span>
                <span className="text-[10px] font-bold text-gray-400 ml-auto">Updates as you edit</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                This is exactly what your customers see when they open your booking link.
              </p>
              <a
                href={publicUrl}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Real Form
              </a>
            </div>

            {/* Step tabs */}
            <div className="flex gap-1.5">
              {([1, 2, 3] as const).map(step => (
                <button
                  key={step}
                  onClick={() => setPreviewStep(step)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    previewStep === step ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {step === 1 ? 'Step 1' : step === 2 ? 'Step 2' : 'Confirmation'}
                </button>
              ))}
            </div>

            {/* Phone frame */}
            <div className="bg-gray-900 rounded-[2.5rem] p-4 border-[8px] border-gray-800 shadow-2xl overflow-hidden aspect-[9/16] max-h-[680px] flex flex-col">
              <div className="bg-white rounded-[1.5rem] flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {previewStep === 1 && (
                  <PreviewStep1
                    heading={company.cta_heading || ''}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Field Toggle Row ---- */
function FieldToggle({ icon: Icon, iconColor, label, description, enabled, onToggle, children }: {
  icon: any; iconColor: string; label: string; description: string;
  enabled: boolean; onToggle: () => void; children?: React.ReactNode;
}) {
  return (
    <div className={`px-4 py-3 rounded-xl transition ${enabled ? 'bg-indigo-50/40' : ''}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 shrink-0 ${enabled ? iconColor : 'text-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${enabled ? 'text-gray-800' : 'text-gray-400'}`}>{label}</p>
          <p className="text-[11px] text-gray-400 truncate">{description}</p>
        </div>
        <button onClick={onToggle} className="shrink-0">
          {enabled
            ? <ToggleRight className="w-8 h-8 text-indigo-600" />
            : <ToggleLeft className="w-8 h-8 text-gray-300" />
          }
        </button>
      </div>
      {children}
    </div>
  );
}



/* ---- Question Editor ---- */
function QuestionEditor({ question, newOption, isEditing, onChange, onOptionChange, onSave, onCancel }: {
  question: CustomQuestion; newOption: string; isEditing: boolean;
  onChange: (q: CustomQuestion) => void; onOptionChange: (v: string) => void;
  onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 space-y-4">
      <div>
        <label className="block text-[11px] font-bold text-indigo-600 uppercase mb-1.5">Question Label</label>
        <input
          type="text" value={question.label}
          onChange={e => onChange({ ...question, label: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-sm"
          placeholder='e.g. "What is your budget range?"'
        />
      </div>
      <div>
        <label className="block text-[11px] font-bold text-indigo-600 uppercase mb-1.5">Input Type</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: 'text', desc: 'Open text' },
            { val: 'select', desc: 'Dropdown' },
            { val: 'checkbox', desc: 'Yes / No' },
          ].map(t => (
            <button
              key={t.val}
              onClick={() => onChange({ ...question, type: t.val as any, options: t.val === 'select' ? question.options : [] })}
              className={`py-2.5 text-xs font-bold rounded-lg border capitalize transition flex flex-col items-center gap-0.5 ${
                question.type === t.val ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.val}
              <span className={`text-[9px] font-medium ${question.type === t.val ? 'text-indigo-200' : 'text-gray-400'}`}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {question.type === 'select' && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-indigo-600 uppercase">Options</label>
          {question.options?.map((opt, i) => (
            <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100">
              <span className="text-sm">{opt}</span>
              <button onClick={() => onChange({ ...question, options: question.options?.filter((_, idx) => idx !== i) })} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text" value={newOption}
              onChange={e => onOptionChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none"
              placeholder="Add option..."
              onKeyDown={e => { if (e.key === 'Enter' && newOption) { onChange({ ...question, options: [...(question.options || []), newOption] }); onOptionChange(''); } }}
            />
            <button
              onClick={() => { if (newOption) { onChange({ ...question, options: [...(question.options || []), newOption] }); onOptionChange(''); } }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50"
            >Add</button>
          </div>
        </div>
      )}

      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer">
        <input
          type="checkbox" checked={question.required}
          onChange={e => onChange({ ...question, required: e.target.checked })}
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm font-medium text-gray-700">Mark as required</span>
      </label>

      <div className="flex gap-3">
        <button onClick={onSave} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
          {isEditing ? 'Update Question' : 'Add Question'}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition">Cancel</button>
      </div>
    </div>
  );
}

/* ---- Preview Step 1 ---- */
function PreviewStep1({ heading, categories, brandColor1, brandColor2, logoUrl, companyName }: {
  heading: string; categories: Category[]; brandColor1: string; brandColor2: string;
  logoUrl?: string | null; companyName?: string;
}) {
  const inputClass = "w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-gray-400 text-xs flex items-center";
  return (
    <div>
      <div className="p-5 text-white rounded-t-[1.5rem]" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <div className="w-8 h-0.5 bg-white/20 rounded-full mx-auto mb-4" />
        {logoUrl && <img src={logoUrl} alt="" className="h-8 w-auto object-contain mb-3" />}
        <h3 className="text-base font-bold leading-tight">{heading || 'Request a Free Quote'}</h3>
      </div>
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 text-[10px]">
          <div className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: brandColor1 }}>1</div>
          <span className="font-semibold" style={{ color: brandColor1 }}>Basic Info</span>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 text-[10px] font-bold flex items-center justify-center">2</div>
          <span className="text-gray-400">Details</span>
        </div>
      </div>
      <div className="px-5 pb-5 space-y-3">
        <PreviewField icon={<User className="w-3 h-3 text-blue-500" />} label="Your Name" required>
          <div className={inputClass}>John Smith</div>
        </PreviewField>
        <PreviewField icon={<Mail className="w-3 h-3 text-blue-500" />} label="Email" required>
          <div className={inputClass}>john@example.com</div>
        </PreviewField>
        <PreviewField icon={<Phone className="w-3 h-3 text-green-500" />} label="Phone" required>
          <div className={inputClass}>(555) 123-4567</div>
        </PreviewField>
        <PreviewField icon={<Building className="w-3 h-3 text-amber-500" />} label="Service Type" required>
          <div className={`${inputClass} justify-between`}>
            <span>{categories[0]?.label || 'Select...'}</span>
            <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </PreviewField>
        <PreviewField icon={<FileText className="w-3 h-3 text-purple-500" />} label="Describe Your Project" required>
          <div className="w-full h-16 bg-gray-50 border border-gray-200 rounded-lg px-3 pt-2 text-gray-400 text-xs">
            Tell us what you need done...
          </div>
        </PreviewField>
        <button className="w-full py-2.5 text-white rounded-lg font-bold text-xs shadow-md" style={{ background: `linear-gradient(to right, ${brandColor1}, ${brandColor2})` }}>
          Continue to Step 2
        </button>
      </div>
    </div>
  );
}

/* ---- Preview Step 2 ---- */
function PreviewStep2({ fieldConfig, customQuestions, brandColor1, brandColor2, companyName, canUsePhotoUpload }: {
  fieldConfig: FieldConfig; customQuestions: CustomQuestion[];
  brandColor1: string; brandColor2: string;
  companyName?: string; canUsePhotoUpload: boolean;
}) {
  const inputClass = "w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-gray-400 text-xs flex items-center";
  const hasAnything = fieldConfig.address.enabled || fieldConfig.preferred_date.enabled ||
    fieldConfig.preferred_time.enabled || fieldConfig.lead_source.enabled ||
    (canUsePhotoUpload && fieldConfig.file_upload.enabled) || customQuestions.length > 0;

  return (
    <div>
      <div className="p-5 text-white rounded-t-[1.5rem]" style={{ background: `linear-gradient(to right, ${brandColor1}, ${brandColor2})` }}>
        <div className="flex items-center gap-2 text-[10px] mb-2">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">1</div>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <div className="w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: brandColor1 }}>2</div>
        </div>
        <h3 className="text-base font-bold">Request received!</h3>
        <p className="text-white/70 text-[11px] mt-1">A few more details — all optional.</p>
      </div>
      <div className="px-5 pb-5 pt-4 space-y-3">
        {!hasAnything && (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-xs">No optional fields enabled</p>
            <p className="text-gray-300 text-[10px] mt-1">Toggle fields on the left to see them here</p>
          </div>
        )}
        {fieldConfig.address.enabled && (
          <>
            <PreviewField icon={<MapPin className="w-3 h-3 text-red-500" />} label="Service Address" required={fieldConfig.address.required}>
              <div className={inputClass}>Start typing your address...</div>
            </PreviewField>
            <div className="grid grid-cols-2 gap-2">
              <PreviewField icon={<MapPin className="w-3 h-3 text-emerald-500" />} label="Zip Code">
                <div className={inputClass}>12345</div>
              </PreviewField>
              <PreviewField icon={null} label="Unit / Apt">
                <div className={inputClass}>Apt 4B</div>
              </PreviewField>
            </div>
          </>
        )}
        {(fieldConfig.preferred_date.enabled || fieldConfig.preferred_time.enabled) && (
          <div className="grid grid-cols-2 gap-2">
            {fieldConfig.preferred_date.enabled && (
              <PreviewField icon={<Calendar className="w-3 h-3 text-emerald-500" />} label="Preferred Date">
                <div className={inputClass}>mm/dd/yyyy</div>
              </PreviewField>
            )}
            {fieldConfig.preferred_time.enabled && (
              <PreviewField icon={<Clock className="w-3 h-3 text-blue-500" />} label="Preferred Time">
                <div className={inputClass}>Morning...</div>
              </PreviewField>
            )}
          </div>
        )}
        {customQuestions.map(q => (
          <PreviewField key={q.id} icon={<HelpCircle className="w-3 h-3 text-emerald-500" />} label={q.label} required={q.required}>
            {q.type === 'text' && <div className={inputClass}>Your answer...</div>}
            {q.type === 'select' && (
              <div className={`${inputClass} justify-between`}>
                <span>Select one...</span>
                <ChevronRight className="w-3 h-3 rotate-90" />
              </div>
            )}
            {q.type === 'checkbox' && (
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 p-2 border border-gray-200 rounded-lg text-[10px] text-gray-500"><div className="w-3 h-3 rounded-full border-2 border-gray-300" /> Yes</div>
                <div className="flex-1 flex items-center gap-2 p-2 border border-gray-200 rounded-lg text-[10px] text-gray-500"><div className="w-3 h-3 rounded-full border-2 border-gray-300" /> No</div>
              </div>
            )}
          </PreviewField>
        ))}
        {fieldConfig.lead_source.enabled && (
          <PreviewField icon={<HelpCircle className="w-3 h-3 text-purple-500" />} label="How did you hear about us?">
            <div className={`${inputClass} justify-between`}>
              <span>Select one...</span>
              <ChevronRight className="w-3 h-3 rotate-90" />
            </div>
          </PreviewField>
        )}
        {canUsePhotoUpload && fieldConfig.file_upload.enabled && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ImageIcon className="w-3 h-3 text-pink-500" />
              <span className="text-[11px] font-semibold text-gray-700">Photos or Videos</span>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <ImageIcon className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-500">Tap to attach photos</p>
              <p className="text-[9px] text-gray-400">Max 50MB</p>
            </div>
          </div>
        )}
        {hasAnything && (
          <button className="w-full py-2.5 text-white rounded-lg font-bold text-xs shadow-md" style={{ background: `linear-gradient(to right, ${brandColor1}, ${brandColor2})` }}>
            Submit Request
          </button>
        )}
      </div>
    </div>
  );
}

/* ---- Preview Step 3 ---- */
function PreviewStep3({ message, brandColor1, brandColor2, companyName, logoUrl }: {
  message: string; brandColor1: string; brandColor2: string; companyName?: string; logoUrl?: string | null;
}) {
  const b1 = brandColor1 || '#2563eb';
  const b2 = brandColor2 || '#7c3aed';
  const subtext = message || "We've got your request and will be in touch soon.";

  return (
    <div style={{ background: '#fafaf9', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', borderRadius: '1.5rem' }}>
      <div style={{ width: '100%', background: '#fff', borderRadius: '20px', padding: '32px 20px 28px', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        {logoUrl && (
          <div style={{ marginBottom: '20px' }}>
            <img src={logoUrl} alt={companyName} style={{ height: '36px', width: 'auto', objectFit: 'contain', maxWidth: '140px', margin: '0 auto' }} />
          </div>
        )}
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `linear-gradient(135deg, ${b1}, ${b2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 8px 20px ${b1}40` }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111', marginBottom: '10px' }}>Request Received!</h1>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>{subtext}</p>
        <p style={{ marginTop: '18px', fontSize: '0.65rem', color: '#d1d5db', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Powered by Lead2Project
        </p>
      </div>
    </div>
  );
}

/* ---- Preview Field Helper ---- */
function PreviewField({ icon, label, required, children }: {
  icon: React.ReactNode; label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[11px] font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </div>
      {children}
    </div>
  );
}