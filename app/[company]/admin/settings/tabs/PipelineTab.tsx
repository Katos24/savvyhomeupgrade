'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

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

export default function PipelineTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [statuses, setStatuses] = useState<StatusOption[]>(
    company.status_options?.length ? company.status_options : DEFAULT_STATUSES
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStatus, setNewStatus] = useState({ label: '', color: '#3b82f6' });

  const moveStatus = (from: number, to: number) => {
    if (to < 0 || to >= statuses.length) return;
    const updated = [...statuses];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setStatuses(updated);
  };

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
    if (!statuses.length) {
      setError('You must have at least 1 status');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-pipeline',
          data: { status_options: statuses },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Pipeline statuses saved successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Failed to save statuses');
      }
    } catch {
      setError('Failed to save statuses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Pipeline Statuses
        </h2>
        <p className="text-slate-600">
          Customize the workflow stages for your leads
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {statuses.length} statuses • Max: 10
          </p>

          {statuses.length < 10 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              <Plus className="w-4 h-4" />
              Add Status
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="space-y-3">
              <input
                type="text"
                value={newStatus.label}
                onChange={(e) =>
                  setNewStatus({ ...newStatus, label: e.target.value })
                }
                placeholder="Status label"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />

              <div className="grid grid-cols-9 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      setNewStatus({ ...newStatus, color: color.value })
                    }
                    className={`h-8 rounded ${
                      newStatus.color === color.value
                        ? 'ring-4 ring-blue-500'
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddStatus}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-slate-200 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {statuses.map((status, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg group"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: status.color }}
              />

              <span className="flex-1 font-semibold">
                {status.label}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  disabled={index === 0}
                  onClick={() => moveStatus(index, index - 1)}
                  className="p-1 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  disabled={index === statuses.length - 1}
                  onClick={() => moveStatus(index, index + 1)}
                  className="p-1 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleRemoveStatus(index)}
                className="opacity-0 group-hover:opacity-100 text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save Statuses'}
          </button>
        </div>
      </div>
    </div>
  );
}
