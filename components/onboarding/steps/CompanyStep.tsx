'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Building, Mail, Phone, Globe, Palette } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company Info</span>
        </div>
        <div className="p-5 space-y-5">
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

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              <Building className="w-3.5 h-3.5" /> Company Name <span className="text-red-400">*</span>
            </label>
            <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
              placeholder="Your Company Name" />
          </div>

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

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              <Globe className="w-3.5 h-3.5" /> Website
            </label>
            <input type="url" value={data.website} onChange={(e) => setData({ ...data, website: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
              placeholder="https://yourcompany.com" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Branding</span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-400">These colors appear in the header of emails sent to customers</p>
          <div className="h-12 w-full rounded-lg" style={{ background: `linear-gradient(135deg, ${data.email_brand_color_1}, ${data.email_brand_color_2})` }} />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {COLOR_PRESETS.map(p => (
              <button key={p.name} onClick={() => setData({ ...data, email_brand_color_1: p.c1, email_brand_color_2: p.c2 })}
                className={`h-8 rounded-lg transition hover:scale-105 ${data.email_brand_color_1 === p.c1 ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }} title={p.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

CompanyStep.displayName = 'CompanyStep';
export default CompanyStep;