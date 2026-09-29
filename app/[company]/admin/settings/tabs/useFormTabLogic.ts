'use client';

import { useState, useEffect } from 'react';
import { can, type PlanTier } from '@/lib/permissions';
import { resolveFieldConfig, defaultFieldConfig } from '@/lib/formFields';

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

// Kept for backwards compatibility with anything that imports it, but it's
// now derived from the single shared default in lib/formFields.ts rather
// than being its own separate definition. Settings used to assume its own
// defaults here while signup, the public form and Create Lead each assumed
// different ones, which is what caused the "fields only work after you
// toggle them off and on" bug.
export const DEFAULT_FIELD_CONFIG: FieldConfig = defaultFieldConfig(null);

export const REQUIRED_PLAN = { label: 'Basic', price: '$49.99/mo' };

export function useFormTabLogic(company: any) {
  // FIXED: defaulted to 'basic' (a paid plan) when plan_tier was missing,
  // which unlocked photo uploads. Every other part of the app defaults to 'free'.
  const planTier = (company.plan_tier ?? 'free') as PlanTier;
  const canUsePhotoUpload = can(planTier, 'customer_video_upload');
  const canUseCustomQuestions = can(planTier, 'custom_form_questions');
  // Field toggles are a Basic feature (lib/permissions: customize_form).
  // Free companies get the basic form only, and the public form never shows
  // Step 2 for them — so the toggles must be locked here too, not just photos.
  const canCustomizeForm = can(planTier, 'customize_form');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Resolved through the same shared function the public form, Create Lead
  // and signup use, so what these toggles show is exactly what customers see.
  // Handles a missing config, missing keys, and JSON stored as a string.
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>(() =>
    resolveFieldConfig(company.form_field_config, {
      planTier,
      businessType: company.business_type,
    }) as FieldConfig
  );

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
  // they're presented (and toggled) as one combined field. Both keys are
  // kept in the underlying config and save payload in lockstep, since the
  // public booking form reads them as separate fields.
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
    Number(fieldConfig.preferred_date.enabled) + // covers date & time together
    Number(fieldConfig.lead_source.enabled) +
    Number(fieldConfig.file_upload.enabled) +
    (canUseCustomQuestions ? customQuestions.length : 0);

  return {
    planTier,
    canUsePhotoUpload,
    canUseCustomQuestions,
    canCustomizeForm,
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