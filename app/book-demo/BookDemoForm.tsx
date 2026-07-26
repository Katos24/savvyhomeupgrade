'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

// Must match the allow-lists in app/api/demo-request/route.ts — values outside
// them are silently dropped server-side.
const TRADES = ['Roofing', 'HVAC', 'Plumbing', 'Electrical', 'Solar', 'Other'];
const TEAM_SIZES = ['Just me', '2-5', '6-15', '16+'];

/**
 * US/Canada 10-digit formatting. Strips everything non-numeric, tolerates a
 * leading country code, and caps at 10 digits so the field can't run away.
 * If you start taking international leads this needs to change — see the
 * note in the route's validation.
 */
function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');

  // Someone pasting +1 (555)... or 1-555-...
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

const labelClass = 'block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5';
const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition';

export default function BookDemoForm() {
  const params = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    trade: '',
    teamSize: '',
    message: '',
    website: '', // honeypot — hidden, real people leave it empty
  });

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }));
    if (phoneError) setPhoneError(null);
  };

  // Phone is optional, but if they typed something it has to be a real number.
  const validatePhone = (): boolean => {
    const digits = phoneDigits(form.phone);
    if (digits.length === 0) return true;
    if (digits.length !== 10) {
      setPhoneError('Enter a 10-digit phone number, or leave it blank.');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validatePhone()) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phone: phoneDigits(form.phone),
          source: params.get('source') || 'book-demo',
          utmSource: params.get('utm_source'),
          utmMedium: params.get('utm_medium'),
          utmCampaign: params.get('utm_campaign'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setDone(true);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        style={{ fontFamily: font }}
        className="rounded-3xl border border-slate-200 bg-white shadow-xl p-8 sm:p-10 text-center"
      >
        <span className="inline-flex w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 items-center justify-center mb-5">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
        </span>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          Got it — check your inbox.
        </h2>
        <p className="text-base font-semibold text-slate-600 leading-relaxed mb-7 max-w-md mx-auto">
          We sent a confirmation to {form.email}. Someone will be in touch shortly to
          find a time that works.
        </p>

        <Link href="/demo">
          <span className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-colors">
            Look around in the meantime
            <ArrowRight size={15} />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ fontFamily: font }}
      className="rounded-3xl border border-slate-200 bg-white shadow-xl p-6 sm:p-8 space-y-5"
    >
      {/* Honeypot. Hidden from people, visible to naive bots. */}
      <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set('website')}
        />
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          Your name <span className="text-teal-700">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
          className={inputClass}
          placeholder="Alex Katos"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-teal-700">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={set('email')}
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={14}
            value={form.phone}
            onChange={setPhone}
            onBlur={validatePhone}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? 'phone-error' : undefined}
            className={`${inputClass} ${
              phoneError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''
            }`}
            placeholder="(555) 382-9102"
          />
          {phoneError && (
            <p id="phone-error" className="mt-1.5 text-xs font-bold text-rose-600">
              {phoneError}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="company" className={labelClass}>
          Company
        </label>
        <input
          id="company"
          type="text"
          autoComplete="organization"
          value={form.company}
          onChange={set('company')}
          className={inputClass}
          placeholder="Ridge Line Roofing"
        />
      </div>

      {/* Trade and team size: two taps that tell you who you're talking to
          before the call. */}
      <div>
        <label className={labelClass}>Your trade</label>
        <div className="flex flex-wrap gap-2">
          {TRADES.map((t) => {
            const selected = form.trade === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, trade: selected ? '' : t }))}
                aria-pressed={selected}
                className={`px-4 py-2.5 rounded-xl text-sm font-black border transition-all active:scale-95 ${
                  selected
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass}>Crew size</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEAM_SIZES.map((size) => {
            const selected = form.teamSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setForm((f) => ({ ...f, teamSize: selected ? '' : size }))}
                aria-pressed={selected}
                className={`px-3 py-2.5 rounded-xl text-sm font-black border transition-all active:scale-95 ${
                  selected
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Anything you want to cover?
        </label>
        <textarea
          id="message"
          rows={4}
          value={form.message}
          onChange={set('message')}
          className={`${inputClass} resize-y leading-relaxed`}
          placeholder="How you're handling leads now, what's not working, whatever's on your mind."
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-teal-700 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider px-6 py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending
          </>
        ) : (
          <>
            Request a demo <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className="text-xs font-semibold text-slate-400 text-center leading-relaxed">
        No sales pressure. If it&apos;s not a fit we&apos;ll tell you.
      </p>
    </form>
  );
}