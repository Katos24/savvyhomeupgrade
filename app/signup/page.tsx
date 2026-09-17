'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BUSINESS_TYPES } from '@/lib/formCategories';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Loader2,
  X,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  CheckCircle,
  Rocket,
  Pencil,
} from 'lucide-react';

/* ==========================================================================
   1. ANIMATED TYPEWRITER LOADING SCREEN
   ========================================================================== */
interface LoadingScreenProps {
  onComplete: () => void;
  speed?: number;
}

function LoadingScreen({ onComplete, speed = 70 }: LoadingScreenProps) {
  const fullText = 'Lead2Project';
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = [
    'Building custom workspace...',
    'Generating QR code & booking URL...',
    'Configuring pipeline stages...',
    'Workspace ready! Redirecting...',
  ];

  // Typewriter effect logic
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      const finishTimeout = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(finishTimeout);
    }
  }, [currentIndex, fullText, speed, onComplete]);

  // Status message rotation
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev < statusMessages.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(statusInterval);
  }, [statusMessages.length]);

  const leadPart = displayedText.slice(0, 5);
  const projectPart = displayedText.slice(5);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 selection:bg-emerald-500/20">
      {/* Background Ambient Glow */}
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Animated Branding */}
      <div className="relative flex items-center text-3xl sm:text-5xl font-extrabold tracking-tight select-none">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-1.5 mr-3.5 transition-all duration-300 ${
            displayedText.length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <img src="/Lead2ProjectLogo.webp" alt="Lead2Project Logo" className="w-full h-full object-contain" />
        </div>

        <span className="text-white">{leadPart}</span>
        <span className="text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.4)]">
          {projectPart}
        </span>

        <span className="inline-block w-1 h-7 sm:h-9 bg-emerald-400 ml-1.5 rounded-full animate-pulse shadow-[0_0_10px_#34d399]" />
      </div>

      {/* Dynamic Status Text & Progress Bar */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-xs font-mono text-slate-400 tracking-wider uppercase h-4">
          {statusMessages[statusIndex]}
        </p>
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(((currentIndex + 1) / fullText.length) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. CUSTOM FORM INPUT COMPONENT
   ========================================================================== */
interface CustomInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  hint?: string;
  important?: boolean;
}

function CustomInput({ label, value, onChange, placeholder, type = 'text', hint, important }: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-center px-0.5">
        <label className={`text-xs font-bold uppercase tracking-wider ${important ? 'text-slate-800' : 'text-slate-500'}`}>
          {label}
        </label>
        {hint && <span className="text-[10px] font-mono text-emerald-700 font-medium truncate max-w-[180px]">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all
            text-slate-900 font-semibold text-xs sm:text-sm bg-slate-50/50
            placeholder:text-slate-400 placeholder:font-normal
            focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600
            ${isPassword ? 'pr-10' : ''}
            ${important ? 'border-slate-300' : 'border-slate-200'}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   3. MAIN SIGNUP FORM LOGIC & UI
   ========================================================================== */
const STEP_METADATA = [
  { id: 1, name: 'Account', title: 'Create your access credentials', desc: 'Your email and secure password to log into your workspace.' },
  { id: 2, name: 'Business Profile', title: 'Tell us about your business', desc: 'We will personalize your booking link and client invoices.' },
  { id: 3, name: 'Launch', title: "You're ready to launch!", desc: 'Your workspace is configured and ready to start taking jobs.' },
];

function SignupForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'free';
  const refCode = searchParams.get('ref') || '';

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    slug: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    ownerName: '',
  });

  const progressPercent = loading || isLaunching ? 100 : Math.round((step / 3) * 100);

  const handleCompanyNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    setFormData({ ...formData, companyName: name, slug });
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 10);
    let formatted = digits;
    if (digits.length > 0) {
      if (digits.length <= 3) formatted = `(${digits}`;
      else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    setFormData({ ...formData, phone: formatted });
  };

  const goNext = () => {
    setError('');

    if (step === 1) {
      if (!formData.email.trim()) { setError('Please enter your email address'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { setError('Please enter a valid email address'); return; }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters long'); return; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.ownerName.trim()) { setError('Please enter your full name'); return; }
      if (!formData.companyName.trim()) { setError('Please enter your company or business name'); return; }
      if (!formData.businessType) { setError('Please select a primary business type'); return; }
      setStep(3);
      return;
    }
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setError('');

    if (!agreedToTerms) {
      setError('Please accept the Terms of Service to continue');
      return;
    }

    setLoading(true);
    const phoneDigits = formData.phone.replace(/\D/g, '');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: phoneDigits, plan, referred_by_code: refCode || null }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const destination = plan === 'free' ? `/${data.companySlug}/home` : `/subscribe?plan=${plan}`;
        setRedirectUrl(destination);
        setIsLaunching(true); // Launch animated overlay
      } else {
        setError(data.error || 'Failed to initialize workspace');
        setLoading(false);
      }
    } catch {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const activeSlug = formData.slug || 'your-company';
  const displayCompanyName = formData.companyName.trim() || 'Your Business Name';

  return (
    <>
      {/* Full Screen Loading Animation on Submit */}
      {isLaunching && (
        <LoadingScreen
          speed={70}
          onComplete={() => {
            window.location.href = redirectUrl;
          }}
        />
      )}

      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300 flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto my-auto">
          
          {/* Streamlined Header Logo & Login Link */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-1">
                <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold tracking-tight text-white text-base">
                Lead2<span className="text-emerald-400">Project</span>
              </span>
            </div>

            <a href="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
              Already registered? <span className="text-emerald-400 font-bold">Log in</span>
            </a>
          </div>

          {/* Step Progress Indicator */}
          <div className="mb-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">
                Step {step} of 3: <span className="text-white font-bold">{STEP_METADATA[step - 1].name}</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
            </div>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {STEP_METADATA.map((s) => {
                const isPassed = s.id < step;
                const isCurrent = s.id === step;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all border ${
                      isPassed
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                        : isCurrent
                        ? 'bg-slate-900 text-white border-slate-700 shadow-xs font-bold'
                        : 'bg-slate-900/40 text-slate-500 border-slate-800/60'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${isCurrent ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                        {s.id}
                      </span>
                    )}
                    <span className="truncate hidden sm:inline">{s.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Title Header */}
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {STEP_METADATA[step - 1].title}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              {STEP_METADATA[step - 1].desc}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-950/80 border border-rose-800/80 text-rose-200 px-3.5 py-2.5 rounded-lg mb-6 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form Container Card */}
          <div className="bg-white text-slate-900 border border-slate-200/80 rounded-2xl p-6 shadow-2xl shadow-black/50 space-y-5">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              
              {/* Step 1: Account */}
              {step === 1 && (
                <div className="space-y-4">
                  <CustomInput
                    label="Work Email Address"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(v) => setFormData((prev) => ({ ...prev, email: v }))}
                    hint="Used for login and notifications"
                    important
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <CustomInput
                      label="Create Password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(v) => setFormData((prev) => ({ ...prev, password: v }))}
                    />
                    <CustomInput
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(v) => setFormData((prev) => ({ ...prev, confirmPassword: v }))}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Business Profile */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <CustomInput
                      label="Your Name"
                      placeholder="e.g. Alex Miller"
                      value={formData.ownerName}
                      onChange={(v) => setFormData((prev) => ({ ...prev, ownerName: v }))}
                      important
                    />
                    <CustomInput
                      label="Phone Number"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      hint="Optional"
                    />
                  </div>

                  <CustomInput
                    label="Company Name"
                    placeholder="e.g. Apex Mechanical Services"
                    value={formData.companyName}
                    onChange={handleCompanyNameChange}
                    hint={`URL: lead2project.com/${activeSlug}`}
                    important
                  />

                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Select Your Industry
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BUSINESS_TYPES.map((type) => {
                        const active = formData.businessType === type.value;
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, businessType: type.value }))}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all gap-1.5 text-center cursor-pointer ${
                              active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-bold shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-500'}`} />
                            <span className="truncate w-full">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Summary & Launch */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Workspace Summary
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{displayCompanyName}</h3>
                      </div>

                      <button
                        type="button"
                        onClick={goBack}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-all cursor-pointer shadow-xs"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 font-medium pt-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Account configured for <strong>{formData.ownerName || 'your business'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Booking page and client form initialized</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white cursor-pointer shrink-0"
                    />
                    <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer select-none">
                      I accept the{' '}
                      <a href="/terms" target="_blank" className="text-emerald-700 font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" className="text-emerald-700 font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    key="continue-btn"
                    type="button"
                    onClick={goNext}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm shadow-md"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    key="submit-btn"
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm shadow-md shadow-emerald-600/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        {plan === 'free' ? 'Launch Workspace' : 'Continue to Plan Selection'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>256-bit SSL Encrypted Workspace</span>
          </div>

        </div>
      </div>
    </>
  );
}

/* ==========================================================================
   4. SUSPENSE WRAPPER FOR NEXT.JS
   ========================================================================== */
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}