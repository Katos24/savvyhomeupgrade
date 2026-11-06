'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { fontVars } from '@/components/marketing/marketingTheme';

// /login — matches /signup and the marketing site.
// Desktop: brand panel on the left, form on the right. Phones: just the form.

const D = 'font-[family-name:var(--font-display)]';
const INPUT =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-[#1C1F23] outline-none transition placeholder:text-slate-400 focus:border-[#00828A] focus:ring-4 focus:ring-[#00828A]/15';

// Left panel on desktop. Keep these true to what the product does.
const WAITING = ['New requests from your booking form', 'Quotes your customers accepted', 'Deposits and payments that came in'];

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
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen bg-white text-[#1C1F23] antialiased lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]`}>
      {/* ── Brand panel (desktop) ── */}
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
            Your jobs are <span className="text-[#5EC4C9]">right where you left them.</span>
          </h2>
          <ul className="mt-8 space-y-3.5">
            {WAITING.map((p) => (
              <li key={p} className="flex items-center gap-3 text-lg text-white/90">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#5EC4C9]" /> {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-base text-white/80">
          Need help? Email{' '}
          <a href="mailto:support@lead2project.com" className="font-semibold text-white underline underline-offset-2">
            support@lead2project.com
          </a>
        </p>
      </aside>

      {/* ── Form ── */}
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#EAF6F6] to-white px-4 py-8 sm:px-6 sm:py-12 lg:bg-none lg:bg-white lg:px-12">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 lg:invisible">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Lead2ProjectLogo.webp" alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-1 shadow-sm" />
              <span className={`${D} text-xl font-extrabold tracking-tight`}>Lead2Project</span>
            </Link>
            <Link href="/signup" className="text-[15px] text-slate-600 hover:text-[#1C1F23]">
              New here? <span className="font-semibold text-[#00828A]">Start free</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="my-auto">
            <h1 className={`${D} text-[32px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl`}>Welcome back.</h1>
            <p className="mt-2 text-[17px] leading-relaxed text-[#2a2f35]">Log in to see your jobs and payments.</p>

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

            <div className="mt-7 space-y-5">
              <label className="block">
                <span className="text-[15px] font-semibold">Email</span>
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
                  <span className="text-[15px] font-semibold">Password</span>
                  <Link href="/forgot-password" className="text-[15px] font-semibold text-[#00828A] hover:underline">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-7 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#00828A] px-5 py-3.5 text-lg font-bold text-white shadow-lg shadow-[#00828A]/25 transition-colors hover:bg-[#006e75] disabled:opacity-70 ${D}`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Logging in
                </>
              ) : (
                <>
                  Log in <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="mt-6 text-center text-[15px] text-slate-600 lg:hidden">
              Trouble logging in? Email{' '}
              <a href="mailto:support@lead2project.com" className="font-semibold text-[#00828A]">
                support@lead2project.com
              </a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}