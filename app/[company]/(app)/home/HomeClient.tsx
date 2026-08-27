'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Lock,
  Download,
  X,
  LayoutGrid,
  FileText,
  Tags,
  CreditCard,
  Rocket,
  Workflow,
  Mail,
  Users,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { can, type PlanTier } from '@/lib/permissions';
import FaqModal from '@/components/FaqModal';

import CategoriesTab from '@/app/[company]/admin/settings/tabs/CategoriesTab';
import PaymentsTab from '@/app/[company]/admin/settings/tabs/PaymentsTab';
import FormTab from '@/app/[company]/admin/settings/tabs/FormTab';
import GoogleReviewsTab from '@/app/[company]/admin/settings/tabs/GoogleReviewsTab';
import OverviewTab from '@/app/[company]/admin/settings/tabs/OverviewTab';
import SetupTab from '@/app/[company]/admin/settings/tabs/SetupTab';
import PipelineTab from '@/app/[company]/admin/settings/tabs/PipelineTab';
import EmailTemplatesTab from '@/app/[company]/admin/settings/tabs/EmailTemplatesTab';
import TeamTab from '@/app/[company]/admin/settings/tabs/TeamTab';
import BillingTab from '@/app/[company]/admin/settings/tabs/BillingTab';

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
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
        active ? '' : 'text-[#57534e] hover:bg-[#f5f1e8]'
      }`}
      style={active ? { backgroundColor: `${accentColor}12`, color: accentColor } : undefined}
    >
      {imageUrl ? (
        <img src={imageUrl} className="w-3.5 h-3.5 shrink-0" alt="" />
      ) : (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
      <span className="flex-1 truncate">{label}</span>
      {locked && <Lock className="w-3 h-3 text-[#a8a29e] shrink-0" />}
    </button>
  );
}

function SectionPill({ icon: Icon, imageUrl, label, active, locked, accentColor, onClick }: {
  icon?: any; imageUrl?: string; label: string; active: boolean; locked?: boolean; accentColor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active ? 'border-transparent' : 'border-[#e7e2d8] text-[#57534e]'
      }`}
      style={active ? { backgroundColor: `${accentColor}14`, color: accentColor } : undefined}
    >
      {imageUrl ? (
        <img src={imageUrl} className="w-3 h-3 shrink-0" alt="" />
      ) : (
        <Icon className="w-3 h-3 shrink-0" />
      )}
      {label}
      {locked && <Lock className="w-2.5 h-2.5" />}
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
  const [logoPreview, setLogoPreview] = useState(company.logo_url ? `${company.logo_url}?v=${Date.now()}` : '');
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

  useEffect(() => {
    if (!publicLink) return;
    const generate = async () => {
      let dark = '#0F172A', light = '#FFFFFF';
      if (qrStyle === 'brand') dark = color1;
      if (qrStyle === 'dark') { dark = '#FFFFFF'; light = '#0F172A'; }
      try {
        const url = await QRCodeLib.toDataURL(publicLink, { width: 1000, margin: 2, errorCorrectionLevel: 'H', color: { dark, light } });
        setQrCodeUrl(url);
      } catch {}
    };
    generate();
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

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

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

  const checklistSteps: ChecklistStep[] = [
    { label: 'Upload your logo', description: 'Make your booking page and emails look professional', done: !!company.logo_url, kind: 'section', section: 'overview' },
    { label: 'Customize your booking form', description: 'Add questions specific to your business', done: (company.custom_questions?.length ?? 0) > 0, kind: 'section', section: 'form' },
    { label: 'Connect payments', description: 'So customers can actually pay you online', done: company.stripe_payment_status === 'active', kind: 'section', section: 'payments' },
    { label: 'Get your first lead', description: 'Share your booking link to get started', done: company.hasRealLead, kind: 'link', href: `/${company.slug}/dashboard` },
  ];

  const isAdminForSections = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  // The annotation has to sit on the raw array literal itself, before any
  // .map()/.filter() runs — annotating the end of a chain doesn't flow
  // contextual typing back through the methods to the original literal.
  const rawSectionGroups: { label: string; items: SectionDef[] }[] = [
    {
      label: 'Get set up',
      items: [
        { key: 'setup', label: 'Setup', icon: Rocket, visible: true },
      ],
    },
    {
      label: 'Your business',
      items: [
        { key: 'overview', label: 'Overview', icon: LayoutGrid, visible: true },
        { key: 'form', label: 'Booking form', icon: FileText, visible: true },
        { key: 'categories', label: 'Categories', icon: Tags, locked: categoriesLocked, visible: true },
      ],
    },
    {
      label: 'Money',
      items: [
        { key: 'payments', label: 'Payments', icon: CreditCard, locked: paymentsLocked, visible: true },
        { key: 'billing', label: 'Billing', icon: CreditCard, visible: currentUser?.role === 'owner' },
      ],
    },
    {
      label: 'Running jobs',
      items: [
        { key: 'pipeline', label: 'Pipeline', icon: Workflow, locked: !can(planTier, 'settings_pipeline'), visible: isAdminForSections },
        { key: 'email-templates', label: 'Email Templates', icon: Mail, locked: !can(planTier, 'settings_email_templates'), visible: isAdminForSections },
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

  const sectionGroups = rawSectionGroups
    .map((g) => ({ ...g, items: g.items.filter((s) => s.visible) }))
    .filter((g) => g.items.length > 0);

  const visibleSections = sectionGroups.flatMap((g) => g.items);

  const isAdminOrOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const isOwner = currentUser?.role === 'owner';

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#1c1917]">Home</h1>
          <button
            onClick={() => setShowFaqModal(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e7e2d8] text-[11px] font-semibold text-[#57534e] hover:bg-[#f5f1e8]"
            aria-label="How Lead2Project works"
          >
            ?
          </button>
        </div>

        {/* Mobile: horizontal pill strip */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-4 mb-4 scrollbar-none">
          {visibleSections.map((s) => (
            <SectionPill
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

        <div className="lg:flex lg:gap-8">
          {/* Desktop: side navigation rail */}
                  <nav className="hidden lg:block lg:w-52 lg:shrink-0 space-y-4">
            {sectionGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-mono font-medium text-[#a8a29e] uppercase tracking-wider px-3 mb-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
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

          <main className="flex-1 min-w-0">
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

            <div style={{ display: activeSection === 'form' ? 'block' : 'none' }}>
              <FormTab company={company} currentUser={currentUser} />
            </div>

            <div style={{ display: activeSection === 'categories' ? 'block' : 'none' }}>
              <CategoriesTab company={company} currentUser={currentUser} />
            </div>

            <div style={{ display: activeSection === 'payments' ? 'block' : 'none' }}>
              {paymentsLocked ? (
                <LockedSection label="Payments" companySlug={company.slug} />
              ) : (
                <PaymentsTab company={company} currentUser={currentUser} />
              )}
            </div>

            <div style={{ display: activeSection === 'reviews' ? 'block' : 'none' }}>
              <GoogleReviewsTab company={company} locked={reviewsLocked} />
            </div>

            {isAdminOrOwner && (
              <>
                <div style={{ display: activeSection === 'pipeline' ? 'block' : 'none' }}>
                  <PipelineTab company={company} currentUser={currentUser} />
                </div>
                <div style={{ display: activeSection === 'email-templates' ? 'block' : 'none' }}>
                  <EmailTemplatesTab company={company} currentUser={currentUser} />
                </div>
                <div style={{ display: activeSection === 'team' ? 'block' : 'none' }}>
                  <TeamTab company={company} currentUser={currentUser} />
                </div>
              </>
            )}

            {isOwner && (
              <div style={{ display: activeSection === 'billing' ? 'block' : 'none' }}>
                <BillingTab company={company} currentUser={currentUser} />
              </div>
            )}
          </main>
        </div>
      </div>

      {showFaqModal && <FaqModal onClose={() => setShowFaqModal(false)} />}

      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className={`p-6 rounded-xl mb-5 flex items-center justify-center transition-colors duration-500 ${qrStyle === 'dark' ? 'bg-slate-900' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="relative">
                <img src={qrCodeUrl} className="w-44 h-44 sm:w-52 sm:h-52" alt="QR code" />
                {includeLogo && logoPreview && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-md border border-slate-100">
                      <img src={logoPreview} className="w-full h-full object-contain" alt="" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                {['standard', 'brand', 'dark'].map(s => (
                  <button key={s} onClick={() => setQrStyle(s as any)}
                    className={`flex-1 py-2.5 rounded-lg border text-xs font-medium transition-all ${qrStyle === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700">Embed company logo</span>
                <button onClick={() => setIncludeLogo(!includeLogo)} className={`w-10 h-5 rounded-full relative transition-colors ${includeLogo ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeLogo ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowQrModal(false)} className="py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition bg-slate-50 rounded-xl">Cancel</button>
                <button onClick={downloadStyledQR} className="py-3 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2">
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
    <div className="max-w-3xl mx-auto py-16 text-center bg-white border border-[#e7e2d8] rounded-2xl">
      <Lock className="w-5 h-5 text-[#a8a29e] mx-auto mb-3" />
      <p className="text-sm font-medium text-[#1c1917]">{label} is on the Basic plan</p>
      <a href={`/${companySlug}/home?section=billing`} className="inline-block mt-3 px-4 py-2 bg-[#1c1917] hover:bg-[#292524] text-white rounded-lg text-xs font-semibold transition-colors">
        Upgrade to Basic
      </a>
    </div>
  );
}