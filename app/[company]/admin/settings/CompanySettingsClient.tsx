'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Workflow, Mail, Grid, FileText, ArrowLeft, Bell, Users, 
  CreditCard, ChevronRight, Trash2, Camera, Copy, Check, 
  Pencil, X, Save, Phone, ExternalLink, Palette, Globe, Download,
  Lock,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { can, FEATURE_PLAN_MAP, PLAN_CONFIG, UPGRADE_PROMPTS, type PlanTier } from '@/lib/permissions';

// Sub-tab imports
import FormTab from './tabs/FormTab';
import PipelineTab from './tabs/PipelineTab';
import EmailTemplatesTab from './tabs/EmailTemplatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import TeamTab from './tabs/TeamTab';
import BillingTab from './tabs/BillingTab';
import NotificationsTab from './tabs/NotificationsTab';

type Tab = 'form' | 'pipeline' | 'email-templates' | 'categories' | 'team' | 'billing' | 'notifications';

const TAB_LABELS: Record<Tab, string> = {
  form: 'Booking Form',
  pipeline: 'Pipeline',
  'email-templates': 'Automations',
  categories: 'Categories',
  team: 'Team Access',
  billing: 'Billing',
  notifications: 'Notifications',
};

// Tab → feature key mapping — reads from FEATURE_PLAN_MAP in permissions.ts
const TAB_FEATURE_MAP: Partial<Record<Tab, Parameters<typeof can>[1]>> = {
  form:              'settings_form',
  pipeline:          'settings_pipeline',
  'email-templates': 'settings_email_templates',
  categories:        'settings_categories',
  team:              'settings_team',
  notifications:     'settings_notifications',
};

// ── Upgrade overlay shown inside a locked tab ─────────────────
function UpgradeOverlay({ feature, companySlug }: {
  feature: string;
  companySlug: string;
}) {
  const prompt = UPGRADE_PROMPTS[feature];
  const requiredPlan = (FEATURE_PLAN_MAP as any)[feature] as PlanTier | undefined;
  const planKey = requiredPlan === 'pro' ? 'pro' : 'basic';
  const config = PLAN_CONFIG[planKey];
  const colors = planKey === 'pro'
    ? { bg: 'from-blue-50 to-blue-50', border: 'border-blue-200', badge: 'bg-blue-600', text: 'text-blue-900' }
    : { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', badge: 'bg-blue-600', text: 'text-blue-900' };

  return (
    <div className={`rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-8 text-center`}>
      <div className={`w-14 h-14 ${colors.badge} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <Lock className="w-7 h-7 text-white" />
      </div>
      <h3 className={`text-lg font-black ${colors.text} mb-2`}>
        {prompt?.title ?? 'Upgrade to unlock'}
      </h3>
      {prompt?.description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
          {prompt.description}
        </p>
      )}
      {config?.features && (
        <ul className="text-left space-y-2 mb-6 max-w-xs mx-auto">
          {config.features.slice(0, 4).map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-green-500 font-bold">✓</span> {f}
            </li>
          ))}
        </ul>
      )}
      <a
        href={`/${companySlug}/admin/settings`}
        onClick={e => { e.preventDefault(); window.location.href = `/${companySlug}/admin/settings`; }}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white ${colors.badge} hover:opacity-90 transition`}
      >
       Upgrade to {config.label}
        {config?.price && <span className="opacity-75 font-normal">— ${config.price}/mo</span>}
      </a>
      <p className="text-xs text-gray-400 mt-3">Cancel anytime. No contracts.</p>
    </div>
  );
}

export default function CompanySettingsClient({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'free') as PlanTier;
const [showDigestConfirm, setShowDigestConfirm] = useState(false);
const [showDigestInfo, setShowDigestInfo] = useState(false);


  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [companyData, setCompanyData] = useState(company);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [digestEnabled, setDigestEnabled] = useState(company.daily_digest_enabled ?? false);

  // QR states
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStyle, setQrStyle] = useState<'standard' | 'brand' | 'dark'>('standard');
  const [includeLogo, setIncludeLogo] = useState(true);

  // Identity form
  const [formData, setFormData] = useState({
    name: company.name || '',
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    color1: company.email_brand_color_1 || '#6366f1',
    color2: company.email_brand_color_2 || '#4f46e5',
  });
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [publicLink, setPublicLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPublicLink(`${window.location.origin}/${company.slug}`);
    }
  }, [company.slug]);

  useEffect(() => {
    if (!publicLink) return;
    const generateQR = async () => {
      let darkColor = '#0F172A';
      let lightColor = '#FFFFFF';
      if (qrStyle === 'brand') darkColor = formData.color1;
      if (qrStyle === 'dark') { darkColor = '#FFFFFF'; lightColor = '#0F172A'; }
      try {
        const url = await QRCodeLib.toDataURL(publicLink, {
          width: 1000, margin: 2, errorCorrectionLevel: 'H',
          color: { dark: darkColor, light: lightColor }
        });
        setQrCodeUrl(url);
      } catch (err) { console.error('QR failed:', err); }
    };
    generateQR();
  }, [publicLink, qrStyle, formData.color1]);

  const openTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeTab = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`);
      const data = await res.json();
      if (data.success && data.company) {
        setCompanyData(data.company);
      }
    } catch {}
    setActiveTab(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [company.slug]);

  const downloadStyledQR = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      ctx?.drawImage(qrImg, 0, 0);
      if (includeLogo && logoPreview) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = logoPreview;
        logoImg.onload = () => {
          const logoSize = canvas.width * 0.18;
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;
          ctx!.fillStyle = 'white';
          ctx?.beginPath();
          // @ts-ignore
          if (ctx?.roundRect) { ctx.roundRect(x - 10, y - 10, logoSize + 20, logoSize + 20, 15); }
          else { ctx?.rect(x - 10, y - 10, logoSize + 20, logoSize + 20); }
          ctx?.fill();
          ctx?.drawImage(logoImg, x, y, logoSize, logoSize);
          const a = document.createElement('a');
          a.download = `${company.slug}-branded-qr.png`;
          a.href = canvas.toDataURL('image/png');
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

  const handleSaveIdentity = async () => {
    setLoading(true);
    try {
      let finalLogoUrl = company.logo_url;
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        fd.append('companySlug', company.slug);
        const uploadRes = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.success) finalLogoUrl = uploadData.logoUrl;
      }
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-general',
          data: { ...formData, logo_url: finalLogoUrl, email_brand_color_1: formData.color1, email_brand_color_2: formData.color2 }
        }),
      });
      if (res.ok) {
        if (finalLogoUrl !== company.logo_url) setLogoPreview(finalLogoUrl || '');
        setLogoFile(null);
        setIsEditing(false);
      }
    } catch (err) { console.error('Save failed:', err); }
    finally { setLoading(false); }
  };

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
  };

  // Render a tab without lock check
  const renderUnlockedTab = (tab: Tab, data: any) => {
    switch (tab) {
      case 'form':            return <FormTab company={data} currentUser={currentUser} />;
      case 'pipeline':        return <PipelineTab company={data} currentUser={currentUser} />;
      case 'email-templates': return <EmailTemplatesTab company={data} currentUser={currentUser} />;
      case 'categories':      return <CategoriesTab company={data} currentUser={currentUser} />;
      case 'team':            return <TeamTab company={data} currentUser={currentUser} />;
      case 'billing':         return <BillingTab company={data} currentUser={currentUser} />;
      default:                return null;
    }
  };

  // Sample data so locked tabs have something to show
  const getSampleData = (tab: Tab) => {
    switch (tab) {
      case 'categories':
        return {
          form_categories: [
            { value: 'roof_repair', label: 'Roof Repair' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'new_installation', label: 'New Installation' },
            { value: 'gutter_cleaning', label: 'Gutter Cleaning' },
          ],
        };
      case 'form':
        return {
          form_field_config: {
            address: { enabled: true, required: true },
            file_upload: { enabled: true },
            lead_source: { enabled: true },
            preferred_date: { enabled: true },
            preferred_time: { enabled: false },
          },
          custom_questions: [
            { id: '1', label: 'What is your budget range?', type: 'select', required: false, options: ['Under $1,000', '$1,000-$5,000', '$5,000+'] },
            { id: '2', label: 'Do you have pets on site?', type: 'checkbox', required: false },
          ],
        };
      case 'pipeline':
        return {
          status_options: [
            { value: 'new', label: 'New', color: 'blue' },
            { value: 'contacted', label: 'Contacted', color: 'yellow' },
            { value: 'quoted', label: 'Quoted', color: 'purple' },
            { value: 'scheduled', label: 'Scheduled', color: 'blue' },
            { value: 'in-progress', label: 'In Progress', color: 'orange' },
            { value: 'completed', label: 'Completed', color: 'green' },
          ],
        };
      case 'email-templates':
        return {};
      case 'team':
        return {};
      default:
        return {};
    }
  };

  // ── Tab content renderer with lock check ─────────────────────
  const renderTabContent = (tab: Tab) => {
    const featureKey = TAB_FEATURE_MAP[tab];

  // Check if locked — show real tab blurred with upgrade overlay
    if (featureKey && !can(planTier, featureKey)) {
      const sampleData = { ...companyData, ...getSampleData(tab) };
      return (
        <div className="relative">
          {/* Real tab content — blurred and non-interactive */}
          <div className="blur-[3px] pointer-events-none select-none opacity-60" aria-hidden>
            {renderUnlockedTab(tab, sampleData)}
          </div>
          {/* Upgrade overlay on top */}
          <div className="absolute inset-0 flex items-start justify-center pt-24 z-10">
            <UpgradeOverlay
              feature={featureKey}
              companySlug={company.slug}
            />
          </div>
        </div>
      );
    }

   // Unlocked — render normally
    return renderUnlockedTab(tab, companyData);
  };

// UI//

  if (activeTab) {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 px-4 py-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              onClick={closeTab}
              className="flex items-center gap-1.5 text-blue-400 font-black text-xs uppercase tracking-widest hover:text-blue-300 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Settings
            </button>
            <span className="text-white/20">/</span>
            <span className="font-black text-white text-xs uppercase tracking-widest">
              {TAB_LABELS[activeTab]}
            </span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
  <div className="bg-white rounded-[2rem] p-4 shadow-2xl">
            {renderTabContent(activeTab)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 selection:bg-blue-500/30">
      <header className="bg-slate-900/40 backdrop-blur-md border-b border-white/5 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] italic underline decoration-blue-500 decoration-2 underline-offset-4 truncate">
            Lead2Project
          </h1>
          <a href={`/${company.slug}/dashboard`} className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-white transition">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 sm:space-y-12">

        {/* IDENTITY HERO */}
<section className="bg-white rounded-3xl sm:rounded-[3rem] shadow-2xl shadow-black/20 overflow-hidden">
  {/* Brand color bar */}
  <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${formData.color1}, ${formData.color2})` }} />

  <div className="p-5 sm:p-8 lg:p-10 space-y-6">

    {/* Top row — logo + name + edit */}
    <div className="flex items-center gap-4">

      {/* Logo */}
      <div className="relative shrink-0">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-black/5 flex items-center justify-center overflow-hidden"
          style={{ boxShadow: `0 4px 20px color-mix(in srgb, ${formData.color1} 15%, transparent)` }}
        >
          {logoPreview
            ? <img src={logoPreview} className="w-full h-full object-contain p-2" alt="Logo" />
            : <span className="text-2xl sm:text-3xl font-black text-slate-200">{formData.name.charAt(0)}</span>
          }
        </div>
        {isEditing && (
          <label className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition active:scale-95">
            <Camera className="w-3.5 h-3.5" />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogoFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setLogoPreview(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </label>
        )}
      </div>

      {/* Name + plan badge */}
      <div className="flex-1 min-w-0">
        {!isEditing
          ? <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate leading-tight">{formData.name}</h2>
          : <input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight outline-none border-b-2 border-dashed border-blue-200 focus:border-blue-500 w-full bg-transparent leading-tight pb-1"
              placeholder="Company Name"
            />
        }
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
            style={{ background: `linear-gradient(135deg, ${formData.color1}, ${formData.color2})` }}
          >
            {planTier} plan
          </span>
        </div>
      </div>

      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 sm:px-5 sm:py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      )}
    </div>



    {/* Fields */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
        {isEditing
          ? <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 transition" />
          : <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50/50 rounded-xl text-sm font-bold text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{formData.email || 'Not set'}</span>
            </div>
        }
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Phone</label>
        {isEditing
          ? <input type="text" value={formData.phone} placeholder="(555) 555-5555"
              onChange={e => {
                const input = e.target.value.replace(/\D/g, '');
                if (input.length <= 10) setFormData({ ...formData, phone: formatPhone(input) });
              }}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 transition font-medium"
            />
          : <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50/50 rounded-xl text-sm font-bold text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{formData.phone ? formatPhone(formData.phone) : 'Not set'}</span>
            </div>
        }
      </div>

    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Website</label>
    {isEditing
      ? <input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })}
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/10 transition"
          placeholder="https://yourwebsite.com"
        />
      : <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50/50 rounded-xl text-sm font-bold text-slate-700">
          <Globe className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate flex-1">{formData.website || 'Not set'}</span>
          {formData.website && (
            <a href={formData.website} target="_blank" className="text-blue-500 hover:text-blue-600 shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
    }
  </div>

  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
      <Palette className="w-3 h-3" /> Brand Colors
    </label>
    {isEditing ? (
      <div className="flex gap-3">
        <input type="color" value={formData.color1} onChange={e => setFormData({ ...formData, color1: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer bg-slate-50 border border-slate-100 p-1 shadow-sm hover:scale-105 transition" />
        <input type="color" value={formData.color2} onChange={e => setFormData({ ...formData, color2: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer bg-slate-50 border border-slate-100 p-1 shadow-sm hover:scale-105 transition" />
      </div>
    ) : (
     <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50/50 rounded-xl">
  <div className="w-6 h-6 rounded-lg shadow-sm border border-black/5 shrink-0" style={{ background: formData.color1 }} />
  <span className="text-xs font-mono font-bold text-slate-500 truncate hidden sm:block">{formData.color1}</span>
  <div className="w-px h-4 bg-slate-200 shrink-0" />
  <div className="w-6 h-6 rounded-lg shadow-sm border border-black/5 shrink-0" style={{ background: formData.color2 }} />
  <span className="text-xs font-mono font-bold text-slate-500 truncate hidden sm:block">{formData.color2}</span>
</div>
    )}
  </div>
</div>
    </div>

    {isEditing && (
      <div className="flex gap-3 pt-1">
        <button onClick={() => setIsEditing(false)}
          className="flex items-center justify-center gap-1.5 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={handleSaveIdentity} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition active:scale-[0.98]">
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    )}

 {/* Booking link */}
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${formData.color1} 5%, white), white)`,
        borderColor: `color-mix(in srgb, ${formData.color1} 20%, transparent)`,
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${formData.color1}, ${formData.color2})` }}
      >
        <Globe className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Your Booking Link</p>
        <p className="text-sm font-mono font-bold text-slate-700 truncate">
          lead2project.com/<span style={{ color: formData.color1 }}>{publicLink?.split('/').pop() || 'your-company'}</span>
        </p>
      </div>
      <button
        onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
        style={{
          background: copied ? '#dcfce7' : `color-mix(in srgb, ${formData.color1} 10%, white)`,
          color: copied ? '#16a34a' : formData.color1,
        }}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>



    {/* Action buttons */}
    {!isEditing && (
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">

        {/* QR Code */}
        <button
          onClick={() => setShowQrModal(true)}
          className="group flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all active:scale-95"
        >
          {qrCodeUrl
            ? <img src={qrCodeUrl} className="w-8 h-8 rounded-md" alt="QR" />
            : <div className="w-8 h-8 bg-slate-200 rounded-md animate-pulse" />
          }
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">QR Code</span>
        </button>

     {/* View Form */}
<a
  href={publicLink}
  target="_blank"
  rel="noopener noreferrer"
  className="group flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all active:scale-95"
>
  <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
    View Form
  </span>
</a>

        {/* Daily Digest */}
    {/* Daily Digest */}
{planTier === 'free' ? (
  <a
    href={`/${company.slug}/admin/settings`}
    onClick={(e) => {
      e.preventDefault();
      openTab('billing');
    }}
    className="group relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all active:scale-95 overflow-hidden"
    style={{
      background: '#0f172a',
      boxShadow: '6px 6px 0px #facc15',
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
    <CreditCard className="w-5 h-5 text-white relative z-10" />
    <span className="text-[10px] font-black text-white uppercase tracking-widest relative z-10">
      Upgrade
    </span>
    <span className="text-[8px] font-bold text-white/60 relative z-10">
      From $49.99/mo
    </span>
  </a>
) : can(planTier, 'daily_digest') ? (
  <>
    {/* Confirm popup */}
    {showDigestConfirm && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowDigestConfirm(false)} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
          <h3 className="text-sm font-black text-slate-900 mb-2">
            {digestEnabled ? 'Turn off Daily Digest?' : 'Turn on Daily Digest?'}
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-6">
            {digestEnabled
              ? 'You will stop receiving the 6AM daily summary email.'
              : 'You will receive a 6AM daily summary of your leads, jobs, and payments.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDigestConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const newVal = !digestEnabled;
                setDigestEnabled(newVal);
                setShowDigestConfirm(false);
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
              }}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition ${
                digestEnabled ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {digestEnabled ? 'Turn Off' : 'Turn On'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Digest info modal */}
    {showDigestInfo && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowDigestInfo(false)} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900">What's in your Daily Digest?</h3>
            <button onClick={() => setShowDigestInfo(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: "Today's scheduled jobs", desc: "Every job on the books for today with time and assignee." },
              { label: "Stale leads", desc: "Leads that haven't been touched in 3+ days." },
              { label: "Quotes with no response", desc: "Quotes sent 2+ days ago with no accept or decline." },
              { label: "Unpaid completed jobs", desc: "Jobs that are done but haven't been paid." },
              { label: "Overdue payments", desc: "Payments past their due date." },
              { label: "Due this week", desc: "Payments coming due in the next 7 days." },
              { label: "Follow-up reminders", desc: "Any follow-up tasks due today or overdue." },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-slate-800">{label}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-4 pt-3 border-t border-slate-100 uppercase tracking-widest">
            Delivered at 6AM daily
          </p>
        </div>
      </div>
    )}

    {/* Toggle button — wrapped with i icon */}
    <div className="relative">
      <button
        onClick={() => setShowDigestConfirm(true)}
        className={`group flex flex-col items-center justify-center gap-2 p-4 border rounded-2xl transition-all active:scale-95 w-full ${
          digestEnabled
            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
        }`}
      >
        <div
          className={`w-10 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0 ${digestEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
          style={{ minWidth: '40px' }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
            style={{ left: digestEnabled ? '22px' : '2px' }}
          />
        </div>
        <Mail className={`w-5 h-5 transition-colors ${digestEnabled ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
      <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${digestEnabled ? 'text-blue-600' : 'text-slate-500'}`}>
  {digestEnabled ? 'Digest On' : 'Digest Off'}
  <div
    onClick={e => { e.stopPropagation(); setShowDigestInfo(true); }}
    className="w-4 h-4 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition shrink-0 cursor-pointer"
  >
    <span className="text-[8px] font-black text-blue-600">i</span>
  </div>
</span>
      </button>

      {/* i icon — top right, opens info modal */}
     
    </div>
  </>
) : (
<button
    onClick={() => openTab('billing')}
    className="group flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl transition-all hover:border-blue-300 hover:bg-blue-50 active:scale-95"
  >
    <Lock className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
    <div className="text-center">
      <p className="text-[10px] font-black text-slate-300 group-hover:text-blue-400 uppercase tracking-widest transition-colors">Digest</p>
      <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-0.5">Pro</p>
    </div>
  </button>
)}
      </div>
    )}
  </div>
</section>

        {/* MODULE GRID */}
        <div>
          <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4 px-1">System Configuration</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <MenuCard icon={Workflow} label="Pipeline" desc="Customize your lead stages so every job moves through a process that makes sense for your business." color="#f59e0b" onClick={() => openTab('pipeline')} locked={!can(planTier, 'settings_pipeline')} requiredPlan="Basic" />
            <MenuCard icon={Grid} label="Categories" desc="Add your service types — each gets its own task checklist and pricing template that auto-loads on new jobs." color="#8b5cf6" onClick={() => openTab('categories')} locked={!can(planTier, 'settings_categories')} requiredPlan="Basic" />
            <MenuCard icon={FileText} label="Booking Form" desc="Control what customers fill out when they submit a request. Turn on address, photos, and custom questions." color="#f97316" onClick={() => openTab('form')} locked={!can(planTier, 'settings_form')} requiredPlan="Basic" />
            <MenuCard icon={Mail} label="Automations" desc="Personalize the emails customers receive for quotes, schedules, and payment reminders — all branded to you." color="#3b82f6" onClick={() => openTab('email-templates')} locked={!can(planTier, 'settings_email_templates')} requiredPlan="Pro" />
            <MenuCard icon={Users} label="Team" desc="Invite your crew and assign leads to specific people so nothing falls through the cracks." color="#0ea5e9" onClick={() => openTab('team')} locked={!can(planTier, 'settings_team')} requiredPlan="Basic" />
{planTier !== 'free' && (
  <MenuCard icon={CreditCard} label="Billing" desc="Manage your plan and subscription." color="#10b981" onClick={() => openTab('billing')} />
)}          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="bg-white border border-white/10 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">How It Works</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              { n: 1, title: 'Set up your identity', body: 'Your logo, colors, and contact info appear on every customer email and your booking form.' },
              { n: 2, title: 'Share your booking link', body: 'Send the link above or print the QR code. Customers tap it, fill out a quick form, and submit a project request.' },
              { n: 3, title: 'Manage in your dashboard', body: 'Every submission lands as a lead. Quote it, schedule it, assign your team, and collect payment — all in one place.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="p-5 flex items-start gap-4">
<div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-blue-200">{n}</div>                <div>
                  <p className="text-sm font-black text-slate-900 leading-tight">{title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
           
           
          </div>
          <a href={`/${company.slug}/dashboard/deleted-leads`} className="flex items-center gap-3 px-5 py-3 border border-red-500/10 bg-red-500/5 rounded-2xl group transition hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
            <span className="text-xs font-black text-red-200 uppercase tracking-widest">Recovery Center</span>
          </a>
        </div>
      </div>

      {/* QR MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
          <div className="relative bg-white rounded-t-[2rem] sm:rounded-[3rem] p-6 sm:p-8 w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className={`p-6 rounded-[2rem] mb-6 flex items-center justify-center transition-colors duration-500 ${qrStyle === 'dark' ? 'bg-slate-900' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="relative">
                <img src={qrCodeUrl} className="w-44 h-44 sm:w-52 sm:h-52" />
                {includeLogo && logoPreview && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-xl p-1 shadow-xl border border-slate-100">
                      <img src={logoPreview} className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                {['standard', 'brand', 'dark'].map(s => (
                  <button key={s} onClick={() => setQrStyle(s as any)}
className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${qrStyle === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}                  >{s}</button>
                ))}
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                
                <span className="text-sm font-bold text-slate-700">Embed Company Logo</span>
<button onClick={() => setIncludeLogo(!includeLogo)} className={`w-10 h-5 rounded-full relative transition-colors ${includeLogo ? 'bg-blue-600' : 'bg-slate-300'}`}>                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeLogo ? 'left-6' : 'left-1'}`} />
                </button>
                
              </div>

              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowQrModal(false)} className="py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition bg-slate-50 rounded-2xl">Cancel</button>
                <button onClick={downloadStyledQR} className="py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg">
                  <Download className="w-4 h-4" /> Export PNG
                </button>
              </div>
         <p className="text-xs text-slate-500 font-medium px-1 mt-2 leading-relaxed">
  <span className="text-blue-600 font-black uppercase tracking-wide">Tip:</span>{' '}
  Pull out your phone, scan it, and test your booking form before sharing.
</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuCard({ icon: Icon, label, desc, color, onClick, locked, requiredPlan }: {
  icon: any; label: string; desc: string; color: string;
  onClick: () => void; locked?: boolean; requiredPlan?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 text-left group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 flex flex-col h-full active:scale-[0.98] border border-white/10 relative overflow-hidden"
    >
      {locked && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full">
          <Lock className="w-2.5 h-2.5 text-slate-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{requiredPlan}</span>
        </div>
      )}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1rem] flex items-center justify-center mb-3 sm:mb-4 transition-all group-hover:scale-110 group-hover:-rotate-3"
        style={{ backgroundColor: locked ? '#f1f5f9' : `${color}15` }}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: locked ? '#94a3b8' : color }} />
      </div>
<p className={`text-xs sm:text-sm font-black leading-tight mb-1.5 ${locked ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-600'} transition-colors`}>        {label}
      </p>
      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-relaxed flex-1">{desc}</p>
<div className={`mt-4 flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 ${locked ? 'text-slate-400' : 'text-blue-500'}`}>        {locked ? `Upgrade to ${requiredPlan}` : 'Configure'} <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  );
}