'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BUSINESS_TYPES } from '@/lib/formCategories';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { fontVars } from '@/components/marketing/marketingTheme';

/* ─────────────────────────────────────────────────────────
   /signup — two steps, matches the marketing site.
   Step 1: account (email + password)
   Step 2: business (name, company, trade, phone) + terms → create
   Free → /{slug}/home. Paid → /subscribe?plan=… (Stripe trial there).
   Desktop: brand panel on the left, form on the right. Phones: just the form.
   ───────────────────────────────────────────────────────── */

const D = 'font-[family-name:var(--font-display)]';

const PLAN_NOTE: Record<string, string> = {
  basic: 'Pro plan · Create your account first, then start your 14-day free trial. Nothing is charged for 14 days.',
};

// Left panel on desktop. Keep these true to what the product does.
const PERKS = [
  'Your own booking link and QR code',
  'Quotes customers accept online',
  'Deposits and payments by card',
  'Free plan, no card needed',
];

/* ==========================================================================
   ANIMATED TYPEWRITER LOADING SCREEN (after the account is created)
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
    'Building your workspace…',
    'Creating your booking link and QR code…',
    'Setting up your job board…',
    'All set! Taking you in…',
  ];

  // Typewriter effect
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
    <div className={`${fontVars} fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white`}>
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-[#00828A]/30 blur-3xl" />

      <div className={`${D} relative flex select-none items-center text-4xl font-extrabold tracking-tight sm:text-5xl`}>
        <div
          className={`mr-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 transition-all duration-300 sm:h-12 sm:w-12 ${
            displayedText.length > 0 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Lead2ProjectLogo.webp" alt="Lead2Project logo" className="h-full w-full object-contain" />
        </div>
        <span className="text-white">{leadPart}</span>
        <span className="text-[#5EC4C9]">{projectPart}</span>
        <span className="ml-1.5 inline-block h-8 w-1 animate-pulse rounded-full bg-[#5EC4C9] sm:h-10" />
      </div>

      <div className="relative mt-8 flex flex-col items-center gap-3">
        <p className="h-5 text-base font-medium text-white/85">{statusMessages[statusIndex]}</p>
        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[#5EC4C9] transition-all duration-500 ease-out"
            style={{ width: `${Math.min(((currentIndex + 1) / fullText.length) * 100, 100)}%` }}
          />
        </div>
      </div>
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
        <span className="text-[15px] font-semibold text-[#1C1F23]">{label}</span>
        {optional && <span className="text-sm text-slate-500">Optional</span>}
      </span>
      <span className="relative mt-1.5 block">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-[#1C1F23] outline-none transition placeholder:text-slate-400 focus:border-[#00828A] focus:ring-4 focus:ring-[#00828A]/15 ${
            isPassword ? 'pr-11' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </span>
      {hint && <span className="mt-1.5 block text-sm leading-snug text-slate-600">{hint}</span>}
    </label>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-[#00828A]/35 blur-[120px]" />

      <Link href="/" className="relative flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Lead2ProjectLogo.webp" alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-1" />
        <span className={`${D} text-xl font-extrabold tracking-tight`}>Lead2Project</span>
      </Link>

      <div className="relative max-w-md">
        <h2 className={`${D} text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl`}>
          Running jobs just got{' '}
          <span className="inline-block -rotate-1 rounded-xl bg-[#5EC4C9] px-3 pb-0.5 pt-1 text-slate-900">easy.</span>
        </h2>
        <ul className="mt-8 space-y-3.5">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-3 text-lg text-white/90">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#5EC4C9]" /> {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-center gap-3">
        <span className={`${D} flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-extrabold text-[#00828A]`}>A</span>
        <p className="text-base leading-snug text-white/85">
          <span className="font-semibold text-white">Built on Long Island by Alex.</span>
          <br />8 years building payment systems.
        </p>
      </div>
    </aside>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  // Pro isn't offered anymore; old links with ?plan=pro become Basic.
  const rawPlan = searchParams.get('plan') || 'free';
  const plan = rawPlan === 'pro' ? 'basic' : rawPlan;
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
        setLaunchUrl(plan === 'free' ? `/${data.companySlug}/home?welcome=1` : `/subscribe?plan=${plan}`);
        return; // keep the button in its loading state while the animation plays
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
      <LoadingScreen
        speed={70}
        onComplete={() => {
          window.location.href = launchUrl;
        }}
      />
    );
  }

  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen bg-white text-[#1C1F23] antialiased lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]`}>
      <BrandPanel />

      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#EAF6F6] to-white px-4 py-8 sm:px-6 sm:py-12 lg:bg-none lg:bg-white lg:px-12">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 lg:invisible">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Lead2ProjectLogo.webp" alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-1 shadow-sm" />
              <span className={`${D} text-xl font-extrabold tracking-tight`}>Lead2Project</span>
            </Link>
            <Link href="/login" className="text-[15px] text-slate-600 hover:text-[#1C1F23]">
              Have an account? <span className="font-semibold text-[#00828A]">Log in</span>
            </Link>
          </div>

          <div className="my-auto">
            {/* Step indicator */}
            <div className="flex items-center gap-2 text-sm font-semibold">
              {[
                { n: 1, label: 'Account' },
                { n: 2, label: 'Your business' },
              ].map((s, i) => {
                const done = step > s.n;
                const current = step === s.n;
                return (
                  <div key={s.n} className="flex items-center gap-2">
                    {i > 0 && <span className="h-px w-8 bg-slate-300" />}
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        done ? 'bg-[#00828A] text-white' : current ? 'bg-[#1C1F23] text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.n}
                    </span>
                    <span className={current ? 'text-[#1C1F23]' : 'text-slate-500'}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            <h1 className={`mt-6 ${D} text-[32px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl`}>
              {step === 1 ? 'Start free.' : 'About your business.'}
            </h1>
            <p className="mt-2 text-[17px] leading-relaxed text-[#2a2f35]">
              {step === 1 ? 'Get your booking link and job board in a couple of minutes.' : 'This goes on your booking page, quotes and invoices.'}
            </p>

            {PLAN_NOTE[plan] && (
              <p className="mt-4 rounded-xl border border-[#00828A]/25 bg-[#00828A]/[0.07] px-4 py-3 text-[15px] font-medium text-[#005f65]">
                {PLAN_NOTE[plan]}
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800"
              >
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} aria-label="Dismiss" className="mt-0.5 text-red-500 hover:text-red-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={goNext} className="mt-7 space-y-5" noValidate>
                <Field
                  label="Work email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="summitroofing@gmail.com"
                  value={formData.email}
                  onChange={set('email')}
                  hint="The email you check for work. Gmail is fine. New requests, payments and your daily digest go here."
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
                  className={`mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#00828A] px-5 py-3.5 text-lg font-bold text-white shadow-lg shadow-[#00828A]/25 transition-colors hover:bg-[#006e75] ${D}`}
                >
                  Continue <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
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
                  <span className="text-[15px] font-semibold text-[#1C1F23]">Your trade</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {BUSINESS_TYPES.map((type) => {
                      const active = formData.businessType === type.value;
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData((f) => ({ ...f, businessType: type.value }))}
                          aria-pressed={active}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-[15px] transition-colors ${
                            active
                              ? 'border-[#00828A] bg-[#00828A]/[0.08] font-semibold text-[#005f65] ring-2 ring-[#00828A]/15'
                              : 'border-slate-300 bg-white text-[#2a2f35] hover:border-slate-400'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#00828A]' : 'text-slate-500'}`} />
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

                <label className="flex cursor-pointer items-start gap-3 pt-1 text-[15px] text-[#2a2f35]">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-[#00828A]"
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
                    className="flex min-h-[52px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-[15px] font-semibold text-[#2a2f35] hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#00828A] px-5 py-3.5 text-lg font-bold text-white shadow-lg shadow-[#00828A]/25 transition-colors hover:bg-[#006e75] disabled:opacity-70 ${D}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Setting up
                      </>
                    ) : plan === 'free' ? (
                      <>
                        Create my account <ArrowRight className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        Continue to trial <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-[15px] text-slate-600 lg:text-left">
              Free plan, no card needed. Paid plans come with a 14-day free trial.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#00828A]" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}