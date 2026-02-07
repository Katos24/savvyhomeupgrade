'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Clock, Check, Mail } from 'lucide-react';

export default function NotificationsTab({ company, currentUser }: { company: any; currentUser: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const defaultSettings = {
    follow_up_enabled: true,
    follow_up_days: 3,
    quote_follow_up_days: 2,
    schedule_follow_up_days: 1,
  };

  const [settings, setSettings] = useState(
    company.reminder_settings || defaultSettings
  );

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-notifications',
          data: {
            reminder_settings: settings,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Notification settings saved successfully!');
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Notifications & Reminders</h2>
        <p className="text-slate-600">Automate follow-ups and never miss an opportunity</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Follow-up Reminders */}
        <div className="pb-6 border-b border-slate-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Follow-up Reminders</h3>
              </div>
              <p className="text-sm text-slate-600">
                Automatically remind you to follow up with leads that haven't been contacted recently
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.follow_up_enabled}
                onChange={(e) => setSettings({ ...settings, follow_up_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.follow_up_enabled && (
            <div className="space-y-4 mt-4 pl-7">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  General Follow-up Reminder
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Remind me to follow up with leads after they haven't been contacted
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.follow_up_days}
                    onChange={(e) => setSettings({ ...settings, follow_up_days: parseInt(e.target.value) || 3 })}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-slate-700">days after last activity</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quote Follow-up Reminder
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Remind me to follow up after sending a quote
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.quote_follow_up_days}
                    onChange={(e) => setSettings({ ...settings, quote_follow_up_days: parseInt(e.target.value) || 2 })}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-slate-700">days after quote sent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Post-Appointment Follow-up
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Remind me to follow up after a scheduled appointment
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={settings.schedule_follow_up_days}
                    onChange={(e) => setSettings({ ...settings, schedule_follow_up_days: parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-slate-700">days after appointment date</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How Reminders Work */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">How Reminders Work</h4>
              <p className="text-sm text-blue-800">
                You'll receive a daily email digest at 9:00 AM with all leads that need follow-up. 
                Each lead will show why it needs attention (e.g., "Quote sent 3 days ago").
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-700 mb-2">Coming Soon</h4>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• Customer appointment reminders (24hrs & 2hrs before)</li>
            <li>• Payment due date reminders</li>
            <li>• Lead aging alerts (stale leads)</li>
            <li>• Custom per-lead reminders</li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
