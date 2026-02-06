'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Workflow, Plus, X } from 'lucide-react';

type StatusOption = {
  value: string;
  label: string;
  color: string;
};

const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: '#3b82f6' },
  { value: 'contacted', label: 'Contacted', color: '#eab308' },
  { value: 'quoted', label: 'Quoted', color: '#a855f7' },
  { value: 'in-progress', label: 'In Progress', color: '#f97316' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
];

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#f97316', label: 'Orange' },
  { value: '#22c55e', label: 'Green' },
  { value: '#ef4444', label: 'Red' },
  { value: '#6b7280', label: 'Gray' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#ec4899', label: 'Pink' },
];

export default function PipelineTab({ company, currentUser }: { company: any; currentUser: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [statuses, setStatuses] = useState<StatusOption[]>(
    company.status_options && company.status_options.length > 0
      ? company.status_options
      : DEFAULT_STATUSES
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStatus, setNewStatus] = useState({ label: '', color: '#3b82f6' });

  const handleRemoveStatus = (index: number) => {
    if (statuses.length <= 1) {
      setError('You must have at least 1 status');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setStatuses(statuses.filter((_, i) => i !== index));
  };

  const handleAddStatus = () => {
    if (!newStatus.label.trim()) {
      setError('Please enter a status label');
      return;
    }

    if (statuses.length >= 10) {
      setError('Maximum 10 statuses allowed');
      return;
    }

    const value = newStatus.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setStatuses([...statuses, { ...newStatus, value }]);
    setNewStatus({ label: '', color: '#3b82f6' });
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (statuses.length < 1) {
      setError('You must have at least 1 status');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-pipeline',
          data: {
            status_options: statuses,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Pipeline statuses saved successfully! Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || 'Failed to save statuses');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save statuses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Pipeline Statuses</h2>
        <p className="text-slate-600">Customize the workflow stages for your leads</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg">✓</span>
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              {statuses.length} statuses • Max: 10
            </p>
            {statuses.length < 10 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                <Plus className="w-4 h-4" />
                Add Status
              </button>
            )}
          </div>

          {/* Add Status Form */}
          {showAddForm && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-bold mb-3 text-slate-900">Add Custom Status</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Status Label *
                  </label>
                  <input
                    type="text"
                    value={newStatus.label}
                    onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
                    placeholder="e.g., Waiting for Approval"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-9 gap-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewStatus({ ...newStatus, color: color.value })}
                        className={`h-10 rounded-lg transition ${
                          newStatus.color === color.value ? 'ring-4 ring-offset-2 ring-blue-500' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddStatus}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold"
                  >
                    Add Status
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewStatus({ label: '', color: '#3b82f6' });
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Statuses List */}
          <div className="space-y-2">
            {statuses.map((status, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-4 rounded-lg border border-slate-200 group transition"
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: status.color }}
                />
                <span className="flex-1 font-semibold text-slate-900">
                  {status.label}
                </span>
                <button
                  onClick={() => handleRemoveStatus(index)}
                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity"
                  title="Remove status"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> These statuses appear in your dashboard when managing leads. 
            Organize them in the order you want them to appear.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Statuses'}
          </button>
        </div>
      </div>
    </div>
  );
}
