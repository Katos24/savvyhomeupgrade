'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, MailCheck, X } from 'lucide-react';
import { fontVars } from '@/components/marketing/marketingTheme';

const D = 'font-[family-name:var(--font-display)]';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const trimmed = email.trim();
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await response.json();
      if (data.success) {
        setSentTo(trimmed);
        setEmail('');
      } else {
        setError(data.error || 'Could not send the reset link. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <Link href="/login" className="text-sm font-semibold text-[#00828A] hover:underline">
            Log in
          </Link>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="h-1.5 bg-[#00828A]" />

          {sentTo ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#00828A]/10">
                <MailCheck className="h-6 w-6 text-[#00828A]" />
              </div>
              <h1 className={`mt-4 ${D} text-3xl font-extrabold uppercase leading-[0.95] tracking-tight`}>Check your email.</h1>
              <p className="mt-3 text-[15px] text-[#3a3f45]">
                We sent a password reset link to <span className="font-semibold text-[#1C1F23] break-all">{sentTo}</span>.
              </p>
              <p className="mt-2 text-sm text-slate-500">Don&rsquo;t see it? Check your spam folder.</p>
              <Link
                href="/login"
                className={`mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-[#00828A] px-5 py-3.5 text-white shadow-sm transition-colors hover:bg-[#006e75] ${D} text-base font-bold uppercase tracking-wider`}
              >
                Back to login
              </Link>
              <button
                type="button"
                onClick={() => setSentTo('')}
                className="mt-3 text-sm font-semibold text-slate-500 hover:text-[#1C1F23]"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <h1 className={`${D} text-3xl sm:text-4xl font-extrabold uppercase leading-[0.95] tracking-tight`}>Reset your password.</h1>
              <p className="mt-2 text-[15px] text-[#3a3f45]">Enter the email you signed up with and we&rsquo;ll send you a link.</p>

              {error && (
                <div
                  role="alert"
                  className="mt-5 flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                >
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} aria-label="Dismiss" className="mt-0.5 text-red-400 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <label className="mt-6 block">
                <span className="text-[13px] font-semibold">Email</span>
                <input
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourbusiness.com"
                  className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-base text-[#1C1F23] placeholder:text-slate-400 outline-none transition focus:border-[#00828A] focus:ring-2 focus:ring-[#00828A]/15"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-[#00828A] px-5 py-3.5 text-white shadow-sm transition-colors hover:bg-[#006e75] disabled:opacity-70 ${D} text-base font-bold uppercase tracking-wider`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending
                  </>
                ) : (
                  <>
                    Send reset link <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <Link
                href="/login"
                className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#1C1F23]"
              >
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}