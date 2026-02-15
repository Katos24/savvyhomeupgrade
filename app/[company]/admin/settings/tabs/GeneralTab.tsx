'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Mail, Phone, Briefcase, Link2, Check, Copy, Download, QrCode, Palette } from 'lucide-react';
import QRCodeLib from 'qrcode';

export default function GeneralTab({ company, currentUser }: { company: any; currentUser: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [publicLink, setPublicLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    console.log('GeneralTab loaded with company:', {
      name: company.name,
      email_brand_color_1: company.email_brand_color_1,
      email_brand_color_2: company.email_brand_color_2,
    });
  }, []);

  const [formData, setFormData] = useState({
    name: company.name || '',
    email: company.email || '',
    phone: company.phone || '',
    business_type: company.business_type || 'general',
    email_brand_color_1: company.email_brand_color_1 || '#667eea',
    email_brand_color_2: company.email_brand_color_2 || '#764ba2',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  useEffect(() => {
    const link = `${window.location.origin}/${company.slug}`;
    setPublicLink(link);
    
    QRCodeLib.toDataURL(link, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    }).then(url => setQrCodeUrl(url));
  }, [company.slug]);

  const businessTypes = [
    { value: 'general', label: 'General Contractor' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'construction', label: 'Construction' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'cleaning', label: 'Cleaning Services' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'home_services', label: 'Home Services' },
    { value: 'beauty_services', label: 'Beauty Services' },
    { value: 'fitness_services', label: 'Fitness Services' },
    { value: 'food_services', label: 'Food Services' },
    { value: 'video_production', label: 'Video Production' },
    { value: 'other', label: 'Other' },
  ];

  const colorPresets = [
    { name: 'Purple Gradient', color1: '#667eea', color2: '#764ba2' },
    { name: 'Blue Ocean', color1: '#2196F3', color2: '#1976D2' },
    { name: 'Green Nature', color1: '#10b981', color2: '#059669' },
    { name: 'Orange Sunset', color1: '#f97316', color2: '#ea580c' },
    { name: 'Pink Rose', color1: '#ec4899', color2: '#db2777' },
    { name: 'Red Fire', color1: '#ef4444', color2: '#dc2626' },
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

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `${company.slug}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let logoUrl = company.logo_url;

      if (logoFile) {
        const formDataLogo = new FormData();
        formDataLogo.append('logo', logoFile);
        formDataLogo.append('companySlug', company.slug);

        const uploadRes = await fetch('/api/upload-logo', {
          method: 'POST',
          body: formDataLogo,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          logoUrl = uploadData.logoUrl;
        } else {
          throw new Error(uploadData.error || 'Failed to upload logo');
        }
      }

      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-general',
          data: { ...formData, logo_url: logoUrl },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Settings saved successfully! Refreshing page...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">General Settings</h2>
        <p className="text-sm sm:text-base text-slate-600">Manage your company information and branding</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-5 sm:space-y-6">
        
        {/* Company Logo - Mobile Optimized */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-3">Company Logo</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt="Company logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain border border-slate-200 rounded-lg bg-slate-50"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-lg flex items-center justify-center text-3xl sm:text-4xl font-bold text-slate-400 border border-slate-200">
                {formData.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-xs sm:text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {logoFile && (
                <p className="text-xs text-emerald-600 mt-1">New logo selected - click Save to upload</p>
              )}
              <p className="text-xs text-slate-500 mt-1">Used in email headers and branding</p>
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
            placeholder="Your Company Name"
          />
        </div>


        {/* Email */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
            placeholder="contact@company.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
            placeholder="(555) 123-4567"
            maxLength={14}
          />
        </div>

        {/* Public Link with QR Code - MOVED UP & MOBILE OPTIMIZED */}
        {publicLink && (
          <div className="pt-4 sm:pt-6 border-t border-slate-200">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Public Booking Link
            </label>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={publicLink}
                  disabled
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 text-xs sm:text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">Share this link or QR code with customers to receive leads</p>
            </div>
          </div>
        )}

        {/* Email Branding Section - Mobile Optimized */}
        <div className="pt-5 sm:pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Form & Email Branding</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">Customize the header gradient colors in your customer emails and booking form</p>

          {/* Color Presets - Mobile Grid */}
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Color Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    email_brand_color_1: preset.color1,
                    email_brand_color_2: preset.color2,
                  })}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-500 transition"
                >
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${preset.color1} 0%, ${preset.color2} 100%)` }}
                  />
                  <span className="text-xs font-medium text-slate-700 truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Gradient Start Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.email_brand_color_1}
                  onChange={(e) => setFormData({ ...formData, email_brand_color_1: e.target.value })}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer border border-slate-300 flex-shrink-0"
                />
                <input
                  type="text"
                  value={formData.email_brand_color_1}
                  onChange={(e) => setFormData({ ...formData, email_brand_color_1: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs sm:text-sm"
                  placeholder="#667eea"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Gradient End Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.email_brand_color_2}
                  onChange={(e) => setFormData({ ...formData, email_brand_color_2: e.target.value })}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer border border-slate-300 flex-shrink-0"
                />
                <input
                  type="text"
                  value={formData.email_brand_color_2}
                  onChange={(e) => setFormData({ ...formData, email_brand_color_2: e.target.value })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs sm:text-sm"
                  placeholder="#764ba2"
                />
              </div>
            </div>
          </div>


        </div>

        {/* Save Button - Mobile Full Width */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* QR Code Modal - Mobile Optimized */}
      {showQrModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">QR Code</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="text-center space-y-4">
              {qrCodeUrl && (
                <div className="bg-white p-4 sm:p-6 rounded-lg border-2 border-slate-200 inline-block">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-48 h-48 sm:w-64 sm:h-64"
                  />
                </div>
              )}
              
              <p className="text-xs sm:text-sm text-slate-600">
                Scan this QR code to access your booking page
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition text-sm"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Print this QR code on business cards, flyers, or storefronts
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}