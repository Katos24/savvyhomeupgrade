'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { compressImages } from '@/lib/compressImage';
import Toast from '@/components/Toast';
import { CATEGORY_MAP, ADDRESS_CONFIG, type Category } from '@/lib/formCategories';
import { FormHeader, FormHero } from '@/components/FormBranding';
import UploadFormStepOne from '@/components/UploadFormStepOne';
import UploadFormStepTwo from '@/components/UploadFormStepTwo';

type ToastType = { message: string; type: 'success' | 'error' | 'info'; id: number };

type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

type FieldConfig = {
  address: { enabled: boolean; required: boolean };
  preferred_date: { enabled: boolean };
  preferred_time: { enabled: boolean };
  lead_source: { enabled: boolean };
  file_upload: { enabled: boolean };
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
  form_field_config?: FieldConfig | null;
  plan_tier?: string | null;
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
  headerTitle = 'Submit Your Request',
  headerSubtitle = 'Fast, professional service tailored to your needs.',
}: UploadFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [savedLeadId, setSavedLeadId] = useState<number | null>(null);

  const [step1Data, setStep1Data] = useState({
    name: '', email: '', phone: '', category: '', description: '',
  });
  const [step2Data, setStep2Data] = useState({
    address_line_1: '', address_line_2: '', city: '', zip_code: '',
    lead_source: '', preferred_date: '', preferred_time: '',
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
 const isFree = company?.plan_tier === 'free';
  const categories: Category[] = company?.form_categories?.length
    ? company.form_categories
    : CATEGORY_MAP[businessType] || CATEGORY_MAP.general;

  const finalCompanySlug = company?.slug || companySlug;
  const finalCompanyId = company?.id || companyId;
  const customQuestions = company?.custom_questions || [];

  const isStarterPlan = company?.plan_tier === 'free';

  const baseFieldConfig: FieldConfig = company?.form_field_config || {
    address: {
      enabled: company?.address_enabled ?? (ADDRESS_CONFIG[businessType]?.show ?? false),
      required: company?.address_required ?? false,
    },
    preferred_date: { enabled: false },
    preferred_time: { enabled: false },
    lead_source: { enabled: true },
    file_upload: { enabled: true },
  };

  // Starter plan cannot collect photos/videos on the customer form
  const fieldConfig: FieldConfig = {
    ...baseFieldConfig,
    file_upload: {
      enabled: isStarterPlan ? false : baseFieldConfig.file_upload.enabled,
    },
  };

  const hasStep2Content = isFree
    ? false
    : fieldConfig.address.enabled ||
      fieldConfig.preferred_date.enabled ||
      fieldConfig.preferred_time.enabled ||
      fieldConfig.lead_source.enabled ||
      fieldConfig.file_upload.enabled ||
      customQuestions.length > 0;

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
    return 'Submit Details';
  };

  // File previews
  useEffect(() => {
    const previews = files.map(f =>
      f.type.startsWith('image/') ? URL.createObjectURL(f) : ''
    );
    setFilePreviews(previews);
    return () => previews.forEach(url => { if (url) URL.revokeObjectURL(url); });
  }, [files]);

  const showToast = (message: string, type: ToastType['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const validateFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) return { valid: false, error: `${file.name} is too large (max 50MB)` };
    if (file.type.startsWith('video/') && file.size > 30 * 1024 * 1024)
      return { valid: false, error: `${file.name} video is too large (max 30MB)` };
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
    await processFiles(Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    ));
  };
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const removeFile = (i: number) => { setFiles(f => f.filter((_, idx) => idx !== i)); };

  // Redirect to /success after any successful submission
  const [showSuccess, setShowSuccess] = useState(false);

 const handleSuccess = () => {
    router.push(`/${finalCompanySlug}/success`);
  };

  // Step 1 submit
  const handleStep1Submit = async () => {
    setStep1Error('');
    const { name, email, phone, category, description } = step1Data;
    if (!name || !email || !phone || !category || !description) {
      setStep1Error('Please fill in all required fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      setStep1Error('Please enter a valid 10-digit phone number.');
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
          name, email, phone: rawPhone, category, description,
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

      if (!hasStep2Content) {
        handleSuccess();
        return;
      }

      setSavedLeadId(result.leadId);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit. Please try again.';
      setStep1Error(msg);
      showToast(msg, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmittingStep1(false);
    }
  };

  // Step 2 submit
  const handleStep2Submit = async () => {
    setStep2Error('');
    setSubmittingStep2(true);
    try {
      const uploadedFiles: any[] = [];
      if (files.length > 0) {
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
      handleSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setStep2Error(msg);
      showToast(msg, 'error');
    } finally {
      setSubmittingStep2(false);
      setUploadProgress('');
    }
  };

  const handleSkip = () => handleSuccess();

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] px-4">
        <div className="text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h1>
          <p className="text-slate-500 text-sm">Check your inbox for a confirmation email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toasts.map(toast => (
  <Toast 
    key={toast.id} 
    message={toast.message} 
    type={toast.type} 
    onClose={() => removeToast(toast.id)} 
    darkText={true} // <--- ADD THIS LINE
  />
))}

       {showHeader && company && !isFree && (
        <>
          <FormHeader company={company} />
          {step === 1 && <FormHero company={company} ctaHeading={getCtaHeading()} />}
        </>
      )}

     <main className="pb-16">
        {step === 1 && (
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
            showHeader={false}
            hasStep2={hasStep2Content}
            businessType={businessType}
          />
        )}
      </main>

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
          addressConfig={{ show: fieldConfig.address.enabled, required: fieldConfig.address.required }}
          fieldConfig={fieldConfig}
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
    </div>
  );
}