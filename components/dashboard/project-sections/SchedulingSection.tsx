'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import SendCustomerEmailButtons from '../SendCustomerEmailButtons';

type SchedulingSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function SchedulingSection({ lead, currentUser, onRefresh, hasProject }: SchedulingSectionProps) {
  const [saving, setSaving] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    lead?.scheduled_date ? new Date(lead.scheduled_date).toISOString().split('T')[0] : ''
  );
  const [scheduledTime, setScheduledTime] = useState(lead?.scheduled_time || '');
  const [assignedTo, setAssignedTo] = useState(lead?.assigned_to || '');
  const [estimatedHours, setEstimatedHours] = useState(lead?.estimated_hours || '');
  const [actualHours, setActualHours] = useState(lead?.actual_hours || '');

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
    <div className="space-y-3 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned To</label>
          <input
            type="text"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="e.g., Mike"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <SendCustomerEmailButtons
          leadId={lead.id}
          type="schedule"
          currentUser={currentUser}
          onRefresh={onRefresh}
          hasSchedule={!!scheduledDate}
          disabled={!hasProject}
        />
        
        <div className="relative z-20">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="relative z-20">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Est. Hours</label>
          <input
            type="number"
            step="0.5"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="2.5"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Actual Hours</label>
          <input
            type="number"
            step="0.5"
            value={actualHours}
            onChange={(e) => setActualHours(e.target.value)}
            placeholder="3.0"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleUpdateProject}
        disabled={saving}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 text-sm rounded-lg transition"
      >
        {saving ? 'Saving...' : 'Save Scheduling'}
      </button>
    </div>
  );
}