'use client';

import { useState } from 'react';
import {
  Plus, Trash2, AlertCircle, Check, Edit2, X, Users,
  Settings2, Eye, Layout, Save, ChevronRight, GripVertical,
  User, Mail, Phone, Building, FileText, MapPin, Calendar,
  Clock, HelpCircle, Image as ImageIcon, Megaphone, Lock,
  ToggleLeft, ToggleRight,
} from 'lucide-react';

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
  file_upload: { enabled: true },
};

export default function FormTab({ company }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Form Copy
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');

  // Custom Questions
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);

  // Field Config — if form_field_config exists, use it as source of truth
  // Otherwise fall back to legacy address_enabled/address_required + defaults
  const existingConfig = company.form_field_config;
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>(() => {
    if (existingConfig) {
      return {
        address: {
          enabled: existingConfig.address?.enabled ?? DEFAULT_FIELD_CONFIG.address.enabled,
          required: existingConfig.address?.required ?? DEFAULT_FIELD_CONFIG.address.required,
        },
        preferred_date: { enabled: existingConfig.preferred_date?.enabled ?? DEFAULT_FIELD_CONFIG.preferred_date.enabled },
        preferred_time: { enabled: existingConfig.preferred_time?.enabled ?? DEFAULT_FIELD_CONFIG.preferred_time.enabled },
        lead_source: { enabled: existingConfig.lead_source?.enabled ?? DEFAULT_FIELD_CONFIG.lead_source.enabled },
        file_upload: { enabled: existingConfig.file_upload?.enabled ?? DEFAULT_FIELD_CONFIG.file_upload.enabled },
      };
    }
    // Legacy fallback — no form_field_config saved yet
    return {
      address: {
        enabled: company.address_enabled ?? DEFAULT_FIELD_CONFIG.address.enabled,
        required: company.address_required ?? DEFAULT_FIELD_CONFIG.address.required,
      },
      preferred_date: { enabled: DEFAULT_FIELD_CONFIG.preferred_date.enabled },
      preferred_time: { enabled: DEFAULT_FIELD_CONFIG.preferred_time.enabled },
      lead_source: { enabled: DEFAULT_FIELD_CONFIG.lead_source.enabled },
      file_upload: { enabled: DEFAULT_FIELD_CONFIG.file_upload.enabled },
    };
  });

  // Preview state
  const [previewStep, setPreviewStep] = useState<1 | 2>(1);

  // Question editor state
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({ id: '', label: '', type: 'text', required: false, options: [] });
  const [newOption, setNewOption] = useState('');

  const categories: Category[] = company.form_categories && company.form_categories.length > 0
    ? company.form_categories
    : [{ label: 'General', value: 'general' }];

  const brandColor1 = company.email_brand_color_1 || '#6366f1';
  const brandColor2 = company.email_brand_color_2 || '#8b5cf6';

  // ─── Toggle helpers ───
  const toggleField = (field: keyof FieldConfig) => {
    setFieldConfig(prev => ({
      ...prev,
      [field]: { ...prev[field], enabled: !prev[field].enabled },
    }));
  };

  const toggleRequired = (field: 'address') => {
    setFieldConfig(prev => ({
      ...prev,
      [field]: { ...prev[field], required: !prev[field].required },
    }));
  };

  // ─── Save ───
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
            questions: customQuestions,
            field_config: fieldConfig,
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

  // ─── Question CRUD ───
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

  // Check if step 2 has any enabled fields
  const hasStep2Fields = fieldConfig.address.enabled || fieldConfig.preferred_date.enabled ||
    fieldConfig.preferred_time.enabled || fieldConfig.lead_source.enabled ||
    fieldConfig.file_upload.enabled || customQuestions.length > 0;

  // ─── Render ───
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Form</h1>
          <p className="text-gray-500 text-sm mt-1">Configure what your customers see when they submit a request. Changes update the live preview instantly.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all shadow-sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ═══ LEFT: Configuration ═══ */}
        <div className="lg:col-span-7 space-y-6">

          {/* ── Standard Fields (always on) ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-700">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-sm uppercase tracking-wider">Step 1 — Required Fields</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">These fields are always collected and cannot be turned off.</p>
            </div>
            <div className="p-4 space-y-1">
              {[
                { icon: User, label: 'Full Name', color: 'text-blue-500' },
                { icon: Mail, label: 'Email Address', color: 'text-blue-500' },
                { icon: Phone, label: 'Phone Number', color: 'text-green-500' },
                { icon: Building, label: 'Service Category', color: 'text-amber-500' },
                { icon: FileText, label: 'Project Description', color: 'text-purple-500' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50/50">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
                  <span className="text-[10px] font-bold uppercase text-gray-300 tracking-wide">Always on</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Optional Fields (toggleable) ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-700">
                <Settings2 className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-sm uppercase tracking-wider">Step 2 — Optional Fields</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Toggle fields on or off. These appear on the second step of the form.</p>
            </div>
            <div className="p-4 space-y-1">

              {/* Address */}
              <FieldToggle
                icon={MapPin}
                iconColor="text-red-500"
                label="Address"
                description="Street address with Google autocomplete"
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
                    <span className="text-xs text-gray-500">Make address required</span>
                  </label>
                )}
              </FieldToggle>

              {/* Preferred Date */}
              <FieldToggle
                icon={Calendar}
                iconColor="text-emerald-500"
                label="Preferred Date"
                description="Date picker for scheduling preference"
                enabled={fieldConfig.preferred_date.enabled}
                onToggle={() => toggleField('preferred_date')}
              />

              {/* Preferred Time */}
              <FieldToggle
                icon={Clock}
                iconColor="text-blue-500"
                label="Preferred Time"
                description="Free-text time preference"
                enabled={fieldConfig.preferred_time.enabled}
                onToggle={() => toggleField('preferred_time')}
              />

              {/* Lead Source */}
              <FieldToggle
                icon={Megaphone}
                iconColor="text-purple-500"
                label="How Did You Hear About Us?"
                description="Dropdown with referral sources"
                enabled={fieldConfig.lead_source.enabled}
                onToggle={() => toggleField('lead_source')}
              />

              {/* File Upload */}
              <FieldToggle
                icon={ImageIcon}
                iconColor="text-pink-500"
                label="Photo / Video Upload"
                description="Drag-and-drop file uploads"
                enabled={fieldConfig.file_upload.enabled}
                onToggle={() => toggleField('file_upload')}
              />
            </div>
          </div>

          {/* ── Custom Questions ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2 text-gray-700">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-sm uppercase tracking-wider">Custom Questions</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Add your own questions to the form. These appear on step 2.</p>
              </div>
              {!showAddQuestion && (
                <button onClick={() => setShowAddQuestion(true)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-bold transition flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            <div className="p-6">
              {showAddQuestion ? (
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
                  {customQuestions.length > 0 ? (
                    customQuestions.map((q) => (
                      <div key={q.id} className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 text-gray-400 rounded-lg group-hover:bg-white group-hover:text-indigo-500 transition">
                            <Layout className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{q.label} {q.required && <span className="text-red-500">*</span>}</p>
                            <p className="text-[11px] text-gray-400 uppercase font-medium">{q.type} field{q.type === 'select' && q.options?.length ? ` · ${q.options.length} options` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => { setNewQuestion(q); setEditingQuestionId(q.id); setShowAddQuestion(true); }} className="p-2 text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No custom questions yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Success Message ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-700">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-sm uppercase tracking-wider">Success Message</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Shown to customers after they submit the form.</p>
            </div>
            <div className="p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Message</label>
                <textarea
                  value={ctaSuccessMessage} onChange={(e) => setCtaSuccessMessage(e.target.value)}
                  rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                  placeholder="e.g. Thanks! We'll be in touch within 24 hours."
                />
                <p className="text-[11px] text-gray-400">Leave blank to use the default: "You're all set! 🎉"</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Live Preview ═══ */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            {/* Step tabs */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setPreviewStep(1)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  previewStep === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Step 1
              </button>
              <button
                onClick={() => setPreviewStep(2)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  previewStep === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Step 2
              </button>
            </div>

            {/* Phone frame */}
            <div className="bg-gray-900 rounded-[2.5rem] p-4 border-[8px] border-gray-800 shadow-2xl overflow-hidden aspect-[9/16] max-h-[720px] flex flex-col">
              <div className="bg-white rounded-[1.5rem] flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

                {previewStep === 1 ? (
                  <PreviewStep1
                    heading={company.cta_heading || ''}
                    categories={categories}
                    brandColor1={brandColor1}
                    brandColor2={brandColor2}
                    logoUrl={company.logo_url}
                    companyName={company.name}
                  />
                ) : (
                  <PreviewStep2
                    fieldConfig={fieldConfig}
                    customQuestions={customQuestions}
                    brandColor1={brandColor1}
                    brandColor2={brandColor2}
                    companyWebsite={company.website}
                    companyName={company.name}
                  />
                )}
              </div>
            </div>

            <p className="text-center mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Eye className="w-3 h-3" /> Live Preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Field Toggle Row ─────────────── */
function FieldToggle({
  icon: Icon,
  iconColor,
  label,
  description,
  enabled,
  onToggle,
  children,
}: {
  icon: any;
  iconColor: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`px-4 py-3 rounded-xl transition ${enabled ? 'bg-indigo-50/40' : ''}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${enabled ? iconColor : 'text-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${enabled ? 'text-gray-800' : 'text-gray-400'}`}>{label}</p>
          <p className="text-[11px] text-gray-400 truncate">{description}</p>
        </div>
        <button onClick={onToggle} className="flex-shrink-0">
          {enabled ? (
            <ToggleRight className="w-8 h-8 text-indigo-600" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-gray-300" />
          )}
        </button>
      </div>
      {children}
    </div>
  );
}

/* ─────────────── Question Editor ─────────────── */
function QuestionEditor({
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
    <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-indigo-600 uppercase mb-1.5">Question Label</label>
          <input
            type="text" value={question.label}
            onChange={(e) => onChange({ ...question, label: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
            placeholder="e.g. Budget Range"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-indigo-600 uppercase mb-1.5">Input Type</label>
          <div className="grid grid-cols-3 gap-2">
            {['text', 'select', 'checkbox'].map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...question, type: t as any, options: t === 'select' ? question.options : [] })}
                className={`py-2 text-xs font-bold rounded-lg border capitalize transition ${
                  question.type === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {question.type === 'select' && (
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-indigo-600 uppercase">Dropdown Options</label>
            <div className="space-y-2">
              {question.options?.map((opt, i) => (
                <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100">
                  <span className="text-sm">{opt}</span>
                  <button onClick={() => onChange({ ...question, options: question.options?.filter((_, idx) => idx !== i) })} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input type="text" value={newOption} onChange={(e) => onOptionChange(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200" placeholder="Add option..."
                  onKeyDown={(e) => { if (e.key === 'Enter' && newOption) { onChange({ ...question, options: [...(question.options || []), newOption] }); onOptionChange(''); } }}
                />
                <button onClick={() => { if (newOption) { onChange({ ...question, options: [...(question.options || []), newOption] }); onOptionChange(''); } }} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">Add</button>
              </div>
            </div>
          </div>
        )}

        <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer">
          <input type="checkbox" checked={question.required}
            onChange={(e) => onChange({ ...question, required: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Mark as required field</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onSave} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
          {isEditing ? 'Update Field' : 'Save Field'}
        </button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Preview: Step 1 ─────────────── */
function PreviewStep1({
  heading,
  categories,
  brandColor1,
  brandColor2,
  logoUrl,
  companyName,
}: {
  heading: string;
  categories: Category[];
  brandColor1: string;
  brandColor2: string;
  logoUrl?: string | null;
  companyName?: string;
}) {
  const inputClass = "w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-gray-400 text-xs flex items-center";

  return (
    <div>
      {/* Header */}
      <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
        <div className="w-8 h-0.5 bg-white/20 rounded-full mx-auto mb-4" />
        {logoUrl && <img src={logoUrl} alt="" className="h-8 w-auto object-contain mb-3" />}
        <h3 className="text-base font-bold leading-tight">{heading || 'Request a Free Quote'}</h3>
      </div>

      {/* Step indicator */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 text-[10px]">
          <div className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: brandColor1 }}>1</div>
          <span className="font-semibold" style={{ color: brandColor1 }}>Your Info</span>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 text-[10px] font-bold flex items-center justify-center">2</div>
          <span className="text-gray-400">Details</span>
        </div>
      </div>

      {/* Fields */}
      <div className="px-5 pb-5 space-y-4">
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

        <PreviewField icon={<FileText className="w-3 h-3 text-purple-500" />} label="Description" required>
          <div className="w-full h-16 bg-gray-50 border border-gray-200 rounded-lg px-3 pt-2 text-gray-400 text-xs">
            Describe your project...
          </div>
        </PreviewField>

        <button
          className="w-full py-2.5 text-white rounded-lg font-bold text-xs shadow-md"
          style={{ background: `linear-gradient(to right, ${brandColor1}, ${brandColor2})` }}
        >
          Submit & Add Details →
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Preview: Step 2 ─────────────── */
function PreviewStep2({
  fieldConfig,
  customQuestions,
  brandColor1,
  brandColor2,
  companyWebsite,
  companyName,
}: {
  fieldConfig: FieldConfig;
  customQuestions: CustomQuestion[];
  brandColor1: string;
  brandColor2: string;
  companyWebsite?: string | null;
  companyName?: string;
}) {
  const inputClass = "w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-gray-400 text-xs flex items-center";
  const hasAnything = fieldConfig.address.enabled || fieldConfig.preferred_date.enabled ||
    fieldConfig.preferred_time.enabled || fieldConfig.lead_source.enabled ||
    fieldConfig.file_upload.enabled || customQuestions.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="p-5 text-white rounded-t-[1.5rem]" style={{ background: `linear-gradient(to right, ${brandColor1}, ${brandColor2})` }}>
        <div className="flex items-center gap-2 text-[10px] mb-2">
          <div className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">✓</div>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <div className="w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: brandColor1 }}>2</div>
        </div>
        <h3 className="text-base font-bold">Request saved! 🎉</h3>
        <p className="text-white/70 text-[11px] mt-1">Add a few more details — all optional.</p>
      </div>

      <div className="px-5 pb-5 space-y-4 pt-4">
        {!hasAnything && (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-xs">No optional fields enabled</p>
            <p className="text-gray-300 text-[10px] mt-1">Toggle fields on to see them here</p>
          </div>
        )}

        {/* Address */}
        {fieldConfig.address.enabled && (
          <>
            <PreviewField icon={<MapPin className="w-3 h-3 text-red-500" />} label="Address" required={fieldConfig.address.required}>
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

        {/* Date & Time */}
        {(fieldConfig.preferred_date.enabled || fieldConfig.preferred_time.enabled) && (
          <div className="grid grid-cols-2 gap-2">
            {fieldConfig.preferred_date.enabled && (
              <PreviewField icon={<Calendar className="w-3 h-3 text-emerald-500" />} label="Preferred Date">
                <div className={inputClass}>mm/dd/yyyy</div>
              </PreviewField>
            )}
            {fieldConfig.preferred_time.enabled && (
              <PreviewField icon={<Clock className="w-3 h-3 text-blue-500" />} label="Preferred Time">
                <div className={inputClass}>Morning, 2PM...</div>
              </PreviewField>
            )}
          </div>
        )}

        {/* Custom Questions */}
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
                <div className="flex-1 flex items-center gap-2 p-2 border border-gray-200 rounded-lg text-[10px] text-gray-500">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-300" /> Yes
                </div>
                <div className="flex-1 flex items-center gap-2 p-2 border border-gray-200 rounded-lg text-[10px] text-gray-500">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-300" /> No
                </div>
              </div>
            )}
          </PreviewField>
        ))}

        {/* Lead Source */}
        {fieldConfig.lead_source.enabled && (
          <PreviewField icon={<HelpCircle className="w-3 h-3 text-purple-500" />} label="How did you hear about us?">
            <div className={`${inputClass} justify-between`}>
              <span>Select one...</span>
              <ChevronRight className="w-3 h-3 rotate-90" />
            </div>
          </PreviewField>
        )}

        {/* File Upload */}
        {fieldConfig.file_upload.enabled && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ImageIcon className="w-3 h-3 text-pink-500" />
              <span className="text-[11px] font-semibold text-gray-700">Photos or Videos</span>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <ImageIcon className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-500">Click or drag files here</p>
              <p className="text-[9px] text-gray-400">Max 50MB per file</p>
            </div>
          </div>
        )}

        {hasAnything && (
          <button
            className="w-full py-2.5 text-white rounded-lg font-bold text-xs shadow-md"
            style={{ background: `linear-gradient(to right, ${brandColor1}, ${brandColor2})` }}
          >
            Submit Details
          </button>
        )}

        {companyWebsite && (
          <div className="text-center pt-2 border-t border-gray-50">
            <span className="text-[9px] text-gray-300 underline">
              Visit {companyName || 'our'} website
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Preview Field Helper ─────────────── */
function PreviewField({
  icon,
  label,
  required,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  children: React.ReactNode;
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