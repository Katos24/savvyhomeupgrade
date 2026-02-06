'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Mail, Phone, Briefcase, Link2, Check, Copy, Download, QrCode } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    name: company.name || '',
    email: company.email || '',
    phone: company.phone || '',
    business_type: company.business_type || 'general',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  useEffect(() => {
    const link = `${window.location.origin}/${company.slug}`;
    setPublicLink(link);
    
    // Generate QR code
    QRCodeLib.toDataURL(link, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(url => {
      setQrCodeUrl(url);
    });
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
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

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let logoUrl = company.logo_url;

      // Upload logo if changed
      if (logoFile) {
        console.log('Uploading new logo...');
        const formDataLogo = new FormData();
        formDataLogo.append('logo', logoFile); // Changed from 'file' to 'logo'
        formDataLogo.append('companySlug', company.slug);

        const uploadRes = await fetch('/api/upload-logo', {
          method: 'POST',
          body: formDataLogo,
        });

        const uploadData = await uploadRes.json();
        console.log('Logo upload response:', uploadData);
        
        if (uploadData.success) {
          logoUrl = uploadData.logoUrl; // Changed from 'url' to 'logoUrl'
          console.log('New logo URL:', logoUrl);
        } else {
          throw new Error(uploadData.error || 'Failed to upload logo');
        }
      }

      console.log('Updating company settings with logo_url:', logoUrl);

      // Update company settings
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-general',
          data: {
            ...formData,
            logo_url: logoUrl,
          },
        }),
      });

      const data = await response.json();
      console.log('Settings update response:', data);

      if (data.success) {
        setSuccess('Settings saved successfully! Refreshing page...');
        setTimeout(() => {
          // Hard refresh to show new logo
          window.location.reload();
        }, 1500);
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">General Settings</h2>
        <p className="text-slate-600">Manage your company information and branding</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Company Logo */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Company Logo</label>
          <div className="flex items-center gap-6">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt="Company logo" 
                className="w-24 h-24 object-contain border border-slate-200 rounded-lg bg-slate-50"
              />
            ) : (
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-4xl font-bold text-slate-400 border border-slate-200">
                {formData.name.charAt(0)}
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {logoFile && (
                <p className="text-xs text-emerald-600 mt-1">New logo selected - click Save to upload</p>
              )}
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Your Company Name"
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Business Type
          </label>
          <select
            value={formData.business_type}
            onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="contact@company.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Public Link with QR Code */}
        {publicLink && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Public Booking Link
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={publicLink}
                  disabled
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
              </div>
              <p className="text-xs text-slate-500">Share this link or QR code with customers to receive leads</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">QR Code</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="text-center space-y-4">
              {qrCodeUrl && (
                <div className="bg-white p-6 rounded-lg border-2 border-slate-200 inline-block">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-64 h-64"
                  />
                </div>
              )}
              
              <p className="text-sm text-slate-600">
                Scan this QR code to access your booking page
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
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
