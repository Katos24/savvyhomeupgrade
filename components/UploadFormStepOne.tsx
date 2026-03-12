'use client';

import {
  User,
  Mail,
  Phone,
  FileText,
  Building,
  CheckCircle,
  Loader2,
  ChevronRight
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
  if (digits.length === 0) return '';
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
  companyWebsite,
  brandColor1 = '#3b82f6',
  brandColor2 = '#8b5cf6',
  showHeader = false, // Default to false since we moved it to the parent
  hasStep2 = true,
}: StepOneProps) {
  
  const accentColor = brandColor1 || '#3b82f6';

  return (
    <div className="w-full">
      {/* 1. Header Logic (Only shows if explicitly passed, otherwise parent handles it) */}
      {showHeader && (
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          {logoUrl && (
            <div className="mb-6 flex justify-center">
              <img src={logoUrl} alt={companyName || 'Logo'} className="h-16 w-auto object-contain" />
            </div>
          )}
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{ctaHeading}</h1>
          <p className="text-lg text-gray-500 font-medium">{headerSubtitle}</p>
        </div>
      )}

      {/* 2. Step Progress Pill */}
      {hasStep2 && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <div 
              className="w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center text-white"
              style={{ background: accentColor }}
            >
              1
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Contact Info</span>
          </div>
          <div className="w-8 h-[2px] bg-gray-100" />
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-[10px] font-black flex items-center justify-center text-gray-500">2</div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Project Details</span>
          </div>
        </div>
      )}

      {/* 3. The Form Body */}
      <div className="bg-white p-1 sm:p-2 rounded-[2rem]">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium animate-in shake duration-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={formData.name}
                onChange={e => onChange('name', e.target.value)}
                disabled={submitting}
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-gray-900 font-medium placeholder:text-gray-300"
                placeholder="Full Name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                value={formData.email}
                onChange={e => onChange('email', e.target.value)}
                disabled={submitting}
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-gray-900 font-medium placeholder:text-gray-300"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="tel"
                value={formData.phone}
                onChange={e => onChange('phone', formatPhoneNumber(e.target.value))}
                disabled={submitting}
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-gray-900 font-medium placeholder:text-gray-300"
                placeholder="(555) 000-0000"
                maxLength={14}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Service</label>
            <div className="relative group">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <select
                value={formData.category}
                onChange={e => onChange('category', e.target.value)}
                disabled={submitting}
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-gray-900 font-medium appearance-none cursor-pointer"
              >
                <option value="">Select Service...</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Project Details</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-5 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <textarea
                value={formData.description}
                onChange={e => onChange('description', e.target.value)}
                disabled={submitting}
                rows={4}
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-gray-900 font-medium placeholder:text-gray-300 resize-none"
                placeholder="Briefly describe what you need help with..."
              />
            </div>
          </div>
        </div>

        {/* 4. Action Area */}
        <div className="p-6 pt-0">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="group w-full flex items-center justify-center gap-3 text-white py-5 px-8 rounded-2xl font-black text-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl hover:shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})`,
            }}
          >
            {submitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {hasStep2 ? 'Continue to Photos' : 'Submit Request'}
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          {hasStep2 && (
            <p className="text-center mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Photos & Address are optional in the next step
            </p>
          )}
        </div>
      </div>
    </div>
  );
}