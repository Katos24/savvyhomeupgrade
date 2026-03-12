'use client';

import { useState, useEffect } from 'react';
import { 
  Workflow, Mail, Grid, FileText, ArrowLeft, Bell, Users, 
  CreditCard, ChevronRight, Trash2, Camera, QrCode, Copy, Check, 
  Pencil, X, Save, Phone, ExternalLink, Palette, Link2, Globe, Download
} from 'lucide-react';
import QRCodeLib from 'qrcode';

// --- Sub-tab Component Imports ---
import FormTab from './tabs/FormTab';
import PipelineTab from './tabs/PipelineTab';
import EmailTemplatesTab from './tabs/EmailTemplatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import TeamTab from './tabs/TeamTab';
import BillingTab from './tabs/BillingTab';
import QuoteTemplatesTab from './tabs/QuoteTemplatesTab';
import NotificationsTab from './tabs/NotificationsTab';

type Tab = 'form' | 'pipeline' | 'email-templates' | 'categories' | 'quote-templates' | 'team' | 'billing' | 'notifications';

export default function CompanySettingsClient({ company, currentUser }: { company: any; currentUser: any }) {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // --- QR Designer States ---
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStyle, setQrStyle] = useState<'standard' | 'brand' | 'dark'>('standard');
  const [includeLogo, setIncludeLogo] = useState(true);

  // --- Identity Form State ---
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

  // --- QR Generation Engine ---
  useEffect(() => {
    const generateQR = async () => {
      let darkColor = '#0F172A'; 
      let lightColor = '#FFFFFF';

      if (qrStyle === 'brand') darkColor = formData.color1;
      if (qrStyle === 'dark') { 
        darkColor = '#FFFFFF'; 
        lightColor = '#0F172A'; 
      }

      try {
        const url = await QRCodeLib.toDataURL(publicLink, {
          width: 1000,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: darkColor, light: lightColor }
        });
        setQrCodeUrl(url);
      } catch (err) { 
        console.error('QR Generation failed:', err); 
      }
    };
    generateQR();
  }, [publicLink, qrStyle, formData.color1]);

  useEffect(() => {
  if (typeof window !== 'undefined') {
    setPublicLink(`${window.location.origin}/${company.slug}`);
  }
}, [company.slug]);


  // --- QR Download Handler ---
  const downloadStyledQR = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      canvas.width = qrImg.width; 
      canvas.height = qrImg.height;
      ctx?.drawImage(qrImg, 0, 0);
      
      if (includeLogo && logoPreview) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = logoPreview;
        logoImg.onload = () => {
          const logoSize = canvas.width * 0.18;
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;
          
          ctx!.fillStyle = 'white';
          ctx?.beginPath();
          // @ts-ignore
          if (ctx?.roundRect) {
            ctx.roundRect(x - 10, y - 10, logoSize + 20, logoSize + 20, 15);
          } else {
            ctx?.rect(x - 10, y - 10, logoSize + 20, logoSize + 20);
          }
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
          data: { 
            ...formData, 
            logo_url: finalLogoUrl, 
            email_brand_color_1: formData.color1, 
            email_brand_color_2: formData.color2 
          } 
        }),
      });

      if (res.ok) window.location.reload();
    } catch (err) { 
      console.error('Save failed:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
  };

  // ── VIEW RENDERER: SUB-TABS ──
  if (activeTab) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button 
              onClick={() => setActiveTab(null)} 
              className="flex items-center gap-1.5 text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Settings
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-black text-slate-900 text-xs uppercase tracking-widest italic">
              {activeTab.replace('-', ' ')}
            </span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeTab === 'form' && <FormTab company={company} currentUser={currentUser} />}
            {activeTab === 'pipeline' && <PipelineTab company={company} currentUser={currentUser} />}
            {activeTab === 'email-templates' && <EmailTemplatesTab company={company} currentUser={currentUser} />}
            {activeTab === 'categories' && <CategoriesTab company={company} currentUser={currentUser} />}
            {activeTab === 'quote-templates' && <QuoteTemplatesTab company={company} currentUser={currentUser} />}
            {activeTab === 'team' && <TeamTab company={company} currentUser={currentUser} />}
            {activeTab === 'billing' && <BillingTab company={company} currentUser={currentUser} />}
            {activeTab === 'notifications' && <NotificationsTab company={company} currentUser={currentUser} />}
        </div>
      </div>
    );
  }

  // ── VIEW RENDERER: MAIN SETTINGS (IDENTITY HERO) ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
<h1 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-[0.15em] sm:tracking-[0.2em] italic underline decoration-indigo-500 decoration-2 underline-offset-4 truncate">
  Lead2Project
</h1>
          <a href={`/${company.slug}/dashboard`} className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-indigo-600 transition">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        
        {/* ── GIANT IDENTITY HERO ── */}
        <section className="bg-white border border-slate-200 rounded-[3rem] shadow-xl shadow-indigo-100/50 overflow-hidden relative">
          {/* Dynamic Top Bar */}
          <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${formData.color1}, ${formData.color2})` }} />

          <div className="p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Branding Visuals */}
              <div className="flex flex-row lg:flex-col gap-6 flex-shrink-0">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center shadow-inner overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} className="w-full h-full object-contain p-4" />
                    ) : (
                      <span className="text-4xl font-black text-slate-200">{formData.name.charAt(0)}</span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition active:scale-95">
                      <Camera className="w-5 h-5" />
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

                {/* QR Code Trigger */}
                <button 
                  onClick={() => setShowQrModal(true)} 
                  className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-[2.5rem] border border-slate-100 p-4 shadow-sm flex flex-col items-center justify-center group/qr relative hover:border-indigo-400 hover:shadow-md transition-all duration-300"
                >
{qrCodeUrl && (
  <img
    src={qrCodeUrl}
    className="w-full h-full opacity-90 group-hover/qr:scale-110 transition duration-500"
  />
)}
                  <div className="absolute -bottom-2 bg-slate-900 text-[8px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest opacity-0 group-hover/qr:opacity-100 transition-opacity whitespace-nowrap">
                    Download QR
                  </div>
                </button>
              </div>

              {/* Data Fields */}
              <div className="flex-1 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 w-full max-w-md">
                    {!isEditing ? (
                      <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight break-words">
                        {formData.name}
                      </h2>
                    ) : (
                      <input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="text-4xl font-black text-slate-900 tracking-tight outline-none border-b-2 border-dashed border-indigo-200 focus:border-indigo-500 w-full bg-transparent" 
                        placeholder="Company Name" 
                      />
                    )}
                    
                  <div className="group flex items-center gap-2 text-slate-400 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
  <Globe className="w-3 h-3 text-indigo-500" />
  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Customer Form:</span>
<span className="text-[10px] sm:text-xs font-mono text-slate-900 break-all">
  {publicLink || 'Loading...'}
</span>

</div>
                  </div>
                  
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg">
                      <Pencil className="w-4 h-4" /> Edit Profile
                    </button>
                  ) : (
<div className="flex flex-wrap gap-2">
                      <button onClick={() => setIsEditing(false)} className="p-3 text-slate-400 hover:text-slate-600 transition"><X /></button>
                      <button onClick={handleSaveIdentity} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition">
                        <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Sync Changes'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                    {isEditing ? (
                      <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/10 outline-none" />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 rounded-xl text-sm font-bold text-slate-700">
                        <Mail className="w-4 h-4 text-slate-400" /> {formData.email}
                      </div>
                    )}
                  </div>

                {/* Phone Field with Masking */}
<div className="space-y-1.5">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Phone</label>
  {isEditing ? (
    <input 
      type="text"
      value={formData.phone} 
      placeholder="(555) 555-5555"
      onChange={e => {
        const input = e.target.value.replace(/\D/g, ''); // Strip non-digits
        if (input.length <= 10) { // Lock at 10 digits
          setFormData({...formData, phone: formatPhone(input)});
        }
      }} 
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 transition-all font-medium" 
    />
  ) : (
    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 rounded-xl text-sm font-bold text-slate-700">
      <Phone className="w-4 h-4 text-slate-400" /> {formData.phone || 'Not set'}
    </div>
  )}
</div>

     {/* Website & Brand Status */}
<div className="md:col-span-2 space-y-1.5">
  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Website</label>
  <div className="flex flex-wrap items-center gap-3">
    {isEditing ? (
      <input 
        value={formData.website} 
        onChange={e => setFormData({...formData, website: e.target.value})} 
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/10 transition-all" 
        placeholder="https://yourwebsite.com" 
      />
    ) : (
      <>
        {/* Constrained Website Bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 rounded-xl text-sm font-bold text-slate-700 border border-transparent max-w-[300px] truncate">
          <Globe className="w-4 h-4 text-slate-400 shrink-0" /> 
          <span className="truncate">{formData.website || 'No website added'}</span>
        </div>
        
        {/* Compact Brand Status */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 pl-3 pr-2 py-2 rounded-xl shadow-sm self-stretch">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brand Kit</span>
          <div className="flex -space-x-1.5 ml-1">
            <div 
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" 
              style={{ backgroundColor: formData.color1 }} 
            />
            <div 
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" 
              style={{ backgroundColor: formData.color2 }} 
            />
          </div>
        </div>
      </>
    )}
  </div>
</div>

                  {/* Brand Color Boxes */}
                  {isEditing && (
                    <div className="md:col-span-2 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Palette className="w-3 h-3" /> Brand Identity Colors
                      </label>
                      <div className="flex gap-4">
                        <input type="color" value={formData.color1} onChange={e => setFormData({...formData, color1: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer bg-slate-50 border border-slate-100 p-1 shadow-sm hover:scale-105 transition" />
                        <input type="color" value={formData.color2} onChange={e => setFormData({...formData, color2: e.target.value})} className="w-16 h-16 rounded-2xl cursor-pointer bg-slate-50 border border-slate-100 p-1 shadow-sm hover:scale-105 transition" />
                      </div>
                    </div>
                  )}
                </div>

                

                {!isEditing && (
<div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button 
  onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
>
  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} 
  {copied ? 'Link Copied!' : 'Copy Sharing Link'}
</button>
                    <a href={publicLink} target="_blank" className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-5 py-2.5 rounded-xl hover:bg-slate-100 transition border border-slate-100">
                      <ExternalLink className="w-4 h-4" /> View Portal
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── MODULE DIRECTORY (MENU CARDS) ── */}
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">System Configuration</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <MenuCard icon={Workflow} label="Pipeline" desc="Stages & Statuses" color="#f59e0b" onClick={() => setActiveTab('pipeline')} />
             <MenuCard icon={Grid} label="Categories" desc="Job Types & Tasks" color="#8b5cf6" onClick={() => setActiveTab('categories')} />
             <MenuCard icon={FileText} label="Booking Form" desc="Customer Intake" color="#f97316" onClick={() => setActiveTab('form')} />
             <MenuCard icon={Mail} label="Automations" desc="Email Templates" color="#3b82f6" onClick={() => setActiveTab('email-templates')} />
             <MenuCard icon={Users} label="Team Access" desc="Staff Permissions" color="#0ea5e9" onClick={() => setActiveTab('team')} />
             <MenuCard icon={CreditCard} label="Billing" desc="Plan & Subscription" color="#10b981" onClick={() => setActiveTab('billing')} />
          </div>
        </div>

        {/* ── QR DESIGNER MODAL ── */}
        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
<div className="relative bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <div className={`p-8 rounded-[2rem] mb-8 flex items-center justify-center transition-colors duration-500 ${qrStyle === 'dark' ? 'bg-slate-900' : 'bg-slate-50 border border-slate-100'}`}>
                <div className="relative group">
<img 
  src={qrCodeUrl} 
  className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 transition-transform duration-500 group-hover:scale-105" 
/>
                  {includeLogo && logoPreview && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white rounded-2xl p-1 shadow-xl border border-slate-100">
                        <img src={logoPreview} className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">QR Style Selection</label>
                  <div className="flex gap-2">
                    {['standard', 'brand', 'dark'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setQrStyle(s as any)} 
                        className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${qrStyle === s ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                      >
                        {s}
                      </button>
                    ))}
                    
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-center mt-2 px-2">
  Print on invoices <br/> or business cards
</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Embed Company Logo</span>
                  <button 
                    onClick={() => setIncludeLogo(!includeLogo)} 
                    className={`w-10 h-5 rounded-full relative transition-colors ${includeLogo ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeLogo ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowQrModal(false)} className="py-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition">Cancel</button>
                  <button 
                    onClick={downloadStyledQR} 
                    className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" /> Export PNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ACTIONS ── */}
<div className="pt-10 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 tracking-tight">System Notifications</p>
                <button onClick={() => setActiveTab('notifications')} className="text-xs text-indigo-600 font-bold hover:underline">Manage notification preferences</button>
              </div>
           </div>
           <a 
             href={`/${company.slug}/dashboard/deleted-leads`} 
             className="flex items-center gap-3 px-6 py-4 border border-red-100 bg-red-50/20 rounded-2xl group transition hover:bg-red-50"
           >
              <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600" />
              <span className="text-xs font-black text-red-800 uppercase tracking-widest">Recovery Center</span>
           </a>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENT: MENU CARD ──
function MenuCard({ icon: Icon, label, desc, color, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 text-left group hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 relative overflow-hidden flex flex-col h-full"
    >
      <div 
        className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:-rotate-3" 
        style={{ backgroundColor: `${color}10` }}
      >
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <p className="text-sm font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{label}</p>
      <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">{desc}</p>
      <div className="mt-auto pt-8 flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        Launch Module <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  );
}