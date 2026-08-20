'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BUSINESS_TYPES } from '@/lib/formCategories';
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Clock,
  Lock,
  Loader2,
  X,
  Eye,
  EyeOff,
  Globe,
  CheckCircle2,
  Sparkles,
  Check,
  ChevronRight,
  CheckCircle,
  Rocket,
  Pencil,
} from 'lucide-react';

interface CustomInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  hint?: string;
  important?: boolean;
}

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

  const progressPercent = loading ? 100 : Math.round((step / 3) * 100);

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
        if (plan === 'free') {
          window.location.href = `/${data.companySlug}/home`;
        } else {
          window.location.href = `/subscribe?plan=${plan}`;
        }
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900 flex flex-col lg:flex-row">
      
      {/* LEFT SIDEBAR: DARK PREMIUM BRAND PANEL (ONLY VISIBLE ON STEP 1) */}
      {step === 1 && (
        <div className="hidden lg:flex lg:w-[420px] xl:w-[460px] bg-slate-900 border-r border-slate-800 p-8 xl:p-12 flex-col justify-between sticky top-0 h-screen overflow-hidden shrink-0 text-white">
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center p-1.5 transition-colors group-hover:border-emerald-500/40">
                <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Lead2<span className="text-emerald-400">Project</span>
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Fast 60-Second Setup
              </div>
              <h2 className="text-2xl xl:text-3xl font-bold leading-snug text-white tracking-tight">
                Turn leads into paying jobs <span className="text-emerald-400">on autopilot.</span>
              </h2>
            </div>

            {/* LIVE WORKSPACE PREVIEW CARD */}
            <div className="relative rounded-xl bg-slate-950/80 border border-slate-800 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
                    {displayCompanyName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{displayCompanyName}</p>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      lead2project.com/{activeSlug}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Preview
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">New Inquiries</p>
                  <p className="text-base font-bold text-white mt-0.5">+12 <span className="text-[10px] text-slate-400 font-normal">this week</span></p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Accepted Quotes</p>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">$8,450.00</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300">Client Booking Form</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Ready</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { icon: <Clock className="w-3.5 h-3.5 text-emerald-400" />, text: 'Start free with zero credit card required' },
                { icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />, text: 'Branded booking form live instantly' },
                { icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />, text: 'Stripe-integrated automated invoicing' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-slate-300 text-xs font-medium">
                  <div className="p-1 rounded bg-slate-800 border border-slate-700/60">{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Step {step} of 3</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encrypted
            </span>
          </div>
        </div>
      )}

      {/* RIGHT MAIN CONTENT AREA: CLEAN LIGHT CANVAS */}
      <div className="flex-1 bg-slate-50 overflow-y-auto px-4 py-8 sm:px-8 lg:px-16 xl:px-24 flex flex-col justify-center min-h-screen">
        
        <div className="max-w-md mx-auto w-full my-auto">
          
          {/* Header Logo */}
          <div className={`flex items-center justify-between mb-8 pb-4 border-b border-slate-200 ${step === 1 ? 'lg:hidden' : ''}`}>
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center p-1">
                <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 text-base">
                Lead2<span className="text-emerald-600">Project</span>
              </span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
              Step {step} of 3
            </span>
          </div>

          {/* STEP PROGRESS INDICATOR */}
          <div className="mb-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 uppercase tracking-wider">
                Step {step} of 3: <span className="text-slate-900 font-bold">{STEP_METADATA[step - 1].name}</span>
              </span>
              <span className="font-mono text-emerald-600 font-bold">{progressPercent}%</span>
            </div>

            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 ease-out"
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
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isCurrent
                        ? 'bg-white text-slate-900 border-slate-300 shadow-sm font-bold'
                        : 'bg-slate-100/60 text-slate-400 border-slate-200/60'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${isCurrent ? 'bg-slate-900 text-white font-bold' : 'bg-slate-200 text-slate-500'}`}>
                        {s.id}
                      </span>
                    )}
                    <span className="truncate hidden sm:inline">{s.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP HEADER */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {STEP_METADATA[step - 1].title}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
              {STEP_METADATA[step - 1].desc}
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg mb-6 text-xs font-medium flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError('')} className="text-rose-500 hover:text-rose-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* FORM CONTAINER CARD */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/40 space-y-5">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              
              {/* STEP 1: ACCOUNT */}
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

              {/* STEP 2: BUSINESS PROFILE */}
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
                    important
                  />

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" /> Public Client Booking URL:
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Auto-Generated</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-emerald-700 font-bold break-all shadow-xs">
                      <span>lead2project.com/</span>
                      <span className="text-slate-900">{activeSlug}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
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

              {/* STEP 3: EXECUTIVE SUMMARY & EXPLICIT BOOKING LINK */}
              {step === 3 && (
                <div className="space-y-4">
                  
                  {/* Clean Summary Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
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

                    {/* EXPLICIT PUBLIC BOOKING FORM LINK BOX */}
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1.5 shadow-md">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          Your Public Client Booking Form:
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">
                          Client Link
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 break-all select-all">
                        https://lead2project.com/{activeSlug}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        This is the exact URL your clients will visit to submit job requests and instant quote inquiries.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Client Booking Form:</strong> Ready to receive leads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>Admin Dashboard:</strong> Set up for {formData.ownerName || 'your account'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
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

              {/* ACTION BUTTONS */}
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

          {/* TRUST LOCK FOOTER */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>256-bit SSL Encrypted Workspace</span>
            </div>
            <div>
              Already registered?{' '}
              <a href="/login" className="text-emerald-700 font-bold hover:underline">
                Log in
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
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
        {hint && <span className="text-[10px] font-medium text-slate-400">{hint}</span>}
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}