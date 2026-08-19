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
    active: { label: 'Payments Active', pill: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100', dot: 'bg-emerald-600' },
    pending: { label: 'In Review', pill: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100', dot: 'bg-amber-600' },
    restricted: { label: 'Action Needed', pill: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100', dot: 'bg-rose-600' },
    none: { label: 'Connect Stripe', pill: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200', dot: 'bg-slate-500' },
  }[state];

  return (
    <button
      onClick={() => onNavigateSection('payments')}
      className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold transition ${config.pill}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </button>
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50 shrink-0 cursor-pointer"
      >
        <Receipt className="h-3.5 w-3.5 text-slate-600" />
        Preview Invoice
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex h-[85vh] max-h-[800px] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5 bg-slate-50">
              <span className="text-sm font-bold text-slate-900">Sample Invoice Preview</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
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
                    <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-amber-200 bg-amber-50 px-4 py-3 sm:px-5">
                <p className="text-xs font-medium text-amber-900">
                  Upgrade your plan to send custom branded invoices to clients.
                </p>
                <a
                  href={`/${company.slug}/admin/settings#billing`}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition shrink-0 shadow-xs text-center"
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
    <div className="min-h-screen bg-slate-50/50 px-4 py-6 sm:px-6 sm:py-10 lg:px-12 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 pb-16">
        
        {/* Page Title */}
        <div className="pb-2 border-b border-slate-200">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Company Details</h1>
        </div>

        {brandError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
            {brandError}
          </div>
        )}

        {/* TOP GRID: Company Profile (7 cols) + Automations (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* SECTION 1: Company Profile & Branding (2-Column Table starting with Logo & Name) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-lg shadow-slate-200/60 transition-shadow space-y-4">
            
            {/* Header: Title, Badges & Actions */}
            <div className="flex flex-col gap-3 pb-3 border-b border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-slate-700" /> Company Profile & Branding
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-slate-700 border border-slate-300 uppercase tracking-wide">
                    {isFreePlan ? 'Free Tier' : `${company.plan_tier} Tier`}
                  </span>
                  <StripeStatusBadge company={company} onNavigateSection={onNavigateSection} />
                </div>

                {!isEditingBrand ? (
                  <button
                    onClick={() => setIsEditingBrand(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 shrink-0 cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-600" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCancelEdit}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={brandSaving}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                    >
                      {brandSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* TABLE STARTING DIRECTLY WITH LOGO & NAME (NO HEADERS) */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody className="divide-y divide-slate-200">
                  {/* ROW 1: LOGO & COMPANY NAME */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="w-1/3 border-r border-slate-200 bg-slate-100/70 px-4 py-3.5 sm:px-5 align-middle font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-600 shrink-0" />
                        <span>Logo & Name</span>
                      </div>
                    </td>
                    <td className="w-2/3 px-4 py-3.5 sm:px-5 align-middle bg-white">
                      <div className="flex items-center gap-3">
                        <div className="relative group shrink-0">
                          <div className={`flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-lg border bg-white shadow-xs overflow-hidden ${
                            missingLogo ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-300'
                          }`}>
                            {logoPreview ? (
                              <img src={logoPreview} className="h-full w-full object-contain p-1" alt="Logo" />
                            ) : (
                              <span className="text-base font-bold text-slate-500">{companyName?.charAt(0)}</span>
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
                            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                          />
                        ) : (
                          <span className="text-sm sm:text-base font-bold text-slate-900 truncate block">{companyName}</span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* ROW 2: REPLY-TO EMAIL */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="w-1/3 border-r border-slate-200 bg-slate-100/70 px-4 py-3.5 sm:px-5 align-middle font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-600 shrink-0" />
                        <span>Reply-To Email</span>
                      </div>
                    </td>
                    <td className="w-2/3 px-4 py-3.5 sm:px-5 align-middle bg-white">
                      {isEditingBrand ? (
                        <div>
                          <input
                            type="email"
                            value={companyEmail}
                            onChange={(e) => {
                              setCompanyEmail(e.target.value);
                              setEmailError('');
                            }}
                            placeholder="office@company.com"
                            className={`w-full rounded-md border bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-900 shadow-xs outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                              emailError ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300'
                            }`}
                          />
                          {emailError && <p className="mt-1 text-xs font-semibold text-rose-600">{emailError}</p>}
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 break-all">
                          {company.email || <span className="text-slate-400 italic font-normal">Not configured</span>}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* ROW 3: PHONE NUMBER */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="w-1/3 border-r border-slate-200 bg-slate-100/70 px-4 py-3.5 sm:px-5 align-middle font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-600 shrink-0" />
                        <span>Company Phone</span>
                      </div>
                    </td>
                    <td className="w-2/3 px-4 py-3.5 sm:px-5 align-middle bg-white">
                      {isEditingBrand ? (
                        <input
                          type="text"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(formatPhone(e.target.value))}
                          placeholder="(555) 000-0000"
                          maxLength={14}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-900 shadow-xs outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {company.phone ? formatPhone(company.phone) : <span className="text-slate-400 italic font-normal">Not configured</span>}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* ROW 4: WEBSITE */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="w-1/3 border-r border-slate-200 bg-slate-100/70 px-4 py-3.5 sm:px-5 align-middle font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-600 shrink-0" />
                        <span>Website URL</span>
                      </div>
                    </td>
                    <td className="w-2/3 px-4 py-3.5 sm:px-5 align-middle bg-white">
                      {isEditingBrand ? (
                        <input
                          type="text"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="https://company.com"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-900 shadow-xs outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                        />
                      ) : company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-slate-900 hover:underline inline-flex items-center gap-1.5 font-semibold break-all">
                          {company.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-normal">Not configured</span>
                      )}
                    </td>
                  </tr>

                  {/* ROW 5: BRAND COLORS */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="w-1/3 border-r border-slate-200 bg-slate-100/70 px-4 py-3.5 sm:px-5 align-middle font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-slate-600 shrink-0" />
                        <span>Brand Colors</span>
                      </div>
                    </td>
                    <td className="w-2/3 px-4 py-3.5 sm:px-5 align-middle bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {isEditingBrand ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 border border-slate-300 rounded-md p-1 bg-white">
                              <input
                                type="color"
                                value={color1}
                                onChange={(e) => setColor1(e.target.value)}
                                className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                              />
                              <span className="text-[11px] font-mono font-bold text-slate-700 pr-1">{color1}</span>
                            </div>
                            <div className="flex items-center gap-1.5 border border-slate-300 rounded-md p-1 bg-white">
                              <input
                                type="color"
                                value={color2}
                                onChange={(e) => setColor2(e.target.value)}
                                className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                              />
                              <span className="text-[11px] font-mono font-bold text-slate-700 pr-1">{color2}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-md border border-slate-300 shadow-xs shrink-0" style={{ background: color1 }} />
                            <div className="h-4 w-4 rounded-md border border-slate-300 shadow-xs shrink-0" style={{ background: color2 }} />
                            <span className="text-xs font-mono text-slate-600 font-bold">{color1} / {color2}</span>
                          </div>
                        )}

                        <BrandInvoicePreview company={company} refreshToken={invoicePreviewRefreshToken} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* SECTION 2: Automations & Copying */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-lg shadow-slate-200/60 transition-shadow space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-4 mb-2 border-b border-slate-200 flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-700" /> Automations & Copying
            </h2>

            <div className="flex items-center justify-between py-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-1.5 pr-2">
                <label className="text-sm font-semibold text-slate-800">6:00 AM Daily Summary</label>
                <div className="group relative cursor-pointer">
                  <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 transition shrink-0" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-52 sm:w-56 rounded-md bg-slate-900 p-2.5 text-xs text-white shadow-xl group-hover:block z-20">
                    Sends a morning summary email with leads, active jobs, and yesterday's payments.
                  </div>
                </div>
              </div>
              
              <div className="shrink-0">
                {can(planTier, 'daily_digest') ? (
                  <button
                    onClick={() => setShowDigestConfirm(true)}
                    disabled={digestSaving}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      digestEnabled ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        digestEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateSection('billing')}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-200 transition shrink-0 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-slate-600" /> Upgrade
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-4 gap-3">
              <div className="flex items-center gap-1.5 pr-2">
                <label className="text-sm font-semibold text-slate-800">Auto-BCC Emails</label>
                <div className="group relative cursor-pointer">
                  <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 transition shrink-0" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-52 sm:w-56 rounded-md bg-slate-900 p-2.5 text-xs text-white shadow-xl group-hover:block z-20">
                    Sends a secret copy (BCC) of every client quote or invoice email directly to your inbox.
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleToggleBcc}
                  disabled={bccSaving}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    bccEnabled ? 'bg-slate-900' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      bccEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 3: Booking Link */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-lg shadow-slate-200/60 transition-shadow space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-slate-700" /> Lead Intake Link
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-3 sm:gap-4">
            <code className="font-mono text-xs sm:text-sm font-semibold text-slate-800 truncate bg-slate-50 px-3.5 py-2 rounded-md border border-slate-300 flex-1 min-w-0">
              {publicLink || `lead2project.com/${company.slug}`}
            </code>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={onCopy}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition cursor-pointer"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-600" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <a
                href={publicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
              >
                Open <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={onShowQrModal}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-800 shadow-xs hover:bg-slate-50 transition shrink-0 cursor-pointer"
                title="Download QR Code"
              >
                <Download className="h-4 w-4 text-slate-600" />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 sm:pt-4">
          <Link href="/" className="inline-block">
            <img
              src="/Lead2ProjectLogo.webp"
              alt="Lead2Project"
              className="h-5 w-auto object-contain opacity-50 hover:opacity-100 transition"
            />
          </Link>

          <a
            href={`/${company.slug}/dashboard/deleted-leads`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition"
          >
            <Trash2 className="h-4 w-4" /> Deleted Leads Archive
          </a>
        </div>

      </div>

      {/* Daily Digest Modal */}
      {showDigestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-300 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">
              {digestEnabled ? 'Turn off daily digest?' : 'Turn on daily digest?'}
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {digestEnabled
                ? 'Stop receiving the automated 6:00 AM summary email.'
                : 'Receive a daily 6:00 AM summary email with leads, active jobs, and payment activity.'}
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDigestConfirm(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDigestToggle}
                className={`rounded-md px-4 py-2 text-xs font-semibold text-white transition cursor-pointer ${
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