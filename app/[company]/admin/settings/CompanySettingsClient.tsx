'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Workflow, Mail, ArrowLeft, Users,
  CreditCard, ChevronRight, Trash2, Camera, Copy, Check,
  Pencil, X, Save, Phone, ExternalLink, Palette, Globe, Download,
  Lock,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { can, FEATURE_PLAN_MAP, PLAN_CONFIG, UPGRADE_PROMPTS, type PlanTier } from '@/lib/permissions';
import Link from 'next/link';
import PipelineTab from './tabs/PipelineTab';
import EmailTemplatesTab from './tabs/EmailTemplatesTab';
import TeamTab from './tabs/TeamTab';
import BillingTab from './tabs/BillingTab';

type Tab = 'pipeline' | 'email-templates' | 'team' | 'billing' | 'notifications';

const TAB_LABELS: Record<Tab, string> = {
  pipeline: 'Pipeline',
  'email-templates': 'Automations',
  team: 'Team Access',
  billing: 'Subscription Billing',
  notifications: 'Notifications',
};

const TAB_FEATURE_MAP: Partial<Record<Tab, Parameters<typeof can>[1]>> = {
  pipeline:          'settings_pipeline',
  'email-templates': 'settings_email_templates',
  team:              'settings_team',
  notifications:     'settings_notifications',
};





function UpgradeOverlay({ feature, companySlug }: { feature: string; companySlug: string }) {
  const prompt = UPGRADE_PROMPTS[feature];
  const requiredPlan = (FEATURE_PLAN_MAP as any)[feature] as PlanTier | undefined;
  const planKey = requiredPlan === 'pro' ? 'pro' : 'basic';
  const config = PLAN_CONFIG[planKey];

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-8 text-center">
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-base font-semibold text-blue-900 mb-2">{prompt?.title ?? 'Upgrade to unlock'}</h3>
      {prompt?.description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">{prompt.description}</p>
      )}
      {config?.features && (
        <ul className="text-left space-y-2 mb-6 max-w-xs mx-auto">
          {config.features.slice(0, 4).map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-green-500">✓</span> {f}
            </li>
          ))}
        </ul>
   )}
<a
  href={`/${companySlug}/admin/settings`}
  onClick={e => {
    e.preventDefault()
    window.location.href = `/${companySlug}/admin/settings`
  }}
  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
>
  Upgrade to {config.label}
  {config?.price && (
    <span className="opacity-75 font-normal">— ${config.price}/mo</span>
  )}
</a>

<p className="text-xs text-gray-400 mt-3">
  Cancel anytime. No contracts.
</p>

    </div>
  );
}

function InfoCard({
  icon, label, value, accent, children, colSpan,
}: {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  accent?: string;
  children?: React.ReactNode;
  colSpan?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${colSpan ? 'sm:col-span-2' : ''}`}
      style={{ borderColor: accent ? `${accent}30` : '#f1f5f9', background: accent ? `${accent}08` : '#fafafa' }}
    >
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-1.5">
        {icon}
        <span className="text-[11px] font-medium text-gray-500">{label}</span>
      </div>
      {children ?? (
        <div className="px-4 pb-3.5 pt-0.5 text-sm font-medium text-gray-800 truncate">
          {value ?? <span className="text-gray-400 font-normal">Not set</span>}
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
      className="bg-white rounded-xl p-4 sm:p-5 text-left group hover:shadow-md transition-all duration-200 flex flex-col h-full active:scale-[0.98] border border-gray-100 relative overflow-hidden"
    >
      {locked && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
          <Lock className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">{requiredPlan}</span>
        </div>
      )}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all"
        style={{ backgroundColor: locked ? '#f1f5f9' : `${color}15` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: locked ? '#94a3b8' : color }} />
      </div>
      <p className={`text-sm font-semibold leading-tight mb-1 ${locked ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>
        {label}
      </p>
      <p className="text-[12px] text-gray-400 leading-relaxed flex-1 hidden sm:block">{desc}</p>
      <div className={`mt-3 flex items-center gap-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-all ${locked ? 'text-gray-400' : 'text-blue-500'}`}>
        {locked ? `Upgrade to ${requiredPlan}` : 'Configure'} <ChevronRight className="w-3 h-3" />
      </div>
    </button>
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
const [bccEnabled, setBccEnabled] = useState(company.bcc_sender_on_email ?? false);
const [bccSaving, setBccSaving] = useState(false);

useEffect(() => {
  setBccEnabled(companyData.bcc_sender_on_email ?? false);
}, [companyData.bcc_sender_on_email]);
 

 const [formData, setFormData] = useState({
    name: company.name || '',
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    color1: company.email_brand_color_1 || '#0B3C6D',
    color2: company.email_brand_color_2 || '#1F5F8F',
  });
  const [logoPreview, setLogoPreview] = useState(company.logo_url ? `${company.logo_url}?v=${company.updated_at || Date.now()}` : '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [publicLink, setPublicLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setPublicLink(`${window.location.origin}/${company.slug}`);
  }, [company.slug]);



  const openTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeTab = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`);
      const data = await res.json();
      if (data.success && data.company) setCompanyData(data.company);
    } catch {}
    setActiveTab(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [company.slug]);



 const handleSaveIdentity = async () => {
  setLoading(true);
  try {
    let finalLogoUrl = companyData.logo_url;

      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        fd.append('companySlug', company.slug);
        const uploadRes = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.success || !uploadData.logoUrl) {
          console.error('Logo upload failed:', uploadData);
          setLoading(false);
          return;
        }

        finalLogoUrl = uploadData.logoUrl;
      }

      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-general',
          data: {
            ...formData,
            logo_url: finalLogoUrl,
            email_brand_color_1: formData.color1,
            email_brand_color_2: formData.color2,
          },
        }),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        // Cache-bust so the browser doesn't serve the old cached image at the same URL
        const bustedUrl = finalLogoUrl ? `${finalLogoUrl}?v=${Date.now()}` : '';
        setLogoPreview(bustedUrl);
        setLogoFile(null);
        setIsEditing(false);
      } else {
        console.error('Settings save failed:', resData);
      }
    } catch (err) {
      console.error('handleSaveIdentity error:', err);
    } finally {
      setLoading(false);
    }
  };

const handleToggleBcc = async () => {
  const newVal = !bccEnabled;
  setBccEnabled(newVal);
  setBccSaving(true);
  try {
    const res = await fetch(`/api/company/${company.slug}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update-general',
        data: {
          ...formData,
          email_brand_color_1: formData.color1,
          email_brand_color_2: formData.color2,
          bcc_sender_on_email: newVal,
        },
      }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error(result.error || 'Save failed');
  } catch (err) {
    console.error('Failed to update BCC setting:', err);
    setBccEnabled(!newVal);
  } finally {
    setBccSaving(false);
  }
};

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,10)}`;
  };

  const renderUnlockedTab = (tab: Tab, data: any) => {
    switch (tab) {
      case 'pipeline':        return <PipelineTab company={data} currentUser={currentUser} />;
      case 'email-templates': return <EmailTemplatesTab company={data} currentUser={currentUser} />;
      case 'team':            return <TeamTab company={data} currentUser={currentUser} />;
      case 'billing':         return <BillingTab company={data} currentUser={currentUser} />;
      default:                return null;
    }
  };

  const getSampleData = (tab: Tab) => {
    switch (tab) {
      case 'pipeline': return { status_options: [{ value: 'new', label: 'New', color: 'blue' }, { value: 'quoted', label: 'Quoted', color: 'purple' }, { value: 'scheduled', label: 'Scheduled', color: 'blue' }, { value: 'completed', label: 'Completed', color: 'green' }] };
      default: return {};
    }
  };

  const renderTabContent = (tab: Tab) => {
    const featureKey = TAB_FEATURE_MAP[tab];
    if (featureKey && !can(planTier, featureKey)) {
      const sampleData = { ...companyData, ...getSampleData(tab) };
      return (
        <div className="relative">
          <div className="blur-[3px] pointer-events-none select-none opacity-60" aria-hidden>{renderUnlockedTab(tab, sampleData)}</div>
          <div className="absolute inset-0 flex items-start justify-center pt-24 z-10">
            <UpgradeOverlay feature={featureKey} companySlug={company.slug} />
          </div>
        </div>
      );
    }
    return renderUnlockedTab(tab, companyData);
  };

  // ── Tab view ─────────────────────────────────────────────────
 if (activeTab) {
return (
<div className="min-h-screen bg-[#0B0E14]">
    <header className="border-b border-white/[0.06] px-4 py-3.5 sticky top-0 z-50 bg-[#0B0E14]">
 <div className="max-w-4xl mx-auto flex items-center gap-3 min-w-0">
  <Link href={`/${company.slug}/home`} className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-white transition-colors shrink-0">
    <ArrowLeft className="w-3.5 h-3.5" /> Home
  </Link>
  <span className="text-white/20 shrink-0">/</span>
  <button onClick={closeTab} className="text-[12.5px] text-slate-400 hover:text-white transition-colors shrink-0">
    Settings
  </button>
  <span className="text-white/20 shrink-0">/</span>
  <span className="text-[12.5px] font-medium text-white truncate">{TAB_LABELS[activeTab]}</span>
</div>
</header>
        <div className="max-w-5xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white rounded-2xl p-4 shadow-2xl">{renderTabContent(activeTab)}</div>
        </div>
      </div>
    );
  }

  // ── Main settings view ────────────────────────────────────────
  return (
<div className="min-h-screen bg-[#0B0E14] pb-20">
       <header className="border-b border-white/[0.06] px-4 py-3.5 sticky top-0 z-40 bg-[#0B0E14]">
 <div className="max-w-4xl mx-auto flex items-center gap-3 min-w-0">
  <Link href={`/${company.slug}/home`} className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-white transition-colors shrink-0">
    <ArrowLeft className="w-3.5 h-3.5" /> Home
  </Link>
  <span className="text-white/20 shrink-0">/</span>
  <span className="text-[12.5px] font-medium text-white truncate">Settings</span>
</div>
</header>

     <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">

       

        {/* ── IDENTITY CARD ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${formData.color1}, ${formData.color2})` }} />

          <div className="p-4 sm:p-7 space-y-5">

            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {logoPreview
                    ? <img src={logoPreview} className="w-full h-full object-contain p-1.5" alt="Logo" />
                    : <span className="text-lg sm:text-xl font-semibold text-gray-300">{formData.name.charAt(0)}</span>
                  }
                </div>
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                    <Camera className="w-3 h-3" />
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 4 * 1024 * 1024) {
                          alert('Logo must be under 4MB. Tip: compress your image at tinypng.com first.');
                          return;
                        }
                        setLogoFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setLogoPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {!isEditing
                  ? <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{formData.name}</h2>
                  : <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="text-base sm:text-lg font-semibold text-gray-900 outline-none border-b-2 border-dashed border-blue-200 focus:border-blue-500 w-full bg-transparent pb-1" placeholder="Company Name" />
                }
                <span className={`mt-1.5 inline-block text-[10.5px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full text-white ${planTier === 'pro' ? 'bg-blue-600' : planTier === 'basic' ? 'bg-gray-700' : 'bg-emerald-600'}`}>
                  {planTier} plan
                </span>
              </div>

              {!isEditing && (
                <button onClick={() => setIsEditing(true)}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition">
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
            </div>

            {/* ── INFO GRID ── */}
     {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Company email', key: 'email', type: 'email', placeholder: 'hello@yourcompany.com', icon: <Mail className="w-3.5 h-3.5 text-blue-500" /> },
                  { label: 'Business phone', key: 'phone', type: 'tel', placeholder: '(555) 555-5555', icon: <Phone className="w-3.5 h-3.5 text-emerald-500" /> },
                  { label: 'Company website', key: 'website', type: 'text', placeholder: 'https://yourwebsite.com', icon: <Globe className="w-3.5 h-3.5 text-violet-500" /> },
                ].map(field => (
                  <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50/60 focus-within:bg-white focus-within:border-gray-200 focus-within:shadow-sm overflow-hidden transition-all duration-200">
                    <div className="flex items-center gap-2 px-3.5 sm:px-4 pt-3 pb-1">
                      {field.icon}
                      <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">{field.label}</span>
                    </div>
                    <input
                      type={field.type}
                      value={(formData as any)[field.key]}
                      placeholder={field.placeholder}
                      onChange={e => {
                        if (field.key === 'phone') {
                          const d = e.target.value.replace(/\D/g, '');
                          if (d.length <= 10) setFormData({ ...formData, phone: formatPhone(d) });
                        } else {
                          setFormData({ ...formData, [field.key]: e.target.value });
                        }
                      }}
                      className="w-full bg-transparent px-3.5 sm:px-4 pb-3 pt-1 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>
                ))}

                <div className="rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 sm:px-4 pt-3 pb-1">
                    <Palette className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">Brand colors</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 sm:px-4 pb-3 pt-1.5">
                    <input type="color" value={formData.color1} onChange={e => setFormData({ ...formData, color1: e.target.value })} className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                    <input type="color" value={formData.color2} onChange={e => setFormData({ ...formData, color2: e.target.value })} className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">

                <div className="rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 p-3.5 sm:p-4 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">Email</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {formData.email || <span className="text-gray-400 font-normal">Not set</span>}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 p-3.5 sm:p-4 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">Phone</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {formData.phone ? formatPhone(formData.phone) : <span className="text-gray-400 font-normal">Not set</span>}
</p>
</div>

<a
  href={formData.website || undefined}
  target="_blank"
  rel="noopener noreferrer"
  onClick={e => {
    if (!formData.website) e.preventDefault()
  }}
  className={`group rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 sm:p-4 flex flex-col gap-1.5 min-w-0 transition-all duration-200 ${
    formData.website
      ? 'hover:bg-white hover:border-violet-200 hover:shadow-sm cursor-pointer'
      : 'cursor-default'
  }`}
>

  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0">
      <Globe className="w-3.5 h-3.5 text-violet-500 shrink-0" />
      <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">
        Website
      </span>
    </div>
    {formData.website && (
      <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-violet-500 transition-colors shrink-0" />
    )}
  </div>

  <p className="text-sm font-semibold text-gray-900 truncate">
    {formData.website
      ? formData.website.replace(/^https?:\/\//, '')
      : <span className="text-gray-400 font-normal">Not set</span>}
  </p>
</a>


                <div className="rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 p-3.5 sm:p-4 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">Brand colors</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-6 h-6 rounded-md border border-gray-200 shrink-0" style={{ background: formData.color1 }} />
                    <div className="w-6 h-6 rounded-md border border-gray-200 shrink-0" style={{ background: formData.color2 }} />
                  </div>

                
 </div>




              </div>
            )}

            {isEditing && (
              <div className="flex gap-3 pt-1">
                <button onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSaveIdentity} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition active:scale-[0.98]">
                  <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}

            {/* Booking link */}
            <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: formData.color1 }}>
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-500 mb-0.5">Customer booking link</p>
                <p className="text-sm font-mono font-medium text-gray-700 truncate">
                  lead2project.com/<span style={{ color: formData.color1 }}>{publicLink?.split('/').pop() || 'your-company'}</span>
                </p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
                style={{ background: copied ? '#dcfce7' : '#eff6ff', color: copied ? '#16a34a' : formData.color1 }}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Quick actions */}
         {!isEditing && (
              <div>
                {planTier === 'free' ? (
                  <a href={`/${company.slug}/admin/settings`} onClick={e => { e.preventDefault(); openTab('billing'); }}
                    className="group flex items-center justify-center gap-2 p-3.5 rounded-xl transition-all active:scale-95 bg-gray-900 hover:bg-gray-800">
                    <CreditCard className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">Upgrade</span>
                    <span className="text-xs text-white/60">From $49.99/mo</span>
                  </a>
                ) : (
                  <button onClick={() => openTab('billing')}
                    className="group flex items-center justify-center gap-2 p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all active:scale-95 w-full">
                    <CreditCard className="w-4 h-4 text-gray-500 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-sm font-medium text-gray-600">Billing</span>
                  </button>
                )}
              </div>
            )}

            {/* Automations */}
            {!isEditing && (
              <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                {planTier !== 'free' && (
                  can(planTier, 'daily_digest') ? (
                    <button onClick={() => setShowDigestConfirm(true)}
                      className="w-full flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-gray-50/60 hover:bg-white transition-colors text-left">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mail className={`w-4 h-4 shrink-0 ${digestEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700">Daily digest</p>
                          <p className="text-[11px] text-gray-400">6AM summary of leads, jobs, and payments</p>
                        </div>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${digestEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${digestEnabled ? 'left-5' : 'left-0.5'}`} />
                      </div>
                    </button>
                  ) : (
                    <button onClick={() => openTab('billing')}
                      className="group w-full flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-gray-50/60 hover:bg-blue-50/40 transition-colors text-left">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mail className="w-4 h-4 shrink-0 text-gray-300 group-hover:text-blue-400 transition-colors" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">Daily digest</p>
                          <p className="text-[11px] text-gray-400">6AM summary of leads, jobs, and payments</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-400 bg-blue-50 px-2 py-1 rounded-full shrink-0">Pro</span>
                    </button>
                  )
                )}

                <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-gray-50/60 hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className={`w-4 h-4 shrink-0 ${bccEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700">BCC me on customer emails</p>
                      <p className="text-[11px] text-gray-400">Get a copy when a quote or schedule email sends</p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleBcc}
                    disabled={bccSaving}
                    className={`w-10 h-5 rounded-full relative transition-colors shrink-0 disabled:opacity-50 ${bccEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${bccEnabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

     {/* ── SYSTEM CONFIGURATION ── */}
        <div>
          <p className="text-[11px] font-medium text-white/40 mb-3 px-1">System configuration</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MenuCard icon={Workflow} label="Pipeline" desc="Customize your lead stages so every job moves through a process that makes sense for your business." color="#f59e0b" onClick={() => openTab('pipeline')} locked={!can(planTier, 'settings_pipeline')} requiredPlan="Basic" />
            <MenuCard icon={Mail} label="Email Templates" desc="Personalize the emails customers receive — all branded to you." color="#3b82f6" onClick={() => openTab('email-templates')} locked={!can(planTier, 'settings_email_templates')} requiredPlan="Pro" />
            <MenuCard icon={Users} label="Team" desc="Invite your crew and assign leads to specific people." color="#0ea5e9" onClick={() => openTab('team')} locked={!can(planTier, 'settings_team')} requiredPlan="Basic" />
          </div>
        </div>

        {/* ── BILLING & PAYMENTS ── */}
        <div>
          <p className="text-[11px] font-medium text-white/40 mb-3 px-1">Billing & payments</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {planTier !== 'free' && (
              <MenuCard icon={CreditCard} label="Subscription Billing" desc="Manage your plan and subscription." color="#10b981" onClick={() => openTab('billing')} />
            )}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <p className="text-[11px] font-medium text-gray-400">How it works</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { n: 1, title: 'Set up your identity', body: 'Your logo, colors, and contact info appear on every customer email and your booking form.' },
              { n: 2, title: 'Share your booking link', body: 'Send the link or print the QR code. Customers tap it, fill out a quick form, and submit a request.' },
              { n: 3, title: 'Manage in your dashboard', body: 'Every submission lands as a lead. Quote it, schedule it, assign your team, and collect payment.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="p-5 flex items-start gap-4">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">{n}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed hidden sm:block">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="flex justify-end">
          <a href={`/${company.slug}/dashboard/deleted-leads`}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-500/10 bg-red-500/5 rounded-xl group transition hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-300">Recovery center</span>
          </a>
        </div>
      </div>

      {/* ── Digest confirm modal ── */}
      {showDigestConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowDigestConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{digestEnabled ? 'Turn off daily digest?' : 'Turn on daily digest?'}</h3>
            <p className="text-xs text-gray-500 mb-6">
              {digestEnabled ? 'You will stop receiving the 6AM daily summary email.' : 'You will receive a 6AM daily summary of your leads, jobs, and payments.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDigestConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={async () => {
                const newVal = !digestEnabled;
                setDigestEnabled(newVal);
                setShowDigestConfirm(false);
                await fetch(`/api/company/${company.slug}/settings`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update-notifications', data: { reminder_settings: company.reminder_settings, notification_preferences: { ...(company.notification_preferences || {}), daily_digest: { enabled: newVal }, digest_recipient: 'company' } } }),
                });
              }} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition ${digestEnabled ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {digestEnabled ? 'Turn off' : 'Turn on'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}