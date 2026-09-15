'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Lock,
  Download,
  LayoutGrid,
  FileText,
  Tags,
  CreditCard,
  Rocket,
  Workflow,
  Mail,
  Users,
  HelpCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

// --- Dynamic Lazy Loading for Heavy Tab Components ---
const CategoriesTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/CategoriesTab'));
const PaymentsTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/PaymentsTab'));
const FormTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/FormTab'));
const GoogleReviewsTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/GoogleReviewsTab'));
const OverviewTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/OverviewTab'));
const SetupTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/SetupTab'));
const PipelineTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/PipelineTab'));
const EmailTemplatesTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/EmailTemplatesTab'));
const TeamTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/TeamTab'));
const BillingTab = dynamic(() => import('@/app/[company]/admin/settings/tabs/BillingTab'));

// Lazy load Modals
const FaqModal = dynamic(() => import('@/components/FaqModal'));

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
  plan_tier?: string;
  custom_questions?: any[];
  categoriesCustomized: boolean;
  hasRealLead: boolean;
  stripe_connect_onboarded: boolean;
  stripe_payment_status: 'active' | 'restricted' | 'pending' | null;
};

type SectionKey =
  | 'setup' | 'overview' | 'form' | 'categories' | 'payments'
  | 'reviews' | 'pipeline' | 'email-templates' | 'team' | 'billing';

type ChecklistStep =
  | { label: string; description: string; done: boolean; kind: 'section'; section: SectionKey }
  | { label: string; description: string; done: boolean; kind: 'link'; href: string };

type SectionDef = { key: SectionKey; label: string; icon?: any; imageUrl?: string; locked?: boolean; visible: boolean };

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^http:\/\//i.test(trimmed)) return trimmed.replace(/^http:\/\//i, 'https://');
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

const LOGO_MAX_DIMENSION = 512;
async function prepareLogo(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Couldn't read that image. Try saving it as a JPG or PNG first.");
  }
  const scale = Math.min(1, LOGO_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process that image.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process that image.'))),
      'image/png'
    )
  );
}

function SectionRailItem({ icon: Icon, imageUrl, label, active, locked, accentColor, onClick }: {
  icon?: any; imageUrl?: string; label: string; active: boolean; locked?: boolean; accentColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 text-left ${
        active 
          ? 'bg-white shadow-sm text-stone-900 font-semibold' 
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
      }`}
    >
      {active && (
        <span 
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
          style={{ backgroundColor: accentColor }}
        />
      )}
      {imageUrl ? (
        <img src={imageUrl} className="w-4 h-4 shrink-0 object-contain" alt="" />
      ) : (
        <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? '' : 'text-stone-400 group-hover:text-stone-600'}`} style={active ? { color: accentColor } : undefined} />
      )}
      <span className="flex-1 truncate">{label}</span>
      {locked && <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
    </button>
  );
}

export default function HomeClient({ company: initialCompany, currentUser }: { company: Company; currentUser?: any }) {
  const [company, setCompany] = useState(initialCompany);
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get('section') as SectionKey) || 'overview';
  const [activeSection, setActiveSection] = useState<SectionKey>(initialSection);

  const [publicLink, setPublicLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStyle, setQrStyle] = useState<'standard' | 'brand' | 'dark'>('standard');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url ? company.logo_url : '');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [companyName, setCompanyName] = useState(company.name || '');
  const [companyEmail, setCompanyEmail] = useState(company.email || '');
  const [companyPhone, setCompanyPhone] = useState(formatPhone(company.phone || ''));
  const [companyWebsite, setCompanyWebsite] = useState(company.website || '');

  const [color1, setColor1] = useState(company.email_brand_color_1 || '#0B3C6D');
  const [color2, setColor2] = useState(company.email_brand_color_2 || '#1F5F8F');

  const accentColor = company.email_brand_color_1 || '#2563eb';

  useEffect(() => {
    if (typeof window !== 'undefined') setPublicLink(`${window.location.origin}/${company.slug}`);
  }, [company.slug]);

  // Dynamic QR Code Generation (Imports lib on-demand)
  useEffect(() => {
    if (!publicLink) return;
    let isMounted = true;

    const generate = async () => {
      let dark = '#0F172A', light = '#FFFFFF';
      if (qrStyle === 'brand') dark = color1;
      if (qrStyle === 'dark') { dark = '#FFFFFF'; light = '#0F172A'; }

      try {
        const QRCodeLib = (await import('qrcode')).default;
        const url = await QRCodeLib.toDataURL(publicLink, { width: 1000, margin: 2, errorCorrectionLevel: 'H', color: { dark, light } });
        if (isMounted) setQrCodeUrl(url);
      } catch {}
    };

    generate();
    return () => { isMounted = false; };
  }, [publicLink, qrStyle, color1]);

  const handleSaveBranding = async () => {
    setBrandSaving(true);
    setBrandError(null);
    const normalizedWebsite = normalizeUrl(companyWebsite);
    try {
      let finalLogoUrl = company.logo_url;
      if (logoFile) {
        const processed = await prepareLogo(logoFile);
        const fd = new FormData();
        fd.append('logo', processed, 'logo.png');
        fd.append('companySlug', company.slug);
        const uploadRes = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || 'Logo upload failed. Try again.');
        }
        finalLogoUrl = uploadData.logoUrl;
      }
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-general',
          data: { name: companyName, email: companyEmail, phone: companyPhone, website: normalizedWebsite },
        }),
      });
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-branding',
          data: { logo_url: finalLogoUrl, email_brand_color_1: color1, email_brand_color_2: color2 },
        }),
      });
      if (finalLogoUrl) setLogoPreview(`${finalLogoUrl}?v=${Date.now()}`);
      setCompanyWebsite(normalizedWebsite);
      setCompany((prev) => ({
        ...prev,
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        website: normalizedWebsite,
        logo_url: finalLogoUrl ?? prev.logo_url,
        email_brand_color_1: color1,
        email_brand_color_2: color2,
      }));
      setLogoFile(null);
      setIsEditingBrand(false);
      setBrandSaved(true);
      setTimeout(() => setBrandSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setBrandError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBrandSaving(false);
    }
  };

  const planTier = (company.plan_tier || 'free') as PlanTier;
  const paymentsLocked = !can(planTier, 'stripe_connect');
  const reviewsLocked = !can(planTier, 'google_reviews');
  const categoriesLocked = !can(planTier, 'categories');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [publicLink]);

  const downloadStyledQR = () => {
    const canvasEl = document.createElement('canvas');
    const ctx = canvasEl.getContext('2d');
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      canvasEl.width = qrImg.width;
      canvasEl.height = qrImg.height;
      ctx?.drawImage(qrImg, 0, 0);
      if (includeLogo && company.logo_url) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = company.logo_url;
        logoImg.onload = () => {
          const logoSize = canvasEl.width * 0.18;
          const x = (canvasEl.width - logoSize) / 2;
          const y = (canvasEl.height - logoSize) / 2;
          ctx!.fillStyle = 'white';
          ctx?.beginPath();
          ctx?.rect(x - 10, y - 10, logoSize + 20, logoSize + 20);
          ctx?.fill();
          ctx?.drawImage(logoImg, x, y, logoSize, logoSize);
          const a = document.createElement('a');
          a.download = `${company.slug}-branded-qr.png`;
          a.href = canvasEl.toDataURL('image/png');
          a.click();
        };
      } else {
        const a = document.createElement('a');
        a.download = `${company.slug}-qr.png`;
        a.href = qrImg.src;
        a.click();
      }
    };
    qrImg.src = qrCodeUrl;
  };

  const checklistSteps: ChecklistStep[] = useMemo(() => [
    { label: 'Upload your logo', description: 'Make your booking page and emails look professional', done: !!company.logo_url, kind: 'section', section: 'overview' },
    { label: 'Customize your booking form', description: 'Add questions specific to your business', done: (company.custom_questions?.length ?? 0) > 0, kind: 'section', section: 'form' },
    { label: 'Connect payments', description: 'So customers can actually pay you online', done: company.stripe_payment_status === 'active', kind: 'section', section: 'payments' },
    { label: 'Get your first lead', description: 'Share your booking link to get started', done: company.hasRealLead, kind: 'link', href: `/${company.slug}/dashboard` },
  ], [company]);

  const isAdminForSections = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const isOwner = currentUser?.role === 'owner';

  const sectionGroups = useMemo(() => {
    const raw: { label: string; items: SectionDef[] }[] = [
      {
        label: 'Get set up',
        items: [{ key: 'setup', label: 'Setup Guide', icon: Rocket, visible: true }],
      },
      {
        label: 'Your business',
        items: [
          { key: 'overview', label: 'Overview', icon: LayoutGrid, visible: true },
          { key: 'categories', label: 'Services', icon: Tags, locked: categoriesLocked, visible: true },
          { key: 'form', label: 'Booking form', icon: FileText, visible: true },
        ],
      },
      {
        label: 'Money',
        items: [
          { key: 'payments', label: 'Payments', icon: CreditCard, locked: paymentsLocked, visible: true },
          { key: 'billing', label: 'Billing', icon: CreditCard, visible: isOwner },
        ],
      },
      {
        label: 'Running jobs',
        items: [
          { key: 'pipeline', label: 'Pipeline', icon: Workflow, locked: !can(planTier, 'settings_pipeline'), visible: isAdminForSections },
          { key: 'email-templates', label: 'Emails', icon: Mail, locked: !can(planTier, 'settings_email_templates'), visible: isAdminForSections },
          { key: 'team', label: 'Team', icon: Users, locked: !can(planTier, 'settings_team'), visible: isAdminForSections },
        ],
      },
      {
        label: 'Growth',
        items: [
          { key: 'reviews', label: 'Reviews', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', locked: reviewsLocked, visible: true },
        ],
      },
    ];

    return raw
      .map((g) => ({ ...g, items: g.items.filter((s) => s.visible) }))
      .filter((g) => g.items.length > 0);
  }, [categoriesLocked, paymentsLocked, isOwner, planTier, isAdminForSections, reviewsLocked]);

  const visibleSections = useMemo(() => sectionGroups.flatMap((g) => g.items), [sectionGroups]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
              <span>Settings</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-stone-800 capitalize">
                {visibleSections.find((s) => s.key === activeSection)?.label || activeSection}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Workspace Settings</h1>
          </div>
          
          <button
            onClick={() => setShowFaqModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-sm transition-colors"
            aria-label="How Lead2Project works"
          >
            <HelpCircle className="w-4 h-4 text-stone-500" />
            <span>Help & FAQ</span>
          </button>
        </div>

        {/* Mobile: Section Dropdown Selector */}
        <div className="block lg:hidden mb-6">
          <div className="relative">
            <select
              id="mobile-section-select"
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value as SectionKey)}
              className="w-full appearance-none bg-white border border-stone-200/90 rounded-2xl px-4 py-3.5 pr-10 text-sm font-semibold text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-colors cursor-pointer"
            >
              {sectionGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} {s.locked ? '🔒' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Desktop: Navigation Rail */}
          <nav className="hidden lg:block lg:col-span-3 space-y-6 pr-2">
            {sectionGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-3 mb-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((s) => (
                    <SectionRailItem
                      key={s.key}
                      icon={s.icon}
                      imageUrl={s.imageUrl}
                      label={s.label}
                      active={activeSection === s.key}
                      locked={s.locked}
                      accentColor={accentColor}
                      onClick={() => setActiveSection(s.key)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Main Workspace Area (Renders dynamically) */}
          <main className="lg:col-span-9 min-w-0">
            {activeSection === 'setup' && (
              <SetupTab checklistSteps={checklistSteps} onNavigateSection={(section) => setActiveSection(section as SectionKey)} />
            )}

            {activeSection === 'overview' && (
              <OverviewTab
                company={company}
                color1={color1}
                color2={color2}
                logoPreview={logoPreview}
                isEditingBrand={isEditingBrand}
                setIsEditingBrand={setIsEditingBrand}
                companyName={companyName}
                setCompanyName={setCompanyName}
                companyEmail={companyEmail}
                setCompanyEmail={setCompanyEmail}
                companyPhone={companyPhone}
                setCompanyPhone={setCompanyPhone}
                formatPhone={formatPhone}
                companyWebsite={companyWebsite}
                setCompanyWebsite={setCompanyWebsite}
                setLogoFile={setLogoFile}
                setLogoPreview={setLogoPreview}
                setColor1={setColor1}
                setColor2={setColor2}
                brandSaving={brandSaving}
                brandSaved={brandSaved}
                brandError={brandError}
                onSaveBranding={handleSaveBranding}
                qrCodeUrl={qrCodeUrl}
                onShowQrModal={() => setShowQrModal(true)}
                publicLink={publicLink}
                copied={copied}
                onCopy={handleCopy}
                onNavigateSection={(section) => setActiveSection(section as SectionKey)}
              />
            )}

            {activeSection === 'form' && <FormTab company={company} currentUser={currentUser} />}

            {activeSection === 'categories' && <CategoriesTab company={company} currentUser={currentUser} />}

            {activeSection === 'payments' && (
              paymentsLocked ? (
                <LockedSection label="Payments" companySlug={company.slug} />
              ) : (
                <PaymentsTab company={company} currentUser={currentUser} />
              )
            )}

            {activeSection === 'reviews' && <GoogleReviewsTab company={company} locked={reviewsLocked} />}

            {isAdminForSections && activeSection === 'pipeline' && (
              <PipelineTab company={company} currentUser={currentUser} />
            )}

            {isAdminForSections && activeSection === 'email-templates' && (
              <EmailTemplatesTab company={company} currentUser={currentUser} />
            )}

            {isAdminForSections && activeSection === 'team' && (
              <TeamTab company={company} currentUser={currentUser} />
            )}

            {isOwner && activeSection === 'billing' && (
              <BillingTab company={company} currentUser={currentUser} />
            )}
          </main>
        </div>
      </div>

      {showFaqModal && <FaqModal onClose={() => setShowFaqModal(false)} />}

      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-stone-100">
            <div className={`p-6 rounded-xl mb-5 flex items-center justify-center transition-colors duration-300 ${qrStyle === 'dark' ? 'bg-stone-900' : 'bg-stone-50 border border-stone-200/60'}`}>
              <div className="relative">
                {qrCodeUrl && <img src={qrCodeUrl} className="w-44 h-44 sm:w-52 sm:h-52" alt="QR code" />}
                {includeLogo && logoPreview && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-md border border-stone-100">
                      <img src={logoPreview} className="w-full h-full object-contain" alt="" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                {(['standard', 'brand', 'dark'] as const).map(s => (
                  <button key={s} onClick={() => setQrStyle(s)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold capitalize transition-colors ${qrStyle === s ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
                <span className="text-sm font-medium text-stone-700">Embed company logo</span>
                <button onClick={() => setIncludeLogo(!includeLogo)} className={`w-10 h-5 rounded-full relative transition-colors ${includeLogo ? 'bg-stone-900' : 'bg-stone-300'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${includeLogo ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowQrModal(false)} className="py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition bg-stone-100 hover:bg-stone-200/70 rounded-xl">Cancel</button>
                <button onClick={downloadStyledQR} className="py-2.5 bg-stone-900 text-white rounded-xl font-medium text-sm hover:bg-stone-800 transition flex items-center justify-center gap-2 shadow-sm">
                  <Download className="w-4 h-4" /> Export PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LockedSection({ label, companySlug }: { label: string; companySlug: string }) {
  return (
    <div className="max-w-xl mx-auto py-12 px-6 text-center bg-white border border-stone-200 rounded-2xl shadow-sm">
      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-stone-500" />
      </div>
      <h3 className="text-base font-semibold text-stone-900">{label} is locked</h3>
      <p className="text-xs text-stone-500 mt-1 mb-6">Upgrade your subscription to unlock {label.toLowerCase()} and additional features.</p>
      <a href={`/${companySlug}/home?section=billing`} className="inline-flex items-center justify-center px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">
        Upgrade Plan
      </a>
    </div>
  );
}