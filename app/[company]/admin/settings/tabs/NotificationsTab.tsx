'use client';

import { useState } from 'react';
import { Check, Mail, Clock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsTab({ company, currentUser }: { company: any; currentUser: any }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const prefs = company.notification_preferences || {};

  const [digest, setDigest] = useState({
    enabled: company.daily_digest_enabled ?? false,
    time: company.daily_digest_time ?? '07:00',
    recipient: prefs.digest_recipient ?? 'company',
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
            reminder_settings: company.reminder_settings,
            notification_preferences: {
              ...prefs,
              daily_digest: {
                enabled: digest.enabled,
                time: digest.time,
              },
              digest_recipient: digest.recipient,
            },
          },
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to save settings');
        return;
      }

      setDigest({
        enabled: data.company.daily_digest_enabled,
        time: data.company.daily_digest_time ?? '07:00',
        recipient: data.company.notification_preferences?.digest_recipient ?? digest.recipient,
      });

      setSuccess('Settings saved!');
      setTimeout(() => setSuccess(''), 3000);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  const recipientLabels: Record<string, string> = {
    company: company.email,
    admin: currentUser?.email || 'Admin email',
    both: `${company.email} + admin`,
  };
  const recipientLabel = recipientLabels[digest.recipient] || company.email;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg">
          <Check className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* DAILY DIGEST */}
      <div
        className={`bg-white rounded-xl overflow-hidden border transition-all duration-200 ${
          digest.enabled ? 'border-indigo-200 shadow-md shadow-indigo-50' : 'border-gray-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between transition-colors duration-200 ${
            digest.enabled ? 'bg-indigo-50 border-b border-indigo-100' : 'border-b border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                digest.enabled ? 'bg-indigo-100' : 'bg-gray-100'
              }`}
            >
              <Mail
                className={`w-4 h-4 ${
                  digest.enabled ? 'text-indigo-600' : 'text-gray-400'
                }`}
              />
            </div>

            <div>
              <p
                className={`text-sm font-bold ${
                  digest.enabled ? 'text-indigo-900' : 'text-gray-800'
                }`}
              >
                Daily Digest Email
              </p>

              <p className="text-xs text-gray-400 mt-0.5">
                {digest.enabled
                  ? `On · sends to ${recipientLabel}`
                  : 'Off · no emails will be sent'}
              </p>
            </div>
          </div>

          <Toggle
            checked={digest.enabled}
            onChange={(v) => setDigest({ ...digest, enabled: v })}
          />
        </div>

        <div className="p-5 space-y-5">

          <p className="text-sm text-gray-600 leading-relaxed">
            A morning summary of everything that needs your attention. Only sends
            on days when there's actually something to act on — no noise on quiet days.
          </p>

          {/* Send Time & Recipient */}
          {digest.enabled && (
            <div className="space-y-3">

              {/* Send Time */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
                    Send Time
                  </p>
                  <input
                    type="time"
                    value={digest.time}
                    onChange={(e) => setDigest({ ...digest, time: e.target.value })}
                    className="px-3 py-2 text-sm border border-indigo-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg"
                  />
                </div>
              </div>

              {/* Recipient */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <Users className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
                    Send To
                  </p>
                  <div className="space-y-2">
                    {[
                      { value: 'company', label: 'Company email', desc: company.email },
                      { value: 'admin', label: 'Account owner', desc: currentUser?.email || 'Admin email' },
                      { value: 'both', label: 'Both', desc: 'Company email + account owner' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                          digest.recipient === option.value
                            ? 'bg-white border-indigo-300 shadow-sm'
                            : 'bg-transparent border-transparent hover:bg-indigo-100/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="digest-recipient"
                          value={option.value}
                          checked={digest.recipient === option.value}
                          onChange={(e) => setDigest({ ...digest, recipient: e.target.value })}
                          className="accent-indigo-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* What's Included */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              What's included
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: '📅', label: "Today's scheduled jobs" },
                { icon: '🔴', label: 'Overdue payments' },
                { icon: '💳', label: 'Jobs done, payment not recorded' },
                { icon: '⏰', label: 'Payments due this week' },
                { icon: '📬', label: 'Quotes with no response' },
                { icon: '⚡', label: 'Leads with no activity' },
                { icon: '🔔', label: 'Follow-up reminders due' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500"
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Save Button */}
      <div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

    </div>
  );
}