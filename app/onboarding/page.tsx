'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCodeLib from 'qrcode';
import {
  Building, Phone, ChevronLeft, ChevronRight,
  AlertCircle, ArrowRight, Loader2, X, Plus,
  Copy, Check, Sparkles, Mail, Camera, Settings2,
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Category = { value: string; label: string; emoji?: string };

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
};

const STEPS = [
  { id: 'company',    label: 'Your Business' },
  { id: 'categories', label: 'Job Types'     },
  { id: 'done',       label: 'Go Live'       },
];

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();

        if (!userData.success || !userData.user) {
          router.push('/login');
          return;
        }

        const slug = userData.user.companySlug || userData.user.company_slug;
        const companyRes = await fetch(`/api/company/${slug}/info`);
        const companyData = await companyRes.json();

        if (companyData.success && companyData.company) {
          if (companyData.company.onboarding_completed || companyData.company.plan_tier === 'free') {
            router.push(`/${slug}/dashboard`);
            return;
          }
          setCompany(companyData.company);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <p className="text-red-400 text-sm font-bold">
          Error loading account. Please refresh.
        </p>
      </div>
    );
  }

  return <OnboardingWizard company={company} />;
}

// ─── SETTINGS REASSURANCE ─────────────────────────────────────────────────────

function SettingsReassurance() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl mb-8 group">
      <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors shrink-0">
        <Settings2 className="w-4 h-4 text-blue-400" />
      </div>
      <p className="text-xs font-bold text-white/50 leading-snug">
        Don&apos;t worry about getting this perfect right now.{' '}
        <span className="text-blue-400">
          Everything can be changed later in Settings.
        </span>
      </p>
    </div>
  );
}

// ─── WIZARD ───────────────────────────────────────────────────────────────────

function OnboardingWizard({ company }: { company: any }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Step 1: Company fields ──
  const [companyName, setCompanyName] = useState(company.name || '');
  const [phone, setPhone] = useState(formatPhone(company.phone || ''));
  const [email, setEmail] = useState(company.email || '');
  const [brandColor, setBrandColor] = useState(
    company.email_brand_color_1 || '#2563eb',
  );
  const [brandColor2, setBrandColor2] = useState(
    company.email_brand_color_2 || '#0891b2',
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  // ── Step 2: Categories ──
  const defaultCats: Category[] =
    CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
  const [categories, setCategories] = useState<Category[]>(
    company.form_categories?.length > 0
      ? company.form_categories
      : defaultCats,
  );
  const allCats: Category[] = [
    ...defaultCats,
    ...categories.filter(
      (c) => !defaultCats.some((d) => d.value === c.value),
    ),
  ];
  const [newCatLabel, setNewCatLabel] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // ── Step 3: QR / link ──
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const publicLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${company.slug}`
      : '';

  useEffect(() => {
    if (!publicLink) return;
    QRCodeLib.toDataURL(publicLink, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    }).then((url) => setQrCodeUrl(url));
  }, [publicLink]);

  // ── Error helper ──
  const showErr = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const isDone = currentStep === STEPS.length - 1;

  // ───────────────────────────────────────────────────────────────────────────
  //  LOGO FILE HANDLER
  // ───────────────────────────────────────────────────────────────────────────

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      showErr('Please upload an image file.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErr('Image must be under 5MB.');
      return;
    }

    setLogoFile(file);

    // Instant preview
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Reset the input so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  UPLOAD LOGO TO /api/upload-logo
  // ───────────────────────────────────────────────────────────────────────────

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return logoPreview || null;

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('companySlug', company.slug);

      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.logoUrl) {
        setLogoPreview(data.logoUrl);
        setLogoFile(null); // Clear file since it's uploaded
        return data.logoUrl;
      } else {
        console.error('Logo upload failed:', data.error);
        return logoPreview || null;
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      return logoPreview || null;
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  ADD CUSTOM CATEGORY
  // ───────────────────────────────────────────────────────────────────────────

  const addCat = () => {
    if (!newCatLabel.trim()) return;
    const val = newCatLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    if (categories.some((c) => c.value === val)) {
      showErr('That category already exists.');
      return;
    }
    setCategories((prev) => [
      ...prev,
      { value: val, label: newCatLabel.trim() },
    ]);
    setNewCatLabel('');
    setShowAddCat(false);
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  HANDLE NEXT — saves data per step, then advances
  // ───────────────────────────────────────────────────────────────────────────

  const handleNext = async () => {
    setSaving(true);
    setError('');

    try {
      // ── STEP 0 → Save company profile + logo ──
      if (currentStep === 0) {
        if (!companyName.trim()) {
          showErr('Company name is required.');
          setSaving(false);
          return;
        }

        // Upload logo first (if new file selected)
        const logoUrl = await uploadLogo();

        // Save company info
        const res = await fetch(`/api/company/${company.slug}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-general',
            data: {
              name: companyName,
              email,
              phone: phone.replace(/\D/g, ''),
              business_type: company.business_type || 'general',
              logo_url: logoUrl || null,
              email_brand_color_1: brandColor,
              email_brand_color_2: brandColor2,
            },
          }),
        });

        const result = await res.json();
        if (!result.success) {
          showErr(result.error || 'Failed to save company info.');
          setSaving(false);
          return;
        }
      }

      // ── STEP 1 → Save categories, then complete onboarding ──
      if (currentStep === 1) {
        // Save categories first so they exist in DB
        const catRes = await fetch(`/api/company/${company.slug}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-categories',
            data: { form_categories: categories },
          }),
        });

        const catResult = await catRes.json();
        if (!catResult.success) {
          showErr(catResult.error || 'Failed to save categories.');
          setSaving(false);
          return;
        }

        // Now complete onboarding + create sample lead
        const completeRes = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: company.id,
            skipped: false,
          }),
        });

        const completeResult = await completeRes.json();
        if (!completeResult.success) {
          console.error('Onboarding completion error:', completeResult.error);
          // Non-blocking — still advance to final step
        }
      }

      // Advance
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } catch (e) {
      console.error('Onboarding error:', e);
      showErr('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  HANDLE SKIP — saves current state + marks onboarding complete
  // ───────────────────────────────────────────────────────────────────────────

  const handleSkip = async () => {
    setSaving(true);

    try {
      // Save whatever categories exist
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-categories',
          data: { form_categories: categories },
        }),
      });

      // Complete onboarding as skipped
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          skipped: true,
        }),
      });
    } catch (e) {
      console.error('Skip error:', e);
    } finally {
      setSaving(false);
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col text-white antialiased">

      {/* ── ERROR TOAST ── */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 bg-red-500 text-white text-sm font-bold rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-lg mx-auto px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-xl p-1">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-gray-950 text-xs font-black">
                    {companyName?.substring(0, 2) || 'L2P'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-black text-lg tracking-tight">Onboarding</p>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
              </div>
            </div>
            {!isDone && (
              <button
                onClick={handleSkip}
                disabled={saving}
                className="text-white/40 hover:text-white text-xs font-bold transition disabled:opacity-30"
              >
                Skip for now
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                  i <= currentStep ? 'bg-blue-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-8 pb-36">

        {/* ─────────── STEP 1: BUSINESS PROFILE ─────────── */}
        {currentStep === 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight">
                Your Business Profile
              </h2>
              <SettingsReassurance />
            </div>

            {/* Logo upload */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <label className="flex flex-col items-center gap-4 cursor-pointer group">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 group-hover:border-blue-500 bg-white/5 flex items-center justify-center overflow-hidden transition-all shadow-inner">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-white/20" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-blue-400">
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1 uppercase tracking-widest font-bold">
                    Visible to customers
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
            </div>

            {/* Form fields */}
            <div className="space-y-6">
              {[
                {
                  label: 'Company Name',
                  icon: Building,
                  val: companyName,
                  set: setCompanyName,
                  ph: 'Ridge Line Roofing',
                  type: 'text',
                  required: true,
                },
                {
                  label: 'Business Email',
                  icon: Mail,
                  val: email,
                  set: setEmail,
                  ph: 'hello@company.com',
                  type: 'email',
                  required: false,
                },
                {
                  label: 'Business Phone',
                  icon: Phone,
                  val: phone,
                  set: (v: string) => setPhone(formatPhone(v)),
                  ph: '(555) 000-0000',
                  type: 'tel',
                  required: false,
                },
              ].map((field, i) => (
                <div key={i}>
                  <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-2.5 block ml-1">
                    {field.label}
                    {field.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>
                  <div className="relative group">
                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type={field.type}
                      value={field.val}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.ph}
                      className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-lg placeholder-white/10 outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────── STEP 2: CATEGORIES ─────────── */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight">
                Service Options
              </h2>
              <SettingsReassurance />
              <p className="text-white/60 text-sm font-medium mt-2">
                What kind of projects do you handle? Tap to select.
              </p>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-3">
              {allCats.map((cat, idx) => {
                const isSelected = categories.some(
                  (c) => c.value === cat.value,
                );
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      isSelected
                        ? setCategories((c) =>
                            c.filter((x) => x.value !== cat.value),
                          )
                        : setCategories((c) => [...c, cat])
                    }
                    className={`px-5 py-3 rounded-2xl font-black text-sm border-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40'
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                    }`}
                  >
                    {cat.emoji && <span className="mr-1.5">{cat.emoji}</span>}
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Add custom category */}
            {showAddCat ? (
              <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-blue-500/50">
                <input
                  type="text"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCat()}
                  placeholder="Service name..."
                  className="flex-1 bg-transparent px-3 font-bold outline-none text-white placeholder-white/20"
                  autoFocus
                  maxLength={50}
                />
                <button
                  onClick={addCat}
                  className="bg-blue-600 px-4 py-2 rounded-xl font-black text-xs uppercase"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddCat(false);
                    setNewCatLabel('');
                  }}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCat(true)}
                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white/40 font-black hover:bg-white/5 transition-all"
              >
                <Plus className="w-5 h-5" /> Add custom service
              </button>
            )}

            {/* Selection count */}
            {categories.length > 0 && (
              <p className="text-xs font-bold text-white/30 text-center">
                {categories.length} service
                {categories.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* ─────────── STEP 3: GO LIVE ─────────── */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black mb-3">You&apos;re Live.</h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed mb-6">
                Your professional booking link is ready to be shared with
                customers.
              </p>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl inline-flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-xs font-bold text-white/50">
                  Reminder: Head to{' '}
                  <span className="text-white">Settings</span> later to
                  fine-tune your templates and team.
                </p>
              </div>
            </div>

            {/* QR + Link card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-2xl text-gray-950 space-y-6">
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Customer QR Code
                </p>
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                )}
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl flex items-center justify-between gap-4 border border-gray-200">
                <p className="font-mono font-bold text-xs truncate select-all text-gray-900">
                  {publicLink}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`p-3 rounded-xl transition-all shrink-0 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-950 text-white hover:bg-gray-800'
                  }`}
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Open Dashboard CTA */}
            <a
              href={`/${company.slug}/dashboard?onboarded=1`}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 transition-all active:scale-[0.98]"
            >
              Open Dashboard <ArrowRight className="w-6 h-6" />
            </a>
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM NAV ── */}
      {!isDone && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0a0f1e]/90 backdrop-blur-xl border-t border-white/10 z-50">
          <div
            className="max-w-lg mx-auto flex gap-4"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={saving}
                className="w-16 h-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all shadow-sm disabled:opacity-30"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {saving ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Continue <ChevronRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}