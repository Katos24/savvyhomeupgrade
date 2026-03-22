'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Workflow, Mail, Grid, FileText, ArrowLeft, Bell, Users, 
  CreditCard, ChevronRight, Trash2, Camera, Copy, Check, 
  Pencil, X, Save, Phone, ExternalLink, Palette, Globe, Download
} from 'lucide-react';
import QRCodeLib from 'qrcode';



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

export default function CompanySettingsClient({ company, currentUser }: { company: any; currentUser: any }) {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
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

  // QR generation
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

  const closeTab = useCallback(() => {
    setActiveTab(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

  if (activeTab) {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 px-4 py-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              onClick={closeTab}
              className="flex items-center gap-1.5 text-indigo-400 font-black text-xs uppercase tracking-widest hover:text-indigo-300 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Settings
            </button>
            <span className="text-white/20">/</span>
            <span className="font-black text-white text-xs uppercase tracking-widest">
              {TAB_LABELS[activeTab]}
            </span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white rounded-[2rem] p-6 shadow-2xl">
            {activeTab === 'form' && <FormTab company={company} currentUser={currentUser} />}
            {activeTab === 'pipeline' && <PipelineTab company={company} currentUser={currentUser} />}
            {activeTab === 'email-templates' && <EmailTemplatesTab company={company} currentUser={currentUser} />}
            {activeTab === 'categories' && <CategoriesTab company={company} currentUser={currentUser} />}
            {activeTab === 'team' && <TeamTab company={company} currentUser={currentUser} />}
            {activeTab === 'billing' && <BillingTab company={company} currentUser={currentUser} />}
            {activeTab === 'notifications' && <NotificationsTab company={company} currentUser={currentUser} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-20 selection:bg-indigo-500/30">
      {/* HEADER - Updated to dark translucent */}
      <header className="bg-slate-900/40 backdrop-blur-md border-b border-white/5 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] italic underline decoration-indigo-500 decoration-2 underline-offset-4 truncate">
            Lead2Project
          </h1>
          <a href={`/${company.slug}/dashboard`} className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-white transition">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 sm:space-y-12">

        {/* IDENTITY HERO - Stays white */}
        <section className="bg-white rounded-3xl sm:rounded-[3rem] shadow-2xl shadow-black/20 overflow-hidden">
          <div className="h-2 sm:h-3 w-full" style={{ background: `linear-gradient(90deg, ${formData.color1}, ${formData.color2})` }} />

          <div className="p-5 sm:p-8 lg:p-12 space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                  {logoPreview
                    ? <img src={logoPreview} className="w-full h-full object-contain p-2" alt="Logo" />
                    : <span className="text-2xl sm:text-3xl font-black text-slate-200">{formData.name.charAt(0)}</span>
                  }
                </div>
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition active:scale-95">
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

              <div className="flex-1 min-w-0">
                {!isEditing
                  ? <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate leading-tight">{formData.name}</h2>
                  : <input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight outline-none border-b-2 border-dashed border-indigo-200 focus:border-indigo-500 w-full bg-transparent leading-tight pb-1"
                      placeholder="Company Name"
                    />
                }
                <div className="mt-1.5 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 w-full max-w-[260px]">
                  <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="text-[10px] font-mono text-slate-500 truncate">{publicLink || 'Loading...'}</span>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 sm:px-5 sm:py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                {isEditing
                  ? <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 transition" />
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 transition font-medium"
                    />
                  : <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50/50 rounded-xl text-sm font-bold text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{formData.phone || 'Not set'}</span>
                    </div>
                }
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Website</label>
                {isEditing
                  ? <input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 transition"
                      placeholder="https://yourwebsite.com"
                    />
                  : <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50/50 rounded-xl text-sm font-bold text-slate-700">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate flex-1">{formData.website || 'Not set'}</span>
                      {formData.website && (
                        <a href={formData.website} target="_blank" className="text-indigo-500 hover:text-indigo-600 shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                }
              </div>

              {isEditing && (
                <div className="sm:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Brand Colors
                  </label>
                  <div className="flex gap-4">
                    <input type="color" value={formData.color1} onChange={e => setFormData({ ...formData, color1: e.target.value })} className="w-14 h-14 rounded-2xl cursor-pointer bg-slate-50 border border-slate-100 p-1 shadow-sm hover:scale-105 transition" />
                    <input type="color" value={formData.color2} onChange={e => setFormData({ ...formData, color2: e.target.value })} className="w-14 h-14 rounded-2xl cursor-pointer bg-slate-50 border border-slate-100 p-1 shadow-sm hover:scale-105 transition" />
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSaveIdentity}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {!isEditing && (
  <div className="grid grid-cols-4 gap-2">
    {/* QR Code */}
    <button
      onClick={() => setShowQrModal(true)}
      className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
    >
      {qrCodeUrl && <img src={qrCodeUrl} className="w-8 h-8" alt="QR" />}
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide">QR Code</span>
    </button>

    {/* Copy */}
    <button
      onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex flex-col items-center justify-center gap-1.5 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition"
    >
      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
      <span className="text-[10px] font-black uppercase tracking-wide">{copied ? 'Copied!' : 'Copy Link'}</span>
    </button>

    {/* View */}
<a
  href={publicLink}
  target="_blank"
  className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all"
>
  <ExternalLink className="w-5 h-5 text-slate-500" />
  <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide">View Form</span>
</a>

    {/* Daily Digest Toggle */}
    <button
      onClick={async () => {
        const newVal = !digestEnabled;
        setDigestEnabled(newVal);
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
      className={`flex flex-col items-center justify-center gap-1.5 p-3 border rounded-2xl transition-all ${
        digestEnabled
          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
          : 'bg-slate-50 border-slate-100 text-slate-400'
      }`}
    >
      <Mail className={`w-5 h-5 ${digestEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
      <span className="text-[10px] font-black uppercase tracking-wide">
        {digestEnabled ? 'Digest On' : 'Digest Off'}
      </span>
    </button>
  </div>
)}
          </div>
        </section>


        {/* MODULE GRID - Updated Section Header */}
        <div>
          <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4 px-1">System Configuration</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <MenuCard icon={Workflow} label="Pipeline" desc="Customize your lead stages so every job moves through a process that makes sense for your business." color="#f59e0b" onClick={() => openTab('pipeline')} />
<MenuCard icon={Grid} label="Categories" desc="Add your service types — each gets its own task checklist and pricing template that auto-loads on new jobs." color="#8b5cf6" onClick={() => openTab('categories')} />
<MenuCard icon={FileText} label="Booking Form" desc="Control what customers fill out when they submit a request. Turn on address, photos, and custom questions." color="#f97316" onClick={() => openTab('form')} />
<MenuCard icon={Mail} label="Automations" desc="Personalize the emails customers receive for quotes, schedules, and payment reminders — all branded to you." color="#3b82f6" onClick={() => openTab('email-templates')} />
<MenuCard icon={Users} label="Team" desc="Invite your crew and assign leads to specific people so nothing falls through the cracks." color="#0ea5e9" onClick={() => openTab('team')} />
<MenuCard icon={CreditCard} label="Billing" desc="Manage your plan and subscription." color="#10b981" onClick={() => openTab('billing')} />
  <MenuCard icon={Bell} label="Notifications" desc="Get a morning digest of jobs, unpaid invoices, stale leads, and follow-ups that need attention." color="#6366f1" onClick={() => openTab('notifications')} />

          </div>
        </div>


        {/* HOW IT WORKS - Stays white but darker border contrast */}
        <section className="bg-white border border-white/10 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">How It Works</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-indigo-200">1</div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-tight">Set up your identity</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Your logo, colors, and contact info appear on every customer email and your booking form.</p>
              </div>
            </div>
            <div className="p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-indigo-200">2</div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-tight">Share your booking link</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Send the link above or print the QR code. Customers tap it, fill out a quick form, and submit a project request.</p>
              </div>
            </div>
            <div className="p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-indigo-200">3</div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-tight">Manage in your dashboard</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Every submission lands as a lead. Quote it, schedule it, assign your team, and collect payment  all in one place.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER - Adapted for Dark BG */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">System Notifications</p>
              <button onClick={() => openTab('notifications')} className="text-xs text-indigo-400 font-bold hover:underline">
                Manage preferences
              </button>
            </div>
          </div>
          <a href={`/${company.slug}/dashboard/deleted-leads`} className="flex items-center gap-3 px-5 py-3 border border-red-500/10 bg-red-500/5 rounded-2xl group transition hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
            <span className="text-xs font-black text-red-200 uppercase tracking-widest">Recovery Center</span>
          </a>
        </div>
      </div>
      
      {/* QR MODAL stays the same visually as it is an overlay */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
          <div className="relative bg-white rounded-t-[2rem] sm:rounded-[3rem] p-6 sm:p-8 w-full sm:max-w-md shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Content... same as before */}
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
                    className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${qrStyle === s ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >{s}</button>
                ))}
              </div>
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-700">Embed Company Logo</span>
                <button onClick={() => setIncludeLogo(!includeLogo)} className={`w-10 h-5 rounded-full relative transition-colors ${includeLogo ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeLogo ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowQrModal(false)} className="py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition bg-slate-50 rounded-2xl">Cancel</button>
                <button onClick={downloadStyledQR} className="py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg">
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

function MenuCard({ icon: Icon, label, desc, color, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 text-left group hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col h-full active:scale-[0.98] border border-white/10"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1rem] flex items-center justify-center mb-3 sm:mb-4 transition-all group-hover:scale-110 group-hover:-rotate-3" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
      </div>
      <p className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1.5">{label}</p>
      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-relaxed flex-1">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
        Configure <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  );
}