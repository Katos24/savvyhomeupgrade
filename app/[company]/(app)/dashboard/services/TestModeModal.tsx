'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, ChevronLeft, User, Mail, Phone, MapPin,
  ImageIcon, Megaphone, Sparkles, Send, Loader2, Check, AlertCircle,
} from 'lucide-react';
import type { Category } from '../../../admin/settings/tabs/useFormTabLogic';
import { themeTokens } from './CategoriesTaskEditorModal';
import { TIMELINE_OPTIONS, BEST_TIME_OPTIONS, bestTimesArray, toggleBestTime } from '@/lib/timing';

type Theme = ReturnType<typeof themeTokens>;

// (555) 123-4567 as the user types, capped at 10 digits — same shape the
// real booking form stores.
function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

type TestModeStep1 = {
  name: string;
  email: string;
  phone: string;
  category: string;
  description: string;
};

export default function TestModeModal({
  company,
  categories,
  customQuestions,
  fieldConfig,
  canUseCustomQuestions,
  brandColor1,
  brandColor2,
  getCtaHeading,
  isDark,
  onClose,
}: {
  company: any;
  categories: Category[];
  customQuestions: any[];
  fieldConfig: any;
  canUseCustomQuestions: boolean;
  brandColor1: string;
  brandColor2: string;
  getCtaHeading: () => string;
  isDark: boolean;
  onClose: () => void;
}) {
  const t = themeTokens(isDark);

  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<TestModeStep1>({
    name: '',
    email: '',
    phone: '',
    category: categories[0]?.value || '',
    description: '',
  });
  const [emailTouched, setEmailTouched] = useState(false);
  const [step2Answers, setStep2Answers] = useState<Record<string, string>>({});
  // Split like the real form: street, unit/apt, city, zip
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  // Timing (lib/timing.ts), same as the real form: "how soon" + best times.
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const showTimeline = !!fieldConfig.preferred_date?.enabled;
  const showBestTimes = !!fieldConfig.preferred_time?.enabled;

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const questionsForCategory = canUseCustomQuestions
    ? customQuestions.filter((q: any) => q.category === step1.category)
    : [];

  const phoneDigits = step1.phone.replace(/\D/g, '');
  // Same email shape check the signup route uses. Everything in Step 1 is
  // required, matching the real public form.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = EMAIL_RE.test(step1.email.trim());
  const step1Valid = Boolean(
    step1.name.trim() &&
      emailValid &&
      phoneDigits.length === 10 &&
      step1.category &&
      step1.description.trim()
  );

  // One line for the test email, e.g. "123 Main St, Apt 2B, Holbrook 11741"
  const addressLine = [street.trim(), unit.trim(), [city.trim(), zip.trim()].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');

  // Shared input styling, theme-aware — every text/select field in this
  // modal routes through this so light/dark stays consistent without
  // repeating the same conditional string a dozen times.
  const inputWrap = `flex items-center gap-2 rounded-lg border ${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50'} px-3 py-2`;
  const inputField = `w-full bg-transparent text-xs font-medium ${t.cardText} outline-none placeholder:${isDark ? 'text-slate-500' : 'text-slate-400'}`;
  const labelCls = `mb-1 block text-[11px] font-bold uppercase tracking-wider ${t.subText}`;

  const handleSendTestEmail = async () => {
    if (!step1.email.trim()) {
      setEmailError('Enter an email to receive the test.');
      return;
    }
    setSendingEmail(true);
    setEmailError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/test-form-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: step1.email,
          name: step1.name,
          category: step1.category,
          description: step1.description,
          answers: step2Answers,
          address: addressLine,
          preferredDate,
          preferredTime,
          leadSource,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
      } else {
        setEmailError(data.error || 'Could not send the test email.');
      }
    } catch {
      setEmailError('Network error sending the test email.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl ${t.overlayCard} shadow-2xl sm:rounded-2xl`}
      >
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-bold">Test Mode — Nothing is saved</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {emailSent ? (
            // Success screen — replaces the form once the test email is sent,
            // same idea as the public form swapping to a thank-you screen.
            <div className="flex flex-col items-center py-8 text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
              >
                <Check className="h-7 w-7" />
              </div>
              <h3 className={`text-base font-bold ${t.cardText}`}>Test complete!</h3>
              <p className={`mt-2 max-w-xs text-xs font-medium ${t.subText}`}>
                We sent the test email to <span className={`font-bold ${t.cardText}`}>{step1.email}</span>.
                Check your inbox to see exactly what your customer would receive.
              </p>
              <p className={`mt-3 max-w-xs text-[11px] font-medium ${t.subText}`}>
                Nothing was saved and no lead was added to your dashboard.
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmailError(''); setStep(1); }}
                className="mt-5 text-xs font-bold text-blue-600 hover:underline"
              >
                Run another test
              </button>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <p className={`text-xs font-bold uppercase tracking-wider ${t.subText}`}>Step 1 — Required</p>

              <div>
                <label className={labelCls}>Full Name</label>
                <div className={inputWrap}>
                  <User className={`h-3.5 w-3.5 shrink-0 ${t.subText}`} />
                  <input
                    value={step1.name}
                    onChange={(e) => setStep1((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Jane Doe"
                    className={inputField}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email Address</label>
                <div className={inputWrap}>
                  <Mail className={`h-3.5 w-3.5 shrink-0 ${t.subText}`} />
                  <input
                    type="email"
                    value={step1.email}
                    onChange={(e) => setStep1((s) => ({ ...s, email: e.target.value }))}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="you@example.com — where the test email goes"
                    className={inputField}
                  />
                </div>
                {emailTouched && step1.email.trim() && !emailValid && (
                  <p className="mt-1 text-[10px] font-semibold text-rose-500">Enter a valid email address.</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Phone Number</label>
                <div className={inputWrap}>
                  <Phone className={`h-3.5 w-3.5 shrink-0 ${t.subText}`} />
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={step1.phone}
                    onChange={(e) => setStep1((s) => ({ ...s, phone: formatPhone(e.target.value) }))}
                    placeholder="(555) 123-4567"
                    maxLength={14}
                    className={inputField}
                  />
                </div>
                {phoneDigits.length > 0 && phoneDigits.length < 10 && (
                  <p className="mt-1 text-[10px] font-semibold text-rose-500">Enter a 10-digit phone number.</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Service Needed</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat: Category) => {
                    const selected = step1.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setStep1((s) => ({ ...s, category: cat.value }))}
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-bold transition ${
                          selected
                            ? 'border-transparent text-white'
                            : `${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50'} ${t.cardText} ${t.hoverBg}`
                        }`}
                        style={selected ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>Project Description</label>
                <textarea
                  value={step1.description}
                  onChange={(e) => setStep1((s) => ({ ...s, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe your project here..."
                  className={`w-full resize-none rounded-lg border ${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50'} p-2.5 text-xs font-medium ${t.cardText} outline-none`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setStep(1)}
                className={`inline-flex items-center gap-1 text-[11px] font-bold ${t.subText} hover:${t.cardText}`}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back to Step 1
              </button>
              <p className={`text-xs font-bold uppercase tracking-wider ${t.subText}`}>
                Step 2 — Optional, for {categories.find((c) => c.value === step1.category)?.label || 'this service'}
              </p>

              {fieldConfig.address.enabled && (
                <div>
                  <label className={labelCls}>Street Address</label>
                  <div className="space-y-2">
                    <div className={inputWrap}>
                      <MapPin className={`h-3.5 w-3.5 shrink-0 ${t.subText}`} />
                      <input
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="123 Main St"
                        autoComplete="address-line1"
                        className={inputField}
                      />
                    </div>
                    <div className={inputWrap}>
                      <input
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="Unit / Apt (optional)"
                        autoComplete="address-line2"
                        className={inputField}
                      />
                    </div>
                    <div className="grid grid-cols-[1fr_110px] gap-2">
                      <div className={inputWrap}>
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          autoComplete="address-level2"
                          className={inputField}
                        />
                      </div>
                      <div className={inputWrap}>
                        <input
                          value={zip}
                          onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          placeholder="Zip code"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          className={inputField}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showTimeline && (
                <div>
                  <label className={labelCls}>How soon do you need this?</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIMELINE_OPTIONS.map((opt) => {
                      const selected = preferredDate === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setPreferredDate(selected ? '' : opt.value)}
                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                          selected
                            ? 'border-transparent text-white shadow-sm'
                            : `${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50'} ${t.cardText} ${t.hoverBg}`
                        }`}
                          style={selected ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {showBestTimes && (
                <div>
                  <label className={labelCls}>Best time to reach you or come by</label>
                  <div className="flex flex-wrap gap-1.5">
                    {BEST_TIME_OPTIONS.map((opt) => {
                      const selected = bestTimesArray(preferredTime).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setPreferredTime(toggleBestTime(preferredTime, opt.value))}
                          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                          selected
                            ? 'border-transparent text-white shadow-sm'
                            : `${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50'} ${t.cardText} ${t.hoverBg}`
                        }`}
                          style={selected ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {fieldConfig.lead_source.enabled && (
                <div>
                  <label className={labelCls}>How did you hear about us?</label>
                  <div className={inputWrap}>
                    <Megaphone className={`h-3.5 w-3.5 shrink-0 ${t.subText}`} />
                    <input
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      placeholder="Google, referral, saw your truck..."
                      className={inputField}
                    />
                  </div>
                </div>
              )}

              {fieldConfig.file_upload.enabled && (
                <div>
                  <label className={labelCls}>Site Photos</label>
                  <div className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed ${t.border} py-4`}>
                    <ImageIcon className={`h-4 w-4 ${t.subText}`} />
                    <p className={`text-[11px] font-bold ${t.subText}`}>Test mode — upload disabled here</p>
                  </div>
                </div>
              )}

              {questionsForCategory.length === 0 && canUseCustomQuestions && (
                <p className={`rounded-lg border border-dashed ${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50/60'} px-3 py-3 text-[11px] font-medium ${t.subText}`}>
                  No custom questions set for this service yet — add some under Services.
                </p>
              )}

              {questionsForCategory.map((q: any) => (
                <div key={q.id}>
                  <label className={labelCls}>{q.label}</label>
                  {q.type === 'text' && (
                    <input
                      value={step2Answers[q.id] || ''}
                      onChange={(e) => setStep2Answers((a) => ({ ...a, [q.id]: e.target.value }))}
                      className={`w-full rounded-lg border ${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50'} px-3 py-2 text-xs font-medium ${t.cardText} outline-none`}
                    />
                  )}
                  {q.type === 'select' && (
                    <select
                      value={step2Answers[q.id] || ''}
                      onChange={(e) => setStep2Answers((a) => ({ ...a, [q.id]: e.target.value }))}
                      className={`w-full rounded-lg border ${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50'} px-3 py-2 text-xs font-medium ${t.cardText} outline-none`}
                    >
                      <option value="">Select an option...</option>
                      {(q.options || []).map((opt: string, i: number) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {q.type === 'checkbox' && (
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className={`flex items-center gap-1.5 text-xs font-semibold ${t.cardText}`}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={step2Answers[q.id] === opt}
                            onChange={() => setStep2Answers((a) => ({ ...a, [q.id]: opt }))}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className={`rounded-xl border ${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50/60'} p-4`}>
                <>
                    <button
                      onClick={handleSendTestEmail}
                      disabled={sendingEmail}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sendingEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      {sendingEmail ? 'Sending...' : `Email Me This as a Customer Would See It`}
                    </button>
                    {emailError && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-rose-500">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {emailError}
                      </p>
                    )}
                    <p className={`mt-2 text-[10px] font-medium ${t.subText}`}>
                      Sends a real email to the address above — nothing is stored or added to your dashboard.
                    </p>
                </>
              </div>
            </div>
          )}
        </div>

        {step === 1 && !emailSent && (
          <div className={`border-t ${t.border} px-5 py-4`}>
            <button
              onClick={() => step1Valid && setStep(2)}
              disabled={!step1Valid}
              className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs transition disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
            >
              Continue to Step 2
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}