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
  Lock,
  FileText,
} from 'lucide-react';
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
    active: { label: 'Stripe: Active', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    pending: { label: 'Stripe: In review', pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    restricted: { label: 'Stripe: Action required', pill: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    none: { label: 'Stripe disconnected', pill: 'bg-stone-50 text-stone-600 border-stone-200', dot: 'bg-stone-400' },
  }[state];

  return (
    <button
      onClick={() => onNavigateSection('payments')}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold transition hover:bg-stone-100 ${config.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
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
    <div className="flex items-start gap-3.5 rounded-xl border border-stone-200 bg-stone-50/50 p-4 transition hover:bg-white hover:shadow-sm hover:border-stone-300">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white">
        <Icon className="h-4.5 w-4.5 text-stone-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-900">{title}</p>
        <p className="mt-0.5 text-[12.5px] font-normal leading-relaxed text-stone-500">
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
  const showGlow = highlight && !editing;
  return (
    <div className={`grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-start sm:gap-6 ${className}`}>
      {/* Label on the left - High contrast, perfectly readable */}
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 sm:col-span-4 sm:pt-3">
        <Icon className="h-4 w-4 text-stone-500 shrink-0" />
        <span>{label}</span>
      </label>

      {/* Input or Display Box on the right */}
      <div className="sm:col-span-8 flex flex-col">
        {editing ? (
          <input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:ring-4 focus:ring-stone-100"
          />
        ) : (
          <div
            className={`text-sm font-semibold text-stone-900 rounded-xl px-3.5 py-2.5 border transition ${
              showGlow
                ? 'bg-amber-50/50 text-amber-750 border-amber-300'
                : 'bg-stone-50/80 border-stone-200/60'
            }`}
          >
            {display}
          </div>
        )}
        {caption && (
          <p className="mt-1.5 px-1 text-[12px] font-medium leading-relaxed text-stone-500">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}

type ChecklistStep =
  | {
      label: string;
      description: string;
      done: boolean;
      kind: 'section';
      section: string;
    }
  | {
      label: string;
      description: string;
      done: boolean;
      kind: 'link';
      href: string;
    };

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

function BrandInvoicePreview({ company }: { company: any }) {
  const [expanded, setExpanded] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [thumbTimedOut, setThumbTimedOut] = useState(false);
  const [modalLoaded, setModalLoaded] = useState(false);
  const [modalTimedOut, setModalTimedOut] = useState(false);

  const planTier = (company.plan_tier || 'free') as PlanTier;
  const canSendInvoices = can(planTier, 'send_invoice_email');
  const previewUrl = `/api/company/${company.slug}/preview-invoice`;

  useEffect(() => {
    const t = setTimeout(() => { if (!thumbLoaded) setThumbTimedOut(true); }, 8000);
    return () => clearTimeout(t);
  }, [thumbLoaded]);

  useEffect(() => {
    if (!expanded) return;
    const t = setTimeout(() => { if (!modalLoaded) setModalTimedOut(true); }, 8000);
    return () => clearTimeout(t);
  }, [expanded, modalLoaded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="block w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-50 text-left transition hover:border-stone-300"
      >
        <div className="relative h-40 w-full overflow-hidden bg-white">
          {!thumbLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              {thumbTimedOut ? (
                <p className="px-4 text-center text-[11px] font-semibold text-stone-500">
                  Preview didn&apos;t load
                </p>
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-stone-300" />
              )}
            </div>
          )}
          <iframe
            src={previewUrl}
            title="Sample invoice"
            onLoad={() => setThumbLoaded(true)}
            style={{ width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
          />

          {!canSendInvoices && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-stone-900/55 backdrop-blur-[1px]">
              <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-800">
                <Lock className="h-3 w-3" /> Upgrade to send invoices
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 border-t border-stone-200 px-3 py-2">
          <FileText className="h-3.5 w-3.5 text-stone-500" />
          <span className="text-[11px] font-semibold text-stone-600">
            {canSendInvoices ? 'Tap to view your invoice' : 'Preview — upgrade to send'}
          </span>
        </div>
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-2 sm:p-6"
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex h-[85vh] max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <span className="text-sm font-bold text-stone-900">Invoice preview</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 bg-stone-100">
              {!modalLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                  {modalTimedOut ? (
                    <p className="text-sm font-semibold text-stone-700">Preview didn&apos;t load.</p>
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                  )}
                </div>
              )}
              <iframe
                src={previewUrl}
                title="Sample invoice, enlarged"
                onLoad={() => setModalLoaded(true)}
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            </div>

            {!canSendInvoices && (
              <div className="flex items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-[12px] font-semibold text-stone-600">
                  Upgrade to Basic to send invoices like this to customers.
                </p>
                <a
                
                  href={`/${company.slug}/admin/settings#billing`}
                  className="shrink-0 rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-stone-800"
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
  onSaveBranding,
  qrCodeUrl,
  onShowQrModal,
  publicLink,
  copied,
  onCopy,
  checklistSteps,
  onNavigateSection,
}: OverviewTabProps) {
  const doneCount = checklistSteps.filter((s) => s.done).length;
  const isFreePlan = (company.plan_tier || 'free') === 'free';
  
  // Highlighting state for missing details
  const missingLogo = !company.logo_url && !logoPreview;

  const handleCancelEdit = () => {
    setIsEditingBrand(false);
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
      alert('Logo must be under 4MB.');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-stone-50 px-4 py-8 sm:px-8">
     <div className="mx-auto max-w-4xl pb-16">
        <div className="mb-8 flex items-start gap-3">
          <div
            className="mt-1.5 h-8 w-1.5 shrink-0 rounded-full"
            style={{ background: `linear-gradient(180deg, ${color1}, ${color2})` }}
          />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Your brand</h2>
            <p className="mt-1 text-sm font-medium text-stone-500">
              How customers see you, and where they book.
            </p>
          </div>
        </div>

        {/* ── BRANDING CARD ── */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          
          {/* Top Panel - Subtle Tint */}
<div
            className="flex flex-col gap-4 border-b border-stone-150 p-6 sm:flex-row sm:items-center sm:p-8"
            style={{ background: `linear-gradient(135deg, ${tint(color1, 0.94)}, ${tint(color2, 0.94)})` }}
          >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
              
              {/* Interactive Logo Frame */}
              <div className="relative shrink-0 group">
                <div
                  className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-white transition ${
                    missingLogo
                      ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/20'
                      : 'border-stone-200'
                  }`}
                >
                  {logoPreview ? (
                    <img src={logoPreview} className="h-full w-full object-contain p-2" alt="Logo" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-1">
                      {missingLogo ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          Add logo
                        </span>
                      ) : (
                        <span className="text-2xl font-extrabold text-stone-300">
                          {companyName?.charAt(0)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Manual trigger upload inside standard edit state */}
                  {isEditingBrand && (
                    <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity rounded-xl group-hover:opacity-100">
                      <Pencil className="h-4 w-4 text-white" />
                      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Upload
                      </span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleLogoChange} 
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                {isEditingBrand ? (
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                    className="w-full min-w-0 border-b border-dashed border-stone-300 bg-transparent pb-1 text-lg font-bold text-stone-900 outline-none focus:border-stone-900"
                  />
                ) : (
                  <h3 className="truncate text-lg font-bold text-stone-900">{companyName}</h3>
                )}

                {isFreePlan ? (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
                      Free plan
                    </span>
                    <a
                      href={`/${company.slug}/admin/settings`}
                      className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-stone-800"
                    >
                      <Sparkles className="h-2.5 w-2.5" /> Upgrade
                    </a>
                  </div>
                ) : (
                  <span className="mt-1 inline-block rounded-full bg-stone-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {company.plan_tier} plan
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StripeStatusBadge company={company} onNavigateSection={onNavigateSection} />

              {!isEditingBrand ? (
                <button
                  onClick={() => setIsEditingBrand(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-100/95 px-3.5 py-1.5 text-[13px] font-bold text-stone-800 shadow-sm transition hover:bg-stone-200"
                >
                  <Pencil className="h-3.5 w-3.5 text-stone-600" /> Edit profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-stone-600 transition hover:bg-stone-50"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button
                    onClick={onSaveBranding}
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
                    {brandSaving ? 'Saving...' : brandSaved ? 'Saved' : 'Save changes'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left 2 Columns: Company Details */}
              <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                <LabeledField
                  icon={Mail}
                  label="Company Email"
                  editing={isEditingBrand}
                  value={companyEmail}
                  onChange={setCompanyEmail}
                  placeholder="you@company.com"
                  display={company.email || 'No email added'}
                  caption="This is your Reply‑To inbox. Customer responses land here, and you can BCC yourself on outgoing emails by enabling it in Settings."
                  highlight={!company.email}
                />
                <LabeledField
                  icon={Phone}
                  label="Company Phone"
                  editing={isEditingBrand}
                  value={companyPhone}
                  onChange={(v) => setCompanyPhone(formatPhone(v))}
                  placeholder="(555) 555-5555"
                  maxLength={14}
                  display={company.phone ? formatPhone(company.phone) : 'No phone number'}
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
                      'No website added'
                    )
                  }
                  highlight={!company.website}
                />
              </div>

              {/* Right Column: Sidebar Color Box */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-5 h-fit">
                <p className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-700">
                  <Palette className="h-4 w-4 text-stone-500" /> Brand colors
                </p>
                {isEditingBrand ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-stone-200 p-0.5 bg-white shadow-sm"
                      />
                      <span className="text-[11px] font-semibold text-stone-500">Primary</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-stone-200 p-0.5 bg-white shadow-sm"
                      />
                      <span className="text-[11px] font-semibold text-stone-500">Secondary</span>
                    </div>
                  </div>
             ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 shrink-0 rounded-lg border border-stone-200 shadow-sm"
                      style={{ background: color1 }}
                    />
                    <div
                      className="h-10 w-10 shrink-0 rounded-lg border border-stone-200 shadow-sm"
                      style={{ background: color2 }}
                    />
                  </div>
                )}

                <div className="mt-4">
                  <BrandInvoicePreview company={company} />
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-stone-500">
                  This is what customers see when you send an invoice, styled with your brand.
                </p>
              </div>
            </div>

            {/* Booking Link / QR Section */}
            <div className="mt-8 border-t border-stone-100 pt-8">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                Your booking link
              </p>
              <p className="mb-4 mt-1 text-sm font-normal leading-relaxed text-stone-500">
                Customers fill out a quick project form styled with your branding. Submissions arrive instantly as new leads.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  onClick={onShowQrModal}
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-white transition hover:bg-stone-50"
                  style={{ borderColor: `${color1}55` }}
                >
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} className="h-full w-full" alt="QR code" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-stone-300" />
                  )}
                </button>
                <div className="w-full min-w-0 flex-1">
                  <div className="mb-3 overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5">
                    <code className="whitespace-nowrap font-mono text-sm font-semibold text-stone-700">
                      {publicLink || `lead2project.com/${company.slug}`}
                    </code>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={onCopy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-stone-500" />
                      )}
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                    <a
                      href={publicLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: color1 }}
                    >
                      View form <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                    <button
                      onClick={onShowQrModal}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      <Download className="h-3.5 w-3.5 text-stone-500" /> QR code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SHARE YOUR LINK ── */}
        <div className="mt-10">
          <div className="mb-3">
            <Eyebrow>Get the word out</Eyebrow>
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="mb-5 text-sm font-normal leading-relaxed text-stone-500">
              Your booking link works anywhere you can put a link or a QR code — the more places it lives, the more leads come in.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ShareIdeaCard
                icon={Globe}
                title="Google Business Profile"
                description="Add it to your website field — often the first place customers look."
              />
              <ShareIdeaCard
                icon={MessageSquare}
                title="Social media"
                description="Add it to your Instagram or Facebook bio, or drop it in a post."
              />
              <ShareIdeaCard
                icon={FileImage}
                title="Flyers & signs"
                description="Print the link or a QR code on flyers, yard signs, or door hangers."
              />
              <ShareIdeaCard
                icon={Truck}
                title="Vehicle & business cards"
                description="A QR code on your truck magnet or business card lets people book on the spot."
              />
            </div>
          </div>
        </div>

        {/* ── CHECKLIST ── */}
        {doneCount < checklistSteps.length && (
          <div className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <Eyebrow>Get set up</Eyebrow>
              <span className="text-[11px] font-bold tracking-wider text-stone-450">
                {doneCount} OF {checklistSteps.length} COMPLETED
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="h-1 bg-stone-100">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(doneCount / checklistSteps.length) * 100}%`,
                    background: `linear-gradient(90deg, ${color1}, ${color2})`,
                  }}
                />
              </div>
              {checklistSteps.map((step, i) => {
                const rowClass = `flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-stone-50 sm:px-8 ${
                  i !== checklistSteps.length - 1 ? 'border-b border-stone-100' : ''
                } ${step.done ? 'opacity-50' : ''}`;

                const inner = (
                  <>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        step.done ? 'border-stone-900 bg-stone-900' : 'border-stone-300'
                      }`}
                    >
                      {step.done && <Check className="h-3 w-3 stroke-[3px] text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          step.done ? 'text-stone-400 line-through' : 'text-stone-900'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-stone-500">
                        {step.description}
                      </p>
                    </div>
                  </>
                );

                return step.kind === 'link' ? (
                  <a key={step.label} href={step.href} className={rowClass}>
                    {inner}
                  </a>
                ) : (
                  <button key={step.label} onClick={() => onNavigateSection(step.section)} className={rowClass}>
                    {inner}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isFreePlan && (
          <div className="mt-10">
            <SettingsUpgradeBanner
              planLabel="Basic"
              price="$49.99/mo"
              message="Upgrade to unlock more capabilities to fully own and run your business."
              companySlug={company.slug}
            />
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <a
            href={`/${company.slug}/dashboard/deleted-leads`}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" /> Recovery center
          </a>
        </div>
      </div>
    </div>
  );
}