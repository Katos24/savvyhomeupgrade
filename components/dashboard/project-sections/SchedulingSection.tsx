'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Mail, MoreVertical, Calendar } from 'lucide-react';
import SendCustomerEmailButtons from '@/components/dashboard/SendCustomerEmailButtons';
import SchedulingCalendarModal from './SchedulingCalendarModal';

type SchedulingSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
};

export default function SchedulingSection({ lead, currentUser, onRefresh, hasProject, companySlug }: SchedulingSectionProps) {
  const [saving, setSaving] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('');
  const [timeAmPm, setTimeAmPm] = useState('AM');
  const [assignedTo, setAssignedTo] = useState('');
  const [showCustomAssignee, setShowCustomAssignee] = useState(false);
  const [customAssignee, setCustomAssignee] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const res = await fetch('/api/team/members');
        const data = await res.json();
        if (data.success) setTeamMembers(data.members);
      } catch (e) {
        console.error('Failed to fetch team members:', e);
      }
    }
    fetchTeamMembers();
  }, []);

  const parseTimeString = (time24: string) => {
    if (!time24) return { hour: '', minute: '', ampm: 'AM' };
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return { hour: hour12.toString(), minute: minutes, ampm };
  };

  const buildTimeString = (hour: string, minute: string, ampm: string) => {
    if (!hour || !minute) return '';
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    else if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  useEffect(() => {
    setScheduledDate(lead?.scheduled_date ? new Date(lead.scheduled_date).toISOString().split('T')[0] : '');
    if (lead?.scheduled_time) {
      const { hour, minute, ampm } = parseTimeString(lead.scheduled_time);
      setTimeHour(hour);
      setTimeMinute(minute);
      setTimeAmPm(ampm);
      setScheduledTime(lead.scheduled_time);
    } else {
      setTimeHour(''); setTimeMinute(''); setTimeAmPm('AM'); setScheduledTime('');
    }
    setAssignedTo(lead?.assigned_to || '');
    setShowCustomAssignee(false);
    setCustomAssignee('');
    setEstimatedHours(lead?.estimated_hours || '');
    setActualHours(lead?.actual_hours || '');
  }, [lead?.id, lead?.assigned_to, lead?.scheduled_time, teamMembers]);

  useEffect(() => {
    setScheduledTime(buildTimeString(timeHour, timeMinute, timeAmPm));
  }, [timeHour, timeMinute, timeAmPm]);

  const scheduleEmailLog = useMemo(() => {
    try {
      const raw = lead?.schedule_emails;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [lead?.schedule_emails]);

  const handleSave = async () => {
    if (!hasProject) { toast.error('Convert to project first'); return; }
    const finalAssignee = showCustomAssignee ? customAssignee : assignedTo;
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_project',
          scheduled_date: scheduledDate || null,
          scheduled_time: scheduledTime || null,
          assigned_to: finalAssignee || null,
          estimated_hours: estimatedHours || null,
          actual_hours: actualHours || null,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Scheduling saved!');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const isCurrentAssigneeTeamMember = teamMembers.some(m => m.name === assignedTo);

  const handleCalendarSelection = (date: string, time: string) => {
    setScheduledDate(date);
    const { hour, minute, ampm } = parseTimeString(time);
    setTimeHour(hour); setTimeMinute(minute); setTimeAmPm(ampm);
    setScheduledTime(time);
  };

  const scheduledLabel = scheduledDate
    ? `${new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${timeHour && timeMinute ? ` at ${timeHour}:${timeMinute} ${timeAmPm}` : ''}`
    : null;

  return (
    <div className="overflow-hidden">

      {/* Section header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-5 h-5 bg-emerald-50 flex items-center justify-center text-xs">📅</span>
          Scheduling
          {scheduledLabel && (
            <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-bold">
              {scheduledLabel}
            </span>
          )}
        </h3>

        {/* Save + More actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMoreActions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMoreActions(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white shadow-2xl border border-gray-100 z-50 w-64 p-2">
                  <div onClick={() => setShowMoreActions(false)}>
                    <SendCustomerEmailButtons
                      leadId={lead.id}
                      type="schedule"
                      currentUser={currentUser}
                      onRefresh={onRefresh}
                      hasSchedule={!!scheduledDate}
                      disabled={!hasProject}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Assigned To */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
            Assigned To
          </label>
          {!showCustomAssignee ? (
            <select
              value={assignedTo}
              onChange={(e) => {
                if (e.target.value === '__custom__') { setShowCustomAssignee(true); setAssignedTo(''); }
                else setAssignedTo(e.target.value);
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none bg-white transition"
            >
              <option value="">Select team member...</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}{m.id === currentUser?.id ? ' (You)' : ''}
                </option>
              ))}
              {assignedTo && !isCurrentAssigneeTeamMember && (
                <option value={assignedTo}>{assignedTo} (Custom)</option>
              )}
              <option value="__custom__">Enter custom name...</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customAssignee}
                onChange={(e) => setCustomAssignee(e.target.value)}
                placeholder="e.g., Mike"
                autoFocus
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customAssignee.trim()) { setAssignedTo(customAssignee); setShowCustomAssignee(false); }
                  if (e.key === 'Escape') { setShowCustomAssignee(false); setCustomAssignee(''); }
                }}
              />
              <button
                onClick={() => { if (customAssignee.trim()) { setAssignedTo(customAssignee); setShowCustomAssignee(false); } }}
                disabled={!customAssignee.trim()}
                className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition"
              >
                Add
              </button>
              <button
                onClick={() => { setShowCustomAssignee(false); setCustomAssignee(''); }}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Date</label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Time</label>
          <div className="flex items-center gap-1">
            <select value={timeHour} onChange={(e) => setTimeHour(e.target.value)}
              className="flex-1 px-2 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none bg-white transition">
              <option value="">HH</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-gray-300 font-bold">:</span>
            <select value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)}
              className="flex-1 px-2 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none bg-white transition">
              <option value="">MM</option>
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <select value={timeAmPm} onChange={(e) => setTimeAmPm(e.target.value)}
              className="flex-1 px-2 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none bg-white transition">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Est Hours */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Est. Hours</label>
          <input type="number" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="2.5"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition" />
        </div>

        {/* Actual Hours */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Actual Hours</label>
          <input type="number" step="0.5" value={actualHours} onChange={(e) => setActualHours(e.target.value)}
            placeholder="3.0"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition" />
        </div>

        {/* View Calendar */}
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={() => setShowCalendarModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-gray-600 font-semibold"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            View Calendar
          </button>
        </div>

      </div>

      {/* Email history */}
      {scheduleEmailLog.length > 0 && (
        <div className="px-5 pb-5 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" /> Email History
          </p>
          {[...scheduleEmailLog].reverse().map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-emerald-900">
  {entry.scheduled_date
  ? (() => {
      const dateOnly = entry.scheduled_date.split(' ')[0]; // Gets '2026-03-25'
      const d = new Date(dateOnly + 'T00:00:00');
      return isNaN(d.getTime()) ? dateOnly : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    })()
  : 'No date'}
{entry.scheduled_time ? ` at ${(() => {
  const [h, m] = entry.scheduled_time.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
})()}` : ''}                </span>
                <span className="text-xs text-emerald-500">by {entry.sent_by_email}</span>
              </div>
              <span className="text-xs text-emerald-500">
                {new Date(entry.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      <SchedulingCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDateTime={handleCalendarSelection}
        companySlug={companySlug}
        currentScheduledDate={scheduledDate}
        currentScheduledTime={scheduledTime}
        selectedTeamMember={assignedTo}
      />
    </div>
  );
}