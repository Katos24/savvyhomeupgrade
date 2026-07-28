'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Lock,
  Download,
  X, 
  LayoutGrid,
  FileText,
  Tags,
  CreditCard,
  Star,
  Settings as SettingsIcon,
  Menu,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { can, type PlanTier } from '@/lib/permissions';
import FaqModal from '@/components/FaqModal';

// Real sections you already have code for — confirmed via `find`, not guessed.
import CategoriesTab from '@/app/[company]/admin/settings/tabs/CategoriesTab';
import PaymentsTab from '@/app/[company]/admin/settings/tabs/PaymentsTab';
import FormTab from '@/app/[company]/admin/settings/tabs/FormTab';
import GoogleReviewsTab from '@/app/[company]/admin/settings/tabs/GoogleReviewsTab';
import OverviewTab from '@/app/[company]/admin/settings/tabs/OverviewTab';

// Settings has no single "SettingsTab" file — it's CompanySettingsClient composing
// Pipeline / Email templates / Team / Billing as nested tabs. Bigger wire-in than the
// others; confirm before I drop it in, since it may expect its own internal tab nav
// that could visually double up with this sidebar.
// import CompanySettingsClient from '@/app/[company]/admin/settings/???';

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
type SectionKey = 'overview' | 'form' | 'categories' | 'payments' | 'reviews';

type ChecklistStep =
  | { label: string; description: string; done: boolean; kind: 'section'; section: SectionKey }
  | { label: string; description: string; done: boolean; kind: 'link'; href: string };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </span>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

 function normalizeUrl(raw: string) {
      const trimmed = raw.trim();
      if (!trimmed) return trimmed;
      if (/^http:\/\//i.test(trimmed)) return trimmed.replace(/^http:\/\//i, 'https://');
      if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
      return trimmed;
    }
 
    // iPhone photos are 3-5MB and often HEIC. Vercel caps request bodies near
    // 4.5MB, and a truncated multipart body is what produces:
    //   "expected a value starting with -- and the boundary"
    // Re-encoding in the browser fixes the size and the format in one pass.
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
 
    function SidebarItem({ icon: Icon, imageUrl, label, active, locked, onClick }: {
 
  icon?: any; imageUrl?: string; label: string; active: boolean; locked?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
        active ? 'bg-[#3e4046] text-[#4ade80]' : 'text-white hover:bg-[#3e4046]'
      }`}
    >
      {imageUrl ? (
        <img src={imageUrl} className="w-4 h-4 shrink-0" alt="" />
      ) : (
        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#4ade80]' : 'text-white'}`} />
      )}
      <span className="flex-1">{label}</span>
      {locked && <Lock className="w-3 h-3 text-white/50 shrink-0" />}
    </button>
  );
}

export default function HomeClient({ company: initialCompany, currentUser }: { company: Company; currentUser?: any }) {
  const [company, setCompany] = useState(initialCompany);
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');

  const [publicLink, setPublicLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStyle, setQrStyle] = useState<'standard' | 'brand' | 'dark'>('standard');
  const [includeLogo, setIncludeLogo] = useState(true);
const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);
 const [brandSaving, setBrandSaving] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url ? `${company.logo_url}?v=${Date.now()}` : '');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [companyName, setCompanyName] = useState(company.name || '');
const [companyEmail, setCompanyEmail] = useState(company.email || '');
const [companyPhone, setCompanyPhone] = useState(
  formatPhone(company.phone || '')
);
const [companyWebsite, setCompanyWebsite] = useState(company.website || '');

const [color1, setColor1] = useState(company.email_brand_color_1 || '#0B3C6D');
const [color2, setColor2] = useState(company.email_brand_color_2 || '#1F5F8F');

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
      // Shrink and convert before it ever hits the wire.
      const processed = await prepareLogo(logoFile);
 
      const fd = new FormData();
      fd.append('logo', processed, 'logo.png');
      fd.append('companySlug', company.slug);
 
      // No headers — the browser must set the multipart boundary itself.
      const uploadRes = await fetch('/api/upload-logo', {
        method: 'POST',
        body: fd,
      });
 
      // A non-JSON body here means the route crashed; don't let .json() throw
      // an unhelpful parse error over the real one.
      const uploadData = await uploadRes.json().catch(() => ({}));
 
      if (!uploadRes.ok || !uploadData.success) {
        // Stop here. Continuing would save "Saved" with no logo attached.
        throw new Error(uploadData.error || 'Logo upload failed. Try again.');
      }
 
      finalLogoUrl = uploadData.logoUrl;
    }
 
    await fetch(`/api/company/${company.slug}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update-general',
        data: {
          name: companyName,
          email: companyEmail,
          phone: companyPhone,
          website: normalizedWebsite,
        },
      }),
    });
 
    await fetch(`/api/company/${company.slug}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update-branding',
        data: {
          logo_url: finalLogoUrl,
          email_brand_color_1: color1,
          email_brand_color_2: color2,
        },
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
    setBrandError(
      err instanceof Error ? err.message : 'Something went wrong. Try again.'
    );
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

  const doneCount = checklistSteps.filter(s => s.done).length;

  const sectionLabels: Record<SectionKey, string> = {
    overview: 'Overview',
    form: 'Booking form',
    categories: 'Categories & pricing',
    payments: 'Customer payments',
    reviews: 'Google reviews',
  };
  const dashboardLabel = 'Dashboard';
  const settingsLabel = 'Settings';

  return (
<div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">

        {/* ── MOBILE TOP BAR ── */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-sm font-semibold text-slate-900 truncate">{companyName}</span>
        </div>

        {/* ── MOBILE OVERLAY ── */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* ── SIDEBAR ── */}
<aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#2b2d31] border-r border-[#3e4046] flex flex-col text-white transform transition-transform duration-300 ease-in-out
  ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:static lg:translate-x-0 lg:w-64 lg:min-h-screen lg:shrink-0`}>

  {/* Header */}
  <div className="p-4 border-b border-[#3e4046]">
    <div className="flex items-center gap-3 px-2 py-1">
      <div className="w-8 h-8 rounded-lg bg-[#3e4046] flex items-center justify-center shrink-0">
        {logoPreview ? (
          <img src={logoPreview} className="w-full h-full object-cover rounded-lg" alt="" />
        ) : (
          <span className="font-semibold text-xs text-white">{companyName?.charAt(0)}</span>
        )}
      </div>
     <span className="text-sm font-semibold text-white truncate">{companyName}</span>
      <button
        onClick={() => setShowFaqModal(true)}
        className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/30 text-[11px] font-bold text-white hover:bg-[#3e4046]"
        aria-label="How Lead2Project works"
      >
        ?
      </button>
      <button
        onClick={() => setMobileNavOpen(false)}
        className="p-1.5 rounded-lg hover:bg-[#3e4046] lg:hidden"
        aria-label="Close menu"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  </div>

{/* Navigation */}
<div className="flex-1 px-3 py-4 space-y-6">
  
  {/* Dashboard Section (Opens in new tab) */}
  <nav className="space-y-0.5">
    <p className="px-3 text-[10px] font-bold text-white uppercase tracking-wider mb-2">Home</p>
    <a
      href={`/${company.slug}/dashboard`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-[#3e4046] transition-colors"
    >
      <LayoutDashboard className="w-4 h-4" />
      Dashboard
    </a>
  </nav>

  {/* Management Navigation (Stays in current page) */}
  <nav className="space-y-0.5 pt-4 border-t border-[#3e4046]">
    <p className="px-3 text-[10px] font-bold text-white uppercase tracking-wider mb-2">Management</p>
    
   <div className="space-y-0.5">
  <SidebarItem icon={LayoutGrid} label={sectionLabels.overview} active={activeSection === 'overview'} onClick={() => { setActiveSection('overview'); setMobileNavOpen(false); }} />
  <SidebarItem icon={FileText} label={sectionLabels.form} active={activeSection === 'form'} onClick={() => { setActiveSection('form'); setMobileNavOpen(false); }} />
  <SidebarItem icon={Tags} label={sectionLabels.categories} active={activeSection === 'categories'} locked={categoriesLocked} onClick={() => { setActiveSection('categories'); setMobileNavOpen(false); }} />
  <SidebarItem icon={CreditCard} label={sectionLabels.payments} active={activeSection === 'payments'} locked={paymentsLocked} onClick={() => { setActiveSection('payments'); setMobileNavOpen(false); }} />
  
  {/* Updated Google Reviews Item */}
  <SidebarItem 
    imageUrl="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
    label={sectionLabels.reviews} 
    active={activeSection === 'reviews'} 
    locked={reviewsLocked} 
    onClick={() => { setActiveSection('reviews'); setMobileNavOpen(false); }} 
  />
</div>
  </nav>

  {/* System Section (Opens in new tab) */}
{/* ── SYSTEM SECTION ── */}
<nav className="space-y-0.5 pt-4 border-t border-[#3e4046]">
  <p className="px-3 text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">
    System Settings
  </p>
  
  {/* The main button that opens your settings page */}
  <a
    href={`/${company.slug}/admin/settings`}
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-[#3e4046] transition-colors"
  >
    <SettingsIcon className="w-4 h-4 text-white" />
    Settings
  </a>

  {/* Static list of what's inside - no links */}
  <div className="mt-1 space-y-1 pl-10 pr-3 pb-2">
    <ul className="text-[12px] text-white/60 space-y-1">
      <li className="flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-white/30" /> Pipeline
      </li>
      <li className="flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-white/30" /> Email Templates
      </li>
      <li className="flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-white/30" /> Team Access
      </li>
      <li className="flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-white/30" /> Billing
      </li>
      <li className="flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-white/30" /> Notifications
      </li>
    </ul>
  </div>
</nav>
</div>
</aside>



{/* ── CONTENT ── */}
<main className="flex-1 min-w-0">
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
    checklistSteps={checklistSteps}
    onNavigateSection={(section) => setActiveSection(section as SectionKey)}
  />
)}

        <div className="px-4 sm:px-6 py-6" style={{ display: activeSection === 'form' ? 'block' : 'none' }}>
          <FormTab company={company} currentUser={currentUser} />
        </div>

        <div className="px-4 sm:px-6 py-6" style={{ display: activeSection === 'categories' ? 'block' : 'none' }}>
          <CategoriesTab company={company} currentUser={currentUser} />
        </div>

        <div className="px-4 sm:px-6 py-6" style={{ display: activeSection === 'payments' ? 'block' : 'none' }}>
          {paymentsLocked ? (
            <LockedSection label={sectionLabels.payments} companySlug={company.slug} />
          ) : (
            <PaymentsTab company={company} currentUser={currentUser} />
          )}
        </div>

        <div className="px-4 sm:px-6 py-6" style={{ display: activeSection === 'reviews' ? 'block' : 'none' }}>
          <GoogleReviewsTab company={company} locked={reviewsLocked} />
        </div>

      </main>

   {/* ── FAQ MODAL ── */}
      {showFaqModal && <FaqModal onClose={() => setShowFaqModal(false)} />}

      {/* ── QR MODAL ── */}
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

function PlaceholderSection({ label, note }: { label: string; note: string }) {
  return (
    <div className="max-w-3xl mx-auto py-16 text-center border border-dashed border-slate-300 rounded-lg">
      <p className="text-sm font-medium text-slate-500">{label} goes here</p>
      <p className="text-xs text-slate-400 mt-1 px-6">{note}</p>
    </div>
  );
}

function LockedSection({ label, companySlug }: { label: string; companySlug: string }) {
  return (
    <div className="max-w-3xl mx-auto py-16 text-center bg-white border border-slate-200 rounded-lg">
      <Lock className="w-5 h-5 text-slate-300 mx-auto mb-3" />
      <p className="text-sm font-medium text-slate-700">{label} is on the Basic plan</p>
      <a href={`/${companySlug}/admin/settings`} className="inline-block mt-3 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors">
        Upgrade to Basic
      </a>
    </div>
  );
}

function SidebarSubItem({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-[13px] text-slate-300 hover:text-white hover:bg-[#3e4046]/50 rounded-lg transition-colors pl-8"
    >
      {label}
    </a>
  );
}