'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { fontVars } from '@/components/marketing/marketingTheme';

const D = 'font-[family-name:var(--font-display)]';
const INPUT =
  'w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-base text-[#1C1F23] placeholder:text-slate-400 outline-none transition focus:border-[#00828A] focus:ring-2 focus:ring-[#00828A]/15';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: formData.email.trim() }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = `/${data.user.companySlug}/dashboard`;
      } else {
        setError(data.error || 'Login failed');
        setLoading(false);
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
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
          <Link href="/signup" className="text-sm text-slate-600 hover:text-[#1C1F23]">
            New here? <span className="font-semibold text-[#00828A]">Start free</span>
          </Link>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="h-1.5 bg-[#00828A]" />
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <h1 className={`${D} text-3xl sm:text-4xl font-extrabold uppercase leading-[0.95] tracking-tight`}>Welcome back.</h1>
            <p className="mt-2 text-[15px] text-[#3a3f45]">Log in to see your jobs and payments.</p>

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

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[13px] font-semibold">Email</span>
                <input
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@yourbusiness.com"
                  className={`mt-1.5 ${INPUT}`}
                />
              </label>

              <label className="block">
                <span className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold">Password</span>
                  <Link href="/forgot-password" className="text-[13px] font-semibold text-[#00828A] hover:underline">
                    Forgot password?
                  </Link>
                </span>
                <span className="relative mt-1.5 block">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Your password"
                    className={`${INPUT} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-[#00828A] px-5 py-3.5 text-white shadow-sm transition-colors hover:bg-[#006e75] disabled:opacity-70 ${D} text-base font-bold uppercase tracking-wider`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Logging in
                </>
              ) : (
                <>
                  Log in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Trouble logging in? Email <a href="mailto:support@lead2project.com" className="font-semibold text-[#00828A]">support@lead2project.com</a>
        </p>
      </div>
    </div>
  );
}