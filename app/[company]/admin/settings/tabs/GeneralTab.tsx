'use client';

import { useState, useEffect } from 'react';
import { Building, Mail, Phone, Link2, Check, Copy, Download, QrCode, Palette, Pencil, X } from 'lucide-react';
import QRCodeLib from 'qrcode';

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
    QRCodeLib.toDataURL(link, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } })
      .then(url => setQrCodeUrl(url));
  }, [company.slug]);

  const colorPresets = [
    { name: 'Purple', color1: '#667eea', color2: '#764ba2' },
    { name: 'Blue', color1: '#2196F3', color2: '#1976D2' },
    { name: 'Green', color1: '#10b981', color2: '#059669' },
    { name: 'Orange', color1: '#f97316', color2: '#ea580c' },
    { name: 'Pink', color1: '#ec4899', color2: '#db2777' },
    { name: 'Red', color1: '#ef4444', color2: '#dc2626' },
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
  };

  const handleCancelEdit = () => {
    setFormData({ ...savedData });
    setLogoFile(null);
    setLogoPreview(company.logo_url || '');
    setIsEditing(false);
    setError('');
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(''); setSuccess('');
    try {
      let logoUrl = company.logo_url;
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        fd.append('companySlug', company.slug);
        const uploadRes = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (uploadData.success) logoUrl = uploadData.logoUrl;
        else throw new Error(uploadData.error || 'Failed to upload logo');
      }
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-general', data: { ...formData, logo_url: logoUrl } }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Settings saved! Refreshing...');
        setSavedData({ ...formData });
        setIsEditing(false);
        setTimeout(() => window.location.reload(), 1500);
      } else setError(data.error || 'Failed to save settings');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="border-b border-gray-100 pb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your company information and branding</p>
        </div>
        {!isEditing ? (
          <button onClick={() => { setSavedData({ ...formData }); setIsEditing(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        ) : (
          <button onClick={handleCancelEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      {/* Alerts */}
      {!isEditing && !success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-500 text-sm">
          <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
          Click <strong className="text-gray-700">Edit</strong> to make changes
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Company info card */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company Info</span>
        </div>
        <div className="p-5 space-y-5">

          {/* Logo */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Logo</label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain border border-gray-200 bg-gray-50" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                  {formData.name.charAt(0)}
                </div>
              )}
              {isEditing && (
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {logoFile && <p className="text-xs text-emerald-600 mt-1">New logo selected — save to upload</p>}
                  <p className="text-xs text-gray-400 mt-1">Used in email headers and booking form</p>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <Field label="Company Name" icon={<Building className="w-3.5 h-3.5" />}>
            {isEditing ? (
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                placeholder="Your Company Name" />
            ) : (
              <p className="px-3 py-2.5 bg-gray-50 border border-gray-100 text-sm text-gray-700">
                {formData.name || <span className="text-gray-400">Not set</span>}
              </p>
            )}
          </Field>

          {/* Email */}
          <Field label="Contact Email" icon={<Mail className="w-3.5 h-3.5" />}>
            {isEditing ? (
              <input type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                placeholder="contact@company.com" />
            ) : (
              <p className="px-3 py-2.5 bg-gray-50 border border-gray-100 text-sm text-gray-700">
                {formData.email || <span className="text-gray-400">Not set</span>}
              </p>
            )}
          </Field>

          {/* Phone */}
          <Field label="Phone Number" icon={<Phone className="w-3.5 h-3.5" />}>
            {isEditing ? (
              <input type="tel" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                placeholder="(555) 123-4567" maxLength={14} />
            ) : (
              <p className="px-3 py-2.5 bg-gray-50 border border-gray-100 text-sm text-gray-700">
                {formData.phone || <span className="text-gray-400">Not set</span>}
              </p>
            )}
          </Field>
        </div>
      </div>

      {/* Booking link card */}
      {publicLink && (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Public Booking Link</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <input type="text" value={publicLink} disabled
                className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-gray-200 bg-gray-50 text-gray-500 font-mono" />
              <button onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition flex-shrink-0">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold transition flex-shrink-0">
                <QrCode className="w-4 h-4" /> QR
              </button>
            </div>
            <p className="text-xs text-gray-400">Share with customers to receive leads directly</p>
          </div>
        </div>
      )}

      {/* Branding card */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email & Form Branding</span>
        </div>
        <div className="p-5 space-y-5">
          <p className="text-xs text-gray-400">Customize the header gradient colors in your customer emails and booking form</p>

          {/* Preview */}
          <div className="h-12 w-full" style={{ background: `linear-gradient(135deg, ${formData.email_brand_color_1} 0%, ${formData.email_brand_color_2} 100%)` }} />

          {/* Presets */}
          {isEditing && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Presets</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {colorPresets.map((p) => (
                  <button key={p.name}
                    onClick={() => setFormData({ ...formData, email_brand_color_1: p.color1, email_brand_color_2: p.color2 })}
                    className={`h-8 transition hover:scale-105 ${formData.email_brand_color_1 === p.color1 ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${p.color1} 0%, ${p.color2} 100%)` }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Color pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Start Color', key: 'email_brand_color_1' as const },
              { label: 'End Color', key: 'email_brand_color_2' as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border border-gray-200 flex-shrink-0" style={{ backgroundColor: formData[key] }} />
                  {isEditing ? (
                    <>
                      <input type="color" value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-8 h-8 cursor-pointer border border-gray-200 flex-shrink-0 p-0.5" />
                      <input type="text" value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-sm font-mono border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                        placeholder="#667eea" />
                    </>
                  ) : (
                    <span className="font-mono text-sm text-gray-600">{formData[key]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save footer */}
        {isEditing && (
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
            <button onClick={() => setShowConfirm(true)} disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleCancelEdit}
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}>
          <div className="bg-white border border-gray-200 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-1">Save Changes?</h3>
              <p className="text-sm text-gray-500 mb-5">This will update your company settings immediately.</p>
              <div className="flex gap-2">
                <button onClick={handleConfirmSave}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition">
                  Save
                </button>
                <button onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowQrModal(false)}>
          <div className="bg-white border border-gray-200 max-w-sm w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: '#312e81' }}>
              <p className="font-bold text-white">QR Code</p>
              <button onClick={() => setShowQrModal(false)} className="text-white/60 hover:text-white p-1 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              {qrCodeUrl && (
                <div className="border border-gray-200 p-4 bg-white">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-xs text-gray-400 text-center">Scan to access your booking page. Print on business cards or flyers.</p>
              <div className="flex gap-2 w-full">
                <button onClick={() => { const a = document.createElement('a'); a.download = `${company.slug}-qr.png`; a.href = qrCodeUrl; a.click(); }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button onClick={() => setShowQrModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}