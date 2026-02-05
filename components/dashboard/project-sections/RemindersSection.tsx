'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Clock, AlertCircle, CheckCircle, Calendar, Edit2, Trash2 } from 'lucide-react';

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

  // Get the appropriate icon and styling based on status
  const getReminderStyle = () => {
    if (isOverdue) {
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-700'
      };
    }
    if (isToday) {
      return {
        icon: Clock,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-800',
        badgeColor: 'bg-yellow-100 text-yellow-700'
      };
    }
    return {
      icon: Calendar,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-100 text-blue-700'
    };
  };

  const style = getReminderStyle();
  const IconComponent = style.icon;

  return (
    <div className="p-4 space-y-3">
      {!isEditing && !hasReminder && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-sm mb-4 font-medium">No follow-up reminder set</p>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Calendar className="w-4 h-4" />
            Set Reminder
          </button>
        </div>
      )}

      {!isEditing && hasReminder && (
        <div className="space-y-3">
          {/* Modern Reminder Display */}
          <div className={`
            p-4 rounded-xl border ${style.bgColor} ${style.borderColor}
          `}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${style.badgeColor.split(' ')[0]}/20`}>
                  <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
                </div>
                <div>
                  <div className={`font-semibold ${style.textColor}`}>
                    {new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {(isOverdue || isToday) && (
                    <div className={`text-xs font-medium mt-0.5 ${style.badgeColor} inline-block px-2 py-0.5 rounded`}>
                      {isOverdue ? 'Overdue' : 'Due Today'}
                    </div>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleClear}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>
            
            {lead.follow_up_notes && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{lead.follow_up_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Follow-up Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              placeholder="What do you need to follow up on?"
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !followUpDate}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Reminder'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFollowUpDate(lead?.follow_up_date || '');
                setFollowUpNotes(lead?.follow_up_notes || '');
              }}
              disabled={isSaving}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}