'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Save, AlertCircle, Check } from 'lucide-react';

export default function ProfilePageClient({ 
  company, 
  currentUser 
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
    } catch (error) {
      console.error('Profile update error:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-10 sm:h-14 w-auto object-contain flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-lg flex-shrink-0">
                  {company.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 truncate">My Profile</h1>
                <p className="text-xs sm:text-sm text-slate-600">Manage your account information</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push(`/${company.slug}/dashboard`)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition px-4 py-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                {currentUser.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
                <p className="text-slate-600 text-sm mt-1">{currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} • {company.name}</p>
                <p className="text-slate-500 text-xs mt-1">Member since {new Date(currentUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <User className="w-4 h-4" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base"
                placeholder="John Doe"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Phone className="w-4 h-4" />
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base"
              />
              <p className="text-xs text-slate-500 mt-1">US format: (XXX) XXX-XXXX</p>
            </div>

          {/* Password Change Link */}
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <h3 className="font-semibold text-blue-900 mb-2">Change Password</h3>
  <p className="text-sm text-blue-700 mb-3">Need to update your password?</p>

  <a
    href="/forgot-password"
    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm"
  >
    Reset Password →
  </a>
</div>


            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.push(`/${company.slug}/dashboard`)}
                className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {!hasChanges && (
              <p className="text-center text-sm text-slate-500 italic">No changes to save</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}