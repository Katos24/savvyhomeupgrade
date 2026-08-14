'use client';

import { useState, useEffect, ReactNode, ChangeEvent } from 'react';
import {
  Copy,
  CheckCircle2,
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
  Building2,
  Link as LinkIcon,
  Bell,
  Sparkles,
  Camera,
  HelpCircle,
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
    active: { label: 'Payments Active', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', dot: 'bg-emerald-500' },
    pending: { label: 'In Review', pill: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', dot: 'bg-amber-500' },
    restricted: { label: 'Action Needed', pill: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100', dot: 'bg-rose-500' },
    none: { label: 'Connect Stripe', pill: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200', dot: 'bg-slate-400' },
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

type HorizontalFieldProps = {
  icon?: React.ElementType;
  label: string;
  tooltip?: string;
  editing: boolean;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  display: ReactNode;
  maxLength?: number;
  type?: string;
  error?: string;
};

function HorizontalField({
  icon: Icon,
  label,
  tooltip,
  editing,
  value,
  onChange,
  placeholder,
  display,
  maxLength,
  type = 'text',
  error,
}: HorizontalFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-100 gap-3 sm:gap-8">
      <div className="flex items-center gap-2 sm:w-1/3">
        {Icon && <Icon className="h-4 w-4 text-slate-400 shrink-0" />}
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {tooltip && (
          <div className="group relative cursor-pointer">
            <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 transition" />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-56 rounded-md bg-slate-900 p-2.5 text-xs text-white shadow-xl group-hover:block z-20">
              {tooltip}
            </div>
          </div>
        )}
      </div>

      <div className="sm:w-2/3">
        {editing ? (
          <div>
            <input
              type={type}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              className={`w-full max-w-lg rounded-lg border bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200'
              }`}
            />
            {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
          </div>
        ) : (
          <div className="text-sm font-semibold text-slate-800">{display}</div>
        )}
      </div>
    </div>
  );
}

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
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Receipt className="h-4 w-4 text-slate-500" />
        Preview Invoice
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex h-[85vh] max-h-[800px] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
              <span className="text-sm font-semibold text-slate-900">Sample Invoice</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative flex-1 bg-slate-50">
              {!modalLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  {modalTimedOut ? (
                    <p className="text-xs font-medium text-slate-500">Preview failed to load.</p>
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
              <div className="flex items-center justify-between gap-3 border-t border-amber-100 bg-amber-50/60 px-5 py-3">
                <p className="text-xs font-medium text-amber-900">
                  Upgrade your plan to send custom branded invoices to clients.
                </p>
                <a
                  href={`/${company.slug}/admin/settings#billing`}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition shrink-0 shadow-sm"
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
    <div className="min-h-screen bg-slate-50/50 px-6 py-10 lg:px-12 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        
        {/* Page Title */}
        <div className="pb-2 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Details</h1>
        </div>

        {brandError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
            {brandError}
          </div>
        )}

        {/* SECTION 1: Company Profile & Branding Combined */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 lg:p-8 shadow-sm space-y-2">
          
          {/* Section Header with Edit Control */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Company Profile & Branding
            </h2>

            {!isEditingBrand ? (
              <button
                onClick={() => setIsEditingBrand(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={brandSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {brandSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Logo Field */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-100 gap-3">
            <label className="text-sm font-semibold text-slate-800 sm:w-1/3">Logo</label>
            <div className="sm:w-2/3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-lg border bg-white shadow-sm overflow-hidden ${
                    missingLogo ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}>
                    {logoPreview ? (
                      <img src={logoPreview} className="h-full w-full object-contain p-2" alt="Logo" />
                    ) : (
                      <span className="text-base font-bold text-slate-400">{companyName?.charAt(0)}</span>
                    )}

                    {isEditingBrand && (
                      <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-slate-900/80 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="h-4 w-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                      </label>
                    )}
                  </div>
                </div>

                {isEditingBrand ? (
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-900"
                  />
                ) : (
                  <div>
                    <span className="text-base font-bold text-slate-900 block">{companyName}</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{isFreePlan ? 'Free Tier' : `${company.plan_tier} Tier`}</span>
                  </div>
                )}
              </div>

              <StripeStatusBadge company={company} onNavigateSection={onNavigateSection} />
            </div>
          </div>

          {/* Reply-To Email */}
          <HorizontalField
            icon={Mail}
            label="Reply-To Email"
            tooltip="Outbound quotes and invoices will use this email address for customer replies."
            editing={isEditingBrand}
            value={companyEmail}
            onChange={(v) => {
              setCompanyEmail(v);
              setEmailError('');
            }}
            placeholder="office@company.com"
            display={company.email || <span className="text-slate-400 italic font-normal">Not configured</span>}
            error={emailError}
          />

          {/* Phone Number */}
          <HorizontalField
            icon={Phone}
            label="Phone Number"
            editing={isEditingBrand}
            value={companyPhone}
            onChange={(v) => setCompanyPhone(formatPhone(v))}
            placeholder="(555) 000-0000"
            maxLength={14}
            display={company.phone ? formatPhone(company.phone) : <span className="text-slate-400 italic font-normal">Not configured</span>}
          />

          {/* Website */}
          <HorizontalField
            icon={Globe}
            label="Website"
            editing={isEditingBrand}
            value={companyWebsite}
            onChange={setCompanyWebsite}
            placeholder="https://company.com"
            display={
              company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:underline inline-flex items-center gap-1.5 font-semibold">
                  {company.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              ) : (
                <span className="text-slate-400 italic font-normal">Not configured</span>
              )
            }
          />

          {/* Brand Colors & Invoice Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-3">
            <div className="flex items-center gap-2 sm:w-1/3">
              <Palette className="h-4 w-4 text-slate-400 shrink-0" />
              <label className="text-sm font-semibold text-slate-800">Brand Colors</label>
            </div>
            <div className="sm:w-2/3 flex items-center justify-between">
              {isEditingBrand ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-white">
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono font-medium text-slate-700 pr-2">{color1}</span>
                  </div>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-white">
                    <input
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span className="text-xs font-mono font-medium text-slate-700 pr-2">{color2}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border border-black/10 shadow-sm" style={{ background: color1 }} />
                  <div className="h-5 w-5 rounded-full border border-black/10 shadow-sm" style={{ background: color2 }} />
                  <span className="text-xs font-mono text-slate-500 font-medium">{color1} / {color2}</span>
                </div>
              )}

              <BrandInvoicePreview company={company} refreshToken={invoicePreviewRefreshToken} />
            </div>
          </div>

        </div>

        {/* SECTION 2: Automations */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 lg:p-8 shadow-sm space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Automations & Copying
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2 sm:w-1/3">
              <label className="text-sm font-semibold text-slate-800">6:00 AM Daily Summary</label>
              <div className="group relative cursor-pointer">
                <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 transition" />
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-56 rounded-md bg-slate-900 p-2.5 text-xs text-white shadow-xl group-hover:block z-20">
                  Sends a morning summary email with leads, active jobs, and yesterday's payments.
                </div>
              </div>
            </div>
            
            <div className="sm:w-2/3 flex justify-start sm:justify-end">
              {can(planTier, 'daily_digest') ? (
                <button
                  onClick={() => setShowDigestConfirm(true)}
                  disabled={digestSaving}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    digestEnabled ? 'bg-slate-900' : 'bg-slate-200'
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
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200/80 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  <Sparkles className="h-3 w-3" /> Upgrade to PRO
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-2 sm:w-1/3">
              <label className="text-sm font-semibold text-slate-800">Auto-BCC Customer Emails</label>
              <div className="group relative cursor-pointer">
                <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 transition" />
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-56 rounded-md bg-slate-900 p-2.5 text-xs text-white shadow-xl group-hover:block z-20">
                  Sends a secret copy (BCC) of every client quote or invoice email directly to your inbox.
                </div>
              </div>
            </div>

            <div className="sm:w-2/3 flex justify-start sm:justify-end">
              <button
                onClick={handleToggleBcc}
                disabled={bccSaving}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  bccEnabled ? 'bg-slate-900' : 'bg-slate-200'
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

        {/* SECTION 3: Booking Link */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 lg:p-8 shadow-sm space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <LinkIcon className="h-4 w-4" /> Lead Intake Link
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4">
            <code className="font-mono text-sm font-semibold text-slate-800 truncate bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 flex-1">
              {publicLink || `lead2project.com/${company.slug}`}
            </code>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onCopy}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <a
                href={publicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
              >
                Open <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={onShowQrModal}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 transition"
                title="Download QR Code"
              >
                <Download className="h-4 w-4" />
              </button>
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
        <div className="flex items-center justify-between pt-4">
          <Link href="/" className="inline-block">
            <img
              src="/Lead2ProjectLogo.webp"
              alt="Lead2Project"
              className="h-5 w-auto object-contain opacity-50 hover:opacity-100 transition"
            />
          </Link>

          <a
            href={`/${company.slug}/dashboard/deleted-leads`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
          >
            <Trash2 className="h-4 w-4" /> Deleted Leads Archive
          </a>
        </div>

      </div>

      {/* Daily Digest Modal */}
      {showDigestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">
              {digestEnabled ? 'Turn off daily digest?' : 'Turn on daily digest?'}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              {digestEnabled
                ? 'Stop receiving the automated 6:00 AM summary email.'
                : 'Receive a daily 6:00 AM summary email with leads, active jobs, and payment activity.'}
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDigestConfirm(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDigestToggle}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${
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