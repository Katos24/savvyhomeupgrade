'use client';

import { useState } from 'react';
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
  const [emailSent, setEmailSent] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    lead?.scheduled_date ? new Date(lead.scheduled_date).toISOString().split('T')[0] : ''
  );
  const [scheduledTime, setScheduledTime] = useState(lead?.scheduled_time || '');
  const [assignedTo, setAssignedTo] = useState(lead?.assigned_to || '');
  const [estimatedHours, setEstimatedHours] = useState(lead?.estimated_hours || '');
  const [actualHours, setActualHours] = useState(lead?.actual_hours || '');

  // Parse activity log and find schedule emails
  const notesArray = parseNotes(lead.notes);
  const scheduleEmails = notesArray.filter((note: any) => {
    if (typeof note === 'string') return false;
    // Look for email_sent or schedule_sent activity types
    return (note.type === 'email_sent' || note.type === 'schedule_sent') && 
           (note.text?.toLowerCase().includes('schedule') || note.email_type === 'schedule');
  });

  const lastEmailSent = scheduleEmails.length > 0 ? {
    timestamp: scheduleEmails[scheduleEmails.length - 1].timestamp,
    userName: scheduleEmails[scheduleEmails.length - 1].user_name || 'Unknown',
    count: scheduleEmails.length
  } : null;

  const handleUpdateProject = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }

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
          assigned_to: assignedTo || null,
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
    <div className="space-y-4 p-4 pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Assigned To */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
            <User className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
            Assigned To
          </label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="e.g., Mike"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition"
          />
        </div>
        
        {/* Date */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
            <Calendar className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
            Date
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition"
          />
        </div>

        {/* Time */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
            <Clock className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
            Time
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
          />
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
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:outline-none transition"
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
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Save Button with More Actions Dropdown */}
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

          {/* More Actions Dropdown - Always Available */}
          <div className="relative">
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="px-3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition shadow-sm"
              aria-label="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreActions && (
              <>
                {/* Backdrop to close dropdown */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMoreActions(false)}
                />
                
                {/* Dropdown Menu - FORCED ABOVE */}
                <div 
                  className="absolute right-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-64"
                  style={{ bottom: '100%', marginBottom: '8px' }}
                >
                  <div className="p-2">
                    <div onClick={() => {
                      setEmailSent(true);
                      setShowMoreActions(false);
                    }}>
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
        {(emailSent || lastEmailSent) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">
                  Schedule emailed to customer
                </p>
                
                {/* Show scheduled date/time that was sent */}
                {scheduledDate && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-green-700">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {new Date(scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {scheduledTime && ` at ${scheduledTime}`}
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
                {emailSent && !lastEmailSent && (
                  <p className="text-xs text-green-700 mt-1.5">
                    Just sent by <span className="font-medium">{currentUser?.name || 'you'}</span>
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