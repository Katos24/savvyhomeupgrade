'use client';

import {
  User,
  Mail,
  Phone,
  FileText,
  Building,
  CheckCircle,
  Loader2,
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
  brandColor1?: string | null;
  brandColor2?: string | null;
  showHeader?: boolean;
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
  brandColor1,
  brandColor2,
  showHeader = true,
}: StepOneProps) {
  return (
    <div className="max-w-3xl mx-auto px-4">
      {showHeader && (
        <div className="text-center mb-8">
          {logoUrl && (
            <div className="mb-6 flex justify-center">
              <img src={logoUrl} alt={companyName || 'Logo'} className="h-20 w-auto object-contain" />
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{ctaHeading}</h1>
          <p className="text-lg text-gray-600">{headerSubtitle}</p>
        </div>
      )}

      {/* Step pill */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">1</div>
          <span className="text-sm font-semibold text-blue-600">Your Info</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 text-sm font-bold flex items-center justify-center">2</div>
          <span className="text-sm text-gray-400">Optional Details</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-sm">
            <p className="font-semibold">Please fix the following:</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 text-blue-500" />
              Your Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => onChange('name', e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
              placeholder="John Smith"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 text-blue-500" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => onChange('email', e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 text-green-500" />
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => onChange('phone', formatPhoneNumber(e.target.value))}
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
              placeholder="(555) 123-4567"
              maxLength={14}
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {formData.phone.replace(/\D/g, '').length}/10 digits
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Building className="w-4 h-4 text-amber-500" />
              Service Type *
            </label>
            <select
              value={formData.category}
              onChange={e => onChange('category', e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
            >
              <option value="">Select a service...</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 text-purple-500" />
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={e => onChange('description', e.target.value)}
              disabled={submitting}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
              placeholder="Describe your project in detail..."
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-3 text-white py-4 px-6 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:opacity-90"
            style={{
              background:
                brandColor1 && brandColor2
                  ? `linear-gradient(to right, ${brandColor1}, ${brandColor2})`
                  : '#3b82f6',
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Submit & Add Details →'
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            We'll save your info right away — step 2 lets you add photos, address & more (optional)
          </p>
        </div>
      </div>
    </div>
  );
}