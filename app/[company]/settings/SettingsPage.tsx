'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LockedTab from '@/components/LockedTab';
import { canAccessSettingsTab } from '@/lib/permissions';
import type { PlanTier, SettingsTab } from '@/lib/permissions';

type TabDef = {
  key: string;
  label: string;
  settingsKey?: SettingsTab;
};

const TABS: TabDef[] = [
  { key: 'profile',         label: 'Profile' },
  { key: 'company',         label: 'Company',         settingsKey: 'company' },
  { key: 'customer-form',   label: 'Customer Form',   settingsKey: 'customer-form' },
  { key: 'pipeline',        label: 'Pipeline',        settingsKey: 'pipeline' },
  { key: 'categories',      label: 'Categories',      settingsKey: 'categories' },
  { key: 'email-templates', label: 'Email Templates', settingsKey: 'email-templates' },
  { key: 'billing',         label: 'Plan & Billing',  settingsKey: 'billing' },
];

type Props = {
  companySlug: string;
  companyName: string;
  companyLogoUrl?: string | null;
  planTier: PlanTier;
  currentUser: any;
};

export default function SettingsPage({
  companySlug,
  companyName,
  companyLogoUrl,
  planTier,
  currentUser,
}: Props) {
  console.log('🔍 planTier received:', planTier); // ADD THIS
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState(currentUser?.name || '');
  const [emailNotifications, setEmailNotifications] = useState(
    currentUser?.email_notifications ?? true
  );

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // A tab is locked if it has a settingsKey and the plan can't access it
  function isTabLocked(tab: TabDef): boolean {
    if (!tab.settingsKey) return false;
    return !canAccessSettingsTab(tab.settingsKey, planTier);
  }

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, emailNotifications }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('✅ Settings saved!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError('All password fields are required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('✅ Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':  return 'bg-purple-500 text-white';
      case 'admin':  return 'bg-blue-500 text-white';
      case 'member': return 'bg-gray-500 text-white';
      default:       return 'bg-gray-500 text-white';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':  return '👑';
      case 'admin':  return '⚙️';
      case 'member': return '👤';
      default:       return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt={`${companyName} logo`} className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {companyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold gradient-text">{companyName}</h1>
              <p className="text-sm text-gray-600">Settings</p>
            </div>
          </div>
          <a href={`/${companySlug}/dashboard`} className="text-gray-600 hover:text-gray-900">
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <h2 className="text-3xl font-bold mb-6">Settings</h2>

        {/* TABS */}
        <div className="flex gap-1 flex-wrap mb-8 border-b border-gray-200">
          {TABS.map((tab) => {
            const locked = isTabLocked(tab);
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors
                  ${active
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : locked
                      ? 'border-transparent text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {tab.label}
                {locked && <span className="text-xs">🔒</span>}
              </button>
            );
          })}
        </div>

        {/* ── PROFILE ──────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">👤 Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={currentUser?.email}
                    disabled
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeClass(currentUser?.role)}`}>
                      {getRoleIcon(currentUser?.role)}{' '}
                      {currentUser?.role?.charAt(0).toUpperCase() + currentUser?.role?.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    value={companyName}
                    disabled
                    className="form-input bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">🔔 Notifications</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Email me when new leads arrive</p>
                  <p className="text-sm text-gray-600">Get notified immediately when customers submit new leads</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">🔒 Security</h3>
              <button onClick={() => setShowPasswordModal(true)} className="btn btn-secondary">
                Change Password
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={handleSaveProfile} disabled={loading} className="btn btn-primary disabled:opacity-50">
                {loading ? '💾 Saving...' : '💾 Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ── COMPANY ──────────────────────────────────────── */}
        {activeTab === 'company' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">🏢 Company Info</h3>
            <p className="text-gray-500 text-sm">Company settings coming soon.</p>
          </div>
        )}

        {/* ── CUSTOMER FORM ─────────────────────────────────── */}
        {activeTab === 'customer-form' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">📋 Customer Form</h3>
            <p className="text-gray-500 text-sm">Form customization coming soon.</p>
          </div>
        )}

        {/* ── PIPELINE ─────────────────────────────────────── */}
        {activeTab === 'pipeline' && (
          <LockedTab feature="pipeline" planTier={planTier} companySlug={companySlug}>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">📊 Pipeline Stages</h3>
              <p className="text-gray-500 text-sm">Pipeline customization coming soon.</p>
            </div>
          </LockedTab>
        )}

        {/* ── CATEGORIES ───────────────────────────────────── */}
        {activeTab === 'categories' && (
          <LockedTab feature="categories" planTier={planTier} companySlug={companySlug}>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">🗂️ Job Categories</h3>
              <p className="text-gray-500 text-sm">Categories coming soon.</p>
            </div>
          </LockedTab>
        )}

        {/* ── EMAIL TEMPLATES ───────────────────────────────── */}
        {activeTab === 'email-templates' && (
          <LockedTab feature="email_templates" planTier={planTier} companySlug={companySlug}>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">✉️ Email Templates</h3>
              <p className="text-gray-500 text-sm">Email templates coming soon.</p>
            </div>
          </LockedTab>
        )}

        {/* ── BILLING ──────────────────────────────────────── */}
        {activeTab === 'billing' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">💳 Plan & Billing</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Current plan</p>
                  <p className="text-sm text-gray-600 capitalize">{planTier}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${planTier === 'business' ? 'bg-purple-100 text-purple-700' :
                    planTier === 'pro'      ? 'bg-blue-100 text-blue-700' :
                                             'bg-gray-100 text-gray-700'}`}>
                  {planTier === 'business' ? 'Business' : planTier === 'pro' ? 'Pro' : 'Basic'}
                </span>
              </div>
              <a href={`/${companySlug}/subscribe`} className="btn btn-primary inline-block">
                Manage Subscription
              </a>
            </div>
          </div>
        )}
      </div>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">🔒 Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="form-input"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="form-input"
                  placeholder="Re-enter new password"
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPasswordModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button onClick={handleChangePassword} disabled={loading} className="btn btn-primary flex-1 disabled:opacity-50">
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}