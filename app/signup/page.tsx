'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BUSINESS_TYPES } from '@/lib/formCategories';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { fontVars } from '@/components/marketing/marketingTheme';

/* ─────────────────────────────────────────────────────────
   /signup — two steps, light, matches the marketing site.
   Step 1: account (email + password)
   Step 2: business (name, company, trade, phone) + terms → create
   Free → /{slug}/home. Paid → /subscribe?plan=… (Stripe trial there).
   ───────────────────────────────────────────────────────── */

const D = 'font-[family-name:var(--font-display)]';

const PLAN_NOTE: Record<string, string> = {
  basic: 'Basic plan · 14-day free trial. You’ll add a card on the next screen.',
  pro: 'Pro plan · 14-day free trial. You’ll add a card on the next screen.',
};

/* Typewriter brand moment shown after the account is created. */
function LaunchScreen({ onDone, firstName }: { onDone: () => void; firstName: string }) {
  const full = 'Lead2Project';
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count < full.length) {
      const t = setTimeout(() => setCount((c) => c + 1), 70);
      return () => clearTimeout(t);
    }
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [count, onDone]);

  const typed = full.slice(0, count);
  const done = count >= full.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F4EFE6] px-6 text-[#1C1F23]">
      <div className={`flex items-center ${D} text-5xl sm:text-7xl font-extrabold uppercase tracking-tight`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Lead2ProjectLogo.webp"
          alt=""
          className={`mr-3 h-11 w-11 sm:h-14 sm:w-14 rounded-lg bg-white object-contain p-1.5 shadow-sm transition-all duration-300 ${
            count > 0 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        />
        <span>{typed.slice(0, 5)}</span>
        <span className="text-[#00828A]">{typed.slice(5)}</span>
        <span className={`ml-1 inline-block h-10 sm:h-14 w-1.5 bg-[#00828A] ${done ? 'opacity-0' : 'animate-pulse'}`} />
      </div>
      <p className={`mt-6 text-base sm:text-lg text-[#3a3f45] transition-opacity duration-300 ${done ? 'opacity-100' : 'opacity-0'}`}>
        Welcome{firstName ? `, ${firstName}` : ''}. Your booking link is ready.
      </p>
    </div>
  );
}

function Field({
    label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  optional,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  hint?: string;
  optional?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel';
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-[#1C1F23]">{label}</span>
        {optional && <span className="text-xs text-slate-400">Optional</span>}
      </span>
      <span className="relative mt-1.5 block">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-base text-[#1C1F23] placeholder:text-slate-400 outline-none transition focus:border-[#00828A] focus:ring-2 focus:ring-[#00828A]/15 ${
            isPassword ? 'pr-11' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'free';
  const refCode = searchParams.get('ref') || '';

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [launchUrl, setLaunchUrl] = useState('');

  const [formData, setFormData] = useState({
     email: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
    companyName: '',
    slug: '',
    businessType: '',
    phone: '',
  });

  const set = (key: keyof typeof formData) => (v: string) => setFormData((f) => ({ ...f, [key]: v }));

  const handleCompanyNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    setFormData((f) => ({ ...f, companyName: name, slug }));
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 10);
    let formatted = digits;
    if (digits.length > 0) {
      if (digits.length <= 3) formatted = `(${digits}`;
      else if (digits.length <= 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      else formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    setFormData((f) => ({ ...f, phone: formatted }));
  };

  const goNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
       if (formData.password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords don’t match.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.ownerName.trim()) return setError('Enter your name.');
    if (!formData.companyName.trim()) return setError('Enter your business name.');
    if (!formData.businessType) return setError('Pick your trade.');
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length > 0 && phoneDigits.length !== 10) return setError('Enter a 10-digit phone number, or leave it blank.');
    if (!agreedToTerms) return setError('Please accept the Terms and Privacy Policy.');

    setLoading(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim(),
          phone: phoneDigits,
          plan,
          referred_by_code: refCode || null,
        }),
      });
      const data = await response.json();
           if (response.ok && data.success) {
        if (plan === 'free') {
          setLaunchUrl(`/${data.companySlug}/home?welcome=1`);
        } else {
          window.location.href = `/subscribe?plan=${plan}`;
        }
        return; // keep the button in its loading state while the page changes
      }
      setError(data.error || 'Something went wrong. Please try again.');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    }
    setLoading(false);
  };

   const slugPreview = formData.slug || 'your-business';

  if (launchUrl) {
    return (
      <div className={fontVars}>
        <LaunchScreen
          firstName={formData.ownerName.trim().split(' ')[0]}
          onDone={() => {
            window.location.href = launchUrl;
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen antialiased bg-[#F4EFE6] text-[#1C1F23] px-4 py-8 sm:py-14`}
      style={{
        backgroundImage:
          'linear-gradient(rgba(28,31,35,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.05) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Lead2ProjectLogo.webp" alt="" className="h-8 w-8 rounded-md bg-white object-contain p-1 shadow-sm" />
            <span className={`${D} text-xl font-extrabold uppercase tracking-tight`}>Lead2Project</span>
          </Link>
          <Link href="/login" className="text-sm text-slate-600 hover:text-[#1C1F23]">
            Have an account? <span className="font-semibold text-[#00828A]">Log in</span>
          </Link>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="h-1.5 bg-[#00828A]" />
          <div className="p-6 sm:p-8">
            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              {[
                { n: 1, label: 'Account' },
                { n: 2, label: 'Your business' },
              ].map((s, i) => {
                const done = step > s.n;
                const current = step === s.n;
                return (
                  <div key={s.n} className="flex items-center gap-2">
                    {i > 0 && <span className="h-px w-6 bg-slate-300" />}
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                        done ? 'bg-[#00828A] text-white' : current ? 'bg-[#1C1F23] text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" strokeWidth={3} /> : s.n}
                    </span>
                    <span className={current ? 'text-[#1C1F23]' : 'text-slate-400'}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            <h1 className={`mt-5 ${D} text-3xl sm:text-4xl font-extrabold uppercase leading-[0.95] tracking-tight`}>
              {step === 1 ? 'Start free.' : 'About your business.'}
            </h1>
            <p className="mt-2 text-[15px] text-[#3a3f45]">
              {step === 1
                ? 'Get your booking link and job board in a couple of minutes.'
                : 'This goes on your booking page, quotes and invoices.'}
            </p>

            {PLAN_NOTE[plan] && (
              <p className="mt-4 rounded-md border border-[#00828A]/25 bg-[#00828A]/[0.06] px-3 py-2 text-[13px] font-medium text-[#006e75]">
                {PLAN_NOTE[plan]}
              </p>
            )}

            {error && (
              <div role="alert" className="mt-5 flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} aria-label="Dismiss" className="mt-0.5 text-red-400 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={goNext} className="mt-6 space-y-4" noValidate>
                <Field
                  label="Email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@yourbusiness.com"
                  value={formData.email}
                  onChange={set('email')}
                />
                <Field
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                                   value={formData.password}
                  onChange={set('password')}
                />
                <Field
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Type it again"
                  value={formData.confirmPassword}
                  onChange={set('confirmPassword')}
                />
                <button
                  type="submit"
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#00828A] px-5 py-3.5 text-white shadow-sm transition-colors hover:bg-[#006e75] ${D} text-base font-bold uppercase tracking-wider`}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <Field label="Your name" autoComplete="name" placeholder="Mike Torres" value={formData.ownerName} onChange={set('ownerName')} />
                <Field
                  label="Business name"
                  autoComplete="organization"
                  placeholder="Summit Roofing"
                  value={formData.companyName}
                  onChange={handleCompanyNameChange}
                  hint={`Your booking link: lead2project.com/${slugPreview}`}
                />

                <div>
                  <span className="text-[13px] font-semibold text-[#1C1F23]">Your trade</span>
                  <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BUSINESS_TYPES.map((type) => {
                      const active = formData.businessType === type.value;
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, businessType: type.value }))}
                          aria-pressed={active}
                          className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                            active
                              ? 'border-[#00828A] bg-[#00828A]/[0.07] font-semibold text-[#006e75]'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#00828A]' : 'text-slate-400'}`} />
                          <span className="truncate">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Field
                  label="Business phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  optional
                />

                <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-sm text-[#3a3f45]">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#00828A]"
                  />
                  <span>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="font-semibold text-[#00828A] underline underline-offset-2">
                      Terms
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="font-semibold text-[#00828A] underline underline-offset-2">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setStep(1);
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md bg-[#00828A] px-5 py-3.5 text-white shadow-sm transition-colors hover:bg-[#006e75] disabled:opacity-70 ${D} text-base font-bold uppercase tracking-wider`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Setting up
                      </>
                    ) : plan === 'free' ? (
                      <>
                        Create my account <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Continue to trial <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Free plan, no card needed. Paid plans come with a 14-day free trial.
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00828A]" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}