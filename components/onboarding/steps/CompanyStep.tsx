'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Building, Mail, Phone, Globe } from 'lucide-react';
import { formatPhone, COLOR_PRESETS } from '../types';

export interface CompanyStepRef {
  getData: () => any;
}

const CompanyStep = forwardRef<CompanyStepRef, { company: any }>(({ company }, ref) => {
  const [data, setData] = useState({
    name: company.name || '',
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    email_brand_color_1: company.email_brand_color_1 || '#667eea',
    email_brand_color_2: company.email_brand_color_2 || '#764ba2',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  useImperativeHandle(ref, () => ({ getData: () => ({ ...data, logoFile }) }));

  return (
    <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
      <div className="px-5 py-4 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company Info</span>
      </div>
      <div className="p-5 space-y-5">

        {/* Logo */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Logo</label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain border border-gray-200 rounded-lg bg-gray-50" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400">
                {data.name.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1">
              <input type="file" accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setLogoFile(file); const r = new FileReader(); r.onloadend = () => setLogoPreview(r.result as string); r.readAsDataURL(file); }
                }}
                className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:rounded-md cursor-pointer" />
              <p className="text-xs text-gray-400 mt-1">Shows in emails and your booking page</p>
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            <Building className="w-3.5 h-3.5" /> Company Name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
            placeholder="Your Company Name" />
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              <Mail className="w-3.5 h-3.5" /> Contact Email
            </label>
            <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
              placeholder="contact@company.com" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <input type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: formatPhone(e.target.value) })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
              placeholder="(555) 123-4567" maxLength={14} />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            <Globe className="w-3.5 h-3.5" /> Website
          </label>
          <input type="url" value={data.website} onChange={(e) => setData({ ...data, website: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
            placeholder="https://yourcompany.com" />
        </div>

        

        {/* Brand Colors — same card, separated by a divider */}
        <div className="border-t border-gray-100 pt-5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Brand Colors</label>
          <p className="text-xs text-gray-400 mb-3">Pick 2 colors for the gradient in your customer emails and booking page</p>

          {/* Live preview */}
          <div className="h-10 w-full rounded-lg mb-3" style={{ background: `linear-gradient(135deg, ${data.email_brand_color_1}, ${data.email_brand_color_2})` }} />

          {/* Preset swatches */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            {COLOR_PRESETS.map(p => (
              <button key={p.name} onClick={() => setData({ ...data, email_brand_color_1: p.c1, email_brand_color_2: p.c2 })}
                className={`h-8 rounded-lg transition hover:scale-105 ${data.email_brand_color_1 === p.c1 && data.email_brand_color_2 === p.c2 ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }} title={p.name} />
            ))}
          </div>

          {/* Two color pickers inline */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input type="color" value={data.email_brand_color_1}
                onChange={(e) => setData({ ...data, email_brand_color_1: e.target.value })}
                className="w-9 h-9 cursor-pointer border border-gray-200 rounded-lg flex-shrink-0 p-0.5" />
              <input type="text" value={data.email_brand_color_1}
                onChange={(e) => setData({ ...data, email_brand_color_1: e.target.value })}
                className="flex-1 min-w-0 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
                placeholder="#667eea" />
            </div>
            <span className="text-gray-300 text-sm font-bold flex-shrink-0">→</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input type="color" value={data.email_brand_color_2}
                onChange={(e) => setData({ ...data, email_brand_color_2: e.target.value })}
                className="w-9 h-9 cursor-pointer border border-gray-200 rounded-lg flex-shrink-0 p-0.5" />
              <input type="text" value={data.email_brand_color_2}
                onChange={(e) => setData({ ...data, email_brand_color_2: e.target.value })}
                className="flex-1 min-w-0 px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
                placeholder="#764ba2" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

CompanyStep.displayName = 'CompanyStep';
export default CompanyStep;