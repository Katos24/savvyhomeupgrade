'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, User, Timer, Save, MoreVertical, Mail } from 'lucide-react';
import { parseNotes } from '@/lib/utils';
import SendCustomerEmailButtons from '../SendCustomerEmailButtons';


type SchedulingSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function SchedulingSection({ lead, currentUser, onRefresh, hasProject }: SchedulingSectionProps) {
  const [saving, setSaving] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
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

  // Update state when lead changes
  useEffect(() => {
    setScheduledDate(lead?.scheduled_date ? new Date(lead.scheduled_date).toISOString().split('T')[0] : '');
    setScheduledTime(lead?.scheduled_time || '');
    
    // Check if assigned_to is a team member or custom entry
    const isTeamMember = teamMembers.some(member => member.name === lead?.assigned_to);
    if (lead?.assigned_to && !isTeamMember) {
      setShowCustomAssignee(true);
      setCustomAssignee(lead.assigned_to);
      setAssignedTo('custom');
    } else {
      setAssignedTo(lead?.assigned_to || '');
      setShowCustomAssignee(false);
      setCustomAssignee('');
    }
    
    setEstimatedHours(lead?.estimated_hours || '');
    setActualHours(lead?.actual_hours || '');
  }, [lead?.id, lead?.scheduled_time, teamMembers]);

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

    console.log('🎯 Saving with scheduledTime:', scheduledTime);

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

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-3">
        {/* Assigned To – full width with dropdown */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
            <User className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
            Assigned To
          </label>
          
          {!showCustomAssignee ? (
            <div className="flex gap-2">
              <select
                value={assignedTo}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomAssignee(true);
                    setAssignedTo('');
                  } else {
                    setAssignedTo(e.target.value);
                  }
                }}
                className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-100
                           focus:outline-none transition bg-white"
              >
                <option value="">Select team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name} {member.id === currentUser?.id && '(You)'}
                  </option>
                ))}
                <option value="custom">➕ Enter custom name...</option>
              </select>
            </div>
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
              />
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
          <p className="text-xs text-gray-500 mt-1">
            Select a team member or enter a custom name
          </p>
        </div>

        {/* Everything else */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
              <Calendar className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
              Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => {
                console.log('📅 Date changed:', e.target.value);
                setScheduledDate(e.target.value);
              }}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300
                         focus:border-green-500 focus:ring-2 focus:ring-green-100
                         focus:outline-none transition"
            />
          </div>

          {/* Time - Dropdown selector */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
              <Clock className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
              Time
            </label>
            <select
              value={scheduledTime}
              onChange={(e) => {
                console.log('⏰ Time selected:', e.target.value);
                setScheduledTime(e.target.value);
              }}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                         focus:outline-none transition bg-white"
            >
              <option value="">Select time...</option>
              {Array.from({ length: 48 }, (_, i) => {
                const hour = Math.floor(i / 2);
                const minute = i % 2 === 0 ? '00' : '30';
                const time24 = `${hour.toString().padStart(2, '0')}:${minute}`;
                const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const ampm = hour < 12 ? 'AM' : 'PM';
                const time12 = `${hour12}:${minute} ${ampm}`;
                
                return (
                  <option key={time24} value={time24}>
                    {time12}
                  </option>
                );
              })}
            </select>
            {scheduledTime && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formatTimeDisplay(scheduledTime)}
              </p>
            )}
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
    </div>
  );
}