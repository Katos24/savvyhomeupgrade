'use client';

import { useState, useEffect } from 'react';
import { upload } from '@vercel/blob/client';
import { compressImages } from '@/lib/compressImage';
import Toast from '@/components/Toast';
import { CATEGORY_MAP, ADDRESS_CONFIG, type Category } from '@/lib/formCategories';
import UploadFormStepOne from '@/components/UploadFormStepOne';
import UploadFormStepTwo from '@/components/UploadFormStepTwo';

type ToastType = {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
};

type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  website?: string | null;
  business_type?: string;
  logo_url?: string | null;
  form_categories?: Category[];
  address_enabled?: boolean | null;
  address_required?: boolean;
  cta_heading?: string | null;
  cta_button_text?: string | null;
  cta_success_message?: string | null;
  custom_questions?: CustomQuestion[];
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
};

interface UploadFormProps {
  company?: Company;
  companySlug?: string;
  companyId?: number;
  showHeader?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
}

export default function UploadForm({
  company,
  companySlug,
  companyId,
  showHeader = true,
  headerTitle = 'Submit Your Project',
  headerSubtitle = 'Upload photos or videos and get a fast, accurate assessment',
}: UploadFormProps) {

  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [savedLeadId, setSavedLeadId] = useState<number | null>(null);

  // Step 1 fields
  const [step1Data, setStep1Data] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    description: '',
  });

  // Step 2 fields
  const [step2Data, setStep2Data] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    zip_code: '',
    lead_source: '',
    preferred_date: '',
    preferred_time: '',
  });

  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const [submittingStep1, setSubmittingStep1] = useState(false);
  const [submittingStep2, setSubmittingStep2] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [step1Error, setStep1Error] = useState('');
  const [step2Error, setStep2Error] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const businessType = company?.business_type || 'general';
  const categories: Category[] =
    company?.form_categories && company.form_categories.length > 0
      ? company.form_categories
      : CATEGORY_MAP[businessType] || CATEGORY_MAP.general;

  const finalCompanySlug = company?.slug || companySlug;
  const finalCompanyId = company?.id || companyId;
  const customQuestions = company?.custom_questions || [];

  const getAddressConfig = () => {
    if (company?.address_enabled !== null && company?.address_enabled !== undefined) {
      return { show: company.address_enabled, required: false };
    }
    const config = ADDRESS_CONFIG[businessType] || { show: false, required: false };
    return { ...config, required: false };
  };
  const addressConfig = getAddressConfig();

  const getCtaHeading = () => {
    if (company?.cta_heading) return company.cta_heading;
    switch (businessType) {
      case 'restaurant': return 'Order Your Custom Meal';
      case 'salon': return 'Book Your Appointment';
      case 'photography': return 'Request a Photo Session';
      default: return headerTitle;
    }
  };

  const getCtaButtonText = () => {
    if (company?.cta_button_text) return company.cta_button_text;
    switch (businessType) {
      case 'restaurant': return 'Place Order';
      case 'salon': return 'Book Appointment';
      case 'photography': return 'Request Session';
      default: return 'Submit Project';
    }
  };

  // ─── Toasts ───
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ─── File previews ───
  useEffect(() => {
    const previews = files.map(f => f.type.startsWith('image/') ? URL.createObjectURL(f) : '');
    setFilePreviews(previews);
    return () => previews.forEach(url => { if (url) URL.revokeObjectURL(url); });
  }, [files]);

  // ─── File helpers ───
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > 50 * 1024 * 1024) return { valid: false, error: `${file.name} is too large (max 50MB)` };
    if (file.type.startsWith('video/') && file.size > 30 * 1024 * 1024)
      return { valid: false, error: `${file.name} video is too large` };
    return { valid: true };
  };

  const processFiles = async (rawFiles: File[]) => {
    const valid: File[] = [];
    rawFiles.forEach(f => {
      const v = validateFile(f);
      if (v.valid) valid.push(f);
      else showToast(v.error!, 'error');
    });
    if (!valid.length) return;
    setCompressing(true);
    try {
      const compressed = await compressImages(valid);
      setFiles(prev => [...prev, ...compressed]);
      showToast(`${compressed.length} file(s) added`, 'success');
    } catch {
      showToast('Failed to process files. Please try again.', 'error');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await processFiles(Array.from(e.target.files));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    await processFiles(
      Array.from(e.dataTransfer.files).filter(
        f => f.type.startsWith('image/') || f.type.startsWith('video/')
      )
    );
  };

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const removeFile = (i: number) => { setFiles(f => f.filter((_, idx) => idx !== i)); showToast('File removed', 'info'); };

  // ─── Step 1: save lead immediately ───
  const handleStep1Submit = async () => {
    setStep1Error('');

    if (!step1Data.name || !step1Data.email || !step1Data.phone || !step1Data.category || !step1Data.description) {
      setStep1Error('Please fill in all required fields');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const rawPhone = step1Data.phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      setStep1Error('Please enter a valid 10-digit phone number');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!finalCompanySlug || !finalCompanyId) {
      setStep1Error('Company information is missing. Please refresh and try again.');
      return;
    }

    setSubmittingStep1(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: step1Data.name,
          email: step1Data.email,
          phone: rawPhone,
          category: step1Data.category,
          description: step1Data.description,
          file_urls: [],
          company_slug: finalCompanySlug,
          company_id: finalCompanyId,
          lead_source: null,
          custom_answers: {},
        }),
      });

      if (!res.ok) throw new Error(`Submission failed (${res.status}). Please try again.`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Submission failed.');

      setSavedLeadId(result.leadId);
      setStep(2);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit. Please try again.';
      setStep1Error(msg);
      showToast(msg, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmittingStep1(false);
    }
  };

  // ─── Step 2: update existing lead ───
  const handleStep2Submit = async () => {
    setStep2Error('');
    setSubmittingStep2(true);

    try {
      const uploadedFiles = [];
      if (files.length > 0) {
        setUploadProgress(`Uploading ${files.length} files...`);
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
          const blob = await upload(`${Date.now()}-${files[i].name}`, files[i], {
            access: 'public',
            handleUploadUrl: '/api/blob-upload',
          });
          uploadedFiles.push({ url: blob.url, name: files[i].name, type: files[i].type, size: files[i].size });
        }
      }

      setUploadProgress('Saving details...');

      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_lead_step2',
          id: savedLeadId,
          address_line_1: step2Data.address_line_1 || null,
          address_line_2: step2Data.address_line_2 || null,
          city: step2Data.city || null,
          zip_code: step2Data.zip_code || null,
          lead_source: step2Data.lead_source || null,
          preferred_date: step2Data.preferred_date || null,
          preferred_time: step2Data.preferred_time || null,
          custom_answers: customAnswers,
          file_urls: uploadedFiles,
        }),
      });

      if (!res.ok) throw new Error('Failed to save details.');
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to save details.');

      setStep('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setStep2Error(msg);
      showToast(msg, 'error');
    } finally {
      setSubmittingStep2(false);
      setUploadProgress('');
    }
  };

  const handleSkip = () => setStep('success');

  // ─── Success screen ───
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8fafc' }}>
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {company?.cta_success_message || "You're all set! 🎉"}
            </h2>
            <p className="text-gray-500 text-base mb-6">
              We've received your request and will be in touch shortly.
            </p>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-blue-700 text-sm font-medium">
                📱 Keep an eye on your phone and email — we'll reach out soon!
              </p>
            </div>
            {company?.website && (
              <a
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 text-sm text-gray-400 hover:text-gray-600 transition underline underline-offset-2"
              >
                Visit {company.name}'s website
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      {/* Step 1 — always the base layer */}
      <div className={step === 2 ? 'pointer-events-none select-none' : ''}>
        <UploadFormStepOne
          formData={step1Data}
          categories={categories}
          onChange={(field, value) => setStep1Data(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleStep1Submit}
          submitting={submittingStep1}
          error={step1Error}
          ctaHeading={getCtaHeading()}
          headerSubtitle={headerSubtitle}
          logoUrl={company?.logo_url}
          companyName={company?.name}
          companyWebsite={company?.website}
          brandColor1={company?.email_brand_color_1}
          brandColor2={company?.email_brand_color_2}
          showHeader={showHeader}
        />
      </div>

      {/* Step 2 — modal overlay */}
      {step === 2 && (
        <UploadFormStepTwo
          formData={step2Data}
          customAnswers={customAnswers}
          customQuestions={customQuestions}
          files={files}
          filePreviews={filePreviews}
          submitting={submittingStep2}
          compressing={compressing}
          uploadProgress={uploadProgress}
          error={step2Error}
          addressConfig={addressConfig}
          ctaButtonText={getCtaButtonText()}
          brandColor1={company?.email_brand_color_1}
          brandColor2={company?.email_brand_color_2}
          companyWebsite={company?.website}
          companyName={company?.name}
          isDragging={isDragging}
          onChange={(field, value) => setStep2Data(prev => ({ ...prev, [field]: value }))}
          onCustomAnswerChange={(qId, val) => setCustomAnswers(prev => ({ ...prev, [qId]: val }))}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onRemoveFile={removeFile}
          onSubmit={handleStep2Submit}
          onSkip={handleSkip}
        />
      )}
    </>
  );
}