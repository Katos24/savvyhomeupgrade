'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type RemindersSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function RemindersSection({ lead, currentUser, onRefresh, hasProject }: RemindersSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(lead?.follow_up_date || '');
  const [followUpNotes, setFollowUpNotes] = useState(lead?.follow_up_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_project',
          follow_up_date: followUpDate || null,
          follow_up_notes: followUpNotes || null,
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Reminder saved!');
        await onRefresh();
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to save reminder');
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Failed to save reminder');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear this reminder?')) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_project',
          follow_up_date: null,
          follow_up_notes: null,
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFollowUpDate('');
        setFollowUpNotes('');
        toast.success('Reminder cleared!');
        await onRefresh();
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Failed to clear reminder');
      }
    } catch (error) {
      console.error('Error clearing reminder:', error);
      toast.error('Failed to clear reminder');
    } finally {
      setIsSaving(false);
    }
  };

  const hasReminder = lead?.follow_up_date;
  const isOverdue = hasReminder && new Date(lead.follow_up_date) < new Date();
  const isToday = hasReminder && new Date(lead.follow_up_date).toDateString() === new Date().toDateString();

  return (
    <div className="p-4 space-y-3">
      {!isEditing && !hasReminder && (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">⏰</div>
          <p className="text-gray-500 text-sm mb-3">No follow-up reminder set</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Set Reminder
          </button>
        </div>
      )}

      {!isEditing && hasReminder && (
        <div className="space-y-3">
          {/* Reminder Display */}
          <div className={`
            p-4 rounded-lg border-2
            ${isOverdue ? 'bg-red-50 border-red-300' : 
              isToday ? 'bg-yellow-50 border-yellow-300' : 
              'bg-blue-50 border-blue-300'}
          `}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {isOverdue ? '🔴' : isToday ? '⚠️' : '⏰'}
                </span>
                <div>
                  <div className="font-semibold text-gray-800">
                    {new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {isOverdue && (
                    <div className="text-xs text-red-600 font-medium">Overdue</div>
                  )}
                  {isToday && (
                    <div className="text-xs text-yellow-700 font-medium">Due Today</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setFollowUpDate(lead.follow_up_date);
                    setFollowUpNotes(lead.follow_up_notes || '');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={handleClear}
                  disabled={isSaving}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {lead.follow_up_notes && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.follow_up_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              placeholder="What do you need to follow up on?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !followUpDate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Reminder'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFollowUpDate(lead?.follow_up_date || '');
                setFollowUpNotes(lead?.follow_up_notes || '');
              }}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}