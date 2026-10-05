'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { fontVars } from '@/components/marketing/marketingTheme';

const D = 'font-[family-name:var(--font-display)]';
const BTN = `flex w-full items-center justify-center gap-2 rounded-md bg-[#00828A] px-5 py-3.5 text-white shadow-sm transition-colors hover:bg-[#006e75] disabled:opacity-70 ${D} text-base font-bold uppercase tracking-wider`;

function Shell({ children }: { children: React.ReactNode }) {
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
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Lead2ProjectLogo.webp" alt="" className="h-8 w-8 rounded-md bg-white object-contain p-1 shadow-sm" />
            <span className={`${D} text-xl font-extrabold uppercase tracking-tight`}>Lead2Project</span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#00828A] hover:underline">
            Log in
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="h-1.5 bg-[#00828A]" />
          {children}
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-[13px] font-semibold">{label}</span>
      <span className="relative mt-1.5 block">
        <input
          type={show ? 'text' : 'password'}
          required
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 pr-11 text-base text-[#1C1F23] placeholder:text-slate-400 outline-none transition focus:border-[#00828A] focus:ring-2 focus:ring-[#00828A]/15"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords don’t match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(data.error || 'Could not reset your password. The link may have expired.');
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // No token in the link
  if (!token) {
    return (
      <Shell>
        <div className="p-6 sm:p-8 text-center">
          <h1 className={`${D} text-3xl font-extrabold uppercase leading-[0.95] tracking-tight`}>This link doesn&rsquo;t work.</h1>
          <p className="mt-3 text-[15px] text-[#3a3f45]">The reset link is missing or incomplete. Request a new one and use the latest email.</p>
          <Link href="/forgot-password" className={`mt-7 ${BTN}`}>
            Send a new link
          </Link>
        </div>
      </Shell>
    );
  }

  if (success) {
    return (
      <Shell>
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#00828A]/10">
            <CheckCircle2 className="h-6 w-6 text-[#00828A]" />
          </div>
          <h1 className={`mt-4 ${D} text-3xl font-extrabold uppercase leading-[0.95] tracking-tight`}>Password updated.</h1>
          <p className="mt-3 text-[15px] text-[#3a3f45]">You can log in with your new password now.</p>
          <Link href="/login" className={`mt-7 ${BTN}`}>
            Log in
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <h1 className={`${D} text-3xl sm:text-4xl font-extrabold uppercase leading-[0.95] tracking-tight`}>Set a new password.</h1>
        <p className="mt-2 text-[15px] text-[#3a3f45]">Use at least 8 characters.</p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            <span>
              {error}{' '}
              {/expired|invalid/i.test(error) && (
                <Link href="/forgot-password" className="font-semibold underline">
                  Send a new link
                </Link>
              )}
            </span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss" className="mt-0.5 text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <PasswordField
            label="New password"
            value={formData.password}
            onChange={(v) => setFormData((f) => ({ ...f, password: v }))}
            placeholder="At least 8 characters"
          />
          <PasswordField
            label="Confirm new password"
            value={formData.confirmPassword}
            onChange={(v) => setFormData((f) => ({ ...f, confirmPassword: v }))}
            placeholder="Type it again"
          />
        </div>

        <button type="submit" disabled={loading} className={`mt-7 ${BTN}`}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving
            </>
          ) : (
            <>
              Save new password <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </Shell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00828A]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}