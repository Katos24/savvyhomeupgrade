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

// 4 checkpoints total: landing on the form already "counts" Sign Up as
// checked (endowed progress), so the bar never starts at 0%.
const PROGRESS_STEPS = ['Sign Up', 'Company', 'Confirm', 'Done'];

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

  // step 1 -> 25 (Sign Up pre-credited), step 2 -> 50, step 3 -> 75, success -> 100
  const progressPercent = loading ? 100 : step * 25;
  const checkedCount = loading ? 4 : step; // how many chips show a checkmark

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
      if (!formData.email.trim()) { setError('Enter your email'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { setError('Enter a valid email address'); return; }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.ownerName.trim()) { setError('Enter your name'); return; }
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

  const activeSlug = formData.slug || 'your-company';

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
            <span className="text-emerald-400">Pro Services.</span>
          </h2>

          <div className="space-y-8">
            {[
              { icon: <Clock className="w-5 h-5 text-emerald-400" />, text: 'Start Free. Upgrade plan with a 14-day free trial' },
              { icon: <Zap className="w-5 h-5 text-emerald-400" />, text: 'Convert leads to projects in seconds' },
              { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, text: 'Secure, automated client payments' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 text-slate-300 font-medium">
                <div className="mt-1">{item.icon}</div>
                <span className="text-lg leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

       <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">
            {plan === 'free' ? `${progressPercent}% complete` : 'Step 1 of 2'}
          </p>
          <p className="text-sm text-slate-300 font-bold">
            {plan === 'free' ? STEP_LABELS[step - 1] : 'Create your administrative account to get started.'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 lg:px-24">
        <div className="max-w-xl mx-auto">

          <div className="flex lg:hidden items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center p-1">
                <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="w-full h-full object-contain" />
              </div>
              <span className="font-black tracking-tighter text-slate-900">Lead2Project</span>
            </div>
          </div>

          {/* Endowed-progress bar: Sign Up shows as already checked the moment
              the form loads, so the person never starts at a discouraging 0%. */}
          {plan === 'free' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Setting up your account
                </span>
                <span className="text-[11px] font-black text-emerald-600">
                  {progressPercent}% complete
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                {PROGRESS_STEPS.map((label, i) => {
                  const idx = i + 1;
                  const done = idx <= checkedCount;
                  const active = idx === step && !loading;
                  return (
                    <div key={label} className="flex-1 flex items-center gap-1.5">
                      <div
                     className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide transition-all ${
                          done
                            ? 'bg-emerald-50 text-emerald-600'
                            : active
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-50 text-slate-300'
                        }`}
                      >
                        {done ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        ) : (
                          <span className="w-3 text-center shrink-0">{idx}</span>
                        )}
                        <span className="truncate">{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full mb-4">
              <UserPlus className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{STEP_LABELS[step - 1]}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {step === 1 && "Let's create your account"}
              {step === 2 && "Now, tell us about your business"}
              {step === 3 && "Here's what you're getting"}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              {step === 1 && "Just your email and a password to get started."}
              {step === 2 && "Who we're working with, and your branded booking link."}
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
                  label="Email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(v) => setFormData(prev => ({ ...prev, email: v }))}
                  hint="Used to log in and reset your password"
                  important
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
                  label="Your Name"
                  placeholder="John Smith"
                  value={formData.ownerName}
                  onChange={(v) => setFormData(prev => ({ ...prev, ownerName: v }))}
                  important
                />
                <CustomInput
                  label="Phone Number"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  hint="Optional"
                />

                <CustomInput
                  label="Company Name"
                  placeholder="e.g. Blueline Mechanical"
                  value={formData.companyName}
                  onChange={handleCompanyNameChange}
                  important
                />

               {formData.slug && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                    <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <code className="text-[13px] font-mono font-medium text-emerald-700 break-all">
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
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-600'
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

                    <div>
                  <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2 ml-1">
                    Workspace name
                  </p>
                  <div className="text-sm font-bold text-slate-800 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    {formData.companyName
                      .split(/[\s-]+/)
                      .filter(Boolean)
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ') || 'Your Workspace'}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-2.5 px-3.5 text-[10px] font-black uppercase tracking-wider text-slate-500 w-28">Page</th>
                        <th className="py-2.5 px-3.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Full Web Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      <tr>
                        <td className="py-3 px-3.5 font-bold text-slate-800 align-top">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 mb-1">Public</span>
                          <div>Booking Form</div>
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          <code className="font-mono text-[11px] font-semibold text-emerald-600 break-all block bg-emerald-50/50 p-1.5 rounded border border-emerald-100/60">
                            lead2project.com/{activeSlug}
                          </code>
                          <p className="text-[10.5px] text-slate-400 mt-1">Customers fill this out to request service</p>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3.5 font-bold text-slate-800 align-top">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200 mb-1">Private</span>
                          <div>Dashboard</div>
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          <code className="font-mono text-[11px] font-semibold text-emerald-600 break-all block bg-slate-50 p-1.5 rounded border border-slate-200/60">
                            lead2project.com/{activeSlug}/dashboard
                          </code>
                          <p className="text-[10.5px] text-slate-400 mt-1">Private workspace to manage incoming submissions</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-emerald-600 font-semibold hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-emerald-600 font-semibold hover:underline">
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
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
                <a href="/login" className="text-emerald-600 font-black hover:underline">Log in here</a>
              </p>
            </div>
          </form>
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
      <div className="flex justify-between items-center ml-1">
        <label className={`text-[11px] font-black uppercase tracking-wider ${important ? 'text-emerald-500' : 'text-slate-600'}`}>
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
            focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500
            bg-white
            ${isPassword ? 'pr-12' : ''}
            ${important ? 'border-emerald-200' : 'border-slate-200'}
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