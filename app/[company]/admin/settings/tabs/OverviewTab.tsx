'use client';

import { useState, useEffect, ReactNode, ChangeEvent } from 'react';
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
  Receipt,
  ShieldAlert,
  ChevronRight,
  Building2,
  Link as LinkIcon,
  CheckCircle2,
  Bell,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { can, type PlanTier } from '@/lib/permissions';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';

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
    active: { label: 'Payments Active', pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    pending: { label: 'In Review', pill: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
    restricted: { label: 'Action Needed', pill: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
    none: { label: 'Connect Stripe', pill: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200', dot: 'bg-slate-400' },
  }[state];

  return (
    <button
      onClick={() => onNavigateSection('payments')}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide transition ${config.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </button>
  );
}

type LabeledFieldProps = {
  icon: React.ElementType;
  label: string;
  editing: boolean;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  display: ReactNode;
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
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>{label}</span>
      </label>

      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        />
      ) : (
        <div
          className={`text-sm font-semibold text-slate-900 rounded border px-3 py-2 transition ${
            highlight
              ? 'bg-amber-50/60 text-amber-950 border-amber-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {display}
        </div>
      )}

      {caption && (
        <p className="text-[11px] font-normal leading-normal text-slate-500 mt-0.5">
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
  brandError?: string | null;
  onSaveBranding: () => void;
  qrCodeUrl: string;
  onShowQrModal: () => void;
  publicLink: string;
  copied: boolean;
  onCopy: () => void;
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
      setModalLoaded((loaded) => {
        if (!loaded) setModalTimedOut(true);
        return loaded;
      });
    }, 8000);
    return () => clearTimeout(t);
  }, [expanded, refreshToken]);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-800 transition hover:bg-slate-50"
      >
        <Receipt className="h-3.5 w-3.5 text-slate-500" />
        Preview Invoice Template
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex h-[85vh] max-h-[800px] w-full max-w-2xl flex-col overflow-hidden rounded bg-white shadow-xl border border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Invoice Template Preview
              </span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="p-1 text-slate-500 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative flex-1 bg-slate-100">
              {!modalLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  {modalTimedOut ? (
                    <p className="text-xs font-semibold text-slate-600">Preview failed to load.</p>
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
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
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium text-amber-900">
                  Upgrade your plan to send branded PDF invoices to clients.
                </p>
                <a
                  href={`/${company.slug}/admin/settings#billing`}
                  className="rounded bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition shrink-0"
                >
                  Upgrade
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
  brandError,
  onSaveBranding,
  qrCodeUrl,
  onShowQrModal,
  publicLink,
  copied,
  onCopy,
  onNavigateSection,
}: OverviewTabProps) {
  const [emailError, setEmailError] = useState('');
  const [invoicePreviewRefreshToken, setInvoicePreviewRefreshToken] = useState(0);

  // Notifications / Automations State
  const planTier = (company.plan_tier ?? 'free') as PlanTier;
  const [digestEnabled, setDigestEnabled] = useState(company.daily_digest_enabled ?? false);
  const [showDigestConfirm, setShowDigestConfirm] = useState(false);
  const [digestSaving, setDigestSaving] = useState(false);
  const [bccEnabled, setBccEnabled] = useState(company.bcc_sender_on_email ?? false);
  const [bccSaving, setBccSaving] = useState(false);


 const isFreePlan = planTier === 'free';
  const missingLogo = !company.logo_url && !logoPreview;

  useEffect(() => {
    if (brandSaved) {
      setInvoicePreviewRefreshToken((n) => n + 1);
    }
  }, [brandSaved]);

  useEffect(() => {
    setBccEnabled(company.bcc_sender_on_email ?? false);
    setDigestEnabled(company.daily_digest_enabled ?? false);
  }, [company.bcc_sender_on_email, company.daily_digest_enabled]);

  const handleToggleBcc = async () => {
    const newVal = !bccEnabled;
    setBccEnabled(newVal);
    setBccSaving(true);
    try {
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-bcc', data: { bcc_sender_on_email: newVal } }),
      });
    } catch {
      setBccEnabled(!newVal);
    } finally {
      setBccSaving(false);
    }
  };

  const handleConfirmDigestToggle = async () => {
    const newVal = !digestEnabled;
    setDigestEnabled(newVal);
    setShowDigestConfirm(false);
    setDigestSaving(true);
    try {
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-notifications',
          data: {
            reminder_settings: company.reminder_settings,
            notification_preferences: {
              ...(company.notification_preferences || {}),
              daily_digest: { enabled: newVal },
              digest_recipient: 'company',
            },
          },
        }),
      });
    } catch {
      setDigestEnabled(!newVal);
    } finally {
      setDigestSaving(false);
    }
  };

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

  const handleSaveEdit = () => {
    const trimmed = companyEmail.trim();
    if (!trimmed) {
      setEmailError('An email address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError('');
    onSaveBranding();
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Logo size must be under ${MAX_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-8 font-sans antialiased text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        
        {/* Top Operational Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-700" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Company Overview & Configuration
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage your business profile, public booking endpoints, and client communication styling.
            </p>
          </div>

          <Link href="/" className="shrink-0 self-start sm:self-auto">
            <img
              src="/Lead2ProjectLogo.webp"
              alt="Lead2Project"
              className="h-7 w-auto object-contain border border-slate-200 rounded bg-white p-1"
            />
          </Link>
        </div>

     

        {/* 2. Main Company Profile Card */}
        <div className="rounded border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Business Profile
            </span>
            <div>
              {!isEditingBrand ? (
                <button
                  onClick={() => setIsEditingBrand(true)}
                  className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={brandSaving}
                    className="inline-flex items-center gap-1 rounded bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {brandSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {brandError && (
            <div className="border-b border-rose-200 bg-rose-50 px-5 py-2 text-xs font-semibold text-rose-700">
              {brandError}
            </div>
          )}

          <div className="p-5 space-y-6">
            {/* Identity Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className={`flex h-14 w-14 items-center justify-center rounded border bg-white ${
                    missingLogo ? 'border-amber-300' : 'border-slate-300'
                  }`}>
                    {logoPreview ? (
                      <img src={logoPreview} className="h-full w-full object-contain p-1" alt="Logo" />
                    ) : (
                      <span className="text-xl font-bold text-slate-400">{companyName?.charAt(0)}</span>
                    )}

                    {isEditingBrand && (
                      <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-slate-900/80 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="text-[8px] font-bold uppercase">Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  {isEditingBrand ? (
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company Name"
                      className="border-b border-slate-400 bg-transparent text-base font-bold text-slate-900 outline-none focus:border-slate-900"
                    />
                  ) : (
                    <h2 className="text-base font-bold text-slate-900">{companyName}</h2>
                  )}

                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      {isFreePlan ? 'Free Tier' : `${company.plan_tier} Tier`}
                    </span>
                    <StripeStatusBadge company={company} onNavigateSection={onNavigateSection} />
                  </div>
                </div>
              </div>

              {missingLogo && !isEditingBrand && (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Upload a company logo to complete setup.</span>
                </div>
              )}
            </div>

            {/* Field Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <LabeledField
                    icon={Mail}
                    label="Reply-To Contact Email"
                    editing={isEditingBrand}
                    value={companyEmail}
                    onChange={(v) => {
                      setCompanyEmail(v);
                      setEmailError('');
                    }}
                    placeholder="office@company.com"
                    display={company.email || 'None configured'}
                    caption="Outbound invoices and proposal follow-ups use this address for client replies."
                    highlight={!company.email}
                  />
                  {emailError && <p className="mt-1 text-xs font-bold text-rose-600">{emailError}</p>}
                </div>

                <LabeledField
                  icon={Phone}
                  label="Business Phone Number"
                  editing={isEditingBrand}
                  value={companyPhone}
                  onChange={(v) => setCompanyPhone(formatPhone(v))}
                  placeholder="(555) 000-0000"
                  maxLength={14}
                  display={company.phone ? formatPhone(company.phone) : 'None configured'}
                  highlight={!company.phone}
                />

                <LabeledField
                  icon={Globe}
                  label="Official Website"
                  editing={isEditingBrand}
                  value={companyWebsite}
                  onChange={setCompanyWebsite}
                  placeholder="https://company.com"
                  display={
                    company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline">
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      'None configured'
                    )
                  }
                  highlight={!company.website}
                />
              </div>

              {/* Color Configuration */}
              <div className="rounded border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-4">
                <div>
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">
                    <Palette className="h-3.5 w-3.5" /> Color Palette
                  </span>

                  {isEditingBrand ? (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="flex flex-col items-center gap-1 p-2 bg-white rounded border border-slate-200">
                        <input
                          type="color"
                          value={color1}
                          onChange={(e) => setColor1(e.target.value)}
                          className="h-7 w-full cursor-pointer rounded border border-slate-300 p-0"
                        />
                        <span className="text-[9px] font-bold uppercase text-slate-500">Primary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 p-2 bg-white rounded border border-slate-200">
                        <input
                          type="color"
                          value={color2}
                          onChange={(e) => setColor2(e.target.value)}
                          className="h-7 w-full cursor-pointer rounded border border-slate-300 p-0"
                        />
                        <span className="text-[9px] font-bold uppercase text-slate-500">Secondary</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                        <div className="h-4 w-4 rounded border border-slate-300" style={{ background: color1 }} />
                        <span className="text-xs font-mono font-bold text-slate-700">{color1}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                        <div className="h-4 w-4 rounded border border-slate-300" style={{ background: color2 }} />
                        <span className="text-xs font-mono font-bold text-slate-700">{color2}</span>
                      </div>
                    </div>
                  )}
                </div>

                <BrandInvoicePreview company={company} refreshToken={invoicePreviewRefreshToken} />
              </div>
            </div>


   {/* Notifications & Automations Section */}
            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-center gap-1.5 mb-1">
                <Bell className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Notifications & Automations
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Automated digest dispatches and internal notification settings for administrative management.
              </p>

              <div className="divide-y divide-slate-100 rounded border border-slate-200 bg-slate-50/50">
                {/* 1. Daily Digest Toggle */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">Daily Digest Summary</p>
                      {!can(planTier, 'daily_digest') && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-blue-700">
                          <Sparkles className="h-2.5 w-2.5" /> Pro
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive an automated 6:00 AM daily executive summary covering incoming leads, jobs, and recent payments.
                    </p>
                  </div>

                  {can(planTier, 'daily_digest') ? (
                    <button
                      onClick={() => setShowDigestConfirm(true)}
                      disabled={digestSaving}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        digestEnabled ? 'bg-slate-900' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          digestEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateSection('billing')}
                      className="inline-flex items-center gap-1 shrink-0 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 hover:bg-blue-100 transition"
                    >
                      Upgrade
                    </button>
                  )}
                </div>

                {/* 2. BCC Sender Toggle */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900">BCC Company on Customer Emails</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Automatically sends a hidden copy (BCC) of every outbound <strong className="font-semibold text-slate-700">quote</strong>, <strong className="font-semibold text-slate-700">schedule</strong>, and <strong className="font-semibold text-slate-700">invoice</strong> email directly to <u className="decoration-slate-400">{company.email || 'your business email'}</u>.
                    </p>
                  </div>

                  <button
                    onClick={handleToggleBcc}
                    disabled={bccSaving}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                      bccEnabled ? 'bg-slate-900' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        bccEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

      

            {/* Public Booking Link Card */}
            <div className="border-t border-slate-200 pt-5">
              <div className="flex items-center gap-1.5 mb-1">
                <LinkIcon className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Public Client Endpoint
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Direct public link for leads to initiate intake directly into your dashboard.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 rounded border border-slate-200 bg-slate-50 px-3 py-2">
                  <code className="font-mono text-xs font-bold text-slate-800">
                    {publicLink || `lead2project.com/${company.slug}`}
                  </code>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onCopy}
                    className="inline-flex items-center justify-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={publicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    View <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={onShowQrModal}
                    className="inline-flex items-center justify-center rounded border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

         

          </div>
        </div>

        {/* Upgrade Callout */}
        {isFreePlan && (
          <SettingsUpgradeBanner
            planLabel="Basic Plan"
            price="$49.99/mo"
            message="Upgrade to remove Lead2Project branding, send custom invoices, and configure automated workflows."
            companySlug={company.slug}
          />
        )}

        {/* Footer Link */}
        <div className="flex justify-end pt-2">
          <a
            href={`/${company.slug}/dashboard/deleted-leads`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-700 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Deleted Leads Archive
          </a>
        </div>

      </div>

      {/* Daily Digest Confirmation Modal */}
      {showDigestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">
              {digestEnabled ? 'Turn off daily digest?' : 'Turn on daily digest?'}
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {digestEnabled
                ? 'You will stop receiving the automated 6:00 AM daily summary email.'
                : 'You will begin receiving a 6:00 AM daily summary email containing leads, active jobs, and payment activity.'}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDigestConfirm(false)}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDigestToggle}
                className={`rounded px-3 py-1.5 text-xs font-bold text-white transition ${
                  digestEnabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {digestEnabled ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}