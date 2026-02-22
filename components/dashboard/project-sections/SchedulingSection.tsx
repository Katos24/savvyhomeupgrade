'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, User, Timer, Save, MoreVertical, Mail } from 'lucide-react';
import { parseNotes } from '@/lib/utils';
import SendCustomerEmailButtons from '@/components/dashboard/SendCustomerEmailButtons';
import SchedulingCalendarModal from './SchedulingCalendarModal';

type SchedulingSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string; // Add this
};

export default function SchedulingSection({ lead, currentUser, onRefresh, hasProject, companySlug }: SchedulingSectionProps) {
  console.log('🔍 SchedulingSection received companySlug:', companySlug);
  console.log('🔍 SchedulingSection typeof companySlug:', typeof companySlug);
  
  const [saving, setSaving] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // New separate time components
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('');
  const [timeAmPm, setTimeAmPm] = useState('AM');
  
  const [assignedTo, setAssignedTo] = useState('');
  const [showCustomAssignee, setShowCustomAssignee] = useState(false);
  const [customAssignee, setCustomAssignee] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Fetch team members
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const response = await fetch('/api/team/members');
        const data = await response.json();
        if (data.success) {
          setTeamMembers(data.members);
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      }
    }
    fetchTeamMembers();
  }, []);

  // Parse 24-hour time string into hour/minute/ampm components
  const parseTimeString = (time24: string) => {
    if (!time24) return { hour: '', minute: '', ampm: 'AM' };
    
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    
    return {
      hour: hour12.toString(),
      minute: minutes,
      ampm: ampm
    };
  };

  // Convert hour/minute/ampm back to 24-hour format
  const buildTimeString = (hour: string, minute: string, ampm: string) => {
    if (!hour || !minute) return '';
    
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  // Update state when lead changes
  useEffect(() => {
    setScheduledDate(lead?.scheduled_date ? new Date(lead.scheduled_date).toISOString().split('T')[0] : '');
    
    // Parse the time
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
    
    // Check if assigned_to is a team member or custom entry
    if (lead?.assigned_to) {
      const isTeamMember = teamMembers.some(member => member.name === lead.assigned_to);
      if (isTeamMember) {
        setAssignedTo(lead.assigned_to);
        setShowCustomAssignee(false);
        setCustomAssignee('');
      } else {
        setAssignedTo(lead.assigned_to);
        setShowCustomAssignee(false);
        setCustomAssignee('');
      }
    } else {
      setAssignedTo('');
      setShowCustomAssignee(false);
      setCustomAssignee('');
    }
    
    setEstimatedHours(lead?.estimated_hours || '');
    setActualHours(lead?.actual_hours || '');
  }, [lead?.id, lead?.assigned_to, lead?.scheduled_time, teamMembers]);

  // Update scheduledTime whenever time components change
  useEffect(() => {
    const newTime = buildTimeString(timeHour, timeMinute, timeAmPm);
    setScheduledTime(newTime);
  }, [timeHour, timeMinute, timeAmPm]);

  // Parse activity log
  const notesArray = parseNotes(lead.notes);
  const scheduleEmails = notesArray.filter((note: any) => {
    if (typeof note === 'string') return false;
    return (note.type === 'email_sent' || note.type === 'schedule_sent') && 
           (note.text?.toLowerCase().includes('schedule') || note.email_type === 'schedule');
  });

  const lastEmailSent = scheduleEmails.length > 0 ? {
    timestamp: scheduleEmails[scheduleEmails.length - 1].timestamp,
    userName: scheduleEmails[scheduleEmails.length - 1].user_name || 'Unknown',
    count: scheduleEmails.length
  } : null;

  // Format time for display (convert 14:30 to 2:30 PM)
  const formatTimeDisplay = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleUpdateProject = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }

    // Determine final assignee value
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

  // Check if current assignedTo is a team member
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
    <div className="space-y-4 p-4">
      <div className="space-y-3">
        {/* Assigned To – NOT full width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
              <User className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
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
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                           focus:outline-none transition bg-white"
              >
                <option value="">Select team member...</option>
                
                {/* Team members */}
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name} {member.id === currentUser?.id && '(You)'}
                  </option>
                ))}
                
                {/* Show current custom assignee if it exists and is not a team member */}
                {assignedTo && !isCurrentAssigneeTeamMember && (
                  <option value={assignedTo}>
                    {assignedTo} (Custom)
                  </option>
                )}
                
                <option value="__custom__">➕ Enter custom name...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAssignee}
                  onChange={(e) => setCustomAssignee(e.target.value)}
                  placeholder="e.g., Mike"
                  className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                             focus:outline-none transition"
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
                  onClick={() => {
                    if (customAssignee.trim()) {
                      setAssignedTo(customAssignee);
                      setShowCustomAssignee(false);
                    }
                  }}
                  disabled={!customAssignee.trim()}
                  className="px-3 py-2.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomAssignee(false);
                    setCustomAssignee('');
                  }}
                  className="px-3 py-2.5 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Everything else */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Date Input */}
<div>
  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
    <Calendar className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
    Date
  </label>
  <input
    type="date"
    value={scheduledDate}
    onChange={(e) => setScheduledDate(e.target.value)}
    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300
               focus:border-green-500 focus:ring-2 focus:ring-green-100
               focus:outline-none transition"
  />
</div>

{/* Time Input - Hour/Minute/AM-PM */}
<div>
  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
    <Clock className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
    Time
  </label>
  <div className="flex gap-2">
    {/* Hour - Narrower */}
    <select
      value={timeHour}
      onChange={(e) => setTimeHour(e.target.value)}
      className="w-20 px-3 py-2.5 text-sm rounded-lg border border-gray-300
                 focus:border-green-500 focus:ring-2 focus:ring-green-100
                 focus:outline-none transition bg-white
                 appearance-none cursor-pointer
                 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')]
                 bg-[length:12px] bg-[position:right_0.75rem_center] bg-no-repeat pr-8"
    >
      <option value="">HH</option>
      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
        <option key={h} value={h}>{h}</option>
      ))}
    </select>

    <span className="flex items-center text-gray-400 font-bold">:</span>

    {/* Minute - Narrower */}
    <select
      value={timeMinute}
      onChange={(e) => setTimeMinute(e.target.value)}
      className="w-20 px-3 py-2.5 text-sm rounded-lg border border-gray-300
                 focus:border-green-500 focus:ring-2 focus:ring-green-100
                 focus:outline-none transition bg-white
                 appearance-none cursor-pointer
                 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')]
                 bg-[length:12px] bg-[position:right_0.75rem_center] bg-no-repeat pr-8"
    >
      <option value="">MM</option>
      <option value="00">00</option>
      <option value="15">15</option>
      <option value="30">30</option>
      <option value="45">45</option>
    </select>

    {/* AM/PM - Narrower */}
    <select
      value={timeAmPm}
      onChange={(e) => setTimeAmPm(e.target.value)}
      className="w-20 px-3 py-2.5 text-sm rounded-lg border border-gray-300
                 focus:border-green-500 focus:ring-2 focus:ring-green-100
                 focus:outline-none transition bg-white
                 appearance-none cursor-pointer
                 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')]
                 bg-[length:12px] bg-[position:right_0.75rem_center] bg-no-repeat pr-8"
    >
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>
  </div>
</div>

{/* View Calendar Button - Narrower */}
<div className="sm:col-span-2 flex justify-center">
  <button
    type="button"
    onClick={() => setShowCalendarModal(true)}
    className="px-6 py-2.5 text-sm text-center rounded-lg border border-gray-300
               hover:border-gray-400 hover:bg-gray-50 transition
               text-gray-700 font-medium 
               flex items-center gap-2"
  >
    <Calendar className="w-4 h-4" />
    View Calendar
  </button>
</div>

          {/* Estimated Hours */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
              <Timer className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
              Est. Hours
            </label>
            <input
              type="number"
              step="0.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="2.5"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300
                         focus:border-amber-500 focus:ring-2 focus:ring-amber-100
                         focus:outline-none transition"
            />
          </div>

          {/* Actual Hours */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
              <Timer className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
              Actual Hours
            </label>
            <input
              type="number"
              step="0.5"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              placeholder="3.0"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300
                         focus:border-red-500 focus:ring-2 focus:ring-red-100
                         focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="space-y-3">
        <div className="flex gap-2 relative">
          <button
            onClick={handleUpdateProject}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 text-sm rounded-lg transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Scheduling'}
          </button>

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="px-3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition shadow-sm"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreActions && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMoreActions(false)}
                />
                
                <div 
                  className="absolute right-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-64"
                  style={{ bottom: '100%', marginBottom: '8px' }}
                >
                  <div className="p-2">
                  <div onClick={(e) => e.stopPropagation()}>
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
                </div>
              </>
            )}
          </div>
        </div>

        {/* Email Sent Log */}
        {lastEmailSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">
                  Schedule emailed to customer
                </p>
                
                {scheduledDate && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-green-700">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {scheduledTime && ` at ${formatTimeDisplay(scheduledTime)}`}
                    </span>
                  </div>
                )}
                
                {lastEmailSent && (
                  <p className="text-xs text-green-700 mt-1.5">
                    Last sent by <span className="font-medium">{lastEmailSent.userName}</span> on{' '}
                    {new Date(lastEmailSent.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scheduling Calendar Modal */}
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