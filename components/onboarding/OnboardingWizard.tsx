'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { STEPS } from './types';
import type { Category } from './types';
import CompanyStep, { type CompanyStepRef } from './steps/CompanyStep';
import CategoriesStep, { type CategoriesStepRef } from './steps/CategoriesStep';
import PipelineStep, { type PipelineStepRef } from './steps/PipelineStep';
import FormStep, { type FormStepRef } from './steps/FormStep';
import QuotesStep from './steps/QuotesStep';
import DoneStep from './steps/DoneStep';

export default function OnboardingWizard({ company }: { company: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Track categories for the quotes step (needs them for the category picker)
  const [latestCategories, setLatestCategories] = useState<Category[]>(
    company.form_categories?.length > 0 ? company.form_categories : []
  );

  const companyRef = useRef<CompanyStepRef>(null);
  const categoriesRef = useRef<CategoriesStepRef>(null);
  const pipelineRef = useRef<PipelineStepRef>(null);
  const formRef = useRef<FormStepRef>(null);

  const showErr = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  // ── SAVE FUNCTIONS ──

  const saveCompanyInfo = async (): Promise<boolean> => {
    const data = companyRef.current?.getData();
    if (!data) return false;
    if (!data.name.trim()) { showErr('Company name is required'); return false; }
    setSaving(true); setError('');
    try {
      let logoUrl = company.logo_url;
      if (data.logoFile) {
        const fd = new FormData();
        fd.append('logo', data.logoFile);
        fd.append('companySlug', company.slug);
        const uploadRes = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.success) logoUrl = uploadData.logoUrl;
      }
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-general',
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            website: data.website,
            email_brand_color_1: data.email_brand_color_1,
            email_brand_color_2: data.email_brand_color_2,
            logo_url: logoUrl,
          },
        }),
      });
      const result = await res.json();
      if (!result.success) { showErr(result.error || 'Failed to save'); return false; }
      return true;
    } catch { showErr('Failed to save'); return false; }
    finally { setSaving(false); }
  };

  const saveCategories = async (): Promise<boolean> => {
    const data = categoriesRef.current?.getData();
    if (!data) return false;
    if (data.categories.length < 3) { showErr('You need at least 3 categories'); return false; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-categories', data: { form_categories: data.categories } }),
      });
      const result = await res.json();
      if (!result.success) { showErr(result.error || 'Failed to save'); return false; }
      setLatestCategories(data.categories);
      return true;
    } catch { showErr('Failed to save'); return false; }
    finally { setSaving(false); }
  };

  const savePipeline = async (): Promise<boolean> => {
    const data = pipelineRef.current?.getData();
    if (!data) return false;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-pipeline', data: { status_options: data.statuses } }),
      });
      const result = await res.json();
      if (!result.success) { showErr(result.error || 'Failed to save'); return false; }
      return true;
    } catch { showErr('Failed to save'); return false; }
    finally { setSaving(false); }
  };

  const saveForm = async (): Promise<boolean> => {
    const data = formRef.current?.getData();
    if (!data) return false;
    setSaving(true); setError('');
    try {
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-cta', data: { cta_heading: data.ctaHeading, cta_success_message: data.ctaSuccessMessage } }),
      });
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-custom-questions', data: { custom_questions: data.customQuestions } }),
      });
      return true;
    } catch { showErr('Failed to save'); return false; }
    finally { setSaving(false); }
  };

  const handleNext = async () => {
    let ok = true;
    if (currentStep === 0) ok = await saveCompanyInfo();
    else if (currentStep === 1) ok = await saveCategories();
    else if (currentStep === 2) ok = await savePipeline();
    else if (currentStep === 3) ok = await saveForm();
    // Step 4 (quotes) saves inline via its own modal
    if (ok) setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const handleSkip = () => {
    // When skipping categories, still grab them for quotes step
    if (currentStep === 1) {
      const data = categoriesRef.current?.getData();
      if (data) setLatestCategories(data.categories);
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const isDone = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 border-b border-white/10" style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">L2P</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">Set Up Your Account</h1>
                <p className="text-white/40 text-xs">Step {currentStep + 1} of {STEPS.length}</p>
              </div>
            </div>
            {!isDone && (
              <button onClick={handleSkip} className="text-white/40 hover:text-white/70 text-xs font-semibold transition">
                Skip this step →
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: i < currentStep ? '100%' : i === currentStep ? '50%' : '0%',
                      background: i <= currentStep ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'transparent',
                    }}
                  />
                </div>
                <span className="text-xs font-semibold hidden sm:block"
                  style={{ color: i <= currentStep ? '#a5b4fc' : 'rgba(255,255,255,0.2)' }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">

        {/* Step header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{STEPS[currentStep].icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{STEPS[currentStep].label}</h2>
              <p className="text-sm text-white/40">{STEPS[currentStep].desc}</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        {currentStep === 0 && <CompanyStep ref={companyRef} company={company} />}
        {currentStep === 1 && <CategoriesStep ref={categoriesRef} company={company} showErr={showErr} />}
        {currentStep === 2 && <PipelineStep ref={pipelineRef} company={company} showErr={showErr} />}
        {currentStep === 3 && <FormStep ref={formRef} company={company} showErr={showErr} />}
        {currentStep === 4 && <QuotesStep company={company} categories={latestCategories} showErr={showErr} />}
        {currentStep === 5 && <DoneStep company={company} />}
      </div>

      {/* ── BOTTOM NAV ── */}
      {!isDone && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <button onClick={handleBack}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-lg transition flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}
            <button onClick={handleNext} disabled={saving}
              className="px-8 py-2.5 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : currentStep === 4 ? (
                <>Finish Setup <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Save & Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}