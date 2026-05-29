'use client';

import {
  User, Mail, Phone, FileText, Building, Loader2, ChevronRight, Check,
} from 'lucide-react';
import { useState } from 'react';
import { DESCRIPTION_PLACEHOLDERS, type Category } from '@/lib/formCategories';


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
  businessType?: string;
}

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (!digits.length) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const labelClass = 'text-xs font-black text-gray-700 uppercase tracking-[0.12em] ml-1';

const inputClass =
  'w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all';

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
  brandColor1 = '#0B3C6D',
brandColor2 = '#5CCB3A',
  showHeader = false,
  hasStep2 = true,
  businessType = 'general',
}: StepOneProps) {
  const color1 = brandColor1 || '#0B3C6D';
const color2 = brandColor2 || '#5CCB3A';

  const [phoneTouched, setPhoneTouched] = useState(false);
  const [descFocused, setDescFocused] = useState(false);

  const phoneDigits = formData.phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length === 10;
  const phoneInvalid = phoneTouched && !phoneValid && formData.phone.length > 0;

  const descMax = 500;
  const descCount = formData.description.length;

  return (
<div className="w-full max-w-lg mx-auto px-4 py-6 space-y-5" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* Optional standalone header */}
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

      {/* Form card — stronger shadow + border for trust */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
        <div className="p-5 space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <label className={labelClass}>Full Name</label>
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

          {/* Email */}
          <div className="space-y-1.5">
            <label className={labelClass}>Email</label>
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

          {/* Phone — inline validation */}
          <div className="space-y-1.5">
            <label className={labelClass}>Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="tel"
                value={formData.phone}
                onChange={e => {
                  onChange('phone', formatPhoneNumber(e.target.value));
                  setPhoneTouched(true);
                }}
                onBlur={() => setPhoneTouched(true)}
                disabled={submitting}
                className={`${inputClass} pr-10 ${
                  phoneInvalid
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
                    : phoneValid && phoneTouched
                    ? 'border-green-300 focus:border-green-400 focus:ring-green-500/10'
                    : ''
                }`}
                placeholder="(555) 000-0000"
                maxLength={14}
              />
              {/* Inline status icon */}
              {phoneTouched && formData.phone.length > 0 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {phoneValid ? (
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-500 text-[10px] font-black">!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {phoneInvalid && (
              <p className="text-xs text-red-500 font-semibold ml-1">Enter a valid 10-digit number</p>
            )}
          </div>

          {/* Service Category — pills */}
          <div className="space-y-2">
            <label className={labelClass}>Service Needed</label>
            {categories.length <= 8 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const selected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => onChange('category', cat.value)}
                      disabled={submitting}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                        selected
                          ? 'text-white border-transparent shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                      style={selected ? { background: `linear-gradient(135deg, ${color1}, ${color2})`, borderColor: 'transparent' } : {}}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Fallback to dropdown if too many categories
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
            )}
          </div>

          {/* Description — with char count + better placeholder */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1 mr-1">
              <label className={labelClass}>Tell Us About Your Project</label>
              <span className={`text-[11px] font-bold tabular-nums transition-colors ${
                descCount > descMax * 0.9 ? 'text-red-400' : 'text-gray-300'
              }`}>
                {descCount}/{descMax}
              </span>
            </div>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
              <textarea
                value={formData.description}
                onChange={e => onChange('description', e.target.value.slice(0, descMax))}
                onFocus={() => setDescFocused(true)}
                onBlur={() => setDescFocused(false)}
                disabled={submitting}
                rows={4}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                placeholder={DESCRIPTION_PLACEHOLDERS[businessType] ?? DESCRIPTION_PLACEHOLDERS.general}
              />
            </div>
            {/* Tip shown on focus */}
            {descFocused && descCount === 0 && (
              <p className="text-[11px] text-gray-400 font-medium ml-1">
                The more detail you give, the faster we can get you a quote.
              </p>
            )}
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
              Continue To Additional Details (Optional)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}