'use client';

import { useState, useEffect } from 'react';
import { can, type PlanTier } from '@/lib/permissions';

export type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

export type Category = { emoji?: string; label: string; value: string };
export type FieldConfigItem = { enabled: boolean; required?: boolean };

export type FieldConfig = {
  address: FieldConfigItem & { required: boolean };
  preferred_date: FieldConfigItem;
  preferred_time: FieldConfigItem;
  lead_source: FieldConfigItem;
  file_upload: FieldConfigItem;
};

export const DEFAULT_FIELD_CONFIG: FieldConfig = {
  address: { enabled: true, required: false },
  preferred_date: { enabled: true },
  preferred_time: { enabled: true },
  lead_source: { enabled: true },
  file_upload: { enabled: false },
};

export const REQUIRED_PLAN = { label: 'Basic', price: '$49.99/mo' };

export function useFormTabLogic(company: any) {
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

  const enabledCount =
    Number(fieldConfig.address.enabled) +
    Number(fieldConfig.preferred_date.enabled) + // covers date & time together now
    Number(fieldConfig.lead_source.enabled) +
    Number(fieldConfig.file_upload.enabled) +
    (canUseCustomQuestions ? customQuestions.length : 0);

  return {
    planTier,
    canUsePhotoUpload,
    canUseCustomQuestions,
    loading,
    status,
    customQuestions,
    setCustomQuestions,
    isPreviewOpen,
    setIsPreviewOpen,
    fieldConfig,
    showAddQuestion,
    setShowAddQuestion,
    editingQuestionId,
    setEditingQuestionId,
    newQuestion,
    setNewQuestion,
    newOption,
    setNewOption,
    linkCopied,
    setLinkCopied,
    publicUrl,
    isDirty,
    categories,
    brandColor1,
    brandColor2,
    getCtaHeading,
    toggleField,
    togglePreferredDateTime,
    handleSaveAll,
    addOrUpdateQuestion,
    resetForm,
    enabledCount,
  };
}