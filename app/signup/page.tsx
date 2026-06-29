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
  UserPlus,
  Eye,
  EyeOff,
  Globe,
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

const STEP_LABELS = ['Account', 'Company', 'Confirm'];

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
      if (!formData.ownerName.trim()) { setError('Enter your name'); return; }
      if (!formData.email.trim()) { setError('Enter your email'); return; }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.companyName.trim()) { setError('Enter your company name'); return; }
      if (!formData.businessType) { setError('Please select a business type'); return; }
      setStep(3);
      return;
    }
  };

  const goBack = () => {
    setError('');
    setStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setError('');

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service to continue');
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
        setError(data.error || 'Failed to create account');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      <div className="hidden lg:flex lg:w-[400px] bg-slate-900 p-12 flex-col justify-between text-white sticky top-0 h-screen">
        <div>
          <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1">
              <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">Lead2Project</span>
          </div>

          <h2 className="text-4xl font-black leading-tight mb-8">
            The Operating System for{' '}
            <span className="text-blue-400">Pro Services.</span>
          </h2>

          <div className="space-y-8">
            {[
              { icon: <Clock className="w-5 h-5 text-blue-400" />, text: 'Start Free. Upgrade plan with a 14-day free trial' },
              { icon: <Zap className="w-5 h-5 text-blue-400" />, text: 'Convert leads to projects in seconds' },
              { icon: <ShieldCheck className="w-5 h-5 text-blue-400" />, text: 'Secure, automated client payments' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 text-slate-300 font-medium">
                <div className="mt-1">{item.icon}</div>
                <span className="text-lg leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">
            {plan === 'free' ? `Step ${step} of 3` : 'Step 1 of 2'}
          </p>
          <p className="text-sm text-slate-300 font-bold">
            {plan === 'free' ? STEP_LABELS[step - 1] : 'Create your administrative account to get started.'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 lg:px-24">
        <div className="max-w-xl mx-auto">

          <div className="flex lg:hidden items-center justify-between mb-10 px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center p-1">
                <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="w-full h-full object-contain" />
              </div>
              <span className="font-black tracking-tighter text-slate-900">Lead2Project</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-blue-600' : i < step ? 'w-8 bg-blue-200' : 'w-8 bg-slate-100'
                }`}
              />
            ))}
          </div>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-4">
              <UserPlus className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{STEP_LABELS[step - 1]}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {step === 1 && "Let's create your account"}
              {step === 2 && "Now, tell us about your business"}
              {step === 3 && "Here's what you're getting"}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              {step === 1 && "Just your name, email, password, and a way to reach you."}
              {step === 2 && "This sets up your branded booking link."}
              {step === 3 && "One last look before you're in — your workspace URL can't be changed after this."}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

            {step === 1 && (
              <div className="space-y-5">
                <CustomInput
                  label="Your Name"
                  placeholder="John Smith"
                  value={formData.ownerName}
                  onChange={(v) => setFormData(prev => ({ ...prev, ownerName: v }))}
                />
                <CustomInput
                  label="Company Email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(v) => setFormData(prev => ({ ...prev, email: v }))}
                  hint="Used to log in and reset your password"
                />
                <CustomInput
                  label="Phone Number"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  hint="Optional"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CustomInput
                    label="Create Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(v) => setFormData(prev => ({ ...prev, password: v }))}
                    hint="6+ characters"
                  />
                  <CustomInput
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(v) => setFormData(prev => ({ ...prev, confirmPassword: v }))}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <CustomInput
                  label="Company Name"
                  placeholder="e.g. Blueline Mechanical"
                  value={formData.companyName}
                  onChange={handleCompanyNameChange}
                  important
                />

                {formData.slug && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-blue-100 bg-blue-50/50">
                    <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <code className="text-[13px] font-mono font-medium text-blue-700 truncate">
                      lead2project.com/{formData.slug}
                    </code>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider ml-1">
                    Business Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_TYPES.map((type) => {
                      const active = formData.businessType === type.value;
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, businessType: type.value }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            active
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3.5 pt-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Public
                        </span>
                        <span className="text-[10px] text-slate-400">Anyone with the link sees this</span>
                      </div>
                      <div className="h-20 bg-slate-50 border-b border-slate-100 flex items-center justify-center px-4 mt-2">
                        <div className="w-full max-w-[200px]">
                          <FormPreviewMockup />
                        </div>
                      </div>
                      <div className="p-3.5">
                        <p className="text-[11px] font-black text-slate-700 mb-1">Your customer booking form</p>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed mb-2">
                          Customers fill this out themselves — share the link anywhere
                        </p>
                        <code className="text-[10.5px] font-mono font-medium text-blue-600 block truncate">
                          lead2project.com/{formData.slug || 'your-company'}
                        </code>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3.5 pt-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Private
                        </span>
                        <span className="text-[10px] text-slate-400">Only you can see this</span>
                      </div>
                      <div className="h-20 bg-slate-50 border-b border-slate-100 flex items-center justify-center px-4 mt-2">
                        <div className="w-full max-w-[200px]">
                          <DashboardPreviewMockup />
                        </div>
                      </div>
                      <div className="p-3.5">
                        <p className="text-[11px] font-black text-slate-700 mb-1">Your dashboard</p>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed mb-2">
                          Every submission lands here automatically, as a new lead
                        </p>
                        <code className="text-[10.5px] font-mono font-medium text-blue-600 block truncate">
                          lead2project.com/{formData.slug || 'your-company'}/dashboard
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Connecting arrow, desktop only */}
                  <div className="hidden sm:flex absolute top-[100px] left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm z-10">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-400 text-center leading-relaxed -mt-1">
                  When a customer submits the form on the left, it instantly becomes a lead on your private dashboard on the right.
                </p>

                <div>
                  <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2 ml-1">
                    Workspace name
                  </p>
                  <div className="text-sm font-bold text-slate-800 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    {formData.companyName
                      .split(/[\s-]+/)
                      .filter(Boolean)
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-slate-800">
                  <p className="font-black mb-1">This URL is permanent</p>
                  Your booking link and dashboard address can't be changed once your workspace is created — double check it above.
                </div>

                <div className="flex items-start gap-3 px-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-blue-600 font-semibold hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-blue-600 font-semibold hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-4 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}

              {step < 3 ? (
                <button
                  key="continue-btn"
                  type="button"
                  onClick={goNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  key="submit-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {plan === 'free' ? 'Create Free Account' : 'Continue to Plan Selection'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-300" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  256-bit SSL · Secure Identity Management
                </p>
              </div>
              <p className="text-center text-slate-500 text-sm">
                Already registered?{' '}
                <a href="/login" className="text-blue-600 font-black hover:underline">Log in here</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormPreviewMockup() {
  return (
    <div className="w-full space-y-1.5 px-1">
      <div>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Full Name</p>
        <div className="h-5 rounded bg-white border border-slate-200 flex items-center px-1.5">
          <span className="text-[9px] font-medium text-slate-700 truncate">Sarah Johnson</span>
        </div>
      </div>
      <div>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Project Description</p>
        <div className="h-5 rounded bg-white border border-slate-200 flex items-center px-1.5">
          <span className="text-[9px] font-medium text-slate-700 truncate">Kitchen remodel — 123 Main St</span>
        </div>
      </div>
      <div className="h-5 w-16 rounded bg-blue-600 flex items-center justify-center">
        <span className="text-[8px] font-bold text-white">Submit</span>
      </div>
    </div>
  );
}

function DashboardPreviewMockup() {
  return (
    <div className="w-full px-1">
      <div className="rounded-md bg-white border border-blue-200 px-2 py-1.5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] font-bold text-slate-800 truncate">Sarah Johnson</p>
          <span className="text-[7px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded shrink-0">New</span>
        </div>
        <p className="text-[8px] text-slate-400 truncate">Kitchen remodel — 123 Main St</p>
      </div>
    </div>
  );
}

function CustomInput({ label, value, onChange, placeholder, type = 'text', hint, important }: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-center ml-1">
        <label className={`text-[11px] font-black uppercase tracking-wider ${important ? 'text-blue-500' : 'text-slate-600'}`}>
          {label}
        </label>
        {hint && <span className="text-[10px] font-bold text-slate-300">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3.5 rounded-xl border shadow-sm outline-none transition-all
            !text-slate-900 !font-black text-base
            placeholder:text-slate-300 placeholder:font-medium
            focus:ring-4 focus:ring-blue-50 focus:border-blue-500
            bg-white
            ${isPassword ? 'pr-12' : ''}
            ${important ? 'border-blue-200' : 'border-slate-200'}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}