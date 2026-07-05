'use client';

import { useState, useEffect } from 'react';
import {
  Copy, Check, ExternalLink, Loader2, Lock, Download, Trash2,
  Palette, Save, Pencil, X, LayoutGrid, FileText, Tags, CreditCard,
  Star, Settings as SettingsIcon,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { can, type PlanTier } from '@/lib/permissions';

// Real sections you already have code for — confirmed via `find`, not guessed.
import CategoriesTab from '@/app/[company]/admin/settings/tabs/CategoriesTab';
import PaymentsTab from '@/app/[company]/admin/settings/tabs/PaymentsTab';
import FormTab from '@/app/[company]/admin/settings/tabs/FormTab';
import GoogleReviewsTab from '@/app/[company]/admin/settings/tabs/GoogleReviewsTab';
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

function SidebarItem({ icon: Icon, label, active, locked, onClick }: {
  icon: any; label: string; active: boolean; locked?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
      <span className="flex-1">{label}</span>
      {locked && <Lock className="w-3 h-3 text-slate-300 shrink-0" />}
    </button>
  );
}

export default function HomeClient({ company, currentUser }: { company: Company; currentUser?: any }) {
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');

  const [publicLink, setPublicLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStyle, setQrStyle] = useState<'standard' | 'brand' | 'dark'>('standard');
  const [includeLogo, setIncludeLogo] = useState(true);

  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState(company.logo_url ? `${company.logo_url}?v=${Date.now()}` : '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState(company.name || '');
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
    try {
      let finalLogoUrl = company.logo_url;
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        fd.append('companySlug', company.slug);
        const uploadRes = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) finalLogoUrl = uploadData.logoUrl;
      }
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-name', data: { name: companyName } }),
      });
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-branding', data: { logo_url: finalLogoUrl, email_brand_color_1: color1, email_brand_color_2: color2 } }),
      });
      if (finalLogoUrl) setLogoPreview(`${finalLogoUrl}?v=${Date.now()}`);
      setLogoFile(null);
      setIsEditingBrand(false);
      setBrandSaved(true);
      setTimeout(() => setBrandSaved(false), 2000);
    } catch (err) {
      console.error(err);
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
    { label: 'Connect payments', description: 'So customers can actually pay you online', done: company.stripe_payment_status === 'active', kind: 'section', section: 'payments' },
    { label: 'Set up categories & pricing', description: 'Auto-load tasks and quotes by job type', done: company.categoriesCustomized, kind: 'section', section: 'categories' },
    { label: 'Customize your booking form', description: 'Add questions specific to your business', done: (company.custom_questions?.length ?? 0) > 0, kind: 'section', section: 'form' },
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

      {/* ── SIDEBAR ── */}
      <aside className="lg:w-60 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:min-h-screen">
        <div className="p-4">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
              {logoPreview
                ? <img src={logoPreview} className="w-full h-full object-contain p-0.5" alt="" />
                : <span className="text-slate-500 text-xs font-semibold">{companyName?.charAt(0)}</span>
              }
            </div>
            <span className="text-[13px] font-semibold text-slate-900 truncate">{companyName}</span>
          </div>

          <nav className="space-y-0.5">
            <SidebarItem icon={LayoutGrid} label={sectionLabels.overview} active={activeSection === 'overview'} onClick={() => setActiveSection('overview')} />
            <SidebarItem icon={FileText} label={sectionLabels.form} active={activeSection === 'form'} onClick={() => setActiveSection('form')} />
            <a
              href={`/${company.slug}/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <LayoutGrid className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="flex-1">{dashboardLabel}</span>
            </a>
            <SidebarItem icon={Tags} label={sectionLabels.categories} active={activeSection === 'categories'} locked={categoriesLocked} onClick={() => setActiveSection('categories')} />
            <SidebarItem icon={CreditCard} label={sectionLabels.payments} active={activeSection === 'payments'} locked={paymentsLocked} onClick={() => setActiveSection('payments')} />
            <SidebarItem icon={Star} label={sectionLabels.reviews} active={activeSection === 'reviews'} locked={reviewsLocked} onClick={() => setActiveSection('reviews')} />
          </nav>

          <div className="h-px bg-slate-100 my-3" />

          <a
            href={`/${company.slug}/admin/settings`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <SettingsIcon className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="flex-1">{settingsLabel}</span>
          </a>
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <main className="flex-1 min-w-0">

        {activeSection === 'overview' && (
          <div className="max-w-3xl mx-auto px-6 py-8">

            {doneCount < checklistSteps.length && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <Eyebrow>Get set up</Eyebrow>
                  <span className="text-[11px] text-slate-400 tabular-nums">{doneCount}/{checklistSteps.length}</span>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="h-1 bg-slate-100">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(doneCount / checklistSteps.length) * 100}%` }} />
                  </div>
                  {checklistSteps.map((step, i) => {
                    const rowClass = `w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left ${i !== checklistSteps.length - 1 ? 'border-b border-slate-100' : ''} ${step.done ? 'opacity-50' : ''}`;
                    const inner = (
                      <>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {step.done ? <Check className="w-3 h-3 stroke-[3px]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${step.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{step.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                        </div>
                      </>
                    );
                    return step.kind === 'link' ? (
                      <a key={step.label} href={step.href} className={rowClass}>{inner}</a>
                    ) : (
                      <button key={step.label} onClick={() => setActiveSection(step.section)} className={rowClass}>{inner}</button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-3"><Eyebrow>Your brand &amp; booking link</Eyebrow></div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color1}, ${color2})` }} />
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {logoPreview
                        ? <img src={logoPreview} className="w-full h-full object-contain p-1" alt="Logo" />
                        : <span className="text-slate-400 text-sm font-semibold">{companyName?.charAt(0)}</span>
                      }
                    </div>
                    {isEditingBrand && (
                      <label className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition">
                        <Pencil className="w-2.5 h-2.5" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 4 * 1024 * 1024) { alert('Logo must be under 4MB.'); return; }
                          setLogoFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setLogoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }} />
                      </label>
                    )}
                  </div>

                  {isEditingBrand
                    ? <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                        className="flex-1 text-[15px] font-semibold text-slate-900 outline-none border-b-2 border-dashed border-blue-200 focus:border-blue-500 bg-transparent pb-0.5" placeholder="Company name" />
                    : <h2 className="flex-1 text-[15px] font-semibold text-slate-900 truncate">{companyName}</h2>
                  }

                  {!isEditingBrand
                    ? <button onClick={() => setIsEditingBrand(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition shrink-0">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    : <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => { setIsEditingBrand(false); setCompanyName(company.name); setColor1(company.email_brand_color_1 || '#0B3C6D'); setColor2(company.email_brand_color_2 || '#1F5F8F'); setLogoPreview(company.logo_url ? `${company.logo_url}?v=${Date.now()}` : ''); setLogoFile(null); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                        <button onClick={handleSaveBranding} disabled={brandSaving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition">
                          {brandSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : brandSaved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                          {brandSaving ? 'Saving...' : brandSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                  }
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-start">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Palette className="w-3 h-3" /> Brand colors
                    </p>
                    {isEditingBrand
                      ? <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5" />
                            <span className="text-[10px] text-slate-500">Primary</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5" />
                            <span className="text-[10px] text-slate-500">Secondary</span>
                          </div>
                          <div className="flex-1 h-8 rounded-lg overflow-hidden border border-slate-200" style={{ background: `linear-gradient(90deg, ${color1}, ${color2})` }} />
                        </div>
                      : <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border border-slate-200 shrink-0" style={{ background: color1 }} />
                          <div className="w-8 h-8 rounded-lg border border-slate-200 shrink-0" style={{ background: color2 }} />
                          <div className="flex-1 h-8 rounded-lg overflow-hidden border border-slate-200" style={{ background: `linear-gradient(90deg, ${color1}, ${color2})` }} />
                        </div>
                    }
                    <p className="text-[11.5px] text-slate-600 mt-2">Used in your customer emails and booking form.</p>
                  </div>

                  <div className="flex gap-4 items-start">
                    <button onClick={() => setShowQrModal(true)}
                      className="w-20 h-20 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden hover:border-slate-300 transition shrink-0">
                      {qrCodeUrl
                        ? <img src={qrCodeUrl} className="w-full h-full" alt="QR code" />
                        : <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 mb-2">
                        <code className="text-[12px] font-mono text-slate-700 truncate flex-1">
                          lead2project.com/{company.slug}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleCopy}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
                          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                        <a href={publicLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800 transition">
                          View form <ExternalLink className="w-3 h-3" />
                        </a>
                        <button onClick={() => setShowQrModal(true)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
                          <Download className="w-3 h-3" /> QR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <a href={`/${company.slug}/dashboard/deleted-leads`}
                className="flex items-center gap-2 px-4 py-2.5 border border-red-100 bg-red-50 rounded-lg group transition hover:bg-red-100">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-medium text-red-600">Recovery center</span>
              </a>
            </div>
          </div>
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
      <a href={`/${companySlug}/billing`} className="inline-block mt-3 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors">
        Upgrade to Basic
      </a>
    </div>
  );
}