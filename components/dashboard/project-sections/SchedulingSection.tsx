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
        const response = await fetch('/api/team/members');
        const data = await response.json();
        if (data.success) setTeamMembers(data.members);
      } catch (error) {
        console.error('Failed to fetch team members:', error);
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
      setTimeHour('');
      setTimeMinute('');
      setTimeAmPm('AM');
      setScheduledTime('');
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

  // Parse email log safely, updates whenever lead refreshes
  const scheduleEmailLog = useMemo(() => {
    try {
      const raw = lead?.schedule_emails;
      console.log('schedule_emails raw:', raw); // remove after debugging
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
      console.log('schedule_emails parsed:', parsed); // remove after debugging
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [lead?.schedule_emails]);

  const handleUpdateProject = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }
    const finalAssignee = showCustomAssignee ? customAssignee : assignedTo;
    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
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
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Project updated!');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Project update error:', error);
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const isCurrentAssigneeTeamMember = teamMembers.some(m => m.name === assignedTo);

  const handleCalendarSelection = (date: string, time: string) => {
    setScheduledDate(date);
    const { hour, minute, ampm } = parseTimeString(time);
    setTimeHour(hour);
    setTimeMinute(minute);
    setTimeAmPm(ampm);
    setScheduledTime(time);
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">

      {/* Header */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-800">Scheduling</div>
        <div className="text-xs text-gray-500">
          {scheduledDate
            ? `Scheduled: ${new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${timeHour && timeMinute ? ` at ${timeHour}:${timeMinute} ${timeAmPm}` : ''}`
            : 'No date scheduled'}
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="space-y-4">

          {/* Assigned To */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Assigned To
            </label>
            {!showCustomAssignee ? (
              <select
                value={assignedTo}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setShowCustomAssignee(true);
                    setAssignedTo('');
                  } else {
                    setAssignedTo(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}{member.id === currentUser?.id ? ' (You)' : ''}
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
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customAssignee.trim()) {
                      setAssignedTo(customAssignee);
                      setShowCustomAssignee(false);
                    }
                    if (e.key === 'Escape') {
                      setShowCustomAssignee(false);
                      setCustomAssignee('');
                    }
                  }}
                />
                <button
                  onClick={() => { if (customAssignee.trim()) { setAssignedTo(customAssignee); setShowCustomAssignee(false); } }}
                  disabled={!customAssignee.trim()}
                  className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowCustomAssignee(false); setCustomAssignee(''); }}
                  className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Time
              </label>
              <div className="flex items-center gap-1">
                <select
                  value={timeHour}
                  onChange={(e) => setTimeHour(e.target.value)}
                  className="flex-1 min-w-0 px-1 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">HH</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-gray-400 font-bold text-xs">:</span>
                <select
                  value={timeMinute}
                  onChange={(e) => setTimeMinute(e.target.value)}
                  className="flex-1 min-w-0 px-1 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">MM</option>
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <select
                  value={timeAmPm}
                  onChange={(e) => setTimeAmPm(e.target.value)}
                  className="flex-1 min-w-0 px-1 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">

          {/* Est. vs Actual Hours */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Est. Hrs
              </label>
              <input
                type="number"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="2.5"
                className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Actual Hrs
              </label>
              <input
                type="number"
                step="0.5"
                value={actualHours}
                onChange={(e) => setActualHours(e.target.value)}
                placeholder="3.0"
                className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* View Calendar */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Calendar
            </label>
            <button
              type="button"
              onClick={() => setShowCalendarModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-white hover:border-gray-400 transition text-gray-700 font-medium"
            >
              <Calendar className="w-4 h-4" />
              View Calendar
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <div className="flex gap-2">
              <button
                onClick={handleUpdateProject}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Scheduling'}
              </button>

              {/* More Actions */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMoreActions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreActions(false)} />
                    <div
                      className="absolute right-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-64"
                      style={{ bottom: '100%', marginBottom: '8px' }}
                    >
                      <div className="p-2" onClick={(e) => e.stopPropagation()}>
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

        </div>
      </div>

      {/* Email History Log */}
      {scheduleEmailLog.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Schedule Email History
          </p>
          {[...scheduleEmailLog].reverse().map((entry: any, idx: number) => (
            <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-900">
                    {entry.scheduled_date
                      ? new Date(entry.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })
                      : 'No date'}
                    {entry.scheduled_time ? ` at ${entry.scheduled_time}` : ''}
                  </span>
                </div>
                <span className="text-xs text-green-700">
                  {new Date(entry.sent_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">by {entry.sent_by_email}</p>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Modal */}
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