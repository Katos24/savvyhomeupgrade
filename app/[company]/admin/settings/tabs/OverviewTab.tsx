'use client';

import { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Download,
  Loader2,
  Pencil,
  X,
  Save,
  Mail,
  Phone,
  Globe,
  Palette,
  Trash2,
  MessageSquare,
  Truck,
  FileImage,
  Sparkles,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { can, type PlanTier } from '@/lib/permissions';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500">
      {children}
    </span>
  );
}

// Blends a hex color toward white
function tint(hex: string, amount: number) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  if (isNaN(num)) return hex;

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function getStripeState(company: any): 'active' | 'pending' | 'restricted' | 'none' {
  if (!company?.stripe_connect_onboarded) return 'none';
  if (company.stripe_payment_status === 'active') return 'active';
  if (company.stripe_payment_status === 'restricted') return 'restricted';
  return 'pending';
}

function StripeStatusBadge({
  company,
  onNavigateSection,
}: {
  company: any;
  onNavigateSection: (section: string) => void;
}) {
  const state = getStripeState(company);
  const config = {
    active: { label: 'Stripe Active', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    pending: { label: 'Stripe In Review', pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    restricted: { label: 'Stripe Action Required', pill: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    none: { label: 'Connect Stripe', pill: 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200', dot: 'bg-stone-400' },
  }[state];

  return (
    <button
      onClick={() => onNavigateSection('payments')}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${config.pill}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </button>
  );
}

type ShareIdeaCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

function ShareIdeaCard({ icon: Icon, title, description }: ShareIdeaCardProps) {
  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition hover:border-stone-300">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-50">
        <Icon className="h-5 w-5 text-stone-700" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-stone-900">{title}</p>
        <p className="mt-0.5 text-xs font-normal leading-relaxed text-stone-500">
          {description}
        </p>
      </div>
    </div>
  );
}

type LabeledFieldProps = {
  icon: React.ElementType;
  label: string;
  editing: boolean;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  display: React.ReactNode;
  caption?: string;
  className?: string;
  maxLength?: number;
  highlight?: boolean;
};

function LabeledField({
  icon: Icon,
  label,
  editing,
  value,
  onChange,
  placeholder,
  display,
  caption,
  className = '',
  maxLength,
  highlight = false,
}: LabeledFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
        <Icon className="h-4 w-4 text-stone-500 shrink-0" />
        <span>{label}</span>
      </label>

      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        />
      ) : (
        <div
          className={`text-sm font-semibold text-stone-900 rounded-xl px-3.5 py-3 border transition ${
            highlight
              ? 'bg-amber-50/80 text-amber-900 border-amber-300'
              : 'bg-stone-50/80 border-stone-200/80'
          }`}
        >
          {display}
        </div>
      )}

      {caption && (
        <p className="px-1 text-[11px] font-medium leading-relaxed text-stone-500">
          {caption}
        </p>
      )}
    </div>
  );
}

type ChecklistStep =
  | { label: string; description: string; done: boolean; kind: 'section'; section: string }
  | { label: string; description: string; done: boolean; kind: 'link'; href: string };

type OverviewTabProps = {
  company: any;
  color1: string;
  color2: string;
  logoPreview: string;
  isEditingBrand: boolean;
  setIsEditingBrand: (v: boolean) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  companyEmail: string;
  setCompanyEmail: (v: string) => void;
  companyPhone: string;
  setCompanyPhone: (v: string) => void;
  formatPhone: (v: string) => string;
  companyWebsite: string;
  setCompanyWebsite: (v: string) => void;
  setLogoFile: (f: File | null) => void;
  setLogoPreview: (v: string) => void;
  setColor1: (v: string) => void;
  setColor2: (v: string) => void;
  brandSaving: boolean;
  brandSaved: boolean;
  onSaveBranding: () => void;
  qrCodeUrl: string;
  onShowQrModal: () => void;
  publicLink: string;
  copied: boolean;
  onCopy: () => void;
  checklistSteps: ChecklistStep[];
  onNavigateSection: (section: string) => void;
};

function BrandInvoicePreview({ company, refreshToken = 0 }: { company: any; refreshToken?: number }) {
  const [expanded, setExpanded] = useState(false);
  const [modalLoaded, setModalLoaded] = useState(false);
  const [modalTimedOut, setModalTimedOut] = useState(false);

  const planTier = (company.plan_tier || 'free') as PlanTier;
  const canSendInvoices = can(planTier, 'send_invoice_email');
  const previewUrl = `/api/company/${company.slug}/preview-invoice?v=${refreshToken}`;

  useEffect(() => {
    if (!expanded) return;
    setModalLoaded(false);
    setModalTimedOut(false);
    const t = setTimeout(() => {
      if (!modalLoaded) setModalTimedOut(true);
    }, 8000);
    return () => clearTimeout(t);
  }, [expanded, refreshToken, modalLoaded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-50 active:scale-[0.99]"
      >
        <Receipt className="h-4 w-4 text-stone-600" />
        Preview Invoice Template
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-2 sm:p-6 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex h-[85vh] max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <span className="text-sm font-bold text-stone-900">Invoice Preview</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 bg-stone-100">
              {!modalLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                  {modalTimedOut ? (
                    <p className="text-sm font-semibold text-stone-700">Preview failed to load.</p>
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                  )}
                </div>
              )}
              <iframe
                key={refreshToken}
                src={previewUrl}
                title="Sample invoice"
                onLoad={() => setModalLoaded(true)}
                className="w-full h-full border-0"
              />
            </div>

            {!canSendInvoices && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-xs font-semibold text-stone-600">
                  Upgrade to send branded invoices directly to clients.
                </p>
                <a
                  href={`/${company.slug}/admin/settings#billing`}
                  className="inline-flex justify-center items-center rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition"
                >
                  Upgrade Plan
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function OverviewTab({
  company,
  color1,
  color2,
  logoPreview,
  isEditingBrand,
  setIsEditingBrand,
  companyName,
  setCompanyName,
  companyEmail,
  setCompanyEmail,
  companyPhone,
  setCompanyPhone,
  formatPhone,
  companyWebsite,
  setCompanyWebsite,
  setLogoFile,
  setLogoPreview,
  setColor1,
  setColor2,
  brandSaving,
  brandSaved,
  onSaveBranding,
  qrCodeUrl,
  onShowQrModal,
  publicLink,
  copied,
  onCopy,
  checklistSteps,
  onNavigateSection,
}: OverviewTabProps) {
    const [emailError, setEmailError] = useState('');

  const doneCount = checklistSteps.filter((s) => s.done).length;
  const isFreePlan = (company.plan_tier || 'free') === 'free';
  const [invoicePreviewRefreshToken, setInvoicePreviewRefreshToken] = useState(0);

  const missingLogo = !company.logo_url && !logoPreview;

  useEffect(() => {
    if (brandSaved) {
      setInvoicePreviewRefreshToken((n) => n + 1);
    }
  }, [brandSaved]);

  const handleCancelEdit = () => {
    setIsEditingBrand(false);
    setEmailError('');
    setCompanyName(company.name);
    setCompanyEmail(company.email || '');
    setCompanyPhone(formatPhone(company.phone || ''));
    setCompanyWebsite(company.website || '');
    setColor1(company.email_brand_color_1 || '#0B3C6D');
    setColor2(company.email_brand_color_2 || '#1F5F8F');
    setLogoPreview(company.logo_url ? `${company.logo_url}?v=${Date.now()}` : '');
    setLogoFile(null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('Logo size must be under 4MB.');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-stone-50/60 min-h-screen px-4 py-6 sm:px-8">
      <div className="relative mx-auto max-w-4xl pb-16">
        
        {/* ── HEADER & BRAND BADGE ── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/60 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-2 shrink-0 rounded-full"
              style={{ background: `linear-gradient(180deg, ${color1}, ${color2})` }}
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
                Welcome to Lead2Project
              </h1>
              <p className="text-xs sm:text-sm font-medium text-stone-500 mt-0.5">
                Complete setup below to launch your branded booking flow.
              </p>
            </div>
          </div>

          <Link href="/" className="self-start sm:self-center flex items-center gap-2">
            <img
              src="/Lead2ProjectLogo.webp"
              alt="Lead2Project Logo"
              className="h-9 w-auto object-contain rounded-lg border border-stone-200 bg-white p-1 shadow-sm"
            />
          </Link>
        </div>

        {/* ── 1. SETUP CHECKLIST (TOP PRIORITY ONBOARDING) ── */}
        {doneCount < checklistSteps.length && (
          <div className="mb-8">
            <div className="mb-2.5 flex items-center justify-between">
              <Eyebrow>Account Setup</Eyebrow>
              <span className="text-[11px] font-extrabold tracking-wider text-stone-500">
                {doneCount} OF {checklistSteps.length} COMPLETED
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="h-1.5 w-full bg-stone-100">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(doneCount / checklistSteps.length) * 100}%`,
                    background: `linear-gradient(90deg, ${color1}, ${color2})`,
                  }}
                />
              </div>

              <div className="divide-y divide-stone-100">
                {checklistSteps.map((step, i) => {
                  const inner = (
                    <div className="flex items-start gap-3.5 p-4 sm:px-6 transition hover:bg-stone-50/80">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          step.done ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300 bg-white'
                        }`}
                      >
                        {step.done && <Check className="h-3 w-3 stroke-[3px] text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-bold ${
                            step.done ? 'text-stone-400 line-through' : 'text-stone-900'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );

                  return step.kind === 'link' ? (
                    <a key={step.label} href={step.href} className="block">
                      {inner}
                    </a>
                  ) : (
                    <button
                      key={step.label}
                      onClick={() => onNavigateSection(step.section)}
                      className="w-full text-left"
                    >
                      {inner}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 2. BRANDING PROFILE CARD ── */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm mb-8">
          {/* Header Banner */}
          <div
            className="flex flex-col gap-4 border-b border-stone-200/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            style={{ background: `linear-gradient(135deg, ${tint(color1, 0.94)}, ${tint(color2, 0.94)})` }}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Logo Frame */}
              <div className="relative shrink-0 group">
                <div
                  className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                    missingLogo
                      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400/20'
                      : 'border-stone-200'
                  }`}
                >
                  {logoPreview ? (
                    <img src={logoPreview} className="h-full w-full object-contain p-2" alt="Company Logo" />
                  ) : (
                    <span className="text-2xl font-black text-stone-300">
                      {companyName?.charAt(0)}
                    </span>
                  )}

                  {isEditingBrand && (
                    <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-stone-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Pencil className="h-4 w-4" />
                      <span className="mt-1 text-[9px] font-extrabold uppercase">Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                {isEditingBrand ? (
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="w-full border-b-2 border-stone-400 bg-transparent text-lg sm:text-xl font-bold text-stone-900 outline-none focus:border-stone-900"
                  />
                ) : (
                  <h2 className="truncate text-lg sm:text-xl font-bold text-stone-900">
                    {companyName}
                  </h2>
                )}

                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {isFreePlan ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                      Free Plan
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-stone-900 px-2.5 py-0.5 text-[10px] font-bold text-white capitalize">
                      {company.plan_tier} Plan
                    </span>
                  )}
                  <StripeStatusBadge company={company} onNavigateSection={onNavigateSection} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {!isEditingBrand ? (
                <button
                  onClick={() => setIsEditingBrand(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 shadow-sm hover:bg-stone-50 transition"
                >
                  <Pencil className="h-3.5 w-3.5 text-stone-600" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button
                    onClick={() => {
                      const trimmed = companyEmail.trim();
                      if (!trimmed) {
                        setEmailError('An email address is required so customers and notifications can reach you.');
                        return;
                      }
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                        setEmailError('Enter a valid email address.');
                        return;
                      }
                      setEmailError('');
                      onSaveBranding();
                    }}
                    disabled={brandSaving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
                  >
                    {brandSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : brandSaved ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {brandSaving ? 'Saving...' : brandSaved ? 'Saved' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Fields List */}
              <div className="lg:col-span-2 flex flex-col gap-4">
               <div>
                  <LabeledField
                    icon={Mail}
                    label="Company Email"
                    editing={isEditingBrand}
                    value={companyEmail}
                    onChange={(v) => { setCompanyEmail(v); setEmailError(''); }}
                    placeholder="you@company.com"
                    display={company.email || 'No email added'}
                    caption="This is your Reply‑To inbox. Customer responses land here, and you can BCC yourself on outgoing emails by enabling it in Settings."
                    highlight={!company.email}
                    className={emailError ? 'ring-2 ring-rose-200 rounded-xl' : ''}
                  />
                  {emailError && (
                    <p className="mt-1.5 px-1 text-[12px] font-semibold text-rose-600">
                      {emailError}
                    </p>
                  )}
                </div>
                <LabeledField
                  icon={Phone}
                  label="Company Phone"
                  editing={isEditingBrand}
                  value={companyPhone}
                  onChange={(v) => setCompanyPhone(formatPhone(v))}
                  placeholder="(555) 555-5555"
                  maxLength={14}
                  display={company.phone ? formatPhone(company.phone) : 'No phone set'}
                  highlight={!company.phone}
                />
                <LabeledField
                  icon={Globe}
                  label="Company Website"
                  editing={isEditingBrand}
                  value={companyWebsite}
                  onChange={setCompanyWebsite}
                  placeholder="https://yourcompany.com"
                  display={
                    company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      'No website set'
                    )
                  }
                  highlight={!company.website}
                />
              </div>

              {/* Brand Colors Sidebar */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-stone-700">
                    <Palette className="h-4 w-4 text-stone-500" /> Brand Palette
                  </p>
                  {isEditingBrand ? (
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={color1}
                          onChange={(e) => setColor1(e.target.value)}
                          className="h-10 w-10 cursor-pointer rounded-xl border border-stone-300 p-1 bg-white shadow-sm"
                        />
                        <span className="text-[10px] font-bold text-stone-500">Primary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={color2}
                          onChange={(e) => setColor2(e.target.value)}
                          className="h-10 w-10 cursor-pointer rounded-xl border border-stone-300 p-1 bg-white shadow-sm"
                        />
                        <span className="text-[10px] font-bold text-stone-500">Secondary</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="h-10 w-10 rounded-xl border border-stone-200 shadow-sm"
                        style={{ background: color1 }}
                      />
                      <div
                        className="h-10 w-10 rounded-xl border border-stone-200 shadow-sm"
                        style={{ background: color2 }}
                      />
                    </div>
                  )}
                </div>

                <BrandInvoicePreview company={company} refreshToken={invoicePreviewRefreshToken} />
              </div>
            </div>

            {/* Public Booking Link Card */}
            <div className="mt-8 border-t border-stone-200/80 pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Your Client Booking Link
              </p>
              <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                Share this link on your social profiles or website so leads can book instantly into your pipeline.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5">
                  <code className="whitespace-nowrap font-mono text-xs font-bold text-stone-800">
                    {publicLink || `lead2project.com/${company.slug}`}
                  </code>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={onCopy}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-stone-500" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={publicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: color1 }}
                  >
                    View Form <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={onShowQrModal}
                    className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white p-2.5 text-stone-700 hover:bg-stone-50 transition"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. SHARE IDEAS ── */}
        <div className="mb-8">
          <div className="mb-2.5">
            <Eyebrow>Promote Your Link</Eyebrow>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ShareIdeaCard
              icon={Globe}
              title="Google Business Profile"
              description="Add your booking link to your website field on Google."
            />
            <ShareIdeaCard
              icon={MessageSquare}
              title="Social Media Bios"
              description="Drop the link directly in your Instagram, TikTok, or Facebook bio."
            />
            <ShareIdeaCard
              icon={FileImage}
              title="Flyers & Yard Signs"
              description="Print the QR code onto door hangers and promotional signs."
            />
            <ShareIdeaCard
              icon={Truck}
              title="Vehicle Magnets"
              description="Put a QR code on your work truck to collect leads on job sites."
            />
          </div>
        </div>

        {/* Upgrade Banner (If Free) */}
        {isFreePlan && (
          <div className="mb-8">
            <SettingsUpgradeBanner
              planLabel="Basic"
              price="$49.99/mo"
              message="Upgrade to send unlimited branded invoices and automated client quote follow-ups."
              companySlug={company.slug}
            />
          </div>
        )}

        {/* Recovery Link */}
        <div className="flex justify-end">
          <a
            href={`/${company.slug}/dashboard/deleted-leads`}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100/80 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Lead Recovery Center
          </a>
        </div>

      </div>
    </div>
  );
}