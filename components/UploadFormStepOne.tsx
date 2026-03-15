'use client';

import {
  User, Mail, Phone, FileText, Building, Loader2, ChevronRight,
} from 'lucide-react';
import type { Category } from '@/lib/formCategories';

interface StepOneProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    category: string;
    description: string;
  };
  categories: Category[];
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
  ctaHeading: string;
  headerSubtitle: string;
  logoUrl?: string | null;
  companyName?: string;
  companyWebsite?: string | null;
  brandColor1?: string | null;
  brandColor2?: string | null;
  showHeader?: boolean;
  hasStep2?: boolean;
}

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (!digits.length) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export default function UploadFormStepOne({
  formData,
  categories,
  onChange,
  onSubmit,
  submitting,
  error,
  ctaHeading,
  headerSubtitle,
  logoUrl,
  companyName,
  brandColor1 = '#6366f1',
  brandColor2 = '#8b5cf6',
  showHeader = false,
  hasStep2 = true,
}: StepOneProps) {
  const color1 = brandColor1 || '#6366f1';
  const color2 = brandColor2 || '#8b5cf6';

  const inputClass =
    'w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all';

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-5">

      {/* Optional standalone header (if not using FormHeader/FormHero) */}
      {showHeader && (
        <div className="text-center mb-2">
          {logoUrl && (
            <img src={logoUrl} alt={companyName || 'Logo'} className="h-10 w-auto object-contain mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{ctaHeading}</h1>
          <p className="text-sm text-gray-500 mt-1">{headerSubtitle}</p>
        </div>
      )}

      {/* Step indicator */}
      {hasStep2 && (
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center text-white shadow-sm"
              style={{ background: color1 }}
            >
              1
            </div>
            <span className="text-xs font-black text-gray-800 uppercase tracking-widest">Your Info</span>
          </div>
          <div className="flex-1 max-w-[40px] h-px bg-gray-200" />
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-[11px] font-black flex items-center justify-center text-gray-500">2</div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Details</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={formData.name}
                onChange={e => onChange('name', e.target.value)}
                disabled={submitting}
                className={inputClass}
                placeholder="John Smith"
              />
            </div>
          </div>

          {/* Email + Phone - single column on all screens */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => onChange('email', e.target.value)}
                  disabled={submitting}
                  className={inputClass}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => onChange('phone', formatPhoneNumber(e.target.value))}
                  disabled={submitting}
                  className={inputClass}
                  placeholder="(555) 000-0000"
                  maxLength={14}
                />
              </div>
            </div>
          </div>

          {/* Service Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Needed</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
              <select
                value={formData.category}
                onChange={e => onChange('category', e.target.value)}
                disabled={submitting}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Select a service...</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Tell Us About Your Project</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
              <textarea
                value={formData.description}
                onChange={e => onChange('description', e.target.value)}
                disabled={submitting}
                rows={4}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                placeholder="Describe what you need done, any important details..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="group w-full flex items-center justify-center gap-2.5 text-white py-4 rounded-2xl font-black text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {hasStep2 ? 'Continue' : 'Submit Request'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
          {hasStep2 && (
            <p className="text-center mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Photos and address are optional on the next step
            </p>
          )}
        </div>
      </div>
    </div>
  );
}