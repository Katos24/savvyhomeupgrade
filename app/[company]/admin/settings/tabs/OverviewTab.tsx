'use client';

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
} from 'lucide-react';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[13px] font-extrabold uppercase tracking-wide text-stone-700">
      {children}
    </span>
  );
}

// Blends a hex color toward white — used only for the brand-color preview
// strip, so that stays tied to the company's own colors.
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

type ShareIdeaCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

function ShareIdeaCard({ icon: Icon, title, description }: ShareIdeaCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border-2 border-stone-200 bg-white p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-stone-200 bg-stone-50">
        <Icon className="h-4 w-4 text-stone-700" />
      </div>
      <div>
        <p className="text-[13px] font-bold text-stone-900">{title}</p>
        <p className="mt-0.5 text-[12.5px] font-medium leading-relaxed text-stone-600">
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
}: LabeledFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-stone-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-lg border-2 border-stone-300 bg-white px-3 py-2.5 text-sm font-bold text-stone-900 outline-none transition focus:border-stone-900"
        />
      ) : (
        <div className="w-full rounded-lg border-2 border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-bold text-stone-800">
          {display}
        </div>
      )}
      {caption && <p className="mt-1.5 text-[12px] font-semibold text-stone-500">{caption}</p>}
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
    <div className="bg-[#F3F2FB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl pb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Your brand</h2>
          <p className="mt-1 text-[15px] font-semibold text-stone-700">
            How customers see you, and where they book.
          </p>
        </div>

        {/* ── BRANDING CARD ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b-2 border-stone-100 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-stone-200 bg-white">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} className="h-full w-full object-contain p-1.5" alt="Logo" />
                  ) : (
                    <span className="text-xl font-extrabold text-stone-300">
                      {companyName?.charAt(0)}
                    </span>
                  )}
                </div>
                {isEditingBrand && (
                  <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-md bg-stone-900 p-1.5 text-white transition hover:bg-stone-800">
                    <Pencil className="h-3 w-3" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                  </label>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {isEditingBrand ? (
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                    className="w-full min-w-0 border-b-2 border-dashed border-stone-300 bg-transparent pb-1 text-lg font-extrabold text-stone-900 outline-none focus:border-stone-900"
                  />
                ) : (
                  <h3 className="truncate text-lg font-extrabold text-stone-900">{companyName}</h3>
                )}
                <span className="mt-1.5 inline-block rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {company.plan_tier} plan
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!isEditingBrand ? (
                <button
  onClick={() => setIsEditingBrand(true)}
  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-indigo-500 bg-indigo-50 px-3.5 py-2 text-[13px] font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
>
  <Pencil className="h-3.5 w-3.5" /> Edit
</button>

              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 rounded-lg border-2 border-stone-300 bg-white px-3.5 py-2 text-[13px] font-bold text-stone-700 transition-colors hover:bg-stone-50"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button
                    onClick={onSaveBranding}
                    disabled={brandSaving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
                  >
                    {brandSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : brandSaved ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {brandSaving ? 'Saving' : brandSaved ? 'Saved' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Brand colors */}
              <div>
                <p className="mb-3 flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-stone-700">
                  <Palette className="h-3.5 w-3.5" /> Brand colors
                </p>
                {isEditingBrand ? (
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="h-11 w-11 cursor-pointer rounded-lg border-2 border-stone-300 p-0.5"
                      />
                      <span className="text-[11px] font-bold text-stone-500">Primary</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="h-11 w-11 cursor-pointer rounded-lg border-2 border-stone-300 p-0.5"
                      />
                      <span className="text-[11px] font-bold text-stone-500">Secondary</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 shrink-0 rounded-lg border-2 border-stone-200"
                      style={{ background: color1 }}
                    />
                    <div
                      className="h-10 w-10 shrink-0 rounded-lg border-2 border-stone-200"
                      style={{ background: color2 }}
                    />
                  </div>
                )}
                <div
                  className="mt-3 h-2 w-full max-w-[180px] overflow-hidden rounded-full"
                  style={{ background: `linear-gradient(90deg, ${tint(color1, 0.1)}, ${tint(color2, 0.1)})` }}
                />
                <p className="mt-3 text-[13px] font-semibold text-stone-600">
                  Used in your customer emails and booking form.
                </p>
              </div>

              {/* Company info — labeled fields, no cramming */}
              <div className="grid grid-cols-1 gap-4">
                <LabeledField
                  icon={Mail}
                  label="Company email"
                  editing={isEditingBrand}
                  value={companyEmail}
                  onChange={setCompanyEmail}
                  placeholder="you@company.com"
                  display={company.email || 'No email added'}
                  caption="This is your Reply‑To inbox. Customer replies land here, and you can also BCC yourself on all quote, schedule, and invoice emails by enabling it in Settings."
                />
                <LabeledField
                  icon={Phone}
                  label="Company phone"
                  editing={isEditingBrand}
                  value={companyPhone}
                  onChange={(v) => setCompanyPhone(formatPhone(v))}
                  placeholder="(555) 555-5555"
                  maxLength={14}
                  display={company.phone ? formatPhone(company.phone) : 'No phone number'}
                />
                <LabeledField
                  icon={Globe}
                  label="Website"
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
                        className="text-stone-900 underline"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      'No website added'
                    )
                  }
                />
              </div>
            </div>

            {/* Booking link + QR */}
            <div className="mt-8 border-t-2 border-stone-100 pt-8">
              <p className="text-[13px] font-extrabold uppercase tracking-wide text-stone-700">
                Your booking link
              </p>
              <p className="mb-4 mt-1.5 text-[13px] font-semibold leading-relaxed text-stone-600">
                Customers fill out a quick project form styled with your
                branding. Submissions land as new leads in your dashboard.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  onClick={onShowQrModal}
                  className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-stone-300 bg-white transition hover:bg-stone-50"
                >
                  {qrCodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrCodeUrl} className="h-full w-full" alt="QR code" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-stone-300" />
                  )}
                </button>
                <div className="w-full min-w-0 flex-1">
                  <div className="mb-2.5 overflow-x-auto rounded-lg border-2 border-stone-300 bg-stone-50 px-3.5 py-3">
                    <code className="whitespace-nowrap font-mono text-[13px] font-bold text-stone-800">
                      {publicLink || `lead2project.com/${company.slug}`}
                    </code>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={onCopy}
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-stone-300 bg-white px-3 py-2 text-[12.5px] font-bold text-stone-800 transition-colors hover:bg-stone-50"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={publicLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: color1 }}
                    >
                      View form <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                    <button
                      onClick={onShowQrModal}
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-stone-300 bg-white px-3 py-2 text-[12.5px] font-bold text-stone-800 transition-colors hover:bg-stone-50"
                    >
                      <Download className="h-3.5 w-3.5" /> QR code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SHARE YOUR LINK ── */}
        <div className="mt-8">
          <div className="mb-3">
            <Eyebrow>Get the word out</Eyebrow>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <p className="mb-5 text-[14px] font-semibold leading-relaxed text-stone-600">
              Your booking link works anywhere you can put a link or a QR
              code — the more places it lives, the more leads come in.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ShareIdeaCard
                icon={Globe}
                title="Google Business Profile"
                description="Add it to your website field — often the first place customers look before they even reach your site."
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
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <Eyebrow>Get set up</Eyebrow>
              <span className="text-[13px] font-bold tabular-nums text-stone-500">
                {doneCount}/{checklistSteps.length}
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="h-1.5 bg-stone-100">
                <div
                  className="h-full bg-stone-900 transition-all duration-500"
                  style={{ width: `${(doneCount / checklistSteps.length) * 100}%` }}
                />
              </div>
              {checklistSteps.map((step, i) => {
                const rowClass = `flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-stone-50 sm:px-8 ${
                  i !== checklistSteps.length - 1 ? 'border-b-2 border-stone-100' : ''
                } ${step.done ? 'opacity-50' : ''}`;

                const inner = (
                  <>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        step.done ? 'border-stone-900 bg-stone-900' : 'border-stone-300'
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
                      <p className="mt-0.5 text-[12.5px] font-semibold text-stone-500">
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

        <div className="mt-6 flex justify-end">
          <a
            href={`/${company.slug}/dashboard/deleted-leads`}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] font-bold text-rose-700 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" /> Recovery center
          </a>
        </div>
      </div>
    </div>
  );
}