'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  X, 
  ChevronUp, 
  ChevronDown, 
  AlertCircle,
  AlertTriangle,
  Workflow,
  Palette,
  Lock
} from 'lucide-react';

type StatusOption = {
  value: string;
  label: string;
  color: string;
  emoji?: string;
};

const LOCKED_STATUSES = ['new', 'completed'];

const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'pink', emoji: '✨' },
  { value: 'contacted', label: 'Contacted', color: 'blue', emoji: '📞' },
  { value: 'quoted', label: 'Quoted', color: 'yellow', emoji: '💰' },
  { value: 'scheduled', label: 'Scheduled', color: 'purple', emoji: '📅' },
  { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
  { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
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

const EMOJI_OPTIONS = ['✨', '📞', '💰', '📅', '🔨', '✅', '📋', '🎯', '⚡', '🚀', '💼', '🏆', '⏰', '📊', '🔔'];

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
  const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; label: string } | null>(null);

  const [statuses, setStatuses] = useState<StatusOption[]>(
    company.status_options?.length ? company.status_options : DEFAULT_STATUSES
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStatus, setNewStatus] = useState({ 
    label: '', 
    color: 'blue',
    emoji: '📋'
  });

  const getColorHex = (colorName: string) => {
    return COLOR_OPTIONS.find(c => c.value === colorName)?.hex || '#3b82f6';
  };

  const isLocked = (status: StatusOption) => LOCKED_STATUSES.includes(status.value);

  const moveStatus = (from: number, to: number) => {
    if (to < 0 || to >= statuses.length) return;
    // Prevent moving locked statuses
    if (isLocked(statuses[from])) return;
    // Prevent moving into the first position if 'new' is locked there
    if (to === 0 && isLocked(statuses[0])) return;
    // Prevent moving into the last position if 'completed' is locked there
    if (to === statuses.length - 1 && isLocked(statuses[statuses.length - 1])) return;
    const updated = [...statuses];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setStatuses(updated);
  };

  const handleRemoveStatus = (index: number) => {
    if (isLocked(statuses[index])) return;
    if (statuses.length <= 1) {
      setError('You must have at least 1 status');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setDeleteConfirm({ index, label: statuses[index].label });
  };

  const confirmRemoveStatus = () => {
    if (deleteConfirm) {
      setStatuses(statuses.filter((_, i) => i !== deleteConfirm.index));
      setDeleteConfirm(null);
    }
  };

  const handleAddStatus = () => {
    if (!newStatus.label.trim()) {
      setError('Please enter a status label');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (statuses.length >= 10) {
      setError('Maximum 10 statuses allowed');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const value = newStatus.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Prevent adding a status with a locked value
    if (LOCKED_STATUSES.includes(value)) {
      setError(`"${newStatus.label}" is a reserved status name`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Insert before the last item (which should always be 'completed')
    const updated = [...statuses];
    updated.splice(updated.length - 1, 0, {
      value,
      label: newStatus.label.trim(),
      color: newStatus.color,
      emoji: newStatus.emoji,
    });
    setStatuses(updated);
    setNewStatus({ label: '', color: 'blue', emoji: '📋' });
    setShowAddForm(false);
  };

  const updateStatus = (index: number, field: 'label' | 'color' | 'emoji', value: string) => {
    if (isLocked(statuses[index])) return;
    const updated = [...statuses];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'label') {
      updated[index].value = value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    setStatuses(updated);
  };

  const handleSave = async () => {
    if (!statuses.length) {
      setError('You must have at least 1 status');
      return;
    }

    // Ensure new and completed are always present
    const hasNew = statuses.some(s => s.value === 'new');
    const hasCompleted = statuses.some(s => s.value === 'completed');
    if (!hasNew || !hasCompleted) {
      setError('"New" and "Completed" statuses are required');
      setTimeout(() => setError(''), 3000);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">
          Pipeline Statuses
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Customize the workflow stages for your leads and projects
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <span className="text-lg flex-shrink-0">✓</span>
          <span className="flex-1">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
        
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              {statuses.length} status{statuses.length !== 1 ? 'es' : ''} • Min: 1, Max: 10
            </p>
            {statuses.length < 10 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Status
              </button>
            )}
          </div>

          {/* Add Status Form */}
          {showAddForm && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
              <h4 className="font-bold mb-3 text-slate-900 text-sm sm:text-base">Add New Status</h4>
              <div className="space-y-3">
                {/* Label */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Status Label *
                  </label>
                  <input
                    type="text"
                    value={newStatus.label}
                    onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddStatus()}
                    placeholder="e.g., Awaiting Approval"
                    className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    autoFocus
                  />
                </div>

                {/* Emoji Picker */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                    Emoji
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewStatus({ ...newStatus, emoji })}
                        className={`w-10 h-10 text-xl rounded-lg transition ${
                          newStatus.emoji === emoji
                            ? 'bg-blue-200 ring-2 ring-blue-500'
                            : 'bg-white hover:bg-blue-50 border border-slate-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-9 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewStatus({ ...newStatus, color: color.value })}
                        className={`h-10 rounded-lg transition ${
                          newStatus.color === color.value
                            ? 'ring-4 ring-blue-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleAddStatus}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition text-sm sm:text-base"
                  >
                    Add Status
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewStatus({ label: '', color: 'blue', emoji: '📋' });
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-lg font-semibold transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Statuses List */}
          <div className="space-y-3">
            {statuses.map((status, index) => {
              const locked = isLocked(status);
              return (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-lg border group transition ${
                    locked
                      ? 'bg-slate-100 border-slate-300 opacity-80'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {/* Status Display */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{status.emoji || '📋'}</span>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getColorHex(status.color) }}
                    />
                    <input
                      type="text"
                      value={status.label}
                      onChange={(e) => updateStatus(index, 'label', e.target.value)}
                      readOnly={locked}
                      className={`flex-1 min-w-0 px-2 py-1 border-2 border-transparent rounded font-semibold text-sm sm:text-base ${
                        locked
                          ? 'bg-transparent cursor-not-allowed text-slate-500 select-none'
                          : 'bg-transparent hover:border-slate-300 focus:border-blue-500 text-slate-900'
                      }`}
                    />
                    {locked && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-200 rounded-full flex-shrink-0">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:gap-1">
                    {/* Move Up */}
                    <button
                      disabled={index === 0 || locked}
                      onClick={() => moveStatus(index, index - 1)}
                      className="p-2 hover:bg-slate-200 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      disabled={index === statuses.length - 1 || locked}
                      onClick={() => moveStatus(index, index + 1)}
                      className="p-2 hover:bg-slate-200 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveStatus(index)}
                      disabled={locked}
                      className={`p-2 rounded-lg transition ${
                        locked
                          ? 'opacity-0 cursor-not-allowed pointer-events-none'
                          : 'sm:opacity-0 sm:group-hover:opacity-100 text-red-600 hover:text-red-800 hover:bg-red-50'
                      }`}
                      title={locked ? 'Cannot delete locked status' : 'Remove status'}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 space-y-1">
          <p className="text-xs sm:text-sm text-blue-900">
            <strong>💡 Pro Tip:</strong> Status order matters! Organize them in the sequence leads typically move through your workflow.
          </p>
          <p className="text-xs sm:text-sm text-blue-700">
            <strong>🔒 Locked:</strong> <span className="font-semibold">New</span> and <span className="font-semibold">Completed</span> are required system statuses and cannot be edited or removed.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm sm:text-base"
          >
            {loading ? 'Saving...' : 'Save Pipeline Statuses'}
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Delete Status?
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete "<span className="font-semibold">{deleteConfirm.label}</span>"? 
                  Leads with this status will need to be reassigned.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveStatus}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}