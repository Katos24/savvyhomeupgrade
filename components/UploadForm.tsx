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

  // ─── Field Config ───
  // Use form_field_config if available, otherwise fall back to legacy fields
  const fieldConfig: FieldConfig = company?.form_field_config || {
    address: {
      enabled: company?.address_enabled ?? (ADDRESS_CONFIG[businessType]?.show ?? false),
      required: company?.address_required ?? false,
    },
    preferred_date: { enabled: true },
    preferred_time: { enabled: true },
    lead_source: { enabled: true },
    file_upload: { enabled: true },
  };

  // Check if step 2 has anything to show
  const hasStep2Content = fieldConfig.address.enabled ||
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

    // If step 2 has nothing to show, skip straight to success
    if (!hasStep2Content) {
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

        setStep('success');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to submit. Please try again.';
        setStep1Error(msg);
        showToast(msg, 'error');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setSubmittingStep1(false);
      }
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


// ─── Success screen (Full Page Takeover) ───
if (step === 'success') {
  const brandColor1 = company?.email_brand_color_1 || '#2563eb';
  const brandColor2 = company?.email_brand_color_2 || '#7c3aed';
  const websiteUrl = company?.website
    ? (company.website.startsWith('http') ? company.website : `https://${company.website}`)
    : null;

  return (
    // We use fixed inset-0 to ensure it covers EVERY header/hero from the previous steps
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fafaf9] overflow-y-auto py-12">
      
      {/* --- Massive Background Orbs (Higher Opacity) --- */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.2] pointer-events-none animate-pulse"
        style={{ background: brandColor1 }}
      />
      <div 
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.2] pointer-events-none animate-pulse"
        style={{ background: brandColor2 }}
      />

      <div className="relative w-full max-w-xl px-6 text-center animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo at the top */}
        {company?.logo_url && (
          <div className="mb-10 flex justify-center">
            <img src={company.logo_url} alt={company.name} className="h-12 w-auto object-contain" />
          </div>
        )}

        {/* Animated Checkmark Circle */}
        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}>
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[draw_0.6s_ease-out_forwards]" style={{ strokeDasharray: 50, strokeDashoffset: 50 }} />
          </svg>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">
          {company?.cta_success_message || "Request Received!"}
        </h2>
        
        <p className="text-gray-500 text-lg md:text-xl font-medium mb-12">
          Thanks, {step1Data.name.split(' ')[0]}! We're on it.
        </p>

        {/* Info Cards - Simplified & Modern */}
        <div className="grid gap-4 mb-12">
          <div className="flex items-center gap-5 p-6 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-left">
            <div className="text-3xl">📬</div>
            <div>
              <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Confirmation Sent</p>
              <p className="text-gray-500">Check your email for project details.</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-6 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-left">
            <div className="text-3xl">📞</div>
            <div>
              <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Fast Estimate</p>
              <p className="text-gray-500">We'll reach out to your {step1Data.phone ? 'phone' : 'email'} shortly.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {websiteUrl && (
            <a
              href={websiteUrl}
              className="group w-full inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-white text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl hover:shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
            >
              Visit {company?.name || 'Home'}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            className="block w-full py-4 text-xs font-bold text-gray-400 hover:text-gray-900 transition tracking-[0.2em] uppercase"
          >
            Submit Another Request
          </button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 text-gray-300">
           <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Secure Submission • Lead2Project</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes draw { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

  // ─── Default Return (Header + Hero + Steps) ───
  return (
    <div className="min-h-screen bg-slate-50">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      {/* Branded Header */}
      {showHeader && company && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="h-10 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {company.name.charAt(0)}
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
            </div>
            <span className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest">
              Powered by Lead2Project
            </span>
          </div>
        </header>
      )}

      {/* Branded Hero */}
      {showHeader && company && (
        <div 
          className="text-white py-16 px-6"
          style={{
            background: `linear-gradient(to right, ${company.email_brand_color_1 || '#3b82f6'}, ${company.email_brand_color_2 || '#8b5cf6'})`
          }}
        >
          <div className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              {getCtaHeading()}
            </h1>
            <p className="text-xl opacity-90 font-medium">
              {headerSubtitle}
            </p>
          </div>
        </div>
      )}

      {/* Form Steps */}
      <main className="py-12 px-4 max-w-4xl mx-auto">
        <div className={step === 2 ? 'pointer-events-none opacity-20 blur-sm scale-95 transition-all duration-500' : 'transition-all duration-500'}>
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
            showHeader={false} // Disable internal header to use parent header
            hasStep2={hasStep2Content}
          />
        </div>

        {step === 2 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            </div>
          </div>
        )}
      </main>
    </div>
  );

}