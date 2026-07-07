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
    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </span>
  );
}

// Blends a hex color toward white for soft tinted backgrounds — keeps every
// tint derived from the company's own brand color instead of a picked palette.
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
  accent: string;
};

function ShareIdeaCard({ icon: Icon, title, description, accent }: ShareIdeaCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: tint(accent, 0.85) }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[12.5px] font-semibold text-slate-800">{title}</p>
        <p className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

type InfoRowProps = {
  icon: React.ElementType;
  accent: string;
  children: React.ReactNode;
  caption?: string;
};

function InfoRow({ icon: Icon, accent, children, caption }: InfoRowProps) {
  return (
    <div>
      <div
        className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
        style={{ background: tint(accent, 0.94) }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: tint(accent, 0.75) }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        </div>
        {children}
      </div>
      {caption && (
        <p className="text-[11px] text-slate-500 mt-1 px-1">{caption}</p>
      )}
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-3">
        <Eyebrow>Your brand &amp; booking link</Eyebrow>
      </div>

      {/* ── BRANDING CARD ── */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {/* Soft brand-color wash instead of a thin bar on plain white */}
        <div
          className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4"
          style={{
            background: `linear-gradient(135deg, ${tint(color1, 0.9)}, ${tint(color2, 0.9)})`,
          }}
        >
          {/* Row 1 on mobile: logo, name, plan badge. Buttons drop to their own row. */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-xl border border-white bg-white flex items-center justify-center overflow-hidden shadow-sm">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      className="w-full h-full object-contain p-1"
                      alt="Logo"
                    />
                  ) : (
                    <span className="text-slate-400 text-sm font-semibold">
                      {companyName?.charAt(0)}
                    </span>
                  )}
                </div>
                {isEditingBrand && (
                  <label className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition">
                    <Pencil className="w-2.5 h-2.5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                )}
              </div>

              {isEditingBrand ? (
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company name"
                  className="flex-1 min-w-0 text-[15px] font-semibold text-slate-900 outline-none border-b-2 border-dashed border-slate-400/50 focus:border-slate-600 bg-transparent pb-0.5"
                />
              ) : (
                <h2 className="flex-1 min-w-0 text-[15px] font-semibold text-slate-900 truncate">
                  {companyName}
                </h2>
              )}

              {!isEditingBrand && (
                <span className="shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold uppercase bg-white/80 text-slate-700 shadow-sm">
                  {company.plan_tier} Plan
                </span>
              )}
            </div>

            {/* Buttons — full width row on mobile, inline on desktop */}
            <div className="flex items-center gap-2 shrink-0 justify-end">
              {!isEditingBrand ? (
                <button
                  onClick={() => setIsEditingBrand(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/60 bg-white/70 text-slate-700 hover:bg-white transition"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-white/60 bg-white/70 text-slate-600 hover:bg-white transition"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button
                    onClick={onSaveBranding}
                    disabled={brandSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition"
                  >
                    {brandSaving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : brandSaved ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    {brandSaving ? 'Saving...' : brandSaved ? 'Saved' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Brand colors */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Palette className="w-3 h-3" /> Brand colors
              </p>
              {isEditingBrand ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                    />
                    <span className="text-[10px] text-slate-500">Primary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                    />
                    <span className="text-[10px] text-slate-500">Secondary</span>
                  </div>
                  <div
                    className="flex-1 h-8 rounded-lg overflow-hidden border border-slate-200"
                    style={{ background: `linear-gradient(90deg, ${color1}, ${color2})` }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-200 shrink-0"
                    style={{ background: color1 }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-200 shrink-0"
                    style={{ background: color2 }}
                  />
                  <div
                    className="flex-1 h-8 rounded-lg overflow-hidden border border-slate-200"
                    style={{ background: `linear-gradient(90deg, ${color1}, ${color2})` }}
                  />
                </div>
              )}
              <p className="text-[11.5px] text-slate-600 mt-2">
                Used in your customer emails and booking form.
              </p>
            </div>

            {/* Company info */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Company Information
              </p>

              <div className="space-y-2">
                <InfoRow
                  icon={Mail}
                  accent={color1}
                  caption="Customer replies and BCC copies of quote, schedule, and invoice emails go here — double check this is correct."
                >
                  {isEditingBrand ? (
                    <input
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="Company email"
                      className="flex-1 min-w-0 bg-transparent outline-none text-sm"
                    />
                  ) : (
                    <span className="text-sm text-slate-700 truncate flex-1 min-w-0">
                      {company.email || 'No email added'}
                    </span>
                  )}
                </InfoRow>

                <InfoRow icon={Phone} accent={color1}>
                  {isEditingBrand ? (
                    <input
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(formatPhone(e.target.value))}
                      placeholder="(555) 555-5555"
                      maxLength={14}
                      className="flex-1 min-w-0 bg-transparent outline-none text-sm"
                    />
                  ) : (
                    <span className="text-sm text-slate-700 truncate flex-1 min-w-0">
                      {company.phone ? formatPhone(company.phone) : 'No phone number'}
                    </span>
                  )}
                </InfoRow>

                <InfoRow icon={Globe} accent={color1}>
                  {isEditingBrand ? (
                    <input
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://yourcompany.com"
                      className="flex-1 min-w-0 bg-transparent outline-none text-sm"
                    />
                  ) : company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate flex-1 min-w-0"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-700 truncate flex-1 min-w-0">
                      No website added
                    </span>
                  )}
                </InfoRow>
              </div>
            </div>
          </div>

          {/* QR + link — full width row so the URL never has to truncate */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Your booking link
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button
                onClick={onShowQrModal}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border flex items-center justify-center overflow-hidden hover:opacity-90 transition shrink-0"
                style={{ background: tint(color1, 0.94), borderColor: tint(color1, 0.7) }}
              >
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} className="w-full h-full" alt="QR code" />
                ) : (
                  <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                )}
              </button>
              <div className="flex-1 min-w-0 w-full">
                <div
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-md border mb-2 overflow-x-auto"
                  style={{ background: tint(color1, 0.94), borderColor: tint(color1, 0.75) }}
                >
                  <code className="text-[13px] font-mono text-slate-700 whitespace-nowrap">
                    {publicLink || `lead2project.com/${company.slug}`}
                  </code>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={onCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={publicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800 transition whitespace-nowrap shrink-0"
                  >
                    View form <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button
                    onClick={onShowQrModal}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Download className="w-3 h-3" /> QR
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
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
          <p className="text-sm text-slate-600 mb-4">
            Your booking link works anywhere you can put a link or a QR code — the
            more places it lives, the more leads come in.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ShareIdeaCard
              icon={Globe}
              accent={color1}
              title="Google Business Profile"
              description="Add it to your website field — often the first place customers look before they even reach your site."
            />
            <ShareIdeaCard
              icon={MessageSquare}
              accent={color2}
              title="Social media"
              description="Add it to your Instagram or Facebook bio, or drop it in a post."
            />
            <ShareIdeaCard
              icon={FileImage}
              accent={color1}
              title="Flyers & signs"
              description="Print the link or a QR code on flyers, yard signs, or door hangers."
            />
            <ShareIdeaCard
              icon={Truck}
              accent={color2}
              title="Vehicle & business cards"
              description="A QR code on your truck magnet or business card lets people book on the spot."
            />
          </div>
        </div>
      </div>

      {/* ── CHECKLIST ── */}
      {doneCount < checklistSteps.length && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <Eyebrow>Get set up</Eyebrow>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {doneCount}/{checklistSteps.length}
            </span>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="h-1 bg-slate-100">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(doneCount / checklistSteps.length) * 100}%`,
                  background: `linear-gradient(90deg, ${color1}, ${color2})`,
                }}
              />
            </div>
            {checklistSteps.map((step, i) => {
              const rowClass = `w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50 transition-colors text-left ${
                i !== checklistSteps.length - 1 ? 'border-b border-slate-100' : ''
              } ${step.done ? 'opacity-50' : ''}`;

              const inner = (
                <>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={step.done ? { background: tint(color1, 0.8) } : {}}
                  >
                    {step.done ? (
                      <Check className="w-3 h-3 stroke-[3px]" style={{ color: color1 }} />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        step.done ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </>
              );

              return step.kind === 'link' ? (
                <a key={step.label} href={step.href} className={rowClass}>
                  {inner}
                </a>
              ) : (
                <button
                  key={step.label}
                  onClick={() => onNavigateSection(step.section)}
                  className={rowClass}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <a
          href={`/${company.slug}/dashboard/deleted-leads`}
          className="flex items-center gap-2 px-4 py-2.5 border border-red-100 bg-red-50 rounded-lg group transition hover:bg-red-100"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-600">Recovery center</span>
        </a>
      </div>
    </div>
  );
}