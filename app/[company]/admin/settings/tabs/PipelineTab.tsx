'use client';

import { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown, AlertCircle, AlertTriangle, Workflow, Lock } from 'lucide-react';

type StatusOption = {
  value: string;
  label: string;
  color: string;
};

const LOCKED_STATUSES = ['new', 'completed'];

const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'pink' },
  { value: 'contacted', label: 'Contacted', color: 'blue' },
  { value: 'quoted', label: 'Quoted', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'purple' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'yellow', label: 'Yellow', hex: '#eab308' },
  { value: 'purple', label: 'Purple', hex: '#a855f7' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
  { value: 'green', label: 'Green', hex: '#22c55e' },
  { value: 'red', label: 'Red', hex: '#ef4444' },
  { value: 'gray', label: 'Gray', hex: '#6b7280' },
  { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
];

export default function PipelineTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; label: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [statuses, setStatuses] = useState<StatusOption[]>(() => {
    const saved = company.status_options;
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return DEFAULT_STATUSES;
  });

  const getColorHex = (name: string) => COLOR_OPTIONS.find(c => c.value === name)?.hex || '#3b82f6';
  const isLocked = (s: StatusOption) => LOCKED_STATUSES.includes(s.value);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const moveStatus = (from: number, to: number) => {
    if (to < 0 || to >= statuses.length) return;
    if (isLocked(statuses[from])) return;
    // Can't move to position 0 (New is locked there) or last position (Completed is locked there)
    if (to === 0) return;
    if (to === statuses.length - 1) return;
    const updated = [...statuses];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setStatuses(updated);
  };

  const handleRemoveStatus = (index: number) => {
    if (isLocked(statuses[index])) return;
    setDeleteConfirm({ index, label: statuses[index].label });
  };

  const confirmRemove = () => {
    if (!deleteConfirm) return;
    setStatuses(prev => prev.filter((_, i) => i !== deleteConfirm.index));
    setDeleteConfirm(null);
  };

  const handleAddStatus = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) { showError('Please enter a status label'); return; }
    if (statuses.length >= 10) { showError('Maximum 10 statuses allowed'); return; }
    const value = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (LOCKED_STATUSES.includes(value)) { showError(`"${trimmed}" is a reserved status name`); return; }
    if (statuses.some(s => s.value === value)) { showError('A status with that name already exists'); return; }

    // Insert before the last item (Completed)
    const updated = [...statuses];
    updated.splice(updated.length - 1, 0, { value, label: trimmed, color: newColor });
    setStatuses(updated);
    setNewLabel('');
    setNewColor('blue');
    setShowAddForm(false);
  };

  const updateStatusLabel = (index: number, label: string) => {
    if (isLocked(statuses[index])) return;
    const updated = [...statuses];
    updated[index] = {
      ...updated[index],
      label,
      value: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    setStatuses(updated);
  };

  const updateStatusColor = (index: number, color: string) => {
    if (isLocked(statuses[index])) return;
    const updated = [...statuses];
    updated[index] = { ...updated[index], color };
    setStatuses(updated);
  };

  const handleSave = async () => {
    if (!statuses.some(s => s.value === 'new') || !statuses.some(s => s.value === 'completed')) {
      showError('"New" and "Completed" statuses are required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-pipeline', data: { status_options: statuses } }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Pipeline saved!');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showError(data.error || 'Failed to save');
      }
    } catch {
      showError('Failed to save statuses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-bold text-gray-900">Pipeline Statuses</h2>
        <p className="text-sm text-gray-500 mt-1">Customize the workflow stages for your leads and projects</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

        {/* Card Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Statuses</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">
              {statuses.length} / 10
            </span>
          </div>
          {statuses.length < 10 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Status
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="px-5 py-5 bg-indigo-50 border-b border-indigo-100">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-4">New Status</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
                  placeholder="e.g., Awaiting Approval"
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewColor(color.value)}
                      className={`w-8 h-8 rounded-full transition-transform ${newColor === color.value ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddStatus}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition"
                >
                  Add Status
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setNewLabel(''); setNewColor('blue'); }}
                  className="flex-1 py-2.5 bg-white hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status List */}
        <div className="divide-y divide-gray-50">
          {statuses.map((status, index) => {
            const locked = isLocked(status);
            const isFirst = index === 0;
            const isLast = index === statuses.length - 1;
            // Up disabled if: first row, locked, or moving would go to position 0 where New is locked
            const upDisabled = isFirst || locked || index === 1;
            // Down disabled if: last row, locked, or moving would go to last position where Completed is locked
            const downDisabled = isLast || locked || index === statuses.length - 2;

            return (
              <div
                key={`${status.value}-${index}`}
                className={`flex items-center gap-3 px-5 py-4 group transition-colors ${locked ? 'bg-gray-50/60' : 'bg-white hover:bg-gray-50'}`}
              >
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getColorHex(status.color) }}
                />

                {/* Label */}
                <input
                  type="text"
                  value={status.label}
                  onChange={(e) => updateStatusLabel(index, e.target.value)}
                  readOnly={locked}
                  className={`flex-1 min-w-0 px-2 py-1 text-sm font-semibold bg-transparent border-b-2 border-transparent transition-colors ${
                    locked
                      ? 'cursor-not-allowed text-gray-400 select-none'
                      : 'text-gray-800 hover:border-gray-200 focus:border-indigo-400 focus:outline-none'
                  }`}
                />

                {/* Color Swatches (unlocked only) */}
                {!locked && (
                  <div className="hidden sm:flex gap-1 flex-shrink-0">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => updateStatusColor(index, color.value)}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          status.color === color.value ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    ))}
                  </div>
                )}

                {/* Locked Badge */}
                {locked && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold px-2 py-0.5 bg-gray-100 rounded flex-shrink-0">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}

                {/* Up / Down / Delete */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    disabled={upDisabled}
                    onClick={() => moveStatus(index, index - 1)}
                    className="p-1.5 rounded hover:bg-gray-200 transition disabled:opacity-20 disabled:cursor-not-allowed text-gray-500"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={downDisabled}
                    onClick={() => moveStatus(index, index + 1)}
                    className="p-1.5 rounded hover:bg-gray-200 transition disabled:opacity-20 disabled:cursor-not-allowed text-gray-500"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {!locked ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveStatus(index)}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-7" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-500">Tip:</span> Arrange statuses in the order leads move through your workflow.{' '}
            <span className="font-semibold text-gray-500">New</span> and{' '}
            <span className="font-semibold text-gray-500">Completed</span> are locked system statuses.
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition whitespace-nowrap"
          >
            {loading ? 'Saving...' : 'Save Pipeline'}
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Delete "{deleteConfirm.label}"?</h3>
                  <p className="text-sm text-gray-500">Leads with this status will need to be reassigned. This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemove}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}