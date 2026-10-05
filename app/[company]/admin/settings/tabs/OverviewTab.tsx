'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
  Copy,
  CheckCircle2,
  ExternalLink,
  Download,
  Loader2,
  Pencil,
  X,
  Save,
  ShieldAlert,
  Building2,
  Link as LinkIcon,
  Bell,
  Sparkles,
  Camera,
  HelpCircle,
  CreditCard,
  Receipt,
  Trash2,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { can, type PlanTier } from '@/lib/permissions';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';
import { useQuoteTemplates } from '@/hooks/useQuoteTemplates';
import { Wrench, ArrowRight } from 'lucide-react';

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
    active: { label: 'Payments active', pill: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100', dot: 'bg-emerald-600' },
    pending: { label: 'In review', pill: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100', dot: 'bg-amber-600' },
    restricted: { label: 'Action needed', pill: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100', dot: 'bg-rose-600' },
    none: { label: 'Connect Stripe', pill: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200', dot: 'bg-slate-500' },
  }[state];

  return (
    <button
      type="button"
      onClick={() => onNavigateSection('payments')}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition cursor-pointer ${config.pill}`}
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
  taxRate: string;
  setTaxRate: (v: string) => void;
};

// Shared look, matching SetupTab: white card, thin border, bold title row.
function Card({
  icon: Icon,
  title,
  action,
  accent,
  children,
}: {
  icon: any;
  title: string;
  action?: React.ReactNode;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border bg-white shadow-xs ${accent ? 'border-teal-200' : 'border-slate-200/80'}`}>
      {accent && <div className="h-1 bg-teal-600" />}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Icon className={`h-5 w-5 shrink-0 ${accent ? 'text-teal-600' : 'text-slate-500'}`} /> {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center">
      <span className="text-sm font-semibold text-slate-700 sm:w-44 sm:shrink-0">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const INPUT =
  'w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-xs outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

const BTN_OUTLINE =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50 cursor-pointer';

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
      <button type="button" onClick={() => setExpanded(true)} className={`${BTN_OUTLINE} shrink-0`}>
        <Receipt className="h-4 w-4 text-slate-600" />
        Preview invoice
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
              <span className="text-base font-bold text-slate-900">Sample invoice</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 bg-slate-50">
              {!modalLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  {modalTimedOut ? (
                    <p className="text-sm font-medium text-slate-500">Preview failed to load.</p>
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
                <p className="text-sm font-medium text-amber-900">Upgrade to send branded invoices to your customers.</p>
                <a
                  href={`/${company.slug}/home?section=billing`}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition shrink-0 shadow-xs text-center"
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

// Shows a new user what's already configured for pricing, using the
// same shared useQuoteTemplates cache as Services and QuoteSection.
function ServicesSummaryCard({ company }: { company: any }) {
  const { data: templates = [] } = useQuoteTemplates(company.slug);
  const categories: { value: string; label: string }[] = company.form_categories || [];

  const depositLabel = (template: any) => {
    if (!template?.deposit_type || !template?.deposit_value) return null;
    return template.deposit_type === 'percent' ? `${template.deposit_value}%` : `$${template.deposit_value}`;
  };

  if (categories.length === 0) return null;

  return (
    <Card
      icon={Wrench}
      title="Your services"
      action={
        <a href={`/${company.slug}/dashboard/services`} className={`${BTN_OUTLINE} shrink-0 !py-2`}>
          Edit services <ArrowRight className="h-4 w-4" />
        </a>
      }
    >
      <div className="divide-y divide-slate-100">
        {categories.map((cat) => {
          const template = templates.find((t: any) => t.category === cat.value);
          const deposit = depositLabel(template);
          return (
            <div key={cat.value} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
              <span className="text-sm font-semibold text-slate-900">{cat.label}</span>
              <div className="flex items-center gap-3">
                <span className={`hidden sm:inline text-sm ${template ? 'text-slate-600' : 'text-amber-600'}`}>
                  {template ? 'Pricing set' : 'No pricing yet'}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    deposit
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {deposit ? `${deposit} deposit` : 'No deposit'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        on ? 'bg-slate-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="group relative cursor-pointer shrink-0">
      <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 transition shrink-0" />
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-56 rounded-md bg-slate-900 p-2.5 text-xs text-white shadow-xl group-hover:block z-20">
        {text}
      </div>
    </div>
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
  taxRate,
  setTaxRate,
}: OverviewTabProps) {
  const [emailError, setEmailError] = useState('');
  const [invoicePreviewRefreshToken, setInvoicePreviewRefreshToken] = useState(0);

  const planTier = (company.plan_tier ?? 'free') as PlanTier;
  const [digestEnabled, setDigestEnabled] = useState(company.daily_digest_enabled ?? false);
  const [showDigestConfirm, setShowDigestConfirm] = useState(false);
  const [digestSaving, setDigestSaving] = useState(false);
  const [bccEnabled, setBccEnabled] = useState(company.bcc_sender_on_email ?? false);
  const [bccSaving, setBccSaving] = useState(false);

  const isFreePlan = planTier === 'free';
  const missingLogo = !company.logo_url && !logoPreview;
  const displayLink = (publicLink || `lead2project.com/${company.slug}`).replace(/^https?:\/\//, '');

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
    setTaxRate(String(company.default_tax_rate ?? 0));
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
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="w-full space-y-6 pb-20">

        {/* HEADER — same style as SetupTab */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Your business</h1>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            Your booking link, profile and branding, and what goes on your quotes and invoices.
          </p>
        </div>

        {brandError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
            {brandError}
          </div>
        )}

        {/* BOOKING LINK — same look as the welcome card on Setup */}
        <div className="overflow-hidden rounded-xl border border-teal-200 bg-white shadow-xs">
          <div className="h-1 bg-teal-600" />
          <div className="p-5 sm:p-6">
            <p className="flex items-center gap-2 text-base font-bold text-slate-900">
              <LinkIcon className="h-5 w-5 text-teal-600" /> Your booking link
            </p>
            <p className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">{displayLink}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 cursor-pointer"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <a href={publicLink} target="_blank" rel="noopener noreferrer" className={BTN_OUTLINE}>
                <ExternalLink className="h-4 w-4" /> Open your booking page
              </a>
              <button type="button" onClick={onShowQrModal} className={BTN_OUTLINE}>
                <QrCode className="h-4 w-4" /> Get QR code
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Text it to customers, add it to your Google profile, or print the QR code for your truck and yard signs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* PROFILE & BRANDING */}
          <div className="xl:col-span-7">
            <Card
              icon={Building2}
              title="Profile & branding"
              action={
                !isEditingBrand ? (
                  <button type="button" onClick={() => setIsEditingBrand(true)} className={`${BTN_OUTLINE} shrink-0 !py-2`}>
                    <Pencil className="h-4 w-4 text-slate-600" /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={handleCancelEdit} className={`${BTN_OUTLINE} !py-2`}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={brandSaving}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                    >
                      {brandSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </button>
                  </div>
                )
              }
            >
              <div className="divide-y divide-slate-100">
                <Row label="Logo & name">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative group shrink-0 self-start sm:self-auto">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-lg border bg-white shadow-xs overflow-hidden ${
                          missingLogo ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-300'
                        }`}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} className="h-full w-full object-contain p-1" alt="Logo" />
                        ) : (
                          <span className="text-lg font-bold text-slate-500">{companyName?.charAt(0)}</span>
                        )}

                        {isEditingBrand && (
                          <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-slate-900/80 text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <Camera className="h-5 w-5" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                          </label>
                        )}
                      </div>
                    </div>

                    {isEditingBrand ? (
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company name"
                        className={`${INPUT} flex-1 font-semibold`}
                      />
                    ) : (
                      <span className="text-base font-bold text-slate-900 break-words min-w-0 flex-1">{companyName}</span>
                    )}
                  </div>
                  {isEditingBrand && missingLogo && (
                    <p className="mt-2 text-xs text-slate-500">Tap the square to add your logo.</p>
                  )}
                </Row>

                <Row label="Reply-to email">
                  {isEditingBrand ? (
                    <div className="w-full min-w-0">
                      <input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => {
                          setCompanyEmail(e.target.value);
                          setEmailError('');
                        }}
                        placeholder="office@company.com"
                        className={`${INPUT} ${emailError ? '!border-rose-400 focus:!border-rose-600' : ''}`}
                      />
                      {emailError && <p className="mt-1 text-sm font-semibold text-rose-600">{emailError}</p>}
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-900 break-all">
                      {company.email || <span className="text-slate-400 italic font-normal">Not set</span>}
                    </span>
                  )}
                </Row>

                <Row label="Phone">
                  {isEditingBrand ? (
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(formatPhone(e.target.value))}
                      placeholder="(555) 000-0000"
                      maxLength={14}
                      className={INPUT}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-900">
                      {company.phone ? formatPhone(company.phone) : <span className="text-slate-400 italic font-normal">Not set</span>}
                    </span>
                  )}
                </Row>

                <Row label="Website">
                  {isEditingBrand ? (
                    <input
                      type="text"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className={INPUT}
                    />
                  ) : company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-900 hover:underline inline-flex items-center gap-1.5 font-semibold break-all"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-4 w-4 text-slate-500 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 italic font-normal">Not set</span>
                  )}
                </Row>

                <Row label="Sales tax rate">
                  {isEditingBrand ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className={`${INPUT} !w-28`}
                      />
                      <span className="text-sm font-medium text-slate-500">%</span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-900">
                      {taxRate}% <span className="text-slate-500 font-normal">· applied to every quote by default</span>
                    </span>
                  )}
                </Row>

                <Row label="Brand colors">
                  <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                    {isEditingBrand ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg p-1.5 bg-white">
                          <input
                            type="color"
                            value={color1}
                            onChange={(e) => setColor1(e.target.value)}
                            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                          />
                          <span className="text-xs font-mono font-bold text-slate-700 pr-1">{color1}</span>
                        </div>
                        <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg p-1.5 bg-white">
                          <input
                            type="color"
                            value={color2}
                            onChange={(e) => setColor2(e.target.value)}
                            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                          />
                          <span className="text-xs font-mono font-bold text-slate-700 pr-1">{color2}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-md border border-slate-300 shadow-xs shrink-0" style={{ background: color1 }} />
                        <div className="h-5 w-5 rounded-md border border-slate-300 shadow-xs shrink-0" style={{ background: color2 }} />
                        <span className="text-xs font-mono text-slate-600 font-bold">{color1} / {color2}</span>
                      </div>
                    )}

                    <BrandInvoicePreview company={company} refreshToken={invoicePreviewRefreshToken} />
                  </div>
                </Row>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="xl:col-span-5 space-y-6">

            <Card icon={CreditCard} title="Plan & payments">
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <span className="text-sm font-semibold text-slate-700">Plan</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-800 border border-slate-300 capitalize">
                      {isFreePlan ? 'Free' : company.plan_tier}
                    </span>
                    {isFreePlan && (
                      <button
                        type="button"
                        onClick={() => onNavigateSection('billing')}
                        className="text-sm font-bold text-teal-700 hover:underline cursor-pointer"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <span className="text-sm font-semibold text-slate-700">Card payments</span>
                  <StripeStatusBadge company={company} onNavigateSection={onNavigateSection} />
                </div>
              </div>
            </Card>

            <Card icon={Bell} title="Emails">
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-slate-900">Daily digest</span>
                    <Tip text="One email every morning with today's jobs, quotes waiting on an answer, overdue payments and balances still owed." />
                  </div>
                  {can(planTier, 'daily_digest') ? (
                    <Toggle on={digestEnabled} onClick={() => setShowDigestConfirm(true)} disabled={digestSaving} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateSection('billing')}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-300 px-2.5 py-1 text-sm font-semibold text-slate-800 hover:bg-slate-200 transition shrink-0 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-slate-600" /> Upgrade
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-slate-900">Copy me on customer emails</span>
                    <Tip text="Sends you a BCC copy of every quote and invoice email that goes to a customer." />
                  </div>
                  <Toggle on={bccEnabled} onClick={handleToggleBcc} disabled={bccSaving} />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {can(planTier, 'quote_templates') && <ServicesSummaryCard company={company} />}

        {isFreePlan && (
          <SettingsUpgradeBanner
            planLabel="Pro Plan"
            price="$49.99/mo"
            message="Upgrade to remove Lead2Project branding, send custom invoices, and configure automated workflows."
            companySlug={company.slug}
          />
        )}

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
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-rose-600 transition"
          >
            <Trash2 className="h-4 w-4" /> Deleted leads
          </a>
        </div>
      </div>

      {showDigestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-slate-300 bg-white p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              {digestEnabled ? 'Turn off the daily digest?' : 'Turn on the daily digest?'}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              {digestEnabled
                ? 'You’ll stop getting the morning digest email.'
                : 'Get one email every morning with today’s jobs, open quotes and money still owed. It skips days with nothing to report.'}
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDigestConfirm(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDigestToggle}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition cursor-pointer ${
                  digestEnabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {digestEnabled ? 'Turn off' : 'Turn on'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}