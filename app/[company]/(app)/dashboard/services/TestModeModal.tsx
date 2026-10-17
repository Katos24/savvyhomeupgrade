'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, User, Mail, Phone, MapPin, ImageIcon, FlaskConical, Send, Loader2, Check, AlertCircle } from 'lucide-react';
import type { Category } from '../../../admin/settings/tabs/useFormTabLogic';
import { themeTokens } from './CategoriesTaskEditorModal';
import { TIMELINE_OPTIONS, BEST_TIME_OPTIONS, bestTimesArray, toggleBestTime } from '@/lib/timing';

// (555) 123-4567 as the user types, capped at 10 digits (same as the real form).
function formatPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// Same choices as the real form's "How did you hear about us?"
const LEAD_SOURCES = ['Google Search', 'Facebook', 'Instagram', 'Google Ads', 'Referral', 'Yard Sign', 'Saw Your Truck', 'Other'];

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
  const brand = `linear-gradient(135deg, ${brandColor1}, ${brandColor2})`;

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

  const questionsForCategory = canUseCustomQuestions ? customQuestions.filter((q: any) => q.category === step1.category) : [];
  const serviceLabel = categories.find((c) => c.value === step1.category)?.label || 'this service';

  const phoneDigits = step1.phone.replace(/\D/g, '');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = EMAIL_RE.test(step1.email.trim());
  const step1Valid = Boolean(step1.name.trim() && emailValid && phoneDigits.length === 10 && step1.category && step1.description.trim());

  // One line for the test email, e.g. "123 Main St, Apt 2B, Holbrook 11741"
  const addressLine = [street.trim(), unit.trim(), [city.trim(), zip.trim()].filter(Boolean).join(' ')].filter(Boolean).join(', ');

  /* ── Styles: readable labels, 16px inputs on phones (no iOS zoom) ── */
  const fieldBg = isDark ? 'bg-white/5' : 'bg-white';
  const inputWrap = `flex items-center gap-2 rounded-xl border ${t.border} ${fieldBg} px-3 py-2.5 focus-within:ring-2 ${
    isDark ? 'focus-within:ring-white/30' : 'focus-within:ring-slate-300'
  }`;
  const inputField = `w-full bg-transparent text-base sm:text-sm font-medium ${t.cardText} outline-none ${
    isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
  }`;
  const labelCls = `mb-1.5 block text-sm font-semibold ${t.cardText}`;
  const hintCls = `text-[13px] font-normal ${t.subText}`;
  const pillOff = `${t.border} ${fieldBg} ${t.cardText} ${t.hoverBg}`;

  const Pill = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) => (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition active:scale-95 ${
        selected ? 'border-transparent text-white shadow-sm' : pillOff
      }`}
      style={selected ? { background: brand } : undefined}
    >
      {children}
    </button>
  );

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
      if (data.success) setEmailSent(true);
      else setEmailError(data.error || 'Could not send the test email.');
    } catch {
      setEmailError('Network error sending the test email.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Test your booking form"
        className={`flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl shadow-2xl sm:rounded-2xl ${t.overlayCard}`}
      >
        {/* Test-mode bar (app style) */}
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-3 ${t.border}`}>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              isDark ? 'bg-amber-400/15 text-amber-200' : 'bg-amber-50 text-amber-800'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" /> Test mode · nothing is saved
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close test"
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.subText} ${t.hoverBg}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* The customer's view keeps the contractor's brand colors */}
        {!emailSent && (
          <div className="px-5 py-4 text-white" style={{ background: brand }}>
            <p className="text-xs font-semibold text-white/80">Step {step} of 2</p>
            <h3 className="mt-0.5 text-lg font-bold leading-tight">{step === 1 ? getCtaHeading() : 'A few more details'}</h3>
            {step === 2 && <p className="mt-0.5 text-sm text-white/85">Everything here is optional.</p>}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {emailSent ? (
            /* ── Done ── */
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-md" style={{ background: brand }}>
                <Check className="h-7 w-7" />
              </div>
              <h3 className={`text-lg font-bold ${t.cardText}`}>Test complete</h3>
              <p className={`mt-2 max-w-xs text-sm ${t.subText}`}>
                We sent the test email to <span className={`font-semibold ${t.cardText}`}>{step1.email}</span>. Check your inbox to
                see what you&rsquo;d receive.
              </p>
              <p className={`mt-3 max-w-xs text-[13px] ${t.subText}`}>Nothing was saved and no lead was added.</p>
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmailError('');
                  setStep(1);
                }}
                className={`mt-5 rounded-xl border px-4 py-2.5 text-sm font-semibold ${t.border} ${t.cardText} ${t.hoverBg}`}
              >
                Run another test
              </button>
            </div>
          ) : step === 1 ? (
            /* ── Step 1 ── */
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Full name</label>
                <div className={inputWrap}>
                  <User className={`h-4 w-4 shrink-0 ${t.subText}`} />
                  <input
                    value={step1.name}
                    onChange={(e) => setStep1((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Jane Doe"
                    className={inputField}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Email <span className={hintCls}>· the test email goes here</span>
                </label>
                <div className={inputWrap}>
                  <Mail className={`h-4 w-4 shrink-0 ${t.subText}`} />
                  <input
                    type="email"
                    value={step1.email}
                    onChange={(e) => setStep1((s) => ({ ...s, email: e.target.value }))}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="you@example.com"
                    className={inputField}
                  />
                </div>
                {emailTouched && step1.email.trim() && !emailValid && (
                  <p className="mt-1.5 text-[13px] font-medium text-rose-500">Enter a valid email address.</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Phone</label>
                <div className={inputWrap}>
                  <Phone className={`h-4 w-4 shrink-0 ${t.subText}`} />
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
                  <p className="mt-1.5 text-[13px] font-medium text-rose-500">Enter a 10-digit phone number.</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Service needed</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat: Category) => (
                    <Pill
                      key={cat.value}
                      selected={step1.category === cat.value}
                      onClick={() => setStep1((s) => ({ ...s, category: cat.value }))}
                    >
                      {cat.label}
                    </Pill>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Describe the job</label>
                <textarea
                  value={step1.description}
                  onChange={(e) => setStep1((s) => ({ ...s, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe your project here…"
                  className={`w-full resize-none rounded-xl border ${t.border} ${fieldBg} p-3 text-base font-medium sm:text-sm ${t.cardText} outline-none ${
                    isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>
          ) : (
            /* ── Step 2: same order as the real form ── */
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`-ml-1 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-sm font-semibold ${t.subText} ${t.hoverBg}`}
              >
                <ChevronLeft className="h-4 w-4" /> Back to step 1
              </button>

              {/* Address */}
              {fieldConfig.address.enabled && (
                <div>
                  <label className={labelCls}>Address</label>
                  <div className="space-y-2">
                    <div className={inputWrap}>
                      <MapPin className={`h-4 w-4 shrink-0 ${t.subText}`} />
                      <input
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="123 Main St"
                        autoComplete="address-line1"
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
                          placeholder="ZIP"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          className={inputField}
                        />
                      </div>
                    </div>
                    <div className={inputWrap}>
                      <input
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="Unit / Apt (if any)"
                        autoComplete="address-line2"
                        className={inputField}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Service questions */}
              {questionsForCategory.length > 0 && (
                <div className={`space-y-5 ${fieldConfig.address.enabled ? `border-t pt-5 ${t.border}` : ''}`}>
                  <p className={`text-base font-bold ${t.cardText}`}>A few quick questions</p>
                  {questionsForCategory.map((q: any) => (
                    <div key={q.id}>
                      <label className={labelCls}>{q.label}</label>
                      {q.type === 'text' && (
                        <div className={inputWrap}>
                          <input
                            value={step2Answers[q.id] || ''}
                            onChange={(e) => setStep2Answers((a) => ({ ...a, [q.id]: e.target.value }))}
                            placeholder="Your answer"
                            className={inputField}
                          />
                        </div>
                      )}
                      {q.type === 'select' && (
                        <div className="flex flex-wrap gap-2">
                          {(q.options || []).map((opt: string, i: number) => {
                            const selected = step2Answers[q.id] === opt;
                            return (
                              <Pill
                                key={`${opt}-${i}`}
                                selected={selected}
                                onClick={() => setStep2Answers((a) => ({ ...a, [q.id]: selected ? '' : opt }))}
                              >
                                {opt}
                              </Pill>
                            );
                          })}
                        </div>
                      )}
                      {q.type === 'checkbox' && (
                        <div className="flex gap-2">
                          {['Yes', 'No'].map((opt) => {
                            const selected = step2Answers[q.id] === opt;
                            return (
                              <Pill
                                key={opt}
                                selected={selected}
                                onClick={() => setStep2Answers((a) => ({ ...a, [q.id]: selected ? '' : opt }))}
                              >
                                <span className="px-2">{opt}</span>
                              </Pill>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {questionsForCategory.length === 0 && canUseCustomQuestions && (
                <p className={`rounded-xl border border-dashed px-3.5 py-3 text-[13px] ${t.border} ${t.subText}`}>
                  No questions set up for {serviceLabel} yet. Add them on that service under Services.
                </p>
              )}

              {/* Timing */}
              {showTimeline && (
                <div>
                  <label className={labelCls}>How soon do you need this?</label>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINE_OPTIONS.map((opt) => {
                      const selected = preferredDate === opt.value;
                      return (
                        <Pill key={opt.value} selected={selected} onClick={() => setPreferredDate(selected ? '' : opt.value)}>
                          {opt.label}
                        </Pill>
                      );
                    })}
                  </div>
                </div>
              )}

              {showBestTimes && (
                <div>
                  <label className={labelCls}>
                    Best time to reach you or come by <span className={hintCls}>· pick any</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BEST_TIME_OPTIONS.map((opt) => (
                      <Pill
                        key={opt.value}
                        selected={bestTimesArray(preferredTime).includes(opt.value)}
                        onClick={() => setPreferredTime(toggleBestTime(preferredTime, opt.value))}
                      >
                        {opt.label}
                      </Pill>
                    ))}
                  </div>
                </div>
              )}

              {/* How they found you */}
              {fieldConfig.lead_source.enabled && (
                <div>
                  <label className={labelCls}>How did you hear about us?</label>
                  <div className="flex flex-wrap gap-2">
                    {LEAD_SOURCES.map((src) => {
                      const selected = leadSource === src;
                      return (
                        <Pill key={src} selected={selected} onClick={() => setLeadSource(selected ? '' : src)}>
                          {src}
                        </Pill>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Photos */}
              {fieldConfig.file_upload.enabled && (
                <div>
                  <label className={labelCls}>Photos or videos</label>
                  <div className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed py-5 ${t.border}`}>
                    <ImageIcon className={`h-5 w-5 ${t.subText}`} />
                    <p className={`text-[13px] font-medium ${t.subText}`}>Uploads are turned off in test mode</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!emailSent && (
          <div className={`border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${t.border}`}>
            {step === 1 ? (
              <button
                type="button"
                onClick={() => step1Valid && setStep(2)}
                disabled={!step1Valid}
                className="flex h-12 w-full items-center justify-center rounded-xl text-base font-bold text-white shadow-sm transition disabled:opacity-40"
                style={{ background: brand }}
              >
                Continue to step 2
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingEmail}
                  className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
                    isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sendingEmail ? 'Sending…' : 'Email me what I’d receive'}
                </button>
                {emailError && (
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {emailError}
                  </p>
                )}
                <p className={`mt-2 text-center text-[13px] ${t.subText}`}>Sends a real email to {step1.email || 'you'}. Nothing is saved.</p>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}