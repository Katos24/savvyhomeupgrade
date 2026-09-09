'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Save,
  AlertCircle,
  Check,
  Loader2,
  Lock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function ProfilePageClient({
  company,
  currentUser,
}: {
  company: any;
  currentUser: any;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    formData.name !== (currentUser.name || '') ||
    formData.email !== (currentUser.email || '') ||
    formData.phone !== (currentUser.phone || '');

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="h-10 sm:h-12 w-auto object-contain shrink-0"
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xs shrink-0">
                  {company.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate tracking-tight">
                  My Profile
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Manage your personal account settings
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/${company.slug}/dashboard`)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition px-3.5 py-2 rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Alerts */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm shadow-xs animate-in fade-in slide-in-from-top-1">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200/80 text-rose-800 px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm shadow-xs animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
          {/* Header Banner & User Summary */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 sm:px-8 py-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-22 sm:h-22 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/20 flex items-center justify-center text-white font-bold text-3xl shadow-inner shrink-0">
                {currentUser.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0 space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  {currentUser.name}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="capitalize">{currentUser.role}</span>
                  <span>•</span>
                  <span className="truncate">{company.name}</span>
                </div>
                <p className="text-slate-400 text-xs pt-1">
                  Member since {new Date(currentUser.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  <User className="w-4 h-4 text-slate-500" />
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const input = e.target.value.replace(/\D/g, '');
                    if (input.length <= 10) {
                      let formatted = input;
                      if (input.length > 6) {
                        formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
                      } else if (input.length > 3) {
                        formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
                      } else if (input.length > 0) {
                        formatted = `(${input}`;
                      }
                      setFormData({ ...formData, phone: formatted });
                    }
                  }}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">US format: (XXX) XXX-XXXX</p>
              </div>
            </div>

            {/* Password Management */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Lock className="w-3.5 h-3.5 text-slate-600" /> Password & Security
                </div>
                <p className="text-xs text-slate-500">
                  Need to change your password? Request a secure reset link.
                </p>
              </div>
              <a
                href="/forgot-password"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-xs transition shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                Reset
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push(`/${company.slug}/dashboard`)}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {!hasChanges && !saving && (
              <p className="text-center text-xs text-slate-400 italic pt-1">
                No un-saved changes
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}