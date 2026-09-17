'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  ArrowUpRight,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Megaphone,
  Image as ImageIcon,
  ChevronDown,
  Link2,
  Truck,
  Eye,
  X,
} from 'lucide-react';

/* ═══════════════ Types & Constants ═══════════════ */

export type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

export type Category = { emoji?: string; label: string; value: string };
export type FieldConfigItem = { enabled: boolean; required?: boolean };

export type FieldConfig = {
  address: FieldConfigItem & { required: boolean };
  preferred_date: FieldConfigItem;
  preferred_time: FieldConfigItem;
  lead_source: FieldConfigItem;
  file_upload: FieldConfigItem;
};

export const DEFAULT_FIELD_CONFIG: FieldConfig = {
  address: { enabled: true, required: false },
  preferred_date: { enabled: true },
  preferred_time: { enabled: true },
  lead_source: { enabled: true },
  file_upload: { enabled: false },
};

export const REQUIRED_PLAN = { label: 'Basic', price: '$49.99/mo' };

/* ═══════════════ Brand Logos ═══════════════ */

export function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

export function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M15.5 12.5h-2v7h-3v-7H9v-2.6h1.5V8.4c0-1.5.9-2.9 3.2-2.9h2v2.5h-1.5c-.3 0-.7.2-.7.8v1.6H16l-.5 2.6z" />
    </svg>
  );
}

export function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ig-card-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="30%" stopColor="#FA7E1E" />
          <stop offset="60%" stopColor="#D62976" />
          <stop offset="85%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-card-gradient)" />
      <rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="#fff" />
    </svg>
  );
}

/* ═══════════════ Share Spots Data ═══════════════ */

export type ShareSpot = {
  id: string;
  icon: React.ElementType;
  useCompanyLogo?: boolean;
  title: string;
  line: string;
};

export const SHARE_SPOTS: ShareSpot[] = [
  { id: 'google', icon: GoogleLogo, title: 'Google Business Profile', line: 'Paste in your "Booking" or "Quote" URL field.' },
  { id: 'website', icon: Link2, useCompanyLogo: true, title: 'Your Website', line: 'Point your "Get a Quote" button directly to it.' },
  { id: 'facebook', icon: FacebookLogo, title: 'Facebook Page', line: 'Pin to your Page or drop in job post comments.' },
  { id: 'instagram', icon: InstagramLogo, title: 'Instagram Bio', line: 'Put in your bio link, then write "link in bio".' },
  { id: 'vehicle', icon: Truck, title: 'Truck & Cards', line: 'Print your QR code — let clients scan on site.' },
  { id: 'flyers', icon: ImageIcon, title: 'Flyers & Signs', line: 'Include QR codes on yard signs you leave behind.' },
];

/* ═══════════════ UI Control Components ═══════════════ */

export function UpgradePill({ companySlug }: { companySlug: string }) {
  return (
    <a
      href={`/${companySlug}/home?section=billing`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-amber-700 shadow-xs"
    >
      <Lock className="h-3 w-3" />
      <span>{REQUIRED_PLAN.label}</span>
    </a>
  );
}

export function UpgradeNotice({ companySlug, feature }: { companySlug: string; feature: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-xs font-semibold leading-relaxed text-amber-900">
          {feature} is available on the <span className="font-bold">{REQUIRED_PLAN.label} plan ({REQUIRED_PLAN.price})</span>.
        </p>
      </div>
      <a
        href={`/${companySlug}/home?section=billing`}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 shadow-xs"
      >
        Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export function ToggleSwitch({ enabled, onToggle, ariaLabel }: { enabled: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-slate-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function LockedControlRow({ icon: Icon, label, hint }: { icon: React.ElementType; label: string; hint: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800">{label}</p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{hint}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        <Lock className="h-3 w-3" /> Required
      </span>
    </div>
  );
}

export function ControlRow({
  icon: Icon,
  label,
  hint,
  enabled,
  onToggle,
  planLocked,
  companySlug,
}: {
  icon: React.ElementType;
  label: string;
  hint?: string;
  enabled: boolean;
  onToggle: () => void;
  planLocked?: boolean;
  companySlug?: string;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 ${planLocked ? 'bg-amber-50/40' : ''}`}>
      <Icon className={`h-4 w-4 shrink-0 ${enabled && !planLocked ? 'text-slate-700' : 'text-slate-400'}`} />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-bold ${enabled && !planLocked ? 'text-slate-900' : 'text-slate-500'}`}>
          {label}
        </p>
        {hint && <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{hint}</p>}
      </div>

      {planLocked && companySlug ? (
        <UpgradePill companySlug={companySlug} />
      ) : (
        <ToggleSwitch enabled={enabled} onToggle={onToggle} ariaLabel={`Show ${label} on your form`} />
      )}
    </div>
  );
}

/* ═══════════════ Phone Mockup Framing ═══════════════ */

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative h-[540px] rounded-[2.25rem] border-[8px] border-slate-900 bg-slate-900 shadow-xl">
        <div className="absolute left-1/2 top-1.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="h-full overflow-y-auto rounded-[1.6rem] bg-white">{children}</div>
      </div>
    </div>
  );
}

export function PhoneHeader({
  logoUrl,
  heading,
  brandColor1,
  brandColor2,
}: {
  logoUrl?: string | null;
  heading: string;
  brandColor1: string;
  brandColor2: string;
}) {
  return (
    <div
      className="px-5 pb-5 pt-8 text-white"
      style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
    >
      {logoUrl && <img src={logoUrl} alt="Logo" className="mb-3 h-7 w-auto object-contain" />}
      <h3 className="text-sm font-bold tracking-tight text-white">{heading}</h3>
    </div>
  );
}

export const fieldBox =
  'flex min-h-[40px] w-full items-center gap-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700';

export function PhoneField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

/* ═══════════════ Mobile Drawer Live Preview ═══════════════ */

export function LivePreviewDrawer({
  isOpen,
  onClose,
  company,
  fieldConfig,
  customQuestions,
  canUseCustomQuestions,
  categories,
  heading,
}: {
  isOpen: boolean;
  onClose: () => void;
  company: any;
  fieldConfig: FieldConfig;
  customQuestions: CustomQuestion[];
  canUseCustomQuestions: boolean;
  categories: Category[];
  heading: string;
}) {
  const brandColor1 = company.email_brand_color_1 || '#0B3C6D';
  const brandColor2 = company.email_brand_color_2 || '#1F5F8F';

  const enabledCount =
    Number(fieldConfig.address.enabled) +
    Number(fieldConfig.preferred_date.enabled) +
    Number(fieldConfig.lead_source.enabled) +
    Number(fieldConfig.file_upload.enabled) +
    (canUseCustomQuestions ? customQuestions.length : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">Live Mobile Preview</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
              <div className="mx-auto flex max-w-xs flex-col gap-8">
                {/* Step 1 Required Phone */}
                <div>
                  <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step 1 — Required Fields
                  </p>
                  <PhoneFrame>
                    <PhoneHeader logoUrl={company.logo_url} heading={heading} brandColor1={brandColor1} brandColor2={brandColor2} />
                    <div className="space-y-3.5 p-4">
                      <PhoneField label="Full Name">
                        <div className={fieldBox}><User className="h-3.5 w-3.5 shrink-0 text-slate-400" />John Smith</div>
                      </PhoneField>
                      <PhoneField label="Email Address">
                        <div className={fieldBox}><Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">john@example.com</span></div>
                      </PhoneField>
                      <PhoneField label="Phone Number">
                        <div className={fieldBox}><Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />(555) 123-4567</div>
                      </PhoneField>
                      <PhoneField label="Service Needed">
                        <div className="flex flex-wrap gap-1.5">
                          {categories.map((cat, i) => (
                            <span
                              key={i}
                              className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                                i === 0 ? 'border-transparent text-white' : 'border-slate-200 bg-slate-50 text-slate-600'
                              }`}
                              style={i === 0 ? { background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` } : {}}
                            >
                              {cat.label}
                            </span>
                          ))}
                        </div>
                      </PhoneField>
                      <PhoneField label="Project Description">
                        <div className="h-16 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-400">
                          Describe your project here...
                        </div>
                      </PhoneField>
                      <div
                        className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
                        style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
                      >
                        Submit Request
                      </div>
                    </div>
                  </PhoneFrame>
                </div>

                {/* Step 2 Optional Phone */}
                <div>
                  <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step 2 — Optional Fields You've Enabled
                  </p>
                  <PhoneFrame>
                    <PhoneHeader logoUrl={company.logo_url} heading={heading} brandColor1={brandColor1} brandColor2={brandColor2} />
                    <div className="space-y-3.5 p-4">
                      {enabledCount === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
                          <p className="text-xs font-bold text-slate-700">No extra fields active</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">
                            Clients will only see your standard required fields.
                          </p>
                        </div>
                      )}

                      {fieldConfig.address.enabled && (
                        <PhoneField label="Address">
                          <div className={fieldBox}><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">123 Main St, New York 12345</span></div>
                        </PhoneField>
                      )}
                      {fieldConfig.preferred_date.enabled && (
                        <PhoneField label="Preferred Date & Time">
                          <div className="space-y-2">
                            <div className={fieldBox}><Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />MM / DD / YYYY</div>
                            <div className={fieldBox}><Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />Morning</div>
                          </div>
                        </PhoneField>
                      )}
                      {fieldConfig.lead_source.enabled && (
                        <PhoneField label="How did you hear about us?">
                          <div className={fieldBox}><Megaphone className="h-3.5 w-3.5 shrink-0 text-slate-400" /><span className="truncate">Google, referral, saw your truck...</span></div>
                        </PhoneField>
                      )}
                      {fieldConfig.file_upload.enabled && (
                        <PhoneField label="Site Photos">
                          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-4">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                            <p className="text-[11px] font-bold text-slate-600">Tap to upload photos</p>
                          </div>
                        </PhoneField>
                      )}

                      {canUseCustomQuestions &&
                        customQuestions.map((q) => (
                          <PhoneField key={q.id} label={q.label}>
                            {q.type === 'text' && <div className={`${fieldBox} text-slate-400`}>Client answer...</div>}
                            {q.type === 'select' && (
                              <div className={`${fieldBox} justify-between`}>
                                <span className="truncate">{q.options?.[0] || 'Select an option...'}</span>
                                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              </div>
                            )}
                            {q.type === 'checkbox' && (
                              <div className="flex gap-4 py-1">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                  <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" /> Yes
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                  <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" /> No
                                </span>
                              </div>
                            )}
                          </PhoneField>
                        ))}

                      <div
                        className="flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
                        style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
                      >
                        Submit Request
                      </div>
                    </div>
                  </PhoneFrame>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}