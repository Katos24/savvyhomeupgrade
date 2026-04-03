'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Building, Mail, Phone, Globe } from 'lucide-react';
import { COLOR_PRESETS } from '../types';

export interface CompanyStepRef {
  getData: () => any;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').substring(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const CompanyStep = forwardRef<CompanyStepRef, { company: any }>(({ company }, ref) => {
  const [data, setData] = useState({
    name: company.name || '',
    email: company.email || '',
    phone: formatPhone(company.phone || ''),
    website: company.website || '',
    email_brand_color_1: company.email_brand_color_1 || '#667eea',
    email_brand_color_2: company.email_brand_color_2 || '#764ba2',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  useImperativeHandle(ref, () => ({ getData: () => ({ ...data, logoFile }) }));

  return (
    <div className="bg-white border border-gray-200 overflow-hidden rounded-xl shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Company Profile</span>
      </div>

      <div className="p-6 space-y-6">

        {/* Logo Section */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Brand Logo</label>
          <div className="flex items-center gap-5">
            {logoPreview ? (
              <div className="relative group">
                <img src={logoPreview} alt="Logo" className="w-20 h-20 object-contain border border-gray-200 rounded-2xl bg-white p-2 shadow-sm" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-3xl font-black text-gray-300">
                {data.name.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1 max-w-xs">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLogoFile(file);
                    const r = new FileReader();
                    r.onloadend = () => setLogoPreview(r.result as string);
                    r.readAsDataURL(file);
                  }
                }}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:rounded-xl cursor-pointer"
              />
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">Recommended: Square PNG or SVG with a transparent background.</p>
            </div>
          </div>
        </div>

        {/* Settings hint */}
        <p className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 leading-relaxed">
          💡 Don't worry about getting everything perfect — you can update all of this anytime in <span className="font-bold text-slate-600">Settings</span>.
        </p>

        {/* Company Identity */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              <Building className="w-3.5 h-3.5 text-indigo-500" /> Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-4 py-3 text-sm font-medium border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-300"
              placeholder="e.g. Acme Electrical"
            />
          </div>
          

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                <Mail className="w-3.5 h-3.5 text-indigo-500" /> Public Email
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full px-4 py-3 text-sm font-medium border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="hello@company.com"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                <Phone className="w-3.5 h-3.5 text-indigo-500" /> Business Phone
              </label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: formatPhone(e.target.value) })}
                className="w-full px-4 py-3 text-sm font-medium border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="(555) 000-0000"
                maxLength={14}
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Format: (555) 000-0000</p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              <Globe className="w-3.5 h-3.5 text-indigo-500" /> Website URL
            </label>
            <input
              type="url"
              value={data.website}
              onChange={(e) => setData({ ...data, website: e.target.value })}
              className="w-full px-4 py-3 text-sm font-medium border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="https://acme-electrical.com"
            />
          </div>
        </div>

        {/* Brand Customization */}
        <div className="border-t border-gray-100 pt-6">
          <div className="mb-5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Visual Branding</label>
            <p className="text-[11px] text-gray-400 leading-relaxed">Choose your signature colors. These will be used for gradients in emails and your online booking portal.</p>
          </div>

          {/* Live Gradient Preview */}
          <div
            className="relative group overflow-hidden h-16 w-full rounded-2xl mb-5 shadow-inner border border-gray-100 transition-transform active:scale-[0.99]"
            style={{ background: `linear-gradient(135deg, ${data.email_brand_color_1}, ${data.email_brand_color_2})` }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">Brand Preview</span>
            </div>
          </div>

          {/* Swatches */}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mb-6">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => setData({ ...data, email_brand_color_1: p.c1, email_brand_color_2: p.c2 })}
                className={`h-8 rounded-lg transition-all hover:scale-110 active:scale-90 ${data.email_brand_color_1 === p.c1 ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : 'border border-black/5'}`}
                style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
                title={p.name}
              />
            ))}
          </div>

          {/* Precision Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 w-full sm:flex-1">
              <input
                type="color"
                value={data.email_brand_color_1}
                onChange={(e) => setData({ ...data, email_brand_color_1: e.target.value })}
                className="w-10 h-10 cursor-pointer rounded-xl border-0 p-0 overflow-hidden shadow-sm"
              />
              <input
                type="text"
                value={data.email_brand_color_1}
                onChange={(e) => setData({ ...data, email_brand_color_1: e.target.value })}
                className="flex-1 px-3 py-2 text-xs font-mono font-bold text-gray-600 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="hidden sm:block text-gray-300 font-bold">→</div>

            <div className="flex items-center gap-3 w-full sm:flex-1">
              <input
                type="color"
                value={data.email_brand_color_2}
                onChange={(e) => setData({ ...data, email_brand_color_2: e.target.value })}
                className="w-10 h-10 cursor-pointer rounded-xl border-0 p-0 overflow-hidden shadow-sm"
              />
              <input
                type="text"
                value={data.email_brand_color_2}
                onChange={(e) => setData({ ...data, email_brand_color_2: e.target.value })}
                className="flex-1 px-3 py-2 text-xs font-mono font-bold text-gray-600 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CompanyStep.displayName = 'CompanyStep';
export default CompanyStep;