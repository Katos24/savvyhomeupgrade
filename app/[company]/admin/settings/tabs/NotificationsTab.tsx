'use client';

import { useState } from 'react';
import { Bell, Check, Mail } from 'lucide-react';

export default function NotificationsTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const defaultSettings = {
    follow_up_enabled: true,
    follow_up_days: 3,
    quote_follow_up_days: 2,
    schedule_follow_up_days: 1,
  };

  const defaultDigest = {
    enabled: false,
    time: '07:00',
  };

  const [settings, setSettings] = useState(company.reminder_settings || defaultSettings);
  const [digest, setDigest] = useState({
  enabled: company.daily_digest_enabled ?? false,
  time: company.daily_digest_time ?? '07:00',
});

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-notifications',
          data: {
            reminder_settings: settings,
            notification_preferences: { daily_digest: digest },
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Notification settings saved!');
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

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
    </label>
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-bold text-gray-900">Notifications & Reminders</h2>
        <p className="text-sm text-gray-500 mt-1">Stay on top of your pipeline without logging in every day</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── DAILY DIGEST ── */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Digest Email</span>
          </div>
          <Toggle checked={digest.enabled} onChange={(v) => setDigest({ ...digest, enabled: v })} />
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-gray-600">
            Get a morning email with everything that needs your attention — jobs today, stale leads, unpaid invoices, overdue payments, and quotes with no response.
            Only sends when there's actually something to action.
          </p>

          {digest.enabled && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Send Time</label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={digest.time}
                  onChange={(e) => setDigest({ ...digest, time: e.target.value })}
                  className="px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                />
                <span className="text-sm text-gray-400">local time</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Sends to <strong className="text-gray-600">{company.email}</strong>
              </p>
            </div>
          )}

          {/* What's included */}
          <div className="bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What's included</p>
            <div className="space-y-2">
              {[
                { icon: '📅', label: "Today's scheduled jobs" },
                { icon: '⚡', label: 'Leads with no activity in 2+ days' },
                { icon: '📬', label: 'Quotes sent with no response after 3+ days' },
                { icon: '💳', label: 'Completed jobs with no payment recorded' },
                { icon: '🔴', label: 'Overdue payments' },
                { icon: '⏰', label: 'Payments due this week' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-5 text-center">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOLLOW-UP THRESHOLDS ── */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Follow-up Thresholds</span>
          </div>
          <Toggle
            checked={settings.follow_up_enabled}
            onChange={(v) => setSettings({ ...settings, follow_up_enabled: v })}
          />
        </div>

        {settings.follow_up_enabled && (
          <div className="p-5 space-y-5">
            <p className="text-sm text-gray-500">
              These thresholds control when items show up in your daily digest.
            </p>

            {[
              {
                label: 'No activity reminder',
                desc: 'Flag leads/projects with no updates after X days',
                key: 'follow_up_days',
                max: 30,
              },
              {
                label: 'Quote follow-up',
                desc: 'Flag quotes with no response after X days',
                key: 'quote_follow_up_days',
                max: 30,
              },
              {
                label: 'Post-appointment follow-up',
                desc: 'Flag completed jobs missing payment after X days',
                key: 'schedule_follow_up_days',
                max: 7,
              },
            ].map(({ label, desc, key, max }) => (
              <div key={key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-0.5">{label}</label>
                <p className="text-xs text-gray-400 mb-2">{desc}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={max}
                    value={settings[key]}
                    onChange={(e) => setSettings({ ...settings, [key]: parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                  />
                  <span className="text-sm text-gray-500">days</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="bg-white border border-gray-200 px-5 py-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}