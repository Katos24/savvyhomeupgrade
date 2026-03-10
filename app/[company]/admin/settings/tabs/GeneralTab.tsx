'use client';

import { useState, useEffect } from 'react';
import { 
  Building, Mail, Phone, Link2, Globe, Check, Copy, Download, 
  QrCode, Palette, Pencil, X, Loader2, ExternalLink, Camera, Save
} from 'lucide-react';
import QRCodeLib from 'qrcode';

// ── COMPONENT: FIELD ──
function Field({ label, icon, children, isEditing }: { label: string; icon: React.ReactNode; children: React.ReactNode; isEditing?: boolean }) {
  return (
    <div className={`transition-all duration-300 ${isEditing ? 'translate-x-1' : ''}`}>
      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
        <span className="p-1 bg-slate-50 rounded-md text-slate-400">{icon}</span>
        {label}
      </label>
      <div className="relative group">{children}</div>
    </div>
  );
}

export default function GeneralTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [publicLink, setPublicLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: company.name || '',
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    business_type: company.business_type || 'general',
    email_brand_color_1: company.email_brand_color_1 || '#667eea',
    email_brand_color_2: company.email_brand_color_2 || '#764ba2',
  });
  const [savedData, setSavedData] = useState({ ...formData });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  useEffect(() => {
    const link = `${window.location.origin}/${company.slug}`;
    setPublicLink(link);
    QRCodeLib.toDataURL(link, { width: 600, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } })
      .then(url => setQrCodeUrl(url));
  }, [company.slug]);

  const colorPresets = [
    { name: 'Modern Indigo', color1: '#6366f1', color2: '#4f46e5' },
    { name: 'Sky Blue', color1: '#0ea5e9', color2: '#2563eb' },
    { name: 'Emerald', color1: '#10b981', color2: '#059669' },
    { name: 'Sunset', color1: '#f59e0b', color2: '#d97706' },
    { name: 'Rose', color1: '#f43f5e', color2: '#e11d48' },
    { name: 'Slate', color1: '#475569', color2: '#1e293b' },
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      let logoUrl = company.logo_url;
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        fd.append('companySlug', company.slug);
        const uploadRes = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.success) logoUrl = uploadData.logoUrl;
      }
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-general', data: { ...formData, logo_url: logoUrl } }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Changes synced successfully.');
        setSavedData({ ...formData });
        setIsEditing(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      setError('System sync failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── HEADER ACTION ── */}
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-sm font-bold text-slate-900">General Information</h3>
            <p className="text-xs text-slate-500">Manage your business identity and branding</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition">Cancel</button>
            <button onClick={() => setShowConfirm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Save Changes</button>
          </div>
        )}
      </div>

      {/* ── LOGO SECTION ── */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                        <span className="text-3xl font-black text-slate-200">{formData.name.charAt(0)}</span>
                    )}
                </div>
                {isEditing && (
                    <label className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4 text-indigo-600" />
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                )}
            </div>
            <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-slate-900 mb-1">Company Brand Mark</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm">This logo appears on your public booking page, quotes, and all automated customer emails.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <Field label="Business Name" icon={<Building className="w-3" />} isEditing={isEditing}>
                {isEditing ? (
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" />
                ) : (
                    <p className="text-sm font-bold text-slate-800">{formData.name}</p>
                )}
            </Field>

            <Field label="Support Email" icon={<Mail className="w-3" />} isEditing={isEditing}>
                {isEditing ? (
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" />
                ) : (
                    <p className="text-sm font-bold text-slate-800">{formData.email}</p>
                )}
            </Field>

            <Field label="Phone" icon={<Phone className="w-3" />} isEditing={isEditing}>
                {isEditing ? (
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" />
                ) : (
                    <p className="text-sm font-bold text-slate-800">{formData.phone}</p>
                )}
            </Field>

            <Field label="Website" icon={<Globe className="w-3" />} isEditing={isEditing}>
                {isEditing ? (
                    <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition" />
                ) : (
                    <a href={formData.website} target="_blank" className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                        {formData.website} <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </Field>
        </div>
      </div>

      {/* ── BOOKING LINK SECTION ── */}
      <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Link2 className="w-32 h-32" />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                    <QrCode className="w-4 h-4 text-indigo-200" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Public Booking Portal</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Share your link to capture leads</h3>
            <p className="text-indigo-200 text-sm mb-6 max-w-md leading-relaxed">Customers can book services, upload photos, and request quotes through this secure link.</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate text-indigo-100">
                    {publicLink}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex-1 sm:flex-none px-6 py-3 bg-white text-indigo-900 rounded-xl text-xs font-black hover:bg-indigo-50 transition">
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button onClick={() => setShowQrModal(true)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition">
                        <QrCode className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* ── BRANDING SECTION ── */}
      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
            <Palette className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Visual Identity</h3>
        </div>
        
        <div className="space-y-6">
            <div className="h-24 w-full rounded-2xl shadow-inner relative overflow-hidden group" style={{ background: `linear-gradient(135deg, ${formData.email_brand_color_1} 0%, ${formData.email_brand_color_2} 100%)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/20 font-black text-4xl uppercase tracking-[0.5em] select-none">PREVIEW</span>
                </div>
            </div>

            {isEditing && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 animate-in fade-in zoom-in-95">
                    {colorPresets.map((p) => (
                        <button 
                            key={p.name}
                            onClick={() => setFormData({ ...formData, email_brand_color_1: p.color1, email_brand_color_2: p.color2 })}
                            className={`h-10 rounded-xl border-2 transition-all ${formData.email_brand_color_1 === p.color1 ? 'border-slate-900 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            style={{ background: `linear-gradient(135deg, ${p.color1} 0%, ${p.color2} 100%)` }}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* ── MODALS (Glassmorphism) ── */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
            <div className="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="bg-slate-50 p-6 rounded-3xl inline-block mb-6 border border-slate-100 shadow-inner">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Your Business Card QR</h3>
                <p className="text-slate-500 text-xs mb-8 leading-relaxed px-4">Download this code to print on yard signs, flyers, or business cards for instant customer booking.</p>
                <button onClick={() => { const a = document.createElement('a'); a.download = `${company.slug}-qr.png`; a.href = qrCodeUrl; a.click(); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition">
                    <Download className="w-4 h-4" /> Download Assets
                </button>
            </div>
        </div>
      )}

      {/* ── CONFIRM SAVE MODAL ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
            <div className="relative bg-white rounded-3xl p-8 max-w-xs w-full shadow-2xl text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Save className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Apply Changes?</h4>
                <p className="text-slate-500 text-xs mb-6">This will update your public profile and email branding instantly.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 text-xs font-bold text-slate-400">Wait, no</button>
                    <button onClick={handleConfirmSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">Yes, sync</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}