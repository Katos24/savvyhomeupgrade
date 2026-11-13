'use client';

import { useState, useEffect, useRef } from 'react';
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
// than being its own separate definition.
export const DEFAULT_FIELD_CONFIG: FieldConfig = defaultFieldConfig(null);

export const REQUIRED_PLAN = { label: 'Pro', price: '$49.99/mo' };

export function useFormTabLogic(company: any, options: { autoSave?: boolean } = {}) {
  const { autoSave = false } = options;

  // Defaults to 'free' when plan_tier is missing, like the rest of the app.
  const planTier = (company.plan_tier ?? 'free') as PlanTier;
  const canUsePhotoUpload = can(planTier, 'customer_video_upload');
  const canUseCustomQuestions = can(planTier, 'custom_form_questions');
  // Field toggles are a paid feature (lib/permissions: customize_form).
  const canCustomizeForm = can(planTier, 'customize_form');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [ctaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Same shared resolver the public form, Create Lead and signup use.
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

  const currentSnapshot = JSON.stringify({ fieldConfig, customQuestions });
  const [savedSnapshot, setSavedSnapshot] = useState(() => currentSnapshot);
  const isDirty = currentSnapshot !== savedSnapshot;

  // Goes up by one after every successful save, so a live preview of the
  // form can reload and show the change.
  const [savedVersion, setSavedVersion] = useState(0);

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

  const brandColor1 = company.email_brand_color_1 || '#0f172a';
  const brandColor2 = company.email_brand_color_2 || brandColor1;

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

  // Date and time are shown and toggled as one "Timing" field; both keys
  // are kept in lockstep because the public form reads them separately.
  const togglePreferredDateTime = () =>
    setFieldConfig((prev) => {
      const next = !prev.preferred_date.enabled;
      return { ...prev, preferred_date: { enabled: next }, preferred_time: { enabled: next } };
    });

  const handleSaveAll = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });
    const snapshotBeingSaved = JSON.stringify({ fieldConfig, customQuestions });

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
      setSavedSnapshot(snapshotBeingSaved);
      setSavedVersion((v) => v + 1);
      setStatus({ type: 'success', message: autoSave ? 'Saved' : 'Form settings saved!' });
      setTimeout(() => setStatus((s) => (s.type === 'success' ? { type: null, message: '' } : s)), autoSave ? 1500 : 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong — please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-save: a short pause after the last switch flip, then save. Keeps
  // the latest handleSaveAll in a ref so the timer never saves stale values.
  const saveRef = useRef(handleSaveAll);
  saveRef.current = handleSaveAll;
  const lastFailedSnapshot = useRef<string | null>(null);
  useEffect(() => {
    if (!autoSave || !isDirty || loading) return;
    // Don't retry the exact same change in a loop after an error; the
    // contractor can tap "Try again".
    if (lastFailedSnapshot.current === currentSnapshot) return;
    const timer = setTimeout(async () => {
      await saveRef.current();
    }, 450);
    return () => clearTimeout(timer);
  }, [autoSave, isDirty, loading, currentSnapshot]);
  useEffect(() => {
    if (status.type === 'error') lastFailedSnapshot.current = currentSnapshot;
    if (status.type === 'success') lastFailedSnapshot.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.type]);

  const retrySave = () => {
    lastFailedSnapshot.current = null;
    handleSaveAll();
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
    savedVersion,
    autoSave,
    retrySave,
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